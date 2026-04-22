import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { AppShell } from '../components/AppShell';
import { registerSW } from './registerSW';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_PREFIX } from '../lib/constants';
import { buildMetadataYaml } from '../lib/epubMetadata';
import { downloadBlob, slugify } from '../lib/download';
import { runPandocInWorker } from '../lib/workerClient';
import type { BinaryInput } from '../lib/types';

type ConfigSection = 'book' | 'styles';

type ConfigDraft = {
  title: string;
  author: string;
  lang: string;
  toc: boolean;
  tocDepth: number;
  splitLevel: number;
  css: string;
};

const sampleMarkdown = `# Capítulo 1

Este libro se genera completamente en el navegador con **pandoc.wasm**.

## Qué incluye

- Entrada en Markdown
- Salida EPUB3
- TOC opcional
- CSS específico para EPUB
- Metadatos mínimos en YAML

> La conversión ocurre en un worker para no bloquear la interfaz.

# Capítulo 2

## Código

\`\`\`ts
console.log("Hola, EPUB");
\`\`\`
`;

const sampleCss = `html, body {
  font-family: serif;
  line-height: 1.55;
}

h1, h2, h3 {
  font-family: system-ui, sans-serif;
}

code, pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

blockquote {
  border-left: 0.25rem solid #999;
  margin-left: 0;
  padding-left: 1rem;
  color: #444;
}
`;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

async function toBinaryInput(file: File | null): Promise<BinaryInput | null> {
  if (!file) return null;
  return {
    name: file.name,
    bytes: new Uint8Array(await file.arrayBuffer())
  };
}

function readTextFile(file: File): Promise<string> {
  if (typeof file.text === 'function') {
    return file.text();
  }

  if (typeof file.arrayBuffer === 'function') {
    return file.arrayBuffer().then((buffer) => new TextDecoder().decode(buffer));
  }

  return file.text();
}

