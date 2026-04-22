# Shell PWA instalable

Estado: implementada

Resumen: La miniapp se publica como PWA sin router, registra `sw.js`, expone una accion de instalacion desde `AppShell` y configura manifest, iconos y screenshots mediante `vite-plugin-pwa`.

Evidencia:
- [src/app/App.tsx](../../../src/app/App.tsx)
- [src/app/registerSW.ts](../../../src/app/registerSW.ts)
- [src/components/AppShell.tsx](../../../src/components/AppShell.tsx)
- [src/components/InstallButton.tsx](../../../src/components/InstallButton.tsx)
- [vite.config.ts](../../../vite.config.ts)
- [app.config.json](../../../app.config.json)

Descripcion: El shell registra el service worker una sola vez al iniciar, escucha los eventos de instalacion PWA del navegador y renderiza el boton `Instalar` solo cuando la instalacion es posible y aun no se ha completado.

## Purpose

Definir el contrato de shell e instalabilidad PWA para `md-converter`.

## Requirements

### Requirement: La app registra service worker al iniciar
La aplicacion MUST intentar registrar `sw.js` cuando el navegador soporte `serviceWorker`.

#### Scenario: Registro diferido al evento load
- **WHEN** la app arranca en un navegador con soporte de `serviceWorker`
- **THEN** registra `${import.meta.env.BASE_URL}sw.js`
- **AND** usa `${import.meta.env.BASE_URL}` como `scope`

#### Scenario: El registro se realiza una sola vez
- **WHEN** `registerSW()` es invocado multiples veces durante la vida de la app
- **THEN** la suscripcion a eventos y el intento de registro solo se ejecutan una vez

### Requirement: El shell expone la instalacion solo en el contexto adecuado
La aplicacion MUST renderizar la accion de instalacion desde `AppShell` y solo cuando el navegador ha ofrecido instalacion PWA.

#### Scenario: Boton oculto mientras no exista prompt de instalacion
- **WHEN** aun no se ha recibido `beforeinstallprompt`
- **THEN** `InstallButton` no renderiza ningun control interactivo

#### Scenario: Boton oculto tras instalar la app
- **WHEN** el navegador emite `appinstalled`
- **THEN** el estado de instalacion se marca como completo
- **AND** `InstallButton` deja de renderizarse

#### Scenario: La accion de instalar vive en el shell
- **WHEN** se renderiza la cabecera principal de la miniapp
- **THEN** `AppShell` incluye `InstallButton` junto al titulo y descripcion del producto

### Requirement: La accion de instalar usa el flujo nativo del navegador
La aplicacion MUST conservar el evento `beforeinstallprompt` y usar su metodo `prompt()` al recibir una accion explicita de la persona usuaria.

#### Scenario: Captura del evento de instalacion diferida
- **WHEN** el navegador emite `beforeinstallprompt`
- **THEN** la app cancela el comportamiento por defecto
- **AND** conserva el evento para uso posterior
- **AND** notifica a los suscriptores del estado de instalacion

#### Scenario: Click en instalar abre el prompt nativo
- **WHEN** la persona usuaria pulsa el boton `Instalar`
- **THEN** la app invoca `prompt()` sobre el evento almacenado
- **AND** limpia el prompt retenido cuando el navegador resuelve `userChoice`

### Requirement: La miniapp se describe como PWA standalone
La build MUST emitir metadata PWA coherente con `app.config.json`.

#### Scenario: Manifest usa metadata del producto
- **WHEN** Vite genera el manifest PWA
- **THEN** usa `title`, `description`, `themeColor` y `backgroundColor` de `app.config.json`
- **AND** configura `display: standalone`, `orientation: portrait` y categoria `utilities`

#### Scenario: Manifest incluye assets visuales de instalacion
- **WHEN** la app se construye como PWA
- **THEN** el manifest incluye iconos `192x192`, `512x512`, `maskable 512x512`
- **AND** expone screenshots desktop y mobile
