import type { WorkerJobInput, WorkerJobResult } from './types';

type WorkerRequest = {
  id: string;
  type: 'run';
  payload: WorkerJobInput;
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

type WorkerResponse = WorkerSuccess | WorkerFailure;

let worker: Worker | null = null;

function getWorker(): Worker {
  if (worker) {
    return worker;
  }

  worker = new Worker(new URL('../workers/pandoc.worker.ts', import.meta.url), {
    type: 'module'
  });

  return worker;
}

export function runPandocInWorker(input: WorkerJobInput): Promise<WorkerJobResult> {
  const instance = getWorker();
  const id = crypto.randomUUID();

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      instance.removeEventListener('message', onMessage);
      instance.removeEventListener('error', onError);
    };

    const onMessage = (event: MessageEvent<WorkerResponse>) => {
      if (!event.data || event.data.id !== id) {
        return;
      }

      cleanup();

      if (event.data.type === 'success') {
        resolve(event.data.payload);
        return;
      }

      reject(new Error(event.data.error));
    };

    const onError = (event: ErrorEvent) => {
      cleanup();
      reject(new Error(event.message || 'Fallo del worker de pandoc.'));
    };

    instance.addEventListener('message', onMessage);
    instance.addEventListener('error', onError);

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

    const request: WorkerRequest = {
      id,
      type: 'run',
      payload: input
    };

    instance.postMessage(request, transferables);
  });
}
