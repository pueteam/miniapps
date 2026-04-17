export interface Profile {
  id: string;
  name: string;
  category: string;
  capacityPct: number;
  color: string;
  initials: string;
}

export interface Assignment {
  id: string;
  index: number;
  profileId: string;
  task: string;
  startSlot: number;
  endSlot: number;
  dedicationPct: number;
}

export type ViewMode = 'days' | 'weeks';

export interface OverloadInfo {
  slotIndex: number;
  totalPct: number;
  assignmentIds: string[];
}

export interface BoardStats {
  profileCount: number;
  assignmentCount: number;
  avgDedicationPct: number;
  totalEffort: number;
  peakSlot: { label: string; count: number } | null;
}
