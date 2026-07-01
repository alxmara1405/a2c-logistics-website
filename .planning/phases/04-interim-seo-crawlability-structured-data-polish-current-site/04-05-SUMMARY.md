---
phase: 04-interim-seo-crawlability-structured-data-polish-current-site
plan: 05
subsystem: ui
tags: [performance, accessibility, wcag, fonts, fontsource, inter, lcp, sharp, axe-core, lighthouse, tailwind]

# Dependency graph
requires:
  - phase: 04-01
    provides: prerender infrastructure (puppeteer + vite preview post-build snapshot of all 6 routes)
provides:
  - Self-hosted Inter (variable) via @fontsource-variable/inter; render-blocking Google Fonts @import removed
  - Base-path-safe Nevis Bold @font-face (moved into src/, Vite-fingerprinted; no 404 under project base)
  - Hero LCP image prioritized (fetchpriority/decoding), compressed 304KB -> 197KB, hydrated-flag opacity gate (no CLS)
  - WCAG AA color contrast (darkened brand red for small text/buttons on light grounds; gray text bumped)
  - Site-wide visible :focus-visible ring; descriptive content-image alt; labeled Select trigger
affects: [phase-3-launch-hardening, lighthouse-ci, axe-ci, v1-astro-rebuild]

# Tech tracking
tech-stack:
  added: ["@fontsource-variable/inter@5.2.8 (self-hosted variable font)"]
  patterns:
    - "Self-host fonts via Fontsource CSS @import (family 'Inter Variable'); never Google Fonts CDN"
    - "Reference src/-relative font/asset URLs so Vite fingerprints + base-prefixes them (base-safe)"
    - "AA contrast via a darkened accent token (--color-a2c-red-ink) for small text/buttons; brand accent token unchanged"
    - "puppeteer + injected axe-core as the local a11y gate when @axe-core/cli chromedriver mismatches"

key-files:
  created:
    - src/assets/fonts/Nevis.ttf (moved from public/ for Vite fingerprinting)
  modified:
    - src/index.css
    - src/components/sections/Hero.jsx
    - src/components/layout/Navbar.jsx
    - src/pages/Home.jsx
    - src/pages/About.jsx
    - src/pages/Services.jsx
    - src/pages/Fleet.jsx
    - src/pages/DriveWithUs.jsx
    - src/pages/Contact.jsx

key-decisions:
  - "Kept brand red #EF392C as the --color-a2c-red accent; added --color-a2c-red-ink #D42A1E ONLY for small text + button fills on light grounds (white-on-#D42A1E = 5.06:1 AA)"
  - "Distinguished light- vs dark-ground eyebrows by their existing margin utility (mb-3 = light section eyebrows -> darken; mb-4 = dark hero eyebrows -> leave, red-on-black already 5.29:1)"
  - "Set --font-body/--font-sans to 'Inter Variable' (Fontsource family name) with 'Inter' fallback so the self-hosted font actually renders"
  - "Moved Nevis.ttf into src/ (relative url) rather than hardcoding the base path, so the font survives any future base change"
  - "Compressed hero in a single pass from the pristine git original (q60 mozjpeg, 1920w) to avoid double-encode artifacts"

patterns-established:
  - "Pattern: darkened-accent contrast token — keep the brand accent, add an -ink variant for text/interactive use on light grounds"
  - "Pattern: hydration-gated above-fold motion (initial={hydrated ? {...} : false}) so prerender snapshots are never baked at opacity 0"

requirements-completed: [INT-PERF-01, INT-A11Y-01]

# Metrics
duration: 35min
completed: 2026-07-01
---

# Phase 4 Plan 05: LCP, Fonts & Accessibility Summary

**Self-hosted Inter (dropped render-blocking Google Fonts), base-safe Nevis font, compressed/prioritized hero LCP with zero CLS, and a clean WCAG AA pass (0 axe violations across all 6 routes) achieved without abandoning the #EF392C brand red.**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-07-01T18:11Z
- **Completed:** 2026-07-01T18:46Z
- **Tasks:** 3 (Task 1 checkpoint pre-resolved by orchestrator; Tasks 2–3 executed)
- **Files modified:** 9 (+1 moved)

