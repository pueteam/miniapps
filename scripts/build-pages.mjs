import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { APPS_DIR, getRepoName, listAppNames } from './lib/miniapps.mjs';

const outDir = join(process.cwd(), 'dist-pages');

function run(command, env = {}) {
  execSync(command, {
    stdio: 'inherit',
    env: { ...process.env, ...env }
  });
}

const repoName = getRepoName();
run('node scripts/validate-miniapps.mjs');
run('node scripts/generate-home-registry.mjs', { VITE_REPO_NAME: repoName });

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const appNames = listAppNames();

for (const appName of appNames) {
  console.log(`Building ${appName}...`);
  run(`pnpm --filter @miniapps/${appName} build`, { VITE_REPO_NAME: repoName });
}

const homeDist = join(APPS_DIR, 'home', 'dist');
if (!existsSync(homeDist)) {
  throw new Error(`No existe ${homeDist}`);
}
cpSync(homeDist, outDir, { recursive: true });

for (const appName of appNames.filter((name) => name !== 'home')) {
  const distDir = join(APPS_DIR, appName, 'dist');
  if (!existsSync(distDir)) {
    throw new Error(`No existe ${distDir}`);
  }
  cpSync(distDir, join(outDir, appName), { recursive: true });
}

console.log('dist-pages generado correctamente.');
