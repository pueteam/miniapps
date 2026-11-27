import type { Diagram, DiagramElement, Point, Selection } from './types';
import { absolutePosition, selectedRoots, subtreeIds } from './geometry';
import { validateDiagram } from './validation';
export function deleteSelection(doc: Diagram, selection: Selection): Diagram {
  const removed = subtreeIds(doc, selection.elementIds); const edges = new Set(selection.edgeIds);
  for (const id of edges) if (!doc.edges.some(e => e.id === id)) throw new Error('Enlace inexistente');
  return validateDiagram({ ...doc, elements: doc.elements.filter(e => !removed.has(e.id)), edges: doc.edges.filter(e => !edges.has(e.id) && !removed.has(e.source) && !removed.has(e.target)) });
}
export function moveElements(doc: Diagram, ids: string[], delta: Point): Diagram {
  const roots = new Set(selectedRoots(doc, ids));
  const elements = doc.elements.map(e => roots.has(e.id) ? { ...e, position: { x: e.position.x + delta.x, y: e.position.y + delta.y } } : e);
  return withMovedElements(doc, elements);
}

export type ElementAlignment = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';

export function alignElements(doc: Diagram, ids: string[], alignment: ElementAlignment): Diagram {
  const roots = new Set(selectedRoots(doc, ids));
  if (roots.size < 2) return validateDiagram(doc);

  const horizontal = alignment === 'left' || alignment === 'center' || alignment === 'right';
  const axis = horizontal ? 'x' : 'y';
  const size = horizontal ? 'width' : 'height';
  const selected = doc.elements.filter(e => roots.has(e.id))
    .map(e => ({ id: e.id, start: absolutePosition(doc, e.id)[axis], size: e[size] }));
  const start = Math.min(...selected.map(e => e.start));
  const end = Math.max(...selected.map(e => e.start + e.size));
  const fraction = alignment === 'center' || alignment === 'middle' ? 0.5 : alignment === 'right' || alignment === 'bottom' ? 1 : 0;
  const anchor = fraction === 0 ? start : fraction === 1 ? end : start / 2 + end / 2;

  const deltas = new Map(selected.map(e => [e.id, anchor - (e.start + e.size * fraction)]));
  const elements = doc.elements.map(e => {
    const delta = deltas.get(e.id);
    return delta === undefined ? e : { ...e, position: { ...e.position, [axis]: e.position[axis] + delta } };
  });
  return withMovedElements(doc, elements);
}

function withMovedElements(doc: Diagram, elements: DiagramElement[]): Diagram {
  const result = { ...doc, elements };
  const edges = doc.edges.map(e => {
    const sourceBefore = absolutePosition(doc, e.source), sourceAfter = absolutePosition(result, e.source);
    const targetBefore = absolutePosition(doc, e.target), targetAfter = absolutePosition(result, e.target);
    const dx = sourceAfter.x - sourceBefore.x, dy = sourceAfter.y - sourceBefore.y;
    const tdx = targetAfter.x - targetBefore.x, tdy = targetAfter.y - targetBefore.y;
    return Math.abs(dx - tdx) < 1e-9 && Math.abs(dy - tdy) < 1e-9 ? { ...e, waypoints: e.waypoints.map(p => ({ x: p.x + dx, y: p.y + dy })) } : e;
  });
  return validateDiagram({ ...result, edges });
}
export function patchElement(doc: Diagram, id: string, patch: Partial<Omit<DiagramElement, 'id' | 'kind'>>): Diagram {
  if (!doc.elements.some(e => e.id === id)) throw new Error('Elemento inexistente');
  return validateDiagram({ ...doc, elements: doc.elements.map(e => e.id === id ? { ...e, ...patch, id: e.id, kind: e.kind } : e) });
}
export function duplicateSelection(doc: Diagram, ids: string[], nextId: () => string): Diagram {
  const selected = subtreeIds(doc, ids); const roots = new Set(selectedRoots(doc, ids));
  const existing = new Set([...doc.elements, ...doc.edges].map(e => e.id));
  const allocate = () => { const id = nextId(); if (!id || existing.has(id)) throw new Error('Identificador duplicado'); existing.add(id); return id; };
  const remap = new Map([...selected].map(id => [id, allocate()]));
  const copies = doc.elements.filter(e => selected.has(e.id)).map(e => ({ ...e, id: remap.get(e.id)!, ...(e.parentId ? { parentId: remap.get(e.parentId) ?? e.parentId } : {}), position: { x: e.position.x + (roots.has(e.id) ? 24 : 0), y: e.position.y + (roots.has(e.id) ? 24 : 0) } }));
  const edges = doc.edges.filter(e => selected.has(e.source) && selected.has(e.target)).map(e => ({ ...e, id: allocate(), source: remap.get(e.source)!, target: remap.get(e.target)!, waypoints: e.waypoints.map(p => ({ x: p.x + 24, y: p.y + 24 })) }));
  return validateDiagram({ ...doc, elements: [...doc.elements, ...copies], edges: [...doc.edges, ...edges] });
}
