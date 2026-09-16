import type { DiagramEdge, Point } from '../model/types';

/** Añade un punto intermedio a una arista sin mutarla. Ignora el punto si
 *  coincide con el último tramo (evita segmentos de longitud cero). */
export function addWaypointAt(edge: DiagramEdge, point: Point): DiagramEdge {
  const last = edge.waypoints.at(-1);
  if (last && last.x === point.x && last.y === point.y) return edge;
  return { ...edge, waypoints: [...edge.waypoints, { ...point }] };
}
