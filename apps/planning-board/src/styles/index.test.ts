import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('styles/index.css', () => {
  it('keeps base.css imported before reset and tokens', () => {
    const cssPath = resolve(process.cwd(), 'src/styles/index.css');
    const css = readFileSync(cssPath, 'utf8');

    const baseImport = "@import '../../../../styles/base.css';";
    const resetImport = "@import './reset.css';";
    const tokensImport = "@import './tokens.css';";

    expect(css).toContain(baseImport);
    expect(css).toContain(resetImport);
    expect(css).toContain(tokensImport);
    expect(css.indexOf(baseImport)).toBeLessThan(css.indexOf(resetImport));
    expect(css.indexOf(resetImport)).toBeLessThan(css.indexOf(tokensImport));
  });
});
