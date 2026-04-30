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
La aplicacion MUST almacenar el estado persistente bajo el prefijo `miniapps:md-converter:` e incluir el modo de conversion activo dentro de ese namespace.

#### Scenario: Claves persistidas de la conversion
- **WHEN** la app guarda datos en `localStorage`
- **THEN** usa claves namespaced para `conversionMode` y para los borradores/opciones persistentes asociados a la conversion

### Requirement: La primera carga usa valores iniciales utilizables
La aplicacion MUST ofrecer un borrador inicial funcional cuando no existen datos persistidos o no pueden leerse.

#### Scenario: Inicio sin datos previos
- **WHEN** no hay valores guardados para la app
- **THEN** la UI inicializa `Markdown -> EPUB` como modo predeterminado
- **AND** precarga un ejemplo de Markdown y otro de CSS para facilitar la primera conversion compatible con ese modo

#### Scenario: Lectura de storage invalida o inaccesible
- **WHEN** `localStorage` falla o contiene JSON invalido
- **THEN** el hook retorna el valor inicial configurado
- **AND** la app no se bloquea durante el arranque

### Requirement: Los cambios del borrador se guardan automaticamente
La aplicacion MUST persistir los cambios confirmados en `localStorage`, distinguiendo entre edicion inmediata y edicion transaccional dentro del dialogo de configuracion modal cuando aplique.

#### Scenario: Markdown sigue persistiendo de forma inmediata
- **WHEN** la persona usuaria modifica el contenido Markdown en un modo cuya fuente o salida visible sea Markdown
- **THEN** el nuevo valor se serializa a JSON y se guarda bajo su clave correspondiente sin pasar por el dialogo

#### Scenario: La conversion hacia Markdown actualiza el borrador persistible
- **WHEN** una conversion `Word (.docx) -> Markdown`, `EPUB -> Markdown` o `HTML -> Markdown` termina correctamente
- **THEN** la app reemplaza el borrador Markdown activo con el resultado generado
- **AND** ese borrador queda listo para persistirse como texto editable

#### Scenario: Guardar confirma la configuracion modal
- **WHEN** la persona usuaria pulsa `Guardar` en el dialogo de configuracion de `Markdown -> EPUB`
- **THEN** la app persiste los valores confirmados asociados al modo activo
- **AND** esos valores pasan a ser la configuracion activa de la conversion

#### Scenario: Cancelar no persiste la configuracion modal
- **WHEN** la persona usuaria cierra el dialogo de configuracion de `Markdown -> EPUB` con `Cancelar` o un cierre no confirmatorio
- **THEN** la app no escribe en `localStorage` los cambios no guardados del dialogo
- **AND** conserva los ultimos valores confirmados del modo activo

### Requirement: La importacion de ficheros actualiza el borrador activo
La aplicacion MUST aplicar las importaciones de archivos segun el modo de conversion activo y sin persistir binarios completos en `localStorage`.

#### Scenario: Importacion de Markdown
- **WHEN** la persona usuaria selecciona un fichero `.md`, `.markdown` o texto compatible en un modo `Markdown -> X`
- **THEN** la app lee el contenido textual del fichero
- **AND** reemplaza y persiste el valor actual del editor Markdown

#### Scenario: Importacion de archivo hacia Markdown
- **WHEN** la persona usuaria selecciona un fichero compatible para `Word (.docx) -> Markdown`, `EPUB -> Markdown` o `HTML -> Markdown`
- **THEN** la app actualiza la fuente activa de esa conversion
- **AND** no intenta persistir en `localStorage` el contenido binario completo del fichero importado

#### Scenario: Archivo incompatible no altera el borrador persistido
- **WHEN** la persona usuaria intenta importar un archivo incompatible con el modo activo
- **THEN** la app no reemplaza el borrador Markdown ni la fuente activa vigente
- **AND** no escribe nuevos valores persistidos a causa de ese intento fallido

#### Scenario: Importacion de CSS dentro del dialogo
- **WHEN** la persona usuaria selecciona un fichero `.css` o texto compatible para el editor CSS dentro del dialogo de configuracion EPUB
- **THEN** la app actualiza solo el borrador temporal del CSS
- **AND** ese cambio no se persiste ni se usa como configuracion activa hasta pulsar `Guardar`
