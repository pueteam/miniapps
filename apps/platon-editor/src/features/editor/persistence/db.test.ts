import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { emptyDiagram } from '../model/document';
import { db, saveDraft, loadDraft } from './db';

beforeEach(async () => { await db.table('drafts').clear(); });
afterEach(() => vi.restoreAllMocks());

it('recupera documento y viewport sin referencias compartidas', async () => {
  const doc = emptyDiagram();
  doc.metadata.title = 'Cadena guardada';
  const viewport = { x: 30, y: -20, zoom: 0.75 };
  await saveDraft(doc, viewport);
  doc.metadata.title = 'Cambio sin guardar';
  const draft = await loadDraft();
  expect(draft?.doc.metadata.title).toBe('Cadena guardada');
  expect(draft?.viewport).toEqual(viewport);
});

it('propaga fallos de escritura y permite guardar después del fallo', async () => {
  const table = db.table('drafts');
  vi.spyOn(table, 'put').mockRejectedValueOnce(new Error('Cuota agotada'));
  await expect(saveDraft(emptyDiagram(), { x: 0, y: 0, zoom: 1 })).rejects.toThrow();
  await saveDraft(emptyDiagram(), { x: 1, y: 2, zoom: 1 });
  expect((await loadDraft())?.viewport.x).toBe(1);
});

it('valida borradores y viewport al recuperarlos', async () => {
  await db.table('drafts').put({ id: 'current', doc: { version: 2 }, viewport: { x: 0, y: 0, zoom: 1 } });
  await expect(loadDraft()).rejects.toThrow();
  await expect(saveDraft(emptyDiagram(), { x: 0, y: 0, zoom: 0 })).rejects.toThrow();
});
