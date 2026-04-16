import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';

test('home config uses BASE manifest defaults', () => {
  const appConfig = JSON.parse(readFileSync('apps/home/app.config.json', 'utf8'));

  assert.strictEqual(appConfig.themeColor, '#004F87');
  assert.strictEqual(appConfig.backgroundColor, '#FFFFFF');
});

test('home stylesheet exposes semantic tokens and uses soft page background', () => {
  const styles = readFileSync('apps/home/src/styles/index.css', 'utf8');

  assert.ok(styles.includes('@import "../../../../styles/base.css";'));
  assert.match(styles, /--color-bg-page:\s*var\(--color-background-soft\)/);
  assert.match(styles, /--color-bg-surface:\s*var\(--color-background-default\)/);
  assert.match(styles, /--color-text-primary:/);
  assert.match(styles, /--color-border-subtle:/);
  assert.match(styles, /--color-accent-primary:/);
  assert.match(styles, /body\s*\{[^}]*background:\s*var\(--color-bg-page\)/s);
  assert.match(styles, /\.app-card\s*\{[^}]*background:\s*var\(--color-bg-surface\)/s);
});

test('home stylesheet keeps responsive grid behavior', () => {
  const styles = readFileSync('apps/home/src/styles/index.css', 'utf8');

  assert.match(styles, /grid-template-columns:\s*repeat\(auto-fit, minmax\(240px, 1fr\)\)/);
  assert.match(styles, /@media\s*\(max-width:\s*767px\)/);
  assert.match(styles, /\.grid\s*\{[^}]*gap:\s*var\(--space-4\)[^}]*margin-top:\s*var\(--space-8\)/s);
});
