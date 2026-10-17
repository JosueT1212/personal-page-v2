import { drawCover } from '../lib/covers';
document.querySelectorAll<HTMLCanvasElement>('canvas[data-motif]').forEach((cv) => {
  try { drawCover(cv, JSON.parse(cv.dataset.motif!)); } catch { /* leave blank */ }
});
