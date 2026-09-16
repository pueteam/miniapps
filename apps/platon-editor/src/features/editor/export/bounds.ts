import { absolutePosition } from '../model/geometry';
import type { Diagram, Point } from '../model/types';
import { routeEdge } from '../model/routes';

export type Bounds = { x: number; y: number; width: number; height: number };
const MARGIN = 24;
const ARROW_PADDING = 12;

function includePoint(extent: { minX: number; minY: number; maxX: number; maxY: number }, point: Point, padding: number): void {
  extent.minX = Math.min(extent.minX, point.x - padding);
  extent.minY = Math.min(extent.minY, point.y - padding);
  extent.maxX = Math.max(extent.maxX, point.x + padding);
  extent.maxY = Math.max(extent.maxY, point.y + padding);
}

export function diagramBounds(doc: Diagram): Bounds {
  if (!doc.elements.length && !doc.edges.length) return { x: 0, y: 0, width: 640, height: 480 };
  const extent = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  for (const element of doc.elements) {
    const position = absolutePosition(doc, element.id);
    const padding = element.style.strokeWidth / 2;
    includePoint(extent, position, padding);
    includePoint(extent, { x: position.x + element.width, y: position.y + element.height }, padding);
  }
  for (const edge of doc.edges) {
    const padding = edge.width / 2 + ARROW_PADDING;
    for (const point of routeEdge(doc, edge)) includePoint(extent, point, padding);
  }
  if (!Number.isFinite(extent.minX)) return { x: 0, y: 0, width: 640, height: 480 };
  const x = extent.minX - MARGIN;
  const y = extent.minY - MARGIN;
  return { x, y, width: extent.maxX - extent.minX + MARGIN * 2, height: extent.maxY - extent.minY + MARGIN * 2 };
}

function scaleIsSafe(bounds: Bounds, scale: number): boolean {
  const width = Math.ceil(bounds.width * scale);
  const height = Math.ceil(bounds.height * scale);
  return width <= 8192 && height <= 8192 && width * height <= 32_000_000;
}

export function safeExportScale(bounds: Bounds, requested: number): number {
  if (![bounds.x, bounds.y, bounds.width, bounds.height, requested].every(Number.isFinite) || bounds.width <= 0 || bounds.height <= 0 || requested <= 0) {
    throw new Error('Dimensiones de exportación inválidas');
  }
  if (scaleIsSafe(bounds, requested)) return requested;
  let low = 0;
  let high = Math.min(requested, 8192 / bounds.width, 8192 / bounds.height, Math.sqrt(32_000_000 / (bounds.width * bounds.height)));
  for (let index = 0; index < 64; index += 1) {
    const middle = (low + high) / 2;
    if (scaleIsSafe(bounds, middle)) low = middle;
    else high = middle;
  }
  return low;
}
