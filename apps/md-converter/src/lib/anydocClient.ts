import type { WorkerJobResult } from './types';
import type { AnydocJobInput } from '../workers/anydoc.worker';

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

type WorkerResponse = WorkerSuccess | WorkerFailure;

let worker: Worker | null = null;

function getWorker(): Worker {
  if (worker) {
    return worker;
  }

  worker = new Worker(new URL('../workers/anydoc.worker.ts', import.meta.url), {
    type: 'module'
  });

  return worker;
}

export function runAnydocInWorker(input: AnydocJobInput): Promise<WorkerJobResult> {
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
      reject(new Error(event.message || 'Fallo del worker de AnyDoc.'));
    };

    instance.addEventListener('message', onMessage);
    instance.addEventListener('error', onError);

    const transferables: Transferable[] = [];
    if (input.bytes) {
      transferables.push(input.bytes.buffer);
    }

    const request: WorkerRequest = {
      id,
      type: 'run',
      payload: input
    };

    instance.postMessage(request, transferables);
  });
}
