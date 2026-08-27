# BDE Agent — Lead Generation & Cold Outreach System

**Owner:** You (Founder/Operator)
**Companion system:** SEO Agent (built separately, handles organic/content side)
**Purpose:** Autonomous agent that finds qualified prospects, enriches their data, runs personalized cold email sequences, and books calls — across your full service catalog.

---

## 1. What You're Selling (Service Catalog)

The BDE agent needs to know your full offer so it can match the right service to the right lead and personalize outreach. Edit/trim this list to match reality.

| Service Line | What it includes | Best-fit client signal |
|---|---|---|
| Web/App Development | Websites, web apps, mobile apps — any tech stack (React, Next.js, MERN, PHP, Laravel, etc.) | No site / outdated site / poor UX |
| Shopify Development | New store builds, theme customization, app integrations, migrations to Shopify | Struggling Shopify store, or D2C brand on a weak platform |
| WordPress Development | Custom themes/plugins, WooCommerce, site migrations, speed/security fixes | Slow/outdated WordPress site, plugin bloat, security issues |
| CRM Development | Custom CRM builds, CRM customization | Using spreadsheets or generic CRM (Zoho/HubSpot) inefficiently |
| HRMS Development | HR management systems, payroll, attendance | Growing team (20+ employees), manual HR processes |
| AI & Automation | Chatbots, workflow automation, AI agents (like this one), internal tooling | Repetitive manual processes, hiring for ops-heavy roles |
| Custom Business Solutions | Bespoke software for specific workflows, any tech stack | Unique operational bottleneck, "we do X differently" |
| Admin Panels & Dashboards | Internal tools, analytics dashboards, reporting systems | Data scattered across tools, no single source of truth |
| SEO (handled by SEO Agent) | Organic growth, content, rankings | Low organic traffic, poor Google visibility |

> **Positioning note:** Because you work in "any tech" rather than one stack, lead with the *outcome* in outreach (e.g., "fix your slow Shopify store" / "build you a custom CRM"), not the tech stack — prospects care about the result, and staying stack-agnostic means you never have to turn down a lead because of tooling.

> **Agent logic:** During lead enrichment, tag each lead with 1–3 likely-fit service lines based on their site/stack/job postings/complaints found online. This drives which email template variant gets sent.

---

## 2. Ideal Client Profile (ICP)

Define this concretely — the agent's targeting quality depends entirely on this.

- **Industry/verticals:** _(e.g., D2C e-commerce (Shopify), local service businesses on WordPress, healthcare clinics, real estate, logistics, SaaS startups — fill in)_
- **Company size:** _(e.g., 10–200 employees)_
- **Geography — international priority:** Focus on **US, UK, Canada, Australia, UAE, and Western Europe** first — these markets pay in USD/GBP/EUR, have higher budgets per project, and are used to hiring remote agencies/freelancers. Practical notes for going international:
  - **Time zones:** Schedule sends so they land in the *prospect's morning* (use send-time-per-timezone in your sequencing tool, not one blast time). For US, send 6–9 AM their time (evening/night IST); for UK/EU, mid-morning their time.
  - **Currency/pricing:** Quote in USD or GBP on your site and in emails for these markets — signals you're set up for international clients.
  - **Payment rails:** Set up Wise, Payoneer, or PayPal Business before you need them — international clients ask about payment method early.
  - **Case studies:** If you don't have international case studies yet, lead with process/portfolio quality instead of "we work with clients in your country" — don't fabricate location claims.
- **Budget signal:** _(funded startups, agencies with existing dev spend, companies hiring for tech roles, Shopify/WooCommerce stores with visible ad spend — signals they can pay for dev work)_
- **Buying trigger signals to scan for:**
  - Recently raised funding (Crunchbase/LinkedIn)
  - Job postings for roles your service replaces or supports (e.g., hiring "Ops Manager" → automation opportunity)
  - Outdated website (tech stack scan)
  - Negative reviews mentioning slow service/manual processes
  - Competitor just launched a new digital product

- **Decision-maker titles to target:** Founder, CEO, COO, Head of Operations, CTO (for dev work), HR Head (for HRMS), Marketing Head (for SEO handoff)

---

## 3. Lead Sourcing — Tools & Channels

