---
phase: 4
slug: interim-seo-crawlability-structured-data-polish-current-site
plan: 05
type: execute
wave: 2
depends_on: [04-01]
files_modified:
  - package.json
  - src/index.css
  - src/components/sections/Hero.jsx
  - public/assets/images/hero-truck.jpg
autonomous: false
requirements: [INT-PERF-01, INT-A11Y-01]
user_setup: []

must_haves:
  truths:
    - "The render-blocking Google Fonts @import is gone; Inter is self-hosted"
    - "The Nevis Bold @font-face resolves under the base path (no 404)"
    - "The hero image is the LCP element, fetch-prioritized, with no layout shift"
    - "Gray/body text meets WCAG AA contrast, interactive elements have visible focus states, and content images have descriptive alt text"
  artifacts:
    - path: "src/index.css"
      provides: "Self-hosted Inter import, base-correct Nevis @font-face, AA contrast tokens, global focus-visible styles"
      contains: "@font-face"
    - path: "src/components/sections/Hero.jsx"
      provides: "fetchpriority/decoding on the LCP image; hydrated-flag opacity gate"
      contains: "fetchpriority"
  key_links:
    - from: "src/index.css"
      to: "@fontsource-variable/inter"
      via: "import replacing the Google Fonts @import"
      pattern: "@fontsource-variable/inter"
    - from: "src/components/sections/Hero.jsx"
      to: "public/assets/images/hero-truck.jpg"
      via: "${import.meta.env.BASE_URL}assets/images/hero-truck.jpg with fetchpriority=high"
      pattern: "fetchpriority"
---

<objective>
Fix the highest-leverage performance and accessibility issues on the existing UI: remove the render-blocking Google Fonts `@import` (self-host Inter), fix the base-unaware Nevis `@font-face` 404, promote and compress the hero LCP image, and clear WCAG AA failures (gray-text contrast, focus states, content-image alt text). All without restyling the brand (INT-PERF-01, INT-A11Y-01).

Purpose: Faster first paint for the truck-stop-wifi audience and an accessible site that passes axe/Lighthouse.
Output: font/CSS fixes in `index.css`, hero LCP optimization, and a11y corrections.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-CONTEXT.md
@.planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-RESEARCH.md
@.planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-PATTERNS.md

<interfaces>
<!-- Real pre-existing bugs and the locked brand tokens. -->
src/index.css (current top):
  line 1:  @import url('https://fonts.googleapis.com/css2?family=Inter...')   ← render-blocking, REMOVE (Pitfall 7)
  line 5:  src: url("/assets/fonts/Nevis.ttf")  ← absolute path → 404 under base (Pitfall 6). File on disk: public/assets/fonts/Nevis.ttf
  lines 18-28: @theme brand tokens — colors/font-family names are LOCKED (CONTEXT). May ADD a darker gray token / adjust gray usages for contrast, but DO NOT change --color-a2c-red/black/white or font-family names.
Existing self-host precedent: package.json:14 already uses @fontsource-variable/geist → @fontsource-variable/inter is the same trusted publisher.

src/components/sections/Hero.jsx (current LCP img, lines 10-14):
  src={`${import.meta.env.BASE_URL}assets/images/hero-truck.jpg`} alt="" className="absolute inset-0 w-full h-full object-cover"
  → ADD fetchpriority="high" decoding="async". KEEP alt="" (intentional decorative bg, CONTEXT line 74). KEEP the BASE_URL prefix (correct base-aware pattern — do NOT switch to leading-slash).
  framer-motion initial={{opacity:0}} at lines 21,30,40,50 — optional hydrated-flag gate so above-fold snapshot isn't baked at opacity 0 (Pitfall 1).
  No CLS: image is absolute inset-0 in a 100dvh section.

Contrast facts (RESEARCH metadata): red #EF392C on white ≈ 3.97:1 (FAILS AA normal text); gray-500 #6b7280 on #f5f5f5 ≈ 4.43:1 (marginal). Fix by darkening gray text usages / reserving red for large text or non-text accents.
Verification tools (no install): npx @axe-core/cli <preview-url>, npx lighthouse <url> --only-categories=performance.
</interfaces>
</context>

