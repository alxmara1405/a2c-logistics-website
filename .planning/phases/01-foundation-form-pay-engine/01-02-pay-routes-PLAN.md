---
phase: 01-foundation-form-pay-engine
plan: 02
type: execute
wave: 2
depends_on:
  - 01-foundation-form-pay-engine/01
autonomous: true
files_modified:
  - src/layouts/PayLayout.astro
  - src/pages/pay/owner-operator.astro
  - src/pages/pay/company.astro
  - src/pages/pay/index.astro
  - src/components/sections/PayBadge.astro
  - src/components/sections/PayToggle.astro
  - src/components/sections/JobPostingJsonLd.astro
  - src/components/sections/PayPlaceholderBlock.astro
  - src/components/sections/PayDisclosureBlock.astro
  - src/components/islands/TogglePersistence.astro
  - src/layouts/Layout.astro
  - tests/unit/job-posting-jsonld.spec.ts
  - tests/build/pay-routes.spec.ts
requirements:
  - SITE-01
  - SITE-02
  - PAY-01
  - PAY-02
  - PAY-03
  - PAY-04
  - PAY-05
  - PAY-06
  - PAY-07
  - SEO-04
  - FUNNEL-06
must_haves:
  truths:
    - "/pay/owner-operator and /pay/company are two physical SSG'd routes — each with its own <title>, <h1>, meta description, canonical-to-self, and JobPosting JSON-LD with baseSalary"
    - "/pay (root) returns 308 redirect to /pay/owner-operator"
    - "OO/Company pill toggle on each pay route navigates between routes via anchor href (no client-only state)"
    - "TogglePersistence vanilla-TS island writes a2c.pay.role to localStorage on pay-page load AND pre-fills the apply form's role selector from localStorage on /apply load"
    - "Pay numbers all render as ranges with adjacent Effective: YYYY-MM badge (PAY-05); when PAY_NUMBERS_ARE_PLACEHOLDER is true, both pages render the placeholder disclosure block instead of the table (per D-11)"
    - "Owner-op page publishes representative weekly net dollar range alongside %-of-gross (PAY-06 — state pay-transparency law)"
    - "JobPosting JSON-LD on company route uses unitText: WEEK with weekly net (since CPM unit doesn't apply to W2 driver weekly pay framing); OO route uses unitText: WEEK with representative weekly net (matches Google CDL guidance per D-12)"
    - "No banned phrases (competitive pay, top of market, top earners, great pay, family) anywhere in pay route HTML"
  artifacts:
    - path: "src/layouts/PayLayout.astro"
      provides: "Wraps both pay routes — extends Layout.astro, adds PayToggle at top of main, adds PayDisclosureBlock at bottom"
      contains: "PayToggle"
    - path: "src/pages/pay/owner-operator.astro"
      provides: "SSG'd OO pay route — own title/H1/canonical/JobPosting; renders %-of-gross + representative weekly net + fast pay + fuel discount + settlement + deductions"
      contains: "JobPostingJsonLd"
    - path: "src/pages/pay/company.astro"
      provides: "SSG'd Company pay route — own title/H1/canonical/JobPosting; renders CPM range + sign-on + fast pay + detention/layover + per-diem + benefits"
      contains: "JobPostingJsonLd"
    - path: "src/pages/pay/index.astro"
      provides: "/pay → /pay/owner-operator 308 redirect (Astro.redirect)"
      contains: "308"
    - path: "src/components/sections/PayBadge.astro"
      provides: "Renders a PayRange ({min, max, unit, effective, notes?}) inline with adjacent Effective: YYYY-MM badge in brand-red"
      contains: "Effective:"
    - path: "src/components/sections/PayToggle.astro"
      provides: "Two-pill OO/Company route navigator (anchor-based, NOT button onClick); selected = bg-brand-red text-brand-white; aria-current set on active"
      contains: "aria-current"
    - path: "src/components/sections/JobPostingJsonLd.astro"
      provides: "Emits <script type=application/ld+json> with title, description, datePosted, validThrough, employmentType, hiringOrganization, jobLocation, baseSalary"
      contains: "JobPosting"
    - path: "src/components/sections/PayPlaceholderBlock.astro"
      provides: "Replaces pay table when PAY_NUMBERS_ARE_PLACEHOLDER=true — copy from UI-SPEC §Copywriting empty-state row"
      contains: "Pay details — call to discuss"
    - path: "src/components/sections/PayDisclosureBlock.astro"
      provides: "Bottom-of-page 'Pay terms shown here are current as of {effective} and may change…' block (UI-SPEC §Copywriting As-of disclosure)"
      contains: "current as of"
    - path: "src/components/islands/TogglePersistence.astro"
      provides: "Vanilla-TS island — writes localStorage on pay-page load; redirects /pay → last-chosen on root visit; pre-fills /apply role selector from localStorage when no ?role= URL param"
      contains: "a2c.pay.role"
    - path: "tests/unit/job-posting-jsonld.spec.ts"
      provides: "Snapshot/structure test for JobPostingJsonLd component output"
      contains: "JobPosting"
    - path: "tests/build/pay-routes.spec.ts"
      provides: "Asserts /pay/owner-operator and /pay/company HTML contains unique title, canonical-to-self, JobPosting JSON-LD with baseSalary, no banned phrases"
      contains: "owner-operator"
  key_links:
    - from: "src/pages/pay/owner-operator.astro AND src/pages/pay/company.astro"
      to: "src/data/pay.ts"
      via: "named import `pay` and `PAY_NUMBERS_ARE_PLACEHOLDER` (from Wave 1)"
      pattern: "import.*from.*data/pay"
    - from: "src/layouts/PayLayout.astro"
      to: "src/layouts/Layout.astro"
      via: "Layout extension via slot"
      pattern: "import Layout"
    - from: "src/components/sections/JobPostingJsonLd.astro"
      to: "Google's Rich Results parser"
      via: "<script type=application/ld+json> with schema.org JobPosting"
      pattern: "schema.org"
    - from: "src/components/islands/TogglePersistence.astro"
      to: "src/layouts/Layout.astro (added in this wave)"
      via: "Static import + render at end of body"
      pattern: "TogglePersistence"
    - from: "src/pages/pay/index.astro"
      to: "/pay/owner-operator"
      via: "Astro.redirect with 308 status"
      pattern: "308"
