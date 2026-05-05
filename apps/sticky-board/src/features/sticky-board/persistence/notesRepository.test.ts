import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { StickyBoardDB, createNotesRepository } from './notesRepository';
import type { StickyNote } from '../lib/types';

const note: StickyNote = {
  id: 'note-1',
  boardId: 'default',
  x: 12,
  y: 24,
  rotation: 0,
  width: 220,
  height: 180,
  color: '#FFF176',
  content: 'Persistida',
  zIndex: 1,
  pinned: false,
  tags: ['demo'],
  createdAt: 1,
  updatedAt: 1,
};

describe('notes repository', () => {
  let db: StickyBoardDB;

  beforeEach(async () => {
    db = new StickyBoardDB(`sticky-board-test-${crypto.randomUUID()}`);
    await db.open();
  });

  it('saves and lists notes by board', async () => {
    const repo = createNotesRepository(db);

    await repo.save(note);

    expect(await repo.list('default')).toEqual([note]);
  });

  it('replaces a board snapshot atomically', async () => {
    const repo = createNotesRepository(db);
    await repo.save(note);

    await repo.replaceBoard('default', [{ ...note, id: 'note-2', content: 'Importada' }]);

    expect((await repo.list('default')).map((item) => item.id)).toEqual(['note-2']);
  });
});
