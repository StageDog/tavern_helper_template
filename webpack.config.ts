import { FSWatcher, watch } from 'chokidar';
import HtmlInlineScriptWebpackPlugin from 'html-inline-script-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import _ from 'lodash';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { ChildProcess, exec, spawn } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import RemarkHTML from 'remark-html';
import { Server } from 'socket.io';
import TerserPlugin from 'terser-webpack-plugin';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import unpluginAutoImport from 'unplugin-auto-import/webpack';
import { VueUseComponentsResolver, VueUseDirectiveResolver } from 'unplugin-vue-components/resolvers';
import unpluginVueComponents from 'unplugin-vue-components/webpack';
import { VueLoaderPlugin } from 'vue-loader';
import webpack from 'webpack';
import WebpackObfuscator from 'webpack-obfuscator';
const require = createRequire(import.meta.url);
const HTMLInlineCSSWebpackPlugin = require('html-inline-css-webpack-plugin').default;

interface Config {
  port: number;
  entries: Entry[];
}
interface Entry {
  script: string;
  html?: string;
}

function parse_entry(script_file: string) {
  const html = path.join(path.dirname(script_file), 'index.html');
  if (fs.existsSync(html)) {
    return { script: script_file, html };
  }
  return { script: script_file };
}

function common_path(lhs: string, rhs: string) {
  const lhs_parts = lhs.split(path.sep);
  const rhs_parts = rhs.split(path.sep);
  for (let i = 0; i < Math.min(lhs_parts.length, rhs_parts.length); i++) {
    if (lhs_parts[i] !== rhs_parts[i]) {
      return lhs_parts.slice(0, i).join(path.sep);
    }
  }
  return lhs_parts.join(path.sep);
}

function glob_script_files() {
  const files: string[] = fs
    .globSync(`src/**/index.{ts,tsx,js,jsx}`)
    .filter(
      file => process.env.CI !== 'true' || !fs.readFileSync(path.join(import.meta.dirname, file)).includes('@no-ci'),
    );

  const results: string[] = [];
  const handle = (file: string) => {
    const file_dirname = path.dirname(file);
    for (const [index, result] of results.entries()) {
      const result_dirname = path.dirname(result);
      const common = common_path(result_dirname, file_dirname);
      if (common === result_dirname) {
        return;
      }
      if (common === file_dirname) {
        results.splice(index, 1, file);
        return;
      }
    }
    results.push(file);
  };
  files.forEach(handle);
  return results;
}

const config: Config = {
  port: 6621,
  entries: glob_script_files().map(parse_entry),
};

let io: Server;
function watch_tavern_helper(compiler: webpack.Compiler) {
  if (compiler.options.watch) {
    if (!io) {
      const port = config.port ?? 6621;
      io = new Server(port, { cors: { origin: '*' } });
      console.info(`\x1b[36m[tavern_helper]\x1b[0m 已启动酒馆监听服务`);
      io.on('connect', socket => {
        console.info(`\x1b[36m[tavern_helper]\x1b[0m 成功连接到酒馆网页 '${socket.id}', 初始化推送...`);
        io.emit('iframe_updated');
        socket.on('disconnect', reason => {
          console.info(`\x1b[36m[tavern_helper]\x1b[0m 与酒馆网页 '${socket.id}' 断开连接: ${reason}`);
        });
      });
    }

    compiler.hooks.done.tap('watch_tavern_helper', () => {
      console.info('\n\x1b[36m[tavern_helper]\x1b[0m 检测到完成编译, 推送更新事件...');
      io.emit('iframe_updated');
      if (compiler.options.plugins.find(plugin => plugin instanceof HtmlWebpackPlugin)) {
        io.emit('message_iframe_updated');
      } else {
        io.emit('script_iframe_updated');
      }
    });
  }
}

let watcher: FSWatcher;
const execute = () => {
  exec('pnpm dump', { cwd: import.meta.dirname });
  console.info('\x1b[36m[schema_dump]\x1b[0m 已将所有 schema.ts 转换为 schema.json');
};
const execute_debounced = _.debounce(execute, 500, { leading: true, trailing: false });
function dump_schema(compiler: webpack.Compiler) {
  if (!compiler.options.watch) {
    execute_debounced();
  } else if (!watcher) {
    watcher = watch('src', {
      awaitWriteFinish: true,
    }).on('all', (_event, path) => {
      if (path.endsWith('schema.ts')) {
        execute_debounced();
      }
    });
  }
}

