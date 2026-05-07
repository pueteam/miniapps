import { useEffect } from 'preact/hooks';
import { NoteCard } from './NoteCard';
import { Toolbar } from './Toolbar';
import { stickyBoardController } from '../state/useStickyBoardController';

export function StickyBoard() {
  const controller = stickyBoardController;
  const { store } = controller;
  const notes = store.filteredNotes.value;
  const hasNotes = store.notes.value.length > 0;
  const searchQuery = store.searchQuery.value.trim();

  useEffect(() => {
    void controller.load();
  }, []);

  function deselectOnCanvasPointerDown(event: PointerEvent) {
    if (event.target !== event.currentTarget) return;
    store.selectedNoteId.value = null;
  }

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
        <div class="board-canvas" data-testid="sticky-canvas" onPointerDown={deselectOnCanvasPointerDown}>
          {controller.loading.value ? <p class="empty-state">Cargando notas...</p> : null}
          {!controller.loading.value && !hasNotes ? <p class="empty-state">Haz clic para crear tu primera nota.</p> : null}
          {!controller.loading.value && hasNotes && notes.length === 0 ? <p class="empty-state">Sin resultados. Crea una nota o cambia la búsqueda.</p> : null}
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              searchQuery={searchQuery}
              searchDimmed={searchQuery.length > 0 && !noteMatchesSearch(note, searchQuery)}
              selected={store.selectedNoteId.value === note.id}
              onSelect={(noteId) => { store.selectedNoteId.value = noteId; void store.bringToFront(noteId); }}
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

function noteMatchesSearch(note: { content: string; tags: string[] }, query: string) {
  const normalizedQuery = query.toLocaleLowerCase();
  return note.content.toLocaleLowerCase().includes(normalizedQuery)
    || note.tags.some((tag) => tag.toLocaleLowerCase().includes(normalizedQuery));
}
