import { render, screen } from '@testing-library/preact';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { assignments, contextMenuTarget, editingAssignmentId, hoveredBarState, profiles } from '../state/signals';
import { HoverPopover } from './HoverPopover';

const floatingUi = vi.hoisted(() => ({
  computePosition: vi.fn(async () => ({ x: 220, y: 96 })),
  autoUpdate: vi.fn((_anchor, _floating, update: () => void) => {
    void update();
    return () => undefined;
  }),
}));

vi.mock('@floating-ui/dom', () => ({
  computePosition: floatingUi.computePosition,
  autoUpdate: floatingUi.autoUpdate,
  offset: vi.fn((value: number) => ({ name: 'offset', options: value })),
  flip: vi.fn(() => ({ name: 'flip' })),
  shift: vi.fn((options: unknown) => ({ name: 'shift', options })),
}));

beforeEach(() => {
  const anchorEl = document.createElement('div');
  document.body.appendChild(anchorEl);
  profiles.value = [
    { id: 'p1', name: 'Alice', category: '', capacityPct: 100, color: '#4f9cf8', initials: 'AL' },
  ];
  assignments.value = [
    { id: 'a1', index: 0, profileId: 'p1', task: 'Build', startSlot: 1, endSlot: 3, dedicationPct: 75 },
  ];
  hoveredBarState.value = { assignmentId: 'a1', rect: new DOMRect(10, 20, 100, 20), anchorEl };
  contextMenuTarget.value = null;
  editingAssignmentId.value = null;
});

describe('HoverPopover', () => {
  it('renders minimum assignment details', () => {
    render(<HoverPopover />);

    expect(screen.getByText('Build')).toBeTruthy();
    expect(screen.getByText('75%')).toBeTruthy();
    expect(screen.getByText('Slots')).toBeTruthy();
    expect(screen.getByText('2–4')).toBeTruthy();
    expect(screen.getByText('Alice')).toBeTruthy();
  });

  it('positions with the floating overlay system', async () => {
    const { findByText } = render(<HoverPopover />);
    const task = await findByText('Build');
    const popover = task.closest('.hover-popover') as HTMLElement;

    expect(floatingUi.computePosition).toHaveBeenCalled();
    expect(floatingUi.autoUpdate).toHaveBeenCalled();
    expect((floatingUi.computePosition.mock.calls[0] as unknown[])[2]).toMatchObject({
      strategy: 'fixed',
      placement: 'bottom-start',
    });
    expect(popover.style.left).toBe('220px');
    expect(popover.style.top).toBe('96px');
  });

  it('does not render when the context menu is visible', () => {
    contextMenuTarget.value = { assignmentId: 'a1', x: 20, y: 30 };

    const { container } = render(<HoverPopover />);

    expect(container.firstChild).toBeNull();
  });

  it('does not render when the assignment popover is visible', () => {
    editingAssignmentId.value = 'a1';

    const { container } = render(<HoverPopover />);

    expect(container.firstChild).toBeNull();
  });
});
