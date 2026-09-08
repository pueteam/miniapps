import type { Diagram } from './types';
export function emptyDiagram(): Diagram {
  return { version: 1, metadata: { title: 'Nueva cadena', lote: '', cadena: '', description: '' }, elements: [], edges: [] };
}
