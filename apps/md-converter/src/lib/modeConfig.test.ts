import { describe, it, expect, beforeEach } from 'vitest';
import { STORAGE_PREFIX } from './constants';
import { getModeConfig, saveModeConfig, type ModeConfigData } from './modeConfig';

describe('modeConfig', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('SHALL return null for uninitialized mode', () => {
    const config = getModeConfig('markdown-to-docx');
    expect(config).toBeNull();
  });

  it('SHALL save and load config for a specific mode', () => {
    const config: ModeConfigData = {
      title: 'Mi DocX',
      author: 'Autor DocX',
      css: 'body { color: red; }',
    };

    saveModeConfig('markdown-to-docx', config);
    const loaded = getModeConfig('markdown-to-docx');

    expect(loaded).toEqual(config);
  });

  it('SHALL keep configs separate between modes', () => {
    saveModeConfig('markdown-to-docx', { title: 'DocX Title' });
    saveModeConfig('markdown-to-html', { title: 'HTML Title' });

    const docxConfig = getModeConfig('markdown-to-docx');
    const htmlConfig = getModeConfig('markdown-to-html');

    expect(docxConfig?.title).toBe('DocX Title');
    expect(htmlConfig?.title).toBe('HTML Title');
  });

  it('SHALL merge with existing config for mode', () => {
    saveModeConfig('markdown-to-docx', { title: 'Title1' });
    saveModeConfig('markdown-to-docx', { author: 'Author1' });

    const config = getModeConfig('markdown-to-docx');
    expect(config).toEqual({ title: 'Title1', author: 'Author1' });
  });

  it('SHALL handle mathRendering and highlightStyle fields', () => {
    const config: ModeConfigData = {
      mathRendering: 'mathjax',
      highlightStyle: 'pygments',
    };

    saveModeConfig('markdown-to-docx', config);
    const loaded = getModeConfig('markdown-to-docx');

    expect(loaded?.mathRendering).toBe('mathjax');
    expect(loaded?.highlightStyle).toBe('pygments');
  });
});
