# Phase 1: Foundation + Form + Pay Engine - Research

**Phase:** 1 — Foundation + Form + Pay Engine
**Researched:** 2026-05-05
**Mode:** Implementation research for greenfield rebuild on Astro 6 + Cloudflare Pages
**Confidence:** HIGH — anchored in `research/STACK.md` + `research/ARCHITECTURE.md` (verified against Context7 + npm registry on 2026-05-04). Phase-1-specific details verified against current vendor docs.

## How to read this file

This file is **Phase-1 implementation guidance**. Stack and architecture decisions are already locked in `research/STACK.md` (Astro 6 + Tailwind 4 + Cloudflare Pages + Conform + Resend) and `research/ARCHITECTURE.md` (toggle-as-routes, form handler EARLY, 5-wave build order). This file translates those locked decisions into concrete bootstrap commands, config, file inventory, and validation strategy that the planner can turn directly into PLAN.md tasks.

## 1. Bootstrap & Project Init (Wave 0)

### 1.1. Repo cleanup (wholesale replacement, not migration)

The existing Vite/React app is being replaced. Wave 0 starts by deleting everything except `.git/` and brand-asset reference materials:

```bash
# Preserve git history, .github (we'll replace its contents), README placeholder
rm -rf node_modules dist src public
rm -f package.json package-lock.json vite.config.js eslint.config.js components.json jsconfig.json index.html
# Keep .git, .gitignore (will be augmented), README.md (will be replaced)
```

Brand book PDFs in `/Users/alexandercostea/Downloads/` are reference-only — don't copy into the repo. The relevant artifacts (brand colors, fonts, tagline, logo SVGs) get extracted into `src/` files in Wave 0.

### 1.2. Astro 6 init

```bash
npm create astro@latest . -- --template minimal --typescript strict --git --install --skip-houston
```

Use `minimal` template (clean slate). TypeScript `strict` is the project default per `STACK.md`. `--git` is OK because git already exists (Astro will detect and skip re-init). `--install` runs `npm install`.

Then add integrations:

```bash
npx astro add react cloudflare mdx
```

This wires `@astrojs/react`, `@astrojs/cloudflare`, and `@astrojs/mdx` into `astro.config.mjs` and installs them. Confirm `@astrojs/cloudflare@13.3.x` and `@astrojs/mdx@4.4.x`.

Add Tailwind v4 (NOT via `astro add` because v4 install path is different):

```bash
npm install tailwindcss @tailwindcss/vite
```

Then in `astro.config.mjs`:

```ts
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  output: "static", // SSG by default; Actions opt into server runtime per-route
  adapter: cloudflare({
    mode: "directory", // produces /functions/ for Cloudflare Pages
    runtime: { mode: "local", type: "pages", bindings: { /* see KV section */ } },
    imageService: "compile", // use astro:assets for image optimization at build
    platformProxy: { enabled: true }, // exposes Pages bindings during `wrangler dev`
  }),
  integrations: [react(), mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

Confirm Astro 6 `output: "static"` + Cloudflare adapter still ships Actions as Pages Functions automatically (verified — `defineAction` works with `output: "static"` because the adapter intercepts `/_actions/*` routes and emits a Function).

### 1.3. shadcn CLI v4 (Astro template)

```bash
npx shadcn@latest init
# When prompted: framework → Astro
# Style → New York (default)
# Base color → Neutral (we'll override via @theme tokens)
# CSS variables → yes
# Tailwind config → CSS-first @theme (no JS config — Tailwind v4 deprecates it)
# Components dir → src/components/ui
# Utils dir → src/lib/utils
```

This installs `class-variance-authority`, `clsx`, `tailwind-merge`, and creates `components.json`. Then add only the Phase-1 primitives:

```bash
npx shadcn@latest add button input label select checkbox form
```

Six components, no more. Card / Dialog / Carousel / etc. land in Phase 2 when actually needed.

### 1.4. Brand tokens — Tailwind v4 `@theme` block

`src/styles/global.css`:

```css
@import "tailwindcss";

@theme {
  /* A2C palette — exact hex from brand book */
  --color-brand-white: #FFFFFF;
  --color-brand-black: #000000;
  --color-brand-red: #EF392C;
  --color-brand-gray: #D9D9D9;

  /* Type families — wired in §1.5 */
  --font-display: "Nevis Bold", "Anton", system-ui, sans-serif;
  --font-body: "Avenir", "Inter", system-ui, sans-serif;

  /* 8-point spacing scale (UI-SPEC §spacing) */
  --spacing-1: 0.25rem; /* 4 */
  --spacing-2: 0.5rem;  /* 8 */
  --spacing-4: 1rem;    /* 16 */
  --spacing-6: 1.5rem;  /* 24 */
  --spacing-8: 2rem;    /* 32 */
  --spacing-12: 3rem;   /* 48 */
  --spacing-16: 4rem;   /* 64 */
}
```

Tokens become utilities automatically: `bg-brand-red`, `text-brand-black`, `font-display`, `font-body`. NO `tailwind.config.js` (deprecated in v4).

Then in `Layout.astro`:

```astro
---
import "../styles/global.css";
---
```

### 1.5. Self-hosted fonts via Astro Fonts API

Astro 6 `astro:assets` Fonts API is stable. Drop licensed `.woff2` files into `src/assets/fonts/`:

```
src/assets/fonts/nevis-bold.woff2     # licensed; Wave 0 blocker (BRAND-03)
src/assets/fonts/avenir-roman.woff2   # licensed
src/assets/fonts/avenir-medium.woff2  # licensed (semibold equivalent)
```

`astro.config.mjs` `fonts` section (Astro 6 stable API):

```ts
import { fontProviders } from "astro/config";

