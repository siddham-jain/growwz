# Changelog

## [Unreleased]

### Added
- Add tax-first slice, lean-month progress and no-auto-debit promise to irregular income splits.
- Add IPO reality card, adjustable Spice pot cap and new-stash commitment totals.
- Add regression evals for plan arithmetic, irregular income, squad privacy and projection ranges.
- Add vibe-aware income moments with %-of-payment splits for gig and pocket money.
- Add Spice pot: a capped sandbox for single stocks.
- Add persona walkthrough evals and fold findings into the design.
- Add automated eval suite: journeys, suitability matrix, jargon/readability lint, axe a11y, tap targets.
- Add 1-pager, evals doc and generated HTML/PDF versions.
- Add Squads, You tab, demo controls and desktop reviewer shell.
- Add Learn tab with story-style Bytes and Decode glossary.
- Add Invest tab with starter funds, brand-led stocks and F&O reality check with cool-off.
- Add payday split, flex SIP controls, Dip Coach and panic-sell check.
- Add goal-based Stashes with horizon-driven fund suitability and projection ranges.
- Add onboarding to a starter plan and first ₹100.

### Changed
- Show projections as ranges with equal-weight scenarios and a shared assumption range.
- Replace "pause SIP" with "keep it invested" in the panic check.
- Lead fund cards with horizon and riskometer; returns secondary; gold tagged as commodity.
- Remove rupee amounts, shared targets and ranking from Squads.
- Make step-up opt-in and the F&O cool-off one-time.

### Fixed
- Show "Not started yet" instead of "On track" before the first instalment.
- Compare goal ETA at month level so on-deadline goals aren't marked late.
- Make starter plans add up exactly to the chosen amount.
- Size weekly starter SIPs as weekly amounts, not monthly.
- Close the decode sheet on navigation.

### Decisions
- Fund bucket is chosen by time horizon first, risk comfort only nudges one notch — money needed within 2 years never goes into equity, regardless of stated appetite.
- Starter stashes shrink to a reachable first milestone instead of pushing the deadline out — a "goal in 2034" on day one kills motivation.
- Primary CTA is Groww mint with dark green text (6.2:1) instead of white (≈2:1) — keeps the brand colour and passes WCAG AA.
- Calm mode is on by default; daily P&L is a peek, not removed — reduces panic without hiding information.
- F&O is gated, never blocked — autonomy matters to this audience; a hard block just pushes them to another broker.
- Streaks count weeks with any contribution and include freezes — rewards habit over activity and doesn't punish irregular income.
- Irregular income splits a % of each payment instead of a fixed SIP — a fixed amount is dishonest for gig and pocket money and bounces in lean months.
- The panic-check alternative is "keep it invested", not "pause SIP" — pausing stops buying exactly when prices are lowest.
- Synthetic persona walkthroughs are used as a pre-research filter, not evidence — results are reported as directional only.
