import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/preact';
import { ZoomControl } from './ZoomControl';
import { slotCount, slotWidth } from '../state/signals';

describe('ZoomControl', () => {
  beforeEach(() => {
    slotWidth.value = 48;
    slotCount.value = 60;
  });

  it('renders controls for slot width and slot count', () => {
    render(<ZoomControl />);

    expect(screen.getByLabelText('Slot width')).toBeTruthy();
    expect(screen.getByLabelText('Slot count')).toBeTruthy();
  });

  it('updates persisted slot preferences immediately', () => {
    render(<ZoomControl />);

    fireEvent.input(screen.getByLabelText('Slot width'), { target: { value: '80' } });
    fireEvent.input(screen.getByLabelText('Slot count'), { target: { value: '42' } });

    expect(slotWidth.value).toBe(80);
    expect(slotCount.value).toBe(42);
    expect(localStorage.getItem('slotWidth')).toBe('80');
    expect(localStorage.getItem('slotCount')).toBe('42');
  });
});
