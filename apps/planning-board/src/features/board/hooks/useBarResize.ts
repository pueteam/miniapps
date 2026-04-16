import { useEffect, useRef } from 'preact/hooks';
import { drag } from 'd3-drag';
import { select } from 'd3-selection';
import { deltaPxToSlot, clampSlot } from '../domain/slots';
import { slotWidth } from '../state/signals';
import { updateAssignment } from '../state/actions';
import type { Assignment } from '../domain/types';

type Edge = 'left' | 'right';

interface UseBarResizeOptions {
  assignment: Assignment;
  slotCount: number;
  edge: Edge;
}

export function useBarResize(options: UseBarResizeOptions) {
  const ref = useRef<HTMLDivElement>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const barEl = el.parentElement;
    if (!(barEl instanceof HTMLDivElement)) return;

    let startX = 0;
    let origSlot = 0;
    let origLeft = 0;
    let origWidth = 0;

    const dragBehavior = drag<HTMLDivElement, unknown>()
      .on('start', (event) => {
        startX = event.x;
        const { assignment, edge } = optionsRef.current;
        origSlot = edge === 'left' ? assignment.startSlot : assignment.endSlot;
        origLeft = Number.parseFloat(barEl.style.left || '0');
        origWidth = Number.parseFloat(barEl.style.width || '0');
        barEl.classList.add('assignment-bar--resizing');
        event.sourceEvent.stopPropagation();
      })
      .on('drag', (event) => {
        const dx = event.x - startX;
        const minWidth = slotWidth.value;
        if (optionsRef.current.edge === 'left') {
          const nextLeft = Math.min(origLeft + dx, origLeft + origWidth - minWidth);
          const nextWidth = Math.max(minWidth, origWidth - dx);
          barEl.style.left = `${nextLeft}px`;
          barEl.style.width = `${nextWidth}px`;
          return;
        }
        const nextWidth = Math.max(minWidth, origWidth + dx);
        barEl.style.width = `${nextWidth}px`;
      })
      .on('end', (event) => {
        el.style.transform = '';
        barEl.style.left = `${origLeft}px`;
        barEl.style.width = `${origWidth}px`;
        barEl.classList.remove('assignment-bar--resizing');
        const dx = event.x - startX;
        const slotDelta = deltaPxToSlot(dx, slotWidth.value);
        const { assignment, edge, slotCount } = optionsRef.current;
        if (edge === 'left') {
          const newStart = clampSlot(origSlot + slotDelta, 0, slotCount - 1);
          updateAssignment(assignment.id, { startSlot: Math.min(newStart, assignment.endSlot) });
        } else {
          const newEnd = clampSlot(origSlot + slotDelta, 0, slotCount - 1);
          updateAssignment(assignment.id, { endSlot: Math.max(newEnd, assignment.startSlot) });
        }
      });

    select(el).call(dragBehavior);
    return () => { select(el).on('.drag', null); };
  }, []);

  return ref;
}
