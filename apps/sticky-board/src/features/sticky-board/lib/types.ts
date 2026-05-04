export type StickyNoteColor = '#fff3a3' | '#ffd6a5' | '#caffbf' | '#a0c4ff' | '#ffc6ff';

export type StickyNote = {
  id: string;
  boardId: string;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
  color: StickyNoteColor | string;
  content: string;
  zIndex: number;
  pinned: boolean;
  locked: boolean;
  tags: string[];
  createdAt: number;
  updatedAt: number;
};

export type NoteGeometryPatch = Partial<Pick<StickyNote, 'x' | 'y' | 'width' | 'height' | 'rotation'>>;

export type BoardExportPayload = {
  version: 1;
  exportedAt: number;
  notes: StickyNote[];
};
