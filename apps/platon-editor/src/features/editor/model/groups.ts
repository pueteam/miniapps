import type { Diagram, DiagramElement, Kind, Point } from './types';
import { createElement } from '../presets/elements';
import { absolutePosition, ancestors, selectedRoots } from './geometry';
import { validateDiagram } from './validation';
export function reparentElements(doc: Diagram, ids: string[], parentId?: string): Diagram {
  if (parentId !== undefined && !doc.elements.some(e => e.id === parentId && e.kind === 'group')) throw new Error('Grupo inexistente');
  const roots = new Set(selectedRoots(doc, ids));
  if (parentId && (roots.has(parentId) || ancestors(doc, parentId).some(id => roots.has(id)))) throw new Error('Ciclo de pertenencia');
  const origin = parentId ? absolutePosition(doc, parentId) : { x: 0, y: 0 };
  return validateDiagram({ ...doc, elements: doc.elements.map(e => {
    if (!roots.has(e.id)) return e;
    const absolute = absolutePosition(doc, e.id);
    const position = { x: absolute.x - origin.x, y: absolute.y - origin.y };
    const { parentId: _dropped, ...rest } = e;
    return parentId ? { ...rest, position, parentId } : { ...rest, position };
  }) });
}
export function groupElements(doc: Diagram, ids: string[], groupId: string, createGroup: (kind: Kind, id: string, position: Point) => DiagramElement = createElement): Diagram {
  const roots = selectedRoots(doc, ids); if (!roots.length) throw new Error('Selecciona elementos para agrupar');
  const common = ancestors(doc, roots[0]).find(id => roots.every(root => ancestors(doc, root).includes(id)));
  const group = createGroup('group', groupId, { x: 0, y: 0 });
  const grouped = common ? { ...group, parentId: common } : group;
  const added = validateDiagram({ ...doc, elements: [...doc.elements, grouped] });
  return fitGroup(reparentElements(added, roots, groupId), groupId);
}
export function ungroup(doc: Diagram, groupId: string): Diagram {
  const group = doc.elements.find(e => e.id === groupId && e.kind === 'group'); if (!group) throw new Error('Grupo inexistente');
  const moved = reparentElements(doc, doc.elements.filter(e => e.parentId === groupId).map(e => e.id), group.parentId);
  return validateDiagram({ ...moved, elements: moved.elements.filter(e => e.id !== groupId) });
}
/** Ajusta el grupo a sus hijos directos (no recursivo: si un hijo es un grupo sin ajustar, el cálculo usa su tamaño actual). */
export function fitGroup(doc: Diagram, groupId: string): Diagram {
  const group = doc.elements.find(e => e.id === groupId && e.kind === 'group'); if (!group) throw new Error('Grupo inexistente');
  const children = doc.elements.filter(e => e.parentId === groupId); if (!children.length) return validateDiagram(doc);
  const minX = Math.min(...children.map(e => e.position.x)) - 24;
  const minY = Math.min(...children.map(e => e.position.y)) - 56;
  const maxX = Math.max(...children.map(e => e.position.x + e.width)) + 24;
  const maxY = Math.max(...children.map(e => e.position.y + e.height)) + 24;
  return validateDiagram({ ...doc, elements: doc.elements.map(e => e.id === groupId ? { ...e, position: { x: e.position.x + minX, y: e.position.y + minY }, width: maxX - minX, height: maxY - minY } : e.parentId === groupId ? { ...e, position: { x: e.position.x - minX, y: e.position.y - minY } } : e) });
}
