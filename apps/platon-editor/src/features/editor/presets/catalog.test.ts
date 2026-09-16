import { expect, it } from 'vitest';
import { createElement } from './elements';
import { applyPreset, setManualStyle, presets } from './catalog';
it('separa estado documental de apariencia manual', () => {
  const a = applyPreset(createElement('job', 'a', { x: 0, y: 0 }), 'monitor-abort-warning');
  expect(a.style.fill).toBe('#0000ff'); expect(a.style.stroke).toBe('#ff0000');
  expect(setManualStyle(a, { fill: '#ffffff' }).style.presetId).toBeUndefined();
  expect(new Set(presets.map(p => p.id)).size).toBe(presets.length);
});
it('usa colores hexadecimales válidos y categorías conocidas en todos los presets', () => {
  const hex = /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i;
  for (const preset of presets) {
    expect(['Monitorización', 'Planificación']).toContain(preset.category);
    for (const color of [preset.fill, preset.stroke, preset.color]) expect(color).toMatch(hex);
  }
});
