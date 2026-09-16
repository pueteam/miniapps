import type { Diagram, DiagramElement, DiagramEdge, Point, Style, ElementData } from './types';

export type DiagramErrorCode =
  | 'bad-json' | 'bad-version' | 'bad-type' | 'out-of-range' | 'unknown-option'
  | 'empty-id' | 'bad-color' | 'bad-url' | 'duplicate-id' | 'bad-parent'
  | 'cycle' | 'self-link' | 'bad-endpoint' | 'too-large';

export class DiagramError extends Error {
  code: DiagramErrorCode;
  path?: string;
  elementId?: string;
  constructor(message: string, code: DiagramErrorCode, path?: string, elementId?: string) {
    super(`Documento inválido: ${message}${path ? ` (${path})` : ''}`);
    this.name = 'DiagramError';
    this.code = code;
    if (path !== undefined) this.path = path;
    if (elementId !== undefined) this.elementId = elementId;
  }
}

export const MAX_TEXT = 5000;
export const MAX_ELEMENTS = 5000;
export const MAX_EDGES = 5000;
export const MAX_LIST_ITEMS = 500;

type Obj = Record<string, unknown>;
function fail(message: string, code: DiagramErrorCode = 'bad-type', path?: string, elementId?: string): never {
  throw new DiagramError(message, code, path, elementId);
}
function obj(v: unknown, path?: string): Obj { if (!v || typeof v !== 'object' || Array.isArray(v)) fail('se esperaba un objeto', 'bad-type', path); return v as Obj; }
function str(v: unknown, path?: string): string {
  if (typeof v !== 'string') fail('se esperaba texto', 'bad-type', path);
  if ((v as string).length > MAX_TEXT) fail(`texto demasiado largo (máx ${MAX_TEXT})`, 'too-large', path);
  return v as string;
}
function id(v: unknown, path?: string): string { const s = str(v, path); if (!s.trim()) fail('identificador vacío', 'empty-id', path); return s; }
function num(v: unknown, min = -Infinity, strict = false, path?: string): number { if (typeof v !== 'number' || !Number.isFinite(v) || (strict ? v <= min : v < min)) fail('número fuera de rango', 'out-of-range', path); return v; }
function bool(v: unknown, path?: string): boolean { if (typeof v !== 'boolean') fail('se esperaba booleano', 'bad-type', path); return v; }
function list(v: unknown, max: number, path?: string): unknown[] {
  if (!Array.isArray(v)) fail('se esperaba una lista', 'bad-type', path);
  if ((v as unknown[]).length > max) fail(`lista demasiado larga (máx ${max})`, 'too-large', path);
  return v as unknown[];
}
function choice<T extends string>(v: unknown, choices: readonly T[], path?: string): T { if (typeof v !== 'string' || !choices.includes(v as T)) fail('opción desconocida', 'unknown-option', path); return v as T; }
function point(v: unknown, path?: string): Point { const o = obj(v, path); return { x: num(o.x, -Infinity, false, path ? `${path}.x` : undefined), y: num(o.y, -Infinity, false, path ? `${path}.y` : undefined) }; }
function color(v: unknown, transparent = false, path?: string): string { const s = str(v, path); if (!(transparent && s === 'transparent') && !/^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(s)) fail('color no admitido', 'bad-color', path); return s; }
function isHttpUrl(v: string): boolean { try { return ['http:', 'https:'].includes(new URL(v).protocol); } catch { return false; } }
function data(v: unknown, path?: string): ElementData {
  const o = obj(v, path); const at = (key: string) => (path ? `${path}.${key}` : undefined);
  const url = str(o.url, at('url'));
  if (url && !isHttpUrl(url)) fail('solo se permiten URL http o https', 'bad-url', at('url'));
  return { name: str(o.name, at('name')), schedule: str(o.schedule, at('schedule')), repetitive: bool(o.repetitive, at('repetitive')), parameters: list(o.parameters, MAX_LIST_ITEMS, at('parameters')).map((p) => str(p, at('parameters'))), annotations: str(o.annotations, at('annotations')), url, semaphore: str(o.semaphore, at('semaphore')), value: str(o.value, at('value')), text: str(o.text, at('text')), lote: str(o.lote, at('lote')), cadena: str(o.cadena, at('cadena')), description: str(o.description, at('description')) };
}
function style(v: unknown, path?: string): Style {
  const o = obj(v, path); const at = (key: string) => (path ? `${path}.${key}` : undefined);
  return { fill: color(o.fill, true, at('fill')), stroke: color(o.stroke, false, at('stroke')), strokeWidth: num(o.strokeWidth, 0, false, at('strokeWidth')), color: color(o.color, false, at('color')), fontSize: num(o.fontSize, 0, true, at('fontSize')), bold: bool(o.bold, at('bold')), align: choice(o.align, ['left', 'center', 'right'], at('align')), shape: choice(o.shape, ['rectangle', 'diamond', 'hexagon'], at('shape')), radius: num(o.radius, 0, false, at('radius')), ...(o.presetId === undefined ? {} : { presetId: id(o.presetId, at('presetId')) }) };
}
function element(v: unknown, index: number): DiagramElement {
  const path = `elements[${index}]`; const o = obj(v, path);
  return { id: id(o.id, `${path}.id`), kind: choice(o.kind, ['job', 'action', 'text', 'group', 'header'], `${path}.kind`), ...(o.parentId === undefined ? {} : { parentId: id(o.parentId, `${path}.parentId`) }), position: point(o.position, `${path}.position`), width: num(o.width, 0, true, `${path}.width`), height: num(o.height, 0, true, `${path}.height`), data: data(o.data, `${path}.data`), style: style(o.style, `${path}.style`) };
}
function edge(v: unknown, index: number): DiagramEdge {
  const path = `edges[${index}]`; const o = obj(v, path);
  return { id: id(o.id, `${path}.id`), source: id(o.source, `${path}.source`), target: id(o.target, `${path}.target`), sourcePort: choice(o.sourcePort, ['top', 'right', 'bottom', 'left'], `${path}.sourcePort`), targetPort: choice(o.targetPort, ['top', 'right', 'bottom', 'left'], `${path}.targetPort`), routing: choice(o.routing, ['straight', 'orthogonal'], `${path}.routing`), waypoints: list(o.waypoints, MAX_LIST_ITEMS, `${path}.waypoints`).map((p, i) => point(p, `${path}.waypoints[${i}]`)), color: color(o.color, false, `${path}.color`), width: num(o.width, 0, true, `${path}.width`) };
}
export function validateDiagram(value: unknown): Diagram {
  const o = obj(value); if (o.version !== 1) fail('versión no compatible', 'bad-version', 'version');
  const m = obj(o.metadata, 'metadata');
  const atMeta = (key: string) => `metadata.${key}`;
  const d: Diagram = { version: 1, metadata: { title: str(m.title, atMeta('title')), lote: str(m.lote, atMeta('lote')), cadena: str(m.cadena, atMeta('cadena')), description: str(m.description, atMeta('description')) }, elements: list(o.elements, MAX_ELEMENTS, 'elements').map(element), edges: list(o.edges, MAX_EDGES, 'edges').map(edge) };
  const ids = new Map<string, { path: string; elementId: string }>();
  d.elements.forEach((item, i) => {
    const seen = ids.get(item.id);
    if (seen) fail('identificador duplicado', 'duplicate-id', `elements[${i}].id`, item.id);
    ids.set(item.id, { path: `elements[${i}].id`, elementId: item.id });
  });
  d.edges.forEach((item, i) => {
    const seen = ids.get(item.id);
    if (seen) fail('identificador duplicado', 'duplicate-id', `edges[${i}].id`, item.id);
    ids.set(item.id, { path: `edges[${i}].id`, elementId: item.id });
  });
  const nodes = new Map(d.elements.map(n => [n.id, n]));
  d.elements.forEach((node, i) => {
    const seen = new Set([node.id]); let parentId = node.parentId;
    while (parentId !== undefined) { const parent = nodes.get(parentId); if (!parent || parent.kind !== 'group') fail('padre inexistente o no es grupo', 'bad-parent', `elements[${i}].parentId`, node.id); if (seen.has(parentId)) fail('ciclo de pertenencia', 'cycle', `elements[${i}].parentId`, node.id); seen.add(parentId); parentId = parent.parentId; }
  });
  d.edges.forEach((e, i) => {
    if (e.source === e.target) fail('autoenlace', 'self-link', `edges[${i}].id`, e.id);
    const source = nodes.get(e.source); const target = nodes.get(e.target);
    if (!source || !['job', 'action'].includes(source.kind)) fail('extremo inexistente o no conectable', 'bad-endpoint', `edges[${i}].source`, e.id);
    if (!target || !['job', 'action'].includes(target.kind)) fail('extremo inexistente o no conectable', 'bad-endpoint', `edges[${i}].target`, e.id);
  });
  return d;
}
export function parseDiagram(raw: string): Diagram { let value: unknown; try { value = JSON.parse(raw); } catch { fail('JSON mal formado', 'bad-json'); } return validateDiagram(value); }
export function serializeDiagram(doc: Diagram): string { return JSON.stringify(validateDiagram(doc), null, 2); }
