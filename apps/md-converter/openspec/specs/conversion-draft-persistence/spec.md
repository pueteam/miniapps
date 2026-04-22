# Persistencia local del borrador de conversion

Estado: implementada

Resumen: Los campos editables de la conversion se conservan en `localStorage` usando el prefijo `miniapps:md-converter:` para que la persona usuaria pueda retomar su trabajo localmente.

Evidencia:
- [src/app/App.tsx](../../../src/app/App.tsx)
- [src/hooks/useLocalStorage.ts](../../../src/hooks/useLocalStorage.ts)
- [src/lib/constants.ts](../../../src/lib/constants.ts)

Descripcion: La app usa `useLocalStorage` para persistir metadatos, opciones de conversion y contenido editable. El hook inicializa desde `localStorage`, serializa en JSON y tolera errores de lectura.

## Purpose

Definir el contrato de persistencia local del estado editable de `md-converter`.

## Requirements

### Requirement: La app persiste el borrador con un namespace estable
La aplicacion MUST almacenar el estado persistente bajo el prefijo `miniapps:md-converter:`.

#### Scenario: Claves persistidas de la conversion
- **WHEN** la app guarda datos en `localStorage`
- **THEN** usa claves namespaced para `title`, `author`, `lang`, `toc`, `tocDepth`, `splitLevel`, `markdown` y `css`

### Requirement: La primera carga usa valores iniciales utilizables
La aplicacion MUST ofrecer un borrador inicial funcional cuando no existen datos persistidos o no pueden leerse.

#### Scenario: Inicio sin datos previos
- **WHEN** no hay valores guardados para la app
- **THEN** la UI inicializa con titulo, autor, idioma y opciones por defecto
- **AND** precarga un ejemplo de Markdown y otro de CSS para facilitar la primera conversion

#### Scenario: Lectura de storage invalida o inaccesible
- **WHEN** `localStorage` falla o contiene JSON invalido
- **THEN** el hook retorna el valor inicial configurado
- **AND** la app no se bloquea durante el arranque

### Requirement: Los cambios del borrador se guardan automaticamente
La aplicacion MUST escribir el nuevo estado en `localStorage` cuando cambian los campos persistidos.

#### Scenario: Edicion de campos persistentes
- **WHEN** la persona usuaria modifica un campo persistido
- **THEN** el nuevo valor se serializa a JSON y se guarda bajo su clave correspondiente

#### Scenario: Recarga de la app
- **WHEN** la persona usuaria vuelve a abrir o recargar la miniapp
- **THEN** recupera el ultimo borrador persistido para los campos soportados

### Requirement: La importacion de ficheros actualiza el borrador activo
La aplicacion MUST permitir reemplazar el contenido de los editores desde archivos locales de texto.

#### Scenario: Importacion de Markdown
- **WHEN** la persona usuaria selecciona un fichero `.md`, `.markdown` o texto compatible para el editor Markdown
- **THEN** la app lee el contenido textual del fichero
- **AND** reemplaza el valor actual del editor Markdown

#### Scenario: Importacion de CSS
- **WHEN** la persona usuaria selecciona un fichero `.css` o texto compatible para el editor CSS
- **THEN** la app lee el contenido textual del fichero
- **AND** reemplaza el valor actual del editor CSS
