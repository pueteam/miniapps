import Dexie, { type Table } from 'dexie';
import { generateInitials, getProfileColor } from '../domain/color';
import type { Assignment, Profile } from '../domain/types';

class PlanningDB extends Dexie {
  profiles!: Table<Profile, string>;
  assignments!: Table<Assignment, string>;

  constructor(name = 'resplanner') {
    super(name);
    this.version(1).stores({ profiles: 'id', assignments: 'id, profileId' });
    this.version(2).stores({ profiles: 'id', assignments: 'id, profileId' }).upgrade(async (tx) => {
      let index = 0;
      await tx.table('profiles').toCollection().modify((profile: Partial<Profile>) => {
        profile.color ??= getProfileColor(index);
        profile.initials ??= generateInitials(profile.name ?? '');
        index += 1;
      });
    });
    this.version(3).stores({ profiles: 'id', assignments: 'id, profileId' }).upgrade(async (tx) => {
      let i = 0;
      await tx.table('assignments').toCollection().modify((a: Partial<import('../domain/types').Assignment>) => {
        if (a.index === undefined) { a.index = i++; }
      });
    });
  }
}

export const db = new PlanningDB();