---

<objective>
Ship the two physical pay routes (`/pay/owner-operator`, `/pay/company`) as SSG'd Astro pages — each with its own metadata, canonical, JobPosting JSON-LD, and pay tables driven from Wave 1's typed `src/data/pay.ts`. Add the route-level pill toggle (anchor-based, no client state at navigation), the `/pay` 308 redirect, the vanilla-TS localStorage persistence island, and a build-output test that asserts every PAY-* and SEO-04 success criterion.

Purpose: ROADMAP success criterion #3 ("two SSG'd pay routes with own meta + JobPosting JSON-LD; /pay 308s") and #4 (toggle navigates routes; localStorage persists). Wave 3 runs in parallel — both depend only on Wave 1 (Layout + pay schema). Wave 4 wires the apply CTA links coming FROM these pay pages with `?role=...` deep links.

Output: Two real, indexable pay routes that a recruiter can show a driver right now to prove "the pay numbers are real and dated." JSON-LD ready for Phase 3's Rich Results validation gate.
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
@.planning/phases/01-foundation-form-pay-engine/01-01-primitives-SUMMARY.md
@src/layouts/Layout.astro
@src/data/pay.ts
@src/data/recruiter.ts

<interfaces>
<!-- Types Wave 2 consumes from Wave 1 -->

```ts
// From src/data/pay.ts (Wave 1)
export const pay: { company: CompanyPay; ownerOperator: OwnerOpPay };
export const PAY_NUMBERS_ARE_PLACEHOLDER: boolean;

// PayRange shape used by PayBadge:
type PayRange = { min: number; max: number; unit: "USD" | "CPM" | "PCT"; effective: string; notes?: string };
```

```astro
<!-- PayBadge usage signature (Wave 2 produces this; pay route .astro files consume) -->
<PayBadge range={oo.percentOfGross} />
<!-- Renders: "65–72% Effective: 2026-05" with the badge in brand-red Label-size 14px/600 -->
```

