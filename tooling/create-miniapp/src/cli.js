#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  RESERVED_APP_NAMES,
  SCAFFOLD_DEFAULTS,
  isValidSlug,
} from '../../../scripts/lib/miniapps.mjs';

function parseArgs(argv) {
  const args = { slug: argv[2], ...SCAFFOLD_DEFAULTS };

  for (let index = 3; index < argv.length; index += 1) {
    const current = argv[index];
    if (current === '--router') args.router = true;
    else if (current === '--no-pwa') args.pwa = false;
    else if (current === '--listed=false') args.listed = false;
    else if (current === '--title') args.title = argv[++index] || '';
    else if (current === '--desc') args.desc = argv[++index] || '';
    else if (current === '--theme')
      args.theme = argv[++index] || SCAFFOLD_DEFAULTS.theme;
    else if (current === '--background')
      args.background = argv[++index] || SCAFFOLD_DEFAULTS.background;
    else if (current === '--category')
      args.category = argv[++index] || undefined;
    else if (current === '--tags')
      args.tags = (argv[++index] || '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
    else if (current === '--icon') args.icon = argv[++index] || undefined;
  }

  return args;
}

function ensureValidSlug(slug) {
  if (!slug) throw new Error('Debes indicar un slug.');
  if (!isValidSlug(slug)) throw new Error('Slug inválido. Usa kebab-case.');
  if (RESERVED_APP_NAMES.has(slug)) throw new Error('Slug reservado.');
}

function titleFromSlug(slug) {
  return slug
    .split('-')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}

function write(relativePath, content) {
  const filePath = join(process.cwd(), relativePath);
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, 'utf8');
}

function copyDefaultIcons(appDir) {
  const publicDir = join(appDir, 'public');
  mkdirSync(publicDir, { recursive: true });
  const src = join(dirname(fileURLToPath(import.meta.url)), '..', 'static');
  copyFileSync(join(src, 'pwa-192.png'), join(publicDir, 'pwa-192.png'));
  copyFileSync(join(src, 'pwa-512.png'), join(publicDir, 'pwa-512.png'));
  copyFileSync(join(src, 'pwa-maskable-512.png'), join(publicDir, 'pwa-maskable-512.png'));
}

function copyDefaultScreenshots(appDir) {
  const screenshotsDir = join(appDir, 'public', 'screenshots');
  mkdirSync(screenshotsDir, { recursive: true });
  const src = join(dirname(fileURLToPath(import.meta.url)), '..', 'static');
  copyFileSync(join(src, 'desktop.png'), join(screenshotsDir, 'desktop.png'));
  copyFileSync(join(src, 'mobile.png'), join(screenshotsDir, 'mobile.png'));
}

function buildIndexHtml({ title, theme, router }) {
  const redirectScript = router
    ? `
    <script>
      const qs = new URLSearchParams(location.search);
      const redirect = qs.get('redirect');
      if (redirect) {
        history.replaceState(null, '', decodeURIComponent(redirect));
      }
    </script>`
    : '';

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <meta name="theme-color" content="${theme}" />
  </head>
  <body>
    <div id="app"></div>${redirectScript}
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
}

function buildViteConfig({ pwa }) {
  const baseLine = `  return repo ? \`/\${repo}/\${appConfig.name}/\` : \`/\${appConfig.name}/\`;`;
  const pwaImport = pwa
    ? `import { VitePWA } from 'vite-plugin-pwa';
`
    : '';
  const pwaPlugin = pwa
    ? `,
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-192.png', 'pwa-512.png', 'pwa-maskable-512.png'],
      manifest: {
        id: base,
        name: appConfig.title,
        short_name: appConfig.title,
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'portrait',
        background_color: appConfig.backgroundColor,
        theme_color: appConfig.themeColor,
        description: appConfig.description,
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ],
        screenshots: [
          { src: 'screenshots/desktop.png', sizes: '1280x720', type: 'image/png', form_factor: 'wide' },
          { src: 'screenshots/mobile.png', sizes: '390x844', type: 'image/png' }
        ],
        categories: ['utilities'],
        lang: 'es'
      },
      workbox: {
        navigateFallback: 'index.html'
      }
    })`
    : '';

  return `import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
${pwaImport}import appConfig from './app.config.json';

function getPagesBase() {
  const repo = process.env.GITHUB_REPOSITORY?.split('/')?.[1] || process.env.VITE_REPO_NAME || '';
  ${baseLine}
}

const base = getPagesBase();

export default defineConfig({
  base,
  plugins: [
    preact()${pwaPlugin}
  ]
});
`;
}

