import { MOTIFS, mulberry32 } from '../src/lib/covers';
import books from '../src/data/books.json';
test('every book uses a known motif', () => { for (const b of books) expect(MOTIFS).toHaveProperty(b.motif.name); });
test('seeded PRNG is deterministic', () => {
  const a = mulberry32(7), b = mulberry32(7); expect([a(), a()]).toEqual([b(), b()]);
});
test('families cover all three categories', () => {
  expect(new Set(Object.values(MOTIFS).map(m => m.family))).toEqual(new Set(['geometric', 'board', 'free']));
});
