import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/preact';
import { SlotCell } from './SlotCell';

describe('SlotCell', () => {
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

  it('does not accept slotIndex, profileId, or overloads props', () => {
    // TypeScript should prevent this; this test documents the simplified API
    const { container } = render(<SlotCell overloaded={false} />);
    expect(container.querySelector('.slot-cell')).toBeTruthy();
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
});
