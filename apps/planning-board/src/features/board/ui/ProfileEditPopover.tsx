import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
import { h } from 'preact';
import { createPortal } from 'preact/compat';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { Profile } from '../domain/types';
import { updateProfile } from '../state/actions';
import './ProfileEditPopover.css';

interface Props {
  profile: Profile;
  isOpen: boolean;
  anchorRef: { current: HTMLElement | null };
  onClose: () => void;
}

type EditableField = 'name' | 'initials';

interface ProfileDraft {
  name: string;
  initials: string;
  color: string;
}

const TEXT_FIELDS: Array<{ key: EditableField; label: string; maxLength: number }> = [
  { key: 'name', label: 'Role / profile name', maxLength: 60 },
  { key: 'initials', label: 'Avatar text', maxLength: 3 },
];

export function ProfileEditPopover({ profile, isOpen, anchorRef, onClose }: Props): h.JSX.Element | null {
  const popoverRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<ProfileDraft>({
    name: profile.name,
    initials: profile.initials,
    color: profile.color,
  });

  useEffect(() => {
    if (!isOpen) return;
    setDraft({
      name: profile.name,
      initials: profile.initials,
      color: profile.color,
    });
  }, [isOpen, profile.id, profile.name, profile.initials, profile.color]);

  useEffect(() => {
    if (!isOpen || !popoverRef.current || !anchorRef.current) return;

    const updatePos = async () => {
      if (!popoverRef.current || !anchorRef.current) return;
      const { x, y } = await computePosition(anchorRef.current, popoverRef.current, {
        strategy: 'fixed',
        placement: 'bottom-end',
        middleware: [offset(8), flip(), shift({ padding: 8 })],
      });
      if (popoverRef.current) {
        popoverRef.current.style.left = `${x}px`;
        popoverRef.current.style.top = `${y}px`;
      }
    };

    void updatePos();
    return autoUpdate(anchorRef.current, popoverRef.current, updatePos);
  }, [anchorRef, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!popoverRef.current?.contains(target) && !anchorRef.current?.contains(target)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [anchorRef, isOpen, onClose]);

  const isNameEmpty = useMemo(() => draft.name.trim().length === 0, [draft.name]);

  if (!isOpen) return null;

  return createPortal(
    <dialog
      ref={popoverRef}
      className="profile-edit-popover"
      open
      aria-label={`Edit profile ${profile.name}`}
      style={{ left: '0px', top: '0px' }}
    >
      <form
        className="profile-edit-popover__form"
        onSubmit={(event) => {
          event.preventDefault();
          if (isNameEmpty) return;
          void updateProfile(profile.id, {
            name: draft.name.trim(),
            initials: draft.initials.slice(0, 3).trim().toUpperCase(),
            color: draft.color,
          });
          onClose();
        }}
      >
        <label className="profile-edit-popover__field">
          <span className="profile-edit-popover__label">Role / profile name</span>
          <input
            className="profile-edit-popover__input"
            aria-label="Role / profile name"
            type="text"
            value={draft.name}
            maxLength={60}
            onInput={(event) => {
              setDraft((current) => ({ ...current, name: event.currentTarget.value }));
            }}
          />
        </label>

        <div className="profile-edit-popover__row">
          <label className="profile-edit-popover__field profile-edit-popover__field--grow">
            <span className="profile-edit-popover__label">Avatar text</span>
            <input
              className="profile-edit-popover__input"
              aria-label="Avatar text"
              type="text"
              value={draft.initials}
              maxLength={3}
              onInput={(event) => {
                setDraft((current) => ({ ...current, initials: event.currentTarget.value }));
              }}
            />
          </label>
          <label className="profile-edit-popover__field profile-edit-popover__field--color">
            <span className="profile-edit-popover__label">Color</span>
            <input
              className="profile-edit-popover__color"
              aria-label="Color"
              type="color"
              value={draft.color}
              onInput={(event) => {
                setDraft((current) => ({ ...current, color: event.currentTarget.value }));
              }}
            />
          </label>
        </div>

        <div className="profile-edit-popover__actions">
          <button type="button" className="profile-edit-popover__btn profile-edit-popover__btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="profile-edit-popover__btn profile-edit-popover__btn--primary"
            disabled={isNameEmpty}
            aria-label="Save profile changes"
          >
            Save
          </button>
        </div>
      </form>
    </dialog>,
    document.body,
  );
}
