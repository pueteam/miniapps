import type { Diagram, DiagramElement, DiagramEdge, Point, Style, ElementData } from './types';
type Obj = Record<string, unknown>;
function fail(message: string): never { throw new Error(`Documento inválido: ${message}`); }
function obj(v: unknown): Obj { if (!v || typeof v !== 'object' || Array.isArray(v)) fail('se esperaba un objeto'); return v as Obj; }
function str(v: unknown): string { if (typeof v !== 'string') fail('se esperaba texto'); return v; }
function id(v: unknown): string { const s = str(v); if (!s.trim()) fail('identificador vacío'); return s; }
function num(v: unknown, min = -Infinity, strict = false): number { if (typeof v !== 'number' || !Number.isFinite(v) || (strict ? v <= min : v < min)) fail('número fuera de rango'); return v; }
function bool(v: unknown): boolean { if (typeof v !== 'boolean') fail('se esperaba booleano'); return v; }
function list(v: unknown): unknown[] { if (!Array.isArray(v)) fail('se esperaba una lista'); return v; }
function choice<T extends string>(v: unknown, choices: readonly T[]): T { if (typeof v !== 'string' || !choices.includes(v as T)) fail('opción desconocida'); return v as T; }
function point(v: unknown): Point { const o = obj(v); return { x: num(o.x), y: num(o.y) }; }
function color(v: unknown, transparent = false): string { const s = str(v); if (!(transparent && s === 'transparent') && !/^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(s)) fail('color no admitido'); return s; }
function data(v: unknown): ElementData {
  const o = obj(v); const url = str(o.url);
  if (url) { let parsed: URL; try { parsed = new URL(url); } catch { fail('URL no válida'); } if (!['http:', 'https:'].includes(parsed!.protocol)) fail('solo se permiten URL http o https'); }
  return { name: str(o.name), schedule: str(o.schedule), repetitive: bool(o.repetitive), parameters: list(o.parameters).map(str), annotations: str(o.annotations), url, semaphore: str(o.semaphore), value: str(o.value), text: str(o.text), lote: str(o.lote), cadena: str(o.cadena), description: str(o.description) };
}
function style(v: unknown): Style {
  const o = obj(v); return { fill: color(o.fill, true), stroke: color(o.stroke), strokeWidth: num(o.strokeWidth, 0), color: color(o.color), fontSize: num(o.fontSize, 0, true), bold: bool(o.bold), align: choice(o.align, ['left', 'center', 'right']), shape: choice(o.shape, ['rectangle', 'diamond', 'hexagon']), radius: num(o.radius, 0), ...(o.presetId === undefined ? {} : { presetId: id(o.presetId) }) };
}
function element(v: unknown): DiagramElement {
  const o = obj(v); return { id: id(o.id), kind: choice(o.kind, ['job', 'action', 'text', 'group', 'header']), ...(o.parentId === undefined ? {} : { parentId: id(o.parentId) }), position: point(o.position), width: num(o.width, 0, true), height: num(o.height, 0, true), data: data(o.data), style: style(o.style) };
}
function edge(v: unknown): DiagramEdge {
  const o = obj(v); return { id: id(o.id), source: id(o.source), target: id(o.target), sourcePort: choice(o.sourcePort, ['top', 'right', 'bottom', 'left']), targetPort: choice(o.targetPort, ['top', 'right', 'bottom', 'left']), routing: choice(o.routing, ['straight', 'orthogonal']), waypoints: list(o.waypoints).map(point), color: color(o.color), width: num(o.width, 0, true) };
}
export function validateDiagram(value: unknown): Diagram {
  const o = obj(value); if (o.version !== 1) fail('versión no compatible'); const m = obj(o.metadata);
  const d: Diagram = { version: 1, metadata: { title: str(m.title), lote: str(m.lote), cadena: str(m.cadena), description: str(m.description) }, elements: list(o.elements).map(element), edges: list(o.edges).map(edge) };
  const ids = new Set<string>(); for (const item of [...d.elements, ...d.edges]) { if (ids.has(item.id)) fail('identificador duplicado'); ids.add(item.id); }
  const nodes = new Map(d.elements.map(n => [n.id, n]));
  for (const node of d.elements) {
    const seen = new Set([node.id]); let parentId = node.parentId;
    while (parentId !== undefined) { const parent = nodes.get(parentId); if (!parent || parent.kind !== 'group') fail('padre inexistente o no es grupo'); if (seen.has(parentId)) fail('ciclo de pertenencia'); seen.add(parentId); parentId = parent.parentId; }
  }
  for (const e of d.edges) { if (e.source === e.target) fail('autoenlace'); for (const endpoint of [e.source, e.target]) { const n = nodes.get(endpoint); if (!n || !['job', 'action'].includes(n.kind)) fail('extremo inexistente o no conectable'); } }
  return d;
}
export function parseDiagram(raw: string): Diagram { let value: unknown; try { value = JSON.parse(raw); } catch { fail('JSON mal formado'); } return validateDiagram(value); }
export function serializeDiagram(doc: Diagram): string { return JSON.stringify(validateDiagram(doc), null, 2); }