| Tool | Use | Notes |
|---|---|---|
| Apollo.io | Bulk lead lists + verified emails | Best cost/volume ratio, has API |
| LinkedIn Sales Navigator | Precise targeting by title/company size/industry | Manual or via PhantomBuster/Bardeen automation |
| Hunter.io / Snov.io | Email finding + verification | Use as fallback when Apollo data is thin |
| Google Maps Scraper | Local businesses (clinics, agencies, retail) | Good for HRMS/admin-panel/local-service leads |
| BuiltWith / Wappalyzer API | Detect tech stack of prospect's website | Flags outdated stacks = dev opportunity |
| Crunchbase / Tracxn API | Funding signals | Flags budget-ready startups |
| Job boards (LinkedIn Jobs, Indeed API) | Hiring signals | Flags automation/HRMS/dev opportunities |
| Company review sites (G2, Trustpilot, Google Reviews) | Pain-point mining | Source language for personalized emails |

**Pipeline:** Source raw list → enrich (email, tech stack, hiring signals, funding) → verify email deliverability → score → route to email sequence.

### Free-tier version (since you're starting on free resources)

At 30–35 new leads/day, free tiers can realistically sustain you for a while before you need to pay for anything:

| Tool | Free tier limit | Enough for your volume? |
|---|---|---|
| Apollo.io | 10,000 free email credits/month (varies by promo) on free plan | Yes — covers 30–35/day easily |
| Hunter.io | 25 free searches/month | Thin — use as backup only, lean on Apollo |
| BuiltWith | Free tech-lookup tool (limited lookups/day) on their site | Fine for manual spot-checks |
| LinkedIn (manual) | Free, no automation tool needed | Manually search + note prospects, 100% free |
| Google Maps + manual scraping | Free (just Google Maps search, no scraper tool) | Good for local/Shopify-WooCommerce store leads |
| Instantly.ai / Smartlead | Both have free trials; after that, cheapest paid tier (~$30–37/mo) is low-cost once you have replies coming in | Free trial to start, budget for paid once revenue starts |
| n8n | Free if self-hosted (Docker on a free-tier VPS like Oracle Cloud Free Tier) | Yes, fully free to self-host |
| Cal.com | Free tier for booking | Yes |
| Google Sheets | Free — use as your lead tracker until your own CRM is ready | Yes |
| Claude API | Pay-as-you-go, but usage for personalization/classification at this volume is a few dollars/month | Small unavoidable cost, budget ~$5–15/month |

**Practical free-stack path:** Apollo (free credits) for sourcing/emails → Google Sheets as your lead tracker → Gmail/your dedicated inbox for sending (see Section 8 on limits) → n8n self-hosted for automation → Cal.com for booking. This costs close to $0 until you're ready to reinvest revenue into paid tools.

---

## 4. Agent Workflow

```
1. PROSPECT       → Pull companies matching ICP filters (industry, size, geo)
2. ENRICH         → Get decision-maker contact, tech stack, hiring signals, funding, socials
3. TAG            → Assign best-fit service line(s) + confidence score
4. SCORE          → Rank lead 1–100 (fit + intent signals + reachability)
5. VERIFY         → Email deliverability check (avoid bounces hurting sender reputation)
6. SEQUENCE       → Assign to matching cold email sequence (see Section 5)
7. SEND           → Send email 1, track opens/replies/clicks
8. FOLLOW-UP      → Auto follow-up 2–3x on no-reply (spaced 3–4 days apart)
9. CLASSIFY REPLY → Interested / Not interested / Not now / Wrong person / Out of office
10. ROUTE         → Interested → book call (Calendly link) → notify you / push to CRM
11. LOG           → All activity logged to CRM + dashboard
12. PROPOSAL      → Post-call, send proposal/quote within 24h (see Section 17)
13. CLOSE         → Contract + deposit → mark "Client" in CRM
14. HARVEST       → 30–60 days post-kickoff, trigger referral/testimonial ask (see Section 18)
```

---

## 5. Cold Email Strategy

### Rules
- **1 CTA per email.** Ask for a reply or a 15-min call — nothing else.
- **Personalize the first line** using enrichment data (a specific observation about their site/hiring/reviews), not generic flattery.
- **Keep it under 120 words.** Long cold emails don't get read.
- **No attachments in email 1** (kills deliverability). Link to a Loom/portfolio instead.
- **Sequence length:** 3–4 touches over 10–14 days, then stop or move to a "break-up" email.
- **Warm-up:** New sending domains/inboxes need 2–3 weeks of warm-up (via Instantly/Smartlead/Mailwarm) before cold volume — this protects deliverability for your SEO agent's domain too, so use a **separate subdomain** for cold outreach (e.g., `outreach.yourdomain.com`), never your main domain.

### Sample sequence skeleton (per service line — customize the "hook" per template)

**Email 1 — Observation + soft ask**
```
Subject: quick one about [Company]'s [specific thing noticed]

Hi [First Name],

Noticed [specific, real observation — e.g. "your site's still on a template stack from a few years back" / "you're hiring for an Ops Manager"].

We build [service] for companies like yours — recently helped [similar company/industry] do [specific outcome].

Worth a quick 15-min call to see if there's a fit?

[Your name]
```

