# Roadmap: A2C Logistics CO. — Driver Recruiting Site

**Created:** 2026-05-04
**Granularity:** standard
**Mode:** yolo
**Coverage:** 73/73 v1 requirements mapped (100%)

## Core Value

Every visiting driver — owner-op or company — leaves the site having either submitted the quick-apply form, or knowing exactly who A2C is and why "Driven to be different" is more than a tagline. **Conversion is the bar; trust is the moat.**

## Phase Strategy

Three phases, derived from the research synthesis (`research/SUMMARY.md`) and validated against the 73 v1 requirements. The structure puts the **conversion path and credibility surface in Phase 1** (the working core) before the **trust narrative in Phase 2** (drives use justification) and **SEO + cutover + launch gates in Phase 3** (the launch-day ship).

Why three phases (not more):

- **Form before story.** Drivers won't submit without seeing real pay, and silent form failure is the catastrophic failure mode for a single-conversion-goal site. The form handler + pay routes must ship in Phase 1 — not bolted on as polish — so every CTA and every page works end-to-end from the first preview deploy.
- **Pay before story.** Trust narrative dresses pay numbers, not the other way around. Pay also drives the toggle URL decision and the `JobPosting` schema — coupling three pitfalls (stale numbers, state pay-transparency law, OO/Company toggle SEO) into one Phase-1 decision.
- **Brownfield cutover in Phase 3.** Lost link equity from week-one 404s is irrecoverable in the short term, so 301 redirects, GMB/aggregator updates, and GSC week-1 monitoring all live in the cutover phase.
- **Counsel review batched into Phase 3.** Privacy + SMS terms + EEO + form fields + consent block all reviewed in one session is faster, cheaper, and more coherent than serializing. Phase 1 ships counsel-ready drafts so the form has the real consent block from day one.
- **Lighthouse + WCAG AA in Phase 3 (launch hardening).** Per SUMMARY's Phase 3 scope — perf and a11y are CI gates enforced once content is stable; a CI budget that fails on a half-built page wastes signal.

## Phases

- [ ] **Phase 1: Foundation + Form + Pay Engine** — Launchable conversion core (Astro on Cloudflare Pages, form handler with two-sink delivery + alerting, two URL-routed pay pages with real numbers, draft compliance copy)
- [ ] **Phase 2: Story + Trust + Ecosystem** — Credibility content layer (founder story, driver testimonials, equipment with real truck photos, A2C Family ecosystem page)
- [ ] **Phase 3: SEO + Brownfield Cutover + Launch Hardening** — Launch-gate work (sitemap, JSON-LD, curated SEO landing pages, 301 redirect map, external listings update, counsel review, performance/a11y CI passes, recruiter SOP)
- [ ] **Phase 4: Interim — SEO + Polish (current-site track)** — *Separate Interim Milestone v0.5, runs NOW while 1–3 are paused.* Prerender + per-page meta + JobPosting/LocalBusiness JSON-LD + sitemap/robots/OG + copy/a11y/LCP on the existing React site (GitHub Pages, Formspree). See detail under "Interim Milestone (v0.5)" below.

## Phase Details

### Phase 1: Foundation + Form + Pay Engine

**Goal**: Deliver a launchable end-to-end conversion path — every CTA on every page reaches a real form handler that durably captures and alerts on driver leads, and every visiting driver can land on a pay page with real numbers, real ranges, and an `effective` date that justifies submitting.

**Depends on**: Nothing (first phase)

**Requirements** (42):
- Site foundation: SITE-01, SITE-02, SITE-04, SITE-06, SITE-07
- Brand system: BRAND-01, BRAND-02, BRAND-03, BRAND-04, BRAND-05
- Driver funnel: FUNNEL-01, FUNNEL-02, FUNNEL-03, FUNNEL-04, FUNNEL-05, FUNNEL-06, FUNNEL-07, FUNNEL-08
- Pay & benefits: PAY-01, PAY-02, PAY-03, PAY-04, PAY-05, PAY-06, PAY-07
- Form security: SEC-01, SEC-02, SEC-03, SEC-04, SEC-05, SEC-06
- Compliance (drafts + field whitelist + FCRA stance): COMP-01, COMP-02, COMP-03, COMP-04, COMP-05, COMP-07
- Hosting & deployment: HOST-01, HOST-02, HOST-04
- Operations (alerting wired alongside the form): OPS-02
- SEO (the JSON-LD that ships with the pay routes): SEO-04

