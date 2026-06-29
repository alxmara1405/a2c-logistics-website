---
title: "Decision — Interim SEO/Polish on current site vs. Astro rebuild"
date: 2026-06-29
context: explore session; reconciling a fresh "improve the site" request against the stalled v1.0 Astro rebuild plan
status: decided
---

# Decision: Pragmatic interim improvements now, Astro rebuild remains the v1.0 target

## The fork

On **2026-06-29**, a `/gsd:explore` session was opened to scope improving the live site
(`https://alxmara1405.github.io/a2c-logistics-website`) for SEO, frontend design, and usability.
Mid-session it surfaced that this repo **already contains a complete v1.0 GSD plan** (created
2026-05-04/05) for a **wholesale rebuild** of the same site:

- Vite/React SPA → **Astro 6** (zero-JS-by-default, ~8–15 Lighthouse mobile points faster)
- GitHub Pages → **Cloudflare Pages** on `a2clogisticsco.com`
- Formspree → real form handler (Resend email + Google Sheet, alerting, spam defense)
- **73 requirements, 3 phases**; Phase 1 already has 6 sub-plans written
- Status: **`BLOCKED` for ~2 months** on real-world inputs only A2C can supply (pay numbers,
  Squarespace→Cloudflare nameserver switch, Nevis Bold web license, Resend DKIM, recruiter phone,
  Google Sheet, legal counsel).

The fresh request and the existing plan **conflict** (rebuild + new host vs. improve current site
on GitHub Pages). The likely cause of the request: the rebuild stalled on blockers, and quick wins
were going unshipped while waiting.

## What was decided (user choices this session)

1. **Primary audience:** Recruit drivers (matches PROJECT.md). SEO strategy = local + job-posting
   (`JobPosting`/Google for Jobs, `LocalBusiness`, "CDL Class A driver jobs Lincoln NE").
2. **Deployment:** Stay on GitHub Pages for now; domain migration deferred.
3. **Direction:** **Pragmatic interim** — ship unblocked SEO + polish wins on the current
   React/Vite site now; **keep the Astro rebuild as the real v1.0 target** for when its blockers clear.
4. **Process:** Capture this decision + plan the interim work as its own milestone (separate from
   the v1.0 rebuild planning, which is preserved untouched).

## Relationship between the two tracks

- The **v1.0 Astro rebuild** (`.planning/ROADMAP.md`, `phases/01-foundation-form-pay-engine/`,
  `research/`) is **paused, not abandoned**. Its planning artifacts remain valid.
- The **interim track** improves the to-be-replaced React site. Its highest-value output is
  **SEO content + structured data + copy**, which **transfers directly into the Astro rebuild**
  (the JobPosting/LocalBusiness schema, per-page meta, and keyword-aware copy are reusable).
- Hard constraint: GitHub Pages is **static-only** — the interim track cannot ship a real form
  backend. Forms stay on Formspree until the rebuild.

## Interim scope (7 items)

1. Prerender all 6 routes to static HTML (react-snap / vite-react-ssg) — fixes empty-`#root` crawlability (the #1 issue).
2. Per-page `<title>` + meta description + canonical (React 19 native document metadata).
3. `JobPosting` JSON-LD on Drive With Us — pay as ranges marked "as of" if real numbers aren't ready.
4. `LocalBusiness`/`Organization` JSON-LD + consistent NAP.
5. sitemap.xml + robots.txt + OG/Twitter tags + OG image.
6. Keyword-aware copy — "CDL Class A driver jobs Lincoln, NE" woven into H1s.
7. Usability/polish — verify Formspree endpoints are live & owned, fix "Q&A Form" copy, a11y pass (contrast, focus states), hero LCP optimization.

## Open dependencies (cannot be fabricated)

- Are the two Formspree endpoints (`mvzvrleo` contact, `mzdkgolq` apply) real, owned, and monitored?
- Rough driver pay ranges to publish (else placeholders marked "pending real data").

## Audit findings backing this decision

- Design is genuinely good (coherent brand system, modern stack, polished motion). **No redesign needed.**
- SEO is the real weakness: CSR SPA on GH Pages (crawlers see empty page), single shared title/meta
  across all routes, no structured data, no sitemap/robots/OG.
