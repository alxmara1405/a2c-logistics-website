# Phase 4: Interim — SEO Crawlability + Structured Data + Polish - Research

**Researched:** 2026-06-29
**Domain:** Build-time prerendering of a Vite 8 / React 19 / React Router 7 SPA on GitHub Pages, SEO structured data (JobPosting / LocalBusiness), per-page metadata, a11y + LCP polish
**Confidence:** HIGH (prerender approach, metadata, structured data, GH Pages mechanics) / MEDIUM (exact LCP numbers, Formspree liveness — needs runtime test)

## Summary

The site is a client-rendered Vite/React SPA on a GitHub Pages **project** page (base path `/a2c-logistics-website/`). Crawlers and link-scrapers receive an empty `<div id="root">` — the #1 SEO defect. Every other requirement (per-page meta, JSON-LD, OG tags) is downstream of fixing crawlability, because all of those tags are injected by React at runtime and therefore also invisible to non-JS crawlers today.

The decisive technical finding: **Vite 8 bundles Rolldown** (`rolldown@1.0.0-rc.10` is a direct dependency of `vite@8.0.1`), so any in-build Rollup-coupled prerender plugin (`@prerenderer/rollup-plugin`) carries real compatibility risk, and `vite-react-ssg@0.9.1-beta.1` peer-caps Vite at `^7` and react-router-dom at `^6.14.1` (project is RR 7.13.2) and is a beta. `react-snap` is stale (last publish 2022) and unsafe on Node 24. The lowest-risk, version-independent approach is a **custom post-build prerender script that drives a real headless browser (`puppeteer`) against Vite's own `preview` server** — `vite preview` serves `dist` under the configured `base` automatically, which cleanly solves the base-path problem, and a real browser sidesteps every SSR-safety concern (`window` usage in `AnimatedBackground`, framer-motion, `100dvh`). React 19 native document metadata and inline JSON-LD are both captured because puppeteer snapshots the fully-rendered post-hydration DOM (React 19 hoists `<title>`/`<meta>`/`<link>` into `<head>` client-side, and the snapshot includes it).

Critically, prerendering **coexists cleanly with the existing GitHub Pages SPA 404 redirect hack**: if the prerenderer writes per-route *folder* files (`dist/about/index.html`, etc.), GitHub Pages serves those files directly for deep links, so the 404→`?/`→index redirect path is never triggered for the 6 known routes. The 404 hack remains only as a fallback for genuinely unknown URLs. The inline redirect script copied into each prerendered page is a no-op unless the URL contains `?/`.

**Primary recommendation:** Add `puppeteer` as the only new runtime-critical dependency; write `scripts/prerender.mjs` that boots `vite preview` programmatically, visits all 6 routes, and writes per-route `index.html` files into `dist/`. Switch `main.jsx` to `hydrateRoot` when prerendered markup is present. Use React 19 native metadata for per-page tags, inline `<script type="application/ld+json">` for structured data, hand-write `sitemap.xml`/`robots.txt`/OG image into `public/`. Fix the red-on-white contrast failures and self-host Inter to clear the render-blocking font request for LCP.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Route HTML for crawlers (INT-SEO-01) | Build step (post-build prerender script) | Static host (GH Pages) | Static-only host has no server runtime; HTML must be materialized at build time |
| Per-page metadata (INT-SEO-02, 06) | Client (React 19 metadata) → baked by prerender | — | React renders tags; prerender snapshot persists them to static HTML |
| Structured data JSON-LD (INT-SEO-03, 04) | Client (component-rendered script) → baked by prerender | — | Static trusted strings; no server needed |
| sitemap.xml / robots.txt (INT-SEO-05) | Static files in `public/` | Google Search Console (sitemap submission) | GH Pages serves them; robots.txt at project path is NOT honored as site-wide (see Pitfall 4) |
| Form submission (INT-UX-01) | Third-party (Formspree) | Client (fetch) | Static host cannot run a form backend; locked decision |
| Contrast / focus / alt (INT-A11Y-01) | Client (CSS/markup) | — | Pure presentation layer |
| Hero LCP (INT-PERF-01) | Static asset + client (`<img>`/preload) | Build (image optimization) | Image delivery + render path |

## Standard Stack

### Core (new dependencies for this phase)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `puppeteer` | `25.2.1` | Headless Chromium driver for the post-build prerender snapshot | The de-facto headless-browser library; peer-accepted by every prerender renderer (`>= 2`). Verified on npm 2026-06-29. `[VERIFIED: npm registry]` (ubiquitous, well-known) |
| `vite` | `8.0.1` (already installed) | `preview()` server boots `dist` under `base` for the prerender crawl — no extra static-server dependency | Already the project bundler; `preview` honors `base` automatically |

**No prerender *plugin* is recommended** — a ~40-line script using `puppeteer` + Vite's programmatic `preview()` is more robust against Vite 8 / Rolldown / RR7 churn than any plugin. See Architecture Patterns.

