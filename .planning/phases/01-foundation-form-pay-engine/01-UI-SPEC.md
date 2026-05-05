---
phase: 1
slug: foundation-form-pay-engine
status: draft
shadcn_initialized: false
preset: pending-wave-0
created: 2026-05-05
---

# Phase 1 — UI Design Contract

> Visual and interaction contract for Phase 1 (Foundation + Form + Pay Engine). Pre-populated from CONTEXT.md (D-01..D-45), STACK.md, REQUIREMENTS.md (BRAND-01..05, FUNNEL-01..08, PAY-01..07, SEC-01..06, COMP-01..05/07, SITE-01/02/04/06/07), the locked brand snapshot at `/Users/alexandercostea/Downloads/A2C_Snaphot_Final (1).pdf`, and PROJECT.md. No user questions surfaced — all gray areas resolved by upstream decisions.

---

## Surfaces in Scope (Phase 1 only)

What this contract governs (the visual + interactive primitives shipped in Phase 1):

| Surface | Route(s) | Render mode | Interaction |
|---------|----------|-------------|-------------|
| Global Layout shell | (wraps every page) | `.astro` static | Sticky header on scroll; persistent header `Apply` CTA + recruiter `tel:`/`sms:` in header & footer; MC#/USDOT# placeholder slots in footer |
| Owner-Operator pay page | `/pay/owner-operator` | SSG `.astro` + MDX | Pill toggle (route nav, no client state) at top; `localStorage` writes preference on click |
| Company-Driver pay page | `/pay/company` | SSG `.astro` + MDX | Same toggle component |
| `/pay` redirect | `/pay` | 308 → `/pay/owner-operator` | n/a |
| Apply form | `/apply` | `.astro` page + React island (`ApplyForm.tsx`) | Native HTML POST works without JS; React island hydrates for live Conform/Zod validation; pill toggle at top of form mirrors pay-page toggle |
| Apply success | `/apply/success` | SSG `.astro`, `noindex` | Static; recruiter `tel:`/`sms:` as fallback CTA |
| Draft compliance pages | `/privacy`, `/sms-terms`, `/eeo` | SSG `.astro` + MDX | Static long-form prose; "Draft — pending counsel review" banner at top |
| 404 | `/404.astro` | SSG | Apply CTA + nav links (don't lose drivers per SITE-07) |

Out of contract: home, about, equipment, family, testimonials, FAQ pages (Phase 2). SEO surface beyond `JobPosting` JSON-LD on the pay routes (Phase 3). Lighthouse/axe CI thresholds (Phase 3). Plausible event names (Phase 3).

---

## Design System

| Property | Value | Source |
|----------|-------|--------|
| Tool | shadcn (CLI v4 — Astro template) | CONTEXT D-03; STACK shadcn@4.6.0 |
| Preset | manual `@theme` config in `src/styles/global.css` (no shadcn preset string — Tailwind v4 CSS-first) | CONTEXT D-02; STACK Tailwind v4 §"Setup" |
| Component library | shadcn/ui (Astro template) sitting on Radix-style primitives, copied into `src/components/ui/*` | CONTEXT D-03 |
| Phase-1 components installed | `Button`, `Input`, `Label`, `Select`, `Checkbox`, `Form` (state UI). Defer `Card`, `Carousel`, `Dialog`, `Sheet`, `Tabs` to Phase 2 | CONTEXT D-03 |
| Icon library | `lucide-astro` (zero-JS for `.astro` files), `lucide-react` (form island only) | STACK §"Icons"; CLAUDE.md |
| Display font | **Nevis Bold** self-hosted via `astro:assets` Fonts API (`font-display: swap`, preload, fallback metric overrides). Substitute if web license unsourceable: `Anton` (Google Fonts) — brand-book footnote required. Ultra-fallback: `Druk Wide` (Commercial Type) | CONTEXT D-32, D-33; BRAND-02, BRAND-03 |
| Body font | **Avenir** self-hosted (corporate license) OR `@fontsource-variable/inter` as the metric-matched substitute (footnote in brand book) | STACK §"Typography"; BRAND-02 |
| Animation | None in Phase 1. View Transitions API via Astro `<ClientRouter />` is **disabled** until Phase 2 to keep first-load JS at zero on pay routes. No `motion` import on any Phase-1 page | STACK §"Animation" + bundle budget SITE-04 |
| Bundle budget | First-load JS < 200 KB gzipped (CI sanity check Phase 1; full LH gate Phase 3) | SITE-04 |

`shadcn_initialized: false` in frontmatter reflects current repo state — Wave 0 will run `npx shadcn@latest init` (Astro template) and `npx shadcn@latest add button input label select checkbox form`. Once `components.json` lands, the next planning agent flips this to `true`.

---

## Spacing Scale

Strict 8-point scale. All Phase-1 padding, margin, and gap values resolve to one of these tokens (Tailwind v4 utilities `p-1`, `p-2`, `p-4`, `p-6`, `p-8`, `p-12`, `p-16`).

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| xs | 4px | `1` | Icon-to-text gap inside buttons; checkbox-to-label gap |
| sm | 8px | `2` | Form field internal padding (`Input`, `Select` y-padding); badge padding; pill toggle internal padding |
| md | 16px | `4` | Default vertical gap between form fields; pay-table cell padding; section internal gutter |
| lg | 24px | `6` | Card internal padding; pay-table row spacing; footer column gap |
| xl | 32px | `8` | Section vertical rhythm on mobile; horizontal page gutter desktop |
| 2xl | 48px | `12` | Major section breaks (pay sections, "Effective" disclosure block separator) |
| 3xl | 64px | `16` | Page-level top/bottom rhythm desktop; hero vertical padding on pay pages |

**Touch-target exception (mobile-only, REQ-driven):** Interactive elements (pill toggle buttons, primary CTA, form-control hit areas, recruiter `tel:`/`sms:` links in header) MUST resolve to ≥44×44px tap target via `min-h-11 min-w-11` (44px = WCAG AA + iOS HIG). Use `py-3 px-6` (12/24) on the primary `Apply` button to land at 48px tall × ≥44px wide — both inside the scale and above the touch floor. Pitfall 10 source.

**Page max-width:** `max-w-3xl` (768px) for prose / pay tables / forms; `max-w-screen-xl` (1280px) for the layout shell. No content stretches edge-to-edge on desktop.

**Horizontal page gutter:** `px-4` (16px) on mobile, `px-8` (32px) on tablet+, `px-16` (64px) on `lg:` and up.

---

## Typography

Four sizes, two weights. Driver audience reads on phones in poor lighting at truck stops — body MUST be 16px minimum (mobile autozoom prevention + readability per FEATURES.md "Mobile patterns"). No italics anywhere.

| Role | Size (mobile) | Size (desktop) | Family | Weight | Line Height | Tracking |
|------|---------------|----------------|--------|--------|-------------|----------|
| Body | 16px | 16px | Avenir (var `--font-body`) | 400 (regular) | 1.5 | normal |
| Label / micro | 14px | 14px | Avenir | 600 (semibold) | 1.4 | `0.01em` |
| Heading (H2 / pay-section title / form section) | 24px | 28px | Nevis Bold (var `--font-display`) | 700 (bold) — Nevis Bold is a single-cut face | 1.2 | `-0.01em` |
| Display (H1 / page title / "Driven to be different.") | 32px | 48px | Nevis Bold | 700 | 1.1 | `-0.02em` |

**Rules:**
- All H1 elements use Display size; one H1 per route.
- All H2 elements use Heading size.
- All paragraphs, list items, table cells, and form helper text use Body size + weight 400.
- Field labels, button labels, badge text, and `effective: YYYY-MM` date stamps use Label size + weight 600.
- Pay numbers (CPM, %, dollar ranges) use Display size on pay-page hero numbers, Heading size in tables.
- The tagline **"Driven to be different."** renders in Display size, Nevis Bold, on the apply success page only in Phase 1 (the homepage hero is Phase 2).
- No additional sizes. If a designer wants 20px or 18px, refuse — pick from the four declared.

**Fallback metric overrides** (CLS prevention per Pitfall 13) declared in the same `@font-face` block as the loaded font:
- Nevis fallback stack: `"Nevis", "Anton", "Impact", system-ui, sans-serif` with `size-adjust`, `ascent-override`, `descent-override` calibrated post-license.
- Avenir fallback stack: `"Avenir", "Inter Variable", system-ui, sans-serif` with same overrides.

`font-display: swap` is mandatory on every font-face. Headlines preloaded via `<link rel="preload" as="font" type="font/woff2">` on pay routes + apply route + layout shell.

---

## Color

60 / 30 / 10 split honored exactly. Brand book values are non-negotiable per BRAND-01.

| Role | Value | Tailwind utility | Usage |
|------|-------|------------------|-------|
| Dominant (60%) | `#FFFFFF` brand-white | `bg-brand-white` / `text-brand-white` | Page background, form-field background, pay-table cell background, surface of all main content |
| Secondary (30%) | `#000000` brand-black | `bg-brand-black` / `text-brand-black` | All body text, headings, form-field borders (`border-brand-black/20`), table dividers, footer background, header background when scrolled past hero, draft-banner border, Logo Primary (Black variant) |
| Accent (10%) | `#EF392C` brand-red | `bg-brand-red` / `text-brand-red` | **Reserved-for list — see below** |
| Neutral (auxiliary, NOT counted in 10%) | `#D9D9D9` brand-gray | `bg-brand-gray` / `border-brand-gray` | Disabled-state field background; subtle dividers between pay-table sections; "Draft — pending counsel review" banner background; tire/motion-line illustration accents per brand book |
| Destructive | `#EF392C` brand-red (same accent — no second semantic color introduced in Phase 1) | `text-brand-red` | Form validation error text + error message banner only. No separate `--color-destructive` token. |

**Accent (`#EF392C` brand-red) reserved EXCLUSIVELY for:**
1. The persistent header **Apply** CTA button (filled red, white text, on every page).
2. The pill **toggle** "selected" state on `/pay/*` and `/apply` (filled red, white text; unselected = transparent background, 1px brand-black border, brand-black text).
3. The motion-line accent on the inverse logo variant (per brand snapshot — already inside the SVG asset).
4. Form validation **error** text and the error-state banner border.
5. The "Effective: YYYY-MM" date badge on every pay number (small red badge to draw eye to freshness — Pitfall 1 mitigation).

**Accent NOT used for:** body links (use brand-black underline), focus rings (use brand-black 2px ring), table headers, footer accents, section headings, success messages (use brand-black text on brand-white background — no green).

**Logo variants (BRAND-04):**
- `logo-primary.svg` — black wordmark + black truck silhouette + red motion lines, on brand-white or brand-gray surfaces (header default state).
- `logo-inverse.svg` — white wordmark + white truck silhouette + red motion lines, on brand-black surfaces (footer; header after scroll-darken if implemented).

**Contrast verification (WCAG AA — REQ for Phase 3 audit, but locked here):**
- Brand-black on brand-white: 21:1 ✓ (AAA).
- Brand-white on brand-red `#EF392C`: ~4.85:1 ✓ AA at ≥18px or bold ≥14px (covers all CTA copy on red — must NOT use brand-red for body text, only for ≥14px semibold labels and large CTA copy).
- Brand-red on brand-white: ~4.78:1 ✓ AA at ≥18px or bold ≥14px (covers error labels and "Effective" badges, both at Label size 14px/600).
- Brand-black on brand-gray `#D9D9D9`: ~13:1 ✓ AAA (covers draft-banner copy and disabled-field placeholder).

---

## Copywriting Contract

Voice: **direct, no-nonsense, driver-first. Concrete specifics over vague claims.** Banned phrases (grep gate before launch): `"family"`, `"competitive pay"`, `"top of market"`, `"top earners"`, `"industry-leading"`, `"great pay"`, `"join us"`, `"we care about"`, `"freight"` (shipper voice — Pitfall 19), `"your loads"` (shipper voice). Source: PROJECT.md "Brand voice" + Pitfall 9 + Pitfall 19.

| Element | Copy | Where |
|---------|------|-------|
| Primary CTA (header, every page) | **Apply** | Header sticky button → `/apply` (FUNNEL-06). On mobile, never wider than the viewport minus 32px gutter. |
| Section CTA (pay pages, end of each section) | **Apply now** | In-section CTA above the fold on mobile per success criterion 4. Routes to `/apply?role=owner-operator` or `/apply?role=company` with deep-linked role state. |
| Pay-toggle pill — Owner-Op | **Owner-Operator** | Both pay routes, top of form; selected = filled red |
| Pay-toggle pill — Company | **Company Driver** | Both pay routes, top of form |
| Pay-toggle accessible label | "Pay structure for: Owner-Operator selected" / "Pay structure for: Company Driver selected" | `aria-pressed`/`aria-current` on each pill |
| Effective-date badge | **Effective: 2026-MM** (renders next to every pay number) | All pay tables; format = `effective: YYYY-MM` from `pay.ts` schema (PAY-05; CONTEXT D-09) |
| "As of" disclosure block | "Pay terms shown here are current as of {effective date} and may change with market conditions. Final terms confirmed in writing during onboarding." | Bottom of every pay route (Pitfall 1) |
| Recruiter `tel:` link label | **Call: (XXX) XXX-XXXX** (placeholder until recruiter number locked — content blocker) | Header (after Apply CTA); footer; apply success page; error state |
| Recruiter `sms:` link label | **Text: (XXX) XXX-XXXX** | Same placement |
| MC#/USDOT# footer placeholder | **MC# {pending} · USDOT# {pending}** | Footer of every page; replaced with real numbers Phase 2 (TRUST-06 lands fully there but the slot ships here per CONTEXT D-31 layout) |
| Form section header | **Tell us about you** | Top of `/apply` form, below the OO/Company pill |
| Form field labels | "First name" · "Last name" · "Phone" · "Email" · "CDL class" · "Years driving" · "Current state" · "Are you a…" (OO/Company selector) | Label size, weight 600, brand-black. All `<label for>` associated. |
| Form field helper (phone) | "We'll text or call within 24 hours." (under the phone field) | Body size, brand-black. |
| TCPA consent checkbox label | "I agree A2C Logistics CO. may contact me by phone, SMS, or email about driving opportunities. Up to 4 messages per month. Standard message rates apply. Reply STOP to opt out. Consent is not a condition of employment." | Stamped to constant `tcpa_consent_v1` (CONTEXT D-23; COMP-02). Linked-out: "Privacy" → `/privacy`, "SMS Terms" → `/sms-terms`. Checkbox is **unchecked by default** (positive opt-in only — anti-pattern: pre-checked). |
| Submit button | **Submit application** | Primary CTA size; full-width on mobile, auto-width on `sm:` and up. Loading state: **Submitting…** (button is `aria-busy="true"`, `disabled`). |
| Validation error — single field | "{Field name} is required." OR "{Field name} doesn't look right — try again." (no exposing of regex internals) | Inline below field, brand-red Label-size 14px/600. |
| Empty state — no testimonials yet (Phase-2 component, but its empty-state copy contract is set here for Phase-2 consumption) | Heading: **Driver stories coming soon.** Body: **We're collecting testimonials from current A2C drivers. Want to talk to one before applying? Call us: (XXX) XXX-XXXX.** | TRUST-02 lands the component in Phase 2; Phase 1 locks the copy contract so the planner doesn't reinvent it. |
| Empty state — pay numbers pending (Phase 1, used if A2C-supplied numbers aren't ready by ship per CONTEXT D-11) | Heading: **Pay details — call to discuss.** Body: **We're updating our published pay tables. For current owner-operator splits and company driver CPM, call our recruiter: (XXX) XXX-XXXX.** No "competitive" or "top earners" language. | Renders in place of the pay table when `pay.ts` flag is unset. |
| Error state — form submit failure (network, server, sink) | Heading: **Something went wrong on our end.** Body: **Your application didn't go through. The fastest way to reach us right now is to call (XXX) XXX-XXXX or text START to that same number. Or try submitting again.** Two CTAs: **Call now** (filled red) and **Try again** (transparent border). | Source: CONTEXT specifics §"Failure-state UX" — never a dead end. |
| Apply success page | Heading: **Got it. We'll be in touch.** Body: **A recruiter will text or call you within 24 hours. If you'd rather start the conversation now: (XXX) XXX-XXXX.** Single CTA: **Call (XXX) XXX-XXXX** (filled red). Also displays the Driven-to-be-different. tagline in Display type below the fold. | FUNNEL-05; CONTEXT D-22. `noindex` per SEO-07. |
| Draft banner (privacy/sms-terms/eeo) | **Draft — pending counsel review.** This document is in draft and being reviewed by legal counsel. Final version ships at launch. | Top of every compliance page. brand-gray `#D9D9D9` background, brand-black text, full-width band. CONTEXT D-35; COMP-06 deferred to Phase 3. |
| 404 page | Heading: **That page doesn't exist.** Body: **Looks like you took a wrong turn. Try the apply form, or head back to pay details.** Two CTAs: **Apply** (filled red) → `/apply`; **See pay** (transparent border) → `/pay/owner-operator`. | SITE-07. |
| Honeypot field label (visually hidden) | "Website" with `aria-hidden="true" tabindex="-1" autocomplete="off"` and `position: absolute; left: -9999px;` | CONTEXT D-27. Bots fill it; humans don't see it. |

**Destructive actions in Phase 1:** None. The form is the only state-mutating surface and submission is constructive (creates a lead). No delete/archive/cancel flows. `Destructive` row in copy contract is therefore intentionally absent — no confirmation modal needed in Phase 1.

---

## Interaction Contracts (Phase-1 specific)

### Pill Toggle (OO ↔ Company)

| Property | Value |
|----------|-------|
| Visual | Two pills side by side. Selected = `bg-brand-red text-brand-white border-brand-red`. Unselected = `bg-transparent text-brand-black border border-brand-black`. Both: `rounded-full px-6 py-3 min-h-11 text-sm font-semibold`. |
| Behavior on `/pay/*` | Click navigates to the other route via anchor `<a href>` (NOT a button + `onClick`). Astro static; zero JS for the navigation itself. |
| Behavior on `/apply` | Click toggles a hidden `<input name="role">` value AND updates the URL via History API (so refresh preserves) AND writes to `localStorage`. This is the only place the pill needs an `onClick` handler. Implemented as a vanilla-TS island (NOT React) per CONTEXT D-08. |
| Persistence | On click, write `localStorage.setItem('a2c.pay.role', 'owner-operator' \| 'company')`. On every page mount in the layout shell, read this value; if `/pay` is hit (which 308s to OO by default), the redirect target reads localStorage server-side via header echo? **No** — Cloudflare 308 is static; persistence applies on the client side only after first visit (the toggle pill renders the saved selection as "selected" on subsequent visits). Acceptable per CONTEXT D-08. |
| Accessibility | `aria-pressed` reflects state on the active pill; `aria-label="Pay for owner-operators"` and `"Pay for company drivers"` on each. Tab order: header CTA → toggle Owner-Op pill → toggle Company pill → first heading. |

### Form (Apply)

| Property | Value |
|----------|-------|
| Layout | Single screen, vertical stack. No multi-step. No accordion. No conditional reveal. All 9 form controls (6 free-input + role selector + state dropdown + TCPA checkbox) visible from the start (Pitfall 12). |
| Mobile field order | Role pill → First name → Last name → Phone (`type=tel inputmode=tel autocomplete=tel`) → Email (`type=email inputmode=email autocomplete=email`) → CDL class (Select: A) → Years driving (Select on desktop / segmented control on mobile per CONTEXT discretion list) → Current state (native `<select>` of 50 + DC) → TCPA consent checkbox → Submit button. |
| Validation | Conform + Zod. Inline error appears on field blur (NOT on every keystroke). On submit attempt, all errors render inline + scroll to first invalid field. |
| Submit states | (1) Idle: Submit application button enabled. (2) Submitting: button text "Submitting…", `aria-busy="true"`, disabled, no spinner icon (zero-JS-island-friendly — text change is enough). (3) Success: client-side navigation to `/apply/success`. (4) Error: error banner inserted above the form (anchored to top of form, scroll-into-view), see error-state copy above. |
| Native fallback | Form `<form method="POST" action="/_actions/apply">` works without JS. Server-side validation re-runs the Zod schema; on error, server re-renders `/apply` with the error banner + field errors echoed inline. |
| Honeypot | `<input name="website">` rendered offscreen with the visually-hidden CSS pattern in CONTEXT D-27. Bot-filled submissions return 200-OK silently (no tip-off) but never dispatch. |
| Turnstile | Invisible `@marsidev/react-turnstile` widget in the React island; on native fallback (no JS) the form still posts and the server returns a "please enable JS or call us" error with the recruiter `tel:`/`sms:` — zero-JS users still get to a recruiter (CONTEXT specifics §"Failure-state UX"). |
| Idempotency UX | Double-tap submit on flaky wifi: client generates a `crypto.randomUUID()` once on form mount, sends with submission, server dedupes for 10 minutes via KV (CONTEXT D-18). User sees the same success state both times. |

### Header (Layout shell)

| Property | Value |
|----------|-------|
| Height | 56px on mobile, 64px on `md:` and up. Sticky on scroll (`sticky top-0 z-50`). |
| Background | brand-white, no shadow at scroll position 0; on scroll past 16px, add `border-b border-brand-black/10` (no drop shadow — flat brand). Solid background at all times for legibility. |
| Layout | Logo (left, `logo-primary.svg`) · spacer · `Call: (XXX) XXX-XXXX` text-link (`hidden md:inline-flex`, semibold 14px, brand-black) · `Apply` button (filled red, always visible). On mobile, the recruiter `tel:` becomes a phone-icon-only button with `aria-label="Call recruiter"` to preserve real-estate. |
| No mobile menu in Phase 1 | Phase-1 routes (`/pay/owner-operator`, `/pay/company`, `/apply`, plus footer-only `/privacy`, `/sms-terms`, `/eeo`) don't justify a hamburger. Pay routes navigate via the in-page pill toggle. Compliance pages reach via footer. Apply via the persistent header CTA. Re-evaluate when Phase 2 lands home/about/equipment/family. |

### Footer (Layout shell)

| Property | Value |
|----------|-------|
| Background | brand-black, brand-white text. |
| Padding | `py-12 px-4` mobile, `py-16 px-16` desktop. |
| Layout | Three columns on `md:` and up; stacked on mobile in this order: (1) Logo inverse + tagline "Driven to be different." (Display size, brand-white). (2) Recruiter contact: `Call (XXX) XXX-XXXX` and `Text (XXX) XXX-XXXX` (both `tel:` / `sms:` `min-h-11` link blocks, brand-white text). (3) Compliance links: `Privacy`, `SMS Terms`, `EEO Statement` (Label size, brand-white). |
| Bottom band | brand-black, brand-gray `text-brand-gray/70` text: `MC# {pending} · USDOT# {pending}` · `300 S. Cotner Blvd, Lincoln, NE` · `© 2026 A2C Logistics CO.` Stacked on mobile. |

---

## Color

(Already declared above under "Color" — repeated table omitted to avoid duplication. The 60/30/10 split is locked, accent reserved-for list is exhaustive, destructive uses the same accent token.)

---

## Copywriting Contract

(Already declared above under "Copywriting Contract" — exhaustive table covers every Phase-1 surface.)

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official (`@shadcn`) | `button`, `input`, `label`, `select`, `checkbox`, `form` | not required — official registry |
| third-party | none declared | not applicable |

**No third-party registries are used in Phase 1.** All component primitives come from the shadcn official registry via the Astro template (CONTEXT D-03). The `Phase-1 components installed` row of "Design System" defines the exhaustive list. Adding any third-party block in Phase 1 requires re-running the registry vetting gate per gsd-ui-researcher protocol (`npx shadcn view {block} --registry {url}` + scan for `fetch(`, `process.env`, `eval(`, `Function(`, dynamic imports from external URLs, obfuscated identifiers).

---

## Performance & Accessibility (Phase-1 floor; Phase-3 enforces in CI)

| Property | Phase-1 floor | Source |
|----------|---------------|--------|
| Mobile body min-size | 16px | FEATURES Mobile patterns |
| Touch target min | 44×44px | FEATURES Mobile patterns + WCAG AA |
| Focus ring | 2px solid brand-black with 2px offset on every interactive element (no `outline: none` anywhere) | SITE-05 prep |
| `prefers-reduced-motion` | Honored — no transitions on toggle/submit on the reduced-motion media query (zero animations in Phase 1 anyway) | Pitfall 14 |
| Color contrast | AA on every text/background pair (verified in this contract above) | SITE-05 |
| Keyboard navigation | Full tab order: skip-to-main link → header logo → recruiter tel → header Apply CTA → main content → footer | SITE-05 |
| First-load JS | < 200 KB gzipped (basic CI guard in Wave 5; Lighthouse gate Phase 3) | SITE-04 + CONTEXT D-40 |
| CLS on font swap | Eliminated via fallback metric overrides (`size-adjust`, `ascent-override`, `descent-override`) declared in `@font-face` | Pitfall 13 |
| `font-display` | `swap` on every face | Pitfall 13 |

---

## Source Inventory

| Decision class | Where it lives |
|----------------|----------------|
| Color palette (brand-white/black/red/gray exact hex) | `/Users/alexandercostea/Downloads/A2C_Snaphot_Final (1).pdf` page 1 + REQUIREMENTS BRAND-01 + CONTEXT D-31 |
| Typography (Nevis Bold display, Avenir body) | Same snapshot PDF + REQUIREMENTS BRAND-02/03 + CONTEXT D-32/D-33 |
| Logo variants (primary black, primary white) | Snapshot PDF "Original Primary Logo" + "Primary (Black)" + "Primary (White)" + REQUIREMENTS BRAND-04 + CONTEXT D-34 |
| Tagline "Driven to be different." | Snapshot PDF "Brand Applications" + PROJECT.md |
| Pill-toggle visual spec (filled red selected, transparent unselected border) | CONTEXT specifics §"OO/Company toggle UX" |
| TCPA consent constant `tcpa_consent_v1` | CONTEXT D-23 |
| Form field whitelist (no SSN/MVR/DOB/etc.) | CONTEXT D-21; COMP-01/07 |
| Failure-state UX (recruiter tel/sms always available) | CONTEXT specifics §"Failure-state UX" |
| Pay number `effective` date format | CONTEXT D-09; PAY-05 |
| Banned-phrase list ("family", "competitive", "top earners", "freight") | Pitfall 9; Pitfall 19; PROJECT brand voice |
| Pre-checked checkbox anti-pattern | CONTEXT D-23; Pitfall 4 |
| 56/64px header height | Pitfall 6 ("sticky header that covers half the screen") + standard mobile pattern |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
