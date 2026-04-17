import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/preact';
import { StatsBar } from './StatsBar';
import { assignments, profiles, slotCount, viewMode } from '../state/signals';

describe('StatsBar', () => {
  beforeEach(() => {
    viewMode.value = 'days';
    slotCount.value = 60;
    profiles.value = [
      { id: 'p1', name: 'Alice', category: '', capacityPct: 100, color: '#4f9cf8', initials: 'AL' },
    ];
    assignments.value = [
      { id: 'a1', index: 0, profileId: 'p1', task: 'Build', startSlot: 0, endSlot: 1, dedicationPct: 50 },
    ];
  });

  it('renders aggregate board metrics', () => {
    const { container } = render(<StatsBar />);

    expect(container.querySelectorAll('.stats-bar__stat')[0]?.textContent).toContain('1 profiles');
    expect(container.querySelectorAll('.stats-bar__stat')[1]?.textContent).toContain('1 assignments');
    expect(container.querySelectorAll('.stats-bar__stat')[2]?.textContent).toContain('50% avg dedication');
    expect(container.querySelectorAll('.stats-bar__stat')[3]?.textContent).toContain('1 effort');
    expect(screen.getByText('D1: 1')).toBeTruthy();
  });
});
