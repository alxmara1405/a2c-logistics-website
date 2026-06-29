---
phase: 4
slug: interim-seo-crawlability-structured-data-polish-current-site
plan: 06
type: execute
wave: 3
depends_on: [04-01, 04-03]
files_modified:
  - src/pages/About.jsx
  - src/pages/Services.jsx
  - src/pages/Fleet.jsx
  - src/pages/Contact.jsx
  - tests/metadata.test.js
autonomous: true
requirements: [INT-SEO-02, INT-SEO-06, INT-SEO-07, INT-UX-02]
nyquist_compliant: true

must_haves:
  truths:
    - "Every one of the 6 routes serves a DISTINCT <title>, meta description, and self-canonical in static HTML"
    - "Every route carries OG/Twitter tags with absolute URLs in static HTML"
    - "The awkward 'Q&A Form' heading is gone and CTA labels are tightened"
    - "Headings/titles weave driver-job search intent naturally (no stuffing)"
  artifacts:
    - path: "src/pages/About.jsx"
      provides: "Seo with unique title/description/canonical"
      contains: "Seo"
    - path: "src/pages/Services.jsx"
      provides: "Seo with unique title/description/canonical"
      contains: "Seo"
    - path: "src/pages/Fleet.jsx"
      provides: "Seo with unique title/description/canonical"
      contains: "Seo"
    - path: "src/pages/Contact.jsx"
      provides: "Seo + 'Q&A Form' heading replaced + tightened CTA labels"
      contains: "Seo"
  key_links:
    - from: "src/pages/{About,Services,Fleet,Contact}.jsx"
      to: "src/seo/Seo.jsx"
      via: "import Seo from '@/seo/Seo' rendered first inside PageTransition"
      pattern: "@/seo/Seo"
---

<objective>
Complete per-page metadata coverage across the four remaining routes (About, Services, Fleet, Contact) so every route has a unique title/description/canonical + OG tags (INT-SEO-02/06), weave driver-job search intent into headings naturally (INT-SEO-07), and clean up the copy: replace the awkward "Q&A Form" heading on Contact and tighten CTA labels (INT-UX-02).

Purpose: Finish the crawler-facing metadata surface and remove placeholder/awkward copy.
Output: `<Seo>` on all four pages, Contact copy cleanup, and a metadata test suite covering all 6 routes.
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
<!-- Seo.jsx is created by Plan 04-03 (dependency). -->
import Seo from '@/seo/Seo'
<Seo path="/about" title="..." description="..." />   // path values: '/about','/services','/fleet','/contact'
ORIGIN-absolute canonical/OG handled inside Seo.jsx — pages only pass path/title/description.
Render site: first children inside each page's <PageTransition> (PATTERNS lines 191-193). No JSON-LD on these four.

Copy cleanup (INT-UX-02):
  Contact.jsx:107-109 — heading "Q&A Form" → replace with a clear, intent-aligned heading (e.g. "Send Us a Message" / "Questions? Reach Out").
  Tighten generic CTA labels across these pages to action-specific verbs (no scope/feature change).
  Contact.jsx:10-15 contactInfo NAP — DO NOT alter (byte-source of truth for Footer + schema).

Keyword intent (INT-SEO-07): titles/H1s should read naturally for local driver-recruiting search ("Lincoln, NE", "CDL Class A", "drivers") without stuffing.
Each title must be UNIQUE across all 6 routes (Home + DriveWithUs set by 04-03).
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add unique Seo metadata to About, Services, Fleet</name>
  <read_first>
    - src/pages/About.jsx, src/pages/Services.jsx, src/pages/Fleet.jsx (PageTransition wrapper + hero H1 shape)
    - src/seo/Seo.jsx (contract created by 04-03)
    - .planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-PATTERNS.md (About/Services/Fleet assignment lines 191-193)
  </read_first>
  <action>
    In each of `About.jsx`, `Services.jsx`, `Fleet.jsx`: `import Seo from '@/seo/Seo'` and render `<Seo path="/<route>" title="..." description="..." />` as the FIRST child inside the page's `<PageTransition>`. Each title + description must be UNIQUE (distinct from each other and from Home/DriveWithUs set in 04-03) and keyword-aware for the driver-recruiting + Lincoln NE intent without stuffing (INT-SEO-02/06/07). Where a hero H1 reads generically, adjust wording to weave intent naturally. No JSON-LD on these three; no layout/section changes.
  </action>
  <verify>
    <automated>npm run build && node -e "const fs=require('fs'); const t=p=>{const m=fs.readFileSync(p,'utf8').match(/<title>([^<]*)<\/title>/);return m&&m[1]}; const titles=['dist/index.html','dist/about/index.html','dist/services/index.html','dist/fleet/index.html','dist/drive-with-us/index.html','dist/contact/index.html'].map(t); if(titles.some(x=>!x)) throw new Error('a route is missing <title>: '+JSON.stringify(titles)); if(new Set(titles).size!==6) throw new Error('titles not unique: '+JSON.stringify(titles)); console.log('6 unique titles')"</automated>
  </verify>
  <acceptance_criteria>
    - About/Services/Fleet each render `<Seo>` with a unique title + description + self-canonical baked into their static HTML
    - All 6 route `<title>` values are present and unique
    - Headings read naturally for driver-search intent (no stuffing)
  </acceptance_criteria>
  <done>All non-JSON-LD routes carry unique, keyword-aware metadata in static HTML.</done>
