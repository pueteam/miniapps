import { h } from 'preact';
import './SlotCell.css';

interface Props { overloaded: boolean; isMilestone?: boolean; height?: number; }

export function SlotCell({ overloaded, isMilestone = false, height }: Props): h.JSX.Element {
  const className = ['slot-cell', overloaded ? 'slot-cell--overloaded' : '', isMilestone ? 'slot-cell--milestone' : ''].filter(Boolean).join(' ');
  return <div className={className} style={height ? { height: `${height}px` } : undefined} />;
}
