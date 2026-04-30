# Modal de configuracion EPUB

Estado: implementada

Resumen: La configuracion EPUB se gestiona desde un dialogo modal con apartados `Libro` y `Estilos`, flujo transaccional con `Guardar` y `Cancelar`, y una accion de configuracion dedicada en la pantalla principal.

Evidencia:
- [src/app/App.tsx](../../../src/app/App.tsx)
- [src/styles/index.css](../../../src/styles/index.css)

## Purpose

Definir la interfaz de configuracion EPUB como un dialogo modal transaccional centrado en la pantalla de conversion.

## Requirements

### Requirement: La configuracion EPUB se abre desde una accion de configuracion dedicada
La aplicacion MUST exponer una accion local de configuracion, con icono y etiqueta visible, solo cuando el modo activo sea `Markdown -> EPUB`.

#### Scenario: Apertura del dialogo de configuracion
- **WHEN** la persona usuaria pulsa la accion de configuracion en modo `Markdown -> EPUB`
- **THEN** la app abre un dialogo modal con las opciones aplicables al modo activo

#### Scenario: Accion oculta cuando no aplica
- **WHEN** el modo activo no es `Markdown -> EPUB`
- **THEN** la app no muestra una accion de configuracion editorial que no tenga efecto sobre la conversion

### Requirement: La pantalla principal prioriza el flujo de edicion y conversion
La aplicacion MUST mantener la pantalla principal centrada en el flujo de entrada, edicion y conversion del modo activo, sin paneles standalone de configuracion.

#### Scenario: Layout principal simplificado
- **WHEN** la persona usuaria visualiza la pantalla principal de conversion
- **THEN** encuentra como flujo principal el selector de conversion, la entrada principal del modo activo, el estado de la conversion y la accion de configuracion solo si aplica
- **AND** ya no ve paneles standalone de metadatos o estilos fuera del dialogo

#### Scenario: Sin resumen de configuracion confirmada
- **WHEN** la persona usuaria visualiza la pantalla principal fuera del dialogo
- **THEN** la app no muestra resumenes persistentes de configuracion editorial confirmada
- **AND** la configuracion modal solo es visible durante su edicion

### Requirement: El dialogo separa configuracion de libro y estilos
La aplicacion MUST seguir agrupando la configuracion EPUB en apartados internos `Libro` y `Estilos` cuando el modo activo sea `Markdown -> EPUB`.

#### Scenario: Apartado Libro
- **WHEN** la persona usuaria navega al apartado `Libro` en modo `Markdown -> EPUB`
- **THEN** puede editar titulo, autor, idioma, TOC, profundidad del TOC, split level y portada desde el dialogo

#### Scenario: Apartado Estilos
- **WHEN** la persona usuaria navega al apartado `Estilos` en modo `Markdown -> EPUB`
- **THEN** puede editar el CSS del EPUB e importar un fichero `.css` dentro del dialogo

### Requirement: El dialogo usa confirmacion explicita de cambios
La aplicacion MUST ofrecer acciones `Guardar` y `Cancelar` en el dialogo de configuracion de `Markdown -> EPUB`.

#### Scenario: Guardar aplica cambios
- **WHEN** la persona usuaria pulsa `Guardar` en el dialogo de `Markdown -> EPUB`
- **THEN** la app aplica al estado activo todos los cambios hechos en el dialogo
- **AND** aplica tambien la portada seleccionada en ese borrador, si existe
- **AND** cierra el dialogo

#### Scenario: Cancelar descarta cambios
- **WHEN** la persona usuaria pulsa `Cancelar` en el dialogo de `Markdown -> EPUB`
- **THEN** la app descarta los cambios no guardados del dialogo
- **AND** restaura la ultima configuracion confirmada para ese modo
- **AND** descarta tambien una portada seleccionada solo dentro del borrador no guardado
- **AND** cierra el dialogo

### Requirement: Cerrar el dialogo sin guardar equivale a cancelar
La aplicacion MUST tratar cualquier cierre no confirmatorio del dialogo de `Markdown -> EPUB` como una cancelacion.

#### Scenario: Cierre por backdrop o Escape
- **WHEN** la persona usuaria cierra el dialogo mediante backdrop, tecla Escape o control de cierre no confirmatorio
- **THEN** la app descarta los cambios no guardados
- **AND** mantiene intacta la configuracion previamente confirmada
