import { render } from 'preact';
import { toBlob } from 'html-to-image';
import type { Diagram } from '../model/types';
import { diagramBounds, safeExportScale } from './bounds';
import { ExportScene } from './ExportScene';

export type ExportOptions = { scale: 1 | 2; background: 'white' | 'transparent' };

export async function exportPng(doc: Diagram, options: ExportOptions, scaleOverride?: number): Promise<Blob> {
  const bounds = diagramBounds(doc);
  const safeScale = safeExportScale(bounds, options.scale);
  const scale = scaleOverride === undefined ? safeScale : Math.min(safeExportScale(bounds, scaleOverride), safeScale);
  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.left = '-100000px';
  host.style.top = '0';
  host.style.width = `${bounds.width}px`;
  host.style.height = `${bounds.height}px`;
  host.style.pointerEvents = 'none';
  document.body.append(host);
  try {
    render(<ExportScene doc={doc} bounds={bounds} />, host);
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (fonts) await fonts.ready;
    await new Promise<void>(resolve => window.setTimeout(resolve, 0));
    const scene = host.querySelector<HTMLElement>('[data-export-scene]');
    if (!scene) throw new Error('No se pudo preparar la escena de exportación');
    const blob = await toBlob(scene, { pixelRatio: scale, backgroundColor: options.background === 'white' ? '#ffffff' : undefined });
    if (!blob) throw new Error('No se pudo generar el PNG');
    return blob;
  } finally {
    render(null, host);
    host.remove();
  }
}
