import { NOTE_MAX_HEIGHT, NOTE_MAX_WIDTH, NOTE_MIN_HEIGHT, NOTE_MIN_WIDTH, NOTE_ROTATION_LIMIT } from '../lib/constants';
import type { NoteGeometryPatch } from '../lib/types';

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function clampNoteSize(size: { width: number; height: number }) {
  return {
    width: clamp(Math.round(size.width), NOTE_MIN_WIDTH, NOTE_MAX_WIDTH),
    height: clamp(Math.round(size.height), NOTE_MIN_HEIGHT, NOTE_MAX_HEIGHT),
  };
}

export function getDragPatch(origin: { x: number; y: number }, delta: { deltaX: number; deltaY: number }): NoteGeometryPatch {
  return {
    x: Math.round(origin.x + delta.deltaX),
    y: Math.round(origin.y + delta.deltaY),
  };
}

export function getResizePatch(origin: { width: number; height: number }, delta: { deltaX: number; deltaY: number }): NoteGeometryPatch {
  return clampNoteSize({ width: origin.width + delta.deltaX, height: origin.height + delta.deltaY });
}

export function getRotationPatch(rotation: number): NoteGeometryPatch {
  return { rotation: clamp(Math.round(rotation), -NOTE_ROTATION_LIMIT, NOTE_ROTATION_LIMIT) };
}
