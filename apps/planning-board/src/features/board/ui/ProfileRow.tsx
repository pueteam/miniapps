import { h } from 'preact';
import { useRef, useState } from 'preact/hooks';
import { isMilestoneSlot } from '../domain/slots';
import { computeAssignmentLanes, rowHeightForLaneCount } from '../domain/stacking';
import type { Profile } from '../domain/types';
import { deleteProfile, setDeletingProfileId } from '../state/actions';
import { assignments, deletingProfileId, overloadMap } from '../state/signals';
import { AssignmentBar } from './AssignmentBar';
import { DeleteConfirm } from './DeleteConfirm';
import { ProfileEditPopover } from './ProfileEditPopover';
import './ProfileRow.css';
import { SlotCell } from './SlotCell';

interface Props { profile: Profile; slotCount: number; }

interface ActionButtonProps {
  ariaLabel: string;
  className: string;
  buttonRef?: { current: HTMLButtonElement | null };
  onClick: (event: MouseEvent) => void;
  children: h.JSX.Element;
}

function ProfileRowActionButton({ ariaLabel, className, buttonRef, onClick, children }: Readonly<ActionButtonProps>): h.JSX.Element {
  return (
    <button ref={buttonRef} className={`profile-row__action ${className}`} aria-label={ariaLabel} onClick={onClick}>
      {children}
    </button>
  );
}

export function ProfileRow({ profile, slotCount }: Readonly<Props>): h.JSX.Element {
  const isDeleting = deletingProfileId.value === profile.id;
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const editTriggerRef = useRef<HTMLButtonElement>(null);
  const overloads = overloadMap.value.get(profile.id) || [];
  const overloadedSlots = new Set(overloads.map((o) => o.slotIndex));
  const overloadedAssignmentIds = new Set(overloads.flatMap((o) => o.assignmentIds));
  const profileAssignments = assignments.value.filter((a) => a.profileId === profile.id);
  const { byId: laneByAssignmentId, laneCount } = computeAssignmentLanes(profileAssignments);
  const rowHeight = rowHeightForLaneCount(laneCount);
  const category = profile.category.trim();

  return (
    <div
      className="profile-row"
      style={{ '--row-height-current': `${rowHeight}px`, '--current-color': profile.color } as Record<string, string>}
    >
      <div className="profile-row__header">
        <div
          className="profile-row__select"
        >
          <div className="profile-row__avatar" data-len={profile.initials.length} style={{ background: profile.color }}>{profile.initials}</div>
          <div className="profile-row__identity">
            <span className="profile-row__name">{profile.name}</span>
            {category && <span className="profile-row__category">{category}</span>}
          </div>
          {overloads.length > 0 && <span className="profile-row__badge">⚠ {overloads.length} slots</span>}
        </div>
        {!isDeleting && (
          <div className="profile-row__actions">
            <ProfileRowActionButton
              ariaLabel={`Edit profile ${profile.name}`}
              className="profile-row__action--edit"
              buttonRef={editTriggerRef}
              onClick={(event) => {
                event.stopPropagation();
                setIsEditingProfile(true);
              }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 17.25V21h3.75L17.8 9.95l-3.75-3.75L3 17.25zm14.7-9.49 1.8-1.8a1 1 0 0 0 0-1.41l-1.85-1.85a1 1 0 0 0-1.41 0l-1.8 1.8 3.26 3.26z" />
              </svg>
            </ProfileRowActionButton>
            <ProfileRowActionButton
              ariaLabel={`Delete profile ${profile.name}`}
              className="profile-row__action--delete"
              onClick={(event) => {
                event.stopPropagation();
                setIsEditingProfile(false);
                setDeletingProfileId(profile.id);
              }}
            >
              <span aria-hidden="true">✕</span>
            </ProfileRowActionButton>
          </div>
        )}
        {!isDeleting && (
          <ProfileEditPopover
            profile={profile}
            isOpen={isEditingProfile}
            anchorRef={editTriggerRef}
            onClose={() => setIsEditingProfile(false)}
          />
        )}
        {isDeleting && (
          <DeleteConfirm
            onConfirm={() => { deleteProfile(profile.id); setDeletingProfileId(null); setIsEditingProfile(false); }}
            onCancel={() => setDeletingProfileId(null)}
          />
        )}
      </div>
      <div className="profile-row__slots">
        {Array.from({ length: slotCount }, (_, i) => (
          <SlotCell key={i} profileId={profile.id} slotIndex={i} overloaded={overloadedSlots.has(i)} isMilestone={isMilestoneSlot(i)} height={rowHeight} />
        ))}
        {profileAssignments.map((assignment) => (
          <AssignmentBar
            key={assignment.id}
            assignment={assignment}
            profile={profile}
            isOverloaded={overloadedAssignmentIds.has(assignment.id)}
            laneIndex={laneByAssignmentId[assignment.id] ?? 0}
            laneCount={laneCount}
          />
        ))}
      </div>
    </div>
  );
}
