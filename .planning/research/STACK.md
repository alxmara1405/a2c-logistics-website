# Stack Research

**Domain:** SEO-driven, mobile-first driver-recruiting marketing site (single quick-apply form, MDX-driven content)
**Researched:** 2026-05-04
**Confidence:** HIGH on framework / styling / form / fonts / animation. MEDIUM on host (Netlify vs. Cloudflare Pages — both viable, tradeoffs are real and not unidirectional).

---

## TL;DR — Recommended Stack

| Layer | Pick | Confidence | Why for *this* project |
|---|---|---|---|
| Framework | **Astro 6 (`astro@6.2.2`)** | HIGH | SEO-first, ships ~0 JS by default, native MDX content collections with Zod schemas, native `Image` + font optimization, Cloudflare/Netlify adapters are first-party. The two interactive needs (form, OO/Company toggle) are textbook Astro Islands. |
| Styling | **Tailwind CSS v4 (`tailwindcss@4.2.4`) via `@tailwindcss/vite`** | HIGH | Already the user's choice, v4 stable, Astro/Vite plugin is the canonical install. CSS-first config = no `tailwind.config.js`. |
| Component primitives | **shadcn/ui CLI v4 (`shadcn@4.6.0`) — Astro template** | HIGH | The shadcn CLI v4 (March 2026) added a first-class Astro template. Same components/registry the user already knows from React. |
| Content | **Astro Content Collections + `@astrojs/mdx@4.4.3`** with **Zod schemas** | HIGH | Frontmatter-typed pay numbers, testimonials, brand data. No second toolchain (Velite/Fumadocs unnecessary). |
| Form library | **Conform (`@conform-to/zod` + `@conform-to/react`)** | HIGH | Progressive enhancement (works without JS), Zod-shared schema between Astro Action handler and the React island. Same Zod schema validates client + server. |
| Form transport | **Astro Actions** (server endpoint at `/_actions`) | HIGH | Type-safe, runs on the host's serverless runtime, Astro's native pattern in v5+. |
| Form sinks | **Resend (`resend@6.12.2`) for email + Google Sheets API or Airtable REST** behind a small adapter | HIGH | Resend is the modern default for transactional email; the adapter satisfies REQ-FUNNEL-02 + the "swappable so an ATS can replace it" constraint. |
| Spam protection | **Cloudflare Turnstile (`@marsidev/react-turnstile@1.5.1`) + honeypot field** | HIGH | Free, privacy-friendly, no user-visible CAPTCHA, works on either host. |
| Hosting | **Cloudflare Pages** (primary recommendation) — Netlify is a defensible second choice | MEDIUM | See "Host Decision" section below. Cloudflare wins on free-tier function invocations and global edge; Netlify wins on DX polish and built-in form/email plumbing. |
| Fonts | **`next/font/local`-equivalent in Astro: `astro:assets` Fonts API + self-hosted licensed Nevis Bold + Fontsource for Avenir-alike** | HIGH | Foundry-license fonts must be self-hosted (no CDN). Astro's Fonts API (stable in 6.x) handles `font-display: swap`, preload, subsetting. |
| Icons | **`lucide-astro`** (or keep `lucide-react` for the React islands) | HIGH | Same icon set the user already has; `lucide-astro` has zero JS cost in static spots. |
| Animation | **Motion (`motion@12.38.0`)** — successor to framer-motion, plus **CSS View Transitions API** for page transitions via Astro's built-in `<ClientRouter />` | HIGH | `framer-motion` was renamed to `motion` (same maintainer, same API). For a marketing site, View Transitions handle 80% of "page transitions" without JS; reserve Motion for hero reveals and the OO/Company toggle. |
| Analytics | **Plausible** (hosted) or self-hosted Umami | HIGH | Cookie-free, no consent banner needed in most US contexts, lightweight (<1 KB). |
| Validation | **Zod (`zod@4.4.3`)** | HIGH | Powers content collection schemas, Conform, and the Astro Action input schema — one library, three jobs. |

---

## 1. Framework — Astro vs. Next.js for *this* project

### Recommendation: **Astro 6**, not Next.js

This was the close call worth investigating, since the user's working assumption was Next.js. Here's the honest case:

**Why Astro wins for an SEO + mobile-speed + MDX + one-form site:**

