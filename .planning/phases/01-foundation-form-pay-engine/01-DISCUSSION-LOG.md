# Phase 1: Foundation + Form + Pay Engine - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `01-CONTEXT.md` — this log preserves the alternatives considered.

**Date:** 2026-05-05
**Phase:** 1 - Foundation + Form + Pay Engine
**Mode:** `--auto` (recommended-default selections; no user prompts)
**Areas discussed:** Framework & build, Pay routes & toggle architecture, Form handler & sinks, Form UI & validation, Form security, Brand system & typography, Compliance drafts, Hosting & environment, Wave ordering

---

## Framework & Build

| Option | Description | Selected |
|--------|-------------|----------|
| Astro 6 (App Router-style file routing, islands) | Zero-JS by default, MDX content collections + Zod, first-party Cloudflare adapter; 80–110 KB JS lighter than Next on a 6–8 page marketing site | ✓ |
| Next.js 16 App Router | RSC streaming, mature ecosystem; ~85–110 KB React runtime baseline cost | |
| SvelteKit | Smallest bundles; abandons React/shadcn ecosystem | |

**Auto-selected:** Astro 6 (recommended; STACK.md HIGH confidence; flips only if a driver portal/dashboard with auth lands on this same domain)

---

## Pay Routes & Toggle Architecture

| Option | Description | Selected |
|--------|-------------|----------|
| Two physical SSG'd routes (`/pay/owner-operator`, `/pay/company`) | Each route SEO-distinct, canonical-to-self, own JobPosting JSON-LD; no Google deduping; deep-linkable | ✓ |
| Query param (`/pay?role=oo`) | Simpler routing; Google dedupes variants — only one ranks; loses one of the two SEO surfaces | |
| Client-only state | Invisible to crawlers; unshareable; lost on navigation | |

**Auto-selected:** Two physical routes (locked by Pitfall 7; ARCHITECTURE.md + FEATURES.md + PITFALLS.md all converge)

---

## Form Handler Runtime

| Option | Description | Selected |
|--------|-------------|----------|
| Cloudflare Pages Function with `nodejs_compat` (Node runtime) | Resend SDK + googleapis need Node modules; latency floor is the Resend call (~300–800ms) so Edge advantage is invisible | ✓ |
| Edge runtime (Workers V8 isolate) | Sub-50ms cold start; can't run Resend SDK or googleapis without polyfills | |

**Auto-selected:** Node runtime via `nodejs_compat` (ARCHITECTURE.md HIGH confidence; verified against Cloudflare Pages docs)

---

## Sink Architecture

| Option | Description | Selected |
|--------|-------------|----------|
| `LeadSink` adapter pattern (interface + concrete sinks, swappable) | Email REQUIRED + Sheet OPTIONAL via `dispatchLead()` fan-out; future ATS plugs in without form-UI rebuild; durable fallback store on partial failure; alerting | ✓ |
| Direct calls inline in the Action handler | Simpler now; brittle when a second sink is added; no clean fallback path | |
| Single sink (email only) | Lowest complexity; loses the Sheet pipeline-tracking value PROJECT.md requires | |

**Auto-selected:** `LeadSink` adapter pattern (FUNNEL-02; Pitfall 1 — silent failure is the catastrophic failure mode for a single-conversion-goal site)

---

## Form Library

| Option | Description | Selected |
|--------|-------------|----------|
| Conform (`@conform-to/zod` + `@conform-to/react`) | Progressive enhancement — works without JS via raw POST; same Zod schema validates client + server; native pattern for Astro Actions | ✓ |
| react-hook-form + `@hookform/resolvers/zod` | More popular; render optimizations not needed at 6 fields; weaker progressive-enhancement story | |
| Vanilla form + manual validation | Simplest; loses the schema-shared validation safety net | |

**Auto-selected:** Conform (STACK.md MEDIUM-HIGH confidence — flips only if team knows RHF cold and form grows past 6 fields with conditional logic)

---

## Spam Protection

| Option | Description | Selected |
|--------|-------------|----------|
| Cloudflare Turnstile + honeypot + origin check + rate limit | Free, privacy-friendly, no user-visible CAPTCHA; layered defense | ✓ |
| Google reCAPTCHA v3 | Privacy issues; Google cookie triggers banner requirements in some jurisdictions | |
| hCaptcha | Visible challenge; UX regression vs. Turnstile | |

**Auto-selected:** Turnstile + honeypot + origin check + rate limit (SEC-01..04; Pitfall 6)

---

## Pay Numbers Storage

| Option | Description | Selected |
|--------|-------------|----------|
| Single typed `src/data/pay.ts` (Zod-validated) imported into MDX via custom components | Quarterly updates touch one file; no drift between hero, pay route, JSON-LD; type-safe | ✓ |
| Numbers inline in each MDX file | Simpler authoring; numbers drift across pages (hero says X, pay page says Y) | |
| Headless CMS (Sanity / Contentful) | Out of scope per PROJECT.md | |

**Auto-selected:** Single typed `pay.ts` (PAY-04; ARCHITECTURE.md "split MDX prose from typed data" pattern)

---

## Brand Typography Sourcing

| Option | Description | Selected |
|--------|-------------|----------|
| Self-host licensed Nevis Bold via Astro Fonts API | Foundry-license required; common gotcha (Pitfall 13); brand fidelity preserved | ✓ |
| Substitute display font (Anton / Druk Wide) with brand-book footnote | Used as fallback IF Nevis web license isn't licensable at acceptable cost | (fallback) |
| Google Fonts CDN | License violation for foundry fonts; render-blocking | |

