export type Point = { x: number; y: number };
export type Kind = 'job' | 'action' | 'text' | 'group' | 'header';
export type Port = 'top' | 'right' | 'bottom' | 'left';
export type Style = {
  fill: string; stroke: string; strokeWidth: number; color: string;
  fontSize: number; bold: boolean; align: 'left' | 'center' | 'right';
  shape: 'rectangle' | 'diamond' | 'hexagon'; radius: number; presetId?: string;
};
export type ElementData = {
  name: string; schedule: string; repetitive: boolean; parameters: string[];
  annotations: string; url: string; semaphore: string; value: string; text: string;
  lote: string; cadena: string; description: string;
};
export type DiagramElement = {
  id: string; kind: Kind; parentId?: string; position: Point; width: number;
  height: number; data: ElementData; style: Style;
};
export type DiagramEdge = {
  id: string; source: string; target: string; sourcePort: Port; targetPort: Port;
  routing: 'straight' | 'orthogonal'; waypoints: Point[]; color: string; width: number;
};
export type Diagram = {
  version: 1; metadata: { title: string; lote: string; cadena: string; description: string };
  elements: DiagramElement[]; edges: DiagramEdge[];
};
export type Selection = { elementIds: string[]; edgeIds: string[] };
export type Viewport = { x: number; y: number; zoom: number };
