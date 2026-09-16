import type { Diagram, DiagramEdge, Port } from '../model/types';

export type ConnectionInput = {
  source: string | null | undefined;
  target: string | null | undefined;
  sourceHandle?: string | null | undefined;
  targetHandle?: string | null | undefined;
};

const PORTS: Port[] = ['top', 'right', 'bottom', 'left'];

function parsePort(handle: string | null | undefined, prefix: string, fallback: Port): Port {
  const raw = handle?.startsWith(prefix) ? handle.slice(prefix.length) : undefined;
  return (PORTS as string[]).includes(raw ?? '') ? (raw as Port) : fallback;
}

/** Valida una conexión de ReactFlow y construye la arista, o `null` si debe
 *  rechazarse (autoenlace, extremo no conectable o arista duplicada). */
export function createEdgeFromConnection(
  doc: Diagram,
  connection: ConnectionInput,
  nextId: () => string,
): DiagramEdge | null {
  const { source, target } = connection;
  if (!source || !target || source === target) return null;
  const sourceEl = doc.elements.find((e) => e.id === source);
  const targetEl = doc.elements.find((e) => e.id === target);
  if (!sourceEl || !targetEl) return null;
  if (!['job', 'action'].includes(sourceEl.kind) || !['job', 'action'].includes(targetEl.kind)) return null;
  const sourcePort = parsePort(connection.sourceHandle, 'out-', 'bottom');
  const targetPort = parsePort(connection.targetHandle, 'in-', 'top');
  if (doc.edges.some((e) => e.source === source && e.target === target && e.sourcePort === sourcePort && e.targetPort === targetPort)) return null;
  return { id: nextId(), source, target, sourcePort, targetPort, routing: 'orthogonal', waypoints: [], color: '#334155', width: 1.5 };
}
