---
phase: 01-foundation-form-pay-engine
plan: 04
type: execute
wave: 4
depends_on: [01-02-pay-routes, 01-03-form-handler]
autonomous: true
files_modified:
  - src/content/legal/privacy.mdx
  - src/content/legal/sms-terms.mdx
  - src/content/legal/eeo.mdx
  - src/content/config.ts
  - src/components/sections/DraftBanner.astro
  - src/pages/[slug].astro
  - src/components/Header.astro
  - src/components/Footer.astro
  - src/data/recruiter.ts
requirements:
  - COMP-01
  - COMP-02
  - COMP-03
  - COMP-04
  - COMP-05
  - COMP-07
  - FUNNEL-06
  - FUNNEL-07
  - SITE-07
must_haves:
  truths:
    - "Privacy Policy, SMS Terms, and EEO Statement are live at /privacy, /sms-terms, /eeo and visibly marked 'Draft — pending counsel review'"
    - "Footer links all three legal pages on every page; apply form links Privacy + SMS Terms above the consent checkbox"
    - "Recruiter tel: + sms: links resolve from a single typed source (src/data/recruiter.ts) and appear in Header (mobile icon-only with aria-label) + Footer of every page"
    - "Header CTA ('Apply') routes to /apply on every page; pay-page CTAs deep-link with role= preserved"
    - "404 page is custom-branded with site nav + apply CTA (per UI-SPEC §empty-states + SITE-07)"
    - "Form schema rejects fields outside the EEOC-friendly whitelist (no SSN/MVR/DOB/marital/religion/etc.) — verified by Zod failing on extra keys"
  outcomes:
    - "A driver clicking 'Privacy Policy' from the footer or apply form sees a draft policy that names PII collected, retention period, and deletion request contact"
    - "Every page on the site exposes the recruiter phone via tel:+15551234567 (or chosen number) with click-to-call working from mobile Safari"
    - "A driver landing on /404 sees site nav + Apply CTA, never a dead-end"
  artifacts:
    - path: "src/content/legal/privacy.mdx"
      provides: "Draft Privacy Policy MDX with frontmatter + DraftBanner"
      contains: "draft: true"
    - path: "src/content/legal/sms-terms.mdx"
      provides: "Draft SMS Terms covering TCPA frequency cap, opt-out, 'consent isn't a condition'"
      contains: "STOP"
    - path: "src/content/legal/eeo.mdx"
      provides: "Draft EEO Statement"
      contains: "equal employment opportunity"
    - path: "src/components/sections/DraftBanner.astro"
      provides: "Reusable banner: 'Draft — pending counsel review (Phase 3)'"
      contains: "pending counsel review"
    - path: "src/pages/[slug].astro"
      provides: "Astro dynamic route rendering MDX entries from the legal collection"
      contains: "getCollection"
    - path: "src/data/recruiter.ts"
      provides: "Single source of truth for recruiter phone (tel + sms-display + raw E.164)"
      contains: "export const recruiter"
    - path: "src/pages/404.astro"
      provides: "Custom 404 with site nav + Apply CTA"
      contains: "Apply"
  key_links:
    - from: "Footer.astro"
      to: "/privacy /sms-terms /eeo"
      via: "anchor links in <ul>"
      pattern: "href=\"/privacy\""
    - from: "Header.astro + Footer.astro"
      to: "tel:/sms:"
      via: "src/data/recruiter.ts"
      pattern: "import.*recruiter.*from"
---

<objective>
Wire the persistent CTA + recruiter contact links across Header/Footer, ship the three draft compliance pages (Privacy / SMS Terms / EEO) with a clear "Draft — pending counsel review" banner, and add a custom 404 so drivers never hit a dead end. This wave finishes the conversion wrapper around Wave 2's pay routes and Wave 3's apply form.

Purpose: Wave 3 ships /apply with a real consent block but the consent text references SMS Terms and Privacy that don't exist yet — this wave creates the linked-to documents. Header/Footer ship in Wave 1 as primitives; this wave specializes them with real recruiter contact data and explicit Apply routing.

Output: Every page has a working "Apply" CTA + recruiter tel:/sms: link, the three legal pages are live and linked, and a custom 404 catches typos.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/phases/01-foundation-form-pay-engine/01-CONTEXT.md
@.planning/phases/01-foundation-form-pay-engine/01-RESEARCH.md
@.planning/phases/01-foundation-form-pay-engine/01-UI-SPEC.md
</context>

<tasks>

