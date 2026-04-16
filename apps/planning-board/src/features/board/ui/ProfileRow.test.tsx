import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/preact';
import { ProfileRow } from './ProfileRow';
import { activeProfileId, deletingProfileId, assignments } from '../state/signals';

vi.mock('../state/signals', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../state/signals')>();
  return {
    ...actual,
    overloadMap: {
      get value() {
        return new Map();
      },
    },
  };
});

const mockProfile = {
  id: 'p1',
  name: 'Alice',
  category: '',
  capacityPct: 100,
  color: '#4f9cf8',
  initials: 'AL',
};

beforeEach(() => {
  activeProfileId.value = null;
  deletingProfileId.value = null;
  assignments.value = [];
});

describe('ProfileRow', () => {
  it('does not render a global AssignmentPopover singleton', () => {
    assignments.value = [
      {
        id: 'a1',
        profileId: 'p1',
        task: 'Task 1',
        startSlot: 0,
        endSlot: 2,
        dedicationPct: 100,
      },
    ];

    const { container } = render(
      <ProfileRow profile={mockProfile} slotCount={60} />,
    );

    const popovers = container.querySelectorAll('.assignment-popover');
    expect(popovers.length).toBe(0);
  });

  it('renders SlotCell with overloaded boolean prop', () => {
    const { container } = render(
      <ProfileRow profile={mockProfile} slotCount={60} />,
    );

    const cells = container.querySelectorAll('.slot-cell');
    expect(cells.length).toBe(60);
    expect(cells[0].classList.contains('slot-cell--overloaded')).toBe(false);
  });

  it('renders persistent profile identity', () => {
    const { container } = render(
      <ProfileRow profile={mockProfile} slotCount={60} />,
    );

    const avatar = container.querySelector('.profile-row__avatar');
    expect(avatar?.textContent).toBe('AL');
    expect((avatar as HTMLElement).style.background).toBe('rgb(79, 156, 248)');
  });

  it('renders category only when trimmed category is non-empty', () => {
    const profileWithCategory = { ...mockProfile, category: '  Design  ' };
    const { container, rerender } = render(
      <ProfileRow profile={profileWithCategory} slotCount={60} />,
    );

    expect(container.querySelector('.profile-row__category')?.textContent).toBe('Design');

    rerender(<ProfileRow profile={{ ...mockProfile, category: '   ' }} slotCount={60} />);
    expect(container.querySelector('.profile-row__category')).toBeNull();
  });

  it('preserves name truncation class when category is present', () => {
    const { container } = render(
      <ProfileRow profile={{ ...mockProfile, category: 'Design' }} slotCount={60} />,
    );

    expect(container.querySelector('.profile-row__name')).toBeTruthy();
    expect(container.querySelector('.profile-row__identity')).toBeTruthy();
  });

  it('grows the row height when assignments overlap', () => {
    assignments.value = [
      { id: 'a1', profileId: 'p1', task: 'Task 1', startSlot: 0, endSlot: 2, dedicationPct: 100 },
      { id: 'a2', profileId: 'p1', task: 'Task 2', startSlot: 1, endSlot: 3, dedicationPct: 100 },
    ];

    const { container } = render(
      <ProfileRow profile={mockProfile} slotCount={60} />,
    );

    const row = container.querySelector('.profile-row') as HTMLElement;
    expect(row.style.getPropertyValue('--row-height-current')).not.toBe('48px');
  });

  it('stretches slot cells to the full row height when assignments overlap', () => {
    assignments.value = [
      { id: 'a1', profileId: 'p1', task: 'Task 1', startSlot: 0, endSlot: 2, dedicationPct: 100 },
      { id: 'a2', profileId: 'p1', task: 'Task 2', startSlot: 1, endSlot: 3, dedicationPct: 100 },
    ];

    const { container } = render(
      <ProfileRow profile={mockProfile} slotCount={60} />,
    );

    const row = container.querySelector('.profile-row') as HTMLElement;
    const cells = container.querySelectorAll('.slot-cell');

    expect(row.style.getPropertyValue('--row-height-current')).not.toBe('48px');
    expect((cells[0] as HTMLElement).style.height).toBe(row.style.getPropertyValue('--row-height-current'));
  });

  it('supports keyboard selection for the row header interaction', () => {
    render(<ProfileRow profile={mockProfile} slotCount={60} />);

    const row = screen.getByRole('button', { name: 'Select profile Alice' });
    fireEvent.keyDown(row, { key: 'Enter' });

    expect(activeProfileId.value).toBe('p1');
  });

  it('gives the delete trigger an accessible name when active', () => {
    activeProfileId.value = 'p1';
    render(<ProfileRow profile={mockProfile} slotCount={60} />);

    expect(screen.getByRole('button', { name: 'Delete profile Alice' })).toBeTruthy();
  });
});
