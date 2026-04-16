import { VALIDATION_LIMITS } from './constants';

interface ValidationResult { valid: boolean; error?: string; }

export function validateProfile(name: string, category?: string, capacityPct?: number): ValidationResult {
  const trimmed = name.trim();
  if (!trimmed) return { valid: false, error: 'Name is required' };
  if (trimmed.length > VALIDATION_LIMITS.PROFILE_NAME_MAX)
    return { valid: false, error: `Name too long (max ${VALIDATION_LIMITS.PROFILE_NAME_MAX} chars)` };
  if (category && category.length > VALIDATION_LIMITS.PROFILE_CATEGORY_MAX)
    return { valid: false, error: 'Category too long (max 30 chars)' };
  if (capacityPct !== undefined && (capacityPct < VALIDATION_LIMITS.PROFILE_CAPACITY_MIN || capacityPct > VALIDATION_LIMITS.PROFILE_CAPACITY_MAX))
    return { valid: false, error: `Capacity must be ${VALIDATION_LIMITS.PROFILE_CAPACITY_MIN}-${VALIDATION_LIMITS.PROFILE_CAPACITY_MAX}` };
  return { valid: true };
}

export function validateAssignment(task: string, startSlot: number, endSlot: number, dedicationPct: number): ValidationResult {
  if (!task.trim()) return { valid: false, error: 'Task name is required' };
  if (task.length > VALIDATION_LIMITS.ASSIGNMENT_TASK_MAX)
    return { valid: false, error: `Task name too long (max ${VALIDATION_LIMITS.ASSIGNMENT_TASK_MAX} chars)` };
  if (startSlot < 0) return { valid: false, error: 'Start slot must be >= 0' };
  if (endSlot < startSlot) return { valid: false, error: 'End slot must be >= start slot' };
  if (dedicationPct < VALIDATION_LIMITS.ASSIGNMENT_DEDICATION_MIN || dedicationPct > VALIDATION_LIMITS.ASSIGNMENT_DEDICATION_MAX)
    return { valid: false, error: `Dedication must be ${VALIDATION_LIMITS.ASSIGNMENT_DEDICATION_MIN}-${VALIDATION_LIMITS.ASSIGNMENT_DEDICATION_MAX}` };
  return { valid: true };
}
