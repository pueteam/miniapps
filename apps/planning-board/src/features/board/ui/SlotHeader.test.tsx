import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/preact';
import { SlotHeader } from './SlotHeader';

describe('SlotHeader', () => {
  it('renders current class when isCurrent is true', () => {
    const { container } = render(<SlotHeader slotIndex={4} viewMode="days" isCurrent={true} isMilestone={true} />);
    const header = container.querySelector('.slot-header');
    expect(header?.classList.contains('slot-header--current')).toBe(true);
    expect(header?.classList.contains('slot-header--milestone')).toBe(true);
    expect(header?.textContent).toBe('D5');
  });

  it('renders milestone class when isMilestone is true', () => {
    const { container } = render(<SlotHeader slotIndex={9} viewMode="weeks" isMilestone={true} />);
    const header = container.querySelector('.slot-header');
    expect(header?.classList.contains('slot-header--milestone')).toBe(true);
    expect(header?.textContent).toBe('W10');
  });
});
