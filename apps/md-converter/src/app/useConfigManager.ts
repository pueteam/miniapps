import { useState, useEffect, useCallback } from 'preact/hooks';
import type { ConfigDraft, ConfigSection, ConversionMode } from '../lib/types';
import { getModeConfig, saveModeConfig } from '../lib/modeConfig';
import { getConversionModeDefinition } from '../lib/conversionModes';
import { sampleCss } from './sampleContent';

function buildConfigDraft(
  conversionMode: ConversionMode,
  referenceDoc: File | null
): ConfigDraft {
  const modeConfig = getModeConfig(conversionMode) ?? {};
  return {
    title: modeConfig.title ?? 'Mi libro',
    author: modeConfig.author ?? 'Autor/a',
    lang: modeConfig.lang ?? 'es-ES',
    toc: modeConfig.toc ?? true,
    tocDepth: modeConfig.tocDepth ?? 3,
    splitLevel: modeConfig.splitLevel ?? 1,
    css: modeConfig.css ?? (conversionMode === 'markdown-to-epub' ? sampleCss : ''),
    referenceDoc,
    mathRendering: modeConfig.mathRendering ?? '',
    highlightStyle: modeConfig.highlightStyle ?? '',
  };
}

function resolveInitialSection(conversionMode: ConversionMode): ConfigSection {
  return conversionMode === 'markdown-to-epub' ? 'book' : 'document';
}

export function useConfigManager(
  conversionMode: ConversionMode,
  coverFile: File | null,
  referenceDoc: File | null = null
) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [configSection, setConfigSection] = useState<ConfigSection>('book');
  const [configDraft, setConfigDraft] = useState<ConfigDraft | null>(null);
  const [coverDraft, setCoverDraft] = useState<File | null>(null);

  useEffect(() => {
    if (!isConfigOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeConfig();
    };
    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [isConfigOpen]);

  useEffect(() => {
    if (!isConfigOpen || !getConversionModeDefinition(conversionMode).supportsConfig) return;
    setConfigDraft(buildConfigDraft(conversionMode, referenceDoc));
    setCoverDraft(coverFile);
    setConfigSection(resolveInitialSection(conversionMode));
  }, [conversionMode, isConfigOpen, referenceDoc]);

  const openConfig = useCallback(() => {
    setConfigDraft(buildConfigDraft(conversionMode, referenceDoc));
    setCoverDraft(coverFile);
    setConfigSection(resolveInitialSection(conversionMode));
    setIsConfigOpen(true);
  }, [conversionMode, coverFile, referenceDoc]);

  const closeConfig = useCallback(() => {
    setIsConfigOpen(false);
    setConfigDraft(null);
    setCoverDraft(null);
    setConfigSection('book');
  }, []);

  const saveConfig = useCallback((setters: {
    setTitle: (v: string) => void;
    setAuthor: (v: string) => void;
    setLang: (v: string) => void;
    setToc: (v: boolean) => void;
    setTocDepth: (v: number) => void;
    setSplitLevel: (v: number) => void;
    setCss: (v: string) => void;
    setCoverFile: (v: File | null) => void;
    setReferenceDoc: (v: File | null) => void;
    setMathRendering: (v: string) => void;
    setHighlightStyle: (v: string) => void;
  }) => {
    if (!configDraft) return;
    saveModeConfig(conversionMode, {
      title: configDraft.title,
      author: configDraft.author,
      lang: configDraft.lang,
      toc: configDraft.toc,
      tocDepth: configDraft.tocDepth,
      splitLevel: configDraft.splitLevel,
      css: configDraft.css,
      mathRendering: configDraft.mathRendering,
      highlightStyle: configDraft.highlightStyle,
    });
    setters.setTitle(configDraft.title);
    setters.setAuthor(configDraft.author);
    setters.setLang(configDraft.lang);
    setters.setToc(configDraft.toc);
    setters.setTocDepth(configDraft.tocDepth);
    setters.setSplitLevel(configDraft.splitLevel);
    setters.setCss(configDraft.css);
    setters.setCoverFile(coverDraft);
    setters.setReferenceDoc(configDraft.referenceDoc);
    setters.setMathRendering(configDraft.mathRendering);
    setters.setHighlightStyle(configDraft.highlightStyle);
    closeConfig();
  }, [conversionMode, configDraft, coverDraft, closeConfig]);

  return {
    isConfigOpen,
    configSection,
    setConfigSection,
    configDraft,
    setConfigDraft,
    coverDraft,
    setCoverDraft,
    openConfig,
    closeConfig,
    saveConfig,
  };
}