**Auto-selected:** Self-host Nevis Bold (BRAND-02/03; surfacing license-cost question to user as Wave 0 blocker)

---

## TCPA SMS Consent

| Option | Description | Selected |
|--------|-------------|----------|
| Required positive opt-in checkbox (not pre-checked), version-stamped, metadata logged per submission | Compliant with TCPA; consent_version captured per row; minimizes legal exposure | ✓ |
| Pre-checked "I agree to receive SMS" checkbox | TCPA violation risk (not affirmative opt-in); $500–$1,500 per non-consented text | |
| No SMS consent at all (form just collects phone) | Phone collected without consent → can't legally text inbound leads | |

**Auto-selected:** Required positive opt-in, version-stamped (COMP-02; Pitfall 4 — counsel-reviewed final in Phase 3)

---

## Pay Transparency

| Option | Description | Selected |
|--------|-------------|----------|
| Real ranges + `effective: YYYY-MM` date next to every number + `JobPosting` JSON-LD with `baseSalary` | Transparency is the differentiator; satisfies state pay-transparency laws (CA/WA/NY/IL/CO/MD) | ✓ |
| "Competitive pay — call for details" copy | Veteran drivers read this as evasion; loses Crete-Carrier-floor benchmark in same market; potential state-law exposure | |
| Single point numbers (no ranges, no effective date) | Goes stale; becomes a screenshot weapon (Pitfall 2) | |

**Auto-selected:** Real ranges + effective dates + JobPosting JSON-LD (PAY-01..07; Pitfalls 2 + 3 + 4 coupled into one decision per SUMMARY)

---

## Hosting

| Option | Description | Selected |
|--------|-------------|----------|
| Cloudflare Pages | First-party Astro adapter; 100k/day function quota; true edge for static; KV bindings for fallback/idempotency/rate-limit | ✓ |
| Netlify | First-party Astro adapter; built-in `data-netlify="true"` form shortcut (but A2C still needs custom function for "also email + Sheet"); fewer free function invocations | |
| Vercel | Excluded by user | |

**Auto-selected:** Cloudflare Pages (STACK.md MEDIUM confidence — defensible second is Netlify)

---

## Compliance Page Drafts

| Option | Description | Selected |
|--------|-------------|----------|
| Ship draft Privacy / SMS Terms / EEO in Phase 1 (counsel-reviewed final in Phase 3) | Form has real consent block from day one; Phase 3 counsel pass refines, doesn't write from blank page | ✓ |
| Skip drafts; ship counsel-approved final in Phase 3 only | Form launches with placeholder consent → re-wires the form when real copy lands | |

**Auto-selected:** Phase 1 drafts + Phase 3 counsel review (matches ROADMAP phase split; honors COMP-06 → Phase 3)

---

## Lighthouse + axe CI Gates

| Option | Description | Selected |
|--------|-------------|----------|
| Defer to Phase 3 (launch hardening) | Running CI perf/a11y gates on a half-built site wastes signal; gates land when content is stable | ✓ |
| Run Lighthouse CI from day one of Phase 1 | Surfaces perf regressions earlier; high noise during scaffolding | |

**Auto-selected:** Defer to Phase 3 (matches ROADMAP — SITE-03/05 in Phase 3 alongside HOST-03 deploy gating)

---

## Claude's Discretion

(Items where the recommended-default rule applied without competing alternatives, or where specific tactical choices were made within the auto-selected approach.)

- Cron schedule for daily synthetic test → 04:30 UTC (off-peak; before US morning).
- KV namespace binding names → `LEAD_FALLBACK`, `IDEMPOTENCY`, `RATELIMIT`.
- Rate limit window granularity → 10 minutes per IP, sliding window via timestamp array in KV with 10-min TTL.
- US-state dropdown → standard 50 + DC, no IP-guess pre-selection (drivers move; IP guess is wrong often enough to be friction).
- Years-of-experience UI → segmented control on mobile (touch-friendly), select on desktop.
- Honeypot CSS strategy → `position: absolute; left: -9999px; aria-hidden="true"; tabindex="-1"; autocomplete="off"`.
- Lead row schema → `{ id, ts, sinkStatus: { email, sheet }, firstName, lastName, phone, email, cdlClass, yearsExperience, role, state, ip, ua, consentVersion, formVersion, synthetic? }`.
- Wave ordering → 5 waves; Wave 2 (pay routes) and Wave 3 (form handler + UI) run in parallel after Wave 1 schemas land.
- Folder layout → standard Astro layout with `src/content/`, `src/data/`, `src/lib/{sinks,validation}`, `src/actions/apply.ts`, `src/components/{ui,sections,islands}/`.

## Deferred Ideas

(Surfaced during analysis; belong in later phases or v2. Captured in `01-CONTEXT.md` `<deferred>` section.)

- Lighthouse + axe CI gates → Phase 3
- Plausible analytics + funnel events → Phase 3
- Brownfield 301 redirect map → Phase 3 cutover
- Counsel-reviewed final compliance copy → Phase 3
- `Organization` JSON-LD on every page, sitemap.xml, robots.txt, OG images, FAQ JSON-LD → Phase 3
- 3–5 curated SEO landing pages → Phase 3
- Pay calculator, founder video, sample settlement download, apply-by-text, lane map, lite-youtube embed → v2
- Tenstreet / DriverReach ATS sink → v2 (LeadSink adapter built so it drops in cleanly)
- TinaCMS overlay → v2
- Spanish-language pay/benefits → v2
- Veteran / SkillBridge content → v2
