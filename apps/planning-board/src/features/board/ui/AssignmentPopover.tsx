import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
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

  const [localTask, setLocalTask] = useState(assignment.task);
  const [localDedPct, setLocalDedPct] = useState(assignment.dedicationPct);

  useEffect(() => {
    setLocalTask(assignment.task);
    setLocalDedPct(assignment.dedicationPct);
  }, [assignment.id]);

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
          value={localTask}
          maxLength={40}
          onInput={(e) => setLocalTask((e.target as HTMLInputElement).value)}
        />
      </div>
      <div>
        <label className="assignment-popover__label" htmlFor={dedicationSliderId}>
          Dedication: {localDedPct}%
        </label>
        <div className="assignment-popover__dedication">
          <input
            id={dedicationSliderId}
            className="assignment-popover__slider"
            type="range" min={10} max={100} step={5}
            value={localDedPct}
            onInput={(e) => setLocalDedPct(Number((e.target as HTMLInputElement).value))}
          />
          <input
            className="assignment-popover__number"
            type="number" min={10} max={100} step={5}
            value={localDedPct}
            onInput={(e) => {
              const v = Number((e.target as HTMLInputElement).value);
              if (v >= 10 && v <= 100) setLocalDedPct(v);
            }}
          />
        </div>
      </div>
      <div className="assignment-popover__effort">
        <span>Slots {assignment.startSlot + 1}–{assignment.endSlot + 1}</span>
        <span className="assignment-popover__effort-total">{assignment.endSlot - assignment.startSlot + 1} slots</span>
      </div>
      <div className="assignment-popover__actions">
        <button className="assignment-popover__delete" onClick={() => deleteAssignment(assignment.id)}>
          Delete assignment
        </button>
        <div className="assignment-popover__actions-right">
          <button className="assignment-popover__cancel" onClick={() => clearTransientUi()}>Cancel</button>
          <button className="assignment-popover__save" onClick={() => {
            updateAssignment(assignment.id, { task: localTask.slice(0, 40), dedicationPct: clampDedicationPct(localDedPct) });
            clearTransientUi();
          }}>Save</button>
        </div>
      </div>
    </div>
  );

  return createPortal(popover, document.body);
}