## Accomplishments
- Removed the render-blocking `@import` to `fonts.googleapis.com`; Inter now self-hosted via `@fontsource-variable/inter` (8 fingerprinted woff2 subsets emitted at build).
- Fixed the Nevis Bold `@font-face` 404: font moved to `src/assets/fonts/` and referenced relatively, so Vite emits `/a2c-logistics-website/assets/Nevis-*.ttf` (base-prefixed) instead of the base-unaware `/assets/fonts/Nevis.ttf`.
- Hero `<img>` is now the prioritized LCP element (`fetchpriority="high"` + `decoding="async"`), `hero-truck.jpg` recompressed 304KB → 197KB, and above-fold entrance animations are hydration-gated so the prerender snapshot is never baked at opacity 0. Lighthouse **CLS = 0**.
- WCAG AA: **axe-core (wcag2a + wcag2aa) reports 0 violations on all 6 routes** (home, about, services, fleet, drive-with-us, contact).

## Task Commits

1. **Task 2: Self-host Inter, fix Nevis path, optimize hero LCP** — `914c1fd` (feat)
2. **Task 3: WCAG AA contrast, focus states, content-image alt** — `657d78b` (fix)

**Plan metadata:** _(final docs commit — see git log)_

Task 1 was a `checkpoint:human-verify` for `@fontsource-variable/inter` legitimacy; the orchestrator pre-verified it (`npm view` → v5.2.8, official Fontsource publisher), so execution proceeded without pausing.

## Files Created/Modified
- `src/index.css` — Fontsource Inter import (replaces Google Fonts); base-relative Nevis src; `Inter Variable` font tokens; `--color-a2c-red-ink` AA token; global `:focus-visible` ring.
- `src/assets/fonts/Nevis.ttf` — moved from `public/assets/fonts/` for Vite fingerprinting.
- `src/components/sections/Hero.jsx` — LCP img `fetchpriority`/`decoding`; hydrated-flag opacity gate; button fill → red-ink.
- `src/components/layout/Navbar.jsx` — CTA button fills → red-ink.
- `src/pages/{Home,About,Services,Fleet,DriveWithUs,Contact}.jsx` — light-ground eyebrow labels → red-ink; red-fill CTA buttons → red-ink; gray-500 → gray-600; descriptive Fleet gallery alt; `aria-label` on experience Select trigger; placeholder label darkened.

