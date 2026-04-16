import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import { execSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync, readFileSync, existsSync, copyFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

let tempDir;
let originalCwd;

before(function() {
  originalCwd = process.cwd();
  tempDir = mkdtempSync(join(tmpdir(), 'test-registry-'));
  mkdirSync(join(tempDir, 'apps'));
  mkdirSync(join(tempDir, 'scripts', 'lib'), { recursive: true });
  copyFileSync(join(originalCwd, 'scripts', 'lib', 'miniapps.mjs'), join(tempDir, 'scripts', 'lib', 'miniapps.mjs'));
  copyFileSync(join(originalCwd, 'scripts', 'generate-home-registry.mjs'), join(tempDir, 'scripts', 'generate-home-registry.mjs'));
  process.chdir(tempDir);
});

after(() => {
  process.chdir(originalCwd);
  rmSync(tempDir, { recursive: true, force: true });
});

beforeEach(() => {
  const appsDir = join(tempDir, 'apps');
  if (existsSync(appsDir)) {
    for (const name of readdirSync(appsDir)) {
      rmSync(join(appsDir, name), { recursive: true, force: true });
    }
  }
  delete process.env.VITE_REPO_NAME;
});

function runGenerate() {
  try {
    execSync('node scripts/generate-home-registry.mjs', { cwd: tempDir, stdio: 'pipe' });
    return { exitCode: 0 };
  } catch (err) {
    return { exitCode: err.status || 1, error: err.message };
  }
}

function createApp(name, overrides = {}) {
  const appDir = join(tempDir, 'apps', name);
  mkdirSync(join(appDir, 'src', 'generated'), { recursive: true });
  const config = {
    name,
    title: name,
    description: `${name} description`,
    listed: true,
    category: 'general',
    tags: [],
    ...overrides
  };
  writeFileSync(join(appDir, 'app.config.json'), JSON.stringify(config), 'utf8');
}

function readRegistry() {
  const registryPath = join(tempDir, 'apps', 'home', 'src', 'generated', 'apps-registry.ts');
  if (!existsSync(registryPath)) return null;
  const content = readFileSync(registryPath, 'utf8');
  const match = content.match(/appsRegistry = ([\s\S]+?) as const;/);
  if (!match) return null;
  return JSON.parse(match[1]);
}

test('excluye home del registry', () => {
  createApp('home', { listed: true });
  createApp('notes');
  mkdirSync(join(tempDir, 'apps', 'home', 'src', 'generated'), { recursive: true });
  runGenerate();
  const registry = readRegistry();
  assert.ok(registry);
  assert.ok(!registry.find(app => app.name === 'home'));
});

test('filtra apps donde listed=false', () => {
  createApp('notes', { listed: false });
  createApp('timer');
  mkdirSync(join(tempDir, 'apps', 'home', 'src', 'generated'), { recursive: true });
  runGenerate();
  const registry = readRegistry();
  assert.ok(registry);
  assert.strictEqual(registry.length, 1);
  assert.strictEqual(registry[0].name, 'timer');
});

test('ordena por title (localeCompare)', () => {
  createApp('app-z', { title: 'Zebra App' });
  createApp('app-a', { title: 'Alpha App' });
  createApp('app-b', { title: 'Beta App' });
  mkdirSync(join(tempDir, 'apps', 'home', 'src', 'generated'), { recursive: true });
  runGenerate();
  const registry = readRegistry();
  assert.ok(registry);
  assert.strictEqual(registry[0].title, 'Alpha App');
  assert.strictEqual(registry[1].title, 'Beta App');
  assert.strictEqual(registry[2].title, 'Zebra App');
});

test('genera href correcto con repo', () => {
  process.env.VITE_REPO_NAME = 'myrepo';
  createApp('notes');
  mkdirSync(join(tempDir, 'apps', 'home', 'src', 'generated'), { recursive: true });
  runGenerate();
  const registry = readRegistry();
  assert.ok(registry);
  assert.strictEqual(registry[0].href, '/myrepo/notes/');
});

test('genera href correcto sin repo', () => {
  process.env.VITE_REPO_NAME = '';
  createApp('notes');
  mkdirSync(join(tempDir, 'apps', 'home', 'src', 'generated'), { recursive: true });
  runGenerate();
  const registry = readRegistry();
  assert.ok(registry);
  assert.strictEqual(registry[0].href, '/notes/');
});

test('estructura del objeto registry', () => {
  createApp('myapp', { 
    title: 'My App',
    description: 'A test app',
    category: 'utilities',
    tags: ['tag1', 'tag2']
  });
  mkdirSync(join(tempDir, 'apps', 'home', 'src', 'generated'), { recursive: true });
  runGenerate();
  const registry = readRegistry();
  assert.ok(registry);
  const app = registry[0];
  assert.strictEqual(app.name, 'myapp');
  assert.strictEqual(app.title, 'My App');
  assert.strictEqual(app.description, 'A test app');
  assert.ok(app.href);
  assert.strictEqual(app.category, 'utilities');
  assert.deepStrictEqual(app.tags, ['tag1', 'tag2']);
});

test('genera entry válida aunque falte metadata opcional', () => {
  createApp('minimal', {
    title: 'Minimal App',
    description: 'Only required metadata'
  });
  const configPath = join(tempDir, 'apps', 'minimal', 'app.config.json');
  writeFileSync(configPath, JSON.stringify({
    name: 'minimal',
    title: 'Minimal App',
    description: 'Only required metadata',
    listed: true
  }), 'utf8');

  mkdirSync(join(tempDir, 'apps', 'home', 'src', 'generated'), { recursive: true });
  runGenerate();

  const registry = readRegistry();
  assert.ok(registry);
  assert.deepStrictEqual(registry[0], {
    name: 'minimal',
    title: 'Minimal App',
    description: 'Only required metadata',
    href: '/minimal/'
  });
});
