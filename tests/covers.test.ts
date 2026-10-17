import { MOTIFS, mulberry32, tritone, luminance } from '../src/lib/covers';
import books from '../src/data/books.json';
test('every book uses a known motif', () => { for (const b of books) expect(MOTIFS).toHaveProperty(b.motif.name); });
test('seeded PRNG is deterministic', () => {
  const a = mulberry32(7), b = mulberry32(7); expect([a(), a()]).toEqual([b(), b()]);
});
test('families cover all three categories', () => {
  expect(new Set(Object.values(MOTIFS).map(m => m.family))).toEqual(new Set(['geometric', 'board', 'free']));
});
const stops: [string, string, string] = ['#0A0A12', '#3868F2', '#FFE2C8'];
test('luminance extremes', () => { expect(luminance(255, 255, 255)).toBeCloseTo(1); expect(luminance(0, 0, 0)).toBe(0); });
test('tritone hits the three stops', () => {
  expect(tritone(0, stops)).toEqual([10, 10, 18]);
  expect(tritone(0.5, stops)).toEqual([56, 104, 242]);
  expect(tritone(1, stops)).toEqual([255, 226, 200]);
});
const files = import.meta.glob('../src/assets/covers/*');
test('every book cover file exists', () => {
  for (const b of books as { cover?: string }[]) if (b.cover) expect(Object.keys(files)).toContain(`../src/assets/covers/${b.cover}`);
});
