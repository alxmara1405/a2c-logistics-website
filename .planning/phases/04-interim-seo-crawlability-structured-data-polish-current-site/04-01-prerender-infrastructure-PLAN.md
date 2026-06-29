---
phase: 4
slug: interim-seo-crawlability-structured-data-polish-current-site
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - scripts/prerender.mjs
  - src/main.jsx
  - index.html
  - tests/prerender.test.js
autonomous: true
requirements: [INT-SEO-01]
nyquist_compliant: true

must_haves:
  truths:
    - "curl of each of the 6 production route URLs returns fully-rendered HTML with that page's H1 + body copy, not an empty #root shell"
    - "Deep-link loads of prerendered routes hydrate (not re-mount) and stay interactive"
    - "npm run build produces per-route folder-form HTML (dist/<route>/index.html) after vite build"
  artifacts:
    - path: "scripts/prerender.mjs"
      provides: "Post-build puppeteer + vite preview snapshot of all 6 routes to folder-form HTML"
      min_lines: 30
    - path: "src/main.jsx"
      provides: "hydrateRoot when prerendered markup present, createRoot otherwise"
      contains: "hydrateRoot"
    - path: "tests/prerender.test.js"
      provides: "Vitest assertions that each dist/<route>/index.html contains its H1 + body (INT-SEO-01)"
      contains: "index.html"
    - path: "package.json"
      provides: "build script runs prerender after vite build; vitest/puppeteer/sharp devDeps"
      contains: "node scripts/prerender.mjs"
  key_links:
    - from: "package.json build script"
      to: "scripts/prerender.mjs"
      via: "vite build && node scripts/prerender.mjs"
      pattern: "node scripts/prerender.mjs"
    - from: "scripts/prerender.mjs"
      to: "vite preview server under base path"
      via: "programmatic preview() honoring base /a2c-logistics-website/"
      pattern: "preview\\("
    - from: "src/main.jsx"
      to: "prerendered DOM in #root"
      via: "hasChildNodes() guard selecting hydrateRoot"
      pattern: "hasChildNodes"
---

<objective>
Establish build-time prerendering so crawlers and link-scrapers receive real static HTML for all 6 routes instead of an empty `#root` shell. This is the foundational crawlability fix (INT-SEO-01) that every other SEO plan depends on — per-page metadata and JSON-LD only become static once a real browser snapshots the post-hydration DOM.

Purpose: Fix the #1 SEO defect (empty `#root`) without leaving GitHub Pages or migrating frameworks.
Output: `scripts/prerender.mjs`, hydration-aware `src/main.jsx`, wired `npm run build`, Vitest scaffold (`tests/prerender.test.js`), and the favicon base-path fix in `index.html`.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-CONTEXT.md
@.planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-RESEARCH.md
@.planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-PATTERNS.md
@.planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-VALIDATION.md

<interfaces>
<!-- Hard facts the executor must honor (extracted from the codebase). -->

Vite config — vite.config.js:
  base: '/a2c-logistics-website/'   // prerender server serves dist UNDER this base
  resolve.alias '@' -> ./src

Routes to crawl — src/App.jsx:21-26 (exactly these 6):
  '' , 'about', 'services', 'fleet', 'drive-with-us', 'contact'

Current entry — src/main.jsx (full file):
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

