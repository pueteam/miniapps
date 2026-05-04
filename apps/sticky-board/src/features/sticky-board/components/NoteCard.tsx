import { NOTE_COLORS } from '../lib/constants';
import type { StickyNote } from '../lib/types';
import { getResizePatch, getRotationPatch } from '../interactions/geometry';
import { useNoteDrag } from '../interactions/useNoteDrag';

type NoteCardProps = {
  note: StickyNote;
  selected: boolean;
  onSelect: (noteId: string) => void;
  onContent: (noteId: string, content: string) => void;
  onPatch: (noteId: string, patch: Partial<StickyNote>) => void;
  onGeometry: (noteId: string, patch: Partial<StickyNote>) => void;
  onCommit: (noteId: string) => void;
  onDelete: (noteId: string) => void;
};

export function NoteCard({ note, selected, onSelect, onContent, onPatch, onGeometry, onCommit, onDelete }: NoteCardProps) {
  const drag = useNoteDrag(note, { onMove: onGeometry, onCommit, onSelect });
  const style = {
    left: `${note.x}px`,
    top: `${note.y}px`,
    width: `${note.width}px`,
    height: `${note.height}px`,
    zIndex: note.zIndex,
    background: note.color,
    transform: `rotate(${note.rotation}deg)`,
  };

  function resize(deltaX: number, deltaY: number) {
    onGeometry(note.id, getResizePatch(note, { deltaX, deltaY }));
    onCommit(note.id);
  }

  return (
    <article class={`sticky-note ${selected ? 'sticky-note--selected' : ''} ${note.locked ? 'sticky-note--locked' : ''}`} style={style} aria-label="Nota sticky">
      <header class="sticky-note__grip" onPointerDown={drag.onPointerDown}>
        <span>{note.pinned ? 'Fijada' : 'Mover'}</span>
        <button type="button" aria-label="Traer nota al frente" onClick={() => onPatch(note.id, { zIndex: note.zIndex + 100 })}>Arriba</button>
      </header>
      <textarea
        aria-label="Contenido de la nota"
        value={note.content}
        readOnly={note.locked}
        onFocus={() => onSelect(note.id)}
        onInput={(event) => onContent(note.id, (event.currentTarget as HTMLTextAreaElement).value)}
      />
      <footer class="sticky-note__controls">
        <div class="color-row" aria-label="Cambiar color de la nota">
          {NOTE_COLORS.map((color) => (
            <button key={color} class="color-dot" type="button" style={{ background: color }} aria-label={`Color ${color}`} disabled={note.locked} onClick={() => onPatch(note.id, { color })} />
          ))}
        </div>
        <label class="rotate-control">
          Rotar
          <input type="range" min="-18" max="18" value={note.rotation} disabled={note.locked} onInput={(event) => onGeometry(note.id, getRotationPatch(Number((event.currentTarget as HTMLInputElement).value)))} onChange={() => onCommit(note.id)} />
        </label>
        <div class="size-row" aria-label="Cambiar tamaño">
          <button type="button" disabled={note.locked} onClick={() => resize(-30, -20)}>Menos</button>
          <button type="button" disabled={note.locked} onClick={() => resize(30, 20)}>Mas</button>
        </div>
        <div class="flag-row">
          <button type="button" aria-pressed={note.pinned} onClick={() => onPatch(note.id, { pinned: !note.pinned })}>{note.pinned ? 'Desfijar' : 'Fijar'}</button>
          <button type="button" aria-pressed={note.locked} onClick={() => onPatch(note.id, { locked: !note.locked })}>{note.locked ? 'Desbloquear' : 'Bloquear'}</button>
          <button type="button" class="danger" onClick={() => onDelete(note.id)}>Borrar</button>
        </div>
      </footer>
    </article>
  );
}
