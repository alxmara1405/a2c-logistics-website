# Phase 1: Foundation + Form + Pay Engine - Context

**Gathered:** 2026-05-04
**Status:** Ready for planning
**Discussion mode:** `--auto` (recommended-default selections; logged inline)

<domain>
## Phase Boundary

This phase delivers the **launchable conversion core**: a working Astro 6 + Tailwind 4 + MDX project on Cloudflare Pages, with an end-to-end driver-recruiting form (≤6 fields → email + Sheet → durable fallback + alert) and two URL-routed pay pages (`/pay/owner-operator` + `/pay/company`) that publish real CPM/% numbers with `effective` dates and `JobPosting` JSON-LD.

**In scope (42 reqs):** Project foundation (SITE-01/02/04/06/07), brand system (BRAND-01–05), driver funnel end-to-end (FUNNEL-01–08), pay routes + toggle architecture (PAY-01–07), form security (SEC-01–06), draft compliance copy (COMP-01/02/03/04/05/07 — drafts only; counsel review is Phase 3), hosting + env scoping (HOST-01/02/04), error alerting wired alongside the form (OPS-02), `JobPosting` JSON-LD that ships with the pay routes (SEO-04).

**Out of scope (handled in later phases):** Story / founder / testimonials / equipment / family pages (Phase 2), full SEO surface (sitemap, OG, FAQ JSON-LD, location pages — Phase 3), Lighthouse + axe CI gates (Phase 3 — running them on a half-built site wastes signal), brownfield 301 redirect map (Phase 3 cutover), counsel-reviewed final compliance copy (Phase 3), production deploy gating (Phase 3), Plausible analytics + recruiter SOP (Phase 3).

**Why this scope:** Drivers won't submit without seeing real pay, and silent form failure is the catastrophic failure mode for a single-conversion-goal site. The form handler + pay routes ship together so every CTA on every later page reaches a real, durable, alerted endpoint from preview-deploy #1 — and the form has the real consent block from day one (drafted in this phase, counsel-reviewed in Phase 3 without rewiring the form).

</domain>

<decisions>
## Implementation Decisions

These selections were auto-resolved per `--auto` mode rules (recommended option for every gray area, logged inline). Each is grounded in a research file or a previously-locked PROJECT/REQUIREMENTS decision — no new direction is set here.

### Framework & Build (anchored in `research/STACK.md`)
- **D-01:** Use **Astro 6 (`astro@6.2.2`) + `@astrojs/react@4.x` for islands + `@astrojs/mdx@4.4.3` + `@astrojs/cloudflare@13.3.1`**. _(auto: STACK.md HIGH-confidence pick; flips to Next.js only if a driver portal lands on this domain.)_
- **D-02:** **Tailwind v4.2.x via `@tailwindcss/vite` with CSS-first `@theme` config** (no `tailwind.config.ts`). Brand tokens (`--brand-red: #EF392C`, `--brand-black: #000`, `--brand-white: #FFF`, `--brand-gray: #D9D9D9`, font families) live in `src/styles/global.css` `@theme` block. _(auto: BRAND-05 + STACK.md.)_
- **D-03:** **shadcn CLI v4 (Astro template)** scaffolds primitives needed by the form + toggle islands. Only install components actually used by Phase 1 (Button, Input, Label, Select, Checkbox, Form-state UI). Defer Card/Carousel/etc. to Phase 2 when they're actually needed. _(auto: STACK.md "what NOT to use" — own the code, don't pre-install.)_
- **D-04:** **Wholesale repo replacement**, not migration. Existing `package.json`, `src/`, `dist/`, `node_modules/` are deleted as part of Wave 0. Salvageable copy from `src/pages/About.jsx` ("Built by drivers, for drivers" thread) is captured in a notes file for Phase 2 reuse — not migrated as code. _(auto: PROJECT.md decision; existing site is shipper-mixed.)_
- **D-05:** Folder layout: `src/pages/` (file-based routing), `src/layouts/`, `src/components/{ui,sections,islands}/`, `src/content/{pages,testimonials,faqs,family}/` (MDX content collections), `src/data/{pay.ts,brand.ts,recruiter.ts}/` (typed data exports), `src/lib/{sinks/,validation/,turnstile.ts}/`, `src/actions/apply.ts`, `src/styles/global.css`, `public/_redirects`. _(auto: ARCHITECTURE.md proposed Astro layout.)_

