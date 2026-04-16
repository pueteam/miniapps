# Validación de miniapps

Estado: implementada

Resumen: Reglas y script de validación que aseguran: slugs válidos, coincidencia entre directorio y `app.config.json`, presencia de archivos requeridos según contrato compartido, coherencia de `package.json`, y checks de router/404.

Evidencia:
- [scripts/validate-miniapps.mjs](scripts/validate-miniapps.mjs)
- [scripts/lib/miniapps.mjs](scripts/lib/miniapps.mjs)

Descripción: `scripts/validate-miniapps.mjs` ejecuta una batería de comprobaciones sobre cada app usando el contrato y utilidades definidas en `scripts/lib/miniapps.mjs`, incluyendo campos requeridos y requisitos condicionados por `pwa` y `router`.

## Purpose

Definir la validación estructural de miniapps contra contrato compartido del monorepo.

## Requirements

### Requirement: Validation uses the same structural contract as scaffold
Repository validation MUST consume the same shared contract used by the scaffold for miniapp structure, slug rules, and product-intent behavior.

#### Scenario: Required files match scaffold contract
- **WHEN** the repository contract for generated files changes
- **THEN** validation checks the updated contract from the shared source of truth instead of maintaining a divergent local list

#### Scenario: Style foundation checks align with scaffold baseline
- **WHEN** validation evaluates each miniapp
- **THEN** it verifies that the app style entrypoint follows the scaffold style baseline contract (shared base identity import plus local semantic extension)

#### Scenario: Unresolved style token usage is reported
- **WHEN** a stylesheet uses `var(--token-name)` and no declaration or fallback is resolvable in the app style scope
- **THEN** validation reports the token usage with file and selector context

#### Scenario: Per-app style report includes component-adjustment decision
- **WHEN** validation runs style conformance checks across miniapps
- **THEN** output includes per-app status, violated rules, and a `component-adjustment-needed` decision with rationale

### Requirement: Validation distinguishes local app defects from global repository defects
Validation and post-generation reporting MUST make it clear whether a failure is caused by the newly scaffolded app or by an unrelated existing repository issue.

#### Scenario: Unrelated repository issue is reported distinctly
- **WHEN** post-generation validation fails because of an unrelated existing app or repository artifact
- **THEN** the output identifies the failure as a repository-wide issue rather than implying that scaffold generation itself failed

### Requirement: Validation checks slug validity
Each miniapp's `app.config.json` name field MUST pass slug validation.

#### Scenario: Invalid slug fails validation
- **WHEN** a miniapp has a name with uppercase, underscores, or invalid characters
- **THEN** validation reports an error with "Slug inválido"

### Requirement: Validation checks directory-name match
The directory name MUST match the `name` field in `app.config.json`.

#### Scenario: Mismatch is detected
- **WHEN** directory is "myapp" but config.name is "othername"
- **THEN** validation reports an error about mismatch

### Requirement: Validation checks required files
Each miniapp MUST have the required files defined in the repository contract.

#### Scenario: Missing file is detected
- **WHEN** package.json is missing from a miniapp
- **THEN** validation reports an error with "Falta"

### Requirement: Validation checks router/404 coherence
Router-enabled apps MUST have `404.html`, and non-router apps MUST NOT have it.

#### Scenario: Router without 404.html
- **WHEN** config.router=true but public/404.html doesn't exist
- **THEN** validation reports "router pero no tiene"

#### Scenario: Non-router with 404.html
- **WHEN** config.router=false but public/404.html exists
- **THEN** validation reports "no usa router y no debería"

### Requirement: Validation checks reserved names
Reserved app names MUST be rejected except for the "home" launcher.

#### Scenario: Reserved name is blocked
- **WHEN** an app is named "shared" or "config"
- **THEN** validation reports "reservado"

### Requirement: Validation checks for duplicates
Duplicate app names MUST be detected across all miniapps.

#### Scenario: Duplicate names are detected
- **WHEN** two apps have the same name in their configs
- **THEN** validation reports "duplicado"