import { useEffect, useRef, useState } from 'preact/hooks';
import { registerSW } from './registerSW';
import { AppShell } from '../components/AppShell';
import { TemplateForm } from '../features/template-mgr/TemplateForm';
import { initDB, saveTemplate, deleteTemplate, getAllTemplates } from '../features/template-mgr/db';
import { loadTemplateContent, generateDocument } from '../features/template-mgr/templateHandler';
import { sanitizeHTML, getCurrentDate } from '../features/template-mgr/utils';

interface Message {
  text: string;
  type: 'success' | 'error';
}

export function App() {
  const [templates, setTemplates] = useState<string[]>([]);
  const [selected, setSelected] = useState('');
  const [variables, setVariables] = useState<string[]>([]);
  const [fieldOptions, setFieldOptions] = useState<Record<string, string[]>>({});
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [fileName, setFileName] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    registerSW();
    initDB()
      .then(() => getAllTemplates())
      .then(setTemplates)
      .catch(() => notify('No se pudo inicializar el almacenamiento local.', 'error'));
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(t);
  }, [message]);

  function notify(text: string, type: 'success' | 'error') {
    setMessage({ text, type });
  }

  async function refreshTemplates() {
    setTemplates(await getAllTemplates());
  }

  function resetForm() {
    setSelected('');
    setVariables([]);
    setFieldOptions({});
    setMetadata({});
    setFileName('');
  }

  async function handleTemplateLoad() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.docx,.pptx';
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const content = await readFileAsArrayBuffer(file);
        await saveTemplate(file.name, content);
        await refreshTemplates();
        notify(`Plantilla "${file.name}" cargada correctamente`, 'success');
        setShowConfig(false);
      } catch {
        notify(`Error al cargar la plantilla "${file.name}".`, 'error');
      }
    };
    input.click();
  }

  async function handleTemplateSelect(e: Event) {
    const name = (e.target as HTMLSelectElement).value;
    setSelected(name);
    if (!name) { resetForm(); return; }

    const data = await loadTemplateContent(name);
    if (!data) { notify('No se pudo cargar la plantilla.', 'error'); return; }

    setVariables(data.variables);
    setFieldOptions(data.fieldOptions);
    setMetadata(data.metadata);
    notify(data.metadata['description'] ?? '', 'success');

    const ext = name.toLowerCase().endsWith('.pptx') ? '.pptx' : '.docx';
    setFileName(`${name.replace(/\.(docx|pptx)$/i, '')}_${getCurrentDate()}${ext}`);
  }

  async function handleDeleteTemplate() {
    if (!selected) { notify('Seleccione una plantilla para eliminar', 'error'); return; }
    try {
      await deleteTemplate(selected);
      await refreshTemplates();
      resetForm();
      notify(`Plantilla "${selected}" eliminada correctamente`, 'success');
      setShowConfig(false);
    } catch {
      notify(`Error al eliminar la plantilla "${selected}".`, 'error');
    }
  }

  async function handleGenerate() {
    if (!formRef.current) return;
    if (!formRef.current.checkValidity()) {
      formRef.current.reportValidity();
      return;
    }
    const data = Object.fromEntries(new FormData(formRef.current).entries()) as Record<string, string>;
    const baseName = fileName.replace(/\.(docx|pptx)$/i, '');
    const success = await generateDocument(selected, data, baseName);
    if (success) {
      notify('Documento generado exitosamente', 'success');
      resetForm();
    } else {
      notify('Error al generar el documento', 'error');
    }
  }

  const hasTemplate = selected !== '';

  return (
    <AppShell onHelpClick={() => setShowHelp(true)}>
      <section class="card tm-card">
        {/* Template selector row */}
        <div class="tm-select-group">
          <select
            id="templateSelect"
            value={selected}
            onChange={handleTemplateSelect}
            class="tm-select"
          >
            <option value="">Seleccione una plantilla</option>
            {templates.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {!showConfig ? (
            <button class="tm-btn tm-btn--outline" onClick={() => setShowConfig(true)}>
              Configurar Plantillas
            </button>
          ) : (
            <div class="tm-action-group">
              <button class="tm-btn" onClick={handleTemplateLoad}>Cargar Nueva Plantilla</button>
              <button class="tm-btn tm-btn--outline" onClick={handleDeleteTemplate}>Eliminar Plantilla</button>
              <button class="tm-btn tm-btn--ghost" onClick={() => setShowConfig(false)}>Cancelar</button>
            </div>
          )}
        </div>

        {/* Message */}
        {message && (
          <div
            class={`tm-message tm-message--${message.type}`}
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(message.text) }}
          />
        )}

        {/* Variable form */}
        <TemplateForm variables={variables} fieldOptions={fieldOptions} formRef={formRef} />

        {/* Generate row */}
        {hasTemplate && (
          <div class="tm-generate-row">
            <input
              type="text"
              class="tm-input"
              placeholder={`Nombre del documento (ej: ${fileName})`}
              value={fileName}
              onInput={(e) => setFileName((e.target as HTMLInputElement).value)}
            />
            <button class="tm-btn" onClick={handleGenerate}>Generar Documento</button>
          </div>
        )}
      </section>

      {/* Help modal */}
      {showHelp && (
        <div class="tm-modal" onClick={(e) => e.target === e.currentTarget && setShowHelp(false)}>
          <div class="tm-modal__content">
            <button class="tm-modal__close" onClick={() => setShowHelp(false)} aria-label="Cerrar">✕</button>
            <h3>Ayuda – Gestor de Plantillas</h3>

            <h4>¿Cómo usar la aplicación?</h4>
            <ol>
              <li>Haga clic en <b>Configurar Plantillas</b> para mostrar las opciones de gestión.</li>
              <li>Use <b>Cargar Nueva Plantilla</b> para subir un archivo .docx o .pptx con variables en el formato <code>{'{nombre_variable}'}</code>.</li>
              <li>Seleccione una plantilla del menú desplegable para cargar su formulario.</li>
              <li>Complete los campos y haga clic en <b>Generar Documento</b>.</li>
            </ol>

            <h4>Tipos de variables</h4>
            <ul>
              <li><code>email_campo</code> → campo email</li>
              <li><code>date_campo</code> → campo fecha</li>
              <li><code>number_campo</code> → campo numérico</li>
              <li><code>url_campo</code>, <code>tel_campo</code>, <code>time_campo</code></li>
              <li>Sin prefijo → campo de texto</li>
            </ul>

            <h4>Listas de opciones</h4>
            <p>
              <code>{'{estado:opciones[Pendiente|En proceso|Cerrado]}'}</code>
            </p>

            <h4>Metadatos de plantilla</h4>
            <p>
              Añada <code>{'{!metadata:Descripción de la plantilla}'}</code> en cualquier punto. No aparecerá en el documento final.
            </p>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target as FileReader).result as ArrayBuffer);
    reader.onerror = (e) => reject((e.target as FileReader).error);
    reader.readAsArrayBuffer(file);
  });
}