### Supporting (optional, for polish requirements)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@fontsource-variable/inter` | latest | Self-host Inter to remove the render-blocking Google Fonts `@import` in `index.css` (helps INT-PERF-01 LCP) | INT-PERF-01. Project already uses `@fontsource-variable/geist`, so the pattern is established `[ASSUMED — confirm exact pkg name before install]` |
| `sharp` | `0.35.2` | One-time CLI/script to compress + resize `hero-truck.jpg` and generate responsive sizes + the OG image | INT-PERF-01, INT-SEO-06. Can also be done with any image tool; not a runtime dep |
| `@axe-core/cli` | `4.12.1` | Command-line WCAG AA audit against the preview server (INT-A11Y-01 verification) | Validation only, run via `npx`, no install needed |
| `schema-dts` | `2.0.0` | TypeScript types for JSON-LD (optional; project is JS not TS, so likely skip) | Only if structured data is authored in `.ts` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom puppeteer + `vite preview` script | `@prerenderer/rollup-plugin@0.3.12` + `@prerenderer/renderer-puppeteer@1.2.4` | Less custom code, but hooks into the Rollup plugin API — **Vite 8 uses Rolldown** (`rolldown@1.0.0-rc.10`), so Rollup-plugin compat is unverified/RC-stage. Also still needs `hydrateRoot` + a render-trigger event. Use only if the custom script proves troublesome. |
| Custom puppeteer script | `vite-react-ssg@0.9.1-beta.1` (true SSR) | Cleaner CI (no Chromium) BUT: **beta**, peer-caps `vite@^7` (project is 8) and `react-router-dom@^6.14.1` (project is **RR 7**), requires rewriting the entry to its route-config convention. High integration risk for this exact stack. |
| Custom puppeteer script | `react-snap@1.23.0` | **Rejected.** Last publish 2022; bundles ancient puppeteer; unreliable on Node 24; known framer-motion `opacity:0` baking + crash issues. |
| Custom puppeteer script | `puppeteer-prerender-plugin@3.0.24` | **Rejected for this project** — it is a **Webpack 5** plugin, not a Vite plugin (despite recent maintenance). |
| React 19 native metadata | `react-helmet-async@3.0.0` / `@unhead/react@3.1.6` | Native metadata is the locked decision and works (React 19 hoists tags; prerender captures them). Only fall back to a library if dedup/ordering problems appear — not expected for 6 simple routes. |

**Installation:**
```bash
npm install --save-dev puppeteer sharp
# optional, for LCP font fix:
# npm install @fontsource-variable/inter
```

**Version verification (run 2026-06-29):**
- `puppeteer` → `25.2.1` ✓
- `vite` → `8.0.1` (installed; ships `rolldown@1.0.0-rc.10`) ✓
- `vite-react-ssg` → `0.9.1-beta.1` (peer vite `^7`, RR `^6.14.1`) — **incompatible peers** ✓
- `@prerenderer/rollup-plugin` → `0.3.12`; `@prerenderer/renderer-puppeteer` → `1.2.4` (peer `puppeteer >= 2`) ✓
- `react-snap` → `1.23.0` (2022) ✓
- `sharp` → `0.35.2`; `@axe-core/cli` → `4.12.1`; `schema-dts` → `2.0.0` ✓

## Package Legitimacy Audit

> slopcheck was **not** run in this session (no network-install attempted). Per protocol, packages discovered outside official docs are tagged `[ASSUMED]`. `puppeteer` and `sharp` are first-tier, ubiquitous packages verified directly on the npm registry; the planner should still confirm before install. None of the candidates show suspicious age/download signals.

| Package | Registry | Age | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-------------|-----------|-------------|
| `puppeteer` | npm | 7+ yrs | github.com/puppeteer/puppeteer | not run | Approved (verify) |
| `sharp` | npm | 9+ yrs | github.com/lovell/sharp | not run | Approved (verify) |
| `@fontsource-variable/inter` | npm | mature | github.com/fontsource/font-files | not run | `[ASSUMED]` — confirm exact name |
| `@axe-core/cli` | npm | mature | github.com/dequelabs/axe-core-npm | not run | Run via `npx` (no install) |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged [SUS]:** none
**`postinstall` note:** `puppeteer`'s postinstall downloads Chromium — expected and legitimate, but it is a network/postinstall step the planner should account for in CI (see Environment Availability + Pitfall 5).

## Architecture Patterns

### System Architecture Diagram

```
 BUILD TIME (local or GitHub Actions)
 ───────────────────────────────────
 npm run build
   │
   ├─ (1) vite build ───────────────► dist/  (SPA: index.html shell + /a2c-logistics-website/assets/*)
   │
   └─ (2) node scripts/prerender.mjs
            │
            ├─ vite preview()  ──► local server at http://localhost:PORT/a2c-logistics-website/
            │                        (serves dist UNDER the base path — solves base-path matching)
            │
            ├─ puppeteer launches headless Chromium
            │     for each route in [ '', 'about','services','fleet','drive-with-us','contact' ]:
            │        page.goto(base + route, {waitUntil:'networkidle0'})
            │        page.waitForSelector('main h1')         ← React rendered
            │        (small settle delay: metadata hoist + JSON-LD in DOM)
            │        html = await page.content()             ← full post-hydration DOM
            │        write dist/<route>/index.html  (folder form; home overwrites dist/index.html)
            │
            └─ server.close()

 RUNTIME (GitHub Pages static host)
 ──────────────────────────────────
 GET /a2c-logistics-website/drive-with-us
   │
   ├─ file dist/drive-with-us/index.html EXISTS ──► served directly (real HTML + JSON-LD + meta)
   │                                                  → crawler sees full content, NO 404, NO redirect
   │       └─ browser: main.jsx detects existing markup ──► hydrateRoot() (not createRoot)
   │
   └─ unknown path (no file) ──► GH Pages 404.html ──► redirect to /?/<path>
                                   ──► dist/index.html (prerendered Home) inline script restores path
                                   ──► React Router renders client-side (fallback only)
```