### Pay Routes & Toggle Architecture (locks Pitfall 7)
- **D-06:** **Two physical SSG'd routes — `/pay/owner-operator` and `/pay/company`** — each with its own `<title>`, `<H1>`, meta description, canonical-to-self, and `JobPosting` JSON-LD. NOT a query param. NOT client-only state. `/pay` is a **308** redirect to `/pay/owner-operator`. _(auto: PAY-01/02; Pitfall 7; ARCHITECTURE.md HIGH-confidence call — Google dedupes `?type=` variants and only one ranks.)_
- **D-07:** **Shared `src/layouts/PayLayout.astro`** wraps both routes; renders the toggle UI as an `.astro` navigation island (anchor links — no client state at the navigation level). _(auto: ARCHITECTURE.md.)_
- **D-08:** **Toggle preference persists in `localStorage`** so a driver returning to `/pay` lands on their preferred variant; the persistence is a tiny vanilla-TS island, not a React component. Hero CTAs deep-link into the toggled state via the route, not a query param. _(auto: PAY-03; ARCHITECTURE.md.)_
- **D-09:** **Pay numbers live in `src/data/pay.ts`** (Zod-validated schema with `effective: YYYY-MM` per number-group, OO + Company branches, range-only enforcement). MDX pay pages render numbers via custom components (`<PayBadge value={pay.company.cpmMax} effective={pay.company.effective} />`). One file per quarterly update; no drift between hero, pay route, JSON-LD. _(auto: PAY-04/05; ARCHITECTURE.md "split MDX prose from typed data" pattern.)_
- **D-10:** **Owner-op page publishes a representative dollar range alongside the percentage** (e.g., "65–72% of gross — typical owner-op nets $X–$Y/week on Lincoln-region lanes"). Satisfies state pay-transparency law (CA/WA/NY/IL/CO/MD) which requires dollar disclosure on the posting itself. _(auto: PAY-06; Pitfall 4.)_
- **D-11:** **Real numbers OR explicit placeholder**: if A2C-supplied pay numbers aren't ready when this phase ships, the schema renders a "pending real data — recruiter will provide on call" disclosure block per pay route, without using "competitive" / "top of market" / "great pay" language anywhere. Counsel-review and launch are gated on real numbers being live. _(auto: PAY-07; PROJECT.md content-readiness blocker; Pitfall 1 prevention.)_
- **D-12:** `JobPosting` JSON-LD on each pay route uses Google's CDL guidance: `unitText: "MILE"` with CPM as a decimal for company route; `unitText: "WEEK"` (or "MONTH") with the representative dollar range for OO route. Validated via Google Rich Results Test in Phase 3 — but the markup ships in Phase 1 alongside the routes. _(auto: SEO-04; Pitfall 4.)_

