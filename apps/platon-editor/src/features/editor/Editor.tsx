import { useEffect, useRef, useState } from 'preact/hooks';
import { emptyDiagram } from './model/document';
import { startHistory, commitHistory, undo, redo } from './model/history';
import { createElement } from './presets/elements';
import { deleteSelection, duplicateSelection } from './model/operations';
import { groupElements, ungroup, reparentElements, fitGroup } from './model/groups';
import { parseDiagram, validateDiagram } from './model/validation';
import type { Diagram, Kind, Point, Selection, Viewport } from './model/types';
import { Palette } from './panels/Palette';
import { Inspector } from './panels/Inspector';
import { FlowCanvas } from './canvas/FlowCanvas';
import { ExportDialog } from './panels/ExportDialog';
import { loadDraft, DEFAULT_VIEWPORT } from './persistence/db';
import { downloadJson } from './persistence/files';
import { randomId } from '../../lib/id';
import { isSameSelection } from './model/selection';
import { useAutosave } from './persistence/useAutosave';
import { InstallButton } from '../../components/InstallButton';
import './editor.css';

const none: Selection={elementIds:[],edgeIds:[]};
const initialViewport: Viewport={...DEFAULT_VIEWPORT};
export function Editor() {
  const [history,setHistory]=useState(()=>startHistory(emptyDiagram()));
  const [selection,setSelection]=useState<Selection>(none);
  const [viewport,setViewport]=useState<Viewport>(initialViewport);
  const [ready,setReady]=useState(false); const [error,setError]=useState('');
  const [exporting,setExporting]=useState(false); const [paletteOpen,setPaletteOpen]=useState(false); const [inspectorOpen,setInspectorOpen]=useState(false);
  const file=useRef<HTMLInputElement>(null); const doc=history.present;
  const { status: saved, retry: retrySave } = useAutosave(doc,viewport,ready);
  useEffect(()=>{let cancelled=false; loadDraft().then(draft=>{if(!cancelled && draft){setHistory(startHistory(draft.doc));setViewport(draft.viewport);}}).catch(()=>{if(!cancelled)setError('No se pudo recuperar el borrador local. Puedes abrir un archivo JSON.');}).finally(()=>{if(!cancelled)setReady(true);}); return()=>{cancelled=true;};},[]);
  const commit=(next:Diagram)=>{const checked=validateDiagram(next);setHistory(h=>commitHistory(h,checked));setError('');};
  const safely=(action:()=>void)=>{try{action();}catch(e){setError(e instanceof Error?e.message:'No se pudo completar la acción');}};
  const select=(next:Selection)=>setSelection(current=>isSameSelection(current,next)?current:next);
  const changeViewport=(next:Viewport)=>setViewport(current=>current.x===next.x&&current.y===next.y&&current.zoom===next.zoom?current:next);
  const add=(kind:Kind,point?:Point)=>{const rect=document.querySelector('.canvas-wrap')?.getBoundingClientRect();const position=point??{x:((rect?.width??800)/2-viewport.x)/viewport.zoom-70,y:((rect?.height??500)/2-viewport.y)/viewport.zoom-40}; const e=createElement(kind,randomId(),position);commit({...doc,elements:[...doc.elements,e]});setSelection({elementIds:[e.id],edgeIds:[]});setInspectorOpen(true);};
  const remove=()=>safely(()=>{commit(deleteSelection(doc,selection));setSelection(none);});
  const duplicate=()=>safely(()=>{const next=duplicateSelection(doc,selection.elementIds,()=>randomId());commit(next);setSelection({elementIds:next.elements.filter(e=>!doc.elements.some(old=>old.id===e.id)).map(e=>e.id),edgeIds:[]});});
  useEffect(()=>{const handler=(event:KeyboardEvent)=>{if(!ready)return; const target=event.target as HTMLElement; if(target.closest('input,textarea,select,[contenteditable="true"]') || exporting)return;
    if(event.key==='Delete'||event.key==='Backspace'){event.preventDefault();remove();}
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'){event.preventDefault();setHistory(h=>event.shiftKey?redo(h):undo(h));setSelection(none);}
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='y'){event.preventDefault();setHistory(redo);setSelection(none);}
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='d'){event.preventDefault();duplicate();}
    if(event.key==='Escape')setSelection(none);
  };window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler);},[doc,selection,exporting,ready]);
  const hasSelection=selection.elementIds.length+selection.edgeIds.length>0;
  const selectedGroup=selection.elementIds.length===1?doc.elements.find(e=>e.id===selection.elementIds[0]&&e.kind==='group'):undefined;
  const replace=(next:Diagram)=>{if(doc.elements.length && !window.confirm('¿Sustituir la cadena actual? Guarda un JSON si quieres conservarla por separado.'))return;setHistory(startHistory(next));setSelection(none);setViewport(initialViewport);};
  return <div className="platon-app">
    <header className="editor-header"><a className="brand" href="../" title="Volver a miniapps"><span className="brand-mark">P</span><span>PLATON <small>FLOW EDITOR</small></span></a>
      <div className="document-heading"><strong>{doc.metadata.title||'Nueva cadena'}</strong><span className={`save-status ${saved==='error'?'error':''}`}><i />{!ready?'Recuperando…':saved==='saving'?'Guardando…':saved==='error'?<button type="button" className="save-retry" onClick={retrySave}>Error de guardado · Reintentar</button>:'Guardado local'}</span></div>
      <nav className="document-actions" aria-label="Documento"><button disabled={!ready} onClick={()=>replace(emptyDiagram())}>Nuevo</button><button disabled={!ready} onClick={()=>file.current?.click()}>Abrir JSON</button><button disabled={!ready} onClick={()=>safely(()=>downloadJson(doc))}>Guardar JSON</button><button className="primary" disabled={!ready} onClick={()=>setExporting(true)}>↗ Exportar PNG</button><InstallButton /></nav>
      <input ref={file} type="file" accept=".json,application/json" hidden aria-label="Abrir archivo JSON" onChange={async event=>{const input=event.currentTarget;const selected=input.files?.[0];if(!selected)return;try{const next=parseDiagram(await selected.text());replace(next);}catch(e){setError(e instanceof Error?e.message:'Archivo no válido');}finally{input.value='';}}} />
    </header>
    <div className="editing-toolbar"><div className="toolbar-group"><button title="Ctrl+Z" aria-label="Deshacer" disabled={!history.past.length} onClick={()=>{setHistory(undo);setSelection(none);}}>↶</button><button title="Ctrl+Y" aria-label="Rehacer" disabled={!history.future.length} onClick={()=>{setHistory(redo);setSelection(none);}}>↷</button><span className="toolbar-divider"/><button disabled={!selection.elementIds.length} onClick={duplicate}>Duplicar</button><button aria-label="Eliminar selección" disabled={!hasSelection} onClick={remove}>Eliminar</button></div>
      <div className="toolbar-group"><button disabled={!selection.elementIds.length} onClick={()=>safely(()=>{const id=randomId();commit(groupElements(doc,selection.elementIds,id));setSelection({elementIds:[id],edgeIds:[]});})}>Agrupar</button><button disabled={!selectedGroup} onClick={()=>safely(()=>{commit(ungroup(doc,selectedGroup!.id));setSelection(none);})}>Desagrupar</button><button disabled={!selectedGroup} onClick={()=>safely(()=>commit(fitGroup(doc,selectedGroup!.id)))}>Autoajustar grupo</button>
      <select aria-label="Añadir selección a grupo" value="" disabled={!selection.elementIds.length} onChange={event=>{const id=event.currentTarget.value;if(id)safely(()=>commit(reparentElements(doc,selection.elementIds,id)));}}><option value="">Mover a grupo…</option>{doc.elements.filter(e=>e.kind==='group'&&!selection.elementIds.includes(e.id)).map(e=><option value={e.id} key={e.id}>{e.data.name||'Grupo'}</option>)}</select>
      <button disabled={!selection.elementIds.some(id=>doc.elements.find(e=>e.id===id)?.parentId)} onClick={()=>safely(()=>commit(reparentElements(doc,selection.elementIds)))}>Sacar del grupo</button></div>
      <div className="mobile-panel-actions"><button onClick={()=>setPaletteOpen(!paletteOpen)}>Elementos</button><button onClick={()=>setInspectorOpen(!inspectorOpen)}>Propiedades</button></div>
    </div>
    {error && <div className="error-banner" role="alert">{error}<button aria-label="Cerrar aviso" onClick={()=>setError('')}>×</button></div>}
    <main className="editor-layout"><aside className={`palette-panel ${paletteOpen?'panel-open':''}`}><div className="panel-heading"><span className="section-label">ELEMENTOS</span><h2>Construye tu cadena</h2><p>Arrastra al lienzo para empezar.</p></div>{ready&&<Palette onAdd={kind=>add(kind)} />}<div className="palette-note"><span>DISEÑO MANUAL</span><p>Cada objeto es editable. Los colores documentan tu flujo.</p></div></aside>
      {ready?<FlowCanvas doc={doc} selection={selection} viewport={viewport} onCommit={next=>safely(()=>commit(next))} onSelection={select} onViewport={changeViewport} onAdd={add} />:<div className="loading">Recuperando tu espacio de trabajo…</div>}
      <aside className={`inspector-panel ${inspectorOpen?'panel-open':''}`}><div className="panel-heading"><span className="section-label">PROPIEDADES</span><h2>{hasSelection?'Personaliza el elemento':'Tu documento'}</h2></div><Inspector doc={doc} selection={selection} onChange={next=>safely(()=>commit(next))} /></aside>
    </main>
    {exporting&&<ExportDialog doc={doc} onClose={()=>setExporting(false)} />}
  </div>;
}
