# Project Research Summary

**Project:** A2C Logistics CO. — Driver Recruiting Site Rebuild
**Domain:** SEO-first, mobile-fast, MDX-driven trucking-carrier driver-recruiting marketing site (single quick-apply conversion goal; ecosystem cross-link to four sister brands; audience: experienced owner-operators + W2 company drivers only)
**Researched:** 2026-05-04
**Confidence:** MEDIUM-HIGH overall (HIGH on stack/architecture/conversion patterns; MEDIUM on compliance specifics that require counsel review before launch)

## Executive Summary

A2C Logistics CO. is rebuilding `a2clogistics.com` as a driver-recruiting site for two audiences only (owner-operators + W2 company drivers), with a single conversion goal: a ≤6-field quick-apply form that pipes leads to email + Google Sheet/Airtable. The current Vite/React site mixes shipper and driver content; the new site drops shipper messaging entirely, leads with a story-driven *"driver-first"* identity, and routes every visitor toward apply. Lead differentiator is *"driver-first culture"*; trust differentiator is the in-house repair shop (LTTR) + four-brand ecosystem story (LTTR/LTS/DP/OTTS).

**The technology stack is now resolved.** The four research files converged on every contested call. Build on **Astro 6 + Tailwind 4 + MDX content collections + React islands (form + toggle only) + Astro Actions, deployed on Cloudflare Pages.** Astro is the right call — and not Next.js — because this is a 6–8 page SEO/mobile-LCP marketing site with exactly two interactive surfaces (apply form + OO/Company toggle); the rest is static HTML browsed on truck-stop wifi. Next.js's React-runtime baseline (~85–110 KB JS) is real cost for zero benefit at this scope; if A2C ever adds a driver portal/dashboard the call flips, but not for v1. Cloudflare Pages wins on edge-function locality (a Wyoming driver hits the form at the Denver PoP) and a higher daily free-tier function ceiling, with first-party Astro adapter parity to Netlify.

**The execution risks are concentrated in three places, all of which must ship in Phase 1, not as polish.** First, **pay transparency is the differentiator** — Crete Carrier (the Lincoln-NE neighbor and local benchmark) publishes scaled per-mile rate tables, deduction line items, and equipment specs to the dollar; A2C cannot launch with less and must publish ranges + `effective` date in MDX frontmatter + `JobPosting` JSON-LD with `baseSalary` (state pay-transparency laws in CA/WA/NY/IL/CO/MD apply because the audience travels nationally). Second, **the form is not a polish-phase task**: silent form failure is the catastrophic failure mode for a single-conversion-goal site, so the form handler ships in Phase 1 with two-sink delivery + alerting + Cloudflare Turnstile + honeypot, not bolted on after pages are built. Third, **TCPA SMS consent is a hard launch gate** ($500–$1,500 per non-consented text) — the consent block must be specific, version-stamped, and captured per submission with timestamp/IP. Counsel sign-off on form fields, consent block, and privacy policy is non-negotiable before launch.

## Key Findings

### Recommended Stack

**Decision: Astro 6 over Next.js, Cloudflare Pages over Netlify.** Full rationale lives in `STACK.md`; this is the synthesis-level call.

**Why Astro wins for *this* project:**
- 6–8 page marketing site with exactly two interactive islands — textbook Astro Islands use case.
- Native `astro:content` + Zod schemas for the MDX-as-content-source-of-truth requirement (REQ-SITE-06).
- ~5–25 KB JS total vs. ~85–110 KB Next.js baseline; consistently 8–15 Lighthouse mobile points better on 4G — directly serves REQ-SITE-04.
- First-party Cloudflare adapter (`@astrojs/cloudflare@13.3.1`); Next.js on Cloudflare requires `@opennextjs/cloudflare` glue with known coverage gaps.
- shadcn CLI v4 (March 2026) added an Astro template — same Radix components the team already knows.
- Existing deps carry over: `lucide-react` → `lucide-astro` (drop-in), `framer-motion` → `motion@12` inside React islands.

**Why Cloudflare Pages over Netlify:**
- Workers run at the CDN PoP nearest the driver — real LCP win for the truck-stop-wifi audience.
- Higher daily free-tier function invocations (100k/day vs. 125k/month).
- Tradeoff acknowledged: Netlify's `data-netlify="true"` shortcut is seductive for an MVP, but A2C still needs a custom function for "also email + write to Sheet/Airtable," so the savings shrink and you'd be locked in.

