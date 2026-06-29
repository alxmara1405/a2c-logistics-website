---
phase: 4
slug: interim-seo-crawlability-structured-data-polish-current-site
plan: 03
type: execute
wave: 2
depends_on: [04-01]
files_modified:
  - src/seo/Seo.jsx
  - src/seo/schema.js
  - src/components/layout/Footer.jsx
  - src/pages/Home.jsx
  - src/pages/DriveWithUs.jsx
  - tests/structured-data.test.js
autonomous: true
requirements: [INT-SEO-02, INT-SEO-03, INT-SEO-04, INT-SEO-06, INT-SEO-07]
nyquist_compliant: true

must_haves:
  truths:
    - "drive-with-us static HTML contains a valid JobPosting JSON-LD with all Google-required fields"
    - "home static HTML contains an Organization/LocalBusiness JSON-LD"
    - "NAP (name, street, locality, region, phone) is byte-identical across Contact.jsx, Footer.jsx, and schema.js"
    - "Home and Drive With Us each render a unique <title>, meta description, self-canonical, and OG/Twitter tags via React 19 native metadata"
  artifacts:
    - path: "src/seo/Seo.jsx"
      provides: "Reusable per-route <title>/<meta>/<link rel=canonical> + OG/Twitter using absolute ORIGIN URLs"
      exports: ["default"]
      min_lines: 20
    - path: "src/seo/schema.js"
      provides: "jobPosting + localBusiness JSON-LD builders and JsonLd helper component"
      exports: ["jobPosting", "localBusiness"]
    - path: "src/components/layout/Footer.jsx"
      provides: "NAP block byte-identical to Contact.jsx contactInfo"
      contains: "5930 Colfax Avenue"
    - path: "src/pages/DriveWithUs.jsx"
      provides: "Seo + JobPosting JSON-LD + keyword-aware H1"
      contains: "jobPosting"
    - path: "src/pages/Home.jsx"
      provides: "Seo + LocalBusiness JSON-LD"
      contains: "localBusiness"
  key_links:
    - from: "src/pages/DriveWithUs.jsx"
      to: "src/seo/schema.js jobPosting"
      via: "import + JsonLd render"
      pattern: "jobPosting"
    - from: "src/pages/Home.jsx"
      to: "src/seo/schema.js localBusiness"
      via: "import + JsonLd render"
      pattern: "localBusiness"
    - from: "src/seo/schema.js"
      to: "Contact.jsx contactInfo NAP"
      via: "byte-identical NAP strings"
      pattern: "A2C Logistics CO\\."
---

<objective>
Create the reusable SEO metadata component and the structured-data builders, then wire them into the two highest-value routes: `Organization`/`LocalBusiness` JSON-LD on Home and `JobPosting` JSON-LD on Drive With Us — plus add a byte-identical NAP block to the Footer (INT-SEO-04). React 19 hoists the rendered `<title>`/`<meta>`/`<link>` and inline JSON-LD into the document; the Plan 04-01 prerenderer bakes them into the static HTML so crawlers and Google for Jobs see them.

Purpose: Make the site richly indexable for local + job-posting search intent — the core SEO payload that transfers into the v1.0 rebuild.
Output: `src/seo/Seo.jsx`, `src/seo/schema.js`, Footer NAP, Home + DriveWithUs structured data, and a structured-data test suite.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-CONTEXT.md
@.planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-RESEARCH.md
@.planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-PATTERNS.md

<interfaces>
<!-- Contracts to build against. ABSOLUTE-URL rule is load-bearing. -->

TWO URL RULES (do not mix):
  - Crawler metadata (canonical / OG / sitemap / JSON-LD logo+url): ABSOLUTE
    ORIGIN = 'https://alxmara1405.github.io/a2c-logistics-website'
  - Runtime <img>/CSS assets: base-relative `${import.meta.env.BASE_URL}assets/...`

