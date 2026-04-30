import { describe, it, beforeEach, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/preact';
import { useConfigManager } from './useConfigManager';
import { getConversionModeDefinition, type ConversionModeDefinition } from '../lib/conversionModes';

const modeDefinitions = vi.hoisted(() => {
  const epub: ConversionModeDefinition = {
    value: 'markdown-to-epub',
    label: 'Markdown -> EPUB',
    importLabel: 'Importar .md',
    importAccept: '.md,.markdown,text/markdown,text/plain',
    downloadLabel: 'Convertir y descargar EPUB',
    supportsConfig: true,
    sourceKind: 'markdown',
    sourceFormat: 'markdown',
    outputFormat: 'epub3',
    outputExtension: 'epub',
    outputMimeType: 'application/epub+zip'
  };

  const docx: ConversionModeDefinition = {
    ...epub,
    value: 'markdown-to-docx',
    label: 'Markdown -> Word (.docx)',
    downloadLabel: 'Convertir y descargar Word',
    outputFormat: 'docx',
    outputExtension: 'docx',
    outputMimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };

  return { epub, docx };
});

// Mock modules
vi.mock('../lib/modeConfig', () => ({
  getModeConfig: vi.fn().mockReturnValue(null),
  saveModeConfig: vi.fn(),
  clearConfig: vi.fn(),
}));

vi.mock('../lib/conversionModes', () => ({
  getConversionModeDefinition: vi.fn().mockReturnValue(modeDefinitions.epub),
  DEFAULT_CONVERSION_MODE: 'markdown-to-epub',
}));

describe('useConfigManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useConfigManager('markdown-to-epub', null));

    expect(result.current.isConfigOpen).toBe(false);
    expect(result.current.configSection).toBe('book');
    expect(result.current.configDraft).toBeNull();
    expect(result.current.coverDraft).toBeNull();
  });

  it('should open config modal with openConfigModal', () => {
    const { result } = renderHook(() => useConfigManager('markdown-to-epub', null));

    act(() => {
      result.current.openConfig();
    });

    expect(result.current.isConfigOpen).toBe(true);
    expect(result.current.configDraft).not.toBeNull();
    expect(result.current.configDraft?.title).toBe('Mi libro');
    expect(result.current.configSection).toBe('book');
  });

  it('should close config modal with closeConfig', () => {
    const { result } = renderHook(() => useConfigManager('markdown-to-epub', null));

    act(() => {
      result.current.openConfig();
    });
    act(() => {
      result.current.closeConfig();
    });

    expect(result.current.isConfigOpen).toBe(false);
    expect(result.current.configDraft).toBeNull();
    expect(result.current.coverDraft).toBeNull();
    expect(result.current.configSection).toBe('book');
  });

  it('should set document section for non-epub formats', () => {
    vi.mocked(getConversionModeDefinition).mockReturnValue(modeDefinitions.docx);

    const { result } = renderHook(() => useConfigManager('markdown-to-docx', null));

    act(() => {
      result.current.openConfig();
    });

    expect(result.current.configSection).toBe('document');
  });

  it('should handle ESC key to close modal', () => {
    const { result } = renderHook(() => useConfigManager('markdown-to-epub', null));

    act(() => {
      result.current.openConfig();
    });

    act(() => {
      globalThis.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(result.current.isConfigOpen).toBe(false);
  });
});
