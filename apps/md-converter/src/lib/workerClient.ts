import type { WorkerJobInput, WorkerJobResult } from './types';
import { requestWorker } from './workerProtocol';

let worker: Worker | null = null;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('../workers/pandoc.worker.ts', import.meta.url), {
      type: 'module'
    });
  }

  return worker;
}

export function runPandocInWorker(input: WorkerJobInput): Promise<WorkerJobResult> {
  const transferables: Transferable[] = [];
  if (input.sourceFile?.bytes) {
    transferables.push(input.sourceFile.bytes.buffer);
  }
  if (input.cover?.bytes) {
    transferables.push(input.cover.bytes.buffer);
  }
  if (input.wasmBytes) {
    transferables.push(input.wasmBytes.buffer);
  }

  return requestWorker(getWorker(), input, transferables, 'Fallo del worker de pandoc.');
}