export default defineConfig({
  experimental: { fonts: [
    {
      provider: "local",
      name: "Nevis Bold",
      cssVariable: "--font-display",
      variants: [{ weight: 700, style: "normal", src: ["./src/assets/fonts/nevis-bold.woff2"] }],
      fallbacks: ["Anton", "system-ui", "sans-serif"],
      display: "swap",
    },
    {
      provider: "local",
      name: "Avenir",
      cssVariable: "--font-body",
      variants: [
        { weight: 400, style: "normal", src: ["./src/assets/fonts/avenir-roman.woff2"] },
        { weight: 600, style: "normal", src: ["./src/assets/fonts/avenir-medium.woff2"] },
      ],
      fallbacks: ["Inter", "system-ui", "sans-serif"],
      display: "swap",
    },
  ]},
});
```

In `Layout.astro`:

```astro
---
import { Font } from "astro:assets";
---
<head>
  <Font cssVariable="--font-display" preload />
  <Font cssVariable="--font-body" preload />
</head>
```

Astro emits `font-display: swap`, `<link rel="preload">`, and computes fallback metric overrides automatically (prevents CLS — addresses Pitfall 13).

**Wave 0 blocker:** Nevis Bold web license must be sourced before this wave can complete. If foundry doesn't sell at acceptable cost, swap `nevis-bold.woff2` for `Anton` (Google Fonts via Fontsource: `npm install @fontsource/anton`) and brand-book footnote the substitution.

### 1.6. Wrangler config + Cloudflare Pages env

Create `wrangler.toml`:

```toml
name = "a2c-logistics"
compatibility_date = "2025-09-23"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = "./dist"

# KV namespaces — created via `wrangler kv:namespace create <NAME>`
[[kv_namespaces]]
binding = "IDEMPOTENCY"
id = "PLACEHOLDER_REPLACE_AFTER_KV_CREATE"

[[kv_namespaces]]
binding = "RATELIMIT"
id = "PLACEHOLDER_REPLACE_AFTER_KV_CREATE"

[[kv_namespaces]]
binding = "LEAD_FALLBACK"
id = "PLACEHOLDER_REPLACE_AFTER_KV_CREATE"

# Cron Trigger — daily synthetic submission test
[triggers]
crons = ["30 4 * * *"]  # 04:30 UTC daily
```

Env-var setup in Cloudflare Pages dashboard (one each for Production + Preview environments):

- `RESEND_API_KEY` (secret)
- `RESEND_FROM` (e.g., `apply@a2clogisticsco.com`)
- `RECRUITER_EMAIL` (e.g., `recruiting@a2clogisticsco.com`)
- `GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON` (secret; full JSON blob, base64-encoded for safe storage if pasting via dashboard)
- `GOOGLE_SHEETS_SHEET_ID`
- `TURNSTILE_SECRET_KEY` (secret)
- `PUBLIC_TURNSTILE_SITE_KEY` (public; `PUBLIC_` prefix exposes it to the client per Astro convention)
- `ALERT_WEBHOOK_URL` (secret; optional Discord/Slack webhook; falls back to alert email if absent)

`.env.example` (committed to repo, no secrets):

```bash
RESEND_API_KEY=re_...
RESEND_FROM=apply@a2clogisticsco.com
RECRUITER_EMAIL=recruiting@a2clogisticsco.com
GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON=base64-encoded-service-account-json
GOOGLE_SHEETS_SHEET_ID=1AbCdEf...
TURNSTILE_SECRET_KEY=0x...
PUBLIC_TURNSTILE_SITE_KEY=0x...
ALERT_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

`src/env.d.ts` (Cloudflare runtime type augmentation):

```ts
/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

interface ImportMetaEnv {
  readonly PUBLIC_TURNSTILE_SITE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

type Runtime = import("@astrojs/cloudflare").Runtime<{
  IDEMPOTENCY: KVNamespace;
  RATELIMIT: KVNamespace;
  LEAD_FALLBACK: KVNamespace;
  RESEND_API_KEY: string;
  RESEND_FROM: string;
  RECRUITER_EMAIL: string;
  GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON: string;
  GOOGLE_SHEETS_SHEET_ID: string;
  TURNSTILE_SECRET_KEY: string;
  ALERT_WEBHOOK_URL: string;
}>;

declare namespace App {
  interface Locals extends Runtime {}
}
```

Inside any Astro page or Action: `Astro.locals.runtime.env.IDEMPOTENCY`. Inside a Pages Function context: `ctx.env.IDEMPOTENCY`.

## 2. Form Handler Architecture (Wave 3 — runs parallel with Wave 2)

### 2.1. Astro Action

`src/actions/index.ts`:

```ts
import { defineAction, ActionError } from "astro:actions";
import { leadSchema } from "../lib/validation/lead-schema";
import { dispatchLead } from "../lib/sinks/dispatch";
import { verifyTurnstile } from "../lib/turnstile";
import { checkOrigin, checkRateLimit, checkIdempotency } from "../lib/security";

export const server = {
  apply: defineAction({
    accept: "form",
    input: leadSchema,
    handler: async (input, ctx) => {
      const env = ctx.locals.runtime.env;

      // Layered defense (Pitfall 6 — bots find recruiting forms within 48h)
      if (!await checkOrigin(ctx)) throw new ActionError({ code: "BAD_REQUEST", message: "Invalid origin" });
      if (input.website) return { ok: true, leadId: "honeypot" }; // honeypot — silent 200 to not tip bots
      if (!await verifyTurnstile(input.turnstileToken, env)) throw new ActionError({ code: "FORBIDDEN", message: "Verification failed" });
      if (!await checkRateLimit(ctx, env)) throw new ActionError({ code: "TOO_MANY_REQUESTS", message: "Too many submissions" });
      if (!await checkIdempotency(input.idempotencyKey, env)) return { ok: true, leadId: input.idempotencyKey, dedup: true };

      // Sink fan-out with partial-failure tolerance (FUNNEL-03; Pitfall 1)
      const result = await dispatchLead(input, env, ctx);
      return { ok: true, leadId: result.leadId, sinkStatus: result.sinkStatus };
    },
  }),
};
```

### 2.2. Zod schema

`src/lib/validation/lead-schema.ts`:

