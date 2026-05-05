import { useEffect, useRef } from 'preact/hooks';
import { getDragPatch } from './geometry';
import type { StickyNote } from '../lib/types';

type DragHandlers = {
  onMove: (noteId: string, patch: { x: number; y: number }) => void;
  onCommit: (noteId: string) => void;
  onSelect: (noteId: string) => void;
};

export function useNoteDrag(note: StickyNote, handlers: DragHandlers) {
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; originX: number; originY: number } | null>(null);

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      handlers.onMove(note.id, getDragPatch({ x: drag.originX, y: drag.originY }, { deltaX: event.clientX - drag.startX, deltaY: event.clientY - drag.startY }) as { x: number; y: number });
    }

    function handlePointerUp(event: PointerEvent) {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      dragRef.current = null;
      handlers.onCommit(note.id);
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlers, note.id]);

  function onPointerDown(event: PointerEvent) {
    if (note.pinned) return;
    event.preventDefault();
    handlers.onSelect(note.id);
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, originX: note.x, originY: note.y };
  }

  return { onPointerDown };
}
