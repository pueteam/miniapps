import type { Profile } from '../domain/types';
import { db } from './db';

export async function createProfile(profile: Profile): Promise<void> { await db.profiles.add(profile); }
export async function getAllProfiles(): Promise<Profile[]> { return db.profiles.toArray(); }
export async function updateProfile(id: string, patch: Partial<Profile>): Promise<void> { await db.profiles.update(id, patch); }
export async function deleteProfile(id: string): Promise<void> { await db.profiles.delete(id); }