### Form Handler & Sinks (locks Pitfall 1: silent failure)
- **D-13:** **Form runs as an Astro Action** at `/_actions/apply` via `@astrojs/cloudflare` adapter on a **Cloudflare Pages Function with `nodejs_compat` flag enabled** (Resend SDK + `googleapis` need Node modules). NOT Edge runtime — the latency floor is the Resend call (~300–800ms), so Edge sub-50ms cold-start is invisible. _(auto: HOST-01/02; ARCHITECTURE.md.)_
- **D-14:** **`LeadSink` adapter pattern** in `src/lib/sinks/`: interface defines `name`, `required`, `dispatch(lead) → Promise<{ok, error?}>`. Concrete implementations for Phase 1: `EmailSink` (Resend, REQUIRED) and `SheetSink` (Google Sheets via service-account JWT, OPTIONAL). Future `AirtableSink` and `TenstreetSink` plug in without form-UI changes. _(auto: FUNNEL-02; ARCHITECTURE.md.)_
- **D-15:** **`dispatchLead()` partial-failure semantics**: the Action awaits all sinks in parallel; if a REQUIRED sink fails, the user sees an error state and the lead is NOT marked delivered. If only OPTIONAL sinks fail, the user sees success, the lead is queued to a **durable fallback store** (Cloudflare KV) for reconciliation, and an alert fires. _(auto: FUNNEL-03; Pitfall 1 — silent loss is the catastrophic failure mode.)_
- **D-16:** **Alerting**: any sink error (REQUIRED or OPTIONAL) fires to a single monitored channel (recipient TBD by recruiting team — recommended: a dedicated email address + Discord/Slack webhook if available). Alert payload includes lead ID, sink name, error type, timestamp. _(auto: OPS-02; Pitfall 5.)_
- **D-17:** **Daily synthetic submission** runs via a Cloudflare Cron Trigger (Worker), submits a flagged-test row to both sinks, and alerts if either fails. The flagged-test row is excluded from recruiter notifications by a `synthetic: true` field in the lead schema. _(auto: FUNNEL-04; Pitfall 5.)_
- **D-18:** **Idempotency key per submission** — `crypto.randomUUID()` generated client-side and sent with the request; server stores recently-seen keys in KV for 10 minutes to dedupe double-tap submissions on flaky truck-stop wifi. _(auto: FUNNEL-08; Pitfall 12 — flaky wifi is the actual mobile failure mode.)_

### Form UI & Validation
- **D-19:** **Form is a React island** (`src/components/islands/ApplyForm.tsx`) using **Conform (`@conform-to/react` + `@conform-to/zod`)** — progressive enhancement; works without JS via raw POST to the Astro Action. **Single Zod schema in `src/lib/validation/lead-schema.ts`** validates client + server. _(auto: FUNNEL-01; SEC-05; STACK.md.)_
- **D-20:** **6 fields total** (per FUNNEL-01): firstName, lastName, phone, email, cdlClass (A/B/none-but-CDL-eligible? — recommend A only for v1 since target audience is experienced), yearsExperience (0/1/2/3-5/5+ — recommend 1+). PLUS a single OO/Company selector and a state dropdown (US states). PLUS the TCPA SMS consent checkbox (D-23). Sums to 9 form controls but 6 free-input fields. _(auto: FUNNEL-01.)_
- **D-21:** **Field whitelist** explicitly excludes: SSN, DOB, MVR, full DOT history, arrest history, marital/family status, religion, nationality, disability, accommodation requests, gender. Whitelist is enforced at the schema level (any unrecognized field is rejected by the server). _(auto: COMP-01; COMP-07; Pitfall 2.)_
- **D-22:** **Submission success page is `/apply/success`**, `noindex`'d, displays "a recruiter will text/call within 24 hours" with the recruiter `tel:` + `sms:` link as a fallback, and pre-fills the OO/Company selection (carried as URL state) so a returning failed-attempt re-submits with their original choice. _(auto: FUNNEL-05.)_
- **D-23:** **TCPA SMS consent block on the form** (a separate non-required-but-defaulted-checked checkbox is anti-pattern; this is a required positive opt-in for SMS). Consent text version-stamped (`tcpa_consent_v1` constant). Consent metadata captured per submission: timestamp, IP (Cloudflare-provided), UA, consent text version, form version. Stored on every sink row (Sheet column + email body). _(auto: COMP-02; Pitfall 4 — $500–$1,500 per non-consented text.)_
- **D-24:** **Persistent header CTA + section CTAs** route to `/apply` with the OO/Company selection deep-linked via path (`/apply?role=owner-operator` or `/apply?role=company`). Pay pages link with the matching selection pre-filled in the form. _(auto: FUNNEL-06.)_
- **D-25:** **Recruiter `tel:` + `sms:` in header + footer** of every page. Single tracked recruiter number (TBD by recruiting team — content-readiness blocker). _(auto: FUNNEL-07.)_

