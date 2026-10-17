import { primes, latest, STATUS_LABEL } from '../src/lib/content';
test('primes', () => expect(primes(6)).toEqual([2, 3, 5, 7, 11, 13]));
test('latest sorts newest first and truncates', () => {
  const mk = (d: string) => ({ data: { date: new Date(d) } });
  expect(latest([mk('2026-01-01'), mk('2026-03-01'), mk('2026-02-01')], 2).map(x => x.data.date.getUTCMonth())).toEqual([2, 1]);
});
test('status labels', () => expect(STATUS_LABEL['in-progress']).toBe('In progress'));
