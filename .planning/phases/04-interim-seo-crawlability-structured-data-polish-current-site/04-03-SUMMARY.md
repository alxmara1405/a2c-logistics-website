---
phase: 04-interim-seo-crawlability-structured-data-polish-current-site
plan: 03
subsystem: seo
tags: [seo, structured-data, json-ld, jobposting, localbusiness, nap, react19-metadata, og-tags]

# Dependency graph
requires:
  - phase: 04-01
    provides: puppeteer prerender snapshot that bakes React 19 metadata + inline JSON-LD into static HTML
provides:
  - Reusable Seo component (per-route title/description/canonical + OG/Twitter, absolute ORIGIN URLs)
  - JobPosting JSON-LD on /drive-with-us (Google-required keys) baked into static HTML
  - Organization/LocalBusiness JSON-LD on home baked into static HTML
  - Footer NAP block byte-identical to Contact.jsx contactInfo
  - Keyword-aware Home + DriveWithUs titles/descriptions/H1 (local CDL-driver intent)
  - tests/structured-data.test.js (JSON-LD validity + NAP byte-equality)
affects:
  - 04-04+ sitemap/robots/OG plan (references og-image.jpg emitted by Seo)
  - v1.0 Astro rebuild inherits the JobPosting/LocalBusiness payload + NAP source-of-truth

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "React 19 native <title>/<meta>/<link canonical> rendered per-route, baked by the 04-01 prerender snapshot"
    - "Inline <script type=application/ld+json> via dangerouslySetInnerHTML with STATIC dev-authored constants only (T-04-03-XSS)"
    - "Two URL rules: crawler metadata (canonical/OG/JSON-LD logo+url) = absolute ORIGIN; runtime assets = BASE_URL-relative"
    - "NAP single-source-of-truth: address/phone in Contact.jsx contactInfo; business name in schema.js localBusiness"

key-files:
  created:
    - src/seo/Seo.jsx
    - src/seo/schema.js
    - tests/structured-data.test.js
  modified:
    - src/components/layout/Footer.jsx
    - src/pages/Home.jsx
    - src/pages/DriveWithUs.jsx

key-decisions:
  - "baseSalary.unitText kept as a valid schema.org duration enum ('YEAR') for Rich Results validity; the 'as of July 2026' marker lives in the JobPosting description + inline comments, not in unitText"
  - "Business-name byte-equality asserted across Footer.jsx + schema.js (its real owners) rather than Contact.jsx, which carries address/phone/email/hours but not the name string and is out of this plan's edit scope"
  - "JsonLd helper lives in Seo.jsx (JSX home) and is imported by pages; schema.js stays pure data (node-importable, no JSX)"

patterns-established:
  - "Pattern: Seo component + JsonLd helper, absolute ORIGIN URLs, React-19-hoisted then prerender-baked"
  - "Pattern: schema.org builders as plain ESM `export const` with datePosted/validThrough computed at module load"

requirements-completed: [INT-SEO-02, INT-SEO-03, INT-SEO-04, INT-SEO-07]
requirements-partial: [INT-SEO-06]

# Metrics
duration: ~35min
completed: 2026-07-01
---

# Phase 04 Plan 03: SEO Components & Structured Data Summary

**A reusable React 19 Seo component plus JobPosting and Organization/LocalBusiness JSON-LD builders, wired into Drive With Us and Home, with a Footer NAP block byte-identical to Contact.jsx — all baked into static HTML by the 04-01 prerender so crawlers and Google for Jobs see the full SEO payload.**

## Performance

- **Duration:** ~35 min active
- **Completed:** 2026-07-01
- **Tasks:** 3 (all committed atomically)
- **Files:** 3 created, 3 modified

## Accomplishments

