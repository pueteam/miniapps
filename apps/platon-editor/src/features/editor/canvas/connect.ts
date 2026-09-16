import type { Diagram, DiagramEdge, Port } from '../model/types';

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
