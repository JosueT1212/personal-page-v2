import { getTimes } from 'suncalc';
import { interpolate, formatHex } from 'culori';
import { PALETTES, PHASES, type Phase } from './palette';
import src from '../scripts/phase-of.js?raw';

export type SunTable = [sunriseMin: number, sunsetMin: number][];
export const OVERRIDE_KEY = 'theme-phase';

// Same bytes as the inline script in ThemeHead, so tests run what production runs.
export const phaseOf: (d: Date, t: SunTable) => { from: Phase; to: Phase; t: number } =
  new Function(`${src}; return phaseOf;`)();

const gdlMinutes = (d: Date) => {
  const p: Record<string, number> = {};
  new Intl.DateTimeFormat('en-US', { timeZone: 'America/Mexico_City', hourCycle: 'h23', hour: 'numeric', minute: 'numeric' })
    .formatToParts(d).forEach((x) => (p[x.type] = +x.value));
  return p.hour * 60 + p.minute;
};

/** Build time only. Defaults to a leap year so all 366 slots exist. */
export function buildSunTable(year = 2024): SunTable {
  return Array.from({ length: 366 }, (_, i) => {
    const { sunrise, sunset } = getTimes(new Date(Date.UTC(year, 0, 1 + i, 18)), 20.67, -103.35);
    return [gdlMinutes(sunrise!), gdlMinutes(sunset!)];
  });
}

export function mixPalette(from: Phase, to: Phase, t: number): Record<'--hero' | '--ink' | '--label' | '--bg', string> {
  const k = ['hero', 'ink', 'label', 'bg'] as const;
  const out = {} as Record<'--hero' | '--ink' | '--label' | '--bg', string>;
  for (const key of k) {
    const a = PALETTES[from][key], b = PALETTES[to][key];
    out[`--${key}`] = t <= 0 || a === b ? a : t >= 1 ? b : formatHex(interpolate([a, b], 'oklch')(t));
  }
  return out;
}

export function readOverride(): Phase | null {
  try {
    const v = localStorage.getItem(OVERRIDE_KEY);
    return PHASES.includes(v as Phase) ? (v as Phase) : null;
  } catch { return null; }
}

export function writeOverride(p: Phase | null): void {
  try {
    if (p) localStorage.setItem(OVERRIDE_KEY, p); else localStorage.removeItem(OVERRIDE_KEY);
  } catch { /* storage unavailable */ }
}

export function nextOverride(cur: Phase | null): Phase | null {
  if (!cur) return PHASES[0];
  return PHASES[PHASES.indexOf(cur) + 1] ?? null;
}