**Email 2 (Day 4) — Value add, no pressure**
```
Subject: re: quick one

Following up — thought this might be useful either way: [1-line insight, case study link, or mini-audit finding].

If timing's off, no worries — just say so and I'll close the loop.
```

**Email 3 (Day 8) — Social proof**
```
Subject: how [similar company] solved [pain point]

Quick example: [Client] had [problem]. We built [solution], result was [metric].
Happy to share how we'd approach something similar for [Company] — free to chat this week?
```

**Email 4 (Day 12) — Break-up**
```
Subject: closing the loop

I'll stop following up here — if it's ever relevant, reply anytime and I'll pick this back up.
```

> Store all templates as variables in the agent config so it can swap `{service}`, `{observation}`, `{case_study}`, `{metric}` dynamically per lead tag.

### "Best communication" — how the agent should actually talk

Since you asked for the best possible communication quality, bake these rules into the agent's email-generation prompt (not just the templates above):

- **Write like a person, not a template.** Ban corporate filler phrases ("I hope this email finds you well," "I wanted to reach out," "circling back"). Claude should be instructed to write short, direct, plain-English sentences.
- **Every email needs one *specific*, verifiably-true detail about that company** (from enrichment data) — never a detail that could apply to any company. If the agent can't find a real specific detail, it should skip that lead rather than send a generic email.
- **Match tone to region.** US/UK prospects generally respond better to brief and direct; some markets (e.g., parts of the Middle East, Japan) expect a touch more formality/relationship framing — the agent can adjust tone by geography tag.
- **Same-day reply handling.** The moment a lead replies, the agent should classify sentiment and either (a) draft a reply for your approval within minutes, or (b) auto-send a booking link if the reply is clearly positive and low-risk to auto-handle. Speed-to-reply is one of the highest-leverage factors in B2B conversion — don't let interested replies sit for a day.
- **Never auto-send anything to a reply that expresses frustration, confusion, or a complaint.** Route those to you directly instead of letting the agent respond on autopilot.
- **A/B test one variable at a time** (subject line, opening line, or CTA) across batches of at least 50 sends before drawing conclusions — small samples give misleading signal.

---

## 6. Lead Data Schema

| Field | Type | Source |
|---|---|---|
| lead_id | string | internal |
| company_name | string | Apollo/scraper |
| domain | string | scraper |
| contact_name | string | Apollo/LinkedIn |
| title | string | Apollo/LinkedIn |
| email | string (verified) | Hunter/Apollo |
| linkedin_url | string | LinkedIn |
| industry | string | Apollo |
| company_size | int | Apollo |
| geo | string | Apollo |
| tech_stack | array | BuiltWith |
| hiring_signals | array | Job board API |
| funding_status | string | Crunchbase |
| fit_score | int (0–100) | agent logic |
| service_tags | array | agent logic |
| sequence_status | enum (not_started / in_progress / replied / booked / bounced / opted_out) | outreach tool |
| last_touch_date | date | outreach tool |
| reply_sentiment | enum | agent classification |
| notes | text | manual/agent |
| do_not_contact | boolean | agent/manual — set on opt-out, bounce-hard, or existing client match |
| proposal_sent_date | date | manual/agent |
| proposal_value | number | manual |
| referral_source | string | manual — tags leads that came from a referral, distinct from cold-sourced |
| client_since_date | date | manual — set when sequence_status hits "client," feeds referral/testimonial trigger |

---

## 7. Tech Stack & Integrations Needed

| Layer | Tool options | Purpose |
|---|---|---|
| Lead sourcing/enrichment | Apollo.io API, Hunter.io API, BuiltWith API, Clearbit | Data pull |
| Email sending/sequencing | Instantly.ai, Smartlead, Lemlist API | Sequence automation, deliverability |
| Email verification | ZeroBounce, NeverBounce | Reduce bounce rate |
| CRM | HubSpot free tier, Pipedrive, or your own custom CRM (since you build CRMs — dogfood it here) | Central lead/deal tracking |
| Calendar booking | Calendly / Cal.com API | Auto-book calls |
| Automation glue | n8n / Make.com / Zapier, or your own custom automation agent | Connect all of the above |
| Dashboard | Your own custom admin panel (since you build these) | Visualize pipeline, reply rates, booked calls |
| LLM layer | Claude API (for personalization, reply classification, drafting) | Generates first-line personalization, classifies replies |

Since you build CRMs, HRMS, admin panels, and automation tools yourself — **the ideal end state is that this entire BDE agent runs on your own custom-built stack**, using third-party APIs (Apollo, Hunter, BuiltWith, email sending) only as data/infrastructure providers underneath your own dashboard and CRM. That also becomes a live case study/demo of your own product for prospects.

