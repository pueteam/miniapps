import { fireEvent, render, screen } from '@testing-library/preact';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as actions from '../state/actions';
import { contextMenuTarget, editingAssignmentId, hoveredBarState } from '../state/signals';
import { AssignmentPopover } from './AssignmentPopover';

const floatingUi = vi.hoisted(() => ({
  computePosition: vi.fn(async () => ({ x: 120, y: 80 })),
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

vi.mock('../state/actions', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../state/actions')>();
  return {
    ...actual,
    updateAssignment: vi.fn(),
    deleteAssignment: vi.fn(),
    clearTransientUi: vi.fn(() => {
      editingAssignmentId.value = null;
      contextMenuTarget.value = null;
      hoveredBarState.value = null;
    }),
  };
});

const mockAssignment = {
  id: 'a1',
  profileId: 'p1',
  task: 'Test task',
  startSlot: 0,
  endSlot: 2,
  dedicationPct: 75,
};

const anchorRef = { current: document.createElement('div') as HTMLElement | null };

beforeEach(() => {
  editingAssignmentId.value = 'a1';
  hoveredBarState.value = null;
  contextMenuTarget.value = null;
  anchorRef.current = document.createElement('div');
  document.body.appendChild(anchorRef.current);
  vi.clearAllMocks();
});

describe('AssignmentPopover', () => {
  it('renders task input, slider, number input, delete, save and cancel buttons', () => {
    render(<AssignmentPopover assignment={mockAssignment} anchorRef={anchorRef} />);
    expect(screen.getByDisplayValue('Test task')).toBeTruthy();
    expect(screen.getByRole('slider')).toBeTruthy();
    expect(screen.getByRole('spinbutton')).toBeTruthy();
    expect(screen.getByText('Delete assignment')).toBeTruthy();
    expect(screen.getByText('Save')).toBeTruthy();
    expect(screen.getByText('Cancel')).toBeTruthy();
  });

  it('shows correct dedicationPct value', () => {
    render(<AssignmentPopover assignment={mockAssignment} anchorRef={anchorRef} />);
    expect((screen.getByRole('slider') as HTMLInputElement).value).toBe('75');
    expect((screen.getByRole('spinbutton') as HTMLInputElement).value).toBe('75');
  });

  it('calls deleteAssignment when delete button is clicked', () => {
    render(<AssignmentPopover assignment={mockAssignment} anchorRef={anchorRef} />);
    screen.getByText('Delete assignment').click();
    expect(actions.deleteAssignment).toHaveBeenCalledWith('a1');
  });

  it('returns null when editingAssignmentId does not match assignment', () => {
    editingAssignmentId.value = 'other-id';
    const { container } = render(<AssignmentPopover assignment={mockAssignment} anchorRef={anchorRef} />);
    expect(container.firstChild).toBeNull();
  });

  it('closes on click outside the popover and its parent bar', () => {
    const barContainer = document.createElement('div');
    barContainer.setAttribute('data-testid', 'bar-container');
    document.body.appendChild(barContainer);

      render(<AssignmentPopover assignment={mockAssignment} anchorRef={anchorRef} />, {
        container: barContainer,
      });

    const outside = document.createElement('div');
    outside.setAttribute('data-testid', 'outside');
    document.body.appendChild(outside);

    fireEvent.mouseDown(outside);

    expect(editingAssignmentId.value).toBeNull();

    document.body.removeChild(barContainer);
    document.body.removeChild(outside);
  });

  it('does not close on click inside the popover', () => {
    render(<AssignmentPopover assignment={mockAssignment} anchorRef={anchorRef} />);

    const input = screen.getByDisplayValue('Test task');
    fireEvent.mouseDown(input);

    expect(editingAssignmentId.value).toBe('a1');
  });

  it('does not close on click on the parent assignment bar', () => {
    const barContainer = document.createElement('div');
    document.body.appendChild(barContainer);
    anchorRef.current = barContainer;

    render(<AssignmentPopover assignment={mockAssignment} anchorRef={anchorRef} />, {
      container: barContainer,
    });

    fireEvent.mouseDown(barContainer);

    expect(editingAssignmentId.value).toBe('a1');

    document.body.removeChild(barContainer);
  });

  it('positions with floating-ui and applies viewport-safe coordinates', async () => {
    const { findByDisplayValue } = render(<AssignmentPopover assignment={mockAssignment} anchorRef={anchorRef} />);

    const input = await findByDisplayValue('Test task');
    const popover = input.closest('.assignment-popover') as HTMLElement;

    expect(floatingUi.computePosition).toHaveBeenCalled();
    expect(floatingUi.autoUpdate).toHaveBeenCalled();
    expect((floatingUi.computePosition.mock.calls[0] as unknown[])[2]).toMatchObject({
      strategy: 'fixed',
      placement: 'bottom-start',
    });
    expect(popover.style.left).toBe('120px');
    expect(popover.style.top).toBe('80px');
  });

  it('renders the visible popover outside the assignment bar stacking context', async () => {
    const barContainer = document.createElement('div');
    document.body.appendChild(barContainer);
    anchorRef.current = barContainer;

    render(<AssignmentPopover assignment={mockAssignment} anchorRef={anchorRef} />, {
      container: barContainer,
    });

    const input = await screen.findByDisplayValue('Test task');
    const popover = input.closest('.assignment-popover') as HTMLElement;

    expect(popover.parentElement).toBe(document.body);

    document.body.removeChild(barContainer);
  });

  it('exposes dialog semantics, associated labels, and focus on open', async () => {
    render(<AssignmentPopover assignment={mockAssignment} anchorRef={anchorRef} />);

    const dialog = await screen.findByRole('dialog', { name: 'Edit assignment' });
    const input = screen.getByLabelText('Task name');
    const slider = screen.getByLabelText(/Dedication:/i);

    expect(dialog).toBeTruthy();
    expect(slider).toBeTruthy();
    expect(document.activeElement).toBe(input);
  });

  it('closes on Escape when open', () => {
    render(<AssignmentPopover assignment={mockAssignment} anchorRef={anchorRef} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(editingAssignmentId.value).toBeNull();
  });

  it('typing in number input updates slider value', () => {
    render(<AssignmentPopover assignment={mockAssignment} anchorRef={anchorRef} />);
    const number = screen.getByRole('spinbutton') as HTMLInputElement;
    const slider = screen.getByRole('slider') as HTMLInputElement;

    fireEvent.input(number, { target: { value: '50' } });

    expect(slider.value).toBe('50');
  });

  it('Save button calls updateAssignment with local values and closes', () => {
    render(<AssignmentPopover assignment={mockAssignment} anchorRef={anchorRef} />);
    const number = screen.getByRole('spinbutton') as HTMLInputElement;
    fireEvent.input(number, { target: { value: '50' } });

    screen.getByText('Save').click();

    expect(actions.updateAssignment).toHaveBeenCalledWith('a1', { task: 'Test task', dedicationPct: 50 });
    expect(editingAssignmentId.value).toBeNull();
  });

  it('Cancel button closes without calling updateAssignment', () => {
    render(<AssignmentPopover assignment={mockAssignment} anchorRef={anchorRef} />);
    const number = screen.getByRole('spinbutton') as HTMLInputElement;
    fireEvent.input(number, { target: { value: '50' } });

    screen.getByText('Cancel').click();

    expect(actions.updateAssignment).not.toHaveBeenCalled();
    expect(editingAssignmentId.value).toBeNull();
  });

  it('shows slot range and total slot count', () => {
    render(<AssignmentPopover assignment={mockAssignment} anchorRef={anchorRef} />);
    expect(screen.getByText(/Slots 1–3/)).toBeTruthy();
    expect(screen.getByText('3 slots')).toBeTruthy();
  });
});