<task type="auto">
  <name>Task 4.1: Recruiter contact data + Header/Footer specialization</name>
  <files>src/data/recruiter.ts, src/components/Header.astro, src/components/Footer.astro</files>
  <read_first>
    - .planning/phases/01-foundation-form-pay-engine/01-RESEARCH.md §§5.2 + 5.3 (Header.astro and Footer.astro template code)
    - .planning/phases/01-foundation-form-pay-engine/01-UI-SPEC.md §"Copywriting" (Apply CTA wording, recruiter aria-labels)
    - .planning/phases/01-foundation-form-pay-engine/01-UI-SPEC.md §"Spacing" + §"Color" (header height, button sizing)
    - .planning/phases/01-foundation-form-pay-engine/01-CONTEXT.md D-25 (single tracked recruiter number — content-readiness blocker)
    - src/components/Header.astro and src/components/Footer.astro from Wave 1 (current state — must merge, not overwrite primitives)
  </read_first>
  <action>
    1. **Create src/data/recruiter.ts** — single typed source of truth:
       ```ts
       export const recruiter = {
         e164: "+15551234567",          // PLACEHOLDER — recruiting team supplies
         displayPretty: "(555) 123-4567",
         smsBody: "Hi A2C — I'd like to apply",
       } as const;
       ```
       Add a top-of-file comment: `// PLACEHOLDER number — single tracked recruiter line per CONTEXT D-25 (Pitfall 4 / TCPA hygiene). Replace before launch.`

    2. **Update src/components/Header.astro** to use `recruiter.e164`/`displayPretty` for an icon-only mobile tel link (Phone icon from `lucide-astro`, `aria-label="Call recruiter"`) and verbose desktop link. Keep the existing logo + Apply CTA from Wave 1; only add the recruiter element. The Apply button must `href="/apply"` (no query param at this surface — deep-linking happens from pay pages).

    3. **Update src/components/Footer.astro** to import and render `recruiter.e164` in the tel: + sms:?body= links (URL-encode `recruiter.smsBody`). Display `recruiter.displayPretty` as the visible label. Add a "Legal" column with three anchor links: `<a href="/privacy">Privacy Policy</a>`, `<a href="/sms-terms">SMS Terms</a>`, `<a href="/eeo">EEO Statement</a>`. Keep the existing MC#/USDOT# placeholder slots (real numbers TBD per CONTEXT — see Phase 2 plan).

    4. **Verify the existing pay-page CTAs deep-link `?role=`** — read src/pages/pay/owner-operator.astro and src/pages/pay/company.astro from Wave 2; their Apply buttons must point to `/apply?role=owner-operator` and `/apply?role=company` respectively. If Wave 2 omitted the query param, add it here (small inline fix is OK — this wave's job is to verify the CTA chain works end-to-end).
  </action>
  <verify>
    <automated>test -f src/data/recruiter.ts && grep -q "export const recruiter" src/data/recruiter.ts && grep -q "import.*recruiter" src/components/Header.astro && grep -q "import.*recruiter" src/components/Footer.astro && grep -q 'href="/privacy"' src/components/Footer.astro && grep -q 'href="/sms-terms"' src/components/Footer.astro && grep -q 'href="/eeo"' src/components/Footer.astro && grep -q 'aria-label="Call recruiter"' src/components/Header.astro && grep -q 'href="/apply"' src/components/Header.astro && grep -q 'role=owner-operator' src/pages/pay/owner-operator.astro && grep -q 'role=company' src/pages/pay/company.astro && pnpm exec astro check && pnpm build</automated>
  </verify>
  <acceptance_criteria>
    - `src/data/recruiter.ts` exports `recruiter` const with `e164`, `displayPretty`, `smsBody` fields
    - `src/components/Header.astro` imports `recruiter`, renders an `<a href={`tel:${recruiter.e164}`}>` with `aria-label="Call recruiter"`, and the Apply button targets `href="/apply"`
    - `src/components/Footer.astro` imports `recruiter` and renders both `tel:` and `sms:?body=...` links plus three legal anchors (`/privacy`, `/sms-terms`, `/eeo`)
    - Pay-page CTAs deep-link `/apply?role=owner-operator` and `/apply?role=company` (verified by grep)
    - `pnpm exec astro check && pnpm build` exit 0
  </acceptance_criteria>
  <done>Persistent recruiter contact + Apply CTA + Legal links live across Header and Footer; pay-page CTAs deep-link role state.</done>
</task>

<task type="auto">
  <name>Task 4.2: Legal MDX content collection + dynamic [slug] route + DraftBanner component</name>
  <files>src/content/config.ts, src/content/legal/privacy.mdx, src/content/legal/sms-terms.mdx, src/content/legal/eeo.mdx, src/components/sections/DraftBanner.astro, src/pages/[slug].astro</files>
  <read_first>
    - .planning/phases/01-foundation-form-pay-engine/01-RESEARCH.md §6 (compliance-drafts pattern + collection schema)
    - .planning/phases/01-foundation-form-pay-engine/01-UI-SPEC.md §"Empty / Draft States" (DraftBanner copy + visual)
    - .planning/phases/01-foundation-form-pay-engine/01-CONTEXT.md D-35, D-36 (drafts ship now, counsel review is Phase 3 COMP-06)
    - src/content/config.ts (current state from Wave 1 — MUST extend, not overwrite)
  </read_first>
  <action>
    1. **Extend src/content/config.ts** to add the `legal` collection (in addition to whatever Wave 1 already declared for pages/pay-content/etc.):
       ```ts
       import { defineCollection, z } from "astro:content";

       const legal = defineCollection({
         type: "content",
         schema: z.object({
           title: z.string(),
           slug: z.string(),
           draft: z.boolean().default(true),
           effective: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
         }),
       });

       export const collections = {
         /* preserve any existing collections */,
         legal,
       };
       ```

    2. **Create src/components/sections/DraftBanner.astro** — small component:
       ```astro
       <aside role="note" class="bg-yellow-50 border-l-4 border-brand-red p-4 my-6 text-sm">
         <p class="font-display text-brand-black">Draft — pending counsel review (Phase 3)</p>
         <p class="mt-1">This document is a working draft. Counsel-reviewed final copy ships before public launch.</p>
       </aside>
       ```

    3. **Create src/content/legal/privacy.mdx** — uses standard recruiting-site privacy template. Frontmatter:
       ```yaml
       ---
       title: Privacy Policy
       slug: privacy
       draft: true
       ---
       ```
       Body sections (each with H2):
       - `## What we collect` — name, phone, email, CDL class, years of experience, role preference, state, IP, user agent, consent metadata. Explicitly NOT collected: SSN, DOB, MVR, full DOT history, arrest history, marital status, family status, religion, national origin, disability, gender.
       - `## How we use it` — recruiter follow-up by call/text within 24 hours; nothing else.
       - `## Who we share it with` — A2C Logistics CO. recruiting team only; not sold; not shared with marketing partners.
       - `## How long we keep it` — 24 months unless driver requests earlier deletion.
       - `## How to request deletion` — email `privacy@a2clogisticsco.com` (PLACEHOLDER) with subject "Delete my application data".
       - `## Cookies & analytics` — Plausible (cookieless) when enabled in Phase 3; no third-party trackers.
       Import and render `<DraftBanner />` immediately after the H1.

    4. **Create src/content/legal/sms-terms.mdx** — TCPA-compliant:
       ```yaml
       ---
       title: SMS Terms
       slug: sms-terms
       draft: true
       ---
       ```
       Body sections (each with H2):
       - `## Consent is not a condition of employment` — applying does not require opting in to SMS; opt-in is solely to receive recruiter follow-up texts.
       - `## What you'll receive` — up to 4 recruiter texts per month relating to your application; standard message and data rates apply.
       - `## How to stop` — reply STOP to any A2C recruiting text. We honor STOP within 24 hours across all A2C contact channels.
       - `## How to get help` — reply HELP or call (placeholder recruiter number from data/recruiter.ts).
       - `## Carriers and message types` — supported on US carriers; A2C is not liable for carrier delays.
       - `## Consent version` — current version: `tcpa_consent_v1` (matches form submission stamp).
       Render `<DraftBanner />` after the H1.

    5. **Create src/content/legal/eeo.mdx** — standard EEO statement:
       ```yaml
       ---
       title: Equal Employment Opportunity
       slug: eeo
       draft: true
       ---
       ```
       Body: standard EEO statement language — A2C Logistics CO. is an equal-opportunity employer; hiring decisions are based on qualifications, experience, and business need; no discrimination on race/color/religion/sex/national origin/age/disability/genetic information/veteran status; reasonable accommodation available on request.
       Render `<DraftBanner />` after the H1.

    6. **Create src/pages/[slug].astro** — dynamic route rendering legal entries:
       ```astro
       ---
       import { getCollection, getEntry } from "astro:content";
       import Layout from "../layouts/Layout.astro";

       export async function getStaticPaths() {
         const entries = await getCollection("legal");
         return entries.map(entry => ({
           params: { slug: entry.data.slug },
           props: { entry },
         }));
       }

       const { entry } = Astro.props;
       const { Content } = await entry.render();
       ---
       <Layout title={`${entry.data.title} — A2C Logistics`} noindex={true}>
         <main class="max-w-3xl mx-auto px-4 py-12 prose">
           <h1 class="font-display text-display-lg">{entry.data.title}</h1>
           <Content />
         </main>
       </Layout>
       ```
       Each legal page is `noindex` per UI-SPEC §SEO + ROADMAP Phase 3 SEO-07.
  </action>
  <verify>
    <automated>test -f src/content/legal/privacy.mdx && test -f src/content/legal/sms-terms.mdx && test -f src/content/legal/eeo.mdx && test -f src/components/sections/DraftBanner.astro && test -f src/pages/[slug].astro && grep -q "draft: true" src/content/legal/privacy.mdx && grep -q "STOP" src/content/legal/sms-terms.mdx && grep -q "equal" src/content/legal/eeo.mdx && grep -q "tcpa_consent_v1" src/content/legal/sms-terms.mdx && grep -q "pending counsel review" src/components/sections/DraftBanner.astro && grep -q "getCollection" src/pages/[slug].astro && grep -q "noindex" src/pages/[slug].astro && grep -q "legal" src/content/config.ts && pnpm exec astro check && pnpm build && test -f dist/privacy/index.html && test -f dist/sms-terms/index.html && test -f dist/eeo/index.html</automated>
  </verify>
  <acceptance_criteria>
    - `src/content/config.ts` declares the `legal` collection with `title`, `slug`, `draft`, `effective` schema
    - All three MDX files exist with `draft: true` frontmatter and import the DraftBanner
    - `src/content/legal/sms-terms.mdx` contains literal `STOP`, `HELP`, and `tcpa_consent_v1` strings
    - `src/components/sections/DraftBanner.astro` renders "Draft — pending counsel review (Phase 3)"
    - `src/pages/[slug].astro` uses `getCollection("legal")` for static-paths and renders entries with `noindex` meta
    - `pnpm build` produces `dist/privacy/index.html`, `dist/sms-terms/index.html`, `dist/eeo/index.html`
    - `pnpm exec astro check && pnpm build` exit 0
  </acceptance_criteria>
  <done>Three draft compliance pages live at /privacy, /sms-terms, /eeo with DraftBanner; collection wired; Footer links resolve to real pages.</done>
</task>

<task type="auto">
  <name>Task 4.3: Custom 404 page</name>
  <files>src/pages/404.astro</files>
  <read_first>
    - .planning/phases/01-foundation-form-pay-engine/01-UI-SPEC.md §"Empty / Draft States" (404 copy + apply CTA)
    - .planning/phases/01-foundation-form-pay-engine/01-CONTEXT.md (SITE-07 — 404 with nav + apply CTA)
    - src/layouts/Layout.astro (current state — reuse the layout)
  </read_first>
  <action>
    Create `src/pages/404.astro`:
    ```astro
    ---
    import Layout from "../layouts/Layout.astro";
    ---
    <Layout title="Page not found — A2C Logistics" noindex={true}>
      <main class="max-w-xl mx-auto px-4 py-24 text-center">
        <p class="font-display text-brand-red text-sm tracking-widest uppercase">404</p>
        <h1 class="font-display text-display-lg mt-4">That page isn't here.</h1>
        <p class="text-body mt-6">Let's get you back on the road. Try one of these:</p>
        <ul class="mt-6 space-y-3">
          <li><a href="/" class="underline font-display">Home</a></li>
          <li><a href="/pay/owner-operator" class="underline font-display">Owner-operator pay</a></li>
          <li><a href="/pay/company" class="underline font-display">Company driver pay</a></li>
          <li><a href="/apply" class="underline font-display">Apply now</a></li>
        </ul>
      </main>
    </Layout>
    ```
    Ensure `noindex={true}` on the layout call (per UI-SPEC §SEO).
  </action>
  <verify>
    <automated>test -f src/pages/404.astro && grep -q "404" src/pages/404.astro && grep -q '"/apply"' src/pages/404.astro && grep -q "noindex" src/pages/404.astro && pnpm exec astro check && pnpm build && test -f dist/404.html</automated>
  </verify>
  <acceptance_criteria>
    - `src/pages/404.astro` exists with site nav + Apply CTA
    - Page is `noindex`
    - `pnpm build` produces `dist/404.html` (Astro emits 404 from this file convention)
  </acceptance_criteria>
  <done>Custom 404 catches dead URLs with nav + apply CTA; never a dead end.</done>
</task>

</tasks>

<verification>
  <commands>
    - pnpm exec astro check
    - pnpm build
    - curl -s http://localhost:4321/privacy | grep -q "pending counsel review"
    - curl -s http://localhost:4321/sms-terms | grep -q "STOP"
    - curl -s http://localhost:4321/eeo | grep -q "equal"
    - curl -s http://localhost:4321/404 | grep -q "Apply"
    - grep -r 'href="/apply"' dist/ | wc -l (should be > 0 — Apply CTA in every page's header)
  </commands>
</verification>

<summary_path>.planning/phases/01-foundation-form-pay-engine/01-04-SUMMARY.md</summary_path>
