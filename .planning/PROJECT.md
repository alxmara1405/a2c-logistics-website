# A2C Logistics CO. — Driver Recruiting Site

## What This Is

A full rebuild of `a2clogistics.com` — a driver-recruiting site for **A2C Logistics CO.**, a Lincoln, NE trucking company. The site is built for **two audiences only — owner-operators (lease-on) and company drivers (W2)** — and exists to convert visiting drivers into qualified leads for A2C's recruiting team.

The current Vite/React site mixes shipper messaging (Services, Fleet) with driver messaging across six generic pages. The new site drops shipper content entirely, leads with a story-driven *"driver-first"* identity, and routes every visitor toward a single quick-apply form. A dedicated section introduces the four sister brands in the A2C ecosystem (LTTR, LTS, DP, OTTS), reinforcing the *"you're joining an ecosystem, not just a fleet"* differentiator.

## Core Value

**Every visiting driver — owner-op or company — leaves the site having either submitted the quick-apply form, or knowing exactly who A2C is and why "Driven to be different" is more than a tagline.** Conversion is the bar; trust is the moat.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

<!-- Current scope. Building toward these. Numbered for roadmap traceability. -->

**Driver Funnel (the conversion path)**

- [ ] **REQ-FUNNEL-01**: Quick-apply form (≤ 6 fields: name, phone, CDL class, years experience, OO-or-Company toggle, current location/state) submits to a serverless endpoint
- [ ] **REQ-FUNNEL-02**: Form submissions deliver via email to recruiting AND log to a Google Sheet or Airtable for pipeline tracking
- [ ] **REQ-FUNNEL-03**: Persistent CTA (sticky header button + repeated section CTAs) routes to the apply form from every page
- [ ] **REQ-FUNNEL-04**: Submission success state confirms next step ("a recruiter will text/call within 24 hours") and offers a calendar option or callback time

**Driver-First Story (the trust layer)**

- [ ] **REQ-STORY-01**: Homepage hero leads with the *"Driven to be different"* identity and the driver-first promise — not freight services
- [ ] **REQ-STORY-02**: Founder/owner story page or section (real photo, real voice, real commitment to drivers)
- [ ] **REQ-STORY-03**: Driver testimonials surface (photos + quotes) — start with what's available, expand as collected
- [ ] **REQ-STORY-04**: "What it's actually like" content — dispatcher accessibility, how disputes are handled, what happens when a truck breaks down

**Pay & Benefits Transparency (the credibility layer)**

- [ ] **REQ-PAY-01**: Pay & Benefits page with **OO ↔ Company toggle** that swaps the entire pay narrative
- [ ] **REQ-PAY-02**: Real numbers published (CPM ranges, percentage splits, fast-pay terms, fuel discounts, sign-on bonuses, detention pay) — sourced from MDX so updates require only an edit
- [ ] **REQ-PAY-03**: Side-by-side comparison or clear separation of company-driver benefits (W2 health, PTO, 401k) vs. owner-op terms (truck program, fuel card %, settlement cadence)

**Ecosystem Family (the differentiator amplifier)**

- [ ] **REQ-ECO-01**: Dedicated "The A2C Family" section — homepage block + dedicated page introducing all four sister brands (LTTR, LTS, DP, OTTS) with each brand's logo, tagline, and one-line value prop
- [ ] **REQ-ECO-02**: Outbound links to OTTS YouTube + each sister brand's site (or "coming soon" placeholders for those not yet live)
- [ ] **REQ-ECO-03**: Driver journey diagram (lightweight version of the brand-book flywheel) showing how the ecosystem supports a driver across discovery → loyalty

**Site Foundation (the build)**

