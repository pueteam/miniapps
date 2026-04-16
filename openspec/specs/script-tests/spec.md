# Script Tests

## Purpose

Verify infrastructure scripts in `scripts/*.mjs` work correctly through automated tests.

## ADDED Requirements

### Requirement: Tests para lib/miniapps.mjs

Los tests unitarios en `scripts/lib/miniapps.test.mjs` deben verificar todas las funciones exportadas.

#### Scenario: isValidSlug acepta slugs válidos
- **WHEN** se llama isValidSlug con "a", "abc", "a-b", "a-b-c"
- **THEN** retorna true

#### Scenario: isValidSlug rechaza slugs inválidos
- **WHEN** se llama isValidSlug con "", "A", "a_B", "-a", "a-", "a--b"
- **THEN** retorna false

#### Scenario: getRepoName lee GITHUB_REPOSITORY
- **WHEN** GITHUB_REPOSITORY="owner/repo" en env
- **THEN** retorna "repo"

#### Scenario: getRepoName usa VITE_REPO_NAME fallback
- **WHEN** GITHUB_REPOSITORY no está definido, VITE_REPO_NAME="myrepo"
- **THEN** retorna "myrepo"

#### Scenario: getRepoName retorna vacío si ningún env set
- **WHEN** ni GITHUB_REPOSITORY ni VITE_REPO_NAME están definidos
- **THEN** retorna ""

#### Scenario: getAppBase concatena repo y appName
- **WHEN** getRepoName() retorna "myrepo"
- **THEN** getAppBase("myapp") retorna "/myrepo/myapp/"

#### Scenario: getAppBase sin repo retorna solo slash-app
- **WHEN** getRepoName() retorna ""
- **THEN** getAppBase("myapp") retorna "/myapp/"

#### Scenario: readJson parsea JSON válido
- **WHEN** se llama readJson con archivo JSON válido
- **THEN** retorna el objeto parseado

#### Scenario: readJson lanza error en JSON inválido
- **WHEN** se llama readJson con archivo que no es JSON válido
- **THEN** lanza SyntaxError

#### Scenario: readJson lanza error si archivo no existe
- **WHEN** se llama readJson con path a archivo inexistente
- **THEN** lanza Error (ENOENT)

#### Scenario: listAppNames retorna directorios en apps/
- **WHEN** apps/ contiene directorios "home", "notes", "planning-board"
- **THEN** retorna ["home", "notes", "planning-board"] ordenado

### Requirement: Tests para validate-miniapps.mjs

Los tests unitarios verifican la detección de errores de validación.

#### Scenario: Detecta slug inválido
- **WHEN** una app tiene config.name="foo_Bar"
- **THEN** error incluye "Slug inválido"

#### Scenario: Detecta directorio no coincide con nombre
- **WHEN** directorio es "myapp" pero config.name="othername"
- **THEN** error incluye "no coincide"

#### Scenario: Detecta reserved name (excepto home)
- **WHEN** una app se llama "shared" o "config"
- **THEN** error incluye "reservado"

#### Scenario: Detecta slug duplicado
- **WHEN** dos apps tienen el mismo name en config
- **THEN** error incluye "duplicado"

#### Scenario: Detecta archivo requerido faltante
- **WHEN** falta package.json en una app
- **THEN** error incluye "Falta"

#### Scenario: Detecta router sin 404.html
- **WHEN** config.router=true pero no existe public/404.html
- **THEN** error incluye "router pero no tiene"

#### Scenario: Detecta no-router con 404.html sobrante
- **WHEN** config.router=false pero existe public/404.html
- **THEN** error incluye "no usa router y no debería"

#### Scenario: Valida app correcta pasa sin errores
- **WHEN** todas las validaciones pasan
- **THEN** output es "Validación correcta." y exit(0)

### Requirement: Tests para generate-home-registry.mjs

Los tests verifican la generación correcta del registry.

#### Scenario: Excluye 'home' del registry
- **WHEN** existe app "home" con listed=true
- **THEN** el registry no incluye entrada para home

#### Scenario: Filtra apps donde listed=false
- **WHEN** una app tiene listed=false en config
- **THEN** no aparece en el registry

#### Scenario: Ordena por title (localeCompare)
- **WHEN** apps tienen titles "Notes", "Habits", "Timer"
- **THEN** registry orden es ["Habits", "Notes", "Timer"]

#### Scenario: Genera href correcto con repo
- **WHEN** getRepoName() retorna "myrepo"
- **THEN** una app con name="notes" tiene href="/myrepo/notes/"

#### Scenario: Genera href correcto sin repo
- **WHEN** getRepoName() retorna ""
- **THEN** una app tiene href="/notes/"

#### Scenario: Estructura del objeto registry
- **WHEN** se genera el registry
- **THEN** cada entrada tiene: name, title, description, href, category (string), tags (array)