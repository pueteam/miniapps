import type { DiagramElement, Kind } from '../model/types';

const PREFIX: Record<Kind, string> = {
  job: 'JOB',
  action: 'ACTUACIÓN',
  text: 'TEXTO',
  group: 'GRUPO',
  header: 'CABECERA',
};

function visibleText(e: DiagramElement): string {
  if (e.kind === 'text') return e.data.text;
  if (e.kind === 'header') return e.data.description;
  return e.data.name;
}

/** Siguiente nombre automático por tipo (JOB1, TEXTO1…): max(sufijos)+1, sin reutilizar huecos. */
export function nextName(elements: DiagramElement[], kind: Kind): string {
  const prefix = PREFIX[kind];
  const pattern = new RegExp(`^${prefix}(\\d+)$`);
  let max = 0;
  for (const e of elements) {
    if (e.kind !== kind) continue;
    const match = pattern.exec(visibleText(e).trim());
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `${prefix}${max + 1}`;
}

/** Aplica el nombre automático al campo visible según el kind. */
export function withAutoName(element: DiagramElement, name: string): DiagramElement {
  if (element.kind === 'text') return { ...element, data: { ...element.data, text: name } };
  if (element.kind === 'header') return { ...element, data: { ...element.data, description: name } };
  return { ...element, data: { ...element.data, name } };
}
