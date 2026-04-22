# Conversion local de Markdown a EPUB

Estado: implementada

Resumen: La app convierte contenido Markdown a un archivo `EPUB3` enteramente en el navegador usando `pandoc.wasm`, ejecutado dentro de un `Web Worker`, con metadatos YAML, CSS embebido y portada opcional.

Evidencia:
- [src/app/App.tsx](../../../src/app/App.tsx)
- [src/lib/workerClient.ts](../../../src/lib/workerClient.ts)
- [src/workers/pandoc.worker.ts](../../../src/workers/pandoc.worker.ts)
- [src/lib/pandocRunner.ts](../../../src/lib/pandocRunner.ts)
- [src/lib/epubMetadata.ts](../../../src/lib/epubMetadata.ts)
- [src/lib/download.ts](../../../src/lib/download.ts)

Descripcion: La UI recopila metadatos, Markdown, CSS y portada; luego delega la conversion a un worker que ejecuta `pandoc` sobre un filesystem virtual WASI y retorna los bytes del EPUB para su descarga local.

## Purpose

Definir el contrato funcional de la conversion EPUB que hoy ofrece `md-converter`.

## Requirements

### Requirement: La conversion EPUB ocurre localmente en el navegador
La aplicacion MUST ejecutar la conversion Markdown -> EPUB sin depender de un backend remoto.

#### Scenario: La solicitud de conversion se delega a un worker
- **WHEN** la persona usuaria pulsa `Convertir y descargar EPUB`
- **THEN** la app envia un trabajo al `Web Worker`
- **AND** la ejecucion de `pandoc.wasm` ocurre fuera del hilo principal

#### Scenario: El binario de pandoc se carga desde el propio proyecto
- **WHEN** el worker necesita ejecutar la conversion
- **THEN** `pandoc.wasm` se carga desde `${import.meta.env.BASE_URL}pandoc.wasm`
- **AND** si el binario no esta disponible la app falla con un error legible

### Requirement: La conversion acepta el conjunto actual de entradas editoriales
La aplicacion MUST construir el EPUB usando Markdown, CSS, metadatos YAML y una portada opcional.

#### Scenario: Los metadatos se serializan como YAML
- **WHEN** existen valores para `title`, `author` o `lang`
- **THEN** la app genera `metadata.yaml` con un bloque YAML valido
- **AND** solo incluye los campos no vacios

#### Scenario: La portada es opcional
- **WHEN** la persona usuaria selecciona un fichero de imagen como portada
- **THEN** ese fichero se monta en el filesystem virtual
- **AND** la invocacion de `pandoc` incluye `--epub-cover-image=<nombre-saneado>`

#### Scenario: El CSS personalizado se empaqueta en el EPUB
- **WHEN** se ejecuta la conversion
- **THEN** el contenido del editor CSS se escribe como `epub.css`
- **AND** la invocacion de `pandoc` incluye `--css=epub.css`

### Requirement: La conversion controla TOC y fragmentacion dentro de rangos seguros
La aplicacion MUST permitir configurar `toc`, `tocDepth` y `splitLevel` dentro del rango soportado actualmente.

#### Scenario: TOC opcional
- **WHEN** `toc` esta activado
- **THEN** la invocacion de `pandoc` incluye `--toc`

#### Scenario: Profundidad y split se acotan entre 1 y 6
- **WHEN** la persona usuaria introduce valores fuera de rango para `tocDepth` o `splitLevel`
- **THEN** la app acota esos valores al rango `1..6` antes de invocar `pandoc`

### Requirement: El resultado exitoso se descarga como EPUB nombrado desde el titulo
La aplicacion MUST descargar el archivo generado localmente cuando la conversion termina correctamente.

#### Scenario: Descarga del EPUB generado
- **WHEN** `pandoc` devuelve bytes validos para `book.epub`
- **THEN** la app crea un `Blob` con MIME `application/epub+zip`
- **AND** descarga el archivo con nombre `<slug-del-titulo>.epub`
- **AND** usa `book.epub` si el titulo no produce slug

#### Scenario: El estado de exito queda reflejado en la UI
- **WHEN** la conversion termina correctamente
- **THEN** la UI cambia a estado `success`
- **AND** muestra logs del proceso o un mensaje de exito por defecto

### Requirement: Los fallos de conversion se comunican en la UI
La aplicacion MUST propagar errores del worker o de `pandoc` a la interfaz de conversion.

#### Scenario: Error de pandoc o del worker
- **WHEN** el worker responde con error o `pandoc` finaliza sin generar `book.epub`
- **THEN** la app muestra un mensaje de error legible
- **AND** cambia el estado visual a `error`
- **AND** no intenta descargar ningun archivo
