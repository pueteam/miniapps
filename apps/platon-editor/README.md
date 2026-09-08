# Editor PLATON

Miniapp para dibujar y documentar cadenas manualmente. Funciona en el navegador y conserva un borrador local en IndexedDB.

## Uso

- Arrastra JOB, Actuación, Texto, Grupo o Cabecera desde la paleta; también puedes pulsar el botón del elemento.
- Selecciona para editar contenido, colores, forma y dimensiones en Propiedades. Doble clic edita el texto principal.
- Conecta los puertos de JOB y Actuación arrastrando. Selecciona el enlace para cambiar extremos, puertos, recorrido, color, grosor y puntos intermedios.
- Shift permite seleccionar varios elementos. Agrupar crea un contenedor; mover su título desplaza sus hijos. Desagrupar conserva los hijos. Eliminar un grupo elimina sus descendientes y enlaces.
- Usa Ctrl/Cmd+Z para deshacer, Ctrl/Cmd+Shift+Z o Ctrl+Y para rehacer, Supr para eliminar y Ctrl/Cmd+D para duplicar.
- Espacio y arrastre desplaza la vista; Ctrl y rueda cambia el zoom. Ajustar contenido incluye los enlaces y sus puntos intermedios.
- Guarda un JSON para conservar un proyecto editable independiente del borrador local. Abrir JSON lo restaura; un archivo inválido no sustituye el documento abierto.
- Exportar PNG genera el diagrama completo a 1× o 2×, con fondo blanco o transparente. Para imágenes grandes se ofrece una resolución reducida.

La PWA permite recargar sin conexión tras una primera carga completa. El historial de hasta 100 operaciones pertenece a la sesión. Borrar los datos del navegador elimina el borrador; el JSON descargado permite conservarlo.

Los colores son estilos documentales editables. Esta versión no ejecuta procesos ni se conecta al servidor PLATON.

## Desarrollo

Desde la raíz: `pnpm --filter @miniapps/platon-editor dev`. Ruta: `/platon-editor/`.

Comprobaciones: `pnpm --filter @miniapps/platon-editor typecheck`, `pnpm --filter @miniapps/platon-editor test:run`, `pnpm --filter @miniapps/platon-editor e2e` y `pnpm --filter @miniapps/platon-editor build`.

Las pruebas E2E utilizan Chromium y una compilación de producción. Incluyen edición, bifurcación, grupos, JSON, PNG y recarga offline. El despliegue usa la subruta del repositorio cuando se define `VITE_REPO_NAME` o `GITHUB_REPOSITORY`.
