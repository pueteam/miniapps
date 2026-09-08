# Editor PLATON Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Crear una miniapp que permita dibujar, editar, conservar y exportar cadenas manuales de estilo PLATON.

**Architecture:** Documento y operaciones puras independientes del motor gráfico; Preact para composición, React Flow mediante compatibilidad como candidato sujeto a una prueba inicial. IndexedDB conserva el borrador y JSON el proyecto portable; una escena de exportación comparte representación y geometría con el editor.

**Tech Stack:** pnpm, Preact, TypeScript, Vite, vite-plugin-pwa; candidato @xyflow/react 12; Dexie 4; Vitest 4, Testing Library Preact, fake-indexeddb y Playwright. Las versiones efectivas se fijan en el lockfile al instalar y verificar la compatibilidad.

**Spec:** `docs/superpowers/specs/2026-09-07-platon-editor-design.md` (aprobada).

## Cierre de implementación — 2026-09-08

Las tareas funcionales 1–8 están implementadas en `apps/platon-editor`. La lista de pasos inferior conserva el plan original; la ejecución se consolidó en una entrega, sin los commits intermedios propuestos. `Editor.tsx` concentra estado y barra de herramientas; `FlowCanvas.tsx` contiene los adaptadores, nodos y enlaces, sin crear archivos vacíos para imitar la estructura propuesta.

Verificación: 42 pruebas unitarias, 7 E2E Chromium bajo `/miniapps/platon-editor/`, comprobación TypeScript, 46 pruebas de scripts, validación de miniapps y compilación global `build:pages` correctas. PNG y capturas de escritorio/móvil revisados. Los E2E cubren edición, bifurcación, movimiento de grupo con deshacer, JSON, PNG, archivo inválido, recuperación del borrador y recarga offline.

La sonda inicial fue retirada tras trasladar sus interacciones a la interfaz real. El fallo de los tests de autoguardado procedía de fixtures recreados en cada render; se corrigieron los fixtures. Las pruebas de navegador detectaron y permitieron corregir bucles de selección y actualización del viewport. Guía de uso y evidencia: `apps/platon-editor/README.md` y `apps/platon-editor/docs/`.

## Global Constraints

- Slug: `platon-editor`. Título: `Editor PLATON`.
- Una única pantalla sin rutas internas; no se usa `--router`.
- PWA habilitada mediante el valor predeterminado del generador.
- Documento JSON con `version: 1`.
- El historial es de sesión, con hasta 100 operaciones; no se guarda en JSON.
- Solo se aceptan URL http o https.
- Exportación PNG del documento completo a 1× o 2×, con fondo blanco o transparente.
- Si las dimensiones exceden 8192 píxeles en un eje o 32 millones de píxeles en total, la app ofrece reducir la escala e indica la resolución resultante.
- No se añade servidor ni dependencia de servicios externos para dibujar, guardar o exportar.
- No se migrará silenciosamente el monorepo a React.
- Todos los textos de producto, incluidos errores y etiquetas accesibles, estarán en español.
- Conservar estilos compartidos, instalación PWA, subruta del generador y cambios ajenos del repositorio.

## Contexto verificado y límites de este plan

Se inspeccionaron el generador y las dependencias de sticky-board y planning-board. Sticky-board dispone de Vitest, Testing Library Preact, fake-indexeddb, Dexie y Playwright; su configuración E2E arranca un build servido por preview. Se adopta ese patrón sin modificar sus archivos.

Al escribir el plan, la prueba base del repositorio pasó 46 tests y la validación estructural. La exportación se verificó posteriormente mediante un PNG real; véase el cierre de implementación anterior.

