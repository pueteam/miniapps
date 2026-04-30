import { describe, it, expect } from 'vitest';
import { CONVERSION_MODES, getConversionModeDefinition, type ConversionMode } from './conversionModes';

describe('conversionModes', () => {
  it('markdown-to-docx SHALL have supportsConfig: true', () => {
    const mode = getConversionModeDefinition('markdown-to-docx');
    expect(mode.supportsConfig).toBe(true);
  });

  it('markdown-to-html SHALL have supportsConfig: true', () => {
    const mode = getConversionModeDefinition('markdown-to-html');
    expect(mode.supportsConfig).toBe(true);
  });

  it('markdown-to-epub SHALL have supportsConfig: true (existing)', () => {
    const mode = getConversionModeDefinition('markdown-to-epub');
    expect(mode.supportsConfig).toBe(true);
  });

  it('other modes SHALL have supportsConfig: false', () => {
    const modes: ConversionMode[] = ['docx-to-markdown', 'epub-to-markdown', 'html-to-markdown'];
    modes.forEach((modeValue) => {
      const mode = getConversionModeDefinition(modeValue);
      expect(mode.supportsConfig).toBe(false);
    });
  });
});
