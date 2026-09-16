import { beforeEach, expect, it } from 'vitest';
import { emptyDiagram } from '../model/document';
import { db, loadDraft, DEFAULT_VIEWPORT } from './db';

beforeEach(async () => { await db.table('drafts').clear(); });

it('degrada viewport corrupto a valor por defecto sin perder el documento', async () => {
  const doc = emptyDiagram();
  doc.metadata.title = 'Mi cadena';
  await db.table('drafts').put({ id: 'current', doc, viewport: { x: NaN, y: 0, zoom: 1 } });
  const draft = await loadDraft();
  expect(draft?.doc.metadata.title).toBe('Mi cadena');
  expect(draft?.viewport).toEqual(DEFAULT_VIEWPORT);
});

it('sigue rechazando documento corrupto aunque el viewport sea válido', async () => {
  await db.table('drafts').put({ id: 'current', doc: { version: 2 }, viewport: { x: 0, y: 0, zoom: 1 } });
  await expect(loadDraft()).rejects.toThrow();
});