</task>

<task type="auto">
  <name>Task 2: Add Seo to Contact + copy cleanup (Q&A heading, CTA labels)</name>
  <read_first>
    - src/pages/Contact.jsx (Seo render site; heading lines 107-109 "Q&A Form"; contactInfo lines 10-15 — do not alter)
    - .planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-PATTERNS.md (Contact assignment lines 171-188)
    - .planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-CONTEXT.md (copy cleanup decision)
  </read_first>
  <action>
    In `Contact.jsx`: `import Seo from '@/seo/Seo'`, render `<Seo path="/contact" title="..." description="..." />` as first child inside `<PageTransition>` (unique title/description, keyword-aware). Replace the "Q&A Form" heading (lines 107-109) with a clear, intent-aligned heading (e.g. "Send Us a Message"). Tighten any generic CTA button labels on the page to specific action verbs (no feature/scope change). DO NOT alter the `contactInfo` NAP strings (lines 10-15) — they are the byte-source of truth for the Footer + schema. DO NOT restructure the Formspree handler.
  </action>
  <verify>
    <automated>npm run build && node -e "const fs=require('fs'); const c=fs.readFileSync('dist/contact/index.html','utf8'); if(/Q&amp;A Form|Q&A Form/.test(c)) throw new Error('Q&A Form heading still present'); if(!/<link rel=\"canonical\"/.test(c)) throw new Error('contact canonical missing'); console.log('contact cleaned')"</automated>
  </verify>
  <acceptance_criteria>
    - `dist/contact/index.html` no longer contains "Q&A Form"; carries a unique title/description/canonical
    - CTA labels tightened to action-specific verbs
    - `contactInfo` NAP strings unchanged; Formspree handler unchanged
  </acceptance_criteria>
  <done>Contact has clean copy and unique metadata; NAP preserved.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: tests/metadata.test.js (all 6 routes unique meta + OG + no Q&A)</name>
  <read_first>
    - .planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-VALIDATION.md (INT-SEO-02/06, INT-UX-02 rows)
    - tests/prerender.test.js (Wave 0 scaffold conventions)
  </read_first>
  <behavior>
    - For all 6 `dist` routes: each has a non-empty `<title>`, a `<meta name="description">`, and a self-referential `<link rel="canonical">` whose href is the absolute ORIGIN + path; all 6 titles are unique.
    - Each route has `og:title`, `og:description`, `og:image` (absolute URL) and `twitter:card`.
    - `dist/contact/index.html` does NOT contain "Q&A Form".
  </behavior>
  <action>
    Create `tests/metadata.test.js` (Vitest, `node:fs`) implementing the behaviors above by reading the 6 built `index.html` files and regex/parse-asserting title uniqueness, description + canonical presence, OG/Twitter tags with absolute URLs, and the absence of the "Q&A Form" string. Sibling test file — no edits to other test files.
  </action>
  <verify>
    <automated>npm run build && npx vitest run tests/metadata.test.js</automated>
  </verify>
  <acceptance_criteria>
    - All 6 routes pass unique-title + description + canonical + OG/Twitter assertions
    - "Q&A Form" absence assertion passes
    - `npx vitest run tests/metadata.test.js` is green
  </acceptance_criteria>
  <done>Per-route metadata coverage (INT-SEO-02/06) and copy cleanup (INT-UX-02) are automatically verified across all 6 routes.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| developer copy → rendered DOM | Static page metadata/copy only; no user/runtime input |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-04-06-meta | Tampering | per-page `<Seo>` metadata | accept | All title/description/canonical/OG values are static developer-authored props; no interpolation of request/URL/form input. No injection surface. |
</threat_model>

<verification>
- `npx vitest run tests/metadata.test.js` green.
- Phase gate: full suite `npm run build && npx vitest run` green; manual editorial review that headings read naturally (INT-SEO-07).
</verification>

<success_criteria>
- All 6 routes serve distinct title/description/canonical + OG tags in static HTML.
- "Q&A Form" heading removed; CTA labels tightened.
</success_criteria>

<output>
Create `.planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-06-SUMMARY.md` when done.
</output>
