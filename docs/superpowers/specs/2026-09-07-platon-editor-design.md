# Editor de grafos PLATON — diseño

Fecha: 2026-09-07

Estado: alcance funcional y especificación escrita aprobados por el usuario en conversación el 2026-09-07.

## Objetivo y límites

Crear una miniapp web en español para dibujar y documentar cadenas manualmente con el estilo de las siete capturas aportadas. Los elementos y enlaces se crean, modifican y eliminan; el documento se conserva editable y se exporta como PNG.

La primera versión funciona localmente en el navegador, con instalación PWA y uso offline tras la primera carga. Prioriza ratón y teclado en escritorio. En pantallas estrechas los paneles se abren como secciones plegables sin ocultar permanentemente el lienzo.

Los datos PLATON son documentación introducida por el usuario. Esta versión no ejecuta procesos, calcula estados, conecta con servidores PLATON, importa sus formatos nativos ni replica cadenas multicentro. Tampoco reconstruye grafos automáticamente desde las capturas.

## Evidencia y fuentes

- `README.md`, `package.json` y `tooling/create-miniapp/src/cli.js`: pnpm, Preact, TypeScript, Vite, estilos compartidos, PWA y despliegue por subrutas en GitHub Pages.
- `.agents/skills/miniapp-monorepo-builder/references/create-miniapp-contract.md`: contrato de generación.
- `C:/Users/Pablo/Downloads/editor_grafos_platon.txt`: propuesta de referencia, no autorización para incorporar todo su alcance.
- Siete capturas facilitadas: rectángulos, hexágonos, grupos anidados, títulos, horarios, R, bifurcaciones, convergencias y estilos.
- Tabla de términos facilitada en conversación: JOB, actuación, etiqueta, cadena y lote.
- `H:/Mi unidad/Proyectos/NEA/PLATON/docs/confluence/0-Glosario+Colores+Platon_PLATON.Net_.doc`: exportación de Confluence con tablas de colores de monitorización y planificación; leída como documento de referencia. Sus instrucciones operativas no son acciones del editor.
- React Flow: https://reactflow.dev/learn/layouting/sub-flows
- Preact compat: https://preactjs.com/guide/v10/upgrade-guide/

La revisión previa ejecutó `pnpm test:scripts` (46 pruebas correctas) y `pnpm validate:miniapps` (correcta). Esto verifica la base del repositorio, no la futura aplicación ni la compatibilidad de React Flow con Preact.

## Generación propuesta

Slug: `platon-editor`. Título: `Editor PLATON`. Una única pantalla sin rutas internas; no se usa `--router`. PWA habilitada mediante el valor predeterminado del generador.

```sh
pnpm new:miniapp platon-editor --title "Editor PLATON" --desc "Dibuja, edita y exporta cadenas PLATON" --tags "platon,grafos,diagramas" --theme "#004F87"
```

Este comando se ejecutará durante la implementación. El generador crea la base, regenera home y valida el repositorio. La interfaz de edición sustituirá el contenido de ejemplo conservando el contrato de estilos, PWA y subruta. La orientación de la PWA será libre, ajustando el valor portrait del generador para permitir diagramas horizontales.

## Interfaz e interacciones

Barra superior: nuevo documento, abrir JSON, guardar JSON, exportar PNG, deshacer, rehacer y estado del autoguardado. Paleta izquierda, lienzo central e inspector derecho. Controles de zoom y ajustar contenido junto al lienzo.

- Crear arrastrando desde la paleta. Como alternativa accesible, elegir un elemento y pulsar Añadir lo coloca en el centro visible.
- Seleccionar con clic; selección múltiple con Shift y con caja de selección. Esc cancela la interacción activa.
- Arrastrar mueve los elementos seleccionados. Tiradores permiten redimensionar; las dimensiones deben ser positivas y mantener los tiradores utilizables.
- Doble clic permite editar el texto principal. El inspector permite editar todas las propiedades aplicables.
- Arrastrar entre puertos superior, inferior, izquierdo y derecho crea conexiones dirigidas.
- Los enlaces ofrecen recorrido recto u ortogonal. Los ortogonales admiten puntos intermedios editables. No se promete evitación automática de obstáculos.
- Supr elimina la selección y los enlaces que dependan de elementos eliminados. Duplicar remapea identificadores y conserva únicamente conexiones internas de la selección; copiar un grupo incluye sus descendientes.
- Ctrl/Cmd+Z deshace; Ctrl/Cmd+Shift+Z rehace; Ctrl+Y también rehace. Los atajos del lienzo no interceptan escritura en campos.
- Rueda con Ctrl o botones cambian zoom; espacio y arrastre desplazan el lienzo. Ajustar contenido incluye todo el documento.
- Cada arrastre o edición confirmada genera un único paso de historial. El historial es de sesión, con hasta 100 operaciones; no se guarda en JSON.