let child_process: ChildProcess;
function watch_tavern_sync(compiler: webpack.Compiler) {
  if (!compiler.options.watch) {
    return;
  }
  compiler.hooks.watchRun.tap('watch_tavern_sync', () => {
    if (!child_process) {
      child_process = spawn('pnpm', ['sync', 'watch', 'all', '-f'], {
        stdio: ['ignore', 'pipe', 'pipe'],
        cwd: import.meta.dirname,
        env: { ...process.env, FORCE_COLOR: '1' },
      });
      child_process.stdout?.on('data', (data: Buffer) => {
        console.info(
          data
            .toString()
            .trimEnd()
            .split('\n')
            .map(string => (/^\s*$/s.test(string) ? string : `\x1b[36m[tavern_sync]\x1b[0m ${string}`))
            .join('\n'),
        );
      });
      child_process.stderr?.on('data', (data: Buffer) => {
        console.error(
          data
            .toString()
            .trimEnd()
            .split('\n')
            .map(string => (/^\s*$/s.test(string) ? string : `\x1b[36m[tavern_sync]\x1b[0m ${string}`))
            .join('\n'),
        );
      });
      child_process.on('error', error => {
        console.error(`\x1b[31m[tavern_sync]\x1b[0m Error: ${error.message}`);
      });
    }
  });
  compiler.hooks.watchClose.tap('watch_tavern_sync', () => {
    child_process?.kill();
  });
  ['SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, () => {
      child_process?.kill();
    });
  });
}

