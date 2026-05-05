---
phase: 01-foundation-form-pay-engine
plan: 00
type: execute
wave: 0
depends_on: []
autonomous: false
files_modified:
  - .gitignore
  - README.md
  - package.json
  - pnpm-lock.yaml
  - astro.config.mjs
  - tsconfig.json
  - wrangler.toml
  - .env.example
  - vitest.config.ts
  - tests/setup.ts
  - src/env.d.ts
  - src/styles/global.css
  - src/assets/fonts/nevis-bold.woff2
  - src/assets/fonts/avenir-roman.woff2
  - src/assets/fonts/avenir-medium.woff2
  - public/logo-primary.svg
  - public/logo-inverse.svg
  - public/favicon.svg
  - .github/workflows/ci.yml
  - src/content/_salvage-from-old-site.md
requirements:
  - SITE-01
  - SITE-04
  - SITE-06
  - BRAND-01
  - BRAND-02
  - BRAND-03
  - BRAND-04
  - BRAND-05
  - HOST-01
  - HOST-02
  - HOST-04
  - SEC-06
user_setup:
  - service: cloudflare-pages
    why: "Production hosting + Pages Functions for the form handler + KV bindings + Cron Trigger"
    env_vars:
      - name: RESEND_API_KEY
        source: "Resend Dashboard -> API Keys (paste into Cloudflare Pages Settings -> Environment variables -> Production AND Preview)"
      - name: RESEND_FROM
        source: "e.g. apply@a2clogisticsco.com (must be on a verified Resend domain)"
      - name: RECRUITER_EMAIL
        source: "Recruiting team — single inbox that receives lead emails"
      - name: GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON
        source: "Google Cloud Console -> IAM -> Service Accounts -> Keys -> JSON. base64-encode the entire JSON before pasting (`base64 -i sa.json | pbcopy`)"
      - name: GOOGLE_SHEETS_SHEET_ID
        source: "Google Sheets URL — the long ID between /d/ and /edit"
      - name: TURNSTILE_SECRET_KEY
        source: "Cloudflare Dashboard -> Turnstile -> Sites -> [a2clogistics.com] -> Settings -> Secret key"
      - name: PUBLIC_TURNSTILE_SITE_KEY
        source: "Cloudflare Dashboard -> Turnstile -> Sites -> [a2clogistics.com] -> Settings -> Site key (this one is public)"
      - name: ALERT_WEBHOOK_URL
        source: "Optional Discord/Slack webhook URL — recruiting team's monitored channel. If absent, alerts route only via email."
      - name: SYNTHETIC_SECRET
        source: "Generate locally: `openssl rand -hex 32`. Used by Cron Trigger to authenticate against /_internal/synthetic-submit"
    dashboard_config:
      - task: "Create the a2c-logistics Cloudflare Pages project (connect to GitHub repo)"
        location: "Cloudflare Dashboard -> Workers & Pages -> Create application -> Pages -> Connect to Git"
      - task: "Create three KV namespaces (IDEMPOTENCY, RATELIMIT, LEAD_FALLBACK) and copy each ID into wrangler.toml"
        location: "Cloudflare Dashboard -> Storage & Databases -> KV -> Create namespace (run thrice). Or: `wrangler kv:namespace create IDEMPOTENCY`, etc."
      - task: "Add Turnstile site for a2clogistics.com (and *.pages.dev for preview)"
        location: "Cloudflare Dashboard -> Turnstile -> Add site -> Invisible widget mode"
      - task: "Add Resend domain SPF/DKIM/DMARC DNS records for a2clogisticsco.com (or chosen sending subdomain). Verify domain in Resend dashboard."
        location: "Cloudflare DNS for a2clogisticsco.com (TXT records). Resend Dashboard -> Domains -> Add Domain prints the exact records."
      - task: "Source Nevis Bold web license (or confirm Anton substitute) before fonts are dropped into src/assets/fonts/"
        location: "Foundry website (typeface licensor) — purchase web license. Substitute path: `npm install @fontsource/anton` and swap font filenames."
      - task: "Create Google Sheet (single tab named 'Leads') and share with the service account email (Editor permission)"
        location: "sheets.google.com -> New Sheet -> Share -> [service-account-email] -> Editor"

