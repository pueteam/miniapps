export type StickyNoteColor = '#FFF176' | '#A5D6A7' | '#90CAF9' | '#FFAB91' | '#CE93D8' | '#F48FB1';

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
