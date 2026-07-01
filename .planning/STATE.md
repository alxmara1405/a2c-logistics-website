---
gsd_state_version: 1.0
milestone: v0.5-interim
milestone_name: Current-Site SEO & Polish
status: executing
last_updated: "2026-07-01T18:07:36.140Z"
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 12
  completed_plans: 3
  percent: 25
---

# Project State: A2C Logistics CO. — Driver Recruiting Site

**Last updated:** 2026-05-04 (after roadmap creation)

## Project Reference

**Core Value:** Every visiting driver — owner-op or company — leaves the site having either submitted the quick-apply form, or knowing exactly who A2C is and why "Driven to be different" is more than a tagline. **Conversion is the bar; trust is the moat.**

**Current Focus:** Phase 04 — interim-seo-crawlability-structured-data-polish-current-site

**Tech Stack (locked by research):** Astro 6 + Tailwind 4 + MDX content collections + React islands (apply form + OO/Company toggle only) + Astro Actions. Deployed on Cloudflare Pages with `@astrojs/cloudflare` adapter. Form handler runs on Pages Functions with `nodejs_compat` flag (Resend + googleapis need Node modules). Cloudflare Turnstile + honeypot + origin check + IP rate-limit. Conform + Zod for the form (single schema validates client + server). Plausible for cookieless analytics.

## Current Position

Phase: 04 (interim-seo-crawlability-structured-data-polish-current-site) — EXECUTING
Plan: 4 of 6 (04-01 prerender-infrastructure, 04-02 formspree-endpoint-verification, 04-03 seo-components-structured-data COMPLETE ✅)
**Active milestone:** v0.5-interim — Current-Site SEO & Polish (decided 2026-06-29; see `notes/2026-06-29-interim-vs-rebuild-decision.md`)
**Active phase:** Phase 4 — Interim SEO Crawlability + Structured Data + Polish (current-site track; numbered 4 for tooling, belongs to v0.5-interim)
**Plan:** 6 plans across 3 waves (+ Wave 0 setup folded into 04-01) — plan-checker verdict: PASSED. 04-01 + 04-02 + 04-03 done; next plan ready to execute.
**Status:** Executing Phase 04 — crawlability foundation (INT-SEO-01) + Formspree live (INT-UX-01) + structured data / per-page metadata / Footer NAP (INT-SEO-02/03/04/07) baked into static HTML
**Last session:** 2026-07-01 — completed 04-03-PLAN.md (seo-components-structured-data). Seo component + JobPosting/LocalBusiness JSON-LD + Footer NAP + keyword-aware titles/H1 baked into dist; tests 30/30 green. Open content deps: real ZIP + real driver pay range (placeholders flagged in schema.js). Phase-gate TODO: Google Rich Results Test on both routes. Stopped at: plan complete. Resume file: none.

> **v1.0 Astro rebuild (Phases 1–3 below): PAUSED, not abandoned.** Still BLOCKED on user setup
> (Squarespace→Cloudflare nameserver switch + 7 content/infra blockers — see PROJECT.md hosting/DNS
> section + plans/01-00-foundation Task 0.3 checkpoint). Resume once those clear. The interim
> milestone runs in the meantime and its SEO/content work transfers into the rebuild.

```
Active: Interim Milestone (v0.5) — [ ] SEO + Polish phase (planning not started)
Paused: v1.0 Rebuild — [ ] Phase 1 [ ] Phase 2 [ ] Phase 3 (blocked on user setup)
```

## Roadmap Snapshot

| Phase | Goal (one-line) | Requirements | Status |
|-------|-----------------|--------------|--------|
| 1 — Foundation + Form + Pay Engine | Launchable conversion core: two-sink form handler, brand shell, URL-routed pay pages with real numbers + JSON-LD | 42 | Not started |
| 2 — Story + Trust + Ecosystem | Credibility surface: founder voice, named driver testimonials, real truck photos, four-brand A2C Family | 14 | Not started |
| 3 — SEO + Brownfield Cutover + Launch Hardening | Launch gates: SEO surface, 301 map, listings update, perf/a11y CI, batched counsel review, recruiter SOP | 17 | Paused (v1.0 rebuild) |
| 4 — Interim SEO + Polish (current-site track) | **ACTIVE (v0.5-interim):** prerender + per-page meta + JobPosting/LocalBusiness JSON-LD + sitemap/robots/OG + copy/a11y/LCP on the existing React site | 11 (INT-*) | Planned (6 plans, checker PASSED) — ready to execute |