```ts
import { z } from "zod";

export const leadSchema = z.object({
  // 6 free-input fields
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  phone: z.string().regex(/^[\d\s\-\(\)\+\.]{10,20}$/, "Enter a valid phone number"),
  email: z.string().email().max(254),
  cdlClass: z.enum(["A"]),                        // CDL Class A only per CONTEXT D-20
  yearsExperience: z.enum(["1-2", "3-5", "5-10", "10+"]),

  // Selectors
  role: z.enum(["owner-operator", "company"]),    // OO/Company toggle (FUNNEL-01)
  state: z.enum([/* 50 states + DC */]),

  // Consent + security
  smsConsent: z.literal(true, { errorMap: () => ({ message: "SMS consent is required to receive recruiter texts" }) }),
  consentVersion: z.literal("tcpa_consent_v1"),   // version stamp (COMP-02; Pitfall 4)
  formVersion: z.literal("v1"),

  // Anti-bot
  website: z.string().max(0).optional(),          // honeypot — must be empty (SEC-02)
  turnstileToken: z.string().min(10),             // Turnstile token (SEC-01)
  idempotencyKey: z.string().uuid(),              // client-generated (FUNNEL-08)
});

export type Lead = z.infer<typeof leadSchema>;
```

### 2.3. `LeadSink` adapter pattern

`src/lib/sinks/types.ts`:

```ts
import type { Lead } from "../validation/lead-schema";

export interface LeadSinkResult { ok: boolean; error?: string; }
export interface LeadSink {
  name: string;
  required: boolean;
  dispatch(lead: Lead, env: any): Promise<LeadSinkResult>;
}
```

`src/lib/sinks/email-sink.ts` — Resend (REQUIRED):

```ts
import { Resend } from "resend";
import type { LeadSink, LeadSinkResult } from "./types";
import type { Lead } from "../validation/lead-schema";

export const emailSink: LeadSink = {
  name: "email",
  required: true,
  async dispatch(lead: Lead, env): Promise<LeadSinkResult> {
    try {
      const resend = new Resend(env.RESEND_API_KEY);
      const { error } = await resend.emails.send({
        from: env.RESEND_FROM,
        to: env.RECRUITER_EMAIL,
        subject: `New driver lead — ${lead.firstName} ${lead.lastName} (${lead.role}, ${lead.state})`,
        text: formatLeadText(lead),
      });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  },
};
```

Resend SDK works in Cloudflare Pages with `nodejs_compat`; v6.12.x verified.

`src/lib/sinks/sheet-sink.ts` — Google Sheets via `jose` JWT + raw `fetch` (NOT `googleapis` — too heavy, doesn't run cleanly in Workers even with `nodejs_compat`):

```ts
import { SignJWT, importPKCS8 } from "jose";
import type { LeadSink, LeadSinkResult } from "./types";
import type { Lead } from "../validation/lead-schema";

async function getSheetsAccessToken(env: any): Promise<string> {
  const sa = JSON.parse(atob(env.GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON));
  const privateKey = await importPKCS8(sa.private_key, "RS256");
  const now = Math.floor(Date.now() / 1000);
  const jwt = await new SignJWT({
    scope: "https://www.googleapis.com/auth/spreadsheets",
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuedAt(now)
    .setIssuer(sa.client_email)
    .setAudience("https://oauth2.googleapis.com/token")
    .setExpirationTime(now + 3600)
    .sign(privateKey);

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const { access_token } = await tokenRes.json() as { access_token: string };
  return access_token;
}

export const sheetSink: LeadSink = {
  name: "sheet",
  required: false,
  async dispatch(lead: Lead, env): Promise<LeadSinkResult> {
    try {
      const token = await getSheetsAccessToken(env);
      const row = [
        new Date().toISOString(),
        lead.idempotencyKey,
        lead.firstName, lead.lastName, lead.phone, lead.email,
        lead.cdlClass, lead.yearsExperience, lead.role, lead.state,
        lead.consentVersion, lead.formVersion,
      ];
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEETS_SHEET_ID}/values/Leads:append?valueInputOption=RAW`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ values: [row] }),
        }
      );
      if (!res.ok) return { ok: false, error: `Sheets API ${res.status}: ${await res.text()}` };
      return { ok: true };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  },
};
```

**Why `jose` not `googleapis`:** Cloudflare's own Workers Sheets tutorial uses `jose` for service-account JWT signing because `googleapis` brings in 500+ KB of Node-only code that doesn't tree-shake well even with `nodejs_compat`. `jose` is ~30 KB, edge-native, and signs JWTs in pure WebCrypto. Same auth flow, lighter footprint.

`src/lib/sinks/dispatch.ts` — fan-out with partial-failure handling:

```ts
import { emailSink } from "./email-sink";
import { sheetSink } from "./sheet-sink";
import { fireAlert } from "../alerts";
import type { Lead } from "../validation/lead-schema";

const SINKS = [emailSink, sheetSink];

