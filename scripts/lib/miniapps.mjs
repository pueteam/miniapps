import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const APPS_DIR = join(process.cwd(), 'apps');
export const HOME_DIR = join(APPS_DIR, 'home');
export const HOME_REGISTRY_PATH = join(HOME_DIR, 'src', 'generated', 'apps-registry.ts');
export const RESERVED_APP_NAMES = new Set(['home', 'shared', 'config', 'tooling', 'scripts', 'docs']);
export const REQUIRED_APP_FILES = [
  'package.json',
  'index.html',
  'vite.config.ts',
  'src/main.tsx',
  'src/app/App.tsx'
];
export const REQUIRED_PWA_FILES = ['public/pwa-192.png', 'public/pwa-512.png'];
export const REQUIRED_APP_CONFIG_FIELDS = [
  'name',
  'title',
  'description',
  'listed',
  'pwa',
  'router',
  'themeColor',
  'backgroundColor'
];
export const OPTIONAL_APP_CONFIG_FIELDS = ['category', 'tags', 'icon'];
export const SCAFFOLD_DEFAULTS = {
  title: '',
  desc: '',
  router: false,
  pwa: true,
  theme: '#004F87',
  background: '#FFFFFF',
  category: undefined,
  tags: undefined,
  icon: undefined,
  listed: true
};

export function isValidSlug(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

export function getRepoName() {
  const envRepo = process.env.GITHUB_REPOSITORY?.split('/')[1] || process.env.VITE_REPO_NAME || '';
  if (envRepo.trim()) return envRepo.trim();

  const packageJsonPath = join(process.cwd(), 'package.json');
  if (!existsSync(packageJsonPath)) return '';

  const packageName = readJson(packageJsonPath)?.name;
  return typeof packageName === 'string' ? packageName.trim() : '';
}

export function getAppBase(appName) {
  const repo = getRepoName();
  return repo ? `/${repo}/${appName}/` : `/${appName}/`;
}

export function getRequiredAppFiles(appConfig = {}) {
  return appConfig.pwa === false
    ? REQUIRED_APP_FILES
    : [...REQUIRED_APP_FILES, ...REQUIRED_PWA_FILES];
}

export function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

export function listAppNames() {
  return readdirSync(APPS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

export function getAppDir(appName) {
  return join(APPS_DIR, appName);
}

export function getAppConfigPath(appName) {
  return join(getAppDir(appName), 'app.config.json');
}

export function readAppConfig(appName) {
  return readJson(getAppConfigPath(appName));
}

export function readAllAppConfigs() {
  return listAppNames()
    .map((appName) => ({ appName, appDir: getAppDir(appName), configPath: getAppConfigPath(appName) }))
    .filter((entry) => existsSync(entry.configPath))
    .map((entry) => ({ ...entry, config: readJson(entry.configPath) }));
}
