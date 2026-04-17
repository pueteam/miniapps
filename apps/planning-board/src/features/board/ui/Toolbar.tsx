import { h } from 'preact';
import { ExportButton } from './ExportButton';
import { ProfileCreateForm } from './ProfileCreateForm';
import './Toolbar.css';
import { ViewToggle } from './ViewToggle';
import { ZoomControl } from './ZoomControl';

export function Toolbar(): h.JSX.Element {
  return (
    <div className="toolbar">
      <div className="toolbar__group">
        <ProfileCreateForm />
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