- [ ] **REQ-SITE-01**: SEO-ready: SSR or SSG so pages rank for queries like "owner operator jobs Nebraska", "lease-on trucking Lincoln NE", "company driver jobs A2C"
- [ ] **REQ-SITE-02**: Brand identity correctly applied — Nevis Bold headlines, Avenir body, palette `#000 / #FFF / #EF392C / #D9D9D9`, motion-line/truck wordmark from brand book
- [ ] **REQ-SITE-03**: Mobile-first responsive (most drivers browse from a phone in a truck stop)
- [ ] **REQ-SITE-04**: Fast — LCP < 2.5s on 4G, no CLS jank, lazy-load below-fold imagery
- [ ] **REQ-SITE-05**: Accessible (WCAG AA) — recruiting reach matters; large fonts, real contrast, keyboard-navigable form
- [ ] **REQ-SITE-06**: All long-form copy + driver testimonials + pay numbers stored as MDX/markdown in the repo for git-managed editing

**Compliance & Operations**

- [ ] **REQ-OPS-01**: Recruiting form copy is DOT/EEOC-friendly (no protected-class questions, voluntary/non-coercive consent for recruiter follow-up)
- [ ] **REQ-OPS-02**: Privacy policy + basic terms pages, since the form collects PII
- [ ] **REQ-OPS-03**: Analytics in place (lightweight — Plausible/Umami/Fathom or GA4) to track funnel drop-off

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- **Shipper / freight-customer pages** — Site is for drivers only. The current site's Services and Fleet pages (aimed at companies hiring A2C to move freight) are deliberately removed. *Why:* every page that talks to shippers dilutes the driver-first story and steals attention from the apply funnel.
- **Full-fledged driver application (DOT/MVR/SSN/employment history)** — The on-site form is *quick-apply only*. The full DOT-compliant application happens off-site (recruiter-led, possibly via a future Tenstreet/DriverReach integration). *Why:* friction kills conversion; full apps belong in an ATS, not a marketing site.
- **Industry ATS integration (Tenstreet, DriverReach, etc.)** — Not chosen yet; building the form pluggable but starting with email + sheet. *Why:* MVP simplicity; ATS choice is a separate business decision that can be retrofitted without rebuilding the form.
- **Headless CMS (Sanity, Contentful, etc.)** — Content lives in MDX/markdown in the repo. *Why:* updates are infrequent enough that git-PR or a TinaCMS-style git editor is sufficient; a CMS adds cost and a second system to maintain.
- **CDL-school / entry-level driver recruiting** — A2C is recruiting experienced owner-ops and company drivers, not training new CDLs. *Why:* explicitly chosen audience; entry-level recruiting needs different content (training, mentorship) and would muddy the messaging.
- **Hub for the full A2C brand ecosystem** — Sister brands (LTTR, LTS, DP, OTTS) get their own properties; this site references and links to them but is not their home. *Why:* explicit user decision; A2C-only scope keeps the site focused.
- **Customer / driver portal (load tracking, settlement viewer, document upload)** — Not in scope for the marketing site. *Why:* operational tooling lives in carrier-management software, not the public site.
- **Public blog / news section as a launch requirement** — May come later; ecosystem content lives on OTTS YouTube. *Why:* OTTS is the content arm of the ecosystem by design — duplicating that role on the A2C site fragments the strategy.
- **E-commerce / merch / lead-magnet downloads** — Not relevant to recruiting at this stage. *Why:* no business need surfaced.

## Context

**Existing codebase (to be replaced, not extended):**
- Vite 8 + React 19 + Tailwind 4 + React Router 7 + framer-motion + base-ui/shadcn-style components
- 6 pages: Home, About, Services, Fleet, DriveWithUs, Contact
- Mixed audience (shippers + drivers) — the core problem this rebuild fixes
- Some salvageable copy in `src/pages/About.jsx` ("Built by Drivers, for Drivers", three values: Accountability / Responsiveness / Driver-First Culture) and `src/pages/DriveWithUs.jsx` (basic application form, requirements list)
- Treat the rebuild as **greenfield** — wholesale replacement, not migration

