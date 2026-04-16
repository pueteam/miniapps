# Planning Board Token Migration Checklist

## Goal
Move UI component styles from compatibility aliases (`--color-*`, `--spacing-*`, `--font-*`, `--radius-*`) to source-of-truth board tokens (`--board-*`).

## Ownership and deadline
- Owner: Planning Board maintainers (`apps/planning-board`)
- Target deadline: 2026-06-15
- Tracking issue: create and link in repo issue tracker before next release cut

## Migrated in this batch
- [x] TopBar (`features/board/ui/TopBar.css`)
- [x] Toolbar (`features/board/ui/Toolbar.css`)
- [x] Remaining UI components in `features/board/ui/*.css` (including `ProfileCreateForm.css`)

## Pending migration batches
- [x] Scheduler shell and headers (`SchedulerPane.css`, `SlotHeader.css`, `SlotCell.css`)
- [x] Row and assignment visuals (`ProfileRow.css`, `AssignmentBar.css`)
- [x] Popovers and contextual UI (`HoverPopover.css`, `AssignmentPopover.css`, `ContextMenu.css`, `DeleteConfirm.css`)
- [x] Secondary controls (`ExportButton.css`, `InstallButton.css`, `ViewToggle.css`, `ZoomControl.css`, `StatsBar.css`)

## Exit criteria for alias removal
- [x] No remaining component stylesheet references alias tokens in `features/board/ui/*.css`
- [x] `scripts/validate-miniapps.mjs` reports no unresolved style token violations for `planning-board`
- [x] `component-adjustment-needed` can be set to `false` for `planning-board`

## Alias removal tasks
- [x] Remove compatibility alias block from `src/styles/tokens.css`
- [x] Re-run `pnpm validate:miniapps` and `node --test scripts/tests/style-foundation-migrations.test.mjs`
- [x] Update `openspec/changes/migrate-miniapps-style-foundation-validation/app-assessment-matrix.md` with `component-adjustment-needed=false`
