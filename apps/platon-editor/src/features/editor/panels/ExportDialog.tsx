import { useMemo, useState } from 'preact/hooks';
import type { Diagram } from '../model/types';
import { diagramBounds, safeExportScale } from '../export/bounds';
import { exportPng } from '../export/png';
import { downloadBlob, safeName } from '../persistence/files';
export function ExportDialog({doc,onClose}:{doc:Diagram;onClose:()=>void}) {
  const [scale,setScale]=useState<1|2>(2); const [background,setBackground]=useState<'white'|'transparent'>('white');
  const [busy,setBusy]=useState(false); const [error,setError]=useState('');
  const bounds=useMemo(()=>diagramBounds(doc),[doc]); const safe=useMemo(()=>safeExportScale(bounds,scale),[bounds,scale]);
  return <div className="modal-backdrop"><section className="export-dialog" role="dialog" aria-modal="true" aria-labelledby="export-title">
    <span className="section-label">COMPARTIR DIAGRAMA</span><h2 id="export-title">Exportar como PNG</h2><p>Se incluirá toda la cadena, también lo que está fuera de la vista.</p>
    <label className="field">Resolución<select value={scale} onChange={e=>setScale(Number(e.currentTarget.value) as 1|2)}><option value={1}>1× · Tamaño original</option><option value={2}>2× · Alta resolución</option></select></label>
    <label className="field">Fondo<select value={background} onChange={e=>setBackground(e.currentTarget.value as 'white'|'transparent')}><option value="white">Blanco</option><option value="transparent">Transparente</option></select></label>
    <div className="export-size">{Math.ceil(bounds.width*safe)} × {Math.ceil(bounds.height*safe)} px</div>
    {safe<scale && <p>El diagrama necesita una escala menor para respetar los límites de la imagen.</p>}
    {error && <p role="alert" className="error">{error}</p>}
    <div className="dialog-actions"><button disabled={busy} onClick={onClose}>Cancelar</button><button className="primary" disabled={busy} onClick={async()=>{setBusy(true);setError('');try{const blob=await exportPng(doc,{scale,background},safe);downloadBlob(blob,`${safeName(doc.metadata.title)}.png`);onClose();}catch(e){setError(e instanceof Error?e.message:'No se pudo exportar la imagen');}finally{setBusy(false);}}}>{busy?'Generando imagen…':safe<scale?'Exportar a esta resolución':'Descargar PNG'}</button></div>
  </section></div>;
}
