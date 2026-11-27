import { orderElements } from '../canvas/order';
import { absolutePosition } from '../model/geometry';
import { edgePath, routeEdge } from '../model/routes';
import type { Diagram, DiagramElement, Style } from '../model/types';
import { diagramBounds } from './bounds';

const xmlEntities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };
const polygonPoints = {
  diamond: [[0.5, 0], [1, 0.5], [0.5, 1], [0, 0.5]],
  hexagon: [[0.15, 0], [0.85, 0], [1, 0.5], [0.85, 1], [0.15, 1], [0, 0.5]],
};
const textAnchors = { left: 'start', center: 'middle', right: 'end' };

function escapeXml(value: string): string {
  return value.replace(/[^\u0009\u000a\u000d\u0020-\ud7ff\ue000-\ufffd\u{10000}-\u{10ffff}]/gu, '\uFFFD')
    .replace(/[&<>"']/g, character => xmlEntities[character]);
}

function renderShape({ kind, width, height, style }: DiagramElement): string {
  if (kind === 'text' || kind === 'header') return '';

  const fill = style.fill === 'transparent' ? 'none' : escapeXml(style.fill);
  const paint = `fill="${fill}" stroke="${escapeXml(style.stroke)}" stroke-width="${style.strokeWidth}"`;
  if (style.shape === 'rectangle') return `<rect width="${width}" height="${height}" rx="${style.radius}" ${paint}/>`;

  const points = polygonPoints[style.shape].map(([x, y]) => `${x * width},${y * height}`).join(' ');
  return `<polygon points="${points}" ${paint}/>`;
}

function textLine(value: string, x: number, y: number, size: number): string {
  return `<text x="${x}" y="${y}" font-size="${size}" dominant-baseline="central" xml:space="preserve">${escapeXml(value)}</text>`;
}

function textPosition(width: number, align: Style['align'], padding: number): number {
  if (align === 'center') return width / 2;
  return align === 'right' ? width - padding : padding;
}

// SVG text has no portable automatic wrapping. Estimate widths without loading fonts.
function glyphWidth(character: string): number {
  if (/\p{Mark}/u.test(character)) return 0;
  if (character === '\t') return 1.3;
  if (/[\sijlI.,'|!:;]/.test(character)) return 0.32;
  if (/[MW@%#]/.test(character) || character.codePointAt(0)! > 0x2ff) return 1;
  return /[A-Z]/.test(character) ? 0.7 : 0.58;
}

function wrapText(value: string, width: number, fontSize: number): string[] {
  return value.split(/\r\n?|\n/).flatMap(line => {
    const characters = Array.from(line);
    const wrapped: string[] = [];
    let start = 0;
    let cursor = 0;
    let lineWidth = 0;
    let breakAt = 0;
    let breakWidth = 0;

    while (cursor < characters.length) {
      const character = characters[cursor];
      const nextWidth = glyphWidth(character) * fontSize;
      if (cursor > start && nextWidth > 0 && lineWidth + nextWidth > width) {
        const canBreakAtSpace = breakAt > start;
        const end = canBreakAtSpace ? breakAt : cursor;
        wrapped.push(characters.slice(start, end).join(''));
        start = end;
        lineWidth = canBreakAtSpace ? lineWidth - breakWidth : 0;
        continue;
      }

      cursor += 1;
      lineWidth += nextWidth;
      if (/\s/.test(character)) {
        breakAt = cursor;
        breakWidth = lineWidth;
      }
    }

    wrapped.push(characters.slice(start).join(''));
    return wrapped;
  });
}

function renderContent({ kind, width, height, data, style }: DiagramElement): string {
  if (kind === 'group') {
    const linkStyle = data.url ? ' fill="#075fa8" text-decoration="underline"' : '';
    return `<g text-anchor="start" font-weight="650"${linkStyle}>${textLine(data.name, 12, 18, style.fontSize)}</g>`;
  }

  if (kind === 'header') {
    const lines = wrapText(data.description, width - 32, style.fontSize);
    const startY = height / 2 - (lines.length * style.fontSize * 1.3) / 2;
    const columns = `<g font-weight="700">${textLine(data.lote, textPosition(width / 2, style.align, 16), startY, style.fontSize)}${textLine(data.cadena, width / 2 + textPosition(width / 2, style.align, 16), startY, style.fontSize)}</g>`;
    const description = lines.map((line, index) => textLine(line, textPosition(width, style.align, 16), startY + (index + 1) * style.fontSize * 1.3, style.fontSize)).join('');
    return columns + description;
  }

  const fields = kind === 'text'
    ? [{ value: data.text, size: style.fontSize }]
    : [{ value: data.name, size: style.fontSize }, { value: data.schedule, size: style.fontSize * 0.82 }, { value: [data.semaphore, data.value].filter(Boolean).join(' · '), size: style.fontSize * 0.78 }];
  const padding = kind === 'text' ? 0 : style.shape === 'rectangle' ? 14 : 30;
  const lines = fields.filter(field => field.value).flatMap(({ value, size }) => wrapText(value, width - 2 * padding, size).map(line => ({ value: line, size })));
  const lineHeight = style.fontSize * 1.3;
  const x = textPosition(width, style.align, Math.min(padding, width / 2));
  return lines.map(({ value, size }, index) => textLine(value, x, height / 2 + (index - (lines.length - 1) / 2) * lineHeight, size)).join('');
}

function renderElement(doc: Diagram, element: DiagramElement, index: number): string {
  const { x, y } = absolutePosition(doc, element.id);
  const { data, style, width, height } = element;
  const clip = `clip-path="url(#element-clip-${index})"`;
  const badge = data.repetitive
    ? `<circle cx="${width - 17.5}" cy="14.5" r="9.5"/><g text-anchor="middle" font-weight="800" fill="${style.fill === 'transparent' ? '#ffffff' : escapeXml(style.fill)}">${textLine('R', width - 17.5, 14.5, 11)}</g>`
    : '';

  return `<g transform="translate(${x} ${y})" fill="${escapeXml(style.color)}" font-weight="${style.bold ? 700 : 400}" text-anchor="${textAnchors[style.align]}">${renderShape(element)}<g ${clip}>${renderContent(element)}</g>${badge}</g>`;
}

export function exportSvg(doc: Diagram, options: { background: 'white' | 'transparent' }): Blob {
  const { x, y, width, height } = diagramBounds(doc);
  const ordered = orderElements(doc.elements);
  const groups: string[] = [];
  const elements: string[] = [];
  const clips = ordered.map((element, index) => {
    const layer = element.kind === 'group' ? groups : elements;
    layer.push(renderElement(doc, element, index));
    return `<clipPath id="element-clip-${index}"><rect width="${element.width}" height="${element.height}"/></clipPath>`;
  });
  const markers = doc.edges.map((edge, index) => `<marker id="export-arrow-${index}" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L10,5 L0,10 Z" fill="${escapeXml(edge.color)}"/></marker>`);
  const edges = doc.edges.map((edge, index) => `<path d="${edgePath(routeEdge(doc, edge))}" fill="none" stroke="${escapeXml(edge.color)}" stroke-width="${edge.width}" marker-end="url(#export-arrow-${index})"/>`);
  const background = options.background === 'white' ? `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="#ffffff"/>` : '';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${x} ${y} ${width} ${height}" font-family="system-ui,sans-serif"><defs>${[...clips, ...markers].join('')}</defs>${background}${groups.join('')}${edges.join('')}${elements.join('')}</svg>`;
  return new Blob([svg], { type: 'image/svg+xml' });
}