**Brand assets (delivered, in `/Users/alexandercostea/Downloads/`):**
- `A2C Brand Development_Final Delivery (1).pdf` — full 14-page brand system (5C ecosystem, brand profiles for all 5 brands, A2C visual identity)
- `A2C Messaging Framework.docx` — positioning statement, tagline, brand concept narrative
- `A2C_Snaphot_Final (1).pdf` — single-page visual identity snapshot (logo, colors, typography)
- `A2C Brand Ecosystem (1).pdf` — ecosystem map, flywheel, driver journey
- Tagline: **"Driven to be different."**
- Visual: Nevis Bold (headlines) / Avenir (body); palette `#FFFFFF / #000000 / #EF392C / #D9D9D9`; streamlined-truck wordmark with motion lines

**Business context (Lincoln, NE — 300 S. Cotner Blvd):**
- A2C Logistics CO. is the *operational core* of a 5-brand driver-focused ecosystem
- Sister brands: Lincoln Truck & Trailer (LTTR — repair), LTS (sales — future), Dispatch Providers (DP — independent dispatch), On The Trucker Side (OTTS — YouTube content)
- Ecosystem flywheel: OTTS content builds driver trust → service brands convert → drivers grow with A2C operationally
- Industry challenge: drivers feel replaceable, disconnected, undervalued — A2C's whole pitch is the opposite

**Audience reality (informs every design choice):**
- Owner-ops and experienced company drivers research carriers heavily — they read everything, distrust marketing-speak, and notice when pay is hidden
- Most browse from a phone (truck stop wifi, sleeper berth) — mobile-first is non-negotiable
- They watch a *lot* of trucking YouTube — OTTS content cross-link is a natural conversion path
- They convert by phone/text more often than by web form — quick-apply must hand off to a real human fast

**Content readiness today:**
- ✅ Full brand system delivered
- ✅ Founder bio/photo and a couple of driver photos/quotes available now
- ⏳ Real CPM/% pay numbers will be supplied during build
- ⏳ Most driver testimonials still to be collected (site needs graceful empty/lite states)

## Constraints

