# Pitfalls Research

**Domain:** Truck driver recruiting site (owner-operator + W2 company driver) for a small-fleet carrier — pay-transparency-led, single-conversion-goal (quick-apply), Next.js/Astro + MDX, ecosystem cross-link to sister brands.

**Researched:** 2026-05-04
**Confidence:** MEDIUM-HIGH overall.
- HIGH on conversion / form / SEO / brownfield / toggle pitfalls (well-known web patterns + CDL-hiring industry consensus).
- MEDIUM on compliance-specific items (FMCSA / EEOC / FCRA / state laws) — directional guidance is stable but **counsel sign-off is required before launch**. Final copy and form fields must be reviewed by an attorney familiar with motor-carrier hiring.
- LOW where flagged inline.

**Tooling note:** WebSearch and WebFetch were unavailable in this research session. Compliance assertions reflect long-standing federal guidance that has been stable through 2025; treat them as a starting checklist for legal review, not a substitute for it.

---

## Critical Pitfalls

These are the ones that, if unaddressed, kill the project's stated goal (qualified driver leads + trust) or expose A2C to legal risk.

---

### Pitfall 1: Pay published as a single number that goes stale and turns into a screenshot weapon

**What goes wrong:**
A2C publishes "$0.65 CPM" or "85% gross" on the Pay page. Six months later fuel/freight conditions change and the real average is $0.58 / 78%. New hires arrive with a screenshot, demand the originally-advertised number, and quit when the gap is explained. Existing drivers see the change as a takeaway and post on r/Truckers. The transparency move that was the differentiator becomes the trust failure.

**Why it happens:**
- A point number reads better than a range, so marketing instincts win.
- MDX makes editing easy → the team forgets that easy-to-edit isn't the same as easy-to-explain-away-to-a-recruit-who-screencapped-the-old-version.
- "Top earners" framing gets repurposed by drivers as "what I was promised."

**How to avoke:**
1. **Publish ranges + the variables that move them**, not point numbers. Example: `Owner-ops: 80–88% of line haul. Bracket depends on equipment class, fuel program enrollment, and dispatch tier.`
2. **Date-stamp every pay table** in MDX frontmatter (`effective: 2026-05`) and render the date next to the number. Stale numbers self-identify.
3. **Add an "as of" disclosure block** beneath every pay statement: *"Pay terms reflected here are current as of [date] and may change with market conditions. Final terms are confirmed in writing during onboarding."*
4. **Avoid "top earners make $X"** unless you also publish median + bottom quartile and what fleet position produced the top number. The asymmetry is what kills trust.
5. **Settlement/deduction transparency:** publish *categories* (truck payment range, insurance, fuel card terms, ELD, occ/acc, plates) without locking in dollar amounts that depend on truck program tier. Real settlement statement *examples* (with names redacted) are gold; real numbers in marketing copy are a trap.
6. **Versioned pay MDX:** keep historical pay snapshots in git so when a driver says "the site said X in March," you can pull up the exact source.
7. **Recruiter script** that handles the "but the website said" conversation must exist *before* launch — not invented in the moment.

**Warning signs:**
- A pay number on the site has no `effective` date or "as of" line.
- Recruiters report drivers quoting pay numbers from "the website" that don't match current rates.
- Marketing draft copy uses "starting at" or "up to" without disclosing what the typical case is.
- Anyone proposes "we'll just update the number when it changes" without a process for *who*, *how often*, and *who reviews*.

**Phase to address:**
- **Pay & Benefits content phase** (before MDX schema is locked) — bake `effective`/`as of`/range fields into the schema, not bolted on later.
- **Pre-launch QA** — every pay assertion has a date and a range or qualifier.
- **Post-launch monitoring** — quarterly pay-page review on the recruiting team's calendar.

---

### Pitfall 2: Quick-apply form asks protected-class questions or pulls MVR/SSN without FCRA disclosure

**What goes wrong:**
Form collects DOB, marital status, "are you authorized to work in the US," disability accommodation needs, or — most dangerous — SSN and DOT employment history with the *intent* to background-check, without surfacing FCRA disclosure and authorization. Result: EEOC complaint, FCRA class-action exposure, or simply a lawsuit-shaped letter from a driver who didn't get hired and noticed an illegal question.

**Why it happens:**
- Most form templates online were written for general-purpose lead capture, not regulated hiring.
- "We need it for the DOT app anyway" is true — but the moment you collect SSN/MVR consent on the marketing site, the marketing site is now an employment screening tool subject to FCRA's standalone-disclosure rule.
- Well-meaning fields like "Are you a veteran?" or "How did you hear about us?" can drift into age/national-origin/protected-class territory if phrased poorly.

**How to avoid:**

**Field whitelist for the quick-apply (matches REQ-FUNNEL-01: ≤6 fields):**
- ✅ Full name (or first + last)
- ✅ Phone (primary contact channel)
- ✅ Email (secondary)
- ✅ CDL class (Class A only is fine to constrain)
- ✅ Years of CDL experience (use *ranges*, not "date you got your CDL" — the latter is an age proxy)
- ✅ Owner-op or company driver (the toggle — captured)
- ✅ Current state / ZIP (for fleet-fit; not exact address)
- ✅ Optional free-text "anything else?" field
- ✅ Consent checkbox: *"I agree A2C may contact me by phone, text, or email about driving opportunities. Standard message rates apply. Reply STOP to opt out."*

