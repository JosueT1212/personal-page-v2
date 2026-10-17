import { PHASES, type Phase } from '../lib/palette';
import { phaseOf, mixPalette, readOverride, writeOverride, nextOverride, type SunTable } from '../lib/theme';

const table: SunTable = JSON.parse(document.getElementById('sun-table')!.textContent!);

function apply() {
  // Dev-only review hook: ?phase=dawn|midday|afternoon|night (stripped from production builds).
  const q = import.meta.env.DEV ? new URLSearchParams(location.search).get('phase') : null;
  const o = PHASES.includes(q as Phase) ? (q as Phase) : readOverride();
  const d = o ? { from: o, to: o, t: 0 } : phaseOf(new Date(), table);
  const el = document.documentElement;
  el.dataset.phase = d.t < 0.5 ? d.from : d.to;
  for (const [k, v] of Object.entries(mixPalette(d.from, d.to, d.t))) el.style.setProperty(k, v);
  (window as any).__themeDetail = d; // fields mounted after this event read it on mount
  window.dispatchEvent(new CustomEvent('themechange', { detail: d }));
}

(window as any).__cycleTheme = () => { writeOverride(nextOverride(readOverride())); apply(); };
apply();
setInterval(apply, 60_000);
