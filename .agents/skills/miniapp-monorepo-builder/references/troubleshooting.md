# Troubleshooting

Use this reference when the canonical generator flow or repository validation does not succeed.

## Fast checks

- confirm you are at the repository root
- confirm `tooling/create-miniapp/src/cli.js` exists
- confirm `scripts/validate-miniapps.mjs` exists
- confirm `package.json` exposes `pnpm new:miniapp`

## Common failures

### Invalid slug

Symptoms:

- CLI rejects the slug
- slug is not kebab-case

Action:

- propose a lowercase kebab-case slug
- do not invent unsupported normalization rules after the fact

### Existing app already present

Symptoms:

- `apps/<slug>` already exists
- CLI aborts before generation

Action:

- do not overwrite
- ask whether to extend the app, choose a new slug, or abort

### Router mismatch

Symptoms:

- validation complains about router behavior
- app needs internal routes but was scaffolded without `--router`
- non-router app contains redirect logic

Action:

- preserve `public/404.html` for router apps
- preserve the redirect contract only when router is enabled
- if the app truly needs internal routes and was scaffolded incorrectly, explain the mismatch and repair the app deliberately

### Missing PWA assets

Symptoms:

- validation complains about missing icons or screenshots
- generated app is marked as PWA but public assets are absent

Action:

- confirm whether the app should actually be PWA
- if yes, restore the generated PWA asset contract
- if no, move back to a non-PWA configuration only when the user wants that behavior

### Home registry looks stale

Symptoms:

- app does not appear in the launcher
- metadata changed after manual edits

Action:

- run `pnpm generate:home`
- rerun `pnpm validate:miniapps`
- confirm whether `listed` is true

### Post-generation validation failed

Symptoms:

- scaffold command created the app but ended with repo validation errors

Action:

- keep the generated app
- determine whether the error is app-local or repo-global
- fix the local app if feasible
- if the failure is global, explain it clearly instead of pretending the app generation failed completely

### App-local build or test failure

Symptoms:

- targeted app build fails
- component tests fail after implementation

Action:

- inspect app-local TypeScript, Preact, or test errors first
- do not assume the scaffold is wrong when the issue comes from custom feature code
- keep fixes scoped to the requested app unless the evidence points to shared infrastructure

## Validation sequence

Use the smallest useful sequence first:

1. app-local tests when they exist
2. `pnpm validate:miniapps`
3. `pnpm --filter @miniapps/<slug> build` when app-local build confidence matters
4. `pnpm test:scripts` and `pnpm build:pages` when broader repo confidence is needed

Do not default to the heaviest validation path when a smaller one is enough for the change.
