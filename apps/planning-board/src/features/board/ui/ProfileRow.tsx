import { h } from 'preact';
import { overloadMap, activeProfileId, deletingProfileId, assignments } from '../state/signals';
import { setActiveProfileId, setDeletingProfileId, deleteProfile, updateProfile } from '../state/actions';
import { computeAssignmentLanes, rowHeightForLaneCount } from '../domain/stacking';
import { isMilestoneSlot } from '../domain/slots';
import { SlotCell } from './SlotCell';
import { AssignmentBar } from './AssignmentBar';
import { DeleteConfirm } from './DeleteConfirm';
import type { Profile } from '../domain/types';
import './ProfileRow.css';

interface Props { profile: Profile; slotCount: number; }

export function ProfileRow({ profile, slotCount }: Props): h.JSX.Element {
  const isActive = activeProfileId.value === profile.id;
  const isDeleting = deletingProfileId.value === profile.id;
  const overloads = overloadMap.value.get(profile.id) || [];
  const overloadedSlots = new Set(overloads.map((o) => o.slotIndex));
  const overloadedAssignmentIds = new Set(overloads.flatMap((o) => o.assignmentIds));
  const profileAssignments = assignments.value.filter((a) => a.profileId === profile.id);
  const { byId: laneByAssignmentId, laneCount } = computeAssignmentLanes(profileAssignments);
  const rowHeight = rowHeightForLaneCount(laneCount);
  const category = profile.category.trim();

  return (
    <div
      className={`profile-row ${isActive ? 'profile-row--active' : ''}`}
      role="button" tabIndex={0}
      aria-label={`Select profile ${profile.name}`}
      aria-pressed={isActive}
      onClick={() => setActiveProfileId(profile.id)}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveProfileId(profile.id); }
      }}
      style={{ '--row-height-current': `${rowHeight}px`, '--current-color': profile.color } as Record<string, string>}
    >
      <div className="profile-row__header">
        <div className="profile-row__avatar" style={{ background: profile.color }}>{profile.initials}</div>
        <div className="profile-row__identity">
          <span className="profile-row__name">{profile.name}</span>
          {category && <span className="profile-row__category">{category}</span>}
        </div>
        {overloads.length > 0 && <span className="profile-row__badge">⚠ {overloads.length} slots</span>}
        {isActive && (
          <>
            <input
              aria-label={`Edit initials for ${profile.name}`}
              className="profile-row__initials-input"
              defaultValue={profile.initials} maxLength={2}
              onBlur={(e) => updateProfile(profile.id, { initials: (e.currentTarget as HTMLInputElement).value })}
              onClick={(e) => e.stopPropagation()}
            />
            <input
              aria-label={`Edit color for ${profile.name}`}
              className="profile-row__color-input"
              type="color" value={profile.color}
              onInput={(e) => updateProfile(profile.id, { color: (e.currentTarget as HTMLInputElement).value })}
              onClick={(e) => e.stopPropagation()}
            />
          </>
        )}
        {!isDeleting && (
          <button className="profile-row__delete" aria-label={`Delete profile ${profile.name}`}
            onClick={(e) => { e.stopPropagation(); setDeletingProfileId(profile.id); }}>✕</button>
        )}
        {isDeleting && (
          <DeleteConfirm
            onConfirm={() => { deleteProfile(profile.id); setDeletingProfileId(null); }}
            onCancel={() => setDeletingProfileId(null)}
          />
        )}
      </div>
      <div className="profile-row__slots">
        {Array.from({ length: slotCount }, (_, i) => (
          <SlotCell key={i} overloaded={overloadedSlots.has(i)} isMilestone={isMilestoneSlot(i)} height={rowHeight} />
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
