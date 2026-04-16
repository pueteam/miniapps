import type { Assignment } from '../domain/types';
import { db } from './db';

export async function createAssignment(assignment: Assignment): Promise<void> { await db.assignments.add(assignment); }
export async function getAllAssignments(): Promise<Assignment[]> { return db.assignments.toArray(); }
export async function updateAssignment(id: string, patch: Partial<Assignment>): Promise<void> { await db.assignments.update(id, patch); }
export async function deleteAssignment(id: string): Promise<void> { await db.assignments.delete(id); }
export async function deleteByProfileId(profileId: string): Promise<void> { await db.assignments.where('profileId').equals(profileId).delete(); }
