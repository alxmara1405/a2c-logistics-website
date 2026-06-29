---
phase: 4
slug: interim-seo-crawlability-structured-data-polish-current-site
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-29
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from `04-RESEARCH.md` § Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (NOT yet installed — Wave 0 adds it) |
| **Config file** | none — Wave 0 installs `vitest` |
| **Quick run command** | `npm run build && npx vitest run tests/prerender.test.js` |
| **Full suite command** | `npm run build && npx vitest run && npx @axe-core/cli http://localhost:4173/a2c-logistics-website/` |
| **Estimated runtime** | ~30–60 seconds (build dominates) |

> Most success criteria are static-output assertions (does built `dist/**/index.html` contain X?) plus external validators (Rich Results Test, Lighthouse, axe). Highest-value automation = a post-build Vitest suite that reads `dist/**/index.html` and asserts content. Tests depend on `scripts/prerender.mjs` having run (it runs as part of `npm run build`).

---

## Sampling Rate

- **After every task commit:** `npm run build && npx vitest run tests/prerender.test.js`
- **After every plan wave:** `npm run build && npx vitest run && npx @axe-core/cli <preview-url>`
- **Before `/gsd:verify-work`:** Full suite green + manual Rich Results Test (both schemas) + Lighthouse mobile LCP < 2.5s + a real Formspree submission to each endpoint
- **Max feedback latency:** ~60 seconds

---

## Per-Requirement Verification Map

| Req ID | Behavior | Test Type | Automated Command | File Exists | Status |
|--------|----------|-----------|-------------------|-------------|--------|
| INT-SEO-01 | Each of 6 `dist/<route>/index.html` contains its H1 + body copy (not empty `#root`) | unit (read dist) | `npx vitest run tests/prerender.test.js` | ❌ W0 | ⬜ pending |
| INT-SEO-02 | Each route HTML has a **unique** `<title>`, meta description, self-canonical | unit | same suite (assert uniqueness + presence) | ❌ W0 | ⬜ pending |
| INT-SEO-03 | DriveWithUs HTML contains valid `JobPosting` JSON-LD (required fields) | unit + manual | suite parse + required-key check; **manual: Google Rich Results Test** | ❌ W0 | ⬜ pending |
| INT-SEO-04 | Home HTML contains `Organization`/`LocalBusiness` JSON-LD; NAP byte-identical across Footer + Contact | unit | suite parse + string-equality of NAP | ❌ W0 | ⬜ pending |
| INT-SEO-05 | `dist/sitemap.xml` lists 6 base-path URLs; `dist/robots.txt` references sitemap | unit | suite: file exists + URL count | ❌ W0 | ⬜ pending |
| INT-SEO-06 | Each route HTML has `og:title/description/image` + absolute URLs; `dist/og-image.*` exists | unit | suite: meta presence + file exists | ❌ W0 | ⬜ pending |
| INT-SEO-07 | Keyword-aware H1/headings present ("CDL Class A … Lincoln, NE") | manual review | content review | n/a | ⬜ pending |
| INT-UX-01 | Both Formspree endpoints deliver | manual | **real test submission** (human dependency) | n/a | ⬜ pending |
| INT-UX-02 | "Q&A Form" heading gone; CTA labels tightened | unit/grep | suite: assert string absent in dist | ❌ W0 | ⬜ pending |
| INT-A11Y-01 | No WCAG AA contrast failures; visible focus; content-image alt | automated + manual | `npx @axe-core/cli <preview-url>` + Lighthouse a11y; manual focus check | ✅ (npx) | ⬜ pending |
| INT-PERF-01 | Hero is LCP element, < 2.5s throttled mobile, no CLS | automated | `npx lighthouse <url> --only-categories=performance` | ✅ (npx) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `npm install --save-dev vitest` — no framework currently installed
- [ ] `scripts/prerender.mjs` — must exist and run via `npm run build` BEFORE the test suite (tests read `dist/`)
- [ ] `tests/prerender.test.js` — reads `dist/**/index.html`, asserts INT-SEO-01/02/03/04/05/06 + INT-UX-02
- [ ] No fixtures/conftest needed (Vitest reads built files directly)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| JobPosting + LocalBusiness validate in Google | INT-SEO-03/04 | External validator | Run built route URLs through Google Rich Results Test; expect zero errors |
| Formspree endpoints deliver | INT-UX-01 | Live third-party + human inbox | Submit each form; confirm arrival in recruiter inbox. **Content/owner dependency — cannot be verified by code.** |
| Keyword copy reads naturally | INT-SEO-07 | Editorial judgment | Human review of H1s/headings for intent match without stuffing |
| Hero LCP on real throttled mobile | INT-PERF-01 | Field conditions | Lighthouse mobile preset on the preview build; confirm hero `<img>` is LCP, LCP < 2.5s, CLS < 0.1 |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (Vitest install + prerender script + test file)
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter (set by planner once tasks map to verifications)

**Approval:** pending
