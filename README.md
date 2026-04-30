# Miniapps monorepo

Monorepo para alojar múltiples miniapps PWA independientes en GitHub Pages usando un único repositorio.

Cada miniapp vive en `apps/<slug>` y se publica como una subruta estática del repositorio. El proyecto está diseñado para minimizar trabajo manual e incluye un launcher `home`, un generador de miniapps, validación estructural y un build agregador para GitHub Pages.

Ejemplos de URL finales:

* `https://<usuario>.github.io/<repo>/`
* `https://<usuario>.github.io/<repo>/nombre_miniapp1/`
* `https://<usuario>.github.io/<repo>/nombre_miniapp2/`

## Características

* `pnpm workspaces`
* `Vite + Preact + TypeScript`
* `vite-plugin-pwa` para `manifest` y `service worker`
* `apps/home` como launcher de miniapps
* miniapp real de ejemplo: `planning-board`
* generador `pnpm new:miniapp`
* validación automática del monorepo
* build agregado para GitHub Pages
* previsualización local del artefacto final
* workflow de GitHub Actions para despliegue

## Estructura del repositorio

```text
miniapps/
├─ apps/
│  ├─ home/
│  └─ planning-board/
├─ assets/
│  └─ pwa/
├─ tooling/
│  └─ create-miniapp/
├─ scripts/
│  ├─ lib/
│  ├─ build-pages.mjs
│  ├─ generate-home-registry.mjs
│  ├─ validate-miniapps.mjs
│  └─ preview-pages.mjs
└─ .github/workflows/
```

## Requisitos

* Git
* Node.js 20 o superior
* pnpm 10

Comprobación rápida:

```bash
node -v
pnpm -v
git --version
```

## Puesta en marcha local

Instala dependencias y valida que el repositorio está consistente:

```bash
pnpm install
pnpm test:scripts
pnpm validate:miniapps
pnpm generate:home
```

Esto deja validado el generador, la estructura del monorepo y el launcher `home`.

## Desarrollo local

Para levantar una app concreta en modo desarrollo:

```bash
pnpm --filter @miniapps/home dev
pnpm --filter @miniapps/planning-board dev
pnpm --filter @miniapps/md-converter dev
```

## Crear una nueva miniapp

### Comando

```bash
pnpm new:miniapp <slug> [opciones]
```

### Ejemplos

```bash
pnpm new:miniapp shopping-list
```

```bash
pnpm new:miniapp habit-tracker --title "Habit Tracker" --desc "Seguimiento de hábitos" --router --theme "#0f766e"
```

```bash
pnpm new:miniapp habit-tracker \
  --title "Habit Tracker" \
  --desc "Seguimiento de hábitos" \
  --router \
  --theme "#0f766e" \
  --background "#ffffff" \
  --tags "habit,productivity" \
  --icon "leaf"
```

### Opciones soportadas

* `--title <texto>`
  Nombre amigable de la miniapp. Se usa en `home` y en el `manifest` PWA.
  Ejemplo: `--title "Habit Tracker"`

* `--desc <texto>`
  Descripción corta de la app para el launcher y metadatos.
  Ejemplo: `--desc "Seguimiento de hábitos"`

* `--router`
  Activa modo SPA con router cliente. El generador establecerá `router: true` en `app.config.json` y creará `public/404.html` para restaurar rutas en GitHub Pages. Úsalo si la app necesita rutas internas, por ejemplo `/settings`.

* `--no-pwa`
  Genera una miniapp sin huella PWA. No añade `vite-plugin-pwa`, no copia iconos PWA y no genera `manifest` ni `service worker`.

* `--theme <hex>`
  Color primario en hexadecimal. Se aplica a `manifest.theme_color`, meta `theme-color` y variables CSS de acento.
  Por defecto: `#004F87`
  Ejemplo: `--theme "#0f766e"`

* `--background <hex>`
  Color de fondo en hexadecimal para `manifest.background_color` y estilos de carga.
  Por defecto: `#FFFFFF`
  Ejemplo: `--background "#ffffff"`

* `--category <texto>`
  Metadata opcional para clasificación futura. `home` no depende de ello.
  Ejemplo: `--category "productivity"`

* `--tags <csv>`
  Metadata opcional separada por comas. Solo se guarda si se proporciona.
  Ejemplo: `--tags "habit,productivity,offline"`

* `--icon <nombre>`
  Metadata opcional del icono. Solo se guarda si se proporciona.
  Ejemplo: `--icon "leaf"`

* `--listed=false`
  Evita que la app aparezca en `home`. Por defecto las apps se listan. Es útil para apps privadas o en desarrollo.
  Ejemplo: `--listed=false`

### Qué hace el generador