function IconFile() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 2h6l3 3v9H4V2z" />
      <path d="M10 2v3h3" />
      <path d="M6 8h4" />
      <path d="M6 10.5h4" />
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
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState('Sin mensajes todavía.');
  const [error, setError] = useState('');
  const [statusState, setStatusState] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [configSection, setConfigSection] = useState<ConfigSection>('book');
  const [configDraft, setConfigDraft] = useState<ConfigDraft | null>(null);
  const [coverDraft, setCoverDraft] = useState<File | null>(null);

  useEffect(() => {
    if (!isConfigOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeConfig();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isConfigOpen]);

  const markdownInputRef = useRef<HTMLInputElement>(null);
  const cssInputRef = useRef<HTMLInputElement>(null);

  const metadataYaml = useMemo(() => buildMetadataYaml({ title, author, lang }), [title, author, lang]);

  const statusLabel = {
    idle: 'En espera',
    running: 'Generando EPUB…',
    success: 'EPUB generado correctamente',
    error: 'Error en la conversión'
  }[statusState];

  function openConfig() {
    setConfigDraft({ title, author, lang, toc, tocDepth, splitLevel, css });
    setCoverDraft(coverFile);
    setConfigSection('book');
    setIsConfigOpen(true);
  }

  function closeConfig() {
    setIsConfigOpen(false);
    setConfigDraft(null);
    setCoverDraft(null);
    setConfigSection('book');
  }

  function saveConfig() {
    if (!configDraft) return;

    setTitle(configDraft.title);
    setAuthor(configDraft.author);
    setLang(configDraft.lang);
    setToc(configDraft.toc);
    setTocDepth(configDraft.tocDepth);
    setSplitLevel(configDraft.splitLevel);
    setCss(configDraft.css);
    setCoverFile(coverDraft);
    closeConfig();
  }

  async function handleMarkdownImport(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const text = await readTextFile(file);
    setMarkdown(text);
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

  async function handleGenerate() {
    setIsRunning(true);
    setError('');
    setStatusState('running');
    setLogs('Iniciando conversión con pandoc.wasm…');

    try {
      const cover = await toBinaryInput(coverFile);
      const result = await runPandocInWorker({
        markdown,
        css,
        metadataYaml,
        toc,
        tocDepth,
        splitLevel,
        cover,
        wasmBytes: null
      });

      const filename = `${slugify(title) || 'book'}.epub`;
      downloadBlob(new Blob([new Uint8Array(result.epubBytes)], { type: 'application/epub+zip' }), filename);
      setLogs(result.logs || `EPUB generado correctamente → ${filename}`);
      setStatusState('success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido al generar el EPUB.';
      setError(message);
      setLogs('La conversión ha fallado. Revisa el detalle del error.');
      setStatusState('error');
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <AppShell>
      <section class="converter-page">
        {/* <div class="hero-compact">
          <div class="hero-compact__copy">
            <h2>Markdown → EPUB</h2>
            <p>Conversión local en el navegador. Sin servidor. Sin backend.</p>
          </div>
        </div> */}

        <section class="grid">
          <article class="panel panel--editor">
            <div class="panel-header panel-header--between">
              <div class="panel-header__left">
                <div class="panel-icon"><IconMarkdown /></div>
                <h3>Contenido Markdown</h3>
              </div>
              <div class="panel-actions">
                <button type="button" class="btn-secondary" onClick={openConfig}>
                  <IconSettings />
                  Configuración
                </button>
                <input ref={markdownInputRef} class="visually-hidden" type="file" accept=".md,.markdown,text/markdown,text/plain" onChange={handleMarkdownImport} />
                <button type="button" class="btn-secondary" onClick={() => markdownInputRef.current?.click()}>
                  <IconFile />
                  Importar .md
                </button>
              </div>
            </div>
            <p class="panel-help">Pega aquí el contenido Markdown o importa un fichero .md.</p>
            <textarea class="editor" value={markdown} onInput={(e) => setMarkdown((e.target as HTMLTextAreaElement).value)} spellcheck={false} />
          </article>

          <article class="panel panel--status wide">
            <div class="panel-header">
              <div class="panel-icon"><IconStatus /></div>
              <h3>Estado de la conversión</h3>
            </div>

            <div class="status-bar">
              <div class={`status-dot ${statusState === 'running' ? 'running' : statusState === 'success' ? 'success' : statusState === 'error' ? 'error' : ''}`} />
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
                {isRunning ? 'Generando…' : 'Convertir y descargar EPUB'}
              </button>
            </div>
          </article>
        </section>

        {isConfigOpen && configDraft && (
          <div class="modal-backdrop" onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeConfig();
            }
          }}>
            <div class="settings-modal" role="dialog" aria-modal="true" aria-label="Configuración EPUB">
              <div class="panel-header panel-header--between settings-modal__header">
                <div class="panel-header__left">
                  <div class="panel-icon"><IconMetadata /></div>
                  <h3>Configuración EPUB</h3>
                </div>
                <div class="panel-actions">
                  <button type="button" class={`btn-secondary ${configSection === 'book' ? 'is-active' : ''}`} onClick={() => setConfigSection('book')}>
                    Libro
                  </button>
                  <button type="button" class={`btn-secondary ${configSection === 'styles' ? 'is-active' : ''}`} onClick={() => setConfigSection('styles')}>
                    Estilos
                  </button>
                </div>
              </div>

              {configSection === 'book' ? (
                <div class="settings-modal__body">
                  <label>
                    <span>Título</span>
                    <input type="text" value={configDraft.title} onInput={(e) => setConfigDraft({ ...configDraft, title: (e.target as HTMLInputElement).value })} />
                  </label>

                  <label>
                    <span>Autor / Autora</span>
                    <input type="text" value={configDraft.author} onInput={(e) => setConfigDraft({ ...configDraft, author: (e.target as HTMLInputElement).value })} />
                  </label>

                  <div class="row">
                    <label>
                      <span>Idioma (BCP 47)</span>
                      <input type="text" value={configDraft.lang} onInput={(e) => setConfigDraft({ ...configDraft, lang: (e.target as HTMLInputElement).value })} />
                    </label>

                    <label>
                      <span>Split level</span>
                      <input
                        type="number"
                        min="1"
                        max="6"
                        value={configDraft.splitLevel}
                        onInput={(e) => setConfigDraft({ ...configDraft, splitLevel: clamp(Number((e.target as HTMLInputElement).value || '1'), 1, 6) })}
                      />
                    </label>
                  </div>

                  <div class="divider" />
                  <div class="field-group-title">Tabla de contenidos</div>

                  <label>
                    <span>Profundidad del TOC</span>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={configDraft.tocDepth}
                      onInput={(e) => setConfigDraft({ ...configDraft, tocDepth: clamp(Number((e.target as HTMLInputElement).value || '3'), 1, 6) })}
                    />
                  </label>

                  <label class="checkbox">
                    <input type="checkbox" checked={configDraft.toc} onChange={(e) => setConfigDraft({ ...configDraft, toc: (e.target as HTMLInputElement).checked })} />
                    <span>Incluir tabla de contenidos</span>
                  </label>

                  <div class="divider" />
                  <div class="field-group-title">Archivos</div>

                  <label>
                    <span>Portada</span>
                    <input type="file" accept="image/*" onChange={(e) => setCoverDraft((e.target as HTMLInputElement).files?.[0] ?? null)} />
                  </label>
                </div>
              ) : (
                <div class="settings-modal__body">
                  <div class="panel-actions settings-modal__import">
                    <input ref={cssInputRef} class="visually-hidden" type="file" accept=".css,text/css,text/plain" onChange={handleCssImport} />
                    <button type="button" class="btn-secondary" onClick={() => cssInputRef.current?.click()}>
                      <IconFile />
                      Importar .css
                    </button>
                  </div>
                  <textarea class="editor editor--css" value={configDraft.css} onInput={(e) => setConfigDraft({ ...configDraft, css: (e.target as HTMLTextAreaElement).value })} spellcheck={false} />
                </div>
              )}

              <div class="footer-actions settings-modal__footer">
                <button type="button" class="btn-secondary" onClick={closeConfig}>Cancelar</button>
                <button type="button" class="btn-primary" onClick={saveConfig}>Guardar</button>
              </div>
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
