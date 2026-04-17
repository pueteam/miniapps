import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { createProfile } from '../state/actions';
import './ProfileCreateForm.css';

const PROFILE_ROLE_OPTIONS = [
  'Jefe de Proyecto',
  'Arquitecto',
  'Data Engineer Senior',
  'Data Engineer Junior',
  'Data Scientist',
  'DevOps',
  'QA / Testing',
] as const;

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
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const roleSelectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isRoleMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!roleSelectorRef.current?.contains(target)) {
        setIsRoleMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isRoleMenuOpen]);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required'); return; }
    createProfile(name).then((id) => {
      if (id) { setName(''); setError(''); }
      else setError('Name is required');
    });
  };

  const handleRoleSelect = (role: string) => {
    setName(role);
    setError('');
    setIsRoleMenuOpen(false);
  };

  return (
    <form className="profile-create" onSubmit={handleSubmit}>
      <div className="profile-create__input-wrap" ref={roleSelectorRef}>
        <input
          className={`profile-create__input${error ? ' profile-create__input--error' : ''}`}
          type="text" placeholder="Role or profile name…" value={name} maxLength={60}
          onInput={(e) => { setName((e.target as HTMLInputElement).value); setError(''); }}
          onFocus={() => setIsRoleMenuOpen(false)}
        />
        <button
          type="button"
          className="profile-create__toggle"
          aria-label="Show role suggestions"
          aria-haspopup="menu"
          aria-expanded={isRoleMenuOpen}
          onClick={() => setIsRoleMenuOpen((open) => !open)}
        >
          ▾
        </button>
        {isRoleMenuOpen && (
          <ul className="profile-create__menu" aria-label="Profile role suggestions">
            {PROFILE_ROLE_OPTIONS.map((role) => (
              <li key={role}>
                <button
                  type="button"
                  className="profile-create__menu-item"
                  onClick={() => handleRoleSelect(role)}
                >
                  {role}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button className="profile-create__btn" type="submit">
        <UserPlusIcon /> Add profile
      </button>
      {error && <span className="profile-create__error">{error}</span>}
    </form>
  );
}
