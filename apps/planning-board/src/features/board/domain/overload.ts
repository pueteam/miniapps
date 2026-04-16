import type { Assignment } from './types';

interface OverloadSlot {
  slotIndex: number;
  totalPct: number;
  assignmentIds: string[];
}

export function detectOverloads(
  profileId: string,
  assignments: Assignment[],
  slotCount: number,
): OverloadSlot[] {
  const profileAssignments = assignments.filter((a) => a.profileId === profileId);
  const slotMap = new Map<number, { totalPct: number; assignmentIds: string[] }>();

  for (const a of profileAssignments) {
    for (let s = a.startSlot; s <= a.endSlot; s++) {
      if (s >= slotCount) break;
      const existing = slotMap.get(s) ?? { totalPct: 0, assignmentIds: [] };
      existing.totalPct += a.dedicationPct;
      if (!existing.assignmentIds.includes(a.id)) existing.assignmentIds.push(a.id);
      slotMap.set(s, existing);
    }
  }

  const result: OverloadSlot[] = [];
  for (const [slotIndex, data] of slotMap) {
    if (data.totalPct > 100) result.push({ slotIndex, totalPct: data.totalPct, assignmentIds: data.assignmentIds });
  }
  return result.sort((a, b) => a.slotIndex - b.slotIndex);
}
