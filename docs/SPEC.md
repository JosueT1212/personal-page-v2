# Josue Tapia — personal site: build spec

Hand this folder to Claude Code. The `mocks/` folder contains the approved static HTML mocks and PNG renders. Treat them as the visual source of truth, and this file as the source of truth for behavior. Build into the `Personal/Page` repo.

---

## 1. Concept

A personal site for a mathematician and ML engineer. Everything is laid out on a **Fibonacci tiling**. The homepage is a **21 : 13 golden rectangle** split into squares of 13, 8, 5, 3, 2, 1 and 1, with a golden spiral drawn through them.

The homepage is a **map**: every square except About opens its own page.

## 2. Homepage layout (`mocks/josue-home.html`)

One CSS grid reproduces the tiling exactly:

```css
.fib {
  aspect-ratio: 21 / 13;
  display: grid;
  grid-template-columns: 13fr 2fr 1fr 5fr;
  grid-template-rows: 8fr 1fr 1fr 3fr;
  grid-template-areas:
    "hero  about about about"
    "hero  gal   now   writing"
    "hero  gal   end   writing"
    "hero  oq    oq    writing";
}
```

| Square | Content on homepage | Click → |
|---|---|---|
| **13 · hero** | Name "Josue *Tapia*" (roman + italic) over the live equivariant field | `/field`: full-screen field playground (group picker C₄/D₄/C₆/D₆/D₈) |
| **8 · About** | §1 About (see §6 content). **Not clickable.** | none |
| **5 · Writing** | §2 Writing, the 3 latest posts | `/writing` index, with each post its own page |
| **3 · Open questions** | §3 Open questions, with the small prime graph as thumbnail | `/open-questions` |
| **2 · Gallery** | §4 Gallery, a mini collage thumbnail, "Open →" | `/gallery` |
| **1 · φ** | the φ glyph | `/now` page, plus a **long-press/secondary action as the theme override** (see §4) |
| **1 · ∎** | the ∎ glyph | contact (mailto, or a small contact page) |

- **Header:** nav only, right-aligned in the top-right corner: Writing · Open questions · Bookshelf · Gallery. There's no bio line, no city or time, and no equation.
- **Square numbers** (13, 8, 5…) sit small and italic in each square's top-right corner.
- **Golden spiral:** a single SVG path over the grid (`viewBox 0 0 21 13`, `preserveAspectRatio="none"`, `vector-effect: non-scaling-stroke`):
  `M0 13 A13 13 0 0 1 13 0 A8 8 0 0 1 21 8 A5 5 0 0 1 16 13 A3 3 0 0 1 13 10 A2 2 0 0 1 15 8 A1 1 0 0 1 16 9 A1 1 0 0 1 15 10`
  - Optional: draw it in with a stroke animation on load, from the 1-square outward.
- **Hover on clickable squares:** the preview brightens and "Open →" appears.
- **Below the grid:** the Bookshelf section (§7), then the footer: "hi at this domain · GitHub · X", "Fibonacci grid, 21 : 13", "© 2026".

## 3. The equivariant field (hero)

A vector field `−∇L(x)` with `L(x) = −Σ_{g∈G} exp(−‖x − g·p‖² / 2σ²)`, where `p` is the cursor and `G` is a dihedral group (default **D₆**, 12 orbit points). The field is equivariant: `f(g·x) = g·f(x)`.

- Arrows sit on a grid (~24px spacing). Each arrow's length and opacity grow with the gradient magnitude.
- Orbit points are drawn as dots with a soft glow. The cursor point gets a ring.
- With no cursor (touch, idle), the point drifts slowly on a Lissajous path so the hero is never static.
- Background: the hero color of the current palette, plus a radial warm glow and a light film grain (see the mock canvas code).
- Use `requestAnimationFrame`, honor `prefers-reduced-motion` (render one static frame), and resize with devicePixelRatio.

## 4. Day-cycle theme (four palettes)

The palette follows **Guadalajara's real sunrise and sunset**: compute them client-side (e.g. with SunCalc) at lat 20.67, lon −103.35. Blend colors over ~60 minutes at each boundary (interpolate in OKLCH).

| Phase | When | Hero bg | Ink (primary text) | Light label | Page bg | Glow |
|---|---|---|---|---|---|---|
| **Dawn** | sunrise → ~9:30 | `#3868F2` | `#7AA2FF` | `#B6CDFF` | `#0A0A12` | warm **orange** sunrise glow from below center (source-over, not additive) |
| **Midday** | ~9:30 → ~15:00 | `#0A6CFF` | `#4FA3FF` | `#A3D1FF` | `#04070B` | white "sun" glow |
| **Afternoon** | ~15:00 → sunset | `#0F4C81` | `#5AA9E6` | `#A8D5F5` | `#05080B` | golden glow |
| **Night** | dusk → sunrise | `#0D2A7A` | `#4D74D9` | `#8EABF0` | `#05060A` | warm orange-pink ember |

Shared tokens: gray (secondary text) `#5D6170`, hairlines `#1C1F2A`, accent orange `#FF6A1F`.

