import { act, render, screen } from '@testing-library/preact';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { emptyDiagram } from '../model/document';
import { useAutosave } from './useAutosave';
import { saveDraft } from './db';

vi.mock('./db', () => ({ saveDraft: vi.fn() }));

const documentFixture = emptyDiagram();
const viewportFixture = { x: 0, y: 0, zoom: 1 };
function Probe({ enabled = true }: { enabled?: boolean }) {
  const state = useAutosave(documentFixture, viewportFixture, enabled);
  return <span>{state}</span>;
}

beforeEach(() => { vi.useFakeTimers(); vi.mocked(saveDraft).mockReset().mockResolvedValue(); });
afterEach(() => vi.useRealTimers());

it('espera 300 ms y comunica el guardado', async () => {
  render(<Probe />);
  expect(screen.getByText('saving')).toBeTruthy();
  await act(async () => { await vi.advanceTimersByTimeAsync(300); });
  expect(saveDraft).toHaveBeenCalledOnce();
  expect(screen.getByText('saved')).toBeTruthy();
});

it('no guarda antes de hidratar y comunica errores', async () => {
  const view = render(<Probe enabled={false} />);
  await act(async () => { await vi.advanceTimersByTimeAsync(300); });
  expect(saveDraft).not.toHaveBeenCalled();
  vi.mocked(saveDraft).mockRejectedValueOnce(new Error('cuota'));
  view.rerender(<Probe enabled />);
  await act(async () => { await vi.advanceTimersByTimeAsync(300); });
  expect(screen.getByText('error')).toBeTruthy();
});
