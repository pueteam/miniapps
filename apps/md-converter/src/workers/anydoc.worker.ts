/// <reference lib="webworker" />

import {
  anydocErrorToSpanish,
  anydocOutputBasename,
  convertAnydocToMarkdown,
  ensureAnydocInit
} from '../lib/anydoc';
import type { WorkerJobResult } from '../lib/types';

export type AnydocJobInput = {
  bytes: Uint8Array;
  filename: string;
  outputBasename?: string;
};

type WorkerRequest = {
  id: string;
  type: 'run';
  payload: AnydocJobInput;
};

type WorkerSuccess = {
  id: string;
  type: 'success';
  payload: WorkerJobResult;
};

type WorkerFailure = {
  id: string;
  type: 'error';
  error: string;
};

const encoder = new TextEncoder();

self.addEventListener('message', async (event: MessageEvent<WorkerRequest>) => {
  const { id, payload } = event.data;

  try {
    await ensureAnydocInit();
    const markdown = convertAnydocToMarkdown(payload.bytes, payload.filename);
    const outputBytes = encoder.encode(markdown);
    const basename = payload.outputBasename?.trim() || anydocOutputBasename(payload.filename, 'document');
    const outputFilename = `${basename}.md`;
    const result: WorkerJobResult = {
      outputBytes,
      outputFilename,
      mimeType: 'text/markdown',
      logs: `Convertido con AnyDoc (offline) → ${outputFilename}`
    };

    const response: WorkerSuccess = { id, type: 'success', payload: result };
    self.postMessage(response, [result.outputBytes.buffer]);
  } catch (error) {
    const response: WorkerFailure = {
      id,
      type: 'error',
      error: anydocErrorToSpanish(error)
    };
    self.postMessage(response);
  }
});
