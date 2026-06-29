# Phase 4: Interim — SEO Crawlability + Structured Data + Polish - Pattern Map

**Mapped:** 2026-06-29
**Files analyzed:** 14 (3 new dirs/files, 11 edits) — actually 6 new + 8 modified
**Analogs found:** 11 / 14 (3 net-new have no in-repo analog; use RESEARCH.md skeletons)

> Stack reminder: this phase modifies the **existing committed React 19 + Vite 8 + React Router 7 SPA** on GitHub Pages (base `/a2c-logistics-website/`). The CLAUDE.md "Technology Stack" (Astro) section describes the PAUSED v1.0 rebuild and does **not** apply here. All patterns below are extracted from real files in `src/`, `public/`, root config.

---

## File Classification

| New/Modified File | Status | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|--------|------|-----------|----------------|---------------|
| `scripts/prerender.mjs` | NEW | build script | batch / file-I/O | _none in repo_ | no analog — use RESEARCH Pattern 1 |
| `src/main.jsx` | EDIT | entry/bootstrap | request-response (render) | itself (current `createRoot`) | exact (self) |
| `src/seo/Seo.jsx` | NEW | component (presentational, head tags) | render-only | `src/components/sections/PageTransition.jsx` (tiny wrapper component) | role-match |
| `src/seo/schema.js` | NEW | utility (data builder) | transform | `src/pages/*.jsx` module-scope const arrays (e.g. `services`, `contactInfo`) | partial (data-shape) |
| `src/pages/Home.jsx` | EDIT | page | render-only + JSON-LD inject | itself + `src/pages/DriveWithUs.jsx` | exact (self) |
| `src/pages/DriveWithUs.jsx` | EDIT | page | render-only + JSON-LD inject + form | itself | exact (self) |
| `src/pages/Contact.jsx` | EDIT | page | render-only + form | itself (copy-cleanup "Q&A Form") | exact (self) |
| `src/pages/About.jsx` / `Services.jsx` / `Fleet.jsx` | EDIT | page | render-only | `src/pages/DriveWithUs.jsx` hero block | exact (sibling) |
| `src/components/sections/Hero.jsx` | EDIT | component (section) | render-only (LCP image) | itself (lines 10-14 `<img>`) | exact (self) |
| `src/components/layout/Footer.jsx` | EDIT | component (layout) | render-only (add NAP) | `src/pages/Contact.jsx` `contactInfo` (lines 10-15) | role/data-match |
| `src/index.css` | EDIT | config (styles/fonts) | n/a | itself (lines 1-9 font decls) | exact (self) |
| `index.html` | EDIT | config (root HTML) | n/a | itself (favicon line 5, SPA script 12-21) | exact (self) |
| `public/sitemap.xml` | NEW | static asset | n/a | `public/404.html` (existing public static file) | partial (location only) |
| `public/robots.txt` | NEW | static asset | n/a | `public/404.html` | partial (location only) |
| `public/og-image.jpg` | NEW | static asset (image) | n/a | `public/assets/images/hero-truck.jpg` | partial (asset kind) |
| `package.json` | EDIT | config | n/a | itself (`scripts` block lines 6-11) | exact (self) |
| `.github/workflows/deploy.yml` | EDIT (if Chromium libs needed) | config (CI) | n/a | itself (build job) | exact (self) |
| `tests/prerender.test.js` | NEW (Wave 0) | test | read-assert (file-I/O) | _none — no test suite exists_ | no analog |

---

## Pattern Assignments

### `scripts/prerender.mjs` (NEW — build script, batch/file-I/O)

**Analog:** None in repo (no `scripts/` dir exists). Use RESEARCH.md Pattern 1 skeleton (RESEARCH lines 152-181) verbatim as the starting point.