**Success Criteria** (what must be TRUE):
  1. A test submission to `/apply` from a real iPhone delivers to the recruiter inbox AND appears as a row in the Google Sheet within 60 seconds, AND the consent text version + timestamp + IP + user-agent are captured on the row.
  2. When the Sheet sink is deliberately broken (revoked credentials), a submission still delivers via email, the row queues to the durable fallback store, an alert fires to the monitored channel within 5 minutes, AND the user sees a success state — the form never silently swallows a lead.
  3. `/pay/owner-operator` and `/pay/company` are two physical SSG'd routes with their own `<title>`, `<H1>`, canonical-to-self, and `JobPosting` JSON-LD with `baseSalary` populated; the page renders real CPM/% numbers (or placeholder ranges marked "pending real data") plus the `effective: YYYY-MM` date next to every number, and `/pay` 308-redirects to `/pay/owner-operator`.
  4. The OO ↔ Company toggle on a pay page navigates between the two routes (no client-only state), the user's choice persists in `localStorage`, and a `tel:`+`sms:` recruiter phone is visible in the header and footer of every page.
  5. A submission posted from a non-production origin, with no Turnstile token, with the honeypot filled, or from an IP that has already submitted 3 times in the last 10 minutes is rejected by the server (verified by curl + log review); the production domain has SPF/DKIM/DMARC configured for Resend; client + server use the same Zod schema.
  6. A draft (not yet counsel-reviewed) Privacy Policy, SMS Terms, and EEO Statement are live and linked from the footer + form, the consent block on the form covers TCPA SMS specifics (frequency cap, "consent isn't a condition," STOP opt-out), and the form does NOT collect SSN/MVR/full DOT history/arrest history (verified against the field whitelist).

**Plans**: TBD
**UI hint**: yes

---

### Phase 2: Story + Trust + Ecosystem

**Goal**: Build the credibility surface that turns a driver who landed on a pay page into a driver who trusts A2C enough to submit — real founder voice, real driver testimonials, real A2C trucks, and a clear "you're joining A2C, with the ecosystem behind you" framing of LTTR/LTS/DP/OTTS.

**Depends on**: Phase 1 (header/footer/layout, brand tokens, MDX provider, section primitives shipped; the apply CTA on every story page must point at the live `/apply` route from Phase 1).

**Requirements** (14):
- Driver-first story: STORY-01, STORY-02, STORY-03, STORY-04
- Trust signals: TRUST-01, TRUST-02, TRUST-03, TRUST-04, TRUST-05, TRUST-06
- A2C Family ecosystem: ECO-01, ECO-02, ECO-03, ECO-04

**Success Criteria** (what must be TRUE):
  1. The homepage hero loads with "Driven to be different" rendered in Nevis Bold per the brand book, leads with the driver-first promise (no shipper/freight messaging), and routes to `/apply` via the persistent header CTA + an in-section CTA above the fold on mobile.
  2. A driver clicking through `/about` sees the founder's real photo, signed letter or first-person quote, and a "what it's actually like" block with concrete specifics (named dispatchers + hours, the LTTR break-down playbook, dispute-handling process) — every "we care" claim is backed by a verifiable specific, no "family"-without-substance copy survives the read.
  3. The testimonials surface renders 2–3 named/photographed driver testimonials (first name + last initial, real photo, specific quote — not generic) AND degrades gracefully to an honest empty/lite state for any unfilled testimonial slot — the layout never visibly breaks.
  4. The `/equipment` page shows real A2C truck photos (sourced from the half-day yard shoot — content-readiness blocker flagged), full spec list per truck (make, model, year, transmission, sleeper, APU, inverter, fridge, idle policy), and an LTTR in-house repair callout that names LTTR as the answer to "what happens when I break down"; MC# and USDOT# are visible in the footer of every page on the site.
  5. The `/family` page introduces all four sister brands (LTTR, LTS, DP, OTTS) with logo + tagline + one-line value-to-the-A2C-driver, includes a lightweight SVG driver-journey diagram framed as value (not corporate org chart), links out to live brands (or shows clear "Coming soon" for not-yet-live ones — never broken links), and the apply CTA on the page reads "Apply to drive for A2C Logistics" so no driver thinks they're applying to LTTR/DP.

**Plans**: TBD
**UI hint**: yes

---

### Phase 3: SEO + Brownfield Cutover + Launch Hardening

**Goal**: Ship the launch-gate work — search-engine surface area, brownfield 301 redirect map, external-listings update, performance/accessibility CI passes, and the single batched counsel review session — so launch day preserves link equity, captures search traffic, and is legally defensible from minute one.

**Depends on**: Phase 1 (foundation + form + pay routes), Phase 2 (story + ecosystem content). All pages must be content-stable before SEO surface area is finalized and counsel reviews real (not placeholder) content.

