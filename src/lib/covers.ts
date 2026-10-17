export type MotifName = 'vesica' | 'nestedSquares' | 'primeSpiral' | 'cayley' | 'knightTour' | 'waves';
type Ctx = CanvasRenderingContext2D;
export interface Motif {
  family: 'geometric' | 'board' | 'free';
  bg: string;
  ink?: string;
  draw(c: Ctx, W: number, H: number, rand: () => number): void;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hash = (s: string) => { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; };

// Ported verbatim from docs/mocks/josue-homepage-dawn.html (books array).
export const MOTIFS: Record<MotifName, Motif> = {
  vesica: {
    family: 'geometric', bg: '#3868f2',
    draw(c, W, H) {
      c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 1.2;
      const r = W * 0.28, y = H * 0.58;
      [[W / 2 - r / 2, y], [W / 2 + r / 2, y]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, r, 0, 7); c.stroke(); });
      c.beginPath(); c.moveTo(W / 2 - r / 2, y); c.lineTo(W / 2 + r / 2, y); c.lineTo(W / 2, y - r * 0.866); c.closePath(); c.stroke();
    },
  },
  nestedSquares: {
    family: 'geometric', bg: '#ff6a1f',
    draw(c, W, H) {
      c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 1.1;
      let s = W * 0.7;
      for (let i = 0; i < 14; i++) { c.save(); c.translate(W / 2, H * 0.58); c.rotate(i * 0.18); c.strokeRect(-s / 2, -s / 2, s, s); c.restore(); s *= 0.86; }
    },
  },
  primeSpiral: {
    family: 'free', bg: '#0b0b0b',
    draw(c, W, H) {
      let x = 0, y = 0, dx = 1, dy = 0, seg = 1, st = 0, turn = 0;
      const cell = 5, ox = W / 2, oy = H * 0.58;
      const isP = (k: number) => { if (k < 2) return 0; for (let d = 2; d * d <= k; d++) if (k % d === 0) return 0; return 1; };
      for (let k = 1; k < 1600; k++) {
        if (isP(k)) { c.fillStyle = '#ff6a1f'; c.fillRect(ox + x * cell - 1.5, oy + y * cell - 1.5, 3, 3); }
        x += dx; y += dy;
        if (++st === seg) { st = 0; [dx, dy] = [-dy, dx]; if (++turn % 2 === 0) seg++; }
      }
    },
  },
  knightTour: {
    family: 'board', bg: '#e9e6df', ink: '#000',
    draw(c, W, H) {
      const s = W * 0.09, ox = W / 2 - 4 * s, oy = H * 0.58 - 4 * s;
      for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) if ((i + j) % 2) { c.fillStyle = '#3868f2'; c.fillRect(ox + i * s, oy + j * s, s, s); }
      c.strokeStyle = '#ff6a1f'; c.lineWidth = 2; c.beginPath();
      const tour = [[0, 0], [1, 2], [2, 4], [0, 5], [1, 7], [3, 6], [5, 7], [7, 6], [6, 4], [7, 2], [6, 0], [4, 1], [2, 0], [3, 2], [4, 4]];
      tour.forEach(([i, j], k) => { const X = ox + (i + 0.5) * s, Y = oy + (j + 0.5) * s; k ? c.lineTo(X, Y) : c.moveTo(X, Y); });
      c.stroke();
    },
  },
  waves: {
    family: 'free', bg: '#3868f2',
    draw(c, W, H) {
      c.lineWidth = 1;
      for (let k = 0; k < 16; k++) {
        c.strokeStyle = `rgba(255,${150 + k * 6},${120 - k * 4},.8)`; c.beginPath();
        for (let x = 0; x <= W; x += 2) {
          const y = H * 0.58 + Math.sin(x * 0.05 + k * 0.4) * Math.exp(-Math.pow((x - W / 2) / (W * 0.3), 2)) * (30 + k * 2) + (k - 8) * 6;
          x ? c.lineTo(x, y) : c.moveTo(x, y);
        }
        c.stroke();
      }
    },
  },
  cayley: {
    family: 'geometric', bg: '#ff6a1f',
    draw(c, W, H) {
      const n = 8, cx = W / 2, cy = H * 0.58, R = W * 0.32;
      const P = (k: number): [number, number] => [cx + R * Math.cos(2 * Math.PI * k / n - Math.PI / 2), cy + R * Math.sin(2 * Math.PI * k / n - Math.PI / 2)];
      c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 1.2;
      for (let k = 0; k < n; k++) {
        const a = P(k), b = P(k + 1), d = P(k + 3);
        c.beginPath(); c.moveTo(...a); c.lineTo(...b); c.stroke();
        c.setLineDash([3, 3]); c.beginPath(); c.moveTo(...a); c.lineTo(...d); c.stroke(); c.setLineDash([]);
      }
      c.fillStyle = '#fff';
      for (let k = 0; k < n; k++) { const a = P(k); c.beginPath(); c.arc(a[0], a[1], 3.5, 0, 7); c.fill(); }
    },
  },
};

export function drawCover(canvas: HTMLCanvasElement, motif: { name: MotifName; seed?: number }): void {
  const m = MOTIFS[motif.name];
  const rand = mulberry32(motif.seed ?? hash(motif.name));
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = canvas.clientWidth, H = canvas.clientHeight;
  canvas.width = W * dpr; canvas.height = H * dpr;
  const c = canvas.getContext('2d')!;
  c.scale(dpr, dpr);
  c.fillStyle = m.bg; c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = m.ink ? 'multiply' : 'lighter';
  const g = c.createRadialGradient(W * 0.5, H * 0.58, 0, W * 0.5, H * 0.58, W * 0.75);
  g.addColorStop(0, m.ink ? 'rgba(255,170,120,0.45)' : 'rgba(255,140,60,0.35)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'source-over';
  m.draw(c, W, H, rand);
  // grain 22, seeded; device-pixel space
  c.setTransform(1, 0, 0, 1, 0, 0);
  const d = c.getImageData(0, 0, canvas.width, canvas.height), p = d.data;
  for (let i = 0; i < p.length; i += 4) { const r = (rand() - 0.5) * 22; p[i] += r; p[i + 1] += r; p[i + 2] += r; }
  c.putImageData(d, 0, 0);
}
