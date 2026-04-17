import { h } from 'preact';
import { BOARD_DEFAULTS } from '../domain/constants';
import { slotCount, slotWidth } from '../state/signals';
import './ZoomControl.css';

export function ZoomControl(): h.JSX.Element {
  return (
    <div className="zoom-control">
      <span className="zoom-control__label">Slots</span>
      <input
        aria-label="Slot count"
        className="zoom-control__number"
        type="number"
        min={BOARD_DEFAULTS.SLOT_COUNT_MIN}
        max={BOARD_DEFAULTS.SLOT_COUNT_MAX}
        step={1}
        value={slotCount.value}
        onInput={(e) => {
          slotCount.value = Math.max(BOARD_DEFAULTS.SLOT_COUNT_MIN, Math.min(BOARD_DEFAULTS.SLOT_COUNT_MAX, Number((e.currentTarget as HTMLInputElement).value)));
        }}
      />
      <span className="zoom-control__label">Width</span>
      <input
        aria-label="Slot width"
        className="zoom-control__slider"
        type="range"
        min={BOARD_DEFAULTS.SLOT_WIDTH_MIN}
        max={BOARD_DEFAULTS.SLOT_WIDTH_MAX}
        step={2}
        value={slotWidth.value}
        onInput={(e) => { slotWidth.value = Number((e.currentTarget as HTMLInputElement).value); }}
      />
    </div>
  );
}
