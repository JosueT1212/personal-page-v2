import { orbit, grad, gridSpacing, GROUPS } from '../src/lib/field';
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
