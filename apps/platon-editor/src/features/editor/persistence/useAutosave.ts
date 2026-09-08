import { useEffect, useRef, useState } from 'preact/hooks';
import type { Diagram, Viewport } from '../model/types';
import { saveDraft } from './db';

export type AutosaveStatus = 'saving' | 'saved' | 'error';

export function useAutosave(doc: Diagram, viewport: Viewport, enabled: boolean): AutosaveStatus {
  const [status, setStatus] = useState<AutosaveStatus>('saved');
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
    }, 300);
    return () => { active = false; window.clearTimeout(timer); };
  }, [doc, viewport, enabled]);

  return status;
}
