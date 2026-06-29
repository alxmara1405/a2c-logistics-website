---
phase: 4
slug: interim-seo-crawlability-structured-data-polish-current-site
plan: 02
type: execute
wave: 1
depends_on: []
files_modified: []
autonomous: false
requirements: [INT-UX-01]
nyquist_compliant: true

must_haves:
  truths:
    - "A real test submission to the contact form (mvzvrleo) arrives in an A2C-owned inbox, OR the endpoint is replaced with a live owned one"
    - "A real test submission to the apply form (mzdkgolq) arrives in an A2C-owned inbox, OR the endpoint is replaced with a live owned one"
    - "The // TODO: Replace comments on both endpoints are resolved (confirmed-live note or replacement)"
  artifacts: []
  key_links:
    - from: "src/pages/Contact.jsx"
      to: "Formspree contact endpoint"
      via: "fetch POST https://formspree.io/f/<id>"
      pattern: "formspree.io/f/"
    - from: "src/pages/DriveWithUs.jsx"
      to: "Formspree apply endpoint"
      via: "fetch POST https://formspree.io/f/<id>"
      pattern: "formspree.io/f/"
---

<objective>
Confirm both Formspree endpoints are real, owned by A2C, and actually delivering submissions — or replace dead endpoints. Silent form failure is the catastrophic failure mode for a single-conversion-goal site, and this cannot be verified by code inspection; it requires a live test submission and inbox confirmation (INT-UX-01).

Purpose: Guarantee leads are not silently lost while the interim site is live on Formspree.
Output: Confirmed-live status for both endpoints (or replacements), and resolution of the `// TODO: Replace` comments.

This is a content-readiness gate (human dependency). Per phase guidance it must NOT block the rest of the phase — it runs in parallel (Wave 1) and only this plan pauses for the human.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-CONTEXT.md
@.planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-RESEARCH.md

<interfaces>
<!-- Endpoints under test (both carry // TODO: Replace today). -->
Contact form  — src/pages/Contact.jsx:25-28   → https://formspree.io/f/mvzvrleo
Apply form    — src/pages/DriveWithUs.jsx:52-54 → https://formspree.io/f/mzdkgolq
Recruiter inbox of record (per NAP): kevin@a2clogisticsco.com
Submission shape (identical both forms): fetch(POST, FormData, headers {Accept: application/json}); response.ok → success state.
</interfaces>
</context>

<tasks>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 1: Live-submit both Formspree forms and confirm delivery</name>
  <read_first>
    - src/pages/Contact.jsx (lines 20-40 handler, line 28 endpoint)
    - src/pages/DriveWithUs.jsx (lines 47-66 handler, line 54 endpoint)
    - .planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-RESEARCH.md (Open Question 1; Runtime State Inventory — Formspree liveness)
  </read_first>
  <what-built>
    No code change yet — this verifies live third-party state. The two Formspree endpoints (`mvzvrleo` contact, `mzdkgolq` apply) are hardcoded with `// TODO: Replace` comments; whether they deliver to an A2C-owned inbox is unknown and unverifiable by code.
  </what-built>
  <how-to-verify>
    1. Run the site (`npm run dev`) or use the live URL `https://alxmara1405.github.io/a2c-logistics-website/`.
    2. On `/contact`, submit the form with a recognizable test payload (e.g. name "PRERENDER TEST", a reachable email).
    3. On `/drive-with-us`, submit the apply form with a second recognizable test payload.
    4. Check the recruiter inbox (kevin@a2clogisticsco.com or the actual A2C-owned Formspree-linked inbox) — confirm BOTH test submissions arrived within a few minutes.
    5. Report, per endpoint: ARRIVED / DID NOT ARRIVE / NOT OWNED.
  </how-to-verify>
  <acceptance_criteria>
    - Explicit ARRIVED / NOT-ARRIVED verdict reported for BOTH endpoints
    - For any non-arriving / unowned endpoint, a decision is recorded: keep, or replace with a new A2C-owned Formspree form ID
  </acceptance_criteria>
  <resume-signal>Reply "both live", or list the endpoint(s) that failed plus the replacement Formspree ID(s) to swap in.</resume-signal>
</task>

<task type="auto">
  <name>Task 2: Resolve endpoint TODOs (swap dead IDs, annotate confirmed-live)</name>
  <read_first>
    - src/pages/Contact.jsx (line 25-28)
    - src/pages/DriveWithUs.jsx (line 52-54)
    - .planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-PATTERNS.md (Form submission pattern — do not restructure the handler)
  </read_first>
  <action>
    Using the human verdict from Task 1: for any endpoint reported DID-NOT-ARRIVE / NOT-OWNED, replace only the Formspree form ID string in the `fetch('https://formspree.io/f/<id>', ...)` call with the supplied owned ID. For any confirmed-live endpoint, replace the `// TODO: Replace ...` comment with a dated confirmation note (e.g. `// Verified live 2026-06-29 — delivers to A2C recruiter inbox`). Do NOT restructure the handler, FormData, or success-state logic (PATTERNS Form submission pattern). If both endpoints were confirmed live with no swap needed, this task only updates the two comments. If the human deferred (no replacement IDs available yet), leave the endpoints unchanged and record the gap in the SUMMARY as an open content-readiness blocker — do not block the phase.
  </action>
  <verify>
    <automated>grep -rn "TODO: Replace" src/pages/Contact.jsx src/pages/DriveWithUs.jsx; test $? -ne 0 && echo "no stale TODO" || echo "TODO remains — confirm intentional (deferred)"</automated>
  </verify>
  <acceptance_criteria>
    - Each endpoint is either confirmed-live (comment updated) or swapped to an owned live ID
    - Handler logic, FormData construction, and success state are unchanged
    - Any unresolved endpoint is explicitly recorded as an open blocker in the SUMMARY (phase not blocked)
  </acceptance_criteria>
  <done>Both endpoints are live-and-owned or replaced; no unexplained `// TODO: Replace` remains.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| visitor browser → Formspree | Untrusted form input crosses to a third-party POST endpoint over HTTPS |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-04-02a | Repudiation/Information disclosure | Dead/unowned Formspree endpoint | mitigate | Live test submission + inbox confirmation; replace any endpoint not delivering to an A2C-owned inbox. |
| T-04-02b | Spoofing (form spam) | Formspree forms, no Turnstile on static host | accept | Real spam defense is deferred to the v1.0 rebuild (locked scope fence); Formspree provides baseline spam filtering. |
| T-04-02c | Information disclosure | Form POST transport | mitigate | Endpoints are `https://formspree.io` (verified in source) — no mixed content. |
</threat_model>

<verification>
- Human reports both endpoints ARRIVED (or replacements applied).
- `grep "TODO: Replace"` returns nothing unexplained in the two form files.
</verification>

<success_criteria>
- Both Formspree endpoints are confirmed live-and-owned, or replaced with owned live IDs.
- No silent lead loss path remains undocumented.
</success_criteria>

<output>
Create `.planning/phases/04-interim-seo-crawlability-structured-data-polish-current-site/04-02-SUMMARY.md` when done.
</output>