export async function dispatchLead(lead: Lead, env: any, ctx: any) {
  const results = await Promise.all(SINKS.map(s => s.dispatch(lead, env).then(r => ({ sink: s, ...r }))));

  const requiredFailures = results.filter(r => r.sink.required && !r.ok);
  const optionalFailures = results.filter(r => !r.sink.required && !r.ok);

  // Required sink failed → propagate error; user sees error state
  if (requiredFailures.length > 0) {
    await fireAlert(env, "REQUIRED_SINK_FAILED", { lead, failures: requiredFailures });
    throw new Error(`Required sink failed: ${requiredFailures.map(f => f.sink.name).join(", ")}`);
  }

  // Optional sink failed → queue to fallback + alert; user sees success
  if (optionalFailures.length > 0) {
    await env.LEAD_FALLBACK.put(
      `lead:${lead.idempotencyKey}`,
      JSON.stringify({ lead, failedSinks: optionalFailures.map(f => f.sink.name), ts: Date.now() }),
      { expirationTtl: 60 * 60 * 24 * 30 } // 30-day retention
    );
    await fireAlert(env, "OPTIONAL_SINK_FAILED", { lead, failures: optionalFailures });
  }

  return {
    leadId: lead.idempotencyKey,
    sinkStatus: Object.fromEntries(results.map(r => [r.sink.name, r.ok ? "ok" : "failed"])),
  };
}
```

### 2.4. Security middleware

`src/lib/turnstile.ts`:

```ts
export async function verifyTurnstile(token: string, env: any): Promise<boolean> {
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token }),
  });
  const data = await res.json() as { success: boolean };
  return data.success === true;
}
```

`src/lib/security.ts`:

```ts
export async function checkOrigin(ctx: any): Promise<boolean> {
  const origin = ctx.request.headers.get("Origin");
  const allowed = [
    "https://a2clogistics.com",            // production (TBD)
    "https://www.a2clogistics.com",
    /^https:\/\/[a-z0-9-]+\.a2c-logistics\.pages\.dev$/, // preview deploys
  ];
  if (!origin) return false;
  return allowed.some(a => typeof a === "string" ? a === origin : a.test(origin));
}

export async function checkRateLimit(ctx: any, env: any): Promise<boolean> {
  const ip = ctx.request.headers.get("CF-Connecting-IP") ?? "unknown";
  const key = `rl:${ip}`;
  const existing = await env.RATELIMIT.get(key, { type: "json" }) as number[] ?? [];
  const now = Date.now();
  const windowStart = now - 10 * 60 * 1000; // 10-min sliding window
  const recent = existing.filter(t => t > windowStart);
  if (recent.length >= 3) return false;
  recent.push(now);
  await env.RATELIMIT.put(key, JSON.stringify(recent), { expirationTtl: 600 });
  return true;
}

export async function checkIdempotency(key: string, env: any): Promise<boolean> {
  const seen = await env.IDEMPOTENCY.get(`idem:${key}`);
  if (seen) return false; // duplicate
  await env.IDEMPOTENCY.put(`idem:${key}`, "1", { expirationTtl: 600 });
  return true;
}
```

### 2.5. Alerts

`src/lib/alerts.ts`:

```ts
export async function fireAlert(env: any, type: string, payload: any) {
  if (env.ALERT_WEBHOOK_URL) {
    await fetch(env.ALERT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: `🚨 [${type}] ${JSON.stringify(payload, null, 2)}` }),
    }).catch(() => {});
  }
  // Always also email the recruiter as a redundant channel
  // (using a lightweight inline Resend call to avoid recursive sink invocation)
  const { Resend } = await import("resend");
  const resend = new Resend(env.RESEND_API_KEY);
  await resend.emails.send({
    from: env.RESEND_FROM,
    to: env.RECRUITER_EMAIL,
    subject: `🚨 A2C site alert: ${type}`,
    text: JSON.stringify(payload, null, 2),
  }).catch(() => {});
}
```

### 2.6. Daily synthetic submission (Cron Trigger)

`functions/[[catchall]].ts` is auto-generated by `@astrojs/cloudflare`. For the cron, add `functions/_middleware.ts` is wrong location — cron handlers are separate. Use `wrangler.toml` `[triggers]` and a dedicated worker file:

`src/cron/synthetic.ts` (compiled into the Pages Function bundle):

The simplest pattern: a separate page route `/_internal/synthetic-submit` that the cron POSTs to. The route validates a shared-secret header, then submits a flagged lead via the normal `apply` action. Sink dispatch sees `synthetic: true` and tags the row but otherwise executes normally — confirms both sinks are alive. Alert fires if either fails.

`src/pages/_internal/synthetic-submit.ts` (Astro endpoint, server-only):

```ts
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const auth = request.headers.get("X-Synthetic-Secret");
  if (auth !== env.SYNTHETIC_SECRET) return new Response("unauthorized", { status: 401 });

  const synthetic = {
    firstName: "Synthetic",
    lastName: "Test",
    phone: "5555550100",
    email: "synthetic@a2clogisticsco.com",
    cdlClass: "A" as const,
    yearsExperience: "5-10" as const,
    role: "company" as const,
    state: "NE",
    smsConsent: true as const,
    consentVersion: "tcpa_consent_v1" as const,
    formVersion: "v1" as const,
    turnstileToken: "synthetic-bypass-token",
    idempotencyKey: `synthetic-${Date.now()}-${crypto.randomUUID()}`,
    synthetic: true,
  };

  // Run all sinks; any failure → alert
  // ... (calls dispatchLead with bypassed turnstile/origin/ratelimit checks via a wrapper)
  return new Response("ok", { status: 200 });
};
```

Wire `crons = ["30 4 * * *"]` to call this endpoint via Cloudflare's Cron Trigger feature pointing at `/_internal/synthetic-submit` with `X-Synthetic-Secret: <SYNTHETIC_SECRET>` header.

## 3. Pay Routes (Wave 2)

### 3.1. `src/data/pay.ts`

```ts
import { z } from "zod";

const PayRangeSchema = z.object({
  min: z.number(),
  max: z.number(),
  unit: z.enum(["USD", "CPM", "PCT"]), // dollars / cents-per-mile / percent
  effective: z.string().regex(/^\d{4}-\d{2}$/), // YYYY-MM
  notes: z.string().optional(),
});

const CompanyPaySchema = z.object({
  cpm: PayRangeSchema,
  signOnBonus: PayRangeSchema.optional(),
  fastPayHours: z.number(),
  detentionPay: PayRangeSchema.optional(),
  layoverPay: PayRangeSchema.optional(),
  perDiem: z.string().optional(),
  benefits: z.array(z.string()),
  effective: z.string().regex(/^\d{4}-\d{2}$/),
});

const OwnerOpPaySchema = z.object({
  percentOfGross: PayRangeSchema,
  representativeWeeklyNet: PayRangeSchema,
  fuelDiscount: PayRangeSchema.optional(),
  fastPayHours: z.number(),
  settlementSchedule: z.string(),
  deductions: z.array(z.object({ name: z.string(), description: z.string(), amount: z.string().optional() })),
  detentionPay: PayRangeSchema.optional(),
  effective: z.string().regex(/^\d{4}-\d{2}$/),
});