- **Tech stack**: **Astro 6 + Tailwind 4 + MDX content collections + React 19 islands** (form + OO/Company toggle only). Locked during research synthesis (`research/STACK.md` HIGH-confidence pick) — Astro beats Next.js for a 6–8 page mobile-LCP marketing site with two interactive surfaces; ~85–110 KB JS savings vs. Next baseline; first-party Cloudflare adapter parity. Existing `package.json` deps (`lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `@base-ui/react`) carry over inside React islands; `framer-motion` is reinstalled as `motion@12` (renamed package, identical API).
- **Content**: All copy, pay numbers, testimonials, and structured data live in MDX/markdown in the repo (no headless CMS). Edits are made via PR or a git-based CMS UI like TinaCMS.
- **Hosting**: **Cloudflare Pages** (locked) with the `@astrojs/cloudflare` adapter. Form handler runs as a Pages Function with `nodejs_compat`. Three KV namespaces (`IDEMPOTENCY`, `RATELIMIT`, `LEAD_FALLBACK`) plus a Cron Trigger for the daily synthetic submission test.
- **Domain & DNS**: Domain `a2clogistics.com` is registered at **Squarespace** (registrar stays — no transfer). DNS is **delegated to Cloudflare** by changing nameservers in Squarespace's domain settings to Cloudflare's. All DNS records (apex via CNAME flattening, www CNAME → Pages, SPF/DKIM/DMARC TXT for Resend + Google Workspace, MX → Google Workspace) live in the Cloudflare dashboard. Bluehost is cancelled once DNS is on Cloudflare (no email dependency — email is on Google Workspace).
- **Email**: **Google Workspace** for `@a2clogistics.com` mailboxes (inbound). **Resend** for outbound transactional only (lead-handler emails to recruiter). Both must coexist in DNS:
  - **SPF (only one TXT record per domain — combine both):** `v=spf1 include:_spf.google.com include:_spf.resend.com ~all`
  - **DKIM (separate selectors — both fine to have):** Google uses `google._domainkey`; Resend uses `resend._domainkey`
  - **DMARC (one record):** policy applies to both senders since both pass SPF + DKIM via the records above
  - **MX:** Google's standard 5-record set (`smtp.google.com` MX 1)
- **Form delivery**: Submissions email recruiting + write a row to a Google Sheet or Airtable. Built behind a swappable adapter so a future ATS (Tenstreet/DriverReach) can replace the email/sheet sink without rebuilding the form UI.
- **Brand fidelity**: Nevis Bold typography is licensed — need a licensed copy or web-font equivalent before launch. Color palette and logo system are non-negotiable per the brand book.
- **Compliance**: DOT/FMCSA recruiting copy norms apply (no protected-class questions, voluntary consent for recruiter contact). Privacy policy required because of PII collection.
- **Performance**: Mobile-first; LCP < 2.5s on 4G; no layout shift on hero or testimonial swaps.
- **Accessibility**: WCAG AA minimum.
- **Single-site scope**: This project is A2C Logistics CO. only. Sister brands are referenced and linked, never absorbed.

## Key Decisions

<!-- Decisions made during initialization. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Wholesale rebuild, not migration | Existing site mixes shipper + driver audiences across 6 pages; no clean migration path to a focused driver site | — Pending |
| Drivers-only audience (drop shippers) | User explicitly chose driver-only scope; shipper messaging dilutes the funnel | — Pending |
| Owner-ops + company drivers (skip new CDL / experienced-team specifics) | User-confirmed audience profile — keeps content tight | — Pending |
| Lead with "Driver-first culture" as primary differentiator | User-selected over pay, equipment, ecosystem options; story-driven angle | — Pending |
| Unified driver experience with OO ↔ Company toggle (vs. two separate paths) | Less duplication; cleaner narrative; toggle handles the cases that actually differ (pay, benefits, application) | — Pending |
| Quick-apply form (≤6 fields), not a full DOT application | Friction kills conversion; full apps belong in an ATS later | — Pending |
| Publish real pay numbers (vs. ranges or pitch-only) | Transparency *is* the differentiator; veteran drivers reward it | — Pending |
| Dedicated "Family" ecosystem section (vs. footer-only or no mention) | User-selected; reinforces the "joining an ecosystem" pitch and supports the flywheel | — Pending |
| MDX/markdown content in-repo (no headless CMS) | User-selected; updates are infrequent enough; avoids the cost/maintenance of a second system | — Pending |
| Form: email + Google Sheet/Airtable, built pluggable | User-selected MVP path; ATS integration deferred but architecturally enabled | — Pending |
| Ship plan: Netlify or Cloudflare Pages | User indicated non-Vercel host preference; both support SSG/SSR + edge function for the form | — Pending |
| Tech stack default to Next.js (App Router) unless planning surfaces a better fit | SEO-driven recruitment site; SSR + image optimization + ecosystem maturity all favor Next | ⚠️ Revisit — superseded |
| **Astro 6 (not Next.js)** locked during research synthesis | Zero-JS-by-default beats Next on a 6–8 page mobile-LCP marketing site; only two interactive surfaces (form + toggle) — textbook Astro Islands; first-party Cloudflare adapter parity | — Pending |
| **Cloudflare Pages** locked as host (over Netlify) | Edge-function locality (truck-stop wifi audience), 100k/day free Worker invocations, first-party Astro adapter, KV bindings + Cron Trigger native | — Pending |
| **Squarespace registrar + Cloudflare DNS + Cloudflare Pages hosting** (Option B) | Domain stays at Squarespace (no transfer), but nameservers point at Cloudflare so apex CNAME flattening + Cloudflare proxy + clean SPF/DKIM/DMARC editing all work natively. Bluehost hosting cancelled once DNS is on Cloudflare. | — Pending |
| `LeadSink` adapter pattern (email REQUIRED + sheet OPTIONAL + future ATS pluggable) | Pitfall 1 prevention (silent form failure is the catastrophic failure mode for a single-conversion-goal site); future Tenstreet/DriverReach drops in cleanly | — Pending |
| Two physical SSG'd routes for OO/Company pay (NOT a query param) | Locked by Pitfall 7 — Google dedupes `?role=` variants and only one ranks; client-only state is invisible to crawlers | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-04 after initialization*
