import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { computePosition, flip, offset, shift } from '@floating-ui/dom';
import { assignments, contextMenuTarget } from '../state/signals';
import { clearTransientUi, deleteAssignment, duplicateAssignment, setEditingAssignmentId } from '../state/actions';
import './ContextMenu.css';

export function ContextMenu(): h.JSX.Element | null {
  const target = contextMenuTarget.value;
  const ref = useRef<HTMLDivElement>(null);
  if (!target) return null;
  const assignment = assignments.value.find((a) => a.id === target.assignmentId);
  if (!assignment) return null;

  useEffect(() => {
    const virtualAnchor = { getBoundingClientRect: () => new DOMRect(target.x, target.y, 0, 0) };
    const updatePos = async () => {
      if (!ref.current) return;
      const { x, y } = await computePosition(virtualAnchor as Element, ref.current, {
        strategy: 'fixed', placement: 'bottom-start', middleware: [offset(8), flip(), shift({ padding: 8 })],
      });
      if (ref.current) { ref.current.style.left = `${x}px`; ref.current.style.top = `${y}px`; }
    };
    void updatePos();

    const handleMouseDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) clearTransientUi(); };
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') clearTransientUi(); };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    ref.current?.querySelector<HTMLButtonElement>('button')?.focus();
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [target.x, target.y]);

  return (
    <div ref={ref} className="context-menu context-menu--visible" role="menu" aria-label="Assignment actions" style={{ left: '0px', top: '0px', zIndex: 60 }}>
      <button role="menuitem" className="context-menu__action" onClick={() => { clearTransientUi(); setEditingAssignmentId(assignment.id); }}>Edit</button>
      <button role="menuitem" className="context-menu__action" onClick={() => { duplicateAssignment(assignment.id); clearTransientUi(); }}>Duplicate</button>
      <button role="menuitem" className="context-menu__action context-menu__action--danger" onClick={() => { deleteAssignment(assignment.id); clearTransientUi(); }}>Delete</button>
    </div>
  );
}
