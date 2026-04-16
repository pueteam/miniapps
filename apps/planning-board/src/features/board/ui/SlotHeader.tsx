import { h } from 'preact';
import { headerLabel } from '../domain/slots';
import type { ViewMode } from '../domain/types';
import './SlotHeader.css';

interface Props { slotIndex: number; viewMode: ViewMode; isCurrent?: boolean; isMilestone?: boolean; }

export function SlotHeader({ slotIndex, viewMode, isCurrent = false, isMilestone = false }: Props): h.JSX.Element {
  const className = ['slot-header', isMilestone ? 'slot-header--milestone' : '', isCurrent ? 'slot-header--current' : ''].filter(Boolean).join(' ');
  return <div className={className}>{headerLabel(slotIndex, viewMode)}</div>;
}
