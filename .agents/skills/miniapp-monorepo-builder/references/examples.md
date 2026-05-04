# Examples

Use these examples as a shape guide, not as rigid templates.

## Example 1: New simple PWA app

User intent:

`Create a miniapp called Shopping List to manage groceries offline.`

Suggested proposal:

1. `slug`: `shopping-list`
2. Scaffold command:
   `pnpm new:miniapp shopping-list --title "Shopping List" --desc "Offline grocery list" --category "utilities" --tags "shopping,offline"`
3. Flags:
   - `--router`: no
   - `--no-pwa`: no
4. First functional slice:
   - add items
   - mark items as completed
   - persist the list in local storage
5. Initial tests:
   - add item
   - toggle item completion
   - rehydrate stored items
6. Assumptions:
   - single-user offline app
   - no authentication
   - no sync

Implementation expectation:

- scaffold the app with the CLI
- replace the placeholder content in `src/app/App.tsx`
- add feature files under `src/features/shopping-list/`
- use `useLocalStorage` and `STORAGE_PREFIX`
- run app-local tests and `pnpm validate:miniapps`

## Example 2: New routed app

User intent:

`Create a recipe miniapp with list, detail, and settings pages.`

Suggested proposal:

1. `slug`: `recipe-book`
2. Scaffold command:
   `pnpm new:miniapp recipe-book --title "Recipe Book" --desc "Offline recipe manager" --router --category "lifestyle" --tags "recipes,offline"`
3. Flags:
   - `--router`: yes
   - `--no-pwa`: no
4. First functional slice:
   - recipe list
   - recipe detail
   - basic settings screen
5. Initial tests:
   - route rendering for main screens
   - create recipe flow
   - settings persistence

Implementation expectation:

- preserve the generated `public/404.html`
- add client routing only because the product needs internal screens
- keep the GitHub Pages routing contract intact

## Example 3: Hidden internal app

User intent:

`Create an experimental app that should not appear in home.`

Suggested proposal:

1. `slug`: `experiment-lab`
2. Scaffold command:
   `pnpm new:miniapp experiment-lab --title "Experiment Lab" --desc "Internal experimental miniapp" --listed=false`
3. First functional slice:
   - only the requested experimental UI
4. Validation focus:
   - confirm `"listed": false` in `app.config.json`
   - run `pnpm validate:miniapps`

## Example 4: Extend an existing app

User intent:

`Extend planning-board with a filter component and run validation.`

Expected behavior:

- do not scaffold
- inspect `apps/planning-board`
- propose the change scope
- implement only the requested feature
- run the most relevant tests and `pnpm validate:miniapps`

## Example 5: Invalid slug

User intent:

`Create a miniapp called Shopping_List.`

Expected behavior:

- detect that the proposed slug is invalid for kebab-case
- suggest a valid alternative such as `shopping-list`
- do not run the CLI until the slug is resolved or explicitly accepted

## Example 6: Existing app conflict

User intent:

`Create planning-board.`

Expected behavior:

- detect that `apps/planning-board` already exists
- do not overwrite or delete anything
- ask whether to extend the existing app, choose a new slug, or abort
