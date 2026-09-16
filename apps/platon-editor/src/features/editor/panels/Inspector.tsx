import { useEffect, useState } from 'preact/hooks';
import type { Diagram, DiagramEdge, DiagramElement, Selection, Style } from '../model/types';
import { applyPreset, presets, setManualStyle } from '../presets/catalog';

type InspectorProps = {
  doc: Diagram;
  selection: Selection;
  onChange: (doc: Diagram) => void;
};

type DraftFieldProps = {
  id: string;
  label: string;
  value: string;
  multiline?: boolean;
  inputMode?: 'decimal' | 'numeric' | 'text';
  onCommit: (value: string) => boolean;
};

function DraftField({ id, label, value, multiline, inputMode, onCommit }: DraftFieldProps) {
  const [draft, setDraft] = useState(value);
  const [committed, setCommitted] = useState(value);

  useEffect(() => {
    setDraft(value);
    setCommitted(value);
  }, [id, value]);

  const commit = () => {
    if (draft === committed) return;
    if (onCommit(draft)) setCommitted(draft);
  };
  const controlProps = {
    id,
    value: draft,
    onInput: (event: Event) => setDraft((event.currentTarget as HTMLInputElement | HTMLTextAreaElement).value),
    onBlur: commit,
  };

  return (
    <div className="field">
      <label for={id}>{label}</label>
      {multiline
        ? <textarea {...controlProps} />
        : <input {...controlProps} inputMode={inputMode} />}
    </div>
  );
}

function replaceElement(doc: Diagram, id: string, next: DiagramElement): Diagram {
  return { ...doc, elements: doc.elements.map((element) => element.id === id ? next : element) };
}

function replaceEdge(doc: Diagram, id: string, next: DiagramEdge): Diagram {
  return { ...doc, edges: doc.edges.map((edge) => edge.id === id ? next : edge) };
}

function isHttpUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return true;
  try {
    const protocol = new URL(trimmed).protocol;
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

function isColor(value: string, allowTransparent: boolean): boolean {
  if (allowTransparent && value === 'transparent') return true;
  return /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(value);
}

export function Inspector({ doc, selection, onChange }: InspectorProps) {
  const [error, setError] = useState('');
  const element = doc.elements.find((item) => item.id === selection.elementIds[0]);
  const edge = element ? undefined : doc.edges.find((item) => item.id === selection.edgeIds[0]);

  useEffect(() => setError(''), [element?.id, edge?.id]);

  const validText = (commit: () => void) => (value: string) => {
    setError('');
    commit();
    return true;
  };

  const numberCommit = (label: string, value: string, minimum: number, commit: (numberValue: number) => void) => {
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue) || numberValue < minimum) {
      setError(`${label} debe ser un número ${minimum > 0 ? 'mayor que cero' : `mayor o igual que ${minimum}`}.`);
      return false;
    }
    setError('');
    commit(numberValue);
    return true;
  };

  return (
    <aside className="inspector" aria-label="Inspector">
      {selection.elementIds.length > 1 && <p role="note">{selection.elementIds.length} seleccionados · se edita el primero</p>}
      {element
        ? <ElementInspector
            doc={doc}
            element={element}
            onChange={onChange}
            setError={setError}
            validText={validText}
            numberCommit={numberCommit}
          />
        : edge
          ? <EdgeInspector doc={doc} edge={edge} onChange={onChange} numberCommit={numberCommit} setError={setError} />
          : <MetadataInspector doc={doc} onChange={onChange} validText={validText} />}
      {error && <p role="alert">{error}</p>}
    </aside>
  );
}

type TextCommit = (commit: () => void) => (value: string) => boolean;
type NumberCommit = (label: string, value: string, minimum: number, commit: (value: number) => void) => boolean;

