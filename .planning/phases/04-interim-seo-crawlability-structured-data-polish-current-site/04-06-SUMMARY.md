---
phase: 04-interim-seo-crawlability-structured-data-polish-current-site
plan: 06
subsystem: seo
tags: [seo, metadata, canonical, open-graph, twitter-card, prerender, copy, vitest, react-19]

# Dependency graph
requires:
  - phase: 04-01
    provides: prerender infrastructure (puppeteer + vite preview post-build snapshot of all 6 routes)
  - phase: 04-03
    provides: Seo component (React 19 native document metadata; absolute ORIGIN canonical/OG) + JsonLd
provides:
  - Unique per-route <title>/description/self-canonical + OG/Twitter tags baked into About, Services, Fleet, Contact static HTML
  - All 6 routes now serve distinct, self-consistent metadata (single title/description/canonical each)
  - Contact copy cleanup — "Q&A Form" heading replaced with "Send Us a Message"; weak "Get in Touch" CTAs tightened to "Contact Our Team"
  - tests/metadata.test.js — 32 assertions covering unique-title/description/canonical/OG/Twitter across all 6 routes + Q&A absence
  - Prerender head-sanitation + deferred-write fix (eliminates duplicate/conflicting metadata on every deep-link route)
affects: [phase-3-launch-hardening, v1-astro-rebuild, google-serp-canonicalization]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Per-page metadata: render <Seo path/title/description> as first child inside each page's <PageTransition>; pages pass only path/title/description, absolute ORIGIN canonical/OG handled in Seo.jsx"
    - "Prerender must defer all dist writes until after the render loop so no route's snapshot pollutes another route's SPA fallback (vite preview serves dist/index.html for missing deep-link files)"
    - "Prerender sanitizes <head> before snapshot, keying canonical/og:url on ORIGIN+path and title on document.title, so React-19-hoisted tags + the static shell defaults collapse to one authoritative value per slot"

key-files:
  created:
    - tests/metadata.test.js
  modified:
    - src/pages/About.jsx
    - src/pages/Services.jsx
    - src/pages/Fleet.jsx
    - src/pages/Contact.jsx
    - scripts/prerender.mjs

key-decisions:
  - "Four distinct titles woven with driver-recruiting + Lincoln, NE intent (About = driver-first identity, Services = support/benefits, Fleet = equipment reliability, Contact = CDL driver jobs) — all unique vs Home/DriveWithUs, no keyword stuffing"
  - "Replaced 'Q&A Form' with 'Send Us a Message' (clear, action-aligned, matches the existing 'Send a Message' eyebrow)"
  - "Tightened the two vague 'Get in Touch' CTAs (About, Fleet) to 'Contact Our Team'; Contact page CTAs ('Send Message'/'Send Another Message') were already action-specific and left unchanged"
  - "contactInfo NAP strings + Formspree handler left byte-untouched (byte-source of truth for Footer + schema.js)"

requirements-completed: [INT-SEO-02, INT-SEO-06, INT-SEO-07, INT-UX-02]

# Metrics
duration: 25min
completed: 2026-07-01
---

# Phase 4 Plan 06: Remaining Metadata & Copy Cleanup Summary

**All 6 routes now serve a unique, self-consistent title/description/canonical + OG/Twitter set in static HTML; the awkward "Q&A Form" heading is gone and weak CTAs are tightened — plus a prerender fix that eliminated duplicate, conflicting metadata that had silently affected every deep-link route since 04-03.**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-07-01T13:40Z
- **Completed:** 2026-07-01T14:00Z
- **Tasks:** 3 (all executed)
- **Files modified:** 4 + 1 test created

## Accomplishments
- About, Services, Fleet, Contact each render `<Seo>` (first child inside `<PageTransition>`) with a unique, keyword-aware title + meta description + self-referential absolute canonical + OG/Twitter tags — baked into their prerendered static HTML.
- All 6 route `<title>` values are present and unique; each deep-link now carries exactly ONE `<title>`, one `<meta name="description">`, and one `<link rel="canonical">`.
- Contact copy cleaned: "Q&A Form" → "Send Us a Message"; grep confirms the string is absent from both `src/` and `dist/`.
- Discovered + fixed a pre-existing prerender bug (Rule 1) that baked Home's + the shell's metadata into every deep-link route (3 titles + conflicting canonicals per page).
- `tests/metadata.test.js` (32 assertions) locks in per-route uniqueness, canonical/OG absoluteness, and Q&A absence. Full vitest suite: **68/68 green** (was 36; +32 metadata).

## Task Commits

1. **Task 1: Add unique Seo metadata to About, Services, Fleet** — `3e6850e` (feat)
2. **Task 2: Add Seo to Contact + copy cleanup (Q&A heading, CTA labels)** — `a40b83e` (feat)
3. **Task 3a: Prerender metadata dedupe + deferred writes (Rule 1 fix)** — `f744133` (fix)
4. **Task 3b: tests/metadata.test.js** — `217c6ca` (test)

**Plan metadata:** _(final docs commit — see git log)_

