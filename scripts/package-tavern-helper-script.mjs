import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const cwd = process.cwd();
const args = process.argv.slice(2);

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(cwd, file), 'utf8'));
}

function getArgValue(name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

function sanitizeFilePart(value) {
  return String(value)
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function requireString(value, name) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${name} must be a non-empty string.`);
  }
  return value.trim();
}

function getVersion() {
  const packageJson = readJson('package.json');
  return requireString(packageJson.version, 'package.json.version');
}

function getExpectedTag(version = getVersion()) {
  return `v${version}`;
}

function getCurrentTag() {
  return (
    getArgValue('--tag') ??
    process.env.RELEASE_TAG ??
    (process.env.GITHUB_REF_TYPE === 'tag' ? process.env.GITHUB_REF_NAME : undefined)
  );
}

function checkTag() {
  const version = getVersion();
  const expectedTag = getExpectedTag(version);
  const actualTag = getCurrentTag();
  if (!actualTag) {
    throw new Error(`Release tag is required and must be ${expectedTag}.`);
  }
  if (actualTag !== expectedTag) {
    throw new Error(`Release tag ${actualTag} does not match package.json version ${version}; expected ${expectedTag}.`);
  }
  console.info(`Release tag ${actualTag} matches package.json version ${version}.`);
}

function stripSourceMapComment(content) {
  return content.replace(/\r?\n?\/\/# sourceMappingURL=.*(?:\r?\n)?$/u, '');
}

function buildScriptJson(config, content, version) {
  const script = config.script ?? {};
  const baseName = requireString(script.baseName ?? script.name, 'script.baseName');
  return {
    type: script.type ?? 'script',
    enabled: script.enabled !== false,
    name: `${baseName}v${version}`,
    id: requireString(script.id, 'script.id'),
    content,
    info: typeof script.info === 'string' ? script.info : '',
    button: script.button ?? { enabled: false, buttons: [] },
    data: script.data ?? {},
  };
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.info(`Wrote ${path.relative(cwd, file)}`);
}

function packageScript() {
  const configPath = getArgValue('--config') ?? 'tavern-helper-script.config.json';
  const config = readJson(configPath);
  if (config.enabled === false) {
    console.info(`${configPath} is disabled; no script JSON package was generated.`);
    return;
  }

  if (process.env.GITHUB_REF_TYPE === 'tag' || process.env.RELEASE_TAG || args.includes('--tag')) {
    checkTag();
  }

  const version = getVersion();
  const distPath = path.resolve(cwd, requireString(config.dist, 'dist'));
  const outputDirectory = path.resolve(cwd, config.outputDirectory ?? 'release');
  const fileBaseName = sanitizeFilePart(config.fileBaseName ?? readJson('package.json').name ?? 'tavern-helper-script');
  const remoteUrl = requireString(config.remoteUrl, 'remoteUrl');

  if (!fs.existsSync(distPath)) {
    throw new Error(`Built script file does not exist: ${path.relative(cwd, distPath)}`);
  }

  const remoteContent = `import '${remoteUrl}'`;
  const inlineContent = stripSourceMapComment(fs.readFileSync(distPath, 'utf8'));
  const remoteJson = buildScriptJson(config, remoteContent, version);
  const inlineJson = buildScriptJson(config, inlineContent, version);
  const versionedBaseName = `${fileBaseName}-v${version}`;

  writeJson(path.join(outputDirectory, `${versionedBaseName}.json`), remoteJson);
  writeJson(path.join(outputDirectory, `${versionedBaseName}.inline.json`), inlineJson);
}

try {
  if (args.includes('--check-tag')) {
    checkTag();
  } else {
    packageScript();
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