### Recommended File Changes
```
scripts/
└── prerender.mjs        # NEW — post-build snapshot script (puppeteer + vite preview)
public/
├── robots.txt           # NEW (note GH Pages limitation — Pitfall 4)
├── sitemap.xml          # NEW (absolute URLs with base path)
└── og-image.jpg         # NEW (1200×630 static share image)
src/
├── main.jsx             # EDIT — hydrateRoot when prerendered, else createRoot
├── index.css            # EDIT — self-host Inter (drop Google Fonts @import); fix Nevis path
├── seo/                 # NEW (optional) — per-route metadata + JSON-LD helpers
│   ├── Seo.jsx          #   reusable <title>/<meta>/<link rel=canonical> + OG via React 19 tags
│   └── schema.js        #   JobPosting + LocalBusiness builders
├── pages/*.jsx          # EDIT — render <Seo .../> per page; DriveWithUs + Home add JSON-LD
├── components/sections/Hero.jsx  # EDIT — fetchpriority/preload hero image (LCP)
└── components/layout/Footer.jsx  # EDIT — NAP byte-identical to Contact (INT-SEO-04)
package.json             # EDIT — "build": "vite build && node scripts/prerender.mjs"
```

### Pattern 1: Post-build prerender script
**What:** Boot Vite's preview server (honors `base`), snapshot each route with puppeteer, write folder-form HTML.
**When to use:** Always for this phase — it is the INT-SEO-01 implementation.
**Example (skeleton — verify API against installed Vite 8):**
```js
// scripts/prerender.mjs
// Source pattern: Vite programmatic preview() + puppeteer page.content()
import { preview } from 'vite'
import puppeteer from 'puppeteer'
import { writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'

const BASE = '/a2c-logistics-website/'
const ROUTES = ['', 'about', 'services', 'fleet', 'drive-with-us', 'contact']

const server = await preview({ preview: { port: 4173 } }) // serves dist under BASE
const origin = server.resolvedUrls.local[0].replace(/\/$/, '') // .../a2c-logistics-website
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })

for (const route of ROUTES) {
  const page = await browser.newPage()
  await page.goto(`${origin}/${route}`, { waitUntil: 'networkidle0' })
  await page.waitForSelector('main h1')          // React rendered
  await new Promise(r => setTimeout(r, 250))      // settle: metadata hoist + JSON-LD
  const html = '<!doctype html>\n' + await page.evaluate(() => document.documentElement.outerHTML)
  const outPath = route ? join('dist', route, 'index.html') : join('dist', 'index.html')
  await mkdir(dirname(outPath), { recursive: true })
  await writeFile(outPath, html, 'utf8')
  await page.close()
}
await browser.close()
await server.httpServer.close()
```
> Planner: validate the exact `preview()` return shape (`resolvedUrls` / `httpServer.close`) against the installed `vite@8` API during Wave 0 — the API is stable across 5/6/7 but confirm for 8.

### Pattern 2: Hydration entry guard
**What:** Use `hydrateRoot` when prerendered DOM exists, `createRoot` otherwise.
**Example:**
```jsx
// src/main.jsx
import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

const el = document.getElementById('root')
const app = (
  <StrictMode>
    <BrowserRouter basename="/a2c-logistics-website">
      <App />
    </BrowserRouter>
  </StrictMode>
)
if (el.hasChildNodes()) hydrateRoot(el, app)
else createRoot(el).render(app)
```

### Pattern 3: Per-route metadata via React 19 native tags
**What:** Render `<title>`, `<meta>`, `<link rel="canonical">`, OG/Twitter directly in a component; React 19 hoists into `<head>`.
**Why it works for prerender:** React 19 hoists these client-side; the puppeteer snapshot captures the hoisted `<head>`. `[CITED: react.dev/blog/2024/12/05/react-19 — metadata renders during SSR and in client-only apps]`
**Example:**
```jsx
// src/seo/Seo.jsx
const ORIGIN = 'https://alxmara1405.github.io/a2c-logistics-website'
export default function Seo({ path, title, description, ogImage = '/og-image.jpg' }) {
  const url = `${ORIGIN}${path}` // path like '/drive-with-us'
  const img = `${ORIGIN}${ogImage}`
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />
    </>
  )
}
```
> OG/canonical URLs **must be absolute** (origin-qualified) — relative OG image URLs are rejected by most scrapers.

### Pattern 4: JSON-LD injection
**What:** Render an inline `<script type="application/ld+json">` inside the page component with static (trusted) content. React 19 renders it in place; Google reads JSON-LD anywhere in the document; puppeteer bakes it into the static HTML.
**Example:**
```jsx
function JsonLd({ data }) {
  return <script type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}
```
> `dangerouslySetInnerHTML` is safe **only** because the payload is static, developer-authored constants (NAP, pay ranges) — never user input. See Security Domain.

