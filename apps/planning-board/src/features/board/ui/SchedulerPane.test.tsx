import { fireEvent, render } from '@testing-library/preact';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { contextMenuTarget, currentSlot, editingAssignmentId, hoveredBarState, profiles, slotCount, viewMode } from '../state/signals';
import { SchedulerPane } from './SchedulerPane';

vi.mock('./SlotHeader', () => ({
  SlotHeader: ({ slotIndex, isCurrent, isMilestone }: { slotIndex: number; isCurrent?: boolean; isMilestone?: boolean }) => (
    <div data-testid="slot-header" data-current={String(Boolean(isCurrent))} data-milestone={String(Boolean(isMilestone))} style={{ width: '48px' }}>
      D{slotIndex + 1}
    </div>
  ),
}));

vi.mock('./ProfileRow', () => ({
  ProfileRow: ({ profile }: { profile: { id: string; name: string } }) => (
    <div data-testid="profile-row">{profile.name}</div>
  ),
}));

beforeEach(() => {
  profiles.value = [];
  viewMode.value = 'days';
  slotCount.value = 60;
  currentSlot.value = 0;
  editingAssignmentId.value = null;
  contextMenuTarget.value = null;
  hoveredBarState.value = null;
});

describe('SchedulerPane', () => {
  it('renders empty state when no profiles', () => {
    const { container } = render(<SchedulerPane />);
    expect(container.textContent).toContain('No profiles yet');
  });

  it('keeps anchored overlays open on scroll but closes context menu', () => {
    profiles.value = [{ id: 'p1', name: 'Alice', category: '', capacityPct: 100, color: '#4f9cf8', initials: 'AL' }];
    editingAssignmentId.value = 'a1';
    contextMenuTarget.value = { assignmentId: 'a1', x: 10, y: 20 };
    hoveredBarState.value = { assignmentId: 'a1', rect: new DOMRect(0, 0, 20, 20), anchorEl: document.createElement('div') };

    const { container } = render(<SchedulerPane />);
    const pane = container.querySelector('.scheduler-pane');
    expect(pane).toBeTruthy();

    fireEvent.scroll(pane!);

    expect(editingAssignmentId.value).toBe('a1');
    expect(contextMenuTarget.value).toBeNull();
    expect(hoveredBarState.value?.assignmentId).toBe('a1');
  });

  it('uses a single scrollable container', () => {
    profiles.value = [{ id: 'p1', name: 'Alice', category: '', capacityPct: 100, color: '#4f9cf8', initials: 'AL' }];

    const { container } = render(<SchedulerPane />);
    const pane = container.querySelector('.scheduler-pane');
    expect(pane).toBeTruthy();

    const header = container.querySelector('.scheduler-pane__header');
    const body = container.querySelector('.scheduler-pane__body');
    expect(header).toBeTruthy();
    expect(body).toBeTruthy();

    // Both should be inside the same container, not separate scroll areas
    expect(pane?.contains(header)).toBe(true);
    expect(pane?.contains(body)).toBe(true);
  });

  it('marks current slot in headers when currentSlot is within rendered range and rows exist', () => {
    profiles.value = [{ id: 'p1', name: 'Alice', category: '', capacityPct: 100, color: '#4f9cf8', initials: 'AL' }];
    currentSlot.value = 4;

    const { getAllByTestId } = render(<SchedulerPane />);
    expect(getAllByTestId('slot-header')[4].getAttribute('data-current')).toBe('true');
    expect(getAllByTestId('slot-header')[4].getAttribute('data-milestone')).toBe('true');
  });

  it('does not render current slot line when currentSlot is null', () => {
    profiles.value = [{ id: 'p1', name: 'Alice', category: '', capacityPct: 100, color: '#4f9cf8', initials: 'AL' }];
    currentSlot.value = null;

    const { container, getAllByTestId } = render(<SchedulerPane />);
    expect(container.querySelector('.scheduler-pane__current-line')).toBeNull();
    expect(getAllByTestId('slot-header')[0].getAttribute('data-current')).toBe('false');
  });

  it('does not render current slot line when currentSlot is outside rendered range', () => {
    profiles.value = [{ id: 'p1', name: 'Alice', category: '', capacityPct: 100, color: '#4f9cf8', initials: 'AL' }];
    slotCount.value = 5;
    currentSlot.value = 8;

    const { container, getAllByTestId } = render(<SchedulerPane />);
    expect(container.querySelector('.scheduler-pane__current-line')).toBeNull();
    expect(getAllByTestId('slot-header').every((header) => header.getAttribute('data-current') === 'false')).toBe(true);
  });

  it('does not render current slot line when there are no profiles', () => {
    currentSlot.value = 3;

    const { container } = render(<SchedulerPane />);
    expect(container.querySelector('.scheduler-pane__current-line')).toBeNull();
  });
});
