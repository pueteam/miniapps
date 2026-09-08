import Dexie from 'dexie';
import type { Diagram, Viewport } from '../model/types';
import { validateDiagram } from '../model/validation';

type DraftRecord = { id: 'current'; doc: Diagram; viewport: Viewport };

export const db = new Dexie('miniapps:platon-editor');
db.version(1).stores({ drafts: 'id' });

function validViewport(value: unknown): Viewport {
  if (!value || typeof value !== 'object') throw new Error('Viewport local inválido');
  const source = value as Record<string, unknown>;
  if (![source.x, source.y, source.zoom].every(item => typeof item === 'number' && Number.isFinite(item)) || (source.zoom as number) <= 0) {
    throw new Error('Viewport local inválido');
  }
  return { x: source.x as number, y: source.y as number, zoom: source.zoom as number };
}

export async function saveDraft(doc: Diagram, viewport: Viewport): Promise<void> {
  const record: DraftRecord = { id: 'current', doc: validateDiagram(doc), viewport: validViewport(viewport) };
  await db.table<DraftRecord>('drafts').put(record);
}

export async function loadDraft(): Promise<{ doc: Diagram; viewport: Viewport } | null> {
  const record = await db.table<DraftRecord>('drafts').get('current');
  if (!record) return null;
  return { doc: validateDiagram(record.doc), viewport: validViewport(record.viewport) };
}
