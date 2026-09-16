import { expect, it, vi, afterEach } from 'vitest';
import { randomId } from './id';

afterEach(() => vi.restoreAllMocks());

it('genera identificadores únicos no vacíos', () => {
  const a = randomId();
  const b = randomId();
  expect(a).toBeTypeOf('string');
  expect(a.length).toBeGreaterThan(0);
  expect(a).not.toBe(b);
});

it('funciona sin crypto.randomUUID (contexto inseguro)', () => {
  const cryptoRef = (globalThis as Record<string, unknown>).crypto as { randomUUID?: () => string } | undefined;
  const original = cryptoRef?.randomUUID;
  try {
    if (cryptoRef) cryptoRef.randomUUID = undefined as unknown as () => string;
    const id = randomId();
    expect(id.length).toBeGreaterThan(0);
  } finally {
    if (cryptoRef && original) cryptoRef.randomUUID = original;
  }
});
