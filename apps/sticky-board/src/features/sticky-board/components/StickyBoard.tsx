import { useEffect } from 'preact/hooks';
import { NoteCard } from './NoteCard';
import { Toolbar } from './Toolbar';
import { stickyBoardController } from '../state/useStickyBoardController';

export function StickyBoard() {
  const controller = stickyBoardController;
  const { store } = controller;
  const notes = store.filteredNotes.value;

  useEffect(() => {
    void controller.load();
  }, []);

  return (
    <section class="sticky-workspace" aria-label="Tablero de notas sticky">
      <Toolbar
        noteCount={store.notes.value.length}
        query={store.searchQuery.value}
        status={controller.statusMessage.value}
        onCreate={() => void controller.createNote()}
        onSearch={(value) => { store.searchQuery.value = value; }}
        onExport={controller.exportJson}
        onImport={controller.importJson}
      />
      <div class="board-frame">
        <div class="board-canvas" data-testid="sticky-canvas">
          {controller.loading.value ? <p class="empty-state">Cargando notas...</p> : null}
          {!controller.loading.value && notes.length === 0 ? <p class="empty-state">Sin resultados. Crea una nota o cambia la búsqueda.</p> : null}
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              selected={store.selectedNoteId.value === note.id}
              onSelect={(noteId) => { store.selectedNoteId.value = noteId; void controller.updateNote(noteId, { zIndex: note.zIndex + 100 }); }}
              onContent={controller.updateContent}
              onPatch={(noteId, patch) => { void controller.updateNote(noteId, patch); }}
              onGeometry={controller.updateGeometry}
              onCommit={(noteId) => { void controller.commitNote(noteId); }}
              onDelete={(noteId) => { void controller.deleteNote(noteId); }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
