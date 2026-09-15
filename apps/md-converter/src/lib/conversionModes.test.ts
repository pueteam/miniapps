import { describe, it, expect } from 'vitest';
import { CONVERSION_MODES, DEFAULT_CONVERSION_MODE, getConversionModeDefinition, type ConversionMode } from './conversionModes';

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
    const modes: ConversionMode[] = [
      'csv-to-markdown',
      'docx-to-markdown',
      'epub-to-markdown',
      'html-to-markdown',
      'odt-to-markdown',
      'pdf-to-markdown',
      'pptx-to-markdown',
      'rtf-to-markdown',
      'xlsx-to-markdown'
    ];
    modes.forEach((modeValue) => {
      const mode = getConversionModeDefinition(modeValue);
      expect(mode.supportsConfig).toBe(false);
    });
  });

  it('unknown modes SHALL fall back to the default conversion mode', () => {
    const mode = getConversionModeDefinition('nope' as ConversionMode);
    expect(mode.value).toBe(DEFAULT_CONVERSION_MODE);
  });
});
