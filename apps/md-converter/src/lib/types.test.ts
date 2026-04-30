import { describe, it, expect } from 'vitest';
import type { WorkerJobInput, BinaryInput } from './types';

describe('WorkerJobInput', () => {
  it('SHALL have referenceDoc field (BinaryInput | null)', () => {
    const input: WorkerJobInput = {
      conversionMode: 'markdown-to-docx',
      referenceDoc: { name: 'test.docx', bytes: new Uint8Array() } as BinaryInput,
    };
    expect(input.referenceDoc).toBeDefined();
    expect((input.referenceDoc as BinaryInput).name).toBe('test.docx');
  });

  it('SHALL have mathRendering field (string)', () => {
    const input: WorkerJobInput = {
      conversionMode: 'markdown-to-html',
      mathRendering: 'mathjax',
    };
    expect(input.mathRendering).toBe('mathjax');
  });

  it('SHALL have highlightStyle field (string)', () => {
    const input: WorkerJobInput = {
      conversionMode: 'markdown-to-docx',
      highlightStyle: 'pygments',
    };
    expect(input.highlightStyle).toBe('pygments');
  });

  it('SHALL allow referenceDoc to be null', () => {
    const input: WorkerJobInput = {
      conversionMode: 'markdown-to-docx',
      referenceDoc: null,
    };
    expect(input.referenceDoc).toBeNull();
  });
});
