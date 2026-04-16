import { headerLabel } from './slots';
import type { Assignment, BoardStats, Profile, ViewMode } from './types';

export function computeStats(
  profiles: Profile[],
  assignments: Assignment[],
  slotCount: number,
  viewMode: ViewMode,
): BoardStats {
  const assignmentCount = assignments.length;
  const profileCount = profiles.length;
  const avgDedicationPct = assignmentCount === 0
    ? 0
    : Math.round(assignments.reduce((total, a) => total + a.dedicationPct, 0) / assignmentCount);

  const totalEffort = Number(assignments.reduce((total, a) => {
    const duration = a.endSlot - a.startSlot + 1;
    return total + (a.dedicationPct / 100) * duration;
  }, 0).toFixed(2));

  const slotActivity = new Map<number, number>();
  for (const a of assignments) {
    for (let s = a.startSlot; s <= a.endSlot && s < slotCount; s++) {
      slotActivity.set(s, (slotActivity.get(s) ?? 0) + 1);
    }
  }

  let peakSlotIndex: number | null = null;
  let peakCount = 0;
  for (const [s, count] of slotActivity) {
    if (count > peakCount) { peakSlotIndex = s; peakCount = count; }
  }

  return {
    profileCount,
    assignmentCount,
    avgDedicationPct,
    totalEffort,
    peakSlot: peakSlotIndex === null ? null : { label: headerLabel(peakSlotIndex, viewMode), count: peakCount },
  };
}
