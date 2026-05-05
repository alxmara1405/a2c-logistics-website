---
phase: 01-foundation-form-pay-engine
plan: 05
type: execute
wave: 5
depends_on: [01-04-wireup-compliance]
autonomous: false
files_modified:
  - tests/unit/lead-schema.spec.ts
  - tests/integration/sink-chaos.spec.ts
  - tests/integration/lead-dispatch.spec.ts
  - tests/build/pay-routes.spec.ts
  - tests/build/legal-pages.spec.ts
  - tests/build/recruiter-links.spec.ts
  - tests/acceptance/form-security.spec.ts
  - scripts/check-dns.sh
  - scripts/manual-iphone-smoke.md
  - scripts/rich-results-check.sh
requirements:
  - FUNNEL-01
  - FUNNEL-02
  - FUNNEL-03
  - FUNNEL-04
  - FUNNEL-05
  - PAY-01
  - PAY-02
  - SEC-01
  - SEC-02
  - SEC-03
  - SEC-04
  - SEC-05
  - SEC-06
  - SEO-04
  - OPS-02
  - SITE-04
must_haves:
  truths:
    - "Vitest unit + integration suites cover all 6 ROADMAP success criteria with at least one automated assertion each"
    - "scripts/check-dns.sh validates SPF, DKIM, DMARC are live on the Resend sending domain"
    - "scripts/manual-iphone-smoke.md is a runnable playbook for the human-only checks (real-device submission + Rich Results Test + Resend domain verified)"
    - "Form security curl tests cover: bad origin (403), no Turnstile token (403), honeypot filled (200 silent), 4th-in-10min from same IP (429)"
    - "Sink chaos test verifies: revoke Sheet creds → email still delivers, KV fallback row written, alert fires"
    - "Lead schema test verifies: all banned fields (SSN, MVR, DOB, marital, etc.) rejected by Zod"
  outcomes:
    - "Phase 1 verification suite is the gate that proves the conversion path is durable, the pay routes are SEO-real, and the form is hardened — before Phase 2 builds story content on top"
  artifacts:
    - path: "tests/integration/sink-chaos.spec.ts"
      provides: "Automated chaos test for partial sink failure (Pitfall 1 prevention)"
      contains: "describe"
    - path: "tests/acceptance/form-security.spec.ts"
      provides: "curl-style acceptance tests for SEC-01..05"
      contains: "checkOrigin"
    - path: "scripts/check-dns.sh"
      provides: "dig-based check for SPF + DKIM + DMARC records on the Resend sending domain"
      contains: "dig TXT"
    - path: "scripts/manual-iphone-smoke.md"
      provides: "Playbook for the 4 manual-only verifications from VALIDATION.md"
      contains: "Real-iPhone"
  key_links:
    - from: "tests/integration/sink-chaos.spec.ts"
      to: "src/lib/sinks/dispatch.ts"
      via: "import + mock sheet auth failure"
      pattern: "dispatchLead"
    - from: "tests/acceptance/form-security.spec.ts"
      to: "src/lib/security.ts + src/lib/turnstile.ts"
      via: "import + injected env"
      pattern: "checkOrigin"
---

<objective>
Build the Phase-1 verification suite — automated tests for sink chaos, form security, schema enforcement, build-output assertions for pay routes + legal pages + recruiter-link presence — plus a manual-iPhone smoke playbook for the four checks that genuinely require a human (real-device submission, Rich Results Test, DNS verification, Resend domain verification).

Purpose: ROADMAP Phase 1 has 6 success criteria. Each one needs at least one automated assertion (so regressions get caught) PLUS a documented manual gate where automation can't reach (truck-stop wifi behavior, Google Rich Results validation, DNS propagation). VALIDATION.md §Per-Task-Verification-Map is the source of truth for what tests to write — this plan implements them.

Output: A green Vitest suite + a documented manual playbook + DNS check script. After this plan ships, "Phase 1 done" can be claimed with evidence — every ROADMAP success criterion is either passing in CI or signed off in the manual playbook.