**Coverage:** 73 / 73 v1 requirements mapped (100%) · 0 orphaned

## Performance Metrics

| Metric | Target | Current | Notes |
|--------|--------|---------|-------|
| Mobile LCP (4G) | < 2.5s | — | CI gate via Lighthouse (Phase 3) |
| CLS | < 0.1 | — | Font fallback metric overrides set in Phase 1; verified Phase 3 |
| INP | < 200ms | — | First-load JS budget (Phase 1) + Lighthouse CI (Phase 3) |
| First-load JS | < 200 KB gzipped | — | CI gate Phase 1 (zero-JS-by-default Astro pages, React only on form + toggle islands) |
| Accessibility | WCAG AA | — | axe-core regression in CI (Phase 3) |
| Form delivery latency | < 60s end-to-end | — | Test submission → email + Sheet within 60s (Phase 1) |
| Form silent-failure detection | < 24h | — | Daily synthetic submission verifies both sinks (Phase 1) |

## Accumulated Context

### Key Decisions (locked)

| Decision | Rationale | Phase |
|----------|-----------|-------|
| Astro 6 over Next.js | 6–8 page marketing site with two interactive islands; zero-JS-by-default wins ~8–15 Lighthouse mobile points; first-party Cloudflare adapter | Locked pre-Phase 1 |
| Cloudflare Pages over Netlify | Workers run at CDN PoP nearest the driver (truck-stop-wifi audience); higher daily free-tier function ceiling | Locked pre-Phase 1 |
| OO ↔ Company toggle = URL-routed pages | SEO: `/pay/owner-operator` and `/pay/company` each rank for distinct queries; client-state toggles invisible to crawlers; `/pay` 308 → `/pay/owner-operator` | Locked Phase 1 |
| Form handler runs on Node runtime, not Edge | Resend SDK + googleapis need Node-only modules; bottleneck is the email API call (300–800ms), not the runtime | Locked Phase 1 |
| Form ships in Phase 1, not as polish | Silent form failure is the catastrophic failure mode for a single-conversion-goal site; every page CTA is a mock until the form is real | Locked Phase 1 |
| Two-sink delivery (email REQUIRED + Sheet OPTIONAL) with durable fallback store + alerting + daily synthetic | Email failure rejects the request; Sheet failure logs + alerts but never blocks the user; idempotency key per submission | Locked Phase 1 |
| Pay numbers as ranges with `effective` date frontmatter | Single numbers go stale and become screenshot weapons; ranges + "as of" disclosure self-identify when stale | Locked Phase 1 |
| Counsel review batched into Phase 3 (single session) | Faster + cheaper than serializing; Phase 1 ships counsel-ready drafts so the form has a real consent block from day one | Locked Phase 3 |
| Brownfield 301 redirects ship in Phase 3 (cutover phase) | Lost link equity from week-one 404s is irrecoverable; redirects + GMB updates + GSC monitoring all live in cutover | Locked Phase 3 |
| Lighthouse + WCAG AA CI gates in Phase 3 | Per SUMMARY's Phase 3 scope — perf and a11y enforced once content is stable; failing budgets on half-built pages waste signal | Locked Phase 3 |
| MDX-in-repo, no headless CMS | Updates infrequent; PR-based editing is sufficient; TinaCMS deferrable as a non-breaking add later | Locked pre-Phase 1 |
| Interim prerender = custom puppeteer + `vite preview()` post-build script (not a Rollup/Rolldown plugin) | Vite 8 ships Rolldown (RC); a bundler-agnostic post-build snapshot avoids plugin-compat risk and faithfully captures React 19 metadata hoist + JSON-LD; folder-form output coexists with the GH Pages 404 hack | Locked Phase 4 (04-01) |
| Plausible (cookieless) over GA4 | Avoids cookie-banner cost; matches transparent / driver-first posture | Locked Phase 3 |
| Wholesale rebuild, not migration | Existing site mixes shipper + driver audiences across 6 pages; no clean migration path | Locked pre-Phase 1 |

### Open Items / Content-Readiness Blockers

**Phase 1 blockers:**