**Hard constraints extracted from real files the script must respect:**
- `vite.config.js` line 8: `base: '/a2c-logistics-website/'` → the prerender server serves under this base; visit `origin + '/' + route` where `origin` already ends in `/a2c-logistics-website`.
- Routes to crawl come from `src/App.jsx` lines 21-26 — exactly: `''`, `'about'`, `'services'`, `'fleet'`, `'drive-with-us'`, `'contact'`.
- Wait selector: every page renders `<main>` (App.jsx line 18 `<main className="flex-1">`) wrapping an `h1`. Pages use `font-heading` `<h1>` (DriveWithUs.jsx line 77, Contact.jsx line 51). Home's H1 is inside `Hero` (Hero.jsx line 29). So `page.waitForSelector('main h1')` is valid for all 6.
- Output **folder form** `dist/<route>/index.html` (home → `dist/index.html`) — anti-pattern to flatten (RESEARCH line 248).
- `package.json` is `"type": "module"` (line 4) → `.mjs` ESM `import` syntax is correct; no CJS.

**Build wiring (package.json, lines 6-11 current):**
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview"
}
```
→ change `"build"` to `"vite build && node scripts/prerender.mjs"` (RESEARCH line 145).

---

### `src/main.jsx` (EDIT — entry/bootstrap, render)

**Analog:** itself. Current full file:
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename="/a2c-logistics-website">
      <App />
    </BrowserRouter>
  </StrictMode>,
)
```

**Change:** add `hydrateRoot` import and the `hasChildNodes()` guard (RESEARCH Pattern 2, lines 186-204). **Preserve `basename="/a2c-logistics-website"` exactly** (line 9) — it is the runtime half of the base-path contract; prerendered HTML's RR links depend on it.

---

### `src/seo/Seo.jsx` (NEW — presentational component, render-only)

**Analog:** `src/components/sections/PageTransition.jsx` — the repo's pattern for a tiny single-purpose wrapper component (default export, no state):
```jsx
import { motion } from 'framer-motion'

export default function PageTransition({ children }) {
  return ( /* ... */ )
}
```

**Pattern to copy:** `export default function Name({ props })` returning JSX, no `.jsx` ceremony beyond that. For `Seo`, return a React fragment of `<title>/<meta>/<link>` (RESEARCH Pattern 3, lines 211-232). React 19 hoists them; puppeteer bakes them.

**Origin constant:** absolute URLs required (RESEARCH line 234). Use `const ORIGIN = 'https://alxmara1405.github.io/a2c-logistics-website'`. Note this differs from the runtime `import.meta.env.BASE_URL` pattern (used in Hero/Footer for *assets*) — canonical/OG URLs must be fully origin-qualified, not base-relative.

---

### `src/seo/schema.js` (NEW — data-builder utility, transform)

**Analog:** module-scope const data objects in pages, e.g. `src/pages/Contact.jsx` lines 10-15:
```jsx
const contactInfo = [
  { icon: Phone, label: 'Phone', value: '(833) 562-3222', href: 'tel:+18335623222' },
  { icon: Mail, label: 'Email', value: 'kevin@a2clogisticsco.com', href: 'mailto:kevin@a2clogisticsco.com' },
  { icon: MapPin, label: 'Address', value: '5930 Colfax Avenue, Lincoln, NE', href: null },
  { icon: Clock, label: 'Hours', value: 'Mon–Fri: 8AM–6PM', href: null },
]
```

**This is the byte-source-of-truth for NAP** (INT-SEO-04). The `jobPosting`/`localBusiness` builders (RESEARCH lines 322-383) MUST reproduce these exact strings:
- name `A2C Logistics CO.`
- street `5930 Colfax Avenue`, locality `Lincoln`, region `NE`
- phone `(833) 562-3222` → schema `telephone: '+1-833-562-3222'`
- email `kevin@a2clogisticsco.com`
- hours `Mon–Fri 8AM–6PM` → schema `openingHours: 'Mo-Fr 08:00-18:00'`
- logo asset exists: `public/assets/images/A2C_Original_Primary_Color.png` (confirmed on disk) → `${ORIGIN}/assets/images/A2C_Original_Primary_Color.png` resolves under base.