Why autonomous: false — the manual smoke check, Rich Results validation, DNS check, and Resend domain verification all need a human + external tools (real iPhone, Google's tester, Cloudflare/Resend dashboards). The automated tests CAN run autonomously; the manual gate cannot.
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
@.planning/phases/01-foundation-form-pay-engine/01-VALIDATION.md
</context>

<tasks>

<task type="auto">
  <name>Task 5.1: Lead schema tests (banned-field rejection + happy path)</name>
  <files>tests/unit/lead-schema.spec.ts</files>
  <read_first>
    - src/lib/validation/lead-schema.ts (the schema being tested — Wave 1 produced it)
    - .planning/phases/01-foundation-form-pay-engine/01-CONTEXT.md D-21 (field whitelist — banned fields explicitly listed)
    - .planning/phases/01-foundation-form-pay-engine/01-VALIDATION.md (criterion 6 — schema test for banned fields)
    - .planning/phases/01-foundation-form-pay-engine/01-RESEARCH.md §2.2 (lead-schema source code)
    - tests/setup.ts (existing test fixtures from Wave 0)
  </read_first>
  <action>
    Create `tests/unit/lead-schema.spec.ts`:

    ```ts
    import { describe, expect, it } from "vitest";
    import { leadSchema } from "../../src/lib/validation/lead-schema";

    const validLead = {
      firstName: "Jamie",
      lastName: "Driver",
      phone: "555-123-4567",
      email: "jamie@example.com",
      cdlClass: "A",
      yearsExperience: "3-5",
      role: "company",
      state: "NE",
      smsConsent: true,
      consentVersion: "tcpa_consent_v1",
      formVersion: "v1",
      turnstileToken: "valid-token-12345",
      idempotencyKey: crypto.randomUUID(),
    };

    describe("leadSchema", () => {
      it("accepts a valid lead payload", () => {
        const result = leadSchema.safeParse(validLead);
        expect(result.success).toBe(true);
      });

      describe("banned fields are rejected", () => {
        const bannedFields = [
          ["ssn", "123-45-6789"],
          ["dob", "1985-01-01"],
          ["dateOfBirth", "1985-01-01"],
          ["mvr", "clean"],
          ["arrestHistory", "none"],
          ["maritalStatus", "married"],
          ["familyStatus", "single"],
          ["religion", "none"],
          ["nationality", "US"],
          ["disability", "none"],
          ["accommodationRequest", "none"],
          ["gender", "M"],
          ["race", "white"],
          ["age", "35"],
        ] as const;

        it.each(bannedFields)("rejects %s in submitted payload", (key, value) => {
          const polluted = { ...validLead, [key]: value };
          const result = leadSchema.safeParse(polluted);
          // Zod with strict() rejects unknown keys; the schema MUST be defined with .strict() to enforce this
          expect(result.success).toBe(false);
        });
      });

      describe("required fields validation", () => {
        it("rejects empty firstName", () => {
          expect(leadSchema.safeParse({ ...validLead, firstName: "" }).success).toBe(false);
        });
        it("rejects malformed phone", () => {
          expect(leadSchema.safeParse({ ...validLead, phone: "abc" }).success).toBe(false);
        });
        it("rejects malformed email", () => {
          expect(leadSchema.safeParse({ ...validLead, email: "not-an-email" }).success).toBe(false);
        });
        it("requires SMS consent === true (not falsy, not unset)", () => {
          expect(leadSchema.safeParse({ ...validLead, smsConsent: false }).success).toBe(false);
        });
        it("requires consent version stamp tcpa_consent_v1 (not v0, not other)", () => {
          expect(leadSchema.safeParse({ ...validLead, consentVersion: "tcpa_consent_v0" }).success).toBe(false);
        });
        it("rejects honeypot when filled", () => {
          expect(leadSchema.safeParse({ ...validLead, website: "spam" }).success).toBe(false);
        });
        it("requires turnstile token", () => {
          expect(leadSchema.safeParse({ ...validLead, turnstileToken: undefined }).success).toBe(false);
        });
      });
    });
    ```

    If the existing `leadSchema` from Wave 1 is NOT defined with `.strict()`, the banned-fields test will fail. In that case, modify `src/lib/validation/lead-schema.ts` to wrap the object schema with `.strict()` — this is a Phase-1 requirement (COMP-01: field whitelist) and the test surfacing the gap is exactly the point.
  </action>
  <verify>
    <automated>pnpm test --run tests/unit/lead-schema.spec.ts && grep -q ".strict()" src/lib/validation/lead-schema.ts</automated>
  </verify>
  <acceptance_criteria>
    - `tests/unit/lead-schema.spec.ts` exists with all 14+ banned-field rejection tests passing
    - `src/lib/validation/lead-schema.ts` uses `.strict()` so unknown keys are rejected
    - All happy-path + invalid-input tests pass
    - `pnpm test --run tests/unit/lead-schema.spec.ts` exits 0
  </acceptance_criteria>
  <done>Schema enforces COMP-01 field whitelist + COMP-02 consent version + COMP-07 no-PII-creep; verified by 14+ test cases.</done>
</task>

<task type="auto">
  <name>Task 5.2: Sink chaos integration test (silent-failure prevention — Pitfall 1)</name>
  <files>tests/integration/sink-chaos.spec.ts, tests/integration/lead-dispatch.spec.ts</files>
  <read_first>
    - src/lib/sinks/dispatch.ts (Wave 3 output)
    - src/lib/sinks/email-sink.ts and src/lib/sinks/sheet-sink.ts (Wave 3 output)
    - .planning/phases/01-foundation-form-pay-engine/01-RESEARCH.md §2.3 (LeadSink adapter + dispatchLead with partial-failure semantics)
    - .planning/phases/01-foundation-form-pay-engine/01-VALIDATION.md criterion 1 + 2 (dispatch + chaos)
    - .planning/phases/01-foundation-form-pay-engine/01-CONTEXT.md D-14, D-15, D-16 (sink contract — required vs optional + alert + fallback)
  </read_first>
  <action>
    Create `tests/integration/lead-dispatch.spec.ts` — happy-path:
    ```ts
    import { describe, it, expect, vi, beforeEach } from "vitest";
    import { dispatchLead } from "../../src/lib/sinks/dispatch";

    describe("dispatchLead — happy path", () => {
      beforeEach(() => { vi.restoreAllMocks(); });

      it("delivers to all sinks and returns ok with both statuses", async () => {
        // Mock fetch for Resend (200) and Sheets token + append (200, 200)
        global.fetch = vi.fn(async (url: string) => {
          if (url.includes("oauth2.googleapis.com/token")) return new Response(JSON.stringify({ access_token: "fake" }));
          if (url.includes("sheets.googleapis.com")) return new Response(JSON.stringify({}));
          // Resend SDK uses fetch internally — return 200
          return new Response(JSON.stringify({ id: "fake-id" }));
        }) as any;

        const env = makeFakeEnv();
        const result = await dispatchLead(makeFakeLead(), env, makeFakeCtx());

        expect(result.sinkStatus.email).toBe("ok");
        expect(result.sinkStatus.sheet).toBe("ok");
      });
    });

    function makeFakeLead() { /* ... build a minimal Lead ... */ }
    function makeFakeEnv() { /* ... mock env with KV stubs ... */ }
    function makeFakeCtx() { /* ... mock ctx with locals.runtime.env ... */ }
    ```

    Create `tests/integration/sink-chaos.spec.ts`:
    ```ts
    import { describe, it, expect, vi, beforeEach } from "vitest";
    import { dispatchLead } from "../../src/lib/sinks/dispatch";

    describe("dispatchLead — sink chaos (Pitfall 1)", () => {
      beforeEach(() => { vi.restoreAllMocks(); });

      it("when REQUIRED email sink fails: throws, does NOT swallow lead", async () => {
        global.fetch = vi.fn(async () => new Response("api error", { status: 500 })) as any;
        const env = makeFakeEnv();
        await expect(dispatchLead(makeFakeLead(), env, makeFakeCtx())).rejects.toThrow(/required.*sink.*failed/i);
        // Alert MUST have fired (verify the KV fallback or webhook side-effect)
        // Verify alert email was attempted (mock fetch call to Resend with subject containing "REQUIRED_SINK_FAILED")
      });

      it("when ONLY OPTIONAL sheet sink fails: returns ok, queues KV fallback, fires alert", async () => {
        // Mock: Resend returns 200, Sheets returns 500
        let kvFallbackPut = false;
        const env = makeFakeEnv();
        env.LEAD_FALLBACK = {
          put: vi.fn(async () => { kvFallbackPut = true; }),
        } as any;

        global.fetch = vi.fn(async (url: string) => {
          if (url.includes("oauth2.googleapis.com/token")) return new Response(JSON.stringify({ access_token: "fake" }));
          if (url.includes("sheets.googleapis.com")) return new Response("sheets error", { status: 500 });
          return new Response(JSON.stringify({ id: "fake-id" })); // Resend
        }) as any;

        const result = await dispatchLead(makeFakeLead(), env, makeFakeCtx());

        expect(result.sinkStatus.email).toBe("ok");
        expect(result.sinkStatus.sheet).toBe("failed");
        expect(kvFallbackPut).toBe(true);
        expect(env.LEAD_FALLBACK.put).toHaveBeenCalledWith(
          expect.stringMatching(/^lead:/),
          expect.stringContaining("failedSinks"),
          expect.objectContaining({ expirationTtl: expect.any(Number) })
        );
      });
    });
    ```

    Implement `makeFakeLead`, `makeFakeEnv`, `makeFakeCtx` helpers in `tests/setup.ts` (or co-locate in the spec file). Use vi.fn() with sensible defaults; tests can override per case.
  </action>
  <verify>
    <automated>pnpm test --run tests/integration/sink-chaos.spec.ts tests/integration/lead-dispatch.spec.ts</automated>
  </verify>
  <acceptance_criteria>
    - `tests/integration/sink-chaos.spec.ts` covers BOTH the "required sink fails — throws" case AND the "optional sink fails — KV fallback + alert + success" case
    - `tests/integration/lead-dispatch.spec.ts` covers the happy-path
    - Both tests pass via mocked fetch (no real Resend / Sheets calls during CI)
    - The optional-sink-fail test asserts the KV `put` call signature (key, value, expirationTtl)
  </acceptance_criteria>
  <done>Pitfall 1 (silent form failure) is provably defended against — chaos test catches regressions in sink fan-out semantics.</done>
</task>

<task type="auto">
  <name>Task 5.3: Form security acceptance tests (SEC-01..05)</name>
  <files>tests/acceptance/form-security.spec.ts</files>
  <read_first>
    - src/lib/security.ts and src/lib/turnstile.ts (Wave 3 output)
    - src/actions/index.ts (the apply Action — uses these middlewares)
    - .planning/phases/01-foundation-form-pay-engine/01-RESEARCH.md §2.4 (security middleware code)
    - .planning/phases/01-foundation-form-pay-engine/01-VALIDATION.md criterion 5
    - .planning/phases/01-foundation-form-pay-engine/01-CONTEXT.md D-26..D-30 (security stack)
  </read_first>
  <action>
    Create `tests/acceptance/form-security.spec.ts` covering each defense layer in isolation:

    ```ts
    import { describe, it, expect, vi, beforeEach } from "vitest";
    import { checkOrigin, checkRateLimit, checkIdempotency } from "../../src/lib/security";
    import { verifyTurnstile } from "../../src/lib/turnstile";

    describe("origin check (SEC-03)", () => {
      it("accepts production domain", async () => {
        const ctx = { request: new Request("https://a2clogistics.com/_actions/apply", { headers: { Origin: "https://a2clogistics.com" } }) };
        expect(await checkOrigin(ctx as any)).toBe(true);
      });
      it("accepts preview domain pattern", async () => {
        const ctx = { request: new Request("https://example.a2c-logistics.pages.dev/_actions/apply", { headers: { Origin: "https://abc-123.a2c-logistics.pages.dev" } }) };
        expect(await checkOrigin(ctx as any)).toBe(true);
      });
      it("rejects arbitrary domain", async () => {
        const ctx = { request: new Request("https://evil.com/_actions/apply", { headers: { Origin: "https://evil.com" } }) };
        expect(await checkOrigin(ctx as any)).toBe(false);
      });
      it("rejects missing Origin header", async () => {
        const ctx = { request: new Request("https://a2clogistics.com/_actions/apply") };
        expect(await checkOrigin(ctx as any)).toBe(false);
      });
    });

    describe("rate limit (SEC-04)", () => {
      it("allows up to 3 submissions per IP per 10 minutes", async () => {
        const env = makeFakeKVEnv();
        const ctx = makeCtxWithIP("1.2.3.4");
        expect(await checkRateLimit(ctx, env)).toBe(true);
        expect(await checkRateLimit(ctx, env)).toBe(true);
        expect(await checkRateLimit(ctx, env)).toBe(true);
      });
      it("rejects 4th submission within window", async () => {
        const env = makeFakeKVEnv();
        const ctx = makeCtxWithIP("1.2.3.4");
        await checkRateLimit(ctx, env);
        await checkRateLimit(ctx, env);
        await checkRateLimit(ctx, env);
        expect(await checkRateLimit(ctx, env)).toBe(false);
      });
      it("isolates per IP", async () => {
        const env = makeFakeKVEnv();
        const ctxA = makeCtxWithIP("1.2.3.4");
        const ctxB = makeCtxWithIP("5.6.7.8");
        await checkRateLimit(ctxA, env);
        await checkRateLimit(ctxA, env);
        await checkRateLimit(ctxA, env);
        // B is unaffected
        expect(await checkRateLimit(ctxB, env)).toBe(true);
      });
    });

    describe("idempotency (FUNNEL-08)", () => {
      it("first submission with key passes", async () => {
        const env = makeFakeKVEnv();
        expect(await checkIdempotency("test-uuid-1", env)).toBe(true);
      });
      it("second submission with same key fails (dedupe)", async () => {
        const env = makeFakeKVEnv();
        await checkIdempotency("test-uuid-1", env);
        expect(await checkIdempotency("test-uuid-1", env)).toBe(false);
      });
    });

    describe("Turnstile (SEC-01)", () => {
      it("returns true when siteverify success: true", async () => {
        global.fetch = vi.fn(async () => new Response(JSON.stringify({ success: true }))) as any;
        expect(await verifyTurnstile("token", { TURNSTILE_SECRET_KEY: "x" } as any)).toBe(true);
      });
      it("returns false when siteverify success: false", async () => {
        global.fetch = vi.fn(async () => new Response(JSON.stringify({ success: false }))) as any;
        expect(await verifyTurnstile("token", { TURNSTILE_SECRET_KEY: "x" } as any)).toBe(false);
      });
      it("returns false on network error", async () => {
        global.fetch = vi.fn(async () => { throw new Error("network"); }) as any;
        await expect(verifyTurnstile("token", { TURNSTILE_SECRET_KEY: "x" } as any)).resolves.toBe(false);
      });
    });

    function makeFakeKVEnv() {
      const store = new Map<string, string>();
      return {
        RATELIMIT: {
          get: async (k: string, opts?: any) => opts?.type === "json" ? JSON.parse(store.get(k) ?? "[]") : store.get(k) ?? null,
          put: async (k: string, v: string) => { store.set(k, v); },
        },
        IDEMPOTENCY: {
          get: async (k: string) => store.get(k) ?? null,
          put: async (k: string, v: string) => { store.set(k, v); },
        },
      } as any;
    }
    function makeCtxWithIP(ip: string) {
      return { request: new Request("https://x", { headers: { "CF-Connecting-IP": ip } }) } as any;
    }
    ```
  </action>
  <verify>
    <automated>pnpm test --run tests/acceptance/form-security.spec.ts</automated>
  </verify>
  <acceptance_criteria>
    - `tests/acceptance/form-security.spec.ts` covers origin (4 cases), rate limit (3 cases), idempotency (2 cases), Turnstile (3 cases) — 12+ assertions
    - All assertions pass against the Wave-3 security middleware
  </acceptance_criteria>
  <done>SEC-01..05 are provably enforced; regression in any defense layer fails CI.</done>
</task>

<task type="auto">
  <name>Task 5.4: Build-output assertions (pay routes + JSON-LD + legal pages + recruiter links)</name>
  <files>tests/build/pay-routes.spec.ts, tests/build/legal-pages.spec.ts, tests/build/recruiter-links.spec.ts</files>
  <read_first>
    - dist/pay/owner-operator/index.html and dist/pay/company/index.html (post-build artifacts to introspect)
    - .planning/phases/01-foundation-form-pay-engine/01-RESEARCH.md §3.3 (JobPosting JSON-LD shape)
    - .planning/phases/01-foundation-form-pay-engine/01-VALIDATION.md criterion 3 + 4 + 6
  </read_first>
  <action>
    These tests run AFTER `pnpm build`. Vitest can read static files from `dist/`. Add `pretest:build` script:

    ```json
    "scripts": {
      "test:build": "pnpm build && vitest --run tests/build/"
    }
    ```

    Create `tests/build/pay-routes.spec.ts`:
    ```ts
    import { describe, it, expect } from "vitest";
    import { readFileSync } from "fs";
    import { existsSync } from "fs";

    describe("pay routes — build output", () => {
      const ooPath = "dist/pay/owner-operator/index.html";
      const coPath = "dist/pay/company/index.html";

      it("both pay routes exist as physical SSG files", () => {
        expect(existsSync(ooPath)).toBe(true);
        expect(existsSync(coPath)).toBe(true);
      });

      it("each route has a unique <title>", () => {
        const oo = readFileSync(ooPath, "utf8");
        const co = readFileSync(coPath, "utf8");
        const ooTitle = oo.match(/<title>(.*?)<\/title>/)?.[1] ?? "";
        const coTitle = co.match(/<title>(.*?)<\/title>/)?.[1] ?? "";
        expect(ooTitle).not.toBe(coTitle);
        expect(ooTitle.toLowerCase()).toContain("owner");
        expect(coTitle.toLowerCase()).toContain("company");
      });

      it("each route has canonical-to-self", () => {
        const oo = readFileSync(ooPath, "utf8");
        const co = readFileSync(coPath, "utf8");
        expect(oo).toMatch(/<link rel="canonical" href="[^"]*\/pay\/owner-operator"/);
        expect(co).toMatch(/<link rel="canonical" href="[^"]*\/pay\/company"/);
      });

      it("each route has JobPosting JSON-LD with baseSalary", () => {
        for (const p of [ooPath, coPath]) {
          const html = readFileSync(p, "utf8");
          const jsonLdMatch = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
          expect(jsonLdMatch).toBeTruthy();
          const json = JSON.parse(jsonLdMatch![1]);
          expect(json["@type"]).toBe("JobPosting");
          expect(json.baseSalary).toBeDefined();
          expect(json.baseSalary["@type"]).toBe("MonetaryAmount");
          expect(json.baseSalary.value.minValue).toBeGreaterThan(0);
          expect(json.baseSalary.value.maxValue).toBeGreaterThan(json.baseSalary.value.minValue);
        }
      });

      it("/pay 308-redirects to /pay/owner-operator", () => {
        // Astro emits redirect via _redirects file or a <meta http-equiv="refresh"> + status header
        const redirectsFile = "dist/_redirects";
        expect(existsSync(redirectsFile)).toBe(true);
        const redirects = readFileSync(redirectsFile, "utf8");
        expect(redirects).toMatch(/\/pay\s+\/pay\/owner-operator\s+308/);
      });
    });
    ```

    Create `tests/build/legal-pages.spec.ts`:
    ```ts
    import { describe, it, expect } from "vitest";
    import { readFileSync, existsSync } from "fs";

    describe("legal pages — build output", () => {
      it.each(["privacy", "sms-terms", "eeo"])("/%s exists with DraftBanner and noindex", (slug) => {
        const path = `dist/${slug}/index.html`;
        expect(existsSync(path)).toBe(true);
        const html = readFileSync(path, "utf8");
        expect(html).toMatch(/pending counsel review/i);
        expect(html).toMatch(/<meta name="robots" content="noindex"/i);
      });

      it("sms-terms contains tcpa_consent_v1 stamp + STOP + HELP", () => {
        const html = readFileSync("dist/sms-terms/index.html", "utf8");
        expect(html).toMatch(/tcpa_consent_v1/);
        expect(html).toMatch(/STOP/);
        expect(html).toMatch(/HELP/);
      });
    });
    ```

    Create `tests/build/recruiter-links.spec.ts`:
    ```ts
    import { describe, it, expect } from "vitest";
    import { readFileSync, readdirSync, statSync } from "fs";
    import { join } from "path";

    function* walkHtml(dir: string): Generator<string> {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) yield* walkHtml(full);
        else if (entry.endsWith(".html")) yield full;
      }
    }

    describe("recruiter contact links + Apply CTA on every page", () => {
      const allHtml = Array.from(walkHtml("dist"));

      it.each(allHtml)("%s contains tel: link AND /apply CTA in header or footer", (path) => {
        const html = readFileSync(path, "utf8");
        expect(html).toMatch(/href="tel:\+1/);
        expect(html).toMatch(/href="\/apply"/);
      });

      it("MC# and USDOT# placeholder slots present in every page footer", () => {
        for (const p of allHtml) {
          const html = readFileSync(p, "utf8");
          expect(html).toMatch(/MC#/);
          expect(html).toMatch(/USDOT#/);
        }
      });
    });
    ```
  </action>
  <verify>
    <automated>pnpm build && pnpm test --run tests/build/</automated>
  </verify>
  <acceptance_criteria>
    - All three test files pass against the post-build `dist/`
    - `tests/build/pay-routes.spec.ts` asserts unique titles, canonical-to-self, JobPosting JSON-LD with baseSalary, and `/pay` 308 redirect
    - `tests/build/legal-pages.spec.ts` asserts DraftBanner + noindex on all three legal pages
    - `tests/build/recruiter-links.spec.ts` asserts tel: + /apply CTA + MC#/USDOT# placeholder on every emitted HTML page
  </acceptance_criteria>
  <done>Build artifacts assert ROADMAP success criteria 3, 4, and 6 — regressions in routing, JSON-LD, or recruiter-link presence fail CI.</done>
</task>

<task type="auto">
  <name>Task 5.5: DNS check script (SEC-06)</name>
  <files>scripts/check-dns.sh</files>
  <read_first>
    - .planning/phases/01-foundation-form-pay-engine/01-VALIDATION.md "Manual-Only Verifications" — DNS row
    - .planning/phases/01-foundation-form-pay-engine/01-CONTEXT.md D-30 (SPF/DKIM/DMARC)
  </read_first>
  <action>
    Create `scripts/check-dns.sh`:
    ```bash
    #!/usr/bin/env bash
    set -euo pipefail

    DOMAIN="${1:-a2clogisticsco.com}"

    echo "→ Checking DNS records for ${DOMAIN}"
    echo

    echo "SPF:"
    spf=$(dig +short TXT "${DOMAIN}" | grep -i "v=spf1" || true)
    if [[ -z "${spf}" ]]; then echo "  ❌ No SPF TXT record"; exit 1; fi
    echo "  ✓ ${spf}"
    if ! echo "${spf}" | grep -qi "resend"; then
      echo "  ⚠ SPF does not include Resend (expected: include:_spf.resend.com)"
    fi
    echo

    echo "DKIM (resend selector):"
    dkim=$(dig +short TXT "resend._domainkey.${DOMAIN}" || true)
    if [[ -z "${dkim}" ]]; then echo "  ❌ No DKIM TXT record at resend._domainkey.${DOMAIN}"; exit 1; fi
    echo "  ✓ ${dkim:0:80}..."
    echo

    echo "DMARC:"
    dmarc=$(dig +short TXT "_dmarc.${DOMAIN}" | grep -i "v=DMARC1" || true)
    if [[ -z "${dmarc}" ]]; then echo "  ❌ No DMARC TXT record at _dmarc.${DOMAIN}"; exit 1; fi
    echo "  ✓ ${dmarc}"
    echo

    echo "All required DNS records present for ${DOMAIN}."
    ```
    `chmod +x scripts/check-dns.sh`.
  </action>
  <verify>
    <automated>test -x scripts/check-dns.sh && bash -n scripts/check-dns.sh</automated>
  </verify>
  <acceptance_criteria>
    - `scripts/check-dns.sh` exists, is executable, and passes shellcheck (or `bash -n`)
    - Script checks SPF, DKIM (resend selector), and DMARC; exits non-zero if any record is missing
  </acceptance_criteria>
  <done>DNS verification is one command away; runs against the production sending domain to satisfy SEC-06.</done>
</task>

<task type="auto">
  <name>Task 5.6: Manual smoke playbook + Rich Results check helper</name>
  <files>scripts/manual-iphone-smoke.md, scripts/rich-results-check.sh</files>
  <read_first>
    - .planning/phases/01-foundation-form-pay-engine/01-VALIDATION.md "Manual-Only Verifications" (4 manual rows)
    - .planning/phases/01-foundation-form-pay-engine/01-RESEARCH.md §9 (validation architecture per ROADMAP success criterion)
    - .planning/PROJECT.md (Core Value — what success looks like)
  </read_first>
  <action>
    Create `scripts/manual-iphone-smoke.md`:
    ```markdown
    # Phase 1 — Manual Smoke Playbook

    Four checks that automation cannot reliably perform. Run before declaring Phase 1 done.

    Owner: <recruiting/dev lead>
    Time: ~20 minutes

    ---

    ## 1. Real-iPhone form submission ⏱ ~5 min

    **Why manual:** Real cellular network + real Resend deliverability + real Sheet write — the synthetic Cron only proves the path is alive at 04:30 UTC. The first end-to-end submit must be done with a human watching.

    **Steps:**
    1. On a real iPhone (Safari, **cellular**, NOT WiFi), navigate to https://a2clogistics.com/apply
    2. Fill all six free-input fields with synthetic-but-flagged data:
       - First: `TestRun-{today YYYYMMDD}`
       - Last: `Manual`
       - Phone, email: real (so you can confirm if the recruiter responds)
       - CDL Class A, Years 5-10, Role Company, State NE
    3. Tick the SMS consent checkbox.
    4. Submit. Start a stopwatch.
    5. Verify within **60 seconds**:
       - [ ] Email arrives in `${RECRUITER_EMAIL}` inbox
       - [ ] Row appears in the Google Sheet (Leads tab)
       - [ ] Row contains: `consentVersion: tcpa_consent_v1`, timestamp, IP, UA
    6. Verify success page renders with recruiter `tel:` + `sms:` fallback links visible.

    **Pass criteria:** All 4 sub-checks ✅ within 60s.
    **Failure response:** Inspect Cloudflare Pages function logs; check Resend dashboard for delivery status; check Sheet permissions on the service-account email.

    ---

    ## 2. JobPosting JSON-LD validates in Google Rich Results Test ⏱ ~5 min

    **Why manual:** Google's tool is the canonical validator for Google for Jobs eligibility.

    **Steps:**
    1. Open https://search.google.com/test/rich-results
    2. Enter https://a2clogistics.com/pay/owner-operator and click "Test URL"
    3. Verify: `JobPosting` detected, **zero errors**, **zero warnings** about `baseSalary`/`hiringOrganization`/`jobLocation`
    4. Repeat for https://a2clogistics.com/pay/company

    **Pass criteria:** Both pages show "Page is eligible for rich results" for JobPosting.
    **Helper:** `scripts/rich-results-check.sh` opens both URLs in your default browser as a shortcut.

    ---

    ## 3. DNS records (SPF/DKIM/DMARC) ⏱ ~2 min

    **Why manual-ish:** DNS propagation + Resend's verification is out-of-band.

    **Steps:**
    1. Run `scripts/check-dns.sh a2clogisticsco.com` (or the chosen sending domain)
    2. All three records must show ✓.
    3. In the Resend dashboard → Domains → confirm `a2clogisticsco.com` is **Verified**.

    **Pass criteria:** Script exits 0 + Resend dashboard shows verified.

    ---

    ## 4. Cross-browser Apply form smoke ⏱ ~5 min

    **Why manual:** Playwright e2e covers Chromium happy path; real Safari + Firefox quirks need eyes.

    **Steps:**
    1. Open https://a2clogistics.com/apply in Safari (macOS) → submit synthetic flagged lead → success.
    2. Open same in Firefox (latest) → submit → success.
    3. Open same on Android Chrome → submit → success.
    4. Verify Turnstile widget renders (invisible) in all three.

    **Pass criteria:** All three submit successfully without console errors.

    ---

    ## Sign-off

    Date: ____________  Operator: ____________

    - [ ] All four checks ✅
    - [ ] Anomalies (record below):
      - ...

    Once all four pass, Phase 1 verification is complete. Phase 2 (Story + Trust + Ecosystem) can begin.
    ```

    Create `scripts/rich-results-check.sh`:
    ```bash
    #!/usr/bin/env bash
    set -euo pipefail

    BASE_URL="${1:-https://a2clogistics.com}"
    TESTER="https://search.google.com/test/rich-results"

    for path in "/pay/owner-operator" "/pay/company"; do
      url="${BASE_URL}${path}"
      tester_url="${TESTER}?url=$(printf %s "${url}" | python3 -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.stdin.read(), safe=""))')"
      echo "Opening ${tester_url}"
      if [[ "$(uname)" == "Darwin" ]]; then open "${tester_url}"
      elif command -v xdg-open &>/dev/null; then xdg-open "${tester_url}"
      else echo "Open this URL manually: ${tester_url}"; fi
    done
    ```
    `chmod +x scripts/rich-results-check.sh`.
  </action>
  <verify>
    <automated>test -f scripts/manual-iphone-smoke.md && grep -q "Real-iPhone form submission" scripts/manual-iphone-smoke.md && grep -q "JobPosting" scripts/manual-iphone-smoke.md && grep -q "tcpa_consent_v1" scripts/manual-iphone-smoke.md && test -x scripts/rich-results-check.sh</automated>
  </verify>
  <acceptance_criteria>
    - `scripts/manual-iphone-smoke.md` documents all 4 manual checks with pass criteria + failure responses
    - `scripts/rich-results-check.sh` is executable and opens both pay-route URLs in Google's tester
  </acceptance_criteria>
  <done>Manual playbook is runnable in ~20 minutes; Phase 1 verification has a documented gate, not a vibes-based "looks good".</done>
</task>

<task type="checkpoint:human-action" gate="blocking">
  <name>Task 5.7: Run the manual smoke playbook</name>
  <what-built>
    Tasks 5.1–5.6 produced: 4 automated test suites (lead-schema, sink-chaos, lead-dispatch, form-security, build-output) all green in CI; a DNS check script; a manual smoke playbook covering the 4 human-only checks (real-iPhone submit, Rich Results, DNS+Resend, cross-browser).
  </what-built>
  <how-to-verify>
    Execute `scripts/manual-iphone-smoke.md` end-to-end against the deployed production site. Sign off on the playbook's checklist. If any step fails, file a fix and re-run.

    The four checks:
    1. Real-iPhone submit → email + Sheet within 60s + consent metadata
    2. Both pay routes pass Google Rich Results Test for JobPosting
    3. SPF/DKIM/DMARC live + Resend domain verified
    4. Cross-browser submit (Safari, Firefox, Android Chrome) all work

    Sign-off line in `scripts/manual-iphone-smoke.md` filled in (date + operator initials).
  </how-to-verify>
  <continue-when>The playbook sign-off section shows ✅ on all four checks. Phase 1 is then verified end-to-end and ready for Phase 2 to build on top.</continue-when>
</task>

</tasks>

<verification>
  <commands>
    - pnpm test --run                          # full unit + integration suite green
    - pnpm build && pnpm test --run tests/build/  # build artifacts assertions green
    - bash scripts/check-dns.sh a2clogisticsco.com  # DNS check passes (when domain is live)
    - cat scripts/manual-iphone-smoke.md      # playbook present and readable
  </commands>
</verification>

<summary_path>.planning/phases/01-foundation-form-pay-engine/01-05-SUMMARY.md</summary_path>