export const PaySchema = z.object({
  company: CompanyPaySchema,
  ownerOperator: OwnerOpPaySchema,
});

// Real numbers TBD — operations team supplies (Phase 1 content-readiness blocker).
// Until supplied, ship placeholder ranges flagged "pending real data" per CONTEXT D-11.
export const pay = PaySchema.parse({
  company: {
    cpm: { min: 0.55, max: 0.72, unit: "CPM", effective: "2026-05", notes: "Scales with experience and tenure" },
    signOnBonus: { min: 2000, max: 5000, unit: "USD", effective: "2026-05", notes: "Paid in two installments at 90 and 180 days" },
    fastPayHours: 48,
    detentionPay: { min: 20, max: 25, unit: "USD", effective: "2026-05", notes: "Per hour after first 2 hours at shipper/receiver" },
    layoverPay: { min: 100, max: 100, unit: "USD", effective: "2026-05", notes: "Per 24-hour layover after first 24 hours" },
    perDiem: "Up to $69/day untaxed allowance available",
    benefits: ["Health, dental, vision insurance", "401(k) with 4% match", "Paid time off", "Paid orientation"],
    effective: "2026-05",
  },
  ownerOperator: {
    percentOfGross: { min: 65, max: 72, unit: "PCT", effective: "2026-05" },
    representativeWeeklyNet: { min: 2200, max: 3800, unit: "USD", effective: "2026-05", notes: "Typical net after fuel/insurance/maintenance on Lincoln-region lanes; depends on miles run" },
    fuelDiscount: { min: 0.4, max: 0.6, unit: "USD", effective: "2026-05", notes: "Per gallon off retail at network truck stops" },
    fastPayHours: 24,
    settlementSchedule: "Weekly (Friday for prior Sunday-Saturday week)",
    deductions: [
      { name: "Cargo insurance", description: "Required FMCSA coverage", amount: "~$150/week" },
      { name: "Bobtail/non-trucking liability", description: "Personal use coverage", amount: "~$25/week" },
      { name: "Trailer rental (optional)", description: "If using A2C trailer", amount: "~$200/week" },
      { name: "ELD subscription", description: "FMCSA ELD mandate compliance", amount: "~$25/month" },
    ],
    detentionPay: { min: 20, max: 25, unit: "USD", effective: "2026-05", notes: "Owner-op share of detention payment from shipper" },
    effective: "2026-05",
  },
});

// Placeholder flag — flip to false when real numbers arrive
export const PAY_NUMBERS_ARE_PLACEHOLDER = true;
```

### 3.2. Pay route pages

`src/pages/pay/owner-operator.astro`:

```astro
---
import PayLayout from "../../layouts/PayLayout.astro";
import { pay, PAY_NUMBERS_ARE_PLACEHOLDER } from "../../data/pay";
import PayBadge from "../../components/sections/PayBadge.astro";
import JobPostingJsonLd from "../../components/sections/JobPostingJsonLd.astro";

const oo = pay.ownerOperator;
---
<PayLayout title="Owner-Operator Pay & Terms — A2C Logistics" role="owner-operator">
  <JobPostingJsonLd
    title="Owner-Operator Driver"
    role="owner-operator"
    payMin={oo.representativeWeeklyNet.min}
    payMax={oo.representativeWeeklyNet.max}
    payUnit="WEEK"
    effective={oo.effective}
  />

  <h1 class="font-display text-display-lg">Owner-operator pay at A2C</h1>

  {PAY_NUMBERS_ARE_PLACEHOLDER && (
    <p class="bg-yellow-50 border border-yellow-200 p-4 rounded text-sm">
      Numbers shown are <strong>indicative placeholder ranges pending real-data confirmation</strong>.
      Recruiter will confirm exact terms on call. <a href={`/apply?role=owner-operator`}>Apply now</a>.
    </p>
  )}

  <section>
    <h2 class="font-display">Take-home</h2>
    <p>Owner-operators keep <PayBadge range={oo.percentOfGross} /> of the gross load.</p>
    <p>Typical net: <PayBadge range={oo.representativeWeeklyNet} />/week on Lincoln-region lanes.</p>
  </section>

  <!-- ... etc — fast pay, fuel discount, settlement, deductions ... -->
</PayLayout>
```

`src/pages/pay/company.astro` — symmetric structure.

`src/pages/pay/index.astro`:

```astro
---
return Astro.redirect("/pay/owner-operator", 308);
---
```

### 3.3. `JobPosting` JSON-LD component

`src/components/sections/JobPostingJsonLd.astro`:

```astro
---
interface Props {
  title: string;
  role: "owner-operator" | "company";
  payMin: number;
  payMax: number;
  payUnit: "MILE" | "WEEK" | "MONTH" | "YEAR";
  effective: string;
}
const { title, role, payMin, payMax, payUnit, effective } = Astro.props;

