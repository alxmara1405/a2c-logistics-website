# Architecture Research

**Domain:** SEO-first, MDX-driven, mobile-fast carrier driver-recruiting site (single-brand, content-marketing pattern)
**Researched:** 2026-05-04
**Confidence:** HIGH for framework patterns (Context7 verified). MEDIUM for trucking-domain page-set conventions (informed by competitor patterns and PROJECT.md, no industry standard exists).

---

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                         CONTENT LAYER (in-repo)                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐      │
│  │ MDX pages  │  │ MDX frags  │  │ data/*.ts  │  │  /public   │      │
│  │ (story,    │  │ (testimon, │  │ (pay nums, │  │  /assets   │      │
│  │  about)    │  │  faqs, eq) │  │  metros,   │  │ (img/font) │      │
│  │            │  │            │  │  family)   │  │            │      │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘      │
│        │               │               │               │              │
│        ▼               ▼               ▼               ▼              │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │  Schema validation (Zod) — frontmatter + data files typed    │    │
│  └──────────────────────────────────────────────────────────────┘    │
├──────────────────────────────────────────────────────────────────────┤
│                          RENDER LAYER (SSG)                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Layout   │  │ Page     │  │ MDX      │  │ Section  │             │
│  │ (Header, │  │ routes   │  │ provider │  │ blocks   │             │
│  │  Footer) │  │ (/, /pay)│  │ (custom  │  │ (Hero,   │             │
│  │          │  │          │  │  comps)  │  │  Stats…) │             │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘             │
│       └──────┬──────┴─────────────┴──────┬──────┘                    │
│              ▼                            ▼                           │
│  ┌────────────────────────┐    ┌──────────────────────────┐          │
│  │  Static HTML at build  │    │  Client islands (toggle, │          │
│  │  (every page, prerender│    │   sticky CTA, form,      │          │
│  │  + sitemap.xml + RSS)  │    │   accordion)             │          │
│  └────────────────────────┘    └──────────────────────────┘          │
├──────────────────────────────────────────────────────────────────────┤
│                       FORM HANDLER (server-only)                      │
│                                                                       │
│  Browser ──POST──▶ /api/apply (Node runtime, edge-compatible)        │
│                          │                                            │
│                          ├──▶ Zod validate (server reuse of schema)  │
│                          ├──▶ Honeypot + rate-limit check            │
│                          ├──▶ Resend.emails.send (recruiting@…)      │
│                          ├──▶ Sheet/Airtable adapter (background)    │
│                          └──▶ JSON { ok, leadId } back to client     │
├──────────────────────────────────────────────────────────────────────┤
│                       INTEGRATIONS (sinks)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │
│  │ Resend (or   │  │ Google Sheets│  │ Plausible /  │                │
│  │ Postmark)    │  │ or Airtable  │  │ GA4 (page +  │                │
│  │ → recruiter  │  │ → pipeline   │  │  conversion) │                │
│  └──────────────┘  └──────────────┘  └──────────────┘                │
└──────────────────────────────────────────────────────────────────────┘
```

**Key architectural commitments:**
1. **Static-first.** Every page that does not require live data is prerendered at build (SSG). The form handler is the only dynamic surface.
2. **Content is data.** MDX + typed data files are the source of truth; the render layer is a thin presentational shell.
3. **Toggle is URL state, not component state.** The OO ↔ Company toggle is reflected in the URL (path or query), so each variant is shareable, indexable, and survives a refresh.
4. **Form handler is pluggable.** Email sink and pipeline sink (Sheet/Airtable) sit behind an adapter interface so a future ATS (Tenstreet/DriverReach) drops in without touching the form UI.

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Root layout** | Header, footer, fonts, analytics, global CSS, viewport meta | `app/layout.tsx` (Next) or `src/layouts/Base.astro` (Astro) |
| **Header** | Logo, nav, sticky persistent "Apply" CTA (always visible on mobile) | Server component / `.astro`; CTA is plain `<a href="/apply">` |
| **Footer** | Family-brand links, legal, address, EEOC disclaimer | Server component, fully static |
| **Page route** | One file per URL; reads MDX + data, composes section blocks | `app/<route>/page.tsx` / `src/pages/<route>.astro` |
| **MDX provider** | Maps MDX tag names → branded React components globally | `mdx-components.tsx` (Next) / `<Content components={...} />` (Astro) |
| **Section block** | Self-contained marketing block (Hero, StatRow, Testimonial, FAQ) | Reusable component, server-rendered, no client JS unless interactive |
| **Toggle island** | Reads URL search param or path, swaps payload, updates URL on change | Client component (`'use client'`) / Astro `client:load` |
| **Apply form island** | Validates client-side, POSTs to `/api/apply`, renders success state | Client component with `useFormStatus` (Next) or vanilla `<script>` (Astro) |
| **Form handler** | Server-only: Zod validate → email + sheet → JSON response | Route handler `app/api/apply/route.ts` / Astro action `src/actions/apply.ts` |
| **Adapter layer** | Abstract `LeadSink` interface; concrete `EmailSink`, `SheetSink`, future `ATSSink` | `lib/sinks/*.ts` |
| **Schema** | Zod schemas for frontmatter, pay data, lead form input | `lib/schemas.ts` — single source for both client and server |

---

## Recommended Project Structure

### Next.js (App Router) — Primary recommendation

```
a2c-logistics-website/
├── app/                            # routes, colocated, all server components by default
│   ├── layout.tsx                  # root layout (header, footer, fonts, analytics)
│   ├── page.tsx                    # home (/)
│   ├── about/
│   │   └── page.tsx                # /about — story, founder, values (MDX import)
│   ├── pay/
│   │   ├── layout.tsx              # shared toggle UI for both variants
│   │   ├── page.tsx                # /pay — redirects to /pay/owner-operator (default)
│   │   ├── owner-operator/
│   │   │   └── page.tsx            # /pay/owner-operator (SSG, indexable)
│   │   └── company/
│   │       └── page.tsx            # /pay/company (SSG, indexable)
│   ├── equipment/
│   │   └── page.tsx                # /equipment — fleet/truck program
│   ├── apply/
│   │   ├── page.tsx                # /apply — quick-apply form
│   │   └── success/
│   │       └── page.tsx            # /apply/success — confirmation, calendar link
│   ├── family/
│   │   └── page.tsx                # /family — sister-brand ecosystem
│   ├── faq/
│   │   └── page.tsx                # /faq — driver questions, MDX-driven
│   ├── contact/
│   │   └── page.tsx                # /contact — phone, address, map, recruiter direct
│   ├── jobs/                       # OPTIONAL — programmatic SEO (defer to phase 3+)
│   │   └── [state]/
│   │       └── [city]/
│   │           └── page.tsx        # /jobs/ne/lincoln, generated from data/metros.ts
│   ├── privacy/page.tsx
│   ├── terms/page.tsx
│   ├── api/
│   │   ├── apply/route.ts          # POST handler — Zod, email, sheet
│   │   └── revalidate/route.ts     # optional ISR webhook (TinaCMS / sheet edit)
│   ├── sitemap.ts                  # next/sitemap built-in convention
│   ├── robots.ts                   # next/robots built-in convention
│   ├── opengraph-image.tsx         # OG image generator (built-in)
│   └── not-found.tsx               # 404
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── StickyApplyCTA.tsx      # mobile-bottom-bar persistent CTA
│   ├── sections/                   # reusable marketing blocks
│   │   ├── Hero.tsx
│   │   ├── StatRow.tsx
│   │   ├── TestimonialCard.tsx
│   │   ├── TestimonialCarousel.tsx
│   │   ├── PayCard.tsx
│   │   ├── PayTable.tsx            # used inside MDX
│   │   ├── PayToggle.tsx           # client island
│   │   ├── DriverQuote.tsx         # used inside MDX
│   │   ├── SisterBrandCard.tsx
│   │   ├── EcosystemDiagram.tsx
│   │   ├── FAQAccordion.tsx        # client island
│   │   ├── CTAStrip.tsx
│   │   └── EquipmentGrid.tsx
│   ├── form/
│   │   ├── ApplyForm.tsx           # client island, useFormStatus
│   │   ├── ApplyFormFields.tsx
│   │   ├── ApplySuccess.tsx
│   │   └── FieldError.tsx
│   └── ui/                         # primitive components (button, input, label)
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Select.tsx
├── content/                        # MDX content (the editorial surface)
│   ├── pages/
│   │   ├── home.mdx                # composable hero + body for /
│   │   ├── about.mdx               # founder story
│   │   ├── pay-owner-operator.mdx  # OO-specific narrative + <PayTable />
│   │   ├── pay-company.mdx         # company-specific narrative + <PayTable />
│   │   ├── equipment.mdx
│   │   ├── family.mdx
│   │   └── faq.mdx
│   ├── testimonials/
│   │   ├── jamal-r.mdx             # frontmatter: name, truck, years, photo
│   │   └── miguel-s.mdx
│   ├── faqs/                       # one MDX per Q (keeps git diffs clean)
│   │   ├── pay-cadence.mdx
│   │   ├── home-time.mdx
│   │   └── lease-terms.mdx
│   ├── sister-brands/
│   │   ├── lttr.mdx
│   │   ├── lts.mdx
│   │   ├── dp.mdx
│   │   └── otts.mdx
│   └── legal/
│       ├── privacy.mdx
│       └── terms.mdx
├── data/                           # typed structured data (NOT prose)
│   ├── pay.ts                      # CPM/%-split numbers; quarterly updates
│   ├── benefits.ts                 # health/PTO/401k for company drivers
│   ├── equipment.ts                # truck specs
│   ├── metros.ts                   # target cities for /jobs/[state]/[city]
│   ├── nav.ts                      # nav items (single source for header + footer + sitemap)
│   └── family.ts                   # sister-brand metadata (logo path, url, tagline)
├── lib/
│   ├── schemas.ts                  # Zod: LeadSchema, TestimonialFrontmatter, PaySchema
│   ├── mdx.ts                      # parse helpers, frontmatter validation
│   ├── seo.ts                      # generateMetadata helpers, JSON-LD builders
│   ├── sinks/
│   │   ├── index.ts                # LeadSink interface, dispatch fan-out
│   │   ├── email.ts                # Resend adapter
│   │   ├── sheet.ts                # Google Sheets adapter
│   │   └── airtable.ts             # Airtable adapter (optional)
│   ├── analytics.ts                # Plausible/GA4 helpers (no PII)
│   └── env.ts                      # typed env access (zod-env)
├── styles/
│   ├── globals.css                 # Tailwind 4 entry + @theme tokens
│   └── fonts.ts                    # next/font Nevis Bold + Avenir
├── public/
│   ├── images/                     # static hero/marketing imagery
│   ├── brand/                      # logos (a2c, lttr, lts, dp, otts)
│   ├── drivers/                    # testimonial portraits
│   └── og/                         # default OG fallback
├── mdx-components.tsx              # global MDX → React component map
├── next.config.ts                  # MDX plugin, redirects, image domains
├── tailwind.config.ts              # only if needed; Tailwind 4 prefers CSS-first
├── tsconfig.json                   # paths: @/* → ./*
├── .env.example                    # documents required secrets
└── package.json
```

### Astro variant (if interactivity stays minimal)

Same `content/`, `data/`, `lib/`, `public/` layout. Differences:
- `app/` becomes `src/pages/` (file-based router)
- `components/` becomes `src/components/` with `.astro` files instead of `.tsx` for non-interactive blocks
- `mdx-components.tsx` becomes per-page `<Content components={...} />` or a thin wrapper layout
- `app/api/apply/route.ts` becomes `src/actions/apply.ts` (Astro Actions, since v4) or `src/pages/api/apply.ts` (endpoint)
- `next/font` becomes `astro:assets` `<Font />` (added 2025) or self-hosted `@font-face`

### Structure Rationale

- **`content/` separate from `app/`:** Content is the editorial surface, routes are the developer surface. Separating them lets a non-developer (or TinaCMS) edit `content/` without touching anything in `app/`. It also lets one MDX file feed multiple routes (e.g., a testimonial appears on `/`, `/about`, and `/pay/owner-operator`).
- **`data/` separate from `content/`:** Prose changes infrequently and is paragraph-shaped. Numbers (pay, benefits) change quarterly and are table-shaped. Keeping them in `.ts` files gives type safety, single-source updates, and zero MDX parsing overhead.
- **`pay/owner-operator` and `pay/company` as physical routes:** SEO trumps DRY here (see Pattern 1 below). The shared `pay/layout.tsx` wraps both with the toggle UI, so duplication is the MDX content only — which is the *point* (the two narratives differ).
- **`api/` colocated with routes:** Single deploy, one CI/CD path, the form handler ships with the site. No separate backend.
- **`lib/sinks/` adapter pattern:** Future ATS swap is a one-file change; tests can use a fake sink; partial-failure handling lives in one place.
- **`mdx-components.tsx` at root (Next convention):** Branded MDX components (`<DriverQuote>`, `<PayTable>`, `<CTAStrip>`) work in *every* MDX file without per-page imports — so a content editor types `<DriverQuote name="…" />` and it just works.

---

## Page-and-Route Map

| Route | Source | MDX? | Toggle? | Form? | SSG? | Notes |
|-------|--------|------|---------|-------|------|-------|
| `/` | `app/page.tsx` + `content/pages/home.mdx` | yes | no (links to `/pay/owner-operator` and `/pay/company`) | embedded mini-form (name + phone) → `/apply` | yes | Hero, 3-stat row, story tease, family teaser, testimonial carousel, CTA strip |
| `/about` | `app/about/page.tsx` + `content/pages/about.mdx` | yes | no | CTA only | yes | Founder photo + story, three values, "what it's actually like" |
| `/pay` | `app/pay/page.tsx` | no | n/a | no | yes (308 redirect to `/pay/owner-operator`) | Default landing, sets canonical |
| `/pay/owner-operator` | `app/pay/owner-operator/page.tsx` + `content/pages/pay-owner-operator.mdx` + `data/pay.ts` | yes | yes (active=OO) | CTA only | yes | OO narrative, settlement %, fuel card, truck program; canonical to self |
| `/pay/company` | `app/pay/company/page.tsx` + `content/pages/pay-company.mdx` + `data/pay.ts` + `data/benefits.ts` | yes | yes (active=company) | CTA only | yes | W2 narrative, CPM, health/PTO/401k; canonical to self |
| `/equipment` | `app/equipment/page.tsx` + `content/pages/equipment.mdx` + `data/equipment.ts` | yes | no | CTA only | yes | Truck specs grid, maintenance program (LTTR cross-link) |
| `/apply` | `app/apply/page.tsx` | no | no | YES (full form) | yes (form is client island) | Quick-apply: 6 fields, OO/Company radio, optional callback time |
| `/apply/success` | `app/apply/success/page.tsx` | yes | no | no | yes | "Recruiter will call within 24h", calendar link, OTTS YouTube cross-link |
| `/family` | `app/family/page.tsx` + `content/pages/family.mdx` + `data/family.ts` + `content/sister-brands/*.mdx` | yes | no | CTA only | yes | Ecosystem diagram, four brand cards, driver journey |
| `/faq` | `app/faq/page.tsx` + `content/faqs/*.mdx` | yes (multiple) | no | CTA only | yes | One MDX per Q; render with `<FAQAccordion>`; emit FAQPage JSON-LD |
| `/contact` | `app/contact/page.tsx` | no | no | no (just phone/email links) | yes | Recruiter direct line, address, hours, embedded map |
| `/privacy` | `app/privacy/page.tsx` + `content/legal/privacy.mdx` | yes | no | no | yes | |
| `/terms` | `app/terms/page.tsx` + `content/legal/terms.mdx` | yes | no | no | yes | |
| `/jobs/[state]/[city]` | `app/jobs/[state]/[city]/page.tsx` + `data/metros.ts` | optional template | no | CTA only | yes (`generateStaticParams`) | **DEFER to phase 3+.** Programmatic SEO; see Pattern 4 for spam threshold. |
| `/api/apply` | `app/api/apply/route.ts` | no | n/a | handler | n/a | POST only, Zod validate, fan-out to email + sheet |
| `/sitemap.xml` | `app/sitemap.ts` | no | n/a | no | yes | Auto-generated from route + content collection |
| `/robots.txt` | `app/robots.ts` | no | n/a | no | yes | Allow all, point to sitemap |

**Optional routes to evaluate later:**
- `/refer` — driver referral landing (if a referral bonus program launches)
- `/podcast` or `/youtube` — if A2C wants its own content hub vs. cross-linking OTTS
- `/blog` — explicitly out of scope per PROJECT.md (OTTS owns content)

---

## Architectural Patterns

### Pattern 1: OO ↔ Company Toggle as Physical Routes (URL-driven)

**What:** The toggle swaps between `/pay/owner-operator` and `/pay/company` — two real, prerendered pages — rather than a single `/pay?type=oo` page or a single `/pay` page with client-only state.

**When to use:** Any time a UI toggle changes content significantly *and* both variants are independently valuable to share, link, or rank for.

**Trade-offs:**

| Approach | SEO | Shareable | Refresh-safe | Build cost | DRY | Verdict |
|----------|-----|-----------|--------------|------------|-----|---------|
| Two physical routes (`/pay/owner-operator`, `/pay/company`) | ✓ each ranks for distinct queries ("owner operator pay Nebraska" vs "company driver pay Nebraska") | ✓ link is unambiguous | ✓ | low (2 pages) | shared layout + components, MDX differs | **RECOMMENDED** |
| One route + query param (`/pay?type=oo`) | △ Google often dedupes `?type=` variants; canonical cannot point to both | △ shareable but stripped by some chats/SMS | ✓ if SSR reads `searchParams` | low | high | OK fallback if rebuild cost is high |
| One route + client state | ✗ default content only is indexed; second variant is invisible to crawlers | ✗ not shareable | ✗ resets on refresh | lowest | highest | **AVOID** for SEO-critical content |

**Recommended implementation:**
- Two routes, shared `pay/layout.tsx` (header copy + `<PayToggle>` UI)
- `<PayToggle>` is a client component that renders two `<Link>` elements; on click it `router.push()`-es to the other route — no client state needed
- `/pay` itself is a 308 redirect to `/pay/owner-operator` (the default per PROJECT.md, but easily flippable)
- Each route sets `metadata.alternates.canonical` to itself — never to the other variant

**Example:**
```typescript
// app/pay/layout.tsx
import { PayToggle } from '@/components/sections/PayToggle'

export default function PayLayout({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <PayToggle />
      {children}
    </section>
  )
}

// app/pay/owner-operator/page.tsx
import OOContent from '@/content/pages/pay-owner-operator.mdx'
import { pay } from '@/data/pay'

export const metadata = {
  title: 'Owner-Operator Pay | A2C Logistics CO.',
  alternates: { canonical: '/pay/owner-operator' },
}

export default function Page() {
  return <OOContent pay={pay.ownerOperator} />
}
```

**Why not query params?** Even with `searchParams` SSR'd in Next App Router, Google treats `/pay`, `/pay?type=oo`, and `/pay?type=company` as a single canonical with parameter variation — only one ranks. Two routes guarantees both rank for their distinct intent queries.

---

### Pattern 2: MDX-as-Content + Data-as-Numbers Split

**What:** Long-form prose (story, FAQ answers, testimonial quotes) lives in MDX. Structured numeric/tabular data (CPM rates, benefit dollar amounts, fuel-card percentages, target metros) lives in `.ts` data files. MDX *imports* numbers from data files via custom components, never inlines them.

**When to use:** Any site where some content is paragraph-shaped (changes rarely, edited by non-devs) and other content is table-shaped (changes on a cadence, must be consistent across multiple pages).

**Trade-offs:**
- Pro: a quarterly pay update is one-file (`data/pay.ts`); both pay routes refresh automatically
- Pro: type safety on numbers (you can't accidentally type "$0.62 per mole")
- Pro: same number can appear on home hero, pay page, and PDF without drift
- Con: non-devs can't edit numbers without touching code (mitigated by TinaCMS schema for `data/*.json` if needed, or PR review)
- Con: small mental overhead — "is this MDX or data?"

**Example:**
```typescript
// data/pay.ts
import { z } from 'zod'

export const PaySchema = z.object({
  ownerOperator: z.object({
    settlementPercent: z.number(),    // 0.78
    fuelCardDiscount: z.string(),     // "$0.45/gal off retail"
    fastPayDays: z.number(),           // 1
    signOnBonus: z.number().optional(),
  }),
  company: z.object({
    cpmMin: z.number(),                // 0.58
    cpmMax: z.number(),
    detentionPerHour: z.number(),
    healthEffectiveDays: z.number(),
  }),
})

export const pay = PaySchema.parse({
  ownerOperator: { settlementPercent: 0.78, fuelCardDiscount: '$0.45/gal off retail', fastPayDays: 1 },
  company: { cpmMin: 0.58, cpmMax: 0.72, detentionPerHour: 25, healthEffectiveDays: 60 },
})
```

```mdx
{/* content/pages/pay-owner-operator.mdx */}
You keep <PercentBadge value={pay.ownerOperator.settlementPercent} /> of every load.
Settlements hit your account in <PayCadence days={pay.ownerOperator.fastPayDays} />.

