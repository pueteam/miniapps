import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('sticky board visual styles', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/features/sticky-board/styles/board.css'), 'utf8');

  it('animates newly created notes with scale and fade-in', () => {
    expect(css).toContain('@keyframes sticky-note-enter');
    expect(css).toMatch(/from\s*{[^}]*opacity:\s*0[^}]*transform:\s*rotate\(var\(--rot\)\)\s*scale\(0\.8\)/s);
    expect(css).toMatch(/to\s*{[^}]*opacity:\s*1[^}]*transform:\s*rotate\(var\(--rot\)\)\s*scale\(1\)/s);
  });

  it('uses a glow halo and stronger elevation for selected notes', () => {
    expect(css).toMatch(/\.sticky-note--selected\s*{[^}]*box-shadow:[^}]*0\s+0\s+0\s+6px\s+rgba\(96,\s*165,\s*250/s);
    expect(css).toMatch(/\.sticky-note--selected\s*{[^}]*filter:\s*drop-shadow\(0\s+18px\s+26px\s+rgba\(15,\s*23,\s*42/s);
  });

  it('keeps note textareas hidden-scroll and auto-expand constrained', () => {
    expect(css).toMatch(/\.sticky-note textarea\s*{[^}]*overflow:\s*hidden/s);
    expect(css).toMatch(/\.sticky-note textarea\s*{[^}]*max-height:\s*calc\(100%\s*-\s*64px\)/s);
  });

  it('animates the pin bounce when a note is fixed', () => {
    expect(css).toContain('@keyframes sticky-pin-bounce');
    expect(css).toMatch(/\.sticky-note__pin\s*{[^}]*animation:\s*sticky-pin-bounce/s);
  });

  it('declares explicit grab and grabbing cursors for drag zones', () => {
    expect(css).toMatch(/\.sticky-note__grip\s*{[^}]*cursor:\s*grab/s);
    expect(css).toMatch(/\.sticky-note__grip:active\s*{[^}]*cursor:\s*grabbing/s);
    expect(css).toMatch(/\.sticky-note--rotating\s+\.rotation-dial\s*{[^}]*cursor:\s*grabbing/s);
  });

  it('keeps the color picker compact inside the smallest note width', () => {
    expect(css).toMatch(/\.sticky-note\s*{[^}]*min-width:\s*210px/s);
    expect(css).toMatch(/\.sticky-note__controls\s*{[^}]*display:\s*grid[^}]*grid-template-columns:\s*1fr\s+auto/s);
    expect(css).toMatch(/\.color-row\s*{[^}]*flex-wrap:\s*nowrap/s);
    expect(css).toMatch(/\.color-dot\s*{[^}]*width:\s*20px[^}]*min-height:\s*20px/s);
  });

  it('separates the delete button from swatches and makes the active swatch obvious', () => {
    expect(css).toMatch(/\.delete-btn\s*{[^}]*margin-left:\s*auto/s);
    expect(css).toMatch(/\.color-dot--active\s*{[^}]*border-color:\s*#333/s);
    expect(css).toMatch(/\.color-dot--active\s*{[^}]*box-shadow:[^}]*0\s+0\s+0\s+2px\s+rgba\(255,\s*255,\s*255/s);
  });

  it('raises selected and editing notes beyond the subtle halo', () => {
    expect(css).toMatch(/\.sticky-note--editing\s*{[^}]*box-shadow:[^}]*0\s+22px\s+36px\s+rgba\(15,\s*23,\s*42/s);
    expect(css).toMatch(/\.sticky-note--editing\s*{[^}]*filter:\s*drop-shadow\(0\s+18px\s+28px\s+rgba\(15,\s*23,\s*42/s);
  });

  it('dims non-matching notes and underlines search highlights', () => {
    expect(css).toMatch(/\.sticky-note--search-dimmed\s*{[^}]*opacity:\s*0\.16/s);
    expect(css).toMatch(/\.sticky-note--search-dimmed\s*{[^}]*filter:\s*opacity\(0\.72\)\s+grayscale\(0\.85\)\s+saturate\(0\.35\)\s+contrast\(0\.82\)\s+blur\(0\.6px\)/s);
    expect(css).toMatch(/\.sticky-note__highlight\s*{[^}]*text-decoration:\s*underline/s);
  });
});
