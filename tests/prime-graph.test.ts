import { primeGraph } from '../src/lib/prime-graph';
test('nodes 2..30, primes flagged, composite edges', () => {
  const g = primeGraph(30);
  expect(g.nodes.map(n => n.k)).toEqual(Array.from({ length: 29 }, (_, i) => i + 2));
  expect(g.nodes.filter(n => n.prime).map(n => n.k)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29]);
  expect(g.edges).toContainEqual([12, 6]); expect(g.edges).toContainEqual([12, 4]);
  expect(g.edges.some(([a]) => a === 7)).toBe(false);
});