1. Valida el `slug`.
2. Crea `apps/<slug>`.
3. Genera los archivos base de la app.
4. Copia iconos PWA solo si la app es PWA.
5. Crea `404.html` si la app usa router.
6. Regenera el launcher `home`.
7. Valida el resultado. Si falla por un problema global del repositorio, conserva la nueva app para revisión.

La plantilla base comparte estilos desde `styles/base.css`. La miniapp nueva solo redefine las variables necesarias para su identidad visual y ajustes locales.

### Flujo recomendado tras crear una app

```bash
pnpm new:miniapp <slug> --title "..." --desc "..."
pnpm test:scripts
pnpm validate:miniapps
pnpm --filter @miniapps/<slug> dev
pnpm build:pages
```

Checklist sugerido:

1. Crear la app con `pnpm new:miniapp`.
2. Revisar `apps/<slug>/app.config.json`.
3. Levantar la app en local.
4. Ejecutar validaciones.
5. Generar `dist-pages/`.
6. Hacer commit y push.

## Validación y utilidades

### Validar miniapps

```bash
pnpm validate:miniapps
```

Comprueba:

* nombres válidos
* ficheros obligatorios
* coherencia entre `app.config.json` y `package.json`
* iconos requeridos solo para apps PWA
* `404.html` si `router=true`
* ausencia de lógica de redirect en apps sin router

### Regenerar el launcher `home`

```bash
pnpm generate:home
```

### Generar build agregado para Pages

```bash
pnpm build:pages
```

### Previsualizar el artefacto final

```bash
pnpm preview:pages
```

## Despliegue en GitHub Pages

### Crear y vincular el repositorio

Desde GitHub:

1. Crea un repositorio nuevo.
2. Asígnale un nombre, por ejemplo `miniapps`.
3. Márcalo como público si quieres el caso más simple con GitHub Pages.

Después, vincula el repositorio local:

```bash
git init
git remote add origin https://github.com/<usuario>/<repo>.git
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

### Configuración de Pages

1. Ve a **Settings > Pages**.
2. En **Build and deployment**, selecciona **GitHub Actions**.
3. Verifica que la pestaña **Actions** esté habilitada.
4. Haz push a `main`.

El despliegue incluido vive en `.github/workflows/deploy-pages.yml` y no requiere secretos manuales en el caso estándar de GitHub Pages.

### Qué hace el workflow

1. `checkout`
2. setup de Node y pnpm
3. `pnpm install --frozen-lockfile`
4. validación del repositorio
5. build de Pages
6. subida de `dist-pages/`
7. despliegue

### Verificación previa recomendada en local

Antes del primer push, ejecuta:

```bash
pnpm install
pnpm test:scripts
pnpm validate:miniapps
pnpm build:pages
```

### Primer despliegue recomendado

```bash
pnpm install
pnpm test:scripts
pnpm validate:miniapps
pnpm build:pages
git add .
git commit -m "Initial commit"
git push -u origin main
```

Después del push:

1. Abre **Actions** y espera a que termine `Deploy GitHub Pages`.
2. Entra en **Settings > Pages** y confirma la URL publicada.
3. Verifica `home` en `https://<usuario>.github.io/<repo>/`.
4. Verifica al menos una miniapp en su subruta.

## Detalles técnicos relevantes

### Base de subruta

GitHub Pages para repositorios de proyecto sirve el sitio bajo `/<repo>/`. Por eso cada miniapp debe construir con una base del tipo `/<repo>/<app>/`.

Este monorepo calcula esa base a partir de:

* `GITHUB_REPOSITORY` en CI
* `VITE_REPO_NAME` en local

### Recarga en subrutas SPA

GitHub Pages no resuelve rutas profundas de una SPA. Las apps con router incluyen `public/404.html` para restaurar la ruta al arrancar.

## Problemas comunes

### Assets con 404

Revisa:

* `VITE_REPO_NAME`
* `GITHUB_REPOSITORY`
* nombre real del repositorio en GitHub

### Una SPA falla al recargar

Revisa:

* que exista `public/404.html`
* que `router` esté activado en `app.config.json`

### `home` no muestra una app

Revisa:

* `listed`
* ejecuta `pnpm generate:home`
* vuelve a ejecutar `pnpm validate:miniapps`

### Falla GitHub Actions

Comprueba que estos comandos funcionan en local:

```bash
pnpm test:scripts
pnpm validate:miniapps
pnpm build:pages
```

Además, verifica:

* que Pages esté configurado con **GitHub Actions**
* que `.github/workflows/deploy-pages.yml` exista y no esté deshabilitado

## Ejemplo de flujo completo

```bash
pnpm new:miniapp weekly-planner --title "Weekly Planner" --desc "Planificador semanal offline" --theme "#7c3aed"
pnpm test:scripts
pnpm validate:miniapps
pnpm generate:home
pnpm --filter @miniapps/weekly-planner dev
pnpm build:pages
pnpm preview:pages
git add .
git commit -m "Add weekly-planner miniapp"
git push
```