<PayTable plan="ownerOperator" />
```

---

### Pattern 3: Form Handler with Pluggable Sinks + Partial-Failure Tolerance

**What:** The `/api/apply` route is thin: validate input, then fan out to a list of `LeadSink` adapters. Each sink reports success or failure independently. The user-facing response succeeds if **email succeeds** (the recruiter must hear about the lead); sheet/Airtable failures are logged and retried but never block the response.

**When to use:** Any form that writes to multiple downstream systems where one is "must succeed for business value" and others are "nice to have for ops."

**Trade-offs:**
- Pro: a Sheets API outage doesn't make the form look broken
- Pro: future ATS integration is one new sink, zero changes to the form
- Pro: each sink is independently testable
- Con: requires a logging/alerting strategy for "silent" sheet failures (use a structured error log + a daily reconciliation job, or write failures to a fallback queue)

**Example:**
```typescript
// lib/sinks/index.ts
export interface LeadSink {
  name: string
  send(lead: Lead): Promise<{ ok: true } | { ok: false; error: string }>
  required: boolean   // if true, failure rejects the whole request
}

export async function dispatchLead(lead: Lead, sinks: LeadSink[]) {
  const results = await Promise.allSettled(
    sinks.map(async (s) => ({ sink: s.name, result: await s.send(lead), required: s.required })),
  )
  const requiredFailures = results.filter(
    (r) => r.status === 'fulfilled' && r.value.required && !r.value.result.ok,
  )
  // Log non-required failures to console / Sentry for ops
  results.forEach((r) => {
    if (r.status === 'fulfilled' && !r.value.result.ok && !r.value.required) {
      console.error(`[sink:${r.value.sink}] non-blocking failure:`, r.value.result.error)
    }
  })
  return { ok: requiredFailures.length === 0, results }
}
```

```typescript
// app/api/apply/route.ts
import { LeadSchema } from '@/lib/schemas'
import { dispatchLead } from '@/lib/sinks'
import { emailSink } from '@/lib/sinks/email'
import { sheetSink } from '@/lib/sinks/sheet'