## Files Created/Modified
- `src/pages/About.jsx` — `<Seo path="/about">` ("About A2C Logistics — Driver-First Trucking in Lincoln, NE"); CTA "Get in Touch" → "Contact Our Team".
- `src/pages/Services.jsx` — `<Seo path="/services">` ("Driver Support & Benefits — A2C Logistics, Lincoln, NE").
- `src/pages/Fleet.jsx` — `<Seo path="/fleet">` ("Our Fleet & Equipment — A2C Logistics, Lincoln, NE"); CTA "Get in Touch" → "Contact Our Team".
- `src/pages/Contact.jsx` — `<Seo path="/contact">` ("Contact A2C Logistics — CDL Driver Jobs in Lincoln, NE"); "Q&A Form" heading → "Send Us a Message". NAP + Formspree handler untouched.
- `scripts/prerender.mjs` — deferred snapshot writes + in-page `<head>` sanitation (see Deviations).
- `tests/metadata.test.js` — new sibling test suite (reads the 6 built `dist/**/index.html`).

## Decisions Made
- **Title intent split by page.** Each of the six routes owns a distinct angle so no two SERP entries compete: Home/DriveWithUs (job-search head terms, from 04-03), About (driver-first identity), Services (support & benefits), Fleet (equipment reliability), Contact (CDL driver jobs + local). All read naturally — Lincoln, NE and CDL Class A appear once per title, no stuffing (INT-SEO-07).
- **Minimal, defensible copy edits.** Only genuinely weak labels changed: the "Q&A Form" heading and the two identical vague "Get in Touch" buttons. Action-specific labels already present (form submit, DriveWithUs CTA) were left alone to preserve brand voice.
- **NAP untouched.** `contactInfo` strings are the byte-source of truth for Footer + schema.js (asserted by `structured-data.test.js`), so they were not edited.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Prerender baked duplicate/conflicting metadata into every deep-link route**
- **Found during:** Task 3 (the new metadata test's canonical-equality assertion failed for all 5 non-home routes).
- **Issue:** `scripts/prerender.mjs` wrote each route's snapshot to disk *inside* the render loop. The home route ('') is processed first, overwriting `dist/index.html` with the Home snapshot. Every subsequent deep-link route has no `dist/<route>/index.html` yet, so vite preview's SPA fallback served the just-mutated `dist/index.html` — and React then mounted the real route on top. Result: each deep-link's static HTML carried **three `<title>` elements** (route + Home + static shell) and **two conflicting `<link rel="canonical">`** (Home's `/` first, then the route's). Google honors the first canonical, so every deep link was silently canonicalizing to the homepage — defeating the entire per-page-metadata goal of Plan 04-03/04-06. Pre-existing since 04-01/04-03; `drive-with-us` (shipped in 04-03) was affected too but 04-03's tests never asserted canonical uniqueness.
- **Fix:** (a) Collect all snapshots in memory and flush writes only *after* the render loop, so the SPA fallback stays pinned to the pristine vite-built shell for every route. (b) Sanitize `<head>` in-page before snapshotting — keep the single canonical/og:url matching this route's `ORIGIN+path`, the `<title>`/og:title matching the live `document.title`, and the `meta[name=description]` matching the route's `og:description`. Each route now emits exactly one authoritative value per metadata slot.
- **Files modified:** scripts/prerender.mjs
- **Verification:** Rebuild → every route has 1 title / 1 description / 1 self-referential canonical; `tests/metadata.test.js` 32/32; full suite 68/68.
- **Committed in:** f744133

**Scope note:** This bug predates Plan 04-06 but directly undermines its core requirement (INT-SEO-02/06 — unique per-route metadata in static HTML) and was surfaced by this plan's own acceptance test, so it was fixed here rather than deferred. `drive-with-us` and Home metadata (owned by 04-03) are now also correct.

## TDD Gate Compliance

Task 3 was `tdd="true"`. Because Tasks 1–2 (same plan, earlier waves) author the metadata the test verifies, a strict RED-before-implementation was not applicable for the *metadata-present* assertions — those were GREEN on write. However, the test did function as a RED gate for the **prerender duplication bug**: the canonical-uniqueness assertions failed on first run (5/32 failing), drove the `scripts/prerender.mjs` fix (`f744133`), and went GREEN afterward (`217c6ca`). Net gate sequence in git log: failing-assertion discovery → fix commit → passing test commit.

## Known Stubs

None introduced. (Pre-existing design placeholders — About "Meet the Team" photo stubs, Fleet "Gallery" — are unrelated to this plan's metadata/copy scope and were not touched.)

## Verification
- `npm run build` → 6 routes prerendered; each `dist/**/index.html` has 1 unique `<title>`, 1 `<meta name="description">`, 1 self-referential absolute canonical.
- `grep -rn "Q&A Form" src/ dist/` → not found.
- `npx vitest run tests/metadata.test.js` → 32/32.
- `npx vitest run` (full suite) → 68/68 across prerender, static-assets, structured-data, metadata.

## Self-Check: PASSED

All modified/created files exist on disk (About.jsx, Services.jsx, Fleet.jsx, Contact.jsx, scripts/prerender.mjs, tests/metadata.test.js, 04-06-SUMMARY.md) and all four task commits (3e6850e, a40b83e, f744133, 217c6ca) are present in git history.
