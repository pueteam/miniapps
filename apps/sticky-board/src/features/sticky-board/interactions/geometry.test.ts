import { describe, expect, it } from 'vitest';
import { clampNoteSize, getDragPatch, getResizePatch, getRotationFromPointer, getRotationPatch } from './geometry';

describe('sticky note geometry interactions', () => {
  it('calculates drag patches from pointer deltas', () => {
    expect(getDragPatch({ x: 20, y: 40 }, { deltaX: 15, deltaY: -10 })).toEqual({ x: 35, y: 30 });
  });

  it('snaps drag patches to the grid when requested', () => {
    expect(getDragPatch({ x: 20, y: 40 }, { deltaX: 13, deltaY: -7 }, { snapToGrid: true })).toEqual({ x: 32, y: 32 });
  });

  it('clamps resize patches to usable note dimensions', () => {
    expect(clampNoteSize({ width: 50, height: 900 })).toEqual({ width: 160, height: 420 });
    expect(getResizePatch({ width: 220, height: 180 }, { deltaX: 60, deltaY: 20 })).toEqual({ width: 280, height: 200 });
  });

  it('keeps rotation within a subtle note range', () => {
    expect(getRotationPatch(40)).toEqual({ rotation: 25 });
    expect(getRotationPatch(-40)).toEqual({ rotation: -25 });
  });

  it('snaps rotation to key angles while shift is pressed', () => {
    expect(getRotationPatch(13, { snap: true })).toEqual({ rotation: 15 });
    expect(getRotationPatch(-37, { snap: true })).toEqual({ rotation: -25 });
    expect(getRotationPatch(4, { snap: true })).toEqual({ rotation: 0 });
    expect(getRotationPatch(88, { snap: true })).toEqual({ rotation: 25 });
  });

  it('calculates dial rotation from the dial center instead of the note center', () => {
    expect(getRotationFromPointer({ centerX: 100, centerY: 100 }, { clientX: 100, clientY: 70 })).toBe(0);
    expect(getRotationFromPointer({ centerX: 100, centerY: 100 }, { clientX: 130, clientY: 100 })).toBe(90);
    expect(getRotationFromPointer({ centerX: 100, centerY: 100 }, { clientX: 70, clientY: 100 })).toBe(-90);
  });
});