function parse_configuration(entry: Entry): (_env: any, argv: any) => webpack.Configuration {
  const should_obfuscate = fs
    .readFileSync(path.join(import.meta.dirname, entry.script), 'utf-8')
    .includes('@obfuscate');
  const script_filepath = path.parse(entry.script);
  const is_ui_entry = entry.html !== undefined;

  return (_env, argv) => ({
    experiments: {
      outputModule: !is_ui_entry,
    },
    // UI outputs are frequently copy-pasted/embedded into SillyTavern regex scripts.
    // `eval-source-map` wraps modules in `eval("...")`, which can break when the output
    // is re-serialized/embedded as a JS string (e.g. invalid escape/control chars).
    devtool: argv.mode === 'production' ? 'source-map' : is_ui_entry ? 'source-map' : 'eval-source-map',
    watchOptions: {
      ignored: ['**/dist', '**/node_modules'],
    },
    entry: path.join(import.meta.dirname, entry.script),
    target: 'browserslist',
    output: {
      devtoolNamespace: 'tavern_helper_template',
      devtoolModuleFilenameTemplate: info => {
        const resource_path = decodeURIComponent(info.resourcePath.replace(/^\.\//, ''));
        const is_direct = info.allLoaders === '';
        const is_vue_script =
          resource_path.match(/\.vue$/) &&
          info.query.match(/\btype=script\b/) &&
          !info.allLoaders.match(/\bts-loader\b/);

        return `${is_direct === true ? 'src' : 'webpack'}://${info.namespace}/${resource_path}${is_direct || is_vue_script ? '' : '?' + info.hash}`;
      },
      filename: `${script_filepath.name}.js`,
      path: path.join(
        import.meta.dirname,
        'dist',
        path.relative(path.join(import.meta.dirname, 'src'), script_filepath.dir),
      ),
      chunkFilename: `${script_filepath.name}.[contenthash].chunk.js`,
      asyncChunks: true,
      clean: true,
      publicPath: '',
      module: !is_ui_entry,
      ...(is_ui_entry ? {} : { library: { type: 'module' } }),
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          use: 'vue-loader',
          exclude: /node_modules/,
        },
        {
          oneOf: [
            {
              test: /\.tsx?$/,
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
                onlyCompileBundledFiles: true,
                compilerOptions: {
                  noUnusedLocals: false,
                  noUnusedParameters: false,
                },
              },
              resourceQuery: /raw/,
              type: 'asset/source',
              exclude: /node_modules/,
            },
            {
              test: /\.(sa|sc)ss$/,
              use: ['postcss-loader', 'sass-loader'],
              resourceQuery: /raw/,
              type: 'asset/source',
              exclude: /node_modules/,
            },
            {
              test: /\.css$/,
              use: ['postcss-loader'],
              resourceQuery: /raw/,
              type: 'asset/source',
              exclude: /node_modules/,
            },
            {
              resourceQuery: /raw/,
              type: 'asset/source',
              exclude: /node_modules/,
            },
            {
              test: /\.tsx?$/,
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
                onlyCompileBundledFiles: true,
                compilerOptions: {
                  noUnusedLocals: false,
                  noUnusedParameters: false,
                },
              },
              resourceQuery: /url/,
              type: 'asset/inline',
              exclude: /node_modules/,
            },
            {
              test: /\.(sa|sc)ss$/,
              use: ['postcss-loader', 'sass-loader'],
              resourceQuery: /url/,
              type: 'asset/inline',
              exclude: /node_modules/,
            },
            {
              test: /\.css$/,
              use: ['postcss-loader'],
              resourceQuery: /url/,
              type: 'asset/inline',
              exclude: /node_modules/,
            },
            {
              resourceQuery: /url/,
              type: 'asset/inline',
              exclude: /node_modules/,
            },
            {
              test: /\.tsx?$/,
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
                onlyCompileBundledFiles: true,
                compilerOptions: {
                  noUnusedLocals: false,
                  noUnusedParameters: false,
                },
              },
              exclude: /node_modules/,
            },
            {
              test: /\.html$/,
              use: 'html-loader',
              exclude: /node_modules/,
            },
            {
              test: /\.md$/,
              use: [
                {
                  loader: 'html-loader',
                },
                {
                  loader: 'remark-loader',
                  options: {
                    remarkOptions: {
                      plugins: [RemarkHTML],
                    },
                  },
                },
              ],
            },
          ].concat(
            entry.html === undefined
              ? ([
                  {
                    test: /\.vue\.s(a|c)ss$/,
                    use: [
                      { loader: 'vue-style-loader', options: { ssrId: true } },
                      { loader: 'css-loader', options: { url: false } },
                      'postcss-loader',
                      'sass-loader',
                    ],
                    exclude: /node_modules/,
                  },
                  {
                    test: /\.vue\.css$/,
                    use: [
                      { loader: 'vue-style-loader', options: { ssrId: true } },
                      { loader: 'css-loader', options: { url: false } },
                      'postcss-loader',
                    ],
                    exclude: /node_modules/,
                  },
                  {
                    test: /\.s(a|c)ss$/,
                    use: [
                      'style-loader',
                      { loader: 'css-loader', options: { url: false } },
                      'postcss-loader',
                      'sass-loader',
                    ],
                    exclude: /node_modules/,
                  },
                  {
                    test: /\.css$/,
                    use: ['style-loader', { loader: 'css-loader', options: { url: false } }, 'postcss-loader'],
                    exclude: /node_modules/,
                  },
                ] as any[])
              : ([
                  {
                    test: /\.s(a|c)ss$/,
                    use: [
                      MiniCssExtractPlugin.loader,
                      { loader: 'css-loader', options: { url: false } },
                      'postcss-loader',
                      'sass-loader',
                    ],
                    exclude: /node_modules/,
                  },
                  {
                    test: /\.css$/,
                    use: [
                      MiniCssExtractPlugin.loader,
                      { loader: 'css-loader', options: { url: false } },
                      'postcss-loader',
                    ],
                    exclude: /node_modules/,
                  },
                ] as any[]),
          ),
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js', '.tsx', '.jsx', '.css'],
      plugins: [
        new TsconfigPathsPlugin({
          extensions: ['.ts', '.js', '.tsx', '.jsx'],
          configFile: path.join(import.meta.dirname, 'tsconfig.json'),
        }),
      ],
      alias: {},
    },
    plugins: (entry.html === undefined
      ? [new MiniCssExtractPlugin()]
      : [
          new HtmlWebpackPlugin({
            template: path.join(import.meta.dirname, entry.html),
            filename: path.parse(entry.html).base,
            // Keep UI outputs compatible with jQuery `.load()` by inlining scripts
            // and avoiding ESM module scripts.
            scriptLoading: 'blocking',
            cache: false,
          }),
          new HtmlInlineScriptWebpackPlugin(),
          new MiniCssExtractPlugin(),
          new HTMLInlineCSSWebpackPlugin({
            styleTagFactory({ style }: { style: string }) {
              return `<style>${style}</style>`;
            },
          }),
        ]
    )
      .concat(
        { apply: watch_tavern_helper },
        { apply: dump_schema },
        { apply: watch_tavern_sync },
        new VueLoaderPlugin(),
        unpluginAutoImport({
          dts: true,
          dtsMode: 'overwrite',
          imports: [
            'vue',
            'pinia',
            '@vueuse/core',
            { from: 'dedent', imports: [['default', 'dedent']] },
            { from: 'klona', imports: ['klona'] },
            { from: 'vue-final-modal', imports: ['useModal'] },
            { from: 'zod', imports: ['z'] },
          ],
        }),
        unpluginVueComponents({
          dts: true,
          syncMode: 'overwrite',
          // globs: ['src/panel/component/*.vue'],
          resolvers: [VueUseComponentsResolver(), VueUseDirectiveResolver()],
        }),
        new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
        new webpack.DefinePlugin({
          __VUE_OPTIONS_API__: false,
          __VUE_PROD_DEVTOOLS__: process.env.CI !== 'true',
          __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
        }),
      )
      .concat(
        should_obfuscate
          ? [
              new WebpackObfuscator({
                controlFlowFlattening: true,
                numbersToExpressions: true,
                selfDefending: true,
                simplify: true,
                splitStrings: true,
                seed: 1,
              }),
            ]
          : [],
      ),
    optimization: {
      minimize: true,
      minimizer: [
        argv.mode === 'production'
          ? new TerserPlugin({
              terserOptions: { format: { quote_style: 1 }, mangle: { reserved: ['_', 'toastr', 'YAML', '$', 'z'] } },
            })
          : new TerserPlugin({
              extractComments: false,
              terserOptions: {
                format: { beautify: true, indent_level: 2 },
                compress: false,
                mangle: false,
              },
            }),
      ],
      splitChunks: {
        chunks: 'async',
        minSize: 20000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
          vendor: {
            name: 'vendor',
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
          },
          default: {
            name: 'default',
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      },
    },
    externals: ({ context, request }, callback) => {
      if (!context || !request) {
        return callback();
      }

      if (
        request.startsWith('-') ||
        request.startsWith('.') ||
        request.startsWith('/') ||
        request.startsWith('!') ||
        request.startsWith('http') ||
        request.startsWith('@/') ||
        path.isAbsolute(request) ||
        fs.existsSync(path.join(context, request)) ||
        fs.existsSync(request)
      ) {
        return callback();
      }

      if (
        ['vue', 'vue-router', 'pixi.js'].every(key => request !== key) &&
        ['pixi', 'react', 'vue'].some(key => request.includes(key))
      ) {
        return callback();
      }
      const global = {
        jquery: '$',
        lodash: '_',
        showdown: 'showdown',
        toastr: 'toastr',
        vue: 'Vue',
        'vue-router': 'VueRouter',
        yaml: 'YAML',
        zod: 'z',
        'pixi.js': 'PIXI',
      };
      if (request in global) {
        return callback(null, 'var ' + global[request as keyof typeof global]); 
      }
      if (is_ui_entry) {
        // UI entries are inlined into a single HTML file; avoid ESM externals
        // (module-import) and bundle the dependency instead.
        return callback();
      }
      const cdn = {
        sass: 'https://jspm.dev/sass',
      };
      return callback(
        null,
        'module-import ' + (cdn[request as keyof typeof cdn] ?? `https://testingcf.jsdelivr.net/npm/${request}/+esm`),
      );
    },
  });
}

export default config.entries.map(parse_configuration);
