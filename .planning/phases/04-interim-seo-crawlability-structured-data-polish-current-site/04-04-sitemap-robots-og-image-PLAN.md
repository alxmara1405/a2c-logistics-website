---
phase: 4
slug: interim-seo-crawlability-structured-data-polish-current-site
plan: 04
type: execute
wave: 2
depends_on: [04-01]
files_modified:
  - public/sitemap.xml
  - public/robots.txt
  - public/og-image.jpg
  - scripts/gen-og-image.mjs
  - tests/static-assets.test.js
autonomous: true
requirements: [INT-SEO-05, INT-SEO-06]
nyquist_compliant: true

must_haves:
  truths:
    - "sitemap.xml served at the site root lists all 6 routes with absolute base-path URLs"
    - "robots.txt served at the site root references the sitemap"
    - "a 1200x630 og-image.jpg is served at the site root for social share previews"
  artifacts:
    - path: "public/sitemap.xml"
      provides: "6 absolute base-path route URLs"
      contains: "alxmara1405.github.io/a2c-logistics-website"
    - path: "public/robots.txt"
      provides: "Sitemap reference + allow-all crawl directive"
      contains: "Sitemap:"
    - path: "public/og-image.jpg"
      provides: "1200x630 static social share image"
    - path: "scripts/gen-og-image.mjs"
      provides: "sharp script that produces public/og-image.jpg from existing imagery"
  key_links:
    - from: "public/robots.txt"
      to: "public/sitemap.xml"
      via: "Sitemap: absolute URL directive"
      pattern: "Sitemap:.*sitemap.xml"
    - from: "public/* static files"
      to: "dist root (served by GH Pages)"
      via: "Vite copies public/ verbatim to dist/"
      pattern: "sitemap.xml"
---

<objective>
Ship the crawl-discovery static assets: a `sitemap.xml` listing all 6 routes (absolute base-path URLs), a `robots.txt` that references the sitemap, and a 1200×630 `og-image.jpg` for social share previews (INT-SEO-05, INT-SEO-06 asset half). Vite copies `public/` verbatim into `dist/`, so these land at the GitHub Pages root.

Purpose: Make the site discoverable (sitemap submitted via GSC) and shareable (OG image preview).
Output: `public/sitemap.xml`, `public/robots.txt`, `public/og-image.jpg`, the `sharp` generator script, and a static-asset test suite.

