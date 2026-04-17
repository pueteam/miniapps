import { describe, expect, it } from 'vitest';
import type { Assignment, Profile } from '../features/board/domain/types';
import { buildExportSnapshot } from './exportPNG';

describe('buildExportSnapshot', () => {
  it('uses active slot width, slot count, lane heights, and profile colors', () => {
    const profiles: Profile[] = [
      { id: 'p1', name: 'Alice', category: '', capacityPct: 100, color: '#4f9cf8', initials: 'AL' },
    ];
    const assignments: Assignment[] = [
      { id: 'a1', index: 0, profileId: 'p1', task: 'Build', startSlot: 0, endSlot: 2, dedicationPct: 100 },
      { id: 'a2', index: 1, profileId: 'p1', task: 'Review', startSlot: 1, endSlot: 3, dedicationPct: 50 },
    ];

    const snapshot = buildExportSnapshot(profiles, assignments, 'days', 4, 80);

    expect(snapshot.slotWidth).toBe(80);
    expect(snapshot.slotCount).toBe(4);
    expect(snapshot.rows[0].rowHeight).toBeGreaterThan(48);
    expect(snapshot.rows[0].profile.color).toBe('#4f9cf8');
    expect(snapshot.totalWidth).toBe(180 + 4 * 80);
  });
});
