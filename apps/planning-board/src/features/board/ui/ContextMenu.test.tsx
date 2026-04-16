import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/preact';
import { ContextMenu } from './ContextMenu';
import { assignments, contextMenuTarget } from '../state/signals';
import * as actions from '../state/actions';

const floatingUi = vi.hoisted(() => ({
  computePosition: vi.fn(async () => ({ x: 160, y: 110 })),
}));

vi.mock('@floating-ui/dom', () => ({
  computePosition: floatingUi.computePosition,
  offset: vi.fn((value: number) => ({ name: 'offset', options: value })),
  flip: vi.fn(() => ({ name: 'flip' })),
  shift: vi.fn((options: unknown) => ({ name: 'shift', options })),
}));

vi.mock('../state/actions', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../state/actions')>();
  return {
    ...actual,
    duplicateAssignment: vi.fn(),
    deleteAssignment: vi.fn(),
    setEditingAssignmentId: vi.fn(),
  };
});

beforeEach(() => {
  assignments.value = [
    { id: 'a1', profileId: 'p1', task: 'Task', startSlot: 0, endSlot: 1, dedicationPct: 100 },
  ];
  contextMenuTarget.value = { assignmentId: 'a1', x: 20, y: 30 };
  vi.clearAllMocks();
});

describe('ContextMenu', () => {
  it('renders edit, duplicate, and delete actions', () => {
    render(<ContextMenu />);

    expect(screen.getByText('Edit')).toBeTruthy();
    expect(screen.getByText('Duplicate')).toBeTruthy();
    expect(screen.getByText('Delete')).toBeTruthy();
  });

  it('calls duplicate and closes the menu', () => {
    render(<ContextMenu />);

    fireEvent.click(screen.getByText('Duplicate'));

    expect(actions.duplicateAssignment).toHaveBeenCalledWith('a1');
    expect(contextMenuTarget.value).toBeNull();
  });

  it('closes on outside click', () => {
    render(<ContextMenu />);

    fireEvent.mouseDown(document.body);

    expect(contextMenuTarget.value).toBeNull();
  });

  it('closes on Escape', () => {
    render(<ContextMenu />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(contextMenuTarget.value).toBeNull();
  });

  it('positions with the floating overlay system', async () => {
    const { findByText } = render(<ContextMenu />);
    const action = await findByText('Edit');
    const menu = action.closest('.context-menu') as HTMLElement;

    expect(floatingUi.computePosition).toHaveBeenCalledOnce();
    expect((floatingUi.computePosition.mock.calls[0] as unknown[])[2]).toMatchObject({
      strategy: 'fixed',
      placement: 'bottom-start',
    });
    expect(menu.style.left).toBe('160px');
    expect(menu.style.top).toBe('110px');
  });

  it('renders menu semantics and focuses the first action', async () => {
    render(<ContextMenu />);

    const menu = await screen.findByRole('menu');
    const edit = screen.getByRole('menuitem', { name: 'Edit' });

    expect(menu).toBeTruthy();
    expect(edit).toBe(document.activeElement);
  });
});
