import type { Diagram } from '../model/types';
import { serializeDiagram } from '../model/validation';

function safeName(name: string): string {
  const cleaned = name.trim().replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-').replace(/[. ]+$/g, '');
  return cleaned || 'cadena-platon';
}

export function downloadBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  try {
    anchor.href = url;
    anchor.download = name;
    anchor.style.display = 'none';
    document.body.append(anchor);
    anchor.click();
  } finally {
    anchor.remove();
    URL.revokeObjectURL(url);
  }
}

export function downloadJson(doc: Diagram): void {
  const blob = new Blob([serializeDiagram(doc)], { type: 'application/json;charset=utf-8' });
  downloadBlob(blob, `${safeName(doc.metadata.title)}.json`);
}
