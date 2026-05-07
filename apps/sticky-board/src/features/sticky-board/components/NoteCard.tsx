import type { JSX } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { NOTE_COLORS } from '../lib/constants';
import type { StickyNote } from '../lib/types';
import { getResizePatch, getRotationFromPointer, getRotationPatch } from '../interactions/geometry';
import { useNoteDrag } from '../interactions/useNoteDrag';

const ROTATION_LIMIT = 25;
const COLOR_LABELS: Record<string, string> = {
  '#FFF176': 'Amarillo',
  '#A5D6A7': 'Verde',
  '#90CAF9': 'Azul',
  '#FFAB91': 'Coral',
  '#CE93D8': 'Violeta',
  '#F48FB1': 'Rosa',
};

type NoteCardProps = {
  note: StickyNote;
  searchQuery: string;
  searchDimmed: boolean;
  selected: boolean;
  onSelect: (noteId: string) => void;
  onContent: (noteId: string, content: string) => void;
  onPatch: (noteId: string, patch: Partial<StickyNote>) => void;
  onGeometry: (noteId: string, patch: Partial<StickyNote>) => void;
  onCommit: (noteId: string) => void;
  onDelete: (noteId: string) => void;
};

export function NoteCard({ note, searchQuery, searchDimmed, selected, onSelect, onContent, onPatch, onGeometry, onCommit, onDelete }: NoteCardProps) {
  const [editing, setEditing] = useState(false);
  const [showRotation, setShowRotation] = useState(false);
  const [rotating, setRotating] = useState(false);
  const resizeRef = useRef<{ pointerId: number; startX: number; startY: number; width: number; height: number } | null>(null);
  const rotationRef = useRef<{ pointerId: number; centerX: number; centerY: number } | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const drag = useNoteDrag(note, { onMove: onGeometry, onCommit, onSelect });
  const rotationRadians = (note.rotation * Math.PI) / 180;

  const style = {
    left: `${note.x}px`,
    top: `${note.y}px`,
    width: `${note.width}px`,
    height: `${note.height}px`,
    zIndex: note.zIndex,
    background: note.color,
    '--rot': `${note.rotation}deg`,
    '--shadow-x': `${Math.sin(rotationRadians) * -8}px`,
    '--shadow-y': `${Math.cos(rotationRadians) * 8}px`,
    transform: editing ? 'rotate(0deg)' : `rotate(${note.rotation}deg)`,
  } as JSX.CSSProperties;
  const fixed = note.pinned;
  const showHighlight = searchQuery.trim().length > 0 && !editing;

  useEffect(() => {
    adjustTextareaHeight();
  }, [note.content, note.height]);

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
    function handlePointerMove(event: PointerEvent) {
      const rotation = rotationRef.current;
      if (!rotation || event.pointerId !== rotation.pointerId) return;
      onGeometry(note.id, getRotationPatch(getPointerRotation(event, rotation), { snap: event.shiftKey }));
    }
    function handlePointerUp(event: PointerEvent) {
      const rotation = rotationRef.current;
      if (!rotation || event.pointerId !== rotation.pointerId) return;
      rotationRef.current = null;
      setRotating(false);
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
    function handleOutsidePointer(event: MouseEvent | PointerEvent) {
      if (rootRef.current?.contains(event.target as Node)) return;
      setEditing(false);
      setShowRotation(false);
      onCommit(note.id);
    }
    window.addEventListener('mousedown', handleOutsidePointer);
    window.addEventListener('pointerdown', handleOutsidePointer);
    return () => {
      window.removeEventListener('mousedown', handleOutsidePointer);
      window.removeEventListener('pointerdown', handleOutsidePointer);
    };
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

  function getPointerRotation(event: PointerEvent, center = rotationRef.current) {
    if (!center) return note.rotation;
    return getRotationFromPointer(center, event);
  }

  function adjustTextareaHeight() {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, note.height - 64)}px`;
  }

  function handleContentInput(event: Event) {
    const textarea = event.currentTarget as HTMLTextAreaElement;
    adjustTextareaHeight();
    onContent(note.id, textarea.value);
  }

  function startRotation(event: PointerEvent) {
    if (fixed) return;
    event.preventDefault();
    event.stopPropagation();
    onSelect(note.id);
    setShowRotation(true);
    setRotating(true);
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    rotationRef.current = { pointerId: event.pointerId, centerX: rect.left + rect.width / 2, centerY: rect.top + rect.height / 2 };
    onGeometry(note.id, getRotationPatch(getPointerRotation(event), { snap: event.shiftKey }));
  }

  // Arc progress for the minimal dial: maps rotation (-35..+35) to 0..1
  const arcProgress = (note.rotation + ROTATION_LIMIT) / (ROTATION_LIMIT * 2);
  const dialSize = 52;
  const dialRadius = 20;
  const cx = dialSize / 2;
  const cy = dialSize / 2;
  // Arc from -35° to +35° visually (spanning 250° of the circle, centered at top)
  const arcSpan = 250;
  const startAngleDeg = -90 - arcSpan / 2;
  const endAngleDeg = -90 + arcSpan / 2;
  const thumbAngleDeg = startAngleDeg + arcSpan * arcProgress;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const arcStartX = cx + dialRadius * Math.cos(toRad(startAngleDeg));
  const arcStartY = cy + dialRadius * Math.sin(toRad(startAngleDeg));
  const arcEndX = cx + dialRadius * Math.cos(toRad(endAngleDeg));
  const arcEndY = cy + dialRadius * Math.sin(toRad(endAngleDeg));
  const thumbX = cx + dialRadius * Math.cos(toRad(thumbAngleDeg));
  const thumbY = cy + dialRadius * Math.sin(toRad(thumbAngleDeg));

  return (
    <article
      ref={rootRef}
      class={`sticky-note ${selected ? 'sticky-note--selected' : ''} ${fixed ? 'sticky-note--fixed' : ''} ${editing ? 'sticky-note--editing' : ''} ${rotating ? 'sticky-note--rotating' : ''} ${searchDimmed ? 'sticky-note--search-dimmed' : ''} ${showHighlight ? 'sticky-note--searching' : ''}`}
      style={style}
      aria-label={searchDimmed ? 'Nota sticky sin coincidencia de busqueda' : 'Nota sticky'}
    >
      {note.pinned ? <span class="sticky-note__pin" aria-hidden="true" /> : null}

      <header class="sticky-note__grip" onPointerDown={editing ? undefined : drag.onPointerDown}>
        {!note.pinned ? (
          <button
            type="button"
            class={`icon-button icon-button--rotate ${showRotation ? 'icon-button--active' : ''}`}
            aria-label="Girar nota"
            aria-pressed={showRotation}
            onPointerDown={stopControlPointer}
            onClick={() => setShowRotation((v) => !v)}
          >
            <RotateIcon />
          </button>
        ) : <span class="icon-button-placeholder" />}
        <span class="sticky-note__grip-label">{note.pinned ? 'Fijada' : 'Mover'}</span>
        <button
          type="button"
          class="icon-button"
          aria-label={note.pinned ? 'Desfijar nota' : 'Fijar nota'}
          aria-pressed={note.pinned}
          onPointerDown={stopControlPointer}
          onClick={togglePinned}
        >
          {note.pinned ? <LockIcon /> : <PinIcon />}
        </button>
      </header>

      {showRotation && !note.pinned ? (
        <div class="rotate-control rotate-control--popover" onPointerDown={stopControlPointer}>
          {/* Minimal arc dial */}
          <button
            type="button"
            class="rotation-dial"
            aria-label="Dial de rotacion de la nota"
            onPointerDown={startRotation}
          >
            <svg aria-hidden="true" width={dialSize} height={dialSize} viewBox={`0 0 ${dialSize} ${dialSize}`} fill="none">
              {/* Track arc */}
              <path
                class="rotation-dial__track"
                d={`M ${arcStartX} ${arcStartY} A ${dialRadius} ${dialRadius} 0 1 1 ${arcEndX} ${arcEndY}`}
                fill="none"
              />
              {/* Limit ticks */}
              <circle cx={arcStartX} cy={arcStartY} r="2" class="rotation-dial__tick" />
              <circle cx={arcEndX} cy={arcEndY} r="2" class="rotation-dial__tick" />
              {/* Center zero line */}
              <line
                x1={cx}
                y1={cy - dialRadius + 4}
                x2={cx}
                y2={cy - dialRadius - 2}
                class="rotation-dial__zero"
              />
              {/* Thumb */}
              <circle cx={thumbX} cy={thumbY} r="3.5" class="rotation-dial__thumb" />
            </svg>
          </button>
          <span class="rotation-dial__value">{note.rotation > 0 ? '+' : ''}{Math.round(note.rotation)}°</span>
        </div>
      ) : null}

      {note.pinned ? <div class="sticky-note__overlay" aria-hidden="true" /> : null}
      {showHighlight ? <div class="sticky-note__content-highlight" aria-hidden="true">{renderHighlightedContent(note.content, searchQuery)}</div> : null}
      <textarea
        ref={textareaRef}
        aria-label="Contenido de la nota"
        value={note.content}
        readOnly={fixed || !editing}
        placeholder="Escribe aquí..."
        onFocus={() => onSelect(note.id)}
        onDblClick={() => setEditing(!fixed)}
        onBlur={() => { setEditing(false); onCommit(note.id); }}
        onInput={handleContentInput}
      />
      {selected && !fixed ? (
        <footer class="sticky-note__controls">
          <div class="color-row" aria-label="Cambiar color de la nota">
            {NOTE_COLORS.map((color) => {
              const active = note.color === color;
              const label = COLOR_LABELS[color] ?? color;
              return (
                <button
                  key={color}
                  class={`color-dot ${active ? 'color-dot--active' : ''}`}
                  type="button"
                  style={{ background: color }}
                  aria-label={`Color ${label}${active ? ' activo' : ''}`}
                  aria-pressed={active}
                  title={label}
                  onClick={() => onPatch(note.id, { color })}
                >
                  {active ? '✓' : ''}
                </button>
              );
            })}
          </div>
          <button type="button" class="delete-btn" aria-label="Borrar nota" title="Eliminar" onClick={deleteWithConfirmation}><DeleteIcon /></button>
        </footer>
      ) : null}
      {!fixed ? <button type="button" class="resize-handle" aria-label="Redimensionar nota" onPointerDown={startResize}><ResizeIcon /></button> : null}
    </article>
  );
}

function renderHighlightedContent(content: string, query: string) {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return content;
  const matchIndex = content.toLocaleLowerCase().indexOf(trimmedQuery.toLocaleLowerCase());
  if (matchIndex === -1) return content;
  const before = content.slice(0, matchIndex);
  const match = content.slice(matchIndex, matchIndex + trimmedQuery.length);
  const after = content.slice(matchIndex + trimmedQuery.length);

  return (
    <>
      {before}<mark class="sticky-note__highlight">{match}</mark>{after}
    </>
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
