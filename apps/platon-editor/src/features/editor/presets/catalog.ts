import type { DiagramElement, Style } from '../model/types';

export type Preset = {
  id: string;
  label: string;
  category: 'Monitorización' | 'Planificación';
  fill: string;
  stroke: string;
  color: string;
};

const BLACK = '#000000';
const WHITE = '#ffffff';
const GRAY = '#c8c8c8';
const YELLOW = '#ffff00';
const ORANGE = '#ffa500';
const GREEN = '#00ff00';
const BLUE = '#0000ff';
const RED = '#ff0000';
const PINK = '#ffc0cb';
const MAGENTA = '#ff00ff';
const DARK_GREEN = '#008000';

export const presets: Preset[] = [
  { id: 'monitor-unscheduled', label: 'Desplanificado', category: 'Monitorización', fill: GRAY, stroke: BLACK, color: BLACK },
  { id: 'monitor-wait', label: 'Espera', category: 'Monitorización', fill: YELLOW, stroke: BLACK, color: BLACK },
  { id: 'monitor-wait-stopped-dependencies', label: 'Espera con dependencias paradas', category: 'Monitorización', fill: YELLOW, stroke: BLACK, color: BLACK },
  { id: 'monitor-ready', label: 'Preparado', category: 'Monitorización', fill: ORANGE, stroke: BLACK, color: BLACK },
  { id: 'monitor-ready-warning', label: 'Preparado excedido', category: 'Monitorización', fill: ORANGE, stroke: RED, color: BLACK },
  { id: 'monitor-running', label: 'Lanzado/Ejecución', category: 'Monitorización', fill: GREEN, stroke: BLACK, color: BLACK },
  { id: 'monitor-running-warning', label: 'Ejecución excedida', category: 'Monitorización', fill: GREEN, stroke: RED, color: BLACK },
  { id: 'monitor-completed', label: 'Terminado OK', category: 'Monitorización', fill: BLUE, stroke: BLACK, color: WHITE },
  { id: 'monitor-completed-warning', label: 'Term.Warning', category: 'Monitorización', fill: BLUE, stroke: YELLOW, color: WHITE },
  { id: 'monitor-aborted', label: 'Abortado', category: 'Monitorización', fill: RED, stroke: BLACK, color: WHITE },
  { id: 'monitor-aborting', label: 'Abortado en curso', category: 'Monitorización', fill: RED, stroke: BLACK, color: WHITE },
  { id: 'monitor-unknown', label: 'Desconocido', category: 'Monitorización', fill: RED, stroke: BLACK, color: WHITE },
  { id: 'monitor-abort-warning', label: 'Abort.Warning', category: 'Monitorización', fill: BLUE, stroke: RED, color: WHITE },
  { id: 'monitor-suspended', label: 'Suspendido', category: 'Monitorización', fill: PINK, stroke: BLACK, color: BLACK },
  { id: 'monitor-retired', label: 'Retirado', category: 'Monitorización', fill: MAGENTA, stroke: BLACK, color: BLACK },
  { id: 'monitor-skipped', label: 'Skipped', category: 'Monitorización', fill: DARK_GREEN, stroke: BLACK, color: WHITE },
  { id: 'planning-unscheduled', label: 'Desplanificado', category: 'Planificación', fill: GRAY, stroke: BLACK, color: BLACK },
  { id: 'planning-planned', label: 'Planificado', category: 'Planificación', fill: YELLOW, stroke: BLACK, color: BLACK },
  { id: 'planning-unscheduled-exception', label: 'Desplanificado con excepción', category: 'Planificación', fill: GRAY, stroke: GREEN, color: BLACK },
  { id: 'planning-planned-exception', label: 'Planificado con excepción', category: 'Planificación', fill: YELLOW, stroke: GREEN, color: BLACK },
  { id: 'planning-none', label: 'Sin planning', category: 'Planificación', fill: WHITE, stroke: BLACK, color: BLACK },
];

export function applyPreset(element: DiagramElement, presetId: string): DiagramElement {
  const preset = presets.find(candidate => candidate.id === presetId);
  if (!preset) throw new Error('Preset inexistente');
  return {
    ...element,
    style: {
      ...element.style,
      fill: preset.fill,
      stroke: preset.stroke,
      color: preset.color,
      presetId: preset.id,
    },
  };
}

export function setManualStyle(element: DiagramElement, patch: Partial<Style>): DiagramElement {
  const style = { ...element.style, ...patch };
  delete style.presetId;
  return { ...element, style };
}
