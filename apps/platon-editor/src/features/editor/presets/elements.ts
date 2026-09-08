import type { DiagramElement, Kind, Point } from '../model/types';
export function createElement(kind: Kind, id: string, position: Point): DiagramElement {
  const names = { job: 'JOB', action: 'Actuación', text: '', group: 'Etiqueta', header: '' };
  return {
    id, kind, position: { ...position }, width: kind === 'group' ? 420 : kind === 'header' ? 400 : 220,
    height: kind === 'group' ? 280 : kind === 'header' ? 110 : 100,
    data: { name: names[kind], schedule: '', repetitive: false, parameters: [], annotations: '', url: '', semaphore: '', value: '', text: kind === 'text' ? 'Texto' : '', lote: '', cadena: '', description: '' },
    style: { fill: kind === 'text' || kind === 'header' ? 'transparent' : kind === 'group' ? '#f5f8fc' : '#ffffff', stroke: '#004f87', strokeWidth: kind === 'text' || kind === 'header' ? 0 : 2, color: '#172b3a', fontSize: 14, bold: false, align: 'center', shape: kind === 'action' ? 'hexagon' : 'rectangle', radius: kind === 'job' ? 10 : 0 },
  };
}