function MetadataInspector({ doc, onChange, validText }: { doc: Diagram; onChange: (doc: Diagram) => void; validText: TextCommit }) {
  const field = (key: keyof Diagram['metadata'], label: string, multiline = false) => (
    <DraftField
      id={`metadata-${key}`}
      label={label}
      value={doc.metadata[key]}
      multiline={multiline}
      onCommit={(value) => validText(() => onChange({ ...doc, metadata: { ...doc.metadata, [key]: value } }))(value)}
    />
  );
  return (
    <>
      <h2>Documento</h2>
      {field('title', 'Título')}
      {field('lote', 'Lote')}
      {field('cadena', 'Cadena')}
      {field('description', 'Descripción', true)}
    </>
  );
}

type ElementInspectorProps = {
  doc: Diagram;
  element: DiagramElement;
  onChange: (doc: Diagram) => void;
  setError: (message: string) => void;
  validText: TextCommit;
  numberCommit: NumberCommit;
};

function ElementInspector({ doc, element, onChange, setError, validText, numberCommit }: ElementInspectorProps) {
  const update = (next: DiagramElement) => onChange(replaceElement(doc, element.id, next));
  const dataField = (key: keyof DiagramElement['data'], label: string, multiline = false) => (
    <DraftField
      id={`element-${element.id}-${key}`}
      label={label}
      value={String(element.data[key])}
      multiline={multiline}
      onCommit={(value) => validText(() => update({ ...element, data: { ...element.data, [key]: value } }))(value)}
    />
  );
  const numericField = (
    id: string,
    label: string,
    value: number,
    minimum: number,
    commit: (next: number) => DiagramElement,
  ) => (
    <DraftField
      id={id}
      label={label}
      value={String(value)}
      inputMode="decimal"
      onCommit={(draft) => numberCommit(label, draft, minimum, (next) => update(commit(next)))}
    />
  );
  const manualStyle = (patch: Partial<Style>) => update(setManualStyle(element, patch));
  const urlField = (
    <>
      <DraftField
        id={`element-${element.id}-url`}
        label="URL"
        value={element.data.url}
        onCommit={(value) => {
          const trimmed = value.trim();
          if (!isHttpUrl(trimmed)) {
            setError('La URL debe usar http o https.');
            return false;
          }
          setError('');
          update({ ...element, data: { ...element.data, url: trimmed } });
          return true;
        }}
      />
      <button
        type="button"
        disabled={!element.data.url || !isHttpUrl(element.data.url)}
        onClick={() => window.open(element.data.url, '_blank', 'noopener,noreferrer')}
      >
        Abrir URL
      </button>
    </>
  );

  return (
    <>
      <h2>Elemento</h2>
      <div className="section-label">Contenido</div>
      {(element.kind === 'job' || element.kind === 'action' || element.kind === 'group') && dataField('name', 'Nombre')}
      {(element.kind === 'job' || element.kind === 'action') && dataField('schedule', 'Horario')}
      {element.kind === 'job' && (
        <>
          <div className="field-row">
            <label for={`element-${element.id}-repetitive`}>R</label>
            <input
              id={`element-${element.id}-repetitive`}
              type="checkbox"
              checked={element.data.repetitive}
              onChange={(event) => update({ ...element, data: { ...element.data, repetitive: event.currentTarget.checked } })}
            />
          </div>
          <DraftField
            id={`element-${element.id}-parameters`}
            label="Parámetros"
            value={element.data.parameters.join('\n')}
            multiline
            onCommit={(value) => validText(() => update({ ...element, data: { ...element.data, parameters: value.split(/\r?\n/).filter(Boolean) } }))(value)}
          />
        </>
      )}
      {element.kind === 'action' && <>{dataField('semaphore', 'Semáforo')}{dataField('value', 'Valor')}</>}
      {element.kind === 'text' && dataField('text', 'Texto', true)}
      {element.kind === 'header' && <>{dataField('lote', 'Lote')}{dataField('cadena', 'Cadena')}{dataField('description', 'Descripción', true)}</>}
      {(element.kind === 'job' || element.kind === 'action') && dataField('annotations', 'Anotaciones', true)}
      {(element.kind === 'job' || element.kind === 'action' || element.kind === 'group') && urlField}

      <div className="section-label">Apariencia</div>
      <div className="field">
        <label for={`element-${element.id}-preset`}>Preset</label>
        <select
          id={`element-${element.id}-preset`}
          value={element.style.presetId ?? ''}
          onChange={(event) => {
            const next = event.currentTarget.value;
            if (!next && !element.style.presetId) return;
            update(next ? applyPreset(element, next) : setManualStyle(element, {}));
          }}
        >
          <option value="">Personalizado</option>
          {presets.map((preset) => <option key={preset.id} value={preset.id}>{preset.category}: {preset.label}</option>)}
        </select>
      </div>
      <div className="field">
        <label for={`element-${element.id}-shape`}>Forma</label>
        <select id={`element-${element.id}-shape`} value={element.style.shape} onChange={(event) => manualStyle({ shape: event.currentTarget.value as Style['shape'] })}>
          <option value="rectangle">Rectángulo</option>
          <option value="diamond">Rombo</option>
          <option value="hexagon">Hexágono</option>
        </select>
      </div>
      <StyleColorField id={`element-${element.id}-fill`} label="Relleno" value={element.style.fill} allowTransparent onChange={(fill) => manualStyle({ fill })} setError={setError} />
      <StyleColorField id={`element-${element.id}-stroke`} label="Borde" value={element.style.stroke} onChange={(stroke) => manualStyle({ stroke })} setError={setError} />
      {numericField(`element-${element.id}-stroke-width`, 'Grosor del borde', element.style.strokeWidth, 0, (strokeWidth) => setManualStyle(element, { strokeWidth }))}
      {numericField(`element-${element.id}-radius`, 'Redondeo', element.style.radius, 0, (radius) => setManualStyle(element, { radius }))}
      <StyleColorField id={`element-${element.id}-color`} label="Color del texto" value={element.style.color} onChange={(color) => manualStyle({ color })} setError={setError} />
      {numericField(`element-${element.id}-font-size`, 'Tamaño del texto', element.style.fontSize, Number.EPSILON, (fontSize) => setManualStyle(element, { fontSize }))}
      <div className="field-row">
        <label for={`element-${element.id}-bold`}>Negrita</label>
        <input id={`element-${element.id}-bold`} type="checkbox" checked={element.style.bold} onChange={(event) => manualStyle({ bold: event.currentTarget.checked })} />
      </div>
      <div className="field">
        <label for={`element-${element.id}-align`}>Alineación</label>
        <select id={`element-${element.id}-align`} value={element.style.align} onChange={(event) => manualStyle({ align: event.currentTarget.value as Style['align'] })}>
          <option value="left">Izquierda</option>
          <option value="center">Centro</option>
          <option value="right">Derecha</option>
        </select>
      </div>

      <div className="section-label">Geometría</div>
      {numericField(`element-${element.id}-width`, 'Ancho', element.width, Number.EPSILON, (width) => ({ ...element, width }))}
      {numericField(`element-${element.id}-height`, 'Alto', element.height, Number.EPSILON, (height) => ({ ...element, height }))}
      {numericField(`element-${element.id}-x`, 'X', element.position.x, -Infinity, (x) => ({ ...element, position: { ...element.position, x } }))}
      {numericField(`element-${element.id}-y`, 'Y', element.position.y, -Infinity, (y) => ({ ...element, position: { ...element.position, y } }))}
    </>
  );
}

