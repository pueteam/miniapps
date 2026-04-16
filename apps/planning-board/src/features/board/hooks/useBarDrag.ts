import { useEffect, useRef } from 'preact/hooks';
import { drag } from 'd3-drag';
import { select } from 'd3-selection';
import { deltaPxToSlot, clampSlot } from '../domain/slots';
import { slotWidth } from '../state/signals';
import { updateAssignment } from '../state/actions';
import type { Assignment } from '../domain/types';

interface UseBarDragOptions {
  assignment: Assignment;
  slotCount: number;
  onClick: () => void;
}

export function useBarDrag(options: UseBarDragOptions) {
  const ref = useRef<HTMLDivElement>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let startX = 0;
    let totalDx = 0;
    let origStart = 0;
    let origEnd = 0;

    const dragBehavior = drag<HTMLDivElement, unknown>()
      .on('start', (event) => {
        startX = event.x;
        totalDx = 0;
        const { assignment } = optionsRef.current;
        origStart = assignment.startSlot;
        origEnd = assignment.endSlot;
        el.style.cursor = 'grabbing';
        event.sourceEvent.stopPropagation();
      })
      .on('drag', (event) => {
        const dx = event.x - startX;
        totalDx = dx;
        el.style.transform = `translateX(${dx}px)`;
      })
      .on('end', () => {
        el.style.cursor = '';
        if (Math.abs(totalDx) < 4) {
          el.style.transform = '';
          optionsRef.current.onClick();
          return;
        }
        const slotDelta = deltaPxToSlot(totalDx, slotWidth.value);
        const duration = origEnd - origStart;
        const { slotCount } = optionsRef.current;
        let newStart = clampSlot(origStart + slotDelta, 0, slotCount - 1);
        let newEnd = clampSlot(newStart + duration, 0, slotCount - 1);
        if (newEnd - newStart < duration) newStart = newEnd - duration;
        newStart = Math.max(0, newStart);
        el.style.transform = '';
        const { assignment } = optionsRef.current;
        updateAssignment(assignment.id, { startSlot: newStart, endSlot: newEnd });
      });

    select(el).call(dragBehavior);
    return () => { select(el).on('.drag', null); };
  }, []);

  return ref;
}