Seo.jsx contract (RESEARCH Pattern 3, lines 211-232):
  default export Seo({ path, title, description, ogImage = '/og-image.jpg' })
  → React fragment of <title>, <meta name=description>, <link rel=canonical href=ORIGIN+path>,
    og:type/title/description/url/image (absolute), twitter:card=summary_large_image + title/description/image.

JsonLd helper (RESEARCH Pattern 4, lines 240-244):
  function JsonLd({ data }) -> <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(data)}} />
  SAFE ONLY because data is static dev-authored constants — never user input (Security Domain).

NAP single-source-of-truth — src/pages/Contact.jsx:10-15 contactInfo (copy byte-for-byte):
  name 'A2C Logistics CO.' · street '5930 Colfax Avenue' · locality 'Lincoln' · region 'NE'
  phone '(833) 562-3222' → schema telephone '+1-833-562-3222'
  email 'kevin@a2clogisticsco.com' · hours 'Mon–Fri 8AM–6PM' → openingHours 'Mo-Fr 08:00-18:00'
  logo on disk: public/assets/images/A2C_Original_Primary_Color.png → ORIGIN+'/assets/images/A2C_Original_Primary_Color.png'
  ZIP: MISSING on disk (RESEARCH A2) — use postalCode '' with addressCountry 'US', and FLAG as open content dependency.

jobPosting shape: RESEARCH lines 322-361 (required: title, description[HTML], datePosted, hiringOrganization, jobLocation incl addressCountry; recommended: validThrough, employmentType ['FULL_TIME','CONTRACTOR'], baseSalary range, identifier). Compute datePosted=build date, validThrough=+90d at module load (Pitfall 3). Pay as RANGE marked "as of {Month YYYY}"; if real numbers absent use clearly-marked placeholder range (locked decision) — FLAG as open content dependency.
localBusiness shape: RESEARCH lines 365-383.

Render site (PATTERNS lines 126-167): inside <PageTransition>, as first children.
  - DriveWithUs.jsx:69 — add <Seo .../> + <JsonLd data={jobPosting} /> as first children; keep existing H1 (lines 77-80) and make it keyword-aware (INT-SEO-07).
  - Home.jsx:41-42 — add <Seo .../> + <JsonLd data={localBusiness} /> before <Hero />.
Imports use '@' alias: import Seo from '@/seo/Seo'; import { jobPosting } from '@/seo/schema'.
Conventions: components = export default function; data = export const (ESM).
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create src/seo/Seo.jsx + src/seo/schema.js (contracts first)</name>
  <read_first>
    - .planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-RESEARCH.md (Pattern 3 lines 211-232; Pattern 4 lines 240-244; schema lines 322-383; Pitfall 3)
    - .planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-PATTERNS.md (Seo.jsx + schema.js assignments lines 85-123; NAP single-source lines 289-293)
    - src/pages/Contact.jsx (lines 10-15 contactInfo — NAP byte-source)
    - src/components/sections/PageTransition.jsx (component convention analog)
  </read_first>
  <action>
    Create `src/seo/Seo.jsx`: default-export `Seo({ path, title, description, ogImage })` returning the React 19 metadata fragment defined in the interfaces block. Use `const ORIGIN = 'https://alxmara1405.github.io/a2c-logistics-website'`; canonical = `ORIGIN + path`, OG image = `ORIGIN + ogImage` — all ABSOLUTE (never `BASE_URL`-relative). Also export the `JsonLd` helper (or define it in schema.js and import — pick one home and keep it consistent). Create `src/seo/schema.js` with named exports `jobPosting` and `localBusiness` reproducing the NAP strings from Contact.jsx byte-for-byte (name/street/locality/region/phone/email/hours per interfaces). Compute `datePosted` = build date and `validThrough` = +90 days at module load. Set pay `baseSalary` as a range with `currency: 'USD'` + `unitText` marked "as of {Month YYYY}"; if no real figures, use a clearly-marked placeholder range and add an inline comment `// PLACEHOLDER pay range — pending real A2C figures`. Set `postalCode: ''` with `addressCountry: 'US'` and an inline `// ZIP pending — open content dependency` comment. employmentType `['FULL_TIME','CONTRACTOR']`. logo + url use absolute ORIGIN URLs.
  </action>
  <verify>
    <automated>node --input-type=module -e "const s=await import('./src/seo/schema.js'); if(!s.jobPosting||!s.localBusiness) throw new Error('missing exports'); const j=s.jobPosting; for(const k of ['title','description','datePosted','hiringOrganization','jobLocation']) if(!j[k]) throw new Error('jobPosting missing '+k); if(!j.jobLocation.address.addressCountry) throw new Error('no addressCountry'); if(s.localBusiness.name!=='A2C Logistics CO.') throw new Error('NAP name mismatch'); console.log('schema ok')"</automated>
  </verify>
  <acceptance_criteria>
    - `Seo.jsx` default-exports a component using absolute ORIGIN URLs for canonical/OG
    - `schema.js` exports `jobPosting` (all Google-required keys incl. `jobLocation.address.addressCountry`) and `localBusiness`
    - NAP strings byte-match Contact.jsx contactInfo; `name === 'A2C Logistics CO.'`
    - placeholder pay range and missing-ZIP are inline-flagged as content dependencies
  </acceptance_criteria>
  <done>SEO metadata component + structured-data builders exist with correct contracts and byte-accurate NAP.</done>
