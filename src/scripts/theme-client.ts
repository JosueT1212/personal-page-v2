import { phaseOf, mixPalette, readOverride, writeOverride, nextOverride, type SunTable } from '../lib/theme';

const table: SunTable = JSON.parse(document.getElementById('sun-table')!.textContent!);

function apply() {
  const o = readOverride();
  const d = o ? { from: o, to: o, t: 0 } : phaseOf(new Date(), table);
  const el = document.documentElement;
  el.dataset.phase = d.t < 0.5 ? d.from : d.to;
  for (const [k, v] of Object.entries(mixPalette(d.from, d.to, d.t))) el.style.setProperty(k, v);
  window.dispatchEvent(new CustomEvent('themechange', { detail: d }));
}

(window as any).__cycleTheme = () => { writeOverride(nextOverride(readOverride())); apply(); };
apply();
setInterval(apply, 60_000);
