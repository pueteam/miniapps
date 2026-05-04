import Dexie, { type Table } from 'dexie';
import type { StickyNote } from '../lib/types';

export class StickyBoardDB extends Dexie {
  notes!: Table<StickyNote, string>;

  constructor(dbName = 'sticky-board') {
    super(dbName);
    this.version(1).stores({
      notes: 'id, boardId, updatedAt, pinned, locked',
    });
  }
}

export const db = new StickyBoardDB();

export function createNotesRepository(database: StickyBoardDB = db) {
  return {
    list(boardId: string) {
      return database.notes.where('boardId').equals(boardId).sortBy('zIndex');
    },
    save(note: StickyNote) {
      return database.notes.put(note);
    },
    delete(id: string) {
      return database.notes.delete(id);
    },
    async replaceBoard(boardId: string, notes: StickyNote[]) {
      await database.transaction('rw', database.notes, async () => {
        await database.notes.where('boardId').equals(boardId).delete();
        if (notes.length > 0) await database.notes.bulkPut(notes);
      });
    },
  };
}
