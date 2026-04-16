# Esquema de `app.config.json`

Estado: implementada

Resumen: Definición del contrato mínimo de `app.config.json` para cada miniapp. Los campos requeridos son `name`, `title`, `description`, `listed`, `pwa`, `router`, `themeColor` y `backgroundColor`; `icon`, `tags` y `category` son metadata opcional.

Evidencia:
- [tooling/create-miniapp/src/cli.js](tooling/create-miniapp/src/cli.js)
- [scripts/lib/miniapps.mjs](scripts/lib/miniapps.mjs)
- [apps/home/app.config.json](apps/home/app.config.json)

Descripción: El CLI genera `app.config.json` con contrato mínimo y metadata opcional cuando se proporciona; `scripts/lib/miniapps.mjs` y los scripts del repo consumen ese contrato compartido.

## Purpose

Definir el contrato mínimo y la semántica de `app.config.json` para miniapps del monorepo.

## Requirements

### Requirement: App config distinguishes required and optional metadata
`app.config.json` MUST define a minimal required metadata set for repository operation and MAY allow additional optional metadata that does not affect build, validation, or the minimal home index.

#### Scenario: Minimal app config remains valid
- **WHEN** a developer creates a miniapp with only required metadata fields
- **THEN** the app remains valid for scaffold, validation, registry generation, and GitHub Pages deployment

#### Scenario: Optional metadata does not become mandatory by accident
- **WHEN** optional metadata fields are omitted
- **THEN** validation and registry generation continue working without requiring placeholder values

### Requirement: Product-intent flags are explicit in app config
`app.config.json` MUST remain the explicit configuration contract for product-intent flags such as listing, router support, and PWA behavior.

#### Scenario: Flags drive derived behavior
- **WHEN** tooling reads `app.config.json`
- **THEN** generated artifacts and validations derive behavior from the config instead of duplicating independent flag semantics elsewhere

### Requirement: Required fields are consistent with scaffold and validation
The required fields in `app.config.json` MUST match what the scaffold generates and what validation checks for.

#### Scenario: Scaffold produces valid config
- **WHEN** a miniapp is scaffolded
- **THEN** the generated `app.config.json` passes validation without modifications

#### Scenario: Validation checks all required fields
- **WHEN** validation runs on a miniapp
- **THEN** it verifies presence and format of all required fields: name, title, description, listed, pwa, router, themeColor, backgroundColor