import { h } from 'preact';
import { viewMode } from '../state/signals';
import { setViewMode } from '../state/actions';
import './ViewToggle.css';

export function ViewToggle(): h.JSX.Element {
  return (
    <div className="view-toggle">
      <button className={`view-toggle__btn${viewMode.value === 'days' ? ' view-toggle__btn--active' : ''}`} onClick={() => setViewMode('days')}>Days</button>
      <button className={`view-toggle__btn${viewMode.value === 'weeks' ? ' view-toggle__btn--active' : ''}`} onClick={() => setViewMode('weeks')}>Weeks</button>
    </div>
  );
}