```astro
<!-- JobPostingJsonLd usage signature -->
<JobPostingJsonLd
  title="Owner-Operator Driver — A2C Logistics"
  role="owner-operator"
  description="Lease-on owner-operator opportunity at A2C Logistics CO. — Lincoln, NE."
  payMin={oo.representativeWeeklyNet.min}
  payMax={oo.representativeWeeklyNet.max}
  payUnit="WEEK"
  effective={oo.effective}
/>
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 2.1: PayBadge + PayToggle + JobPostingJsonLd + PayPlaceholderBlock + PayDisclosureBlock + JSON-LD unit test + Layout.astro TogglePersistence wiring</name>
  <files>src/components/sections/PayBadge.astro, src/components/sections/PayToggle.astro, src/components/sections/JobPostingJsonLd.astro, src/components/sections/PayPlaceholderBlock.astro, src/components/sections/PayDisclosureBlock.astro, src/components/islands/TogglePersistence.astro, src/layouts/Layout.astro, tests/unit/job-posting-jsonld.spec.ts</files>
  <read_first>
    - .planning/phases/01-foundation-form-pay-engine/01-RESEARCH.md §3.3 (JobPostingJsonLd verbatim), §3.4 (PayToggle + TogglePersistence verbatim)
    - .planning/phases/01-foundation-form-pay-engine/01-CONTEXT.md D-06 (two physical routes, NOT query param), D-07 (shared PayLayout), D-08 (localStorage via vanilla-TS island), D-09 (effective YYYY-MM rendered next to numbers), D-11 (placeholder disclosure block when no real numbers), D-12 (JobPosting JSON-LD CDL guidance: unitText), D-31 (color tokens)
    - .planning/phases/01-foundation-form-pay-engine/01-UI-SPEC.md §"Interaction Contracts > Pill Toggle" (filled red selected, transparent border unselected, rounded-full px-6 py-3 min-h-11), §"Color" (accent reserved-for #2 = pill toggle selected; reserved-for #5 = Effective badge), §"Copywriting Contract" rows: pay-toggle pill labels, Effective-date badge format, As-of disclosure block copy, empty-state pay-numbers-pending block copy
    - https://developers.google.com/search/docs/appearance/structured-data/job-posting (verify required JobPosting fields: title, description, datePosted, validThrough, hiringOrganization, jobLocation, employmentType, baseSalary)
    - src/layouts/Layout.astro (current state — must add TogglePersistence import + render at end of body)
    - src/data/pay.ts (PayRange shape — PayBadge accepts this)
  </read_first>
  <behavior>
    **tests/unit/job-posting-jsonld.spec.ts behaviors:**
    - Test 1: Component output (rendered via Astro Container API or by extracting and re-parsing the JSON literal) is valid JSON parseable by JSON.parse
    - Test 2: Parsed object has @context: "https://schema.org" and @type: "JobPosting"
    - Test 3: Required Google JobPosting fields all present: title, description, datePosted, validThrough, hiringOrganization (with @type "Organization", name "A2C Logistics CO."), jobLocation (with @type "Place", address.addressLocality "Lincoln", addressRegion "NE", addressCountry "US"), employmentType, baseSalary (with @type "MonetaryAmount", currency "USD", value with @type "QuantitativeValue", minValue, maxValue, unitText)
    - Test 4: When role="owner-operator", employmentType is "CONTRACTOR"; when role="company", employmentType is "FULL_TIME"
    - Test 5: datePosted has format YYYY-MM-DD (the effective YYYY-MM + "-01")
    - Test 6: validThrough has format YYYY-12-31 (year of effective)
    - Test 7: baseSalary.value.unitText accepts "WEEK", "MONTH", "YEAR", "MILE" — all four are valid Google unitText values
  </behavior>
  <action>
    1. **Write tests/unit/job-posting-jsonld.spec.ts FIRST (RED)** — use `experimental_AstroContainer` from `astro/container` to render the component server-side, then extract the script tag content via regex and JSON.parse it. Run — MUST fail (component doesn't exist).

    2. **Create src/components/sections/JobPostingJsonLd.astro** verbatim from RESEARCH.md §3.3 with these refinements per D-12 + Google CDL guidance:
       - Props interface: `{ title: string; role: "owner-operator" | "company"; description?: string; payMin: number; payMax: number; payUnit: "MILE" | "WEEK" | "MONTH" | "YEAR"; effective: string; }`
       - description default: `"${title} at A2C Logistics CO. — ${role === "owner-operator" ? "Lease-on owner-operator opportunity" : "W2 company driver opportunity"} based in Lincoln, NE."`
       - employmentType: `role === "owner-operator" ? "CONTRACTOR" : "FULL_TIME"` (Google's enum values)
       - hiringOrganization.sameAs: `"https://a2clogistics.com"` (Phase 3 will pin this to the actual production domain post-cutover)
       - hiringOrganization.logo: `"https://a2clogistics.com/logo-primary.svg"`
       - jobLocation.address: Lincoln, NE, US
       - baseSalary.value: `{ "@type": "QuantitativeValue", minValue: payMin, maxValue: payMax, unitText: payUnit }`
       - datePosted: `${effective}-01` (YYYY-MM + "-01" → ISO date)
       - validThrough: `${effective.slice(0, 4)}-12-31` (end of the same calendar year)
       - Emit via `<script type="application/ld+json" set:html={JSON.stringify(json)} />`
       Run JSON-LD tests until all 7 pass (GREEN).

    3. **Create src/components/sections/PayBadge.astro** — accepts a `PayRange` and renders the formatted range + an adjacent "Effective: YYYY-MM" badge in brand-red (Label size 14px/600 per UI-SPEC §Color reserved-for #5):
       ```astro
       ---
       interface Props { range: { min: number; max: number; unit: "USD" | "CPM" | "PCT"; effective: string; notes?: string }; }
       const { range } = Astro.props;
       function formatRange(r: typeof range): string {
         if (r.unit === "PCT") return `${r.min}–${r.max}%`;
         if (r.unit === "USD") return `$${r.min.toLocaleString()}–$${r.max.toLocaleString()}`;
         if (r.unit === "CPM") return `${r.min.toFixed(2)}–${r.max.toFixed(2)} CPM`;
         return `${r.min}–${r.max}`;
       }
       ---
       <span class="inline-flex items-baseline gap-2">
         <span class="font-display">{formatRange(range)}</span>
         <span class="text-xs font-semibold text-brand-red bg-brand-red/10 px-2 py-1 rounded">Effective: {range.effective}</span>
         {range.notes && <span class="text-sm text-brand-black/70">— {range.notes}</span>}
       </span>
       ```
       The literal string `Effective:` must appear (PAY-05 verification grep).

    4. **Create src/components/sections/PayToggle.astro** verbatim from RESEARCH.md §3.4 — two anchor pills (NOT buttons) per UI-SPEC §"Pill Toggle" (filled red selected, transparent border unselected, rounded-full px-6 py-3 min-h-11). Set `aria-current="page"` on the active pill. Pill labels: `Owner-Operator` and `Company Driver` (UI-SPEC §Copywriting). Use `class:list` for conditional styling so both branches are deterministic. The component takes `current: "owner-operator" | "company"` as a prop.

    5. **Create src/components/sections/PayPlaceholderBlock.astro** — renders when PAY_NUMBERS_ARE_PLACEHOLDER is true. Copy from UI-SPEC §Copywriting "Empty state — pay numbers pending":
       ```astro
       ---
       import { recruiter } from "../../data/recruiter";
       interface Props { role: "owner-operator" | "company"; }
       const { role } = Astro.props;
       ---
       <section class="bg-brand-gray p-8 rounded my-8">
         <h2 class="font-display text-2xl mb-4">Pay details — call to discuss.</h2>
         <p class="mb-4">We're updating our published pay tables. For current {role === "owner-operator" ? "owner-operator splits" : "company driver CPM"}, call our recruiter: <a href={`tel:${recruiter.tel}`} class="underline font-semibold">{recruiter.displayPhone}</a>.</p>
       </section>
       ```
       NO "competitive" / "top earners" / "industry-leading" / "great pay" / "family" / "freight" copy anywhere (banned phrases per UI-SPEC §Copywriting).

    6. **Create src/components/sections/PayDisclosureBlock.astro** — UI-SPEC §Copywriting "As of disclosure":
       ```astro
       ---
       interface Props { effective: string; }
       const { effective } = Astro.props;
       ---
       <p class="mt-12 text-sm text-brand-black/70 border-t border-brand-gray pt-6">
         Pay terms shown here are current as of {effective} and may change with market conditions. Final terms confirmed in writing during onboarding.
       </p>
       ```

    7. **Create src/components/islands/TogglePersistence.astro** verbatim from RESEARCH.md §3.4. Critical: per CONTEXT D-08 this is **vanilla TypeScript inside `<script>`, NOT a React island**. The script:
       - On `/pay/owner-operator` or `/pay/company` page load → `localStorage.setItem("a2c.pay.role", role)`
       - On `/pay` (root) → read localStorage; if set, `window.location.replace(`/pay/${stored}`)`. (Note: Layout.astro emits this on EVERY page; the `/pay` redirect via TogglePersistence is a client-side fallback — the Astro 308 in `pay/index.astro` is the SEO-correct path that fires for crawlers + first-time visitors. Both must coexist; the JS only re-redirects after first visit if the user navigates directly to `/pay` again.)
       - On `/apply` (no `?role=` URL param) → read localStorage; if set, set the value of any `<select name="role">` element. (The select is added by Wave 3 — TogglePersistence is forward-compatible: it `?.setAttribute(`value`)` and silently no-ops if the select isn't present.)
       Use the storage key literal `a2c.pay.role` (per UI-SPEC §"Pill Toggle" `localStorage.setItem('a2c.pay.role'...)`).

    8. **Edit src/layouts/Layout.astro** to import + render TogglePersistence at the end of `<body>` (just before `</body>`):
       ```astro
       ---
       import TogglePersistence from "../components/islands/TogglePersistence.astro";
       ---
       <!-- ... existing head + Header + slot + Footer ... -->
       <TogglePersistence />
       </body>
       ```
       This is the deferred wiring promised in Wave 1 Task 1.1 step 7.
  </action>
  <verify>
    <automated>pnpm exec astro check && pnpm test --run tests/unit/job-posting-jsonld.spec.ts && test -f src/components/sections/PayBadge.astro && test -f src/components/sections/PayToggle.astro && test -f src/components/sections/JobPostingJsonLd.astro && test -f src/components/sections/PayPlaceholderBlock.astro && test -f src/components/sections/PayDisclosureBlock.astro && test -f src/components/islands/TogglePersistence.astro && grep -q "Effective:" src/components/sections/PayBadge.astro && grep -q "aria-current" src/components/sections/PayToggle.astro && grep -q "Owner-Operator" src/components/sections/PayToggle.astro && grep -q "Company Driver" src/components/sections/PayToggle.astro && grep -q "min-h-11" src/components/sections/PayToggle.astro && grep -q "rounded-full" src/components/sections/PayToggle.astro && grep -q "JobPosting" src/components/sections/JobPostingJsonLd.astro && grep -q "schema.org" src/components/sections/JobPostingJsonLd.astro && grep -q "baseSalary" src/components/sections/JobPostingJsonLd.astro && grep -q "QuantitativeValue" src/components/sections/JobPostingJsonLd.astro && grep -q "Lincoln" src/components/sections/JobPostingJsonLd.astro && grep -q "CONTRACTOR" src/components/sections/JobPostingJsonLd.astro && grep -q "FULL_TIME" src/components/sections/JobPostingJsonLd.astro && grep -q "Pay details — call to discuss" src/components/sections/PayPlaceholderBlock.astro && grep -q "current as of" src/components/sections/PayDisclosureBlock.astro && grep -q "a2c.pay.role" src/components/islands/TogglePersistence.astro && grep -q "TogglePersistence" src/layouts/Layout.astro && pnpm build</automated>
  </verify>
  <acceptance_criteria>
    - All 7 JSON-LD tests pass
    - PayBadge renders the literal "Effective:" string adjacent to the range value
    - PayToggle uses `<a href="...">` anchors (NOT `<button onClick>`), has `aria-current="page"` on the active pill, uses `rounded-full px-6 py-3 min-h-11` per UI-SPEC, and labels are exactly "Owner-Operator" and "Company Driver"
    - JobPostingJsonLd JSON output (parsed) contains: @context "https://schema.org", @type "JobPosting", non-empty title/description/datePosted/validThrough/employmentType, hiringOrganization with @type "Organization" + name "A2C Logistics CO." + sameAs URL + logo URL, jobLocation with @type "Place" + Lincoln/NE/US address, baseSalary.value with QuantitativeValue + minValue + maxValue + unitText
    - employmentType maps: owner-operator → CONTRACTOR, company → FULL_TIME
    - PayPlaceholderBlock copy is the EXACT UI-SPEC empty-state-pay-numbers-pending text; recruiter phone read from `src/data/recruiter`
    - PayDisclosureBlock copy is the EXACT UI-SPEC As-of-disclosure text
    - TogglePersistence storage key literal is `a2c.pay.role`; script handles three page paths (/pay, /pay/owner-operator|/pay/company, /apply)
    - Layout.astro now imports + renders `<TogglePersistence />` at end of body
    - `pnpm build` exits 0
    - Zero banned phrases (`competitive pay`, `top of market`, `top earners`, `great pay`, `industry-leading`, `family`, `freight`, `we care`) in any of the new component files (verified by grep -ri NOT finding them)
  </acceptance_criteria>
  <done>All Wave-2 building blocks ready: typed PayBadge, anchor-only PayToggle (no client-state hijacking SEO), JSON-LD validated against Google's JobPosting shape, placeholder + disclosure blocks copy-locked to UI-SPEC, vanilla-TS persistence island wired into Layout.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2.2: PayLayout + the three pay routes (owner-operator, company, /pay 308) + build-output test</name>
  <files>src/layouts/PayLayout.astro, src/pages/pay/owner-operator.astro, src/pages/pay/company.astro, src/pages/pay/index.astro, tests/build/pay-routes.spec.ts</files>
  <read_first>
    - .planning/phases/01-foundation-form-pay-engine/01-RESEARCH.md §3.2 (pay route .astro verbatim — owner-operator example)
    - .planning/phases/01-foundation-form-pay-engine/01-CONTEXT.md D-06, D-07, D-10 (representative dollar range for OO + CA/WA/NY/IL/CO/MD pay-transparency law per PAY-06), D-11 (placeholder fallback), D-24 (CTAs deep-link with ?role=…)
    - .planning/phases/01-foundation-form-pay-engine/01-UI-SPEC.md §"Surfaces in Scope" (route render mode = SSG .astro + MDX), §"Copywriting Contract" rows: section CTA "Apply now", banned phrases, page-level title patterns
    - .planning/phases/01-foundation-form-pay-engine/01-VALIDATION.md row 3 (build-output assertion: own canonical, JobPosting baseSalary, /pay 308)
    - src/data/pay.ts (real consumer of `pay.company.cpm`, `pay.ownerOperator.percentOfGross`, `pay.ownerOperator.representativeWeeklyNet` etc.)
    - src/layouts/Layout.astro (PayLayout wraps it via `<slot />`)
  </read_first>
  <behavior>
    **tests/build/pay-routes.spec.ts behaviors (run AFTER `pnpm build` produces dist/):**
    - Test 1: dist/pay/owner-operator/index.html exists AND dist/pay/company/index.html exists (proves SSG, not on-demand)
    - Test 2: Each HTML contains exactly one `<title>` element with role-specific text (owner-operator HTML title contains "Owner-Operator"; company HTML title contains "Company")
    - Test 3: Each HTML contains a `<link rel="canonical" href="...">` whose href ends with /pay/owner-operator or /pay/company respectively (canonical-to-self per PAY-01)
    - Test 4: Each HTML contains exactly one `<script type="application/ld+json">` block whose parsed JSON has @type: "JobPosting" and a non-zero baseSalary.value.minValue (SEO-04)
    - Test 5: Each HTML contains the literal "Effective:" string at least once (PAY-05 — every pay number adjacent to its date)
    - Test 6: HTML for OO route contains BOTH a percentage value (e.g., "65–72%") AND a dollar range (e.g., "$2,200–$3,800") — proves PAY-06 dollar-range-alongside-percentage
    - Test 7: Neither HTML contains any of the banned phrases: "competitive pay", "top of market", "top earners", "great pay", "industry-leading", "family", "we care", "freight", "your loads" (case-insensitive — PAY-07)
    - Test 8: Each HTML contains a section CTA `<a href="/apply?role=owner-operator">` or `<a href="/apply?role=company">` (FUNNEL-06 / D-24)
    - Test 9: dist/pay/index.html either does not exist OR exists with content < 200 bytes containing a meta-refresh / link to owner-operator (308 redirect via Astro.redirect emits a small HTML stub for static hosts that don't honor server-side redirects; Cloudflare Pages reads the response and emits real HTTP 308 — both states are valid for `pnpm build` output. The test asserts the OUTPUT contains the redirect target string `/pay/owner-operator`.)
    - Test 10: PayToggle pill on company HTML has `aria-current="page"` on the Company pill (and not on the OO pill), and vice versa for OO HTML
  </behavior>
  <action>
    1. **Write tests/build/pay-routes.spec.ts FIRST (RED)** — 10 test cases per the `<behavior>` block. The test reads from `dist/pay/owner-operator/index.html` and `dist/pay/company/index.html` (use Node `fs` since this is a build-output test). Wrap in a `beforeAll` that runs `pnpm build` (or assumes the test runner has already built — document both modes). Run — must fail because routes don't exist yet.

    2. **Create src/layouts/PayLayout.astro** — extends Layout with a PayToggle at the top of `<main>` and a PayDisclosureBlock at the bottom:
       ```astro
       ---
       import Layout from "./Layout.astro";
       import PayToggle from "../components/sections/PayToggle.astro";
       import PayDisclosureBlock from "../components/sections/PayDisclosureBlock.astro";
       interface Props { title: string; description?: string; role: "owner-operator" | "company"; effective: string; canonicalPath: string; }
       const { title, description, role, effective, canonicalPath } = Astro.props;
       ---
       <Layout title={title} description={description}>
         <Fragment slot="head">
           <link rel="canonical" href={`https://a2clogistics.com${canonicalPath}`} />
         </Fragment>
         <main class="max-w-3xl mx-auto px-4 md:px-8 lg:px-16 py-12">
           <PayToggle current={role} />
           <slot />
           <PayDisclosureBlock effective={effective} />
         </main>
       </Layout>
       ```
       NOTE: For the `<Fragment slot="head">` to work, Layout.astro needs a `<slot name="head" />` in its `<head>`. Add this to Layout.astro now (small edit) — placed AFTER the meta description but BEFORE the Font preload so canonical lands in standard position. If preferred, pass canonicalPath into Layout.astro as a Prop instead and let Layout render the canonical itself; that is the cleaner shape. **Use the Prop-based approach: extend Layout.astro Props with `canonical?: string` and have Layout emit `<link rel="canonical" href={canonical}>` when set.** Update PayLayout to forward this.

    3. **Create src/pages/pay/owner-operator.astro** based on RESEARCH.md §3.2, with these exact requirements:
       - Title: `Owner-Operator Pay & Terms — A2C Logistics`
       - Description: `Owner-operator pay at A2C Logistics CO. — percentage of gross, fast pay, fuel discount, and representative weekly net for Lincoln-region lanes. Effective ${oo.effective}.`
       - Canonical path: `/pay/owner-operator`
       - Render JobPostingJsonLd with role="owner-operator", payMin=oo.representativeWeeklyNet.min, payMax=oo.representativeWeeklyNet.max, payUnit="WEEK", effective=oo.effective (per D-12 — OO uses WEEK with weekly net)
       - H1: `Owner-operator pay at A2C` (font-display, large display size per UI-SPEC §Typography)
       - When `PAY_NUMBERS_ARE_PLACEHOLDER` is true → render `<PayPlaceholderBlock role="owner-operator" />` instead of the numbers tables. When false → render the full breakdown:
         - Take-home: PayBadge for `oo.percentOfGross` AND PayBadge for `oo.representativeWeeklyNet` (per PAY-06 — dollar range alongside percentage)
         - Fast pay: `${oo.fastPayHours}h settlement → fast pay`
         - Fuel discount: PayBadge if present
         - Settlement schedule: paragraph
         - Deductions: bulleted list iterating `oo.deductions[]` showing name + description + amount
         - Detention pay: PayBadge if present
       - Section CTA at end: `<a href="/apply?role=owner-operator" class="inline-block bg-brand-red text-brand-white font-display px-8 py-4 rounded min-h-12">Apply now</a>` (UI-SPEC §Copywriting "Apply now")

    4. **Create src/pages/pay/company.astro** — symmetric structure with these requirements:
       - Title: `Company Driver Pay & Benefits — A2C Logistics`
       - Description: `Company driver pay at A2C Logistics CO. — CPM range, sign-on bonus, fast pay, detention/layover, per-diem, and benefits. Effective ${co.effective}.`
       - Canonical path: `/pay/company`
       - Render JobPostingJsonLd with role="company", payMin=co.cpm.min, payMax=co.cpm.max, payUnit="MILE" (per D-12 — Company uses MILE for CPM per Google CDL guidance), effective=co.effective. (Note: the unitText for company is MILE not WEEK — matches Google's CDL hint.)
       - H1: `Company driver pay at A2C`
       - When PAY_NUMBERS_ARE_PLACEHOLDER → PayPlaceholderBlock role="company". Otherwise:
         - CPM: PayBadge for `co.cpm`
         - Sign-on bonus: PayBadge if present
         - Fast pay: `${co.fastPayHours}h`
         - Detention pay + layover pay: PayBadges
         - Per-diem: paragraph
         - Benefits: bulleted list iterating `co.benefits[]`
       - Section CTA: `<a href="/apply?role=company" ...>Apply now</a>`

    5. **Create src/pages/pay/index.astro** — minimal 308 redirect:
       ```astro
       ---
       return Astro.redirect("/pay/owner-operator", 308);
       ---
       ```
       (Astro emits this as both a server-side redirect AND a static fallback page with meta-refresh for the SSG path. With `output: "static"`, Astro generates `dist/pay/index.html` containing a redirect HTML page; the Cloudflare adapter ALSO emits a `_redirects` entry that Cloudflare Pages serves as HTTP 308. Both behaviors satisfy PAY-02.)

    6. **Run the build-output tests** — `pnpm build && pnpm test --run tests/build/pay-routes.spec.ts` — iterate on the route .astro files until all 10 tests pass (GREEN).
  </action>
  <verify>
    <automated>pnpm exec astro check && pnpm build && pnpm test --run tests/build/pay-routes.spec.ts && test -f dist/pay/owner-operator/index.html && test -f dist/pay/company/index.html && grep -q "Owner-Operator" dist/pay/owner-operator/index.html && grep -q "Company" dist/pay/company/index.html && grep -q 'rel="canonical"' dist/pay/owner-operator/index.html && grep -q 'rel="canonical"' dist/pay/company/index.html && grep -q "JobPosting" dist/pay/owner-operator/index.html && grep -q "JobPosting" dist/pay/company/index.html && grep -q "baseSalary" dist/pay/owner-operator/index.html && grep -q "Effective:" dist/pay/owner-operator/index.html && grep -q "Effective:" dist/pay/company/index.html && grep -q "/apply?role=owner-operator" dist/pay/owner-operator/index.html && grep -q "/apply?role=company" dist/pay/company/index.html && grep -q "/pay/owner-operator" dist/pay/index.html && (! grep -iE "competitive pay|top of market|top earners|great pay|industry-leading|we care" dist/pay/owner-operator/index.html) && (! grep -iE "competitive pay|top of market|top earners|great pay|industry-leading|we care" dist/pay/company/index.html)</automated>
  </verify>
  <acceptance_criteria>
    - All 10 build-output tests pass
    - `dist/pay/owner-operator/index.html` and `dist/pay/company/index.html` exist after `pnpm build`
    - Each pay HTML has a unique `<title>` (owner-operator title contains "Owner-Operator"; company title contains "Company")
    - Each pay HTML has `<link rel="canonical" href="https://a2clogistics.com/pay/owner-operator">` (or .../company) — canonical-to-self per PAY-01
    - Each pay HTML has exactly one `<script type="application/ld+json">` containing a JobPosting structure with non-empty baseSalary
    - The OO HTML output contains BOTH a percentage range (e.g., contains literal "%") AND a dollar range (e.g., contains literal "$") — proves PAY-06 representative dollar range alongside percentage
    - Each pay HTML contains the literal "Effective:" at least twice (every pay number gets a date stamp per PAY-05)
    - Each pay HTML contains a section CTA `<a href="/apply?role={role}">Apply now</a>` (FUNNEL-06 deep link per D-24)
    - `dist/pay/index.html` contains the path `/pay/owner-operator` (proves the 308 redirect was emitted, even if it lands as a meta-refresh stub for the static fallback)
    - Zero banned phrases (verified by grep returning nothing for each)
    - PayLayout (or Layout.astro updated with canonical Prop) is the canonical-emission point; routes do not duplicate the canonical link in their own frontmatter
  </acceptance_criteria>
  <done>Two real pay routes deployable to a Cloudflare Pages preview that a recruiter can hand to a driver. JSON-LD ready for Phase 3's Rich Results validation. Pay numbers driven from one typed file (per quarterly update). Toggle works without JS for the navigation; localStorage persists for return visits.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Search-engine crawler → SSG'd HTML | Crawler reads /pay/owner-operator and /pay/company directly; the JSON-LD is the only structured surface they parse. Any error here = no Google for Jobs eligibility. |
| Driver browser → /pay → 308 → /pay/owner-operator | Cloudflare Pages serves the 308 server-side; meta-refresh fallback in dist/pay/index.html is a backup for static-only hosts (not used in prod, but ships in build output). |
| Driver browser → localStorage | TogglePersistence writes `a2c.pay.role`. Untrusted client-side data; never reads back into server-side decisions. Server-side routes are the source of truth. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-1-W2-01 | Information Disclosure | JSON-LD baseSalary minValue/maxValue makes pay numbers crawler-readable forever (cached in Google Jobs and SERPs even after we update pay.ts) | accept | Per CONTEXT D-09 + D-11, ranges (not point numbers) and effective YYYY-MM make staleness self-identifying. Pay update cadence is quarterly per PROJECT.md. Risk = drivers see SERP showing 2026-05 effective date and a 2026-08 update has shipped — recruiter handles this in the call (Phase 3 SOP per OPS-03 covers "but the website said" objections). |
| T-1-W2-02 | Tampering | Adversary submits a PR changing `pay.ts` to wildly inflated numbers — JSON-LD then publishes false claims to Google for Jobs | mitigate | Schema enforces ranges + types. Real change-control gate is the GitHub PR review (developer + ops eyeballs every pay change). No automated mitigation in the code path; this is an organizational control. |
| T-1-W2-03 | Spoofing | Adversary registers a typo-domain (a2clogistic.com) and copies our /pay markup including JSON-LD; their fake JSON-LD points hiringOrganization.sameAs at our domain | accept | Cannot prevent third-party scraping. JSON-LD on the legitimate domain has the canonical hiringOrganization URL. Brand protection is a Phase 3 launch-checklist item (GMB + FMCSA SAFER as the trusted-source signal to Google). |
| T-1-W2-04 | Denial of Service | Heavy reliance on `pay.ts` import in JSON-LD generation — a malformed pay.ts breaks every pay route at build time | mitigate | Wave 1 PaySchema.parse(...) throws at build time on schema violation (the Vitest pay-schema test catches this in CI). Build-failure is fail-loud, not silent breakage. |
| T-1-W2-05 | Elevation of Privilege | TogglePersistence localStorage value `a2c.pay.role` overwritten by malicious cross-site script | accept | Same-origin storage isolation prevents this. No XSS surface in Phase 1 (all components emit static HTML; no user-controlled HTML insertion). The pre-fill of /apply form's role select is a UX nicety; server-side schema still validates the submitted role enum. |
</threat_model>

<verification>
- All 7 JSON-LD unit tests + all 10 build-output tests green
- `pnpm exec astro check` clean
- `pnpm build` produces dist/pay/owner-operator, dist/pay/company, dist/pay/index — all with the asserted markup
- Visual smoke (recommended but not gating): open `pnpm dev`, navigate to /pay → should redirect/render owner-operator; click Company pill → URL changes to /pay/company; refresh → same; navigate to /pay → on second visit, TogglePersistence redirects to last-chosen variant
- Banned-phrase grep returns zero matches across the entire dist/pay/ tree
</verification>

<success_criteria>
ROADMAP success criterion #3 ("/pay/owner-operator and /pay/company are SSG'd with own meta + JSON-LD; /pay 308s") and #4 ("OO ↔ Company toggle navigates between routes; localStorage persists; tel/sms in header+footer") both demonstrably satisfied at the build-output level. Wave 4 can wire the pay → /apply CTAs already because the section CTAs already deep-link with `?role=…`. Wave 5 will manually verify with a real-iPhone smoke test + Google Rich Results Test API call.
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-form-pay-engine/01-02-pay-routes-SUMMARY.md` capturing: which Google JobPosting fields are emitted (vs which are intentionally omitted because Phase 3 enriches them — e.g., applicationContact may be added later), whether the placeholder fallback is rendering (PAY_NUMBERS_ARE_PLACEHOLDER state at ship), final canonical URL pattern, and a snippet of the actual JSON-LD output for both routes for Phase 3 to feed to Rich Results.
</output>
