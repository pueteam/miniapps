import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { AppShell } from '../components/AppShell';
import { registerSW } from './registerSW';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_PREFIX } from '../lib/constants';
import type { BinaryInput } from '../lib/types';
import { CONVERSION_MODES, DEFAULT_CONVERSION_MODE, getConversionModeDefinition, type ConversionMode } from '../lib/conversionModes';
import { getModeConfig } from '../lib/modeConfig';
import { useConfigManager } from './useConfigManager';
import { useConversionHandler } from './useConversionHandler';
import { sampleMarkdown, sampleCss } from './sampleContent';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getFileExtension(name: string): string {
  const index = name.lastIndexOf('.');
  return index >= 0 ? name.slice(index).toLowerCase() : '';
}

export function getBaseFilename(name: string): string {
  const index = name.lastIndexOf('.');
  return index >= 0 ? name.slice(0, index) : name;
}

function isAcceptedFile(name: string, accept: string): boolean {
  const extension = getFileExtension(name);
  return accept
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry.startsWith('.'))
    .includes(extension);
}

export async function toBinaryInput(file: File | null): Promise<BinaryInput | null> {
  if (!file) return null;

  const buffer = await readFileArrayBuffer(file);

  return {
    name: file.name,
    bytes: new Uint8Array(buffer)
  };
}

function readFileArrayBuffer(file: File): Promise<ArrayBuffer> {
  if (typeof file.arrayBuffer === 'function') {
    return file.arrayBuffer();
  }

  if (typeof Blob !== 'undefined' && typeof Blob.prototype.arrayBuffer === 'function') {
    return new Blob([file], { type: file.type }).arrayBuffer();
  }

  return new Response(file).arrayBuffer();
}

function readTextFile(file: File): Promise<string> {
  if (typeof file.text === 'function') {
    return file.text();
  }

  return readFileArrayBuffer(file).then((buffer) => new TextDecoder().decode(buffer));
}

function IconFile() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 2h6l3 3v9H4V2z" />
      <path d="M10 2v3h3" />
      <path d="M6.5 8.5h4" />
      <path d="M6.5 11h4" />
    </svg>
  );
}

function IconMetadata() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="1.5" y="1.5" width="13" height="13" rx="2" />
      <line x1="4.5" y1="5.5" x2="11.5" y2="5.5" />
      <line x1="4.5" y1="8" x2="9" y2="8" />
      <line x1="4.5" y1="10.5" x2="10" y2="10.5" />
    </svg>
  );
}

function IconMarkdown() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="1" y="2.5" width="14" height="11" rx="2" />
      <path d="M4 10V6l2 2 2-2v4" />
      <path d="M11 10V6" />
      <path d="M9.5 8.5L11 10l1.5-1.5" />
    </svg>
  );
}

function IconCss() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 2l1 11 5 1.5L13 13l1-11H2z" />
      <path d="M5.5 6.5h5" />
      <path d="M5.5 9.5h3.5" />
    </svg>
  );
}

function IconStatus() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 5v3.5l2 1.5" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="8" cy="8" r="1.75" />
      <path d="M8 2.25v1.5" />
      <path d="M8 12.25v1.5" />
      <path d="M12.07 3.93l-1.06 1.06" />
      <path d="M4.99 11.01l-1.06 1.06" />
      <path d="M13.75 8h-1.5" />
      <path d="M3.75 8h-1.5" />
      <path d="M12.07 12.07l-1.06-1.06" />
      <path d="M4.99 4.99L3.93 3.93" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg class="btn-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 2v9" />
      <path d="M5.5 8l3.5 3.5L12.5 8" />
      <path d="M2 14h14" />
    </svg>
  );
}

function IconLoading() {
  return (
    <svg class="btn-icon" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <circle cx="9" cy="9" r="7" stroke-dasharray="22 22" stroke-dashoffset="0" style="transform-origin:50% 50%;animation:spin 0.75s linear infinite;" />
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </svg>
  );
}

