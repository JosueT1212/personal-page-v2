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
    family: 'geometric', bg: '#0b0b0b',
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

const dprOf = () => Math.min(window.devicePixelRatio || 1, 2);
const glow = (c: Ctx, W: number, H: number, mode: GlobalCompositeOperation, stop: string) => {
  c.globalCompositeOperation = mode;
  const g = c.createRadialGradient(W * 0.5, H * 0.58, 0, W * 0.5, H * 0.58, W * 0.75);
  g.addColorStop(0, stop); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'source-over';
};
// grain 22, seeded; device-pixel space
const grain = (c: Ctx, canvas: HTMLCanvasElement, rand: () => number) => {
  c.setTransform(1, 0, 0, 1, 0, 0);
  const d = c.getImageData(0, 0, canvas.width, canvas.height), p = d.data;
  for (let i = 0; i < p.length; i += 4) { const r = (rand() - 0.5) * 22; p[i] += r; p[i + 1] += r; p[i + 2] += r; }
  c.putImageData(d, 0, 0);
};

export function drawCover(canvas: HTMLCanvasElement, motif: { name: MotifName; seed?: number }): void {
  const m = MOTIFS[motif.name];
  const rand = mulberry32(motif.seed ?? hash(motif.name));
  const dpr = dprOf();
  const W = canvas.clientWidth, H = canvas.clientHeight;
  canvas.width = W * dpr; canvas.height = H * dpr;
  const c = canvas.getContext('2d', { willReadFrequently: true })!;
  c.scale(dpr, dpr);
  c.fillStyle = m.bg; c.fillRect(0, 0, W, H);
  glow(c, W, H, m.ink ? 'multiply' : 'lighter', m.ink ? 'rgba(255,170,120,0.45)' : 'rgba(255,140,60,0.35)');
  m.draw(c, W, H, rand);
  grain(c, canvas, rand);
}

export const luminance = (r: number, g: number, b: number) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

const rgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.trim().replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/** Percentile luminance bounds; span is never zero. */
export function stretchRange(lums: Float32Array | number[], loPct = 0.02, hiPct = 0.98): [number, number] {
  const a = Float32Array.from(lums).sort();
  const lo = a[Math.floor(loPct * (a.length - 1))], hi = a[Math.ceil(hiPct * (a.length - 1))];
  return hi - lo < 1e-6 ? [lo, lo + 1e-6] : [lo, hi];
}

/** 3-stop gradient map: lum 0 -> stops[0], 0.5 -> stops[1], 1 -> stops[2]. */
export function tritone(lum: number, stops: [string, string, string]): [number, number, number] {
  const [a, b, c] = stops.map(rgb);
  const [from, to, t] = lum < 0.5 ? [a, b, lum * 2] : [b, c, (lum - 0.5) * 2];
  return [0, 1, 2].map((k) => Math.round(from[k] + (to[k] - from[k]) * t)) as [number, number, number];
}

/** Real cover art in the mock's treatment: tritone (mids = mid) + 15% original + warm glow + grain. */
export function drawImageCover(canvas: HTMLCanvasElement, img: HTMLImageElement, opts: { seed: string; mid: string }): void {
  const dpr = dprOf();
  const W = canvas.clientWidth, H = canvas.clientHeight;
  canvas.width = W * dpr; canvas.height = H * dpr;
  const c = canvas.getContext('2d', { willReadFrequently: true })!;
  const s = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight) * 1.08; // 4% inset per edge: hides source borders and edge slivers
  const w = img.naturalWidth * s, h = img.naturalHeight * s;
  c.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
  const d = c.getImageData(0, 0, canvas.width, canvas.height), p = d.data;
  const stops: [string, string, string] = ['#0A0A12', opts.mid, '#FFE2C8'];
  const lums = new Float32Array(p.length / 4);
  for (let i = 0; i < lums.length; i++) lums[i] = luminance(p[i * 4], p[i * 4 + 1], p[i * 4 + 2]);
  const [lo, hi] = stretchRange(lums);
  const keep = hi - lo < 0.25 ? 0.35 : 0.15; // low-contrast art: let more of the original through
  for (let i = 0; i < lums.length; i++) {
    const t = tritone(Math.min(1, Math.max(0, (lums[i] - lo) / (hi - lo))), stops);
    for (let k = 0; k < 3; k++) p[i * 4 + k] = t[k] * (1 - keep) + p[i * 4 + k] * keep;
  }
  c.putImageData(d, 0, 0);
  c.scale(dpr, dpr);
  glow(c, W, H, 'lighter', 'rgba(255,140,60,0.35)');
  grain(c, canvas, mulberry32(hash(opts.seed)));
}
