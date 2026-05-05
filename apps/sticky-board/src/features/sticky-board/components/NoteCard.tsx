import { useEffect, useRef, useState } from 'preact/hooks';
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
  const [editing, setEditing] = useState(false);
  const [showRotation, setShowRotation] = useState(false);
  const resizeRef = useRef<{ pointerId: number; startX: number; startY: number; width: number; height: number } | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);
  const drag = useNoteDrag(note, { onMove: onGeometry, onCommit, onSelect });
  const style = {
    left: `${note.x}px`,
    top: `${note.y}px`,
    width: `${note.width}px`,
    height: `${note.height}px`,
    zIndex: note.zIndex,
    background: note.color,
    transform: editing ? 'rotate(0deg)' : `rotate(${note.rotation}deg)`,
  };
  const fixed = note.pinned;

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      const resize = resizeRef.current;
      if (!resize || event.pointerId !== resize.pointerId) return;
      onGeometry(note.id, getResizePatch({ width: resize.width, height: resize.height }, { deltaX: event.clientX - resize.startX, deltaY: event.clientY - resize.startY }));
    }

    function handlePointerUp(event: PointerEvent) {
      const resize = resizeRef.current;
      if (!resize || event.pointerId !== resize.pointerId) return;
      resizeRef.current = null;
      onCommit(note.id);
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [note.id, onCommit, onGeometry]);

  useEffect(() => {
    function handleOutsideMouseDown(event: MouseEvent) {
      if (rootRef.current?.contains(event.target as Node)) return;
      setEditing(false);
      setShowRotation(false);
      onCommit(note.id);
    }

    window.addEventListener('mousedown', handleOutsideMouseDown);
    return () => window.removeEventListener('mousedown', handleOutsideMouseDown);
  }, [note.id, onCommit]);

  function stopControlPointer(event: PointerEvent) {
    event.stopPropagation();
  }

  function togglePinned() {
    const pinned = !note.pinned;
    onPatch(note.id, { pinned });
    if (pinned) setShowRotation(false);
  }

  function deleteWithConfirmation() {
    if (!window.confirm('Quieres eliminar este post-it?')) return;
    onDelete(note.id);
  }

  function startResize(event: PointerEvent) {
    if (fixed) return;
    event.preventDefault();
    event.stopPropagation();
    onSelect(note.id);
    resizeRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, width: note.width, height: note.height };
  }

  return (
    <article ref={rootRef} class={`sticky-note ${selected ? 'sticky-note--selected' : ''} ${fixed ? 'sticky-note--fixed' : ''} ${editing ? 'sticky-note--editing' : ''}`} style={style} aria-label="Nota sticky">
      {note.pinned ? <span class="sticky-note__pin" aria-hidden="true" /> : null}
      <header class="sticky-note__grip" onPointerDown={editing ? undefined : drag.onPointerDown}>
        {!note.pinned ? (
          <button type="button" class="icon-button icon-button--rotate" aria-label="Girar nota" aria-pressed={showRotation} onPointerDown={stopControlPointer} onClick={() => setShowRotation((value) => !value)}><RotateIcon /></button>
        ) : <span class="icon-button-placeholder" />}
        <span class="sticky-note__grip-label">{note.pinned ? 'Fijada' : 'Mover'}</span>
        <button type="button" class="icon-button" aria-label={note.pinned ? 'Desfijar nota' : 'Fijar nota'} aria-pressed={note.pinned} onPointerDown={stopControlPointer} onClick={togglePinned}>{note.pinned ? <LockIcon /> : <PinIcon />}</button>
      </header>
      {showRotation && !note.pinned ? (
        <label class="rotate-control rotate-control--popover" onPointerDown={stopControlPointer}>
          <RotateIcon />
          <input aria-label="Rotacion de la nota" type="range" min="-35" max="35" value={note.rotation} onInput={(event) => onGeometry(note.id, getRotationPatch(Number((event.currentTarget as HTMLInputElement).value)))} onChange={() => onCommit(note.id)} />
          <span>{note.rotation > 0 ? '+' : ''}{note.rotation}°</span>
        </label>
      ) : null}
      {note.pinned ? <div class="sticky-note__overlay" aria-hidden="true" /> : null}
      <textarea
        aria-label="Contenido de la nota"
        value={note.content}
        readOnly={fixed || !editing}
        placeholder="Escribe aqui..."
        onFocus={() => onSelect(note.id)}
        onDblClick={() => setEditing(!fixed)}
        onBlur={() => { setEditing(false); onCommit(note.id); }}
        onInput={(event) => onContent(note.id, (event.currentTarget as HTMLTextAreaElement).value)}
      />
      {selected && !fixed ? <footer class="sticky-note__controls">
        <div class="color-row" aria-label="Cambiar color de la nota">
          {NOTE_COLORS.map((color) => (
            <button key={color} class="color-dot" type="button" style={{ background: color }} aria-label={`Color ${color}`} onClick={() => onPatch(note.id, { color })} />
          ))}
        </div>
        <button type="button" class="delete-btn" aria-label="Borrar nota" title="Eliminar" onClick={deleteWithConfirmation}><DeleteIcon /></button>
      </footer> : null}
      {!fixed ? <button type="button" class="resize-handle" aria-label="Redimensionar nota" onPointerDown={startResize}><ResizeIcon /></button> : null}
    </article>
  );
}

function RotateIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M13 3.5A6.5 6.5 0 1 1 6 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      <path d="M6 0v4l3-2-3-2z" fill="currentColor" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5l1.4 3.4H13l-2.7 2.2.9 3.6L8 8.7l-3.2 2 .9-3.6L3 4.9h3.6L8 1.5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="2.5" y="7" width="11" height="7.5" rx="1.5" stroke="currentColor" stroke-width="1.7" />
      <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
      <circle cx="8" cy="10.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 16 16" fill="none">
      <path d="M2 4h12M5 4V2.5h6V4M6 7.5v4M10 7.5v4M3 4l1 9.5h8L13 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  );
}

function ResizeIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M4 12L12 4M8 12L12 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
    </svg>
  );
}
