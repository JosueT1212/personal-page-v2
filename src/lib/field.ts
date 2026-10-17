import type { Phase } from './palette';

export type Vec = [number, number];
export type Group = 'C4' | 'D4' | 'C6' | 'D6' | 'D8';
export const GROUPS: Group[] = ['C4', 'D4', 'C6', 'D6', 'D8'];

/** Orbit of p about c. Index 0 is p itself; D_n interleaves each rotation with its reflection (as in the mock). */
export function orbit(p: Vec, c: Vec, g: Group): Vec[] {
  const n = Number(g.slice(1)), dihedral = g[0] === 'D';
  const [cx, cy] = c, vx = p[0] - cx, vy = p[1] - cy, out: Vec[] = [];
  for (let k = 0; k < n; k++) {
    const a = (2 * Math.PI * k) / n, co = Math.cos(a), s = Math.sin(a);
    out.push([cx + co * vx - s * vy, cy + s * vx + co * vy]);
    if (dihedral) out.push([cx + co * vx + s * vy, cy + s * vx - co * vy]);
  }
  return out;
}

/** Σ (q − x)·exp(−‖x−q‖²/2σ²) = −∇L · σ² for L = −Σ exp(−‖x−q‖²/2σ²). */
export function grad(x: Vec, pts: Vec[], sigma: number): Vec {
  const k = 1 / (2 * sigma * sigma);
  let gx = 0, gy = 0;
  for (const q of pts) {
    const dx = q[0] - x[0], dy = q[1] - x[1], w = Math.exp(-(dx * dx + dy * dy) * k);
    gx += dx * w; gy += dy * w;
  }
  return [gx, gy];
}

export const gridSpacing = (cssWidth: number): number => (cssWidth >= 900 ? 24 : 34);

/** Orbit centre: the mock's 0.42H on landscape/square canvases, vertically centred on portrait ones. */
export const fieldCenter = (W: number, H: number): Vec => [W * 0.5, H > W ? H * 0.5 : H * 0.42];

/** Seed angle 11.25° above the +x axis: D4/D6/D8 mirrors fall every 45°/30°/22.5°, so the
 *  widest gap is 0°–22.5° and its midpoint keeps the orbit ≥ 11.25° from every mirror (no doubled dots). */
const SEED_ANGLE = (11.25 * Math.PI) / 180;
/** Mock ring radius |(0.25, −0.08)|·m, so the square desktop hero keeps the mock's ring size. */
const SEED_RADIUS = Math.hypot(0.25, 0.08);

/** Rest point of the orbit seed, scaled by m = min(W, H) so portrait phones don't stretch it toward an axis. */
export function restPoint(W: number, H: number): Vec {
  const [cx, cy] = fieldCenter(W, H), r = SEED_RADIUS * Math.min(W, H);
  return [cx + r * Math.cos(SEED_ANGLE), cy - r * Math.sin(SEED_ANGLE)];
}

/** Idle drift of the seed around its rest point c; t in seconds, amplitudes scale with m = min(W, H). */
export const lissajous = (t: number, c: Vec, m: number): Vec =>
  [c[0] + 0.05 * m * Math.sin(0.13 * t), c[1] + 0.025 * m * Math.sin(0.17 * t)];

/** Background glows per phase. x of W, y of H, r of orbit radius R; color is "r,g,b", alpha the center opacity. All source-over. */
export type Glow = { x: number; y: number; r: number; color: string; alpha: number };
export const GLOWS: Record<Phase, Glow[]> = {
  // Verbatim from the dawn mock (cy = 0.42H).
  dawn: [
    { x: 0.5, y: 0.525, r: 1.9, color: '255,128,60', alpha: 0.62 },
    { x: 0.5, y: 0.42, r: 0.75, color: '255,150,70', alpha: 0.55 },
    { x: 0.5, y: 0.42, r: 0.3, color: '255,214,150', alpha: 0.6 },
  ],
  // White sun: higher, brighter core. Pending Josue's review (Task 10).
  midday: [
    { x: 0.5, y: 0.32, r: 1.8, color: '255,250,240', alpha: 0.32 },
    { x: 0.5, y: 0.24, r: 0.8, color: '255,253,248', alpha: 0.5 },
    { x: 0.5, y: 0.24, r: 0.32, color: '255,255,255', alpha: 0.9 },
  ],
  // Golden, lower-right. Pending review.
  afternoon: [
    { x: 0.6, y: 0.62, r: 1.8, color: '255,170,80', alpha: 0.55 },
    { x: 0.64, y: 0.52, r: 0.72, color: '255,180,95', alpha: 0.5 },
    { x: 0.64, y: 0.52, r: 0.3, color: '255,222,160', alpha: 0.68 },
  ],
  // Orange-pink ember, low and dim. Pending review.
  night: [
    { x: 0.5, y: 0.78, r: 1.7, color: '255,110,90', alpha: 0.4 },
    { x: 0.5, y: 0.7, r: 0.6, color: '255,118,92', alpha: 0.35 },
    { x: 0.5, y: 0.7, r: 0.24, color: '255,170,140', alpha: 0.5 },
  ],
};
