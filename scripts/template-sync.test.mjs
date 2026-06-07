import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

const scriptPath = resolve('scripts/template-sync.mjs');

function git(cwd, args, options = {}) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: options.stdio ?? ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function node(cwd, args) {
  return execFileSync(process.execPath, args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function readNormalized(path) {
  return readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
}

async function write(path, content) {
  await mkdir(resolve(path, '..'), { recursive: true });
  await writeFile(path, content);
}

function initRepo(path) {
  git(path, ['init', '-b', 'main']);
  git(path, ['config', 'user.name', 'Template Sync Test']);
  git(path, ['config', 'user.email', 'template-sync-test@example.invalid']);
}

async function createFixture() {
  const root = mkdtempSync(join(tmpdir(), 'template-sync-test-'));
  const upstream = join(root, 'upstream');
  const repo = join(root, 'repo');
  await mkdir(upstream, { recursive: true });
  await mkdir(repo, { recursive: true });

  initRepo(upstream);
  await write(join(upstream, 'README.md'), 'upstream readme\n');
  await write(join(upstream, 'src', 'index.ts'), 'upstream source\n');
  await write(join(upstream, 'dist', 'bundle.js'), 'upstream dist\n');
  await write(join(upstream, '.github', 'workflows', 'sync_template.yaml'), 'upstream workflow\n');
  await write(join(upstream, '@types', 'index.d.ts'), 'upstream types\n');
  await write(join(upstream, 'webpack.config.ts'), 'initial config\n');
  await write(join(upstream, 'slash_command.txt'), 'initial command\n');
  git(upstream, ['add', '.']);
  git(upstream, ['commit', '-m', 'initial template']);

  await write(join(upstream, 'README.md'), 'changed upstream readme\n');
  await write(join(upstream, 'src', 'index.ts'), 'changed upstream source\n');
  await write(join(upstream, 'dist', 'bundle.js'), 'changed upstream dist\n');
  await write(join(upstream, '.github', 'workflows', 'sync_template.yaml'), 'changed upstream workflow\n');
  await write(join(upstream, '@types', 'index.d.ts'), 'changed upstream types\n');
  await write(join(upstream, 'webpack.config.ts'), 'updated config\n');
  await write(join(upstream, 'slash_command.txt'), 'updated command\n');
  git(upstream, ['add', '.']);
  git(upstream, ['commit', '-m', 'update template']);

  initRepo(repo);
  await write(join(repo, '.github', 'template-sync.json'), JSON.stringify({
    upstream,
    upstreamBranch: 'main',
    protectedPaths: [
      'src/**',
      'dist/**',
      '.github/workflows/**',
      'README.md',
      '@types/**',
    ],
  }, null, 2));
  await write(join(repo, 'README.md'), 'local readme\n');
  await write(join(repo, 'src', 'index.ts'), 'local source\n');
  await write(join(repo, 'dist', 'bundle.js'), 'local dist\n');
  await write(join(repo, '.github', 'workflows', 'sync_template.yaml'), 'local workflow\n');
  await write(join(repo, '@types', 'index.d.ts'), 'local types\n');
  await write(join(repo, 'webpack.config.ts'), 'initial config\n');
  await write(join(repo, 'slash_command.txt'), 'initial command\n');
  await write(join(repo, 'local-only.txt'), 'keep me\n');
  git(repo, ['add', '.']);
  git(repo, ['commit', '-m', 'generated repo']);

  return { root, repo };
}

test('local mode creates a sync branch without touching dirty worktree or protected paths', async () => {
  const { root, repo } = await createFixture();
  try {
    writeFileSync(join(repo, 'src', 'dirty.ts'), 'work in progress\n');

    const output = node(repo, [scriptPath]);
    assert.match(output, /template-sync\//);

    const branch = git(repo, ['branch', '--list', 'template-sync/*']).replace(/^[* ]+/, '');
    assert.match(branch, /^template-sync\//);
    assert.equal(git(repo, ['branch', '--show-current']), 'main');
    assert.equal(readNormalized(join(repo, 'src', 'dirty.ts')), 'work in progress\n');

    assert.equal(git(repo, ['show', `${branch}:webpack.config.ts`]), 'updated config');
    assert.equal(git(repo, ['show', `${branch}:slash_command.txt`]), 'updated command');
    assert.equal(git(repo, ['show', `${branch}:local-only.txt`]), 'keep me');
    assert.equal(git(repo, ['show', `${branch}:README.md`]), 'local readme');
    assert.equal(git(repo, ['show', `${branch}:src/index.ts`]), 'local source');
    assert.equal(git(repo, ['show', `${branch}:dist/bundle.js`]), 'local dist');
    assert.equal(git(repo, ['show', `${branch}:.github/workflows/sync_template.yaml`]), 'local workflow');
    assert.equal(git(repo, ['show', `${branch}:@types/index.d.ts`]), 'local types');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('ci mode applies template updates to the current clean checkout', async () => {
  const { root, repo } = await createFixture();
  try {
    const output = node(repo, [scriptPath, '--mode=ci']);
    assert.match(output, /Template updates applied/);

    assert.equal(readNormalized(join(repo, 'webpack.config.ts')), 'updated config\n');
    assert.equal(readNormalized(join(repo, 'slash_command.txt')), 'updated command\n');
    assert.equal(readNormalized(join(repo, 'README.md')), 'local readme\n');
    assert.equal(readNormalized(join(repo, 'src', 'index.ts')), 'local source\n');
    assert.equal(readNormalized(join(repo, 'dist', 'bundle.js')), 'local dist\n');
    assert.equal(readNormalized(join(repo, '.github', 'workflows', 'sync_template.yaml')), 'local workflow\n');
    assert.equal(readNormalized(join(repo, '@types', 'index.d.ts')), 'local types\n');
    assert.match(git(repo, ['status', '--short']), /webpack\.config\.ts/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
