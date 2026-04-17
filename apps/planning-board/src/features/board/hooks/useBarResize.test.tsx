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
import { useBarResize } from './useBarResize';

const assignment: Assignment = {
  id: 'a1',
  index: 0,
  profileId: 'p1',
  task: 'Task',
  startSlot: 2,
  endSlot: 4,
  dedicationPct: 100,
};

function TestHandle({ edge }: { edge: 'left' | 'right' }) {
  const ref = useBarResize({ assignment, slotCount: 60, edge });
  return (
    <div className="assignment-bar" style={{ left: '96px', width: '144px' }}>
      <div ref={ref} />
    </div>
  );
}

describe('useBarResize', () => {
  beforeEach(() => {
    Object.keys(handlers).forEach((key) => delete handlers[key]);
    vi.clearAllMocks();
  });

  it('updates assignment start slot on left resize', () => {
    render(<TestHandle edge="left" />);

    handlers.start?.({ x: 96, sourceEvent: { stopPropagation: vi.fn() } });
    handlers.drag?.({ x: 48, sourceEvent: { stopPropagation: vi.fn() } });
    handlers.end?.({ x: 48, sourceEvent: { stopPropagation: vi.fn() } });

    expect(actions.updateAssignment).toHaveBeenCalledWith('a1', { startSlot: 1 });
  });

  it('updates assignment end slot on right resize', () => {
    render(<TestHandle edge="right" />);

    handlers.start?.({ x: 192, sourceEvent: { stopPropagation: vi.fn() } });
    handlers.drag?.({ x: 240, sourceEvent: { stopPropagation: vi.fn() } });
    handlers.end?.({ x: 240, sourceEvent: { stopPropagation: vi.fn() } });

    expect(actions.updateAssignment).toHaveBeenCalledWith('a1', { endSlot: 5 });
  });

  it('previews width growth on right resize during drag', () => {
    render(<TestHandle edge="right" />);

    handlers.start?.({ x: 192, sourceEvent: { stopPropagation: vi.fn() } });
    handlers.drag?.({ x: 240, sourceEvent: { stopPropagation: vi.fn() } });

    const bar = document.querySelector('.assignment-bar') as HTMLElement;
    expect(bar.style.width).toBe('192px');
    expect(bar.style.left).toBe('96px');
    expect(bar.classList.contains('assignment-bar--resizing')).toBe(true);
  });

  it('previews left-edge movement and width change on left resize during drag', () => {
    render(<TestHandle edge="left" />);

    handlers.start?.({ x: 96, sourceEvent: { stopPropagation: vi.fn() } });
    handlers.drag?.({ x: 48, sourceEvent: { stopPropagation: vi.fn() } });

    const bar = document.querySelector('.assignment-bar') as HTMLElement;
    expect(bar.style.left).toBe('48px');
    expect(bar.style.width).toBe('192px');
    expect(bar.classList.contains('assignment-bar--resizing')).toBe(true);
  });

  it('clears transient resize preview styles after resize ends', () => {
    render(<TestHandle edge="right" />);

    handlers.start?.({ x: 192, sourceEvent: { stopPropagation: vi.fn() } });
    handlers.drag?.({ x: 240, sourceEvent: { stopPropagation: vi.fn() } });
    handlers.end?.({ x: 240, sourceEvent: { stopPropagation: vi.fn() } });

    const bar = document.querySelector('.assignment-bar') as HTMLElement;
    expect(bar.style.width).toBe('144px');
    expect(bar.style.left).toBe('96px');
    expect(bar.classList.contains('assignment-bar--resizing')).toBe(false);
  });
});
