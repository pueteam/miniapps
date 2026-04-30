import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const cssPath = join(dirname(fileURLToPath(import.meta.url)), 'index.css');
const css = readFileSync(cssPath, 'utf8');

const getRule = (selector: string) => {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`(?:^|})\\s*${escapedSelector}\\s*\\{([^}]*)\\}`));
  return match?.[1] ?? '';
};

describe('index.css design-token alignment', () => {
  it('does not redefine base.css design tokens locally', () => {
    const duplicateTokens = [
      '--app-accent',
      '--app-accent-hover',
      '--bg-page',
      '--bg-surface',
      '--bg-soft',
      '--text-primary',
      '--text-body',
      '--text-secondary',
      '--text-muted',
      '--border-subtle',
      '--border-default',
      '--shadow-sm',
      '--shadow-md'
    ];

    duplicateTokens.forEach((token) => {
      expect(css).not.toContain(token);
    });
  });

  it('uses base.css tokens for key component surfaces', () => {
    expect(getRule('.btn-primary')).toContain('background: var(--color-accent-primary)');
    expect(getRule('.btn-primary')).toContain('color: var(--color-neutral-white)');
    expect(getRule('.btn-secondary,\n.install-btn')).toContain('background: var(--color-bg-surface)');
    expect(getRule('.panel')).toContain('box-shadow: var(--shadow-subtle)');
    expect(getRule('.panel:hover')).toContain('box-shadow: var(--shadow-soft)');
    expect(getRule('.settings-modal')).toContain('background: var(--color-bg-surface)');
  });

  it('does not duplicate reset or broad input base rules from base.css', () => {
    expect(css).not.toMatch(/\*\s*\{[^}]*box-sizing:\s*border-box/i);
    expect(css).not.toMatch(/body\s*\{[^}]*margin:\s*0/i);
    expect(css).not.toMatch(/input,\s*textarea,\s*select\s*\{/i);
  });

  it('uses the base.css mobile breakpoint', () => {
    expect(css).toContain('@media (max-width: 640px)');
    expect(css).not.toContain('@media (max-width: 720px)');
  });
});
