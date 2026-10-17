/** Port of the mock's prime-graph IIFE: layers by Ω(k), edge k → k/p for each prime p | k. Nodes lie in a 220×180 box. */
const isPrime = (k: number) => { if (k < 2) return false; for (let d = 2; d * d <= k; d++) if (k % d === 0) return false; return true; };
const omega = (k: number) => { let c = 0; for (let d = 2; k > 1;) if (k % d === 0) { k /= d; c++; } else d++; return c; };

export function primeGraph(N: number) {
  const layers = new Map<number, number[]>();
  for (let k = 2; k <= N; k++) { const o = omega(k); layers.set(o, [...(layers.get(o) ?? []), k]); }
  const L = layers.size, top = 10, bot = 166, pos = new Map<number, [number, number]>();
  for (const [o, ks] of layers) {
    const y = bot - (o - 1) * (bot - top) / Math.max(L - 1, 1);
    ks.forEach((k, i) => pos.set(k, [12 + (i + 0.5) * (196 / ks.length), y]));
  }
  const nodes = [...pos.keys()].sort((a, b) => a - b).map(k => ({ k, x: pos.get(k)![0], y: pos.get(k)![1], prime: isPrime(k) }));
  const edges: [number, number][] = [];
  for (let k = 2; k <= N; k++) if (!isPrime(k)) for (let p = 2; p <= k; p++) if (isPrime(p) && k % p === 0) edges.push([k, k / p]);
  return { nodes, edges };
}
