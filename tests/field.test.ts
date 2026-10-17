import { orbit, grad, gridSpacing, GROUPS, restPoint, fieldCenter, lissajous } from '../src/lib/field';
const rot = ([x, y]: [number, number], a: number, [cx, cy]: [number, number]): [number, number] =>
  [cx + Math.cos(a) * (x - cx) - Math.sin(a) * (y - cy), cy + Math.sin(a) * (x - cx) + Math.cos(a) * (y - cy)];
test('orbit sizes', () => {
  expect(orbit([3, 1], [0, 0], 'D6')).toHaveLength(12);
  expect(orbit([3, 1], [0, 0], 'C4')).toHaveLength(4);
});
test.each(GROUPS)('field is equivariant under rotation for %s', (g) => {
  const n = Number(g.slice(1)), c: [number, number] = [50, 40], pts = orbit([80, 30], c, g), a = 2 * Math.PI / n;
  const x: [number, number] = [61, 52];
  const lhs = grad(rot(x, a, c), pts, 12);
  const f = grad(x, pts, 12), rhs = rot([c[0] + f[0], c[1] + f[1]], a, c);
  expect(lhs[0]).toBeCloseTo(rhs[0] - c[0], 6); expect(lhs[1]).toBeCloseTo(rhs[1] - c[1], 6);
});
test('gradient points toward a single nearby point', () => {
  const [gx, gy] = grad([0, 0], [[5, 0]], 10); expect(gx).toBeGreaterThan(0); expect(gy).toBeCloseTo(0);
});
test('mobile density', () => { expect(gridSpacing(1400)).toBe(24); expect(gridSpacing(390)).toBe(34); });

// Mirror axes of D_n through c sit at multiples of 180°/n (screen angle, y down).
const axisGap = (deg: number) => Math.min(...[4, 6, 8].map((n) => {
  const s = 180 / n, r = ((deg % s) + s) % s; return Math.min(r, s - r);
}));
test.each([[1000, 1000], [360, 800], [390, 240]])('rest point off mirror axes and ring inside %ix%i', (W, H) => {
  const c = fieldCenter(W, H), p = restPoint(W, H);
  const deg = (Math.atan2(p[1] - c[1], p[0] - c[0]) * 180) / Math.PI, r = Math.hypot(p[0] - c[0], p[1] - c[1]);
  expect(axisGap(deg)).toBeGreaterThanOrEqual(8);
  expect(Math.min(c[0] - r, c[1] - r, W - c[0] - r, H - c[1] - r)).toBeGreaterThanOrEqual(12);
});
test('idle drift never crosses a mirror axis', () => {
  const W = 1000, H = 1000, c = fieldCenter(W, H);
  for (let t = 0; t < 200; t += 0.5) {
    const q = lissajous(t, restPoint(W, H), Math.min(W, H));
    expect(axisGap((Math.atan2(q[1] - c[1], q[0] - c[0]) * 180) / Math.PI)).toBeGreaterThan(2);
  }
});
