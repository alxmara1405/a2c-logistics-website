---
phase: 01-foundation-form-pay-engine
plan: 01
type: execute
wave: 1
depends_on:
  - 01-foundation-form-pay-engine/00
autonomous: true
files_modified:
  - components.json
  - src/components/ui/button.tsx
  - src/components/ui/input.tsx
  - src/components/ui/label.tsx
  - src/components/ui/select.tsx
  - src/components/ui/checkbox.tsx
  - src/components/ui/form.tsx
  - src/lib/utils.ts
  - src/components/Header.astro
  - src/components/Footer.astro
  - src/layouts/Layout.astro
  - src/lib/validation/lead-schema.ts
  - src/data/pay.ts
  - src/data/recruiter.ts
  - src/content/config.ts
  - tests/unit/lead-schema.spec.ts
  - tests/unit/pay-schema.spec.ts
requirements:
  - SITE-02
  - SITE-06
  - BRAND-05
  - FUNNEL-01
  - FUNNEL-07
  - PAY-04
  - PAY-05
  - PAY-07
  - SEC-05
  - COMP-01
  - COMP-02
  - COMP-07
  - TRUST-06
must_haves:
  truths:
    - "shadcn primitives (Button, Input, Label, Select, Checkbox, Form) render in React with brand-aware Tailwind v4 classes"
    - "Layout.astro wraps every page with sticky Header (logo + Apply CTA) + Footer (recruiter tel/sms + MC#/USDOT# placeholders + legal links)"
    - "lead-schema.ts is the single Zod schema imported by both the React form island AND the Astro Action handler"
    - "lead-schema rejects banned fields (SSN, DOB, MVR, marital status, etc.) — any unrecognized field fails parse"
    - "pay.ts is Zod-validated with effective YYYY-MM dates per number-group, range-only enforcement, OO + Company branches"
    - "Astro content collection 'legal' is configured with frontmatter schema (title, draft flag, optional effective date)"
    - "Recruiter tel/sms data source is centralized so header + footer + form-error-state read from one file"
  artifacts:
    - path: "src/components/ui/button.tsx"
      provides: "shadcn Button primitive (variants: default, destructive, outline, ghost; sizes: default, sm, lg, icon)"
      contains: "buttonVariants"
    - path: "src/components/ui/input.tsx"
      provides: "shadcn Input primitive with focus ring and aria attributes"
      contains: "export"
    - path: "src/components/ui/select.tsx"
      provides: "shadcn Select primitive (Radix-backed) used by US state dropdown + role + cdlClass + yearsExperience"
      contains: "SelectTrigger"
    - path: "src/components/ui/checkbox.tsx"
      provides: "shadcn Checkbox primitive used by TCPA consent checkbox"
      contains: "CheckboxPrimitive"
    - path: "src/components/ui/form.tsx"
      provides: "shadcn Form helpers (FormItem, FormLabel, FormControl, FormDescription, FormMessage)"
      contains: "FormProvider"
    - path: "src/components/ui/label.tsx"
      provides: "shadcn Label primitive (Radix-backed)"
      contains: "LabelPrimitive"
    - path: "src/lib/utils.ts"
      provides: "cn() utility for className merging via clsx + tailwind-merge"
      exports: ["cn"]
    - path: "src/lib/validation/lead-schema.ts"
      provides: "Single Zod source of truth for client + server form validation"
      exports: ["leadSchema", "Lead"]
    - path: "src/data/pay.ts"
      provides: "Zod-validated typed pay data for both OO and Company branches; placeholder ranges with effective YYYY-MM dates"
      exports: ["pay", "PaySchema", "PAY_NUMBERS_ARE_PLACEHOLDER"]
    - path: "src/data/recruiter.ts"
      provides: "Centralized recruiter contact (tel, displayPhone, email)"
      exports: ["recruiter"]
    - path: "src/components/Header.astro"
      provides: "Sticky header — logo + recruiter tel (md+ only) + Apply CTA on every page"
      contains: "/apply"
    - path: "src/components/Footer.astro"
      provides: "Three-column footer — logo inverse + tagline + recruiter tel/sms + legal links + MC#/USDOT# bottom band"
      contains: "tel:"
    - path: "src/layouts/Layout.astro"
      provides: "Root layout — head meta + Font preload + Header + slot + Footer"
      contains: "<slot"
    - path: "src/content/config.ts"
      provides: "Astro content collection definitions (legal collection)"
      contains: "defineCollection"
    - path: "tests/unit/lead-schema.spec.ts"
      provides: "Schema unit tests proving banned-field rejection + valid input pass"
      contains: "leadSchema.parse"
    - path: "tests/unit/pay-schema.spec.ts"
      provides: "Pay schema tests proving range + effective-date enforcement"
      contains: "PaySchema"
  key_links:
    - from: "src/lib/validation/lead-schema.ts"
      to: "src/components/islands/ApplyForm.tsx (Wave 3) AND src/actions/index.ts (Wave 3)"
      via: "named export `leadSchema` imported by both"
      pattern: "import.*leadSchema.*from.*lead-schema"
    - from: "src/layouts/Layout.astro"
      to: "src/components/Header.astro AND src/components/Footer.astro"
      via: "static import + render"
      pattern: "import Header"
    - from: "src/data/recruiter.ts"
      to: "src/components/Header.astro AND src/components/Footer.astro"
      via: "static import"
      pattern: "import.*recruiter"
    - from: "src/data/pay.ts"
      to: "src/pages/pay/owner-operator.astro AND src/pages/pay/company.astro AND src/components/sections/JobPostingJsonLd.astro (Wave 2)"
      via: "named export `pay` imported by all consumers"
      pattern: "import.*pay.*from.*data/pay"
