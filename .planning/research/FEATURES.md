# Feature Research

**Domain:** Trucking-carrier driver-recruiting website (audience: experienced owner-operators + W2 company drivers; **no** shippers, **no** new-CDL students)
**Project:** A2C Logistics CO. — Lincoln, NE
**Researched:** 2026-05-04
**Confidence:** MEDIUM-HIGH (direct evidence from major carriers + ATS vendor; lighter sourcing on conversion-rate benchmarks)

---

## Executive Snapshot

The trucking driver-recruiting website is one of the most pattern-locked verticals on the web. Veteran drivers vet 5–15 carrier sites per job switch and expect a near-identical content checklist on every one of them: real pay numbers, real equipment specs, real benefits, real driver photos/quotes, a real phone number, and a short form that hands off to a recruiter who answers fast. **Deviation from those patterns reads as evasion, not innovation.**

Three things matter most:

1. **Pay transparency is the #1 conversion lever for this audience.** Crete Carrier (a Lincoln, NE direct-competitor neighbor) publishes scaled per-mile rates by trip length, fuel-surcharge mechanics, stop pay, detention pay, every owner-op deduction line-item, and equipment specs down to wheelbase and tire size — and is the local benchmark to beat.
2. **The dominant ATS pattern is "two-question lead form on the marketing site → IntelliApp/DriverReach pre-populating long form on the ATS."** Tenstreet acquired DriverReach in March 2025; the two leading ATSes are now one company. A2C's "quick-apply ≤6 fields → Sheet/email → recruiter calls" matches the "lead form" half of this pattern exactly and is a sound MVP.
3. **The OO ↔ Company toggle pattern is uncommon at the page-level (most carriers use separate URLs/sub-sites)** but a well-executed toggle on Pay/Benefits is a genuine differentiator if it actually swaps content rather than just hiding rows. This carries real UX risk: drivers must trust they are seeing the *full* picture for their type, so the toggle state must be loud, persisted, deep-linkable, and have a "switch view" affordance never more than one tap away.

A2C's stated differentiator ("driver-first culture" + ecosystem story) lines up cleanly with what the data says works: founder voice, dispatcher-accessibility narrative, real photos/quotes, transparent numbers. The risk is *executing* on those (real founder bio, named driver testimonials with photos, actual CPM numbers) rather than gesturing at them with stock photography and "we treat you like family" copy — which is the most over-used and counter-productive line on the entire vertical.

---

## Feature Landscape

### Table Stakes (Drivers Expect These — Missing = Site Feels Incomplete or Untrustworthy)

#### Site structure / navigation

| Feature | Why Expected | Complexity | Notes / Dependencies |
|---------|--------------|------------|----------------------|
| Distinct **Owner-Op** path and **Company Driver** path discoverable from the homepage hero | Every major carrier (Crete, Schneider, Maverick) does this with the explicit question "What type of driver are you?" or two parallel CTAs. Drivers self-segment in the first 5 seconds. | LOW | A2C's plan: unified site with toggle. To meet expectation, expose two clear entry CTAs on the hero ("I'm an Owner-Op" / "I'm a Company Driver") that **deep-link** into the toggled state of the Pay/Benefits page. Toggle ≠ hidden — must be a visible top-of-page entry. |
| Persistent **Apply Now** CTA in the header (sticky on mobile) | Universal pattern; most carriers also have a phone number next to it | LOW | Already in REQ-FUNNEL-03. Pair with `tel:` link. |
| Visible **phone number to a recruiter**, prominent in header and footer, click-to-call on mobile | Drivers convert by phone more than by web. Schneider lists "800-44-PRIDE" in the footer; Crete lists 800.998.4095 in the masthead. | LOW | A2C needs a real recruiter line live before launch. |
| Visible **MC# and USDOT#** (footer or About page) | DOT compliance signal; FMCSA SAFER lookup is something owner-ops actually do before applying | LOW | Pull from FMCSA SAFER once. Render in footer. |
| **Clear physical address** (HQ + terminal locations) | Trust signal; "we're a real company" | LOW | A2C: 300 S. Cotner Blvd, Lincoln, NE in footer + Contact page |
| **About / Our Story** page | Universal | LOW | Founder voice angle is differentiator-grade; see below |
| **Pay** page (split or toggled by driver type) | Drivers will not apply without seeing real numbers | MEDIUM | See Pay section below for non-negotiables |
| **Benefits** page (W2-side: health/dental/vision/401k/PTO/bonuses) | Universal for company-driver paths | LOW | MDX-driven |
| **Equipment / Fleet** page (truck + trailer specs) | Veteran drivers read every spec | LOW-MEDIUM | See "Company-driver-specific" below |
| **Home time / route type** page or section (Local / Regional / OTR / Dedicated) | Top question after pay | LOW | A2C: clarify lane mix even if it's "primarily OTR with X% regional" |
| **Apply form** that is short (≤6–10 fields) | Long forms = drop-off. Crete's lead form is 7 fields (FN, LN, Email, Phone, ZIP, Experience, Driver Type). | LOW | Already REQ-FUNNEL-01 |
| **Application success state** with explicit next step ("recruiter will text/call within X hours") | Reduces buyer's remorse and missed-handoff drop-off | LOW | Already REQ-FUNNEL-04 |
| **Contact** page | Universal | LOW | Phone, recruiter email, address, hours |
| **Privacy Policy** + **TCPA / SMS consent language** on the form | Required for collecting phone numbers + sending SMS follow-ups; carriers without this risk TCPA suits | LOW | See Compliance section. **Hard requirement, not optional.** |
| **EEOC-friendly form copy** — no protected-class questions (age, religion, marital, national origin, disability, veteran-as-required-question) | DOT-regulated industry; standard since IntelliApp adapts to Ban-the-Box and Pay-Equity laws automatically | LOW | Already REQ-OPS-01 |

#### Pay-page non-negotiables (drivers compare these line-for-line)