1. **Zero JS by default.** Astro ships *no* JavaScript to the client unless you explicitly add an island. A Next.js App Router page sends the React runtime + hydration payload even for static content. For a 6-8 page marketing site browsed on truck-stop wifi, that's the single biggest mobile-LCP win available.
2. **Native MDX as the primary citizen.** Astro's content collections (`astro:content`) are designed for exactly this use case: typed frontmatter via Zod, glob-loaded MDX, `render()` returns a component. Next.js MDX requires gluing together `@next/mdx` or `next-mdx-remote` plus your own type-safety layer.
3. **The two interactive needs are textbook islands.** Quick-apply form = `<ApplyForm client:visible />`. OO/Company toggle on the pay page = `<PayToggle client:load />`. Everything else is static HTML. This is the exact problem Astro was built for.
4. **First-party hosting story for both candidates.** `@astrojs/cloudflare@13.3.1` and Netlify's Astro support are both first-party adapters with no glue layer. Next.js on Cloudflare requires the OpenNext adapter (`@opennextjs/cloudflare@1.19.6`) — which works but is extra moving parts and has known feature-coverage gaps.
5. **Existing dep carryover is *better* with Astro than expected.** Lucide → `lucide-astro` (drop-in). Tailwind 4 → identical install path (`@tailwindcss/vite`). framer-motion → `motion@12` (same code, new package name) inside React islands. shadcn CLI v4 has an Astro template that pulls the same Radix-based components.

**Where Next.js would be the right call (not this project):**

- Per-driver dashboards, authenticated pages, ISR with on-demand revalidation
- A blog with 100+ posts where Next's RSC streaming pays off
- An app with a real database and many route handlers
- If the team is already deep in Next and switching cost > the perf delta

**Sveltekit / Remix-Vite (now React Router 7):** Both are excellent, but they don't have Astro's MDX content-collections story or its zero-JS posture. SvelteKit would force the user off the React/shadcn ecosystem they already know. React Router 7 (the rebranded Remix) ships meaningful client JS even for static pages. Neither is a better fit than Astro here.

**Real numbers (representative — verify on your own build):**
- A typical 6-page Astro marketing site with one React island: **~5–25 KB JS** total (the island only).
- Equivalent Next.js App Router site: **~85–110 KB JS** (React runtime baseline) + island code.
- Lighthouse mobile performance gap is consistently in the 8–15 point range on 4G throttling, driven almost entirely by main-thread parse/eval time.

**Confidence:** HIGH. What would change the call: if the Pay page evolves into a complex calculator with lots of state, or if A2C decides to add a driver portal/dashboard on the same domain, Next.js becomes more attractive.

---

## 2. Host Decision — Cloudflare Pages vs. Netlify

Both work. Here's the honest tradeoff for *this* project (Astro + one form + email/sheet sink + Plausible):

| Dimension | Cloudflare Pages | Netlify |
|---|---|---|
| Astro adapter | `@astrojs/cloudflare@13.3.1` — first-party | `@astrojs/netlify` — first-party |
| Free tier — builds | 500 builds/month, 20-min timeout, 1 concurrent | 300 build minutes/month, 1 concurrent |
| Free tier — function invocations | **100,000/day** combined Workers + Pages Functions (resets midnight UTC) | 125,000/month total |
| Edge runtime location | True global edge (Workers run at CDN PoPs) | "Edge functions" exist but most invocations land in a single region |
| Preview deployments | Yes, every PR/branch | Yes, every PR/branch |
| Image optimization | `astro:assets` with `cloudflare-binding` runtime image service | Netlify Image CDN, `_redirects`-based |
| Built-in form handling | None — you write the function | **Netlify Forms** (`data-netlify="true"`) — free tier ~100 submissions/month, beyond that you pay |
| Built-in email integration | None — use Resend/Postmark | Email Integration extension exists |
| DNS handoff | Cloudflare DNS (fast, free) | Netlify DNS (free) — or external |
| Edge cold starts | Effectively zero (Workers) | Lambda-style cold starts (~100-300ms) on edge functions |
| DX polish | Improving fast but rougher edges | More polished, more obvious |
| Pricing past free tier | Cheap and linear | Steeper jumps |

### Pick: **Cloudflare Pages** (primary), Netlify as the safe alternative

**Reason:** For a recruiting site that lives or dies on mobile LCP, "Workers run at the CDN PoP nearest the driver" is a real win — a driver in a Wyoming truck stop hits the form endpoint at the Denver PoP, not us-east-1. Combined with the higher daily free tier on functions and Cloudflare DNS handoff being trivial, it's the cleaner long-term answer.