- Implement everything as CSS custom properties on `:root`, and have JS set the phase.
- **Override:** the φ square (or a small control) lets the visitor pick a phase manually. Store the choice in `localStorage` (wrapped in try/catch).
- The mock file `mocks/josue-homepage-dawn.html` is the reference render for Dawn. `josue-homepage-azure/-cyan-steel/-midnight.html` are the other three, but their hero glow is the older additive version. Apply the glow column above.

## 5. Typography

- **Newsreader** (Google Fonts, variable, with optical sizing) is a free stand-in for Stripe Press's **Ivar**. If an Ivar web license is bought later, it should be a one-variable swap.
- Body ~16.5px, weight ~450. Display headings use the optical size automatically.
- Style rule: **two-tone sentences**. The first clause is in ink color and the rest in gray, for example "**Data Science and Mathematics at ITESM.** I love researching and programming stuff."
- Use italic for section labels ("§1 About"), square numbers, author names and captions.
- Monospace only if ever needed: system mono.
- Spacing and type scale use Fibonacci values: 8, 13, 21, 34, 55, 89 px.

## 6. Content

**About (8-square):**
- Headline: **Data Science and Mathematics at ITESM.** I love researching and programming stuff.
- Timeline as a sequence:
  - a₁ **Got a bit obsessed** with math, physics and competitive programming
  - a₂ **AI Engineer Intern** at TRUE
  - a₃ **Quantum physics ML research** — trying to understand a bit of quantum physics `[tile]`
  - lim_{n→∞} aₙ = ? (typeset with n→∞ under "lim")
- `[tile]` is a small 30px generative canvas in the cover style (hero-blue bg, orange tangled "wavefunction" scribble, grain), with the tooltip **"I'm going crazy"**. Code is in the mock.

**Writing (5-square), latest posts (placeholders until real):**
- Equivariance, from first principles. *Draft · why a network should commute with its group*
- Putnam problems vs. a reasoning model. *In progress · same problem, two proofs*
- Clifford algebras for people who code. *Notes*

## 7. Pages

### `/open-questions` (`mocks/open-questions.html`)
- Headline: **Things I don't understand yet** but want to.
- **One list only: "Topics I want to explore".** No research ideas (intentional: don't publish unpublished ideas).
- Entries are numbered by primes: 2, 3, 5, 7, 11, 13…
- Each entry has a title, a status and optional notes or a link.
- Status: curious → reading → working on → understood, shown as a dot filling 0, ⅓, ⅔ and full. Make reading and working-on clearly distinct.
- Understood entries are struck through and link to the Writing post they became.
- Layout: the list takes 13fr of a 13 : 8 split, with the status legend top-right.
- Data: one `open-questions.json` (or MD front-matter) so Josue can update it without touching layout. The current entries are **placeholders**.

### `/gallery` (`mocks/gallery.html`)
- Headline: **Places and moments** I keep coming back to.
- The collage repeats the Fibonacci tiling: 7 photos per spiral (13 = hero photo, 8, 5, 3, 2, 1, 1), with the golden spiral drawn over it and 6px gaps.
- More photos continue as additional spirals on scroll.
- Clicking a photo opens a full-screen lightbox with an optional caption (place, date) and keyboard navigation.
- Photos keep true colors. Only the page chrome follows the day-cycle palette.
- Use responsive images (`srcset`, AVIF/WebP), lazy-loaded.
- Data: `gallery.json` with `{src, alt, caption, date}`. The first entry is the hero.
- **Waiting on Josue's photos.**

### Bookshelf (homepage section + `/bookshelf`)
- Three categories: **Mathematics** (math, physics, ML/CS), **Chess**, **Beyond** (everything else).
- On the homepage it's a light list: a small 8:13 thumbnail, then the title and author in italic. It must not be image-heavy.
- On `/bookshelf`, each book gets a **generative cover** drawn from its idea (canvas: palette blue/orange/black plus grain, one geometric motif per book; see the six examples in the mock). Each category uses a motif family: geometric for Math, board patterns for Chess, freer shapes for Beyond.
- Data: `books.json` with `{title, author, category, motif}`.
- **The current six books are placeholders. Waiting on Josue's real list.**

### `/now`
- What Josue is working on, reading and learning right now. Short, dated.

### `/field`
- The hero field full screen, with a group picker and maybe a σ slider. Small caption: f(g·x) = g·f(x).

## 8. Responsive

- **Below ~900px,** unwind the spiral: stack the squares 13 → 8 → 5 → 3 → 2 → 1 → 1. Each card keeps a consecutive Fibonacci aspect ratio (8/5, 5/3, …), and the spiral is hidden.
- 16px side gutters and no horizontal scroll.
- The field runs at reduced density on mobile.

## 9. Tech suggestions (Claude Code's call)

- A static site: Astro or plain Vite + vanilla JS, deployed on GitHub Pages (Josue's GitHub: `JosueT1212`).
- Posts in Markdown with KaTeX for math.
- Keep everything self-hostable, with no tracking.
- Accessibility: real links for squares (`<a>` wrapping the cell), visible focus rings, `alt` on photos, and contrast checked for every palette.

## 10. Open items for Josue

1. The real book list, under Mathematics, Chess and Beyond.
2. 7–14 favorite photos, plus which one is the hero.
3. Real Open-questions topics.
4. Whether ∎ is contact, or the Bookshelf gets a square instead (contact is in the footer anyway).