const json = {
  "@context": "https://schema.org",
  "@type": "JobPosting",
  title,
  description: `${title} at A2C Logistics CO. — ${role === "owner-operator" ? "Lease-on owner-operator opportunity" : "W2 company driver opportunity"} based in Lincoln, NE.`,
  datePosted: `${effective}-01`,
  validThrough: `${effective.slice(0, 4)}-12-31`,
  employmentType: role === "owner-operator" ? "CONTRACTOR" : "FULL_TIME",
  hiringOrganization: {
    "@type": "Organization",
    name: "A2C Logistics CO.",
    sameAs: "https://a2clogistics.com",
    logo: "https://a2clogistics.com/logo-primary.svg",
  },
  jobLocation: {
    "@type": "Place",
    address: { "@type": "PostalAddress", addressLocality: "Lincoln", addressRegion: "NE", addressCountry: "US" },
  },
  baseSalary: {
    "@type": "MonetaryAmount",
    currency: "USD",
    value: { "@type": "QuantitativeValue", minValue: payMin, maxValue: payMax, unitText: payUnit },
  },
};
---
<script type="application/ld+json" set:html={JSON.stringify(json)} />
```

### 3.4. OO/Company toggle

`src/components/sections/PayToggle.astro`:

```astro
---
interface Props { current: "owner-operator" | "company"; }
const { current } = Astro.props;
---
<nav class="flex gap-2 mb-8" aria-label="Pay variant">
  <a
    href="/pay/owner-operator"
    class:list={[
      "px-6 py-3 rounded-full font-display text-sm border-2 transition-colors min-h-11",
      current === "owner-operator" ? "bg-brand-red border-brand-red text-brand-white" : "bg-transparent border-brand-black text-brand-black hover:bg-brand-gray",
    ]}
    aria-current={current === "owner-operator" ? "page" : undefined}
  >Owner-operator</a>
  <a
    href="/pay/company"
    class:list={[
      "px-6 py-3 rounded-full font-display text-sm border-2 transition-colors min-h-11",
      current === "company" ? "bg-brand-red border-brand-red text-brand-white" : "bg-transparent border-brand-black text-brand-black hover:bg-brand-gray",
    ]}
    aria-current={current === "company" ? "page" : undefined}
  >Company driver</a>
</nav>
```

`src/components/islands/TogglePersistence.astro` (vanilla TS, runs once per page):

```astro
<script>
  // On pay page load, persist the role to localStorage
  const path = window.location.pathname;
  if (path === "/pay/owner-operator") localStorage.setItem("a2c_role", "owner-operator");
  if (path === "/pay/company") localStorage.setItem("a2c_role", "company");
  // On /pay (root), redirect to last-chosen
  if (path === "/pay" || path === "/pay/") {
    const role = localStorage.getItem("a2c_role") ?? "owner-operator";
    window.location.replace(`/pay/${role}`);
  }
  // On /apply, pre-fill role selector if not already URL-specified
  if (path === "/apply" && !window.location.search.includes("role=")) {
    const role = localStorage.getItem("a2c_role");
    if (role) {
      const sel = document.querySelector<HTMLSelectElement>('select[name="role"]');
      if (sel) sel.value = role;
    }
  }
</script>
```

## 4. Apply Form (Wave 3)

### 4.1. `src/components/islands/ApplyForm.tsx`

```tsx
import { useForm, getFormProps, getInputProps, getSelectProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Turnstile } from "@marsidev/react-turnstile";
import { useState } from "react";
import { actions } from "astro:actions";
import { leadSchema } from "../../lib/validation/lead-schema";

interface Props {
  defaultRole?: "owner-operator" | "company";
  turnstileSiteKey: string;
}

export default function ApplyForm({ defaultRole, turnstileSiteKey }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  const [form, fields] = useForm({
    onValidate({ formData }) { return parseWithZod(formData, { schema: leadSchema }); },
    shouldValidate: "onBlur",
    defaultValue: { role: defaultRole ?? "company", consentVersion: "tcpa_consent_v1", formVersion: "v1", idempotencyKey },
  });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    fd.set("turnstileToken", turnstileToken);
    fd.set("idempotencyKey", idempotencyKey);
    const result = await actions.apply(fd);
    if (result.error) {
      setServerError("Something went wrong submitting your application. Call or text us instead — we'll handle it personally.");
    } else {
      window.location.href = `/apply/success?role=${fd.get("role")}`;
    }
    setSubmitting(false);
  }

  return (
    <form {...getFormProps(form)} onSubmit={onSubmit} className="space-y-6">
      {/* honeypot — hidden visually but submit-able */}
      <input type="text" name="website" tabIndex={-1} aria-hidden="true" autoComplete="off"
             className="absolute left-[-9999px] w-px h-px overflow-hidden" />

      {/* role selector (deep-link-aware) */}
      {/* firstName / lastName / phone / email / cdlClass / yearsExperience / state */}
      {/* SMS consent checkbox with full TCPA wording from UI-SPEC */}

      <Turnstile siteKey={turnstileSiteKey} onSuccess={setTurnstileToken} />

      <button type="submit" disabled={submitting || !turnstileToken}
              className="w-full bg-brand-red text-brand-white font-display py-3 px-6 rounded min-h-12 disabled:opacity-50">
        {submitting ? "Submitting…" : "Submit application"}
      </button>

      {serverError && (
        <div role="alert" className="bg-red-50 border border-brand-red p-4 rounded">
          <p className="font-display">{serverError}</p>
          <p className="mt-2">
            <a href="tel:+15551234567" className="underline">Call (555) 123-4567</a>
            {" or "}
            <a href="sms:+15551234567?body=Hi%20A2C%20-%20I%27d%20like%20to%20apply" className="underline">text us</a>.
          </p>
        </div>
      )}
    </form>
  );
}
```

### 4.2. `src/pages/apply.astro`

```astro
---
import Layout from "../layouts/Layout.astro";
import ApplyForm from "../components/islands/ApplyForm.tsx";
const role = Astro.url.searchParams.get("role") as "owner-operator" | "company" | null;
const turnstileSiteKey = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY;
---
<Layout title="Apply to drive for A2C Logistics" noindex={false}>
  <main class="max-w-xl mx-auto px-4 py-12">
    <h1 class="font-display text-display-lg mb-2">Apply</h1>
    <p class="text-body mb-8">Six fields. No resume needed. A recruiter will text or call within 24 hours.</p>
    <ApplyForm client:load defaultRole={role ?? "company"} turnstileSiteKey={turnstileSiteKey} />
  </main>
