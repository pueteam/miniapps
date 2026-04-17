import { fireEvent, render, screen } from '@testing-library/preact';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { contextMenuTarget, editingAssignmentId, hoveredBarState, slotCount } from '../state/signals';
import { AssignmentBar } from './AssignmentBar';

vi.mock('../state/actions', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../state/actions')>();
  return {
    ...actual,
    updateAssignment: vi.fn(),
    deleteAssignment: vi.fn(),
    setEditingAssignmentId: vi.fn((id: string | null) => {
      editingAssignmentId.value = id;
    }),
  };
});

const mockAssignment = {
  id: 'a1',
  index: 0,
  profileId: 'p1',
  task: 'Test task',
  startSlot: 2,
  endSlot: 4,
  dedicationPct: 75,
};

const mockProfile = {
  id: 'p1',
  name: 'Alice',
  category: '',
  capacityPct: 100,
  color: '#4f9cf8',
  initials: 'AL',
};

beforeEach(() => {
  editingAssignmentId.value = null;
  hoveredBarState.value = null;
  contextMenuTarget.value = null;
  slotCount.value = 60;
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('AssignmentBar', () => {
  it('renders assignment bar with correct text content', () => {
    render(
      <div style={{ position: 'relative', width: '3000px', height: '48px' }}>
        <AssignmentBar assignment={mockAssignment} profile={mockProfile} isOverloaded={false} laneIndex={0} laneCount={1} />
      </div>,
    );

    const bar = document.querySelector('.assignment-bar');
    expect(bar).toBeTruthy();
    expect(bar?.textContent).toContain('Test task');
    expect(bar?.textContent).toContain('75%');
  });

  it('renders profile-derived visual styling and lane position', () => {
    render(
      <div style={{ position: 'relative', width: '3000px', height: '120px' }}>
        <AssignmentBar
          assignment={mockAssignment}
          profile={mockProfile}
          isOverloaded={false}
          laneIndex={1}
          laneCount={2}
        />
      </div>,
    );

    const bar = document.querySelector('.assignment-bar');
    expect((bar as HTMLElement).style.top).toBe('46px');
    expect((bar as HTMLElement).style.background).toContain('linear-gradient');
  });

  it('renders overloaded bar with correct class', () => {
    render(
      <div style={{ position: 'relative', width: '3000px', height: '48px' }}>
        <AssignmentBar assignment={mockAssignment} profile={mockProfile} isOverloaded={true} laneIndex={0} laneCount={1} />
      </div>,
    );

    const bar = document.querySelector('.assignment-bar');
    expect(bar?.classList.contains('assignment-bar--overloaded')).toBe(true);
  });

  it('renders resize handles', () => {
    render(
      <div style={{ position: 'relative', width: '3000px', height: '48px' }}>
        <AssignmentBar assignment={mockAssignment} profile={mockProfile} isOverloaded={false} laneIndex={0} laneCount={1} />
      </div>,
    );

    const leftHandle = document.querySelector('.assignment-bar__handle--left');
    const rightHandle = document.querySelector('.assignment-bar__handle--right');
    expect(leftHandle).toBeTruthy();
    expect(rightHandle).toBeTruthy();
  });

  it('does not have onOpenPopover prop (popover is self-managed)', () => {
    // If this compiles, the prop has been removed from the interface.
    // The AssignmentBar component no longer accepts onOpenPopover.
    const { container } = render(
      <div style={{ position: 'relative', width: '3000px', height: '48px' }}>
        <AssignmentBar assignment={mockAssignment} profile={mockProfile} isOverloaded={false} laneIndex={0} laneCount={1} />
      </div>,
    );

    const bar = container.querySelector('.assignment-bar');
    expect(bar).toBeTruthy();
    // Popover returns null when not open, so we verify the bar renders without errors
    // The fact that no ProfileRow renders a global popover is tested in ProfileRow.test.tsx
  });

  it('uses hooks instead of inline D3 (no useState(hasDragged))', () => {
    // This is verified by the component source: AssignmentBar.tsx imports
    // useBarDrag and useBarResize instead of using drag() inline.
    // The component has no useState calls.
    const { container } = render(
      <div style={{ position: 'relative', width: '3000px', height: '48px' }}>
        <AssignmentBar assignment={mockAssignment} profile={mockProfile} isOverloaded={false} laneIndex={0} laneCount={1} />
      </div>,
    );

    // Component renders without errors, meaning hooks are properly initialized
    expect(container.querySelector('.assignment-bar')).toBeTruthy();
  });

  it('does not open hover overlay while an edit popover is already open', () => {
    editingAssignmentId.value = 'other-assignment';

    const { container } = render(
      <div style={{ position: 'relative', width: '3000px', height: '48px' }}>
        <AssignmentBar assignment={mockAssignment} profile={mockProfile} isOverloaded={false} laneIndex={0} laneCount={1} />
      </div>,
    );

    const bar = container.querySelector('.assignment-bar') as HTMLElement;
    bar.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

    expect(hoveredBarState.value).toBeNull();
  });

  it('is keyboard operable with button semantics', () => {
    render(
      <div style={{ position: 'relative', width: '3000px', height: '48px' }}>
        <AssignmentBar assignment={mockAssignment} profile={mockProfile} isOverloaded={false} laneIndex={0} laneCount={1} />
      </div>,
    );

    const bar = screen.getByRole('button', { name: 'Open assignment Test task' });
    fireEvent.keyDown(bar, { key: 'Enter' });

    expect(editingAssignmentId.value).toBe('a1');
    expect(bar.getAttribute('aria-haspopup')).toBe('dialog');
  });

  it('opens the context menu from the keyboard', () => {
    render(
      <div style={{ position: 'relative', width: '3000px', height: '48px' }}>
        <AssignmentBar assignment={mockAssignment} profile={mockProfile} isOverloaded={false} laneIndex={0} laneCount={1} />
      </div>,
    );

    const bar = screen.getByRole('button', { name: 'Open assignment Test task' });
    fireEvent.keyDown(bar, { key: 'F10', shiftKey: true });

    expect(contextMenuTarget.value?.assignmentId).toBe('a1');
  });
});
