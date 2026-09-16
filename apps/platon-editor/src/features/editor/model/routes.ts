import { absolutePosition } from './geometry';
import type { Diagram, DiagramEdge, DiagramElement, Point, Port } from './types';

function portPoint(doc: Diagram, element: DiagramElement, port: Port): Point {
  const position = absolutePosition(doc, element.id);
  if (port === 'top') return { x: position.x + element.width / 2, y: position.y };
  if (port === 'right') return { x: position.x + element.width, y: position.y + element.height / 2 };
  if (port === 'bottom') return { x: position.x + element.width / 2, y: position.y + element.height };
  return { x: position.x, y: position.y + element.height / 2 };
}

function portStub(point: Point, port: Port): Point {
  const distance = 20;
  if (port === 'top') return { x: point.x, y: point.y - distance };
  if (port === 'right') return { x: point.x + distance, y: point.y };
  if (port === 'bottom') return { x: point.x, y: point.y + distance };
  return { x: point.x - distance, y: point.y };
}

function appendPoint(points: Point[], point: Point): void {
  const previous = points.at(-1);
  if (!previous || previous.x !== point.x || previous.y !== point.y) points.push({ ...point });
}

function appendOrthogonal(points: Point[], target: Point): void {
  const current = points.at(-1);
  if (!current) return appendPoint(points, target);
  if (current.x !== target.x && current.y !== target.y) {
    appendPoint(points, { x: target.x, y: current.y });
  }
  appendPoint(points, target);
}

export function routeEdge(doc: Diagram, edge: DiagramEdge): Point[] {
  const source = doc.elements.find(element => element.id === edge.source);
  const target = doc.elements.find(element => element.id === edge.target);
  if (!source || !target) return [];

  const start = portPoint(doc, source, edge.sourcePort);
  const end = portPoint(doc, target, edge.targetPort);
  if (edge.routing === 'straight') return [start, end];

  const points: Point[] = [start];
  appendPoint(points, portStub(start, edge.sourcePort));
  for (const waypoint of edge.waypoints) appendOrthogonal(points, waypoint);
  appendOrthogonal(points, portStub(end, edge.targetPort));
  appendPoint(points, end);
  return points;
}

export function edgePath(points: Point[]): string {
  if (!points.length) return '';
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
}