- `src/seo/Seo.jsx` renders per-route `<title>`, `<meta name=description>`, self-`<link rel=canonical>`, and full OG/Twitter tags using **absolute ORIGIN URLs** (`https://alxmara1405.github.io/a2c-logistics-website`), plus a `JsonLd` helper whose `dangerouslySetInnerHTML` is fed only static developer-authored constants (T-04-03-XSS control satisfied).
- `src/seo/schema.js` exports `jobPosting` (all Google-required keys: title, HTML description, datePosted, hiringOrganization, jobLocation.address.addressCountry; plus validThrough, employmentType `['FULL_TIME','CONTRACTOR']`, baseSalary range, identifier) and `localBusiness` (`['Organization','LocalBusiness']`, NAP, telephone, openingHours). `datePosted`/`validThrough` compute at module load (2026-07-01 / 2026-09-29).
- Home + Drive With Us each carry a **unique** keyword-aware title, meta description, self-canonical, and OG/Twitter tags baked into `dist/index.html` and `dist/drive-with-us/index.html`.
- Drive With Us H1 is now keyword-aware — "CDL Class A Driver Jobs in Lincoln, NE" — with "Drive with A2C" woven naturally into the subhead (no stuffing, INT-SEO-07).
- Footer gained a NAP `<address>` block byte-identical to Contact.jsx contactInfo, baked into every prerendered page footer.
- `tests/structured-data.test.js` (9 assertions) parses the JSON-LD out of built HTML and checks required keys + NAP byte-equality; full suite is 30/30 green (21 from 04-01 + 9 new).

## Task Commits

1. **Task 1: Seo.jsx + schema.js (contracts first)** — `3820250` (feat)
2. **Task 2: Footer NAP + wire Seo/JSON-LD into Home & DriveWithUs** — `0e59f84` (feat)
3. **Task 3: tests/structured-data.test.js** — `c07ee43` (test)

## Files Created/Modified

- `src/seo/Seo.jsx` (new) — `Seo({ path, title, description, ogImage })` React-19 metadata fragment + named `JsonLd` export.
- `src/seo/schema.js` (new) — `jobPosting` + `localBusiness` JSON-LD builders; NAP byte-copied from Contact.jsx; placeholder pay + empty ZIP inline-flagged.
- `src/components/layout/Footer.jsx` — added NAP `<address>` block (name/street/city/phone/email/hours).
- `src/pages/Home.jsx` — `<Seo path="/">` + `<JsonLd data={localBusiness} />` as first PageTransition children.
- `src/pages/DriveWithUs.jsx` — `<Seo path="/drive-with-us">` + `<JsonLd data={jobPosting} />`; keyword-aware H1 + subhead.
- `tests/structured-data.test.js` (new) — JSON-LD validity (INT-SEO-03) + NAP byte-equality (INT-SEO-04).

## Deviations from Plan

### Adjusted (Rule 3 — plan assertion vs. real file contents)

**1. NAP business-name byte-equality asserted against Footer.jsx + schema.js, not Contact.jsx**
- **Found during:** Task 3 (writing the NAP byte-equality test).
- **Issue:** The plan must-have states name/street/locality/region/phone are byte-identical across Contact.jsx, Footer.jsx, and schema.js. In reality `src/pages/Contact.jsx` `contactInfo` carries street/locality/region/phone/email/hours but **not** the business-name string `A2C Logistics CO.` (grep count 0). Contact.jsx is not in this plan's `files_modified` scope.
- **Fix:** The test asserts the address-block NAP (`5930 Colfax Avenue`, `Lincoln`, `NE`, `(833) 562-3222`) byte-identical across Contact.jsx + Footer.jsx (their true shared source), and the business name `A2C Logistics CO.` byte-identical across Footer.jsx + schema.js (its canonical owner). The home JSON-LD test additionally pins `name === 'A2C Logistics CO.'`. Full NAP coverage is achieved without an out-of-scope Contact.jsx edit.
- **Files:** tests/structured-data.test.js
- **Commit:** c07ee43

**2. baseSalary.unitText kept as a valid duration enum instead of an "as of" string**
- **Found during:** Task 1.
- **Issue:** The plan action text says set `unitText` "as of {Month YYYY}". `unitText` in a schema.org `QuantitativeValue` must be a duration enum (YEAR/MONTH/WEEK/DAY/HOUR); a free-text value would fail the Google Rich Results Test, defeating the phase success criterion (zero JobPosting errors).
- **Fix:** Kept `unitText: 'YEAR'` and placed the "as of July 2026" staleness marker in the JobPosting `description` HTML and inline comments. Intent (marked, dated placeholder range) is preserved with valid structured data.
- **Files:** src/seo/schema.js
- **Commit:** 3820250