**Core technologies:**
- **Astro 6 (`astro@6.2.2`)** — framework: zero-JS-by-default SSG + island runtime + content collections.
- **Tailwind CSS v4 (`tailwindcss@4.2.4`) via `@tailwindcss/vite`** — CSS-first `@theme` config.
- **shadcn/ui CLI v4 (Astro template)** — component primitives.
- **`@astrojs/mdx@4.4.3` + `astro:content` with Zod schemas** — MDX content collections.
- **Conform (`@conform-to/zod` + `@conform-to/react`) + Astro Actions** — progressive-enhancement form; single Zod schema validates client + server.
- **Resend (`resend@6.12.2`)** — transactional email.
- **`googleapis` (Sheets) or `airtable`** behind a `LeadSink` adapter — swappable for future ATS.
- **Cloudflare Turnstile (`@marsidev/react-turnstile@1.5.1`) + honeypot** — spam protection.
- **Motion (`motion@12.38.0`) + Astro `<ClientRouter />`** — animation + native page transitions.
- **`lucide-astro` + `lucide-react`** — icons.
- **Self-hosted Nevis Bold + Avenir via `astro:assets` Fonts API** — `font-display: swap` + preload + fallback metric overrides.
- **Plausible** — cookieless analytics; matches the "transparent / driver-first" posture.
- **`schema-dts`** — `Organization`, `JobPosting` (with `baseSalary`), `FAQPage` JSON-LD.
- **Zod `4.4.3`** — single library for content + form + Action schemas.

**Deferred:** TinaCMS (non-breaking add later), GA4 (cookie-banner cost > value), heavy framer-motion reveal patterns from existing site, city-templated SEO pages beyond a curated 3–5.

### Expected Features

The trucking driver-recruiting vertical is one of the most pattern-locked on the web. Veteran drivers vet 5–15 carrier sites per job switch and expect a near-identical content checklist. **Deviation reads as evasion, not innovation.** Local benchmark to beat is **Crete Carrier**; A2C cannot launch with less transparency next door to the carrier defining the regional norm.

**Must have (table stakes):**
- Quick-apply form (≤6 fields) with TCPA-compliant SMS consent + EEOC-friendly field whitelist + `tel:` and `sms:` everywhere.
- Pay & Benefits with OO ↔ Company toggle + real published numbers (CPM ranges; %-of-gross or per-mile-by-trip-length for OO; fuel surcharge; fuel discount; settlement schedule; fast-pay; detention/stop/layover pay; full deduction line-items for OO; sign-on bonus with payout schedule or explicit "we don't offer one"; per-diem; referral bonus).
- Founder Story page with real photo, real voice (PROJECT confirms ready now).
- 2–3 named driver testimonials with photos (graceful empty/lite states for the rest).
- Equipment / Fleet page with real A2C truck photos (one half-day yard shoot) + full spec list + LTTR in-house repair callout.
- "What happens when…" / dispatcher-accessibility content.
- "The A2C Family" ecosystem section + driver-journey diagram.
- Persistent header CTA + visible recruiter phone (`tel:` mandatory) + SMS link.
- Visible MC# + USDOT# in footer.
- Privacy Policy + SMS Terms + EEO statement; mobile-first (LCP < 2.5s on 4G); WCAG AA.
- Application success page with explicit next step + recruiter phone fallback.
- Lightweight analytics with funnel events.
- 3–5 SEO landing pages (Lincoln NE, Omaha, Nebraska, OO variants) — curated, not templated.

**Should have (differentiators):**
- OO ↔ Company toggle as URL-routed deep links (most carriers fork into separate sub-domains).
- LTTR repair-partner-in-house framing — concrete, falsifiable, owner-op resonant.
- Founder bio + signed letter at launch; founder-voice video later via OTTS.
- OTTS YouTube cross-link (lite-youtube-embed facade).
- Sample settlement statement download — defer to v1.x.
- Pay calculator — defer to v1.x.
- Apply-by-text (Twilio 10DLC) — defer; start with `sms:` link only.

