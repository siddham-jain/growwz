# Evals: how I tested the solution

I treated "is this good for a first-time Gen Z investor?" as a set of testable claims, then checked each one at three layers: **automated evals** that run on every build, **persona walkthroughs** that judge the design the way a user would (two rounds), and a **real-user and launch plan** for what a prototype can't prove.

## What "good" means here

Each criterion comes straight from the problem framing (empty accounts, first-dip panic, jargon, F&O losses, lumpy income):

| # | Claim | How it's measured | Bar |
|---|---|---|---|
| 1 | Starting is effortless | Taps from opening the app to the first ₹100 invested | ≤ 12 |
| 2 | Habits survive irregular income | Taps to invest when money lands; works for salary *and* gig/pocket money | ≤ 2, both paths |
| 3 | Suitability is safe by construction | Matrix over every horizon × risk profile × goal type | 0 cases of <2-yr money in equity |
| 4 | Plans are honest | Starter plan sums to what the user chose; every milestone reachable on time | 0 violations across 600+ cases |
| 5 | No unexplained jargon where decisions happen | Copy lint on 9 decision screens | 0 unexplained terms |
| 6 | Plain language | Flesch reading ease of on-screen copy | ≥ 60 per screen |
| 7 | Calm by default | Daily P&L hidden by default; dip interception only for long-term money | Both hold |
| 8 | Friction only where it protects | F&O gate works end-to-end; short-term withdrawals are never interrupted | Both hold |
| 9 | Trust and privacy | Squads never show ₹; projections are always ranges | Both hold |
| 10 | Accessible | axe-core WCAG 2 A/AA; tap targets | 0 serious/critical; all ≥ 44px |
| 11 | Feels right to the people it's for | Persona walkthroughs, 1–5 on clarity, trust, motivation, calm, income fit | Average ≥ 4 |

## Layer 1: automated evals (`npm run eval`)

These are Playwright tests running against a production build in Chrome at iPhone size (390×844).