---

<objective>
Stand up the shared building blocks every later wave consumes: shadcn primitives needed by the form (Button, Input, Label, Select, Checkbox, Form), the Layout shell with persistent Header (Apply CTA) + Footer (recruiter tel/sms + legal links), the two Zod schemas (lead + pay) that act as the single source of truth across client/server, the typed recruiter data file, and the legal content collection config. Plus unit tests that prove the lead schema rejects banned fields and the pay schema enforces ranges with effective-date stamps.

Purpose: Wave 2 (pay routes) needs `data/pay.ts` + `Layout.astro` + Header/Footer + the legal collection config (for Wave 4 to consume the same shape). Wave 3 (form handler) needs the shadcn primitives + `lead-schema.ts` + `Layout.astro`. Both depend on this wave; both can run in parallel after this lands.

Output: A typed, tested, brand-shelled foundation. No routes yet (those land in Waves 2/3/4) — only the primitives + schemas + layout shell that those waves wire up.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/01-foundation-form-pay-engine/01-CONTEXT.md
@.planning/phases/01-foundation-form-pay-engine/01-RESEARCH.md
@.planning/phases/01-foundation-form-pay-engine/01-UI-SPEC.md
@.planning/phases/01-foundation-form-pay-engine/01-VALIDATION.md
@.planning/phases/01-foundation-form-pay-engine/01-00-foundation-SUMMARY.md
@src/styles/global.css
@src/env.d.ts

<interfaces>
<!-- Contracts this wave EXPORTS for Waves 2/3/4 to import — embedded so executors don't need to scavenge -->

```ts
// src/lib/validation/lead-schema.ts — RESEARCH.md §2.2 (verbatim, with .strict() to enforce field whitelist per CONTEXT D-21)
import { z } from "zod";

export const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"] as const;

export const leadSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  phone: z.string().regex(/^[\d\s\-\(\)\+\.]{10,20}$/, "Enter a valid phone number"),
  email: z.string().email().max(254),
  cdlClass: z.enum(["A"]),
  yearsExperience: z.enum(["1-2", "3-5", "5-10", "10+"]),
  role: z.enum(["owner-operator", "company"]),
  state: z.enum(US_STATES),
  smsConsent: z.literal(true, { errorMap: () => ({ message: "SMS consent is required to receive recruiter texts" }) }),
  consentVersion: z.literal("tcpa_consent_v1"),
  formVersion: z.literal("v1"),
  website: z.string().max(0).optional(),     // honeypot
  turnstileToken: z.string().min(10),
  idempotencyKey: z.string().uuid(),
}).strict(); // .strict() rejects unrecognized keys → enforces field whitelist (CONTEXT D-21)

export type Lead = z.infer<typeof leadSchema>;
```

