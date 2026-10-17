import { drawCover, drawImageCover } from '../lib/covers';
const hero = () => getComputedStyle(document.documentElement).getPropertyValue('--hero').trim() || '#3868f2';
const covers: [HTMLCanvasElement, HTMLImageElement][] = [];
document.querySelectorAll<HTMLCanvasElement>('canvas[data-motif]').forEach((cv) => {
  const fallback = () => { try { drawCover(cv, JSON.parse(cv.dataset.motif!)); } catch { /* leave blank */ } };
  const src = cv.dataset.cover;
  if (!src) return fallback();
  const img = new Image();
  img.onload = () => { covers.push([cv, img]); try { drawImageCover(cv, img, { seed: cv.dataset.title!, mid: hero() }); } catch { fallback(); } };
  img.onerror = fallback;
  img.src = src;
});
window.addEventListener('themechange', () => {
  for (const [cv, img] of covers) drawImageCover(cv, img, { seed: cv.dataset.title!, mid: hero() });
});
