import { phaseOf, mixPalette, readOverride, writeOverride, nextOverride } from '../src/lib/theme';
const T: [number, number][] = Array.from({ length: 366 }, () => [7 * 60, 19 * 60]); // sunrise 07:00, sunset 19:00
const gdl = (hh: number, mm: number) => new Date(Date.UTC(2026, 9, 17, hh + 6, mm)); // GDL = UTC-6

test('mid-phase is pure', () => {
  expect(phaseOf(gdl(12, 0), T)).toEqual({ from: 'midday', to: 'midday', t: 0 });
  expect(phaseOf(gdl(2, 0), T)).toEqual({ from: 'night', to: 'night', t: 0 });
});
test('blend centered on boundary', () => {
  expect(phaseOf(gdl(9, 30), T)).toEqual({ from: 'dawn', to: 'midday', t: 0.5 });
  const r = phaseOf(gdl(6, 45), T);
  expect(r.from).toBe('night'); expect(r.to).toBe('dawn'); expect(r.t).toBeCloseTo(0.25);
  expect(phaseOf(gdl(19, 30), T)).toEqual({ from: 'night', to: 'night', t: 0 });
});
test('uses Guadalajara clock, not host timezone', () => {
  // 16:00 UTC = 10:00 GDL = 09:00 San Francisco (PDT); must be midday
  expect(phaseOf(new Date(Date.UTC(2026, 9, 17, 16, 0)), T).from).toBe('midday');
});
test('mixPalette endpoints are exact palette colors', () => {
  expect(mixPalette('dawn', 'midday', 0)['--hero'].toLowerCase()).toBe('#3868f2');
  expect(mixPalette('dawn', 'midday', 1)['--hero'].toLowerCase()).toBe('#0a6cff');
});
test('override storage never throws', () => {
  const bad = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); }, removeItem() { throw new Error('denied'); } };
  vi.stubGlobal('localStorage', bad);
  expect(readOverride()).toBeNull();
  expect(() => writeOverride('night')).not.toThrow();
  vi.unstubAllGlobals();
});
test('override cycles through auto', () => {
  expect(nextOverride(null)).toBe('dawn');
  expect(nextOverride('night')).toBeNull();
});
