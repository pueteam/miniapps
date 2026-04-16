import type { ViewMode } from './types';

export function slotToPx(slotIndex: number, slotWidth: number): number {
  return slotIndex * slotWidth;
}

export function pxToSlot(px: number, slotWidth: number): number {
  return Math.max(0, Math.round(px / slotWidth));
}

export function deltaPxToSlot(px: number, slotWidth: number): number {
  if (px === 0) return 0;
  const magnitude = Math.round(Math.abs(px) / slotWidth);
  return px < 0 ? -magnitude : magnitude;
}

export function headerLabel(slotIndex: number, viewMode: ViewMode): string {
  return viewMode === 'days' ? `D${slotIndex + 1}` : `W${slotIndex + 1}`;
}

export function isMilestoneSlot(slotIndex: number): boolean {
  return (slotIndex + 1) % 5 === 0;
}

export function clampSlot(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function clampDedicationPct(value: number): number {
  const clamped = Math.max(10, Math.min(100, value));
  return Math.round(clamped / 5) * 5;
}
