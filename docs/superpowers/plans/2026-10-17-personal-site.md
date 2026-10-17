# jstapia.com Personal Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Josue Tapia's personal site (Fibonacci-tiled homepage, live equivariant field, Guadalajara day-cycle theme, writing/open-questions/bookshelf/now/field/gallery pages) as a static Astro site on GitHub Pages at `jstapia.com`.

**Architecture:** Astro static output. Pure logic (theme phase + OKLCH blend, field math, cover motifs, prime numbering) lives in small TS modules under `src/lib/` with Vitest unit tests. Content lives in Astro content collections (Markdown posts, JSON for books / open questions / gallery) so Josue edits data only. Canvas renderers are thin client scripts that call the tested libs. A build-output test (`tests/build.test.ts`) checks the generated HTML for routing/visibility rules.

**Tech Stack:** Astro 5, TypeScript, Vitest, `suncalc` (build time only), `culori` (OKLCH interpolation), `remark-math` + `rehype-katex` + `katex`, `@fontsource-variable/newsreader` (self-hosted, opsz axis), GitHub Actions → GitHub Pages.

**Spec:** `docs/SPEC.md` (behavior) + `docs/superpowers/specs/2026-10-17-personal-site-design.md` (decisions; wins on conflict). Visual source of truth: `docs/mocks/*.png` and `docs/mocks/*.html`. Mock HTML files are ~500KB of base64 fonts; read them with `sed -E 's/base64,[A-Za-z0-9+\/=]{200,}/X/g' file.html`.

## Global Constraints

