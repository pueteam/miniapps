import { NOTE_MAX_HEIGHT, NOTE_MAX_WIDTH, NOTE_MIN_HEIGHT, NOTE_MIN_WIDTH, NOTE_ROTATION_LIMIT } from '../lib/constants';
import type { NoteGeometryPatch } from '../lib/types';

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function snapToGrid(value: number, grid = 8) {
  return Math.round(value / grid) * grid;
}

export function clampNoteSize(size: { width: number; height: number }) {
  return {
    width: clamp(Math.round(size.width), NOTE_MIN_WIDTH, NOTE_MAX_WIDTH),
    height: clamp(Math.round(size.height), NOTE_MIN_HEIGHT, NOTE_MAX_HEIGHT),
  };
}

export function getDragPatch(origin: { x: number; y: number }, delta: { deltaX: number; deltaY: number }, options: { snapToGrid?: boolean; grid?: number } = {}): NoteGeometryPatch {
  const x = origin.x + delta.deltaX;
  const y = origin.y + delta.deltaY;
  return {
    x: options.snapToGrid ? snapToGrid(x, options.grid) : Math.round(x),
    y: options.snapToGrid ? snapToGrid(y, options.grid) : Math.round(y),
  };
}

export function getResizePatch(origin: { width: number; height: number }, delta: { deltaX: number; deltaY: number }): NoteGeometryPatch {
  return clampNoteSize({ width: origin.width + delta.deltaX, height: origin.height + delta.deltaY });
}

export function getRotationFromPointer(center: { centerX: number; centerY: number }, point: { clientX: number; clientY: number }) {
  const angle = Math.atan2(point.clientY - center.centerY, point.clientX - center.centerX) * 180 / Math.PI + 90;
  return angle > 180 ? angle - 360 : angle;
}

const SNAP_ANGLES = [-90, -45, -30, -15, 0, 15, 30, 45, 90];

function snapRotation(rotation: number) {
  return SNAP_ANGLES.reduce((closest, angle) => (Math.abs(angle - rotation) < Math.abs(closest - rotation) ? angle : closest), SNAP_ANGLES[0]);
}

export function getRotationPatch(rotation: number, options: { snap?: boolean } = {}): NoteGeometryPatch {
  const nextRotation = options.snap ? snapRotation(rotation) : rotation;
  return { rotation: clamp(Math.round(nextRotation), -NOTE_ROTATION_LIMIT, NOTE_ROTATION_LIMIT) };
}