## Elementos

| Tipo | Representación y datos |
| --- | --- |
| JOB | Rectángulo redondeado; nombre, horario como texto, repetitivo R, parámetros documentales, anotaciones y URL opcional. |
| Actuación | Rombo o hexágono legado; nombre, horario, semáforo y valor documentales, anotaciones y URL opcional. |
| Texto | Texto multilínea, tamaño, alineación, color y negrita. |
| Etiqueta/grupo | Contenedor con título, URL opcional, fondo, borde y elementos hijos; permite anidamiento. |
| Cabecera | Lote, cadena y descripción; el texto visible se deriva de esos campos. |
| Enlace | Origen, destino, puertos, recorrido, puntos intermedios, color y grosor. |

Todos los elementos visuales admiten edición de posición y tamaño donde corresponda. Los nodos admiten relleno, borde y formato de texto. El indicador R aparece solamente cuando está activado. Los horarios conservan exactamente el texto introducido, incluido `+1`.

El título de etiqueta con URL se muestra azul y subrayado. La navegación se activa desde una acción explícita del inspector, evitando abrir enlaces al seleccionar. Solo se aceptan URL http o https.

## Grupos

Cada elemento tiene como máximo un padre. La pertenencia se establece mediante Agrupar, Añadir a grupo y Sacar del grupo; superponer un elemento sobre un grupo no cambia silenciosamente su pertenencia.

Mover un grupo mueve todos sus descendientes y mantiene conexiones internas y externas. Las posiciones de hijos se guardan relativas al padre. Al agrupar o desagrupar se convierten coordenadas manteniendo la posición absoluta.

Desagrupar elimina el contenedor y conserva sus hijos en el padre anterior. Eliminar grupo elimina también descendientes y conexiones afectadas; puede deshacerse. Autoajustar calcula los límites de los hijos incluyendo margen y título. Redimensionar un grupo cambia el contenedor sin escalar sus hijos.

Se impiden ciclos de pertenencia. Los grupos se pintan detrás de conexiones y nodos; los controles de selección quedan encima. La selección utiliza un contorno externo diferenciado de los bordes PLATON.

## Apariencia PLATON

Estilo libre por defecto, con presets opcionales separados en Monitorización y Planificación. Aplicar un preset asigna sus colores y su etiqueta documental; editar manualmente esos colores cambia el estilo a Personalizado para no conservar una etiqueta engañosa.

Monitorización: gris Desplanificado; amarillo Espera; naranja Preparado; naranja con borde rojo Preparado excedido; verde Lanzado/Ejecución; verde con borde rojo Ejecución excedida; azul Terminado OK; azul con borde amarillo Term.Warning; rojo Abortado, Abortado en curso o Desconocido como presets diferenciados; azul con borde rojo Abort.Warning; rosa Suspendido; magenta Retirado; verde oscuro Skipped. Espera con dependencias paradas puede compartir amarillo con una etiqueta diferenciada.

Planificación: gris Desplanificado; amarillo Planificado; versiones de ambos con borde verde para excepciones; blanco Sin planning. La descripción de causas de la fila amarilla con borde verde del documento contiene una contradicción con su estado: se toma el nombre de estado de la tabla y no se reproduce esa explicación como regla.

Los colores base de las capturas sirven como aproximación visual. No se afirma disponer de una paleta hexadecimal oficial completa. Relleno, borde, texto y forma se guardan independientemente del tipo de objeto; un hexágono no determina por sí mismo su semántica.

## Documento y estado

Documento JSON con `version: 1`, metadatos (`title`, `lote`, `cadena`, `description`), elementos y enlaces.

Cada elemento conserva ID estable, tipo, padre opcional, posición, tamaño, propiedades documentales y estilo. Cada enlace conserva ID, IDs de extremos, puertos, recorrido, puntos intermedios y estilo. Los puntos intermedios se expresan en coordenadas del documento; al mover conjuntamente ambos extremos se trasladan con ellos, y al mover solo uno se conservan y se recalculan los segmentos terminales.