**Pattern:** plain `export const x = {...}` named exports (ESM, matches `"type": "module"`). Compute `datePosted`/`validThrough` at module load (RESEARCH Pitfall 3).

---

### `src/pages/DriveWithUs.jsx` (EDIT — page; add `<Seo>` + JobPosting JSON-LD)

**Analog:** itself. Existing import + page structure (lines 1-11) is the established page pattern:
```jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DollarSign, Home, Heart, TrendingUp, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
/* ...ui imports via @ alias... */
import PageTransition from '@/components/sections/PageTransition'
import ScrollReveal from '@/components/sections/ScrollReveal'
```
→ add `import Seo from '@/seo/Seo'` and `import { jobPosting } from '@/seo/schema'` (the `@` alias is configured in `vite.config.js` lines 9-13 and `jsconfig.json`).

**Render-site for SEO tags + JSON-LD:** first children inside `<PageTransition>` (line 69). JSON-LD via the `JsonLd` helper (RESEARCH Pattern 4, lines 240-244) — `dangerouslySetInnerHTML` is acceptable here because payload is static dev-authored constants (Security Domain, RESEARCH line 517).

**Existing H1 (keep, ensure keyword-aware per INT-SEO-07)** lines 77-80:
```jsx
<h1 className="text-4xl sm:text-5xl md:text-6xl font-heading text-a2c-white">
  Drive With{' '}<span className="text-a2c-red">A2C</span>
</h1>
```

**Formspree endpoint to verify (INT-UX-01)** lines 52-54 — carries the `// TODO: Replace` comment:
```jsx
// TODO: Replace with your Formspree endpoint
const response = await fetch('https://formspree.io/f/mzdkgolq', {
```

---

### `src/pages/Home.jsx` (EDIT — page; add `<Seo>` + LocalBusiness JSON-LD)

**Analog:** itself. Page wraps content in `<PageTransition>` then `<Hero />` (lines 41-42). Insert `<Seo .../>` + `<JsonLd data={localBusiness} />` as the first children inside `<PageTransition>`, before `<Hero />`.

```jsx
export default function Home() {
  return (
    <PageTransition>
      <Hero />
      {/* ... */}
```

---

### `src/pages/Contact.jsx` (EDIT — page; copy cleanup INT-UX-02 + add `<Seo>`)

**Analog:** itself. **Copy fix target** lines 107-109 — replace the "Q&A Form" heading:
```jsx
<h2 className="text-3xl font-heading text-a2c-black mb-8">
  Q&A Form
</h2>
```

**Formspree endpoint to verify (INT-UX-01)** lines 25-28 — carries `// TODO: Replace`:
```jsx
// TODO: Replace with your Formspree endpoint
// Example: https://formspree.io/f/mvzvrleo
const response = await fetch('https://formspree.io/f/mvzvrleo', {
```

**Authoritative NAP block** lines 10-15 (`contactInfo`) is the byte-reference for Footer + schema.js. Do not alter these strings.

---

### `src/pages/About.jsx`, `Services.jsx`, `Fleet.jsx` (EDIT — page; add `<Seo>`)

**Analog:** the shared sibling page hero pattern. `About.jsx` / `Services.jsx` / `Fleet.jsx` all open with identical imports (`PageTransition`, `ScrollReveal`, `@/components/ui/*`) and a `pt-32 pb-20 bg-a2c-black` hero with an eyebrow `<p>` + `font-heading <h1>` (same shape as DriveWithUs.jsx lines 71-85). Add `<Seo path=... title=... description=.../>` as first child inside `<PageTransition>`. No JSON-LD on these three.

---

### `src/components/sections/Hero.jsx` (EDIT — LCP image, INT-PERF-01)