**Field blacklist for the quick-apply:**
- ❌ Date of birth or "year you started driving" (age proxy under ADEA — drivers are explicitly a protected age class).
- ❌ Marital status, dependents, "is your family supportive of OTR?" (sex/family-status discrimination risk; also paternalistic toward female drivers).
- ❌ Citizenship questions ("are you a US citizen?"). The legal phrasing — only at offer/I-9 stage — is "are you legally authorized to work in the United States?" and even that does not belong on a marketing-site quick-apply.
- ❌ Disability or "any health conditions that would prevent driving?" (ADA — DOT physical handles fitness-for-duty).
- ❌ Religion, national origin, race, gender (obvious — but "ethnicity" sliders show up in templated forms; remove them).
- ❌ Arrest/conviction history (FCRA + EEOC ban-the-box guidance + state-specific rules in CA/IL/NY/etc. — handle in the full app with proper disclosure).
- ❌ SSN, MVR consent, employment history with employer contact info, drug-test consent — all of these belong in the full DOT application, not the marketing quick-apply.
- ❌ DD-214 / military service (proxy for veteran status — protected category; don't ask in quick-apply).

**FCRA stance for the quick-apply:**
The quick-apply form does NOT trigger FCRA — *as long as it does not collect MVR consent, SSN, or background-check authorization*. Out of Scope in PROJECT.md is correctly drawn: full DOT app + MVR pull happens off-site (recruiter-led / future ATS). The site's job is to make this boundary explicit:
- Apply-success page wording: *"A recruiter will reach out within 24 hours to walk you through the next steps, including the full DOT application and background check."*
- Privacy policy must state: *"We do not request your Social Security Number, motor vehicle record consent, or background-check authorization through this website. Those are collected only after a recruiter conversation and with separate written disclosure as required by federal law."*

**EEOC-friendly consent block (suggested copy — needs counsel review):**
> By submitting this form, I authorize A2C Logistics CO. to contact me by phone, SMS, or email about driving opportunities. Submission is voluntary. I understand A2C does not consider race, color, religion, sex, national origin, age, disability, veteran status, genetic information, or any other legally protected characteristic in hiring decisions. A2C is an equal opportunity employer.

**Warning signs:**
- A form-template library or competitor analysis surfaces fields like DOB or SSN on a "quick" application — copy-paste pressure is high.
- Marketing wants to A/B test "tell us about your family" copy.
- Anyone proposes auto-submitting the quick-apply data into a background check without recruiter conversation.
- Privacy policy is a generic web template that doesn't mention FCRA or driver-employment context.

**Phase to address:**
- **Form schema phase** — field whitelist locked before any form code is written. Code reviewer enforces no new fields without compliance review.
- **Compliance phase / pre-launch counsel review** — privacy policy + consent block + apply form fields signed off by an employment attorney familiar with motor-carrier hiring (REQ-OPS-01 explicitly calls for DOT/EEOC-friendly copy).
- **CI gate (optional but recommended):** a unit test asserts the form schema only contains the whitelisted fields. Adding a field requires updating the test, which forces a deliberate decision.

**Confidence:** MEDIUM. Federal frameworks (Title VII, ADEA, ADA, FCRA, GINA) have been stable for years; ban-the-box and state-specific recruiting-ad laws (CA SB 1162 pay disclosure, IL/NY salary-history bans, WA pay-range posting) shift more frequently. **A motor-carrier-experienced employment attorney must review final form fields, consent block, and privacy policy before launch.**

---

### Pitfall 3: Pay-transparency state laws (CA / WA / NY / IL / CO / MD) require salary disclosure on the *job posting itself*, not just the Pay page

**What goes wrong:**
A2C runs a paid job board listing or even an organic Google for Jobs result that surfaces "Owner Operator — Lincoln, NE" without a pay range *in the structured-data posting*. A driver from California or Washington applies. The carrier is now potentially in scope of that state's pay-transparency law (the laws generally apply when the position can be performed in or remote-from the covered state — a long-haul OTR role can argue both ways, and plaintiffs' lawyers don't argue the friendly side).

**Why it happens:**
- Trucking marketers historically treated pay disclosure as optional copy, not a legal requirement.
- These laws moved fast 2022–2024 and still vary by state. CO (2021), WA (2023), CA (2023), NY (2023), IL (2025), MD (2024) all have variants. Compliance posture must assume *the strictest rule that could apply to any visiting driver*, since drivers travel and apply nationally.
- Google for Jobs / Indeed / Glassdoor structured data pulls from JobPosting schema — if A2C publishes JobPosting JSON-LD without `baseSalary`, the listing surfaces nationally without a salary, in violation of multiple state rules.

**How to avoid:**
1. **Every JobPosting structured-data block on the site** (homepage hero, pay page, dedicated job pages) includes `baseSalary` with `minValue` / `maxValue` / `unitText` (HOUR/MILE/PERCENT — note: schema.org doesn't have a clean "per mile" unit; use `unitText: "MILE"` per Google's CDL guidance, with the value in CPM as a decimal).
2. **For percentage-based OO compensation,** post a representative dollar range that the percentage typically yields *plus* the percentage. E.g., `baseSalary: 180,000–240,000/year` and a copy footnote that this reflects the typical owner-op gross at A2C's percentage.
3. **Treat the entire site as a "job posting" jurisdiction-wise.** Don't try to geo-fence compliance — assume CA/WA/NY/IL/CO/MD rules all apply.
4. **No "competitive pay" / "top of market" / "great pay" copy.** These phrases were always weak; in 2026 they're also a state-law red flag because they signal you're hiding a number.
5. **Sign-on bonus, detention pay, layover pay** — disclose terms or omit. "Sign-on bonus available" without amount = soft violation in some jurisdictions.

**Warning signs:**
- A JobPosting JSON-LD validator (Google Rich Results Test) shows missing `baseSalary`.
- Copy contains "competitive," "top of market," "industry-leading," or "ask us for details" near pay claims.
- The Pay page has numbers but the homepage hero has a "Great pay!" CTA without numbers.

**Phase to address:**
- **Content + SEO phase** — JobPosting schema decisions made early, validated in Google Rich Results Test before launch.
- **Pre-launch QA** — every page mentioning pay either has a number/range or links to one within one click.

**Confidence:** MEDIUM. Pay-transparency laws are evolving; the *direction* (more disclosure required, in more states, on the posting itself) is stable. **Verify current state coverage with counsel** especially if A2C runs paid job-board ads.

---

### Pitfall 4: TCPA exposure on the SMS/text-recruiter channel

**What goes wrong:**
The form delivers leads to recruiting; recruiting texts the driver from a personal cell or a Twilio number using auto-fill templates. Driver didn't consent specifically to *automated* texts (or consent wording was too vague). Under TCPA, statutory damages are $500–$1,500 *per text*. Plaintiff law firms specifically target trucking recruiters because the volume is high and the consent paper trail is thin.

**Why it happens:**
- "Standard message rates apply" + a checkbox feels like consent — but TCPA prior-express-written-consent requires specifics: who's texting you, what you're being texted about, that consent isn't a condition of any other transaction, and the right to revoke.
- One-click bulk re-engagement texts from a CRM ("Hey, still interested in driving with A2C?") to old leads is the highest-risk pattern.
- FCC's 2024 "one-to-one consent" rule (vacated by 11th Circuit in early 2025 but the underlying principle of channel-specific consent remains good practice) raised the bar.

**How to avoid:**
1. **Consent block must explicitly cover SMS/text from A2C recruiting**, including frequency ("up to 4 messages/month"), opt-out method ("Reply STOP"), and that consent isn't a condition of being considered for the role.
2. **Log consent metadata with each form submission**: timestamp, IP, user agent, consent text version, form version. Store with the lead row in the sheet/Airtable.
3. **No bulk re-engagement of cold leads** — if a driver hasn't responded in 30 days, they go cold; re-engagement is a fresh outreach problem, not an automated text.
4. **Recruiters use a single tracked number** (Twilio or carrier-managed) — not personal cells. This makes opt-out enforcement actually possible.
5. **Honor STOP within 24 hours and across all channels** (don't keep emailing someone who texted STOP).

**Warning signs:**
- Consent checkbox just says "I agree to be contacted." Not specific enough.
- Form submissions don't capture the consent text version or timestamp.
- Recruiters discuss "re-warming the old lead list" without a fresh consent step.

**Phase to address:**
- **Form/consent design phase** — write the consent block with counsel; bake versioning into the lead row schema.
- **Operations handoff (post-launch)** — recruiter SOP includes opt-out handling and prohibition on bulk cold-text.

**Confidence:** MEDIUM. TCPA fundamentals are stable; FCC rulemaking around consent specifics has been turbulent 2024–2025. Counsel review.

---

### Pitfall 5: Form-handler silent failure — leads disappear, recruiters never know

**What goes wrong:**
The serverless function that POSTs to Google Sheets / Airtable / email throws (rate limit, expired API token, schema mismatch after a column rename, OAuth refresh failure). The form UI shows success ("Thanks! A recruiter will be in touch.") because the *fetch resolved with a 200* from the function — but the function silently swallowed the downstream error. Driver waits. Never gets a call. Lead is lost, and A2C has no record it ever existed.

This is the worst possible failure mode for this project: the *only* conversion goal silently breaks and there's no user-visible signal.

**Why it happens:**
- Happy-path testing only — devs test that submission succeeds, not that downstream sinks confirm receipt.
- Multiple sinks (email + sheet) without a "primary of record" — when one fails, no one knows whose error is canonical.
- Google Sheets API tokens expire / get rotated; OAuth refresh in serverless is a known footgun.
- Email provider (Resend / SendGrid / Postmark) has a soft bounce that's not surfaced.

**How to avoid:**
1. **Fail loud on the server, fail soft on the user.** If a sink fails, the function still returns success to the user (don't punish the driver for our infra), but it must:
   - Write the lead to a *fallback durable store* (a JSON blob in R2/S3, or a second sink, or a database row) so the lead is never lost.
   - Trigger an alert (email to ops, Slack webhook, Sentry/Logflare/Axiom error event) so a human knows within minutes.
2. **Two-channel delivery minimum** — email AND sheet/Airtable. Both must succeed for the lead to be considered "delivered." If one fails, alert.
3. **Synthetic monitoring** — a daily cron submits a test lead and verifies it lands in *both* sinks. Recruiters know to ignore the synthetic (tag it).
4. **Idempotency key per submission** so retries don't double-deliver.
5. **Lead row schema includes `delivery_status` column** — writes start as `pending`, flip to `delivered` only after both sinks confirm. A query for `pending > 1 hour old` is the canary.
6. **Visible "lead intake healthy" status** in the recruiter dashboard / sheet — last successful synthetic submission timestamp, number of leads in the last 24h.

**Warning signs:**
- Form returns 200 with no end-to-end test verifying the sink received the data.
- "We'll just check the sheet" is the entire monitoring strategy.
- No alerting wired to sink failures.
- Recruiters can't tell you when the last lead arrived without opening the sheet.

**Phase to address:**
- **Form integration phase** — durable fallback store + alerting wired alongside the sink, not after.
- **Pre-launch QA** — synthetic submission test runs and verifies both sinks. Kill switch / fallback tested by deliberately breaking the API token.
- **Post-launch monitoring** — daily synthetic + uptime check on the form endpoint.

---

### Pitfall 6: Spam/bot submissions destroy recruiter trust in the inbox

**What goes wrong:**
Within 48 hours of launch, the form is hit by scrapers + form-fill bots. Recruiter inbox is 80% Cyrillic gibberish, fake names, SEO-spam URLs in the "anything else?" field. Real leads get missed because recruiters stop opening alerts after the third spam burst. Within a week, the conversion funnel has zero ROI not because drivers aren't applying, but because nobody's looking.

**Why it happens:**
- Public form endpoints are scanned within hours of going live.
- Honeypot-only protection works for ~30 days then sophisticated bots learn the pattern.
- Captchas annoy real drivers (especially on mobile, especially in poor truck-stop wifi) more than they deter bots.
- Rate limiting at the page level doesn't stop distributed submissions.

**How to avoid:**
1. **Layer protection — don't rely on one mechanism:**
   - **Cloudflare Turnstile** (invisible / non-interactive — does NOT show a CAPTCHA challenge to the driver in the normal case). Verified server-side in the form handler. Available free, integrates cleanly with Cloudflare Pages and any Next.js handler. Use the React component (`@marsidev/react-turnstile`) for client integration.
   - **Honeypot field** (a `display: none` input that real users won't fill but naive bots will).
   - **Origin check** — the form handler rejects POSTs without a valid `Origin` / `Referer` matching the production domain.
   - **Rate limit by IP** at the edge (Cloudflare Pages Functions / Netlify Edge — both have free-tier rate limit primitives).
   - **Field-content sanity** — reject submissions where free-text fields contain URLs (the "anything else?" field is the spam vector).
2. **Tag spam-suspected submissions** rather than dropping them — score 0–10 based on signals, send 0–3 to a quarantine sheet, only forward 4+ to recruiters. Tune over time.
3. **Don't use email-only delivery** — bots discover and abuse `mailto:` patterns trivially.
4. **First-week monitoring** — read the spam quarantine daily for the first two weeks to tune thresholds and confirm no false positives on real drivers.

**Warning signs:**
- Recruiter says "I think we got a bunch of weird applications today."
- Form handler logs show submissions from datacenter IP ranges (AWS / DigitalOcean / Hetzner ASNs).
- "Anything else?" field contains URLs in 10%+ of submissions.

**Phase to address:**
- **Form integration phase** — Turnstile + honeypot + origin check shipped together, not bolted on after spam appears.
- **Pre-launch QA** — manually submit with a script (no JS, no Turnstile token) and verify rejection.
- **First two weeks post-launch** — daily spam-quarantine review.

**Confidence:** HIGH on the patterns; HIGH on Turnstile being the right tool (Context7 confirms current docs and React integration).

---

### Pitfall 7: OO ↔ Company toggle creates duplicate-content SEO penalty + lost-state UX bug

**What goes wrong:**
Two failure modes from the same source:
- **SEO**: The Pay page (and possibly Home) has a toggle that swaps content via JS state. Search engines either index only the default state (drivers searching "owner operator pay" find the *company* variant, bounce), or — worse — both variants are surfaced via different URLs and Google flags duplicate content / cannibalizes ranking.
- **UX**: Driver toggles to "Owner-Operator" on the Pay page, clicks to "Family" page, comes back, toggle has reset to "Company." On every navigation. Drivers feel the site is fighting them.

**Why it happens:**
- Toggle state stored only in component state (resets on remount / navigation).
- Single URL serves both variants — no canonical for either intent.
- Marketing wants a single "Pay" URL for both audiences for simplicity, not realizing it costs ranking on the more-specific queries.

**How to avoid:**

**Routing & SEO:**
1. **Two URLs, one toggle UI.** Routes: `/pay/owner-operator` and `/pay/company-driver`. Toggle is a navigation control that pushes URL state. Each route SSR-renders its full content as the primary view; the other side is a link, not a hidden DOM branch.
2. **Each variant has its own `<title>`, meta description, H1, and JobPosting JSON-LD.** OO page targets "owner operator lease on Lincoln NE / Nebraska"; Company page targets "company truck driver jobs Lincoln NE."
3. **Cross-link with `<link rel="alternate">` and explicit "Looking for the company driver page? →" CTA** so drivers who land on the wrong variant via search don't bounce.
4. **No `rel="canonical"` cross-pointing** — each variant is its own page, not a duplicate.
5. **Repeat for any other toggled content** (apply form variant, benefits comparison): URL-state, not pure component-state.

**Toggle UX:**
1. **Persist toggle preference** in `localStorage` on first explicit selection so subsequent visits remember (REQ-FUNNEL-01 captures the toggle in the form too).
2. **Default to neither selection** in the apply form — let the driver pick rather than guessing wrong from URL. Or default based on the page they came from.
3. **Show the toggle prominently** on every variant — driver who realizes they're on the wrong page must be one tap from switching.

**Paid-ad alignment (REQ-FUNNEL-03 implication):**
- OO Google Ads → land on `/pay/owner-operator` directly. Company driver Facebook ads → `/pay/company-driver`. Never land paid traffic on a generic `/pay` that requires a toggle to see the relevant content.
- UTM parameters set the apply-form toggle default on landing.

**Warning signs:**
- One URL serves both variants based on toggle state.
- Toggle state stored only in `useState` — refresh test loses it.
- Google Search Console shows OO and Company variants competing for the same query.
- Heatmap shows drivers tapping the toggle multiple times on the same page (confusion).

**Phase to address:**
- **Information architecture / routing phase** — URL structure decided before page components are built.
- **Pre-launch QA** — Google Rich Results Test on both variants; Lighthouse SEO check; manual test of toggle-then-navigate-then-back.

---

### Pitfall 8: Brownfield URL loss — old shipper pages 404, inbound link equity vaporizes

**What goes wrong:**
The current site has indexed URLs like `/services`, `/fleet`, `/about`, `/contact`, `/drive-with-us`. Drop the shipper pages (`/services`, `/fleet`) without 301 redirects and any inbound link, citation, or cached search result returns 404. Worse: the `/drive-with-us` URL is what drivers have bookmarked and what FMCSA / GMB / driver-job aggregators may link to.

**Why it happens:**
- "Greenfield rebuild" framing in PROJECT.md is correct strategically but it tempts the team to ignore the old URL inventory.
- Nobody runs a crawl of the old site to inventory URLs before cutover.
- No-cost 301 redirects are easy to forget when the focus is on launching the new content.

**How to avoid:**
1. **Pre-cutover URL inventory.** Run `wget --spider --recursive` or use Screaming Frog (free up to 500 URLs) on the current `a2clogistics.com` to capture every indexed path. Cross-check with Google Search Console → Indexing → Pages.
2. **Redirect map** in the Next.js / Astro config or `_redirects` file (Netlify) / `_redirects` (Cloudflare Pages):
   - `/services` → `/` (or a "for shippers" page if you decide to retain a shipper contact page; otherwise homepage with a polite "we don't list shipper services here, contact us" line)
   - `/fleet` → `/` (same)
   - `/drive-with-us` → `/apply` or `/drive` (the new equivalent)
   - `/drive-with-us#apply` → `/apply` (anchor preservation if possible)
   - `/about` → `/about` or `/story` (preserve or consolidate)
   - `/contact` → `/contact` (preserve)
3. **301, not 302** — link equity transfers only on permanent redirects.
4. **External inventory:** GMB listing, FMCSA SAFER profile, any driver-job aggregator listings (Indeed, Trucking Truth, AllTruckJobs, CDLLife), social profiles (LinkedIn, Facebook, IG bio), email signatures. Update each at launch.
5. **404 monitoring post-launch** — Google Search Console → Coverage → Not found. Anything that shows up in week 1 needs a redirect added.
6. **Sitemap.xml resubmission** — submit new sitemap to GSC at launch + request re-crawl of old high-traffic URLs.

**Warning signs:**
- No URL inventory document exists at the cutover-planning stage.
- Redirect map isn't reviewed by anyone who knows the old site's structure.
- GMB website link still points to the old domain a week after launch.

**Phase to address:**
- **Pre-launch / cutover phase** — URL inventory + redirect map is a launch checklist gate.
- **First week post-launch** — daily 404 monitoring in GSC.

---

### Pitfall 9: Generic stock-photo trucks + "we're a family" copy without substance — instant credibility kill with veteran drivers

**What goes wrong:**
Hero image is a Shutterstock truck that wasn't even in A2C's fleet (wrong make, wrong color, wrong door logo — drivers notice in 2 seconds). Body copy says "Driver-First Culture," "Like Family," "We Care About You" — but doesn't show any specific commitment a driver can verify. Veteran drivers immediately pattern-match this to every mega-carrier marketing site they've seen and bounce.

**Why it happens:**
- Real driver photos take time to collect; stock is fast.
- "Family" language is everywhere in trucking recruiting because it's emotionally resonant — but it's also so overused it's become a negative signal when not backed by specifics.
- Marketing copy gets reviewed for tone, not for "would a 15-year veteran call BS on this?"

**How to avoid:**
1. **No stock truck photos. Period.** If A2C's own fleet photos don't exist yet, use:
   - Driver-submitted photos from current drivers (with permission + photo release).
   - Empty-state copy that acknowledges the gap honestly: *"Driver photos coming soon — we're collecting from the fleet."*
   - Brand-system illustrations / wordmark with motion lines (per the brand book) instead of photography.
2. **Every "we care about drivers" claim must be backed by a specific.** Examples that work:
   - ❌ "Driver-First Culture"
   - ✅ "Direct line to dispatch 24/7 — including the owner's cell after hours."
   - ❌ "Like Family"
   - ✅ "When a truck breaks down, we get you home — not stuck at a Petro for 3 days waiting on parts. Here's how that worked last month for [driver name]."
   - ❌ "We Value Your Experience"
   - ✅ "5+ year drivers start at [specific top of pay band], not the bottom."
3. **Founder face on the homepage and About page** — real photo, real voice. PROJECT.md confirms founder bio/photo is available.
4. **Driver testimonials must include** real first name + last initial, photo, current truck/years with A2C, and a *specific* story (not "great company love driving here"). One real specific story beats five generic quotes. Use what's available, gracefully empty-state the rest.
5. **No "joining our family" CTAs.** Use functional language: "Apply in 60 seconds," "Talk to a recruiter today," "See current pay."

**Warning signs:**
- Hero image has a logo on the door that isn't A2C's.
- Copy review reveals 3+ uses of "family," "team," "we care," without follow-up specifics.
- Testimonials all read like marketing wrote them.
- Founder/owner doesn't appear on the homepage above the fold.

**Phase to address:**
- **Content / copywriting phase** — copy rule documented: every claim has a specific, every photo is real or replaced with brand illustration.
- **Pre-launch content QA** — read the site as a 15-year veteran driver. Anything that wouldn't survive that read gets cut.

---

### Pitfall 10: Mobile form keyboard / autofill broken — drops conversion on the audience that matters most

**What goes wrong:**
Most drivers apply from a phone in the sleeper berth or at a truck stop. Form fields use the wrong `inputmode`/`type` so the iOS/Android keyboard shows the wrong layout (alpha keyboard for phone-number field, no `@` shortcut for email field). Autofill doesn't fire because `autocomplete` attributes are missing. The phone number field validates with a regex that rejects formats with parentheses or dashes that the user typed naturally. CTA "Submit" button is below the keyboard and the page doesn't scroll the active field into view.

**Why it happens:**
- Form components from UI libraries (shadcn, base-ui) work on desktop out of the box; mobile UX is on the implementer.
- Testing happens in Chrome DevTools mobile emulation, not on a real phone with a real keyboard.
- The dev's iPhone doesn't reproduce the Android keyboard quirks.

**How to avoid:**

**Field attributes (every form input must have these):**
- Phone field: `type="tel"`, `inputmode="tel"`, `autocomplete="tel"`, `name="phone"` (so password managers / Apple AutoFill / Google AutoFill recognize it). Don't regex-validate format in the browser — accept anything, normalize server-side.
- Email field: `type="email"`, `inputmode="email"`, `autocomplete="email"`.
- Name field: `type="text"`, `autocomplete="name"` (or `given-name` + `family-name` if split).
- ZIP / state field: `inputmode="numeric"` for ZIP, `autocomplete="postal-code"`.
- Years experience: `<select>` is fine; if free input, `inputmode="numeric"`.

**Layout:**
- Sticky CTA at bottom that doesn't get covered by keyboard (use `env(safe-area-inset-bottom)` and test on iOS).
- `scroll-padding-bottom` on the form container so the active field is never under the keyboard.
- Tap targets ≥ 44×44 px (WCAG / iOS HIG).
- Native `<select>` (not a custom JS-rendered combobox) for CDL class / experience / state — drivers know how to use the OS native picker; custom comboboxes are slower and break on older Android.

**Click-to-call alternative:**
- Sticky "Call a recruiter: (XXX) XXX-XXXX" button alongside the apply CTA on every page. PROJECT.md notes "drivers convert by phone/text more often than web form." A `tel:` link is non-negotiable. Same for an SMS shortcut: `sms:+15551234567?body=I'm%20interested%20in%20driving%20for%20A2C`.
- Apply form success page surfaces the recruiter phone number prominently — driver can call right then if they want.

**Testing:**
- Real-device testing on at least: iPhone (Safari), Android (Chrome), Android (Samsung Internet — common on truck-stop hotspots and prepaid Android phones).
- Test with VoiceOver / TalkBack for AA accessibility (REQ-SITE-05).

**Warning signs:**
- Phone field shows alpha keyboard on mobile.
- Autofill doesn't populate name/email/phone from the OS-saved profile.
- Submit button hidden by keyboard.
- Custom `<select>` replacement that flickers or has tap-target issues on Android.

**Phase to address:**
- **Form UI build phase** — input attributes are baked into the form component, enforced via lint rule or component-level test.
- **Pre-launch device QA** — on-device test on iPhone and Android.

---

### Pitfall 11: Confusing "joining A2C" vs. "joining the ecosystem" — driver applies thinking they're applying to LTTR or DP

**What goes wrong:**
Driver lands on the Family page, sees LTTR (repair shop), DP (independent dispatch), OTTS (YouTube), gets excited about the "ecosystem" pitch, hits the apply CTA, fills out the form — and *thinks they're applying to drive for one of the sister brands.* Or thinks they're applying to "the ecosystem" generally and will be shopped around. Or — worse — applies thinking they're being onboarded as an OO with DP dispatch when in fact they're applying to A2C as an OO with A2C dispatch.

**Why it happens:**
- Ecosystem messaging is genuinely the differentiator and gets prominent placement.
- Sister-brand visual presence on the page can blur "this is who you'd be working with" vs. "this is the larger ecosystem."
- Apply CTA copy doesn't specify *what* they're applying to.

**How to avoid:**
1. **Apply CTA copy is always concrete and brand-specific:** "Apply to drive for A2C Logistics" — never "Join the family" or "Apply to the ecosystem."
2. **Form header restates the brand:** "Driver Application — A2C Logistics CO."
3. **On the Family page, frame the ecosystem as *value to the A2C driver*, not as alternative employers:**
   - ✅ "When you drive for A2C, you also get access to LTTR for repair, DP for owner-op dispatch overflow, OTTS for industry content."
   - ❌ "Meet the family — LTTR, LTS, DP, OTTS, A2C — find your fit."
4. **Sister-brand cards link to their sites with explicit "external" indicator** (icon, target=_blank, rel=noopener) — visually distinct from internal navigation.
5. **"Coming soon" sister-brand placeholders** must say *what's coming and roughly when*, or be omitted entirely. Half-finished pages signal that A2C itself is half-finished. PROJECT.md REQ-ECO-02 acknowledges placeholder option — pick one rule and stick to it (recommend: omit if not launchable; include only with a clear "in development, here's what it'll be" line).
6. **Success page ("we got your app") clarifies:** "Your application went to A2C Logistics CO.'s recruiting team. They'll reach out within 24 hours."

**Warning signs:**
- Apply CTA uses ecosystem/family language.
- Family page is more prominent than the A2C-specific story.
- Sister-brand cards look identical in weight/styling to A2C content.
- "Coming soon" placeholders with no detail.

**Phase to address:**
- **Information architecture phase** — A2C-as-employer hierarchy locked; ecosystem framed as benefit-of-A2C.
- **Content phase** — copy rule: every CTA names "A2C."
- **Pre-launch QA** — read the apply funnel cold; can a tired driver tell who they're applying to in under 5 seconds?

---

### Pitfall 12: Multi-step or multi-page apply form — bounce rate spikes and the "quick" promise is broken

**What goes wrong:**
Form gets split into multiple steps ("Step 1 of 3"), or each field gets its own screen ("typeform-style"), or hidden fields expand on focus revealing more questions. Driver who came in expecting "quick apply" feels trapped, abandons partway. A2C captures partial leads which they then awkwardly try to re-engage by text, blowing back through Pitfall 4 (TCPA exposure on cold partial leads).

**Why it happens:**
- Designers like multi-step because it feels less overwhelming per screen.
- Marketing wants more fields than the conversion target supports, so they hide them in step 2 to "not scare people."
- Typeform aesthetic is in fashion — but it adds time, not removes it, for a driver in a hurry.

**How to avoid:**
1. **Single page, single screen, all fields visible.** PROJECT.md REQ-FUNNEL-01 caps at 6 fields — that fits on one mobile screen above-the-fold or with one scroll. Don't split it.
2. **Progress indicators are for forms with 3+ steps.** A 6-field one-screen form doesn't need one. Adding one signals more friction than there is.
3. **No "would you like to tell us more?" expand-on-focus fields.** Optional fields are visible from the start, marked optional, or omitted.
4. **Conversion target: < 60 seconds from CTA-tap to submit-success.** Time it on a real device.
5. **If the team feels the urge to add more fields, add them to the recruiter's *follow-up call script* instead.** The whole point of the model in PROJECT.md (Out of Scope: full DOT app) is that the recruiter conversation is where richer info gets collected.

**Warning signs:**
- Designs show "Step 1 of N" or carousel-style apply.
- Field count creeps from 6 toward 10+.
- "Just one more question" fields appear in design reviews.

**Phase to address:**
- **Form design phase** — six-field cap is a hard constraint, written into the spec.
- **Pre-launch QA** — time the apply on a real phone end-to-end.

---

### Pitfall 13: Web fonts (Nevis Bold + Avenir) cause CLS / FOIT / licensing footgun

**What goes wrong:**
Three failure modes from one decision area:
- **CLS (Cumulative Layout Shift)**: Nevis Bold loads after first paint; the headline reflows from the system fallback to the brand font, shifting layout. CLS score tanks → REQ-SITE-04 (no CLS jank) violated → mobile Core Web Vitals fail → SEO penalty.
- **FOIT (Flash of Invisible Text)**: With `font-display: block` (the default in some setups), text is invisible until the font loads. On 4G truck-stop wifi this is 1–2 seconds of blank hero — driver thinks the site is broken.
- **Licensing**: Nevis Bold is a commercial font (PROJECT.md flags this). Self-hosting without a webfont license violates the EULA. Some weights/cuts have separate web licenses.

**Why it happens:**
- Default Next.js `next/font` setup handles a lot of this for Google Fonts but *self-hosted commercial fonts require manual setup*.
- Brand-fidelity pressure pushes to use the exact font even when fallback would be near-identical.
- Licensing is an afterthought ("we'll figure it out at launch").

**How to avoid:**

**Performance:**
1. **Use `font-display: swap`** so text renders immediately in fallback, swaps when brand font loads. Trades FOIT for FOUT (flash of unstyled text) — better on mobile.
2. **Preload the font file** in `<head>` for the headline weight: `<link rel="preload" as="font" type="font/woff2" href="/fonts/Nevis-Bold.woff2" crossorigin>`.
3. **Self-host fonts as woff2** (not woff or ttf). Smaller, faster, broadly supported.
4. **Match fallback metrics** with `size-adjust`, `ascent-override`, `descent-override`, `line-gap-override` in `@font-face` declarations so the system fallback occupies the same vertical space as Nevis. Eliminates CLS on font swap.
5. **Subset the font** — only ship the glyphs you actually use (Latin, numerals, the few punctuation marks needed).
6. **Test with throttled network** in DevTools (Slow 3G) to actually feel the load.

**Licensing:**
1. **Get the web license for Nevis Bold before build.** Document the license terms (allowed domains, page-view limits, self-host vs. CDN-only).
2. **If web license is unobtainable or too expensive,** pick a near-equivalent (e.g., a similar geometric/industrial sans available on Google Fonts or via a SIL OFL license) and update the brand book footnote acknowledging the substitution.
3. **Avenir** has multiple suppliers (Adobe Fonts, Linotype/Monotype) with different web-use terms. Adobe Fonts is usually the cleanest path if A2C has a CC subscription.

**Warning signs:**
- No `font-display` declared in CSS.
- CLS > 0.1 in Lighthouse (target: < 0.1 for "good" CWV).
- Hero text visibly shifts/swaps after page load on a real phone.
- "We'll just use the desktop font file" without a web license check.

**Phase to address:**
- **Brand asset / setup phase** — license sourced before build starts.
- **Build phase** — fallback metric overrides and preload baked into the font setup.
- **Pre-launch QA** — Lighthouse mobile score with CLS < 0.1; throttled-network manual test.

---

### Pitfall 14: Framer-motion bundle bloat tanks INP / mobile performance on the audience that matters

**What goes wrong:**
The existing site uses framer-motion heavily (`PageTransition`, `ScrollReveal` wrap most sections). Carried over to the new site, framer-motion adds 30–60 KB gzipped to the main bundle, executes on every scroll, and pushes INP (Interaction to Next Paint) over the 200ms "good" threshold on mid-range Android phones. REQ-SITE-04 (LCP < 2.5s on 4G) is also at risk because animation libs delay TTI.

**Why it happens:**
- Salvage-pressure: existing components work and look nice on dev's MacBook.
- Animations feel premium; cutting them feels like cheaping out.
- Performance impact only shows up on real devices on real networks, which dev rarely tests on.

**How to avoid:**
1. **Default to CSS animations + the IntersectionObserver API** for scroll reveals. ~0 KB overhead, native performance.
2. **If framer-motion is retained**, lazy-load it (`next/dynamic` with `ssr: false` for the wrapper component) so it doesn't block initial paint.
3. **Animate transform + opacity only.** No layout-affecting animations (height, width, top — these trigger reflows on scroll and crater INP).
4. **`prefers-reduced-motion` honored everywhere.** Both for accessibility (REQ-SITE-05) and because it's a no-cost performance escape valve for low-power devices.
5. **Bundle budget**: set a CI gate at 150 KB JS gzipped on first load. If a PR breaks it, the PR justifies the bloat or removes it.
6. **Don't carry over the existing site's `<PageTransition>` / `<ScrollReveal>` blindly.** Audit each — does this section actually need motion? Most don't.

**Warning signs:**
- Lighthouse INP > 200ms on mobile.
- First-load JS > 200 KB gzipped.
- Animations feel janky on a 3-year-old Android.
- `prefers-reduced-motion` doesn't disable scroll animations.

**Phase to address:**
- **Component architecture phase** — decision on motion library + bundle budget set before components are built.
- **Pre-launch QA** — Lighthouse mobile run; real-device test on a low-end Android.
- **CI gate** — bundle-size check on each PR.

---

### Pitfall 15: Apply success / thank-you page indexed by search engines (or, conversely, real apply form *not* indexed)

**What goes wrong:**
Two opposite failures:
- **Thank-you page indexed**: Google crawls and indexes `/apply/success` because it's linked from the form action. Driver Googling "a2c logistics" sees "Application Submitted!" as a top result → bizarre, broken first impression.
- **Apply page de-indexed**: A blanket `noindex` on form-related pages catches the apply form itself, so Google doesn't surface "apply for A2C" queries.
- **Privacy policy / terms pages indexed but ranked above the homepage** for brand queries because they're keyword-dense.

**Why it happens:**
- Default behavior is "index everything"; teams forget to noindex success states.
- Reactive fix is "noindex /apply/*" which catches too much.
- Privacy/terms pages get long/keyword-heavy and outrank thinner pages.

**How to avoid:**
1. **`noindex` for: apply success page, any "thank you" page, privacy policy, terms, 404, draft/preview routes.** Implementation: `<meta name="robots" content="noindex, follow">` (follow so link equity from these pages still flows).
2. **Index: homepage, story/about, pay (both variants), family, apply form itself, sister-brand pages if present.**
3. **Sitemap.xml** — explicitly lists what should be indexed; doesn't list noindexed URLs.
4. **`robots.txt`** — disallows form-handler endpoints (`/api/apply` etc.) and any preview deploy URLs (Cloudflare Pages preview URLs, Netlify deploy previews — these often leak into search if not blocked).
5. **Cloudflare Pages / Netlify deploy previews**: these get unique URLs that Google can crawl if linked from anywhere. Set them to `X-Robots-Tag: noindex` via the platform's headers config so accidental indexing of staging is impossible.
6. **Google Search Console post-launch audit** — week 1: review what's indexed, fix anything weird.

**Warning signs:**
- Search "A2C logistics" returns a thank-you page.
- Search "A2C logistics" returns a `*.pages.dev` or `*.netlify.app` URL.
- Search Console → Indexing → Pages shows the apply success URL as indexed.

**Phase to address:**
- **SEO setup phase** — robots config + per-page meta robots decided up front.
- **Pre-launch QA** — Search Console URL inspector run on key URLs; staging URLs verified `noindex`.
- **Post-launch monitoring** — weekly Search Console for first month.

---

### Pitfall 16: Spammy city/state SEO pages — thin content templated → manual action / ranking penalty

**What goes wrong:**
Tempted to chase "owner operator jobs [Iowa | Kansas | Missouri | Texas | Nebraska...]" rankings, the team templates 50 city pages with the same body content + a city-name swap. Google's helpful-content updates (rolling since 2022, intensifying through 2024–2025) penalize this hard — the ranking lift is short-lived, the penalty is long-term, and recovery requires removing the pages.

**Why it happens:**
- City-page templates are a known short-term ranking trick.
- Trucking-recruiting competitors do it; "they do it" is taken as permission.
- The team forgets that A2C's audience is national OTR drivers — geographic targeting is mostly irrelevant beyond Lincoln/Nebraska.

**How to avoid:**
1. **One Lincoln/Nebraska page** with substantive Lincoln-specific content (yard location, in-person recruiter availability, local context). Maybe one Nebraska / Midwest regional page if substantive.
2. **No templated city pages.** Instead, rank on the value: "owner operator pay transparency," "lease-on with a small fleet," "[founder name] A2C Logistics" — queries where A2C's content actually answers the question.
3. **Long-tail rich content > many thin pages.** One detailed pay page that ranks for 50 long-tail queries beats 50 city pages that rank for nothing.
4. **JobPosting schema can have `jobLocation`** — use it to surface in regional Google for Jobs results without spawning thin pages.
5. **If geographic expansion ever needs dedicated pages,** each must have unique substantive content (driver testimonials from that region, lanes A2C runs there, terminal info) — never templated swap.

**Warning signs:**
- Anyone proposes auto-generating city pages.
- A page exists whose only difference from another is a city name in the H1.
- Search Console shows a page indexed but with zero impressions over 30 days.

**Phase to address:**
- **SEO strategy phase** — content philosophy locked: depth > breadth.
- **Content phase** — every page has a unique value angle.

---

### Pitfall 17: Privacy policy is a generic template that doesn't mention SMS, recruiter contact, or driver-employment context

**What goes wrong:**
Default privacy policy generators produce a generic web-app document. It doesn't mention: SMS opt-in/out under TCPA, employment-application data handling, retention period for non-hired-driver data, that data may be shared with a future ATS, that A2C will not pull MVR/background without separate written disclosure. A driver complaint or a state AG inquiry surfaces the gap; the cleanup costs more than doing it right first.

**Why it happens:**
- Generators are free; lawyers cost money.
- "We'll fix the privacy policy later" is the universal startup pattern.
- Nobody on the dev team is qualified to write the employment-context provisions.

**How to avoid:**
1. **Privacy policy must address (at minimum):**
   - What's collected on the apply form (the 6 specific fields, plus consent text version + timestamp + IP).
   - How it's used (recruiter contact about driving opportunities; aggregation for fleet planning).
   - Who it's shared with (recruiting team; future ATS if applicable; never sold to third parties).
   - SMS handling (TCPA consent, opt-out, frequency).
   - Retention period (recommend: 24 months for non-hired applicants, with deletion-on-request honored within 30 days).
   - Data subject rights (CCPA for California applicants — disclosure, deletion, no-sale; similar for CO, VA, CT, UT, IA, OR, TX, MT, IN, TN, FL, etc., as state laws expand).
   - That A2C does not pull MVR or background checks via the website, only after recruiter contact and with separate disclosure.
   - Contact for privacy questions (an actual email address that's monitored).
2. **CCPA "Do Not Sell or Share My Personal Information" link** in the footer if A2C does any retargeting/ad-tracking — even Meta Pixel triggers this for some interpretations.
3. **Cookie consent banner** if any non-essential analytics/tracking is in use. Plausible / Umami / Fathom (mentioned in REQ-OPS-03) are cookieless and may avoid the banner requirement — pick one of those to keep things simple.
4. **Get the policy reviewed by counsel** alongside the form fields and consent block (one legal-review session covers all three).
5. **Version and date the policy** at the top; keep prior versions accessible (link to "previous versions" page).

**Warning signs:**
- Privacy policy was generated in 5 minutes from a free template.
- No retention policy stated.
- No SMS section.
- No mention of FCRA / employment context.
- Footer doesn't have a privacy link or it 404s.

**Phase to address:**
- **Compliance phase / pre-launch counsel review** — single legal session covers privacy, terms, consent block, form fields.
- **Pre-launch QA** — privacy policy linked from footer + apply form; not noindex-blocked from being readable; date current.

---

### Pitfall 18: Lead spreadsheet becomes a PII landmine — no retention policy, shared too broadly, no encryption, no audit trail

**What goes wrong:**
Google Sheet with hundreds of leads (name, phone, email, location, "anything else?" free text that may contain sensitive info) is shared "view-only with link" because it was easier than per-user invites. Sheet gets indexed by Google (yes, Google Sheets shared "anyone with link" are crawlable in some configurations). Or a former recruiter retains access after leaving. Or an applicant requests deletion under CCPA and there's no process to find and remove their row.

**Why it happens:**
- Sheets are easy and recruiters love them.
- Sharing settings are sticky — "view-only with link" once becomes the default forever.
- No one assigned data ownership for the sheet.

**How to avoid:**
1. **Per-user access**, not link-sharing. Audit log on access changes (Google Workspace admin → audit logs).
2. **Retention policy**: 24 months for non-hired applicants. Set up a quarterly process (calendared task) to delete rows older than that. Or move them to a cold archive sheet.
3. **Deletion workflow**: a documented process for "applicant requested deletion" — find row, delete, confirm, log the deletion (with timestamp + who did it, no PII in the log).
4. **Limit the free-text field** in the form to a character cap (e.g., 500 chars) so people don't paste their whole resume + SSN.
5. **Sheet/Airtable not indexed**: confirm the "anyone with link" setting is OFF and no public link exists. Periodic check.
6. **At-rest encryption**: Google Workspace + Airtable both provide this by default; just don't store leads in a downloaded CSV on someone's laptop.
7. **In-transit**: form handler → sink must be HTTPS (default for Google Sheets API and Airtable API; just don't accidentally proxy through a non-HTTPS endpoint).
8. **Plan for ATS migration**: when REQ-FUNNEL eventually graduates to Tenstreet/DriverReach, the sheet's leads need to either migrate or be archived/deleted — don't leave them as orphan PII.

**Warning signs:**
- Sheet share settings include "anyone with link can view."
- No quarterly delete-old-leads task on anyone's calendar.
- More than 5 people have access; no one knows why.
- A Google search for "site:docs.google.com a2clogistics" returns hits (run this monthly).

**Phase to address:**
- **Form integration phase** — sheet/Airtable setup includes access policy and retention policy from day one.
- **Operations handoff (post-launch)** — quarterly retention task on the recruiting calendar.
- **Annual audit** — who has access, when was the last deletion run.

---

### Pitfall 19: Old-site copy bleeds into new tone (mixed-audience / shipper voice in driver-only content)

**What goes wrong:**
Salvageable copy from `About.jsx` ("In an industry where drivers are often treated as replaceable, A2C Logistics stands apart") is genuinely good — but other copy from the existing pages talks about "your freight" and "your shipments" (shipper-facing). In the rebuild rush, some of that voice slips into driver-facing pages. Result: a driver reads "we treat your freight like it's our own" on a driver page and the cognitive dissonance kills trust ("wait, they think *I'm* a shipper?").

Specifically observed in the existing `DriveWithUs.jsx`:
- "Top-of-market compensation packages" — vague, generic, fails Pitfall 1 + Pitfall 3 above.
- "We understand life off the road matters too. Consistent home time you can count on." — generic; needs specifics.
- "Career growth — opportunities to grow within the ecosystem" — only meaningful if backed by concrete examples.
- The values labeled "Accountability / Responsiveness" use *shipper-voice framing* ("treats your freight like their own") even when the page is about driving — that copy's audience is mixed.

**Why it happens:**
- Wholesale rebuild but partial-copy salvage = the salvaged pieces carry their original framing.
- "Driver-First Culture" is salvageable; "treats your freight like their own" reads as shipper-targeted even though it's adjacent.
- Reviewers focus on tone/grammar, not on "who is this sentence written *to*?"

**How to avoid:**
1. **Audience-tag every copy block during salvage.** For each sentence: who is this written *to*? If "shipper" or "either," rewrite or cut.
2. **Three-column copy review**:
   - Sentence
   - Audience (driver-OO / driver-company / both / shipper / either)
   - Specifics (does this make a verifiable claim or is it generic?)
3. **From the existing About.jsx, salvage these threads** (they're driver-targeted):
   - "Built by drivers, for drivers."
   - "In an industry where drivers are often treated as replaceable, A2C Logistics stands apart."
   - "Built by operators who know what it's like behind the wheel."
   - "Real support, honest communication, treats you like a professional."
4. **From the existing About.jsx, rewrite or replace**:
   - "Accountability — every load, every mile, every outcome" — *who* is this for? If for drivers, reframe as "we don't lose loads, we don't lose your time"; if for shippers, drop entirely.
   - "Responsiveness — treats your freight like their own" — shipper voice, drop or rewrite.
   - "Driver-First Culture — better drivers mean better service" — the second clause is shipper-justified ("better service for shippers"). Cut the second clause; let driver-first stand on its own.
5. **From DriveWithUs.jsx, treat the entire copy as a starting outline, not source-of-truth copy.** Every "competitive pay" / "career growth" line needs replacement with specifics (per Pitfall 1, 9).

**Warning signs:**
- A draft page contains the words "freight," "loads we move," "shippers," "customers."
- A line like "we treat X like our own" — usually a shipper-voice tell.
- "Industry-leading," "competitive," "top of market" — anywhere — is a vague-claim red flag.

**Phase to address:**
- **Content audit phase (early)** — every salvaged sentence audience-tagged.
- **Copy review (pre-launch)** — read each page as the intended audience: would an OO driver read this and feel it's for them?

---

### Pitfall 20: GMB / FMCSA SAFER profile / driver-job aggregator URLs not updated at launch

**What goes wrong:**
New site goes live. Google My Business still links to the old site. FMCSA SAFER public profile (if it has a website field for the carrier) still shows the old URL. Indeed/Trucking Truth/AllTruckJobs/CDLLife listings link to old `/drive-with-us` URLs that 404 (if redirects weren't done — see Pitfall 8) or to the wrong page. Driver Googling "A2C logistics" sees the new site at the top organic spot but the GMB knowledge panel on the right links to the old site. Multiple inconsistent paths into the funnel = lost leads + brand confusion.

**Why it happens:**
- "Launch the site" feels complete; external profile updates are a separate workstream often forgotten.
- No single owner for "external listings."
- GMB updates can take 24–72 hours to reflect; team thinks they did it but it didn't propagate.

**How to avoid:**
1. **External-listings inventory** before launch:
   - Google My Business (website + phone + hours)
   - FMCSA SAFER public profile (carrier info — if there's a website field)
   - Indeed company page
   - Trucking Truth carrier listing
   - AllTruckJobs / CDL Life / Drive-My-Way / similar
   - LinkedIn company page
   - Facebook page
   - Instagram bio link
   - Any state DOT / business registry that has a public website field
   - Email signatures for the recruiting team
2. **Launch checklist task**: each listing is updated *the same day* as the new site goes live. Verify each within 72 hours.
3. **NAP consistency** (Name / Address / Phone) — same exact format everywhere. Helps local SEO.
4. **GMB "post" or update at launch** announcing the new site — small SEO signal + tells Google to recrawl.

**Warning signs:**
- No external-listings owner identified.
- GMB knowledge panel shows old URL a week post-launch.
- Email signatures still link to old domain.

**Phase to address:**
- **Pre-launch / cutover phase** — external-listings inventory + update plan.
- **Launch day** — listings updated.
- **Week 1 post-launch** — verification pass.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Single sink (just email or just sheet, not both) | Faster initial integration | Silent lead loss when the one sink fails — catastrophic for a single-conversion-goal site | Never. Two sinks + alerting from launch. |
| Inline pay numbers in JSX (not MDX) | Faster prototype | Updates require dev intervention; numbers go stale; no version history; no `effective` date | Only during early prototyping; refactor to MDX before content phase ends. |
| Custom `<select>` / combobox component | Visual brand consistency | Mobile UX bugs, accessibility issues, slower than native | Never for the apply form; OK for non-critical UI elsewhere if a11y-tested. |
| Skip privacy policy until "we get traffic" | Faster launch | Legal exposure from day one; CCPA violations are statutory | Never — privacy policy is a launch gate. |
| Stock truck photos for launch, "we'll replace later" | Visual completeness on day one | Veteran drivers bounce in week one; trust never recovers from first impression | Never; use brand illustrations or empty-state copy instead. |
| Single `/pay` URL for both OO and company | Simpler IA | SEO loss on the more specific queries; UX confusion | Never — split URLs from the start. |
| Vercel-style preview deploys publicly accessible | Easy stakeholder review | Search-indexed staging URLs leak into Google | Never — `X-Robots-Tag: noindex` on all preview environments. |
| Skipping Turnstile because "we'll add it if spam happens" | One less integration to wire | Spam appears within 48 hours; recruiter inbox is a wasteland by week one | Never — ship spam protection at launch. |
| Auto-generated city pages for SEO | Short-term ranking lift | Helpful-content penalty; long-term SERP exclusion | Never. |
| Date-of-birth field on apply form for "fleet eligibility" | Slight pre-qualification efficiency | EEOC age-discrimination risk; drivers notice | Never — handle at recruiter conversation or DOT app stage. |
| Storing form leads in plain CSV / on a laptop | Easy backup | PII exposure; no audit; no deletion path | Never — use a managed sink with access controls. |
| No 301 redirects from old shipper URLs ("we don't care about shipper traffic") | Less mapping work | Lost link equity from any inbound link to old URLs | Never — 301 to homepage or relevant new page is one-line config. |
| Skipping `prefers-reduced-motion` ("most users don't set it") | Faster animation work | Accessibility violation (REQ-SITE-05); also a perf escape valve missed | Never — it's two CSS lines. |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| **Google Sheets API** | OAuth token expiration not handled; service-account quota silently hit; column added in UI breaks the API write | Use a service account (not personal OAuth); column-mapping by header name (not index); write to a "raw" tab and have humans curate a "leads" tab so column changes don't break ingestion; monitor quota |
| **Airtable API** | Rate limit (5 req/sec/base) hit during launch traffic burst; field-type mismatch silently truncates data | Buffer + batch writes; use Airtable "long text" for the free-text field; use the Airtable Web SDK with built-in retry |
| **Cloudflare Turnstile** | Forgot the server-side verification step (just rendering the widget client-side proves nothing); using sitekey as if it were the secret key | Always verify the Turnstile token server-side in the form handler against `https://challenges.cloudflare.com/turnstile/v0/siteverify` with the secret key; reject submissions with no/invalid token |
| **Email delivery (Resend / Postmark / SendGrid)** | Using a `noreply@a2clogistics.com` from-address without SPF/DKIM/DMARC set up → emails to Gmail go to spam | Set up SPF, DKIM, DMARC for the sending domain; use a real reply-to (recruiter mailbox); test deliverability to Gmail, Outlook, Yahoo, ProtonMail before launch |
| **Twilio / SMS** (if recruiters use it) | A2C number isn't 10DLC-registered → carrier filtering blocks messages | Register the brand + campaign on The Campaign Registry (TCR) before any production SMS volume; include opt-out language in every message |
| **Google for Jobs (JobPosting schema)** | Missing required fields (`title`, `description`, `hiringOrganization`, `jobLocation`, `datePosted`); listing expires (`validThrough`) without renewal | Use Google's Rich Results Test before launch; set `validThrough` to a date that's renewed by a content-update process; include `baseSalary` for pay-transparency state compliance |
| **Plausible / Umami / Fathom analytics** | Choosing one without verifying it captures the funnel events you care about | Define funnel events (apply CTA click, form submit, success page reached) before picking the tool; verify each tool can capture them without cookies if you want to skip the cookie banner |
| **Cloudflare Pages / Netlify edge functions** | Cold start adds 200–500ms to first form submission | Pre-warm if traffic is predictable; or accept the cold start (it's only the first user after idle) |
| **Future ATS (Tenstreet / DriverReach)** | Building the form too tightly coupled to the current sink, forcing rewrite when ATS comes | Adapter pattern — `LeadSink` interface with `EmailSink`, `SheetSink`, `AirtableSink`, future `TenstreetSink` implementations. PROJECT.md already calls this out (REQ-FUNNEL-02 + Constraints) — enforce in code review |
| **Google Search Console** | Not set up until weeks after launch; missing indexing data for the critical first weeks | Verify ownership on the domain *before* launch (DNS TXT record); submit sitemap on launch day |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Hero video / large hero image kills LCP | LCP > 4s on mobile; "loading..." perception | Use a poster image; lazy-load video; or skip video entirely (for this audience, a strong hero image often outperforms video) | Day one — first mobile visit |
| Web fonts cause CLS | Layout shifts when font loads | `font-display: swap` + fallback metric overrides + preload (see Pitfall 13) | Day one — first slow-network visit |
| Framer-motion bundle bloats first-load JS | Lighthouse score < 90; INP > 200ms | Lazy-load motion lib; CSS animations for simple cases; bundle budget CI gate (see Pitfall 14) | Day one — first mobile visit |
| All MDX content imported into one bundle | Large initial JS payload; slow page transitions | Per-route MDX imports; static generation per page (Astro is naturally good here; Next.js App Router needs care) | When MDX content grows past ~50 KB |
| Image optimization missed | LCP fails; bandwidth costs spike on Cloudflare | Use `next/image` (Next) or `<Picture>` with srcset (Astro); always specify width/height to prevent CLS; use AVIF/WebP with JPEG fallback | Day one |
| No CDN caching on form-handler endpoint (or, conversely, caching the *response* by accident) | Either form handler is slow OR (worse) cached responses cause cross-user data bleed | Form handler MUST send `Cache-Control: no-store`; static assets MUST have long cache headers | Day one for form; immediately if cache headers are wrong |
| Sister-brand external logo images not optimized / hot-linked from third parties | Uncontrolled load times; broken if third party changes path | Self-host all sister-brand logos (with brand-team permission); optimize as SVG where possible | When a sister-brand site changes |
| MDX renders heavy components (e.g., embedded YouTube for OTTS) inline on every load | INP suffers; YouTube iframe is heavy | Lite-youtube-embed pattern; lazy-load below-fold iframes | Family page / OTTS section |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Form handler accepts CORS from `*` | CSRF / abuse from any origin | Restrict CORS to the production domain + preview domains; verify `Origin` header server-side |
| Turnstile secret key in client bundle | Public key compromise; bypass | Server-side only; sitekey ≠ secret key; rotate immediately if leaked |
| API tokens (Sheets / Airtable / Resend) committed to git | Lead exfiltration; spam from your domain | Env vars in platform secrets; pre-commit hook scanning for token patterns; rotate on suspicion |
| Form handler returns detailed error messages | Information disclosure (which sink failed, what field was rejected) | Generic user-facing errors; detailed errors logged server-side only |
| Apply form lacks rate limiting | Bot abuse + cost (each submission triggers email + sheet write) | Edge rate-limit by IP (1 submission / 30 sec / IP soft; 5 / minute hard); Turnstile as primary defense |
| PII in logs | Logs are usually less protected than primary stores; PII leaks via log access | Redact phone/email/name from logs; log only IDs and event types |
| Sheet / Airtable shared with departing recruiters | Ex-employees retain access to lead data | Off-boarding checklist removes access; quarterly access audit |
| Privacy policy page allows form input or any user-modifiable content | Stored XSS via privacy contact form | Privacy policy is static MDX; no forms on legal pages |
| Missing CSP header | XSS amplification; third-party script abuse | Set Content-Security-Policy via platform headers config; allowlist Turnstile, analytics, font hosts |
| Missing HSTS / security headers | MITM, clickjacking | `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` set via platform headers |
| Recruiter forwards lead data via personal Gmail | PII handling outside controlled systems | Recruiters work the lead in the sink (sheet/Airtable/ATS); no PII export to personal email |
| Webhook secret shared between environments | Compromise of one environment compromises all | Per-environment secrets; staging Turnstile is the test sitekey, not production |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Sticky header that covers half the screen on mobile | Drivers can't see content; thumb-tap area is the stuck nav, not the CTA | Sticky header ≤ 56px on mobile; CTA inside it tap-friendly |
| Apply CTA color/contrast washes out in sun (truck stop daylight) | Drivers literally can't see the button | High-contrast CTA (A2C red on black or white per brand book); tested in actual daylight on a phone |
| Page transitions that delay navigation | Driver feels site is slow; mistakes loading-anim for broken page | Skip page transitions on mobile; or use the browser's native back/forward and SSR-rendered fast loads |
| Modal apply form (popup) | Mobile keyboard + modal = layout disaster; modal can't be dismissed cleanly | Inline form on a dedicated section / page; never a modal for the primary conversion |
| Auto-playing hero video with sound | Driver in sleeper berth at 2am with phone unmuted = they bounce in anger | Muted by default if video is used; preferably no video |
| Toggle without visual indication of current state | Driver can't tell which side they're seeing | High-contrast active state; selected side has a different background and stronger border |
| "Required" indicator only after submit-error | Driver fills form, hits submit, gets red errors, frustrated | Mark required fields up front; inline validation on blur (not on every keystroke — annoying); accessible error association |
| No "what happens next" on success page | Driver wonders if anything actually happened; may submit again | "A recruiter will text or call within 24 hours. If you'd rather call us first: [phone]." (matches REQ-FUNNEL-04) |
| Phone numbers as text not `tel:` links | Mobile users can't tap-to-call | Every phone number is a `tel:` link |
| External links (sister brands) without `target="_blank"` and visual indicator | Driver navigates away from A2C and doesn't realize it; bounces in confusion | External links open new tab + have a small external-link icon |
| Family/ecosystem section dominates above the fold | Driver thinks the site is *about* the ecosystem, not about A2C | A2C-first hierarchy: hero is A2C; ecosystem is supporting context, not the headline |
| Apply form requires email when phone is the better channel | Drivers have email addresses they don't check | Phone is required; email is optional (or vice versa, but both should not be required if the team accepts phone-only contact) |
| Loading states that look like errors | Spinner with no context = "is it broken?" | Loading state has context: "Submitting your application..." |
| Footer with 30+ links | Looks corporate / enterprise-y; doesn't fit a small driver-first carrier | Lean footer: A2C address, phone, MC#/USDOT#, privacy, terms, sister-brand links, copyright |

---

## "Looks Done But Isn't" Checklist

Things that pass a casual demo but break in production for real users.

**Form & lead capture:**
- [ ] **Form submission:** Often missing end-to-end test that lead lands in *both* sinks — verify by submitting and checking the sheet AND the email AND the alert channel
- [ ] **Form spam protection:** Often Turnstile widget renders but server doesn't verify the token — verify by sending a POST with no token and confirming rejection
- [ ] **Form mobile keyboard:** Often `inputmode` missing on phone field — verify by opening on real iPhone and Android and checking that phone field shows numeric keypad
- [ ] **Apply success page:** Often missing the "what happens next" content (REQ-FUNNEL-04) and the recruiter phone number — verify by submitting and reading the success state
- [ ] **Apply success page indexing:** Often default-indexed — verify with `<meta name="robots" content="noindex">` and Google Search Console URL inspector
- [ ] **Form failure mode:** Often shows "success" even when sink failed — verify by deliberately breaking the sink (revoke API token in staging) and confirming user sees a graceful "we got your info, may take a moment" while ops gets the alert

**Compliance & legal:**
- [ ] **Privacy policy:** Often a generic template missing SMS / FCRA / retention sections — verify counsel review
- [ ] **Consent block:** Often missing version + timestamp capture in the lead row — verify by checking a sample lead row has the consent text version
- [ ] **EEOC fields:** Often a "How did you hear about us?" or "Tell us about yourself" field that drifted into protected-class territory — verify field whitelist
- [ ] **Pay disclosure:** Often homepage hero says "Great pay!" without a number; verify every page mentioning pay has a number/range or links to one within one click

**SEO:**
- [ ] **Sitemap:** Often missing / incomplete / not submitted to Search Console — verify by visiting `/sitemap.xml` and submitting in GSC
- [ ] **JobPosting schema:** Often missing `baseSalary` or required fields — verify with Google Rich Results Test
- [ ] **Robots / preview indexing:** Often Cloudflare Pages preview URL appears in Google — verify `X-Robots-Tag: noindex` on previews
- [ ] **301 redirects from old URLs:** Often missing — verify by curl-ing each old URL and checking for 301 to the right new URL
- [ ] **GMB website link:** Often still old domain — verify post-launch
- [ ] **Open Graph / Twitter Card meta:** Often missing `og:image` (1200x630) — verify with Twitter card validator + Facebook debugger

**Performance:**
- [ ] **Lighthouse mobile:** Often Performance < 90 on mobile — verify with Lighthouse mobile run (target REQ-SITE-04: LCP < 2.5s)
- [ ] **CLS:** Often web fonts cause shift — verify CLS < 0.1
- [ ] **Bundle size:** Often framer-motion / icon library bloats first load — verify first-load JS < 200 KB gzipped
- [ ] **Real-device test:** Often only DevTools-emulated — verify on a real iPhone and a real mid-range Android

**Accessibility:**
- [ ] **Form accessibility:** Often `<label>` not associated with input via `for=`/`id` — verify with axe-core
- [ ] **Keyboard navigation:** Often skip-link missing or focus indicators removed by `outline: none` — verify by tabbing through every page
- [ ] **Color contrast:** Often A2C red on black or red on white fails AA at small sizes — verify with axe-core
- [ ] **`prefers-reduced-motion`:** Often not honored by framer-motion / CSS animations — verify by enabling system reduce-motion and checking animations stop

**Brand & content:**
- [ ] **Stock photos:** Often slipped in — verify by reviewing every image; truck door logos must be A2C
- [ ] **Generic copy:** Often "competitive pay," "industry-leading," "family" used — verify by grepping copy for these phrases
- [ ] **Old-site copy bleed:** Often shipper-voice ("your freight," "your shipments") slips in — verify by audience-tagging every paragraph
- [ ] **Founder face:** Often missing on homepage — verify

**Ops:**
- [ ] **Recruiter access:** Often the lead sink isn't accessible to recruiters on day one — verify recruiter logs in and sees test lead
- [ ] **Recruiter SOP:** Often the "what to do when a lead comes in" doc doesn't exist — verify there's a written SLA (e.g., "respond within 4 business hours")
- [ ] **Synthetic monitoring:** Often missing — verify a daily synthetic submission is running
- [ ] **Alerting:** Often missing — verify ops gets a notification when the form handler errors

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Stale pay number that drivers screenshot | MEDIUM | 1) Update the number on-site immediately. 2) Add `effective` date and "as of" disclosure. 3) Recruiter team gets a script for the "but the website said" call. 4) Internal review of who/how-often updates pay. |
| Protected-class question discovered on form | HIGH | 1) Remove the field within hours. 2) Counsel notified. 3) Audit how long it was live and what data was collected; consider deletion of any responses to that field. 4) Document the decision and review process for future fields. |
| Lead sink silent failure caused lost leads | HIGH | 1) Identify the time window of failure (logs). 2) Check fallback durable store for recoverable leads. 3) Reach out to recovered leads with a "we apologize" message — don't pretend it didn't happen. 4) Add monitoring + alerting that would have caught it. |
| Spam flood of recruiter inbox | LOW-MEDIUM | 1) Add Turnstile if not already present. 2) Add origin check + honeypot. 3) Manually clear the spam from the sheet. 4) Tune scoring so recruiters only see scored-clean leads. |
| 404s from old URLs | LOW | 1) Identify top 404s in Search Console. 2) Add 301 redirects in `_redirects` / config. 3) Resubmit affected URLs in Search Console. |
| Apply success page indexed | LOW | 1) Add `noindex` meta to the success page. 2) Request removal in Search Console. 3) Wait for re-crawl. |
| Mobile form broken on Android | LOW-MEDIUM | 1) Reproduce on a real device. 2) Fix `inputmode` / `autocomplete` / tap-target issues. 3) Add the device to ongoing test rotation. |
| Generic / shipper-voice copy slipped through | LOW | 1) Grep for known phrases ("competitive," "family," "your freight"). 2) Audit each hit. 3) Rewrite. |
| Sister-brand confusion (driver applied thinking they were applying to LTTR) | MEDIUM | 1) Recruiter clarifies during follow-up. 2) Audit Family page + apply CTA copy. 3) Tighten "Apply to A2C Logistics" framing. |
| TCPA complaint from cold-text re-engagement | HIGH | 1) Cease all bulk re-engagement immediately. 2) Counsel notified. 3) Audit consent records. 4) Implement single-channel tracked recruiter line + per-lead consent log. |
| GMB still pointing at old site week after launch | LOW | 1) Re-update via GMB admin. 2) If still not propagating, post a GMB update / new photo to nudge re-crawl. |
| Privacy policy missing or generic | MEDIUM | 1) Take down nothing — just update the policy. 2) Counsel review. 3) Email any applicants from the past N months notifying of update if material (most updates won't require this, but document the decision). |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls. Phases below are typical for a build like this; reorder to match the chosen roadmap.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| 1. Stale pay numbers / point-number screenshot trap | Content (Pay) — schema design | MDX frontmatter has `effective` field; ranges not point numbers; "as of" rendered |
| 2. Protected-class fields on quick-apply | Form schema design + Compliance/legal review | Field whitelist enforced; counsel sign-off on form fields |
| 3. Pay-transparency state law (JobPosting schema missing salary) | SEO + Content (Pay) | Google Rich Results Test passes with `baseSalary` populated |
| 4. TCPA exposure on SMS recruiter contact | Form/consent design + Operations handoff | Consent block reviewed by counsel; recruiter SOP includes opt-out handling |
| 5. Form-handler silent failure | Form integration | Synthetic submission test in CI; alerting wired; durable fallback store present |
| 6. Spam destroying recruiter trust | Form integration | Turnstile + honeypot + origin check + rate limit shipped together |
| 7. OO/Company toggle SEO + UX | Information architecture / routing | Two URLs; per-variant JobPosting schema; toggle persistence tested |
| 8. Brownfield URL loss | Pre-launch / cutover | URL inventory + redirect map; 404 monitoring post-launch |
| 9. Generic photos + "family" copy without substance | Content / copywriting | Copy review rule: every claim has a specific; no stock photos |
| 10. Mobile form keyboard / autofill broken | Form UI build | Real-device test on iPhone + Android |
| 11. Sister-brand confusion | Information architecture + Content | Apply CTA names "A2C"; ecosystem framed as benefit-of-A2C |
| 12. Multi-step / overlong form | Form design (cap at 6 fields) | Spec hard-limit; pre-launch time-test under 60s |
| 13. Web font CLS / FOIT / licensing | Brand asset setup + Build | License confirmed; `font-display: swap`; fallback metric overrides; Lighthouse CLS < 0.1 |
| 14. Framer-motion bundle bloat | Component architecture | Bundle budget CI gate; lazy-load motion lib |
| 15. Apply success page indexed / preview indexed | SEO setup | Per-page `noindex`; preview URLs `X-Robots-Tag: noindex` |
| 16. Spammy city pages | SEO strategy | Content rule: no templated city pages |
| 17. Generic privacy policy | Compliance/legal review | Counsel review; SMS + FCRA + retention sections present |
| 18. Lead spreadsheet PII landmine | Form integration + Operations handoff | Per-user access; quarterly retention task; deletion workflow documented |
| 19. Old-site copy bleed (shipper voice in driver content) | Content audit (early) | Audience-tag every salvaged paragraph; copy review |
| 20. GMB / external listings not updated at launch | Pre-launch / cutover + Launch day | External-listings inventory; updates verified within 72h |

---

## Must-Address-Before-Launch vs. Monitor-Post-Launch

**Hard launch gates (cannot launch without):**
- Pitfalls 2, 4, 17 — compliance review (form fields, consent, privacy policy, TCPA-aware SMS handling). Without counsel sign-off, do not launch.
- Pitfalls 5, 6 — form handler durability (two sinks + alerting + spam protection). Without these, the single conversion goal is unreliable from day one.
- Pitfall 8 — 301 redirects from old URLs. Without these, day-one search traffic 404s.
- Pitfall 13 — font licensing. Without web license, you're shipping in violation.
- Pitfall 9 — no stock truck photos and no "family"-without-specifics copy. Without these cuts, day-one credibility is gone with the audience that matters.
- Pitfall 7 — toggle URL structure. Refactoring after launch is high-risk SEO loss.
- Pitfall 10 — mobile form actually works on real iPhone + real Android.
- Pitfall 15 — apply-success-page noindex + preview-deploy noindex.
- Pitfall 17 — privacy policy live and counsel-reviewed.
- Pitfall 20 — GMB updated launch day.

**Monitor post-launch (week 1–4 priority):**
- Pitfalls 1, 3 — pay numbers stale-check; pay-transparency state-law evolution. Quarterly review.
- Pitfall 6 — spam tuning (daily for first two weeks).
- Pitfall 8 — 404 monitoring in Search Console (daily for first month).
- Pitfall 15 — Search Console index check (weekly first month).
- Pitfall 18 — lead-data retention process kickoff (calendar quarterly task).
- Pitfall 19 — copy audit reads after the team sees real traffic feedback.

**Monitor ongoing (operational discipline):**
- Pitfall 4 — TCPA hygiene as recruiters use the leads.
- Pitfall 5 — synthetic monitoring of the form pipeline.
- Pitfall 17 — privacy policy refresh annually or on material change.
- Pitfall 18 — quarterly retention cleanup; annual access audit.

---

## Sources

**Tooling note:** WebSearch and WebFetch were unavailable during this research session. The pitfalls below are drawn from a combination of: (a) durable industry knowledge of trucking driver-recruiting practices and the FMCSA / EEOC / FCRA / TCPA compliance frameworks (stable through 2025), (b) the project's own PROJECT.md context and existing-codebase audit, (c) Context7 verification of Cloudflare Turnstile React integration. **Compliance content (Pitfalls 2, 3, 4, 17) reflects long-standing federal guidance and is directionally reliable, but counsel review before launch is mandatory — pay-transparency state laws and TCPA rulemaking have shifted enough through 2024–2025 that anything specific should be confirmed against current state.**

- **Cloudflare Turnstile** — Context7 (`/websites/developers_cloudflare_turnstile`) and `/marsidev/react-turnstile` for React integration details. HIGH confidence.
- **EEOC pre-employment inquiries framework** — Title VII, ADEA (drivers are an explicitly protected age class), ADA, GINA, PDA. Direction stable; specific phrasing requires counsel. MEDIUM confidence.
- **FCRA** — 15 USC §1681b(b)(2)(A) standalone disclosure + authorization requirements for consumer reports including MVR. Project's design (off-site full DOT app + recruiter-led MVR) avoids the trigger; Pitfall 2 prescribes maintaining that boundary. MEDIUM confidence.
- **TCPA** — 47 USC §227, FCC implementing rules. 2024–2025 rulemaking turbulent (one-to-one consent rule vacated by 11th Circuit in early 2025). Treat as conservative. MEDIUM confidence.
- **State pay-transparency laws** — CO (2021), WA (2023), CA (2023), NY (2023), MD (2024), IL (2025) and others. Direction stable (more disclosure, more states); specifics evolve. MEDIUM confidence.
- **FMCSA recruiting-ad rules** — fundamentally an FTC truth-in-advertising overlay applied to motor-carrier recruiting, plus DOT regulations governing the actual hiring/qualification file. Bait-and-switch on pay/lanes/equipment is the classic exposure. MEDIUM confidence.
- **Google Search Central — JobPosting structured data** — `baseSalary` requirements + Google for Jobs eligibility. HIGH confidence on the schema; MEDIUM on its specific role in state-law compliance posture.
- **Google helpful-content updates / E-E-A-T** — basis for the Pitfall 16 anti-pattern on city-page templates. HIGH confidence.
- **Existing codebase audit** — `src/pages/About.jsx` and `src/pages/DriveWithUs.jsx` reviewed in this session; specific copy patterns flagged in Pitfall 19. HIGH confidence on the audit itself.
- **PROJECT.md** — requirements, constraints, decisions context. HIGH confidence (project source-of-truth).

---

*Pitfalls research for: A2C Logistics CO. driver-recruiting site rebuild*
*Researched: 2026-05-04*
