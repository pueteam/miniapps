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
  const result = { ...doc, elements: doc.elements.map(e => roots.has(e.id) ? { ...e, position: { x: e.position.x + delta.x, y: e.position.y + delta.y } } : e) };
  result.edges = doc.edges.map(e => {
    const sourceBefore = absolutePosition(doc, e.source), sourceAfter = absolutePosition(result, e.source);
    const targetBefore = absolutePosition(doc, e.target), targetAfter = absolutePosition(result, e.target);
    const dx = sourceAfter.x - sourceBefore.x, dy = sourceAfter.y - sourceBefore.y;
    return dx === targetAfter.x - targetBefore.x && dy === targetAfter.y - targetBefore.y ? { ...e, waypoints: e.waypoints.map(p => ({ x: p.x + dx, y: p.y + dy })) } : e;
  }); return validateDiagram(result);
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
