# miniapp-scaffold-brand-foundation

Estado: implementada

## Purpose

Definir la base visual y de metadata que debe generar el scaffold de miniapps para que las nuevas apps nazcan con identidad PUEDATA y espacio para acentos propios.

## Requirements

### Requirement: Scaffold SHALL generate PUEDATA-aligned base styles for new miniapps
The miniapp scaffolding flow SHALL generate a default stylesheet whose typography, neutral surfaces, spacing, and radius are aligned with the PUEDATA base identity.

#### Scenario: New miniapp gets shared base primitives
- **WHEN** a developer creates a new miniapp with `tooling/create-miniapp`
- **THEN** the generated `src/styles/index.css` includes base primitives and tokens aligned with the PUEDATA design foundation

#### Scenario: Generated primitives cover the common starter UI
- **WHEN** the scaffold creates the default shell, card, button, and form control styles
- **THEN** those primitives use the shared PUEDATA base instead of the previous generic hardcoded defaults

### Requirement: Scaffold SHALL expose a semantic token vocabulary
The generated stylesheet SHALL define a semantic token vocabulary for the most common UI concerns so new miniapps consume semantic names instead of coupling directly to raw palette values.

#### Scenario: Semantic tokens cover common UI usage
- **WHEN** the scaffold generates its default stylesheet
- **THEN** it defines semantic tokens for page background, surface background, primary text, secondary text, border, and primary accent usage

#### Scenario: Generated primitives consume semantic tokens
- **WHEN** the scaffold generates shell, card, button, and form control styles
- **THEN** those rules consume semantic tokens rather than referencing raw brand or neutral palette names directly

#### Scenario: Generated stylesheet separates shared identity from local extension
- **WHEN** the scaffold generates `src/styles/index.css`
- **THEN** the file structure makes explicit which variables come from shared base identity and which variables are app-local semantic extensions

### Requirement: Scaffold SHALL allow app-specific accents on top of the base identity
The generated stylesheet SHALL preserve a clear extension point for miniapp-specific visual accents without replacing the shared PUEDATA base system.

#### Scenario: Theme color remains usable as an accent
- **WHEN** a new miniapp is generated with a configured theme color
- **THEN** that color can be applied to accent-driven elements such as primary actions while the rest of the visual foundation remains shared

#### Scenario: Base and accent concerns stay separated
- **WHEN** a developer customizes a generated miniapp
- **THEN** the generated styles make it clear which variables or rules define the shared base identity and which define app-specific accents

### Requirement: Scaffold SHALL use PUEDATA-aligned defaults for manifest colors
The scaffold SHALL default `themeColor` and `backgroundColor` to PUEDATA-aligned values when the developer does not provide explicit overrides.

#### Scenario: Default theme color uses PUEDATA brand blue
- **WHEN** a developer creates a new miniapp without passing `--theme`
- **THEN** the generated config and manifest metadata use `#004F87` as the default `themeColor`

#### Scenario: Default background color stays neutral
- **WHEN** a developer creates a new miniapp without passing `--background`
- **THEN** the generated config and manifest metadata use `#FFFFFF` as the default `backgroundColor`

### Requirement: Scaffold SHALL establish the default visual baseline for future miniapps
The generated stylesheet SHALL serve as the default visual baseline for newly created miniapps so future additions start from the same design foundation.

#### Scenario: New miniapps inherit the same design baseline
- **WHEN** two miniapps are created from the scaffold at different times
- **THEN** both start from the same PUEDATA-aligned typography, spacing, radius, and neutral color rules unless intentionally customized afterward

#### Scenario: Generated baseline keeps a migration-friendly extension point
- **WHEN** a team needs to migrate a complex miniapp with pre-existing component styles
- **THEN** the scaffold baseline remains compatible with a temporary alias layer without replacing the shared identity tokens