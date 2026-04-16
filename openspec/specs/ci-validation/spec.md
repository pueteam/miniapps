# Proceso CI/local para validar y construir páginas

Estado: implementada

Resumen: Scripts para validar la consistencia de miniapps, construir y previsualizar páginas (parte del pipeline de publicación y QA local).

Evidencia:
- [scripts/validate-miniapps.mjs](scripts/validate-miniapps.mjs)
- [scripts/build-pages.mjs](scripts/build-pages.mjs)
- [scripts/preview-pages.mjs](scripts/preview-pages.mjs)

Descripción: Los scripts permiten ejecutar validaciones automáticas y construir/preview las páginas estáticas. `tooling`/`cli` invocan estas tareas tras generar nuevas miniapps.

## Purpose

Definir los scripts de automatización para validación, construcción y previsualización de miniapps.

## Requirements

### Requirement: Validation script checks miniapp consistency
The validation script MUST verify that all miniapps conform to the repository contract.

#### Scenario: Validation runs on all miniapps
- **WHEN** `pnpm validate` is executed
- **THEN** all apps in the `apps/` directory are checked for consistency

#### Scenario: Validation reports pass/fail status
- **WHEN** validation completes
- **THEN** exit code is 0 on success, non-zero on failure with descriptive error messages

### Requirement: Build script produces static artifacts
The build script MUST generate static files suitable for GitHub Pages deployment.

#### Scenario: Build produces dist folder
- **WHEN** `pnpm build:pages` is executed
- **THEN** each miniapp's static build output is available in a deployable format

#### Scenario: Build respects PWA and router flags
- **WHEN** a miniapp has `pwa: true` or `router: true`
- **THEN** the build includes the appropriate artifacts for those configurations

### Requirement: Preview script serves built artifacts locally
The preview script MUST serve the built pages for local testing.

#### Scenario: Preview runs local server
- **WHEN** `pnpm preview` is executed
- **THEN** a local server serves the built pages

#### Scenario: Preview respects base path
- **WHEN** the monorepo is deployed to a subdirectory
- **THEN** preview serves with the correct base path configuration