- Project root is `Personal_page_v2/` (this folder). `docs/` stays as is.
- Site URL `https://jstapia.com`, no `base` path. `public/CNAME` contains `jstapia.com`.
- No analytics, no tracking, no third-party runtime requests (fonts self-hosted).
- Nav (right-aligned, top-right): Writing · Open questions · Bookshelf · Gallery. Gallery item omitted while `gallery.json` is empty. Never the word "Pillars".
- Footer: `Email · GitHub` (Email = `mailto:josuetapiahernandez@gmail.com`, GitHub = `https://github.com/JosueT1212`), "Fibonacci grid, 21 : 13", "© 2026". No X.
- ∎ square = `mailto:josuetapiahernandez@gmail.com`.
- Font: one variable `--font-serif: 'Newsreader Variable', Georgia, serif` (Ivar swap = edit this line). Body 16.5px, weight 450, `font-optical-sizing: auto`.
- Spacing/type scale only from 8, 13, 21, 34, 55, 89 px (plus the mock's explicit sizes).
- Shared tokens: `--line:#1C1F2A`, `--orange:#FF6A1F`, `--gray:#7A7F90` (see Gray note below).
- Palettes (verbatim from SPEC §4):
  - dawn: hero `#3868F2`, ink `#7AA2FF`, label `#B6CDFF`, bg `#0A0A12`
  - midday: hero `#0A6CFF`, ink `#4FA3FF`, label `#A3D1FF`, bg `#04070B`
  - afternoon: hero `#0F4C81`, ink `#5AA9E6`, label `#A8D5F5`, bg `#05080B`
  - night: hero `#0D2A7A`, ink `#4D74D9`, label `#8EABF0`, bg `#05060A`
- Guadalajara: lat 20.67, lon −103.35, timezone `America/Mexico_City`. Phase clock times (9:30, 15:00) are Guadalajara local, regardless of visitor timezone.
- Every `localStorage` access wrapped in try/catch.
- `prefers-reduced-motion: reduce` → canvases render one static frame, spiral not animated.
- Below 900px: squares stack 13→8→5→3→2→1→1, spiral hidden, 16px side gutters, no horizontal scroll.
- Squares that open pages are real `<a>` wrapping the cell, visible `:focus-visible` ring (`2px solid var(--orange)`).
- Only posts with `status: published` get a route; others are listed with their status label, not linked.
- Two-tone sentences: first clause ink, rest `.g` (gray).

**Gray note (Claude's call, flag to Josue at handoff):** SPEC's `#5D6170` gray is 3.2:1 on the page backgrounds and fails WCAG AA (4.5:1) for body-size text. Plan uses `#7A7F90` (4.9:1 on dawn bg). One-token revert if Josue prefers the original.

## Review Focus

1. **Visitor in another timezone** (e.g. San Francisco, 8:00 there = 9:00 Guadalajara) → phase follows Guadalajara clock. Pinned in Task 2 (`phaseOf` timezone test).
2. **`localStorage` throws** (Safari private mode, blocked storage) → theme falls back to auto, no console error, page renders. Pinned in Task 2.
3. **Boundary blending** — 15 min before sunrise must be a mid-blend night→dawn, not a hard switch; exactly at 9:30 is t=0.5. Pinned in Task 2.
4. **Empty data** — Gallery empty, a bookshelf category empty, no published posts → those parts hide cleanly, no empty headings, no dead links. Pinned in Task 9 build test.
5. **Resize / phone width** — field re-sizes with devicePixelRatio and uses sparser grid on narrow widths; no horizontal scroll at 360px. Pinned in Task 4 (`gridSpacing`) and Task 9 verification.

---

### Task 1: Scaffold, tokens, layout shell, deploy

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`, `public/CNAME`, `.github/workflows/deploy.yml`
- Create: `src/styles/global.css`, `src/layouts/Base.astro`, `src/components/Nav.astro`, `src/components/Footer.astro`, `src/pages/index.astro` (placeholder body)
- Create: `src/lib/palette.ts`
- Test: `tests/palette.test.ts`

**Interfaces:**
- Produces: `type Phase = 'dawn' | 'midday' | 'afternoon' | 'night'`; `PHASES: Phase[]` (that order); `PALETTES: Record<Phase, {hero: string; ink: string; label: string; bg: string}>`; `GRAY = '#7A7F90'`; `contrast(a: string, b: string): number` (WCAG ratio).
- Produces: `Base.astro` props `{ title: string; description?: string; current?: 'writing' | 'open-questions' | 'bookshelf' | 'gallery' }`, slot for page body. Renders `<Nav current>`, slot, `<Footer>`.
- Produces: CSS custom properties on `:root`: `--hero --ink --label --bg --gray --line --orange --font-serif`, and `.g` utility.

- [ ] **Step 1:** `git init` in `Personal_page_v2/`; `npm create astro@latest . -- --template minimal --typescript strict --no-install --no-git`; `npm i astro@^5 culori katex remark-math rehype-katex @fontsource-variable/newsreader`; `npm i -D vitest suncalc @types/suncalc @types/culori`. Add scripts `"test": "vitest run"`, `"build": "astro build"`.
- [ ] **Step 2: Write the failing test** `tests/palette.test.ts`:

```ts
import { PALETTES, PHASES, GRAY, contrast } from '../src/lib/palette';
test('ink and label meet AA on page bg in every phase', () => {
  for (const p of PHASES) {
    expect(contrast(PALETTES[p].ink, PALETTES[p].bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(PALETTES[p].label, PALETTES[p].bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(GRAY, PALETTES[p].bg)).toBeGreaterThanOrEqual(4.5);
  }
});
test('white hero text meets AA-large on every hero bg', () => {
  for (const p of PHASES) expect(contrast('#FFFFFF', PALETTES[p].hero)).toBeGreaterThanOrEqual(3);
});
test('contrast is symmetric and known', () => {
  expect(contrast('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
});
```

- [ ] **Step 3:** Run `npx vitest run tests/palette.test.ts` → FAIL (module missing).
- [ ] **Step 4:** Implement `src/lib/palette.ts` with the Global Constraints values; `contrast` = standard WCAG relative-luminance formula.
- [ ] **Step 5:** Run test → PASS.
- [ ] **Step 6:** `astro.config.mjs`: `site: 'https://jstapia.com'`, `output: 'static'`, markdown `remarkPlugins: [remarkMath]`, `rehypePlugins: [rehypeKatex]`. `global.css`: import `@fontsource-variable/newsreader/opsz.css` and `opsz-italic.css`, the `:root` tokens (dawn values as default), body rules from the mock (`docs/mocks/josue-homepage-dawn.html` `<style>`), `:focus-visible` ring, `@media (max-width: 899px) { body { padding-inline: 16px } }`. `Nav.astro`: links `/writing`, `/open-questions`, `/bookshelf`, `/gallery` (Gallery only if `getCollection('gallery')` non-empty — wire the check in Task 3; for now render all four), current item colored `var(--label)`. `Footer.astro` per Global Constraints, grid `34px 5fr 3fr 2fr` from mock.
- [ ] **Step 7:** `deploy.yml`: on push to `main`, `actions/checkout`, `withastro/action@v3`, `actions/deploy-pages@v4` (standard Astro GitHub Pages workflow). `public/CNAME` = `jstapia.com`.
- [ ] **Step 8:** Run `npm run build` → succeeds, `dist/index.html` exists, `dist/CNAME` exists.
- [ ] **Step 9: Commit** `git add -A && git commit -m "chore: scaffold Astro site with palette tokens and deploy workflow"`

---

### Task 2: Day-cycle theme engine

**Files:**
- Create: `src/lib/theme.ts`, `src/components/ThemeHead.astro`, `src/scripts/theme-client.ts`
- Modify: `src/layouts/Base.astro` (include `<ThemeHead />` first in `<head>`, load `theme-client.ts`)
- Test: `tests/theme.test.ts`

**Interfaces:**
- Consumes: `Phase`, `PHASES`, `PALETTES` from Task 1.
- Produces:
  - `type SunTable = [sunriseMin: number, sunsetMin: number][]` — 366 entries indexed by day-of-year (0-based), minutes after Guadalajara local midnight.
  - `buildSunTable(year?: number): SunTable` — build time only, uses `suncalc.getTimes(date, 20.67, -103.35)`, converts to `America/Mexico_City` local minutes via `Intl.DateTimeFormat`.
  - `src/scripts/phase-of.js`: plain JS (no imports/exports, no TS) containing exactly one top-level `function phaseOf(date, table)` returning `{ from, to, t }`. It computes its own Guadalajara clock with `Intl.DateTimeFormat`.
  - `theme.ts` re-exports it from the **same bytes** that ship: `import src from '../scripts/phase-of.js?raw'; export const phaseOf: (d: Date, t: SunTable) => { from: Phase; to: Phase; t: number } = new Function(`${src}; return phaseOf;`)();`. `ThemeHead.astro` inlines the same `?raw` string, so tests exercise what production runs.
  - `mixPalette(from: Phase, to: Phase, t: number): Record<'--hero'|'--ink'|'--label'|'--bg', string>` — culori `interpolate([a, b], 'oklch')`, output hex.
  - `OVERRIDE_KEY = 'theme-phase'`; `readOverride(): Phase | null`; `writeOverride(p: Phase | null): void` — both try/catch, never throw.
  - `nextOverride(cur: Phase | null): Phase | null` — cycle `null → dawn → midday → afternoon → night → null`.
  - Client dispatches `window` event `'themechange'` with `detail: { from: Phase; to: Phase; t: number }` on load, every 60 s, and on override change. `document.documentElement.dataset.phase` = dominant phase (`t < 0.5 ? from : to`).

Phase rule (SPEC §4): dawn = sunrise → 9:30, midday = 9:30 → 15:00, afternoon = 15:00 → sunset, night = sunset → sunrise. Blend 60 min centered on each boundary: at boundary − 30 min `t = 0`, at boundary `t = 0.5`, at boundary + 30 min `t = 1` (then `from = to`, `t = 0`). Linear in minutes.

- [ ] **Step 1: Write the failing tests** `tests/theme.test.ts`:

```ts
import { phaseOf, mixPalette, readOverride, writeOverride, nextOverride } from '../src/lib/theme';
const T: [number, number][] = Array.from({ length: 366 }, () => [7 * 60, 19 * 60]); // sunrise 07:00, sunset 19:00
const gdl = (hh: number, mm: number) => new Date(Date.UTC(2026, 9, 17, hh + 6, mm)); // GDL = UTC-6

test('mid-phase is pure', () => {
  expect(phaseOf(gdl(12, 0), T)).toEqual({ from: 'midday', to: 'midday', t: 0 });
  expect(phaseOf(gdl(2, 0), T)).toEqual({ from: 'night', to: 'night', t: 0 });
});
test('blend centered on boundary', () => {
  expect(phaseOf(gdl(9, 30), T)).toEqual({ from: 'dawn', to: 'midday', t: 0.5 });
  const r = phaseOf(gdl(6, 45), T);
  expect(r.from).toBe('night'); expect(r.to).toBe('dawn'); expect(r.t).toBeCloseTo(0.25);
  expect(phaseOf(gdl(19, 30), T)).toEqual({ from: 'night', to: 'night', t: 0 });
});
test('uses Guadalajara clock, not host timezone', () => {
  // 16:00 UTC = 10:00 GDL = 09:00 San Francisco (PDT); must be midday
  expect(phaseOf(new Date(Date.UTC(2026, 9, 17, 16, 0)), T).from).toBe('midday');
});
test('mixPalette endpoints are exact palette colors', () => {
  expect(mixPalette('dawn', 'midday', 0)['--hero'].toLowerCase()).toBe('#3868f2');
  expect(mixPalette('dawn', 'midday', 1)['--hero'].toLowerCase()).toBe('#0a6cff');
});
test('override storage never throws', () => {
  const bad = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); }, removeItem() { throw new Error('denied'); } };
  vi.stubGlobal('localStorage', bad);
  expect(readOverride()).toBeNull();
  expect(() => writeOverride('night')).not.toThrow();
  vi.unstubAllGlobals();
});
test('override cycles through auto', () => {
  expect(nextOverride(null)).toBe('dawn');
  expect(nextOverride('night')).toBeNull();
});
```

- [ ] **Step 2:** Run `npx vitest run tests/theme.test.ts` → FAIL.
- [ ] **Step 3:** Implement `src/lib/theme.ts` per Interfaces. (Enable `globals: true` in `vitest.config.ts` if not already.)
- [ ] **Step 4:** Run tests → PASS.
- [ ] **Step 5:** `ThemeHead.astro`: frontmatter calls `buildSunTable()`, imports `phase-of.js?raw` and `PALETTES`; renders `<script is:inline set:html={...}>` = raw `phaseOf` source + a bootstrap that: reads override (try/catch), else calls `phaseOf(new Date(), TABLE)`, sets `data-phase` and the four CSS vars for the dominant phase on `<html>` before first paint. `theme-client.ts`: on load and every 60 s apply `mixPalette` (when an override is set, apply that phase's palette with `t = 0` and skip the time-based blend) to `document.documentElement.style`, dispatch `themechange`. Exposes `window.__cycleTheme()` calling `nextOverride` + `writeOverride` + reapply (used by the φ control in Task 6).
- [ ] **Step 6:** `npm run build && npx astro preview`; check in browser that `<html>` has `data-phase` and vars set with no wrong-color flash on hard reload.
- [ ] **Step 7: Commit** `git commit -am "feat: Guadalajara day-cycle theme with OKLCH blending and override"`

---

### Task 3: Content collections and seed content

**Files:**
- Create: `src/content.config.ts`, `src/lib/content.ts`
- Create: `src/content/posts/equivariance-first-principles.md`, `src/content/posts/putnam-vs-reasoning-model.md`, `src/content/posts/clifford-algebras-for-coders.md`
- Create: `src/data/books.json`, `src/data/open-questions.json`, `src/data/gallery.json`, `src/content/now.md`
- Modify: `src/components/Nav.astro` (hide Gallery when empty)
- Test: `tests/content.test.ts`

**Interfaces:**
- Produces collections (zod schemas in `content.config.ts`; JSON collections use Astro 5's `file()` loader, so every JSON entry carries a kebab-case `id` field, e.g. `"id": "mans-search-for-meaning"`):
  - `posts` (glob `src/content/posts/*.md`): `{ title: string; summary?: string; status: 'draft' | 'in-progress' | 'notes' | 'published'; date: Date }`
  - `books` (file `src/data/books.json`): `{ title: string; author: string; category: 'mathematics' | 'chess' | 'beyond'; status: 'reading' | 'read'; motif: { name: MotifName; seed?: number } }` (`MotifName` from Task 5; use `z.string()` here and validate names in Task 5's test)
  - `openQuestions` (file `src/data/open-questions.json`): `{ title: string; status: 'curious' | 'reading' | 'working' | 'understood'; notes?: string; link?: string; post?: string }` — `post` = slug, required when `status === 'understood'` (zod `.refine`)
  - `gallery` (file `src/data/gallery.json`): `{ src: string; alt: string; caption?: string; date?: string }`, first entry = hero. Ships as `[]`.
- Produces in `src/lib/content.ts`:
  - `primes(n: number): number[]` — first n primes.
  - `STATUS_LABEL: Record<PostStatus, string>` = `{ draft: 'Draft', 'in-progress': 'In progress', notes: 'Notes', published: '' }`
  - `latest<T extends { data: { date: Date } }>(items: T[], n: number): T[]` — newest first.

- [ ] **Step 1: Write the failing test** `tests/content.test.ts`:

```ts
import { primes, latest, STATUS_LABEL } from '../src/lib/content';
test('primes', () => expect(primes(6)).toEqual([2, 3, 5, 7, 11, 13]));
test('latest sorts newest first and truncates', () => {
  const mk = (d: string) => ({ data: { date: new Date(d) } });
  expect(latest([mk('2026-01-01'), mk('2026-03-01'), mk('2026-02-01')], 2).map(x => x.data.date.getMonth())).toEqual([2, 1]);
});
test('status labels', () => expect(STATUS_LABEL['in-progress']).toBe('In progress'));
```

- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement `src/lib/content.ts`. **Step 4:** Run → PASS.
- [ ] **Step 5:** Write `content.config.ts` and seed data:
  - Posts (none `published`): Equivariance, from first principles — `in-progress`, summary "why a network should commute with its group", date 2026-10-17; Putnam problems vs. a reasoning model — `in-progress`, "same problem, two proofs", 2026-10-01; Clifford algebras for people who code — `notes`, no summary, 2026-09-15. Bodies empty.
  - `books.json`: `{"title":"Man's Search for Meaning","author":"Viktor Frankl","category":"beyond","status":"reading","motif":{"name":"waves"}}`, `{"title":"The Art of Doing Science and Engineering","author":"Richard Hamming","category":"mathematics","status":"reading","motif":{"name":"primeSpiral"}}`.
  - `open-questions.json` (placeholders from mock, no `understood`): Representation theory of Lie groups, properly, beyond SU(2) — working; Quantum mechanics → quantum field theory (enough to stop going crazy) — reading; Clifford algebras beyond the basics — reading; Geometric deep learning: symmetry as a design principle — curious; Analytic number theory and the distribution of primes — curious.
  - `now.md`: front-matter `updated: 2026-10-17`; body: writing "Equivariance, from first principles"; reading *Man's Search for Meaning* and *The Art of Doing Science and Engineering*.
  - `gallery.json`: `[]`.
- [ ] **Step 6:** Nav: `const hasGallery = (await getCollection('gallery')).length > 0`.
- [ ] **Step 7:** `npm run build` → succeeds (zod validates data).
- [ ] **Step 8: Commit** `git commit -am "feat: content collections and seed content"`

---

### Task 4: Equivariant field (lib, renderer, /field)

**Files:**
- Create: `src/lib/field.ts`, `src/scripts/field-canvas.ts`, `src/components/Field.astro`, `src/pages/field.astro`
- Test: `tests/field.test.ts`

**Interfaces:**
- Consumes: `themechange` event and `--hero` var (Task 2); `Phase` (Task 1).
- Produces:
  - `type Vec = [number, number]`; `type Group = 'C4' | 'D4' | 'C6' | 'D6' | 'D8'`; `GROUPS: Group[]`.
  - `orbit(p: Vec, c: Vec, g: Group): Vec[]` — rotations of `p` about `c` by `2πk/n`; for `D*` also reflections (mock code: `[cx+c*vx+s*vy, cy+s*vx-c*vy]`). C_n → n points, D_n → 2n points (D₆ = 12).
  - `grad(x: Vec, pts: Vec[], sigma: number): Vec` — `Σ (q − x)·exp(−‖x−q‖²/2σ²)`, i.e. `−∇L` up to the constant 1/σ² (matches mock magnitudes for the arrow formula).
  - `gridSpacing(cssWidth: number): number` — 24 if ≥ 900, else 34.
  - `lissajous(t: number, c: Vec, w: number, h: number): Vec` — idle drift `c + [0.25w·sin(0.13t), 0.18h·sin(0.17t + 1)]` (t in seconds).
  - `GLOWS: Record<Phase, { x: number; y: number; r: number; color: string; alpha: number }[]>` — positions/radii as fractions of the canvas (x of W, y of H, r of orbit radius R). Dawn = the mock's three source-over stops (`cy*1.25`/`R*1.9`/`rgba(255,128,60,.62)`, `cy`/`R*.75`/`rgba(255,150,70,.55)`, `cy`/`R*.3`/`rgba(255,214,150,.6)`). Midday white sun, afternoon golden, night orange-pink ember: designed by eye in the same structure, all source-over (Task 10 gets Josue's approval).
  - `mountField(canvas: HTMLCanvasElement, opts: { group?: Group; sigmaFrac?: number; interactive?: boolean }): { setGroup(g: Group): void; setSigma(frac: number): void; destroy(): void }` in `field-canvas.ts`. Defaults `group: 'D6'`, `sigmaFrac: 0.09` (σ = sigmaFrac·W).
  - `Field.astro` props `{ group?: Group; full?: boolean }` renders the canvas and mounts it.

Renderer behavior (port from `docs/mocks/josue-homepage-dawn.html` first IIFE): fill `--hero`; draw blended glows (from-phase glows at alpha `1−t`, to-phase at `t`); orbit-point glows `34px rgba(255,140,60,.55)`; arrows on `gridSpacing` grid with `L = 10·tanh(m/18)`, `alpha = 0.18 + 0.55·tanh(m/30)`, white, lineWidth 1.1; orbit dots r 3.5 (first 5); cursor ring r 11; grain amplitude 26. Grain: pre-render one noise tile per resize and composite it each frame (per-frame `getImageData` is too slow). Pointer move sets `p`; pointer leave / touch-only / idle 3 s → `lissajous`. `requestAnimationFrame` loop; `prefers-reduced-motion` → draw one frame, no loop. `ResizeObserver` + `devicePixelRatio` resize. Pause loop when off-screen (`IntersectionObserver`).

- [ ] **Step 1: Write the failing test** `tests/field.test.ts`:

```ts
import { orbit, grad, gridSpacing, GROUPS } from '../src/lib/field';
const rot = ([x, y]: [number, number], a: number, [cx, cy]: [number, number]): [number, number] =>
  [cx + Math.cos(a) * (x - cx) - Math.sin(a) * (y - cy), cy + Math.sin(a) * (x - cx) + Math.cos(a) * (y - cy)];
test('orbit sizes', () => {
  expect(orbit([3, 1], [0, 0], 'D6')).toHaveLength(12);
  expect(orbit([3, 1], [0, 0], 'C4')).toHaveLength(4);
});
test.each(GROUPS)('field is equivariant under rotation for %s', (g) => {
  const n = Number(g.slice(1)), c: [number, number] = [50, 40], pts = orbit([80, 30], c, g), a = 2 * Math.PI / n;
  const x: [number, number] = [61, 52];
  const lhs = grad(rot(x, a, c), pts, 12);
  const f = grad(x, pts, 12), rhs = rot([c[0] + f[0], c[1] + f[1]], a, c);
  expect(lhs[0]).toBeCloseTo(rhs[0] - c[0], 6); expect(lhs[1]).toBeCloseTo(rhs[1] - c[1], 6);
});
test('gradient points toward a single nearby point', () => {
  const [gx, gy] = grad([0, 0], [[5, 0]], 10); expect(gx).toBeGreaterThan(0); expect(gy).toBeCloseTo(0);
});
test('mobile density', () => { expect(gridSpacing(1400)).toBe(24); expect(gridSpacing(390)).toBe(34); });
```

- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement `src/lib/field.ts`. **Step 4:** Run → PASS.
- [ ] **Step 5:** Implement `field-canvas.ts` + `Field.astro` per renderer behavior.
- [ ] **Step 6:** `src/pages/field.astro`: full-viewport `<Field full />`, group picker as a radio group (C₄ D₄ C₆ D₆ D₈, D₆ checked), σ range input (0.04–0.18, step 0.01), caption *f(g·x) = g·f(x)* italic bottom-left, "← Josue Tapia" back link top-left (mock `.top a` style).
- [ ] **Step 7:** `npm run build && npx astro preview`; open `/field`: arrows follow cursor, switching group changes orbit count, σ slider changes spread, steady 60 fps on a laptop (DevTools Performance, no long frames >16 ms after warm-up).
- [ ] **Step 8: Commit** `git commit -am "feat: live equivariant field and /field playground"`

---

### Task 5: Generative cover motifs and /bookshelf

**Files:**
- Create: `src/lib/covers.ts`, `src/scripts/covers-client.ts`, `src/components/BookCover.astro`, `src/components/Shelf.astro`, `src/pages/bookshelf.astro`
- Test: `tests/covers.test.ts`

**Interfaces:**
- Consumes: `books` collection (Task 3).
- Produces:
  - `type MotifName = 'vesica' | 'nestedSquares' | 'primeSpiral' | 'cayley' | 'knightTour' | 'waves'`
  - `MOTIFS: Record<MotifName, { family: 'geometric' | 'board' | 'free'; bg: string; ink?: string; draw(c: CanvasRenderingContext2D, W: number, H: number, rand: () => number): void }>` — ported verbatim from the six `draw` functions in the mock's `books` array (Elements→vesica, GEB→nestedSquares, Hardy→primeSpiral, Visual Group Theory→cayley, Chess Story→knightTour, Feynman→waves), same `bg`/`ink`. `rand` is unused by ported motifs but available for seeded variation.
  - `mulberry32(seed: number): () => number` — seeded PRNG for grain and variation (so covers are stable across reloads).
  - `drawCover(canvas: HTMLCanvasElement, motif: { name: MotifName; seed?: number }): void` — mock's pipeline: bg fill → glow (multiply for light `ink` covers, lighter otherwise) → `draw` → grain 22 with seeded rand.
  - `BookCover.astro` props `{ motif; size: 'thumb' | 'large' }` (thumb = 42px wide, 8:13; large = 144px wide, 8:13).
  - `Shelf.astro` props `{ variant: 'home' | 'page' }`: groups books by category in order Mathematics, Chess, Beyond, **skipping empty categories**; `home` = light list (thumb, title, author italic, 3-column grid from mock `.covers`), `page` = large covers with category headings. Status `reading` shows italic gray "reading" after the author.

- [ ] **Step 1: Write the failing test** `tests/covers.test.ts`:

```ts
import { MOTIFS, mulberry32 } from '../src/lib/covers';
import books from '../src/data/books.json';
test('every book uses a known motif', () => { for (const b of books) expect(MOTIFS).toHaveProperty(b.motif.name); });
test('seeded PRNG is deterministic', () => {
  const a = mulberry32(7), b = mulberry32(7); expect([a(), a()]).toEqual([b(), b()]);
});
test('families cover all three categories', () => {
  expect(new Set(Object.values(MOTIFS).map(m => m.family))).toEqual(new Set(['geometric', 'board', 'free']));
});
```

- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement `covers.ts`. **Step 4:** Run → PASS.
- [ ] **Step 5:** Implement `covers-client.ts` (finds `canvas[data-motif]`, calls `drawCover`, honors DPR), `BookCover.astro`, `Shelf.astro`, `bookshelf.astro` (Base with `current="bookshelf"`, label "§5 Bookshelf", lead "**What I'm reading** and what stayed with me." two-tone).
- [ ] **Step 6:** Build + preview `/bookshelf`: two books, Mathematics and Beyond headings only, no Chess heading.
- [ ] **Step 7: Commit** `git commit -am "feat: generative book covers and bookshelf page"`

---

### Task 6: Homepage

**Files:**
- Modify: `src/pages/index.astro`
- Create: `src/components/home/Hero.astro`, `About.astro`, `WritingSquare.astro`, `OpenQuestionsSquare.astro`, `GallerySquare.astro`, `GlyphSquares.astro`, `Spiral.astro`, `src/scripts/tile-lost.ts`, `src/lib/prime-graph.ts`
- Test: `tests/prime-graph.test.ts`

**Interfaces:**
- Consumes: `Field.astro` (Task 4), `Shelf variant="home"` (Task 5), collections + `latest`, `STATUS_LABEL` (Task 3), `window.__cycleTheme` (Task 2).
- Produces: `primeGraph(N: number): { nodes: { k: number; x: number; y: number; prime: boolean }[]; edges: [number, number][] }` in a 220×180 box — port of the mock's prime-graph IIFE (layers by Ω(k), edge k → k/p for prime p | k). Rendered as static SVG at build time.

Layout (from `docs/mocks/josue-home.html` + SPEC §2): `.fib` grid exactly as SPEC §2 with areas `hero about writing gal now end oq`. Square numbers 13/8/5/3/2/1/1 italic top-right. Cells:
- **13 hero** `<a href="/field">`: `<Field />` + `<h1>Josue <i>Tapia</i></h1>` (120px desktop, `clamp(48px, 9vw, 120px)`).
- **8 about** (not a link): label *§1 About*, lead two-tone "**Data Science and Mathematics at ITESM.** I love researching and programming stuff.", timeline rows a₁/a₂/a₃ + `lim` (n→∞ under "lim" via `.lim` inline-flex) "aₙ = ?", copy from SPEC §6; a₃ ends with the 30px `<canvas id="lost" title="I'm going crazy">` drawn by `tile-lost.ts` (port of the mock's last IIFE, using `--hero`).
- **5 writing** `<a href="/writing">`: *§2 Writing*, `latest(posts, 3)` titles + "`STATUS_LABEL` · summary" (label alone when `summary` is missing).
- **3 open questions** `<a href="/open-questions">`: *§3 Open questions* + prime-graph SVG (N=30).
- **2 gallery**: mini collage (`.galsq .mini` from mock) + *§4 Gallery*; if gallery empty → plain `<div>` with "Soon" in gray, not a link; else `<a href="/gallery">` with "Open →".
- **1 φ**: `<a href="/now" aria-label="Now">φ</a>` plus a sibling `<button class="phase" aria-label="Change theme: auto">` (small dot, absolutely positioned bottom-right of the cell) calling `window.__cycleTheme()`; label updates to the current override. Not nested in the `<a>`.
- **1 ∎**: `<a href="mailto:josuetapiahernandez@gmail.com" aria-label="Email">∎</a>`.
- **Hover** on link squares: preview opacity/brightness up, "Open →" fades in (CSS only).
- **Spiral**: SVG from SPEC §2 verbatim, `stroke: var(--ink)`, `stroke-opacity .6`, `vector-effect: non-scaling-stroke`, `pathLength="1"`; draw-in animation via `stroke-dasharray:1; stroke-dashoffset` 1→0 over 1.6 s ease-out on load (dash runs from path end, i.e. reverse the dashoffset so it grows from the 1-square outward), disabled under reduced motion.
- Below grid: `<Shelf variant="home" />` with header "*§5 Bookshelf* — what I'm reading" then Footer.
- **< 900px**: `.fib` becomes a single column; `aspect-ratio` per card 13/8 (hero), 8/5 (about), 5/3 (writing), 3/2 (oq), 2/1 (gallery); φ and ∎ in one row at 1/1 each; `aspect-ratio` acts as a minimum (content may grow it); spiral `display:none`.

- [ ] **Step 1: Write the failing test** `tests/prime-graph.test.ts`:

```ts
import { primeGraph } from '../src/lib/prime-graph';
test('nodes 2..30, primes flagged, composite edges', () => {
  const g = primeGraph(30);
  expect(g.nodes.map(n => n.k)).toEqual(Array.from({ length: 29 }, (_, i) => i + 2));
  expect(g.nodes.filter(n => n.prime).map(n => n.k)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29]);
  expect(g.edges).toContainEqual([12, 6]); expect(g.edges).toContainEqual([12, 4]);
  expect(g.edges.some(([a]) => a === 7)).toBe(false);
});
```

- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement `prime-graph.ts`. **Step 4:** Run → PASS.
- [ ] **Step 5:** Build the components and `index.astro` per Layout.
- [ ] **Step 6:** Build + preview; compare side-by-side with `docs/mocks/josue-home.png` at 1680px width (grid proportions, spiral passes through square corners, type sizes). Check 390px width: stacked, no horizontal scroll (`document.documentElement.scrollWidth === innerWidth`). Tab through: every square except About focusable with visible ring; φ theme button reachable.
- [ ] **Step 7: Commit** `git commit -am "feat: Fibonacci homepage"`

---

### Task 7: Writing, Open questions, Now pages

**Files:**
- Create: `src/pages/writing/index.astro`, `src/pages/writing/[slug].astro`, `src/layouts/Post.astro`, `src/pages/open-questions.astro`, `src/pages/now.astro`

**Interfaces:**
- Consumes: collections, `primes`, `STATUS_LABEL`, `latest` (Task 3); `Base` (Task 1).

Shared page chrome follows `docs/mocks/open-questions.html`: `.top` (back link "← Josue Tapia" + nav), `.intro` 13fr : 8fr grid with *§N label* + 44px two-tone lead.
- **/writing**: *§2 Writing*, lead "**Notes on math and ML,** written to understand them." All posts newest first: published → `<a href="/writing/{slug}">`; others → plain title + gray `STATUS_LABEL · summary` (label alone when no summary).
- **/writing/[slug]**: `getStaticPaths` returns only `status === 'published'`. `Post.astro`: title, date, prose column max ~34em, KaTeX CSS (`katex/dist/katex.min.css`) imported here only.
- **/open-questions**: per SPEC §7 and mock: headline "**Things I don't understand yet** but want to.", legend top-right (dots s0–s3, curious → reading → working on → understood), single list "Topics I want to explore" in the 13fr column, header count "N open · M understood", entries numbered `primes(n)[i]`, dot fill 0 / ⅓ / ⅔ / full. Make reading vs working visually distinct beyond fill (working dot gets `--orange` border). Understood: strike-through, link to `/writing/{post}`. Footer line "When a question is understood, it becomes a post in Writing." + "Last updated {month year of file mtime or a `updated` constant}".
- **/now**: *Now*, render `now.md`, show "Updated {date}".

- [ ] **Step 1:** Implement the five files.
- [ ] **Step 2:** Build + preview; compare `/open-questions` against `docs/mocks/josue-open-questions.png`; confirm `/writing/equivariance-first-principles` 404s in preview and `/writing` shows three unlinked entries labeled In progress, In progress, Notes.
- [ ] **Step 3: Commit** `git commit -am "feat: writing, open questions and now pages"`

(Routing rules are asserted by the build test in Task 9.)

---

### Task 8: Gallery page and lightbox (ships hidden)

**Files:**
- Create: `src/lib/gallery.ts`, `src/pages/[gallery].astro`, `src/scripts/lightbox.ts`, `src/assets/gallery/.gitkeep`
- Test: `tests/gallery.test.ts`

**Interfaces:**
- Consumes: `gallery` collection (Task 3).
- Produces: `spirals<T>(items: T[]): T[][]` — chunks of 7 (last may be shorter). Slot order per spiral → grid area: `['a','b','c','d','f','g','h']` (13, 8, 5, 3, 2, 1, 1) on the mock grid `"a b b b" "a f g c" "a f h c" "a d d c"`, gap 6px, golden spiral SVG on top.
- The page must not be emitted while the collection is empty: implement it as `src/pages/[gallery].astro` (not `gallery.astro`) with `getStaticPaths()` returning `[{ params: { gallery: 'gallery' } }]` when non-empty, `[]` when empty. Images: `src` is a filename under `src/assets/gallery/`, resolved with `import.meta.glob('/src/assets/gallery/*', { eager: true })` and rendered with `astro:assets` `<Picture formats={['avif','webp']} loading="lazy">` (hero eager).
- `lightbox.ts`: native `<dialog>`; click photo opens; ←/→ navigate, Esc closes (native), caption "place · date"; focus returns to the clicked photo on close.

- [ ] **Step 1: Write the failing test** `tests/gallery.test.ts`:

```ts
import { spirals } from '../src/lib/gallery';
test('chunks of seven', () => {
  expect(spirals([...Array(16).keys()]).map(s => s.length)).toEqual([7, 7, 2]);
  expect(spirals([])).toEqual([]);
});
```

- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** Run → PASS.
- [ ] **Step 5:** Implement page + lightbox. Temporarily add 8 test images + entries locally, verify against `docs/mocks/josue-gallery-page.png`, keyboard nav, second spiral; then **revert the data to `[]`** before commit.
- [ ] **Step 6:** `npm run build` with empty data → no `dist/gallery/` produced.
- [ ] **Step 7: Commit** `git commit -am "feat: gallery page and lightbox (hidden until photos)"`

---

### Task 9: Build-output test

**Files:**
- Create: `tests/build.test.ts`
- Create: `vitest.build.config.ts` (`include: ['tests/build.test.ts']`)
- Modify: `package.json` (`"test:build": "astro build && vitest run -c vitest.build.config.ts"`), `vitest.config.ts` (`exclude: ['tests/build.test.ts', 'node_modules/**']`)

- [ ] **Step 1: Write the test** (reads `dist/` with `node:fs`):

```ts
import { readFileSync, existsSync } from 'node:fs';
const html = (p: string) => readFileSync(`dist/${p}`, 'utf8');
test('no gallery while empty', () => {
  expect(existsSync('dist/gallery/index.html')).toBe(false);
  expect(html('index.html')).not.toMatch(/href="\/gallery"/);
});
test('unpublished posts have no routes and are not linked', () => {
  expect(existsSync('dist/writing/equivariance-first-principles/index.html')).toBe(false);
  expect(html('writing/index.html')).not.toMatch(/href="\/writing\/[a-z]/);
  expect(html('writing/index.html')).toContain('In progress');
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
  const src = html('index.html').match(/<script>([^<]*phaseOf[^<]*)<\/script>/)![1];
  const root = { dataset: {} as Record<string, string>, style: { setProperty() {} } };
  new Function('document', 'localStorage', src)({ documentElement: root }, { getItem: () => null });
  expect(['dawn', 'midday', 'afternoon', 'night']).toContain(root.dataset.phase);
});
test('all pages built', () => {
  for (const p of ['index.html', 'field/index.html', 'writing/index.html', 'open-questions/index.html', 'bookshelf/index.html', 'now/index.html', 'CNAME']) expect(existsSync(`dist/${p}`)).toBe(true);
});
```

- [ ] **Step 2:** Run `npm run test:build` → PASS (fix the owning task's code if anything fails).
- [ ] **Step 3:** Run `npm test` → all unit tests PASS.
- [ ] **Step 4: Commit** `git commit -am "test: build-output checks for routing and visibility rules"`

---

### Task 10: Phase review, polish, and go-live checklist

**Files:**
- Modify: `src/lib/field.ts` (`GLOWS` tuning only), any CSS fixes found

- [ ] **Step 1:** Add a dev-only query param `?phase=dawn|midday|afternoon|night` in `theme-client.ts` (ignored in production build via `import.meta.env.DEV`). Screenshot the homepage in all four phases at 1680px and 390px.
- [ ] **Step 2:** Present the four screenshots to Josue for approval of the Midday/Afternoon/Night glows. Tune `GLOWS` until approved.
- [ ] **Step 3:** Lighthouse (mobile) on `astro preview`: Accessibility ≥ 95, Performance ≥ 90, CLS < 0.05. Fix regressions.
- [ ] **Step 4:** Run `npm test && npm run test:build` → all PASS.
- [ ] **Step 5: Commit** `git commit -am "polish: tuned phase glows"`
- [ ] **Step 6: Go-live (Josue does, Claude guides):** create GitHub repo, push `main`, Settings → Pages → Source: GitHub Actions, custom domain `jstapia.com`, enforce HTTPS; at the registrar add A records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` and `CNAME www → josuet1212.github.io`.
