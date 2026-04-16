import { h } from 'preact';
import { profiles, viewMode, slotCount, slotWidth, currentSlot, assignments, contextMenuTarget } from '../state/signals';
import { isMilestoneSlot } from '../domain/slots';
import { computeAssignmentLanes, rowHeightForLaneCount } from '../domain/stacking';
import { SlotHeader } from './SlotHeader';
import { ProfileRow } from './ProfileRow';
import './SchedulerPane.css';

export function SchedulerPane(): h.JSX.Element {
  const count = slotCount.value;
  const mode = viewMode.value;
  const width = slotWidth.value;
  const visibleCurrentSlot = currentSlot.value !== null && currentSlot.value >= 0 && currentSlot.value < count
    ? currentSlot.value : null;
  const bodyHeight = profiles.value.reduce((total, profile) => {
    const profileAssignments = assignments.value.filter((a) => a.profileId === profile.id);
    const { laneCount } = computeAssignmentLanes(profileAssignments);
    return total + rowHeightForLaneCount(laneCount);
  }, 0);

  return (
    <div className="scheduler-pane" onScroll={() => { contextMenuTarget.value = null; }}>
      <div className="scheduler-pane__header">
        <div className="scheduler-pane__corner">
          <span className="scheduler-pane__corner-label">Profiles</span>
        </div>
        {Array.from({ length: count }, (_, i) => (
          <SlotHeader key={i} slotIndex={i} viewMode={mode} isCurrent={visibleCurrentSlot === i} isMilestone={isMilestoneSlot(i)} />
        ))}
      </div>
      <div className="scheduler-pane__body" style={{ minHeight: `${bodyHeight}px` }}>
        {profiles.value.length === 0 ? (
          <div className="scheduler-pane__empty">No profiles yet. Add one above.</div>
        ) : (
          profiles.value.map((profile) => (
            <ProfileRow key={profile.id} profile={profile} slotCount={count} />
          ))
        )}
      </div>
    </div>
  );
}
