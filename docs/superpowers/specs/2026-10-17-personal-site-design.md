# Josue Tapia personal site — design addendum

**Base spec:** `docs/SPEC.md` (behavior source of truth). **Visual source of truth:** `docs/mocks/` (HTML mocks + PNG renders). This document records intent and the decisions made on top of SPEC.md; where they conflict, this document wins.

## Intent

Audience: Silicon Valley tech people — founders, AI-lab researchers, hiring managers. Two things they must come away with (Josue's words):

1. **Taste**, in the Silicon Valley sense. The site must feel designed, not templated. The Fibonacci tiling, live equivariant field, and day-cycle palette carry this, so polish matters more than feature count.
2. **Genuine curiosity about math and ML.** Proven by content (open questions, writing, bookshelf) and by the `/field` playground, which shows equivariance rather than claiming it.

## Goals

- Faithful build of SPEC.md and the mocks.
- Fast, static, no tracking, self-hostable.
- Josue can update content (posts, open questions, books, gallery, now) by editing Markdown/JSON only.

## Non-goals

- CMS, comments, newsletter, analytics, search.
- Publishing research ideas (intentional, per SPEC §7).

## Anti-goals (failure even if it works)

- Looks like a template or a generic dev portfolio.
- Placeholder content that reads as fake. Unfinished things are shown honestly as unfinished (e.g. "In progress", "Draft"), never as finished.
- Janky motion: dropped frames in the field, layout shift, flash of wrong theme on load.

## Decisions (Josue's)

- **3-square is Open questions.** The mocks still say "Pillars" (nav + 3-square label); replace with "Open questions" everywhere. Nav: Writing · Open questions · Bookshelf · Gallery.
- **∎ square is contact** (resolves SPEC §10 item 4).
- **Build in this folder** (`Personal_page_v2`), not a separate `Personal/Page` repo.
- **Stack: Astro static site, deployed to GitHub Pages** under GitHub user `JosueT1212`.
- **Domain: `jstapia.com`** (just bought). Custom domain on GitHub Pages: `CNAME` file, Astro `site: 'https://jstapia.com'`, no `base` path. Repo: `JosueT1212/JosueT1212.github.io` or any repo with Pages + custom domain (builder's call).
- **Bookshelf: the six mock books are NOT real — remove them.** Real list for launch, both marked **in progress** (currently reading):
  - *Man's Search for Meaning*, Viktor Frankl → Beyond
  - *The Art of Doing Science and Engineering*, Richard Hamming → Mathematics (title confirmed by Josue)
  - `books.json` gains a `status` field (`reading` | `read`). Empty categories (Chess for now) are hidden.
- **Writing:** Josue is currently writing "Equivariance, from first principles." All three posts from SPEC §6 stay listed, marked as in-progress/draft/notes states. None claims to be finished.

## Builder's calls (made by Claude, overridable)

- Posts in Markdown via Astro content collections, math with KaTeX (rendered at build time, remark-math + rehype-katex).
- SunCalc for Guadalajara sunrise/sunset, client-side.
- Newsreader self-hosted or via Google Fonts behind a single `--font-serif` variable so Ivar is a one-line swap.
- Theme set by an inline script in `<head>` before first paint (avoids wrong-theme flash).
- `/now` seeded with one real dated entry: writing about equivariance; reading Frankl and Hamming.
- **Contact (Josue's decision):** ∎ square and footer use `mailto:josuetapiahernandez@gmail.com`. Footer link text "Email" (replaces "hi at this domain"). No X. Footer = "Email · GitHub".
- **Unfinished posts** appear in lists with their status label but are not links. Content collection has `status: draft | in-progress | notes | published`; only `published` gets a route.
- **Open questions:** placeholder topics ship, but no `understood` entries until one links to a real post.
- **Gallery before photos:** the 2-square shows the mini collage thumbnail with "Soon" and is not clickable; `/gallery` and its nav item are omitted until `gallery.json` has entries. Page is still built and works once photos land.
- **Book covers:** fixed motif library: the mock's six cover drawings become named motifs (geometric: vesica, nestedSquares, primeSpiral, cayley; board: knightTour; free: waves), with a seed param. `motif` in `books.json` = `{name, seed?}`. Adding a book = JSON only. More motifs per family get added when real books need them.
- **Midday / Afternoon / Night glows:** designed from the Dawn canvas code using the SPEC §4 glow column (source-over, not additive). Show all four phases to Josue for approval before done.

## Left to the builder

Everything SPEC.md marks as "Claude Code's call", plus: project structure, component breakdown, how the canvas code from the mocks is ported, image pipeline for gallery (Astro `<Picture>` is fine), testing approach, GitHub Actions deploy workflow.
