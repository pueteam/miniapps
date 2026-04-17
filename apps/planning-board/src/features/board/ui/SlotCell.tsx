import { h } from 'preact';
import { useState, useRef, useEffect } from 'preact/hooks';
import { createAssignment } from '../state/actions';
import './SlotCell.css';

interface Props {
  overloaded: boolean;
  isMilestone?: boolean;
  height?: number;
  profileId?: string;
  slotIndex?: number;
}

export function SlotCell({ overloaded, isMilestone = false, height, profileId, slotIndex }: Props): h.JSX.Element {
  const [showAddButton, setShowAddButton] = useState(false);
  const hoverTimeoutRef = useRef<number | null>(null);

  const handleMouseEnter = () => {
    if (!profileId || slotIndex === undefined) return;
    hoverTimeoutRef.current = window.setTimeout(() => {
      setShowAddButton(true);
    }, 200);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current !== null) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setShowAddButton(false);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current !== null) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleAddAssignment = async (event: MouseEvent) => {
    event.stopPropagation();
    if (!profileId || slotIndex === undefined) return;
    await createAssignment(profileId, slotIndex, slotIndex);
  };

  const className = ['slot-cell', overloaded ? 'slot-cell--overloaded' : '', isMilestone ? 'slot-cell--milestone' : ''].filter(Boolean).join(' ');
  return (
    <div
      className={className}
      style={height ? { height: `${height}px` } : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showAddButton && profileId && slotIndex !== undefined && (
        <button
          className="slot-cell__add-btn"
          type="button"
          aria-label={`Add assignment at slot ${slotIndex + 1}`}
          onClick={handleAddAssignment}
        >
          +
        </button>
      )}
    </div>
  );
}
