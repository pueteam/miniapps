import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createStickyBoardStore } from './boardStore';

describe('sticky board store', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('creates notes with the required model defaults', () => {
    const store = createStickyBoardStore({ idFactory: () => 'note-a', now: () => 1_700_000_000_000 });

    const note = store.createNote({ x: 120, y: 80, content: 'Idea inicial' });

    expect(note).toMatchObject({
      id: 'note-a',
      boardId: 'default',
      x: 120,
      y: 80,
      rotation: 0,
      width: 220,
      height: 180,
      color: '#fff3a3',
      content: 'Idea inicial',
      zIndex: 1,
      pinned: false,
      locked: false,
      tags: [],
      createdAt: 1_700_000_000_000,
      updatedAt: 1_700_000_000_000,
    });
    expect(store.notes.value).toHaveLength(1);
  });

  it('updates geometry without moving locked notes', () => {
    const store = createStickyBoardStore({ idFactory: () => 'locked-note', now: () => 10 });
    const note = store.createNote({ x: 0, y: 0 });

    store.updateNote(note.id, { locked: true });
    store.updateGeometry(note.id, { x: 80, y: 60, width: 260, height: 210, rotation: 8 });

    expect(store.findNote(note.id)).toMatchObject({ x: 0, y: 0, width: 220, height: 180, rotation: 0, locked: true });
  });

  it('filters notes by search text and tags', () => {
    const ids = ['n1', 'n2'];
    const store = createStickyBoardStore({ idFactory: () => ids.shift() ?? 'n', now: () => 10 });
    store.createNote({ content: 'Revisar contrato', tags: ['legal'] });
    store.createNote({ content: 'Comprar cafe', tags: ['personal'] });

    store.searchQuery.value = 'trato';

    expect(store.filteredNotes.value.map((note) => note.id)).toEqual(['n1']);
  });

  it('imports a board snapshot and normalizes z-index ordering', () => {
    const store = createStickyBoardStore({ idFactory: () => 'unused', now: () => 99 });

    store.importNotes([
      { id: 'b', boardId: 'default', x: 0, y: 0, rotation: 0, width: 220, height: 180, color: '#ffd6a5', content: 'B', zIndex: 20, pinned: false, locked: false, tags: [], createdAt: 1, updatedAt: 1 },
      { id: 'a', boardId: 'default', x: 0, y: 0, rotation: 0, width: 220, height: 180, color: '#caffbf', content: 'A', zIndex: 10, pinned: true, locked: false, tags: [], createdAt: 1, updatedAt: 1 },
    ]);

    expect(store.notes.value.map((note) => [note.id, note.zIndex])).toEqual([
      ['a', 1],
      ['b', 2],
    ]);
  });
});
