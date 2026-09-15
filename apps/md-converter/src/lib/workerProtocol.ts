import type { WorkerJobResult } from './types';

export type WorkerSuccess = {
  id: string;
  type: 'success';
  payload: WorkerJobResult;
};

export type WorkerFailure = {
  id: string;
  type: 'error';
  error: string;
};

export type WorkerResponse = WorkerSuccess | WorkerFailure;

/** Envía un job `{id, type:'run', payload}` a un worker y resuelve con su `WorkerJobResult`. */
export function requestWorker<Payload>(
  worker: Worker,
  payload: Payload,
  transferables: Transferable[],
  fallbackError: string
): Promise<WorkerJobResult> {
  const id = crypto.randomUUID();

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      worker.removeEventListener('message', onMessage);
      worker.removeEventListener('error', onError);
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
      reject(new Error(event.message || fallbackError));
    };

    worker.addEventListener('message', onMessage);
    worker.addEventListener('error', onError);
    worker.postMessage({ id, type: 'run', payload }, transferables);
  });
}
