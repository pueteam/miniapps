import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BOARD_DEFAULTS } from '../domain/constants';

describe('persisted board preferences', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    document.documentElement.style.removeProperty('--slot-width');
  });

  it('hydrates slot width and slot count from localStorage', async () => {
    localStorage.setItem('slotWidth', '72');
    localStorage.setItem('slotCount', '48');

    const signals = await import('./signals');

    expect(signals.slotWidth.value).toBe(72);
    expect(signals.slotCount.value).toBe(48);
  });

  it('persists slot width changes to localStorage and css custom properties', async () => {
    const signals = await import('./signals');

    signals.slotWidth.value = 84;

    expect(localStorage.getItem('slotWidth')).toBe('84');
    expect(document.documentElement.style.getPropertyValue('--slot-width')).toBe('84px');
  });

  it('clamps invalid stored preferences during hydration', async () => {
    localStorage.setItem('slotWidth', '999');
    localStorage.setItem('slotCount', '1');

    const signals = await import('./signals');

    expect(signals.slotWidth.value).toBe(110);
    expect(signals.slotCount.value).toBe(5);
  });

  it('uses shared board defaults when persisted values are missing or invalid', async () => {
    localStorage.setItem('slotWidth', 'NaN');

    const signals = await import('./signals');

    expect(signals.slotWidth.value).toBe(BOARD_DEFAULTS.SLOT_WIDTH_DEFAULT);
    expect(signals.slotCount.value).toBe(BOARD_DEFAULTS.SLOT_COUNT_DEFAULT);
  });
});
