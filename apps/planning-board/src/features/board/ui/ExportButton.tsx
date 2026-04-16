import { h } from 'preact';
import { exportToPNG } from '../../../app/exportPNG';
import './ExportButton.css';

const DownloadIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

export function ExportButton(): h.JSX.Element {
  return (
    <button className="toolbar__btn toolbar__btn--primary" onClick={exportToPNG}>
      <DownloadIcon /> Export PNG
    </button>
  );
}