</task>

<task type="auto">
  <name>Task 2: Add NAP block to Footer + wire Seo/JSON-LD into Home and DriveWithUs</name>
  <read_first>
    - src/components/layout/Footer.jsx (no NAP today, lines 33-36 brand blurb; line 24-28 base-aware logo img; line 77 getFullYear)
    - src/pages/Home.jsx (PageTransition wrapper, lines 41-42 before Hero)
    - src/pages/DriveWithUs.jsx (PageTransition line 69; H1 lines 77-80)
    - src/pages/Contact.jsx (lines 10-15 NAP byte-source)
    - .planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-PATTERNS.md (Footer + Home + DriveWithUs assignments lines 126-167, 213-223)
  </read_first>
  <action>
    (a) Footer.jsx: add a NAP block rendering `A2C Logistics CO.`, `5930 Colfax Avenue, Lincoln, NE`, `(833) 562-3222`, `kevin@a2clogisticsco.com`, `Mon–Fri 8AM–6PM` — copied byte-for-byte from Contact.jsx contactInfo. Keep the existing base-aware logo `<img>` pattern. Leave `new Date().getFullYear()` as-is (deterministic within a year; hydration-safe, Pitfall 2). (b) Home.jsx: import `Seo` and `localBusiness`; render `<Seo path="/" title=... description=... />` and `<JsonLd data={localBusiness} />` as the first children inside `<PageTransition>`, before `<Hero />`. Title/description must be unique and keyword-aware for local driver-recruiting intent (INT-SEO-02/07). (c) DriveWithUs.jsx: import `Seo` and `jobPosting`; render `<Seo path="/drive-with-us" title=... description=... />` + `<JsonLd data={jobPosting} />` as first children inside `<PageTransition>`; ensure the H1 (lines 77-80) reads keyword-aware (e.g. weave "CDL Class A Driver Jobs — Lincoln, NE" naturally, no stuffing — INT-SEO-07). Use the `@` alias for imports. Do not change Hero/section structure.
  </action>
  <verify>
    <automated>npm run build && node -e "const fs=require('fs'); const dw=fs.readFileSync('dist/drive-with-us/index.html','utf8'); const h=fs.readFileSync('dist/index.html','utf8'); if(!/application\/ld\+json/.test(dw)||!/JobPosting/.test(dw)) throw new Error('no JobPosting in drive-with-us'); if(!/application\/ld\+json/.test(h)||!/LocalBusiness/.test(h)) throw new Error('no LocalBusiness in home'); if(!/5930 Colfax Avenue/.test(fs.readFileSync('dist/index.html','utf8'))) throw new Error('footer NAP not baked'); console.log('structured data baked')"</automated>
  </verify>
  <acceptance_criteria>
    - `dist/drive-with-us/index.html` contains a `JobPosting` JSON-LD `<script>`; `dist/index.html` contains a `LocalBusiness` JSON-LD `<script>`
    - Footer NAP renders in every prerendered page footer, byte-identical to Contact.jsx
    - Home and Drive With Us each have a unique `<title>` + meta description + self-canonical baked into static HTML
    - DriveWithUs H1 is keyword-aware (Lincoln NE / CDL driver intent) without stuffing
  </acceptance_criteria>
  <done>Structured data + per-page metadata + Footer NAP are baked into the home and drive-with-us static HTML.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: tests/structured-data.test.js (JSON-LD validity + NAP byte-equality)</name>
  <read_first>
    - .planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-VALIDATION.md (INT-SEO-03/04 rows)
    - .planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-RESEARCH.md (§ Validation Architecture — required-key check)
    - tests/prerender.test.js (existing Wave 0 scaffold conventions from 04-01)
  </read_first>
  <behavior>
    - Extract the JSON-LD `<script type="application/ld+json">` payload from `dist/drive-with-us/index.html`, `JSON.parse` it, assert `@type` includes JobPosting and required keys (title, description, datePosted, hiringOrganization, jobLocation.address.addressCountry) are present.
    - Extract JSON-LD from `dist/index.html`, assert `@type` includes Organization/LocalBusiness and `name === 'A2C Logistics CO.'`.
    - Read `src/pages/Contact.jsx` and `src/components/layout/Footer.jsx`; assert the NAP strings (`A2C Logistics CO.`, `5930 Colfax Avenue`, `Lincoln`, `NE`, `(833) 562-3222`) appear byte-identical in both.
  </behavior>
  <action>
    Create `tests/structured-data.test.js` (Vitest, `node:fs`) implementing the behaviors above. Use a regex to pull the JSON-LD `<script>` inner text from the built HTML and `JSON.parse` it (fail the test on parse error). For NAP byte-equality, assert each canonical NAP substring is `.includes`-present in both Contact.jsx and Footer.jsx sources. This is a sibling test file to `tests/prerender.test.js` (no shared-file edit).
  </action>
  <verify>
    <automated>npm run build && npx vitest run tests/structured-data.test.js</automated>
  </verify>
  <acceptance_criteria>
    - JSON-LD on both routes parses without error and carries required keys
    - NAP byte-equality assertion across Contact.jsx + Footer.jsx passes
    - `npx vitest run tests/structured-data.test.js` is green
  </acceptance_criteria>
  <done>Structured data + NAP consistency are automatically verified (INT-SEO-03/04). Final validity confirmed manually in Google Rich Results Test at the phase gate.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| developer constants → rendered DOM | JSON-LD is injected via `dangerouslySetInnerHTML` |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-04-03-XSS | Tampering (XSS) | `JsonLd` `dangerouslySetInnerHTML` in Home.jsx + DriveWithUs.jsx | mitigate | Payload is ONLY static developer-authored constants from `src/seo/schema.js` (NAP, pay ranges) — never user/runtime input. No interpolation of any request/form/URL value into the JSON-LD object. This is the single real control for the phase (Security Domain). |
| T-04-03-stale | Tampering (data integrity) | JobPosting `validThrough` on a static host | accept/mitigate | `validThrough` = build date + 90d computed at module load; a scheduled monthly CI rebuild (see 04-01 deploy notes) rolls it forward. Pay published as a marked range, never a single hard number. |
</threat_model>

<verification>
- `npx vitest run tests/structured-data.test.js` green.
- Manual phase-gate: run `dist/drive-with-us/index.html` and `dist/index.html` through Google Rich Results Test — zero errors on JobPosting + LocalBusiness.
</verification>

<success_criteria>
- Drive With Us serves valid `JobPosting` JSON-LD; Home serves `Organization`/`LocalBusiness` JSON-LD.
- NAP is byte-identical across Contact, Footer, and schema.
- Home + Drive With Us each carry a unique title/description/canonical + OG tags in static HTML.
</success_criteria>

<output>
Create `.planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-03-SUMMARY.md` when done.
</output>
