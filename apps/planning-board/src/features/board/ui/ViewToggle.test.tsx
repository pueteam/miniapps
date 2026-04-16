import { render, screen } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { viewMode } from '../state/signals';
import { ViewToggle } from './ViewToggle';

describe('ViewToggle', () => {
  it('renders Days and Weeks buttons', () => {
    render(<ViewToggle />);
    expect(screen.getByText('Days')).toBeTruthy();
    expect(screen.getByText('Weeks')).toBeTruthy();
  });

  it('shows Days as active by default', () => {
    viewMode.value = 'days';
    render(<ViewToggle />);
    const daysBtn = screen.getByText('Days');
    expect(daysBtn.classList.contains('view-toggle__btn--active')).toBe(true);
  });

  it('shows Weeks as active when mode is weeks', () => {
    viewMode.value = 'weeks';
    render(<ViewToggle />);
    const weeksBtn = screen.getByText('Weeks');
    expect(weeksBtn.classList.contains('view-toggle__btn--active')).toBe(true);
  });
});