- **`evals/journeys.spec.ts`** (13 end-to-end user journeys): first ₹100 in ≤ 12 taps, honest starter plan, salaried payday split, freelancer %-of-payment split, Dip Coach + panic check, no false friction on short-term money, F&O gate, calm mode, decode, Bytes, new stash, squad privacy, projection ranges.
- **`evals/suitability.spec.ts`** (unit-level safety matrix): horizon × risk × goal type, emergency always steady, growth only for 3+ years, cautious never riskier than steady, required SIP actually reaches the goal, projections ordered weak ≤ typical ≤ strong, starter-plan arithmetic (600+ generated profiles).
- **`evals/copy.spec.ts`**: a jargon lint (16 terms; a term passes only if it's tap-to-decode or spelled out on the same screen) plus Flesch reading ease per screen.
- **`evals/a11y.spec.ts`**: axe-core WCAG 2 A/AA on 10 screens, plus a 44px tap-target check.
- **`evals/screens.spec.ts`**: captures every key screen into `docs/screens/` for the persona round.

**Latest result: all 41 automated evals pass** (39 checks + 2 screenshot captures) (full table in [evals/results/SCORECARD.md](./evals/results/SCORECARD.md)).

| Metric | Result | Bar |
|---|---|---|
| Taps to first ₹100 (fresh install → invested) | **12** | ≤ 12 |
| Taps to invest on payday (notification → done) | **2** | ≤ 2 |
| Suitability violations | **0** | 0 |
| Starter-plan arithmetic / reachability violations | **0** across 612 profiles | 0 |
| Unexplained jargon on decision screens | **0** on 9 screens | 0 |
| Reading ease (Flesch) | **72–101** | ≥ 60 |
| Serious/critical axe violations | **0** on 10 screens | 0 |
| Tap targets under 44px | **0** | 0 |

### What the automated evals caught (and what changed)

| Eval | Finding | Fix |
|---|---|---|
| Visual review | A new user's starter plan said the Emergency cushion "reaches goal ~Jul 2034": technically true, and demoralising | Unaffordable goals become a reachable **first milestone** |
| J2 honest plan | A goal due exactly on its deadline showed as "late" (timestamp vs. month comparison) | Compare at month level |
| J2 (writing it) | Weekly starter SIPs were charged the monthly amount: 4× too much | Weekly amounts sized as weekly |
| S7 arithmetic | ₹100/month plans got a ₹1,000 milestone floor that couldn't be reached in time | Milestones rounded to what's actually reachable |
| Screens run | The Decode sheet stayed open after navigating away | Close overlays on route change |
| a11y | A nested button (Decode link inside the F&O tile); `aria-label` on a plain div | Restructured the tile; dot grid became `role="img"` |
| a11y | Switches (28px), the calm-mode peek (32px) and cheer buttons (40px) were under 44px | Bigger hit areas, visuals unchanged |
| a11y (design) | White text on Groww mint is ~2:1 contrast | CTAs use **mint with dark-green text (6.2:1)**; coloured bucket labels became neutral text with a coloured dot |
| Copy lint | "F&O" appeared unexplained on Home (story label); "Direct" on Invest | Renamed the story; Direct is now tap-to-decode |

## Layer 2: persona walkthroughs

I gave five reviewers every screenshot and asked them to role-play honestly. They scored the app 1–5 and named friction with a concrete fix. Four Gen Z personas covered the segments in the brief; the fifth was an expert reviewer (Nielsen heuristics, behavioural finance, SEBI/AMFI compliance):

- **Riya**, 23: first job, Bengaluru, ₹42k/month, ₹18k idle savings, scared of jargon
- **Arjun**, 20: student, Indore, ₹4k pocket money + gigs, Hinglish, impatient
- **Sana**, 25: freelance designer, ₹15–60k irregular, burned by "no-cost EMI", hates nudges
- **Kabir**, 24: sales, Delhi, lost ₹30k in options, wants fast money

> These are synthetic users: a fast way to find obvious friction before real research, **not a replacement for it**. Treat the scores as directional.

### Round 1 → fixes

| Finding (who) | Change |
|---|---|
| Payday assumes a salary; freelancers and students never get the moment (Sana, Arjun) | The income moment is now vibe-aware: "₹18,000 from a client just landed", "Pocket money's in". Irregular income splits a **% of this payment** (5/10/15/20%), not fixed amounts |
| One fixed monthly number is dishonest for gig income (Sana) | Freelancers are asked for a **lean-month** amount; good months get a top-up nudge |
| Plan didn't add up to the chosen amount (Riya, Sana) | New allocator: amounts sum exactly, cushion weighted 2×, a total row, any spare shown |
| "Growth · Big swings, short-term" on a 10-year goal (Riya, Arjun) | Now "Big swings, fine for 5+ yrs" |
| "First job" preselected; slider default too high for students (Arjun) | No preselection; the default amount follows life stage (₹500 for students) |
| Hard-coded "starting at 22"; nothing about idle savings (Riya) | Age removed; an idle-savings question suggests a one-time cushion top-up |
| Squads: "never your amounts" + "added ₹2,000"; a shared target lets % become ₹; leaderboard (Sana, expert) | No ₹ anywhere; everyone sets a private target; fixed order, not ranked |
| "You'll likely have ₹6,68,590": false precision and an AMFI risk (expert) | Shown as a range, "Illustration at an assumed 3–15% a year", labelled weak/typical/strong years |
| Step-up on by default feels like an EMI trap (Sana) | Off by default; shows the exact future amount; promises to ask first |
| Panic check's big green button wasn't what the user tapped; implied guaranteed recovery (expert) | Two equal buttons; "Markets have often recovered… but it isn't guaranteed"; partial withdrawal mentioned |
| Returns dominate fund cards; gold labelled "Balanced"; riskometer missing (Riya, expert) | Cards lead with "Good for: …"; riskometer shown; returns secondary; gold tagged "Commodity · hedge" |
| Trading features feel hidden; slot-machine story and the "finance bro" jab feel mocking; a 24h lock sends him to another broker (Kabir) | Section chips (Funds / Stocks / IPOs / F&O); neutral "Option math" story; jab removed; cool-off is **one-time**; new **Spice pot**: a capped 10% sandbox for single stocks |

### Round 2 results

Each persona re-checked their own round-1 issues against the revised screens.

| Reviewer | Round 1 avg | Round 2 avg | Would start? (R1 → R2) | Round-1 issues resolved |
|---|---|---|---|---|
| Riya (first job) | 3.8 | **4.2** | yes → yes | 3 yes, 1 partly |
| Arjun (student) | 3.4 | **3.6** | yes → yes | 0 yes, 3 partly, 1 no* |
| Sana (freelancer) | 3.2 | **3.6** | **no → yes** | 2 yes, 2 partly |
| Kabir (F&O trader) | 3.4 | 3.4 | **no → yes** | 2 yes, 2 partly |
| Expert reviewer | 3.8 | 3.8 | yes → yes | 1 yes, 3 partly |

| Dimension (avg of 5) | Round 1 | Round 2 | Bar |
|---|---|---|---|
| Clarity | 4.0 | 4.0 | ≥ 4 ✅ |
| Trust | 3.6 | 3.8 | ≥ 4 ❌ |
| Motivation | 3.2 | 3.2 | ≥ 4 ❌ |
| Calm | 4.0 | **4.2** | ≥ 4 ✅ |
| Fit for my income | 2.8 | **3.4** | ≥ 4 ❌ |

\*Arjun's "First job is preselected" was an artifact of the screenshot script, which taps First job before the capture. In the app nothing is preselected, and journey J11 covers this.

**Reading it honestly:** the biggest win is **5 of 5 would now start, up from 3 of 5**. The two sceptics (the freelancer and the burned trader) flipped once income moments respected irregular money and the cool-off stopped feeling like a lockout. Income fit improved most. **Motivation didn't move** (Kabir is still at 2: a goals app is inherently less exciting than options), and trust is held back by the expert's compliance nitpicks. Those are the two bars still unmet.

### Fixes applied after round 2 (not yet re-scored)

| Finding | Change |
|---|---|
| Implied-recovery wording survived on Dip Coach, the Byte title and the gut-check option (expert) | One conditional wording everywhere ("has historically helped, though recovery is never guaranteed"); Byte retitled "…what usually happens next" |
| Green "✓ On track" at ₹0 (expert) | "Not started yet" until the first instalment |
| Highlighted "Typical ₹4.7L" anchor and exact month; different assumed ranges on different screens (expert) | All three scenarios get equal weight; year only; one shared assumption range; past-performance line added |
| "Pause SIP" as the alternative to selling stops buying during a dip (expert) | Replaced with "Keep it invested" |
| Friends still in descending order; squad % averaged different targets (expert) | Neutral order; "3 of 4 have started" instead of an average |
| Stock page read like a buy thesis; chart spike didn't match +8.1% (expert, Kabir) | "What the company does well"; reflection checklist moved into the buy sheet; chart now lands smoothly on today's price |
| "Try ₹100" vs. the real plan was unclear; milestone didn't say when the full goal is affordable (Riya) | CTA names the stash and the full monthly plan; each milestone shows "Full ₹25k: ₹3,100/month, or around 2030 at this pace" |
| A new stash stacked on existing SIPs with no warning (Riya) | Shows "You already put away ₹7,500/month; with this it's ₹13,700", in amber when above comfort |
| Freelancer: tax ignored, fear of a double debit, no consent for spotting payments (Sana) | Optional "Set aside tax first" slice; "No separate auto-debit — nothing moves until you tap"; lean-month progress shown; Account Aggregator opt-in explained |
| "On payday" for people with no payday; IPOs buried (Arjun) | "When money lands" label; an IPO card near the top of Invest, with a reality check |
| ₹750 Spice pot can't buy what's shown; quiz felt like a recurring gate (Kabir) | Cap is 10/15/20% and shows what it buys; "One-time check · 3 questions · 30 sec" |

## Layer 3: what I'd run with real users

**Moderated tests:** 5 users per persona (20 total) on a Figma or coded prototype. Tasks: start your first investment; your stipend just arrived; the market fell 6% — what do you do?; you want to try options.

| Measure | Target |
|---|---|
| Task success, unaided | ≥ 80% |
| Time to first investment | < 3 min |
| "Explain what you just bought" (teach-back) | ≥ 70% correct |
| Single Ease Question per task | ≥ 6 / 7 |
| Anxiety after viewing a dip (1–7 self-report), vs. current Groww | Lower, p < .05 |

**Launch A/B (new 20–26 sign-ups, current Groww vs. this flow):**

- **North star:** % with ≥ 3 contributions by day 90
- **Activation:** first investment within 7 days of KYC
- **Guardrails** (must not regress): F&O activation within 30 days (expected ↓, track churn to other brokers), redemptions during > 3% market falls, SIP bounce rate, complaints and unsubscribes from nudges
- **Business check:** D180 AUM per user, and cross-sell to stocks after 90 days (does the Spice pot keep "action-seekers" on Groww?)

## Limitations

- Personas are synthetic; scores are directional, not data.
- Flesch reading ease was designed for prose; on UI copy it's a rough proxy, which is why it pairs with the jargon lint.
- Data is illustrative; the projection math is sound, but the return assumptions are placeholders until wired to category data.
- The F&O "your own P&L history" variant and paper trading are described, not built.
