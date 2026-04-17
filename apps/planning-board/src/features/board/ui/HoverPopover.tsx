import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
import { assignments, hoveredBarState, profiles, contextMenuTarget, editingAssignmentId } from '../state/signals';
import './HoverPopover.css';

export function HoverPopover(): h.JSX.Element | null {
  const state = hoveredBarState.value;
  const ref = useRef<HTMLDivElement>(null);
  if (!state || contextMenuTarget.value || editingAssignmentId.value !== null) return null;

  const assignment = assignments.value.find((a) => a.id === state.assignmentId);
  if (!assignment) return null;
  const profile = profiles.value.find((p) => p.id === assignment.profileId);

  useEffect(() => {
    if (!state.anchorEl || !ref.current) return;
    const updatePos = async () => {
      if (!state.anchorEl || !ref.current) return;
      const { x, y } = await computePosition(state.anchorEl, ref.current, {
        strategy: 'fixed', placement: 'bottom-start', middleware: [offset(10), flip(), shift({ padding: 8 })],
      });
      if (ref.current) { ref.current.style.left = `${x}px`; ref.current.style.top = `${y}px`; }
    };
    void updatePos();
    return autoUpdate(state.anchorEl, ref.current, updatePos);
  }, [state]);

  return (
    <div ref={ref} className="hover-popover hover-popover--visible" style={{ left: '0px', top: '0px', zIndex: 50 }}>
      <div className="hover-popover__header">
        <span className="hover-popover__dot" style={{ background: profile?.color ?? 'var(--board-accent)' }} />
        <div className="hover-popover__title">{assignment.task}</div>
      </div>
      <div className="hover-popover__row">
        <span className="hover-popover__lbl">Profile</span>
        <span className="hover-popover__val">{profile?.name ?? 'Unknown'}</span>
      </div>
      <div className="hover-popover__row">
        <span className="hover-popover__lbl">Dedication</span>
        <span className="hover-popover__val">{assignment.dedicationPct}%</span>
      </div>
      <div className="hover-popover__row">
        <span className="hover-popover__lbl">Slots</span>
        <span className="hover-popover__val">{assignment.startSlot + 1}–{assignment.endSlot + 1}</span>
      </div>
      <div className="hover-popover__row">
        <span className="hover-popover__lbl">Total Slots</span>
        <span className="hover-popover__val">{(assignment.endSlot - assignment.startSlot + 1)}</span>
      </div>
      <div className="hover-popover__track">
        <div className="hover-popover__fill" style={{ width: `${assignment.dedicationPct}%`, background: profile?.color ?? 'var(--board-accent)' }} />
      </div>
    </div>
  );
}
