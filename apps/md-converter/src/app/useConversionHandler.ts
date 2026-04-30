import { useState, useCallback } from 'preact/hooks';
import type { ConversionMode } from '../lib/types';
import { getConversionModeDefinition } from '../lib/conversionModes';
import { runPandocInWorker } from '../lib/workerClient';
import { downloadBlob, slugify } from '../lib/download';
import { buildMetadataYaml } from '../lib/epubMetadata';
import { toBinaryInput, getBaseFilename } from './App';

interface UseConversionHandlerProps {
  conversionMode: ConversionMode;
  markdown: string;
  sourceFile: File | null;
  coverFile: File | null;
  referenceDoc: File | null;
  css: string;
  title: string;
  author: string;
  lang: string;
  toc: boolean;
  tocDepth: number;
  splitLevel: number;
  mathRendering: string;
  highlightStyle: string;
  setLogs: (logs: string) => void;
  setError: (error: string) => void;
}

interface UseConversionHandlerResult {
  isRunning: boolean;
  statusState: 'idle' | 'running' | 'success' | 'error';
  handleGenerate: () => Promise<void>;
}

export function useConversionHandler(props: UseConversionHandlerProps): UseConversionHandlerResult {
  const [isRunning, setIsRunning] = useState(false);
  const [statusState, setStatusState] = useState<'idle' | 'running' | 'success' | 'error'>('idle');

  const handleGenerate = useCallback(async () => {
    const modeDefinition = getConversionModeDefinition(props.conversionMode);

    if (modeDefinition.sourceKind === 'binary' && !props.sourceFile) {
      props.setError('Selecciona un archivo compatible antes de convertir.');
      setStatusState('error');
      props.setLogs('No hay archivo fuente para la conversión actual.');
      return;
    }

    setIsRunning(true);
    props.setError('');
    setStatusState('running');
    props.setLogs('Iniciando conversión con pandoc.wasm…');

    try {
      const sourceBinary = await toBinaryInput(props.sourceFile);
      const cover = await toBinaryInput(props.coverFile);
      const referenceDoc = await toBinaryInput(props.referenceDoc);
      const metadataYaml = buildMetadataYaml({ title: props.title, author: props.author, lang: props.lang });

      const result = await runPandocInWorker({
        conversionMode: props.conversionMode,
        markdown: props.markdown,
        sourceFile: sourceBinary,
        outputBasename: sourceBinary
          ? slugify(getBaseFilename(sourceBinary.name)) || 'document'
          : (slugify(props.title) || 'book'),
        css: props.css,
        metadataYaml,
        toc: props.toc,
        tocDepth: props.tocDepth,
        splitLevel: props.splitLevel,
        cover,
        referenceDoc,
        mathRendering: props.mathRendering,
        highlightStyle: props.highlightStyle,
        wasmBytes: null
      });

      if (modeDefinition.outputFormat === 'markdown') {
        // Handle markdown output
      }

      downloadBlob(new Blob([new Uint8Array(result.outputBytes)], { type: result.mimeType }), result.outputFilename);
      props.setLogs(result.logs || `Archivo generado correctamente → ${result.outputFilename}`);
      setStatusState('success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido al completar la conversión.';
      props.setError(message);
      props.setLogs('La conversión ha fallado. Revisa el detalle del error.');
      setStatusState('error');
    } finally {
      setIsRunning(false);
    }
  }, [props]);

  return {
    isRunning,
    statusState,
    handleGenerate,
  };
}