**Defer (v1.x or later):** ATS integration (Tenstreet/DriverReach, same company since March 2025), TinaCMS, Spanish-language pages (only with Spanish-fluent recruiter), Veteran/SkillBridge content, more than 5 SEO location pages.

**Anti-features (deliberately do NOT build):** stock truck photos, "we treat you like family" copy without specifics, pay hidden behind "Call for details," multi-page application, intrusive chatbot, email-gated content, carousels/sliders, auto-playing video with audio, modal apply form, "Apply with LinkedIn," 50-city auto-generated job-board pages, "Submit resume" requirement, in-site driver portal, public blog.

### Architecture Approach

**Static-first SSG with two interactive islands and a single dynamic surface (the form handler).** Content is data: long-form prose lives in MDX; structured numbers live in typed `.ts` data files. MDX *imports* numbers from data files via custom components (`<PayBadge value={pay.company.cpmMax} />`) so a quarterly pay update is one file, no drift across home/pay/hero. Form handler is thin: validate → fan out to a list of `LeadSink` adapters (email + sheet) with partial-failure tolerance.

**Major components:**
1. **Content layer** (`src/content/` MDX + `src/data/*.ts`) — Zod-validated frontmatter + data exports; pay numbers carry an `effective` date in frontmatter.
2. **Render layer** — Astro pages (file-based routes), `.astro` blocks for everything static, React islands for apply form + OO/Company toggle.
3. **Form handler** (`src/actions/apply.ts` — Astro Action on Node-compatible Cloudflare Pages Function) — Zod re-validate → Turnstile token verify → honeypot/origin/rate-limit → `dispatchLead()` fan-out → JSON response with `leadId`.
4. **Adapter layer** (`src/lib/sinks/`) — `LeadSink` interface; concrete `EmailSink` (Resend), `SheetSink` (Sheets API service-account JWT), future `AirtableSink`, future `TenstreetSink`.
5. **Brownfield redirect map** (`public/_redirects` Cloudflare format) — 301s from `/services`, `/fleet`, `/drive-with-us`. **Launch gate.**

