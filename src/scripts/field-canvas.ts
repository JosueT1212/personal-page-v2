import { orbit, gridSpacing, lissajous, restPoint as seedRest, fieldCenter, GLOWS, type Group, type Vec, type Glow } from '../lib/field';
import { PHASES, type Phase } from '../lib/palette';

type Opts = { group?: Group; sigmaFrac?: number; interactive?: boolean };
type Theme = { from: Phase; to: Phase; t: number };

const BUCKETS = 6;
const IDLE_MS = 3000;

/** Two opaque 256² tiles splitting the mock's additive ±13 grain: [lift, sink], each pixel's |r| in one, 0 in the other. */
function grainTiles(): [HTMLCanvasElement, HTMLCanvasElement] {
  const tiles = [0, 1].map(() => { const t = document.createElement('canvas'); t.width = t.height = 256; return t; });
  const [lift, sink] = tiles.map((t) => t.getContext('2d')!.createImageData(256, 256));
  for (let i = 0; i < lift.data.length; i += 4) {
    const r = (Math.random() - 0.5) * 26, d = r > 0 ? lift.data : sink.data;
    d[i] = d[i + 1] = d[i + 2] = Math.abs(r);
    lift.data[i + 3] = sink.data[i + 3] = 255;
  }
  tiles[0].getContext('2d')!.putImageData(lift, 0, 0);
  tiles[1].getContext('2d')!.putImageData(sink, 0, 0);
  return tiles as [HTMLCanvasElement, HTMLCanvasElement];
}

