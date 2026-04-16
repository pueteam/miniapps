import { profiles, assignments, viewMode, slotCount, slotWidth } from '../features/board/state/signals';
import { headerLabel } from '../features/board/domain/slots';
import { detectOverloads } from '../features/board/domain/overload';
import { computeAssignmentLanes, rowHeightForLaneCount } from '../features/board/domain/stacking';
import type { Assignment, Profile, ViewMode } from '../features/board/domain/types';

const OVERLOAD_BG = 'rgba(220, 53, 69, 0.08)';
const OVERLOAD_BORDER = '#dc3545';
const BAR_COLOR = '#004F87';
const GRID_COLOR = '#e9ecef';
const MUTED_COLOR = '#6c757d';
const HEADER_BG = '#f8f9fa';

interface ExportRowSnapshot {
  profile: Profile;
  rowHeight: number;
  overloadedSlots: Set<number>;
  overloadedAssignmentIds: Set<string>;
  bars: Array<{ assignment: Assignment; laneIndex: number }>;
}

interface ExportSnapshot {
  slotWidth: number;
  slotCount: number;
  rowHeaderWidth: number;
  headerHeight: number;
  barHeight: number;
  totalWidth: number;
  totalHeight: number;
  rows: ExportRowSnapshot[];
  viewMode: ViewMode;
}

export function buildExportSnapshot(
  profilesList: Profile[],
  assignmentsList: Assignment[],
  mode: ViewMode,
  count: number,
  width: number,
): ExportSnapshot {
  const rowHeaderWidth = 180;
  const headerHeight = 32;
  const barHeight = 32;
  const padding = 8;

  const rows = profilesList.map((profile) => {
    const overloads = detectOverloads(profile.id, assignmentsList, count);
    const overloadedSlots = new Set(overloads.map((item) => item.slotIndex));
    const overloadedAssignmentIds = new Set<string>();
    overloads.forEach((item) => item.assignmentIds.forEach((id) => overloadedAssignmentIds.add(id)));

    const profileAssignments = assignmentsList.filter((assignment) => assignment.profileId === profile.id);
    const lanes = computeAssignmentLanes(profileAssignments);

    return {
      profile,
      rowHeight: rowHeightForLaneCount(lanes.laneCount),
      overloadedSlots,
      overloadedAssignmentIds,
      bars: profileAssignments.map((assignment) => ({
        assignment,
        laneIndex: lanes.byId[assignment.id] ?? 0,
      })),
    };
  });

  const totalWidth = rowHeaderWidth + count * width;
  const totalHeight = headerHeight + rows.reduce((sum, row) => sum + row.rowHeight, 0) + padding;

  return { slotWidth: width, slotCount: count, rowHeaderWidth, headerHeight, barHeight, totalWidth, totalHeight, rows, viewMode: mode };
}