### Anti-Patterns to Avoid
- **Prerendering to flat files (`dist/about.html`) instead of folders (`dist/about/index.html`).** GH Pages clean-URL routing serves the folder `index.html`; flat files break deep-link serving and re-trigger the 404 redirect.
- **Serving `dist` at `/` during prerender.** The built HTML references assets at `/a2c-logistics-website/assets/...`; if the prerender server serves at root, those 404 in headless Chrome and you snapshot a blank/broken page. `vite preview` serving under `base` prevents this.
- **Using `renderToString` SSR (vite-react-ssg) given `AnimatedBackground` touches `window`.** It is in `useEffect` (SSR-safe), but the broader beta/peer-version risk makes a real-browser snapshot the safer call here.
- **Relative or missing absolute URLs in canonical/OG/sitemap.** All must be `https://alxmara1405.github.io/a2c-logistics-website/...`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Headless rendering of routes | A custom DOM serializer / JSDOM render | `puppeteer` against `vite preview` | Real Chromium runs `useEffect`, framer-motion, canvas, React 19 hoist exactly as production |
| Base-path-aware static server for prerender | Hand-rolled express + mounting logic | Vite's programmatic `preview()` | It already serves `dist` under `base`; zero config drift |
| Head tag management | Manual `document.head` mutation in `useEffect` | React 19 native `<title>`/`<meta>` tags | Locked decision; native, SSR/snapshot-friendly, no extra dep |
| JSON-LD types | Free-typed objects with typos | Google Rich Results Test validation (+ optional `schema-dts`) | Schema.org field names are unforgiving; one typo drops the rich result |
| Image compression | Manual ImageMagick guesswork | `sharp` (scripted) | Deterministic responsive sizes + quality control for LCP |

**Key insight:** Everything in this phase is about making *runtime-injected* content *static*. A real headless browser is the only thing that faithfully reproduces what React 19 + framer-motion + canvas actually emit — so snapshot it rather than re-implement rendering.

## Runtime State Inventory

> This phase is additive (SEO/polish), not a rename. Inventory included because it touches build/deploy state.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — static marketing site, no datastore | None (verified: no DB deps in package.json) |
| Live service config | Formspree endpoints `mvzvrleo` (contact) + `mzdkgolq` (apply) — config lives in Formspree's dashboard, not the repo | INT-UX-01: verify ownership + delivery via a real test submission; cannot be confirmed by code inspection alone — **human/content-readiness dependency** |
| OS-registered state | GitHub Pages deployment via `.github/workflows/deploy.yml` (Node 20, `npm run build` → `dist`) | Build script change flows through automatically; puppeteer needs Chromium in CI (Pitfall 5) |
| Secrets/env vars | None in repo. No API keys needed (Formspree is unauthenticated POST) | None |
| Build artifacts | `dist/` regenerated each build; prerender adds per-route folders | None persistent; `dist` is gitignored/CI-built |

**JobPosting freshness is runtime-sensitive:** `datePosted`/`validThrough` are baked at build time. If the site is not rebuilt before `validThrough` passes, Google drops the posting. See Pitfall 3.

## Common Pitfalls

