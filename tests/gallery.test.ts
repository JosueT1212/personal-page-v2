import { spirals, resolvePhoto } from '../src/lib/gallery';
test('chunks of seven', () => {
  expect(spirals([...Array(16).keys()]).map(s => s.length)).toEqual([7, 7, 2]);
  expect(spirals([])).toEqual([]);
});
test('resolvePhoto matches extensions case-insensitively and rejects HEIC', () => {
  const files = { '/src/assets/gallery/IMG_1.JPG': 1, '/src/assets/gallery/b.webp': 2 };
  expect(resolvePhoto('IMG_1.jpg', files)).toBe(1);
  expect(resolvePhoto('b.webp', files)).toBe(2);
  expect(() => resolvePhoto('IMG_2.HEIC', files)).toThrow(/HEIC isn't supported — export as JPG/);
  expect(() => resolvePhoto('missing.png', files)).toThrow(/not found/);
});
