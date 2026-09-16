import type { Diagram, DiagramEdge, Point, Port } from '../model/types';
import { absolutePosition, ancestors } from '../model/geometry';

export type ConnectionInput = {
  source: string | null | undefined;
  target: string | null | undefined;
  sourceHandle?: string | null | undefined;
  targetHandle?: string | null | undefined;
};

export type RejectionReason = 'missing' | 'self' | 'not-connectable' | 'duplicate' | 'reverse-duplicate';

export const REJECTION_MESSAGES: Record<RejectionReason, string> = {
  missing: 'Arrastra desde un punto de salida hasta un punto de entrada.',
  self: 'Un elemento no puede enlazarse consigo mismo.',
  'not-connectable': 'Solo los JOB y las actuaciones se pueden enlazar.',
  duplicate: 'Ya existe ese enlace.',
  'reverse-duplicate': 'Ya existe el enlace en sentido contrario.',
};

const PORTS: Port[] = ['top', 'right', 'bottom', 'left'];
const CONNECTABLE = ['job', 'action'];

function parsePort(handle: string | null | undefined, prefix: string, fallback: Port): Port {
  const raw = handle?.startsWith(prefix) ? handle.slice(prefix.length) : undefined;
  return (PORTS as string[]).includes(raw ?? '') ? (raw as Port) : fallback;
}

/** Motivo por el que una conexión se rechazaría, o `null` si es válida. */
export function getRejectionReason(doc: Diagram, connection: ConnectionInput): RejectionReason | null {
  const { source, target } = connection;
  if (!source || !target) return 'missing';
  if (source === target) return 'self';
  const nodes = new Map(doc.elements.map((e) => [e.id, e]));
  const sourceEl = nodes.get(source);
  const targetEl = nodes.get(target);
  if (!sourceEl || !targetEl || !CONNECTABLE.includes(sourceEl.kind) || !CONNECTABLE.includes(targetEl.kind)) return 'not-connectable';
  const sourcePort = parsePort(connection.sourceHandle, 'out-', 'bottom');
  const targetPort = parsePort(connection.targetHandle, 'in-', 'top');
  if (doc.edges.some((e) => e.source === source && e.target === target && e.sourcePort === sourcePort && e.targetPort === targetPort)) return 'duplicate';
  if (doc.edges.some((e) => e.source === target && e.target === source)) return 'reverse-duplicate';
  return null;
}

/** Entrada del nodo más cercana a un punto (soltar sobre la caja). */
export function nearestTargetPort(doc: Diagram, targetId: string, point: Point): Port | null {
  const element = doc.elements.find((e) => e.id === targetId);
  if (!element) return null;
  const origin = absolutePosition(doc, element.id);
  const candidates: Array<{ port: Port; x: number; y: number }> = [
    { port: 'top', x: origin.x + element.width / 2, y: origin.y },
    { port: 'right', x: origin.x + element.width, y: origin.y + element.height / 2 },
    { port: 'bottom', x: origin.x + element.width / 2, y: origin.y + element.height },
    { port: 'left', x: origin.x, y: origin.y + element.height / 2 },
  ];
  let best: Port = 'top';
  let bestDistance = Infinity;
  for (const candidate of candidates) {
    const distance = Math.hypot(candidate.x - point.x, candidate.y - point.y);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = candidate.port;
    }
  }
  return best;
}
/** Caja bajo un punto (soltar sobre el lienzo): la más profunda, excluyendo un id. */
export function nodeAtPoint(doc: Diagram, point: Point, excludeId?: string): string | null {
  let best: string | null = null;
  let bestDepth = -1;
  for (const e of doc.elements) {
    if (e.id === excludeId) continue;
    const origin = absolutePosition(doc, e.id);
    const inside = point.x >= origin.x && point.x <= origin.x + e.width && point.y >= origin.y && point.y <= origin.y + e.height;
    if (!inside) continue;
    const depth = ancestors(doc, e.id).length;
    if (depth > bestDepth) {
      bestDepth = depth;
      best = e.id;
    }
  }
  return best;
}
/** Valida una conexión de ReactFlow y construye la arista, o `null` si debe
 *  rechazarse (ver `getRejectionReason` para el motivo). */
export function createEdgeFromConnection(
  doc: Diagram,
  connection: ConnectionInput,
  nextId: () => string,
): DiagramEdge | null {
  if (getRejectionReason(doc, connection) !== null) return null;
  const { source, target } = connection;
  return {
    id: nextId(),
    source: source as string,
    target: target as string,
    sourcePort: parsePort(connection.sourceHandle, 'out-', 'bottom'),
    targetPort: parsePort(connection.targetHandle, 'in-', 'top'),
    routing: 'orthogonal',
    waypoints: [],
    color: '#334155',
    width: 1.5,
  };
}
