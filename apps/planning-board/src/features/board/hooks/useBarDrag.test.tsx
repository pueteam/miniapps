import { render } from '@testing-library/preact';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Assignment } from '../domain/types';

const handlers: Record<string, ((event: { x: number; sourceEvent: { stopPropagation: () => void } }) => void) | undefined> = {};

vi.mock('d3-drag', () => ({
  drag: () => {
    const api = {
      on: (name: string, handler: (event: { x: number; sourceEvent: { stopPropagation: () => void } }) => void) => {
        handlers[name] = handler;
        return api;
      },
    };
    return api;
  },
}));

vi.mock('d3-selection', () => ({
  select: () => ({
    call: () => undefined,
    on: () => undefined,
  }),
}));

vi.mock('../state/actions', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../state/actions')>();
  return {
    ...actual,
    updateAssignment: vi.fn(),
  };
});

import * as actions from '../state/actions';
import { useBarDrag } from './useBarDrag';

const assignment: Assignment = {
  id: 'a1',
  profileId: 'p1',
  task: 'Task',
  startSlot: 2,
  endSlot: 4,
  dedicationPct: 100,
};

function TestBar({ onClick }: { onClick: () => void }) {
  const ref = useBarDrag({ assignment, slotCount: 60, onClick });
  return <div ref={ref} />;
}

describe('useBarDrag', () => {
  beforeEach(() => {
    Object.keys(handlers).forEach((key) => delete handlers[key]);
    vi.clearAllMocks();
  });

  it('treats small movement as click and does not update assignment', () => {
    const onClick = vi.fn();
    render(<TestBar onClick={onClick} />);

    handlers.start?.({ x: 10, sourceEvent: { stopPropagation: vi.fn() } });
    handlers.drag?.({ x: 12, sourceEvent: { stopPropagation: vi.fn() } });
    handlers.end?.({ x: 12, sourceEvent: { stopPropagation: vi.fn() } });

    expect(onClick).toHaveBeenCalledOnce();
    expect(actions.updateAssignment).not.toHaveBeenCalled();
  });

  it('updates assignment after drag above threshold and does not call click', () => {
    const onClick = vi.fn();
    render(<TestBar onClick={onClick} />);

    handlers.start?.({ x: 10, sourceEvent: { stopPropagation: vi.fn() } });
    handlers.drag?.({ x: 70, sourceEvent: { stopPropagation: vi.fn() } });
    handlers.end?.({ x: 70, sourceEvent: { stopPropagation: vi.fn() } });

    expect(onClick).not.toHaveBeenCalled();
    expect(actions.updateAssignment).toHaveBeenCalledOnce();
  });
});