### Form Security
- **D-26:** **Cloudflare Turnstile** (`@marsidev/react-turnstile@1.5.x`) — invisible challenge, server-verify the token in the Action via `POST https://challenges.cloudflare.com/turnstile/v0/siteverify` before any sink dispatch. _(auto: SEC-01.)_
- **D-27:** **Honeypot field** (`website` — bots fill it; humans don't see it via `aria-hidden` + offscreen CSS). Submissions with honeypot filled are 200-OK'd silently (don't tip bots that we caught them) but never dispatched. _(auto: SEC-02.)_
- **D-28:** **Origin check** — Action rejects submissions whose `Origin` header isn't the production domain (or a configured preview domain). _(auto: SEC-03.)_
- **D-29:** **IP-based rate limit** — 3 submissions per IP per 10-minute window via Cloudflare KV TTL counter. 4th gets 429. _(auto: SEC-04.)_
- **D-30:** **SPF + DKIM + DMARC** for the Resend sending domain (`a2clogisticsco.com` or chosen sending subdomain). DNS records added in Wave 0 alongside the Cloudflare Pages domain hookup. _(auto: SEC-06.)_

### Brand System & Typography
- **D-31:** **Color palette** in `@theme` block: `--color-brand-white: #FFFFFF; --color-brand-black: #000000; --color-brand-red: #EF392C; --color-brand-gray: #D9D9D9;`. Used as `text-brand-red`, `bg-brand-black`, etc. via Tailwind v4. _(auto: BRAND-01.)_
- **D-32:** **Nevis Bold (headlines) + Avenir (body)** loaded via **Astro Fonts API** (`astro:assets` Fonts API stable in 6.x) with `font-display: swap`, preload-on-hero-pages, fallback metric overrides to prevent CLS. _(auto: BRAND-02; SITE-03 prep.)_
- **D-33:** **Nevis Bold web license sourcing is a Wave 0 blocker.** If foundry doesn't sell a self-host web license at acceptable cost (Pitfall 13 — most common gotcha), substitute display font is **`Anton` (Google Fonts)** or **`Druk Wide` (Commercial Type)** as fallback options; brand-book footnoted to flag the substitution. Choice surfaced to user before the substitute lands. _(auto: BRAND-03; Pitfall 13.)_
- **D-34:** **A2C wordmark** (motion-line truck) uses brand-book SVG. Two variants implemented: `logo-primary.svg` (black on white/gray bg) and `logo-inverse.svg` (white on black bg). Header swaps based on Tailwind dark-class or section bg. _(auto: BRAND-04.)_

### Compliance Drafts (counsel-review is Phase 3)
- **D-35:** **Draft Privacy Policy, SMS Terms, EEO Statement** ship in Phase 1 as `/privacy`, `/sms-terms`, `/eeo` MDX pages. Footer links them; form links Privacy + SMS Terms above the consent checkbox. Drafts are clearly marked "Draft — pending counsel review" in a small disclaimer at the top of each. _(auto: COMP-03/04/05; Pitfall 17.)_
- **D-36:** **Draft compliance content uses well-established templated language** (TCPA-compliant SMS consent: explicit opt-in, frequency cap, "consent isn't a condition," STOP/HELP). The drafts are designed to require minimal-revision counsel pass in Phase 3. Counsel reviews real (not placeholder) content in Phase 3 — that gate is honored. _(auto: COMP-06 deferred to Phase 3.)_

### Hosting & Environment
- **D-37:** **Production deploys to Cloudflare Pages** with `@astrojs/cloudflare` adapter. Project name TBD by user; default suggestion `a2c-logistics`. _(auto: HOST-01.)_
- **D-38:** **Form handler runs on Cloudflare Pages Functions with `nodejs_compat`** flag in `wrangler.toml` / Pages settings. _(auto: HOST-02.)_
- **D-39:** **Environment variables scoped per environment** in Cloudflare Pages dashboard (Production + Preview). Required env: `RESEND_API_KEY`, `RESEND_FROM`, `RECRUITER_EMAIL`, `GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON` (single base64-encoded blob for KV-friendly storage), `GOOGLE_SHEETS_SHEET_ID`, `TURNSTILE_SECRET_KEY`, `PUBLIC_TURNSTILE_SITE_KEY`, `LEAD_FALLBACK_KV_BINDING`, `IDEMPOTENCY_KV_BINDING`, `RATELIMIT_KV_BINDING`, `ALERT_WEBHOOK_URL` (Discord/Slack — optional; falls back to alert email). Never committed; `.env.example` documents the schema with placeholder values. _(auto: HOST-04.)_
- **D-40:** **Preview deploys for every PR** (Cloudflare Pages default behavior) but no production-deploy gating in Phase 1 — Lighthouse + lint + typecheck CI gates land in Phase 3 with HOST-03. Phase 1 ships a basic CI workflow that runs `pnpm typecheck && pnpm build` on PR for sanity. _(auto: HOST-03 deferred to Phase 3.)_

### Wave Ordering (matches ARCHITECTURE.md)
- **D-41:** **Wave 0 (Foundation)** — Astro init, Tailwind tokens, brand fonts (license sourced), Cloudflare Pages target, env handling, repo cleanup of old Vite/React code. Blocks everything.
- **D-42:** **Wave 1 (Primitives + Layout)** — `ui/*` shadcn components, `Layout.astro` shell (header + footer), Zod schemas (`lead-schema.ts`, `pay-schema.ts`), MDX content collections + provider with placeholders. Schemas block both content and form.
- **D-43:** **Wave 2 (Pay routes) and Wave 3 (Form handler + UI) run in parallel.** Wave 2 ships pay routes with `data/pay.ts` (placeholder OK) + `JobPosting` JSON-LD + toggle. Wave 3 ships the Action handler + sinks + KV bindings + form island. Both depend only on Wave 1 schemas.
- **D-44:** **Wave 4 (Wire-up + draft compliance)** — header/footer CTA wiring to `/apply`, draft Privacy/SMS-Terms/EEO MDX pages, success page. Depends on Wave 3 (form route) + Wave 2 (pay routes for deep-linking from CTAs).
- **D-45:** **Wave 5 (Phase-1 verification)** — synthetic submission Cron, manual real-iPhone test of all six success criteria, schema validation of `JobPosting` JSON-LD via Rich Results Test (smoke check; full validation in Phase 3 launch hardening).

### Claude's Discretion (auto-resolved per recommended-default rule)
- Cron schedule for daily synthetic test → 04:30 UTC (off-peak; before US morning).
- KV namespace binding names → `LEAD_FALLBACK`, `IDEMPOTENCY`, `RATELIMIT`.
- Rate limit window granularity → 10 minutes per IP, sliding window via timestamp array in KV with 10-min TTL.
- US-state dropdown → standard 50 + DC list, no autocomplete (mobile keyboard is faster than typing).
- Years-of-experience UI → segmented control on mobile (touch-friendly), select on desktop.
- Honeypot CSS strategy → `position: absolute; left: -9999px; aria-hidden="true"; tabindex="-1"; autocomplete="off"`.
- Lead row schema → `{ id, ts, sinkStatus: { email: 'ok'|'failed', sheet: 'ok'|'failed'|'queued' }, firstName, lastName, phone, email, cdlClass, yearsExperience, role: 'oo'|'company', state, ip, ua, consentVersion, formVersion, synthetic?: true }`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project context
- `.planning/PROJECT.md` — project context, audience scope (drivers only, OO + company), Core Value, key decisions table
- `.planning/REQUIREMENTS.md` — 73 v1 requirements with REQ-IDs (Phase 1 maps 42 of them)
- `.planning/ROADMAP.md` §"Phase 1: Foundation + Form + Pay Engine" — phase goal, requirements list, 6 success criteria
- `.planning/STATE.md` — project state pointer for session continuity

### Research synthesis (HIGH-confidence locked decisions)
- `.planning/research/SUMMARY.md` §"Implications for Roadmap" → Phase 1 — synthesis-level call on stack + sink fan-out + toggle architecture
- `.planning/research/STACK.md` §"TL;DR — Recommended Stack" — Astro 6 + Cloudflare Pages + Tailwind 4 + shadcn (Astro template) + Conform + Resend + Sheets + Turnstile + Motion + Plausible
- `.planning/research/STACK.md` §"Confidence Levels — Per Recommendation" — what would flip each decision
- `.planning/research/STACK.md` §"Installation" — pnpm-style install commands as the canonical bootstrap
- `.planning/research/ARCHITECTURE.md` §"Routing decisions" — toggle-as-routes lockdown (NOT query param, NOT client state)
- `.planning/research/ARCHITECTURE.md` §"Form handler runs on Node runtime" — Cloudflare Pages Function with `nodejs_compat`
- `.planning/research/ARCHITECTURE.md` §"Build order (5 waves)" — wave order with form handler in Wave 3 parallel with sections
- `.planning/research/FEATURES.md` §"Must have (table stakes)" — checklist of pay-page non-negotiables
- `.planning/research/FEATURES.md` §"Crete Carrier" — local-benchmark transparency floor; A2C cannot launch with less
- `.planning/research/PITFALLS.md` §"Critical Pitfalls" #1 (silent form failure) #2 (pay numbers go stale) #3 (TCPA SMS) #4 (state pay-transparency) #7 (toggle URL structure) #13 (font license)
- `.planning/research/PITFALLS.md` §"Other launch gates" — Turnstile + honeypot + rate-limit ship together

### External vendor docs (verify versions before installing)
- Astro 6 docs — https://docs.astro.build (content collections, Actions API, `@astrojs/cloudflare` adapter, Fonts API)
- Cloudflare Pages docs — https://developers.cloudflare.com/pages (Functions runtime, `nodejs_compat`, KV bindings, Cron Triggers, env-var scoping)
- Resend docs — https://resend.com/docs (SDK, SPF/DKIM/DMARC setup)
- Conform docs — https://conform.guide (Zod schema sharing pattern)
- Cloudflare Turnstile docs — https://developers.cloudflare.com/turnstile (server-verify pattern)
- Google Sheets API — https://developers.google.com/sheets/api (service-account JWT auth)
- shadcn/ui Astro template — https://ui.shadcn.com (CLI v4 with Astro support)
- Google Search — JobPosting structured data — https://developers.google.com/search/docs/appearance/structured-data/job-posting (`baseSalary` requirements, CDL `unitText: "MILE"` guidance)

### Brand assets (in user's Downloads — copy into repo `src/assets/brand/` during Wave 0)
- `/Users/alexandercostea/Downloads/A2C Brand Development_Final Delivery (1).pdf` — full 14-page brand system
- `/Users/alexandercostea/Downloads/A2C Messaging Framework.docx` — positioning, tagline, brand concept
- `/Users/alexandercostea/Downloads/A2C_Snaphot_Final (1).pdf` — single-page visual identity snapshot
- `/Users/alexandercostea/Downloads/A2C Brand Ecosystem (1).pdf` — ecosystem map, flywheel, driver journey

</canonical_refs>

<code_context>
## Existing Code Insights

The existing Vite/React codebase is being **wholesale replaced**, not migrated (per PROJECT.md Key Decision). Below is what's worth knowing for the rebuild — copy salvageable strings, but don't carry code.

### Reusable Assets (copy as text, not as code)
- `src/pages/About.jsx` — "Built by drivers, for drivers" hero copy thread is salvageable for Phase 2 (about/founder page). Three values (Accountability / Responsiveness / Driver-First Culture) are well-phrased but currently aimed at shippers; the "treats your freight like their own" line MUST be cut (shipper voice in driver-targeted page — Pitfall 19). Capture the salvageable strings to a `src/content/_salvage-from-old-site.md` notes file in Wave 0; reference during Phase 2 content authoring.
- `src/pages/DriveWithUs.jsx` — has a basic application form pattern with field-level structure (CDL class, years experience). Copy the field-list structure as inspiration for the new Conform schema; do NOT carry the form code (existing version uses no Turnstile, no consent block, no idempotency, no sinks — would have to be entirely rewritten).
- `src/pages/DriveWithUs.jsx` "Competitive Pay" / "Top-of-market" copy fails Pitfalls 1, 3, and 9 simultaneously — explicit anti-pattern; do not copy.
- `index.html` favicon is a placeholder; replace with brand favicon during Wave 0.
- `package.json` deps that DO carry over (with rename/repackage notes): `@base-ui/react`, `class-variance-authority`, `clsx`, `framer-motion` → install as `motion@12.38.0` instead, `lucide-react`, `tailwind-merge`. Reinstall fresh into the new Astro project; don't merge `package.json` files.

### Established Patterns
- The user already uses Tailwind v4 — preserves muscle memory.
- The user already uses lucide-react icons — preserves icon vocabulary.
- The user already uses framer-motion v12 — same maintainer, same API as `motion@12`, drop-in mental model.
- shadcn/ui mental model is familiar from existing components — same patterns inside the new shadcn (Astro template) project.

### Integration Points
- DNS: existing `a2clogistics.com` (or chosen production domain) — DNS handoff to Cloudflare Pages happens in Phase 3 cutover (NOT Phase 1). Phase 1 deploys to the default `a2c-logistics.pages.dev` URL. Brownfield 301 redirect map is Phase 3.
- GitHub: existing `.github/` workflow folder present in the old repo — replace with a new minimal CI workflow in Wave 0 (typecheck + build on PR; full Lighthouse/axe gates added in Phase 3).
- No backend services to integrate with in this phase — A2C operations data (pay numbers, recruiter phone, sister-brand status) all flow in via the typed-data pattern (`src/data/*.ts`) and MDX, not via APIs.
- Phase 2 dependencies on Phase 1: header/footer/layout, brand tokens, MDX provider, section primitives — all shipped here, consumed there.
- Phase 3 dependencies on Phase 1: form route exists at `/apply`, pay routes exist at `/pay/{owner-operator,company}` (so SEO surface and brownfield redirects can target them), draft compliance pages exist (so Phase 3 counsel review has real drafts not blank pages).

</code_context>

<specifics>
## Specific Ideas

- **Crete Carrier (`cretecarrier.com/owner-operator/`) is the local benchmark.** Lincoln-NE neighbor; publishes scaled per-mile rate tables, deduction line items, equipment specs to the dollar. A2C cannot launch with less transparency in the same market — referenced in Pay-route copy reviews.
- **TCPA consent block must be a positive-opt-in checkbox** (not pre-checked). Wording follows Crete-style + research-checked TCPA language. Versioned constant so consent_version captured per submission matches a real document.
- **OO/Company toggle UX**: simple two-button pill (selected = filled `#EF392C`, unselected = transparent border) at the top of the pay page, also at the top of the apply form. Driver always knows which variant they're seeing; toggle persists via `localStorage` and via the URL path.
- **No pre-populated state on form**: state dropdown defaults to "Select state…" rather than guessing from IP — drivers move; IP-guess is wrong often enough to be friction.
- **Failure-state UX**: if the form errors (network, server, sink failure), show a generic error + the recruiter `tel:` + `sms:` immediately — never let an error state be a dead end.

</specifics>

<deferred>
## Deferred Ideas

(Items that surfaced as relevant but belong in other phases or v2.)

- **Lighthouse + axe CI gates** — Phase 3 (running on a half-built Phase-1 site wastes signal).
- **Plausible analytics + funnel events** — Phase 3 (OPS-01).
- **Brownfield 301 redirect map + GMB / external listings update** — Phase 3 cutover (CUT-01..04).
- **Counsel-reviewed final compliance copy** — Phase 3 (COMP-06). Phase 1 ships drafts; Phase 3 swaps in the counsel-approved final.
- **`Organization` JSON-LD on every page, sitemap.xml, robots.txt, OG images, FAQ JSON-LD** — Phase 3 (SEO-01/02/03/05).
- **3–5 curated SEO landing pages** — Phase 3 (SEO-06).
- **Pay calculator, founder video, sample settlement download, apply-by-text (Twilio), lane map, lite-youtube embed** — v2 (DIFF2-*) per REQUIREMENTS.md.
- **Tenstreet / DriverReach ATS sink** — v2 (ATS2-*) — `LeadSink` adapter is built so it drops in without form-UI change.
- **TinaCMS overlay** for non-technical content edits — v2 (OPS2-01); not pulled in for v1 to keep surface area minimal.
- **Spanish-language pay/benefits pages** — v2 (OPS2-02); only when Spanish-fluent recruiter exists.
- **Veteran / SkillBridge content** — v2 (OPS2-03); only if A2C pursues the program.

</deferred>

---

*Phase: 1-Foundation + Form + Pay Engine*
*Context gathered: 2026-05-04*
