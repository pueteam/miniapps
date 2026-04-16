# home-brand-foundation

Estado: implementada

## Purpose

Definir la base visual PUEDATA que debe aplicar el launcher `home`, incluyendo tokens, semántica visual y comportamiento responsive.

## Requirements

### Requirement: Home SHALL use a PUEDATA base visual system
The `home` miniapp SHALL define and consume a base set of visual tokens aligned with the PUEDATA identity for typography, neutral and brand color usage, spacing, and radius.

#### Scenario: Root tokens are available in home
- **WHEN** `apps/home` loads its base stylesheet
- **THEN** the stylesheet defines reusable tokens for typography, color, spacing, and radius derived from the PUEDATA design foundation

#### Scenario: Home surfaces use brand-consistent styling
- **WHEN** a user views the home page cards, text, and page background
- **THEN** those surfaces use the PUEDATA base visual language instead of ad hoc hardcoded values unrelated to the PUEDATA foundation

### Requirement: Home SHALL separate runtime page background from manifest background metadata
The `home` miniapp SHALL use the PUEDATA soft background token for the page canvas while keeping a neutral `backgroundColor` value for manifest and PWA startup metadata.

#### Scenario: Home page uses the soft background token
- **WHEN** the home page renders its primary canvas
- **THEN** the page background uses the PUEDATA soft background value rather than the manifest background default

#### Scenario: Home manifest background remains neutral
- **WHEN** PWA metadata is generated from `apps/home/app.config.json`
- **THEN** `backgroundColor` remains `#FFFFFF` even if the runtime page background uses a different PUEDATA token

### Requirement: Home SHALL preserve responsive layout behavior while adopting the new base
The `home` miniapp SHALL keep a responsive grid and container behavior compatible with mobile and desktop usage while applying the PUEDATA base tokens.

#### Scenario: Grid remains responsive
- **WHEN** the viewport changes between mobile and desktop widths
- **THEN** the app list remains readable and the grid adapts without losing spacing consistency defined by the PUEDATA base tokens

#### Scenario: Container uses shared spacing rules
- **WHEN** the page content is rendered on supported breakpoints
- **THEN** the main layout padding and card spacing follow the shared spacing scale rather than arbitrary per-rule values

### Requirement: Home MAY keep local presentation details above the base identity
The `home` miniapp MAY retain local layout or interaction details as long as they do not replace the shared PUEDATA foundations for typography, color, spacing, and radius.

#### Scenario: Local details remain allowed
- **WHEN** `home` needs a page-specific hover or card treatment
- **THEN** that treatment can be layered on top of the shared base tokens without redefining the base identity itself

### Requirement: Home SHALL consume a semantic token vocabulary
The `home` miniapp SHALL use a semantic token vocabulary for common UI concerns instead of coupling page styles directly to raw palette token names.

#### Scenario: Semantic tokens define page and surface usages
- **WHEN** the `home` stylesheet maps page, surface, text, border, and accent styles
- **THEN** it does so through semantic names such as page background, surface background, primary text, subtle border, and primary accent

#### Scenario: Raw palette tokens stay behind semantic aliases
- **WHEN** PUEDATA foundation values change within the same design intent
- **THEN** `home` can adopt those updates by remapping semantic tokens without rewriting every consumer rule