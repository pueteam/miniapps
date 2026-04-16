import { h } from 'preact';
import { slotWidth, slotCount, hoveredBarState, contextMenuTarget, editingAssignmentId } from '../state/signals';
import { clearTransientUi, setEditingAssignmentId } from '../state/actions';
import { slotToPx } from '../domain/slots';
import { hexToRgba } from '../domain/color';
import { useBarDrag } from '../hooks/useBarDrag';
import { useBarResize } from '../hooks/useBarResize';
import { AssignmentPopover } from './AssignmentPopover';
import type { Assignment, Profile } from '../domain/types';
import { useRef } from 'preact/hooks';
import './AssignmentBar.css';

interface Props {
  assignment: Assignment;
  profile: Profile;
  isOverloaded: boolean;
  laneIndex: number;
  laneCount: number;
}

export function AssignmentBar({ assignment, profile, isOverloaded, laneIndex, laneCount }: Props): h.JSX.Element {
  const count = slotCount.value;
  const widthPx = slotWidth.value;
  const barRef = useRef<HTMLDivElement>(null);

  const openPopover = () => { clearTransientUi(); setEditingAssignmentId(assignment.id); };

  const openKeyboardContextMenu = () => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    clearTransientUi();
    contextMenuTarget.value = { assignmentId: assignment.id, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  };

  const dragRef = useBarDrag({ assignment, slotCount: count, onClick: openPopover });
  const leftRef = useBarResize({ assignment, slotCount: count, edge: 'left' });
  const rightRef = useBarResize({ assignment, slotCount: count, edge: 'right' });

  const left = slotToPx(assignment.startSlot, widthPx);
  const width = slotToPx(assignment.endSlot - assignment.startSlot + 1, widthPx);
  const top = laneCount > 1 ? 8 + laneIndex * 38 : 8;

  return (
    <div
      ref={(node) => { dragRef.current = node; barRef.current = node; }}
      data-assignment-id={assignment.id}
      className={`assignment-bar ${isOverloaded ? 'assignment-bar--overloaded' : ''}`}
      role="button"
      tabIndex={0}
      aria-label={`Open assignment ${assignment.task}`}
      aria-haspopup="dialog"
      aria-expanded={editingAssignmentId.value === assignment.id}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPopover(); return; }
        if ((e.key === 'F10' && e.shiftKey) || e.key === 'ContextMenu') { e.preventDefault(); openKeyboardContextMenu(); }
      }}
      onContextMenu={(e) => {
        e.preventDefault(); e.stopPropagation(); clearTransientUi();
        contextMenuTarget.value = { assignmentId: assignment.id, x: e.clientX, y: e.clientY };
      }}
      onMouseEnter={() => {
        if (!barRef.current || contextMenuTarget.value || editingAssignmentId.value !== null || hoveredBarState.value?.assignmentId === assignment.id) return;
        hoveredBarState.value = { assignmentId: assignment.id, rect: barRef.current.getBoundingClientRect(), anchorEl: barRef.current };
      }}
      onMouseMove={() => {
        if (!barRef.current || hoveredBarState.value?.assignmentId !== assignment.id) return;
        hoveredBarState.value = { assignmentId: assignment.id, rect: barRef.current.getBoundingClientRect(), anchorEl: barRef.current };
      }}
      onMouseLeave={() => { if (hoveredBarState.value?.assignmentId === assignment.id) hoveredBarState.value = null; }}
      style={{
        left: `${left}px`,
        width: `${width - 2}px`,
        top: `${top}px`,
        background: `linear-gradient(135deg, ${profile.color}, ${hexToRgba(profile.color, 0.75)})`,
        borderColor: hexToRgba(profile.color, 0.4),
        marginLeft: '1px',
        marginRight: '1px',
      }}
    >
      <div ref={leftRef} className="assignment-bar__handle assignment-bar__handle--left" />
      <div className="assignment-bar__body">
        <span className="assignment-bar__text">{assignment.task}</span>
        <span className="assignment-bar__badges">
          <span className="assignment-bar__eff-badge">{assignment.dedicationPct}%</span>
        </span>
      </div>
      <div className="assignment-bar__track">
        <div className="assignment-bar__fill" style={{ width: `${assignment.dedicationPct}%`, background: profile.color }} />
      </div>
      <div ref={rightRef} className="assignment-bar__handle assignment-bar__handle--right" />
      <AssignmentPopover assignment={assignment} anchorRef={barRef} />
    </div>
  );
}
