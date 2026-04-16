import assert from 'node:assert';
import { execSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, beforeEach, test } from 'node:test';

let tempDir;
let originalCwd;

before(function() {
  originalCwd = process.cwd();
  tempDir = mkdtempSync(join(tmpdir(), 'test-validate-'));
  mkdirSync(join(tempDir, 'apps'));
  mkdirSync(join(tempDir, 'scripts', 'lib'), { recursive: true });
  mkdirSync(join(tempDir, 'styles'), { recursive: true });
  copyFileSync(join(originalCwd, 'scripts', 'lib', 'miniapps.mjs'), join(tempDir, 'scripts', 'lib', 'miniapps.mjs'));
  copyFileSync(join(originalCwd, 'scripts', 'validate-miniapps.mjs'), join(tempDir, 'scripts', 'validate-miniapps.mjs'));
  copyFileSync(join(originalCwd, 'styles', 'base.css'), join(tempDir, 'styles', 'base.css'));
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
});

function runValidate() {
  try {
    const result = execSync('node scripts/validate-miniapps.mjs', { cwd: tempDir, stdio: 'pipe' });
    return { exitCode: 0, output: result.toString('utf8') };
  } catch (err) {
    return { exitCode: err.status || 1, output: (err.message || err.stdout?.toString() || '') };
  }
}

function createMinimalApp(name, overrides = {}) {
  const appDir = join(tempDir, 'apps', name);
  mkdirSync(join(appDir, 'src', 'app'), { recursive: true });
  mkdirSync(join(appDir, 'src', 'components'), { recursive: true });
  mkdirSync(join(appDir, 'src', 'styles'), { recursive: true });
  mkdirSync(join(appDir, 'public'), { recursive: true });

  const config = {
    name,
    title: name,
    description: `${name} description`,
    listed: true,
    pwa: true,
    router: false,
    themeColor: '#2563eb',
    backgroundColor: '#ffffff',
    icon: 'default',
    tags: [],
    category: 'utilities',
    ...overrides
  };
  writeFileSync(join(appDir, 'app.config.json'), JSON.stringify(config), 'utf8');
  writeFileSync(join(appDir, 'package.json'), JSON.stringify({
    name: `@miniapps/${name}`,
    private: true,
    version: '0.1.0',
    type: 'module'
  }), 'utf8');
  writeFileSync(join(appDir, 'index.html'), '<!doctype html><html><head></head><body><div id="app"></div></body></html>', 'utf8');
  writeFileSync(join(appDir, 'vite.config.ts'), 'export default {}', 'utf8');
  writeFileSync(join(appDir, 'src', 'main.tsx'), 'import {}', 'utf8');
  writeFileSync(join(appDir, 'src', 'app', 'App.tsx'), 'export const App = () => null;', 'utf8');
  writeFileSync(
    join(appDir, 'src', 'styles', 'index.css'),
    '@import "../../../../styles/base.css";\n\n:root {\n  --app-accent: #2563eb;\n  --color-bg-page: var(--color-background-default);\n  --color-bg-surface: var(--color-background-default);\n  --color-text-primary: var(--color-brand-blue-900);\n  --color-text-secondary: var(--color-neutral-700);\n  --color-border-subtle: var(--color-neutral-100);\n  --color-accent-primary: var(--app-accent);\n}\n',
    'utf8'
  );
  writeFileSync(join(appDir, 'public', 'pwa-192.png'), 'fake', 'utf8');
  writeFileSync(join(appDir, 'public', 'pwa-512.png'), 'fake', 'utf8');
}

test('detecta slug inválido', () => {
  createMinimalApp('testapp', { name: 'foo_Bar' });
  const result = runValidate();
  assert.notStrictEqual(result.exitCode, 0);
  assert.ok(result.output.includes('Slug inválido'));
});

test('detecta directorio no coincide con nombre', () => {
  createMinimalApp('testapp', { name: 'different-name' });
  const result = runValidate();
  assert.notStrictEqual(result.exitCode, 0);
  assert.ok(result.output.includes('no coincide'));
});

test('detecta reserved name', () => {
  createMinimalApp('config');
  const result = runValidate();
  assert.notStrictEqual(result.exitCode, 0);
  assert.ok(result.output.includes('reservado'));
});

test('detecta slug duplicado', () => {
  createMinimalApp('myapp');
  createMinimalApp('other', { name: 'myapp' });
  const result = runValidate();
  assert.notStrictEqual(result.exitCode, 0);
  assert.ok(result.output.includes('duplicado'));
});

