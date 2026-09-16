import type { DiagramElement } from '../model/types';

/** Ordena elementos en profundidad (padre antes que hijos). Los huérfanos con
 *  padre inexistente se muestran en el nivel superior y los ciclos terminan
 *  en vez de desbordar la pila. */
export function orderElements(elements: DiagramElement[]): DiagramElement[] {
  const byId = new Map(elements.map((e) => [e.id, e]));
  const children = new Map<string | undefined, DiagramElement[]>();
  for (const e of elements) {
    const parent = e.parentId !== undefined && byId.has(e.parentId) ? e.parentId : undefined;
    const list = children.get(parent);
    if (list) list.push(e);
    else children.set(parent, [e]);
  }
  const ordered: DiagramElement[] = [];
  const visited = new Set<string>();
  const visit = (parent: string | undefined) => {
    for (const e of children.get(parent) ?? []) {
      if (visited.has(e.id)) continue;
      visited.add(e.id);
      ordered.push(e);
      visit(e.id);
    }
  };
  visit(undefined);
  for (const e of elements) if (!visited.has(e.id)) ordered.push(e);
  return ordered;
}