### Pitfall 1: Prerendered content baked with `opacity:0` from framer-motion initial states
**What goes wrong:** `PageTransition`, `ScrollReveal`, and `Hero` use `initial={{ opacity: 0, ... }}`. The snapshot captures elements at their *initial* (hidden) animation state, so the static HTML carries inline `opacity:0`/`transform` styles.
**Why it happens:** puppeteer snapshots before animations complete (or at rest for below-fold `whileInView` elements).
**Impact assessment:** **Does NOT fail any success criterion.** Crawlers read text content regardless of CSS opacity, so `curl` returns the headings/body (Success Criterion #1 ✓). With JS enabled, hydration runs the animations normally. Only a JS-disabled human sees blank content — an edge case.
**How to avoid (optional polish):** Gate initial animation states behind a "has hydrated" flag, or respect `prefers-reduced-motion`, so the snapshot's resting state is visible. Recommend doing this for `Hero` (above the fold) at minimum; leave below-fold `ScrollReveal` as-is.
**Warning signs:** Lighthouse "largest contentful paint element" reports 0 opacity; manual view of `dist/index.html` in a JS-disabled browser shows blank hero.

### Pitfall 2: Hydration mismatch warnings
**What goes wrong:** `hydrateRoot` logs mismatch warnings when prerendered inline styles (framer-motion) differ from first client render, and `Footer` uses `new Date().getFullYear()`.
**Why it happens:** Non-deterministic/animation-driven attributes between snapshot and hydration.
**How to avoid:** React 19 recovers from style-attribute mismatches by re-rendering the subtree (non-fatal). `getFullYear()` is deterministic within a calendar year — acceptable. Do not block on hydration warnings; verify the page is interactive after load instead.

### Pitfall 3: JobPosting `validThrough` expiry on a static site
**What goes wrong:** Google for Jobs drops postings whose `validThrough` is in the past. On a static site the date is frozen at the last build.
**How to avoid:** (1) Compute `datePosted` = build date and `validThrough` = build date + 90 days in `schema.js` at module load. (2) Add a **scheduled GitHub Actions rebuild** (e.g., monthly `cron`) so the dates roll forward. (3) Mark pay as ranges "as of {Month YYYY}" (locked decision) — never single hard numbers.
**Warning signs:** Rich Results Test warns "validThrough is in the past"; posting disappears from Google Jobs.

### Pitfall 4: robots.txt at a project-page path is NOT honored site-wide
**What goes wrong:** Crawlers fetch `robots.txt` from the **domain root** (`https://alxmara1405.github.io/robots.txt`), which belongs to the user's root pages repo — not this project. A `robots.txt` at `/a2c-logistics-website/robots.txt` is effectively ignored as the site-wide robots policy. `[VERIFIED: GitHub community discussion #64865 + multiple sources]`
**How to avoid:** Still ship `public/robots.txt` (harmless, satisfies the literal requirement and references the sitemap), but **do not rely on it** for crawl control. **Submit `sitemap.xml` directly in Google Search Console** — sitemap submission does not require a robots.txt reference. Document this clearly so INT-SEO-05 isn't falsely assumed to give crawl directives.
**Note:** This site *wants* full indexing, so the ignored robots.txt is low-impact — but the sitemap must be submitted via GSC to actually be discovered.

### Pitfall 5: puppeteer in GitHub Actions CI
**What goes wrong:** The prerender step needs Chromium; `npm ci` triggers puppeteer's postinstall download, and headless Chromium needs system libraries.
**How to avoid:** `ubuntu-latest` runners generally include the required shared libs; launch with `args: ['--no-sandbox']`. Confirm the build job (currently Node 20) runs `npm run build` after `npm ci` so the new prerender step executes. If Chromium libs are missing, add an `apt-get install` step or use `browser-actions/setup-chrome`. Budget +30–60s build time.
**Warning signs:** CI error "Failed to launch the browser process" or missing `.so` libraries.

### Pitfall 6: Existing absolute-path asset bugs surface under the base path
**What goes wrong (pre-existing, found during research):**
- `src/index.css` `@font-face` references `url("/assets/fonts/Nevis.ttf")` — an **absolute** path. On the project base path this resolves to `alxmara1405.github.io/assets/fonts/Nevis.ttf` → **404**; the Nevis Bold heading font likely fails to load in production today.
- `index.html` favicon `href="/favicon.svg"` is similarly base-unaware.
**How to avoid:** Reference the font so Vite fingerprints/base-prefixes it (move `Nevis.ttf` into `src/` and `@font-face` via a relative import that Vite processes), or hardcode the full `/a2c-logistics-website/assets/...` path. Fix the favicon to `./favicon.svg` or base-prefixed. These intersect INT-PERF-01/polish and brand fidelity.

### Pitfall 7: Render-blocking Google Fonts `@import` hurts LCP
**What goes wrong:** `index.css` begins with `@import url('https://fonts.googleapis.com/...Inter...')`, a render-blocking external request that delays first paint and the hero text/LCP.
**How to avoid:** Self-host Inter via `@fontsource-variable/inter` (project already uses `@fontsource-variable/geist`), or at minimum add `<link rel="preconnect">` + move to a non-blocking load. Removing the `@import` is the cleanest LCP win for INT-PERF-01.

## Code Examples

### JobPosting JSON-LD for a trucking driver role (company + owner-operator)
```js
// src/seo/schema.js  — Source field rules: Google JobPosting structured-data docs
const ORIGIN = 'https://alxmara1405.github.io/a2c-logistics-website'
const now = new Date()
const validThrough = new Date(now.getTime() + 90 * 864e5) // +90 days; rebuild monthly (Pitfall 3)

export const jobPosting = {
  '@context': 'https://schema.org',
  '@type': 'JobPosting',
  title: 'CDL Class A Truck Driver — Company & Owner-Operator',
  description: '<p>Driver-first trucking company in Lincoln, NE hiring Class A CDL drivers ...</p>', // HTML, REQUIRED
  datePosted: now.toISOString().slice(0, 10),          // REQUIRED, ISO 8601
  validThrough: validThrough.toISOString().slice(0, 10), // RECOMMENDED (future date)
  employmentType: ['FULL_TIME', 'CONTRACTOR'],         // FULL_TIME=company, CONTRACTOR=owner-op
  hiringOrganization: {                                 // REQUIRED
    '@type': 'Organization',
    name: 'A2C Logistics CO.',
    sameAs: ORIGIN,
    logo: `${ORIGIN}/assets/images/A2C_Original_Primary_Color.png`,
  },
  jobLocation: {                                        // REQUIRED for non-remote
    '@type': 'Place',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '5930 Colfax Avenue',
      addressLocality: 'Lincoln',
      addressRegion: 'NE',
      postalCode: '',                                   // [ASSUMED MISSING] — obtain real ZIP
      addressCountry: 'US',                             // REQUIRED inside address
    },
  },
  // Pay as a RANGE marked "as of" (locked decision). Use estimatedSalary if not employer-fixed.
  baseSalary: {
    '@type': 'MonetaryAmount',
    currency: 'USD',
    value: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 0, unitText: 'YEAR' }, // [ASSUMED] fill real range
  },
  identifier: { '@type': 'PropertyValue', name: 'A2C Logistics CO.', value: 'a2c-cdl-driver' },
}
```
> Required (per Google): `title`, `description` (HTML), `datePosted`, `hiringOrganization`, `jobLocation` (with `addressCountry`). Recommended: `validThrough`, `employmentType`, `baseSalary`/`estimatedSalary`, `identifier`. `[CITED: developers.google.com/search/docs/appearance/structured-data/job-posting]`

### Organization / LocalBusiness JSON-LD (home route)
```js
export const localBusiness = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'LocalBusiness'], // trucking co. — LocalBusiness for NAP/local SEO
  name: 'A2C Logistics CO.',
  url: ORIGIN,
  logo: `${ORIGIN}/assets/images/A2C_Original_Primary_Color.png`,
  image: `${ORIGIN}/og-image.jpg`,
  telephone: '+1-833-562-3222',
  email: 'kevin@a2clogisticsco.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '5930 Colfax Avenue',
    addressLocality: 'Lincoln',
    addressRegion: 'NE',
    postalCode: '',                 // [ASSUMED MISSING] — obtain real ZIP
    addressCountry: 'US',
  },
  openingHours: 'Mo-Fr 08:00-18:00', // Mon–Fri 8AM–6PM per NAP
}
```
> **NAP byte-identical rule (INT-SEO-04):** name `A2C Logistics CO.`, address `5930 Colfax Avenue, Lincoln, NE`, phone `(833) 562-3222` must match `src/pages/Contact.jsx` (lines 11–13) and `src/components/layout/Footer.jsx` exactly. Footer currently shows brand text but **no NAP block** — adding NAP to the footer is part of INT-SEO-04.

### sitemap.xml (static, in public/)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://alxmara1405.github.io/a2c-logistics-website/</loc></url>
  <url><loc>https://alxmara1405.github.io/a2c-logistics-website/about</loc></url>
  <url><loc>https://alxmara1405.github.io/a2c-logistics-website/services</loc></url>
  <url><loc>https://alxmara1405.github.io/a2c-logistics-website/fleet</loc></url>
  <url><loc>https://alxmara1405.github.io/a2c-logistics-website/drive-with-us</loc></url>
  <url><loc>https://alxmara1405.github.io/a2c-logistics-website/contact</loc></url>
</urlset>
```

### Hero LCP optimization (Hero.jsx + index.html)
```jsx
// Hero.jsx — promote the LCP image
<img
  src={`${import.meta.env.BASE_URL}assets/images/hero-truck.jpg`}
  alt=""
  fetchpriority="high"
  decoding="async"
  className="absolute inset-0 w-full h-full object-cover"
/>
```
> Also add a preload hint. Because the URL is base-dependent, prefer preloading from JS or accept that the `<img fetchpriority="high">` is the primary lever. Compress/resize `hero-truck.jpg` with `sharp` (target < ~200KB, provide a 1920w + 1280w variant). No CLS risk: the image is `absolute inset-0` inside a fixed `100dvh` container.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `react-helmet` for head tags | React 19 native `<title>`/`<meta>` hoisting | React 19 (Dec 2024) | No head-management dependency needed |
| `react-snap` for SPA prerender | Maintained renderers / custom puppeteer + framework preview | react-snap stale since 2022 | Avoid react-snap on modern Node |
| Vite on Rollup | **Vite 8 on Rolldown** (`rolldown@1.0.0-rc.10`) | Vite 8 (2026) | Rollup-coupled build plugins carry compat risk; favor bundler-agnostic post-build scripts |

**Deprecated/outdated for this project:**
- `react-snap@1.23.0` — unmaintained, Node 24 / modern-Chromium issues.
- `vite-plugin-prerender@1.0.8` (2022) — stale.
- `puppeteer-prerender-plugin` — Webpack-only, not Vite.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `@fontsource-variable/inter` is the correct package name for self-hosting Inter | Supporting stack / Pitfall 7 | Wrong name → install fails; verify on npm before use |
| A2 | Postal/ZIP code for 5930 Colfax Avenue, Lincoln NE is not supplied | JobPosting / LocalBusiness | Google recommends full address; missing ZIP weakens local SEO. Obtain real ZIP. |
| A3 | Real driver pay ranges are not yet available | JobPosting `baseSalary` | Placeholder ranges marked "as of" must be used (locked decision); swap when supplied |
| A4 | Vite 8 `preview()` exposes `resolvedUrls` + `httpServer.close()` as in v5–v7 | Pattern 1 | API drift → script needs adjustment; validate in Wave 0 |
| A5 | Formspree endpoints `mvzvrleo` / `mzdkgolq` ownership/liveness unknown | Runtime State / INT-UX-01 | Dead endpoints = silent lead loss; requires real test submission (human dependency) |
| A6 | `ubuntu-latest` CI runner has Chromium system libs for puppeteer | Pitfall 5 | Missing libs → CI build fails; may need apt-get/setup-chrome step |
| A7 | Google for Jobs accepts a single JobPosting with `employmentType: ['FULL_TIME','CONTRACTOR']` | JobPosting | If split is required, may need two postings; validate in Rich Results Test |

## Open Questions

1. **Are the two Formspree endpoints live and owned? (INT-UX-01)**
   - What we know: Both are hardcoded in `Contact.jsx`/`DriveWithUs.jsx` with "TODO: Replace" comments.
   - What's unclear: Whether submissions actually deliver to an A2C-owned inbox.
   - Recommendation: Plan a task that performs a real test submission to each and confirms receipt; if dead, replace with new owned Formspree forms. Flag as a content-readiness gate.

2. **Real driver pay numbers vs. placeholder ranges? (INT-SEO-03)**
   - What we know: Locked decision allows placeholder ranges marked "as of {Month YYYY}".
   - Recommendation: Ship marked placeholder range now; structured data + copy transfer into the v1.0 rebuild when real numbers arrive.

3. **ZIP code for the Lincoln NE address?**
   - Recommendation: Obtain real postal code to complete `PostalAddress`; leave empty-but-valid otherwise (Google requires `addressCountry` minimally).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build + prerender script | ✓ (local) | v24.14.0 (CI: v20) | — |
| npm | Install | ✓ | 11.9.0 | — |
| Vite | Build + `preview()` for prerender | ✓ | 8.0.1 (installed) | — |
| puppeteer / Chromium | Prerender snapshot | ✗ (not yet installed) | target 25.2.1 | None — required for INT-SEO-01 |
| Chromium system libs (CI) | puppeteer launch in GitHub Actions | ? (ubuntu-latest usually OK) | — | `apt-get install` / `browser-actions/setup-chrome` |
| Internet (Rich Results Test, GSC) | Verification of JSON-LD, sitemap submission | ✓ | — | Manual validation step |

**Missing dependencies with no fallback:** `puppeteer` (must be installed for prerendering — the core of this phase).
**Missing dependencies with fallback:** Chromium CI libs (add a setup step if launch fails).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | **None currently installed** — recommend adding **Vitest** for HTML-assertion checks (Wave 0) |
| Config file | none — see Wave 0 |
| Quick run command | `npx vitest run tests/prerender.test.js` (after Wave 0) |
| Full suite command | `npm run build && npx vitest run && npx @axe-core/cli http://localhost:4173/a2c-logistics-website/` |

> Most success criteria are static-output assertions (does the built HTML contain X?) plus external validators (Rich Results Test, Lighthouse). The highest-value automation is a post-build Vitest suite that reads `dist/**/index.html` and asserts content.

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INT-SEO-01 | Each of 6 `dist/<route>/index.html` contains its H1 + body copy (not empty `#root`) | unit (read dist) | `npx vitest run tests/prerender.test.js` | ❌ Wave 0 |
| INT-SEO-02 | Each route HTML has a **unique** `<title>`, meta description, self-canonical | unit | same suite (assert uniqueness + presence) | ❌ Wave 0 |
| INT-SEO-03 | DriveWithUs HTML contains valid `JobPosting` JSON-LD with required fields | unit + manual | suite: `JSON.parse` + required-key check; **manual: Google Rich Results Test** | ❌ Wave 0 |
| INT-SEO-04 | Home HTML contains `Organization`/`LocalBusiness` JSON-LD; NAP byte-identical across Footer + Contact | unit | suite: parse + string-equality of NAP across files | ❌ Wave 0 |
| INT-SEO-05 | `dist/sitemap.xml` lists 6 base-path URLs; `dist/robots.txt` references sitemap | unit | suite: file exists + URL count | ❌ Wave 0 |
| INT-SEO-06 | Each route HTML has `og:title/description/image` + absolute URLs; `dist/og-image.jpg` exists | unit | suite: meta presence + file exists | ❌ Wave 0 |
| INT-SEO-07 | Keyword-aware H1/headings present (e.g., "CDL Class A ... Lincoln, NE") | manual review | content review | n/a |
| INT-UX-01 | Both Formspree endpoints deliver | manual | **real test submission** (human) | n/a |
| INT-UX-02 | "Q&A Form" heading gone; CTA labels tightened | unit/grep | suite: assert string absent in dist | ❌ Wave 0 |
| INT-A11Y-01 | No WCAG AA contrast failures; visible focus; content-image alt | automated + manual | `npx @axe-core/cli <preview-url>` + Lighthouse a11y; manual focus check | ✓ (axe via npx) |
| INT-PERF-01 | Hero is LCP element, < 2.5s throttled mobile, no CLS | automated | `npx lighthouse <url> --preset=desktop/mobile --only-categories=performance` | ✓ (lighthouse via npx) |

### Sampling Rate
- **Per task commit:** `npx vitest run tests/prerender.test.js` (after build) — fast, asserts prerender output.
- **Per wave merge:** `npm run build && npx vitest run && npx @axe-core/cli <preview-url>`.
- **Phase gate:** Full suite green + manual Rich Results Test (both schemas) + Lighthouse mobile LCP < 2.5s + a real Formspree submission to each endpoint, before `/gsd:verify-work`.

### Wave 0 Gaps
- [ ] `tests/prerender.test.js` — reads `dist/**/index.html`, asserts INT-SEO-01/02/03/04/05/06 + INT-UX-02.
- [ ] Framework install: `npm install --save-dev vitest`
- [ ] `scripts/prerender.mjs` must run before the test suite (tests depend on `dist/`).
- [ ] No `conftest`/fixtures needed (Vitest reads files directly).

*(Lighthouse + axe run via `npx`, no install required.)*

## Security Domain

> `security_enforcement: true`, ASVS level 1. This is a static marketing site with third-party (Formspree) forms, no auth, no server, no datastore — the attack surface is minimal.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No auth on the site |
| V3 Session Management | no | No sessions |
| V4 Access Control | no | All content public |
| V5 Input Validation / Output Encoding | yes (limited) | Form fields are `required`; submission handled by Formspree. **JSON-LD via `dangerouslySetInnerHTML` must use only static, developer-authored constants — never user/runtime input** (XSS vector if violated) |
| V6 Cryptography | no | No secrets; Formspree POST over HTTPS only |
| V14 Configuration | yes (limited) | No secrets committed; ensure form POSTs use `https://formspree.io` (they do) |

### Known Threat Patterns for static React + Formspree

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| JSON-LD injection via `dangerouslySetInnerHTML` | Tampering / XSS | Inject only static constants; if any field ever derives from input, `JSON.stringify` + escape `<`/`>` |
| Form spam / abuse (Formspree, no Turnstile on static host) | Spoofing | Out of scope this phase (real spam defense is v1.0 rebuild); Formspree provides basic spam filtering |
| Mixed content / insecure POST | Information disclosure | Confirm Formspree endpoints are `https://` (verified in source) |
| Leaked secrets | Information disclosure | None present; keep none in repo (static host exposes everything in `dist`) |

## Sources

### Primary (HIGH confidence)
- npm registry (`npm view` on 2026-06-29) — verified versions: `puppeteer@25.2.1`, `vite@8.0.1` (deps `rolldown@1.0.0-rc.10`), `vite-react-ssg@0.9.1-beta.1` (peers vite `^7`, RR `^6.14.1`), `@prerenderer/rollup-plugin@0.3.12`, `@prerenderer/renderer-puppeteer@1.2.4` (peer `puppeteer >= 2`), `react-snap@1.23.0`, `sharp@0.35.2`, `@axe-core/cli@4.12.1`, `schema-dts@2.0.0`, `react-helmet-async@3.0.0`, `@unhead/react@3.1.6`.
- Project codebase (read directly): `vite.config.js`, `index.html`, `public/404.html`, `package.json`, `src/main.jsx`, `src/App.jsx`, `src/index.css`, `src/pages/Contact.jsx`, `src/pages/DriveWithUs.jsx`, `src/components/sections/Hero.jsx`, `src/components/layout/Footer.jsx`, `src/components/sections/AnimatedBackground.jsx`, `.github/workflows/deploy.yml`.
- [react.dev — React 19 release (metadata hoisting works in SSR and client-only apps)](https://react.dev/blog/2024/12/05/react-19)
- [Google — JobPosting structured data](https://developers.google.com/search/docs/appearance/structured-data/job-posting) — required vs recommended fields, salary/employmentType/location rules.

### Secondary (MEDIUM confidence)
- [@prerenderer/rollup-plugin — npm](https://www.npmjs.com/package/@prerenderer/rollup-plugin) and [Vue prerendering with Vite + @prerenderer/rollup-plugin](https://myog.social/articles/vue-prerendering) — `hydrateRoot` + `renderAfterDocumentEvent` pattern (alternative approach).
- [React Router pre-rendering](https://reactrouter.com/how-to/pre-rendering) — RR7 prerender concepts.
- [GitHub community discussion #64865 — robots.txt on github.io pages](https://github.com/orgs/community/discussions/64865) and [GitHub Pages indexing guide](https://filipmikina.com/blog/github-pages-indexing) — robots.txt must be at domain root.

### Tertiary (LOW confidence — validate)
- General community posts on framer-motion `opacity:0` baking during prerender (Pitfall 1) — behavior inferred from how snapshot timing works; verify visually against `dist` output.

## Metadata

**Confidence breakdown:**
- Standard stack / prerender approach: **HIGH** — version incompatibilities (vite-react-ssg peers, react-snap staleness, Vite 8 = Rolldown) verified directly via npm; puppeteer-against-preview is the robust residual.
- React 19 metadata + JSON-LD capture: **HIGH** — official React 19 docs + mechanism (puppeteer snapshots post-hydration DOM).
- JobPosting / LocalBusiness shape: **HIGH** for field requirements (Google docs); **MEDIUM** for the combined company+OO single-posting (A7).
- GH Pages base-path + 404 coexistence: **HIGH** — derived from reading the actual `404.html`, `index.html`, `vite.config.js`, and confirmed GH Pages serving behavior.
- LCP/contrast specifics: **MEDIUM** — contrast ratios computed (red #EF392C on white ≈ 3.97:1 FAILS AA normal text; gray-500 #6b7280 on #f5f5f5 ≈ 4.43:1 marginal FAIL); actual LCP needs a Lighthouse run.
- Formspree liveness: **LOW** — cannot verify by code inspection; requires runtime test.

**Research date:** 2026-06-29
**Valid until:** ~2026-07-29 (fast-moving: Vite 8/Rolldown and vite-react-ssg are actively changing — re-verify peer ranges before install).
```
