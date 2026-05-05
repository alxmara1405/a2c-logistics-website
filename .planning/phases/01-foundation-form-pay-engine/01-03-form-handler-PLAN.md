---
phase: 01-foundation-form-pay-engine
plan: 03
type: execute
wave: 3
depends_on:
  - 01-foundation-form-pay-engine/01
autonomous: true
files_modified:
  - src/actions/index.ts
  - src/lib/sinks/types.ts
  - src/lib/sinks/email-sink.ts
  - src/lib/sinks/sheet-sink.ts
  - src/lib/sinks/dispatch.ts
  - src/lib/turnstile.ts
  - src/lib/security.ts
  - src/lib/alerts.ts
  - src/components/islands/ApplyForm.tsx
  - src/pages/apply.astro
  - src/pages/apply/success.astro
  - src/pages/_internal/synthetic-submit.ts
  - tests/unit/security.spec.ts
  - tests/unit/dispatch.spec.ts
  - tests/unit/email-sink.spec.ts
  - tests/unit/sheet-sink.spec.ts
  - tests/unit/turnstile.spec.ts
  - package.json
requirements:
  - SITE-02
  - FUNNEL-01
  - FUNNEL-02
  - FUNNEL-03
  - FUNNEL-04
  - FUNNEL-05
  - FUNNEL-06
  - FUNNEL-07
  - FUNNEL-08
  - SEC-01
  - SEC-02
  - SEC-03
  - SEC-04
  - SEC-05
  - COMP-02
  - HOST-01
  - HOST-02
  - HOST-04
  - OPS-02
must_haves:
  truths:
    - "Form submits via Astro Action at /_actions/apply running on Cloudflare Pages Function with nodejs_compat"
    - "LeadSink interface implemented by EmailSink (REQUIRED, Resend) and SheetSink (OPTIONAL, jose+fetch — NOT googleapis)"
    - "dispatchLead awaits all sinks in parallel; required-failure throws (user sees error); optional-failure queues to LEAD_FALLBACK KV + alerts but user sees success"
    - "Turnstile token verified server-side via siteverify before any sink dispatch"
    - "Honeypot-filled submissions return silent 200-OK without dispatching (don't tip bots)"
    - "Origin check rejects submissions whose Origin header is not the production domain or a configured *.pages.dev preview"
    - "IP rate limit: 4th submission within 10 minutes from same IP returns 429 (3 allowed)"
    - "Idempotency key (UUID v4) deduplicates double-tap submissions for 10 minutes via IDEMPOTENCY KV"
    - "Lead emails include consent metadata: consentVersion, formVersion, timestamp, IP, UA"
    - "Sheet rows include the same consent metadata in the row schema"
    - "Synthetic submission endpoint at /_internal/synthetic-submit accepts a shared-secret header and exercises the full sink path with a synthetic: true flagged row"
    - "ApplyForm React island: progressive enhancement — works as native POST without JS; React hydrates for live Conform/Zod validation"
    - "Failure-state UX: any error renders recruiter tel + sms inline (never a dead end per CONTEXT specifics)"
    - "/apply/success is noindex'd, displays recruiter tel/sms fallback, pre-fills returning OO/Company selection from URL"
  artifacts:
    - path: "src/actions/index.ts"
      provides: "Astro Action `apply` defined via defineAction with form input + leadSchema + layered security checks + dispatchLead"
      contains: "defineAction"
    - path: "src/lib/sinks/types.ts"
      provides: "LeadSink interface (name, required, dispatch) + LeadSinkResult type"
      exports: ["LeadSink", "LeadSinkResult"]
    - path: "src/lib/sinks/email-sink.ts"
      provides: "Resend-based REQUIRED sink"
      exports: ["emailSink"]
    - path: "src/lib/sinks/sheet-sink.ts"
      provides: "Google Sheets via jose JWT + fetch — OPTIONAL sink"
      exports: ["sheetSink"]
    - path: "src/lib/sinks/dispatch.ts"
      provides: "dispatchLead — parallel sink fan-out with partial-failure semantics + KV fallback + alert wiring"
      exports: ["dispatchLead"]
    - path: "src/lib/turnstile.ts"
      provides: "verifyTurnstile — POSTs token to challenges.cloudflare.com/turnstile/v0/siteverify"
      exports: ["verifyTurnstile"]
    - path: "src/lib/security.ts"
      provides: "checkOrigin, checkRateLimit, checkIdempotency"
      exports: ["checkOrigin", "checkRateLimit", "checkIdempotency"]
    - path: "src/lib/alerts.ts"
      provides: "fireAlert — webhook (if configured) + redundant Resend email"
      exports: ["fireAlert"]
    - path: "src/components/islands/ApplyForm.tsx"
      provides: "React form island with Conform+Zod, Turnstile widget, honeypot, idempotency UUID, role/state/cdlClass/yearsExperience selectors, TCPA consent checkbox, error-state with tel/sms"
      contains: "actions.apply"
    - path: "src/pages/apply.astro"
      provides: "/apply route — Layout wrapper + h1 + ApplyForm island (client:load)"
      contains: "ApplyForm"
    - path: "src/pages/apply/success.astro"
      provides: "/apply/success — noindex, recruiter tel/sms fallback, role-aware copy"
      contains: "noindex"
    - path: "src/pages/_internal/synthetic-submit.ts"
      provides: "Cron-target endpoint that submits a synthetic flagged lead through dispatchLead and alerts on failure"
      contains: "X-Synthetic-Secret"
  key_links:
    - from: "src/actions/index.ts"
      to: "src/lib/validation/lead-schema.ts (Wave 1)"
      via: "named import `leadSchema` used as defineAction input schema"
      pattern: "import.*leadSchema"
    - from: "src/components/islands/ApplyForm.tsx"
      to: "src/lib/validation/lead-schema.ts (Wave 1)"
      via: "named import `leadSchema` used by parseWithZod (same schema as server — SEC-05)"
      pattern: "import.*leadSchema"
    - from: "src/actions/index.ts"
      to: "src/lib/sinks/dispatch.ts AND src/lib/turnstile.ts AND src/lib/security.ts"
      via: "named imports"
      pattern: "import.*dispatchLead"
    - from: "src/lib/sinks/dispatch.ts"
      to: "Astro.locals.runtime.env.LEAD_FALLBACK (Wave 0 KV binding)"
      via: "env.LEAD_FALLBACK.put on optional-sink failure"
      pattern: "LEAD_FALLBACK"
    - from: "src/lib/security.ts"
      to: "Astro.locals.runtime.env.IDEMPOTENCY AND env.RATELIMIT (Wave 0 KV bindings)"
      via: "env.IDEMPOTENCY.get/put + env.RATELIMIT.get/put"
      pattern: "IDEMPOTENCY|RATELIMIT"
    - from: "src/pages/_internal/synthetic-submit.ts"
      to: "Cloudflare Cron Trigger (Wave 0 wrangler.toml [triggers])"
      via: "Cron POSTs to /_internal/synthetic-submit with X-Synthetic-Secret header"
      pattern: "X-Synthetic-Secret"