| Element | Why Non-Negotiable | OO / Company / Both | Complexity | Notes |
|---------|-------------------|---------------------|------------|-------|
| **CPM range or actual CPM** for company drivers (e.g., "$0.62–$0.78/mi based on experience and tenure") | #1 question. Hiding it = drivers leave. | Company | LOW | MDX content |
| **Percentage split** for owner-ops (% of gross or % of revenue, e.g., "70–72% of load gross") OR a **per-mile rate by trip length** | OO #1 question. Crete publishes scaled rates: 1–150mi=$1.84, 151–250=$1.64, 251–700=$1.39 etc. | OO | LOW | A2C must publish real numbers per REQ-PAY-02 |
| **Fuel surcharge** mechanics (pegged to DOE national avg? paid on loaded miles only?) | Owner-ops do this math themselves. Vague = "they're hiding it." | OO | LOW | Sentence + table |
| **Fuel discount / fuel card** terms (cents/gal off; truck-stop network) | 25–35% of OO operating cost is fuel | OO | LOW | "Save up to X¢/gal at Pilot Flying J / Love's / TA-Petro via [card name]" |
| **Settlement schedule / pay frequency** (weekly is standard, bi-weekly is a red flag) + **fast-pay / quick-pay** terms (% fee + days) | Cash-flow critical for OOs; W2 drivers want predictability | Both | LOW | "Settled weekly Monday for prior week through Sunday; same-day option for $X" |
| **Sign-on bonus** if any (with payout schedule — e.g., "$2k at 90 days, $3k at 6 months") | Universal company-driver expectation; sign-on with no schedule reads as a lie | Company (sometimes OO) | LOW | If A2C doesn't offer one, **say so explicitly** — "We pay better base CPM instead of a sign-on" beats silence |
| **Detention pay** rate and trigger (e.g., "$X/hr after 2 hours") | Veteran drivers will not work for a carrier without it | Both | LOW | Crete: "guaranteed detention pay after two hours" |
| **Stop-off pay** ($/stop after first/last) | Standard | Both | LOW | Crete: $30/stop, OO; common range $25–$50 |
| **Layover pay** | Standard | Both | LOW | Per night and trigger |
| **Per-diem** treatment (W2: per-diem program available?) | Tax planning | Company | LOW | One-line policy statement |
| **Referral bonus** | Universal recruiting tool ($500–$2k typical) | Both | LOW | One sentence + how to claim |
| **Lease-purchase / truck-purchase program** (if offered) — terms, down payment, weekly cost, walk-away policy | Owner-op consideration; predatory lease-purchase is the most hated thing in trucking, so honest terms = trust signal | OO | MEDIUM | A2C ecosystem opportunity: LTS (truck sales) is a sister brand → a "Buy or lease your truck through LTS" angle is a genuine differentiator |
| **Deductions transparency** (insurance, workers' comp, ELD/comm device, escrow, plates, IFTA, maintenance) | OO settlement statements have many deduction lines; publishing them up front pre-empts the "hidden fees" gripe | OO | LOW | Crete publishes every line item with $ amount and $/wk |
| **Plates / permits / IFTA** support | OOs hate paperwork; "we handle IFTA" is a meaningful sell | OO | LOW | Statement of services + cost |
| **Insurance options** (bobtail, cargo, occupational accident, physical damage) and prices | Required disclosure for OOs | OO | LOW | Crete publishes monthly $ amounts |

#### Trust signals (mandatory)

| Signal | Why Mandatory | Complexity | Notes |
|--------|---------------|------------|-------|
| **Real driver photos** (not stock) — at minimum on testimonial blocks | Drivers see stock photos as "you don't have any real drivers willing to be on your site" | LOW (asset gather) | A2C has some now per PROJECT.md; design must degrade gracefully when only 2–3 are available (don't fake a wall of 12) |
| **Named driver testimonials** with first name + last initial + role + tenure | Anonymous = fake. Crete uses "Gary Tompkins, Crete Carrier Driver" | LOW | Can start with 2–3 |
| **Founder/owner photo + bio + signed/voiced statement** | A2C's chosen lead differentiator. Real face on the homepage destroys "they're just another mega-carrier" objection in one second | LOW | REQ-STORY-02. Photo + 2 paragraphs is enough |
| **MC# and USDOT# visible** | Lets drivers verify on FMCSA SAFER | LOW | Footer |
| **Lincoln, NE address + phone with local area code (402)** | Local-pride signal in the corn belt; Schneider/Crete lean hard on Wisconsin/Nebraska identity | LOW | Already in PROJECT |
| **Years in business / fleet size** | "Why should I trust you?" baseline | LOW | One stat-line on the homepage |
| **Safety record / CSA scores reference** OR "Check our SAFER record" link | Verifiable on FMCSA. Hiding it = scary; pointing to it = transparent | LOW | Link to `safer.fmcsa.dot.gov/CompanyProfile.aspx?USDOT=XXXXXXX` |

#### Mobile patterns (most drivers browse from a phone)

| Pattern | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| `tel:` **click-to-call** on every visible phone number | Universal. Drivers call from sleeper berth more often than they type | LOW | `tel:+14025551234` |
| `sms:` **click-to-text** to recruiter — Schneider does "Text 'Chat' to 28000" | Increasingly the preferred channel for under-45 drivers | LOW-MEDIUM | Need a number that can receive SMS — Twilio/SimpleTexting/short code; cheaper start: `sms:+14025551234?body=Hi%20I'm%20interested%20in%20driving%20for%20A2C` to recruiter mobile |
| **Tap targets ≥ 44×44 px**, large readable type (16px+ body), high contrast | Truck-stop wifi + sleeper-berth lighting + work gloves on phones | LOW | Already REQ-SITE-03 / REQ-SITE-05 |
| **Form usable one-handed** (logical input modes: `inputmode="tel"` for phone, autocomplete attrs) | Quality-of-life | LOW | `<input inputmode="tel" autocomplete="tel">` etc. |
| **Page weight kept low** for 4G / spotty rural cell | Already REQ-SITE-04 (LCP < 2.5s on 4G) | MEDIUM | Image budget enforced; testimonial photos optimized |

---

### Differentiators (Where A2C Can Actually Stand Out)

| Feature | Value Proposition | Complexity | OO / Company / Both | Notes / Dependencies |
|---------|-------------------|------------|---------------------|----------------------|
| **OO ↔ Company toggle** (single Pay/Benefits page that swaps the entire narrative) | Most carriers fork into separate URLs. Done well, the toggle says "we built one site for both of you because the math is just different — same culture." Done poorly, drivers fear they're missing context. | MEDIUM | Both | **Critical UX rules**: (1) toggle state visible at top + persistent in header while on page, (2) URL reflects state (`/pay?type=oo` or `/owner-operator/pay`) so it's deep-linkable + shareable, (3) state persists across pages via cookie/localStorage so a driver who picks "Owner-Op" on the homepage doesn't have to re-toggle on Benefits, (4) "Switch to Company Driver view" link always one tap away, (5) selectable from the homepage hero so it's not a hidden surprise. **Recommended:** treat the toggle as a *segmentation* control, not a *layout* trick. Build it in MDX with two content blocks per concept (`<Pay variant="oo">…</Pay>` `<Pay variant="company">…</Pay>`) so editors don't fight a single matrixed table. |
| **Founder-voice video** (60–90s, founder on camera in front of A2C truck) on About / Story | Real face + real voice + 60 seconds destroys 10 paragraphs of marketing copy | MEDIUM | Both | Depends on founder availability for shoot. OTTS sister brand (YouTube) is the natural production arm — cross-link as ecosystem proof |
| **Founder bio + signed letter ("From the desk of…")** | Same as above but no shoot needed; available *now* per PROJECT.md content readiness | LOW | Both | Ship at launch even if video comes later |
| **"Day in the dispatch office" / "Meet your dispatcher" content** | Direct attack on the #1 driver pain point ("I can't get my dispatcher on the phone"). REQ-STORY-04 already aims here. | LOW-MEDIUM | Both | Photos + named profiles of 2–3 dispatchers > generic "24/7 dispatch" claim |
| **"What happens when…" content** — breakdowns, pay disputes, missed home time | Veteran drivers know things go wrong. The carrier that says how it handles failure earns more trust than the carrier that pretends nothing fails. | LOW | Both | REQ-STORY-04 ground. Three short scenario cards. **Genuine A2C edge:** "If you break down, we own the repair shop (LTTR) — you don't get bounced around" |
| **Ecosystem / "The A2C Family" section** with the four sister brands (LTTR repair, LTS sales, DP dispatch, OTTS YouTube) | Almost no carrier this size has an ecosystem story. Done right, it reframes A2C from "just another mid-size carrier" to "an ecosystem you can grow with." | MEDIUM | Both | REQ-ECO-01/02/03 already aim here. **Risk:** the ecosystem story can dilute the conversion focus if it dominates the homepage. Treat it as a *secondary* trust block (below pay/benefits proof) and a dedicated "Family" page. |
| **Driver-journey diagram** (lightweight version of the brand-book flywheel) on the Family page | Visualizes the ecosystem story; brand book delivers the source asset | MEDIUM | Both | REQ-ECO-03. Build as SVG (not an image) for accessibility + retina + dark variants |
| **Pay calculator / "Know Your Pay" tool** for owner-ops (input miles/wk, lane, trailer type → est. weekly take-home) | Crete has one. Nothing converts a skeptical OO faster than running their own numbers on the carrier's own page. | MEDIUM-HIGH | OO | Depends on REQ-PAY-02 numbers being final. Can ship as v1.x after launch. Pure client-side computation — no backend |
| **Lane / dedicated-route map** showing where A2C runs | OOs/Company drivers want to know if A2C runs the lanes they want | MEDIUM | Both | Static SVG of US with primary lanes highlighted is enough; full interactive optional |
| **Apply-by-text** (driver texts a keyword to a number, recruiter replies) | Schneider does it. Lower-friction than a form for some drivers. | MEDIUM | Both | Keyword-rented short code or 10DLC long-code via Twilio. **Defer to v1.x** — start with `sms:` link |
| **"Repair partner" callout — LTTR in-house** | Every other mid-size carrier ships their breakdowns to a third party. A2C owns the shop. **This is a genuine, defensible differentiator no marketing-speak can fake.** | LOW | Both | One section on Equipment page + a callout in the "What happens when" content |
| **Spanish-language pay/benefits page or toggle** | ATA estimates 18–25% of US truckers are Hispanic/Latino; Spanish-language site doubles addressable Hispanic OO pool for many carriers | MEDIUM-HIGH | Both | **Defer to v1.x** unless A2C already has a Spanish-fluent recruiter to handle leads. Worse than not offering it = offering it but not staffing it |
| **Veteran / military-friendly badge + content** (Skillbridge, GI Bill apprenticeship, etc.) | Crete + Schneider both do this; veteran community is a known high-quality OO/company recruiting pool | LOW-MEDIUM | Both | Defer unless A2C is actually pursuing this — fake commitment is worse than silence |
| **OTTS YouTube cross-embed** ("Day in the life with A2C" via OTTS) on homepage / Story page | Drivers already watch trucking YouTube; converts the OTTS audience that doesn't yet know A2C | LOW | Both | iframe embed; depends on OTTS having relevant content (PROJECT says ⏳) |
| **Real photos of YOUR equipment** (the actual A2C trucks, not the manufacturer's marketing photo) | Equipment specs page with photos of A2C-spec'd Cascadias is a credibility multiplier | LOW (photo shoot) | Both | One half-day photo shoot at the Lincoln yard |
| **SEO landing pages by location** ("Trucking jobs Omaha", "Owner operator jobs Nebraska", "OTR driving jobs Lincoln NE") | REQ-SITE-01 already aims at this; templated city/state pages with shared core content + locale-specific intro | MEDIUM | Both | **Risk:** thin / duplicate content that Google penalizes. Mitigation: each page must have at least one paragraph of genuinely unique content (e.g., for Omaha: "We dispatch out of Lincoln but run regular lanes through the Omaha–Council Bluffs corridor; you can flex home time around either metro"). Cap at 5–10 pages, not 50. |

---

### Anti-Features (Deliberately Don't Build — With Reasons)

| Anti-Feature | Why It Seems Good | Why Problematic | What to Do Instead |
|--------------|-------------------|-----------------|---------------------|
| **Stock-photo trucks and stock-photo "happy driver"** | "We need imagery and we don't have shots yet" | Veteran drivers can spot stock in 1 second; reads as "they don't have real drivers" | Photograph **A2C trucks at the Lincoln yard** (one half-day shoot) and **2–3 real driver portraits** at minimum. Until shoot, use *no* hero photo (clean type-driven hero) rather than stock |
| **"We treat you like family" / "You're not just a number"** copy | Industry cliché; feels warm | The two single most over-used and least believed phrases in trucking recruiting. Veteran drivers literally screenshot these to mock on Facebook groups | Show, don't tell. "Our dispatcher Mike has been here 7 years. His direct line is in your welcome packet on day one." |
| **Pay info hidden behind "Call for details" or "Talk to a recruiter"** | "Pay is variable / negotiable / market-sensitive" | Reads as evasion. Drivers leave. Crete publishes scaled rate tables to the dollar — A2C must too | Publish ranges with a footnote ("Top end requires 5+ yrs OTR, clean MVR, 100k+ miles/yr") if needed |
| **Multi-page application before any human contact** | "We need full DOT data" | A2C has already correctly scoped this out. **Anti-feature confirmed.** Long apps belong in the ATS. | Quick-apply ≤6 fields → recruiter follow-up → ATS hand-off |
| **Intrusive chatbot / "Hi! I'm Sarah, can I help?" pop-up** | "Captures leads" | Drivers reflexively close them. Conversion data from B2C is not transferable here. Drivers want a phone number, not a bot. | Floating button is fine; auto-popping is not. Static `tel:` and `sms:` links beat any chatbot for this audience |
| **Email-gating content ("Enter your email to see pay")** | "Capture lead before showing pay" | Drivers leave. They're not subscribing to a newsletter; they're vetting a carrier. | Show the pay. The form is at the bottom |
| **Carousels/sliders on the homepage** | "More content above the fold" | Best-practices research has shown these get near-zero engagement past slide 1. Slow LCP. Hurts SEO. | Stack hero + 2–3 stat-row + pay teaser + testimonials. Linear, scannable |
| **Auto-playing background video with audio** | "Cinematic" | Truck-stop wifi pays for it. Drivers in sleepers don't want sudden audio. | Short looping muted hero clip is OK *if* < 2 MB and only on desktop |
| **Modal video lightboxes on first visit** | "Show our story" | Same as auto-popping chat — interruption | Embed the video in the page, let drivers play it |
| **"Fleet age" claims without specifics** ("modern equipment") | Easy copy | Veteran drivers want make/model/year/transmission. Vagueness reads as "we have old trucks" | Publish actual make/model/year/transmission/sleeper/APU/inverter spec list per Crete's example |
| **Generic "Apply with LinkedIn"** | Looks modern | Drivers don't job-search on LinkedIn at scale; the field set doesn't match (no CDL, no endorsements, no MVR) | Quick-apply form + ATS hand-off |
| **Job board with hundreds of computed "openings"** (one per city) | "SEO" | Mostly looks fake to drivers ("how can a 50-truck fleet have 200 openings?") and risks doorway-page SEO penalties | 5–10 well-crafted location landing pages, each with genuine unique content |
| **"Submit resume" requirement** | Carryover from white-collar recruiting | Most drivers don't have a current resume; many have never written one. Asks for a barrier no one else asks for. | Don't require it. CDL number + years experience + last carrier covers what a resume would |
| **"We're hiring drivers in 48 states!"** banner | Looks like reach | If A2C runs primarily Midwest, a driver in CA or FL applying = wasted recruiter time on both sides | Be specific about lanes / hire states. Better leads, less recruiter waste |
| **Live load board / freight visibility** on the recruiting site | Tech-forward look | Wrong audience — that's a shipper feature, and PROJECT explicitly excludes shippers | Out of scope. Already excluded |
| **In-site driver portal (pay stubs, settlements, document upload)** | "All-in-one" | Mixes marketing site with operational tooling — different security profile, different uptime needs, different audience (existing drivers vs prospects) | Already excluded in PROJECT.md. Confirm. |
| **"Refer-a-friend" form with 12 fields** for the referral bonus | Captures referrals | Same friction problem as long apply form. Just publish: "Refer a driver — when they hit 90 days you get $X. Call us, text us, or have them mention your name." | Phone/text/short form (just driver name + your name) |
| **Generic blog as a launch requirement** | "Content marketing / SEO" | OTTS is the ecosystem's content arm; duplicating it on A2C fragments effort. Out of scope per PROJECT. | Embed/link OTTS videos; defer A2C blog |

---

### Owner-Op-Specific Must-Haves (the OO checklist)

These are what an owner-op opens 3 browser tabs to compare carrier-by-carrier. **A2C must have answers for all of these on the OO-toggled Pay/Benefits page.**

| Item | Owner-Op Question | Complexity | Notes |
|------|-------------------|------------|-------|
| % gross OR per-mile rate (and ideally both options) | "What am I paid per dollar of revenue or per mile?" | LOW | REQ-PAY-02 |
| Fuel surcharge formula | "Is FSC paid on loaded only or all miles? Pegged to what index?" | LOW | One-paragraph + table |
| Fuel discount network + ¢/gal off | "How much do I save vs. retail diesel?" | LOW | "Up to X¢/gal at Pilot Flying J / Love's / TA-Petro" |
| Settlement schedule | "Weekly? Friday for prior week?" | LOW | One sentence |
| Quick-pay terms | "Same-day for X% fee?" | LOW | One sentence |
| Deduction line-items with $ amounts (insurance, ELD, escrow, plates, IFTA admin, maintenance) | "What is taken out before I see my check?" | LOW | Crete publishes every line; A2C should too |
| Truck age / equipment requirements | "Will my truck pass?" | LOW | "≤ X years old, scale ≥ 44,500 lbs, min wheelbase X"" |
| Trailer policy | "Do you provide trailers? What types?" | LOW | "Drop-and-hook on company trailers" |
| Forced dispatch vs load-choice | "Can I refuse a load?" | LOW | One sentence — non-negotiable for many OOs |
| IFTA / permit / 2290 support | "Do I do my own paperwork?" | LOW | "We file IFTA monthly; you provide odometer" |
| Lease-purchase / truck-purchase program terms (if offered) | "Is this a predatory lease?" | LOW-MEDIUM | A2C ecosystem opportunity via LTS |
| **Repair / maintenance partner network** | "Where do I get fixed when I break down on the road?" | LOW | **A2C edge: LTTR is in-house.** Lead with it. |
| Sample settlement statement (downloadable PDF or screenshot) | "Show me what my paycheck actually looks like" | LOW-MEDIUM | The single highest-trust artifact A2C can publish for OOs |
| W-9 / 1099 status disclosure | Tax / status clarity | LOW | One line: "1099 independent contractor" |
| Insurance requirements you'll need to carry vs. that A2C provides | "What do I need to bring? What's bundled?" | LOW | Table: "Bobtail — provided ($X/wk), Cargo — provided, Phys damage — yours" |

---

### Company-Driver-Specific Must-Haves (the W2 checklist)

| Item | Company-Driver Question | Complexity | Notes |
|------|------------------------|------------|-------|
| CPM range with experience tiers | "What's my starting pay and how do I get raises?" | LOW | "$0.62 starting → $0.78 at 5+ yrs" with the actual numbers |
| Sign-on bonus + payout schedule | "How much, paid when?" | LOW | If none, say so |
| Health insurance (medical/dental/vision) — when does it start? | "How long uncovered?" | LOW | "Start day 60 / first of month after 30 days" — be specific |
| 401(k) — match? vesting? when eligible? | Standard benefit question | LOW | If no match, say so honestly |
| PTO / vacation pay accrual | "How much, when do I qualify?" | LOW | "1 wk after 1 yr, 2 wks after 3 yrs" — typical |
| Holiday pay | Standard | LOW | Number of paid holidays |
| Per diem program (W2 election) | Tax planning | LOW | One sentence on policy |
| Paid orientation | "Do I get paid while you train me?" | LOW | "$X/day during orientation, lodging + meals provided" — a common omission that drivers notice |
| Rider / pet policy | Quality-of-life question often ignored by carriers | LOW | One sentence each |
| Equipment specs (per truck): make/model/year, automatic vs manual, sleeper size, APU type, inverter wattage, fridge included, satellite radio, ELD, collision avoidance, governed speed | Drivers really do read this | LOW | Crete publishes: "2022 Freightliner Cascadia Evolution P4, 450HP DD15, DT12 auto, 72" raised-roof, 225" wheelbase, APU cooling/heating, 1200W Xantrex inverter, On-Guard collision avoidance" |
| Home time policy with a guarantee number | "How often am I home?" | LOW | "Home every weekend on regional, 14/3 on OTR" |
| Route type clarity (Local / Regional / OTR / Dedicated) | Filter for fit | LOW | Lead with the mix |
| Referral bonus | Standard | LOW | $ amount + payout schedule |
| Safety bonus / clean-MVR bonus | Common; veteran drivers expect | LOW | Per-mile or quarterly $ |

---

### Cross-Cutting Features

#### SEO landing pages by location

**Pattern:** Templated state/city pages — `/jobs/nebraska`, `/jobs/lincoln-ne`, `/jobs/omaha`, `/owner-operator-jobs/nebraska`, etc. Shared core layout, locale-specific intro paragraph, locale-specific CTA copy, locale-specific testimonial if available.

**Risks:**
- **Thin / doorway content** — Google penalizes near-duplicate templated pages without unique value. Mitigation: each page has 100+ words of genuinely unique content (lane mix from that city, terminal access, local driver quote if available).
- **Cap the count.** 5–10 high-quality pages, not 50 thin ones. Recommended set:
  - Lincoln NE (HQ, primary)
  - Omaha NE
  - Nebraska (state)
  - Iowa (lanes)
  - Kansas (lanes)
  - Owner-operator versions of the top 2–3
- **Schema:** `JobPosting` structured data only if A2C is treating each as a *real* posting (and updating it). Otherwise use generic `Organization` + page-level `FAQPage` for the city's most-asked questions.

#### Recruiting analytics — what to instrument

REQ-OPS-03 calls for lightweight analytics. The ROI-driving events:

| Event | Why |
|-------|-----|
| `apply_form_view` | Funnel top |
| `apply_form_field_focus` (per field) | Identify drop-off field |
| `apply_form_submit_attempt` (validation pass) vs `apply_form_submit_success` | Catch silent failures |
| `apply_form_submit_success` | Conversion |
| `apply_cta_click` (which CTA + which page) | Attribute conversion source |
| `phone_click` (`tel:` taps) | Often a higher-intent signal than form submits |
| `sms_click` (`sms:` taps) | Same |
| `pay_toggle_change` (oo↔company) | Validate the toggle pattern is being used |
| `pay_calculator_use` (if v1.x) | Differentiator usage |
| `referrer` for source attribution | Where leads come from |

Plausible / Fathom / Umami all support this; **GA4 only if SEO consultant requires it**, since drivers' privacy-skepticism is real and a heavy GA4 footprint clashes with the "transparent / driver-first" brand position.

#### Compliance content (the legal floor — non-negotiable)

| Item | Source / Reason | Complexity |
|------|----------------|------------|
| **TCPA SMS consent language** on the apply form (express consent for autodialed/SMS contact, opt-out method, msg-frequency disclosure, "msg & data rates may apply") | TCPA + FCC rules; failure = class-action risk. Crete's exact pattern is a good template: *"By submitting this form, I expressly consent to be contacted by [Company] regarding potential employment opportunities via telephone or SMS… Up to 4 messages/month. SMS Terms and Conditions are located here."* | LOW |
| **EEOC-friendly fields** on quick-apply: no DOB (age), no marital status, no national origin / citizenship beyond "Are you legally authorized to work in the US? Y/N", no disability questions, no veteran status as a *required* field | EEOC + DOT FMCSA recruiting norms | LOW |
| **Privacy Policy** (PII handling, third-party processors, retention, contact for data requests) | CA / state laws; required for collecting names+phones+emails | LOW |
| **Terms of Use / SMS Terms** (linked from the form consent text) | TCPA / carrier requirement for SMS | LOW |
| **Accessibility statement** | WCAG AA per REQ-SITE-05 | LOW |
| **CAN-SPAM compliant** if any email-newsletter feature ships (unsubscribe + physical address in email footer) | CAN-SPAM | LOW (only if newsletter ships; not in scope per PROJECT) |
| **MC# + USDOT# disclosure** | Trust + DOT norms | LOW |
| **Physical address in footer** | CAN-SPAM (if email) + general trust | LOW |
| **EEO statement** in footer or About: "A2C Logistics CO. is an Equal Opportunity Employer. We do not discriminate on the basis of race, color, religion, sex, national origin, age, disability, veteran status, or any protected class." | DOT carrier norm; Schneider has it in the footer | LOW |

---

## Feature Dependencies

```
Quick-Apply Form (REQ-FUNNEL-01)
   ├──requires──> TCPA SMS consent copy + opt-out (Compliance)
   ├──requires──> Privacy Policy page (REQ-OPS-02)
   ├──requires──> Form delivery adapter (REQ-FUNNEL-02 — email + Sheet/Airtable)
   ├──requires──> Real recruiter phone/SMS endpoint (live before launch)
   └──enhances──> Apply CTA in header (REQ-FUNNEL-03)

OO ↔ Company Toggle (REQ-PAY-01)
   ├──requires──> MDX content authored *twice* per concept (one OO, one Company)
   ├──requires──> Real CPM/% numbers (REQ-PAY-02)
   ├──requires──> URL state for deep-linking + SEO
   ├──requires──> Cookie/localStorage for cross-page persistence
   └──enhances──> Hero CTAs ("I'm an Owner-Op" / "I'm a Company Driver" deep-link into toggled state)

Pay Calculator (differentiator, v1.x)
   └──requires──> Final pay numbers locked (REQ-PAY-02)
                      └──requires──> Business decision on per-mile vs %-of-gross + sliding scale

Equipment / Fleet page
   └──requires──> Real photos of A2C trucks (one half-day photo shoot at Lincoln yard)
   └──enhances──> "Repair partner — LTTR in-house" callout (ecosystem differentiator)

Driver Testimonials (REQ-STORY-03)
   ├──requires──> 2–3 named driver photos + quotes minimum
   └──enhances──> Founder-voice video (further out)

Founder Story (REQ-STORY-02)
   ├──requires──> Founder bio + photo (available now per PROJECT.md)
   └──enhances──> Founder-voice video (defer to v1.x; needs OTTS shoot)

Ecosystem / Family page (REQ-ECO-01/02/03)
   ├──requires──> Sister-brand logos + one-line value props
   ├──requires──> Sister-brand site URLs (some "coming soon")
   └──enhances──> Driver-journey diagram (REQ-ECO-03)

SEO Landing Pages (REQ-SITE-01)
   ├──requires──> SSR/SSG framework (Next.js per Constraints)
   ├──requires──> Genuine unique content per page (anti-thin-page)
   └──enhances──> Locale-specific testimonials (when available)

Click-to-Text / SMS Apply (differentiator, partial v1)
   ├──requires──> SMS-capable recruiter number (Twilio 10DLC or short code; long-code mobile is acceptable for MVP)
   └──enhances──> `sms:` link on every visible phone-number element

Recruiting Analytics (REQ-OPS-03)
   └──requires──> Funnel events instrumented at form + CTA + toggle interaction points

[Apply-by-text full chatbot flow] ──defer──> v1.x or later
[Lease-purchase deep page] ──conflicts──> "no predatory lease" trust position
                                         (only build if A2C's actual program is genuinely fair and disclosed)
```

### Dependency Notes

- **Quick-apply form requires TCPA consent copy:** Without express SMS consent, A2C cannot legally text applicants from the inbound lead — a TCPA violation can run $500–$1,500 *per message*. Non-negotiable.
- **OO ↔ Company toggle requires twice the content authoring:** Editorially this is the largest single content cost of the differentiator. Plan content workflow with two MDX components per swap-able concept.
- **Repair partner (LTTR) callout depends on the ecosystem story being told elsewhere:** It only lands if visitors know LTTR is "ours" — needs at minimum the Family page section.
- **SEO landing pages enhance Apply form conversion** by capturing geographic search intent that the homepage wouldn't rank for.
- **Click-to-text and SMS apply conflict with TCPA fragility** if A2C's recruiter responds via SMS without documented consent — keep all opt-in tight.

---

## MVP Definition

### Launch With (v1) — must ship to validate

- [ ] Homepage with founder-voice hero, pay teaser, ecosystem teaser, testimonials, and apply CTA
- [ ] Quick-apply form (≤6 fields) with TCPA-compliant SMS consent + email + Sheet/Airtable delivery
- [ ] Persistent header CTA + visible recruiter phone (`tel:`) + SMS link (`sms:`)
- [ ] **Pay & Benefits page with OO ↔ Company toggle and real, published numbers** — table-stakes #1
- [ ] About / Founder Story page (real photo, 2 paragraphs minimum, signed letter)
- [ ] Driver Testimonials block (start with 2–3 real, named, photographed)
- [ ] Equipment / Fleet page with real A2C truck photos + spec list
- [ ] **"What it's actually like" / dispatcher-accessibility content** (REQ-STORY-04) — including the "we own the repair shop (LTTR)" callout
- [ ] Family / Ecosystem page with all four sister brands
- [ ] Driver-journey diagram (lightweight; SVG)
- [ ] Privacy Policy + SMS Terms + EEO statement (footer)
- [ ] MC# + USDOT# in footer
- [ ] Mobile-first responsive, LCP < 2.5s on 4G, WCAG AA
- [ ] 3–5 SEO location landing pages (Lincoln NE, Omaha, Nebraska, owner-op variants of top 2)
- [ ] Lightweight analytics (Plausible/Fathom/Umami) with funnel events
- [ ] Application success state with explicit next step
- [ ] EEOC-friendly form copy

### Add After Validation (v1.x)

- [ ] **Pay calculator** (Know Your Pay tool — owner-op weekly take-home estimator) — once pay numbers are stable for 60–90 days
- [ ] **Founder-voice video** on About page (depends on OTTS production)
- [ ] **Sample settlement statement** download for owner-ops (highest-trust artifact)
- [ ] **Apply-by-text** (real keyword/short-code via Twilio) — once SMS consent / opt-out tooling is operational
- [ ] **Lane / dedicated-route map** — once dispatch can confirm primary lane mix
- [ ] **Spanish-language pay page** — only if a Spanish-speaking recruiter is available to follow up
- [ ] **OTTS YouTube embed/cross-link block** on Story page — depends on relevant OTTS content existing
- [ ] Additional SEO location pages (5 → 10) if first set proves traction
- [ ] **Veteran/military content** if A2C pursues the SkillBridge / GI Bill apprenticeship route
- [ ] **Driver-of-the-month / recognition section** — once 6+ months of real driver tenure exists

### Future Consideration (v2+)

- [ ] **ATS integration** (Tenstreet IntelliApp or DriverReach — same company since 2025) — when application volume justifies the seat cost
- [ ] **TinaCMS or git-based visual editor** — when a non-technical user needs to edit content without git PRs (deferred per PROJECT)
- [ ] **In-site driver portal** — explicitly out of scope per PROJECT
- [ ] **Public blog** — explicitly out of scope per PROJECT
- [ ] **Job board with multiple listings** — only if A2C grows past a single recruiting pipeline
- [ ] **Multi-brand site (full ecosystem hub)** — explicitly out of scope per PROJECT

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority | Notes |
|---------|------------|---------------------|----------|-------|
| Quick-apply form (≤6 fields) + TCPA consent + Sheet/email delivery | HIGH | LOW | **P1** | Conversion engine |
| Pay & Benefits with OO/Company toggle + real numbers | HIGH | MEDIUM | **P1** | #1 trust + conversion driver |
| Founder Story (text + photo) | HIGH | LOW | **P1** | Differentiator A2C committed to |
| Driver testimonials (named + photos, 2–3 to start) | HIGH | LOW (asset gather) | **P1** | Trust signal |
| `tel:` + `sms:` everywhere + sticky header CTA | HIGH | LOW | **P1** | Conversion path #2 (phone) |
| Equipment / Fleet page with real truck photos | HIGH | LOW (one shoot) | **P1** | Vet-driver trust signal |
| "What happens when…" + dispatcher-accessibility content | HIGH | LOW | **P1** | Differentiator |
| LTTR repair-partner-in-house callout | HIGH | LOW | **P1** | Genuine, defensible edge |
| Ecosystem / Family page + journey diagram | MEDIUM | MEDIUM | **P1** | Brand differentiator A2C committed to |
| Privacy / SMS Terms / EEO compliance | HIGH | LOW | **P1** | Legal floor |
| MC# / USDOT# / SAFER link | MEDIUM | LOW | **P1** | Trust signal at near-zero cost |
| 3–5 SEO location landing pages | MEDIUM | MEDIUM | **P1** | Recruiting search intent |
| Lightweight analytics with funnel events | MEDIUM | LOW | **P1** | Required to validate the funnel |
| Application success state with next-step copy | MEDIUM | LOW | **P1** | Reduce post-submit drop-off |
| Pay calculator | HIGH | MEDIUM-HIGH | **P2** | Major differentiator, defer until pay numbers locked |
| Founder-voice video | HIGH | MEDIUM | **P2** | Powerful but production-dependent |
| Sample settlement statement download (OO) | HIGH | LOW-MEDIUM | **P2** | Highest-trust OO artifact |
| Apply-by-text (Twilio short code / keyword) | MEDIUM | MEDIUM | **P2** | Channel-shift advantage |
| Lane / route map | MEDIUM | MEDIUM | **P2** | Filter aid; defer until mix is stable |
| OTTS video embed | MEDIUM | LOW | **P2** | Depends on OTTS content existing |
| Spanish-language pages | MEDIUM | MEDIUM-HIGH | **P3** | Only if recruiter capacity matches |
| Veteran / military badge + content | MEDIUM | LOW-MEDIUM | **P3** | Only if A2C pursues SkillBridge |
| Driver-of-the-month section | LOW | LOW | **P3** | Once tenure exists |
| Live chat widget | LOW | MEDIUM | **Don't build** | Anti-feature for this audience |
| Long multi-page application on-site | NEGATIVE | HIGH | **Don't build** | Already excluded |
| In-site driver portal | LOW | HIGH | **Don't build** | Already excluded |

**Priority key:**
- P1: Must have for launch (v1)
- P2: Should have, add v1.x
- P3: Nice to have, defer / conditional
- Don't build: anti-features confirmed

---

## Competitor Feature Analysis

Three direct points of comparison: **Crete Carrier (Lincoln NE neighbor — direct local competitor)**, **Schneider National (national mega-carrier — pattern-setter)**, **Maverick Transportation (mid-large flatbed/glass — driver-first brand with story emphasis)**.

| Feature | Crete Carrier (Lincoln NE) | Schneider National | Maverick Transportation | A2C Approach |
|---------|---------------------------|--------------------|-----------------------|---------------|
| Driver-type segmentation | Modal: "What freight would you like to haul?" + separate Owner-Op / Company Driver pages | Owner-Op contracting on a separate sub-domain (`schneiderowneroperators.com`) | Separate "Experienced Drivers / Student / Glass / Marine" paths | **Unified site with OO ↔ Company toggle** — distinct, requires careful UX |
| Pay transparency | Publishes scaled per-mile rate tables, fuel surcharge mechanics, deduction line-items, lease-purchase terms, equipment specs | Pay tab in main nav, by job type; less line-item disclosure than Crete | "Pay" mentioned culturally, less hard data on the public site | **Match Crete's level of detail** (this is the local benchmark — anything less reads as evasive next door to Crete) |
| Founder/voice content | "Asked & Answered" video series with COO + President; "Can't Beat Crete" driver-testimonial series; "Meet Crete" podcast | Generic corporate content; no single founder voice | Founder/leadership content moderate | **A2C edge: a single named founder with a real story.** Lean in. |
| Sister-brand / ecosystem story | Crete + Shaffer + Hunt under one site (corporate family but flat presentation) | None | None | **A2C edge: explicit 4-brand ecosystem with a named flywheel.** Differentiator if not over-played |
| Repair / breakdown story | Mentions terminal locations | Mentions service network | None | **A2C edge: LTTR in-house** — concrete, falsifiable, owner-op resonant |
| Mobile click-to-text | Form only | "Text 'Chat' to 28000" prominently in footer | Form only | **Match Schneider** — `sms:` links + `tel:` everywhere |
| Apply form fields | First name, Last name, Email, Phone, ZIP, Experience, Driver Type + math captcha + TCPA consent (~7 fields + consent) | Apply via Tenstreet ATS hand-off; on-site lead form short | Apply via portal; "Apply Online / Print Application" paths | **6 fields + TCPA consent** — within the published norm |
| Pay calculator | "Know Your Pay" tool linked off owner-op pay page | None public | None public | **Differentiator opportunity at v1.x** |
| Video / driver content | Multiple in-house video series | YouTube channel cross-linked | Some video | **A2C edge: OTTS YouTube cross-link** is a ready ecosystem asset (when OTTS has relevant content) |
| Equipment specs | Full spec list per truck (engine, transmission, sleeper, APU, inverter, tires, color options) | Generic "Equipment & Technology" page | "Our Equipment" page with photos | **Match Crete** — full spec list per truck model |
| Sample settlement statement | Implied via deduction tables but not a downloadable PDF | None | None | **Differentiator opportunity v1.x** — downloadable sample settlement = highest-trust OO artifact |
| EEO statement | Standard footer text | "We are a State and Federal Equal Opportunity Employer…" | Standard | **Match** — footer EEO statement |
| Privacy / SMS terms | Yes, linked from form | Yes | Yes | **Required** |

---

## Sources

- **Crete Carrier Corporation** (Lincoln NE direct competitor) — `https://www.cretecarrier.com/` and `/owner-operator/` — published pay tables, deduction line items, equipment specs, driver application form pattern, TCPA SMS consent text. **HIGH** confidence.
- **Schneider National** — `https://schneiderjobs.com/` and `https://schneiderowneroperators.com/` — driver-type segmentation pattern, mobile SMS pattern ("Text 'Chat' to 28000"), separate owner-op site, EEO footer pattern, owner-op program structure (All-In vs. % of Revenue), Purchase Power fuel program, truck financing (SFI). **HIGH** confidence.
- **Maverick Transportation** — `https://www.maverickusa.com/` — applicant portal hand-off pattern, "Apply Online / Print Application" alt path, hiring map, driver-program segmentation. **HIGH** confidence.
- **Tenstreet** — `https://www.tenstreet.com/` and `https://www.tenstreet.com/intelliapp/` — IntelliApp pre-populating form pattern, "two-question lead form to multi-page application" customization, DOT-compliant digital signatures, Ban-the-Box / Pay-Equity adaptation, Driver Pulse mobile app, **March 2025 acquisition of DriverReach** consolidating the two leading ATS vendors. **HIGH** confidence.
- **Apex Recruiting** — `https://apexdrivers.com/blog/owner-operator-recruiting-guide.html` (Feb 2026) — owner-op vs. company driver factor list, RPM ranges ($1.80–$2.50/mi industry avg), screening checklist (MC authority, insurance verification, equipment inspection, SMS scores), red flags, recruiting process, retention factors. **MEDIUM-HIGH** confidence.
- **TrackFive** — `https://trackfive.com/blog/recruit-owner-operator-drivers/` — owner-op recruiting strategy framework, social/job-board channels, retention themes. **MEDIUM** confidence (vendor blog).
- **Indeed Hire** — `https://www.indeed.com/hire/c/info/recruiting-truck-drivers` — 12 tips for recruiting truck drivers (mobile-friendly application, driver-focused benefits, CDL/DOT compliance basics, retention from day one). **MEDIUM** confidence.
- **PROJECT.md** — A2C Logistics CO. project context (audience, requirements, constraints, brand system, content readiness as of 2026-05-04). **HIGH** confidence (primary source).

### Confidence Notes

- **HIGH-confidence claims:** All pay-page non-negotiables, TCPA consent requirement and exact wording pattern, Tenstreet/IntelliApp dominance, OO deduction line-item expectation, equipment-spec depth expectation, mobile click-to-call/text patterns, EEOC-friendly form expectations, founder-story / driver-testimonial trust signals, anti-feature list.
- **MEDIUM-confidence claims:** Specific conversion-rate benchmarks for short-form vs. long-form (industry-wide data is hard to verify and varies by ATS — directional only). Specific Hispanic/Latino driver percentage (ATA estimate 18–25% is widely cited; precise number varies by source). Veteran SkillBridge ROI claim.
- **LOW-confidence claims (flagged for validation):** Specific apply-by-text conversion lift numbers (vendor-claimed but rarely independently verified). Spanish-language doubling-of-Hispanic-applicant pool (directional, not measured for this fleet size).

---

*Feature research for: Trucking-carrier driver-recruiting website (A2C Logistics CO.)*
*Researched: 2026-05-04*
