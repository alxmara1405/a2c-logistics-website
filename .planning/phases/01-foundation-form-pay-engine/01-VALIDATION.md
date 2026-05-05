---
phase: 1
slug: foundation-form-pay-engine
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-05
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> See `01-RESEARCH.md` §9 for the full validation architecture; this file is the executor-facing contract.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 2.x (unit + integration) + Playwright 1.x (browser smoke) |
| **Config file** | `vitest.config.ts` (Wave 0 installs); `playwright.config.ts` (Wave 5 installs — only for the iPhone smoke check) |
| **Quick run command** | `pnpm test:unit --run` (Vitest one-shot, no watch) |
| **Full suite command** | `pnpm test --run` (Vitest unit+integration; Playwright excluded — manual run) |
| **Estimated runtime** | ~10s unit; ~30s full suite (excluding Playwright) |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test:unit --run` (sub-10s feedback)
- **After every plan wave:** Run `pnpm test --run` (full suite — sub-30s feedback)
- **Before `/gsd-verify-work`:** Full suite green AND `pnpm exec astro check` passes (TypeScript + Astro type validation)
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

This map covers the 6 ROADMAP success criteria. Per-task entries get filled in by the planner during PLAN.md generation; the rows below are the fixed end-to-end checkpoints that any plan covering that requirement must verify.

| Success Criterion | Plan (TBD) | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|-------------------|-----------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 1. iPhone submit → email + Sheet within 60s with consent metadata | TBD | 5 | FUNNEL-01,02,05; COMP-02 | T-1-CSRF / Pitfall 1 | Lead delivered idempotently; consent metadata version-stamped | manual + integration | `pnpm test integration/lead-dispatch.spec.ts` | ❌ W3 | ⬜ pending |
| 2. Break Sheet → email still delivers, KV fallback row, alert ≤5min, success state shown | TBD | 5 | FUNNEL-03,04 | Pitfall 1 (silent failure) | Partial sink failure tolerated; alert fires; durable fallback row | integration (chaos) | `pnpm test integration/sink-chaos.spec.ts` | ❌ W3 | ⬜ pending |
| 3. `/pay/owner-operator` + `/pay/company` SSG'd with own meta + JSON-LD; `/pay` 308s | TBD | 2 | PAY-01,02; SEO-04 | Pitfall 4 (state pay-transparency) | Each route has own canonical, title, JobPosting JSON-LD with `baseSalary` | build-output assert + Rich Results | `pnpm test build/pay-routes.spec.ts && curl https://search.google.com/test/rich-results-api/...` | ❌ W2 | ⬜ pending |
| 4. OO ↔ Company toggle navigates URL routes; `localStorage` persists; `tel:`/`sms:` in header+footer of every page | TBD | 2 | PAY-03; FUNNEL-07 | Pitfall 7 (toggle URL) | Two physical routes; client state lives in localStorage only | integration (Playwright) + build assert | `pnpm test:e2e e2e/toggle.spec.ts && pnpm test build/recruiter-links.spec.ts` | ❌ W2 + W5 | ⬜ pending |
| 5. Form rejects: bad origin / no Turnstile / honeypot filled / 4th-in-10min from same IP; SPF/DKIM/DMARC live; client+server share Zod | TBD | 5 | SEC-01,02,03,04,05,06 | Pitfall 6 (bots find recruiting forms in 48h) | Layered defense; deny-by-default | acceptance (curl) + DNS check + import audit | `pnpm test acceptance/form-security.spec.ts && bash scripts/check-dns.sh` | ❌ W3 | ⬜ pending |
| 6. Privacy/SMS Terms/EEO drafts live + linked + draft-banner; consent block covers TCPA; field whitelist excludes SSN/MVR/etc. | TBD | 5 | COMP-01,02,03,04,05,07 | Pitfall 4 (TCPA) | Drafts shipped; banned fields rejected by schema | build-output assert + schema test | `pnpm test build/legal-pages.spec.ts && pnpm test unit/lead-schema.spec.ts` | ❌ W4 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `package.json` — install `vitest`, `@vitest/ui`, `@vitest/coverage-v8` as devDependencies
- [ ] `vitest.config.ts` — root config with `test.environment = "node"` (form schema + sink tests are Node), `test.environment = "jsdom"` for any DOM tests if needed
- [ ] `tests/setup.ts` — shared fixtures (mock env vars for sinks, mock fetch for Turnstile/Sheets)
- [ ] `package.json` `scripts.test` and `scripts.test:unit` — wired to vitest
- [ ] `pnpm exec astro check` — runs as part of CI workflow (`.github/workflows/ci.yml` from §7 of RESEARCH.md)

Wave 5 adds Playwright on top of this for the cross-browser smoke check (separate config and script — does not gate every commit).

---

## Manual-Only Verifications

These cannot be automated reliably in Phase 1 and require a real human + real device. The Wave 5 task list documents the playbook.

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Real-iPhone form submission delivers to recruiter inbox AND Sheet within 60s | FUNNEL-01,02,05 | Real cellular network, real Resend deliverability, real Sheet write — synthetic Cron only proves the path; first end-to-end submit must be done with a human watching | (a) Open `/apply` on a real iPhone (Safari, cellular, not WiFi). (b) Fill all 6 fields with synthetic-but-flagged data ("first: TestRun-{date}"). (c) Submit. (d) Time from click to email arrival in recruiter inbox AND row in Sheet — must be ≤60s. (e) Verify consent metadata in row: `consentVersion: tcpa_consent_v1`, timestamp, IP, UA. |
| Real Turnstile widget renders + completes invisibly | SEC-01 | Cloudflare Turnstile behavior depends on real client fingerprint; localhost works differently | Open `/apply` in production browser. Inspect — Turnstile iframe present. Submit form — token attached to POST. Server log shows `siteverify` returns `success: true`. |
| `JobPosting` JSON-LD validates in Google Rich Results Test | SEO-04 | Google's tool is the canonical validator; only it knows what passes Google for Jobs eligibility | Run https://search.google.com/test/rich-results on `/pay/owner-operator` and `/pay/company`. Both return zero errors AND zero warnings about `baseSalary`/`hiringOrganization`/`jobLocation`. |
| DNS records (SPF/DKIM/DMARC) for Resend sending domain are live and aligned | SEC-06 | DNS propagation + Resend's verification is out-of-band | `dig TXT a2clogisticsco.com` shows SPF v=spf1 include:resend.com. `dig TXT resend._domainkey.a2clogisticsco.com` shows valid DKIM. `dig TXT _dmarc.a2clogisticsco.com` shows DMARC policy. Resend dashboard shows domain verified. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (vitest install, config, fixtures)
- [ ] No watch-mode flags (use `--run` for Vitest)
- [ ] Feedback latency < 30s (verified once Wave 0 lands)
- [ ] `nyquist_compliant: true` set in frontmatter (after planner fills per-task `Plan` and `Status` columns + Wave 0 lands)

**Approval:** pending — flips to `approved YYYY-MM-DD` when planner completes the per-task map.