RESEARCH Pattern 1 (prerender.mjs skeleton): RESEARCH lines 152-181.
RESEARCH Pattern 2 (hydration guard): RESEARCH lines 186-204.
Every page renders `<main>` (App.jsx:18) wrapping an `<h1>` — `page.waitForSelector('main h1')` is valid for all 6 routes.
package.json is `"type": "module"` → ESM `.mjs` is correct.
CI: .github/workflows/deploy.yml runs Node 20, `npm ci` then `npm run build`, uploads `dist`. ubuntu-latest carries Chromium libs; launch puppeteer with `args: ['--no-sandbox']`.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install build/test devDeps and wire the build script</name>
  <read_first>
    - package.json (scripts block lines 6-11; "type": "module" line 5; existing @fontsource-variable/geist line 14)
    - .planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-RESEARCH.md (§ Standard Stack, § Package Legitimacy Audit — puppeteer 25.2.1 + sharp 0.35.2 verified/approved on npm)
  </read_first>
  <action>
    Add devDependencies via `npm install --save-dev puppeteer sharp vitest` (puppeteer ~25.2.1, sharp ~0.35.2, vitest latest). Note puppeteer's postinstall downloads Chromium — expected/legitimate (RESEARCH Pitfall 5). Change the `package.json` "build" script from `"vite build"` to `"vite build && node scripts/prerender.mjs"` so prerendering runs immediately after the bundle is produced. Do NOT add a vitest config file — `npx vitest run` discovers `tests/**/*.test.js` without one. Leave `dev`, `lint`, `preview` scripts unchanged.
  </action>
  <verify>
    <automated>node -e "const p=require('./package.json'); if(!p.scripts.build.includes('node scripts/prerender.mjs')) throw new Error('build not wired'); for(const d of ['puppeteer','sharp','vitest']) if(!p.devDependencies[d]) throw new Error('missing '+d); console.log('ok')"</automated>
  </verify>
  <acceptance_criteria>
    - `package.json` build script === `vite build && node scripts/prerender.mjs`
    - `puppeteer`, `sharp`, `vitest` all present under devDependencies
    - `dev` / `lint` / `preview` scripts unchanged; `"type": "module"` preserved
  </acceptance_criteria>
  <done>devDeps installed, Chromium fetched, build script chains the prerender step.</done>
</task>

