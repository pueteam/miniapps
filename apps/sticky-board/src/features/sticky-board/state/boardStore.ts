import { computed, signal } from '@preact/signals';
import { nanoid } from 'nanoid';
import { DEFAULT_BOARD_ID, DEFAULT_NOTE_COLOR, NOTE_HEIGHT, NOTE_WIDTH } from '../lib/constants';
import type { NoteGeometryPatch, StickyNote } from '../lib/types';

type StoreOptions = {
  boardId?: string;
  idFactory?: () => string;
  now?: () => number;
};

type CreateNoteInput = Partial<Pick<StickyNote, 'x' | 'y' | 'rotation' | 'content' | 'color' | 'tags'>>;

function normalizeNotes(notes: StickyNote[]) {
  return [...notes]
    .sort((a, b) => a.zIndex - b.zIndex)
    .map((note, index) => ({ ...note, zIndex: index + 1 }));
}

export function createStickyBoardStore(options: StoreOptions = {}) {
  const boardId = options.boardId ?? DEFAULT_BOARD_ID;
  const idFactory = options.idFactory ?? nanoid;
  const now = options.now ?? Date.now;
  const notes = signal<StickyNote[]>([]);
  const searchQuery = signal('');
  const selectedNoteId = signal<string | null>(null);

  const filteredNotes = computed(() => {
    const ordered = [...notes.value].sort((a, b) => a.zIndex - b.zIndex);
    return ordered;
  });

  function findNote(id: string) {
    return notes.value.find((note) => note.id === id);
  }

  function replaceNote(id: string, updater: (note: StickyNote) => StickyNote) {
    let updated: StickyNote | undefined;
    notes.value = notes.value.map((note) => {
      if (note.id !== id) return note;
      updated = updater(note);
      return updated;
    });
    return updated;
  }

  function createNote(input: CreateNoteInput = {}) {
    const timestamp = now();
    const maxZ = notes.value.reduce((max, note) => Math.max(max, note.zIndex), 0);
    const defaultOffset = notes.value.length * 28;
    const note: StickyNote = {
      id: idFactory(),
      boardId,
      x: input.x ?? 96 + defaultOffset,
      y: input.y ?? 96 + defaultOffset,
      rotation: input.rotation ?? Math.random() * 8 - 4,
      width: NOTE_WIDTH,
      height: NOTE_HEIGHT,
      color: input.color ?? DEFAULT_NOTE_COLOR,
      content: input.content ?? '',
      zIndex: maxZ + 1,
      pinned: false,
      tags: input.tags ?? [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    notes.value = [...notes.value, note];
    selectedNoteId.value = note.id;
    return note;
  }

  function updateNote(id: string, patch: Partial<StickyNote>) {
    return replaceNote(id, (note) => ({ ...note, ...patch, id: note.id, boardId: note.boardId, updatedAt: now() }));
  }

  function updateGeometry(id: string, patch: NoteGeometryPatch) {
    return replaceNote(id, (note) => {
      if (note.pinned) return note;
      return { ...note, ...patch, updatedAt: now() };
    });
  }

  function bringToFront(id: string) {
    const maxZ = notes.value.reduce((max, note) => Math.max(max, note.zIndex), 0);
    return updateNote(id, { zIndex: maxZ + 1 });
  }

  function deleteNote(id: string) {
    notes.value = normalizeNotes(notes.value.filter((note) => note.id !== id));
    if (selectedNoteId.value === id) selectedNoteId.value = null;
  }

  function importNotes(nextNotes: StickyNote[]) {
    notes.value = normalizeNotes(nextNotes.map((note) => ({ ...note, boardId })));
    selectedNoteId.value = null;
  }

  return {
    boardId,
    notes,
    searchQuery,
    selectedNoteId,
    filteredNotes,
    createNote,
    updateNote,
    updateGeometry,
    bringToFront,
    deleteNote,
    importNotes,
    findNote,
  };
}

export type StickyBoardStore = ReturnType<typeof createStickyBoardStore>;
