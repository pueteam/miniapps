/// <reference lib="webworker" />

import { runPandoc } from "../lib/pandocRunner";
import type { WorkerJobInput, WorkerJobResult } from "../lib/types";

type WorkerRequest = {
  id: string;
  type: "run";
  payload: WorkerJobInput;
};

type WorkerSuccess = {
  id: string;
  type: "success";
  payload: WorkerJobResult;
};

type WorkerFailure = {
  id: string;
  type: "error";
  error: string;
};

self.addEventListener("message", async (event: MessageEvent<WorkerRequest>) => {
  const { id, payload } = event.data;

  try {
    const result = await runPandoc(payload);
    const response: WorkerSuccess = {
      id,
      type: "success",
      payload: result
    };

    self.postMessage(response, [result.epubBytes.buffer]);
  } catch (error) {
    const response: WorkerFailure = {
      id,
      type: "error",
      error: error instanceof Error ? error.message : String(error)
    };

    self.postMessage(response);
  }
});