- [ ] Real CPM ranges, %-of-gross splits, fast-pay terms, fuel discount, sign-on bonus, detention/stop/layover pay, OO deduction line items — A2C operations to supply
- [ ] Nevis Bold web license sourced (or substitute display font selected with brand-book footnote)
- [ ] Resend domain SPF/DKIM/DMARC configured for sending domain (e.g. `mail.a2clogisticsco.com`)
- [ ] Recruiter phone number (`tel:` + SMS-capable, single tracked number) confirmed
- [ ] Google Sheet (or Airtable base) created with service-account access
- [ ] Choice between Sheet vs Airtable as the OPTIONAL sink (architecture supports both behind same `LeadSink` interface; recommend Sheets to start)
- [ ] Durable fallback store choice (R2 vs KV vs second sink)

**Phase 2 blockers:**

- [ ] Founder photo + signed letter or quote (PROJECT confirms ready now)
- [ ] 2–3 named driver testimonials with photos + specific quotes
- [ ] Half-day truck-photo yard shoot at Lincoln yard scheduled
- [ ] Sister-brand logos + status (live URL or "coming soon") for LTTR, LTS, DP, OTTS

**Phase 4 (interim) follow-ups (non-blocking):**

- [ ] Submit each live form once and confirm the message lands in the intended A2C-owned inbox (contact endpoint `mvzvrleo`, apply endpoint `mzdkgolq`; recruiter inbox of record `kevin@a2clogisticsco.com`). Both endpoints are confirmed to accept POST (probed 2026-06-29); the only unverified link is inbox delivery/ownership. If a submission does not arrive, create an A2C-owned Formspree form and swap the corresponding form-ID string in `src/pages/Contact.jsx` / `src/pages/DriveWithUs.jsx`. Does NOT block remaining Phase 4 plans. (04-02)

**Phase 3 blockers:**

- [ ] Counsel availability for single batched review session (privacy + SMS terms + EEO + form fields + consent block)
- [ ] External-listings ownership confirmed (GMB, FMCSA SAFER, Indeed, Trucking Truth, AllTruckJobs, LinkedIn, FB, IG, recruiter email signatures)
- [ ] Google Search Console ownership verified on `a2clogisticsco.com` (DNS TXT) before launch

### Active TODOs

- [ ] Run `/gsd-discuss-phase 1` (recommended — `discuss_mode: discuss` in config) or `/gsd-plan-phase 1`

### Blockers

None at the planning stage. Content-readiness blockers above are real but do not block planning — they will block specific plan execution within each phase.

## Session Continuity

**Files of record:**

- `.planning/PROJECT.md` — core value, constraints, key decisions
- `.planning/REQUIREMENTS.md` — 73 v1 requirements with traceability table (now phase-mapped)
- `.planning/ROADMAP.md` — 3-phase structure with success criteria
- `.planning/research/SUMMARY.md` — research synthesis (5-phase suggestion; phases 4/5 deferred to v2)
- `.planning/research/STACK.md` — Astro 6 + Cloudflare Pages stack rationale
- `.planning/research/ARCHITECTURE.md` — 5-wave build order (form ships early in Wave 3, parallel with sections)
- `.planning/research/PITFALLS.md` — 20 numbered pitfalls + launch-gate checklist
- `.planning/config.json` — granularity: standard, mode: yolo, parallelization: true

**Existing codebase (to be replaced wholesale):**

- Vite 8 + React 19 + Tailwind 4 + React Router 7 + framer-motion + base-ui/shadcn-style components
- 6 pages (Home, About, Services, Fleet, DriveWithUs, Contact) — mixed shipper + driver audience
- Treat as greenfield; some salvageable copy in `src/pages/About.jsx` (`"Built by Drivers, for Drivers"`) — see PITFALLS Pitfall 19 (old-site copy bleed) for the audience-tagging rule before re-using

**Brand assets** (in `/Users/alexandercostea/Downloads/`):

- `A2C Brand Development_Final Delivery (1).pdf` (14-page brand system)
- `A2C Messaging Framework.docx`
- `A2C_Snaphot_Final (1).pdf`
- `A2C Brand Ecosystem (1).pdf`
- Tagline: "Driven to be different."
- Visual: Nevis Bold (headlines) / Avenir (body); palette `#FFFFFF / #000000 / #EF392C / #D9D9D9`

**Next command:** `/gsd-discuss-phase 1` (recommended given Phase 1's high novel-integration density: Cloudflare Pages Functions + nodejs_compat + Astro Actions + Resend + Sheets service-account + Turnstile server-verify + durable fallback store) or `/gsd-plan-phase 1` to skip directly to planning.

---

*State initialized: 2026-05-04 after roadmap creation*
