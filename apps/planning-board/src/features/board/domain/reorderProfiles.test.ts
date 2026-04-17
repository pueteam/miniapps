import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Profile } from '../domain/types';
import * as actions from '../state/actions';
import { profiles } from '../state/signals';

vi.mock('../state/signals', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../state/signals')>();
  return {
    ...actual,
  };
});

describe('Profile Reordering', () => {
  const mockProfiles: Profile[] = [
    { id: 'p1', name: 'Alice', category: 'dev', capacityPct: 100, color: '#4f9cf8', initials: 'AL' },
    { id: 'p2', name: 'Bob', category: 'dev', capacityPct: 100, color: '#5cb3ff', initials: 'BO' },
    { id: 'p3', name: 'Charlie', category: 'qa', capacityPct: 100, color: '#85c3ff', initials: 'CH' },
  ];

  beforeEach(() => {
    profiles.value = [...mockProfiles];
  });

  describe('reorderProfiles action', () => {
    it('should move profile down one position', async () => {
      await actions.reorderProfiles('p1', 0, 1);
      
      expect(profiles.value[0].id).toBe('p2');
      expect(profiles.value[1].id).toBe('p1');
      expect(profiles.value[2].id).toBe('p3');
    });

    it('should move profile up one position', async () => {
      await actions.reorderProfiles('p2', 1, 0);
      
      expect(profiles.value[0].id).toBe('p2');
      expect(profiles.value[1].id).toBe('p1');
      expect(profiles.value[2].id).toBe('p3');
    });

    it('should move profile to the end', async () => {
      await actions.reorderProfiles('p1', 0, 2);
      
      expect(profiles.value[0].id).toBe('p2');
      expect(profiles.value[1].id).toBe('p3');
      expect(profiles.value[2].id).toBe('p1');
    });

    it('should move profile to the start', async () => {
      await actions.reorderProfiles('p3', 2, 0);
      
      expect(profiles.value[0].id).toBe('p3');
      expect(profiles.value[1].id).toBe('p1');
      expect(profiles.value[2].id).toBe('p2');
    });

    it('should not affect profile data during reordering', async () => {
      const originalProfile = { ...mockProfiles[0] };
      await actions.reorderProfiles('p1', 0, 1);
      
      const reorderedProfile = profiles.value.find(p => p.id === 'p1');
      expect(reorderedProfile).toEqual(originalProfile);
    });

    it('should maintain total profile count after reordering', async () => {
      const initialCount = profiles.value.length;
      await actions.reorderProfiles('p1', 0, 1);
      
      expect(profiles.value.length).toBe(initialCount);
    });

    it('should handle invalid profile id gracefully', async () => {
      const initialProfiles = [...profiles.value];
      await actions.reorderProfiles('invalid-id', 0, 1);
      
      expect(profiles.value).toEqual(initialProfiles);
    });

    it('should not reorder if from and to positions are the same', async () => {
      const initialOrder = profiles.value.map(p => p.id);
      await actions.reorderProfiles('p1', 0, 0);
      
      const finalOrder = profiles.value.map(p => p.id);
      expect(finalOrder).toEqual(initialOrder);
    });
  });
});