**Requirements** (17):
- Performance + accessibility CI gates: SITE-03, SITE-05
- SEO & discoverability: SEO-01, SEO-02, SEO-03, SEO-05, SEO-06, SEO-07, SEO-08
- Brownfield cutover: CUT-01, CUT-02, CUT-03, CUT-04
- Compliance counsel review: COMP-06
- Operations (analytics funnel events + recruiter SOP): OPS-01, OPS-03
- Hosting (production deploy gating): HOST-03

**Success Criteria** (what must be TRUE):
  1. `sitemap.xml` and `robots.txt` are generated at build time, every page has its own `<title>` + meta description + canonical + OpenGraph image, `Organization` JSON-LD ships on every page, the Phase-1 `JobPosting` JSON-LD with `baseSalary` validates in Google Rich Results Test on both pay routes, and `FAQPage` JSON-LD validates on the FAQ page; `apply/success`, `/privacy`, `/terms`, `/eeo`, and `404` all carry `noindex`, and Cloudflare Pages preview deploys (`*.pages.dev`) carry `X-Robots-Tag: noindex` so they cannot compete with production.
  2. A pre-cutover crawl of the existing `a2clogistics.com` produces a URL inventory (committed to the repo), the `public/_redirects` file (Cloudflare Pages format) returns 301s for `/services` → `/`, `/fleet` → `/`, `/drive-with-us` → `/apply` (verified by curl), and `/about` + `/contact` are preserved at their existing slugs.
  3. Three to five curated SEO landing pages (Lincoln NE, Omaha, Nebraska, OO variants — each with 250+ words of unique substantive content, no templated city-page generator) are live, indexable, and internally linked; a Lighthouse mobile run in CI passes LCP < 2.5s on 4G, CLS < 0.1, INP < 200ms, and an axe-core pass returns zero WCAG AA violations; production deploys are gated on lint + typecheck + Lighthouse budget passing.
  4. Counsel has reviewed and signed off on the Privacy Policy, SMS Terms, EEO Statement, the apply form fields whitelist, and the TCPA SMS consent block in a single batched session, and any required revisions ship before the launch gate (the live site reflects counsel-approved final copy, not the Phase-1 drafts; the consent-block version captured per submission matches the live block).
  5. Launch-day external-listings update is executed and verified within 72 hours: GMB website + phone + hours updated, FMCSA SAFER profile updated, Indeed / Trucking Truth / AllTruckJobs / LinkedIn / Facebook / Instagram bio + recruiter email signatures all point at the new domain; sitemap.xml is resubmitted to Google Search Console; week-1 daily 404 monitoring is active in GSC; Plausible Analytics is firing the defined funnel events (form view, field abandon, submit success, submit error, CTA click, phone tap, SMS tap); and a written recruiter SOP exists covering 24h lead-handoff SLA, "but the website said" pay-objection handling, STOP-message handling, and how to log call/text outcomes back to the lead row.

**Plans**: TBD
**UI hint**: yes

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation + Form + Pay Engine | 0/0 | Not started | - |
| 2. Story + Trust + Ecosystem | 0/0 | Not started | - |
| 3. SEO + Brownfield Cutover + Launch Hardening | 0/0 | Not started | - |
| 4. Interim — SEO + Polish (current-site) | 4/6 | In Progress|  |

## Coverage Summary

| Category | Count | Phase Mapping |
|----------|-------|---------------|
| FUNNEL (driver funnel) | 8 | All in Phase 1 |
| PAY (pay & benefits) | 7 | All in Phase 1 |
| STORY (driver-first story) | 4 | All in Phase 2 |
| TRUST (trust signals) | 6 | All in Phase 2 |
| ECO (A2C Family ecosystem) | 4 | All in Phase 2 |
| SITE (site foundation) | 7 | SITE-01, 02, 04, 06, 07 in Phase 1; SITE-03, 05 in Phase 3 |
| BRAND (brand system) | 5 | All in Phase 1 |
| SEO (SEO & discoverability) | 8 | SEO-04 in Phase 1; SEO-01, 02, 03, 05, 06, 07, 08 in Phase 3 |
| CUT (brownfield cutover) | 4 | All in Phase 3 |
| COMP (compliance & legal) | 7 | COMP-01, 02, 03, 04, 05, 07 in Phase 1; COMP-06 in Phase 3 |
| SEC (form security) | 6 | All in Phase 1 |
| OPS (operations & analytics) | 3 | OPS-02 in Phase 1; OPS-01, 03 in Phase 3 |
| HOST (hosting & deployment) | 4 | HOST-01, 02, 04 in Phase 1; HOST-03 in Phase 3 |
| **Total v1 mapped** | **73** | **100% coverage, no orphans, no duplicates** |

