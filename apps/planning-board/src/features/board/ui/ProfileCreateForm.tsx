import { h } from 'preact';
import { useState } from 'preact/hooks';
import { createProfile } from '../state/actions';
import './ProfileCreateForm.css';

const UserPlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/>
  </svg>
);

export function ProfileCreateForm(): h.JSX.Element {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: h.JSX.TargetedEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required'); return; }
    createProfile(name).then((id) => {
      if (id) { setName(''); setError(''); }
      else setError('Name is required');
    });
  };

  return (
    <form className="profile-create" onSubmit={handleSubmit}>
      <input
        className={`profile-create__input${error ? ' profile-create__input--error' : ''}`}
        type="text" placeholder="New profile name…" value={name} maxLength={60}
        onInput={(e) => { setName((e.target as HTMLInputElement).value); setError(''); }}
      />
      <button className="profile-create__btn" type="submit">
        <UserPlusIcon /> Add profile
      </button>
      {error && <span className="profile-create__error">{error}</span>}
    </form>
  );
}
