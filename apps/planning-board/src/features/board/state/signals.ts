import { computed, effect, signal } from '@preact/signals';
import { BOARD_DEFAULTS } from '../domain/constants';
import { detectOverloads } from '../domain/overload';
import { computeStats } from '../domain/stats';
import type { Assignment, BoardStats, OverloadInfo, Profile, ViewMode } from '../domain/types';

function getStoredNumber(key: string, fallback: number, min: number, max: number): number {
  const raw = localStorage.getItem(key);
  const value = raw === null ? fallback : Number.parseInt(raw, 10);
  if (Number.isNaN(value)) return fallback;
  return Math.max(min, Math.min(max, value));
}

export const profiles = signal<Profile[]>([]);
export const assignments = signal<Assignment[]>([]);
export const viewMode = signal<ViewMode>((localStorage.getItem('viewMode') as ViewMode) || 'days');
export const slotWidth = signal<number>(
  getStoredNumber('slotWidth', BOARD_DEFAULTS.SLOT_WIDTH_DEFAULT, BOARD_DEFAULTS.SLOT_WIDTH_MIN, BOARD_DEFAULTS.SLOT_WIDTH_MAX),
);
export const slotCount = signal<number>(
  getStoredNumber('slotCount', BOARD_DEFAULTS.SLOT_COUNT_DEFAULT, BOARD_DEFAULTS.SLOT_COUNT_MIN, BOARD_DEFAULTS.SLOT_COUNT_MAX),
);
export const currentSlot = signal<number | null>((() => {
  const raw = localStorage.getItem('currentSlot');
  if (raw === null) return 0;
  const value = Number.parseInt(raw, 10);
  return Number.isNaN(value) ? 0 : Math.max(0, value);
})());
export const editingAssignmentId = signal<string | null>(null);
export const deletingProfileId = signal<string | null>(null);
export const contextMenuTarget = signal<{ assignmentId: string; x: number; y: number } | null>(null);
export const hoveredBarState = signal<{ assignmentId: string; rect: DOMRect; anchorEl?: HTMLElement | null } | null>(null);

export const overloadMap = computed<Map<string, OverloadInfo[]>>(() => {
  const map = new Map<string, OverloadInfo[]>();
  for (const profile of profiles.value) {
    const overloads = detectOverloads(profile.id, assignments.value, slotCount.value);
    if (overloads.length > 0) map.set(profile.id, overloads);
  }
  return map;
});

export const boardStats = computed<BoardStats>(() =>
  computeStats(profiles.value, assignments.value, slotCount.value, viewMode.value),
);

effect(() => {
  localStorage.setItem('slotWidth', String(slotWidth.value));
  document.documentElement.style.setProperty('--slot-width', `${slotWidth.value}px`);
});
effect(() => { localStorage.setItem('slotCount', String(slotCount.value)); });
effect(() => {
  if (currentSlot.value === null) { localStorage.removeItem('currentSlot'); return; }
  localStorage.setItem('currentSlot', String(Math.max(0, currentSlot.value)));
});
