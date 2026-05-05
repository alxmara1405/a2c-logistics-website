# Requirements: A2C Logistics CO. — Driver Recruiting Site

**Defined:** 2026-05-04
**Core Value:** Every visiting driver — owner-op or company — leaves the site having either submitted the quick-apply form, or knowing exactly who A2C is and why "Driven to be different" is more than a tagline. Conversion is the bar; trust is the moat.

## v1 Requirements

Requirements for initial public launch (`a2clogistics.com`). Each maps to a roadmap phase.

### Driver Funnel — the conversion path

- [ ] **FUNNEL-01**: User can submit a quick-apply form with ≤ 6 fields (first name, last name, phone, email, CDL class, years experience) plus an OO-vs-Company selector and current state
- [ ] **FUNNEL-02**: Form submissions deliver to recruiter via transactional email (REQUIRED sink) AND log to a Google Sheet (OPTIONAL sink) behind a swappable `LeadSink` adapter so a future ATS (Tenstreet/DriverReach) can drop in without rebuilding the form
- [ ] **FUNNEL-03**: Form handler tolerates partial sink failure — if Sheet write fails, lead still delivers via email, error is alerted, and the row is queued to a durable fallback store for reconciliation
- [ ] **FUNNEL-04**: Form handler is alerted on any sink failure and a daily synthetic submission verifies both sinks are live (silent failure is the catastrophic failure mode and must be detected within 24h)
- [ ] **FUNNEL-05**: Submission success page confirms next step ("a recruiter will text/call within 24 hours"), provides the recruiter phone as a fallback, and is `noindex`'d
- [ ] **FUNNEL-06**: Persistent header CTA + repeated section CTAs route every page to `/apply`; OO and Company pages deep-link into the apply form with the OO/Company state pre-selected
- [ ] **FUNNEL-07**: Visible recruiter phone with `tel:` link in the header and footer; SMS-capable number with `sms:` link
- [ ] **FUNNEL-08**: Idempotency key per submission prevents duplicate leads from double-tap on flaky truck-stop wifi

### Pay & Benefits — the credibility surface

- [ ] **PAY-01**: Two URL-routed pay pages — `/pay/owner-operator` and `/pay/company` — each with its own `<title>`, `<H1>`, meta description, canonical-to-self, and `JobPosting` JSON-LD with `baseSalary` (no query-param toggle, no client-only state)
- [ ] **PAY-02**: `/pay` redirects (308) to `/pay/owner-operator`
- [ ] **PAY-03**: Toggle UI (OO ↔ Company) appears on every pay page and switches the route; user's choice persists in `localStorage` so navigation back to `/pay` lands them on their preferred variant
- [ ] **PAY-04**: Pay numbers (CPM ranges, %-of-gross, fast-pay terms, fuel discount, sign-on bonus, detention/stop/layover pay, settlement schedule, OO deduction line items) live in a single `src/data/pay.ts` (Zod-validated) and are imported into MDX via custom components — quarterly updates touch one file
- [ ] **PAY-05**: All published pay numbers are ranges (not single point numbers) and carry an `effective: YYYY-MM` frontmatter date that renders next to every number on the page
- [ ] **PAY-06**: Owner-op page includes representative dollar range alongside percentage to satisfy state pay-transparency law (CA/WA/NY/IL/CO/MD all require dollar disclosure on the posting itself)
- [ ] **PAY-07**: No "competitive pay," "top of market," "great pay," or "top earners make $X" copy anywhere on the site (every claim must be a specific number)

### Driver-First Story — the trust layer

