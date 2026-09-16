import { render, screen } from '@testing-library/preact';
import { expect, it, vi } from 'vitest';
import { Palette } from './Palette';

const symbols: Record<string, string> = {
  job: '▢',
  action: '◇',
  text: 'T',
  group: '▤',
  header: '☰',
};

it('muestra un símbolo distintivo por cada tipo de elemento', () => {
  render(<Palette onAdd={vi.fn()} />);
  for (const [kind, symbol] of Object.entries(symbols)) {
    const buttons = screen.getAllByRole('button');
    const match = buttons.find((b) => b.textContent?.includes(symbol));
    expect(match, `símbolo ${symbol} para ${kind}`).toBeTruthy();
  }
});
