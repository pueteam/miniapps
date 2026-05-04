import type { BoardExportPayload, StickyNote } from '../lib/types';

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isStickyNote(value: unknown): value is StickyNote {
  if (!value || typeof value !== 'object') return false;
  const note = value as Partial<StickyNote>;
  return (
    typeof note.id === 'string' &&
    typeof note.boardId === 'string' &&
    isNumber(note.x) &&
    isNumber(note.y) &&
    isNumber(note.rotation) &&
    isNumber(note.width) &&
    isNumber(note.height) &&
    typeof note.color === 'string' &&
    typeof note.content === 'string' &&
    isNumber(note.zIndex) &&
    typeof note.pinned === 'boolean' &&
    typeof note.locked === 'boolean' &&
    Array.isArray(note.tags) &&
    note.tags.every((tag) => typeof tag === 'string') &&
    isNumber(note.createdAt) &&
    isNumber(note.updatedAt)
  );
}

export function exportBoardJson(notes: StickyNote[], options: { exportedAt?: number } = {}) {
  const payload: BoardExportPayload = {
    version: 1,
    exportedAt: options.exportedAt ?? Date.now(),
    notes,
  };
  return JSON.stringify(payload, null, 2);
}

export function importBoardJson(text: string): StickyNote[] {
  let payload: unknown;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error('Formato JSON inválido.');
  }

  const candidate = payload as Partial<BoardExportPayload>;
  if (candidate.version !== 1 || !Array.isArray(candidate.notes) || !candidate.notes.every(isStickyNote)) {
    throw new Error('Formato de tablero no reconocido.');
  }
  return candidate.notes;
}
