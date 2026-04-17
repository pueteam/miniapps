import { describe, it, expect, beforeEach } from 'vitest';
import Dexie from 'dexie';
import { db } from './db';
import type { Profile, Assignment } from '../domain/types';

describe('persistence', () => {
  beforeEach(async () => {
    await db.profiles.clear();
    await db.assignments.clear();
  });

  describe('profileRepo', () => {
    it('creates and retrieves a profile', async () => {
      const profile: Profile = { id: 'p1', name: 'Alice', category: 'Dev', capacityPct: 100, color: '#4f9cf8', initials: 'AL' };
      await db.profiles.add(profile);
      const result = await db.profiles.get('p1');
      expect(result).toEqual(profile);
    });

    it('updates a profile', async () => {
      const profile: Profile = { id: 'p1', name: 'Alice', category: 'Dev', capacityPct: 100, color: '#4f9cf8', initials: 'AL' };
      await db.profiles.add(profile);
      await db.profiles.update('p1', { name: 'Bob' });
      const result = await db.profiles.get('p1');
      expect(result?.name).toBe('Bob');
    });

    it('deletes a profile', async () => {
      const profile: Profile = { id: 'p1', name: 'Alice', category: 'Dev', capacityPct: 100, color: '#4f9cf8', initials: 'AL' };
      await db.profiles.add(profile);
      await db.profiles.delete('p1');
      const result = await db.profiles.get('p1');
      expect(result).toBeUndefined();
    });

    it('returns all profiles', async () => {
      await db.profiles.bulkAdd([
        { id: 'p1', name: 'Alice', category: 'Dev', capacityPct: 100, color: '#4f9cf8', initials: 'AL' },
        { id: 'p2', name: 'Bob', category: 'QA', capacityPct: 80, color: '#34d399', initials: 'BO' },
      ]);
      const all = await db.profiles.toArray();
      expect(all).toHaveLength(2);
    });

    it('migrates profiles created before color and initials existed', async () => {
      const name = 'planning-board-migration-test';
      await indexedDB.deleteDatabase(name);

      const oldDb = new Dexie(name);
      oldDb.version(1).stores({
        profiles: 'id',
        assignments: 'id, profileId',
      });
      await oldDb.open();
      await oldDb.table('profiles').add({ id: 'p1', name: 'Alice', category: 'Dev', capacityPct: 100 });
      await oldDb.close();

      const { db: currentDb } = await import('./db');
      const PlanningDBCtor = currentDb.constructor as {
        new (dbName: string): typeof currentDb;
      };
      const migratedDb = new PlanningDBCtor(name);
      await migratedDb.open();
      const profile = await migratedDb.profiles.get('p1');

      expect(profile?.color).toBeTruthy();
      expect(profile?.initials).toBe('AL');

      await migratedDb.delete();
    });
  });

  describe('assignmentRepo', () => {
    it('creates and retrieves an assignment', async () => {
      const a: Assignment = { id: 'a1', index: 0, profileId: 'p1', task: 'Task', startSlot: 0, endSlot: 2, dedicationPct: 100 };
      await db.assignments.add(a);
      const result = await db.assignments.get('a1');
      expect(result).toEqual(a);
    });

    it('deletes by profileId', async () => {
      await db.assignments.bulkAdd([
        { id: 'a1', index: 0, profileId: 'p1', task: 'T1', startSlot: 0, endSlot: 0, dedicationPct: 100 },
        { id: 'a2', index: 1, profileId: 'p1', task: 'T2', startSlot: 1, endSlot: 1, dedicationPct: 50 },
        { id: 'a3', index: 2, profileId: 'p2', task: 'T3', startSlot: 0, endSlot: 0, dedicationPct: 100 },
      ]);
      await db.assignments.where('profileId').equals('p1').delete();
      const remaining = await db.assignments.toArray();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].profileId).toBe('p2');
    });
  });
});