export function exportToPNG(): void {
  const snapshot = buildExportSnapshot(
    profiles.value,
    assignments.value,
    viewMode.value,
    slotCount.value,
    slotWidth.value,
  );

  const canvas = document.createElement('canvas');
  canvas.width = snapshot.totalWidth * 2;
  canvas.height = snapshot.totalHeight * 2;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(2, 2);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, snapshot.totalWidth, snapshot.totalHeight);

  ctx.fillStyle = HEADER_BG;
  ctx.fillRect(0, 0, snapshot.totalWidth, snapshot.headerHeight);

  ctx.fillStyle = MUTED_COLOR;
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  for (let i = 0; i < snapshot.slotCount; i++) {
    const x = snapshot.rowHeaderWidth + i * snapshot.slotWidth + snapshot.slotWidth / 2;
    ctx.fillText(headerLabel(i, snapshot.viewMode), x, snapshot.headerHeight / 2 + 4);
    ctx.strokeStyle = GRID_COLOR;
    ctx.beginPath();
    ctx.moveTo(snapshot.rowHeaderWidth + (i + 1) * snapshot.slotWidth, 0);
    ctx.lineTo(snapshot.rowHeaderWidth + (i + 1) * snapshot.slotWidth, snapshot.totalHeight);
    ctx.stroke();
  }

  ctx.strokeStyle = GRID_COLOR;
  ctx.beginPath();
  ctx.moveTo(0, snapshot.headerHeight);
  ctx.lineTo(snapshot.totalWidth, snapshot.headerHeight);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(snapshot.rowHeaderWidth, 0);
  ctx.lineTo(snapshot.rowHeaderWidth, snapshot.totalHeight);
  ctx.stroke();

  let currentY = snapshot.headerHeight;
  snapshot.rows.forEach((row) => {
    const y = currentY;
    currentY += row.rowHeight;

    ctx.fillStyle = '#212529';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'left';
    const name = row.profile.name.length > 20 ? row.profile.name.slice(0, 20) + '\u2026' : row.profile.name;
    ctx.fillText(name, 8, y + row.rowHeight / 2 + 4);

    if (row.overloadedSlots.size > 0) {
      ctx.fillStyle = OVERLOAD_BORDER;
      ctx.font = '11px sans-serif';
      ctx.fillText(`\u26a0 ${row.overloadedSlots.size} slots`, 108, y + row.rowHeight / 2 + 4);
    }

    for (let i = 0; i < snapshot.slotCount; i++) {
      const cellX = snapshot.rowHeaderWidth + i * snapshot.slotWidth;
      if (row.overloadedSlots.has(i)) {
        ctx.fillStyle = OVERLOAD_BG;
        ctx.fillRect(cellX, y, snapshot.slotWidth, row.rowHeight);
        ctx.strokeStyle = OVERLOAD_BORDER;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cellX, y);
        ctx.lineTo(cellX + snapshot.slotWidth, y);
        ctx.stroke();
        ctx.lineWidth = 1;
      }
    }

    ctx.strokeStyle = GRID_COLOR;
    ctx.beginPath();
    ctx.moveTo(0, y + row.rowHeight);
    ctx.lineTo(snapshot.totalWidth, y + row.rowHeight);
    ctx.stroke();

    row.bars.forEach(({ assignment, laneIndex }) => {
      const barX = snapshot.rowHeaderWidth + assignment.startSlot * snapshot.slotWidth;
      const barW = (assignment.endSlot - assignment.startSlot + 1) * snapshot.slotWidth;
      const barY = y + 8 + laneIndex * 38;
      const isOverloaded = row.overloadedAssignmentIds.has(assignment.id);

      ctx.fillStyle = row.profile.color || BAR_COLOR;
      ctx.beginPath();
      const r = 8;
      ctx.moveTo(barX + r, barY);
      ctx.lineTo(barX + barW - r, barY);
      ctx.quadraticCurveTo(barX + barW, barY, barX + barW, barY + r);
      ctx.lineTo(barX + barW, barY + snapshot.barHeight - r);
      ctx.quadraticCurveTo(barX + barW, barY + snapshot.barHeight, barX + barW - r, barY + snapshot.barHeight);
      ctx.lineTo(barX + r, barY + snapshot.barHeight);
      ctx.quadraticCurveTo(barX, barY + snapshot.barHeight, barX, barY + snapshot.barHeight - r);
      ctx.lineTo(barX, barY + r);
      ctx.quadraticCurveTo(barX, barY, barX + r, barY);
      ctx.fill();

      if (isOverloaded) {
        ctx.fillStyle = OVERLOAD_BORDER;
        ctx.fillRect(barX, barY, 3, snapshot.barHeight);
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      const text = `${assignment.task} \u00b7 ${assignment.dedicationPct}%`;
      const maxTextW = barW - 12;
      const measured = ctx.measureText(text);
      const truncated = measured.width > maxTextW ? ctxTruncate(ctx, text, maxTextW) : text;
      ctx.fillText(truncated, barX + 4, barY + snapshot.barHeight / 2 + 4);
    });
  });

  const now = new Date();
  const ts = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resplanner-${ts}.png`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

function ctxTruncate(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  let result = text;
  while (ctx.measureText(result + '\u2026').width > maxWidth && result.length > 0) {
    result = result.slice(0, -1);
  }
  return result + '\u2026';
}
