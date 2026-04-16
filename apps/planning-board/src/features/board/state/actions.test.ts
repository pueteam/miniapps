import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as profileRepo from '../persistence/profileRepo';
import * as assignmentRepo from '../persistence/assignmentRepo';
import { profiles, assignments, overloadMap, slotCount } from './signals';
import { createProfile, deleteProfile, createAssignment, updateAssignment, duplicateAssignment, clearTransientUi, updateProfile } from './actions';
import { PROFILE_COLOR_PALETTE } from '../domain/color';

vi.mock('../persistence/profileRepo');
vi.mock('../persistence/assignmentRepo');

beforeEach(() => {
  profiles.value = [];
  assignments.value = [];
  slotCount.value = 60;
  vi.clearAllMocks();
});

describe('createProfile', () => {
  it('adds profile to signal and calls repo', async () => {
    vi.spyOn(profileRepo, 'createProfile').mockResolvedValue();
    const id = await createProfile('Alice');
    expect(id).toBeTruthy();
    expect(profiles.value).toHaveLength(1);
    expect(profiles.value[0].name).toBe('Alice');
    expect(profiles.value[0].color).toBe(PROFILE_COLOR_PALETTE[0]);
    expect(profiles.value[0].initials).toBe('AL');
    expect(profileRepo.createProfile).toHaveBeenCalledOnce();
  });

  it('rotates profile color defaults as profiles are created', async () => {
    vi.spyOn(profileRepo, 'createProfile').mockResolvedValue();

    await createProfile('Alice');
    await createProfile('Bob');

    expect(profiles.value[0].color).toBe(PROFILE_COLOR_PALETTE[0]);
    expect(profiles.value[1].color).toBe(PROFILE_COLOR_PALETTE[1]);
  });

  it('rejects empty name', async () => {
    const id = await createProfile('');
    expect(id).toBeNull();
    expect(profiles.value).toHaveLength(0);
  });

  it('rolls back and logs when profile persistence fails', async () => {
    const error = new Error('db write failed');
    vi.spyOn(profileRepo, 'createProfile').mockRejectedValue(error);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const id = await createProfile('Alice');

    expect(id).toBeNull();
    expect(profiles.value).toHaveLength(0);
    expect(errorSpy).toHaveBeenCalledWith('[actions] failed to create profile', error);
  });
});

describe('deleteProfile', () => {
  it('removes profile and its assignments', async () => {
    vi.spyOn(profileRepo, 'deleteProfile').mockResolvedValue();
    vi.spyOn(assignmentRepo, 'deleteByProfileId').mockResolvedValue();
    vi.spyOn(profileRepo, 'createProfile').mockResolvedValue();
    vi.spyOn(assignmentRepo, 'createAssignment').mockResolvedValue();

    const pid = await createProfile('Alice');
    await createAssignment(pid!);
    expect(profiles.value).toHaveLength(1);
    expect(assignments.value).toHaveLength(1);

    await deleteProfile(pid!);
    expect(profiles.value).toHaveLength(0);
    expect(assignments.value).toHaveLength(0);
    expect(assignmentRepo.deleteByProfileId).toHaveBeenCalledWith(pid);
  });
});

describe('updateAssignment', () => {
  it('updates assignment in signal and calls repo', async () => {
    vi.spyOn(profileRepo, 'createProfile').mockResolvedValue();
    vi.spyOn(assignmentRepo, 'createAssignment').mockResolvedValue();
    vi.spyOn(assignmentRepo, 'updateAssignment').mockResolvedValue();

    const pid = await createProfile('Alice');
    const aid = await createAssignment(pid!);
    await updateAssignment(aid!, { task: 'Updated' });
    const updated = assignments.value.find((a) => a.id === aid);
    expect(updated?.task).toBe('Updated');
    expect(assignmentRepo.updateAssignment).toHaveBeenCalledWith(aid, { task: 'Updated' });
  });

  it('rolls back and logs when assignment persistence fails', async () => {
    const error = new Error('db update failed');
    vi.spyOn(profileRepo, 'createProfile').mockResolvedValue();
    vi.spyOn(assignmentRepo, 'createAssignment').mockResolvedValue();
    vi.spyOn(assignmentRepo, 'updateAssignment').mockRejectedValue(error);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const pid = await createProfile('Alice');
    const aid = await createAssignment(pid!);
    await updateAssignment(aid!, { task: 'Updated' });

    expect(assignments.value.find((assignment) => assignment.id === aid)?.task).toBe('New task');
    expect(errorSpy).toHaveBeenCalledWith('[actions] failed to update assignment', error);
  });
});