export const runtime = 'nodejs' // see Pattern 5

export async function POST(request: Request) {
  const formData = await request.formData()
  const parsed = LeadSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return Response.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 })
  }
  // Honeypot: if a hidden 'company_url' field is filled, drop silently
  if (formData.get('company_url')) return Response.json({ ok: true })

  const result = await dispatchLead(parsed.data, [
    { ...emailSink, required: true },
    { ...sheetSink, required: false },
  ])
  return Response.json(result, { status: result.ok ? 200 : 500 })
}
```

---

### Pattern 4: Programmatic SEO Landing Pages (with restraint)

**What:** Auto-generate `/jobs/[state]/[city]` pages from a curated JSON of target metros, using a shared MDX template that interpolates city/state-specific facts.

**When useful (genuinely, not spammy):**
- Each page has at least 250–400 words of *unique* content (not just `{city}` swapped into a paragraph)
- Each page references local realities: nearby terminals, common lanes ("I-80 east from Lincoln to Chicago"), local DOT specifics, regional pay variation
- Each page has a clear conversion path (the same apply form, but pre-filled with the city)
- The metro list is curated (10–50 cities), not generated from every Census place name
- Internal linking is sensible: a `/jobs/ne/lincoln` page links to `/jobs/ne/omaha` and `/jobs/ia/des-moines`, not to 500 cities

**When it becomes spammy (Google penalizes):**
- Identical template with only city name swapped
- More than ~100 city pages without unique content per page
- No internal linking structure (orphan pages)
- Targeting cities A2C does not actually serve

**Recommendation:** **Defer to a phase 3+ initiative.** Launch with metros excluded; add `/jobs/[state]/[city]` only after the rest of the site is shipped and there is real content (lane data, local recruiter notes) for each metro. The framework supports it cheaply (`generateStaticParams` over `data/metros.ts`); the *content* is the expensive part.

**Trade-offs:**
- Pro: long-tail SEO captures "owner operator jobs lincoln ne" and similar
- Pro: each page is a focused conversion landing
- Con: real content is expensive; thin pages hurt the whole site's rankings
- Con: needs ongoing maintenance (closed terminals, expired pay rates)

---

### Pattern 5: Node Runtime for the Form Handler (not Edge)

**What:** Run `/api/apply` on the Node runtime, not Edge.

**Reasoning:**
- The Resend SDK and Google Sheets API client both use Node-only modules (streams, crypto APIs that differ on Edge)
- Cold starts of ~200–400ms on Node are fine for a form that submits once per session — Edge's sub-50ms latency is irrelevant when the bottleneck is the email API call (300–800ms)
- Edge-runtime constraints (no `fs`, limited crypto, no native modules) eliminate libraries you'll want
- Netlify Functions and Cloudflare Pages Functions both support Node — Cloudflare via the `nodejs_compat` flag

**When to reconsider Edge:** if the form ever needs to run on a CDN edge for sub-100ms response (e.g., for inline validation of a field the moment it loses focus), and if the sinks are rewritten to use Edge-compatible HTTP-only clients (Resend HTTP API, Sheets HTTP API, Airtable HTTP API — all are doable).

---

## Data Flow

### Content Render Flow (build-time)

```
content/**/*.mdx                                    data/*.ts
        │                                                │
        ▼                                                ▼
  Frontmatter + body                            Zod-validated export
        │                                                │
        ▼                                                │
  Zod schema validation (lib/schemas.ts)                │
        │                                                │
        ▼                                                │
  Typed page module (with ESM import)                   │
        │                                                │
        └──────────────┬─────────────────────────────────┘
                       ▼
              Server component renders page
                       │
                       ▼
              Section blocks compose layout
                       │
                       ▼
        Static HTML + sitemap + RSS at build
                       │
                       ▼
        CDN edge (Netlify / Cloudflare Pages)
                       │
                       ▼
                   Browser
```

### Form Submission Flow (runtime)

```
[Driver fills form on /apply]
       │
       ▼
[ApplyForm client island]
       │  (client-side Zod validation for instant feedback)
       │
       ▼
POST /api/apply (multipart or JSON)
       │
       ▼
[Route handler — Node runtime]
       │
       ├──▶ Zod re-validate (server source of truth)
       │
       ├──▶ Honeypot + simple rate-limit (IP + UA hash, in-memory or KV)
       │
       ├──▶ dispatchLead(lead, sinks)
       │         │
       │         ├──▶ emailSink (Resend)  [REQUIRED]
       │         │       └─▶ recruiting@a2clogisticsco.com
       │         │
       │         └──▶ sheetSink (Google Sheets)  [OPTIONAL]
       │                 └─▶ append row to "Pipeline" sheet
       │
       ▼
JSON { ok: true, leadId } → client
       │
       ▼
[ApplyForm renders <ApplySuccess />]
       │
       ▼
router.push('/apply/success')  (gives a real, shareable URL for analytics)
```

**Partial-failure handling:**
- Email fails → response is 500, form shows "couldn't submit, call (XXX) instead" with the recruiter direct line
- Sheet fails, email succeeds → response is 200, error logged to console + Sentry; ops reconciles weekly
- Both succeed → 200 with `leadId`

### State Management

There is no global client state. By design.

- **Toggle state** lives in the URL (path or search param) — see Pattern 1
- **Form state** lives in the form component (`useFormStatus` / `useActionState` in Next 15+, or local `useState` in plain React)
- **Theme/dark mode** is not in scope (brand is dark-on-white, single mode)
- **No Redux, Zustand, Jotai, or context provider tree** — adding one would be a smell on a marketing site

### Key Data Flows

1. **Content → Page:** MDX/data file → Zod parse at build → typed import → server component → static HTML.
2. **Toggle change → URL:** click `<PayToggle>` → `router.push('/pay/company')` → new page renders with new MDX/data.
3. **Form submit → Sinks:** browser POST → Zod validate → fan-out to email + sheet → JSON response → success route.
4. **Pay-number update:** developer/PM edits `data/pay.ts` → commits → preview deploy → merge → production. (Quarterly cadence.)
5. **New testimonial:** non-developer adds `content/testimonials/new-driver.mdx` via TinaCMS or PR → Zod schema enforces frontmatter shape → carousel auto-includes on next build.

---

## Build Order / Dependency Graph

### Wave 0 — Foundation (must complete before any UI work)
- Stack decision (Next App Router vs Astro) — locks framework conventions
- Repo init, package manager, TypeScript, ESLint/Biome
- Tailwind 4 setup with CSS-first `@theme` tokens
- Brand tokens: `#000 / #FFF / #EF392C / #D9D9D9`, font stack (Nevis Bold + Avenir via `next/font` or `astro:assets <Font />`)
- Hosting target chosen (Netlify vs Cloudflare Pages) — affects function runtime, env-var UI, image-CDN options
- Env handling (`lib/env.ts`, `.env.example`)

### Wave 1 — Primitives + Layout (parallel-safe inside the wave)
- `components/ui/*` (Button, Input, Select, Label) — depends only on tokens
- `components/layout/Header.tsx`, `Footer.tsx`, `StickyApplyCTA.tsx` — depends on `data/nav.ts`
- Root layout (`app/layout.tsx`) wiring fonts, header, footer, analytics
- Zod schemas in `lib/schemas.ts` — depend on nothing; everything else depends on these
- MDX provider (`mdx-components.tsx`) with placeholder components

### Wave 2 — Section Blocks (parallel-safe)
- `Hero`, `StatRow`, `CTAStrip`, `TestimonialCard`, `SisterBrandCard`, `PayCard`, `PayTable`, `EquipmentGrid`, `EcosystemDiagram`
- These can all be built and storybook'd in parallel, depend only on `ui/*` and tokens
- `FAQAccordion`, `TestimonialCarousel`, `PayToggle` are client islands — also parallel

### Wave 3 — Form (independent from sections, can run in parallel with Wave 2)
- `LeadSchema` in `lib/schemas.ts` (already exists from Wave 1)
- `lib/sinks/email.ts` (Resend) — needs `RESEND_API_KEY`
- `lib/sinks/sheet.ts` (Google Sheets) — needs service-account JSON
- `app/api/apply/route.ts` handler — depends on schemas + sinks
- `components/form/ApplyForm.tsx` (client island) — depends on schema for client-side validation
- `app/apply/page.tsx` and `app/apply/success/page.tsx`

**Recommendation: build the form handler and form UI EARLY (in Wave 3, in parallel with Wave 2).** Reasoning per PROJECT.md: every page CTA points to `/apply`. If the form is not real, every page integration is mocked. Better to have a working form first (even if styled later) so all CTAs work end-to-end from day one. Polish the form's visual design in a final pass.

### Wave 4 — Pages (after Waves 1–3; pages can be parallelized internally)
**Critical path (blocks others):**
- `/` (home) — depends on Hero, StatRow, TestimonialCarousel, CTAStrip, family teaser
- `/pay/owner-operator` and `/pay/company` — depend on PayToggle, PayTable, PayCard, `data/pay.ts`

**Parallel-safe (each depends only on Waves 1–3):**
- `/about` — Hero + prose + photo
- `/equipment` — EquipmentGrid + prose
- `/family` — SisterBrandCard ×4 + EcosystemDiagram
- `/faq` — FAQAccordion + content collection
- `/contact` — phone/address + map embed
- `/privacy`, `/terms` — MDX import + base layout

### Wave 5 — SEO + Polish (after pages are stable)
- `app/sitemap.ts` — auto-generate from route + content collection
- `app/robots.ts`
- `app/opengraph-image.tsx` (default OG) + per-page OG overrides
- JSON-LD: `Organization`, `JobPosting` (per pay route), `FAQPage` (on `/faq`)
- Lighthouse pass: LCP, CLS, INP audit; image dimensions, font preload, defer non-critical JS
- Accessibility pass: WCAG AA, keyboard nav, focus rings, contrast
- Analytics integration (Plausible or GA4)
- 404 page

### Wave 6 — Optional / Deferred
- TinaCMS overlay (only if non-dev editing demand emerges; not blocking launch)
- `/jobs/[state]/[city]` programmatic SEO (after launch + after metro content is real)
- ATS sink (Tenstreet/DriverReach) when business chooses one

### Dependency rules
- **Tokens block everything visual.** Get `globals.css` `@theme` correct before building any section.
- **Schemas block both content authoring and form work.** Define them first.
- **MDX provider blocks any MDX page.** Wire it up with placeholder components in Wave 1; replace with real components as they're built in Wave 2.
- **Form handler does NOT block page work.** Pages can use the apply form as `<a href="/apply">` until the form is live. Build them in parallel.

---

## Scaling Considerations

A driver-recruiting site does not have a "scale" problem in the conventional sense — traffic is bounded by the size of the trucker workforce searching for jobs (low millions, distributed across hundreds of carrier sites). The interesting axes are *content scale*, *deploy frequency*, and *handling spam*.

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Launch (~1k visits/mo) | Default SSG, single Netlify/Cloudflare site, in-memory rate-limit on form handler is fine |
| Growth (~50k visits/mo, 100s leads/mo) | Add KV-backed rate-limit (Cloudflare KV / Upstash Redis), CAPTCHA on form (hCaptcha or Cloudflare Turnstile), monitor cold-start times |
| Network (~500k visits/mo) | Move sinks to a job queue (Inngest / Cloudflare Queues) so form returns sub-100ms even if Sheets is slow; add an ATS adapter |

### Scaling Priorities

1. **First bottleneck: form spam.** Bots find recruitment forms within weeks. Honeypot + rate-limit at launch; add CAPTCHA when spam exceeds ~5% of submissions.
2. **Second bottleneck: build time as testimonials grow.** Content collections of 100+ MDX files are still sub-10s to build; not a real concern until ~1000+ MDX files (which the site will never have).
3. **Third bottleneck: pay-data update friction.** When numbers change quarterly, the dev path is "edit `data/pay.ts`, commit, deploy." If the recruiting team wants to self-serve, add a TinaCMS schema for the data file or move pay numbers into a small JSON managed by Tina. Defer until requested.

---

## Anti-Patterns

### Anti-Pattern 1: Toggle as client-only state with no URL reflection

**What people do:** A `<button>` flips a `useState` boolean to swap between OO and Company pay. The URL never changes.

**Why it's wrong:**
- Google indexes only the default state; the second variant is invisible
- Users cannot share a link to "company driver pay" — they have to land on default and click
- Refresh resets to default, losing the user's intent
- Analytics cannot track which variant converts better

**Do this instead:** Two physical routes (`/pay/owner-operator`, `/pay/company`) sharing a layout. See Pattern 1.

---

### Anti-Pattern 2: Pay numbers hard-coded in MDX prose

**What people do:** "We pay $0.62 per mile" typed inline in `pay-company.mdx`. Then the same number is also typed in `home.mdx`, the `<Hero>` component, and the metadata description.

**Why it's wrong:**
- Quarterly pay update means a grep-and-pray across the repo
- Inevitable drift: home shows $0.62, pay page shows $0.65, hero shows $0.60
- Driver trust evaporates if a recruiter quotes a different number than the site

**Do this instead:** Single `data/pay.ts` (Zod-validated) imported by every consumer. MDX uses `<PayBadge value={pay.company.cpmMax} />`. One edit, one deploy, every surface updated.

---

### Anti-Pattern 3: Multi-step form for "quick apply"

**What people do:** Driver fills name, clicks Next. Phone, clicks Next. CDL, clicks Next. Drop-off skyrockets.

**Why it's wrong:**
- Per PROJECT.md, the bar is *quick* apply. Multi-step adds friction with zero validation benefit for 6 fields
- Truckers fill forms on a phone in a sleeper berth; every Next click is a defection point
- Server cannot validate progressively without round-trips, which feel slow on truck-stop wifi

**Do this instead:** Single page, single form, six fields stacked vertically, large touch targets, submit button always visible. Optional: keep the embedded mini-form on `/` to two fields (name + phone) that pre-fills the full `/apply` form.

---

### Anti-Pattern 4: Headless CMS for content this small

**What people do:** Spin up Sanity/Contentful/Strapi for ~15 pages of content that change a few times a quarter.

**Why it's wrong:**
- Per PROJECT.md, MDX-in-repo is the chosen path; this anti-pattern documents *why*
- Adds a second system to maintain, monitor, pay for, and recover when its API changes
- Content is now invisible to git (no diff history, no PR review of copy changes)
- The build needs network access to the CMS API; offline iteration breaks

**Do this instead:** MDX in `content/`. If non-dev editing is needed, layer TinaCMS on top — it edits the same MDX files, commits via PR/branch, leaves git as the source of truth.

---

### Anti-Pattern 5: Edge runtime with libraries that need Node

**What people do:** Set `export const runtime = 'edge'` on `/api/apply` because "edge is faster," then discover Resend SDK and Google Sheets client both blow up.

**Why it's wrong:**
- The form's latency floor is the email API call (300–800ms), not the runtime
- Edge has stricter constraints (no `fs`, narrow crypto subset, no native deps); switching libraries to fit is wasted work
- Cold-start improvements at edge are invisible at the user when the bottleneck is upstream

**Do this instead:** Node runtime for the form handler. Edge is right for static-content middleware (geo-redirects, A/B header tags), not for outbound-API workloads.

---

### Anti-Pattern 6: Scaling programmatic SEO too early

**What people do:** Auto-generate 500 `/jobs/[state]/[city]` pages from a Census places list at launch.

**Why it's wrong:**
- Most pages have zero unique content → Google flags the site as low-quality and drops *every* page's rankings
- The `/apply` form gets credited to cities A2C does not serve, creating bad leads
- Sitemap bloats, crawl budget wastes on pages with no value

**Do this instead:** Curate 10–25 metros A2C actually targets. Each page gets at least 250 words of locally-real content (lanes, terminals, recruiter notes). Add more only when there's real content for them. See Pattern 4.

---

### Anti-Pattern 7: Treating the apply form as a feature to build "after content lands"

**What people do:** Schedule the form for the last sprint because "it's just a form." Pages get built first, all CTAs are placeholders.

**Why it's wrong:**
- Every CTA on every page becomes mock-only; can't end-to-end test conversion until the very end
- The first time you connect form → email → sheet, you discover env-var, runtime, and CORS issues all at once
- Content team can't preview what a real submission feels like

**Do this instead:** Build the form handler and a basic form UI in Wave 3 (parallel with section blocks). Polish the form's visual design later. Real CTAs from day one.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **Resend** (or Postmark / SES) | HTTP API via SDK in form handler (Node runtime). Reply-to set to driver's email so recruiter can reply directly | Set up SPF/DKIM on `a2clogisticsco.com` before launch. Use a dedicated subdomain (e.g., `mail.a2clogisticsco.com`) to isolate marketing email reputation. Resend's React Email lets you template the recruiter notification |
| **Google Sheets API** | Service-account JWT, append row to a named sheet via `spreadsheets.values.append`. Never client-side | Service account email needs Editor on the sheet. Rotate the JSON key annually. Schema column drift is the #1 silent failure — assert column count in the adapter |
| **Airtable** (alternative to Sheets) | REST API + personal-access token, scoped to a single base | Better than Sheets if recruiting wants views, filters, and multi-user editing. Costs more |
| **Plausible** (or Umami / Fathom / GA4) | Single `<script>` in root layout. Use custom event for `apply_submit` and `apply_success` | Plausible is privacy-respecting (no consent banner needed in most jurisdictions); GA4 forces a cookie banner |
| **Google Maps embed** (on `/contact`) | Static `<iframe>` with the Lincoln address; no API key needed for the embed | If a richer map is wanted later, swap to Mapbox static image (cheaper, faster) |
| **TinaCMS** (deferred / optional) | `tina/config.ts` defines collections matching `content/` shape; runs alongside the dev server | Only adopt if non-dev editing pain is real. Adds a Node service in dev and a build step |
| **OTTS YouTube** | Static `<a>` links + optional `lite-youtube` embeds on `/family` | Do NOT use the official YouTube embed iframe — it's a 500KB+ client perf disaster. Use `lite-youtube-embed` (one-time facade that loads the real embed on click) |
| **Sister-brand sites** | Plain `<a href>` links; for not-yet-live brands, render a `<span>` with "Coming soon" | `data/family.ts` carries `{ name, tagline, url, logoSrc, status: 'live' | 'coming-soon' }` |
| **Future ATS (Tenstreet / DriverReach)** | Implement `LeadSink` interface; add to `dispatchLead` sinks list | Most ATS systems accept a webhook or REST POST. Architecture supports adding without removing existing sinks (run in parallel during transition) |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **`content/` ↔ `app/`** | ESM import (compile-time) | Pages import MDX as a React component; frontmatter validated by Zod at import time |
| **`data/` ↔ `app/` and `content/`** | ESM import | Numbers flow into pages and into MDX (via custom components like `<PayBadge>`) |
| **Page ↔ Section blocks** | React props | Section blocks are pure presentational — no data fetching inside |
| **Form UI ↔ Form handler** | HTTP `POST /api/apply` (FormData or JSON) | Same Zod schema validates on both sides; ensures no skew |
| **Form handler ↔ Sinks** | Function call (in-process) | Sinks are async functions returning a discriminated union `{ ok: true } \| { ok: false, error }` |
| **Sinks ↔ External APIs** | HTTP via official SDK | Each sink owns its retry policy and timeout |

---

## Folder Structure (concrete, copy-pasteable)

See "Recommended Project Structure" above for the full Next.js layout. The Astro variant differs only in:
- `app/` → `src/pages/`
- `app/api/apply/route.ts` → `src/actions/apply.ts` (or `src/pages/api/apply.ts`)
- `mdx-components.tsx` → wired per-layout via `<Content components={...} />`
- `next/font` → `astro:assets <Font />` or self-hosted `@font-face`
- `next/image` → `astro:assets <Image />` and `<Picture />`

---

## Build / Deploy Specifics

### Environment Variables

| Variable | Used by | Scoping |
|----------|---------|---------|
| `RESEND_API_KEY` | `lib/sinks/email.ts` | Production + preview (a separate sandbox key for preview is ideal) |
| `RECRUITING_EMAIL` | `lib/sinks/email.ts` | All envs (production = real recruiter inbox; preview = dev test inbox) |
| `GOOGLE_SHEETS_CREDENTIALS` (JSON) | `lib/sinks/sheet.ts` | Production only; preview either uses a sandbox sheet or skips the sink |
| `GOOGLE_SHEET_ID` | `lib/sinks/sheet.ts` | Production sheet ID; preview points at a "preview leads" sheet |
| `AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID` | `lib/sinks/airtable.ts` (if used) | Same as Sheets |
| `PLAUSIBLE_DOMAIN` | analytics script | Production only (preview should NOT track) |
| `NEXT_PUBLIC_SITE_URL` (or `PUBLIC_SITE_URL`) | `lib/seo.ts`, sitemap, OG image URLs | Set per environment so canonical URLs are correct |
| `RATE_LIMIT_KV_URL` (optional) | rate-limit middleware | Production only |
| `TURNSTILE_SECRET` (optional, when CAPTCHA added) | form handler | Production only |

**Scoping on Netlify:** Set per-context (production / deploy-preview / branch-deploys) in the dashboard. Use `NETLIFY_CONTEXT` to gate behavior in code if needed.
**Scoping on Cloudflare Pages:** Set per-environment (production / preview) in the dashboard. Use `wrangler.toml` env sections for type-safe access in functions.

### Image Optimization

| Stack | Tool | Recommendation |
|-------|------|----------------|
| Next.js | `next/image` (built-in, runs `sharp` at build for SSG, or per-request on the Vercel/Netlify Image CDN) | Use it. Set `formats: ['image/avif', 'image/webp']` in `next.config.ts`. For Cloudflare Pages, configure a custom loader pointing to Cloudflare Images or just rely on `sharp` build-time transforms |
| Astro | `astro:assets` `<Image />` and `<Picture />` (uses sharp at build) | Use it. Consider `<Picture>` for art-direction (mobile crop vs desktop) on the hero |

For both, **author images at 2× the largest display size**, in source format (JPEG/PNG/AVIF), and let the framework generate responsive variants. Driver portraits should be square 800×800 source → multiple sizes via `srcset`.

### Hosting Choice

| Criterion | Netlify | Cloudflare Pages |
|-----------|---------|------------------|
| Next.js App Router support | Native (Netlify Adapter for Next.js) | Native (`@cloudflare/next-on-pages`) but with quirks |
| Astro support | Native via `@astrojs/netlify` | Native via `@astrojs/cloudflare` |
| Edge functions | Netlify Edge Functions (Deno) | Cloudflare Workers (V8) |
| Node runtime for functions | Yes | Yes (with `nodejs_compat` flag) |
| Image optimization | Netlify Image CDN (paid past free tier) | Cloudflare Images (paid) or build-time sharp |
| Form-handler ergonomics | Netlify Forms is built-in but limiting; use a route handler instead | Pages Functions are first-class |
| Preview deploys | Yes, per-PR, with scoped env vars | Yes, per-PR, with scoped env vars |
| Recommendation | Default if team prefers smoother Next.js story | Default if team values speed + cheaper egress |

Either works. Decide on whichever the team has more operational experience with.

---

## Open Questions

These depend on the framework decision (Next vs Astro) or a not-yet-made integration choice. Flagging for the roadmap to resolve in an early phase.

1. **Stack lock-in: Next.js (App Router) vs Astro?**
   - **Next.js** wins on: React ecosystem familiarity, `next/font`, `next/image`, server actions for the form, opengraph-image generator, ISR if needed later, `mdx-components.tsx` global pattern.
   - **Astro** wins on: zero-JS-by-default (better default Lighthouse scores), simpler mental model for a content site, `astro:assets <Font />` and `<Image />`, partial-hydration islands keep client JS minimal.
   - **Decision driver:** how interactive will the site be beyond the toggle, form, accordion, and carousel? If only those four, **Astro** is the better fit (smaller bundles, faster mobile). If more interactivity is anticipated (calculators, animated diagrams, future portal-lite features), **Next.js** is safer.
   - **Recommendation:** default to **Next.js App Router** per PROJECT.md for ecosystem maturity and team familiarity, unless the team explicitly chooses Astro for its perf defaults. Both architectures in this doc are valid for either choice.

2. **TinaCMS now or later?**
   - PROJECT.md leaves the door open. **Recommendation:** ship without TinaCMS; layer it in only if recruiting/marketing requests self-serve editing. The MDX folder structure in this doc is TinaCMS-compatible (Tina edits the same files in place), so no rework is needed to add it later.

3. **Sheet vs Airtable?**
   - Sheets: free, Google-account-based, brittle on schema changes.
   - Airtable: better UX for recruiting team, $24/mo+, supports views/filters out of the box.
   - **Recommendation:** start with Sheets (free, fast to wire), migrate to Airtable when recruiting team asks for views and the cost is justified.

4. **Resend vs Postmark vs SES?**
   - **Resend** (recommended): React Email integration, modern DX, good free tier. Owned by a small team, but stable.
   - **Postmark**: mature, transactional-only (no marketing email noise), strong deliverability.
   - **SES**: cheapest at scale, requires production-access approval, more setup.
   - **Recommendation:** Resend for launch. Reassess if volume exceeds the free tier.

5. **Plausible vs GA4?**
   - **Plausible** (recommended): no cookie banner needed in most jurisdictions, single small script, simple dashboard.
   - **GA4**: free, but requires a consent banner, heavy script, complex UI.
   - **Recommendation:** Plausible. The site collects PII via the form (under explicit consent); avoiding additional analytics consent friction is a UX win.

6. **OTTS YouTube embed: lite-youtube vs none?**
   - Full YouTube iframe embed costs ~500KB and a Lighthouse hit.
   - `lite-youtube-embed` (web component facade) costs ~3KB.
   - **Recommendation:** `lite-youtube-embed` if videos are wanted on `/family`; otherwise just link out to the channel.

7. **Programmatic city/state landing pages — when?**
   - Architecture supports it (see Pattern 4 + the optional `/jobs/[state]/[city]` route).
   - **Recommendation:** defer to a post-launch phase; only add when there's real per-metro content to write.

8. **Tailwind 4 config style?**
   - Tailwind 4 supports CSS-first `@theme` tokens (no `tailwind.config.ts` needed for many use cases).
   - **Recommendation:** use CSS-first config in `globals.css`; only add a `tailwind.config.ts` if a plugin requires it.

---

## Sources

- Next.js App Router project structure: https://nextjs.org/docs/app/getting-started/project-structure (Context7: `/vercel/next.js`)
- Next.js Server Actions for forms: https://nextjs.org/docs/app/guides/forms (Context7: `/vercel/next.js`)
- Next.js Route Handlers (`/api/*` POST pattern): https://nextjs.org/docs/app/api-reference/file-conventions/route (Context7: `/vercel/next.js`)
- Next.js MDX `useMDXComponents` global components: https://nextjs.org/docs/app/guides/mdx (Context7: `/vercel/next.js`)
- Next.js `useSearchParams` for URL state (and why it doesn't replace path-based routing for SEO): https://nextjs.org/docs/app/api-reference/functions/use-search-params (Context7: `/vercel/next.js`)
- Next.js `generateStaticParams` for SSG of dynamic routes: https://nextjs.org/docs/app/api-reference/functions/generate-static-params (Context7: `/vercel/next.js`)
- Astro content collections with glob loader + Zod schema: https://docs.astro.build/en/guides/content-collections/ (Context7: `/withastro/docs`)
- Astro Actions for form handling: https://docs.astro.build/en/guides/actions/ (Context7: `/withastro/docs`)
- Astro `astro:assets` for image and font optimization: https://docs.astro.build/en/guides/images/ (Context7: `/withastro/docs`)
- Resend (transactional email API): https://resend.com/docs (Context7: `/websites/resend`)
- TinaCMS git-based content overlay: https://tina.io/docs (Context7: `/websites/tina_io`)
- PROJECT.md (in-repo): `/Users/alexandercostea/Desktop/a2c-logistics-website/.planning/PROJECT.md`

**Confidence:** HIGH for Next.js / Astro patterns (verified against Context7). HIGH for the toggle-as-routes recommendation (well-documented SEO consensus + Next.js docs explicitly note that `searchParams` variations dedupe). MEDIUM for the trucking-specific page set (informed by PROJECT.md and competitor patterns; no industry standard exists). MEDIUM for the partial-failure form pattern (best-practice rather than canonical doc).

---
*Architecture research for: SEO-first MDX-driven trucking driver-recruiting site*
*Researched: 2026-05-04*
