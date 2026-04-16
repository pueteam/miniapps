import { h } from 'preact';
import { createAssignment } from '../state/actions';
import { activeProfileId } from '../state/signals';
import { ExportButton } from './ExportButton';
import { ProfileCreateForm } from './ProfileCreateForm';
import './Toolbar.css';
import { ViewToggle } from './ViewToggle';
import { ZoomControl } from './ZoomControl';

const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="3" y="3" width="18" height="18" rx="3"/>
    <line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);

export function Toolbar(): h.JSX.Element {
  const hasActiveProfile = activeProfileId.value !== null;
  return (
    <div className="toolbar">
      <div className="toolbar__group">
        <ProfileCreateForm />
      </div>
      <div className="toolbar__sep" />
      <div className="toolbar__group">
        <button
          className="toolbar__btn toolbar__btn--primary"
          disabled={!hasActiveProfile}
          onClick={() => activeProfileId.value && createAssignment(activeProfileId.value)}
          title={hasActiveProfile ? "Add assignment" : "Select a profile row to add an assignment"}
        >
          <PlusIcon /> Add assignment
        </button>
        {/* {!hasActiveProfile && <span className="toolbar__hint">Select a profile row to add an assignment</span>} */}
      </div>
      <div className="toolbar__sep" />
      <div className="toolbar__group">
        <ViewToggle />
        <ZoomControl />
      </div>
      <div className="toolbar__spacer" />
      <div className="toolbar__group">
        <ExportButton />
      </div>
      <div style="width:100%" />
    </div>
  );
}
