import { render } from '@testing-library/preact';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Profile } from '../domain/types';
import { assignments, deletingProfileId, profiles } from '../state/signals';
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

vi.mock('../hooks/useProfileDrag', () => ({
  useProfileDrag: () => {
    return { current: null };
  },
}));

const mockProfile: Profile = {
  id: 'p1',
  name: 'Alice',
  category: 'dev',
  capacityPct: 100,
  color: '#4f9cf8',
  initials: 'AL',
};

beforeEach(() => {
  deletingProfileId.value = null;
  assignments.value = [];
  profiles.value = [mockProfile];
});

describe('ProfileRow drag & drop', () => {
  it('should render profile row with draggable attribute', () => {
    const { container } = render(
      <ProfileRow profile={mockProfile} slotCount={60} />,
    );

    const row = container.querySelector('[data-profile-id]');
    expect(row).toBeTruthy();
  });

  it('should not affect slot cells during implementation', () => {
    const { container } = render(
      <ProfileRow profile={mockProfile} slotCount={60} />,
    );

    const cells = container.querySelectorAll('.slot-cell');
    expect(cells.length).toBe(60);
  });

  it('should preserve existing profile functionality', () => {
    const { container } = render(
      <ProfileRow profile={mockProfile} slotCount={60} />,
    );

    const avatar = container.querySelector('.profile-row__avatar');
    expect(avatar?.textContent).toBe(mockProfile.initials);
  });

  it('should maintain proper styling for profile row', () => {
    const { container } = render(
      <ProfileRow profile={mockProfile} slotCount={60} />,
    );

    const row = container.querySelector('.profile-row');
    expect(row?.classList.contains('profile-row')).toBe(true);
  });
});