```ts
// src/data/pay.ts — RESEARCH.md §3.1 (verbatim with PAY_NUMBERS_ARE_PLACEHOLDER flag)
// Schema enforces ranges + effective YYYY-MM per CONTEXT D-09
```

```ts
// src/data/recruiter.ts — single source of truth; Header + Footer + form-error-state read from this
export const recruiter = {
  tel: "+15551234567",            // PLACEHOLDER until A2C ops confirms real number (Phase 1 content blocker)
  displayPhone: "(555) 123-4567",
  email: "recruiting@a2clogisticsco.com", // matches RECRUITER_EMAIL env var
} as const;
```

```ts
// src/content/config.ts — RESEARCH.md §6
import { defineCollection, z } from "astro:content";
const legal = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    draft: z.boolean().optional(),
    effective: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  }),
});
export const collections = { legal };
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1.1: Init shadcn (Astro template) + add 6 primitives + Layout shell (Header + Footer + Layout.astro) + recruiter data</name>
  <files>components.json, src/lib/utils.ts, src/components/ui/button.tsx, src/components/ui/input.tsx, src/components/ui/label.tsx, src/components/ui/select.tsx, src/components/ui/checkbox.tsx, src/components/ui/form.tsx, src/components/Header.astro, src/components/Footer.astro, src/layouts/Layout.astro, src/data/recruiter.ts</files>
  <read_first>
    - .planning/phases/01-foundation-form-pay-engine/01-RESEARCH.md §1.3 (shadcn init prompts) AND §5.1, §5.2, §5.3 (Layout.astro, Header.astro, Footer.astro verbatim)
    - .planning/phases/01-foundation-form-pay-engine/01-CONTEXT.md D-03 (only install Phase-1 components — defer Card/Carousel/etc. to Phase 2), D-25 (recruiter tel/sms in header + footer), D-34 (logo variants)
    - .planning/phases/01-foundation-form-pay-engine/01-UI-SPEC.md §"Design System" (component list locked), §"Header (Layout shell)" (height, sticky, no mobile menu in Phase 1), §"Footer (Layout shell)" (3-column, brand-black bg, MC#/USDOT# placeholders), §"Copywriting Contract" (CTA copy "Apply", call/text labels, MC# pending), §"Color" (background utilities), §"Typography" (font-display vs font-body)
    - src/styles/global.css (current @theme block — utilities like bg-brand-black + font-display already work)
  </read_first>
  <action>
    1. **Init shadcn (Astro template)** — interactive prompts auto-answered via flags where possible:
       ```bash
       pnpm dlx shadcn@latest init --yes --base-color neutral --css-variables
       ```
       When prompted (or if flags don't cover): framework = `Astro`, style = `New York`, components dir = `src/components/ui`, utils file = `src/lib/utils`, CSS variables = yes, **no JS config (Tailwind v4 CSS-first)**. Verify `components.json` lands at repo root and `src/lib/utils.ts` exports `cn()`.

    2. **Add the 6 Phase-1 primitives** (Button, Input, Label, Select, Checkbox, Form) — NO Card/Carousel/Dialog/Sheet/Tabs (those land in Phase 2 per CONTEXT D-03):
       ```bash
       pnpm dlx shadcn@latest add button input label select checkbox form --yes
       ```
       Confirm 6 files appear in `src/components/ui/`. They are React components (.tsx) — that is correct (Astro can render React via `client:load`).

    3. **Patch shadcn primitives' className defaults to brand tokens where they touch color** — most shadcn defaults reference `bg-primary`, `text-primary-foreground`, etc. via CSS variables that the `@theme` block did NOT define (we override with brand tokens). Edit each generated file MINIMALLY:
       - `button.tsx`: in `buttonVariants`, change the `default` variant from whatever shadcn generates to `"bg-brand-red text-brand-white hover:bg-brand-red/90 min-h-11"` (the persistent Apply CTA per UI-SPEC §Color reserved-for list #1 + touch-target ≥44px per UI-SPEC §Spacing exception). Keep `outline` variant as the unselected pill style: `"border-2 border-brand-black bg-transparent text-brand-black hover:bg-brand-gray min-h-11"`. Keep `destructive` as `"bg-brand-red text-brand-white"` (UI-SPEC: same accent — no second semantic color in Phase 1).
       - `input.tsx`: ensure border + focus ring use brand-black: `"border-brand-black/20 focus-visible:ring-2 focus-visible:ring-brand-black focus-visible:ring-offset-2"`. min-h-11 for touch target.
       - `checkbox.tsx`: focus ring + checked state use brand-red: `"data-[state=checked]:bg-brand-red data-[state=checked]:border-brand-red"`.
       - `select.tsx`: same brand-black border + focus ring + min-h-11.
       Other primitives (label, form) need no color changes — they wrap state, not visual.
       Each edit is the MINIMUM diff required to use brand tokens — do not rewrite the file structure.

    4. **Create src/data/recruiter.ts** verbatim from the `<interfaces>` block above. Add a `// TODO(content-readiness): replace +15551234567 with real recruiter number when ops confirms` comment per CONTEXT STATE blockers.

    5. **Create src/components/Header.astro** verbatim from RESEARCH.md §5.2, with these UI-SPEC §Header refinements layered in:
       - Height: `h-14 md:h-16` (56px mobile / 64px desktop per UI-SPEC §Header)
       - Sticky: `sticky top-0 z-50`
       - Background: `bg-brand-white border-b border-brand-black/10`
       - Logo (left): `<img src="/logo-primary.svg" alt="A2C Logistics — home" class="h-8 w-auto" />` wrapped in `<a href="/">`
       - Recruiter tel link `hidden md:inline-flex` per UI-SPEC §Header (mobile uses icon-only — Phase 1 ships text-only on desktop, no icon button on mobile per UI-SPEC "no mobile menu" stance — keep tel hidden on mobile and rely on the footer for now)
       - Apply CTA: `<a href="/apply" class="bg-brand-red text-brand-white font-display text-sm px-6 py-3 rounded min-h-11 flex items-center">Apply</a>` (matches UI-SPEC §Copywriting CTA "Apply" + min-h-11 touch target)
       - Import recruiter from `../data/recruiter` and use `recruiter.tel` + `recruiter.displayPhone` for the desktop tel link (`<a href={`tel:${recruiter.tel}`} class="hidden md:inline-flex font-semibold text-sm text-brand-black">Call: {recruiter.displayPhone}</a>`)

    6. **Create src/components/Footer.astro** verbatim from RESEARCH.md §5.3 with UI-SPEC §Footer refinements:
       - Background `bg-brand-black text-brand-white`, padding `py-12 px-4 md:py-16 md:px-16`
       - Three columns on `md:grid-cols-3`, stacked on mobile in order: (1) logo-inverse + tagline "Driven to be different." in font-display, (2) recruiter tel + sms (use recruiter.tel for href, recruiter.displayPhone for label), (3) Privacy / SMS Terms / EEO links
       - Bottom band: `MC# {pending} · USDOT# {pending} · 300 S. Cotner Blvd, Lincoln, NE · © 2026 A2C Logistics CO.` (UI-SPEC §Footer bottom band — brand-gray text)
       - Use `aria-label="Call recruiter"` and `aria-label="Text recruiter"` on the tel/sms links
       - Each tel/sms link gets `min-h-11` for touch-target compliance

    7. **Create src/layouts/Layout.astro** verbatim from RESEARCH.md §5.1, with these additions:
       - `import "../styles/global.css";` at the top (so Tailwind compiles)
       - `import { Font } from "astro:assets";` and emit two `<Font cssVariable="--font-display" preload />` + `<Font cssVariable="--font-body" preload />` in the `<head>` per RESEARCH.md §1.5
       - `interface Props { title: string; noindex?: boolean; description?: string; }` matches RESEARCH §5.1
       - Default description: `"A2C Logistics CO. — driver-first trucking. Owner-operators and company drivers. Lincoln, NE."` (drivers-only positioning per PROJECT.md)
       - `<meta name="robots" content="noindex" />` only when `noindex` prop true (used by /apply/success and legal pages)
       - `<body class="font-body bg-brand-white text-brand-black antialiased">` then `<Header />` `<slot />` `<Footer />`
       - The `<TogglePersistence />` component referenced in RESEARCH §5.1 lands in Wave 2 — DO NOT include it here (it does not yet exist; including it breaks the build). Wave 2 will edit Layout.astro to add it.

    8. **Verify shadcn primitives compile** — run `pnpm exec astro check` to catch any TS errors from the brand-token edits. Fix until clean.
  </action>
  <verify>
    <automated>pnpm exec astro check && test -f components.json && test -f src/lib/utils.ts && test -f src/components/ui/button.tsx && test -f src/components/ui/input.tsx && test -f src/components/ui/label.tsx && test -f src/components/ui/select.tsx && test -f src/components/ui/checkbox.tsx && test -f src/components/ui/form.tsx && ! test -f src/components/ui/card.tsx && ! test -f src/components/ui/dialog.tsx && grep -q "export.*cn" src/lib/utils.ts && grep -q "bg-brand-red" src/components/ui/button.tsx && grep -q "min-h-11" src/components/ui/button.tsx && grep -q "/apply" src/components/Header.astro && grep -q "sticky top-0" src/components/Header.astro && grep -q "bg-brand-black" src/components/Footer.astro && grep -E "tel:|recruiter\.tel" src/components/Footer.astro && grep -E "tel:|recruiter\.tel" src/components/Header.astro && grep -q "MC#" src/components/Footer.astro && grep -q "USDOT#" src/components/Footer.astro && grep -q "Privacy" src/components/Footer.astro && grep -q "SMS Terms" src/components/Footer.astro && grep -q "EEO" src/components/Footer.astro && grep -q "Font cssVariable" src/layouts/Layout.astro && grep -q "import Header" src/layouts/Layout.astro && grep -q "import Footer" src/layouts/Layout.astro && grep -q "noindex" src/layouts/Layout.astro && grep -q "recruiter" src/data/recruiter.ts && pnpm build</automated>
  </verify>
  <acceptance_criteria>
    - `components.json` exists at repo root with `framework: astro` and `tailwind.cssVariables: true`
    - `src/lib/utils.ts` exports `cn` function (clsx + tailwind-merge)
    - Exactly 6 files in `src/components/ui/`: button.tsx, input.tsx, label.tsx, select.tsx, checkbox.tsx, form.tsx — NO card, dialog, carousel, sheet, tabs (those are Phase 2)
    - `button.tsx` `default` variant className contains BOTH `bg-brand-red` AND `min-h-11` (CTA per UI-SPEC §Color #1 + touch target)
    - `Header.astro`: contains `sticky top-0`, an `<a href="/apply">` element with text "Apply", a desktop-only tel link reading from `recruiter.tel`, h-14 → md:h-16
    - `Footer.astro`: `bg-brand-black`, three-column md grid, both tel: and sms: links reading recruiter.tel, all three legal links (`/privacy`, `/sms-terms`, `/eeo`), and the `MC# {pending} · USDOT# {pending}` bottom band
    - `Layout.astro`: imports Header + Footer + `astro:assets` Font; renders `<Font cssVariable="--font-display" preload />` and `<Font cssVariable="--font-body" preload />` in `<head>`; supports `noindex?: boolean` Prop that conditionally renders `<meta name="robots" content="noindex">`; body has classes `font-body bg-brand-white text-brand-black`
    - `src/data/recruiter.ts` exports a frozen `recruiter` object with `tel`, `displayPhone`, `email` properties
    - `pnpm exec astro check` exits 0 (no TS errors)
    - `pnpm build` exits 0 (Layout.astro can compile even though no pages use it yet — Astro's minimal index page is replaced or skipped)
    - Layout.astro does NOT yet import `TogglePersistence` (that arrives in Wave 2)
  </acceptance_criteria>
  <done>shadcn primitives ready for the form island, Layout shell with persistent Apply CTA + recruiter contact wired everywhere, recruiter data centralized so changes propagate from a single file. Wave 2 + Wave 3 unblocked.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 1.2: Zod schemas (lead + pay) + content collection config + schema unit tests</name>
  <files>src/lib/validation/lead-schema.ts, src/data/pay.ts, src/content/config.ts, tests/unit/lead-schema.spec.ts, tests/unit/pay-schema.spec.ts</files>
  <read_first>
    - .planning/phases/01-foundation-form-pay-engine/01-RESEARCH.md §2.2 (lead schema verbatim), §3.1 (pay schema + placeholder data verbatim), §6 (content collection config verbatim)
    - .planning/phases/01-foundation-form-pay-engine/01-CONTEXT.md D-09 (pay numbers + effective dates), D-11 (placeholder allowed if real numbers not ready), D-19 (single Zod schema for client + server), D-20 (6 free fields + selectors), D-21 (field whitelist excludes SSN/MVR/etc — strict mode), D-23 (TCPA consent constant tcpa_consent_v1), D-27 (honeypot field "website"), D-18 (idempotency key uuid), D-26 (Turnstile token min length)
    - .planning/phases/01-foundation-form-pay-engine/01-UI-SPEC.md §"Copywriting Contract" rows for TCPA consent text + form labels (the schema enum values must match what the UI presents)
    - tests/setup.ts (existing — to know if any shared fixtures need to be referenced)
  </read_first>
  <behavior>
    **lead-schema.spec.ts behaviors (write tests FIRST, then make them pass):**
    - Test 1: A complete valid Lead object parses successfully (firstName: "John", lastName: "Doe", phone: "555-555-1212", email: "j@example.com", cdlClass: "A", yearsExperience: "5-10", role: "owner-operator", state: "NE", smsConsent: true, consentVersion: "tcpa_consent_v1", formVersion: "v1", turnstileToken: "abcdefghij", idempotencyKey: a valid UUID v4)
    - Test 2: An object with extra field `ssn: "123-45-6789"` is REJECTED (CONTEXT D-21 — strict mode enforces field whitelist; SSN must never reach the schema). Same for `mvr`, `dob`, `arrestHistory`, `religion`, `gender`, `maritalStatus`, `disability`.
    - Test 3: smsConsent: false is REJECTED (positive opt-in only per D-23; literal(true))
    - Test 4: consentVersion: "tcpa_consent_v0" is REJECTED (must match the version-stamped constant per COMP-02)
    - Test 5: cdlClass: "B" is REJECTED (enum is ["A"] only per D-20 — CDL Class A only for v1)
    - Test 6: state: "ZZ" is REJECTED (must be one of US_STATES enum)
    - Test 7: phone: "abc" is REJECTED (regex)
    - Test 8: email: "not-an-email" is REJECTED
    - Test 9: idempotencyKey: "not-a-uuid" is REJECTED (FUNNEL-08 / D-18)
    - Test 10: website: "http://botspam.example" is REJECTED (max(0) means honeypot must be empty — D-27)
    - Test 11: turnstileToken: "abc" (length < 10) is REJECTED

    **pay-schema.spec.ts behaviors:**
    - Test 1: PaySchema.parse(pay) (the exported placeholder data) succeeds — proves placeholder data conforms
    - Test 2: A pay object with effective: "2026-5" (single-digit month) is REJECTED (regex requires YYYY-MM with two-digit month per D-09)
    - Test 3: A pay object with cpm.min > cpm.max is allowed by schema (no cross-field validation in v1) — but explicit equal-min-max ranges (e.g., layoverPay {min: 100, max: 100}) ARE allowed (the placeholder uses this for the $100 layover line). This test asserts equal-bounds parses successfully.
    - Test 4: A pay object missing `effective` on the company branch is REJECTED (effective is required per D-09)
    - Test 5: PAY_NUMBERS_ARE_PLACEHOLDER is exported as a boolean (proves the placeholder flag exists for Wave 2 routes to render the disclosure block per D-11)
  </behavior>
  <action>
    1. **Write tests/unit/lead-schema.spec.ts FIRST (RED phase)** — 11 test cases per the `<behavior>` block. Use `describe("leadSchema")` and `it.each([...])` for the rejection tests where it makes the table compact. Each test calls `leadSchema.safeParse(input)` and asserts `result.success` true/false plus (for failure cases) checks `result.error.issues[0].path` includes the rejecting field. Run `pnpm test --run tests/unit/lead-schema.spec.ts` — MUST fail (file doesn't exist yet).

    2. **Write tests/unit/pay-schema.spec.ts FIRST (RED phase)** — 5 test cases per the `<behavior>` block. Run — MUST fail.

    3. **Create src/lib/validation/lead-schema.ts** verbatim from the `<interfaces>` block above (which is RESEARCH §2.2 + the `.strict()` modifier per D-21 + the explicit US_STATES const). Critical details:
       - `.strict()` on the outer object — without this, the test for unknown fields (Test 2 above) FAILS because Zod's default is `.passthrough()` for unknowns. CONTEXT D-21 explicitly states "Whitelist is enforced at the schema level (any unrecognized field is rejected by the server)." → `.strict()` is the implementation.
       - `consentVersion: z.literal("tcpa_consent_v1")` and `formVersion: z.literal("v1")` are version stamps per D-23 / RESEARCH §2.2 — they pin the consent text version captured per submission.
       - Export both `leadSchema` and `type Lead = z.infer<typeof leadSchema>`.
       - Export `US_STATES` const array so the React form island in Wave 3 can iterate it for the `<Select>` options.
       Run schema tests until all 11 pass (GREEN phase).

    4. **Create src/data/pay.ts** verbatim from RESEARCH.md §3.1 — the entire blob: PayRangeSchema, CompanyPaySchema, OwnerOpPaySchema, PaySchema, the `pay = PaySchema.parse({...placeholder data})` block with all the placeholder ranges (CPM 0.55–0.72, sign-on 2000–5000, OO 65–72%, etc.), and `export const PAY_NUMBERS_ARE_PLACEHOLDER = true;`. Add a `// TODO(content-readiness): flip PAY_NUMBERS_ARE_PLACEHOLDER to false when A2C ops supplies real numbers (Phase 1 content blocker per STATE.md)` comment above the export.
       Run pay-schema tests until all 5 pass.

    5. **Create src/content/config.ts** verbatim from RESEARCH.md §6 — the `legal` collection definition with `title`, `draft?`, `effective?` (YYYY-MM-DD format) frontmatter schema and `export const collections = { legal };`. The actual MDX files land in Wave 4.

    6. **Confirm both schemas are importable from a script context** (Wave 3 needs to call `leadSchema` from a Pages Function which runs in a Workers-like JS env — no Node-only APIs). The schema uses only `zod` which is fully edge-compatible. No additional verification needed beyond `pnpm exec astro check` passing.
  </action>
  <verify>
    <automated>pnpm test --run tests/unit/lead-schema.spec.ts && pnpm test --run tests/unit/pay-schema.spec.ts && pnpm exec astro check && grep -q "leadSchema" src/lib/validation/lead-schema.ts && grep -q "\.strict()" src/lib/validation/lead-schema.ts && grep -q "tcpa_consent_v1" src/lib/validation/lead-schema.ts && grep -q "US_STATES" src/lib/validation/lead-schema.ts && grep -q "z.literal(true" src/lib/validation/lead-schema.ts && grep -q "PaySchema" src/data/pay.ts && grep -q "PAY_NUMBERS_ARE_PLACEHOLDER" src/data/pay.ts && grep -E "effective.*2026-(0[1-9]|1[0-2])" src/data/pay.ts && grep -q "defineCollection" src/content/config.ts && grep -q "legal" src/content/config.ts</automated>
  </verify>
  <acceptance_criteria>
    - All 11 lead-schema tests pass + all 5 pay-schema tests pass (`pnpm test --run` exits 0)
    - `src/lib/validation/lead-schema.ts` calls `.strict()` on the outer z.object (proves field whitelist enforcement per D-21)
    - The schema rejects an extra `ssn` field (Test 2) — verified by the unit test, AND by re-grepping the test file to confirm SSN is the literal payload tested
    - `consentVersion: z.literal("tcpa_consent_v1")` and `formVersion: z.literal("v1")` are present (version stamping per D-23 / COMP-02)
    - `US_STATES` is exported as a `readonly` const tuple of all 50 + DC
    - `src/data/pay.ts` exports `pay`, `PaySchema`, and `PAY_NUMBERS_ARE_PLACEHOLDER` with the placeholder set to `true` (per D-11)
    - Pay placeholder data has effective dates matching `^\d{4}-\d{2}$` (verified by the schema's regex + the pay-schema test)
    - `src/content/config.ts` defines a `legal` collection with frontmatter shape `{title, draft?, effective?}`
    - `pnpm exec astro check` exits 0
    - Schemas use only `zod` imports (no Node-only modules) — verified by importing into a fresh Vitest run with Node env
  </acceptance_criteria>
  <done>Single Zod source of truth for the form ready for both client (Wave 3 React island) AND server (Wave 3 Astro Action). Pay data typed and validated with the placeholder flag for Wave 2 to render the "pending real data" disclosure when needed. Legal content collection schema ready for Wave 4 MDX drops.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Client form input → server-side schema | Wave 3 will run leadSchema.parse on the server. Wave 1 establishes the schema; the boundary lives in Wave 3. |
| Repo content authoring → public site | Legal MDX files (Wave 4) carry frontmatter schema validation via Astro content collections — prevents typos in `draft` flag from silently shipping a non-draft document. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-1-W1-01 | Tampering | Attacker submits form with extra `ssn` / `mvr` field that the recruiter sink dutifully writes to the Sheet → FCRA exposure (CONTEXT D-21, COMP-07) | mitigate | leadSchema uses `.strict()` so unknown fields cause `safeParse` to return `success: false`. Wave 3 Action returns 400 to client. Unit Test 2 in tests/unit/lead-schema.spec.ts asserts the SSN payload is rejected. |
| T-1-W1-02 | Repudiation | Driver later claims "I never consented to SMS" — recruiting team has no proof of which consent text was shown | mitigate | `consentVersion: z.literal("tcpa_consent_v1")` is REQUIRED on every submission. Wave 3 will store this on every sink row (Sheet + email). The literal version constant is the linkage to the live consent text on the form (Wave 3 ApplyForm.tsx hardcodes the same constant). Schema rejects any other consent version → impossible to log a submission without a known consent text. |
| T-1-W1-03 | Information Disclosure | Pay numbers leak to spec assertions in test files (e.g., a test importing pay.ts and asserting cpm.max === 0.72) — if the test runs in CI logs, exact placeholder numbers appear in build output | accept | Placeholder pay numbers per D-11 are explicitly NOT real until ops supplies them. Even if leaked via CI logs, they are documented placeholders. PAY_NUMBERS_ARE_PLACEHOLDER flag makes their non-canonical status explicit. |
| T-1-W1-04 | Denial of Service | Schema regex on phone field (`/^[\d\s\-\(\)\+\.]{10,20}$/`) is anchored and bounded — no ReDoS risk | mitigate | Phone regex bounded to 20 chars with anchored start/end. Email regex via `z.string().email()` uses Zod's safe RFC-style validator (not a backtracking pattern). |
</threat_model>

<verification>
- All 16 schema unit tests green (`pnpm test --run`)
- `pnpm exec astro check` clean
- `pnpm build` clean (Layout.astro compiles even with no pages — minimal Astro template's index page is acceptable as a placeholder until Wave 2/3 add real routes)
- shadcn primitives reachable via `import { Button } from "@/components/ui/button"` (or the relative path used in the React form island in Wave 3)
- Lead schema rejects every banned field (SSN, MVR, DOB, marital status, religion, gender, disability, arrest history) — verified by Test 2 in lead-schema.spec.ts
</verification>

<success_criteria>
Wave 2 (pay routes) can: import `pay` + `PAY_NUMBERS_ARE_PLACEHOLDER` from `src/data/pay`, wrap routes in `Layout.astro`, render the same Header + Footer with recruiter contacts.
Wave 3 (form) can: import `leadSchema` + `Lead` + `US_STATES` from `src/lib/validation/lead-schema`, import shadcn primitives from `src/components/ui/*`, wrap `/apply` in `Layout.astro`, render the same Header + Footer.
Wave 4 (compliance) can: drop MDX files into `src/content/legal/` and have them parsed against the legal collection schema in `src/content/config.ts`.
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-form-pay-engine/01-01-primitives-SUMMARY.md` capturing: shadcn version installed, the 6 primitives + their final brand-token classNames (so Wave 3 doesn't re-derive), recruiter placeholder values used, schema field count + any deviations from the spec, and confirmation that all 16 schema tests pass.
</output>
