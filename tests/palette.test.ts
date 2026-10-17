import { PALETTES, PHASES, GRAY, contrast } from '../src/lib/palette';
test('ink and label meet AA on page bg in every phase', () => {
  for (const p of PHASES) {
    expect(contrast(PALETTES[p].ink, PALETTES[p].bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(PALETTES[p].label, PALETTES[p].bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(GRAY, PALETTES[p].bg)).toBeGreaterThanOrEqual(4.5);
  }
});
test('white hero text meets AA-large on every hero bg', () => {
  for (const p of PHASES) expect(contrast('#FFFFFF', PALETTES[p].hero)).toBeGreaterThanOrEqual(3);
});
test('contrast is symmetric and known', () => {
  expect(contrast('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
});
