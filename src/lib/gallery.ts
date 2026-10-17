/** Chunks of 7: one golden spiral per chunk (13, 8, 5, 3, 2, 1, 1). */
export function spirals<T>(items: T[]): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += 7) out.push(items.slice(i, i + 7));
  return out;
}
/** Grid-area per slot within a spiral. */
export const SLOTS = ['a', 'b', 'c', 'd', 'f', 'g', 'h'] as const;
