import { fireEvent, render, screen } from '@testing-library/preact';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as actions from '../state/actions';
import { assignments, deletingProfileId } from '../state/signals';
import { ProfileRow } from './ProfileRow';

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
  deletingProfileId.value = null;
  assignments.value = [];
});

describe('ProfileRow', () => {
  it('does not render a global AssignmentPopover singleton', () => {
    assignments.value = [
      {
        id: 'a1',
        index: 0,
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
      { id: 'a1', index: 0, profileId: 'p1', task: 'Task 1', startSlot: 0, endSlot: 2, dedicationPct: 100 },
      { id: 'a2', index: 1, profileId: 'p1', task: 'Task 2', startSlot: 1, endSlot: 3, dedicationPct: 100 },
    ];

    const { container } = render(
      <ProfileRow profile={mockProfile} slotCount={60} />,
    );

    const row = container.querySelector('.profile-row') as HTMLElement;
    expect(row.style.getPropertyValue('--row-height-current')).not.toBe('48px');
  });

  it('stretches slot cells to the full row height when assignments overlap', () => {
    assignments.value = [
      { id: 'a1', index: 0, profileId: 'p1', task: 'Task 1', startSlot: 0, endSlot: 2, dedicationPct: 100 },
      { id: 'a2', index: 1, profileId: 'p1', task: 'Task 2', startSlot: 1, endSlot: 3, dedicationPct: 100 },
    ];

    const { container } = render(
      <ProfileRow profile={mockProfile} slotCount={60} />,
    );

    const row = container.querySelector('.profile-row') as HTMLElement;
    const cells = container.querySelectorAll('.slot-cell');

    expect(row.style.getPropertyValue('--row-height-current')).not.toBe('48px');
    expect((cells[0] as HTMLElement).style.height).toBe(row.style.getPropertyValue('--row-height-current'));
  });


  it('shows an edit trigger and opens a profile editor popover', () => {
    render(<ProfileRow profile={mockProfile} slotCount={60} />);

    const editTrigger = screen.getByRole('button', { name: 'Edit profile Alice' });
    fireEvent.click(editTrigger);

    expect(screen.getByRole('dialog', { name: 'Edit profile Alice' })).toBeTruthy();
    expect(screen.getByLabelText('Role / profile name')).toBeTruthy();

    const avatarInput = screen.getByLabelText('Avatar text') as HTMLInputElement;
    expect(avatarInput).toBeTruthy();
    expect(avatarInput.maxLength).toBe(3);

    expect(screen.getByLabelText('Color')).toBeTruthy();
    expect(screen.queryByLabelText('Category')).toBeNull();
  });

  it('submits profile updates from the editor popover', () => {
    const updateSpy = vi.spyOn(actions, 'updateProfile').mockResolvedValue();

    render(<ProfileRow profile={mockProfile} slotCount={60} />);

    fireEvent.click(screen.getByRole('button', { name: 'Edit profile Alice' }));
    fireEvent.input(screen.getByLabelText('Role / profile name'), { target: { value: 'Arquitecto' } });
    fireEvent.input(screen.getByLabelText('Avatar text'), { target: { value: 'AR' } });
    fireEvent.input(screen.getByLabelText('Color'), { target: { value: '#87b0e8' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save profile changes' }));

    expect(updateSpy).toHaveBeenCalledWith('p1', expect.objectContaining({
      name: 'Arquitecto',
      initials: 'AR',
      color: '#87b0e8',
    }));
  });
});
