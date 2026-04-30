import { useCallback, useState } from 'preact/hooks';
import { getConversionModeDefinition } from '../lib/conversionModes';
import { downloadBlob, slugify } from '../lib/download';
import { buildMetadataYaml } from '../lib/epubMetadata';
import { getBaseFilename, isAcceptedFile, toBinaryInput } from '../lib/fileUtils';
import type { ConversionMode } from '../lib/types';
import { runPandocInWorker } from '../lib/workerClient';

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
    const {
      conversionMode, markdown, sourceFile, coverFile, referenceDoc,
      css, title, author, lang, toc, tocDepth, splitLevel,
      mathRendering, highlightStyle, setLogs, setError,
    } = props;

    const modeDefinition = getConversionModeDefinition(conversionMode);

    if (modeDefinition.sourceKind === 'binary' && !sourceFile) {
      setError('Selecciona un archivo compatible antes de convertir.');
      setStatusState('error');
      setLogs('No hay archivo fuente para la conversión actual.');
      return;
    }

    if (
      modeDefinition.sourceKind === 'binary' &&
      sourceFile &&
      !isAcceptedFile(sourceFile.name, modeDefinition.importAccept)
    ) {
      setError('El archivo cargado no es compatible con la conversión seleccionada.');
      setStatusState('error');
      setLogs(`El archivo "${sourceFile.name}" no es válido para la conversión ${modeDefinition.label}.`);
      return;
    }

    setIsRunning(true);
    setError('');
    setStatusState('running');
    setLogs('Iniciando conversión con pandoc.wasm…');

    try {
      const sourceBinary = await toBinaryInput(sourceFile);
      const cover = await toBinaryInput(coverFile);
      const referenceDocBinary = await toBinaryInput(referenceDoc);
      const metadataYaml = buildMetadataYaml({ title, author, lang });

      const result = await runPandocInWorker({
        conversionMode,
        markdown,
        sourceFile: sourceBinary,
        outputBasename: sourceBinary
          ? slugify(getBaseFilename(sourceBinary.name)) || 'document'
          : (slugify(title) || 'book'),
        css,
        metadataYaml,
        toc,
        tocDepth,
        splitLevel,
        cover,
        referenceDoc: referenceDocBinary,
        mathRendering,
        highlightStyle,
        wasmBytes: null
      });

      downloadBlob(new Blob([new Uint8Array(result.outputBytes)], { type: result.mimeType }), result.outputFilename);
      setLogs(result.logs || `Archivo generado correctamente → ${result.outputFilename}`);
      setStatusState('success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido al completar la conversión.';
      setError(message);
      setLogs('La conversión ha fallado. Revisa el detalle del error.');
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