<tasks>

<task type="checkpoint:human-verify" gate="blocking-human">
  <name>Task 1: Verify @fontsource-variable/inter legitimacy before install</name>
  <read_first>
    - .planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-RESEARCH.md (§ Package Legitimacy Audit — @fontsource-variable/inter tagged [ASSUMED]; A1)
    - package.json (line 14 — existing @fontsource-variable/geist, same publisher)
  </read_first>
  <what-built>
    Nothing yet. The font self-host fix needs `@fontsource-variable/inter`, which RESEARCH tagged `[ASSUMED]` (exact package name unconfirmed). The `@fontsource-variable/*` family is the same publisher already trusted in this repo (`@fontsource-variable/geist`), but per the package legitimacy gate an `[ASSUMED]` package requires human confirmation before install.
  </what-built>
  <how-to-verify>
    1. Open https://www.npmjs.com/package/@fontsource-variable/inter
    2. Confirm: it is published by the Fontsource org, has a healthy weekly download count, links to github.com/fontsource/font-files, and the exact name is `@fontsource-variable/inter` (not a typosquat variant).
    3. Confirm it exposes the variable Inter font for a CSS `@import '@fontsource-variable/inter'`-style self-host.
  </how-to-verify>
  <acceptance_criteria>
    - The exact, legitimate package name is confirmed on npmjs.com (Fontsource publisher, official repo)
    - If the name differs or it is not legitimate, the correct package name (or fallback: preconnect + non-blocking load, RESEARCH Pitfall 7) is recorded before proceeding
  </acceptance_criteria>
  <resume-signal>Reply "approved: @fontsource-variable/inter" (or supply the corrected package name / instruct to use the preconnect fallback).</resume-signal>
</task>

<task type="auto">
  <name>Task 2: Self-host Inter, fix Nevis path, optimize hero LCP</name>
  <read_first>
    - src/index.css (lines 1-9 font declarations; lines 18-28 locked @theme tokens)
    - src/components/sections/Hero.jsx (lines 8-14 hero section + LCP img; lines 21,30,40,50 framer-motion initial states)
    - .planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-RESEARCH.md (Pitfall 6, Pitfall 7; Hero LCP lines 400-411)
    - .planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-PATTERNS.md (index.css + Hero.jsx assignments lines 197-245)
  </read_first>
  <action>
    (a) Install the confirmed font package: `npm install @fontsource-variable/inter` (or the corrected name from Task 1). In `src/index.css`, REMOVE the line-1 render-blocking Google Fonts `@import`; add the Fontsource Inter import instead (matching the existing `@fontsource-variable/geist` usage pattern). Keep the `--font-body: "Inter", ...` token name unchanged. (b) Fix the Nevis `@font-face` `src: url("/assets/fonts/Nevis.ttf")` — change to a base-correct reference: either hardcode `/a2c-logistics-website/assets/fonts/Nevis.ttf` or move the font into `src/` and reference it relatively so Vite fingerprints/base-prefixes it (Pitfall 6). Source file is on disk at `public/assets/fonts/Nevis.ttf`. (c) In `Hero.jsx`, add `fetchpriority="high"` and `decoding="async"` to the hero `<img>`; keep `alt=""` and the `${import.meta.env.BASE_URL}` prefix. Compress `public/assets/images/hero-truck.jpg` with `sharp` (target < ~200KB, quality ~80) — overwrite in place (it remains the LCP element, no markup churn → no CLS). Optionally gate the above-fold framer-motion `initial={{opacity:0}}` behind a hydrated flag so the prerender snapshot isn't baked at opacity 0 (Pitfall 1). Do NOT change brand color tokens or layout.
  </action>
  <verify>
    <automated>npm run build && node -e "const fs=require('fs'); const css=fs.readFileSync('src/index.css','utf8'); if(/fonts.googleapis.com/.test(css)) throw new Error('Google Fonts @import still present'); if(/url\(\"\/assets\/fonts\/Nevis.ttf\"\)/.test(css)) throw new Error('Nevis path still base-unaware'); const hero=fs.readFileSync('src/components/sections/Hero.jsx','utf8'); if(!/fetchpriority=\"high\"/.test(hero)) throw new Error('hero img not prioritized'); console.log('perf fixes ok')"</automated>
  </verify>
  <acceptance_criteria>
    - No `fonts.googleapis.com` `@import` remains in `index.css`; Inter is self-hosted via Fontsource
    - Nevis `@font-face` resolves under the base path (no leading-slash absolute path)
    - Hero `<img>` has `fetchpriority="high"` + `decoding="async"`, keeps `alt=""` + `BASE_URL` prefix
    - `hero-truck.jpg` recompressed (< ~200KB); brand tokens unchanged
  </acceptance_criteria>
  <done>Render-blocking font request removed, Nevis loads in production, hero is a fast prioritized LCP element with no CLS.</done>
