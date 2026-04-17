import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { AppShell } from '../components/AppShell';
import { registerSW } from './registerSW';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_PREFIX } from '../lib/constants';
import { buildMetadataYaml } from '../lib/epubMetadata';
import { downloadBlob, slugify } from '../lib/download';
import { runPandocInWorker } from '../lib/workerClient';
import type { BinaryInput } from '../lib/types';

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

  const markdownInputRef = useRef<HTMLInputElement>(null);
  const cssInputRef = useRef<HTMLInputElement>(null);

  const metadataYaml = useMemo(() => buildMetadataYaml({ title, author, lang }), [title, author, lang]);

  const statusLabel = {
    idle: 'En espera',
    running: 'Generando EPUB…',
    success: 'EPUB generado correctamente',
    error: 'Error en la conversión'
  }[statusState];

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
    setCss(text);
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
          <article class="panel panel--meta">
            <div class="panel-header">
              <div class="panel-icon"><IconMetadata /></div>
              <h3>Metadatos del libro</h3>
            </div>

            <div class="field-group-title">Identificación</div>

            <label>
              <span>Título</span>
              <input type="text" value={title} onInput={(e) => setTitle((e.target as HTMLInputElement).value)} />
            </label>

            <label>
              <span>Autor / Autora</span>
              <input type="text" value={author} onInput={(e) => setAuthor((e.target as HTMLInputElement).value)} />
            </label>

            <div class="row">
              <label>
                <span>Idioma (BCP 47)</span>
                <input type="text" value={lang} onInput={(e) => setLang((e.target as HTMLInputElement).value)} />
              </label>

              <label>
                <span>Split level</span>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={splitLevel}
                  onInput={(e) => setSplitLevel(clamp(Number((e.target as HTMLInputElement).value || '1'), 1, 6))}
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
                value={tocDepth}
                onInput={(e) => setTocDepth(clamp(Number((e.target as HTMLInputElement).value || '3'), 1, 6))}
              />
            </label>

            <label class="checkbox">
              <input type="checkbox" checked={toc} onChange={(e) => setToc((e.target as HTMLInputElement).checked)} />
              <span>Incluir tabla de contenidos</span>
            </label>

            <div class="divider" />
            <div class="field-group-title">Archivos</div>

            <label>
              <span>Portada</span>
              <input type="file" accept="image/*" onChange={(e) => setCoverFile((e.target as HTMLInputElement).files?.[0] ?? null)} />
            </label>
          </article>

          <article class="panel panel--editor">
            <div class="panel-header panel-header--between">
              <div class="panel-header__left">
                <div class="panel-icon"><IconMarkdown /></div>
                <h3>Contenido Markdown</h3>
              </div>
              <div class="panel-actions">
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

          <article class="panel panel--editor">
            <div class="panel-header panel-header--between">
              <div class="panel-header__left">
                <div class="panel-icon"><IconCss /></div>
                <h3>CSS del EPUB</h3>
              </div>
              <div class="panel-actions">
                <input ref={cssInputRef} class="visually-hidden" type="file" accept=".css,text/css,text/plain" onChange={handleCssImport} />
                <button type="button" class="btn-secondary" onClick={() => cssInputRef.current?.click()}>
                  <IconFile />
                  Importar .css
                </button>
              </div>
            </div>
            <p class="panel-help">Pega aquí el CSS o importa un fichero .css.</p>
            <textarea class="editor editor--css" value={css} onInput={(e) => setCss((e.target as HTMLTextAreaElement).value)} spellcheck={false} />
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
      </section>
    </AppShell>
  );
}
