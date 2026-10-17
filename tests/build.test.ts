import { readFileSync, existsSync, readdirSync } from 'node:fs';
const html = (p: string) => readFileSync(`dist/${p}`, 'utf8');
const nav = (p: string) => html(p).match(/<nav[\s\S]*?<\/nav>/)![0];

test('no gallery while empty', () => {
  expect(existsSync('dist/gallery/index.html')).toBe(false);
  expect(html('index.html')).not.toMatch(/href="\/gallery"/);
});
test('writing and open questions are paused: no routes, no links', () => {
  expect(existsSync('dist/writing')).toBe(false);
  expect(existsSync('dist/open-questions')).toBe(false);
  for (const p of ['index.html', 'bookshelf/index.html', 'now/index.html']) expect(html(p)).not.toMatch(/href="\/(writing|open-questions)/);
});
test('contact and footer', () => {
  const h = html('index.html');
  expect(h).toContain('mailto:josuetapiahernandez@gmail.com');
  expect(h).toContain('https://github.com/JosueT1212');
  expect(h).not.toMatch(/Pillars|twitter\.com|x\.com/);
});
test('empty bookshelf categories hidden', () => {
  expect(html('bookshelf/index.html')).not.toMatch(/>\s*Chess\s*</);
});
test('inlined theme script sets data-phase', () => {
  const src = html('index.html').match(/<script>([\s\S]*?phaseOf[\s\S]*?)<\/script>/)![1];
  const root = { dataset: {} as Record<string, string>, style: { setProperty() {} } };
  new Function('document', 'localStorage', src)({ documentElement: root }, { getItem: () => null });
  expect(['dawn', 'midday', 'afternoon', 'night']).toContain(root.dataset.phase);
});
test('all pages built', () => {
  for (const p of ['index.html', 'field/index.html', 'bookshelf/index.html', 'now/index.html', '404.html', 'CNAME']) expect(existsSync(`dist/${p}`)).toBe(true);
});
test('homepage nav is plain', () => {
  const n = nav('index.html');
  expect(n).toContain('class="plain"');
  expect(n).not.toMatch(/leader|>\s*(I|II|III)\s*</);
});
test('secondary nav is leader style with numerals', () => {
  const n = nav('bookshelf/index.html');
  expect(n).toContain('leader-row');
  for (const r of ['I']) expect(n).toMatch(new RegExp(`leader-num[^>]*>${r}<`));
});
test('understood questions reference published posts', () => {
  const qs = JSON.parse(readFileSync('src/data/open-questions.json', 'utf8')) as { status: string; post?: string }[];
  for (const q of qs.filter(q => q.status === 'understood')) {
    const fm = readFileSync(`src/content/posts/${q.post}.md`, 'utf8');
    expect(fm).toMatch(/^status:\s*published\s*$/m);
  }
});
test('book covers exist', () => {
  const books = JSON.parse(readFileSync('src/data/books.json', 'utf8')) as { cover?: string }[];
  const files = readdirSync('src/assets/covers');
  for (const b of books.filter(b => b.cover)) expect(files).toContain(b.cover);
});
