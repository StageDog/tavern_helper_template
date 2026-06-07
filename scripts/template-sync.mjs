#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { cp, mkdir, readdir, readFile, readlink, rm, symlink } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_CONFIG_PATH = '.github/template-sync.json';
const TEMP_ROOT = '.template-sync-worktree';
const DEFAULT_PROTECTED_PATHS = [
  'src/**',
  'dist/**',
  '.github/workflows/**',
  'README.md',
  '@types/**',
];

function run(command, args, { cwd, allowFailure = false } = {}) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0 && !allowFailure) {
    const detail = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
    throw new Error(`Command failed: ${command} ${args.join(' ')}${detail ? `\n${detail}` : ''}`);
  }

  return {
    status: result.status ?? 0,
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim(),
  };
}

function git(cwd, args, options = {}) {
  return run('git', args, { cwd, ...options }).stdout;
}

function normalizePath(path) {
  return path.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/g, '');
}

function isProtectedPath(relativePath, protectedPaths) {
  const path = normalizePath(relativePath);
  return protectedPaths.some(pattern => {
    const normalizedPattern = normalizePath(pattern);
    if (normalizedPattern.endsWith('/**')) {
      const prefix = normalizedPattern.slice(0, -3);
      return path === prefix || path.startsWith(`${prefix}/`);
    }
    return path === normalizedPattern;
  });
}

function isAlwaysSkipped(relativePath) {
  const path = normalizePath(relativePath);
  return path === '.git' || path.startsWith('.git/') ||
    path === TEMP_ROOT || path.startsWith(`${TEMP_ROOT}/`) ||
    path === 'node_modules' || path.startsWith('node_modules/');
}

async function copyTemplateTree(sourceRoot, targetRoot, protectedPaths, currentRelativePath = '') {
  const sourcePath = currentRelativePath ? join(sourceRoot, currentRelativePath) : sourceRoot;
  const entries = await readdir(sourcePath, { withFileTypes: true });

  for (const entry of entries) {
    const relativePath = normalizePath(currentRelativePath ? join(currentRelativePath, entry.name) : entry.name);
    if (isAlwaysSkipped(relativePath) || isProtectedPath(relativePath, protectedPaths)) {
      continue;
    }

    const sourceEntryPath = join(sourceRoot, relativePath);
    const targetEntryPath = join(targetRoot, relativePath);

    if (entry.isDirectory()) {
      await mkdir(targetEntryPath, { recursive: true });
      await copyTemplateTree(sourceRoot, targetRoot, protectedPaths, relativePath);
    } else if (entry.isSymbolicLink()) {
      await mkdir(dirname(targetEntryPath), { recursive: true });
      await rm(targetEntryPath, { recursive: true, force: true });
      const linkTarget = await readlink(sourceEntryPath);
      await symlink(linkTarget, targetEntryPath);
    } else if (entry.isFile()) {
      await mkdir(dirname(targetEntryPath), { recursive: true });
      await cp(sourceEntryPath, targetEntryPath, { force: true, preserveTimestamps: false });
    }
  }
}

function parseArgs(argv) {
  const options = {
    mode: 'local',
    configPath: DEFAULT_CONFIG_PATH,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--ci') {
      options.mode = 'ci';
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--mode') {
      options.mode = argv[index + 1];
      index += 1;
    } else if (arg.startsWith('--mode=')) {
      options.mode = arg.slice('--mode='.length);
    } else if (arg === '--config') {
      options.configPath = argv[index + 1];
      index += 1;
    } else if (arg.startsWith('--config=')) {
      options.configPath = arg.slice('--config='.length);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!['local', 'ci'].includes(options.mode)) {
    throw new Error(`Unsupported mode: ${options.mode}`);
  }

  return options;
}

function printHelp() {
  console.log(`Usage: node scripts/template-sync.mjs [--mode=local|ci] [--config=.github/template-sync.json]

Modes:
  local  Create a template-sync/* branch in a temporary worktree. Default.
  ci     Apply template updates to the current checkout for a PR workflow.
`);
}