**Analog:** itself, lines 10-14 (current LCP `<img>`):
```jsx
<img
  src={`${import.meta.env.BASE_URL}assets/images/hero-truck.jpg`}
  alt=""
  className="absolute inset-0 w-full h-full object-cover"
/>
```
**Changes (RESEARCH lines 403-411):** add `fetchpriority="high"` + `decoding="async"`. Keep `alt=""` — intentional decorative background (CONTEXT line 74). Keep the `${import.meta.env.BASE_URL}` prefix — this is the **correct** base-aware asset pattern (also used in Footer.jsx line 25); do NOT switch to a leading-slash absolute path. Source image exists: `public/assets/images/hero-truck.jpg`; `sharp`-compress + add 1920w/1280w variants. No CLS: image is `absolute inset-0` in the `100dvh` section (line 8).

**Optional (Pitfall 1, RESEARCH line 285):** gate the framer-motion `initial={{ opacity: 0 }}` states (Hero.jsx lines 21,30,40,50) behind a hydrated flag so the snapshot isn't baked at opacity 0 above the fold.

---

### `src/components/layout/Footer.jsx` (EDIT — add NAP, INT-SEO-04)

**Analog:** `src/pages/Contact.jsx` `contactInfo` (lines 10-15) — copy the NAP strings byte-for-byte into a new footer NAP block. Footer currently has **no NAP** (brand blurb only, lines 33-36). Footer already uses the correct base-aware asset pattern at line 24-28:
```jsx
<img
  src={`${import.meta.env.BASE_URL}assets/images/A2C_Original_Primary_White.png`}
  alt="A2C Logistics"
  className="h-12"
/>
```
**Hydration note (Pitfall 2):** line 77 `new Date().getFullYear()` is deterministic within a year — leave as-is, do not block on hydration warnings.

---

### `src/index.css` (EDIT — font/LCP fixes, INT-PERF-01 + Pitfall 6/7)

**Analog:** itself, lines 1-9 (current font declarations — both have base-path bugs):
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

