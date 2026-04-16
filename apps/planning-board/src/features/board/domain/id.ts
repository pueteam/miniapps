import { nanoid } from 'nanoid';

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try { return crypto.randomUUID(); } catch { /* fallback */ }
  }
  return nanoid();
}