<task type="auto">
  <name>Task 2: Write scripts/prerender.mjs (puppeteer + vite preview snapshot)</name>
  <read_first>
    - .planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-RESEARCH.md (Pattern 1 skeleton, lines 152-181; Anti-Patterns lines 247-251)
    - .planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-PATTERNS.md (scripts/prerender.mjs assignment, lines 38-58)
    - vite.config.js (base path)
    - src/App.jsx (route list)
  </read_first>
  <action>
    Create `scripts/prerender.mjs` (ESM) following RESEARCH Pattern 1. It must: (1) boot Vite's programmatic `preview()` so `dist` is served UNDER the base `/a2c-logistics-website/` — do NOT serve at root (assets are base-prefixed and would 404 in headless Chrome). (2) Launch puppeteer headless with `args: ['--no-sandbox']`. (3) For each of the exact 6 routes `['', 'about', 'services', 'fleet', 'drive-with-us', 'contact']`, `page.goto(origin + '/' + route, { waitUntil: 'networkidle0' })`, then `await page.waitForSelector('main h1')`, then a ~250ms settle delay so React 19 metadata-hoist + any JSON-LD land in the DOM. (4) Capture `document.documentElement.outerHTML`, prefix `<!doctype html>`, and write FOLDER-FORM output: `dist/<route>/index.html` for each route, and `dist/index.html` for the home route (`''`). Folder form is mandatory — flat files (`dist/about.html`) break GH Pages deep-link serving and re-trigger the 404 redirect (RESEARCH anti-pattern). (5) Close browser and `server.httpServer.close()`. Validate the installed `vite@8` `preview()` return shape (`resolvedUrls.local` + `httpServer.close`) against the actual API before finalizing (RESEARCH A4) — adjust property access if v8 differs. The script must exit non-zero on any route failure so CI build fails loudly.
  </action>
  <verify>
    <automated>npm run build && node -e "const fs=require('fs'); for(const r of ['about','services','fleet','drive-with-us','contact']) if(!fs.existsSync('dist/'+r+'/index.html')) throw new Error('missing dist/'+r+'/index.html'); if(!fs.existsSync('dist/index.html')) throw new Error('missing dist/index.html'); console.log('all 6 prerendered')"</automated>
  </verify>
  <acceptance_criteria>
    - `npm run build` exits 0 and produces `dist/index.html` plus `dist/{about,services,fleet,drive-with-us,contact}/index.html`
    - Each generated file is >1KB and contains rendered `<main>` markup (not just `<div id="root"></div>`)
    - prerender server serves under `/a2c-logistics-website/` (no asset 404s logged during snapshot)
    - script exits non-zero if any route fails to render
  </acceptance_criteria>
  <done>All 6 routes snapshot to folder-form static HTML during `npm run build`.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: Hydration guard in main.jsx, favicon base-path fix, and tests/prerender.test.js</name>
  <read_first>
    - src/main.jsx (current createRoot entry)
    - index.html (favicon line 5 `/favicon.svg`; SPA redirect script lines 12-21 — MUST be preserved untouched)
    - .planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-RESEARCH.md (Pattern 2 lines 186-204; Pitfall 6 favicon; § Validation Architecture lines 478-504)
    - .planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-VALIDATION.md (Per-Requirement map; Wave 0 requirements)
  </read_first>
  <behavior>
    - Each of `dist/{,'about'/,'services'/,'fleet'/,'drive-with-us'/,'contact'/}index.html` exists.
    - Each file does NOT match `/<div id="root"><\/div>\s*<script/` (i.e. is not an empty shell).
    - Each file contains at least one `<h1` inside rendered markup.
    - Home (`dist/index.html`) contains hero/driver copy; drive-with-us contains "Drive With".
  </behavior>
  <action>
    (a) Edit `src/main.jsx` per RESEARCH Pattern 2: import both `createRoot` and `hydrateRoot`; build the app element once; `const el = document.getElementById('root'); if (el.hasChildNodes()) hydrateRoot(el, app); else createRoot(el).render(app)`. PRESERVE `basename="/a2c-logistics-website"` exactly — it is the runtime half of the base-path contract. (b) In `index.html`, fix the favicon `href="/favicon.svg"` to `"./favicon.svg"` so it resolves under the base path (Pitfall 6). Do NOT touch the GH Pages SPA redirect `<script>` (lines 12-21) or the `<div id="root">`/module script — they must remain. (c) Create `tests/prerender.test.js` (Vitest, reads built files with `node:fs`) asserting INT-SEO-01: for all 6 routes, the corresponding `dist/.../index.html` exists, is NOT an empty `#root` shell, and contains an `<h1`; plus a home-route body-copy check and a drive-with-us "Drive With" check. This is the Wave 0 test scaffold the later plans add sibling test files alongside.
  </action>
  <verify>
    <automated>npm run build && npx vitest run tests/prerender.test.js</automated>
  </verify>
  <acceptance_criteria>
    - `src/main.jsx` imports `hydrateRoot`, branches on `el.hasChildNodes()`, keeps `basename="/a2c-logistics-website"`
    - `index.html` favicon href is base-safe (`./favicon.svg`); SPA redirect script + root div + module script unchanged
    - `npx vitest run tests/prerender.test.js` passes with all 6 route assertions green
  </acceptance_criteria>
  <done>Deep links hydrate cleanly, favicon loads under base path, and the prerender output is automatically verified (INT-SEO-01).</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| npm registry → local/CI build | Newly installed packages (puppeteer, sharp, vitest) execute postinstall scripts |
| build step → static host | Prerendered HTML is served verbatim by GitHub Pages |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-04-SC | Tampering | npm installs (puppeteer/sharp/vitest) | mitigate | Packages verified on npm registry in RESEARCH § Package Legitimacy Audit (puppeteer 25.2.1, sharp 0.35.2 — first-tier, multi-year history, official repos). puppeteer postinstall (Chromium download) is expected/legitimate. No `[ASSUMED]`/`[SUS]` packages in this plan. |
| T-04-01 | Tampering | prerendered HTML content | accept | Snapshot is of developer-authored static markup only; no user/runtime input is baked. Static host exposes everything in `dist` — no secrets present. |
</threat_model>

<verification>
- `npm run build` exits 0 and emits 6 folder-form HTML files.
- `npx vitest run tests/prerender.test.js` is green (INT-SEO-01).
- Manual spot-check: `curl -s file://$PWD/dist/drive-with-us/index.html | grep -q "Drive With"` returns rendered copy.
</verification>

<success_criteria>
- All 6 routes emit real static HTML containing their H1 + body (not empty `#root`).
- Build script chains prerender after `vite build`; CI inherits it automatically.
- Entry uses `hydrateRoot` for prerendered DOM; favicon resolves under base; SPA redirect preserved.
</success_criteria>

<output>
Create `.planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-01-SUMMARY.md` when done.
</output>
