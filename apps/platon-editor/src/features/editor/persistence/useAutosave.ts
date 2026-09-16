import { useEffect, useRef, useState } from 'preact/hooks';
import type { Diagram, Viewport } from '../model/types';
import { saveDraft } from './db';

export type AutosaveStatus = 'saving' | 'saved' | 'error';

export const AUTOSAVE_MS = 300;

export function useAutosave(doc: Diagram, viewport: Viewport, enabled: boolean): { status: AutosaveStatus; retry: () => void } {
  const [status, setStatus] = useState<AutosaveStatus>('saved');
  const [attempt, setAttempt] = useState(0);
  const writes = useRef<Promise<void>>(Promise.resolve());
  const revision = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    const currentRevision = ++revision.current;
    let active = true;
    setStatus('saving');
    const timer = window.setTimeout(() => {
      writes.current = writes.current.catch(() => undefined).then(() => saveDraft(doc, viewport));
      writes.current.then(
        () => { if (active && revision.current === currentRevision) setStatus('saved'); },
        () => { if (active && revision.current === currentRevision) setStatus('error'); },
      );
    }, AUTOSAVE_MS);
    return () => { active = false; window.clearTimeout(timer); };
  }, [doc, viewport, enabled, attempt]);

  return { status, retry: () => setAttempt((n) => n + 1) };
}
