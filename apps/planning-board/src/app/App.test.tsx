import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/preact';
import { App } from './App';
import { contextMenuTarget, editingAssignmentId, hoveredBarState } from '../features/board/state/signals';

vi.mock('../state/actions', () => ({
  loadAll: vi.fn().mockResolvedValue(undefined),
  clearTransientUi: vi.fn(() => {
    editingAssignmentId.value = null;
    contextMenuTarget.value = null;
    hoveredBarState.value = null;
  }),
}));

vi.mock('./registerSW', () => ({
  registerSW: vi.fn(),
  getInstallState: vi.fn(() => ({ canInstall: false, isInstalled: false })),
  subscribeInstallState: vi.fn(() => vi.fn()),
  triggerInstall: vi.fn(),
}));
vi.mock('../ui/Toolbar', () => ({ Toolbar: () => <div>toolbar</div> }));
vi.mock('../ui/SchedulerPane', () => ({ SchedulerPane: () => <div>scheduler</div> }));
vi.mock('../ui/ContextMenu', () => ({ ContextMenu: () => <div>menu</div> }));
vi.mock('../ui/HoverPopover', () => ({ HoverPopover: () => <div>hover</div> }));
vi.mock('../ui/StatsBar', () => ({ StatsBar: () => <div>stats</div> }));

describe('App', () => {
  beforeEach(() => {
    editingAssignmentId.value = 'a1';
    contextMenuTarget.value = { assignmentId: 'a1', x: 10, y: 20 };
    hoveredBarState.value = { assignmentId: 'a1', rect: new DOMRect(0, 0, 10, 10) };
  });

  it('clears transient ui on Escape', () => {
    render(<App />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(editingAssignmentId.value).toBeNull();
    expect(contextMenuTarget.value).toBeNull();
    expect(hoveredBarState.value).toBeNull();
  });
});
