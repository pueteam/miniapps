# Create Miniapp Contract

This skill is coupled to the `miniapps` monorepo described in `README.md` and implemented by `tooling/create-miniapp/src/cli.js`.

## Canonical command

Use:

```bash
pnpm new:miniapp <slug> [options]
```

Repository alias in `package.json`:

```json
"new:miniapp": "node tooling/create-miniapp/src/cli.js"
```

## Required inputs for a proposal

- `slug`
- `title`
- `desc`
- `router`
- `pwa`

Optional metadata:

- `theme`
- `background`
- `category`
- `tags`
- `icon`
- `listed`

## CLI flags supported by the repository

- `--title <text>`
- `--desc <text>`
- `--router`
- `--no-pwa`
- `--theme <hex>`
- `--background <hex>`
- `--category <text>`
- `--tags <csv>`
- `--icon <name>`
- `--listed=false`

## Important behavior

- Reject invalid or reserved slugs
- Create the app under `apps/<slug>`
- Generate `app.config.json`, `package.json`, `tsconfig.json`, `index.html`, `vite.config.ts`, and base source files
- Generate `public/404.html` only when `--router` is used
- Copy default PWA icons and screenshots only when PWA is enabled
- Create:
  - `src/app/App.tsx`
  - `src/components/AppShell.tsx`
  - `src/hooks/useLocalStorage.ts`
  - `src/lib/constants.ts`
  - `src/features/.gitkeep`
  - `src/styles/index.css`
- When PWA is enabled, also create:
  - `src/app/registerSW.ts`
  - `src/components/InstallButton.tsx`
- Run post-generation repository actions:
  - `scripts/generate-home-registry.mjs`
  - `scripts/validate-miniapps.mjs`

## Generated scaffold conventions

- `App.tsx` starts as a placeholder inside `AppShell`
- `AppShell.tsx` renders the hero and optional install button
- `styles/index.css` imports `../../../../styles/base.css`
- app-local CSS defines alias tokens such as `--color-accent-primary`, `--card-radius`, `--input-radius`
- `STORAGE_PREFIX` is `miniapps:<slug>:`

## Router note

`--router` only prepares GitHub Pages deep-link restoration:

- `public/404.html`
- redirect handling in `index.html`

It does not install or configure a routing library. Add routing only if the requested product needs internal routes.

## Validation and publishing implications

The repository expects:

- valid app naming
- required files present
- coherence between `app.config.json` and `package.json`
- PWA assets only when `pwa=true`
- `404.html` when `router=true`
- no router redirect logic for apps without router

The home launcher registry is generated from listed app configs and excludes `home`.