Referencias oficiales consultadas: [grupos](https://reactflow.dev/learn/layouting/sub-flows), [exportación de imagen](https://reactflow.dev/examples/misc/download-image), [configuración Preact](https://preactjs.com/guide/v10/getting-started/). Son referencias de APIs; no prueban la compatibilidad de esta combinación en el proyecto.

## Organización y ejecución

Las tareas son secuenciales: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8. Elegir ejecución en esta sesión o con subagentes al entregar el plan. Si se ejecuta con subagentes, asignar una tarea completa por agente y revisar su resultado antes de la siguiente; no repartir archivos que comparten estado simultáneamente.

Al comenzar, revisar instrucciones locales, `git status --short` y la skill using-git-worktrees si se necesita aislamiento. El archivo `.claude/settings.local.json` preexistente queda fuera de los commits. No publicar ni hacer push como parte del plan.

Para descubrir código, usar primero el grafo MCP de `miniapps`; consultar archivos directamente para configuración o si el índice no incluye resultados. Todos los comandos siguientes parten de la raíz del checkout, salvo indicación contraria.

## Contrato de archivos e interfaces

`E` en las tablas siguientes significa `apps/platon-editor/src/features/editor`; expandirlo al crear archivos. Los snippets de prueba son casos iniciales ejecutables, no sustituyen las variantes indicadas en cada tarea.

| Archivo | Responsabilidad |
| --- | --- |
| `E/model/types.ts` | Contrato del documento, geometría y selección. |
| `E/model/document.ts`, `validation.ts` | Construcción y lectura validada de documentos. |
| `E/model/operations.ts`, `groups.ts`, `geometry.ts` | Mutaciones inmutables y coordenadas. |
| `E/model/history.ts`, `useEditor.ts` | Historial transaccional y estado de sesión. |
| `E/presets/catalog.ts`, `elements.ts` | Estilos y valores iniciales de elementos. |
| `E/canvas/FlowCanvas.tsx`, `flowAdapter.ts` | Adaptación de eventos y documento al motor. |
| `E/canvas/ElementView.tsx`, `PlatonNode.tsx`, `PlatonEdge.tsx` | Apariencia compartida, puertos y enlaces. |
| `E/canvas/routes.ts`, `gestures.ts` | Recorridos y gestos de edición. |
| `E/panels/Palette.tsx`, `Inspector.tsx`, `Toolbar.tsx`, `ExportDialog.tsx` | Controles del usuario. |
| `E/persistence/db.ts`, `files.ts`, `useAutosave.ts` | IndexedDB, descargas y autoguardado. |
| `E/export/bounds.ts`, `ExportScene.tsx`, `png.ts` | Límites, escena completa y rasterización. |
| `E/Editor.tsx`, `editor.css` | Composición y distribución adaptable. |
| `apps/platon-editor/e2e/*.spec.ts` | Pruebas del navegador sobre build de producción. |

Tipos que deben existir al terminar la tarea 2:

```ts
export type Point = { x: number; y: number };
export type Kind = 'job' | 'action' | 'text' | 'group' | 'header';
export type Port = 'top' | 'right' | 'bottom' | 'left';
export type Style = {
  fill: string; stroke: string; strokeWidth: number; color: string;
  fontSize: number; bold: boolean; align: 'left' | 'center' | 'right';
  shape: 'rectangle' | 'diamond' | 'hexagon'; radius: number;
  presetId?: string;
};
export type ElementData = {
  name: string; schedule: string; repetitive: boolean;
  parameters: string[]; annotations: string; url: string;
  semaphore: string; value: string; text: string;
  lote: string; cadena: string; description: string;
};
export type DiagramElement = {
  id: string; kind: Kind; parentId?: string; position: Point;
  width: number; height: number; data: ElementData; style: Style;
};
export type DiagramEdge = {
  id: string; source: string; target: string;
  sourcePort: Port; targetPort: Port;
  routing: 'straight' | 'orthogonal'; waypoints: Point[];
  color: string; width: number;
};
export type Diagram = {
  version: 1;
  metadata: { title: string; lote: string; cadena: string; description: string };
  elements: DiagramElement[]; edges: DiagramEdge[];
};
export type Selection = { elementIds: string[]; edgeIds: string[] };
export type Viewport = { x: number; y: number; zoom: number };
```

Las propiedades no aplicables al tipo permanecen con sus valores vacíos iniciales y no se muestran en el inspector. El JSON se construye desde el modelo, sin serializar nodos internos de React Flow.

## Tarea 1: base y prueba de compatibilidad del motor

**Archivos:** generar `apps/platon-editor/`; crear `vitest.config.ts`, `playwright.config.ts`, `src/test/setup.ts`, `e2e/compat.spec.ts`, `src/features/editor/canvas/CompatibilityProbe.tsx` y `docs/compatibility.md` dentro de esa app. Modificar `package.json`, `vite.config.ts`, `tsconfig.json` y `src/app/App.tsx` generados. Revisar el cambio automático en el catálogo de home.

**Consume:** contrato del CLI. **Produce:** build Preact+React Flow comprobado y comandos locales `test:run`, `typecheck`, `e2e`.

- [ ] Generar la app, instalar dependencias y configurar pruebas como parte de esta tarea:

```sh
pnpm new:miniapp platon-editor --title "Editor PLATON" --desc "Dibuja, edita y exporta cadenas PLATON" --tags "platon,grafos,diagramas" --theme "#004F87"
pnpm --filter @miniapps/platon-editor add @xyflow/react@12 dexie@4
pnpm --filter @miniapps/platon-editor add -D vitest@4 @testing-library/preact@3 fake-indexeddb@6 jsdom@29 @playwright/test@1 @types/node
```

Conservar las dependencias base generadas. Inspeccionar los peers instalados antes de añadir aliases o tipos: mantener un único runtime Preact. El preset Vite ya configura compatibilidad; no añadir React como segundo runtime para silenciar errores.

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import preact from '@preact/preset-vite';
export default defineConfig({
  plugins: [preact()],
  test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'] },
});
// src/test/setup.ts
import 'fake-indexeddb/auto';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/preact';
afterEach(cleanup);
```

Añadir scripts `test:run: "vitest run"`, `typecheck: "tsc --noEmit"`, `e2e: "playwright test"`. Configurar Playwright con `testDir: './e2e'`, Chromium desktop, baseURL `http://127.0.0.1:4178/platon-editor/`, webServer `pnpm build && pnpm preview --host 127.0.0.1 --port 4178`, timeout 120000. Fijar `VITE_REPO_NAME: ''` y `GITHUB_REPOSITORY: ''` en el entorno del servidor para esa prueba; probar la subruta de repositorio explícitamente en tarea 8. Cambiar orientación del manifest a `any`.

- [ ] Escribir prueba de navegador antes del componente:

```ts
import { test, expect } from '@playwright/test';
test('arrastra un grupo y conserva al hijo', async ({ page }) => {
  await page.goto('./');
  const group = page.getByTestId('probe-group-handle');
  const child = page.getByTestId('probe-job');
  const before = await child.boundingBox();
  const handle = await group.boundingBox();
  if (!before || !handle) throw new Error('Faltan nodos de prueba');
  await page.mouse.move(handle.x + 10, handle.y + 10);
  await page.mouse.down();
  await page.mouse.move(handle.x + 70, handle.y + 50, { steps: 8 });
  await page.mouse.up();
  await expect.poll(async () => (await child.boundingBox())!.x)
    .toBeGreaterThan(before.x + 40);
});
```

- [ ] Ejecutar `pnpm --filter @miniapps/platon-editor e2e -- compat.spec.ts`: debe fallar por ausencia de los nodos. Si falta Chromium, instalarlo con el CLI Playwright del paquete y repetir.
- [ ] Construir `CompatibilityProbe` con `ReactFlowProvider`, `ReactFlow`, dos grupos anidados y dos nodos personalizados con `Handle`; uno externo al grupo. Usar `parentId`, padre antes que hijo, y título como drag handle. Añadir prueba de arrastre entre puertos y comprobar que el enlace existe y acompaña el movimiento.

```tsx
import { ReactFlow, ReactFlowProvider, Handle, Position,
  useNodesState, useEdgesState, addEdge, type Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
function ProbeJob({ id }: { id: string }) {
  return <div data-testid={id === 'a' ? 'probe-job' : 'probe-external'}
    style={{ width: 100, height: 60, background: '#ffff00' }}>
    <Handle type="target" position={Position.Top} />{id}
    <Handle type="source" position={Position.Bottom} />
  </div>;
}
function ProbeGroup({ id }: { id: string }) {
  return <div className="probe-title"
    data-testid={id === 'g' ? 'probe-group-handle' : 'probe-inner-handle'}>
    Grupo {id}
  </div>;
}
const nodeTypes = { job: ProbeJob, group: ProbeGroup };
const initialNodes: Node[] = [
  { id: 'g', type: 'group', position: { x: 40, y: 40 }, data: {},
    dragHandle: '.probe-title', style: { width: 300, height: 300 } },
  { id: 'h', type: 'group', parentId: 'g', position: { x: 30, y: 50 }, data: {},
    dragHandle: '.probe-title', style: { width: 220, height: 180 } },
  { id: 'a', type: 'job', parentId: 'h', position: { x: 30, y: 50 }, data: {} },
  { id: 'b', type: 'job', position: { x: 420, y: 380 }, data: {} },
];
export function CompatibilityProbe() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  return <ReactFlowProvider><div style={{ height: 600 }}>
    <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes}
      onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
      onConnect={connection => setEdges(current => addEdge(connection, current))} />
  </div></ReactFlowProvider>;
}
```

- [ ] Ejecutar typecheck, build y ambas pruebas E2E. Registrar versiones y resultado en `docs/compatibility.md`. Si falla compatibilidad después de diagnosticar aliases y tipos, detener tareas dependientes y revisar la elección del motor conforme a la especificación; no declarar el candidato validado por compilar solamente.
- [ ] Commit de la base y prueba: `feat(platon-editor): verify graph engine compatibility`. Seleccionar rutas de la app, lockfile y archivo de catálogo realmente modificado; no usar `git add .`.

## Tarea 2: documento portable y validación

**Archivos:** `E/model/types.ts`, `document.ts`, `validation.ts`, `document.test.ts`; `E/presets/elements.ts`.

**Consume:** tipos del contrato anterior. **Produce:** `emptyDiagram(): Diagram`, `createElement(kind: Kind, id: string, position: Point): DiagramElement`, `parseDiagram(raw: string): Diagram`, `serializeDiagram(doc: Diagram): string`. Los IDs se proporcionan desde la UI con `crypto.randomUUID()`.

- [ ] Escribir primero este caso y variantes para referencias colgantes, tamaños no finitos, IDs duplicados, URL no admitida y ciclos de padre:

```ts
import { expect, it } from 'vitest';
import { emptyDiagram } from './document';
import { parseDiagram, serializeDiagram } from './validation';
import { createElement } from '../presets/elements';
it('conserva horario y apariencia al reabrir', () => {
  const doc = emptyDiagram();
  const node = createElement('action', 'a', { x: -80, y: 40 });
  node.data.schedule = '21:00-20:00+1';
  node.style.shape = 'hexagon';
  doc.elements.push(node);
  expect(parseDiagram(serializeDiagram(doc))).toEqual(doc);
  expect(() => parseDiagram('{"version":2}')).toThrow();
});
```

- [ ] Ejecutar `pnpm --filter @miniapps/platon-editor test:run -- src/features/editor/model/document.test.ts`; comprobar fallo antes de la implementación.
- [ ] Implementar tipos, defaults y validación explícita de todos los campos. La entrada se trata como `unknown`; construir valores validados, sin `JSON.parse(...) as Diagram`. Validar extremos sobre JOB/actuación, parentId sobre grupo y enums de puertos/estilos. Limitar colores a hexadecimal o transparent en relleno; URL vacía es válida.

```ts
export function emptyDiagram(): Diagram {
  return { version: 1, metadata: { title: 'Nueva cadena', lote: '',
    cadena: '', description: '' }, elements: [], edges: [] };
}
// Después de validar estructura y referencias:
export function serializeDiagram(doc: Diagram): string {
  return JSON.stringify(doc, null, 2);
}
```

- [ ] Verificar los casos y typecheck. Commit: `feat(platon-editor): define editable document format`.

## Tarea 3: operaciones, grupos e historial

**Archivos:** `E/model/operations.ts`, `groups.ts`, `geometry.ts`, `history.ts` y pruebas contiguas.

**Consume:** Diagram, Selection, Point y constructores. **Produce:**

```ts
// Todas devuelven un nuevo documento y no mutan el de entrada.
deleteSelection(doc: Diagram, selection: Selection): Diagram;
duplicateSelection(doc: Diagram, ids: string[], nextId: () => string): Diagram;
moveElements(doc: Diagram, ids: string[], delta: Point): Diagram;
patchElement(doc: Diagram, id: string, patch: Partial<Omit<DiagramElement, 'id' | 'kind'>>): Diagram;
groupElements(doc: Diagram, ids: string[], groupId: string): Diagram;
reparentElements(doc: Diagram, ids: string[], parentId?: string): Diagram;
ungroup(doc: Diagram, groupId: string): Diagram;
fitGroup(doc: Diagram, groupId: string): Diagram;
absolutePosition(doc: Diagram, id: string): Point;
type History = { past: Diagram[]; present: Diagram; future: Diagram[] };
startHistory(doc: Diagram): History;
commitHistory(history: History, doc: Diagram): History;
undo(history: History): History;
redo(history: History): History;
```

- [ ] Escribir pruebas de eliminar con enlaces, duplicación de subárbol sin enlaces externos, mover padre e hijo seleccionados sin doble desplazamiento, pertenencia cíclica y agrupación/desagrupación:

```ts
import { it, expect } from 'vitest';
import { emptyDiagram } from './document';
import { createElement } from '../presets/elements';
import { groupElements, ungroup } from './groups';
import { absolutePosition } from './geometry';
it('agrupar y desagrupar conserva coordenadas', () => {
  const doc = emptyDiagram();
  doc.elements = [createElement('job', 'a', { x: 120, y: 180 })];
  const grouped = groupElements(doc, ['a'], 'g');
  expect(absolutePosition(grouped, 'a')).toEqual({ x: 120, y: 180 });
  expect(absolutePosition(ungroup(grouped, 'g'), 'a'))
    .toEqual({ x: 120, y: 180 });
});
```

- [ ] Ejecutar las pruebas de model y comprobar fallos de las operaciones aún ausentes.
- [ ] Implementar recorrido de ancestros y descendientes con detección de ciclos. En selección con padre e hijo, mover solo las raíces seleccionadas; calcular desplazamiento absoluto de extremos antes de trasladar waypoints. Agrupar en el ancestro común más cercano, margen 24 y espacio de título 32. Autoajustar reubica hijos conservando sus posiciones absolutas.

```ts
export function commitHistory(h: History, doc: Diagram): History {
  if (JSON.stringify(h.present) === JSON.stringify(doc)) return h;
  return { past: [...h.past, h.present].slice(-100), present: doc, future: [] };
}
export function undo(h: History): History {
  const previous = h.past.at(-1);
  return previous ? { past: h.past.slice(0, -1), present: previous,
    future: [h.present, ...h.future] } : h;
}
```

Para redo invertir esa transición; nueva edición borra future. Rechazar referencias inválidas desde operaciones sin modificar el documento. Redimensionar grupo modifica solo el contenedor.
- [ ] Verificar 101 commits limitados a 100, undo/redo y una transacción por gesto. Commit: `feat(platon-editor): add graph editing operations`.

## Tarea 4: lienzo interactivo y conexiones editables

**Archivos:** `E/canvas/FlowCanvas.tsx`, `flowAdapter.ts`, `ElementView.tsx`, `PlatonNode.tsx`, `PlatonEdge.tsx`, `routes.ts`, `gestures.ts`; `E/model/useEditor.ts`; `e2e/canvas.spec.ts`; `E/canvas/routes.test.ts`.

**Consume:** documento y operaciones de tareas 2–3. **Produce:** `FlowCanvas({doc, selection, viewport, onCommit, onSelection, onViewport})`; `routeEdge(doc: Diagram, edge: DiagramEdge): Point[]`; `ElementView({element: DiagramElement})` sin puertos ni selección para reutilizar al exportar.

- [ ] Añadir pruebas unitarias de recorrido y E2E: crear un JOB desde paleta provisional, conectarlo, arrastrar nodo y comprobar que el path cambia; deshacer recupera posición original. Probar grupo con hijo y enlace externo.

```ts
// Caso para routes.test.ts usando emptyDiagram y createElement de tarea 2.
const doc = emptyDiagram();
doc.elements = [createElement('job', 'a', { x: 0, y: 0 }),
  createElement('job', 'b', { x: 300, y: 200 })];
const edge: DiagramEdge = { id: 'e', source: 'a', target: 'b',
  sourcePort: 'bottom', targetPort: 'top', routing: 'orthogonal',
  waypoints: [{ x: 500, y: 100 }], color: '#000000', width: 1 };
const route = routeEdge(doc, edge);
expect(route).toContainEqual({ x: 500, y: 100 });
expect(route.slice(1).every((p, i) => p.x === route[i].x || p.y === route[i].y)).toBe(true);
```

- [ ] Ejecutar `test:run -- src/features/editor/canvas/routes.test.ts` y `e2e -- canvas.spec.ts`; observar fallos relevantes.
- [ ] Adaptar documento a nodos con parentId, tamaños explícitos y orden padre-hijo. Dibujar formas con SVG y texto mediante un componente compartido; no aplicar clip-path a todo el nodo porque recortaría puertos/bordes. Conservar texto dentro del área con salto de línea y dimensiones mínimas.

```ts
// En flowAdapter.ts: preservar datos de negocio fuera de estado XYFlow.
const flowNode = { id: element.id, type: 'platon',
  parentId: element.parentId, position: element.position,
  style: { width: element.width, height: element.height },
  data: { element } };
```

Configurar puertos fuente/destino, conectar solo JOB/actuación, selección Shift/caja, zoom Ctrl y pan espacio. Anular borrado automático del motor para usar deleteSelection. Mantener un borrador de arrastre; publicar onCommit solo al terminar; Esc descarta borrador. Aplicar el mismo patrón a resize e inspector.

Implementar routeEdge con puntos absolutos de puertos y segmentos terminales horizontales/verticales; insertar codos entre waypoints diagonales. PlatonEdge muestra tiradores editables en waypoints cuando está seleccionado, permite añadir uno por acción del inspector y eliminarlo. Guardar puntos manuales, no codos calculados. Los enlaces rectos usan solo extremos.
- [ ] Verificar selección múltiple, resize, conexión, edición de waypoints, movimiento con zoom y undo. Sustituir la sonda por FlowCanvas y portar compat.spec a la UI real, eliminando CompatibilityProbe una vez preservados sus casos. Commit: `feat(platon-editor): implement interactive graph canvas`.

## Tarea 5: interfaz de edición y estilos PLATON

**Archivos:** `E/Editor.tsx`, `editor.css`; `E/panels/Palette.tsx`, `Inspector.tsx`, `Toolbar.tsx`; `E/presets/catalog.ts`; `E/panels/Inspector.test.tsx`; `src/app/App.tsx`, `src/components/AppShell.tsx`, `src/styles/index.css`.

**Consume:** FlowCanvas, ElementView y operaciones. **Produce:** editor completo con paleta/inspector, estilos y atajos; `applyPreset(element: DiagramElement, presetId: string): DiagramElement`; `setManualStyle(element: DiagramElement, patch: Partial<Style>): DiagramElement`.

- [ ] Crear prueba de edición de horario que preserve `+1`, R y cambio de preset a Personalizado. Añadir prueba de atajos que no borren un nodo al pulsar Supr dentro de un campo.

```ts
import { it, expect } from 'vitest';
import { createElement } from './elements';
import { applyPreset, setManualStyle } from './catalog';
it('separa estado documental de color personalizado', () => {
  const node = applyPreset(createElement('job', 'a', { x: 0, y: 0 }), 'monitor-abort-warning');
  expect(node.style.fill).toBe('#0000ff');
  expect(node.style.stroke).toBe('#ff0000');
  expect(setManualStyle(node, { fill: '#ffffff' }).style.presetId).toBeUndefined();
});
```

Guardar este caso en `E/presets/catalog.test.ts` y la prueba de formulario en Inspector.test.tsx.
- [ ] Ejecutar ambos archivos y verificar fallos antes de crear presets y controles.
- [ ] Implementar catálogo completo de la especificación; azules #0000ff, amarillos #ffff00, grises #c8c8c8, naranja #ffa500, verde #00ff00, rojo #ff0000, rosa #ffc0cb, magenta #ff00ff, verde oscuro #008000. Son valores visuales elegidos, no paleta oficial. Usar blanco como texto sobre azul/verde oscuro/rojo, negro sobre tonos claros, dejando edición libre.

```ts
export function setManualStyle(element: DiagramElement, patch: Partial<Style>): DiagramElement {
  const style = { ...element.style, ...patch };
  delete style.presetId;
  return { ...element, style };
}
```

Implementar todos los campos de la tabla de elementos, URLs explícitas, fuente y alineación, cabecera editable, acciones agrupar/desagrupar/añadir/sacar/autoajustar y duplicar. Entrada de paleta por drag y botón Añadir; coordenadas transformadas a viewport. Doble clic usa edición del nombre/texto y confirma en Enter o blur, cancelable con Esc.

Layout con grid `240px minmax(0, 1fr) 300px`, lienzo con altura disponible y paneles scrollables. Bajo 900px utilizar paneles plegables; controles accesibles por nombre y foco visible. Conservar import de base.css y tokens generados. Separar visualmente selección (contorno discontinuo exterior) de bordes de estado.
- [ ] Verificar tipo por tipo, presets, grupos, atajos y paneles a 1440×900 y 390×844. Commit: `feat(platon-editor): add editing panels and PLATON styles`.

## Tarea 6: conservación local y archivos editables

**Archivos:** `E/persistence/db.ts`, `files.ts`, `useAutosave.ts`, `db.test.ts`; `E/panels/Toolbar.tsx`; `E/Editor.tsx`; `e2e/persistence.spec.ts`.

**Consume:** parseDiagram, serializeDiagram, viewport e historial. **Produce:** `saveDraft(doc: Diagram, viewport: Viewport): Promise<void>`, `loadDraft(): Promise<{doc: Diagram; viewport: Viewport} | null>`, `downloadJson(doc: Diagram): void`. UI muestra estado de guardado sin exponer claves o nombres técnicos.

- [ ] Escribir prueba de roundtrip local con fake-indexeddb y error de escritura simulado. E2E debe abrir JSON válido y rechazar inválido sin sustituir la cadena visible.

```ts
import { it, expect } from 'vitest';
import { emptyDiagram } from '../model/document';
import { saveDraft, loadDraft } from './db';
it('recupera el borrador y su viewport', async () => {
  const doc = emptyDiagram();
  doc.metadata.title = 'Cadena de prueba';
  const viewport = { x: 30, y: -20, zoom: 0.75 };
  await saveDraft(doc, viewport);
  expect(await loadDraft()).toEqual({ doc, viewport });
});
```

- [ ] Ejecutar `test:run -- src/features/editor/persistence/db.test.ts` antes de implementar.
- [ ] Crear Dexie con nombre `miniapps:platon-editor`, tabla `drafts` con clave `id`, registro actual `current`. Guardar copia serializable; validar documento recuperado antes de mostrarlo. No iniciar autoguardado hasta terminar hidratación para evitar sobrescribir el borrador con uno vacío.

```ts
import Dexie from 'dexie';
export const db = new Dexie('miniapps:platon-editor');
db.version(1).stores({ drafts: 'id' });
// En saveDraft, almacenar doc validado y viewport finito:
await db.table('drafts').put({ id: 'current', doc, viewport });
```

Autoguardar 300 ms después de un commit, serializando escrituras para que la más antigua no termine sobre la nueva. Mostrar Guardando/Guardado local/Error de guardado. Abrir archivo valida primero y luego solicita reemplazo; cancelar conserva historial y contenido. Nuevo documento también solicita reemplazo; la descarga actual sigue disponible. Al confirmar apertura, reiniciar historial y selección. Limpiar temporizadores y URL de descarga al terminar.
- [ ] Verificar recarga, error IndexedDB, cancelar reemplazo y conservar datos de grupos/enlaces. Commit: `feat(platon-editor): persist and reopen diagrams`.

## Tarea 7: PNG completo verificable

**Archivos:** `E/export/bounds.ts`, `ExportScene.tsx`, `png.ts`, `bounds.test.ts`; `E/panels/ExportDialog.tsx`; `e2e/export.spec.ts`; posible dependencia app-local para rasterización.

**Consume:** absolutePosition, routeEdge, ElementView y documento. **Produce:**

```ts
type Bounds = { x: number; y: number; width: number; height: number };
type ExportOptions = { scale: 1 | 2; background: 'white' | 'transparent' };
diagramBounds(doc: Diagram): Bounds;
safeExportScale(bounds: Bounds, requested: number): number;
exportPng(doc: Diagram, options: ExportOptions, scaleOverride?: number): Promise<Blob>;
```

- [ ] Escribir tests de límites negativos, grupos y waypoints fuera de nodos. Prueba inicial:

```ts
import { it, expect } from 'vitest';
import { safeExportScale } from './bounds';
it('respeta límites de dimensión y área', () => {
  const bounds = { x: -100, y: 0, width: 10000, height: 10000 };
  const scale = safeExportScale(bounds, 2);
  expect(bounds.width * scale).toBeLessThanOrEqual(8192);
  expect(bounds.width * bounds.height * scale * scale).toBeLessThanOrEqual(32000000);
});
```

- [ ] Ejecutar `test:run -- src/features/editor/export/bounds.test.ts` y comprobar fallo.
- [ ] Calcular límites incluyendo grosor, puntas de flecha, texto medido y margen 24. Documento vacío exporta área blanca/transparente de 640×480. Compartir geometría/texto con el lienzo para evitar divergencias.

```ts
export function safeExportScale(b: Bounds, requested: number): number {
  return Math.min(requested, 8192 / b.width, 8192 / b.height,
    Math.sqrt(32000000 / (b.width * b.height)));
}
```

Montar ExportScene fuera del viewport visible, pero no con display:none; renderizar todos los elementos sin virtualización, con dimensiones de exportación explícitas. Grupos y conexiones en capas inferiores, elementos superiores. Esperar document.fonts.ready y layout. Instalar `pnpm --filter @miniapps/platon-editor add --save-exact html-to-image@1.11.11`: es la versión fijada en el ejemplo oficial consultado, que advierte problemas en versiones posteriores. Su idoneidad para nuestra escena se verifica con los PNG de esta tarea. No capturar la pantalla actual ni cambiar su zoom para exportar.

```ts
import { toBlob } from 'html-to-image';
// sceneRoot es el HTMLElement montado por ExportScene; scale ya está validada.
const blob = await toBlob(sceneRoot, {
  pixelRatio: scale,
  backgroundColor: options.background === 'white' ? '#ffffff' : undefined,
});
if (!blob) throw new Error('No se pudo generar el PNG');
```

Ocultar controles por construcción de escena, no por mutaciones sobre el editor vivo. Resolver Blob PNG, revocar URLs y desmontar escena en finally. Si safeExportScale reduce la escala, el diálogo presenta resolución y botón Exportar a esta resolución antes de llamar con scaleOverride. Los errores se muestran en el diálogo y conservan documento.
- [ ] E2E descarga PNG a 1×/2× con ambos fondos, decodifica imagen y comprueba dimensiones y transparencia; revisar visualmente composición con contenido fuera de pantalla y waypoints exteriores. No basta verificar nombre o tamaño de archivo. Commit: `feat(platon-editor): export complete diagrams as PNG`.

## Tarea 8: aceptación integrada y entrega

**Archivos:** `e2e/editor.spec.ts`, `e2e/offline.spec.ts`, `e2e/fixtures/nested-chain.json`, `apps/platon-editor/README.md`; ajustes limitados a fallos encontrados en la app.

**Consume:** aplicación completa. **Produce:** evidencia de flujo aceptado, limitaciones reales y documentación de uso.

- [ ] Crear fixture sintética con dos niveles de grupos, JOB azul, JOB amarillo, actuación hexagonal, horario `21:00-20:00+1`, R y conexión a nodo externo. No copiar datos de producción como plantilla distribuida.
- [ ] Añadir prueba de navegación de extremo a extremo con arrastre real de paleta y puertos, edición, agrupación, deshacer y reapertura. Añadir prueba offline sobre preview de producción:

```ts
import { test, expect } from '@playwright/test';
test('recarga sin red tras quedar controlada por la PWA', async ({ page, context }) => {
  await page.goto('./');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>(resolve => navigator.serviceWorker.addEventListener(
        'controllerchange', () => resolve(), { once: true }));
    }
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Añadir JOB', exact: true })).toBeVisible();
  await context.setOffline(false);
});
```

La paleta de tarea 5 debe exponer ese nombre accesible. La prueba debe usar un contexto limpio para evitar reutilizar service workers de otro build.
- [ ] Ejecutar las pruebas integradas antes de corregir los fallos que descubran. Documentar causa y aplicar correcciones mínimas; no reescribir unidades que ya cumplen.
- [ ] Ejecutar la validación final:

```sh
pnpm --filter @miniapps/platon-editor test:run
pnpm --filter @miniapps/platon-editor typecheck
pnpm --filter @miniapps/platon-editor e2e
pnpm test:scripts
pnpm validate:miniapps
pnpm build:pages
```

Comprobar además build local con `VITE_REPO_NAME=miniapps`, servido en `/miniapps/platon-editor/`, sin errores de recursos. En PowerShell usar `$env:VITE_REPO_NAME='miniapps'` y restaurar el valor anterior al terminar. Inspeccionar imágenes exportadas y capturas a 1440×900 y 390×844. Registrar fallos ajenos sin atribuirlos a esta miniapp.
- [ ] Escribir README con creación, selección, grupos, JSON, PNG, recuperación local, uso offline y límites del motor. Eliminar cualquier sonda temporal restante y comprobar que exportación no incluye selección.
- [ ] Commit: `test(platon-editor): verify editing persistence and export`. Entregar resumen de comportamiento, comandos y resultados reales, enlace a la app local y limitaciones pendientes. No afirmar compatibilidad, offline o fidelidad visual sin sus comprobaciones.

## Revisión de cobertura del plan

| Requisito de la especificación | Tareas |
| --- | --- |
| Generación oficial, PWA, subruta, orientación | 1, 8 |
| Modelo independiente y JSON versionado validado | 2, 6 |
| Crear, editar, eliminar, duplicar, historial | 3, 4, 5 |
| Grupos anidados y enlaces al moverlos | 3, 4 |
| Drag, puertos, selección, pan, zoom, resize, waypoints | 4 |
| Campos documentales, estilos y presets separados | 2, 5 |
| URLs explícitas, texto seguro y atajos en formularios | 2, 5 |
| Autoguardado, reapertura y errores sin pérdida | 6 |
| PNG completo, escalas, fondos y límites | 7 |
| Paneles adaptables y funcionamiento offline | 5, 8 |
| Criterio integrado y comprobación visual | 8 |

Revisión realizada: cada requisito tiene tareas asignadas; los nombres de tipos e interfaces se mantienen entre tareas. La compatibilidad del motor y la librería de rasterización son verificaciones explícitas de ejecución, no resultados asumidos. Este plan no registra pruebas nuevas como superadas.