**Routing decisions (locked by this synthesis):**
- **OO ↔ Company toggle = URL-routed pages, NOT query param, NOT client state.** Two physical SSG'd routes: `/pay/owner-operator` and `/pay/company`, each with its own `<title>`, `<H1>`, meta description, canonical-to-self, and `JobPosting` JSON-LD. Shared `pay/` layout wraps both with the toggle UI. `/pay` is a 308 redirect to `/pay/owner-operator`. Toggle component is a navigation island only — no client state. Toggle preference persists in `localStorage` across pages. Hero CTAs deep-link into the toggled state.
- **Form handler runs on Node runtime, not Edge.** Resend SDK and Google Sheets client both need Node-only modules (Cloudflare's `nodejs_compat` flag handles this). The form's latency floor is the email API call (300–800ms) — Edge sub-50ms is irrelevant.
- **`apply/success` and all legal pages get `noindex`.** Preview deploys (`*.pages.dev`) get `X-Robots-Tag: noindex` via platform headers.

**State management:** none global by design. Toggle in URL. Form state local to the island. No Redux/Zustand/Jotai/context.

**Build order (5 waves; form ships EARLY in Wave 3, parallel with sections — not as Wave 6 polish):**
- Wave 0: Foundation (Astro init, Tailwind tokens, brand fonts with web license sourced, Cloudflare Pages target, env handling).
- Wave 1: Primitives + layout + Zod schemas + MDX provider with placeholders.
- Wave 2: Section blocks (parallel-safe).
- **Wave 3 (parallel with Wave 2): Form handler + form UI** — every page CTA points to `/apply`; without a real form all CTAs are mocks.
- Wave 4: Pages.
- Wave 5: SEO + polish + brownfield redirects + GMB/external-listings update.

### Critical Pitfalls

Full landscape in `PITFALLS.md` (20 numbered pitfalls). These five are project-defining — they shape phase ordering, not just QA checklists.

1. **Form-handler silent failure is the worst possible failure mode for a single-conversion-goal site.** Form returns 200 because the fetch resolved, but the downstream sink silently dropped the lead. **Prevention is architectural:** two sinks (email REQUIRED + sheet OPTIONAL) with `dispatchLead()` partial-failure handling, durable fallback store on any failure, alerting on sink errors, daily synthetic submission verifying both sinks, idempotency key per submission, `delivery_status` column. **Form integration ships in Phase 1 (Wave 3), not as polish.**

2. **Pay published as a single number that goes stale becomes a screenshot weapon.** **Prevention:** publish ranges + the variables that move them (not point numbers), `effective: 2026-05` MDX frontmatter rendered next to every number, "as of" disclosure block, no "top earners make $X" framing, MDX schema enforces these fields, recruiter script handles "but the website said" before launch, quarterly pay-page review on the recruiting calendar.

3. **TCPA SMS exposure: $500–$1,500 per non-consented text.** **Prevention is a hard launch gate:** consent block must explicitly cover SMS from A2C recruiting (frequency cap, opt-out method, "consent isn't a condition"), log consent metadata per submission (timestamp + IP + UA + consent text version + form version), no bulk re-engagement of cold leads, recruiters use a single tracked number, STOP honored within 24 hours across all channels. **Counsel sign-off on consent block + form fields + privacy policy before launch — non-negotiable.**

4. **Pay-transparency state laws (CA/WA/NY/IL/CO/MD) require salary disclosure on the *job posting itself*.** Drivers travel and apply nationally; assume the strictest rule applies. **Prevention:** every `JobPosting` JSON-LD block includes `baseSalary` with `minValue`/`maxValue`/`unitText` (Google's CDL guidance: `unitText: "MILE"` with CPM as a decimal); for OO percentage compensation, post a representative dollar range plus the percentage; **no "competitive pay" / "top of market" / "great pay" copy anywhere**. Couples to Pitfall 2: real numbers + `JobPosting` schema + `effective`-stamped frontmatter ship together as one decision, not three.

5. **Brownfield URL loss — old shipper pages 404, inbound link equity vaporizes.** "Greenfield rebuild" framing is correct strategically but tempts the team to ignore old URL inventory. `/drive-with-us` is what drivers may have bookmarked. **Prevention is a launch-gate checklist:** pre-cutover crawl (Screaming Frog + GSC); 301 redirect map in `_redirects` (`/services` → `/`, `/fleet` → `/`, `/drive-with-us` → `/apply`, `/about` and `/contact` preserved); GMB / FMCSA SAFER / Indeed / Trucking Truth / AllTruckJobs / LinkedIn / Facebook / IG / email signatures all updated launch day; sitemap.xml resubmitted; week-1 daily 404 monitoring in GSC.

**Other launch gates:** Pitfall 6 (Cloudflare Turnstile + honeypot + origin check + rate limit shipped together — bots find recruiting forms within 48 hours); Pitfall 9 (no stock truck photos + every "we care" claim backed by a specific); Pitfall 10 (mobile form actually works on real iPhone + real Android); Pitfall 13 (Nevis Bold web license sourced before build); Pitfall 17 (privacy policy counsel-reviewed); Pitfall 7 (toggle URL structure decided up front).

## Implications for Roadmap

The four research files converge on a phase structure that prioritizes **shipping a working end-to-end conversion path before polishing pages.**

### Phase 1: Foundation + Form + Pay Engine (the launchable core)

**Rationale:** Conversion path (form → email + sheet + alerting) and credibility surface that justifies submitting (pay page with real numbers + toggle URL structure) are the two pieces that *must* be real before any page can be meaningfully tested.

**Delivers:** Astro 6 + Tailwind 4 + MDX project initialized; Cloudflare Pages target; brand tokens (Nevis Bold web license sourced; `font-display: swap` + fallback metric overrides). Zod schemas. Header + Footer. **Form handler end-to-end** (Astro Action on Node runtime, Turnstile + honeypot + origin + rate-limit, `dispatchLead()` to `EmailSink` REQUIRED + `SheetSink` OPTIONAL, durable fallback store, alerting wired, synthetic daily submission). **Apply form UI** (Conform + Zod, EEOC-friendly field whitelist, TCPA-compliant SMS consent block with version + timestamp captured per submission). **Pay & Benefits with OO ↔ Company toggle as URL-routed pages** (`/pay/owner-operator`, `/pay/company`); real CPM/% numbers in `data/pay.ts` imported into MDX; `effective` date frontmatter rendered next to every number; `JobPosting` JSON-LD with `baseSalary` per route. Privacy Policy + SMS Terms + EEO statement (counsel-reviewed before this phase exits).

**Addresses:** REQ-FUNNEL-01–04, REQ-PAY-01–03, REQ-SITE-01/02/03/04/05/06, REQ-OPS-01/02.
**Avoids:** Pitfalls 1, 2, 3, 4, 5, 6, 7, 13, 17, 18.

### Phase 2: Story + Trust + Ecosystem (the credibility surface)

**Rationale:** With the conversion path proven, build out the trust and differentiator content. Asset-dependent (founder bio ready now; driver photos partially ready; truck photos require half-day yard shoot).

**Delivers:** Homepage with founder-voice hero (real photo, no stock), three-stat row, ecosystem teaser, testimonial carousel. About / Founder Story page. Driver testimonials block (2–3 named/photographed). "What it's actually like" content with **LTTR in-house repair callout**. Equipment / Fleet page with real A2C truck photos + full spec list. Family / Ecosystem page (four sister-brand cards, driver-journey diagram in SVG, framed as *value-to-the-A2C-driver*). FAQ page with `FAQPage` JSON-LD. Contact page.

**Addresses:** REQ-STORY-01–04, REQ-ECO-01–03.
**Avoids:** Pitfalls 9 (stock photos + generic family copy), 11 (sister-brand confusion), 19 (old-site shipper-voice copy bleed).

### Phase 3: SEO + Brownfield Cutover + Launch Hardening

**Rationale:** Launch-gate work: search-engine surface area, brownfield redirect map, external-listings update, performance + accessibility passes, pre-launch counsel review.

**Delivers:** `sitemap.xml` + `robots.txt`. `noindex` meta on `apply/success`, privacy, terms, 404; `X-Robots-Tag: noindex` on Cloudflare Pages preview URLs. `Organization` + per-pay-route `JobPosting` (with `baseSalary`) + `FAQPage` JSON-LD validated in Google Rich Results Test. `og:image` per page. 3–5 curated SEO landing pages (each with 250+ words of unique content; **no templated city pages**). **Brownfield 301 redirect map** in `public/_redirects` from pre-cutover crawl. **External-listings update plan executed launch day** (GMB / FMCSA SAFER / aggregators / social / email signatures). Lighthouse mobile pass (LCP < 2.5s, CLS < 0.1, INP < 200ms); first-load JS < 200 KB gzipped (CI gate). Accessibility pass (WCAG AA). Plausible analytics with funnel events. Real-device QA. Security headers. **Pre-launch counsel review session** (privacy policy + SMS Terms + consent block + form fields + EEO — single legal session). Recruiter SOP documented.

**Addresses:** REQ-SITE-01 finalized, REQ-OPS-01/02/03 finalized.
**Avoids:** Pitfalls 8, 14, 15, 16, 20.

### Phase 4: Post-Launch Hardening + Differentiator Build-out (v1.x)

**Rationale:** Layer in differentiators that depend on production data or recurring content production.

**Delivers:** Pay calculator (once pay numbers stable 60–90 days). Founder-voice video via OTTS. Sample settlement statement download. Apply-by-text (Twilio 10DLC). Lane / dedicated-route map. OTTS YouTube embed (lite-youtube-embed). Additional 5–10 SEO location pages **only if** first set proves traction. TinaCMS layer **only if** non-dev editing pain is real. Spanish-language pay/benefits **only if** Spanish-fluent recruiter exists. Veteran/SkillBridge content **only if** A2C pursues the program.

**Avoids ongoing:** Pitfall 1 (quarterly pay-page review), Pitfall 4 (TCPA hygiene), Pitfall 5 (synthetic monitoring), Pitfall 18 (quarterly retention task; annual access audit).

### Phase 5: ATS Integration (v2+, business-driven)

**Rationale:** When application volume justifies the seat cost, the `LeadSink` adapter pattern enables Tenstreet/DriverReach to plug in alongside email + sheet — no UI rebuild. Triggered by recruiting team request, not calendar.

**Delivers:** `TenstreetSink` (or `DriverReachSink`) implementation; runs in parallel with existing sinks during transition.

### Phase Ordering Rationale

- **Form before pages:** only way to catch silent-failure modes early; only way to test CTAs end-to-end.
- **Pay before story:** drivers will not submit without seeing real pay; trust narrative dresses the pay numbers, not the other way around. Pay also drives the toggle URL decision (Pitfall 7) and `JobPosting` schema (Pitfall 3) — couples three pitfalls into one decision.
- **Story + ecosystem before SEO + cutover:** SEO surface (sitemap, JSON-LD, OG) is built once content is stable.
- **Brownfield cutover in Phase 3, not Phase 4:** lost link equity from week-one 404s is irrecoverable in the short term — has to be a launch-day ship.
- **Counsel review batched into Phase 3:** privacy + consent + form fields + EEO reviewed in one session is faster and cheaper than serializing.
- **Differentiators (calculator, video, settlement download) deferred to Phase 4:** each depends on stability that only post-launch operations provide.

### Research Flags

**Phases likely needing deeper research during planning (`/gsd-research-phase`):**

- **Phase 1 (Form integration):** Cloudflare Pages Functions + `nodejs_compat` + Astro Actions interaction; Resend SPF/DKIM/DMARC for `a2clogisticsco.com`; Google Sheets service-account JWT in Cloudflare Pages env; Turnstile server-side verify pattern; durable fallback store choice (R2 vs. KV vs. second sink). Highest novel-integration density.
- **Phase 1 (Pay schema design):** MDX frontmatter schema for pay tables (range vs. point, `effective` date, qualifier copy, `unitText` for `JobPosting`) needs to be designed once and locked — refactoring mid-build means rewriting every pay assertion.
- **Phase 3 (Compliance copy):** focused pre-counsel-review pass that drafts SMS consent block, privacy policy, EEO statement, FCRA-stance language using current TCPA/EEOC/state-law landscape — counsel reviews a draft, not a blank page.

**Phases with standard patterns (skip research-phase):**

- **Phase 2 (Story + trust + ecosystem pages):** straightforward Astro page composition + MDX collections + section blocks already built in Phase 1.
- **Phase 3 (SEO + brownfield):** sitemap/robots/JSON-LD/redirects are well-documented Astro and Cloudflare Pages patterns. Execution, not investigation.
- **Phase 4 (post-launch differentiators):** each item small enough to spec individually as prioritized.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | **HIGH** | All version verifications HIGH (Context7 + npm registry as of 2026-05-04). Astro-vs-Next call HIGH given specific scope. Cloudflare-vs-Netlify MEDIUM — both defensible; recommendation tilts on edge-locality + free tier. |
| Features | **MEDIUM-HIGH** | Direct evidence from major carriers (Crete, Schneider, Maverick) + ATS vendor (Tenstreet); pay-page non-negotiables, mobile patterns, anti-features all HIGH. Specific conversion-rate benchmarks for short-vs-long form MEDIUM (industry-wide data hard to verify). |
| Architecture | **HIGH** | Framework patterns Context7-verified. Toggle-as-routes well-documented SEO consensus. Partial-failure form handler best-practice rather than canonical doc — MEDIUM there. |
| Pitfalls | **MEDIUM-HIGH** | HIGH on conversion / form / SEO / brownfield / toggle pitfalls. MEDIUM on compliance specifics — frameworks stable through 2025 but state laws evolve. **Counsel sign-off required before launch; pitfalls research is starting checklist, not legal advice.** |

**Overall confidence:** **MEDIUM-HIGH.** Stack and architecture decisions firm. Feature scope firm. Compliance content needs counsel pass before launch.

### Gaps to Address

- **Counsel review of consent block, privacy policy, EEO statement, form fields.** Cannot launch without. Schedule in Phase 3 so any required field/copy changes can ship before launch gate. Single session covers all four artifacts.
- **Nevis Bold web license.** Confirm during Phase 1 (Wave 0) — if foundry doesn't sell self-host web license at acceptable cost, design needs a substitute display font + brand-book footnote.
- **Real CPM / % pay numbers from A2C operations.** PROJECT marks as `⏳ supplied during build`. Phase 1 cannot complete pay routes without these; surface as content-readiness blocker early. Schema can ship with placeholder numbers, but launch requires real numbers.
- **Driver testimonial collection.** Phase 2 ships 2–3 named/photographed minimum; component must gracefully empty/lite-state until more arrive.
- **Truck photo shoot at Lincoln yard.** Half-day shoot for Equipment page. Scheduling dependency for Phase 2.
- **Recruiter phone + SMS-capable number.** REQ-FUNNEL-04 success page references this; Pitfall 4 (TCPA) requires a single tracked recruiter number. Confirm before launch.
- **GMB + FMCSA SAFER + aggregator listings ownership.** Pitfall 20 — assign external-listings owner before Phase 3 cutover.
- **Sheet-vs-Airtable choice.** Architecture supports both behind same `LeadSink` interface; recommend starting with Sheets (free, fast to wire) and migrating to Airtable when recruiting asks for views/filters.

## Sources

### Primary (HIGH confidence)

- `/withastro/docs` (Context7) — Astro content collections, Actions API, Cloudflare adapter, Fonts API, Server Islands.
- `/vercel/next.js` (Context7) — App Router patterns (used to validate the Astro-over-Next call).
- `/tailwindlabs/tailwindcss.com` (Context7) — Tailwind v4 install, CSS-first `@theme` config.
- `/shadcn-ui/ui` (Context7) — March 2026 CLI v4 release with Astro template support.
- `/websites/motion_dev` (Context7) — `framer-motion` → `motion` rename + v12 SSR patterns.
- `/websites/developers_cloudflare_pages` (Context7) — Pages free-tier limits, `@astrojs/cloudflare` adapter, `nodejs_compat` flag.
- `/websites/netlify` (Context7) — Netlify Forms / Email Integration (alternative-host evaluation).
- `/websites/developers_cloudflare_turnstile` + `/marsidev/react-turnstile` (Context7) — Turnstile React integration + server-side verify pattern.
- `/colinhacks/zod` (Context7), `/websites/resend` (Context7), `/edmundhung/conform` (Context7), `/fontsource/fontsource` (Context7), `/plausible/docs` (Context7).
- npm registry (`npm view <pkg> version` on 2026-05-04) — current published versions.
- **PROJECT.md** (in-repo).
- **Crete Carrier** (`cretecarrier.com` + `/owner-operator/`) — Lincoln NE direct-competitor benchmark; published pay tables, deduction line items, equipment specs, TCPA SMS consent text pattern.
- **Schneider National** (`schneiderjobs.com` + `schneiderowneroperators.com`) — driver-type segmentation, mobile SMS pattern, separate OO sub-domain.
- **Maverick Transportation** (`maverickusa.com`) — applicant-portal hand-off pattern.
- **Tenstreet** (`tenstreet.com` + `/intelliapp/`) — IntelliApp + March 2025 DriverReach acquisition.
- **Existing codebase audit** — `src/pages/About.jsx` and `src/pages/DriveWithUs.jsx`.

### Secondary (MEDIUM confidence)

- **Apex Recruiting** (`apexdrivers.com/blog/owner-operator-recruiting-guide.html`) — OO vs. company driver factors, RPM ranges.
- **TrackFive** (`trackfive.com/blog/recruit-owner-operator-drivers/`) — OO recruiting strategy framework.
- **Indeed Hire** (`indeed.com/hire/c/info/recruiting-truck-drivers`) — recruiting-truck-driver tips.
- **EEOC pre-employment inquiries framework** — Title VII, ADEA, ADA, GINA, PDA. Direction stable; specific phrasing requires counsel.
- **FCRA** — 15 USC §1681b(b)(2)(A) standalone disclosure for consumer reports including MVR.
- **TCPA** — 47 USC §227, FCC implementing rules. 2024–2025 rulemaking turbulent.
- **State pay-transparency laws** — CO (2021), WA (2023), CA (2023), NY (2023), MD (2024), IL (2025).
- **Google Search Central — JobPosting structured data** — `baseSalary` requirements + Google for Jobs eligibility.
- **Google helpful-content updates / E-E-A-T** — basis for the no-templated-city-pages stance.

### Tertiary (LOW confidence — flagged for validation)

- Specific apply-by-text conversion lift numbers (vendor-claimed).
- Spanish-language doubling-of-Hispanic-applicant pool (directional, not measured for fleet of A2C's size).
- Specific Hispanic/Latino driver percentage (ATA estimate 18–25% widely cited; precise number varies).

---

*Research synthesis completed: 2026-05-04*
*Ready for roadmap: yes*
