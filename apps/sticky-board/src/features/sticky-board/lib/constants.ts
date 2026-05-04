import type { StickyNoteColor } from './types';

export const DEFAULT_BOARD_ID = 'default';
export const NOTE_WIDTH = 220;
export const NOTE_HEIGHT = 180;
export const NOTE_MIN_WIDTH = 160;
export const NOTE_MIN_HEIGHT = 120;
export const NOTE_MAX_WIDTH = 420;
export const NOTE_MAX_HEIGHT = 420;
export const NOTE_ROTATION_LIMIT = 18;
export const NOTE_COLORS: StickyNoteColor[] = ['#fff3a3', '#ffd6a5', '#caffbf', '#a0c4ff', '#ffc6ff'];
export const DEFAULT_NOTE_COLOR = NOTE_COLORS[0];
export const CONTENT_SAVE_DEBOUNCE_MS = 450;