**Caveat:** Netlify's `data-netlify="true"` form-handling feature is genuinely seductive for an MVP — submissions show up in a Netlify dashboard with zero backend code. But you still need a custom function for "also email recruiting" and "also write to Google Sheet/Airtable", so the savings shrink. And you'd be locked to Netlify for the form pipe.

**Confidence:** MEDIUM. What would flip me to Netlify: if the team wants the absolute minimum custom code (`data-netlify="true"` + Netlify's email integration is harder to beat), or if they're already using Netlify on other A2C ecosystem brand sites and want one dashboard.

---

## Recommended Stack — Detail

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|---|---|---|---|
| Astro | `6.2.2` | Static site generator + island runtime + content collections | Zero-JS by default, MDX-native, first-party Cloudflare/Netlify adapters, Server Islands for any future personalization. v6 (released early 2026) refined the Actions API and added typed `serverIslandMappings`. |
| `@astrojs/mdx` | `4.4.3` | MDX support inside Astro | Official integration; combines with `astro:content` for typed frontmatter. |
| `@astrojs/cloudflare` | `13.3.1` | Astro adapter for Cloudflare Pages | First-party, supports SSR + static hybrid, includes `cloudflare-binding` image service. |
| Tailwind CSS | `4.2.4` | Utility-first styling | Already chosen. v4 is stable; CSS-first config (`@theme` block in CSS); ~5x faster builds than v3. |
| `@tailwindcss/vite` | `4.2.4` | Tailwind Vite plugin | Canonical Tailwind v4 install. Astro uses Vite under the hood, so this is the standard path. |
| Zod | `4.4.3` | Schema validation | Powers content collection schemas, form validation (Conform), and Astro Actions input shape. Single library, three roles. |
| Conform | latest (`@conform-to/react`, `@conform-to/zod`) | Progressive-enhancement form library | Works without JS, shares Zod schema between client + server, designed for Astro Actions / Remix / Next App Router. |
| React | `19.x` | UI runtime for the two interactive islands (form, pay toggle) | Already known by the team; lets us reuse the existing `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `@base-ui/react` deps. |
| `@astrojs/react` | latest | Astro integration to mount React islands | Required to use React inside Astro. |
| Motion (formerly framer-motion) | `motion@12.38.0` | Animation library for hero reveals, micro-interactions | `framer-motion` was renamed to `motion` (same author, identical API in v12). Use `motion/react` or `motion/react-client` for SSR-friendly imports. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---|---|---|---|
| Resend | `6.12.2` | Transactional email API | The "email recruiting on submit" half of REQ-FUNNEL-02. Better deliverability than Gmail SMTP, $0 for first 3,000 emails/month. |
| `@marsidev/react-turnstile` | `1.5.1` | Cloudflare Turnstile React component | Spam protection on the apply form. Free, no CAPTCHA UX, works on Netlify too. Server-side verification in the Astro Action. |
| `googleapis` | latest | Official Google Sheets API client | The "write to Google Sheet" half of REQ-FUNNEL-02. Service-account auth; one row per submission. |
| `airtable` | latest | Airtable REST client | Alternative to Google Sheets if the user prefers; identical adapter shape. |
| `lucide-astro` | latest | Lucide icons as `.astro` components | Zero-JS icon rendering inside `.astro` files. Keep `lucide-react` for the React islands. |
| `@fontsource-variable/...` | varies | Self-hosted variable fonts via NPM | For Avenir alternative (e.g. `@fontsource-variable/inter` or `@fontsource/nunito-sans`) if a licensed Avenir copy isn't acquired. |
| Plausible Analytics | hosted | Cookie-free analytics | One `<script>` in the layout, no consent banner needed. ~1 KB. Custom events for form-step abandonment. |
| `astro-seo` | latest | SEO meta-tag helper | Standard Astro pattern for OG tags, Twitter cards, JSON-LD. |
| `schema-dts` | latest | TypeScript types for schema.org JSON-LD | For local-business + job-posting structured data — directly improves "owner operator jobs Nebraska" SERPs. |

### Development Tools

| Tool | Purpose | Notes |
|---|---|---|
| Vite | Astro's underlying dev server / bundler | Comes with Astro; no separate install. |
| TypeScript | Type safety end-to-end | Astro is TS-first; `strictest` preset recommended. |
| Prettier + `prettier-plugin-astro` | Code formatting | Required to format `.astro` files. |
| ESLint + `eslint-plugin-astro` + `eslint-plugin-jsx-a11y` | Linting + a11y checks | a11y plugin matters for REQ-SITE-05 (WCAG AA). |
| Lighthouse CI | Perf budgets in CI | Enforce LCP < 2.5s on mobile (REQ-SITE-04) on every PR. |
| `@axe-core/playwright` | Accessibility regression tests | Optional but cheap insurance for WCAG AA. |
| Wrangler | Cloudflare CLI for local Pages dev + deploy | Required for Cloudflare Pages local dev with Functions. |

---

## Installation

```bash
# 1. Scaffold a fresh Astro project (replace existing repo wholesale)
npm create astro@latest -- --template minimal --typescript strictest --no-git

# 2. Add integrations
npx astro add react mdx cloudflare
# (or: npx astro add react mdx netlify  — if going Netlify)

# 3. Tailwind v4 (CSS-first; no PostCSS config file needed)
npm install tailwindcss @tailwindcss/vite

# 4. shadcn/ui — Astro template (CLI v4, Mar 2026)
npx shadcn@latest init   # pick "Astro" from the template prompt
npx shadcn@latest add button input form label sheet

# 5. Form + validation + spam
npm install @conform-to/react @conform-to/zod zod
npm install @marsidev/react-turnstile

# 6. Email + sheet sink
npm install resend googleapis        # OR: npm install resend airtable

# 7. Animation + icons
npm install motion lucide-astro lucide-react

# 8. Analytics (hosted Plausible — just a script tag, no install)
#    OR self-host Umami separately.

# 9. SEO
npm install astro-seo schema-dts

# 10. Tooling
npm install -D prettier prettier-plugin-astro eslint eslint-plugin-astro eslint-plugin-jsx-a11y @lhci/cli
```

**Tailwind v4 setup (CSS-first, no `tailwind.config.js`):**

```css
/* src/styles/global.css */
@import "tailwindcss";

@theme {
  --color-a2c-red: #EF392C;
  --color-a2c-gray: #D9D9D9;
  --font-display: "Nevis", system-ui, sans-serif;
  --font-body: "Avenir", "Inter Variable", system-ui, sans-serif;
}
```

```js
// astro.config.mjs (excerpt)
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://a2clogistics.com",
  output: "static",                // hybrid for the Action endpoint
  adapter: cloudflare({
    imageService: { build: "compile", runtime: "cloudflare-binding" },
  }),
  integrations: [react(), mdx()],
  vite: { plugins: [tailwindcss()] },
});
```

---

## 3. MDX Pipeline — Decision

### Pick: **Native `astro:content` + `@astrojs/mdx` + Zod schemas**

For an Astro project, this is unambiguous. Velite, Fumadocs, and `next-mdx-remote` are all great tools — for projects that don't have what Astro ships out of the box.

**Pattern for pay numbers (REQ-PAY-02):**

```ts
// src/content.config.ts
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const payPlans = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/pay" }),
  schema: z.object({
    audience: z.enum(["owner-operator", "company-driver"]),
    cpmLow: z.number(),
    cpmHigh: z.number(),
    splitPct: z.number().optional(),
    fastPayHours: z.number().optional(),
    fuelDiscountCpg: z.number().optional(),
    signOnBonus: z.number().optional(),
    benefits: z.array(z.string()),
    lastUpdated: z.coerce.date(),
  }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/testimonials" }),
  schema: ({ image }) => z.object({
    driverName: z.string(),
    role: z.enum(["owner-operator", "company-driver"]),
    truck: z.string().optional(),
    yearsWithA2C: z.number(),
    photo: image().optional(),     // typed image with optimization built-in
    quote: z.string(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { payPlans, testimonials };
```

**Why not the alternatives:**
- **Velite** — designed to add Astro-style content collections to Next/Vite/etc. Astro already has them.
- **Fumadocs** — built for *documentation sites*. Overkill, and pulls Next.js along.
- **`next-mdx-remote`** — only relevant if you pick Next.js.
- **TinaCMS** — keep as an *optional later add-on* if non-technical edits become a need. TinaCMS now ships `tinacms@3.7.5` and supports both Astro and Next; it sits on top of your existing MDX/markdown so it's a non-breaking add later. Don't pull it in for v1 (REQ-OPS extra surface area).

**Image handling:** `astro:assets` `<Image />` does responsive `srcset`, AVIF/WebP conversion, lazy loading, and prevents CLS by inferring dimensions at build time. Pair with the Cloudflare image binding for runtime optimization on user-uploaded images later. Done.

---

## 4. Form Handling — Decision

### Pick: **Conform + Astro Actions + Resend + Sheets/Airtable adapter + Turnstile**

**Why Conform over react-hook-form for this project:**
- Conform is built for the *progressive enhancement* world Astro inhabits — the form posts and works even before the React island hydrates (truck-stop wifi).
- Single Zod schema validates client AND server (the Astro Action). RHF can do this with `@hookform/resolvers/zod`, but Conform makes server-side validation the primary citizen instead of an afterthought.
- The form isn't complex enough (≤6 fields) to need RHF's render-optimization machinery.

**Why an Astro Action and not a raw API route:** Actions are typed end-to-end (input Zod schema + return type), get free JSON/form-data parsing, and integrate with Conform's `useActionState`-style patterns. Less boilerplate.

**Spam protection layering:**
1. **Honeypot field** — hidden `<input name="company">`; if filled, drop the submission. Catches 80% of dumb bots, costs nothing.
2. **Cloudflare Turnstile** — invisible challenge on submit; verify the token server-side before processing. Works on Netlify too.
3. **Rate limit by IP** in the Action handler (Cloudflare KV or just an in-memory limiter for v1).

**Adapter pattern for REQ-FUNNEL-02 + the "ATS later" constraint:**

```ts
// src/lib/leadSink.ts
export interface LeadSink {
  send(lead: Lead): Promise<{ ok: boolean }>;
}

// MVP: send to both
export const sinks: LeadSink[] = [
  emailSink,           // Resend → recruiter mailbox
  googleSheetSink,     // append a row
];

// Later: swap in tenstreetSink — no UI changes.
```

---

## 5. Typography & Icons — Decision

### Pick: **Self-host licensed Nevis Bold via Astro Fonts API. Avenir likewise. Lucide for icons.**

**Licensed webfont workflow in 2026 (Nevis Bold):**

1. **Buy a web license from the foundry** (Nevis is sold by foundries like Type Fox / monotype-style outlets). The license MUST include "self-host" rights — many cheap "desktop only" licenses do NOT cover web embedding.
2. **Request `.woff2` files** as part of the order (foundries provide them on request). Don't accept TTF/OTF only — they're 3–5x larger.
3. **Subset the font** to Latin + the digits/punctuation you actually use (`pyftsubset` from `fonttools`, or pre-subset via the foundry if offered). A subsetted Nevis Bold should be 15–30 KB.
4. **Self-host in `/public/fonts/`** — never use a CDN you don't control for a licensed font (license violation risk + the CDN can disappear).
5. **Use Astro's `astro:assets` Fonts API** (stable in Astro 6) — handles `font-display: swap`, `<link rel="preload">`, and `unicode-range` automatically:

```ts
// astro.config.mjs
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  experimental: { fonts: [
    {
      provider: fontProviders.local(),
      name: "Nevis",
      cssVariable: "--font-display",
      variants: [{ weight: 700, style: "normal", src: ["./public/fonts/Nevis-Bold.woff2"] }],
    },
  ]},
});
```

Then reference `--font-display` in your Tailwind `@theme` block (above).

**Avenir:** If the user has a corporate Avenir license, follow the same pattern. If not, use a high-quality alternative — `@fontsource-variable/inter` or `@fontsource/nunito-sans` are the closest-feeling free substitutes. Document the substitution in PROJECT.md so design knows.

**Why NOT Adobe Fonts / Google Fonts CDN for Avenir:** Adobe Fonts requires a runtime script that adds a render blocker; Google Fonts doesn't have Avenir; both are slower than self-hosting in 2026.

**Icons:** `lucide-astro` for `.astro` files (zero JS), `lucide-react` for React islands. Single design system, two import paths.

---

## 6. Animation — Decision

### Pick: **Motion (`motion@12`) for component animations + Astro's `<ClientRouter />` (View Transitions API) for page transitions**

**The framer-motion → Motion situation:** Same maintainer (Matt Perry), same API. The package was renamed to `motion` and the React-specific entry is `motion/react`. `framer-motion@12.38.0` and `motion@12.38.0` are the same code; new development happens on `motion`. Migrate the import (`framer-motion` → `motion/react`) and you're done.

**Why also use the View Transitions API:** A marketing site's "page transitions" (slide between sections, crossfade hero) are now a native browser feature in 2026. Astro's built-in `<ClientRouter />` enables them with one tag. Free, no JS payload, no library. Use Motion for *element-level* animations (hero reveals, button micro-interactions, the OO/Company toggle swap), not page-level.

**GSAP:** Gold-standard, but overkill. Pull it in only if you build complex SVG choreography (e.g. an animated truck driving across a hero). The brand book mentions a "motion-line/truck wordmark" — if that becomes a SVG animation, GSAP earns its place. For now, skip.

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|---|---|---|
| Astro 6 | Next.js 16 (App Router) | If a driver portal/dashboard with auth lands on the same domain, or if the team is committed to React Server Components. |
| Astro 6 | SvelteKit | Only if the team prefers Svelte and is willing to abandon the React/shadcn ecosystem. |
| Astro 6 | Remix / React Router 7 | Skip for marketing sites — RR7 ships React on every page. |
| Cloudflare Pages | Netlify | If you want zero custom code for forms (`data-netlify="true"`) or are already on Netlify across A2C ecosystem brands. |
| Cloudflare Pages | Vercel | User explicitly excluded Vercel. (Otherwise it'd be a fine third option for Next.js, irrelevant for Astro.) |
| Conform | react-hook-form + `@hookform/resolvers/zod` | If the team knows RHF cold and the form grows past 6 fields with complex conditional logic. |
| Astro Content Collections | Velite | If you ever need cross-framework content (e.g. share MDX between Astro and a separate Next.js dashboard). |
| Astro Content Collections | TinaCMS | Add later if non-technical staff need to edit pay numbers without git. Tina layers on top of MDX, so it's non-breaking. |
| Resend | Postmark / SendGrid | Both are fine; Resend has the nicest DX and free tier for an MVP. |
| Cloudflare Turnstile | hCaptcha | Use only if you specifically need its bot-detection signals; Turnstile is friendlier UX. |
| Cloudflare Turnstile | Google reCAPTCHA v3 | Avoid — privacy issues and a Google cookie that triggers consent-banner requirements in some jurisdictions. |
| Plausible | Umami (self-hosted) / Fathom | Umami is free if self-hosted; Fathom is the closest paid competitor. Avoid GA4 if cookie-free is desired. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|---|---|---|
| Vercel | User explicitly excluded. | Cloudflare Pages or Netlify. |
| `@next/mdx` for content-heavy sites | No frontmatter typing without bolt-on tooling; ships React runtime cost. | Astro content collections. |
| `next-mdx-remote` | Adds parse-at-request overhead unless you build-cache it; a workaround for a problem Astro doesn't have. | Astro content collections. |
| `tailwindcss@3.x` | Out of date; v4 is stable, ~5x faster, CSS-first config. | `tailwindcss@4.2.x`. |
| `tailwind.config.js` (with v4) | v4 deprecates JS config in favor of CSS `@theme`. Adding a JS config in v4 works but is the legacy path. | CSS `@theme` block. |
| `framer-motion` (the package) | Renamed to `motion`; new development happens there. | `motion@12` (`import { motion } from "motion/react"`). |
| Google reCAPTCHA v2/v3 | Visible challenge / Google cookie / privacy issues. | Cloudflare Turnstile. |
| Google Fonts CDN for licensed fonts | License violation for foundry-licensed fonts; render-blocking script in some setups. | Self-host with Astro Fonts API. |
| Google Analytics 4 | Cookie banner required, heavy script, hostile DX. | Plausible / Umami / Fathom. |
| Sanity / Contentful / Storyblok | Out of scope per PROJECT.md (no headless CMS). | MDX in repo + optional TinaCMS later. |
| `react-router-dom@7` (in the new build) | Existing dep is for a Vite/React SPA. Astro doesn't need a router; pages are file-based. | File-based routing in `src/pages/`. |
| jQuery, anything Webpack-era | No reason in 2026. | — |
| Heavyweight UI kits (MUI, Chakra, Mantine) | Style conflicts with Tailwind v4, ship 100+ KB of CSS-in-JS. | shadcn/ui — copy components, own the code. |

---

## Stack Patterns by Variant

**If you stick with Next.js instead of Astro (e.g. a future driver portal forces it):**
- Use `next@16.2.x` App Router, `@vercel/mdx` or build-time MDX with `generateStaticParams`.
- Deploy via `@opennextjs/cloudflare@1.19.x` (Cloudflare) or the official Netlify Next plugin.
- Replace Conform with react-hook-form + zod resolver inside a Server Action.
- Replace Astro Content Collections with **Velite** (`velite@0.3.x`) for typed MDX.
- Lose ~15 Lighthouse mobile points vs. the Astro baseline. Accept it as the cost of the unified app.

**If you go Netlify instead of Cloudflare Pages:**
- Adapter: `@astrojs/netlify` (swap from `@astrojs/cloudflare`).
- Optional shortcut: skip Astro Action + Resend for the email half — use `data-netlify="true"` on the `<form>` and Netlify Forms catches submissions, then a Netlify Function fires the Sheet/Airtable write. Saves backend code; couples you to Netlify.
- Use Netlify's Image CDN instead of `cloudflare-binding` for `astro:assets`.

**If pay-toggle UX needs to feel app-like (URL-state, deep links, browser back/forward):**
- Use the URL search-param (`?role=oo` vs `?role=company`) so SEO crawlers index both states and drivers can share a link to the OO view.
- Server-render the right variant in the Astro page (`Astro.url.searchParams`), hydrate the toggle as a small client island.
- This avoids needing a SPA router; preserves the SSR + SEO posture.

---

## Version Compatibility

| Package A | Compatible With | Notes |
|---|---|---|
| `astro@6.2.x` | `@astrojs/mdx@4.4.x`, `@astrojs/react@4.x`, `@astrojs/cloudflare@13.3.x` | All first-party, version-locked by Astro releases. |
| `tailwindcss@4.x` | `@tailwindcss/vite@4.x` (NOT `@tailwindcss/postcss`) | Astro uses Vite; the Vite plugin is the canonical path. PostCSS plugin exists but is the wrong choice here. |
| `motion@12.x` | React 18 + 19 | `import { motion } from "motion/react"`. SSR-safe in App Router via `motion/react-client`. |
| `react@19.x` | `@types/react@19.x`, all current React libraries | Existing project already on React 19. |
| `zod@4.x` | `@conform-to/zod` (current), `@hookform/resolvers@5.x` if you switch to RHF | Zod 4 is a notable breaking change from 3.x — check resolver version. |
| `@marsidev/react-turnstile@1.5.x` | React 18 + 19 | Server-side verification: `POST https://challenges.cloudflare.com/turnstile/v0/siteverify`. |
| `lucide-react@1.x` (existing) and `lucide-astro@latest` | Same icon registry, different render path | OK to use both side-by-side. |
| `shadcn@4.6.x` (CLI) | Tailwind v4, Astro template, Next/Vite/RR/TanStack Start | The March 2026 CLI v4 release added Astro support. Use it. |

---

## Sources

- `/vercel/next.js` (Context7) — verified Next.js App Router status, current versions (`v16.0.3`, `v16.1.6`, `v16.2.2`), `next/font/local`, MDX patterns, route handlers in static export. **HIGH confidence.**
- `/withastro/docs` (Context7) — verified content collections API, `astro:content` + Zod schemas, Cloudflare adapter image binding, Server Islands (`server:defer`, added `astro@6.0.0`), Actions API consolidation in v6. **HIGH confidence.**
- `/websites/astro_build_en` (Context7) — verified Fonts API (`astro:assets` `fontData`), image service for Cloudflare. **HIGH confidence.**
- `/tailwindlabs/tailwindcss.com` (Context7) — verified Tailwind v4 install (`tailwindcss@latest @tailwindcss/vite@latest`), CSS-first config. **HIGH confidence.**
- `/shadcn-ui/ui` (Context7) — verified March 2026 CLI v4 release with Astro template (`changelog/2026-03-cli-v4.mdx`). **HIGH confidence.**
- `/websites/motion_dev` (Context7) — verified `framer-motion` → `motion` rename, Next.js App Router import patterns (`motion/react-client` for SSR), v12 has no breaking changes from framer-motion. **HIGH confidence.**
- `/react-hook-form/documentation` (Context7) — verified RHF + Zod resolver pattern (alternative to Conform). **HIGH confidence.**
- `/edmundhung/conform` (Context7) — verified Conform exists, supports Astro/Remix/Next. **HIGH confidence.**
- `/websites/developers_cloudflare_pages` (Context7) — verified Pages limits (free: 500 builds/mo, 20-min timeout, 100k requests/day shared with Workers), `@astrojs/cloudflare` adapter, `next-on-pages`, `@opennextjs/cloudflare`. **HIGH confidence.**
- `/websites/netlify` (Context7) — verified Netlify Forms (`data-netlify="true"`), Netlify Email Integration extension, free-tier limits. **HIGH confidence.**
- `/websites/developers_cloudflare_turnstile` (Context7) — verified Turnstile is the recommended CAPTCHA alternative, free, privacy-friendly. **HIGH confidence.**
- `/marsidev/react-turnstile` (Context7) — verified React component, SSR-ready, TS support. **HIGH confidence.**
- `/zce/velite` (Context7) — verified as alternative MDX → typed-data pipeline. **HIGH confidence.**
- `/fuma-nama/fumadocs` (Context7) — verified as docs-focused Next.js framework; not the right tool here. **HIGH confidence.**
- `/colinhacks/zod` (Context7) — verified `zod@4.x` published; powers form + content schemas. **HIGH confidence.**
- `/fontsource/fontsource` (Context7) — verified self-hosted font workflow via NPM packages. **HIGH confidence.**
- `/plausible/docs` (Context7) — verified Plausible is cookie-free, lightweight, GDPR-compliant. **HIGH confidence.**
- `/tinacms/tinacms` (Context7) — verified TinaCMS still active (`tinacms@2.9.0` / `3.7.5` on npm), Astro/Next supported, layers on existing MDX. **HIGH confidence.**
- `/websites/resend` (Context7) — verified Resend email API. **HIGH confidence.**
- npm registry (`npm view <pkg> version` on 2026-05-04) — verified currently published versions for: `next@16.2.4`, `astro@6.2.2`, `tailwindcss@4.2.4`, `motion@12.38.0`, `framer-motion@12.38.0`, `react-hook-form@7.75.0`, `@hookform/resolvers@5.2.2`, `zod@4.4.3`, `shadcn@4.6.0`, `@astrojs/cloudflare@13.3.1`, `@astrojs/mdx@4.4.3`, `@opennextjs/cloudflare@1.19.6`, `velite@0.3.1`, `fumadocs-mdx@14.3.2`, `@marsidev/react-turnstile@1.5.1`, `resend@6.12.2`, `lucide-react@1.14.0`, `tinacms@3.7.5`, `plausible-tracker@0.3.9`, `@netlify/plugin-nextjs@5.15.10`, `next-mdx-remote@6.0.0`. **HIGH confidence.**

---

## Confidence Levels — Per Recommendation

| Recommendation | Confidence | What would change the call |
|---|---|---|
| Astro over Next.js | **HIGH** | If a driver portal/dashboard with auth lands on this same domain, or the Pay page becomes an interactive calculator with deep state — flip to Next.js. |
| Tailwind v4 + Vite plugin | **HIGH** | None — already user-chosen and v4 is stable. |
| shadcn/ui (Astro template) | **HIGH** | None — same components the user already uses; CLI v4 has Astro support. |
| Astro Content Collections + MDX | **HIGH** | Only if cross-framework content sharing becomes a need (then Velite). |
| Conform over RHF | **MEDIUM-HIGH** | If the team knows RHF cold and form grows past 6 fields with complex conditional logic — switch to RHF. |
| Astro Actions for the form | **HIGH** | None — native pattern. |
| Cloudflare Pages over Netlify | **MEDIUM** | If the team values minimum custom code (Netlify Forms shortcut) or runs other A2C brands on Netlify — flip to Netlify. |
| Resend for email | **HIGH** | None for an MVP; swap to Postmark if deliverability issues surface (rare). |
| Cloudflare Turnstile | **HIGH** | None — best-in-class privacy + UX in 2026. |
| Self-hosted Nevis via Astro Fonts API | **HIGH** | Only changes if foundry doesn't sell a self-host web license — then need a substitute display font. |
| Motion (`motion@12`) over framer-motion-the-name | **HIGH** | None — same maintainer, same API, just the canonical name now. |
| View Transitions API (via Astro `<ClientRouter />`) for page transitions | **HIGH** | None — native browser API, free perf. |
| Plausible / Umami / Fathom for analytics | **HIGH** | Only if marketing requires GA4 attribution data. |

---

*Stack research for: SEO-driven, mobile-first driver-recruiting marketing site*
*Researched: 2026-05-04*
