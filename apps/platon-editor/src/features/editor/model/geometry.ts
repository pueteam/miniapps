import type { Diagram, Point } from './types';
export function ancestors(doc: Diagram, id: string): string[] {
  const result: string[] = []; const seen = new Set<string>(); let current = id;
  while (true) {
    if (seen.has(current)) throw new Error('Ciclo de pertenencia'); seen.add(current);
    const element = doc.elements.find(e => e.id === current); if (!element) throw new Error('Elemento inexistente');
    if (!element.parentId) return result; result.push(element.parentId); current = element.parentId;
  }
}
export function absolutePosition(doc: Diagram, id: string): Point {
  const chain = [id, ...ancestors(doc, id)];
  return chain.reduce((sum, key) => {
    const found = doc.elements.find(e => e.id === key);
    if (!found) throw new Error('Elemento inexistente');
    return { x: sum.x + found.position.x, y: sum.y + found.position.y };
  }, { x: 0, y: 0 });
}
export function selectedRoots(doc: Diagram, ids: string[]): string[] {
  const selected = new Set(ids); return [...selected].filter(id => !ancestors(doc, id).some(p => selected.has(p)));
}
export function subtreeIds(doc: Diagram, ids: string[]): Set<string> {
  ids.forEach(id => ancestors(doc, id)); const selected = new Set(ids);
  for (const e of doc.elements) if (ancestors(doc, e.id).some(id => selected.has(id))) selected.add(e.id);
  return selected;
}