function resolveRepoRoot() {
  return git(process.cwd(), ['rev-parse', '--show-toplevel']);
}

async function loadConfig(repoRoot, configPath) {
  const absoluteConfigPath = resolve(repoRoot, configPath);
  const raw = await readFile(absoluteConfigPath, 'utf8');
  const config = JSON.parse(raw);

  if (!config.upstream) {
    throw new Error(`Missing "upstream" in ${configPath}`);
  }

  return {
    upstream: config.upstream,
    upstreamBranch: config.upstreamBranch ?? config.branch ?? 'main',
    protectedPaths: config.protectedPaths ?? DEFAULT_PROTECTED_PATHS,
  };
}

function timestamp() {
  const now = new Date();
  const pad = value => String(value).padStart(2, '0');
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    '-',
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join('');
}

async function cloneUpstream(repoRoot, config, targetDirectory) {
  await rm(targetDirectory, { recursive: true, force: true });
  await mkdir(dirname(targetDirectory), { recursive: true });
  git(repoRoot, [
    'clone',
    '--depth',
    '1',
    '--branch',
    config.upstreamBranch,
    config.upstream,
    targetDirectory,
  ]);
  return git(targetDirectory, ['rev-parse', '--short', 'HEAD']);
}

function hasChanges(cwd) {
  return git(cwd, ['status', '--porcelain']).length > 0;
}

async function runLocalMode(repoRoot, config) {
  const id = timestamp();
  const branchName = `template-sync/${id}`;
  const tempRoot = join(repoRoot, TEMP_ROOT);
  const worktreePath = join(tempRoot, `${id}-repo`);
  const upstreamPath = join(tempRoot, `${id}-upstream`);

  await mkdir(tempRoot, { recursive: true });
  git(repoRoot, ['worktree', 'add', '-b', branchName, worktreePath, 'HEAD']);

  try {
    const upstreamCommit = await cloneUpstream(repoRoot, config, upstreamPath);
    await copyTemplateTree(upstreamPath, worktreePath, config.protectedPaths);

    if (!hasChanges(worktreePath)) {
      await rm(upstreamPath, { recursive: true, force: true });
      git(repoRoot, ['worktree', 'remove', '--force', worktreePath]);
      git(repoRoot, ['branch', '-D', branchName]);
      console.log('Template is already up to date.');
      return;
    }

    git(worktreePath, ['add', '-A']);
    git(worktreePath, [
      '-c',
      'user.name=template-sync',
      '-c',
      'user.email=actions@users.noreply.github.com',
      'commit',
      '-m',
      `[bot] sync template update from ${upstreamCommit}`,
    ]);
    await rm(upstreamPath, { recursive: true, force: true });
    git(repoRoot, ['worktree', 'remove', '--force', worktreePath]);

    console.log(`Created ${branchName} from template update ${upstreamCommit}.`);
    console.log(`Review with: git diff HEAD..${branchName}`);
    console.log(`Merge with: git merge ${branchName}`);
  } catch (error) {
    console.error(`Template sync stopped. Worktree kept at: ${worktreePath}`);
    throw error;
  }
}

async function runCiMode(repoRoot, config) {
  const id = timestamp();
  const upstreamPath = join(repoRoot, TEMP_ROOT, `${id}-upstream`);
  await mkdir(dirname(upstreamPath), { recursive: true });

  try {
    const upstreamCommit = await cloneUpstream(repoRoot, config, upstreamPath);
    await copyTemplateTree(upstreamPath, repoRoot, config.protectedPaths);
    await rm(upstreamPath, { recursive: true, force: true });

    if (!hasChanges(repoRoot)) {
      console.log('Template is already up to date.');
      return;
    }

    console.log(`Template updates applied to current checkout from ${upstreamCommit}.`);
  } catch (error) {
    await rm(upstreamPath, { recursive: true, force: true });
    throw error;
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const repoRoot = resolveRepoRoot();
  const config = await loadConfig(repoRoot, options.configPath);

  if (options.mode === 'ci') {
    await runCiMode(repoRoot, config);
  } else {
    await runLocalMode(repoRoot, config);
  }
}

const isCli = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isCli) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
