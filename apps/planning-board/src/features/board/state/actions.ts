import type { Profile, Assignment, ViewMode } from '../domain/types';
import { generateId } from '../domain/id';
import { getProfileColor, generateInitials, normalizeInitials } from '../domain/color';
import { clampSlot } from '../domain/slots';
import { validateProfile, validateAssignment } from '../domain/validate';
import {
  profiles, assignments, viewMode, activeProfileId, editingAssignmentId,
  deletingProfileId, slotCount, contextMenuTarget, hoveredBarState,
} from './signals';
import * as profileRepo from '../persistence/profileRepo';
import * as assignmentRepo from '../persistence/assignmentRepo';

function logActionError(message: string, error: unknown): void {
  console.error(message, error);
}

export async function loadAll(): Promise<void> {
  const [p, a] = await Promise.all([profileRepo.getAllProfiles(), assignmentRepo.getAllAssignments()]);
  profiles.value = p;
  assignments.value = a;
}

export async function createProfile(name: string, category = ''): Promise<string | null> {
  const validation = validateProfile(name, category);
  if (!validation.valid) return null;
  const profile: Profile = {
    id: generateId(),
    name: name.trim(),
    category: category.trim(),
    capacityPct: 100,
    color: getProfileColor(profiles.value.length),
    initials: generateInitials(name),
  };
  profiles.value = [...profiles.value, profile];
  try {
    await profileRepo.createProfile(profile);
    return profile.id;
  } catch (error) {
    profiles.value = profiles.value.filter((c) => c.id !== profile.id);
    logActionError('[actions] failed to create profile', error);
    return null;
  }
}

export async function deleteProfile(id: string): Promise<void> {
  const prevProfiles = profiles.value;
  const prevAssignments = assignments.value;
  profiles.value = profiles.value.filter((p) => p.id !== id);
  assignments.value = assignments.value.filter((a) => a.profileId !== id);
  try {
    await Promise.all([profileRepo.deleteProfile(id), assignmentRepo.deleteByProfileId(id)]);
  } catch (error) {
    profiles.value = prevProfiles;
    assignments.value = prevAssignments;
    logActionError('[actions] failed to delete profile', error);
  }
}

export async function createAssignment(profileId: string, startSlot: number = 0, endSlot: number = 0): Promise<string | null> {
  const assignment: Assignment = { id: generateId(), profileId, task: 'New task', startSlot, endSlot, dedicationPct: 100 };
  const validation = validateAssignment(assignment.task, assignment.startSlot, assignment.endSlot, assignment.dedicationPct);
  if (!validation.valid) return null;
  assignments.value = [...assignments.value, assignment];
  try {
    await assignmentRepo.createAssignment(assignment);
    editingAssignmentId.value = assignment.id;
    return assignment.id;
  } catch (error) {
    assignments.value = assignments.value.filter((c) => c.id !== assignment.id);
    logActionError('[actions] failed to create assignment', error);
    return null;
  }
}

export async function updateAssignment(id: string, patch: Partial<Assignment>): Promise<void> {
  const idx = assignments.value.findIndex((a) => a.id === id);
  if (idx === -1) return;
  const prevAssignments = assignments.value;
  const updated = { ...assignments.value[idx], ...patch };
  const validation = validateAssignment(updated.task, updated.startSlot, updated.endSlot, updated.dedicationPct);
  if (!validation.valid) return;
  const next = [...assignments.value];
  next[idx] = updated;
  assignments.value = next;
  try {
    await assignmentRepo.updateAssignment(id, patch);
  } catch (error) {
    assignments.value = prevAssignments;
    logActionError('[actions] failed to update assignment', error);
  }
}

export async function deleteAssignment(id: string): Promise<void> {
  const prevAssignments = assignments.value;
  const prevEditing = editingAssignmentId.value;
  const prevCtx = contextMenuTarget.value;
  const prevHovered = hoveredBarState.value;
  assignments.value = assignments.value.filter((a) => a.id !== id);
  if (editingAssignmentId.value === id) editingAssignmentId.value = null;
  if (contextMenuTarget.value?.assignmentId === id) contextMenuTarget.value = null;
  if (hoveredBarState.value?.assignmentId === id) hoveredBarState.value = null;
  try {
    await assignmentRepo.deleteAssignment(id);
  } catch (error) {
    assignments.value = prevAssignments;
    editingAssignmentId.value = prevEditing;
    contextMenuTarget.value = prevCtx;
    hoveredBarState.value = prevHovered;
    logActionError('[actions] failed to delete assignment', error);
  }
}

export async function updateProfile(id: string, patch: Partial<Profile>): Promise<void> {
  const idx = profiles.value.findIndex((p) => p.id === id);
  if (idx === -1) return;
  const current = profiles.value[idx];
  const updated: Profile = {
    ...current,
    ...patch,
    initials: patch.initials === undefined ? current.initials : normalizeInitials(patch.initials, patch.name ?? current.name),
  };
  const next = [...profiles.value];
  next[idx] = updated;
  profiles.value = next;
  try {
    await profileRepo.updateProfile(id, updated);
  } catch (error) {
    profiles.value = [...profiles.value.slice(0, idx), current, ...profiles.value.slice(idx + 1)];
    logActionError('[actions] failed to update profile', error);
  }
}

export async function duplicateAssignment(id: string): Promise<void> {
  const original = assignments.value.find((a) => a.id === id);
  if (!original) return;
  const prevAssignments = assignments.value;
  const duration = original.endSlot - original.startSlot;
  const maxSlot = slotCount.value - 1;
  const newStart = clampSlot(original.endSlot + 1, 0, maxSlot);
  const newEnd = clampSlot(newStart + duration, 0, maxSlot);
  const copy: Assignment = { ...original, id: generateId(), task: `${original.task} (copy)`, startSlot: newStart, endSlot: newEnd };
  assignments.value = [...assignments.value, copy];
  try {
    await assignmentRepo.createAssignment(copy);
  } catch (error) {
    assignments.value = prevAssignments;
    logActionError('[actions] failed to duplicate assignment', error);
  }
}

export function clearTransientUi(): void {
  editingAssignmentId.value = null;
  contextMenuTarget.value = null;
  hoveredBarState.value = null;
}

export function setViewMode(mode: ViewMode): void {
  viewMode.value = mode;
  localStorage.setItem('viewMode', mode);
}

export function setActiveProfileId(id: string | null): void {
  activeProfileId.value = activeProfileId.value === id ? null : id;
}

export function setDeletingProfileId(id: string | null): void {
  deletingProfileId.value = id;
}

export function setEditingAssignmentId(id: string | null): void {
  editingAssignmentId.value = id;
}
