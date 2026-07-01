---
phase: 04-interim-seo-crawlability-structured-data-polish-current-site
plan: 04
subsystem: seo
tags: [sitemap, robots, og-image, sharp, vite-public, crawlability, social-share]

requires:
  - phase: 04-01
    provides: sharp installed as a devDependency; Vite build + prerender pipeline that emits dist/
  - phase: 04-03
    provides: Seo component default og:image URL + localBusiness.image referencing ORIGIN/og-image.jpg
provides:
  - public/sitemap.xml listing all 6 routes as absolute base-path ORIGIN URLs
  - public/robots.txt (allow-all + Sitemap: reference)
  - public/og-image.jpg (1200x630 social-share preview)
  - scripts/gen-og-image.mjs (re-runnable sharp generator)
  - tests/static-assets.test.js (dist-root asset verification)
affects: [phase-gate GSC sitemap submission, social-share debugger verification, future domain-root robots policy]

tech-stack:
  added: []
  patterns:
    - "public/* static assets copied verbatim to dist/ root by Vite (analog: public/404.html)"
    - "deterministic image generation via a committed sharp .mjs script whose OUTPUT file is the deliverable"

key-files:
  created:
    - public/sitemap.xml
    - public/robots.txt
    - public/og-image.jpg
    - scripts/gen-og-image.mjs
    - tests/static-assets.test.js
  modified: []

key-decisions:
  - "Sitemap URLs are fully ORIGIN-qualified absolute URLs (not BASE_URL-relative), per the schema.js TWO URL RULES"
  - "og-image sourced by cover-cropping hero-truck.jpg to 1200x630 @ q80 (mozjpeg) -> 121KB, under the ~200KB budget"
  - "robots.txt shipped despite project-path limitation; real crawl discovery relies on GSC sitemap submission"

patterns-established:
  - "Static-asset test suite reads built dist/ output to confirm the public/->dist/ copy pipeline"

requirements-completed: [INT-SEO-05, INT-SEO-06]

duration: 12min
completed: 2026-07-01
---

# Phase 04 Plan 04: Sitemap, Robots & OG Image Summary

**Crawl-discovery and social-share static assets — a 6-route absolute-URL sitemap.xml, a sitemap-referencing robots.txt, and a 1200x630 og-image.jpg — now ship at the GitHub Pages root via Vite's public/ verbatim copy.**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-07-01T13:05Z
- **Completed:** 2026-07-01T13:11Z
- **Tasks:** 3 of 3
- **Files created:** 5

## Accomplishments
- `public/sitemap.xml` lists exactly the 6 App.jsx routes (`/`, `/about`, `/services`, `/fleet`, `/drive-with-us`, `/contact`) as absolute `https://alxmara1405.github.io/a2c-logistics-website/...` URLs.
- `public/robots.txt` allows all crawlers and references the absolute sitemap URL.
- `public/og-image.jpg` (1200x630, 121KB) supplies the actual file behind the Seo component default and `localBusiness.image` from Plan 04-03; generated deterministically by `scripts/gen-og-image.mjs` (sharp cover-crop of `hero-truck.jpg`).
- `tests/static-assets.test.js` confirms all three land in `dist/` root after `npm run build` (Vite public/ copy verified). Full suite 36/36 green (30 prior + 6 new) — no regression to 04-01/04-03 tests.

## Task Commits

Each task was committed atomically:

1. **Task 1: Author public/sitemap.xml and public/robots.txt** - `fabf430` (feat)
2. **Task 2: Generate public/og-image.jpg (1200x630) via sharp** - `171b730` (feat)
3. **Task 3: tests/static-assets.test.js (dist assets present)** - `7b2df40` (test)

_Note: Task 3 is a verification test for the static assets implemented in Tasks 1–2; those assets are its implementation, so it is a single `test(...)` commit rather than a RED/GREEN pair._

## Files Created/Modified
- `public/sitemap.xml` - 6 absolute ORIGIN route URLs in a valid `<urlset>`.
- `public/robots.txt` - `User-agent: * / Allow: /` + `Sitemap:` absolute URL directive.
- `public/og-image.jpg` - 1200x630 JPEG social-share preview (121KB).
- `scripts/gen-og-image.mjs` - ESM sharp script; cover-crops hero-truck.jpg to 1200x630 @ q80, re-runnable.
- `tests/static-assets.test.js` - Vitest suite asserting dist/sitemap.xml (6 absolute URLs), dist/robots.txt (sitemap ref), dist/og-image.jpg present.

## Verification
- `npm run build` → `dist/sitemap.xml` (610B), `dist/robots.txt` (97B), `dist/og-image.jpg` (121KB) all present at root; 6 routes prerendered as before.
- `npx vitest run` → 3 files, 36 tests passed.
- OG image metadata confirmed 1200x630 via sharp.

## Deviations from Plan
None - plan executed exactly as written.

## Manual / Deploy Follow-ups (IMPORTANT — robots-at-project-path caveat)
- **Submit sitemap.xml directly in Google Search Console.** RESEARCH Pitfall 4 / threat T-04-04-robots: a `robots.txt` served from a **project path** (`alxmara1405.github.io/a2c-logistics-website/robots.txt`) is **NOT honored as the site-wide robots policy** — crawlers read robots.txt only from the **domain root** (`alxmara1405.github.io/robots.txt`), which belongs to the user's root GitHub Pages repo, not this project. The robots.txt we ship is still correct and harmless (it references the sitemap and signals allow-all), but actual crawl discovery for this project depends on submitting `sitemap.xml` directly in GSC. This is a deploy-time manual step, not a code fix.
- **Social-share debugger check (phase gate):** paste a route URL into a social debugger (e.g. Facebook Sharing Debugger / X Card Validator) to confirm the OG preview renders the 1200x630 image.

## Threat Surface
Both registered threats handled as planned:
- T-04-04-info (route exposure via sitemap) — **accept**: all 6 routes are intentionally public marketing pages; the site wants full indexing.
- T-04-04-robots (project-path robots misconfiguration) — **mitigate**: documented above; crawl discovery routed through GSC sitemap submission.

No new security-relevant surface introduced beyond the intentionally-public static files.

## Known Stubs
None. All three assets are real, correctly-dimensioned files wired to the paths the Seo component and schema.js already reference.

## Self-Check: PASSED
- FOUND: public/sitemap.xml, public/robots.txt, public/og-image.jpg, scripts/gen-og-image.mjs, tests/static-assets.test.js
- FOUND commits: fabf430, 171b730, 7b2df40
