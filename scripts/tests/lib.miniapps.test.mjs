import { test, before, after, mock } from 'node:test';
import assert from 'node:assert';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

let tempDir;
let originalCwd;

before(() => {
  tempDir = mkdtempSync(join(tmpdir(), 'test-miniapps-'));
  originalCwd = process.cwd();
  process.chdir(tempDir);
  mkdirSync(join(tempDir, 'apps'));
});

after(() => {
  process.chdir(originalCwd);
  rmSync(tempDir, { recursive: true, force: true });
});

function importLib() {
  return import('../lib/miniapps.mjs');
}

test('isValidSlug: acepta slugs válidos', async () => {
  const { isValidSlug } = await importLib();
  assert.strictEqual(isValidSlug('a'), true);
  assert.strictEqual(isValidSlug('abc'), true);
  assert.strictEqual(isValidSlug('a-b'), true);
  assert.strictEqual(isValidSlug('a-b-c'), true);
  assert.strictEqual(isValidSlug('a0'), true);
  assert.strictEqual(isValidSlug('a-0-b'), true);
});

test('isValidSlug: rechaza slugs inválidos', async () => {
  const { isValidSlug } = await importLib();
  assert.strictEqual(isValidSlug(''), false);
  assert.strictEqual(isValidSlug('A'), false);
  assert.strictEqual(isValidSlug('a_B'), false);
  assert.strictEqual(isValidSlug('-a'), false);
  assert.strictEqual(isValidSlug('a-'), false);
  assert.strictEqual(isValidSlug('a--b'), false);
  assert.strictEqual(isValidSlug('a-b-c-'), false);
});

test('getRepoName: retorna de GITHUB_REPOSITORY', async () => {
  const { getRepoName } = await importLib();
  const original = process.env.GITHUB_REPOSITORY;
  process.env.GITHUB_REPOSITORY = 'owner/myrepo';
  try {
    assert.strictEqual(getRepoName(), 'myrepo');
  } finally {
    process.env.GITHUB_REPOSITORY = original;
  }
});

test('getRepoName: usa VITE_REPO_NAME fallback', async () => {
  const { getRepoName } = await importLib();
  const origGit = process.env.GITHUB_REPOSITORY;
  const origVite = process.env.VITE_REPO_NAME;
  process.env.GITHUB_REPOSITORY = undefined;
  process.env.VITE_REPO_NAME = 'fallback-repo';
  try {
    assert.strictEqual(getRepoName(), 'fallback-repo');
  } finally {
    process.env.GITHUB_REPOSITORY = origGit;
    process.env.VITE_REPO_NAME = origVite;
  }
});

test('getRepoName: retorna vacío si no hay env', async () => {
  const { getRepoName } = await importLib();
  const origGit = process.env.GITHUB_REPOSITORY;
  const origVite = process.env.VITE_REPO_NAME;
  process.env.GITHUB_REPOSITORY = undefined;
  process.env.VITE_REPO_NAME = '';
  try {
    assert.strictEqual(getRepoName(), '');
  } finally {
    process.env.GITHUB_REPOSITORY = origGit;
    process.env.VITE_REPO_NAME = origVite;
  }
});

test('getRepoName: usa package.json de la raíz como fallback local', async () => {
  const { getRepoName } = await importLib();
  const origGit = process.env.GITHUB_REPOSITORY;
  const origVite = process.env.VITE_REPO_NAME;
  process.env.GITHUB_REPOSITORY = undefined;
  process.env.VITE_REPO_NAME = '';
  writeFileSync(join(tempDir, 'package.json'), JSON.stringify({ name: 'miniapps' }), 'utf8');
  try {
    assert.strictEqual(getRepoName(), 'miniapps');
  } finally {
    process.env.GITHUB_REPOSITORY = origGit;
    process.env.VITE_REPO_NAME = origVite;
    rmSync(join(tempDir, 'package.json'), { force: true });
  }
});

test('getAppBase: concatena repo y appName', async () => {
  const { getAppBase, getRepoName } = await importLib();
  const origGit = process.env.GITHUB_REPOSITORY;
  const origVite = process.env.VITE_REPO_NAME;
  process.env.GITHUB_REPOSITORY = undefined;
  process.env.VITE_REPO_NAME = 'myrepo';
  try {
    assert.strictEqual(getAppBase('myapp'), '/myrepo/myapp/');
  } finally {
    process.env.GITHUB_REPOSITORY = origGit;
    process.env.VITE_REPO_NAME = origVite;
  }
});

test('getAppBase: sin repo retorna solo slash-app', async () => {
  const { getAppBase, getRepoName } = await importLib();
  const origGit = process.env.GITHUB_REPOSITORY;
  const origVite = process.env.VITE_REPO_NAME;
  process.env.GITHUB_REPOSITORY = undefined;
  process.env.VITE_REPO_NAME = '';
  try {
    assert.strictEqual(getAppBase('myapp'), '/myapp/');
  } finally {
    process.env.GITHUB_REPOSITORY = origGit;
    process.env.VITE_REPO_NAME = origVite;
  }
});

test('readJson: parsea JSON válido', async () => {
  const { readJson } = await importLib();
  const filePath = join(tempDir, 'test.json');
  writeFileSync(filePath, JSON.stringify({ foo: 'bar', num: 42 }), 'utf8');
  const result = readJson(filePath);
  assert.deepStrictEqual(result, { foo: 'bar', num: 42 });
});

test('readJson: lanza error en JSON inválido', async () => {
  const { readJson } = await importLib();
  const filePath = join(tempDir, 'invalid.json');
  writeFileSync(filePath, '{ invalid', 'utf8');
  assert.throws(() => readJson(filePath), SyntaxError);
});

test('readJson: lanza error si archivo no existe', async () => {
  const { readJson } = await importLib();
  assert.throws(() => readJson(join(tempDir, 'nonexistent.json')), /ENOENT/);
});

test('listAppNames: retorna directorios en apps/ ordenados', async () => {
  const { listAppNames } = await importLib();
  mkdirSync(join(tempDir, 'apps', 'notes'));
  mkdirSync(join(tempDir, 'apps', 'home'));
  mkdirSync(join(tempDir, 'apps', 'planning-board'));
  const result = listAppNames();
  assert.deepStrictEqual(result, ['home', 'notes', 'planning-board']);
});

test('getAppDir: retorna path correcto', async () => {
  const { getAppDir } = await importLib();
  assert.strictEqual(getAppDir('myapp'), join(tempDir, 'apps', 'myapp'));
});

test('getAppConfigPath: retorna path correcto', async () => {
  const { getAppConfigPath } = await importLib();
  assert.strictEqual(getAppConfigPath('myapp'), join(tempDir, 'apps', 'myapp', 'app.config.json'));
});

test('readAppConfig: lee y parsea config', async () => {
  const { readAppConfig } = await importLib();
  const appDir = join(tempDir, 'apps', 'myapp');
  mkdirSync(appDir, { recursive: true });
  writeFileSync(join(appDir, 'app.config.json'), JSON.stringify({ name: 'myapp', title: 'My App' }), 'utf8');
  const config = readAppConfig('myapp');
  assert.deepStrictEqual(config, { name: 'myapp', title: 'My App' });
});