describe('deleteAssignment', () => {
  it('restores the assignment and logs when delete persistence fails', async () => {
    const error = new Error('db delete failed');
    vi.spyOn(profileRepo, 'createProfile').mockResolvedValue();
    vi.spyOn(assignmentRepo, 'createAssignment').mockResolvedValue();
    vi.spyOn(assignmentRepo, 'deleteAssignment').mockRejectedValue(error);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { deleteAssignment } = await import('./actions');
    const pid = await createProfile('Alice');
    const aid = await createAssignment(pid!);

    await deleteAssignment(aid!);

    expect(assignments.value.some((assignment) => assignment.id === aid)).toBe(true);
    expect(errorSpy).toHaveBeenCalledWith('[actions] failed to delete assignment', error);
  });
});

describe('duplicateAssignment', () => {
  it('creates a follow-on assignment and calls the repo', async () => {
    vi.spyOn(profileRepo, 'createProfile').mockResolvedValue();
    vi.spyOn(assignmentRepo, 'createAssignment').mockResolvedValue();
    vi.spyOn(assignmentRepo, 'updateAssignment').mockResolvedValue();

    const pid = await createProfile('Alice');
    const aid = await createAssignment(pid!);
    await updateAssignment(aid!, { task: 'Build', startSlot: 2, endSlot: 4, dedicationPct: 75 });

    await duplicateAssignment(aid!);

    expect(assignments.value).toHaveLength(2);
    expect(assignments.value[1]).toMatchObject({
      profileId: pid,
      task: 'Build (copy)',
      startSlot: 5,
      endSlot: 7,
      dedicationPct: 75,
    });
    expect(assignmentRepo.createAssignment).toHaveBeenCalledTimes(2);
  });

  it('clamps a duplicated assignment within board bounds', async () => {
    vi.spyOn(profileRepo, 'createProfile').mockResolvedValue();
    vi.spyOn(assignmentRepo, 'createAssignment').mockResolvedValue();
    vi.spyOn(assignmentRepo, 'updateAssignment').mockResolvedValue();

    slotCount.value = 6;
    const pid = await createProfile('Alice');
    const aid = await createAssignment(pid!);
    await updateAssignment(aid!, { task: 'Build', startSlot: 4, endSlot: 5, dedicationPct: 75 });

    await duplicateAssignment(aid!);

    expect(assignments.value[1]).toMatchObject({
      startSlot: 5,
      endSlot: 5,
    });
  });
});

describe('updateProfile', () => {
  it('keeps initials non-empty when saving blank initials', async () => {
    vi.spyOn(profileRepo, 'createProfile').mockResolvedValue();
    vi.spyOn(profileRepo, 'updateProfile').mockResolvedValue();

    const id = await createProfile('Alice Baker');
    await updateProfile(id!, { initials: '   ' });

    expect(profiles.value[0].initials).toBe('AB');
  });
});

describe('clearTransientUi', () => {
  it('clears editing, context menu, and hover state', async () => {
    const { editingAssignmentId, contextMenuTarget, hoveredBarState } = await import('./signals');

    editingAssignmentId.value = 'a1';
    contextMenuTarget.value = { assignmentId: 'a1', x: 10, y: 20 };
    hoveredBarState.value = { assignmentId: 'a1', rect: new DOMRect(0, 0, 10, 10) };

    clearTransientUi();

    expect(editingAssignmentId.value).toBeNull();
    expect(contextMenuTarget.value).toBeNull();
    expect(hoveredBarState.value).toBeNull();
  });
});

describe('overloadMap', () => {
  it('detects overloaded slots', async () => {
    vi.spyOn(profileRepo, 'createProfile').mockResolvedValue();
    vi.spyOn(assignmentRepo, 'createAssignment').mockResolvedValue();

    const pid = await createProfile('Alice');
    await createAssignment(pid!);
    await updateAssignment(assignments.value[0].id, { startSlot: 0, endSlot: 2, dedicationPct: 60 });
    const a2 = await createAssignment(pid!);
    await updateAssignment(a2!, { startSlot: 1, endSlot: 3, dedicationPct: 50 });

    const overloads = overloadMap.value.get(pid!);
    expect(overloads).toBeDefined();
    expect(overloads!.length).toBeGreaterThan(0);
  });
});
