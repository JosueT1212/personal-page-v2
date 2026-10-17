// Port of the mock's "lost" tile: hero-blue square, orange tangled "wavefunction", grain. Static; redrawn when the theme shifts.
function draw(cv: HTMLCanvasElement) {
  const c = cv.getContext('2d');
  if (!c) return;
  const W = 72, H = 72;
  c.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--hero').trim() || '#3868f2';
  c.fillRect(0, 0, W, H);
  const g = c.createRadialGradient(36, 36, 0, 36, 36, 40);
  g.addColorStop(0, 'rgba(255,140,60,0.45)'); g.addColorStop(1, 'rgba(255,140,60,0)');
  c.globalCompositeOperation = 'lighter'; c.fillStyle = g; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'source-over';
  c.strokeStyle = '#ff8a3d'; c.lineWidth = 1.4; c.lineCap = 'round'; c.beginPath();
  for (let t = 0; t <= 40; t += 0.02) {
    const r = 22 * Math.sin(3.1 * t) * Math.exp(-0.012 * t) + 4 * Math.sin(17 * t);
    const x = 36 + r * Math.cos(t * 1.618), y = 36 + r * Math.sin(t * 2.17);
    t ? c.lineTo(x, y) : c.moveTo(x, y);
  }
  c.globalAlpha = 0.85; c.stroke(); c.globalAlpha = 1;
  c.fillStyle = '#fff'; c.beginPath(); c.arc(36, 36, 2.6, 0, 7); c.fill();
  const d = c.getImageData(0, 0, W, H), q = d.data;
  for (let i = 0; i < q.length; i += 4) { const r = (Math.random() - 0.5) * 26; q[i] += r; q[i + 1] += r; q[i + 2] += r; }
  c.putImageData(d, 0, 0);
}

const cv = document.getElementById('lost') as HTMLCanvasElement | null;
if (cv) { draw(cv); window.addEventListener('themechange', () => draw(cv)); }
