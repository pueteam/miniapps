import type { Diagram } from './types';
export type History = { past: Diagram[]; present: Diagram; future: Diagram[] };
export function startHistory(doc: Diagram): History { return { past: [], present: doc, future: [] }; }
export function commitHistory(h: History, doc: Diagram): History {
  if (JSON.stringify(h.present) === JSON.stringify(doc)) return h;
  return { past: [...h.past, h.present].slice(-100), present: doc, future: [] };
}
export function undo(h: History): History {
  const previous = h.past.at(-1); return previous ? { past: h.past.slice(0, -1), present: previous, future: [h.present, ...h.future] } : h;
}
export function redo(h: History): History {
  const next = h.future[0]; return next ? { past: [...h.past, h.present].slice(-100), present: next, future: h.future.slice(1) } : h;
}