---

## 8. Permissions / API Access Checklist

Grant/generate these before the agent goes live:

- [ ] Apollo.io API key (lead sourcing)
- [ ] Hunter.io or Snov.io API key (email finding/verification)
- [ ] BuiltWith or Wappalyzer API key (tech stack detection)
- [ ] Crunchbase/Tracxn API key (funding signals) — optional
- [ ] Job board API access (LinkedIn Jobs scraping via 3rd party, or Indeed API) — optional
- [ ] Email sending tool API key (Instantly/Smartlead/Lemlist)
- [ ] Dedicated sending domain + DNS records (SPF, DKIM, DMARC configured) — critical for deliverability
- [ ] Calendly/Cal.com API key (booking)
- [ ] CRM API key (HubSpot/Pipedrive, or your own CRM's internal API)
- [ ] Claude/Anthropic API key (personalization + reply classification)
- [ ] Automation platform access (n8n self-hosted / Make / Zapier)
- [ ] Google Sheets/DB access if using a lightweight lead store before CRM is ready
- [ ] **LinkedIn access** — see caution below
- [ ] **Dedicated outreach email account** — see setup notes below

### LinkedIn access — how to use it safely

You mentioned giving LinkedIn access if needed. A few things to know before connecting it to any automation:
- LinkedIn actively detects and **bans accounts** doing automated connection requests/messages/scraping — this risk applies to your personal profile too, not just a "throwaway" one.
- Safer path: use LinkedIn **manually or semi-manually** for prospecting (search, view profiles, send a handful of manual connection notes/day — LinkedIn's own limits are roughly 100–150 connection requests/week for a normal account) and let the agent only assist by **preparing** the lead list and message drafts, while you or a semi-automated tool (Sales Navigator's own search/export, used within ToS) does the actual sending.
- If you do want automation, tools like PhantomBuster/Bardeen exist but they run against LinkedIn's ToS and carry real ban risk — flagging this so you can make an informed call, not making it for you.
- Bottom line: it's fine to grant the agent read access to help you *find and prioritize* LinkedIn leads; be more cautious about full send-automation on LinkedIn itself.

### Dedicated email — setup notes

- Use a **separate email/domain from your main portfolio or company domain** for cold outreach (e.g., `hello@youragencyoutreach.com` or a subdomain) so a bad sender reputation never touches your primary domain's deliverability or your SEO agent's work.
- **Warm it up for 2–3 weeks** before real volume — start at ~10–15 emails/day and ramp up, even on free tools (Instantly/Smartlead free trials both support warm-up).
- Free/personal Gmail accounts have a **~500 emails/day sending limit** (Google Workspace ~2,000/day) and get flagged fast for cold outreach patterns — at 30–35/day you're well within Gmail's raw limit, but you still need warm-up and proper SPF/DKIM/DMARC records regardless of provider.

---

## 9. Compliance (Don't Skip This)

- **CAN-SPAM (US):** Include real sender name/address, honor opt-outs within 10 days, no misleading subject lines.
- **GDPR (EU leads):** Legitimate interest basis for B2B cold email is generally accepted, but must offer easy opt-out and not store data longer than needed.
- **India (if targeting Indian companies):** No dedicated cold-email law yet, but follow IT Act data-handling basics and always honor unsubscribe requests.
- Always include a one-line opt-out ("Reply 'no thanks' and I won't follow up again") — improves both compliance and reply rates.

---

## 10. KPIs to Track on the Dashboard

| Metric | Target (typical benchmark) |
|---|---|
| Email deliverability rate | >95% |
| Open rate | 40–60% (with good subject lines) |
| Reply rate | 5–15% |
| Positive reply rate | 2–5% |
| Meetings booked / 100 emails sent | 2–5 |
| Meeting → proposal conversion | track over time |
| Proposal → closed-won | track over time |
| Cost per booked meeting | total tool spend ÷ meetings booked |
| Proposal turnaround time | <24h from call to proposal sent |
| Referral requests sent / clients closed | 100% (every closed client gets asked) |
| Referral → new lead rate | track over time — this is your cheapest lead source once it starts |
| List health: bounce + spam-complaint rate | bounce <2%, spam complaints <0.1% (Google/Yahoo will throttle you above this) |

---

## 11. Daily Volume Target — Funnel Math for 10+ Clients/Month

Your target: **30–35 new leads contacted/day → 10+ clients/month.** Here's the honest funnel math (using realistic B2B cold email benchmarks) so you know what needs to be true:

```
30–35 leads/day × ~22 working days  = 660–770 new leads/month
Reply rate (8–12% realistic for cold, free-tier setup)   → 53–92 replies
Positive/interested replies (~30–40% of replies)          → 16–37 interested
Meetings actually booked (~60–70% of interested)          → 10–26 meetings
Meeting → client conversion (~30–50% close rate)          → 3–13 clients/month
```

**What this means practically:**
- At 30–35/day, 10 clients/month is comfortably achievable *if* reply/positive rates hold — the extra volume vs. 25–30/day gives you more room even if conversion underperforms early on.
- **Deliverability becomes the real constraint at this volume, not tool limits.** Sending 30–35/day from one inbox is fine once warmed up, but if you want to push higher later, you'll need 2–3 sending inboxes rotating (still free — just multiple Gmail/Workspace-style addresses on your dedicated domain) rather than one inbox doing all the volume.
- If close rate comes in lower initially (normal in month 1–2), the fix is **message iteration**, not just more volume — track reply rate and positive-reply rate weekly and rewrite whichever email is underperforming.
- Realistic first-month expectation: 5–8 signed clients while messaging is being tuned is a strong, credible outcome —10+ becomes reliable once you have 4–6 weeks of reply data to optimize against.
- **Daily consistency matters more than daily volume.** 30–35/day sent every working day compounds faster than 200/day for one day then nothing for a week — also protects sender reputation.

## 12. Portfolio Site — Why It's a Bottleneck Right Now

You flagged that your portfolio site is still under construction — this is a real conversion blocker, because a decent chunk of interested replies will click through to check your work before booking a call. Two ways to handle it while it's mid-build:

1. **Don't wait for the full site.** Ship a minimal one-page version now: your service list, 2–3 case studies or even mock/sample projects (clearly labeled as concept work if you don't have live client examples yet), a way to book a call (Cal.com link), and contact info. A rough one-pager live today beats a perfect site three months from now.
2. **In the meantime, replace the portfolio link in cold emails with a Loom video or PDF one-pager** attached/linked per service line — a 90-second screen recording walking through 2–3 examples of your work often converts *better* than a static site link anyway, because it feels personal and is harder to skim past.
3. Once the full portfolio site is live, that itself becomes a new outreach angle (SEO agent can also target ranking it for "hire [service] developer [your city/niche]" type keywords for inbound to complement this outbound system).