</task>

<task type="auto">
  <name>Task 3: WCAG AA contrast, focus states, and content-image alt text</name>
  <read_first>
    - src/index.css (@theme tokens; base styles section after line 30)
    - .planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-CONTEXT.md (Accessibility & performance decisions, lines 70-77 — Hero alt="" stays decorative)
    - .planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-RESEARCH.md (contrast ratios in Metadata section)
  </read_first>
  <action>
    Fix WCAG AA issues (INT-A11Y-01): (a) Contrast — darken gray body/secondary text so it clears AA (≥ 4.5:1 normal text) on its grounds; do this at the source by adjusting the gray text utility/token usage (e.g. replace marginal `text-gray-500`/`text-a2c-gray` on light grounds with a darker value) without altering the locked brand palette tokens. Reserve `#EF392C` red for large text / non-text accents only (it fails AA as normal-size body text). (b) Focus — add a global, visible `:focus-visible` outline style in `index.css` so all interactive elements (links, buttons, form fields) show a clear focus ring. (c) Alt text — `grep` for content `<img>` across `src/` and add descriptive `alt` to any that lack it (e.g. fleet/truck photos); LEAVE the Hero `alt=""` as-is (intentional decorative background per CONTEXT). Run `npx @axe-core/cli` against the preview build and resolve reported AA contrast/focus/alt violations.
  </action>
  <verify>
    <automated>npm run build &amp;&amp; (npx vite preview --port 4173 &amp; SERVER=$!; sleep 4; npx @axe-core/cli http://localhost:4173/a2c-logistics-website/ --tags wcag2aa --exit; CODE=$?; kill $SERVER 2>/dev/null; exit $CODE)</automated>
  </verify>
  <acceptance_criteria>
    - `npx @axe-core/cli ... --tags wcag2aa` reports zero contrast/focus/alt violations on the home route (and spot-checked content pages)
    - All interactive elements show a visible focus ring on keyboard focus
    - Content images have descriptive alt; decorative Hero retains `alt=""`
    - Brand color tokens unchanged
  </acceptance_criteria>
  <done>Body/gray text meets AA, focus is visible site-wide, and content images are described — axe AA pass is clean.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| npm registry → build | `@fontsource-variable/inter` install executes in build env |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-04-SC | Tampering | `@fontsource-variable/inter` install (`[ASSUMED]`) | mitigate | Blocking-human legitimacy checkpoint (Task 1) verifies the exact name + Fontsource publisher on npmjs.com before install; same publisher as the already-trusted `@fontsource-variable/geist`. Not auto-approvable. |
| T-04-05-asset | Tampering | self-hosted font + image assets | accept | Static developer-controlled assets; no runtime/user input. Static host exposes only public assets, no secrets. |
</threat_model>

<verification>
- `npx @axe-core/cli --tags wcag2aa` zero violations.
- Manual phase-gate: `npx lighthouse <preview-url> --only-categories=performance` confirms hero `<img>` is the LCP element, LCP < 2.5s on throttled mobile, CLS < 0.1.
- Manual: keyboard-tab through the site to confirm visible focus rings.
</verification>

<success_criteria>
- Render-blocking font request removed; Inter self-hosted; Nevis loads under base.
- Hero is the LCP element, prioritized + compressed, no CLS.
- WCAG AA contrast/focus/alt clean on axe.
</success_criteria>

<output>
Create `.planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-05-SUMMARY.md` when done.
</output>