function build404Html({ slug, title }) {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>${title} - redirect</title>
    <script>
      (function(){
        const slug = '${slug}';
        const marker = '/' + slug + '/';
        const idx = location.pathname.lastIndexOf(marker);
        const base = idx !== -1 ? location.pathname.slice(0, idx + marker.length) : marker;
        const path = idx !== -1 ? location.pathname.slice(idx + marker.length) : location.pathname.replace(marker, '');
        const query = location.search || '';
        location.replace(base + '?redirect=' + encodeURIComponent('/' + path + query + location.hash));
      })();
    </script>
  </head>
  <body></body>
</html>`;
}

function buildAppTsx({ title, pwa }) {
  const imports = pwa
    ? `import { useEffect } from 'preact/hooks';
import { registerSW } from './registerSW';
`
    : '';
  const setup = pwa
    ? `  useEffect(() => {
    registerSW();
  }, []);

`
    : '';

  return `${imports}import { AppShell } from '../components/AppShell';

export function App() {
${setup}  return (
    <AppShell>
      <section class="card">
        <h2>${title}</h2>
        <p>Plantilla base generada correctamente. Implementa aquí la lógica de la miniapp.</p>
      </section>
    </AppShell>
  );
}
`;
}

function buildAppShellTsx({ title, description, pwa }) {
  const importLine = pwa
    ? `import { InstallButton } from './InstallButton';
`
    : '';
  const installButton = pwa ? '\n        <InstallButton />' : '';

  return `import type { ComponentChildren } from 'preact';
${importLine}
export function AppShell(props: { children: ComponentChildren }) {
  return (
    <div class="app-shell">
      <header class="app-shell__header">
        <div>
          <h1>${title}</h1>
          <p>${description}</p>
        </div>${installButton}
      </header>
      <main>{props.children}</main>
    </div>
  );
}
`;
}

function buildRegisterSWTs() {
  return `interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallState {
  canInstall: boolean;
  isInstalled: boolean;
}

let installPrompt: BeforeInstallPromptEvent | null = null;
let installed = false;
let hasRegistered = false;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

export function registerSW(): void {
  if (hasRegistered) return;
  hasRegistered = true;

  window.addEventListener('beforeinstallprompt', (event: Event) => {
    event.preventDefault();
    installPrompt = event as BeforeInstallPromptEvent;
    notify();
  });

  window.addEventListener('appinstalled', () => {
    installed = true;
    installPrompt = null;
    notify();
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(\`\${import.meta.env.BASE_URL}sw.js\`, {
        scope: import.meta.env.BASE_URL
      }).catch((error) => {
        console.error('[registerSW] service worker registration failed', error);
      });
    }, { once: true });
  }
}

export function getInstallState(): InstallState {
  return {
    canInstall: installPrompt !== null,
    isInstalled: installed
  };
}

export function subscribeInstallState(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function triggerInstall(): void {
  const prompt = installPrompt;
  if (!prompt) return;

  prompt.prompt();
  void prompt.userChoice.then(() => {
    installPrompt = null;
    notify();
  });
}
`;
}

function buildInstallButtonTsx() {
  return `import { useEffect, useState } from 'preact/hooks';
import { getInstallState, subscribeInstallState, triggerInstall } from '../app/registerSW';

export function InstallButton() {
  const [installState, setInstallState] = useState(() => getInstallState());

  useEffect(() => subscribeInstallState(() => {
    setInstallState(getInstallState());
  }), []);

  if (!installState.canInstall || installState.isInstalled) return null;

  return (
    <button type="button" class="install-btn" onClick={triggerInstall} aria-label="Instalar app" title="Instalar app">
      <svg class="install-btn__icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="20" height="20">
        <path d="M10 3v9.5M6 9l4 4 4-4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M4 15.5h12" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
      </svg>
      <span class="install-btn__label" aria-hidden="true">Instalar</span>
    </button>
  );
}
`;
}

function generateFiles(args) {
  const slug = args.slug;
  const title = args.title || titleFromSlug(slug);
  const description = args.desc || `${title} offline`;
  const appDir = join('apps', slug);
  const appConfig = {
    name: slug,
    title,
    description,
    listed: args.listed,
    pwa: args.pwa,
    router: args.router,
    themeColor: args.theme,
    backgroundColor: args.background,
    ...(args.icon ? { icon: args.icon } : {}),
    ...(args.tags?.length ? { tags: args.tags } : {}),
    ...(args.category ? { category: args.category } : {}),
  };
  const devDependencies = {
    '@preact/preset-vite': '^2.10.1',
    typescript: '^5.9.3',
    vite: '^7.1.0',
    ...(args.pwa ? { 'vite-plugin-pwa': '^1.0.0' } : {}),
  };

  write(join(appDir, 'app.config.json'), JSON.stringify(appConfig, null, 2));

  write(
    join(appDir, 'package.json'),
    JSON.stringify(
      {
        name: `@miniapps/${slug}`,
        private: true,
        version: '0.1.0',
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview',
        },
        dependencies: {
          preact: '^10.26.4',
        },
        devDependencies,
      },
      null,
      2,
    ),
  );

  write(
    join(appDir, 'tsconfig.json'),
    JSON.stringify(
      {
        extends: '../../tsconfig.base.json',
        compilerOptions: { types: ['vite/client'] },
        include: ['src', 'vite.config.ts'],
      },
      null,
      2,
    ),
  );

  write(
    join(appDir, 'index.html'),
    buildIndexHtml({ title, theme: args.theme, router: args.router }),
  );
  write(join(appDir, 'vite.config.ts'), buildViteConfig({ pwa: args.pwa }));

  if (args.pwa) {
    copyDefaultIcons(appDir);
    copyDefaultScreenshots(appDir);
  }

  if (args.router) {
    write(join(appDir, 'public/404.html'), build404Html({ slug, title }));
  }

  write(
    join(appDir, 'src/main.tsx'),
    `import { render } from 'preact';
import { App } from './app/App';
import './styles/index.css';

render(<App />, document.getElementById('app')!);
`,
  );

  write(join(appDir, 'src/app/App.tsx'), buildAppTsx({ title, pwa: args.pwa }));

  write(
    join(appDir, 'src/components/AppShell.tsx'),
    buildAppShellTsx({ title, description, pwa: args.pwa }),
  );

  if (args.pwa) {
    write(join(appDir, 'src/app/registerSW.ts'), buildRegisterSWTs());
    write(
      join(appDir, 'src/components/InstallButton.tsx'),
      buildInstallButtonTsx(),
    );
  }

  write(
    join(appDir, 'src/hooks/useLocalStorage.ts'),
    `import { useEffect, useState } from 'preact/hooks';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
`,
  );

  write(
    join(appDir, 'src/lib/constants.ts'),
    `export const APP_NAME = '${slug}';
export const STORAGE_PREFIX = 'miniapps:${slug}:';
`,
  );
  write(join(appDir, 'src/features/.gitkeep'), '');
  write(
    join(appDir, 'src/styles/index.css'),
    `/* Shared base identity (imported) */
@import "../../../../styles/base.css";

:root {
  /* App accent token (customizable) */
  --app-accent: ${args.theme};

  /* App semantic tokens (local mapping) */
  --color-bg-page: var(--color-background-default);
  --color-bg-surface: var(--color-background-default);
  --color-text-primary: var(--color-brand-blue-900);
  --color-text-secondary: var(--color-neutral-700);
  --color-text-muted: var(--color-neutral-500);
  --color-border-subtle: var(--color-neutral-100);
  --color-border-default: var(--color-neutral-300);
  --color-accent-primary: var(--app-accent);
  --color-accent-hover: var(--app-accent);

  --card-radius: var(--radius-md);
  --card-padding: var(--space-6);
  --button-height-md: 48px;
  --button-radius: var(--radius-pill);
  --input-height: 48px;
  --input-radius: var(--radius-md);
}
`,
  );
}

function runPostGeneration() {
  execFileSync('node', ['scripts/generate-home-registry.mjs'], {
    stdio: 'inherit',
  });
  execFileSync('node', ['scripts/validate-miniapps.mjs'], { stdio: 'inherit' });
}

function main() {
  const args = parseArgs(process.argv);
  ensureValidSlug(args.slug);

  const appDir = resolve(process.cwd(), 'apps', args.slug);
  if (existsSync(appDir)) throw new Error(`La app "${args.slug}" ya existe.`);

  try {
    generateFiles(args);
  } catch (error) {
    rmSync(appDir, { recursive: true, force: true });
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  try {
    runPostGeneration();
    console.log(`Miniapp "${args.slug}" creada correctamente.`);
  } catch (error) {
    console.error(
      `Miniapp "${args.slug}" creada, pero falló la post-generación del repo.`,
    );
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