</Layout>
```

### 4.3. `src/pages/apply/success.astro`

```astro
---
import Layout from "../../layouts/Layout.astro";
const role = Astro.url.searchParams.get("role");
---
<Layout title="Application received — A2C Logistics" noindex={true}>
  <main class="max-w-xl mx-auto px-4 py-12 text-center">
    <h1 class="font-display text-display-lg mb-4">Got it.</h1>
    <p class="text-body mb-8">A recruiter will text or call within 24 hours.</p>
    <p>Need to reach us first?</p>
    <p class="mt-4">
      <a href="tel:+15551234567" class="underline font-display">Call (555) 123-4567</a>
      <br />
      <a href="sms:+15551234567" class="underline font-display">Text us</a>
    </p>
  </main>
</Layout>
```

## 5. Layout, Header, Footer

### 5.1. `src/layouts/Layout.astro`

```astro
---
import "../styles/global.css";
import { Font } from "astro:assets";
import Header from "../components/Header.astro";
import Footer from "../components/Footer.astro";
import TogglePersistence from "../components/islands/TogglePersistence.astro";

interface Props { title: string; noindex?: boolean; description?: string; }
const { title, noindex, description = "A2C Logistics CO. — driver-first trucking. Owner-operators and company drivers. Lincoln, NE." } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    {noindex && <meta name="robots" content="noindex" />}
    <Font cssVariable="--font-display" preload />
    <Font cssVariable="--font-body" preload />
  </head>
  <body class="font-body bg-brand-white text-brand-black antialiased">
    <Header />
    <slot />
    <Footer />
    <TogglePersistence />
  </body>
</html>
```

### 5.2. `src/components/Header.astro`

```astro
---
// Sticky header with persistent Apply CTA
---
<header class="sticky top-0 z-50 bg-brand-white border-b border-brand-gray">
  <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
    <a href="/" aria-label="A2C Logistics — home">
      <img src="/logo-primary.svg" alt="A2C Logistics" class="h-8 w-auto" />
    </a>
    <a href="/apply"
       class="bg-brand-red text-brand-white font-display text-sm px-6 py-3 rounded min-h-11 flex items-center">
      Apply
    </a>
  </div>
</header>
```

### 5.3. `src/components/Footer.astro`

```astro
---
// MC# / USDOT# placeholder — TBD; populated when ops confirms
const recruiterTel = "+15551234567"; // TBD
const recruiterTelDisplay = "(555) 123-4567";
const mc = "MC# XXXXXX";   // TBD
const usdot = "USDOT# XXXXXX"; // TBD
---
<footer class="bg-brand-black text-brand-white py-12 mt-24">
  <div class="max-w-7xl mx-auto px-4 grid gap-8 md:grid-cols-3">
    <div>
      <img src="/logo-inverse.svg" alt="A2C Logistics" class="h-10 w-auto mb-4" />
      <p class="text-sm">300 S. Cotner Blvd, Lincoln, NE</p>
      <p class="text-sm mt-2">{mc} · {usdot}</p>
    </div>
    <div>
      <p class="font-display mb-2">Reach a recruiter</p>
      <p>
        <a href={`tel:${recruiterTel}`} aria-label="Call recruiter" class="underline">{recruiterTelDisplay}</a>
      </p>
      <p>
        <a href={`sms:${recruiterTel}`} aria-label="Text recruiter" class="underline">Text us</a>
      </p>
    </div>
    <div>
      <p class="font-display mb-2">Legal</p>
      <ul class="space-y-1 text-sm">
        <li><a href="/privacy" class="underline">Privacy Policy</a></li>
        <li><a href="/sms-terms" class="underline">SMS Terms</a></li>
        <li><a href="/eeo" class="underline">EEO Statement</a></li>
      </ul>
    </div>
  </div>
</footer>
```

## 6. Compliance Drafts (Wave 4)

`src/content/legal/privacy.mdx`, `src/content/legal/sms-terms.mdx`, `src/content/legal/eeo.mdx` — each starts with the draft banner from UI-SPEC:

```mdx
---
title: Privacy Policy
draft: true
---

import DraftBanner from "../../components/sections/DraftBanner.astro";

<DraftBanner />

# Privacy Policy

(...standard recruiting privacy policy template — covers PII collection on the apply form,
TCPA SMS consent, FCRA stance for future MVR pull, retention period, contact for deletion request...)
```

`src/content/config.ts`:

```ts
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

`src/pages/[slug].astro` renders entries from the `legal` collection at `/privacy`, `/sms-terms`, `/eeo`.

## 7. CI Workflow (Wave 0)

`.github/workflows/ci.yml`:

```yaml
name: CI
on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec astro check
      - run: pnpm build
```

(Lighthouse + axe gates land in Phase 3 per CONTEXT D-40.)

## 8. Wave-by-Wave File Inventory

This is the planner's primary input — exact files per wave.

### Wave 0 — Foundation (BLOCKS everything)
- DELETE: `node_modules/`, `dist/`, `src/`, `public/`, `package.json`, `package-lock.json`, `vite.config.js`, `eslint.config.js`, `components.json`, `jsconfig.json`, `index.html`, `.github/workflows/*` (replace contents)
- CREATE: `package.json` (Astro starter), `pnpm-lock.yaml`, `astro.config.mjs`, `tsconfig.json`, `wrangler.toml`, `.env.example`, `.gitignore` (augmented), `src/env.d.ts`, `src/styles/global.css` (with `@theme` block), `src/assets/fonts/{nevis-bold,avenir-roman,avenir-medium}.woff2`, `public/logo-primary.svg`, `public/logo-inverse.svg`, `public/favicon.svg`, `.github/workflows/ci.yml`, `README.md` (replaced)
- BLOCKER: Nevis Bold web license sourced (BRAND-03)
- BLOCKER: Resend domain SPF/DKIM/DMARC DNS records added
- BLOCKER: KV namespaces created via `wrangler kv:namespace create IDEMPOTENCY` etc., IDs pasted into `wrangler.toml`

### Wave 1 — Primitives + Layout + Schemas
- CREATE: `src/components/ui/{button,input,label,select,checkbox,form}.tsx` (via `npx shadcn add`)
- CREATE: `src/components/Header.astro`, `src/components/Footer.astro`
- CREATE: `src/layouts/Layout.astro`
- CREATE: `src/lib/validation/lead-schema.ts`, `src/data/pay.ts`
- CREATE: `src/content/config.ts`
- CREATE: `src/lib/utils.ts` (cn helper from shadcn)

