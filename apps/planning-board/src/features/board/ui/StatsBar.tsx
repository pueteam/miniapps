import { h } from 'preact';
import { boardStats } from '../state/signals';
import './StatsBar.css';

export function StatsBar(): h.JSX.Element {
  const stats = boardStats.value;
  return (
    <div className="stats-bar">
      <span className="stats-bar__stat"><span className="stats-bar__dot" style={{ background: 'var(--board-accent)' }} /> <b>{stats.profileCount}</b> profiles</span>
      <span className="stats-bar__stat"><span className="stats-bar__dot" style={{ background: 'var(--board-text-3)' }} /> <b>{stats.assignmentCount}</b> assignments</span>
      <span className="stats-bar__stat"><span className="stats-bar__dot" style={{ background: 'var(--board-accent-2)' }} /> <b>{stats.avgDedicationPct}%</b> avg</span>
      <span className="stats-bar__stat"><span className="stats-bar__dot" style={{ background: 'var(--board-danger)' }} /> <b>{stats.totalEffort}</b> effort</span>
      <span className="stats-bar__meta">{stats.peakSlot ? `${stats.peakSlot.label}: ${stats.peakSlot.count}` : 'No peak'}</span>
    </div>
  );
}