function StyleColorField({ id, label, value, allowTransparent = false, onChange, setError }: { id: string; label: string; value: string; allowTransparent?: boolean; onChange: (value: string) => void; setError: (message: string) => void }) {
  return (
    <DraftField
      id={id}
      label={label}
      value={value}
      onCommit={(draft) => {
        if (!isColor(draft.trim(), allowTransparent)) {
          setError(`El color de ${label.toLowerCase()} debe ser hexadecimal (#rgb, #rrggbb…).`);
          return false;
        }
        setError('');
        onChange(draft.trim());
        return true;
      }}
    />
  );
}

function EdgeInspector({ doc, edge, onChange, numberCommit, setError }: { doc: Diagram; edge: DiagramEdge; onChange: (doc: Diagram) => void; numberCommit: NumberCommit; setError: (message: string) => void }) {
  const update = (next: DiagramEdge) => onChange(replaceEdge(doc, edge.id, next));
  return (
    <>
      <h2>Enlace</h2>
      {(['source', 'target'] as const).map(endpoint => <div className="field" key={endpoint}>
        <label for={`edge-${edge.id}-${endpoint}`}>{endpoint === 'source' ? 'Origen' : 'Destino'}</label>
        <select id={`edge-${edge.id}-${endpoint}`} value={edge[endpoint]} onChange={event => update({...edge, [endpoint]: event.currentTarget.value})}>
          {doc.elements.filter(item => (item.kind === 'job' || item.kind === 'action') && item.id !== edge[endpoint === 'source' ? 'target' : 'source']).map(item => <option key={item.id} value={item.id}>{item.data.name || item.id}</option>)}
        </select>
        <label for={`edge-${edge.id}-${endpoint}-port`}>Puerto de {endpoint === 'source' ? 'origen' : 'destino'}</label>
        <select id={`edge-${edge.id}-${endpoint}-port`} value={edge[`${endpoint}Port`]} onChange={event => update({...edge, [`${endpoint}Port`]: event.currentTarget.value})}>
          <option value="top">Superior</option><option value="right">Derecho</option><option value="bottom">Inferior</option><option value="left">Izquierdo</option>
        </select>
      </div>)}
      <div className="field">
        <label for={`edge-${edge.id}-routing`}>Recorrido</label>
        <select id={`edge-${edge.id}-routing`} value={edge.routing} onChange={(event) => update({ ...edge, routing: event.currentTarget.value as DiagramEdge['routing'] })}>
          <option value="straight">Recto</option>
          <option value="orthogonal">Ortogonal</option>
        </select>
      </div>
      <StyleColorField id={`edge-${edge.id}-color`} label="Color" value={edge.color} onChange={(color) => update({ ...edge, color })} setError={setError} />
      <DraftField
        id={`edge-${edge.id}-width`}
        label="Grosor"
        value={String(edge.width)}
        inputMode="decimal"
        onCommit={(value) => numberCommit('Grosor', value, Number.EPSILON, (width) => update({ ...edge, width }))}
      />
      {edge.routing === 'orthogonal' && (
        <>
          <div className="section-label">Puntos intermedios</div>
          {edge.waypoints.map((point, index) => (
            <div className="field-row" key={index}>
              <DraftField
                id={`edge-${edge.id}-waypoint-${index}-x`}
                label={`Punto ${index + 1} X`}
                value={String(point.x)}
                inputMode="decimal"
                onCommit={(value) => numberCommit(`Punto ${index + 1} X`, value, -Infinity, (x) => update({ ...edge, waypoints: edge.waypoints.map((item, itemIndex) => itemIndex === index ? { ...item, x } : item) }))}
              />
              <DraftField
                id={`edge-${edge.id}-waypoint-${index}-y`}
                label={`Punto ${index + 1} Y`}
                value={String(point.y)}
                inputMode="decimal"
                onCommit={(value) => numberCommit(`Punto ${index + 1} Y`, value, -Infinity, (y) => update({ ...edge, waypoints: edge.waypoints.map((item, itemIndex) => itemIndex === index ? { ...item, y } : item) }))}
              />
              <button type="button" aria-label={`Eliminar punto ${index + 1}`} onClick={() => update({ ...edge, waypoints: edge.waypoints.filter((_, itemIndex) => itemIndex !== index) })}>Eliminar</button>
            </div>
          ))}
          <button type="button" onClick={() => update({ ...edge, waypoints: [...edge.waypoints, { x: 0, y: 0 }] })}>Añadir punto</button>
        </>
      )}
    </>
  );
}