Note: A `robots.txt` at a project-page path is NOT honored as the site-wide robots policy (crawlers read it from the domain root, which belongs to the user's root pages repo — RESEARCH Pitfall 4). It is shipped to satisfy the requirement and reference the sitemap, but actual crawl discovery depends on submitting `sitemap.xml` directly in Google Search Console. Record this clearly in the SUMMARY.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-RESEARCH.md
@.planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-PATTERNS.md

<interfaces>
<!-- public/* is copied verbatim to dist/ root (analog: public/404.html). -->
ORIGIN = 'https://alxmara1405.github.io/a2c-logistics-website'
6 sitemap URLs (RESEARCH lines 389-397): ORIGIN + '/', '/about', '/services', '/fleet', '/drive-with-us', '/contact'
robots.txt: User-agent: * / Allow: / / Sitemap: ORIGIN + '/sitemap.xml'  (RESEARCH Pitfall 4 — project-path robots not honored site-wide)
og-image: 1200x630 JPG. Source candidates on disk: public/assets/images/hero-truck.jpg, truck-highway.jpg, A2C_Original_Primary_Color.png. Generate with sharp (installed by 04-01).
sharp script is ESM (.mjs, "type":"module").
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Author public/sitemap.xml and public/robots.txt</name>
  <read_first>
    - .planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-RESEARCH.md (sitemap lines 389-397; Pitfall 4 robots.txt limitation)
    - .planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-PATTERNS.md (public/* assignment lines 254-259)
    - src/App.jsx (route list — must match exactly)
  </read_first>
  <action>
    Create `public/sitemap.xml`: a valid `<urlset>` listing exactly the 6 absolute URLs from the interfaces block (home with trailing slash, then about/services/fleet/drive-with-us/contact) — all fully ORIGIN-qualified absolute URLs (NOT `BASE_URL`-relative). Create `public/robots.txt` with `User-agent: *`, `Allow: /`, and `Sitemap: https://alxmara1405.github.io/a2c-logistics-website/sitemap.xml`. Do not invent routes beyond the 6 in App.jsx.
  </action>
  <verify>
    <automated>node -e "const fs=require('fs'); const s=fs.readFileSync('public/sitemap.xml','utf8'); const n=(s.match(/<loc>/g)||[]).length; if(n!==6) throw new Error('expected 6 urls, got '+n); if(!/alxmara1405.github.io\/a2c-logistics-website\/drive-with-us/.test(s)) throw new Error('missing drive-with-us'); const r=fs.readFileSync('public/robots.txt','utf8'); if(!/Sitemap:.*sitemap.xml/.test(r)) throw new Error('robots missing sitemap ref'); console.log('ok')"</automated>
  </verify>
  <acceptance_criteria>
    - `public/sitemap.xml` has exactly 6 `<loc>` entries, all absolute ORIGIN URLs matching the App.jsx routes
    - `public/robots.txt` references the absolute sitemap URL
  </acceptance_criteria>
  <done>Sitemap + robots exist in public/ and will be copied to dist/ root.</done>
</task>

<task type="auto">
  <name>Task 2: Generate public/og-image.jpg (1200x630) via sharp</name>
  <read_first>
    - .planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-RESEARCH.md (§ Don't Hand-Roll — sharp; INT-SEO-06)
    - public/assets/images/ (hero-truck.jpg, truck-highway.jpg, A2C_Original_Primary_Color.png available)
  </read_first>
  <action>
    Create `scripts/gen-og-image.mjs` (ESM) that uses `sharp` (installed by 04-01) to produce a 1200×630 `public/og-image.jpg` from an existing image (resize/cover-crop `public/assets/images/hero-truck.jpg` or `truck-highway.jpg`; optimize quality ~80, keep file under ~200KB). Run the script once to emit the file. Commit the generated `public/og-image.jpg`. The script is re-runnable but the output image is the deliverable. The absolute OG image URL (`ORIGIN + '/og-image.jpg'`) is already referenced by the `Seo` component default (Plan 04-03) — this task supplies the actual file.
  </action>
  <verify>
    <automated>node scripts/gen-og-image.mjs && node -e "const sharp=require('sharp'); sharp('public/og-image.jpg').metadata().then(m=>{if(m.width!==1200||m.height!==630) throw new Error('wrong dims '+m.width+'x'+m.height); console.log('og-image '+m.width+'x'+m.height)})"</automated>
  </verify>
  <acceptance_criteria>
    - `public/og-image.jpg` exists at exactly 1200×630
    - `scripts/gen-og-image.mjs` regenerates it deterministically from an in-repo source image
  </acceptance_criteria>
  <done>A valid OG share image exists at the path the Seo component points to.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: tests/static-assets.test.js (dist sitemap/robots/og-image present)</name>
  <read_first>
    - .planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-VALIDATION.md (INT-SEO-05/06 rows)
    - tests/prerender.test.js (Wave 0 scaffold conventions)
  </read_first>
  <behavior>
    - After `npm run build`, `dist/sitemap.xml` exists and contains exactly 6 `<loc>` absolute URLs.
    - `dist/robots.txt` exists and contains a `Sitemap:` line referencing sitemap.xml.
    - `dist/og-image.jpg` exists.
  </behavior>
  <action>
    Create `tests/static-assets.test.js` (Vitest, `node:fs`) implementing the behaviors above against the built `dist/` directory (confirming Vite copied `public/*` to the root). Sibling test file — no edit to other test files.
  </action>
  <verify>
    <automated>npm run build && npx vitest run tests/static-assets.test.js</automated>
  </verify>
  <acceptance_criteria>
    - All three assets resolve in `dist/` root after build
    - sitemap URL count === 6; robots references sitemap
    - `npx vitest run tests/static-assets.test.js` is green
  </acceptance_criteria>
  <done>Sitemap, robots, and OG image are verified present at the deployed root.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| build artifacts → public web | sitemap/robots/og-image are served publicly at the site root |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-04-04-info | Information disclosure | sitemap.xml route exposure | accept | All 6 routes are intentionally public marketing pages; the site WANTS full indexing. No private routes exist. |
| T-04-04-robots | Tampering (misconfiguration) | robots.txt at project path | mitigate | Documented (Pitfall 4) that project-path robots.txt is not honored site-wide; crawl discovery relies on GSC sitemap submission, recorded as a manual step in the SUMMARY. |
</threat_model>

<verification>
- `npx vitest run tests/static-assets.test.js` green.
- Manual: share a route URL in a social debugger to confirm the OG preview renders (phase gate).
- Manual: submit `sitemap.xml` in Google Search Console (deploy step — recorded in SUMMARY).
</verification>

<success_criteria>
- sitemap.xml (6 absolute URLs) + robots.txt (sitemap ref) + 1200×630 og-image.jpg all served at the site root.
</success_criteria>

<output>
Create `.planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-04-SUMMARY.md` when done.
</output>