- [ ] **STORY-01**: Homepage hero leads with the "Driven to be different" identity and the driver-first promise — not freight services
- [ ] **STORY-02**: Founder/owner story page with real photo, real signed letter or quote, real voice
- [ ] **STORY-03**: "What it's actually like" content covering dispatcher accessibility (real dispatcher names, hours, how they're reached), how disputes are handled, what happens when a truck breaks down (LTTR callout)
- [ ] **STORY-04**: "Driven to be different" tagline appears in the brand-correct typography (Nevis Bold) per the brand book

### Trust Signals — the credibility infrastructure

- [ ] **TRUST-01**: 2–3 driver testimonials at minimum, each with the driver's first name (last initial OK), real photo, and a specific (not generic) quote
- [ ] **TRUST-02**: Testimonial component has a graceful empty/lite state so the layout doesn't visibly break before more testimonials are collected
- [ ] **TRUST-03**: Equipment / Fleet page features real A2C truck photos (one half-day yard shoot) — no stock truck photography anywhere on the site
- [ ] **TRUST-04**: Equipment page lists full truck specs (make, model, year, transmission, sleeper, APU, inverter, fridge, idle policy)
- [ ] **TRUST-05**: LTTR (in-house repair shop) is called out on the equipment page as the concrete answer to "what happens when I break down"
- [ ] **TRUST-06**: MC# and USDOT# visible in the footer of every page

### A2C Family — the ecosystem amplifier

- [ ] **ECO-01**: Dedicated "The A2C Family" section — homepage block plus a dedicated `/family` (or equivalent) page introducing all four sister brands (LTTR, LTS, DP, OTTS) with each brand's logo, tagline, and one-line value-to-the-A2C-driver
- [ ] **ECO-02**: Outbound links to OTTS YouTube + each sister brand's site (or "Coming soon" placeholders for those not yet live; never broken links)
- [ ] **ECO-03**: Driver-journey diagram (lightweight SVG version of the brand-book flywheel) shown on the family page, framed as value to the A2C driver — not a corporate org chart
- [ ] **ECO-04**: Family-section copy makes it clear drivers apply to **A2C** (not the ecosystem) so applicants don't mistakenly think they're applying to LTTR or DP

### Site Foundation — the build

- [ ] **SITE-01**: SEO-ready static-site generation (SSG) so pages rank for queries like "owner operator jobs Nebraska", "lease-on trucking Lincoln NE", "company driver jobs A2C"
- [ ] **SITE-02**: Mobile-first responsive layout — drivers browse from phones at truck stops
- [ ] **SITE-03**: Mobile LCP < 2.5s on simulated 4G; CLS < 0.1; INP < 200ms — measured in CI via Lighthouse
- [ ] **SITE-04**: First-load JS budget < 200 KB gzipped enforced as a CI gate (zero-JS-by-default Astro pages, React only on the form + toggle islands)
- [ ] **SITE-05**: WCAG AA accessibility — keyboard-navigable form, real contrast (especially on the red), visible focus states, large tap targets
- [ ] **SITE-06**: All long-form copy + driver testimonials + pay numbers + sister-brand entries stored as MDX/markdown (or typed `.ts` data) in the repo for git-managed editing
- [ ] **SITE-07**: 404 page with site nav and an apply CTA (don't lose drivers who hit a dead URL)

### Brand System — visual identity

- [ ] **BRAND-01**: Color palette uses brand-book values exactly: `#FFFFFF`, `#000000`, `#EF392C`, `#D9D9D9`
- [ ] **BRAND-02**: Nevis Bold (headlines) and Avenir (body) load from a self-hosted licensed source via `astro:assets` Fonts API with `font-display: swap` and fallback metric overrides
- [ ] **BRAND-03**: Brand book typography choice (Nevis Bold web license) is sourced and confirmed in Phase 1 — if not licensable at acceptable cost, an explicit substitute display font is selected and brand-book footnoted
- [ ] **BRAND-04**: A2C logo (motion-line truck wordmark) is used per the brand book; primary and inverse (white-on-black) variants both implemented
- [ ] **BRAND-05**: Tailwind v4 `@theme` block exposes brand tokens (colors, font families, spacing) for consistent reuse across components

### SEO & Discoverability

- [ ] **SEO-01**: `sitemap.xml` and `robots.txt` generated at build time
- [ ] **SEO-02**: Per-page `<title>`, meta description, canonical, and OpenGraph image
- [ ] **SEO-03**: `Organization` JSON-LD on every page
- [ ] **SEO-04**: `JobPosting` JSON-LD on each pay route (`/pay/owner-operator` and `/pay/company`) with `baseSalary` (Google CDL guidance: `unitText: "MILE"` with CPM as decimal for company; representative dollar range for OO percentage)
- [ ] **SEO-05**: `FAQPage` JSON-LD on the FAQ page; all JSON-LD validated in Google Rich Results Test before launch
- [ ] **SEO-06**: 3–5 curated SEO landing pages (Lincoln NE, Omaha, Nebraska, OO variants) — each with 250+ words of unique content; **no templated city-page generator**
- [ ] **SEO-07**: `apply/success`, `/privacy`, `/terms`, `/eeo`, and `404` are `noindex`
- [ ] **SEO-08**: Cloudflare Pages preview deploys (`*.pages.dev`) get `X-Robots-Tag: noindex` via platform headers so preview URLs never compete with production

### Brownfield Cutover — protect link equity

- [ ] **CUT-01**: Pre-cutover crawl of the existing site (Screaming Frog or equivalent + GSC export) to inventory all live URLs
- [ ] **CUT-02**: 301 redirect map in `public/_redirects` (Cloudflare Pages format): `/services` → `/`, `/fleet` → `/`, `/drive-with-us` → `/apply`; `/about` and `/contact` preserved at their existing slugs
- [ ] **CUT-03**: External listings updated launch day: GMB, FMCSA SAFER, Indeed, Trucking Truth, AllTruckJobs, LinkedIn, Facebook, Instagram, recruiter email signatures
- [ ] **CUT-04**: Sitemap resubmitted to Google Search Console at launch; week-1 daily 404 monitoring in GSC

### Compliance & Legal

- [ ] **COMP-01**: Quick-apply form fields are EEOC-friendly — no questions about age, marital status, family status, disability, religion, national origin, or other protected classes
- [ ] **COMP-02**: TCPA-compliant SMS consent block on the form: explicit opt-in, frequency cap disclosed, opt-out method ("STOP"), "consent isn't a condition of employment" wording. Consent metadata captured per submission (timestamp + IP + UA + consent text version + form version)
- [ ] **COMP-03**: Privacy Policy page describing what PII is collected, how it's used, retention period, who it's shared with, and how to request deletion
- [ ] **COMP-04**: SMS Terms / Messaging Disclosure page disclosing message frequency, cost, opt-out, and help instructions
- [ ] **COMP-05**: EEO Statement page (or footer link) with the standard equal-employment-opportunity disclosure
- [ ] **COMP-06**: Privacy policy + SMS Terms + EEO statement + form fields + consent block all reviewed by legal counsel before launch (single batched review session)
- [ ] **COMP-07**: Form handler does NOT collect SSN, MVR, full DOT history, or any FCRA-triggering information — those are handled off-site by the recruiter / future ATS

### Form Security

- [ ] **SEC-01**: Cloudflare Turnstile (invisible challenge) on the apply form; server-side token verification before lead is dispatched
- [ ] **SEC-02**: Honeypot field on the form to catch unsophisticated bots
- [ ] **SEC-03**: Origin check on form submissions (reject submissions not from the production domain)
- [ ] **SEC-04**: IP-based rate limiting on the form endpoint (e.g., 3 submissions per IP per 10 minutes)
- [ ] **SEC-05**: Form handler runs server-side validation with the same Zod schema used client-side (no trust in client validation)
- [ ] **SEC-06**: Resend domain configured with SPF, DKIM, DMARC for `a2clogisticsco.com` (or chosen sending domain)

### Operations & Analytics

- [ ] **OPS-01**: Plausible Analytics (or equivalent cookieless analytics) tracks pageviews and a defined funnel-event set (form view, field abandon, submit success, submit error, CTA click, phone tap, SMS tap)
- [ ] **OPS-02**: Form-handler errors and synthetic-submission failures route to a monitored channel (email, Discord, Slack — recruiter-team-accessible)
- [ ] **OPS-03**: Recruiter SOP documented covering: lead handoff time SLA (24h), how to handle "but the website said" pay objections, STOP-message handling, how to log call/text outcomes back to the lead row

### Hosting & Deployment

- [ ] **HOST-01**: Production deployed to Cloudflare Pages with the `@astrojs/cloudflare` adapter
- [ ] **HOST-02**: Form handler runs on Cloudflare Pages Function with `nodejs_compat` flag enabled (Resend + googleapis need Node modules)
- [ ] **HOST-03**: Preview deploys on PR; production deploys gated on a passing build (lint + typecheck + Lighthouse budget)
- [ ] **HOST-04**: Environment variables (Resend API key, Google service-account JSON, Turnstile secret, recruiter email address) scoped per environment in Cloudflare Pages settings; never committed to the repo

## v2 Requirements

Deferred. Tracked but not in initial roadmap. Each requires its own decision-to-promote.

### Differentiators (build after launch traction)

- **DIFF2-01**: Pay calculator (CPM × miles + bonuses → take-home estimate) — only after pay numbers stable 60–90 days
- **DIFF2-02**: Sample settlement statement download (PDF) for owner-ops
- **DIFF2-03**: Founder-voice introductory video, produced via OTTS
- **DIFF2-04**: Apply-by-text (Twilio with 10DLC sender registration) — start with `sms:` link only
- **DIFF2-05**: Lane / dedicated-route map for OO drivers
- **DIFF2-06**: Lite-youtube-embed for an OTTS video on the family page

### ATS Integration (business-driven, when application volume justifies)

- **ATS2-01**: `TenstreetSink` (or `DriverReachSink`) implementation behind the existing `LeadSink` interface
- **ATS2-02**: ATS sink runs in parallel with email + sheet during transition
- **ATS2-03**: IntelliApp-pre-population hand-off so quick-apply fields auto-fill the long form

### Content Operations

- **OPS2-01**: TinaCMS layer for non-developer content editing (only if PR-based editing becomes a real pain point)
- **OPS2-02**: Spanish-language pay/benefits pages (only when a Spanish-fluent recruiter is in place)
- **OPS2-03**: Veteran / SkillBridge content (only if A2C pursues the program)

### SEO Expansion (only if first set proves traction)

- **SEO2-01**: Additional 5–10 SEO location pages with genuine unique content per metro
- **SEO2-02**: Long-form `/blog` or `/library` for SEO-driven content marketing — only after OTTS YouTube has consistent volume; risk: duplicates the OTTS role

## Out of Scope

Explicitly excluded from any version. Listed to prevent scope creep — anti-features sourced from PROJECT.md and the research's anti-features list.

| Feature | Reason |
|---------|--------|
| Shipper / freight-customer pages (Services, Fleet) | Audience is drivers only; shipper messaging dilutes the conversion funnel and the "driver-first" story |
| Full DOT-compliant application (SSN, MVR, employment history) on-site | Friction kills conversion; FCRA exposure; full apps belong in an ATS off-site |
| Headless CMS (Sanity, Contentful) | MDX-in-repo is sufficient; CMS adds cost and a second system to maintain |
| CDL-school / entry-level driver recruiting content | Audience is experienced OO + W2; entry-level needs different content (training, mentorship) |
| Hub for the full A2C ecosystem (multi-brand site) | Sister brands get their own properties; this site references but doesn't house them |
| Customer / driver portal (load tracking, settlement viewer, document upload) | Operational tooling lives in carrier-management software, not the marketing site |
| Public blog / news section as a launch requirement | OTTS YouTube is the ecosystem's content arm — duplicating its role fragments the strategy |
| E-commerce / merch / lead-magnet downloads | No business need surfaced |
| Stock truck photography | Veteran drivers spot stock in 2 seconds; reads as evasion. Real A2C trucks only |
| "We treat you like family" copy without specifics | Most-mocked phrase in trucking recruiting; a meme not a message |
| Pay hidden behind "Call for details" | The whole strategy is transparency — hiding pay is fatal |
| Multi-page application with progress bar | ≤6-field quick-apply, single screen, single submit |
| Intrusive chatbot widgets | Hurts mobile, kills trust, distracts from the apply CTA |
| Email-gated content / lead magnets | The only conversion is the apply form |
| Carousels and sliders on key sections | Drivers ignore them; they hurt LCP and a11y |
| Auto-playing video with audio | Universally hated; mobile data + privacy violation |
| Modal apply form / "Apply with LinkedIn" | Both reduce control and increase failure modes for the single conversion that matters |
| Templated 50-city programmatic SEO pages | Thin content gets penalized; tanks the whole site's rankings |
| "Submit resume" requirement | Drivers don't have resumes; demanding one filters out the audience |
| Cookie banner / GA4 | Plausible avoids the banner cost; matches the transparent-driver-first posture |
| Heavy `framer-motion` reveal patterns from existing site | Bundle weight; LCP cost; existing site's Astro/SSG replacement does page transitions natively via View Transitions API |

## Traceability

Mapped by `gsd-roadmapper` on 2026-05-04. Every v1 requirement maps to exactly one phase (no orphans, no duplicates).

| Requirement | Phase | Status |
|-------------|-------|--------|
| FUNNEL-01 | Phase 1 | Pending |
| FUNNEL-02 | Phase 1 | Pending |
| FUNNEL-03 | Phase 1 | Pending |
| FUNNEL-04 | Phase 1 | Pending |
| FUNNEL-05 | Phase 1 | Pending |
| FUNNEL-06 | Phase 1 | Pending |
| FUNNEL-07 | Phase 1 | Pending |
| FUNNEL-08 | Phase 1 | Pending |
| PAY-01 | Phase 1 | Pending |
| PAY-02 | Phase 1 | Pending |
| PAY-03 | Phase 1 | Pending |
| PAY-04 | Phase 1 | Pending |
| PAY-05 | Phase 1 | Pending |
| PAY-06 | Phase 1 | Pending |
| PAY-07 | Phase 1 | Pending |
| STORY-01 | Phase 2 | Pending |
| STORY-02 | Phase 2 | Pending |
| STORY-03 | Phase 2 | Pending |
| STORY-04 | Phase 2 | Pending |
| TRUST-01 | Phase 2 | Pending |
| TRUST-02 | Phase 2 | Pending |
| TRUST-03 | Phase 2 | Pending |
| TRUST-04 | Phase 2 | Pending |
| TRUST-05 | Phase 2 | Pending |
| TRUST-06 | Phase 2 | Pending |
| ECO-01 | Phase 2 | Pending |
| ECO-02 | Phase 2 | Pending |
| ECO-03 | Phase 2 | Pending |
| ECO-04 | Phase 2 | Pending |
| SITE-01 | Phase 1 | Pending |
| SITE-02 | Phase 1 | Pending |
| SITE-03 | Phase 3 | Pending |
| SITE-04 | Phase 1 | Pending |
| SITE-05 | Phase 3 | Pending |
| SITE-06 | Phase 1 | Pending |
| SITE-07 | Phase 1 | Pending |
| BRAND-01 | Phase 1 | Pending |
| BRAND-02 | Phase 1 | Pending |
| BRAND-03 | Phase 1 | Pending |
| BRAND-04 | Phase 1 | Pending |
| BRAND-05 | Phase 1 | Pending |
| SEO-01 | Phase 3 | Pending |
| SEO-02 | Phase 3 | Pending |
| SEO-03 | Phase 3 | Pending |
| SEO-04 | Phase 1 | Pending |
| SEO-05 | Phase 3 | Pending |
| SEO-06 | Phase 3 | Pending |
| SEO-07 | Phase 3 | Pending |
| SEO-08 | Phase 3 | Pending |
| CUT-01 | Phase 3 | Pending |
| CUT-02 | Phase 3 | Pending |
| CUT-03 | Phase 3 | Pending |
| CUT-04 | Phase 3 | Pending |
| COMP-01 | Phase 1 | Pending |
| COMP-02 | Phase 1 | Pending |
| COMP-03 | Phase 1 | Pending |
| COMP-04 | Phase 1 | Pending |
| COMP-05 | Phase 1 | Pending |
| COMP-06 | Phase 3 | Pending |
| COMP-07 | Phase 1 | Pending |
| SEC-01 | Phase 1 | Pending |
| SEC-02 | Phase 1 | Pending |
| SEC-03 | Phase 1 | Pending |
| SEC-04 | Phase 1 | Pending |
| SEC-05 | Phase 1 | Pending |
| SEC-06 | Phase 1 | Pending |
| OPS-01 | Phase 3 | Pending |
| OPS-02 | Phase 1 | Pending |
| OPS-03 | Phase 3 | Pending |
| HOST-01 | Phase 1 | Pending |
| HOST-02 | Phase 1 | Pending |
| HOST-03 | Phase 3 | Pending |
| HOST-04 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 73 total
- Mapped to phases: 73 (100%)
- Unmapped: 0
- Phase 1: 42 requirements (foundation + form + pay + brand + draft compliance + form security + email/sheet hosting + JobPosting JSON-LD + alerting)
- Phase 2: 14 requirements (story + trust signals + ecosystem)
- Phase 3: 17 requirements (perf/a11y CI gates + SEO surface + brownfield cutover + counsel review + analytics + recruiter SOP + production deploy gating)

---

*Requirements defined: 2026-05-04*
*Last updated: 2026-05-04 after roadmap traceability mapping*