test('detecta archivo requerido faltante', () => {
  createMinimalApp('testapp');
  rmSync(join(tempDir, 'apps', 'testapp', 'package.json'));
  const result = runValidate();
  assert.notStrictEqual(result.exitCode, 0);
  assert.ok(result.exitCode !== 0, 'debería fallar');
});

test('detecta router sin 404.html', () => {
  createMinimalApp('testapp', { router: true });
  const result = runValidate();
  assert.notStrictEqual(result.exitCode, 0);
  assert.ok(result.output.includes('router pero no tiene'));
});

test('detecta no-router con 404.html sobrante', () => {
  createMinimalApp('testapp', { router: false });
  writeFileSync(join(tempDir, 'apps', 'testapp', 'public', '404.html'), '<!doctype html>', 'utf8');
  const result = runValidate();
  assert.notStrictEqual(result.exitCode, 0);
  assert.ok(result.output.includes('no usa router y no debería'));
});

test('detecta package.json.name no coincide', () => {
  createMinimalApp('testapp');
  const pkgPath = join(tempDir, 'apps', 'testapp', 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  pkg.name = '@other/wrong';
  writeFileSync(pkgPath, JSON.stringify(pkg), 'utf8');
  const result = runValidate();
  assert.notStrictEqual(result.exitCode, 0);
  assert.ok(result.output.includes('Inconsistencia'));
});

test('no-router con inline redirect script', () => {
  createMinimalApp('testapp', { router: false });
  const htmlPath = join(tempDir, 'apps', 'testapp', 'index.html');
  const html = `<!doctype html><html><head></head><body><div id="app"></div><script>qs.get("redirect")</script></body></html>`;
  writeFileSync(htmlPath, html, 'utf8');
  const result = runValidate();
  assert.notStrictEqual(result.exitCode, 0);
  assert.ok(result.output.includes('no debería incluir'));
});

test('app válida pasa sin errores', () => {
  createMinimalApp('testapp');
  const result = runValidate();
  assert.strictEqual(result.exitCode, 0);
  assert.ok(result.output.includes('Validación correcta'));
});

test('app no PWA válida no requiere iconos', () => {
  createMinimalApp('plain-app', {
    pwa: false,
    category: undefined,
    tags: undefined,
    icon: undefined
  });

  const appDir = join(tempDir, 'apps', 'plain-app');
  const configPath = join(appDir, 'app.config.json');
  writeFileSync(configPath, JSON.stringify({
    name: 'plain-app',
    title: 'plain-app',
    description: 'plain-app description',
    listed: true,
    pwa: false,
    router: false,
    themeColor: '#2563eb',
    backgroundColor: '#ffffff'
  }), 'utf8');
  rmSync(join(appDir, 'public', 'pwa-192.png'));
  rmSync(join(appDir, 'public', 'pwa-512.png'));

  const result = runValidate();
  assert.strictEqual(result.exitCode, 0, result.output);
});

test('falla si src/styles/index.css no importa styles/base.css', () => {
  createMinimalApp('style-missing-base');
  const stylePath = join(tempDir, 'apps', 'style-missing-base', 'src', 'styles', 'index.css');
  writeFileSync(stylePath, ':root { --app-accent: #2563eb; }\n', 'utf8');

  const result = runValidate();
  assert.notStrictEqual(result.exitCode, 0);
  assert.match(result.output, /base\.css/i);
});

test('falla si hay var(--token) sin definición ni fallback', () => {
  createMinimalApp('style-unresolved-token');
  const cssPath = join(tempDir, 'apps', 'style-unresolved-token', 'src', 'styles', 'index.css');
  writeFileSync(
    cssPath,
    '@import "../../../../styles/base.css";\n\n.bad { color: var(--token-no-definido); }\n',
    'utf8'
  );

  const result = runValidate();
  assert.notStrictEqual(result.exitCode, 0);
  assert.match(result.output, /token-no-definido/);
});

test('emite reporte por app con component-adjustment-needed', () => {
  createMinimalApp('home');
  createMinimalApp('planning-board');

  const result = runValidate();
  assert.strictEqual(result.exitCode, 0, result.output);
  assert.match(result.output, /Style compliance report:/);
  assert.match(result.output, /component-adjustment-needed/);
  assert.match(result.output, /home.*component-adjustment-needed:\s*false/i);
  assert.match(result.output, /planning-board.*component-adjustment-needed:\s*false/i);
});
