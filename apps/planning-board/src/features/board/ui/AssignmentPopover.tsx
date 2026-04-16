import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
import { createPortal } from 'preact/compat';
import { editingAssignmentId } from '../state/signals';
import { clampDedicationPct } from '../domain/slots';
import { updateAssignment, deleteAssignment, clearTransientUi } from '../state/actions';
import type { Assignment } from '../domain/types';
import './AssignmentPopover.css';

interface Props {
  assignment: Assignment;
  anchorRef: { current: HTMLElement | null };
}

export function AssignmentPopover({ assignment, anchorRef }: Props): h.JSX.Element | null {
  const ref = useRef<HTMLDivElement>(null);
  const taskInputRef = useRef<HTMLInputElement>(null);
  const isOpen = editingAssignmentId.value === assignment.id;
  const taskInputId = `pop-task-${assignment.id}`;
  const dedicationSliderId = `pop-ded-${assignment.id}`;

  useEffect(() => {
    if (!isOpen || !ref.current || !anchorRef.current) return;
    const updatePos = async () => {
      if (!ref.current || !anchorRef.current) return;
      const { x, y } = await computePosition(anchorRef.current, ref.current, {
        strategy: 'fixed', placement: 'bottom-start', middleware: [offset(8), flip(), shift({ padding: 8 })],
      });
      if (ref.current) { ref.current.style.left = `${x}px`; ref.current.style.top = `${y}px`; }
    };
    void updatePos();
    return autoUpdate(anchorRef.current, ref.current, updatePos);
  }, [anchorRef, isOpen, assignment.id]);

  useEffect(() => { if (isOpen) taskInputRef.current?.focus(); }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (ref.current && !ref.current.contains(target)) {
        const bar = anchorRef.current;
        if (!bar || !bar.contains(target)) clearTransientUi();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [anchorRef, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') clearTransientUi(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  if (!isOpen) return null;

  const popover = (
    <div
      ref={ref}
      className="assignment-popover assignment-popover--visible"
      role="dialog"
      aria-modal={false}
      aria-label="Edit assignment"
      style={{ left: '0px', top: '0px', zIndex: 70 }}
    >
      <div>
        <label className="assignment-popover__label" htmlFor={taskInputId}>Task name</label>
        <input
          ref={taskInputRef}
          id={taskInputId}
          className="assignment-popover__input"
          type="text"
          defaultValue={assignment.task}
          key={assignment.id + '-task'}
          maxLength={40}
          onBlur={(e) => {
            const val = (e.target as HTMLInputElement).value.slice(0, 40);
            if (val !== assignment.task) updateAssignment(assignment.id, { task: val });
          }}
        />
      </div>
      <div>
        <label className="assignment-popover__label" htmlFor={dedicationSliderId}>
          Dedication: {assignment.dedicationPct}%
        </label>
        <div className="assignment-popover__dedication">
          <input
            id={dedicationSliderId}
            className="assignment-popover__slider"
            type="range" min={10} max={100} step={5}
            value={assignment.dedicationPct}
            onInput={(e) => updateAssignment(assignment.id, { dedicationPct: clampDedicationPct(Number((e.target as HTMLInputElement).value)) })}
          />
          <input
            className="assignment-popover__number"
            type="number" min={10} max={100} step={5}
            value={assignment.dedicationPct}
            onBlur={(e) => updateAssignment(assignment.id, { dedicationPct: clampDedicationPct(Number((e.target as HTMLInputElement).value)) })}
          />
        </div>
      </div>
      <div className="assignment-popover__effort">Slots {assignment.startSlot + 1}–{assignment.endSlot + 1}</div>
      <button className="assignment-popover__delete" onClick={() => deleteAssignment(assignment.id)}>
        Delete assignment
      </button>
    </div>
  );

  return createPortal(popover, document.body);
}
