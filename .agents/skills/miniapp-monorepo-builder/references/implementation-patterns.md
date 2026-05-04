# Implementation Patterns

Use these patterns after the base scaffold exists.

## File ownership

Prefer this shape for a first implementation:

```text
apps/<slug>/
├─ src/
│  ├─ app/
│  │  └─ App.tsx
│  ├─ components/
│  │  └─ AppShell.tsx
│  ├─ features/
│  │  └─ <feature>/
│  ├─ hooks/
│  ├─ lib/
│  └─ styles/
```

Keep `App.tsx` thin. Put domain state, actions, and UI pieces under `src/features`.

## Scope the first slice

Translate a broad request into one defensible first version:

- one main screen
- one primary workflow
- one persistent state model if needed
- one polished but bounded UI direction

Avoid second-order features in the first pass unless they are essential to the core flow.

## Styling rules from the scaffold

Start from the generated token mapping in `src/styles/index.css`.

Add app-specific selectors and components there or split feature CSS when the app grows, but keep the shared token vocabulary coherent with `styles/base.css`.

Do not remove scaffold token aliases without checking repository style expectations first.

## PWA rules

If PWA is enabled:

- preserve `registerSW.ts`
- keep the install button flow unless the product explicitly should hide it
- do not remove manifest wiring from `vite.config.ts`

If the user asks for a non-installable internal tool, consider proposing `--no-pwa` before generation.

## Test strategy

Prefer app behavior tests for:

- form flows
- add or edit interactions
- filtering
- persistence
- empty and error states

Prefer E2E tests for:

- mobile vs desktop layout guarantees
- full happy-path flows
- navigation behavior that depends on the browser runtime

Possible initial test set:

- `src/app/App.test.tsx` for the main flow
- feature-specific tests under `src/features/.../*.test.tsx`
- `e2e/ui.spec.ts` only if layout and runtime integration are central

## Proposal template

Use a concise proposal like this before execution:

1. `slug`: `habit-tracker`
2. Scaffold command: `pnpm new:miniapp habit-tracker --title "Habit Tracker" --desc "Seguimiento de hábitos" --theme "#0f766e"`
3. Flags:
   - `--router`: no
   - `--no-pwa`: no
4. First functional slice:
   - create habits
   - mark daily completion
   - persist state in local storage
5. Initial tests:
   - add habit flow
   - toggle completion
   - persistence rehydration
6. Assumptions:
   - single-user offline app
   - no analytics
   - no sync

## Failure handling

If the scaffold command fails before files are created, fix the CLI input and retry.

If scaffold creation succeeds but post-generation validation fails, keep the created app, explain whether the breakage is app-local or repo-global, and continue repairing if feasible.

If a user request conflicts with the repository contract, state the conflict and propose the closest valid alternative.