---

<objective>
Ship the entire form pipeline: Astro Action handler with layered security (Turnstile + honeypot + origin + rate-limit + idempotency), the LeadSink adapter pattern with concrete EmailSink (Resend, REQUIRED) + SheetSink (jose+fetch, OPTIONAL), parallel sink dispatch with partial-failure tolerance + KV fallback + alerting, the React form island with Conform + Zod, the /apply page + /apply/success page, and the daily synthetic-submission endpoint that the Wave 0 cron will exercise.

Purpose: ROADMAP success criteria #1 (iPhone submit → email + Sheet within 60s with consent metadata), #2 (break Sheet → email still delivers + KV fallback + alert + success state), #5 (form rejects bad-origin / no-Turnstile / honeypot / 4th-in-10min). Together these are the catastrophic-failure-mode prevention work — silent form failure is THE thing that kills a single-conversion-goal driver-recruiting site.

Output: A production-ready conversion path. Every CTA in Wave 2 (pay routes) and Wave 4 (compliance + wire-up) reaches a real durable endpoint that the recruiter receives within 60s and that survives Sheet outages without losing leads.
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
@src/lib/validation/lead-schema.ts
@src/data/recruiter.ts
@src/layouts/Layout.astro
@src/env.d.ts
@src/components/ui/button.tsx
@src/components/ui/input.tsx
@src/components/ui/select.tsx
@src/components/ui/checkbox.tsx
@src/components/ui/label.tsx

<interfaces>
<!-- LeadSink contract — Wave 1 lead-schema + Wave 0 env bindings are inputs -->

```ts
// src/lib/sinks/types.ts (this wave creates)
import type { Lead } from "../validation/lead-schema";
export interface LeadSinkResult { ok: boolean; error?: string }
export interface LeadSink {
  name: string;
  required: boolean;
  dispatch(lead: Lead, env: any): Promise<LeadSinkResult>;
}
```

```ts
// dispatchLead contract (this wave creates) — used by both /actions/index.ts AND /_internal/synthetic-submit.ts
export async function dispatchLead(
  lead: Lead,
  env: Runtime["env"],
  ctx: { request: Request }
): Promise<{ leadId: string; sinkStatus: Record<string, "ok" | "failed"> }>;
```