## Known Stubs / Content Dependencies (flagged)

| Item | File | State | Resolution |
|------|------|-------|------------|
| ZIP / postalCode | src/seo/schema.js (jobPosting + localBusiness) | `postalCode: ''` with inline `// ZIP pending` comment; `addressCountry: 'US'` satisfies Google minimally | Obtain real ZIP for 5930 Colfax Avenue, Lincoln NE (RESEARCH A2) — open content dependency |
| Driver pay range | src/seo/schema.js (jobPosting.baseSalary) | PLACEHOLDER `60000–90000 USD/YEAR`, inline-commented, marked "as of July 2026" in description | Swap min/maxValue when confirmed A2C figures arrive (locked decision: publish as marked range, never single number) |
| og-image.jpg | Seo `og:image` → `${ORIGIN}/og-image.jpg` | URL emitted; the actual `public/og-image.jpg` file is produced by the sitemap/robots/OG plan (04-04), not this one | Created downstream; OG meta tags themselves are already baked |

**JobPosting freshness:** `validThrough` (2026-09-29) freezes at build time on the static host. A scheduled monthly GitHub Actions rebuild (cron) must roll `datePosted`/`validThrough` forward or Google for Jobs drops the posting (Pitfall 3 / T-04-03-stale). This CI schedule is a deploy-config follow-up (noted in 04-01 deploy notes).

## Threat Flags

None. The only trust boundary (developer constants → `dangerouslySetInnerHTML`) is mitigated exactly as the threat register (T-04-03-XSS) requires: JSON-LD payloads are static constants from schema.js with zero interpolation of request/form/URL input. No new security surface introduced.

## Verification Results

- `npm run build` → exit 0; all 6 routes snapshot (drive-with-us 27.8 KB now includes JobPosting JSON-LD).
- Task 1 automated: `schema.js` exports present, all required jobPosting keys present, `addressCountry` present, `localBusiness.name === 'A2C Logistics CO.'` → `schema ok`.
- Task 2 automated: `dist/drive-with-us/index.html` contains `application/ld+json` + `JobPosting`; `dist/index.html` contains `application/ld+json` + `LocalBusiness` + baked Footer NAP (`5930 Colfax Avenue`); unique titles + self-canonical confirmed in built HTML; H1 keyword-aware `true`.
- Task 3: `npx vitest run tests/structured-data.test.js` → 9/9 green. Full suite `npx vitest run` → 30/30 green (no 04-01 regression from the H1 change; "Drive With" still present via footer nav + subhead).

## TDD Gate Compliance

Task 3 was `tdd="true"` and is a **test-only** task (creates `tests/structured-data.test.js`; no non-test source files). The behavior it guards (JSON-LD payloads + Footer NAP) was implemented and committed in Tasks 1–2, so the suite went green immediately — it codifies/guards INT-SEO-03/04 rather than driving net-new behavior into `dist`. This mirrors the 04-01 Task 3 precedent. RED gate: `c07ee43` (`test(...)`). No separate GREEN/`feat` commit applies because the task adds no production code. The MVP+TDD runtime gate was not active (orchestrator did not pass MVP_MODE/TDD_MODE).

## Next Phase Readiness

- Structured-data + per-page metadata payload is complete and baked; the remaining Phase 4 plan (sitemap.xml / robots.txt / og-image.jpg + a11y/LCP polish) can proceed.
- Phase gate still requires manual validation: run `dist/drive-with-us/index.html` and `dist/index.html` through the Google Rich Results Test (expect zero JobPosting + LocalBusiness errors) before `/gsd:verify-work`.
- Content dependencies (real ZIP, real pay range) remain open — they swap into schema.js and transfer into the v1.0 Astro rebuild.

## Self-Check: PASSED