**Per-phase totals:** Phase 1 = 42, Phase 2 = 14, Phase 3 = 17 (sum = 73 ✓)

## Content-Readiness Blockers (per phase)

These are real-world inputs the build cannot fabricate. Surfaced here so each phase has its readiness gate visible from day one:

| Phase | Blocker | Source / owner |
|-------|---------|----------------|
| Phase 1 | Real CPM ranges, %-of-gross splits, fast-pay terms, fuel discount, sign-on bonus, detention/stop/layover pay, OO deduction line items | A2C operations (PROJECT.md marks as "supplied during build") |
| Phase 1 | Nevis Bold web license confirmed (or substitute display font selected with brand-book footnote) | Brand asset sourcing |
| Phase 1 | Resend domain SPF/DKIM/DMARC configured for sending domain | DNS / hosting owner |
| Phase 1 | Recruiter phone number (`tel:` + SMS-capable, single tracked number) | Recruiting team |
| Phase 1 | Google Sheet (or Airtable base) created with service-account access | Recruiting team / ops |
| Phase 2 | Founder photo + signed letter or quote (PROJECT confirms ready) | Founder |
| Phase 2 | 2–3 named driver testimonials with photos + specific quotes (start with what's available; lite state for the rest) | Recruiting + drivers |
| Phase 2 | Half-day truck-photo yard shoot at Lincoln yard | Operations + photographer |
| Phase 2 | Sister-brand logos + status (live URL or "coming soon") for LTTR, LTS, DP, OTTS | Brand owners |
| Phase 3 | Counsel availability for the single batched review session (privacy + SMS terms + EEO + form fields + consent block) | Legal counsel |
| Phase 3 | External-listings ownership confirmed (GMB, FMCSA SAFER, Indeed, Trucking Truth, AllTruckJobs, LinkedIn, FB, IG, recruiter email signatures) | Recruiting team |
| Phase 3 | Google Search Console ownership of `a2clogisticsco.com` verified (DNS TXT) before launch | DNS / hosting owner |

## Out of v1 Scope (deferred — see REQUIREMENTS.md `## v2 Requirements`)

The research SUMMARY proposed a 5-phase structure; two later tracks — post-launch differentiators (pay calculator, founder video, settlement download, apply-by-text, lane map, lite-youtube embed) and ATS integration (Tenstreet/DriverReach) — are intentionally NOT in this v1 roadmap. (Note: "Phase 4" in this roadmap now refers to the Interim Milestone v0.5 track, unrelated to these deferred v2 tracks.) Each is tracked under `## v2 Requirements` in REQUIREMENTS.md (`DIFF2-*`, `ATS2-*`, `OPS2-*`, `SEO2-*`) and requires a separate decision-to-promote when the operational triggers (60–90 day pay stability, application volume, content-editing pain, etc.) are met.

---

*Roadmap created: 2026-05-04*

---

# Interim Milestone (v0.5) — Current-Site SEO & Polish

**Added:** 2026-06-29 · **Decision record:** `.planning/notes/2026-06-29-interim-vs-rebuild-decision.md`

**Why this exists:** The v1.0 Astro rebuild (Phases 1–3 above) is **paused** — blocked ~2 months
on real-world inputs only A2C can supply (pay numbers, nameserver switch, Nevis license, Resend DKIM,
recruiter phone, Google Sheet, counsel). Rather than sit blocked while quick wins go unshipped, this
interim milestone ships **unblocked SEO + polish improvements on the existing Vite/React site**,
staying on GitHub Pages. SEO content + structured data + copy produced here **transfer directly into
the rebuild** when it resumes.

**Hard constraint:** GitHub Pages is **static-only** — no real form backend. Forms stay on Formspree
until the rebuild. Domain migration to `a2clogisticsco.com` is deferred.

**Primary audience:** Drivers (owner-operators + company). SEO = local + job-posting intent
("CDL Class A driver jobs Lincoln NE", Google for Jobs).

### Phase 4: Interim — SEO Crawlability + Structured Data + Polish (current-site track)

> **Tracking note:** Phase 4 belongs to the **Interim Milestone (v0.5)**, not the v1.0 rebuild.
> It is numbered 4 only so GSD tooling (`plan-phase`, `execute-phase`) can address it. It runs
> NOW on the existing React site; Phases 1–3 (the v1.0 Astro rebuild) remain paused.

**Goal:** Make the current React site fully crawlable and richly indexed for driver-recruitment search (local + job-posting intent), and fix the highest-leverage usability/perf issues — all without leaving GitHub Pages and without any of the v1.0 rebuild's blocked inputs.

**Depends on:** Nothing (operates on the existing committed React/Vite codebase).

**Requirements** (11):
- SEO & crawlability: INT-SEO-01, INT-SEO-02, INT-SEO-03, INT-SEO-04, INT-SEO-05, INT-SEO-06, INT-SEO-07
- UX & content: INT-UX-01, INT-UX-02
- Accessibility: INT-A11Y-01
- Performance: INT-PERF-01

These are interim-scoped (`INT-` prefix), distinct from the 73 v1.0 rebuild requirements.

**Requirement details:**
- INT-SEO-01 — Prerender all 6 routes to static HTML at build (react-snap or vite-react-ssg) so crawlers/link-scrapers receive real markup, not an empty `#root`.
- INT-SEO-02 — Unique per-page `<title>`, meta description, and self-canonical on every route (React 19 native document metadata).
- INT-SEO-03 — `JobPosting` JSON-LD on Drive With Us (pay as ranges marked "as of {date}" if real numbers unavailable; avoids stale-number trap).
- INT-SEO-04 — `Organization`/`LocalBusiness` JSON-LD on the home route + consistent NAP (name, address, phone) across footer/Contact.
- INT-SEO-05 — Build-generated `sitemap.xml` + `robots.txt` in `public/`.
- INT-SEO-06 — Open Graph + Twitter Card tags per route + a static OG share image.
- INT-SEO-07 — Keyword-aware copy: weave driver-job search intent into H1s/section headings naturally (no keyword stuffing).
- INT-UX-01 — Verify both Formspree endpoints (`mvzvrleo` contact, `mzdkgolq` apply) are real, owned, and delivering; document or fix.
- INT-UX-02 — Copy cleanup (e.g. replace "Q&A Form" heading; tighten CTA labels).
- INT-A11Y-01 — Accessibility pass: gray-text contrast to WCAG AA, visible focus states, meaningful image alt text.
- INT-PERF-01 — Hero LCP optimization (responsive/compressed hero image, preload, no CLS).

**Success Criteria** (what must be TRUE):
  1. `curl` of each of the 6 production route URLs (no JS execution) returns fully-rendered HTML containing that page's headings and body copy — not an empty `#root` shell.
  2. Each route serves a distinct `<title>` and meta description and a self-referential `<link rel="canonical">`; viewing source (not devtools) shows them present in the static HTML.
  3. The Drive With Us route's `JobPosting` JSON-LD validates with zero errors in Google's Rich Results Test, and the home route's `Organization`/`LocalBusiness` JSON-LD validates; NAP is byte-identical across footer and Contact.
  4. `sitemap.xml` (listing all 6 public routes with the GitHub Pages base path) and `robots.txt` (referencing the sitemap) are served at the site root; sharing any route URL renders an OG title + description + image preview.
  5. Both Formspree endpoints are confirmed live (a real test submission arrives) or replaced; the "Q&A Form" heading and any placeholder copy are gone.
  6. An axe-core / Lighthouse accessibility pass shows no WCAG AA contrast failures on body/gray text, all interactive elements have visible focus states, and content images have descriptive alt text; hero image is the LCP element with LCP measured (target < 2.5s on throttled mobile) and no layout shift.

**Plans**: 6 plans, 3 waves
- [x] 04-01-PLAN.md — Prerender infrastructure: puppeteer + vite preview snapshot, hydration guard, favicon fix, Vitest scaffold (INT-SEO-01) [Wave 1]
- [x] 04-02-PLAN.md — Formspree endpoint verification (live test submission, swap dead IDs) (INT-UX-01) [Wave 1, checkpoint]
- [x] 04-03-PLAN.md — SEO components + structured data: Seo.jsx, schema.js, Footer NAP, Home/DriveWithUs JSON-LD (INT-SEO-02/03/04/06/07) [Wave 2]
- [x] 04-04-PLAN.md — Sitemap, robots, OG image static assets (INT-SEO-05/06) [Wave 2]
- [ ] 04-05-PLAN.md — Hero LCP + self-hosted fonts + WCAG AA accessibility (INT-PERF-01, INT-A11Y-01) [Wave 2, checkpoint]
- [ ] 04-06-PLAN.md — Remaining page metadata + copy cleanup (Q&A heading, CTA labels) (INT-SEO-02/06/07, INT-UX-02) [Wave 3]
**UI hint**: yes (a11y + LCP + copy touch the rendered UI)

---

*Interim milestone added: 2026-06-29*
*Phase 4 planned: 2026-06-29 — 6 plans across 3 waves*
