---
name: miniapp-monorepo-builder
description: Create and implement miniapps inside the specific miniapps monorepo that uses pnpm, Preact, TypeScript, GitHub Pages subpaths, and tooling/create-miniapp/src/cli.js. Use when Codex must propose, scaffold, and build a new miniapp in this repository, extend the generated structure with a first functional version, add initial tests, run the repo-aware CLI instead of handcrafting the base app, and keep the language of user-facing text aligned with the user's prompt.
---

# Miniapp Monorepo Builder

Use the repository generator as the source of truth.

Do not handcraft the base scaffold when `tooling/create-miniapp/src/cli.js` is available and the task is creating a new miniapp. Generate first, then customize.

## Verify the repo contract

Confirm that the current repository contains at least:

- `package.json` with `pnpm new:miniapp`
- `tooling/create-miniapp/src/cli.js`
- `scripts/validate-miniapps.mjs`
- `scripts/generate-home-registry.mjs`
- `README.md`

If these markers are missing, stop and explain that this skill is coupled to the `miniapps` monorepo contract.

Read [references/create-miniapp-contract.md](references/create-miniapp-contract.md) before proposing the scaffold.

Read [references/implementation-patterns.md](references/implementation-patterns.md) before implementing feature code and tests.

Read [references/examples.md](references/examples.md) when the user request is underspecified, mixes scaffold and implementation work, or needs a precedent for how much to build in the first pass.

Read [references/troubleshooting.md](references/troubleshooting.md) when the CLI, validation, generated assets, routing contract, or app-local build fails.

## Gather the minimum inputs

Before generating anything, collect the minimum viable definition:

- app goal
- `slug`
- `title`
- `desc`
- whether the app needs client-side routes
- whether the app should be PWA or `--no-pwa`

Ask only for missing items. Keep the wording in the same language as the user's prompt.

If the user gives a fuzzy product idea, derive a concrete first slice and say so explicitly in the proposal.

If the user asks to modify an existing app instead of creating a new one, do not run the scaffold command. Inspect the existing app, propose the change scope, then implement and validate.

## Propose before executing

Always propose the plan before calling the CLI.

The proposal must include:

1. The chosen `slug`
2. The exact `pnpm new:miniapp ...` command with flags
3. Whether `--router` is needed
4. Whether PWA stays enabled or uses `--no-pwa`
5. The first functional scope that will be implemented after scaffold generation
6. The tests that will be added first
7. Any assumption you are making

Do not run the scaffold command until the user accepts the proposal or clearly asks you to proceed.

If `apps/<slug>` already exists, stop and ask whether to extend the existing app, choose a new slug, or abort.

## Generate the base app

Create the app with the repository command:

```bash
pnpm new:miniapp <slug> [flags]
```

Prefer this entrypoint over calling `node tooling/create-miniapp/src/cli.js` directly unless there is a concrete reason not to.

Treat the CLI behavior as canonical:

- it validates the slug
- it creates `apps/<slug>`
- it wires PWA assets when enabled
- it creates `public/404.html` only for router apps
- it regenerates the home registry
- it runs repository validation after generation

If post-generation validation fails for a global repo reason, preserve the generated app and explain the failure instead of deleting user work.

## Implement the first functional version

After generation, replace the placeholder scaffold with working feature code.

Prefer this structure:

- keep `src/app/App.tsx` as the app composition entry
- keep `src/components/AppShell.tsx` as the shell and hero wrapper
- put product logic and UI under `src/features/...`
- keep shared constants under `src/lib/...`
- use `src/hooks/...` only for reusable hooks

Preserve the generated base conventions unless there is a strong reason to change them:

- Preact + TypeScript
- `styles/base.css` import from `src/styles/index.css`
- app-local CSS tokens mapped from shared design tokens
- `registerSW.ts` and `InstallButton.tsx` when PWA is enabled

If the app needs multiple internal screens, remember that `--router` only prepares GitHub Pages deep-link support. It does not add a routing library by itself. Add client routing only when the feature actually needs it.

Use the generated scaffold as a starting point, not as a constraint against replacing placeholder content. It is expected to rewrite the placeholder card, add feature folders, and introduce app-specific state and UI.

## Add initial tests

Add tests in the smallest set that defends the first functional slice.

Prefer:

- component or app behavior tests close to the feature with Vitest and Testing Library when the app logic is interactive
- E2E coverage only for critical user flows or responsive layout constraints already common in the repo

When adding tests, inspect neighboring apps first and match the existing repository style rather than inventing a new setup.

If the repository is missing the dependencies or configuration needed for the test type you want, say so and either:

- add the missing setup if it is clearly consistent with the repo, or
- fall back to the highest-signal test type already supported

When the app is only being scaffolded and no meaningful behavior was implemented yet, say explicitly that there is no app-specific behavior worth testing beyond repository validation.

## Validate after implementation

After implementing the first version:

1. Run the most relevant app-local tests
2. Run `pnpm validate:miniapps`
3. Regenerate `home` only if needed, though the scaffold command usually already does it
4. If feasible, run the app locally with `pnpm --filter @miniapps/<slug> dev`

If validation fails, fix the problem before stopping unless blocked by missing dependencies, sandbox limits, or unrelated repo breakage.

## Output discipline

Be explicit about:

- what was generated by the CLI
- what was implemented manually afterward
- what assumptions remain
- what the user should review next

Do not present the generated scaffold as custom architecture work. Separate scaffold facts from feature implementation decisions.

When the work is blocked, explain whether the blocker is:

- missing user input
- existing app conflict
- repository-wide failure
- missing dependencies or test setup
- sandbox or permissions limits