must_haves:
  truths:
    - "A new Astro 6 + Cloudflare adapter + Tailwind v4 + MDX project boots locally via `pnpm dev` with zero errors"
    - "`pnpm build` produces a /dist that the @astrojs/cloudflare adapter can deploy to Cloudflare Pages"
    - "Brand tokens (#FFFFFF / #000000 / #EF392C / #D9D9D9) are reachable as Tailwind v4 utilities (bg-brand-red etc.) via @theme block"
    - "Nevis Bold + Avenir self-host paths are wired through astro:assets Fonts API with font-display: swap and metric overrides"
    - "wrangler.toml declares nodejs_compat flag and three KV namespaces (IDEMPOTENCY, RATELIMIT, LEAD_FALLBACK)"
    - "Vitest runs (no tests yet — empty pass) and CI workflow gates PRs on `astro check` + `pnpm build`"
  artifacts:
    - path: "package.json"
      provides: "Astro 6 + Tailwind v4 + Cloudflare adapter + MDX + React + Resend + jose + Conform + Turnstile + Vitest deps"
      contains: "astro@^6"
    - path: "astro.config.mjs"
      provides: "Cloudflare adapter with directory mode + nodejs_compat + Fonts API + Tailwind Vite plugin + MDX + React"
      contains: "@astrojs/cloudflare"
    - path: "wrangler.toml"
      provides: "nodejs_compat flag + 3 KV bindings + Cron Trigger (04:30 UTC daily)"
      contains: "nodejs_compat"
    - path: "src/styles/global.css"
      provides: "Tailwind v4 @theme block with brand color tokens, font family CSS vars, 8-point spacing scale"
      contains: "--color-brand-red: #EF392C"
    - path: ".env.example"
      provides: "Documented schema for all 8 required env vars (no secrets)"
      contains: "RESEND_API_KEY"
    - path: ".github/workflows/ci.yml"
      provides: "PR gate running pnpm install + astro check + pnpm build on Node 20"
      contains: "astro check"
  key_links:
    - from: "astro.config.mjs"
      to: "src/styles/global.css"
      via: "Tailwind Vite plugin pipeline"
      pattern: "tailwindcss\\(\\)"
    - from: "wrangler.toml"
      to: "Cloudflare Pages Functions runtime"
      via: "nodejs_compat compatibility flag"
      pattern: "nodejs_compat"
    - from: "src/env.d.ts"
      to: "Astro.locals.runtime.env"
      via: "Runtime type augmentation for KV bindings + secrets"
      pattern: "KVNamespace"
---

<objective>
Lay the entire build foundation: wholesale-replace the existing Vite/React repo with a fresh Astro 6 + Tailwind v4 + Cloudflare adapter + MDX + React project; wire brand tokens, self-hosted fonts, and Cloudflare Pages bindings (KV + Cron + nodejs_compat); install Vitest; ship a minimal CI workflow; and document the env-var contract.

Purpose: Every other wave depends on this. Without Astro initialized, brand tokens reachable, KV bindings declared, and `nodejs_compat` enabled, no later wave can compile or deploy. This is also the only wave with human-blocker tasks (KV creation, Resend DNS, font license, Google Sheet creation) because they require dashboard access Claude does not have.

Output: A buildable, deployable Astro project skeleton with all integrations wired, brand tokens reachable as Tailwind utilities, and the CI gate green on an empty `pnpm build`.
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

<interfaces>
<!-- Tailwind v4 @theme tokens that downstream waves consume as utilities -->
<!-- Source: RESEARCH.md §1.4; UI-SPEC §Color and §Typography -->

```css
/* src/styles/global.css */
@theme {
  --color-brand-white: #FFFFFF;
  --color-brand-black: #000000;
  --color-brand-red:   #EF392C;
  --color-brand-gray:  #D9D9D9;
  --font-display: "Nevis Bold", "Anton", system-ui, sans-serif;
  --font-body:    "Avenir", "Inter", system-ui, sans-serif;
  /* 8-point spacing scale (UI-SPEC §Spacing) */
  --spacing-1: 0.25rem; --spacing-2: 0.5rem; --spacing-4: 1rem;
  --spacing-6: 1.5rem;  --spacing-8: 2rem;   --spacing-12: 3rem; --spacing-16: 4rem;
}
```

