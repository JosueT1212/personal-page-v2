import { spirals } from '../src/lib/gallery';
test('chunks of seven', () => {
  expect(spirals([...Array(16).keys()]).map(s => s.length)).toEqual([7, 7, 2]);
  expect(spirals([])).toEqual([]);
});