## Decisions Made
- **Brand-red preserved, contrast met via a darker sibling token.** `--color-a2c-red` stays `#EF392C` (large display text, icons, dark-ground eyebrows — all already ≥3:1 / ≥4.5:1). A new `--color-a2c-red-ink` `#D42A1E` covers the failing small-text and button-fill cases on light grounds (5.06:1 on white, 4.64:1 on #f5f5f5; white-on-red-ink button text 5.06:1). This satisfies the "keep the brand red, darken minimally" constraint rather than restyling eyebrows to "large text".
- **Ground detection via existing margin utility.** All light-section eyebrows already used `mb-3` and all dark-hero eyebrows used `mb-4`, giving a zero-guesswork way to darken only the failing (light-ground) labels.
- **`Inter Variable` family name.** Fontsource variable Inter exposes the CSS family `Inter Variable`, so the tokens were set to `"Inter Variable", "Inter", system-ui, sans-serif` — required for the self-hosted font to actually apply (the plan's "keep Inter" intent preserved via fallback).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Font token had to reference the Fontsource family name**
- **Found during:** Task 2
- **Issue:** `@fontsource-variable/inter` registers the CSS family `Inter Variable`, not `Inter`. Keeping `--font-body: "Inter"` verbatim would have silently fallen back to `system-ui` — the self-host would not render.
- **Fix:** Set `--font-body`/`--font-sans` to `"Inter Variable", "Inter", system-ui, sans-serif` (keeps `Inter` in the stack per plan intent).
- **Files modified:** src/index.css
- **Verification:** Build emits Inter woff2 subsets; body renders Inter.
- **Committed in:** 914c1fd

**2. [Rule 2 - Missing Critical a11y] Red-fill CTA buttons failed AA (white-on-red 3.96:1)**
- **Found during:** Task 3 (axe audit)
- **Issue:** Every `bg-a2c-red text-white` button (9 sites incl. Navbar, Hero, all page CTAs, both form submits) computed 3.96:1 — below AA. The plan called out the red *eyebrow* text but the same failure applies to red button fills.
- **Fix:** Switched button fills to `bg-a2c-red-ink` (white text now 5.06:1). Brand accent token unchanged.
- **Files modified:** Hero.jsx, Navbar.jsx, Home/About/Services/Fleet/DriveWithUs/Contact.jsx
- **Verification:** axe wcag2aa → 0 contrast violations.
- **Committed in:** 657d78b

**3. [Rule 2 - Missing Critical a11y] Experience `<Select>` trigger had no accessible name**
- **Found during:** Task 3 (axe audit — critical `button-name` violation on /drive-with-us)
- **Issue:** The base-ui Select trigger (`role="combobox"`) generated its own id, so the adjacent `<Label htmlFor="experience">` was not associated → no accessible name.
- **Fix:** Added `aria-label="Years of Experience (CDL Class A)"` to the `SelectTrigger`.
- **Files modified:** src/pages/DriveWithUs.jsx
- **Verification:** axe → 0 `button-name` violations.
- **Committed in:** 657d78b

**4. [Rule 2 - Missing Critical a11y] Marginal gray text + invisible placeholder label**
- **Found during:** Task 3
- **Issue:** `text-gray-500` on `#f5f5f5` = 4.43:1 (fails AA); the team-photo placeholder used `text-a2c-gray` (#D9D9D9) on a light-gray circle (effectively invisible).
- **Fix:** Bumped the flagged `text-gray-500` usages to `text-gray-600` (6.93:1) and darkened the placeholder label.
- **Files modified:** About.jsx, Contact.jsx
- **Verification:** axe → 0 contrast violations.
- **Committed in:** 657d78b

---

**Total deviations:** 4 auto-fixed (1 blocking, 3 missing-critical a11y). All within the plan's INT-A11Y-01 correctness scope — no restyle, no brand-token change, no new architecture.
**Impact on plan:** None negative. The plan named the eyebrow-text contrast case; the axe audit surfaced the same root cause in buttons + two adjacent a11y gaps, all fixed under Rule 2.

## Verification Results

**axe-core 4.12.1 (wcag2a + wcag2aa), all 6 prerendered routes — via puppeteer (bundled Chromium):**
```
/(home) 0 · /about 0 · /services 0 · /fleet 0 · /drive-with-us 0 · /contact 0
TOTAL WCAG A/AA VIOLATIONS: 0
```

**Lighthouse 13.4.0 (performance, home route, local preview):**
- Performance score: **84**
- LCP: 3.6 s · FCP: 2.2 s · **CLS: 0** · TBT: 190 ms

Notes:
- `@axe-core/cli` could not run directly — the environment's ChromeDriver 150 does not match the installed Chrome 149. Substituted an equivalent puppeteer + injected `axe-core` audit (same engine/version, `axe-core` installed with `--no-save` so it is not a project dependency).
- CLS = 0 confirms the hero optimization introduced no layout shift (a plan must-have). The residual LCP (>2.5s target) is dominated by the pre-existing 573KB single-chunk SPA bundle (out of scope for this plan; the v1 Astro rebuild's zero-JS-by-default posture is the structural fix). This plan removed the render-blocking font request and prioritized+compressed the LCP image — the font/image contributions to LCP are addressed.

## Build / Test
- `npm run build` exits 0; prerender emits all 6 folder-form routes.
- Full vitest suite: **36/36 passing**.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- Perf + a11y polish for the interim (current-site) track is complete: fonts self-hosted, hero LCP optimized, WCAG AA clean.
- Phase-gate follow-ups (non-blocking): run the authoritative Lighthouse in CI (GitHub Actions has matching Chrome), and keyboard-tab a real browser to eye-check the new focus rings.
- Remaining structural LCP win (JS bundle size) is a v1 Astro-rebuild concern, not an interim fix.

## Self-Check: PASSED
- Files verified on disk: src/assets/fonts/Nevis.ttf, src/index.css, src/components/sections/Hero.jsx, 04-05-SUMMARY.md
- Commits verified in git: 914c1fd (Task 2), 657d78b (Task 3)

---
*Phase: 04-interim-seo-crawlability-structured-data-polish-current-site*
*Completed: 2026-07-01*