```ts
/* src/env.d.ts — runtime bindings Wave 3 depends on */
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
  SYNTHETIC_SECRET: string;
}>;
declare namespace App { interface Locals extends Runtime {} }
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 0.1: Wholesale repo cleanup + Astro 6 init + integrations + Tailwind v4</name>
  <files>package.json, pnpm-lock.yaml, astro.config.mjs, tsconfig.json, .gitignore, README.md, src/styles/global.css, src/content/_salvage-from-old-site.md</files>
  <read_first>
    - .planning/phases/01-foundation-form-pay-engine/01-RESEARCH.md §§1.1–1.4 (bootstrap commands + astro.config.mjs blob + @theme block)
    - .planning/phases/01-foundation-form-pay-engine/01-CONTEXT.md D-01, D-02, D-04, D-05 (stack + folder layout + wholesale replacement decision)
    - .planning/phases/01-foundation-form-pay-engine/01-UI-SPEC.md §"Design System" + §"Spacing Scale" + §"Color" + §"Typography" (token values to embed in @theme)
    - /Users/alexandercostea/Desktop/a2c-logistics-website/CLAUDE.md (project guidelines — workflow enforcement)
  </read_first>
  <action>
    1. **Capture salvage strings BEFORE deleting** — read existing src/pages/About.jsx and src/pages/DriveWithUs.jsx, and write `src/content/_salvage-from-old-site.md` containing:
       - The "Built by drivers, for drivers" thread (for Phase 2 about page)
       - The three values (Accountability / Responsiveness / Driver-First Culture) — strip the shipper-facing "treats your freight like their own" line per CONTEXT code_context (Pitfall 19)
       - The DriveWithUs.jsx field-list structure (CDL class, years experience) as inspiration notes — DO NOT copy the form code
       Mark this file with header `<!-- Phase 2 reference only — do not import -->` so it is unmistakable.

    2. **Delete the old Vite/React tree** (preserve `.git/`, `.planning/`, the new `src/content/_salvage-from-old-site.md` you just wrote, and `CLAUDE.md`):
       ```bash
       rm -rf node_modules dist src/components src/pages src/lib src/assets src/styles src/App.jsx src/main.jsx src/index.css public
       rm -f package.json package-lock.json vite.config.js eslint.config.js components.json jsconfig.json index.html
       ```
       (Keep src/content/_salvage-from-old-site.md by re-creating src/content/ first if needed, or move it temporarily to /tmp during the rm and back after.)

    3. **Init Astro 6** at the repo root using pnpm:
       ```bash
       pnpm create astro@latest . --template minimal --typescript strict --git --install --skip-houston --no
       ```
       Use `--no` so Astro does not overwrite the existing .git directory. If the CLI insists on an empty dir, scaffold to /tmp/a2c-init/ then move files in.

    4. **Add integrations** (this writes them into astro.config.mjs):
       ```bash
       pnpm dlx astro add react cloudflare mdx --yes
       ```
       Verify `@astrojs/cloudflare@^13.3`, `@astrojs/react@^4`, `@astrojs/mdx@^4.4`.

    5. **Install Tailwind v4 via the Vite plugin** (NOT the PostCSS plugin):
       ```bash
       pnpm add tailwindcss@^4.2 @tailwindcss/vite@^4.2
       ```
       Then **rewrite astro.config.mjs verbatim from RESEARCH.md §1.2** including: `output: "static"`, the `cloudflare()` adapter call with `mode: "directory"`, `runtime.platformProxy.enabled: true`, `imageService: "compile"`, the `integrations: [react(), mdx()]` array, and `vite: { plugins: [tailwindcss()] }`. Do NOT add a `tailwind.config.js` — Tailwind v4 uses CSS-first config.

    6. **Create src/styles/global.css** EXACTLY as in RESEARCH.md §1.4 — `@import "tailwindcss";` followed by the `@theme { }` block with all four `--color-brand-*` vars (per BRAND-01 / D-31), both `--font-*` vars (per BRAND-02 / D-32), and the seven `--spacing-*` tokens from UI-SPEC §Spacing. Hex values are non-negotiable: `#FFFFFF`, `#000000`, `#EF392C`, `#D9D9D9`. No additional tokens.

    7. **Replace README.md** with a 5-line skeleton: project name, "Astro 6 on Cloudflare Pages — driver recruiting", `pnpm dev`/`pnpm build`/`pnpm test` commands, link to `.planning/`. No more.

    8. **Augment .gitignore**: ensure these lines are present (Astro init handles most): `dist/`, `.astro/`, `node_modules/`, `.env`, `.env.local`, `.dev.vars`, `.wrangler/`. Do NOT ignore `.env.example` or `wrangler.toml`.
  </action>
  <verify>
    <automated>pnpm install --frozen-lockfile && pnpm build && grep -q "astro@" package.json && grep -q '"@astrojs/cloudflare"' package.json && grep -q '"tailwindcss"' package.json && grep -q '"@astrojs/mdx"' package.json && grep -q "@theme" src/styles/global.css && grep -q "#EF392C" src/styles/global.css && grep -q "Nevis Bold" src/styles/global.css && grep -q '"output": "static"' astro.config.mjs 2>/dev/null || grep -q "output: \"static\"" astro.config.mjs && test -f src/content/_salvage-from-old-site.md && ! test -f vite.config.js && ! test -d node_modules/react-router-dom</automated>
  </verify>
  <acceptance_criteria>
    - `package.json` contains `astro@^6`, `@astrojs/cloudflare@^13.3`, `@astrojs/react@^4`, `@astrojs/mdx@^4.4`, `tailwindcss@^4.2`, `@tailwindcss/vite@^4.2` (verified via `grep`)
    - `astro.config.mjs` declares `output: "static"`, the cloudflare adapter call with `mode: "directory"`, `imageService: "compile"`, `platformProxy.enabled: true`, and `vite.plugins` containing `tailwindcss()`
    - `src/styles/global.css` contains `@import "tailwindcss";` followed by an `@theme { ... }` block with literal hex values `#FFFFFF`, `#000000`, `#EF392C`, `#D9D9D9` and CSS variables `--color-brand-white`, `--color-brand-black`, `--color-brand-red`, `--color-brand-gray`, `--font-display`, `--font-body`, and seven `--spacing-{1,2,4,6,8,12,16}` tokens
    - `pnpm build` exits 0 producing `dist/` directory with at least an index page (Astro minimal template ships one)
    - `src/content/_salvage-from-old-site.md` exists with header `<!-- Phase 2 reference only — do not import -->` and at least the "Built by drivers, for drivers" string
    - `vite.config.js`, `eslint.config.js`, `components.json`, `jsconfig.json`, `index.html`, and the old `src/App.jsx`/`src/main.jsx` no longer exist
    - `node_modules/react-router-dom` is absent (proves wholesale replacement, not merge)
    - `.gitignore` contains `dist/`, `.astro/`, `.env`, `.dev.vars`, `.wrangler/`
  </acceptance_criteria>
  <done>Buildable Astro 6 project at repo root with brand tokens reachable as Tailwind v4 utilities and zero residue from the old Vite/React app.</done>
