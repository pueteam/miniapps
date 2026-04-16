import type { Assignment } from './types';

interface AssignmentLanes {
  byId: Record<string, number>;
  laneCount: number;
}

function byStartThenEndThenId(a: Assignment, b: Assignment): number {
  if (a.startSlot !== b.startSlot) return a.startSlot - b.startSlot;
  if (a.endSlot !== b.endSlot) return a.endSlot - b.endSlot;
  return a.id.localeCompare(b.id);
}

export function computeAssignmentLanes(assignments: Assignment[]): AssignmentLanes {
  const sorted = [...assignments].sort(byStartThenEndThenId);
  const laneEndSlots: number[] = [];
  const byId: Record<string, number> = {};

  for (const assignment of sorted) {
    let laneIndex = laneEndSlots.findIndex((endSlot) => assignment.startSlot > endSlot);
    if (laneIndex === -1) {
      laneIndex = laneEndSlots.length;
      laneEndSlots.push(assignment.endSlot);
    } else {
      laneEndSlots[laneIndex] = assignment.endSlot;
    }
    byId[assignment.id] = laneIndex;
  }

  return { byId, laneCount: Math.max(1, laneEndSlots.length) };
}

export function rowHeightForLaneCount(laneCount: number): number {
  const baseRowHeight = 48;
  const barHeight = 32;
  const laneStep = 38;
  const padding = 8;
  if (laneCount <= 1) return baseRowHeight;
  return Math.max(baseRowHeight, barHeight + (laneCount - 1) * laneStep + padding);
}
