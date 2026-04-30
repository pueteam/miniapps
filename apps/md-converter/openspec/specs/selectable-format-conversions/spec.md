# Conversiones seleccionables por formato

Estado: implementada

Resumen: La app permite elegir entre seis conversiones cerradas alrededor de Markdown, adaptando la entrada principal, la visibilidad de la configuracion y el archivo descargado segun el modo activo.

Evidencia:
- [src/lib/conversionModes.ts](../../../src/lib/conversionModes.ts)
- [src/app/App.tsx](../../../src/app/App.tsx)
- [src/lib/pandocRunner.ts](../../../src/lib/pandocRunner.ts)
- [src/lib/workerClient.ts](../../../src/lib/workerClient.ts)
- [src/workers/pandoc.worker.ts](../../../src/workers/pandoc.worker.ts)

## Purpose

Definir el contrato funcional del selector de conversion y de los flujos de entrada/salida asociados a cada modo soportado.

## Requirements

### Requirement: La app permite seleccionar una conversion entre seis modos cerrados
La aplicacion MUST ofrecer un selector explicito de conversion con exactamente estos modos: `Word (.docx) -> Markdown`, `EPUB -> Markdown`, `HTML -> Markdown`, `Markdown -> Word (.docx)`, `Markdown -> EPUB` y `Markdown -> HTML`.

#### Scenario: Modo predeterminado
- **WHEN** la persona usuaria abre la app por primera vez o no tiene un modo persistido
- **THEN** la app selecciona `Markdown -> EPUB` como modo activo inicial

#### Scenario: Seleccion acotada
- **WHEN** la persona usuaria abre el control de conversion
- **THEN** solo puede elegir uno de los seis modos soportados
- **AND** la app no expone combinaciones arbitrarias de formato de entrada y salida

### Requirement: La entrada principal se adapta al modo de conversion activo
La aplicacion MUST cambiar la entrada principal visible segun el modo de conversion seleccionado.

#### Scenario: Importacion para modos hacia Markdown
- **WHEN** el modo activo es `Word (.docx) -> Markdown`, `EPUB -> Markdown` o `HTML -> Markdown`
- **THEN** la app muestra una entrada principal para importar un archivo compatible con ese modo
- **AND** la seleccion del archivo reemplaza la fuente activa de la conversion

#### Scenario: Tipos de archivo compatibles por modo
- **WHEN** la persona usuaria intenta importar un archivo en la entrada principal
- **THEN** el modo `Word (.docx) -> Markdown` acepta `.docx`
- **AND** el modo `EPUB -> Markdown` acepta `.epub`
- **AND** el modo `HTML -> Markdown` acepta `.html` o `.htm`
- **AND** los modos `Markdown -> Word (.docx)`, `Markdown -> EPUB` y `Markdown -> HTML` aceptan `.md` o `.markdown` como importacion opcional

#### Scenario: Archivo incompatible
- **WHEN** la persona usuaria selecciona un archivo no compatible con el modo activo
- **THEN** la app rechaza ese archivo con un mensaje legible
- **AND** conserva intacta la fuente activa previa

#### Scenario: Editor para modos desde Markdown
- **WHEN** el modo activo es `Markdown -> Word (.docx)`, `Markdown -> EPUB` o `Markdown -> HTML`
- **THEN** la app muestra el editor Markdown como fuente principal
- **AND** permite importar un fichero `.md` para reemplazar su contenido

#### Scenario: Sin entrada binaria principal en modos desde Markdown
- **WHEN** el modo activo es `Markdown -> Word (.docx)`, `Markdown -> EPUB` o `Markdown -> HTML`
- **THEN** la app no sustituye el editor por una entrada binaria obligatoria
- **AND** mantiene el Markdown como fuente principal de la conversion

### Requirement: Las conversiones hacia Markdown producen un borrador editable y descargable
La aplicacion MUST convertir localmente el archivo importado a Markdown y exponer ese resultado en el flujo principal.

#### Scenario: Resultado editable
- **WHEN** la conversion `Word (.docx) -> Markdown`, `EPUB -> Markdown` o `HTML -> Markdown` termina correctamente
- **THEN** la app muestra el Markdown resultante en el editor principal
- **AND** permite descargar ese resultado como archivo `.md`

#### Scenario: El borrador convertido pasa a ser editable
- **WHEN** la app muestra el Markdown resultante de una conversion hacia Markdown
- **THEN** la persona usuaria puede editar ese contenido antes de descargarlo
- **AND** ese contenido se convierte en el borrador Markdown activo de la sesion

#### Scenario: Nombre de salida Markdown
- **WHEN** la app descarga el resultado de una conversion hacia Markdown
- **THEN** usa extension `.md`
- **AND** deriva el nombre desde el archivo fuente o un fallback legible

### Requirement: Las conversiones desde Markdown descargan el formato seleccionado
La aplicacion MUST generar y descargar un archivo cuyo formato corresponda al modo activo cuando la fuente es Markdown.

#### Scenario: Descarga DOCX
- **WHEN** el modo activo es `Markdown -> Word (.docx)` y la conversion termina correctamente
- **THEN** la app descarga un archivo `.docx`

#### Scenario: Descarga EPUB
- **WHEN** el modo activo es `Markdown -> EPUB` y la conversion termina correctamente
- **THEN** la app descarga un archivo `.epub`

#### Scenario: Descarga HTML
- **WHEN** el modo activo es `Markdown -> HTML` y la conversion termina correctamente
- **THEN** la app descarga un archivo `.html`