</task>

<task type="auto">
  <name>Task 0.2: Wrangler config + KV bindings + env scaffold + Vitest + CI workflow + brand-asset placeholders + Fonts API wiring</name>
  <files>wrangler.toml, .env.example, src/env.d.ts, vitest.config.ts, tests/setup.ts, package.json, .github/workflows/ci.yml, public/logo-primary.svg, public/logo-inverse.svg, public/favicon.svg, src/assets/fonts/.gitkeep, astro.config.mjs</files>
  <read_first>
    - .planning/phases/01-foundation-form-pay-engine/01-RESEARCH.md §§1.5–1.6 (Fonts API config + wrangler.toml + env-var list + src/env.d.ts blob)
    - .planning/phases/01-foundation-form-pay-engine/01-RESEARCH.md §7 (CI workflow YAML verbatim)
    - .planning/phases/01-foundation-form-pay-engine/01-VALIDATION.md §"Wave 0 Requirements" (vitest install + config requirements)
    - .planning/phases/01-foundation-form-pay-engine/01-CONTEXT.md D-13, D-32, D-33, D-37, D-38, D-39, D-40 (hosting + env-scoping + font sourcing decisions)
    - .planning/phases/01-foundation-form-pay-engine/01-UI-SPEC.md §"Source Inventory" (logo variant filenames; brand snapshot PDF reference)
    - astro.config.mjs (current state — must merge in `experimental.fonts` block from RESEARCH.md §1.5)
  </read_first>
  <action>
    1. **Create wrangler.toml** at repo root, verbatim from RESEARCH.md §1.6:
       ```toml
       name = "a2c-logistics"
       compatibility_date = "2025-09-23"
       compatibility_flags = ["nodejs_compat"]
       pages_build_output_dir = "./dist"

       [[kv_namespaces]]
       binding = "IDEMPOTENCY"
       id = "PLACEHOLDER_REPLACE_AFTER_KV_CREATE"

       [[kv_namespaces]]
       binding = "RATELIMIT"
       id = "PLACEHOLDER_REPLACE_AFTER_KV_CREATE"

       [[kv_namespaces]]
       binding = "LEAD_FALLBACK"
       id = "PLACEHOLDER_REPLACE_AFTER_KV_CREATE"

       [triggers]
       crons = ["30 4 * * *"]
       ```
       The PLACEHOLDER literal must be present so the `verify` grep can confirm it (real IDs land via the user_setup dashboard task, see `user_setup` in this plan's frontmatter).

    2. **Create .env.example** verbatim from RESEARCH.md §1.6, with all 8 keys (`RESEND_API_KEY`, `RESEND_FROM`, `RECRUITER_EMAIL`, `GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON`, `GOOGLE_SHEETS_SHEET_ID`, `TURNSTILE_SECRET_KEY`, `PUBLIC_TURNSTILE_SITE_KEY`, `ALERT_WEBHOOK_URL`) PLUS `SYNTHETIC_SECRET=` (Wave 3 cron auth — see CONTEXT D-17 / RESEARCH §2.6). Include the literal placeholder values from RESEARCH so the file documents the schema.

    3. **Write src/env.d.ts verbatim from RESEARCH.md §1.6** (the full Runtime type with KVNamespace bindings + secrets + the `App.Locals extends Runtime` declaration). Add `SYNTHETIC_SECRET: string;` to the Runtime type list (RESEARCH §2.6 references this). Add `import.meta.env` interface containing `PUBLIC_TURNSTILE_SITE_KEY: string`.

    4. **Install Vitest devDependencies** per VALIDATION.md §Wave 0:
       ```bash
       pnpm add -D vitest@^2 @vitest/ui @vitest/coverage-v8 jsdom
       ```

    5. **Create vitest.config.ts** at repo root:
       ```ts
       import { defineConfig } from "vitest/config";
       export default defineConfig({
         test: {
           environment: "node",
           setupFiles: ["./tests/setup.ts"],
           include: ["tests/**/*.{test,spec}.ts"],
         },
       });
       ```

    6. **Create tests/setup.ts** with a stub that exports `mockEnv()` returning a fake env object matching the Runtime type (Resend key, sheet ID, Turnstile keys, etc — all stub strings) and a `mockFetch()` helper that Wave 3 + Wave 5 tests will use to stub Turnstile/Sheets/Resend HTTP calls. This is scaffolding only — implementation lives in tests written later. File must export both helpers and exit cleanly when imported (no top-level side effects beyond defining functions).

    7. **Add scripts to package.json**: `"test": "vitest --run"`, `"test:unit": "vitest --run"`, `"test:watch": "vitest"`, `"typecheck": "astro check"`. Vitest scripts use `--run` (no watch mode in CI per VALIDATION.md sampling rules).

    8. **Create .github/workflows/ci.yml** verbatim from RESEARCH.md §7 (uses `pnpm/action-setup@v3` with version 9, `actions/setup-node@v4` with node 20, runs `pnpm install --frozen-lockfile`, `pnpm exec astro check`, `pnpm build`). Triggers: `pull_request` to main, `push` to main.

    9. **Create logo + favicon placeholders** in public/:
       - `public/logo-primary.svg` — placeholder SVG with brand-black `#000000` rect 240×48 + text `A2C` (replaced with real wordmark when extracted from brand book; CONTEXT canonical_refs lists the PDF location)
       - `public/logo-inverse.svg` — same but with `#FFFFFF` text on transparent fill
       - `public/favicon.svg` — 32×32 SVG with brand-red `#EF392C` square + white `A2C` text (per UI-SPEC §Color)
       Each SVG must include `<svg xmlns="http://www.w3.org/2000/svg" viewBox=...>` and the brand-red OR brand-black/white hex literals so the verify grep can confirm.

    10. **Create src/assets/fonts/.gitkeep** so the directory exists; real .woff2 files are dropped in by the user as a `user_setup` task (Nevis Bold web license sourcing — see frontmatter). Add a sibling `src/assets/fonts/README.md` documenting the three required filenames (`nevis-bold.woff2`, `avenir-roman.woff2`, `avenir-medium.woff2`) and the substitute path (`@fontsource/anton` if Nevis license unaffordable per D-33).

    11. **Wire the Fonts API in astro.config.mjs** — add the `experimental.fonts` block from RESEARCH.md §1.5 with two providers (Nevis Bold local at `./src/assets/fonts/nevis-bold.woff2`, Avenir local at the two avenir files), each with `display: "swap"` and the documented fallbacks (`["Anton", "system-ui", "sans-serif"]` for Nevis; `["Inter", "system-ui", "sans-serif"]` for Avenir). cssVariable values: `--font-display` and `--font-body` (must match the @theme block from Task 0.1).

    12. **Append `import { fontProviders } from "astro/config";`** to the existing astro.config.mjs imports if not already present.
  </action>
  <verify>
    <automated>pnpm install --frozen-lockfile && grep -q "nodejs_compat" wrangler.toml && grep -q "IDEMPOTENCY" wrangler.toml && grep -q "RATELIMIT" wrangler.toml && grep -q "LEAD_FALLBACK" wrangler.toml && grep -q '"30 4 \* \* \*"' wrangler.toml && grep -q "RESEND_API_KEY" .env.example && grep -q "PUBLIC_TURNSTILE_SITE_KEY" .env.example && grep -q "SYNTHETIC_SECRET" .env.example && grep -q "KVNamespace" src/env.d.ts && grep -q "SYNTHETIC_SECRET" src/env.d.ts && test -f vitest.config.ts && test -f tests/setup.ts && grep -q '"test":' package.json && grep -q "astro check" .github/workflows/ci.yml && test -f public/logo-primary.svg && test -f public/logo-inverse.svg && test -f public/favicon.svg && grep -q "#EF392C" public/favicon.svg && test -d src/assets/fonts && grep -q "experimental" astro.config.mjs && grep -q "fonts" astro.config.mjs && pnpm exec astro check && pnpm test --run</automated>
  </verify>
  <acceptance_criteria>
    - `wrangler.toml` declares `compatibility_flags = ["nodejs_compat"]`, three KV namespace bindings (`IDEMPOTENCY`, `RATELIMIT`, `LEAD_FALLBACK`) each with `id = "PLACEHOLDER_REPLACE_AFTER_KV_CREATE"`, and a `[triggers] crons = ["30 4 * * *"]` block
    - `.env.example` contains all 9 keys: RESEND_API_KEY, RESEND_FROM, RECRUITER_EMAIL, GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON, GOOGLE_SHEETS_SHEET_ID, TURNSTILE_SECRET_KEY, PUBLIC_TURNSTILE_SITE_KEY, ALERT_WEBHOOK_URL, SYNTHETIC_SECRET
    - `src/env.d.ts` declares the Runtime type with all 3 KVNamespace bindings + 8 string secrets (the 8 from .env.example minus the public site key, plus SYNTHETIC_SECRET) and `App.Locals extends Runtime`
    - `pnpm exec astro check` exits 0
    - `pnpm test --run` exits 0 (no tests yet, empty pass is acceptable per VALIDATION.md)
    - `package.json` `scripts` contains `test`, `test:unit`, `test:watch`, `typecheck`
    - `.github/workflows/ci.yml` runs `pnpm install --frozen-lockfile && pnpm exec astro check && pnpm build` on Node 20 with pnpm 9
    - `public/logo-primary.svg`, `public/logo-inverse.svg`, `public/favicon.svg` all exist; favicon.svg contains literal `#EF392C`
    - `src/assets/fonts/` directory exists with `.gitkeep` AND a `README.md` documenting the three required filenames (real .woff2 files arrive via user_setup)
    - `astro.config.mjs` contains `experimental: { fonts: [...] }` (or top-level `fonts` if Astro 6 graduated it from experimental — adapt per current docs) with two providers wiring `--font-display` and `--font-body` to the local files
  </acceptance_criteria>
  <done>Cloudflare Pages bindings declared, env-var contract documented, Vitest scaffold green, CI workflow gates PRs on typecheck + build, Fonts API wired (awaiting user-supplied .woff2 files), brand-asset placeholders in public/.</done>
</task>

<task type="checkpoint:human-action" gate="blocking">
  <name>Task 0.3: Human-required Cloudflare/Resend/Sheets/Font setup (no CLI/API substitute exists)</name>
  <what-built>
    Tasks 0.1 and 0.2 produced a buildable Astro project, wrangler.toml with PLACEHOLDER KV IDs, .env.example documenting the env-var schema, fonts directory expecting three .woff2 files, and a Cloudflare Pages project name (`a2c-logistics`) declared in wrangler.toml.
  </what-built>
  <how-to-verify>
    These items require human action against external dashboards Claude cannot access. Complete them in this order, then approve to unblock Wave 1:

    1. **Create the Cloudflare Pages project** (Cloudflare Dashboard -> Workers & Pages -> Create application -> Pages -> Connect to Git -> select this repo -> framework preset: Astro -> build command `pnpm build` -> build output `dist`). Confirm project name = `a2c-logistics` (matches wrangler.toml).

    2. **Create three KV namespaces** (Cloudflare Dashboard -> Storage & Databases -> KV -> Create namespace, three times: `IDEMPOTENCY`, `RATELIMIT`, `LEAD_FALLBACK`). Or via CLI: `wrangler kv:namespace create IDEMPOTENCY` etc. **Paste each returned ID into wrangler.toml** replacing `PLACEHOLDER_REPLACE_AFTER_KV_CREATE` for each binding. Commit the updated wrangler.toml.

    3. **Bind the 3 KV namespaces to the Pages project** (Pages project -> Settings -> Functions -> KV namespace bindings: bind `IDEMPOTENCY` -> [the IDEMPOTENCY namespace], same for RATELIMIT and LEAD_FALLBACK). Do this for BOTH Production AND Preview environments.

    4. **Set all 9 environment variables** in the Pages project (Settings -> Environment variables -> add each for Production AND Preview). Source dashboards listed in this plan's `user_setup.env_vars` frontmatter. For `GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON`, base64-encode the full JSON file before pasting (`base64 -i sa.json` on macOS).

    5. **Create the Turnstile site** (Cloudflare Dashboard -> Turnstile -> Add site: domain `a2clogistics.com` AND `*.pages.dev` for preview, widget mode = invisible). Copy site key + secret key into the Pages env vars.

    6. **Create the Google Sheet** (sheets.google.com -> New Sheet -> rename to "A2C Leads", first tab = "Leads"). Add a header row matching the row schema in RESEARCH.md §2.3 sheetSink: `timestamp, idempotencyKey, firstName, lastName, phone, email, cdlClass, yearsExperience, role, state, consentVersion, formVersion`. Share the sheet with the service-account email (Editor permission). Copy the sheet ID into the Pages env vars.

    7. **Add Resend domain SPF/DKIM/DMARC DNS records** (Resend Dashboard -> Domains -> Add Domain `a2clogisticsco.com` -> copy the three TXT records into Cloudflare DNS for that domain). Wait for "Verified" status in Resend dashboard.

    8. **Source Nevis Bold web license** OR confirm fallback: either purchase the foundry web license and drop `nevis-bold.woff2` into `src/assets/fonts/`, OR install the substitute `pnpm add @fontsource/anton` and replace the Nevis path in astro.config.mjs Fonts API block with the Anton path. Per CONTEXT D-33, brand-book footnote the substitution if used. Also drop `avenir-roman.woff2` + `avenir-medium.woff2` (or use `pnpm add @fontsource-variable/inter` and update fonts config + global.css `--font-body` fallback). DO NOT proceed without one of these completed — fonts must load for any visual verification.

    9. **Generate SYNTHETIC_SECRET** locally: `openssl rand -hex 32`. Paste into Pages env vars (Production AND Preview).

    10. **Verify the chain works**: push the wrangler.toml change (with real KV IDs) to the connected GitHub branch — Cloudflare Pages should auto-deploy a preview. Confirm the preview URL loads the Astro starter index page with no console errors.

    Once all 10 are done, type `approved — Wave 0 complete` to release Wave 1.
  </how-to-verify>
  <resume-signal>Type "approved — Wave 0 complete" once all 10 dashboard tasks are done and the preview deploy succeeds. List any items you skipped (e.g., "ALERT_WEBHOOK_URL skipped — using email-only alerts") so downstream waves can adapt.</resume-signal>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Local repo → external SaaS dashboards | Secrets (Resend key, Sheets service-account JSON, Turnstile secret) flow OUT to Cloudflare Pages env vars; never committed |
| GitHub repo → Cloudflare Pages build | Build pipeline pulls source, runs `pnpm build` with PR-scoped env (no production secrets at PR time per Cloudflare default) |
| Cron Trigger → /_internal/synthetic-submit endpoint | Auth via shared SYNTHETIC_SECRET header (see Wave 3 plan) |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-1-W0-01 | Information Disclosure | .env or service-account JSON committed to repo | mitigate | .gitignore covers .env, .env.local, .dev.vars, .wrangler/. .env.example documents schema with placeholder values only. Pre-commit hook is out of scope (Phase 3); developer discipline plus .gitignore is the layered defense. |
| T-1-W0-02 | Spoofing | Cron Trigger spoofed by external POST to /_internal/synthetic-submit | mitigate | SYNTHETIC_SECRET header check (Wave 3 implements; Wave 0 declares the env var). Endpoint returns 401 without matching header. |
| T-1-W0-03 | Tampering | Brand assets (logo SVGs) replaced with malicious SVG containing inline JS | accept | Logo SVGs are static assets in /public, no script tags allowed; favicon SVG hand-authored without xlink. Any future SVG injection vector lands in a downstream phase audit. Risk: extremely low for hand-authored static assets in a private repo. |
| T-1-W0-04 | Denial of Service | KV bindings absent → form handler throws on first submission post-deploy | mitigate | Task 0.3 step 3 mandates binding the 3 KV namespaces in BOTH Production AND Preview before Wave 1 starts. The "approved — Wave 0 complete" gate requires the preview deploy succeeds. |
| T-1-W0-05 | Information Disclosure | Resend domain unconfigured → emails sent from unverified domain land in spam, recruiter never sees them (silent failure surface) | mitigate | Task 0.3 step 7 requires SPF/DKIM/DMARC TXT records added and Resend dashboard shows "Verified" before approval. Wave 5 manual smoke test then verifies real-iPhone submission lands in recruiter inbox within 60s. |
| T-1-W0-06 | Elevation of Privilege | Service-account JSON has Sheets edit permission for ALL sheets in the project, not just the Leads sheet | accept | Per CONTEXT D-14: scope the service account to ONLY the Leads sheet via the sheet's share dialog (Editor on that sheet only). Service account is a project-level identity but Sheets API enforces per-sheet ACL. Risk reduced to "the sheet itself"; acceptable for marketing-site lead capture. |
</threat_model>

<verification>
Phase-1-Wave-0 acceptance: Tasks 0.1 + 0.2 + 0.3 all green.
- Repo: `pnpm install && pnpm exec astro check && pnpm build && pnpm test --run` — all exit 0
- Dashboard: Pages project deployed (preview URL loads), 3 KV namespaces bound to Production AND Preview, all 9 env vars set in both, Resend domain verified, fonts present (Nevis or substitute)
- Verify the wrangler.toml committed has real KV IDs (no `PLACEHOLDER_REPLACE_AFTER_KV_CREATE` literals remain): `! grep -q "PLACEHOLDER_REPLACE_AFTER_KV_CREATE" wrangler.toml`
</verification>

<success_criteria>
Wave 1 can begin (shadcn primitives, layout shell, schemas, content collections all import from a working Astro 6 + Tailwind v4 + Cloudflare-bound project). Brand tokens reachable as utilities. Fonts loading (real or substitute). KV bindings accessible at `Astro.locals.runtime.env.IDEMPOTENCY` etc. inside any Action.
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation-form-pay-engine/01-00-foundation-SUMMARY.md` capturing: actual `astro@` version installed, KV namespace IDs (last 4 chars only — full IDs in wrangler.toml), font sourcing decision (Nevis purchased / Anton substitute / other), Pages project URL, any user_setup items deferred or skipped, and any new decisions surfaced during the human checkpoint.
</output>
