import { describe, expect, it } from 'vitest';
import { exportBoardJson, importBoardJson } from './boardJson';
import type { StickyNote } from '../lib/types';

const note: StickyNote = {
  id: 'n1',
  boardId: 'default',
  x: 1,
  y: 2,
  rotation: 3,
  width: 220,
  height: 180,
  color: '#FFF176',
  content: 'JSON',
  zIndex: 1,
  pinned: false,
  tags: [],
  createdAt: 1,
  updatedAt: 2,
};

describe('board json import/export', () => {
  it('exports a versioned board payload', () => {
    const payload = JSON.parse(exportBoardJson([note], { exportedAt: 123 }));

    expect(payload).toMatchObject({ version: 1, exportedAt: 123, notes: [note] });
  });

  it('imports valid notes and rejects malformed payloads', () => {
    expect(importBoardJson(JSON.stringify({ version: 1, notes: [note] }))).toEqual([note]);
    expect(() => importBoardJson('{"notes":[{"id":"bad"}]}')).toThrow(/formato/i);
  });
});
