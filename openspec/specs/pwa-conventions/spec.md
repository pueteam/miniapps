# Plantillas y convenciones PWA

Estado: implementada

Resumen: Convenciones de PWA y routing para miniapps. Las apps PWA incluyen `vite-plugin-pwa`, manifest e iconos; las apps no PWA evitan esa huella. Las apps con router incluyen `404.html` para GitHub Pages.

Evidencia:
- [tooling/create-miniapp/src/cli.js](tooling/create-miniapp/src/cli.js)
- [tooling/create-miniapp/static/pwa-192.png](tooling/create-miniapp/static/pwa-192.png)
- [apps/home/public/pwa-192.png](apps/home/public/pwa-192.png)

Descripción: El scaffold genera manifest e iconos solo cuando `pwa=true`, y crea `404.html` para soportar SPA en GitHub Pages cuando `router=true`.

## Purpose

Definir comportamiento de PWA y routing SPA derivado de flags de intención de producto.

## Requirements

### Requirement: PWA flag expresses product intent
The `pwa` setting in `app.config.json` and related scaffold flags MUST represent product intent. Generated files, dependencies, validation rules, and generated UI MUST be coherent with whether the miniapp is intended to be a PWA: apps with `pwa: true` SHALL include a shell-level install entry point, apps with `pwa: false` SHALL NOT.

#### Scenario: PWA-enabled app gets PWA assets and config
- **WHEN** a miniapp is scaffolded with `pwa: true`
- **THEN** the generated app includes the PWA-related assets and configuration required by the repository contract

#### Scenario: Non-PWA app avoids unnecessary PWA footprint
- **WHEN** a miniapp is scaffolded with `pwa: false`
- **THEN** the generated app omits PWA-specific files, dependencies, or configuration that are not needed for the non-PWA contract

#### Scenario: PWA-enabled app exposes shell install entry point
- **WHEN** a miniapp is scaffolded with `pwa: true`
- **THEN** AppShell includes a render point for install action that appears only when the install prompt is available

### Requirement: Router flag keeps GitHub Pages behavior coherent
When router support is enabled, the scaffold and validation MUST generate and require the artifacts needed for GitHub Pages SPA routing. When router support is disabled, those artifacts MUST NOT be generated or required.

#### Scenario: Router-enabled app requires redirect artifact
- **WHEN** a miniapp is scaffolded or validated with `router: true`
- **THEN** the GitHub Pages redirect artifact required by the contract is present

#### Scenario: Router-disabled app stays free of router-only artifacts
- **WHEN** a miniapp is scaffolded or validated with `router: false`
- **THEN** router-only artifacts are absent and not required

### Requirement: PWA icons are generated for PWA-enabled apps
The scaffold MUST generate PWA icons when `pwa: true`.

#### Scenario: Icon files are created
- **WHEN** a miniapp is scaffolded with `pwa: true`
- **THEN** icon files (192.png, 512.png) are generated in the public folder

#### Scenario: No icons for non-PWA apps
- **WHEN** a miniapp is scaffolded with `pwa: false`
- **THEN** no PWA icon files are generated