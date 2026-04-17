import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/preact';
import { AssignmentPopover } from './AssignmentPopover';
import { ContextMenu } from './ContextMenu';
import { assignments, contextMenuTarget, editingAssignmentId, hoveredBarState, profiles } from '../state/signals';

const floatingUi = vi.hoisted(() => ({
  computePosition: vi.fn(async () => ({ x: 100, y: 100 })),
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

const assignment = {
  id: 'a1',
  index: 0,
  profileId: 'p1',
  task: 'Build',
  startSlot: 0,
  endSlot: 2,
  dedicationPct: 75,
};

describe('Overlay layering', () => {
  beforeEach(() => {
    const anchorEl = document.createElement('div');
    document.body.appendChild(anchorEl);

    profiles.value = [{ id: 'p1', name: 'Alice', category: '', capacityPct: 100, color: '#4f9cf8', initials: 'AL' }];
    assignments.value = [assignment];
    editingAssignmentId.value = 'a1';
    contextMenuTarget.value = { assignmentId: 'a1', x: 20, y: 30 };
    hoveredBarState.value = { assignmentId: 'a1', rect: new DOMRect(0, 0, 40, 20), anchorEl };
    vi.clearAllMocks();
  });

  it('renders assignment popover above context menu and hover overlay', async () => {
    const anchorRef = { current: hoveredBarState.value?.anchorEl ?? null };
    contextMenuTarget.value = null;
    render(
      <>
        <AssignmentPopover assignment={assignment} anchorRef={anchorRef} />
      </>,
    );

    const popover = await screen.findByDisplayValue('Build');
    const popoverEl = popover.closest('.assignment-popover') as HTMLElement;
    const hoverEl = document.createElement('div');
    hoverEl.className = 'hover-popover';
    hoverEl.style.zIndex = '50';
    document.body.appendChild(hoverEl);

    expect(Number(getComputedStyle(popoverEl).zIndex)).toBeGreaterThan(Number(getComputedStyle(hoverEl).zIndex));
  });

  it('renders context menu above hover overlay', async () => {
    editingAssignmentId.value = null;
    render(
      <>
        <ContextMenu />
      </>,
    );

    const menuEl = (await screen.findByText('Edit')).closest('.context-menu') as HTMLElement;

    hoveredBarState.value = { ...hoveredBarState.value!, anchorEl: null };
    const hoverEl = document.createElement('div');
    hoverEl.className = 'hover-popover';
    hoverEl.style.zIndex = '50';
    document.body.appendChild(hoverEl);

    expect(Number(getComputedStyle(menuEl).zIndex)).toBeGreaterThan(Number(getComputedStyle(hoverEl).zIndex));
  });

  it('renders floating overlays above board surfaces', async () => {
    const anchorRef = { current: hoveredBarState.value?.anchorEl ?? null };
    contextMenuTarget.value = null;
    const { container } = render(
      <>
        <div className="assignment-bar" style={{ zIndex: 2 }} />
        <div className="slot-cell" style={{ zIndex: 0 }} />
        <div className="scheduler-pane__current-line" style={{ zIndex: 1 }} />
        <AssignmentPopover assignment={assignment} anchorRef={anchorRef} />
      </>,
    );

    const popoverEl = (await screen.findByDisplayValue('Build')).closest('.assignment-popover') as HTMLElement;
    const hoverEl = document.createElement('div');
    hoverEl.className = 'hover-popover';
    hoverEl.style.zIndex = '50';
    document.body.appendChild(hoverEl);
    const barEl = container.querySelector('.assignment-bar') as HTMLElement;
    const cellEl = container.querySelector('.slot-cell') as HTMLElement;
    const lineEl = container.querySelector('.scheduler-pane__current-line') as HTMLElement;

    expect(Number(getComputedStyle(popoverEl).zIndex)).toBeGreaterThan(Number(getComputedStyle(barEl).zIndex));
    expect(Number(getComputedStyle(popoverEl).zIndex)).toBeGreaterThan(Number(getComputedStyle(cellEl).zIndex));
    expect(Number(getComputedStyle(hoverEl).zIndex)).toBeGreaterThan(Number(getComputedStyle(lineEl).zIndex));
  });
});