function radial(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, alpha: number) {
  if (r <= 0 || alpha <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${color},${alpha})`);
  g.addColorStop(1, `rgba(${color},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
}

function initialTheme(): Theme {
  const last = window.__themeDetail; // themechange may fire before mount
  if (last) return last;
  const p = document.documentElement.dataset.phase as Phase | undefined;
  const ph = p && PHASES.includes(p) ? p : 'dawn';
  return { from: ph, to: ph, t: 0 };
}

export function mountField(canvas: HTMLCanvasElement, opts: Opts = {}) {
  const ctx = canvas.getContext('2d')!;
  let group: Group = opts.group ?? 'D6';
  let sigmaFrac = opts.sigmaFrac ?? 0.09;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [lift, sink] = grainTiles().map((t) => ctx.createPattern(t, 'repeat')!);

  let W = 0, H = 0, dpr = 1;
  let theme = initialTheme();
  let hero = getComputedStyle(document.documentElement).getPropertyValue('--hero').trim() || '#3868f2';
  let p: Vec = [0, 0], target: Vec | null = null, lastMove = -Infinity;
  let visible = true, raf = 0;

  const center = (): Vec => fieldCenter(W, H);
  const restPoint = (): Vec => seedRest(W, H);

  function draw(now: number) {
    if (!W || !H) return;
    const c = center();
    // ponytail: fixed reference radius (mock geometry) so glows don't collapse as the point nears the center
    const R = Math.hypot(0.25 * W, 0.08 * H);
    const sigma = sigmaFrac * Math.min(W, H), k = 1 / (2 * sigma * sigma);

    if (reduced) p = restPoint();
    else {
      const goal = target && now - lastMove < IDLE_MS ? target : lissajous(now / 1000, restPoint(), Math.min(W, H));
      p = [p[0] + (goal[0] - p[0]) * 0.15, p[1] + (goal[1] - p[1]) * 0.15];
    }
    const pts = orbit(p, c, group);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.fillStyle = hero;
    ctx.fillRect(0, 0, W, H);

    const layer = (gs: Glow[], w: number) => {
      if (w > 0) for (const g of gs) radial(ctx, g.x * W, g.y * H, g.r * R, g.color, g.alpha * w);
    };
    if (theme.from === theme.to) layer(GLOWS[theme.to], 1);
    else { layer(GLOWS[theme.from], 1 - theme.t); layer(GLOWS[theme.to], theme.t); }
    for (const q of pts) radial(ctx, q[0], q[1], 34, '255,140,60', 0.55);

    // Arrows, batched into alpha buckets.
    const paths = Array.from({ length: BUCKETS }, () => new Path2D());
    const sp = gridSpacing(window.innerWidth);
    for (let y = sp / 2; y < H; y += sp) for (let x = sp / 2; x < W; x += sp) {
      let gx = 0, gy = 0;
      for (const q of pts) {
        const dx = q[0] - x, dy = q[1] - y, w = Math.exp(-(dx * dx + dy * dy) * k);
        gx += dx * w; gy += dy * w;
      }
      const m = Math.hypot(gx, gy);
      if (m < 0.05) continue;
      const ux = gx / m, uy = gy / m, L = 10 * Math.tanh(m / 18), x1 = x + (ux * L) / 2, y1 = y + (uy * L) / 2;
      const path = paths[Math.min(BUCKETS - 1, Math.floor(Math.tanh(m / 30) * BUCKETS))];
      path.moveTo(x - (ux * L) / 2, y - (uy * L) / 2); path.lineTo(x1, y1);
      path.moveTo(x1 - ux * 3.2 + uy * 2.3, y1 - uy * 3.2 - ux * 2.3); path.lineTo(x1, y1);
      path.lineTo(x1 - ux * 3.2 - uy * 2.3, y1 - uy * 3.2 + ux * 2.3);
    }
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.1; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    paths.forEach((path, i) => { ctx.globalAlpha = 0.18 + 0.55 * (i / (BUCKETS - 1)); ctx.stroke(path); });

    ctx.globalAlpha = 1; ctx.fillStyle = '#fff';
    pts.forEach((q, i) => { ctx.beginPath(); ctx.arc(q[0], q[1], i ? 3.5 : 5, 0, 7); ctx.fill(); });
    ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(p[0], p[1], 11, 0, 7); ctx.stroke();

    // Exact additive grain: add lift; subtract sink as invert → add → invert.
    // ponytail: 4 full-canvas composite passes ≈ 2.7 ms/frame at dpr 2; if frames drop, cache the grained
    // background layer (redraw only on resize/theme) or composite grain at dpr 1.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const cw = canvas.width, ch = canvas.height;
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = lift; ctx.fillRect(0, 0, cw, ch);
    ctx.globalCompositeOperation = 'difference'; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cw, ch);
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = sink; ctx.fillRect(0, 0, cw, ch);
    ctx.globalCompositeOperation = 'difference'; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cw, ch);
    ctx.globalCompositeOperation = 'source-over';
  }

  const frame = (now: number) => { raf = 0; draw(now); schedule(); };
  const schedule = () => { if (!reduced && visible && !raf) raf = requestAnimationFrame(frame); };
  const redraw = () => draw(performance.now());

  const ro = new ResizeObserver(() => {
    W = canvas.clientWidth; H = canvas.clientHeight;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    if (!p[0] && !p[1]) p = restPoint();
    redraw();
  });
  ro.observe(canvas);

  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; schedule(); });
  io.observe(canvas);

  const onTheme = (e: Event) => {
    theme = (e as CustomEvent<Theme>).detail;
    hero = getComputedStyle(document.documentElement).getPropertyValue('--hero').trim() || hero;
    if (reduced) redraw();
  };
  window.addEventListener('themechange', onTheme);

  // Listen on the parent so overlaid captions don't block tracking; never preventDefault (hero sits inside an <a>).
  const host = canvas.parentElement ?? canvas;
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return;
    const r = canvas.getBoundingClientRect();
    target = [e.clientX - r.left, e.clientY - r.top];
    lastMove = performance.now();
  };
  const onLeave = () => { target = null; };
  if (opts.interactive !== false && !reduced) {
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', onLeave);
  }

  schedule();

  return {
    setGroup(g: Group) { group = g; if (reduced) redraw(); },
    setSigma(frac: number) { sigmaFrac = frac; if (reduced) redraw(); },
    destroy() {
      cancelAnimationFrame(raf); raf = 0; visible = false;
      ro.disconnect(); io.disconnect();
      window.removeEventListener('themechange', onTheme);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
    },
  };
}

export type FieldHandle = ReturnType<typeof mountField>;