## 13. Dashboard — Hosted on Vercel

Since you're building your own dashboard/admin panel and deploying on Vercel, here's a sensible spec for it:

**Stack:** Next.js (App Router) + Vercel for hosting — natural fit since Vercel is built for Next.js. Pair with:
- **Database:** Vercel Postgres, Supabase (free tier), or Neon (free tier) — any works fine at this data volume.
- **Auth:** Simple email/password or magic-link auth for yourself (and any future team member) — NextAuth.js or Clerk (free tier) both work.
- **API layer:** Next.js API routes / route handlers calling into Apollo, your email tool, and Claude API — keeps all your API keys server-side, never exposed to the browser.

**Core dashboard views:**
1. **Pipeline board** — leads by stage (Sourced → Contacted → Replied → Meeting Booked → Proposal Sent → Contract Signed → Client) — Kanban or table view.
2. **Daily activity log** — how many sent today vs. target (30–35), replies, opens, bounces.
3. **Lead detail view** — full enrichment data, email thread history, fit score, service tags, notes.
4. **Funnel/KPI charts** — reply rate, positive rate, booked meetings, close rate trending over time (feed straight from Section 10's KPI table).
5. **Sequence manager** — view/edit the email templates and sequences by service line.
6. **Settings** — API key management, sending limits, warm-up status of your outreach inbox(es).

**Deployment notes for Vercel specifically:**
- Keep all API keys as Vercel **Environment Variables**, never hardcoded.
- If the agent needs to run on a schedule (e.g., "send today's batch at 8 AM their timezone"), use **Vercel Cron Jobs** to trigger your sending logic — free on Vercel's Hobby plan for basic schedules.
- Webhooks from your email tool (Instantly/Smartlead) or Cal.com (booking confirmed) can hit a Vercel API route to update the dashboard in real time.

## 14. Notifications

Since you're allowing notifications, wire these up — they're what make the agent feel "alive" and keep you fast on hot leads:

| Trigger | Notification | Channel |
|---|---|---|
| New positive reply | Immediate | Push (via a simple PWA/browser push) or email/Slack/Telegram — pick whichever you check most |
| Meeting booked | Immediate | Same as above + calendar invite |
| Daily send target hit/missed | End of day summary | Email or dashboard banner |
| Bounce rate spike (>5%) | Immediate — deliverability risk | Email/Slack (this one matters — catch domain reputation issues early) |
| Weekly KPI digest | Every Monday | Email — reply rate, positive rate, meetings booked, clients closed |

**Cheapest free way to wire this up:** a **Telegram bot** (free, dead simple API) or **Discord webhook** (free) tends to be the fastest to set up for personal instant notifications — no app store approval, no push notification infra needed, and both have simple send-message APIs you can call directly from a Vercel API route or your automation tool (n8n).

## 15. Build Order (Suggested)

1. Nail the ICP + fill in Section 1 & 2 with real specifics (include international targeting).
2. Set up a dedicated cold outreach domain + warm it up (2–3 weeks) — this can run in parallel with steps 3–6.
3. Ship a minimal one-page portfolio site now (Section 12) — don't block outreach on the full site.
4. Build/connect lead sourcing + enrichment pipeline (Apollo free tier + BuiltWith + manual LinkedIn).
5. Stand up the Next.js dashboard on Vercel (Section 13) with Sheets/basic DB as the data source to start.
6. Wire up Telegram/Discord notifications for replies and bounces (Section 14) — cheap and fast to set up.
7. Build reply classification + auto-follow-up logic (Claude API), feeding the "best communication" rules in Section 5.
8. Connect Cal.com booking + CRM (own build or free-tier HubSpot/Pipedrive to start).
9. Run a small batch (50–100 leads) at reduced volume to test messaging quality before ramping to the full 30–35/day.
10. Once reply data comes in (1–2 weeks), iterate messaging, then scale to full daily volume with 2–3 rotating inboxes if needed.

## 16. Pricing & Packaging (Missing — Needed Before Calls Start)

The doc has no pricing logic, but "book a call" is only half the funnel — the call falls apart if you're figuring out numbers live. Fill this in per service line before your first call:

| Service Line | Pricing model | Starting range (fill in real numbers) | Notes |
|---|---|---|---|
| Web/App Development | Fixed-price per project, or milestone-based | _e.g., $2,500–$15,000+_ | Fixed price converts better with prospects who've never worked with an agency before — less perceived risk |
| Shopify/WordPress Development | Fixed-price | _fill in_ | |
| CRM/HRMS/Custom Solutions | Scoped project + optional monthly retainer for maintenance | _fill in_ | Retainer is where recurring revenue comes from — always offer it at close, even if declined |
| AI & Automation | Fixed-price build + usage-based or flat monthly for ongoing agent hosting/maintenance | _fill in_ | |
| Admin Panels & Dashboards | Fixed-price | _fill in_ | |

**Rules to bake into the agent/your process:**
- **Never quote a price in the cold email or first-touch sequence.** It kills the "worth exploring fit" framing and turns the email into an easy-to-ignore quote request. Pricing conversation happens on the call, after scoping.
- **Have a floor price per service line** so you're not improvising a discount live on a call — improvised discounts on the spot are the #1 way new agencies undercharge in year one.
- **Decide your payment terms now:** typical is 30–50% deposit before work starts, balance on milestones or delivery. Put this in the proposal template (Section 17), not negotiated fresh each time.

---

## 17. Discovery Call → Proposal → Close Workflow (Missing)

Section 4's workflow stops at "meeting booked." Everything from here is where deals actually get won or lost, and it's currently undocumented.

### Discovery call structure (15–20 min)
1. **Confirm the pain (2 min):** Restate what you noticed in outreach — let them correct/expand it. This is why the specific-detail rule in Section 5 matters; it makes this feel earned, not scripted.
2. **Dig into scope (5–7 min):** What's actually needed, timeline, who else is involved in the decision, what they've tried before.
3. **Budget check (2–3 min):** Ask directly — "what kind of budget range were you thinking for this?" — before you propose a number. If they have no range in mind, give your floor-to-mid range from Section 16 to set the frame.
4. **Set next step (1–2 min):** Never end a call without a concrete next step and date — "I'll send a proposal by [day], can we reconnect [day] to walk through it?" Don't let it end on "I'll send something over" with no follow-up date.

### Proposal → contract → deposit
- **Turnaround: proposal within 24h of the call**, while the conversation is fresh for them — this is the single highest-leverage thing you can automate/template, since slow proposals lose deals to nothing but delay.
- Keep a proposal template per service line (one-page: scope, timeline, price, payment terms, what's *not* included) — draft with Claude API from the call notes, but have a human (you) review before sending until you trust the output.
- Contract: even a simple one-page MSA/SOW (scope, price, timeline, IP ownership, payment terms, cancellation terms) protects you — don't start work on a verbal yes. Templates from a source like Bonsai, HelloBonsai, or a lawyer-drafted template you reuse are fine to start.
- **Deposit before work starts, always** — this is non-negotiable for a solo/small operator; it filters out non-serious prospects and protects your cash flow.

### CRM stages this maps to
`Meeting Booked → Proposal Sent → Contract Sent → Deposit Received → Client (active) → Project Delivered`

---

## 18. Referral & Testimonial Engine (Missing — Your Cheapest Future Leads)

Every closed client is also a lead-generation event, and the current doc doesn't capture this at all. This matters directly for your "10+ clients/month" target because referral leads convert at a much higher rate than cold outreach and cost nothing to source.

- **Trigger:** 30–60 days after project delivery (or at a natural milestone — e.g., "site's been live a month"), the agent (or you, manually at first) sends a short check-in + testimonial ask.
- **Ask in two parts, not one:** (1) "Mind if I use a quick line from you as a testimonial?" (2) separately, "Know anyone else who could use [service]? Happy to give you [referral incentive if you choose to offer one]." Combining both into one ask lowers response on both.
- **Testimonials get used two ways:** on the portfolio one-pager (Section 12) and dropped into the "social proof" email in your sequence (Email 3, Section 5) — replace generic case studies with real ones as they come in.
- **Track it:** add a `referral_source` field to the lead schema (see updated Section 6) so referral leads are visibly separate in the dashboard from cold-sourced ones — this is the number that tells you when you can start dialing back cold volume.

---

## 19. List Hygiene & Suppression List (Missing — Deliverability Risk)

Section 9 covers legal compliance but not the operational side of keeping your list — and your sender reputation — clean. Bounce/spam-complaint rates are already in the KPI table (Section 10) as targets, but nothing in the doc explains how the agent enforces them.

- **Suppression list is separate from the main lead table** — once someone opts out, hard-bounces, or is flagged do-not-contact, they should be excluded from *every future list pull*, not just the current sequence. Enforce this as a check at the SOURCE step (Section 4, step 1), not just at SEND — otherwise the same person gets re-scraped into a future batch.
- **De-dupe against existing clients and active conversations** before any new batch goes out — nothing burns trust faster than cold-emailing someone you're already talking to.
- **Auto-suppress on:** explicit opt-out reply, hard bounce, spam-complaint flag from your sending tool, and "wrong person"/"not the right contact" replies (route those to find the right contact instead of re-sending to the same wrong one).
- **Domain reputation monitoring:** if bounce rate spikes above ~5% or spam complaints tick up, the agent should pause sending automatically and alert you (this ties into the bounce-rate notification already in Section 14) rather than continuing to burn the domain while you're not looking.

---

## 20. Risk & Escalation Rules — When the Agent Should Stop and Ask You (Missing)

The doc gives the agent a lot of autonomy (auto-send on clearly positive replies, auto follow-ups, etc.) but never defines the boundaries of that autonomy. Worth being explicit, since a badly-timed autonomous action (wrong send, wrong lead, angry reply) can cost more than it saves.

Hard stops — agent must pause and notify you, never act autonomously, when:
- A reply expresses frustration, confusion, or threatens to report/complain (already noted in Section 5, worth repeating here as a system-wide rule).
- Bounce rate or spam-complaint rate crosses the thresholds in Section 19.
- A lead is a known contact, past client, or partner accidentally pulled into a cold batch.
- Reply sentiment classification confidence is below a set threshold (e.g., <80%) — default to drafting for your approval rather than auto-sending.
- Any request involving legal, refund, or complaint language in a reply.

Everything else (routine follow-ups, positive-reply booking links, low-stakes classification) can stay autonomous — the point is drawing this line explicitly now, rather than discovering it live when the agent auto-sends the wrong thing to the wrong person.

## 21. Implementation Stack — Build Spec for Claude Code

Section 7 covers *which tools* to use; this section is the concrete technical spec so you can hand this doc straight to Claude Code and have it scaffold the project without guessing.

### Project structure
```
bde-agent/
├── app/                        # Next.js App Router
│   ├── (dashboard)/
│   │   ├── pipeline/           # Kanban/table — Section 13 view 1
│   │   ├── activity/           # Daily log — view 2
│   │   ├── leads/[id]/         # Lead detail — view 3
│   │   ├── analytics/          # KPI charts — view 4
│   │   ├── sequences/          # Template manager — view 5
│   │   └── settings/           # API keys, sending limits — view 6
│   ├── api/
│   │   ├── cron/
│   │   │   ├── source-leads/route.ts       # daily prospect pull
│   │   │   ├── enrich-leads/route.ts       # enrichment pass
│   │   │   ├── send-sequences/route.ts     # timezone-aware send batch
│   │   │   └── check-bounces/route.ts      # deliverability monitor
│   │   ├── webhooks/
│   │   │   ├── instantly/route.ts          # or smartlead — opens/replies/bounces
│   │   │   ├── calcom/route.ts             # booking confirmed
│   │   │   └── stripe/route.ts             # if handling deposits online — optional
│   │   ├── leads/route.ts                  # CRUD
│   │   ├── classify-reply/route.ts         # Claude API call
│   │   └── generate-email/route.ts         # Claude API call
│   └── layout.tsx
├── lib/
│   ├── db/                     # Drizzle or Prisma schema + client
│   ├── integrations/
│   │   ├── apollo.ts
│   │   ├── builtwith.ts
│   │   ├── hunter.ts
│   │   ├── instantly.ts        # or smartlead.ts
│   │   ├── calcom.ts
│   │   └── claude.ts           # wraps Anthropic SDK calls
│   ├── scoring.ts               # fit_score + service_tags logic (Section 1, 6)
│   ├── suppression.ts           # do_not_contact checks (Section 19)
│   └── notify.ts                # Telegram/Discord webhook sender (Section 14)
├── drizzle/ or prisma/          # migrations
└── .env.local
```

### Core packages
```
next, react, react-dom
@anthropic-ai/sdk                # Claude API — personalization, classification, proposal drafts
drizzle-orm + drizzle-kit         # or prisma — pick one; drizzle is lighter for this data volume
@vercel/postgres or @neondatabase/serverless   # per Section 13 DB choice
next-auth  or  @clerk/nextjs      # auth
zod                               # validate webhook payloads + API inputs
resend  or  nodemailer            # only if sending transactional (not cold) emails from the app itself
recharts                          # KPI charts (view 4)
date-fns-tz                       # timezone-aware send scheduling (Section 2)
```

### Environment variables (`.env.local`)
```
DATABASE_URL=
ANTHROPIC_API_KEY=
APOLLO_API_KEY=
HUNTER_API_KEY=
BUILTWITH_API_KEY=
INSTANTLY_API_KEY=            # or SMARTLEAD_API_KEY
CALCOM_API_KEY=
CRUNCHBASE_API_KEY=           # optional
TELEGRAM_BOT_TOKEN=           # or DISCORD_WEBHOOK_URL
NEXTAUTH_SECRET=              # or CLERK keys
CRON_SECRET=                  # protects /api/cron/* routes from public access
```

### Database schema — starting tables
Map directly to Section 6's lead schema, plus these supporting tables Claude Code will need that weren't explicit before:
- `leads` — all fields from Section 6 (lead_id, company_name, domain, contact_name, title, email, linkedin_url, industry, company_size, geo, tech_stack, hiring_signals, funding_status, fit_score, service_tags, sequence_status, last_touch_date, reply_sentiment, notes, do_not_contact, proposal_sent_date, proposal_value, referral_source, client_since_date)
- `suppression_list` — email, reason (opt_out/bounce/existing_client/manual), added_at — checked at source step, not just send step (Section 19)
- `sequences` — service_line, step_number, template_body, delay_days
- `activity_log` — lead_id, event_type (sent/opened/replied/bounced/booked), timestamp, raw_payload (for webhook debugging)
- `daily_stats` — date, leads_sourced, emails_sent, replies, bounces, meetings_booked (denormalized for fast dashboard reads — don't compute this from activity_log on every page load)

### Cron jobs (Vercel Cron, per Section 13)
```
vercel.json:
- /api/cron/source-leads   → daily, e.g. 06:00 UTC
- /api/cron/enrich-leads   → daily, after sourcing
- /api/cron/send-sequences → runs frequently (e.g. hourly), filters leads whose local time matches the send window (Section 2) rather than one blast — this is the mechanism behind the "send in prospect's morning" rule
- /api/cron/check-bounces  → every few hours, feeds the >5% bounce alert (Section 14, 19)
```

### Build sequencing note for Claude Code
Build in this order to keep everything testable end-to-end early rather than building all integrations before anything runs:
1. DB schema + auth + empty dashboard shell
2. Manual lead entry (CRUD) working before any scraper — lets you test scoring/sequencing/dashboard with fake data
3. One integration at a time (Apollo → BuiltWith → Instantly/Smartlead → Cal.com), each wired to a real cron/webhook before moving to the next
4. Claude API calls (classification, personalization, proposal drafts) last, once real reply data exists to test against
5. Suppression + escalation rules (Sections 19–20) wired in before the first real send batch, not after

---

*Fill in the bracketed sections with your real ICP, case studies, and metrics before running this live. Once that's done, this doc doubles as the build spec for your BDE agent's logic and the onboarding doc for anyone (including future hires) who takes over outreach.*