```ts
// Astro Action signature (this wave creates) — consumed by ApplyForm.tsx
import { actions } from "astro:actions";
const { data, error } = await actions.apply(formData);
// data: { ok: true, leadId: string, sinkStatus: { email: "ok"|"failed", sheet: "ok"|"failed" } }
// error: ActionError with code BAD_REQUEST | FORBIDDEN | TOO_MANY_REQUESTS | INTERNAL_SERVER_ERROR
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 3.1: Sinks (types + email + sheet) + security middleware + alerts + dispatchLead — with unit tests</name>
  <files>src/lib/sinks/types.ts, src/lib/sinks/email-sink.ts, src/lib/sinks/sheet-sink.ts, src/lib/sinks/dispatch.ts, src/lib/turnstile.ts, src/lib/security.ts, src/lib/alerts.ts, tests/unit/security.spec.ts, tests/unit/dispatch.spec.ts, tests/unit/email-sink.spec.ts, tests/unit/sheet-sink.spec.ts, tests/unit/turnstile.spec.ts, package.json</files>
  <read_first>
    - .planning/phases/01-foundation-form-pay-engine/01-RESEARCH.md §§2.3 (sinks verbatim — types, email-sink, sheet-sink, dispatch), §2.4 (turnstile + security verbatim), §2.5 (alerts verbatim)
    - .planning/phases/01-foundation-form-pay-engine/01-CONTEXT.md D-13 (nodejs_compat for Resend), D-14 (LeadSink interface), D-15 (partial-failure semantics), D-16 (alerting), D-17 (synthetic submission flagged row), D-18 (idempotency key), D-26 (Turnstile siteverify), D-28 (origin check), D-29 (rate limit 3/10min)
    - .planning/phases/01-foundation-form-pay-engine/01-UI-SPEC.md §"Source Inventory" row "TCPA consent constant tcpa_consent_v1" + §"Copywriting Contract" row TCPA consent label (must be the same text the email/sheet sink stamps)
    - https://resend.com/docs (verify SDK signature for `resend.emails.send`)
    - https://developers.cloudflare.com/turnstile/get-started/server-side-validation/ (verify siteverify endpoint format)
    - src/lib/validation/lead-schema.ts (Wave 1 — to know `Lead` shape exactly)
    - src/env.d.ts (to know runtime env shape — KV bindings + secret names)
  </read_first>
  <behavior>
    **tests/unit/turnstile.spec.ts behaviors:**
    - Test 1: verifyTurnstile returns true when fetch resolves to {success: true}
    - Test 2: returns false when fetch resolves to {success: false}
    - Test 3: returns false when fetch throws
    - Test 4: POSTs to https://challenges.cloudflare.com/turnstile/v0/siteverify with form-encoded body containing the secret + token

    **tests/unit/security.spec.ts behaviors:**
    - Test 1 (checkOrigin): returns true for "https://a2clogistics.com"; true for "https://www.a2clogistics.com"; true for "https://abc-123.a2c-logistics.pages.dev"; false for "https://evil.com"; false when Origin header missing
    - Test 2 (checkRateLimit): with no prior submissions, returns true and stores 1 entry. With 3 prior entries within window, returns false (4th rejected). With 3 prior entries OUTSIDE the 10-min window (older timestamps), prunes them and returns true.
    - Test 3 (checkRateLimit): different IPs do NOT share counters
    - Test 4 (checkIdempotency): unseen key returns true and writes `idem:{key}` to KV. Re-submitting same key returns false (dedup).

    **tests/unit/dispatch.spec.ts behaviors:**
    - Test 1: All sinks succeed → returns sinkStatus { email: "ok", sheet: "ok" }; no KV write to LEAD_FALLBACK; no alert fires
    - Test 2: SheetSink fails (returns {ok: false, error: "..."}) → returns success with sinkStatus { email: "ok", sheet: "failed" }; KV LEAD_FALLBACK gets a put with the lead JSON + failedSinks: ["sheet"]; fireAlert called with type="OPTIONAL_SINK_FAILED"
    - Test 3: EmailSink fails → THROWS (so the Action propagates ActionError); fireAlert called with type="REQUIRED_SINK_FAILED"; NO success returned to user
    - Test 4: Both fail → throws (required failure dominates); fireAlert called once for REQUIRED_SINK_FAILED with both failures listed
    - Test 5: KV fallback row includes lead.idempotencyKey as the storage key prefix (`lead:${idempotencyKey}`) and 30-day TTL

    **tests/unit/email-sink.spec.ts behaviors:**
    - Test 1: Successful Resend call returns {ok: true}
    - Test 2: Resend returns {error: {message: "..."}} → returns {ok: false, error: "..."}
    - Test 3: Network throw → returns {ok: false, error: "..."} (does NOT throw out of dispatch)
    - Test 4: Subject line contains lead.firstName + lead.lastName + lead.role + lead.state per spec
    - Test 5: Body text includes consent metadata: consentVersion, formVersion, idempotencyKey, IP placeholder, UA placeholder, timestamp ISO

    **tests/unit/sheet-sink.spec.ts behaviors:**
    - Test 1: Successful Sheets append returns {ok: true}
    - Test 2: Non-2xx response returns {ok: false, error: "Sheets API ${status}: ..."}
    - Test 3: Throw during JWT signing returns {ok: false, error: ...}
    - Test 4: Row includes the consent metadata fields in their declared order (timestamp, idempotencyKey, firstName, lastName, phone, email, cdlClass, yearsExperience, role, state, consentVersion, formVersion)
  </behavior>
  <action>
    1. **Install runtime deps:**
       ```bash
       pnpm add resend@^6.12 jose@^5 @marsidev/react-turnstile@^1.5 @conform-to/react @conform-to/zod
       ```
       Verify versions in package.json match RESEARCH.md §1 ("Installation"). Note: `googleapis` is explicitly NOT installed — RESEARCH §2.3 documents the rationale (too heavy for nodejs_compat; jose is 30KB and edge-native).

    2. **Write all 5 test files FIRST (RED phase)** — turnstile.spec.ts, security.spec.ts, dispatch.spec.ts, email-sink.spec.ts, sheet-sink.spec.ts — per the `<behavior>` block. For tests that need to mock fetch / KV / Resend, use `vi.fn()` and inject via the env stub from `tests/setup.ts`. For sheet-sink test, mock the `jose` module's `SignJWT` and `importPKCS8` and the `fetch` calls to oauth2.googleapis.com + sheets.googleapis.com. Run `pnpm test --run tests/unit/` — every test fails because no implementation exists.

    3. **Create src/lib/sinks/types.ts** verbatim from RESEARCH.md §2.3 first block (LeadSinkResult + LeadSink interface). Add JSDoc explaining `required: true` semantics ("failure throws and surfaces error to user; required sinks must dispatch successfully for the lead to be considered delivered").

    4. **Create src/lib/sinks/email-sink.ts** verbatim from RESEARCH.md §2.3, with these refinements:
       - `formatLeadText(lead: Lead): string` — produces the email body. Include EVERY field the recruiter needs to call/text the driver:
         ```
         New driver lead — ${lead.firstName} ${lead.lastName}
         ─────────────────────────────────────────
         Role:           ${lead.role === "owner-operator" ? "Owner-Operator" : "Company Driver"}
         Phone:          ${lead.phone}
         Email:          ${lead.email}
         CDL class:      ${lead.cdlClass}
         Years driving:  ${lead.yearsExperience}
         State:          ${lead.state}

         CONSENT METADATA (TCPA / COMP-02):
         consentVersion: ${lead.consentVersion}
         formVersion:    ${lead.formVersion}
         idempotencyKey: ${lead.idempotencyKey}
         timestamp:      ${new Date().toISOString()}
         ```
         (IP and UA are NOT in `lead` — they come from the request and are added in dispatch.ts via a metadata enrichment step. For now, add a `meta?: { ip?: string; ua?: string }` optional second parameter to `formatLeadText` and include them in the body when present. dispatch.ts will pass these.)
       - Subject: `New driver lead — ${lead.firstName} ${lead.lastName} (${lead.role}, ${lead.state})`
       - If `lead.synthetic === true` → prefix subject with `[SYNTHETIC TEST]` so the recruiter does NOT contact a fake lead. (Note: `synthetic` is NOT in lead-schema; for the synthetic endpoint, dispatch will pass it via the meta object instead. Update logic accordingly: subject prefix is `meta?.synthetic ? "[SYNTHETIC TEST] " : ""`.)
       Run email-sink.spec.ts until all 5 tests pass.

    5. **Create src/lib/sinks/sheet-sink.ts** verbatim from RESEARCH.md §2.3 — uses `jose` (NOT googleapis) for JWT signing per the rationale block. The row schema must match the Google Sheet header row that the user_setup task created in Wave 0 (`timestamp, idempotencyKey, firstName, lastName, phone, email, cdlClass, yearsExperience, role, state, consentVersion, formVersion`). Add an extra `synthetic` column at the end if `meta?.synthetic` is true, OR put the row in a separate "SyntheticTests" tab (preferred — keeps real leads clean). Use the simpler approach: append a 13th value `meta?.synthetic ? "SYNTHETIC" : ""` to every row so the recruiter can filter the sheet.
       Run sheet-sink.spec.ts until all 4 tests pass.

    6. **Create src/lib/turnstile.ts** verbatim from RESEARCH.md §2.4 first block. Run turnstile.spec.ts until all 4 pass.

    7. **Create src/lib/security.ts** verbatim from RESEARCH.md §2.4 second block, with these refinements:
       - `checkOrigin`: the allowed list should be a `const` array. Make the production domain replaceable via env: read `env.PRODUCTION_ORIGIN` if set, else default to `"https://a2clogistics.com"`. (The discussion-log decision was the production domain is TBD; this lets Wave 5 / Phase 3 cutover swap it without code change.) Update `src/env.d.ts` to add `PRODUCTION_ORIGIN?: string` to the Runtime type.
       - `checkRateLimit`: 10-minute sliding window via timestamp array in KV per CONTEXT D-29. Add a defensive `Array.isArray()` check on the existing value (KV can return null or malformed JSON if corrupted).
       - `checkIdempotency`: store `"1"` value with 600s TTL so the dedup window matches CONTEXT D-18 (10 minutes).
       Run security.spec.ts until all 4 pass.

    8. **Create src/lib/alerts.ts** verbatim from RESEARCH.md §2.5 — webhook (if `ALERT_WEBHOOK_URL` set) PLUS redundant Resend email to the recruiter (so a missing webhook never silences alerts; per CONTEXT D-16). Use lazy-load `import("resend")` inside the function so the module isn't pulled into routes that don't need it.

    9. **Create src/lib/sinks/dispatch.ts** verbatim from RESEARCH.md §2.3 last block, with these refinements:
       - The function signature accepts `meta?: { ip?: string; ua?: string; synthetic?: boolean }` as a 4th parameter, and forwards `meta` to each `sink.dispatch(lead, env, meta)` call. (Update LeadSink interface to accept the 3rd `meta` param — optional.)
       - On optional-sink failure, the KV fallback payload includes `meta` so recovery can reconstruct the IP/UA.
       - Iterates `SINKS = [emailSink, sheetSink]` in declaration order.
       Run dispatch.spec.ts until all 5 pass.

    10. **Mocking strategy reminder (in tests/setup.ts):** Already exports `mockEnv()` from Wave 0; ensure it provides `IDEMPOTENCY`, `RATELIMIT`, `LEAD_FALLBACK` as objects with `vi.fn()`-backed `get`, `put`, `delete` methods. Add a `mockKVNamespace()` helper that returns a Map-backed in-memory KV (so tests can write + read back without re-stubbing each call). The dispatch tests use this for LEAD_FALLBACK assertions.
  </action>
  <verify>
    <automated>pnpm exec astro check && pnpm test --run tests/unit/turnstile.spec.ts tests/unit/security.spec.ts tests/unit/dispatch.spec.ts tests/unit/email-sink.spec.ts tests/unit/sheet-sink.spec.ts && grep -q '"resend"' package.json && grep -q '"jose"' package.json && grep -q '"@marsidev/react-turnstile"' package.json && grep -q '"@conform-to/react"' package.json && ! grep -q '"googleapis"' package.json && grep -q "LeadSink" src/lib/sinks/types.ts && grep -q "Resend" src/lib/sinks/email-sink.ts && grep -q "tcpa_consent" src/lib/sinks/email-sink.ts && grep -q "SignJWT" src/lib/sinks/sheet-sink.ts && grep -q "challenges.cloudflare.com/turnstile/v0/siteverify" src/lib/turnstile.ts && grep -q "checkOrigin" src/lib/security.ts && grep -q "checkRateLimit" src/lib/security.ts && grep -q "checkIdempotency" src/lib/security.ts && grep -q "10 \* 60 \* 1000\|600\|10\*60" src/lib/security.ts && grep -q "fireAlert" src/lib/alerts.ts && grep -q "dispatchLead" src/lib/sinks/dispatch.ts && grep -q "REQUIRED_SINK_FAILED" src/lib/sinks/dispatch.ts && grep -q "OPTIONAL_SINK_FAILED" src/lib/sinks/dispatch.ts && grep -q "LEAD_FALLBACK" src/lib/sinks/dispatch.ts</automated>
  </verify>
  <acceptance_criteria>
    - Dependencies installed: resend, jose, @marsidev/react-turnstile, @conform-to/react, @conform-to/zod (verified via `grep` in package.json). googleapis is NOT installed (per RESEARCH §2.3 rationale — too heavy for nodejs_compat).
    - All 5 test files green (4 turnstile + 4 security + 5 dispatch + 5 email + 4 sheet = 22 tests passing)
    - `src/lib/sinks/types.ts` exports `LeadSink` with `dispatch(lead, env, meta?)` signature
    - `src/lib/sinks/email-sink.ts` includes literal `"tcpa_consent"` (proves consent metadata is in the body) and prefixes subject with `[SYNTHETIC TEST]` when meta.synthetic is true
    - `src/lib/sinks/sheet-sink.ts` uses `jose` for JWT (NOT googleapis); row order matches the spec
    - `src/lib/security.ts`: checkOrigin reads from env.PRODUCTION_ORIGIN with fallback; checkRateLimit uses a 10-minute sliding window with 3-submission cap; checkIdempotency uses 600s TTL
    - `src/lib/sinks/dispatch.ts`: parallel `Promise.all` fan-out; required-failure throws (NOT swallowed); optional-failure writes to LEAD_FALLBACK with 30-day TTL + fires alert; meta param is forwarded to sinks
    - `src/lib/alerts.ts`: webhook + redundant email; lazy-loads resend
    - `pnpm exec astro check` exits 0
  </acceptance_criteria>
  <done>Server-side form pipeline complete and unit-tested (22 tests). The Action handler in Task 3.2 will glue these together. The /apply React island in Task 3.3 will call this Action via `actions.apply()`.</done>
</task>

<task type="auto">
  <name>Task 3.2: Astro Action handler + ApplyForm React island + /apply + /apply/success + synthetic-submit endpoint</name>
  <files>src/actions/index.ts, src/components/islands/ApplyForm.tsx, src/pages/apply.astro, src/pages/apply/success.astro, src/pages/_internal/synthetic-submit.ts</files>
  <read_first>
    - .planning/phases/01-foundation-form-pay-engine/01-RESEARCH.md §2.1 (Astro Action verbatim), §2.6 (synthetic submission verbatim), §4.1, §4.2, §4.3 (ApplyForm + apply.astro + success.astro verbatim)
    - .planning/phases/01-foundation-form-pay-engine/01-CONTEXT.md D-19 (Conform + single Zod schema), D-20 (6 free fields + selectors), D-22 (success page + role pre-fill), D-23 (TCPA consent text version-stamped), D-24 (CTAs deep-link with ?role=…), D-25 (recruiter tel/sms in header+footer also rendered as fallback in /apply/success)
    - .planning/phases/01-foundation-form-pay-engine/01-UI-SPEC.md §"Surfaces in Scope" rows for /apply + /apply/success, §"Interaction Contracts > Form (Apply)" (full field-order spec, validation timing, submit states, native fallback, honeypot, Turnstile, idempotency UX), §"Copywriting Contract" rows: form section header "Tell us about you", every form field label + helper, TCPA consent checkbox text (must be VERBATIM from UI-SPEC), submit button "Submit application" / "Submitting…", validation error format, error-state copy, /apply/success copy
    - src/lib/validation/lead-schema.ts (Wave 1 — schema + US_STATES + Lead type)
    - src/components/ui/{button,input,select,checkbox,label,form}.tsx (Wave 1 — primitives the form composes)
    - src/data/recruiter.ts (recruiter.tel + .displayPhone for error/success state)
    - src/lib/sinks/dispatch.ts (Task 3.1 — dispatchLead signature)
    - src/lib/turnstile.ts + src/lib/security.ts (Task 3.1)
  </read_first>
  <action>
    1. **Create src/actions/index.ts** verbatim from RESEARCH.md §2.1 with these refinements:
       - Import `dispatchLead`, `verifyTurnstile`, `checkOrigin`, `checkRateLimit`, `checkIdempotency`, `leadSchema`
       - Order of checks (per RESEARCH §2.1 — security-first, fast-fail):
         1. checkOrigin (no env access; cheapest; rejects bad origins immediately per SEC-03)
         2. honeypot check: `if (input.website) return { ok: true, leadId: "honeypot", dedup: false }` (silent 200 per D-27)
         3. verifyTurnstile (network call to siteverify)
         4. checkRateLimit (KV lookup; per-IP)
         5. checkIdempotency (KV lookup; per-key) — if duplicate, return `{ ok: true, leadId: input.idempotencyKey, dedup: true }` (treat as success — user sees same outcome both times per CONTEXT D-18)
         6. Build `meta = { ip: ctx.request.headers.get("CF-Connecting-IP") ?? "unknown", ua: ctx.request.headers.get("User-Agent") ?? "unknown" }`
         7. `await dispatchLead(input, env, ctx, meta)` — propagates throw on required failure (becomes ActionError 500 to client)
         8. Return `{ ok: true, leadId, sinkStatus }`
       - Wrap dispatchLead in try/catch and re-throw as `new ActionError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to deliver lead" })` so the client sees a structured error, not a stack trace.

    2. **Create src/components/islands/ApplyForm.tsx** based on RESEARCH.md §4.1 with FULL implementation of every field per UI-SPEC §"Form (Apply)" mobile field order. Critical details:
       - Field order (top-to-bottom, both mobile and desktop): Role pill (segmented control reading defaultRole prop) → First name → Last name → Phone (`type="tel" inputMode="tel" autoComplete="tel"`) → Email (`type="email" inputMode="email" autoComplete="email"`) → CDL class (Select: option "A" — only valid value per D-20) → Years driving (Select: 1-2 / 3-5 / 5-10 / 10+) → Current state (Select iterating US_STATES) → TCPA consent checkbox → Submit button.
       - Section header above the form: `<h2 class="font-display text-2xl mb-6">Tell us about you</h2>` (UI-SPEC copy)
       - Phone field helper: `<p class="text-sm text-brand-black/70 mt-1">We'll text or call within 24 hours.</p>` (UI-SPEC copy)
       - TCPA consent checkbox label EXACTLY: `"I agree A2C Logistics CO. may contact me by phone, SMS, or email about driving opportunities. Up to 4 messages per month. Standard message rates apply. Reply STOP to opt out. Consent is not a condition of employment."` (UI-SPEC verbatim — this string IS the consent text that `consentVersion: "tcpa_consent_v1"` references)
       - Linked-out from consent label: `Privacy` → `/privacy`, `SMS Terms` → `/sms-terms` (text inside the label; <a> elements with `target="_blank" rel="noopener"` since they're legal references)
       - Checkbox is UNCHECKED by default (positive opt-in only — D-23). Schema's `z.literal(true)` enforces the user MUST tick it.
       - Hidden inputs for `consentVersion="tcpa_consent_v1"`, `formVersion="v1"`, `turnstileToken` (set on Turnstile success), `idempotencyKey` (crypto.randomUUID() generated once on mount per D-18), and the honeypot `website` (offscreen per D-27 + UI-SPEC honeypot row CSS pattern: `position: absolute; left: -9999px; w-px h-px overflow-hidden; aria-hidden="true"; tabIndex={-1}; autoComplete="off"`)
       - Turnstile widget from `@marsidev/react-turnstile`: `<Turnstile siteKey={turnstileSiteKey} onSuccess={setTurnstileToken} options={{ size: "invisible" }} />`
       - Submit button: full-width on mobile (`w-full sm:w-auto`), `bg-brand-red text-brand-white font-display py-3 px-6 rounded min-h-12`, disabled when submitting OR turnstileToken empty. Text: `"Submit application"` idle / `"Submitting…"` busy. `aria-busy` reflects submitting.
       - On submit:
         - Build FormData; ensure `turnstileToken` and `idempotencyKey` are set
         - `const result = await actions.apply(fd);`
         - On `result.error`: render error banner above form using UI-SPEC error-state copy: heading `Something went wrong on our end.`, body `Your application didn't go through. The fastest way to reach us right now is to call ${recruiter.displayPhone} or text START to that same number. Or try submitting again.`, two CTAs: `Call now` (filled red, href tel:) and `Try again` (transparent border, scrolls back to form). Read recruiter from `src/data/recruiter`.
         - On success: `window.location.href = `/apply/success?role=${fd.get("role")}``
       - Validation: Conform `useForm({ onValidate: ({ formData }) => parseWithZod(formData, { schema: leadSchema }), shouldValidate: "onBlur", shouldRevalidate: "onInput" })` (UI-SPEC §"Form (Apply)" Validation row: blur-then-revalidate, NOT every keystroke)
       - Inline errors: shadcn FormMessage component below each field, brand-red Label-size 14px/600 (UI-SPEC §Copywriting validation-error row)
       - On submit-with-errors: scroll to first invalid field via `document.querySelector('[data-invalid]')?.scrollIntoView({ behavior: "smooth" })`
       - Use shadcn Button, Input, Select, Checkbox, Label, Form components from `@/components/ui/*` (or relative paths)

    3. **Create src/pages/apply.astro** verbatim from RESEARCH.md §4.2:
       - Reads `role` from `Astro.url.searchParams` (deep-link from pay routes per D-24)
       - Reads `turnstileSiteKey` from `import.meta.env.PUBLIC_TURNSTILE_SITE_KEY`
       - Wraps in Layout with title `"Apply to drive for A2C Logistics"`, `noindex={false}` (apply page IS indexed; only `/apply/success` is noindex)
       - Renders the OO/Company pill toggle ABOVE the ApplyForm (UI-SPEC §"Form (Apply)" mobile field order — role pill first). Use the same `<PayToggle />` component from Wave 2, with `current={role ?? "company"}` and `class="mb-8"`. (Note: PayToggle's anchor hrefs go to `/pay/owner-operator` and `/pay/company` — for /apply we want a different behavior. Use a sibling component `ApplyRoleToggle.astro` that visually mirrors PayToggle but the pills are anchors to `/apply?role=owner-operator` and `/apply?role=company`. Create this component inline in this task as part of apply.astro changes — file: `src/components/sections/ApplyRoleToggle.astro`. Add it to `files_modified` at the top of this plan if needed by the verifier.)
       - Renders `<ApplyForm client:load defaultRole={role ?? "company"} turnstileSiteKey={turnstileSiteKey} />`
       - Wrap in `<main class="max-w-xl mx-auto px-4 py-12">` per UI-SPEC §"Spacing Scale" max-w-3xl-or-narrower for forms
       - h1 `Apply` (font-display Display size); subhead per RESEARCH §4.2: `Six fields. No resume needed. A recruiter will text or call within 24 hours.`

    4. **Create src/pages/apply/success.astro** based on RESEARCH.md §4.3 + UI-SPEC §Copywriting apply-success row:
       - Layout title `Application received — A2C Logistics`, `noindex={true}` (per FUNNEL-05 / SEO-07 / D-22)
       - h1: `Got it. We'll be in touch.` (UI-SPEC copy)
       - Body: `A recruiter will text or call you within 24 hours. If you'd rather start the conversation now: ${recruiter.displayPhone}.`
       - Single primary CTA: `<a href="tel:${recruiter.tel}" class="bg-brand-red text-brand-white font-display px-8 py-4 rounded min-h-12 inline-flex items-center">Call ${recruiter.displayPhone}</a>`
       - Below the fold: Display-size tagline `Driven to be different.` in font-display brand-black (UI-SPEC §Copywriting apply-success "Also displays the Driven-to-be-different. tagline in Display type below the fold")
       - Read `Astro.url.searchParams.get("role")` and use it to decorate the heading subtly: e.g., `A recruiter will text or call you within 24 hours about your ${role === "owner-operator" ? "owner-operator" : "company driver"} application.` (per D-22 — "pre-fills the OO/Company selection (carried as URL state) so a returning failed-attempt re-submits with their original choice"; for the success page, pre-filling the next-step copy is the equivalent)

    5. **Create src/pages/_internal/synthetic-submit.ts** verbatim from RESEARCH.md §2.6 with these completions:
       - POST handler validates `X-Synthetic-Secret` header against `env.SYNTHETIC_SECRET` (returns 401 if mismatch)
       - Constructs a synthetic Lead with: firstName "Synthetic", lastName "Test", phone "5555550100" (reserved fictional US number per FCC), email "synthetic@a2clogisticsco.com", cdlClass "A", yearsExperience "5-10", role "company", state "NE", smsConsent true, consentVersion "tcpa_consent_v1", formVersion "v1", turnstileToken "synthetic-bypass-token-do-not-verify" (the synthetic path BYPASSES Turnstile), idempotencyKey `synthetic-${Date.now()}-${crypto.randomUUID()}`
       - Calls dispatchLead directly (NOT through the Action — bypasses origin/Turnstile/rate-limit/idempotency since this is server-to-server) with `meta = { synthetic: true, ip: "synthetic-cron", ua: "synthetic-cron" }`
       - On success: returns `Response("ok", { status: 200 })`
       - On thrown error: fires alert with type="SYNTHETIC_FAILURE" and returns 500
       - Add an export `prerender = false` so this is truly an SSR endpoint, not statically generated

    6. **Verify the action runs end-to-end locally** — start `pnpm dev`, open `/apply`, fill the form (use a fake phone like 555-555-1212), click submit. The server-side error path should fire (no real Turnstile token in dev; siteverify rejects). The error banner should render with recruiter tel/sms. This proves the failure-state UX (CONTEXT specifics §"Failure-state UX") works.
  </action>
  <verify>
    <automated>pnpm exec astro check && pnpm build && test -f src/actions/index.ts && test -f src/components/islands/ApplyForm.tsx && test -f src/pages/apply.astro && test -f src/pages/apply/success.astro && test -f src/pages/_internal/synthetic-submit.ts && grep -q "defineAction" src/actions/index.ts && grep -q "leadSchema" src/actions/index.ts && grep -q "checkOrigin" src/actions/index.ts && grep -q "verifyTurnstile" src/actions/index.ts && grep -q "checkRateLimit" src/actions/index.ts && grep -q "checkIdempotency" src/actions/index.ts && grep -q "dispatchLead" src/actions/index.ts && grep -q "honeypot\|input.website" src/actions/index.ts && grep -q "actions.apply" src/components/islands/ApplyForm.tsx && grep -q "leadSchema" src/components/islands/ApplyForm.tsx && grep -q "Turnstile" src/components/islands/ApplyForm.tsx && grep -q "tcpa_consent_v1" src/components/islands/ApplyForm.tsx && grep -q "Consent is not a condition of employment" src/components/islands/ApplyForm.tsx && grep -q "Up to 4 messages per month" src/components/islands/ApplyForm.tsx && grep -q "Reply STOP to opt out" src/components/islands/ApplyForm.tsx && grep -q "crypto.randomUUID" src/components/islands/ApplyForm.tsx && grep -q "name=\"website\"\|name='website'" src/components/islands/ApplyForm.tsx && grep -q "left-\[-9999px\]\|left:-9999px\|left: -9999px" src/components/islands/ApplyForm.tsx && grep -q "ApplyForm" src/pages/apply.astro && grep -q "PUBLIC_TURNSTILE_SITE_KEY" src/pages/apply.astro && grep -q "noindex" src/pages/apply/success.astro && grep -q "Got it" src/pages/apply/success.astro && grep -q "Driven to be different" src/pages/apply/success.astro && grep -q "X-Synthetic-Secret" src/pages/_internal/synthetic-submit.ts && grep -q "SYNTHETIC_SECRET" src/pages/_internal/synthetic-submit.ts && grep -q "prerender = false\|prerender=false" src/pages/_internal/synthetic-submit.ts</automated>
  </verify>
  <acceptance_criteria>
    - `src/actions/index.ts`: defineAction with input=leadSchema; check order matches the spec (origin → honeypot → Turnstile → rate-limit → idempotency → dispatch); honeypot path returns silent 200; idempotency duplicate returns success with dedup:true; meta object built from CF-Connecting-IP + User-Agent
    - `src/components/islands/ApplyForm.tsx` includes all 9 form controls, the EXACT TCPA consent text from UI-SPEC, hidden inputs for consentVersion/formVersion/turnstileToken/idempotencyKey, the honeypot `<input name="website">` with offscreen CSS, Conform with leadSchema validation, error banner with recruiter tel/sms on failure, success redirect to /apply/success?role=…
    - `src/pages/apply.astro` renders `<ApplyForm client:load defaultRole={…} turnstileSiteKey={…} />` and reads PUBLIC_TURNSTILE_SITE_KEY from import.meta.env
    - `src/pages/apply/success.astro` is `noindex`'d, contains "Got it" heading + recruiter tel CTA + "Driven to be different." tagline; reads role from URL
    - `src/pages/_internal/synthetic-submit.ts` validates X-Synthetic-Secret header, calls dispatchLead with meta.synthetic=true, exports prerender=false
    - `pnpm exec astro check` exits 0
    - `pnpm build` exits 0 — including the action handler being emitted as a Cloudflare Pages Function (look for `dist/_worker.js/` or `dist/functions/_actions/apply.js` depending on adapter mode; either is acceptable as long as build succeeds)
  </acceptance_criteria>
  <done>End-to-end conversion path live: /apply → ApplyForm island → POSTs to /_actions/apply → security middleware → dispatchLead (Resend + Sheets in parallel) → /apply/success. Native fallback works without JS. Daily synthetic endpoint exposed for the Wave 0 cron to exercise. Wave 5 verifies all of this with chaos tests + real-iPhone smoke + curl-based security acceptance tests.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Untrusted client (form POST) → Astro Action | All input flows through `leadSchema.parse` (rejects unknowns via `.strict()` from Wave 1); Turnstile + origin + rate-limit + honeypot layered on top |
| Astro Action → Resend (email) AND Google Sheets API | Outbound HTTPS with secrets from env (RESEND_API_KEY, GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON) |
| Cron Trigger → /_internal/synthetic-submit | Auth via SYNTHETIC_SECRET shared header |
| Action → KV (IDEMPOTENCY, RATELIMIT, LEAD_FALLBACK) | Same-account binding; no cross-tenant exposure |
| Recruiter (alert recipient) → ALERT_WEBHOOK_URL (Discord/Slack) | Outbound webhook with structured JSON; no secrets in payload (only lead metadata + sink names) |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-1-W3-01 | Spoofing | Adversary spoofs an apply submission from off-domain (e.g., curl from their own server) | mitigate | checkOrigin rejects any submission whose Origin header isn't the production domain or a *.pages.dev preview. Test: `tests/unit/security.spec.ts` Test 1. Wave 5 acceptance test verifies via curl. |
| T-1-W3-02 | Spoofing | Adversary submits form using a fake/replayed Turnstile token | mitigate | verifyTurnstile POSTs to challenges.cloudflare.com/turnstile/v0/siteverify which validates the token against Cloudflare's record. Replay attempts return success: false. Tests: `tests/unit/turnstile.spec.ts` 4 cases. |
| T-1-W3-03 | Tampering | Adversary submits with extra `ssn`, `mvr`, `dob` fields hoping the sink writes them | mitigate | leadSchema is `.strict()` (Wave 1) — unknown keys cause parse failure. Action returns 400 BAD_REQUEST. Wave 1 Test 2 in `lead-schema.spec.ts` already verifies. |
| T-1-W3-04 | Repudiation | Driver later disputes "I didn't consent to SMS" — recruiting team can't prove which consent text was shown | mitigate | smsConsent: literal(true) + consentVersion: literal("tcpa_consent_v1") + formVersion: literal("v1") in schema. Email-sink AND sheet-sink stamp these on every row plus timestamp + IP + UA. Consent text is verbatim in ApplyForm.tsx and changes require a NEW version constant (tcpa_consent_v2) — old constant becomes a forensic anchor to old text. |
| T-1-W3-05 | Information Disclosure | Lead PII (phone/email) leaked via error logs or alert webhook payload | mitigate | fireAlert payload includes leadId + sink names + error type, NOT the full Lead object. Required-failure path passes the lead to the alert; for that path, the recipient is already the recruiter (who is authorized to see the lead). Webhook recipient (Discord/Slack channel) is recruiter-team-only per CONTEXT D-16. |
| T-1-W3-06 | Information Disclosure | Honeypot triggers tip off bots (200 OK with body different from real success) | mitigate | Honeypot path returns the same `{ ok: true, leadId }` shape as a real success per D-27 (silent 200, never dispatched). Test `tests/unit/dispatch.spec.ts` not directly applicable (honeypot is checked in actions/index.ts before dispatch); manual code review of the action confirms the response shape match. |
| T-1-W3-07 | Denial of Service | Single IP hammers /apply with 1000 submissions/sec | mitigate | checkRateLimit: 3 submissions per IP per 10 minutes via KV sliding window. 4th returns 429. Cloudflare WAF + edge bot rules upstream provide additional protection; this is the application-layer floor. Tests: `tests/unit/security.spec.ts` Tests 2-3. |
| T-1-W3-08 | Denial of Service | Adversary triggers Resend rate-limit by hammering form (with valid Turnstile each time, costly) | mitigate | Layered defense: Turnstile + per-IP rate limit + Cloudflare bot management. Per-IP cap of 3/10min means an adversary needs 10,000 IPs to send 30,000 emails/day. Practical floor for a marketing-site form; full DDoS mitigation is the platform's job (Cloudflare). |
| T-1-W3-09 | Denial of Service | dispatchLead awaits sinks SERIALLY → 600ms email + 400ms sheet = 1000ms latency floor | mitigate | dispatchLead uses Promise.all for parallel fan-out (RESEARCH §2.3 verbatim). Latency floor = max(email, sheet) ≈ 600ms, not sum. Test: `tests/unit/dispatch.spec.ts` covers the parallel semantics (all sinks dispatched even when one fails). |
| T-1-W3-10 | Denial of Service | KV write fails (rare; Cloudflare KV is multi-region eventually-consistent) → checkIdempotency falsely reports "unseen" → duplicate sinks dispatch | accept | KV failure mode is exceedingly rare; the cost is one duplicate email per occurrence. Recruiter can dedup by leadId in the Sheet. Acceptable for a marketing-form path. Mitigation cost (e.g., D1 + transaction) is disproportionate to risk. |
| T-1-W3-11 | Elevation of Privilege | /_internal/synthetic-submit accessed without secret → adversary sends fake "synthetic" leads to recruiter | mitigate | X-Synthetic-Secret header check (HMAC-equivalent — long random secret per Wave 0 user_setup). Endpoint returns 401 silently if mismatch. Endpoint is technically discoverable (path appears in dist) but useless without the secret. |
| T-1-W3-12 | Elevation of Privilege | Pages Function compromised → reads RESEND_API_KEY, exfiltrates emails | accept | Cloudflare Pages Functions run in V8 isolates with strong sandboxing. Compromise requires a 0-day in V8 or Cloudflare's runtime. Risk = same as any serverless function; outside the application's threat model. Mitigation = rotate keys regularly (operational practice, not code change). |
</threat_model>

<verification>
- All 22 unit tests green (`pnpm test --run`)
- `pnpm exec astro check` clean
- `pnpm build` clean — including the Action emitting as a Cloudflare Pages Function
- Local smoke (recommended): `pnpm dev` → /apply → fill form → submit → see graceful error banner with recruiter tel/sms (Turnstile won't verify in dev, so the failure path proves UX works)
- Wave 5 will run the chaos tests, the curl-based security acceptance tests, and the real-iPhone manual smoke test that verify the success criteria #1, #2, #5 end-to-end
</verification>

<success_criteria>
ROADMAP success criteria #1, #2, and #5 are technically deliverable from this wave. Wave 5 verifies them with the actual chaos tests + iPhone smoke. /apply is wired; pay-page CTAs from Wave 2 already deep-link to /apply?role=…; Wave 4 will verify the header CTA is present everywhere AND ship the legal MDX pages that the form's TCPA checkbox links to.
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-form-pay-engine/01-03-form-handler-SUMMARY.md` capturing: actual installed versions of resend / jose / @marsidev/react-turnstile / conform, total bundle size of the form island (`pnpm build` reports per-route JS — check the `/apply` line), the synthetic-submit secret header name (X-Synthetic-Secret) for the Wave 0 cron config, the exact consent text version stamp (tcpa_consent_v1) and the verbatim consent string (so Phase 3 counsel review has the canonical text), and a note that the form's native fallback (no-JS path) returns a server-rendered error rather than the React error banner — Wave 5 verifies both paths.
</output>
