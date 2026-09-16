import type { Selection } from './types';

export function isSameSelection(a: Selection, b: Selection): boolean {
  return (
    a.elementIds.length === b.elementIds.length &&
    a.edgeIds.length === b.edgeIds.length &&
    a.elementIds.every((id, i) => id === b.elementIds[i]) &&
    a.edgeIds.every((id, i) => id === b.edgeIds[i])
  );
}