export function App() {
  useEffect(() => {
    registerSW();
  }, []);

  const [title, setTitle] = useLocalStorage(`${STORAGE_PREFIX}title`, 'Mi libro');
  const [author, setAuthor] = useLocalStorage(`${STORAGE_PREFIX}author`, 'Autor/a');
  const [lang, setLang] = useLocalStorage(`${STORAGE_PREFIX}lang`, 'es-ES');
  const [toc, setToc] = useLocalStorage(`${STORAGE_PREFIX}toc`, true);
  const [tocDepth, setTocDepth] = useLocalStorage(`${STORAGE_PREFIX}tocDepth`, 3);
  const [splitLevel, setSplitLevel] = useLocalStorage(`${STORAGE_PREFIX}splitLevel`, 1);
  const [markdown, setMarkdown] = useLocalStorage(`${STORAGE_PREFIX}markdown`, sampleMarkdown);
  const [css, setCss] = useLocalStorage(`${STORAGE_PREFIX}css`, sampleCss);
  const [conversionMode, setConversionMode] = useLocalStorage<ConversionMode>(`${STORAGE_PREFIX}conversionMode`, DEFAULT_CONVERSION_MODE);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [referenceDoc, setReferenceDoc] = useState<File | null>(null);
  const [mathRendering, setMathRendering] = useState('');
  const [highlightStyle, setHighlightStyle] = useState('');
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [logs, setLogs] = useState('Sin mensajes todavía.');
  const [error, setError] = useState('');

  useEffect(() => {
    const modeConfig = getModeConfig(conversionMode) ?? {};
    setTitle(modeConfig.title ?? 'Mi libro');
    setAuthor(modeConfig.author ?? 'Autor/a');
    setLang(modeConfig.lang ?? 'es-ES');
    setToc(modeConfig.toc ?? true);
    setTocDepth(modeConfig.tocDepth ?? 3);
    setSplitLevel(modeConfig.splitLevel ?? 1);
    setCss(modeConfig.css ?? (conversionMode === 'markdown-to-epub' ? sampleCss : ''));
    setReferenceDoc(null);
    setMathRendering(modeConfig.mathRendering ?? '');
    setHighlightStyle(modeConfig.highlightStyle ?? '');
  }, [conversionMode]);

  const {
    isConfigOpen,
    configSection,
    setConfigSection,
    configDraft,
    setConfigDraft,
    openConfig: openConfigModal,
    closeConfig,
    saveConfig: saveConfigDraft,
  } = useConfigManager(conversionMode, coverFile, referenceDoc);

  const {
    isRunning,
    statusState,
    handleGenerate,
  } = useConversionHandler({
    conversionMode,
    markdown,
    sourceFile,
    coverFile,
    referenceDoc,
    css,
    title,
    author,
    lang,
    toc,
    tocDepth,
    splitLevel,
    mathRendering,
    highlightStyle,
    setLogs,
    setError,
  });

  const markdownInputRef = useRef<HTMLInputElement>(null);
  const cssInputRef = useRef<HTMLInputElement>(null);

  const modeDefinition = useMemo(() => getConversionModeDefinition(conversionMode), [conversionMode]);

  const outputLabel = {
    markdown: 'Markdown',
    html: 'HTML',
    docx: 'Word',
    epub3: 'EPUB'
  }[modeDefinition.outputFormat];

  const statusDotClass = useMemo(() => {
    if (statusState === 'running') return 'running';
    if (statusState === 'success') return 'success';
    if (statusState === 'error') return 'error';
    return '';
  }, [statusState]);

  const configTitle = useMemo(() => {
    if (modeDefinition.outputFormat === 'epub3') return 'EPUB';
    if (modeDefinition.outputFormat === 'docx') return 'DOCX';
    return 'HTML';
  }, [modeDefinition.outputFormat]);

  const sectionLabel = useMemo(() => {
    return modeDefinition.outputFormat === 'epub3' ? 'Libro' : 'Documento';
  }, [modeDefinition.outputFormat]);

  const statusLabel = {
    idle: 'En espera',
    running: `Generando ${outputLabel}…`,
    success: `${outputLabel} generado correctamente`,
    error: 'Error en la conversión'
  }[statusState];

  const primaryConfigSection = modeDefinition.outputFormat === 'epub3' ? 'book' : 'document';

  async function handleMarkdownImport(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (!isAcceptedFile(file.name, modeDefinition.importAccept)) {
      setError('El archivo seleccionado no es compatible con la conversión activa.');
      (event.target as HTMLInputElement).value = '';
      return;
    }

    if (modeDefinition.sourceKind === 'markdown') {
      const text = await readTextFile(file);
      setMarkdown(text);
      setSourceFile(null);
      setError('');
      setLogs(`Markdown importado desde ${file.name}.`);
    } else {
      setSourceFile(file);
      setError('');
      setLogs(`Archivo cargado: ${file.name}. Listo para convertir a Markdown.`);
    }

    (event.target as HTMLInputElement).value = '';
  }

  async function handleCssImport(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const text = await readTextFile(file);
    if (configDraft) {
      setConfigDraft({ ...configDraft, css: text });
    } else {
      setCss(text);
    }
    (event.target as HTMLInputElement).value = '';
  }

  function renderConfigSection() {
    if (configSection === 'book') {
      return (
        <div class="settings-modal__body">
          <label>
            <span>Título</span>
            <input type="text" value={configDraft!.title} onInput={(e) => setConfigDraft({ ...configDraft!, title: (e.target as HTMLInputElement).value })} />
          </label>

          <label>
            <span>Autor / Autora</span>
            <input type="text" value={configDraft!.author} onInput={(e) => setConfigDraft({ ...configDraft!, author: (e.target as HTMLInputElement).value })} />
          </label>

          <div class="row">
            <label>
              <span>Idioma (BCP 47)</span>
              <input type="text" value={configDraft!.lang} onInput={(e) => setConfigDraft({ ...configDraft!, lang: (e.target as HTMLInputElement).value })} />
            </label>

            {modeDefinition.outputFormat === 'epub3' && (
              <label>
                <span>Split level</span>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={configDraft!.splitLevel}
                  onInput={(e) => setConfigDraft({ ...configDraft!, splitLevel: clamp(Number((e.target as HTMLInputElement).value || '1'), 1, 6) })}
                />
              </label>
            )}
          </div>

          <div class="divider" />
          <div class="field-group-title">Tabla de contenidos</div>

          <label>
            <span>Profundidad del TOC</span>
            <input
              type="number"
              min="1"
              max="6"
              value={configDraft!.tocDepth}
              onInput={(e) => setConfigDraft({ ...configDraft!, tocDepth: clamp(Number((e.target as HTMLInputElement).value || '3'), 1, 6) })}
            />
          </label>

          <label class="checkbox">
            <input type="checkbox" checked={configDraft!.toc} onChange={(e) => setConfigDraft({ ...configDraft!, toc: (e.target as HTMLInputElement).checked })} />
            <span>Incluir tabla de contenidos</span>
          </label>

          <div class="divider" />
          <div class="field-group-title">Archivos</div>

          {modeDefinition.outputFormat === 'docx' && (
            <label>
              <span>Reference DOCX</span>
              <input type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => setConfigDraft({ ...configDraft!, referenceDoc: (e.target as HTMLInputElement).files?.[0] ?? null })} />
            </label>
          )}

          {modeDefinition.outputFormat === 'epub3' && (
            <label>
              <span>Portada</span>
              <input type="file" accept="image/*" onChange={(e) => setCoverFile((e.target as HTMLInputElement).files?.[0] ?? null)} />
            </label>
          )}

          {modeDefinition.outputFormat !== 'epub3' && modeDefinition.outputFormat !== 'docx' && (
            <label>
              <span>Math rendering</span>
              <select value={configDraft!.mathRendering} onInput={(e) => setConfigDraft({ ...configDraft!, mathRendering: (e.target as HTMLSelectElement).value })}>
                <option value="">None</option>
                <option value="mathjax">MathJax</option>
                <option value="katex">KaTeX</option>
              </select>
            </label>
          )}

          <label>
            <span>Highlight style</span>
            <select value={configDraft!.highlightStyle} onInput={(e) => setConfigDraft({ ...configDraft!, highlightStyle: (e.target as HTMLSelectElement).value })}>
              <option value="">Default</option>
              <option value="pygments">Pygments</option>
              <option value="zenburn">Zenburn</option>
              <option value="tango">Tango</option>
            </select>
          </label>
        </div>
      );
    }

    if (configSection === 'document') {
      return (
        <div class="settings-modal__body">
          {modeDefinition.outputFormat === 'docx' && (
            <label>
              <span>Reference DOCX</span>
              <input type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => setConfigDraft({ ...configDraft!, referenceDoc: (e.target as HTMLInputElement).files?.[0] ?? null })} />
            </label>
          )}

          <label>
            <span>Profundidad del TOC</span>
            <input
              type="number"
              min="1"
              max="6"
              value={configDraft!.tocDepth}
              onInput={(e) => setConfigDraft({ ...configDraft!, tocDepth: clamp(Number((e.target as HTMLInputElement).value || '3'), 1, 6) })}
            />
          </label>

          <label class="checkbox">
            <input type="checkbox" checked={configDraft!.toc} onChange={(e) => setConfigDraft({ ...configDraft!, toc: (e.target as HTMLInputElement).checked })} />
            <span>Incluir tabla de contenidos</span>
          </label>

          <label>
            <span>Highlight style</span>
            <select value={configDraft!.highlightStyle} onInput={(e) => setConfigDraft({ ...configDraft!, highlightStyle: (e.target as HTMLSelectElement).value })}>
              <option value="">Default</option>
              <option value="pygments">Pygments</option>
              <option value="zenburn">Zenburn</option>
              <option value="tango">Tango</option>
            </select>
          </label>

          {modeDefinition.outputFormat === 'html' && (
            <label>
              <span>Math rendering</span>
              <select value={configDraft!.mathRendering} onInput={(e) => setConfigDraft({ ...configDraft!, mathRendering: (e.target as HTMLSelectElement).value })}>
                <option value="">None</option>
                <option value="mathjax">MathJax</option>
                <option value="katex">KaTeX</option>
              </select>
            </label>
          )}
        </div>
      );
    }

    return (
      <div class="settings-modal__body">
        <div class="panel-actions settings-modal__import">
          <input ref={cssInputRef} class="visually-hidden" type="file" accept=".css,text/css,text/plain" onChange={handleCssImport} />
          <button type="button" class="btn-secondary" onClick={() => cssInputRef.current?.click()}>
            <IconFile />
            Importar .css
          </button>
        </div>
        <textarea class="editor editor--css" value={configDraft!.css} onInput={(e) => setConfigDraft({ ...configDraft!, css: (e.target as HTMLTextAreaElement).value })} spellcheck={false} />
      </div>
    );
  }

  return (
    <AppShell>
      <section class="converter-page">
        <section class="hero-compact" aria-labelledby="converter-title">
          <p class="hero-compact__eyebrow">MDconvertix</p>
          <h2 id="converter-title">Convierte Markdown en documentos listos para publicar</h2>
          <p>Prepara EPUB, Word o HTML con configuración por formato, estilos propios y feedback claro del proceso.</p>
        </section>

        <section class="grid">
          <article class="panel panel--editor">
            <div class="panel-header panel-header--between">
              <div class="panel-header__left">
                <div class="panel-icon"><IconMarkdown /></div>
                <h3>Contenido Markdown</h3>
              </div>
              <div class="panel-actions">
                <label>
                  <span class="visually-hidden">Conversión</span>
                  <select aria-label="Conversión" value={conversionMode} onChange={(event) => setConversionMode((event.target as HTMLSelectElement).value as ConversionMode)}>
                    {CONVERSION_MODES.map((mode) => (
                      <option key={mode.value} value={mode.value}>{mode.label}</option>
                    ))}
                  </select>
                </label>
                {modeDefinition.supportsConfig && (
                  <button type="button" class="btn-secondary" onClick={openConfigModal}>
                    <IconSettings />
                    Configuración
                  </button>
                )}
                <input ref={markdownInputRef} class="visually-hidden" type="file" accept={modeDefinition.importAccept} onChange={handleMarkdownImport} />
                <button type="button" class="btn-secondary" onClick={() => markdownInputRef.current?.click()}>
                  <IconFile />
                  {modeDefinition.importLabel}
                </button>
              </div>
            </div>
            <p class="panel-help">{modeDefinition.sourceKind === 'markdown' ? 'Pega aquí el contenido Markdown o importa un fichero .md.' : 'Importa un fichero compatible y convierte su contenido a Markdown editable.'}</p>
            <textarea class="editor" value={markdown} onInput={(e) => setMarkdown((e.target as HTMLTextAreaElement).value)} spellcheck={false} />
          </article>

          <article class="panel panel--status">
            <div class="panel-header">
              <div class="panel-icon"><IconStatus /></div>
              <h3>Estado de la conversión</h3>
            </div>

            <div class="status-bar">
              <div class={`status-dot ${statusDotClass}`} />
              <span class="status-text">{statusLabel}</span>
            </div>

            {error && (
              <div class="error-banner" role="alert">
                <span class="error-banner-text">{error}</span>
              </div>
            )}

            <pre class="logs-block">{logs}</pre>

            <div class="footer-actions">
              <button type="button" class="btn-primary" disabled={isRunning} onClick={handleGenerate}>
                {isRunning ? <IconLoading /> : <IconDownload />}
                {isRunning ? `Generando ${outputLabel}…` : modeDefinition.downloadLabel}
              </button>
            </div>
          </article>
        </section>

        {isConfigOpen && configDraft && (
          <dialog class="settings-modal" open aria-label={`Configuración ${configTitle}`}>
            <div class="settings-modal__header">
              <div class="panel-header__left">
                <div class="panel-icon"><IconMetadata /></div>
                <h3>Configuración {configTitle}</h3>
              </div>

              <div class="panel-actions">
                <button type="button" class={`btn-secondary ${configSection === primaryConfigSection ? 'is-active' : ''}`} onClick={() => setConfigSection(primaryConfigSection)}>
                  {sectionLabel}
                </button>
                {(modeDefinition.outputFormat === 'epub3' || modeDefinition.outputFormat === 'html') && (
                  <button type="button" class={`btn-secondary ${configSection === 'styles' ? 'is-active' : ''}`} onClick={() => setConfigSection('styles')}>
                    Estilos
                  </button>
                )}
              </div>
            </div>

            {renderConfigSection()}

            <div class="footer-actions settings-modal__footer">
              <button type="button" class="btn-secondary" onClick={closeConfig}>Cancelar</button>
              <button type="button" class="btn-primary" onClick={() => saveConfigDraft({
                setTitle, setAuthor, setLang, setToc, setTocDepth, setSplitLevel, setCss, setCoverFile, setReferenceDoc, setMathRendering, setHighlightStyle
              })}>Guardar</button>
            </div>
          </dialog>
        )}
      </section>
    </AppShell>
  );
}
