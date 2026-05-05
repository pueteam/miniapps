import { describe, expect, it } from 'vitest';
import { clampNoteSize, getDragPatch, getResizePatch, getRotationPatch } from './geometry';

describe('sticky note geometry interactions', () => {
  it('calculates drag patches from pointer deltas', () => {
    expect(getDragPatch({ x: 20, y: 40 }, { deltaX: 15, deltaY: -10 })).toEqual({ x: 35, y: 30 });
  });

  it('clamps resize patches to usable note dimensions', () => {
    expect(clampNoteSize({ width: 50, height: 900 })).toEqual({ width: 160, height: 420 });
    expect(getResizePatch({ width: 220, height: 180 }, { deltaX: 60, deltaY: 20 })).toEqual({ width: 280, height: 200 });
  });

  it('limits rotation to a subtle post-it range', () => {
    expect(getRotationPatch(45)).toEqual({ rotation: 35 });
    expect(getRotationPatch(-40)).toEqual({ rotation: -35 });
  });
});
