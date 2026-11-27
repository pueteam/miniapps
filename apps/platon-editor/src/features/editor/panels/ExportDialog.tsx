import { useMemo, useState } from 'preact/hooks';
import { useDialogFocus } from '../../../components/useDialogFocus';
import type { Diagram } from '../model/types';
import { diagramBounds, safeExportScale } from '../export/bounds';
import { exportPng } from '../export/png';
import { exportSvg } from '../export/svg';
import { downloadBlob, safeName } from '../persistence/files';

type Format = 'png' | 'svg';
type Background = 'white' | 'transparent';

export function ExportDialog({ doc, onClose }: { doc: Diagram; onClose: () => void }) {
  const [format, setFormat] = useState<Format>('png');
  const [scale, setScale] = useState<1 | 2>(2);
  const [background, setBackground] = useState<Background>('white');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const bounds = useMemo(() => diagramBounds(doc), [doc]);
  const safeScale = useMemo(() => format === 'png' ? safeExportScale(bounds, scale) : 1, [bounds, format, scale]);
  const reducedScale = format === 'png' && safeScale < scale;
  const formatLabel = format.toUpperCase();
  const filename = `${safeName(doc.metadata.title)}.${format}`;
  const { dialogRef, onBackdropClick, onDialogKeyDown } = useDialogFocus(onClose, busy);

  async function downloadImage() {
    dialogRef.current?.focus();
    setBusy(true);
    setError('');
    try {
      const blob = format === 'png'
        ? await exportPng(doc, { scale, background }, safeScale)
        : exportSvg(doc, { background });
      downloadBlob(blob, filename);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'No se pudo exportar la imagen');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onBackdropClick}>
      <section ref={dialogRef} className="export-dialog" role="dialog" aria-modal="true" aria-labelledby="export-title" tabIndex={-1} onKeyDown={onDialogKeyDown}>
        <span className="section-label">COMPARTIR DIAGRAMA</span>
        <h2 id="export-title">Exportar como {formatLabel}</h2>
        <p>Se incluirá toda la cadena, también lo que está fuera de la vista.</p>
        <label className="field">Formato
          <select disabled={busy} value={format} onChange={event => setFormat(event.currentTarget.value as Format)}>
            <option value="png">PNG</option>
            <option value="svg">SVG</option>
          </select>
        </label>
        {format === 'png' && (
          <label className="field">Resolución
            <select disabled={busy} value={scale} onChange={event => setScale(Number(event.currentTarget.value) as 1 | 2)}>
              <option value={1}>1× · Tamaño original</option>
              <option value={2}>2× · Alta resolución</option>
            </select>
          </label>
        )}
        <label className="field">Fondo
          <select disabled={busy} value={background} onChange={event => setBackground(event.currentTarget.value as Background)}>
            <option value="white">Blanco</option>
            <option value="transparent">Transparente</option>
          </select>
        </label>
        <div className="export-size">{Math.ceil(bounds.width * safeScale)} × {Math.ceil(bounds.height * safeScale)} px</div>
        <p>Se descargará como {filename}.</p>
        {reducedScale && <p>El diagrama necesita una escala menor para respetar los límites de la imagen.</p>}
        {error && <p role="alert" className="error">{error}</p>}
        <div className="dialog-actions">
          <button type="button" disabled={busy} onClick={onClose}>Cancelar</button>
          <button type="button" className="primary" disabled={busy} onClick={downloadImage}>
            {busy ? 'Generando imagen…' : reducedScale ? 'Exportar a esta resolución' : `Exportar ${formatLabel}`}
          </button>
        </div>
      </section>
    </div>
  );
}