@font-face {
  font-family: "Nevis Bold";
  src: url("/assets/fonts/Nevis.ttf") format("truetype");  /* absolute path → 404 under base */
  font-weight: 700;
  /* ... */
}
```
**Fixes:**
1. Remove the render-blocking Google Fonts `@import` (line 1); self-host Inter via `@fontsource-variable/inter` (project already imports `@fontsource-variable/geist` per package.json line 14 — **established pattern**, confirm exact pkg name before install — RESEARCH A1).
2. Fix the Nevis `@font-face` `url("/assets/fonts/Nevis.ttf")` — under base it resolves to `alxmara1405.github.io/assets/...` → 404. Source file exists at `public/assets/fonts/Nevis.ttf`. Either hardcode `/a2c-logistics-website/assets/fonts/Nevis.ttf` or move into `src/` for Vite fingerprinting (RESEARCH Pitfall 6).

Brand tokens `@theme` block (lines 17-28) are locked — do not change colors/font-family names (CONTEXT line 23, 109-111).

---

### `index.html` (EDIT — favicon base-path; preserve SPA redirect)

**Analog:** itself. **Favicon bug** line 5: `href="/favicon.svg"` is base-unaware (`public/favicon.svg` exists). Fix to `./favicon.svg` or base-prefixed (RESEARCH Pitfall 6). **Do NOT touch** the GitHub Pages SPA redirect script (lines 12-21) — it must coexist with prerendering (CONTEXT lines 40-41); it is a no-op unless URL contains `?/`. The single static `<title>`/`<meta>` (lines 7-8) becomes the fallback shell; per-route tags come from `<Seo>` baked by the prerender.

---

### `public/sitemap.xml`, `public/robots.txt`, `public/og-image.jpg` (NEW — static assets)

**Analog:** `public/404.html` — confirms `public/*` files are copied verbatim to `dist/` root and served by GH Pages. Place all three here.
- `sitemap.xml`: 6 absolute base-path URLs (RESEARCH lines 389-397) — must match the 6 routes in App.jsx.
- `robots.txt`: ships but is NOT honored as site-wide policy at a project path (RESEARCH Pitfall 4) — submit sitemap via Google Search Console instead. Reference the sitemap inside it anyway.
- `og-image.jpg`: 1200×630; generate with `sharp` from existing imagery (analog asset kind: `public/assets/images/hero-truck.jpg`).

---

### `package.json` (EDIT — build wiring) & `.github/workflows/deploy.yml` (EDIT if needed)

**package.json analog:** the `scripts` block (lines 6-11) — change only `"build"` (see prerender.mjs assignment above). New devDeps: `puppeteer`, `sharp`, `vitest` (and maybe `@fontsource-variable/inter` as a dep).

**deploy.yml analog:** itself — current build job (Node 20, `npm ci` → `npm run build` → upload `dist`). The build-script change flows through automatically. Puppeteer postinstall downloads Chromium; `ubuntu-latest` usually has the libs — launch with `args: ['--no-sandbox']`. Add `browser-actions/setup-chrome` or an `apt-get` step **only if** "Failed to launch the browser process" appears (RESEARCH Pitfall 5). Consider adding a `schedule: cron` trigger for monthly rebuilds to roll `validThrough` forward (Pitfall 3).

---

## Shared Patterns

### Component / module conventions
**Source:** every file in `src/`
**Apply to:** all new `src/` files (`Seo.jsx`, `schema.js`)
- `export default function Name()` for components (PageTransition.jsx, all pages).
- Named `export const` for data/builders (page module-scope consts).
- `@/...` path alias for intra-`src` imports (configured `vite.config.js` lines 9-13, `jsconfig.json`); pages use it for every UI/section import.
- ESM only (`"type": "module"`, package.json line 4).

### Base-path-aware assets (runtime)
**Source:** `src/components/sections/Hero.jsx` line 11, `src/components/layout/Footer.jsx` line 25
**Apply to:** any new/edited code that references a `public/assets/*` file at runtime
```jsx
src={`${import.meta.env.BASE_URL}assets/images/<file>`}
```
> Contrast: **canonical/OG/JSON-logo/sitemap URLs must be fully absolute** (`https://alxmara1405.github.io/a2c-logistics-website/...`), NOT `BASE_URL`-relative (RESEARCH lines 234, 251). Two different rules — runtime `<img>`/CSS assets use `BASE_URL`; crawler-facing metadata uses the absolute ORIGIN.

### NAP single-source-of-truth (INT-SEO-04)
**Source:** `src/pages/Contact.jsx` lines 10-15 (`contactInfo`)
**Apply to:** `src/seo/schema.js` (localBusiness + jobPosting) AND `src/components/layout/Footer.jsx` (new NAP block)
- Byte-identical: `A2C Logistics CO.` / `5930 Colfax Avenue, Lincoln, NE` / `(833) 562-3222` / `kevin@a2clogisticsco.com` / `Mon–Fri 8AM–6PM`.
- ZIP is missing everywhere on disk (RESEARCH A2) — obtain real postal code or leave empty-but-valid with `addressCountry: 'US'`.

### Form submission pattern (Formspree)
**Source:** `src/pages/Contact.jsx` lines 20-40 ≈ `src/pages/DriveWithUs.jsx` lines 47-66 (identical shape)
**Apply to:** verification task only (INT-UX-01) — do not restructure
```jsx
const handleSubmit = async (e) => {
  e.preventDefault()
  const data = new FormData(e.target)
  const response = await fetch('https://formspree.io/f/<id>', {
    method: 'POST', body: data, headers: { Accept: 'application/json' },
  })
  if (response.ok) { setSubmitted(true); form.reset() }
}
```
> Endpoints to verify: contact `mvzvrleo` (Contact.jsx:28), apply `mzdkgolq` (DriveWithUs.jsx:54). Both still carry `// TODO: Replace`. Requires a real test submission — human/content-readiness gate.

### JSON-LD injection
**Source:** RESEARCH Pattern 4 (no in-repo analog)
**Apply to:** `Home.jsx` (localBusiness), `DriveWithUs.jsx` (jobPosting)
```jsx
function JsonLd({ data }) {
  return <script type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}
```
> Safe ONLY because payload is static dev-authored constants — never user input (Security Domain, RESEARCH line 517).

---

## No Analog Found

| File | Role | Data Flow | Reason → use instead |
|------|------|-----------|----------------------|
| `scripts/prerender.mjs` | build script | batch/file-I/O | No `scripts/` dir or build tooling exists. Use RESEARCH Pattern 1 (lines 152-181); validate `vite@8` `preview()` shape in Wave 0 (RESEARCH A4). |
| `tests/prerender.test.js` | test | read-assert | No test suite or framework installed. Install `vitest` (Wave 0); reads `dist/**/index.html` and asserts INT-SEO-01/02/03/04/05/06 + INT-UX-02. |
| `src/seo/schema.js` JSON-LD shapes | utility | transform | No structured-data exists in repo. Data strings come from Contact.jsx NAP; schema shapes from RESEARCH lines 322-383 + Google JobPosting docs. |

---

## Metadata

**Analog search scope:** `src/` (full tree, 26 files), `public/`, root config (`vite.config.js`, `package.json`, `index.html`, `jsconfig.json`), `.github/workflows/`.
**Files scanned:** 26 source files read or sampled; all 6 routes, both forms, Hero, Footer, index.css, both HTML shells, vite config, package.json, deploy workflow, public assets.
**Key real-file facts confirmed on disk:** `base: '/a2c-logistics-website/'` (vite.config.js:8); `basename` prop (main.jsx:9); Nevis font 404 bug (index.css:5); favicon base bug (index.html:5); Google Fonts render-blocking `@import` (index.css:1); NAP authoritative copy (Contact.jsx:10-15); "Q&A Form" heading (Contact.jsx:108); Formspree TODOs (Contact.jsx:25-28, DriveWithUs.jsx:52-54); logo + hero assets present in `public/assets/images/`; CI Node 20, `npm run build` (deploy.yml).
**Pattern extraction date:** 2026-06-29

## PATTERN MAPPING COMPLETE

**Phase:** 4 - Interim — SEO Crawlability + Structured Data + Polish (current-site track)
**Files classified:** 18 entries (6 new, 12 edits)
**Analogs found:** 11 strong in-repo analogs / 3 net-new with no analog (use RESEARCH skeletons)

### Coverage
- Files with exact (self/sibling) analog: 11
- Files with role/partial analog: 4
- Files with no analog: 3 (`scripts/prerender.mjs`, `tests/prerender.test.js`, JSON-LD shapes)

### Key Patterns Identified
- Two distinct URL rules: runtime assets use `${import.meta.env.BASE_URL}assets/...` (Hero.jsx:11, Footer.jsx:25); crawler metadata (canonical/OG/sitemap/JSON-LD logo) must be fully absolute ORIGIN URLs.
- NAP single-source-of-truth lives in `Contact.jsx` `contactInfo` (lines 10-15) — Footer NAP + schema.js must copy it byte-for-byte (INT-SEO-04).
- Pages share one shape: `<PageTransition>` wrapper → eyebrow `<p>` + `font-heading <h1>` hero → `ScrollReveal` sections; `<Seo>`/`<JsonLd>` slot in as first children inside `<PageTransition>`.
- New `src/` files follow ESM `export default function` (components) / `export const` (data) with `@/` alias imports.
- Real pre-existing base-path bugs to fix as part of polish: Nevis `@font-face` absolute path (index.css:5) and favicon (index.html:5).

### File Created
`/Users/alexandercostea/Desktop/a2c-logistics-website/.planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-PATTERNS.md`

### Ready for Planning
Pattern mapping complete. Planner can reference per-file analogs (with line numbers) and shared patterns directly in PLAN.md actions.
