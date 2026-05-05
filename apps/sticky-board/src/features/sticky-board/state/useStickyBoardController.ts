import { signal } from '@preact/signals';
import { CONTENT_SAVE_DEBOUNCE_MS, DEFAULT_BOARD_ID } from '../lib/constants';
import type { NoteGeometryPatch, StickyNote } from '../lib/types';
import { exportBoardJson, importBoardJson } from '../export/boardJson';
import { createNotesRepository } from '../persistence/notesRepository';
import { createStickyBoardStore } from './boardStore';

const store = createStickyBoardStore({ boardId: DEFAULT_BOARD_ID });
const repository = createNotesRepository();
const loading = signal(true);
const statusMessage = signal('Cargando tablero local...');
const pendingContentSaves = new Map<string, number>();

function scheduleSave(noteId: string) {
  const pending = pendingContentSaves.get(noteId);
  if (pending) window.clearTimeout(pending);
  const timer = window.setTimeout(() => {
    const note = store.findNote(noteId);
    if (note) void repository.save(note);
    pendingContentSaves.delete(noteId);
  }, CONTENT_SAVE_DEBOUNCE_MS);
  pendingContentSaves.set(noteId, timer);
}

export function createStickyBoardController() {
  async function load() {
    loading.value = true;
    const notes = await repository.list(store.boardId);
    store.importNotes(notes);
    loading.value = false;
    statusMessage.value = notes.length === 0 ? 'Tablero listo. Crea tu primera nota.' : `${notes.length} notas cargadas.`;
  }

  async function createNote() {
    const offset = store.notes.value.length * 24;
    const note = store.createNote({ x: 96 + offset, y: 96 + offset, content: 'Nueva nota' });
    await repository.save(note);
    statusMessage.value = 'Nota creada y guardada.';
  }

  function updateContent(noteId: string, content: string) {
    store.updateNote(noteId, { content });
    scheduleSave(noteId);
    statusMessage.value = 'Editando... autoguardado en curso.';
  }

  async function updateNote(noteId: string, patch: Partial<StickyNote>) {
    const note = store.updateNote(noteId, patch);
    if (note) await repository.save(note);
  }

  function updateGeometry(noteId: string, patch: NoteGeometryPatch) {
    store.updateGeometry(noteId, patch);
  }

  async function commitNote(noteId: string) {
    const note = store.findNote(noteId);
    if (!note) return;
    await repository.save(note);
    statusMessage.value = 'Cambios guardados.';
  }

  async function deleteNote(noteId: string) {
    store.deleteNote(noteId);
    await repository.delete(noteId);
    statusMessage.value = 'Nota eliminada.';
  }

  function exportJson() {
    return exportBoardJson(store.notes.value);
  }

  async function importJson(text: string) {
    const notes = importBoardJson(text);
    store.importNotes(notes);
    await repository.replaceBoard(store.boardId, store.notes.value);
    statusMessage.value = `${notes.length} notas importadas.`;
  }

  return {
    store,
    loading,
    statusMessage,
    load,
    createNote,
    updateContent,
    updateNote,
    updateGeometry,
    commitNote,
    deleteNote,
    exportJson,
    importJson,
  };
}

export const stickyBoardController = createStickyBoardController();
