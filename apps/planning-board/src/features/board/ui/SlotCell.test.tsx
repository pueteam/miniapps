import { fireEvent, render } from '@testing-library/preact';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as actions from '../state/actions';
import { SlotCell } from './SlotCell';

describe('SlotCell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without overloaded class when overloaded is false', () => {
    const { container } = render(<SlotCell overloaded={false} />);
    const cell = container.querySelector('.slot-cell');
    expect(cell).toBeTruthy();
    expect(cell?.classList.contains('slot-cell--overloaded')).toBe(false);
  });

  it('renders with overloaded class when overloaded is true', () => {
    const { container } = render(<SlotCell overloaded={true} />);
    const cell = container.querySelector('.slot-cell');
    expect(cell).toBeTruthy();
    expect(cell?.classList.contains('slot-cell--overloaded')).toBe(true);
  });

  it('renders milestone class when isMilestone is true', () => {
    const { container } = render(<SlotCell overloaded={false} isMilestone={true} />);
    const cell = container.querySelector('.slot-cell');
    expect(cell?.classList.contains('slot-cell--milestone')).toBe(true);
  });

  it('applies explicit height when provided', () => {
    const { container } = render(<SlotCell overloaded={false} height={78} />);
    const cell = container.querySelector('.slot-cell') as HTMLElement;
    expect(cell.style.height).toBe('78px');
  });

  it('shows add button after 200ms of hover with profileId and slotIndex', async () => {
    const { container } = render(<SlotCell overloaded={false} profileId="p1" slotIndex={5} />);
    const cell = container.querySelector('.slot-cell');

    expect(container.querySelector('.slot-cell__add-btn')).toBeNull();

    fireEvent.mouseEnter(cell!);
    expect(container.querySelector('.slot-cell__add-btn')).toBeNull();

    // Wait 200ms using real timers
    await new Promise((resolve) => setTimeout(resolve, 250));
    expect(container.querySelector('.slot-cell__add-btn')).toBeTruthy();

    fireEvent.mouseLeave(cell!);
    expect(container.querySelector('.slot-cell__add-btn')).toBeNull();
  });

  it('does not show add button without profileId', async () => {
    const { container } = render(<SlotCell overloaded={false} slotIndex={5} />);
    const cell = container.querySelector('.slot-cell');

    fireEvent.mouseEnter(cell!);
    await new Promise((resolve) => setTimeout(resolve, 250));
    expect(container.querySelector('.slot-cell__add-btn')).toBeNull();
  });

  it('creates assignment when add button is clicked', async () => {
    vi.spyOn(actions, 'createAssignment').mockResolvedValue('a-1');
    const { container } = render(<SlotCell overloaded={false} profileId="p1" slotIndex={5} />);
    const cell = container.querySelector('.slot-cell');

    fireEvent.mouseEnter(cell!);
    await new Promise((resolve) => setTimeout(resolve, 250));

    const addBtn = container.querySelector('.slot-cell__add-btn') as HTMLButtonElement;
    expect(addBtn).toBeTruthy();

    fireEvent.click(addBtn);

    expect(actions.createAssignment).toHaveBeenCalledWith('p1', 5, 5);
  });

  it('clears hover timeout on unmount', async () => {
    const { unmount, container } = render(<SlotCell overloaded={false} profileId="p1" slotIndex={5} />);
    const cell = container.querySelector('.slot-cell');

    fireEvent.mouseEnter(cell!);

    unmount();
    await new Promise((resolve) => setTimeout(resolve, 250));

    expect(container.querySelector('.slot-cell__add-btn')).toBeNull();
  });
});