### Wave 2 — Pay Routes (PARALLEL with Wave 3)
- CREATE: `src/layouts/PayLayout.astro`
- CREATE: `src/pages/pay/owner-operator.astro`, `src/pages/pay/company.astro`, `src/pages/pay/index.astro` (308 redirect)
- CREATE: `src/components/sections/PayBadge.astro`, `src/components/sections/PayToggle.astro`, `src/components/sections/JobPostingJsonLd.astro`
- CREATE: `src/components/islands/TogglePersistence.astro`
- CREATE: pay-page MDX content if any prose lives in MDX (otherwise inline in `.astro`)

### Wave 3 — Form Handler + Form UI (PARALLEL with Wave 2)
- CREATE: `src/actions/index.ts`
- CREATE: `src/lib/sinks/types.ts`, `src/lib/sinks/email-sink.ts`, `src/lib/sinks/sheet-sink.ts`, `src/lib/sinks/dispatch.ts`
- CREATE: `src/lib/turnstile.ts`, `src/lib/security.ts`, `src/lib/alerts.ts`
- CREATE: `src/components/islands/ApplyForm.tsx`
- CREATE: `src/pages/apply.astro`, `src/pages/apply/success.astro`
- CREATE: `src/pages/_internal/synthetic-submit.ts` (cron target endpoint)

### Wave 4 — Wire-up + Compliance Drafts
- CREATE: `src/content/legal/privacy.mdx`, `sms-terms.mdx`, `eeo.mdx`
- CREATE: `src/components/sections/DraftBanner.astro`
- CREATE: `src/pages/[slug].astro` (renders legal collection)
- WIRE: header CTA + footer recruiter `tel:`/`sms:` (already in Wave 1 layout — verify)

### Wave 5 — Phase-1 Verification
- MANUAL: Real-iPhone smoke test of all 6 ROADMAP success criteria
- AUTOMATED: `curl` script verifying form rejects bad origin / no Turnstile / honeypot filled / 4th submission in 10min
- AUTOMATED: Submit synthetic test, verify email arrives + Sheet row appears within 60s, consent metadata present
- AUTOMATED: Break Sheet credentials, verify email still delivers + KV fallback row written + alert fires
- VALIDATE: `JobPosting` JSON-LD on both pay routes via Google Rich Results Test (smoke check)

## 9. Validation Architecture (Nyquist VALIDATION.md feedstock)

Per ROADMAP.md, Phase 1 has **6 success criteria**. Mapping each to validation strategy:

| Success Criterion | Validation Type | How |
|---|---|---|
| 1. Test submit from iPhone → email + Sheet within 60s with consent metadata | Manual smoke + automated synthetic | Real device test in Wave 5; Cron synthetic runs daily after launch |
| 2. Break Sheet → email still delivers, KV fallback written, alert in 5 min, success state | Integration test | Wave 5 chaos test — revoke Sheets credentials, submit, verify all paths |
| 3. `/pay/owner-operator` + `/pay/company` SSG'd with own meta + JSON-LD; `/pay` 308s | Build-output assertion + Rich Results Test | `curl -I` for redirect; HTML grep for unique titles + canonical; Rich Results Test via curl-based API |
| 4. OO ↔ Company toggle navigates between routes; `localStorage` persists; `tel:`/`sms:` in header+footer | Integration test (Playwright) + manual | Click toggle, assert URL change; reload `/pay`, assert correct landing; grep `<a href="tel:` and `<a href="sms:` in every page output |
| 5. Form rejects: bad origin / no Turnstile / honeypot / 4th-in-10min; SPF/DKIM/DMARC live; client+server share Zod | curl-based acceptance + DNS check + import audit | Send malformed POST, expect 400/403/429; `dig TXT` SPF/DKIM/DMARC records; grep `lead-schema` import in both client and server files |
| 6. Privacy/SMS Terms/EEO drafts live + linked + draft-banner; consent block covers TCPA; field whitelist excludes SSN/MVR/etc. | Build-output assertion | `curl -L /privacy /sms-terms /eeo` returns 200 with banner; grep form HTML for consent text + version stamp; schema-test asserts unrecognized fields rejected |

## 10. Anti-Patterns to Avoid

These are surfaced from `research/PITFALLS.md` and translated to Phase-1-specific NOs:

- ❌ **Submit success page returns 200 but lead silently dropped** → Pitfall 1 — every sink result asserted; alerts fire on any failure; daily synthetic verifies live state.
- ❌ **Pay page lists single point numbers** → Pitfall 2 — schema enforces ranges + `effective` date.
- ❌ **TCPA consent checkbox pre-checked** → Pitfall 4 — required positive opt-in; consent text version stamped.
- ❌ **Toggle as `?role=oo` query param** → Pitfall 7 — locked: two physical routes only.
- ❌ **Form ships without origin check + rate limit** → Pitfall 6 — bots find recruiting forms within 48h. Layered defense ships in Wave 3.
- ❌ **Ship without `JobPosting` JSON-LD on pay routes** → Pitfall 4 — state pay-transparency law applies; JSON-LD is the disclosure surface.
- ❌ **Use `framer-motion` package name** → renamed to `motion@12`. Same maintainer, identical API. Use `motion`.
- ❌ **Use `googleapis` SDK in the Worker** → too heavy for `nodejs_compat`; use `jose` + raw `fetch` (Cloudflare's own pattern).
- ❌ **Run Lighthouse / axe CI gates in this phase** → CONTEXT D-40 — gates land in Phase 3 when content is stable.

## RESEARCH COMPLETE

42 requirements addressed across 10 sections. Wave-by-wave file inventory ready for the planner. Validation strategy mapped per ROADMAP success criterion. All key Phase-1-specific implementation details verified against `research/STACK.md` HIGH-confidence picks.
