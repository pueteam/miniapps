import type { WorkerJobResult } from './types';
import { requestWorker } from './workerProtocol';
import type { AnydocJobInput } from '../workers/anydoc.worker';

let worker: Worker | null = null;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('../workers/anydoc.worker.ts', import.meta.url), {
      type: 'module'
    });
  }

  return worker;
}

export function runAnydocInWorker(input: AnydocJobInput): Promise<WorkerJobResult> {
  const transferables: Transferable[] = [];
  if (input.bytes) {
    transferables.push(input.bytes.buffer);
  }

  return requestWorker(getWorker(), input, transferables, 'Fallo del worker de AnyDoc.');
}
