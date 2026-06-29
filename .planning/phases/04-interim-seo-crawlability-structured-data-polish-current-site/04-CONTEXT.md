# Phase 4: Interim — SEO Crawlability + Structured Data + Polish - Context

**Gathered:** 2026-06-29
**Status:** Ready for planning
**Source:** Explore session 2026-06-29 (Socratic Q&A) — see `.planning/notes/2026-06-29-interim-vs-rebuild-decision.md`

<domain>
## Phase Boundary

This phase improves the **existing committed Vite/React SPA** (the current live site at
`https://alxmara1405.github.io/a2c-logistics-website`) for SEO, usability, and performance —
**without** rebuilding it. It is the active work of the **Interim Milestone (v0.5)**; the v1.0
Astro rebuild (Phases 1–3) is paused, blocked on user-supplied inputs.

**In scope:** crawlability (prerendering), per-page metadata, structured data (JSON-LD),
sitemap/robots/OG, keyword-aware copy, Formspree verification, copy cleanup, accessibility, and
hero LCP — all on the existing React codebase, staying on GitHub Pages.

**Out of scope (hard fences):**
- No framework migration (no Astro/Next). Keep React 19 + Vite 8 + React Router 7.
- No real form backend. GitHub Pages is static-only; forms stay on Formspree.
- No domain migration. Stay on the `alxmara1405.github.io/a2c-logistics-website` base path.
- No visual redesign. The brand system and layout are already strong — do not restyle.
- No new pages/routes. The 6 existing routes stay as-is.
</domain>

<decisions>
## Implementation Decisions (locked this session)

### Audience & SEO strategy
- Primary audience: **drivers** (owner-operators + company). SEO targets **local + job-posting
  intent** — "CDL Class A driver jobs Lincoln NE", Google for Jobs. Not shipper/freight SEO.

### Hosting & deployment constraint
- Stays on **GitHub Pages** (project page, base path `/a2c-logistics-website/`). Vite `base` is
  already configured; assets use `import.meta.env.BASE_URL`. Any prerender output and
  sitemap/robots URLs MUST respect this base path.
- The repo already has a **GitHub Pages SPA redirect hack** (`index.html` inline script +
  `public/404.html`). Prerendering must coexist with it — prerendered route HTML must not be
  clobbered by the 404 redirect, and direct deep-link loads must still render correctly.

### Crawlability approach
- Add **build-time prerendering** so each route emits real static HTML (fixes the empty `#root`
  that crawlers/link-scrapers currently see — the #1 issue). Candidate tools: `react-snap`
  (puppeteer post-build) or `vite-react-ssg`. Final tool choice deferred to RESEARCH.md — pick
  the one that works cleanly with React Router 7 + Vite 8 + the GH Pages base path + the SPA
  redirect hack, with the least disruption.

### Metadata
- Per-page `<title>`, meta description, canonical, OG/Twitter via **React 19 native document
  metadata** (React 19 hoists `<title>`/`<meta>`/`<link>` rendered in components into `<head>`).
  Prefer this over adding react-helmet unless RESEARCH shows native metadata + the chosen
  prerenderer don't capture tags into static HTML.

### Structured data
- `JobPosting` JSON-LD on the Drive With Us route. **Pay published as ranges marked "as of
  {month year}"** if real numbers aren't available — never single hard numbers (stale-number trap
  flagged in the rebuild's PITFALLS). Use placeholder ranges clearly marked "pending real data"
  if A2C hasn't supplied figures.
- `Organization`/`LocalBusiness` JSON-LD on home. NAP must be **byte-identical** to the Contact
  page + Footer (current NAP: A2C Logistics CO., 5930 Colfax Avenue, Lincoln, NE; phone
  (833) 562-3222).

### Content/usability
- Verify both **Formspree** endpoints are real, owned, and delivering: contact `mvzvrleo`,
  apply `mzdkgolq` (both currently carry "TODO: Replace" comments in source). Document findings;
  fix/replace if dead. This requires user input — flag as a content-readiness dependency.
- Copy cleanup: replace the awkward "Q&A Form" heading on Contact; tighten CTA labels.

### Accessibility & performance
- WCAG AA: fix gray-text contrast (`text-gray-600`/`text-a2c-gray` on light/dark grounds —
  verify ratios), ensure visible focus states on all interactive elements, add meaningful alt
  text (note: `Hero` currently uses `alt=""` deliberately as a decorative background — that is
  acceptable; focus on content images).
- Hero LCP: the hero background image (`hero-truck.jpg`) is the LCP element. Optimize
  (responsive/compressed/preload), target < 2.5s on throttled mobile, no CLS.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Decision & scope
- `.planning/notes/2026-06-29-interim-vs-rebuild-decision.md` — the interim-vs-rebuild decision, full scope, dependencies.
- `.planning/ROADMAP.md` (Phase 4 section + "Interim Milestone (v0.5)") — requirements + success criteria.

### Existing codebase (what we're modifying)
- `index.html` — root HTML, current single static `<title>`/meta, GH Pages SPA redirect script.
- `public/404.html` — GH Pages SPA redirect handler (must coexist with prerendering).
- `vite.config.js` — Vite config incl. `base` for GH Pages.
- `package.json` — scripts (`build`), React 19 / Vite 8 / React Router 7 / framer-motion / shadcn deps.
- `src/App.jsx` — React Router route table (6 routes: `/`, `/about`, `/services`, `/fleet`, `/drive-with-us`, `/contact`).
- `src/pages/*.jsx` — the 6 page components (Home, About, Services, Fleet, DriveWithUs, Contact).
- `src/components/sections/Hero.jsx` — hero with the LCP background image + `alt=""`.
- `src/components/layout/Navbar.jsx`, `Footer.jsx` — NAP/brand surfaces.
- `src/pages/Contact.jsx`, `DriveWithUs.jsx` — Formspree forms + NAP + "Q&A Form" heading.

### Project rules
- `CLAUDE.md` — project guidelines (note: its "GSD Workflow Enforcement" + Astro stack sections describe the PAUSED v1.0 rebuild; this phase deliberately stays on React/Vite).
</canonical_refs>

<specifics>
## Specific Ideas

- 6 routes to prerender: `/`, `/about`, `/services`, `/fleet`, `/drive-with-us`, `/contact`.
- Current NAP for JSON-LD + consistency checks: **A2C Logistics CO.**, **5930 Colfax Avenue,
  Lincoln, NE**, **(833) 562-3222**, `kevin@a2clogisticsco.com`, Mon–Fri 8AM–6PM.
- Existing brand tokens (do not change): `#000000 / #FFFFFF / #EF392C / #D9D9D9`, Nevis Bold
  headings, Inter body.
- `JobPosting` should reference A2C as `hiringOrganization`, location Lincoln NE, employment type
  (company driver = FULL_TIME; owner-operator = CONTRACTOR), and `baseSalary`/`estimatedSalary`
  as a range with currency + unit.
</specifics>

<deferred>
## Deferred Ideas

- Domain migration to `a2clogisticsco.com` — belongs to the v1.0 rebuild / separate effort.
- Real form backend (Resend + Sheet), spam defense, ATS — v1.0 rebuild (blocked).
- Curated city/SEO landing pages, 301 redirect map, Lighthouse/axe CI gates — v1.0 rebuild Phase 3.
- Real pay numbers (if unavailable now): publish marked placeholder ranges; swap when supplied.
</deferred>

---

*Phase: 04-interim-seo-crawlability-structured-data-polish-current-site*
*Context gathered: 2026-06-29 via explore-session Q&A*