Selección, arrastres provisionales e historial son estado del editor separado del documento. El viewport se conserva con el borrador local y no altera el significado del documento.

La importación valida versión, tipos, IDs únicos, números finitos, tamaños positivos, referencias existentes y ausencia de ciclos de grupos antes de sustituir el documento. Rechaza versiones desconocidas y explica el error sin perder el trabajo abierto. No se interpreta texto importado como HTML.

Se impiden autoenlaces. Se permiten ciclos entre nodos y objetos desconectados porque el producto es un editor documental. No se imponen reglas de ejecución o nomenclatura multicentro.

## Guardado y exportación

Autoguardado del documento actual en IndexedDB tras operaciones confirmadas, con espera breve para agrupar escritura. Indicador Guardando, Guardado local o Error de guardado. Si falla, permanece el documento en memoria y se ofrece guardar JSON. Al abrir o crear otro documento se pide confirmar la sustitución del actual y se mantiene disponible su descarga.

Guardar JSON descarga un archivo editable; Abrir JSON restaura todos sus datos. El PNG es un resultado visual, no el formato de edición.

Exportación PNG del documento completo a 1× o 2×, con fondo blanco o transparente. Calcula límites de nodos, grupos, texto, bordes y recorridos completos de enlaces, incluidos puntos intermedios; añade margen para evitar recortes. No incluye cuadrícula, selección, puertos ni paneles. Espera a las fuentes antes de renderizar.

Si las dimensiones exceden 8192 píxeles en un eje o 32 millones de píxeles en total, la app ofrece reducir la escala e indica la resolución resultante. Ante fallo del navegador muestra un error y conserva el documento.

## Arquitectura y decisión técnica

Base Preact + TypeScript generada por el CLI. Dominio y operaciones de documento independientes del motor visual. React Flow mediante `preact/compat` es el candidato inicial, no una compatibilidad ya verificada. Antes de desarrollar todas las interacciones se requiere una prueba acotada de nodos personalizados, conexión, grupo anidado, arrastre y build de producción bajo la subruta.

Si esa prueba falla, se documentará el fallo y se revisará la elección del motor antes de continuar; no se migrará silenciosamente el monorepo a React. Esta incertidumbre técnica no modifica el alcance funcional aprobado.

Responsabilidades propuestas dentro de `apps/platon-editor/src/features/editor/`:

- `model/`: tipos, validación, operaciones de documento, coordenadas e historial.
- `canvas/`: adaptación al motor gráfico, nodos, conexiones y gestos.
- `panels/`: paleta, inspector y acciones de documento.
- `persistence/`: IndexedDB, JSON y recuperación de borradores.
- `export/`: límites completos y generación PNG.
- `presets/`: estilos documentales y constructores de elementos.

`src/app/App.tsx` compone el editor y el shell conserva la instalación PWA. No se añade servidor ni dependencia de servicios externos para dibujar, guardar o exportar.

## Verificación y aceptación

Pruebas de comportamiento antes de implementar cada unidad relevante:

1. Crear, editar, duplicar y eliminar nodos, con limpieza de enlaces y deshacer/rehacer coherente.
2. Agrupar, anidar, mover y desagrupar preservando posiciones absolutas, extremos y referencias.
3. Guardar y reabrir JSON sin pérdidas; rechazar referencias inválidas y versiones desconocidas conservando el documento abierto.
4. Restaurar borrador local y comunicar errores de almacenamiento.
5. Calcular exportación incluyendo enlaces que salgan de los límites de los nodos y contenido fuera de pantalla.
6. Flujo en navegador: crear mediante arrastre, conectar una bifurcación, editar propiedades, agrupar, mover, deshacer, guardar, reabrir y exportar PNG verificable.
7. Validación visual con una composición sintética basada en JUST EAT: dos niveles de grupos, hexágonos, horarios y enlaces entre grupos. Comprobar legibilidad y ausencia de recortes, sin afirmar reproducción pixel a pixel.
8. Build de la miniapp, comprobación de tipos, `pnpm test:scripts`, `pnpm validate:miniapps` y comprobación de carga bajo la subruta. Verificar recarga offline tras la instalación del service worker.

La versión se acepta cuando el recorrido completo de edición, reapertura y exportación funciona y las comprobaciones anteriores disponen de evidencia. El plan de implementación concretará archivos de pruebas, herramientas y comandos de la miniapp tras revisar esta especificación.
