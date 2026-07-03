# Entrepreneur Paradise — Design North Star

> This is the top of the design pyramid. Every feature, mechanic, number, and bug
> fix must be checked against this document. If a change doesn't serve the vision
> below, it doesn't ship. When in doubt, re-read the Governing Principle.

## 1. Vision (the one sentence)

A realistic financial simulation where players learn to build massive wealth and a
dream lifestyle the way the wealthy actually do it — **leveraging good debt, building
credit and banking relationships, and turning life-insurance cash value into passive,
tax-free income** — and *feel* the "aha" when efficiency compounds.

## 2. What it is FOR

**Edutainment.** It must be genuinely fun to play AND teach real financial concepts.
Fun is the delivery vehicle; the lesson is the payload. Neither alone is acceptable.

## 3. Core player feeling

**Realistic "aha" moments.** "Oh — *that's* how credit / good debt / cash flow /
infinite banking / tax structure actually work." The satisfaction comes from
understanding a real mechanism and watching it pay off, not from arbitrary points.

## 4. Win condition — what "winning" means

The player wins by achieving **financial efficiency**: maximum wealth and a dream
lifestyle with minimum of their own money and time tied up. Concretely, success =
the player learned and executed this chain:

1. **Build credit & banking relationships** → access to capital.
2. **Leverage good debt** → use other people's money to acquire cash-flowing assets.
3. **Fund life-insurance cash value** → build a tax-advantaged capital base.
4. **Turn cash value into passive, tax-free income** → money that arrives without work.
5. **Efficiency compounds** → wealth + freedom + the dream lifestyle ("paradise").

Raw business revenue is **fuel for this engine, not the goal.** A player who grinds
revenue but never leverages, never builds passive income, and never structures for
tax efficiency should NOT be able to top the score.

## 5. Governing Principle (the filter for every decision)

> **The intended financial path must be the OPTIMAL path.**
> Brute-force revenue grinding must hit a ceiling that forces players to discover
> leverage, credit, insurance, and tax strategy. The lesson and the winning strategy
> are the same thing.

Test any proposed change with: *"Does this make the leverage/credit/insurance/passive
path more rewarding, more reachable, or more clearly understood?"* If no, deprioritize.

## 6. The Golden Path (what a winning run should look like)

Foundation → establish entity (LLC), build personal + business credit, protect income.
Leverage → open credit lines / banking relationship, deploy good debt into the business
and first assets, elect S-corp, fund a cash-value policy.
Wealth → borrow against policy cash value for tax-free income, acquire real estate /
private lending with leverage, structure for tax efficiency and asset protection,
reduce owner dependency to near zero. End in "paradise": passive income covers a rich
lifestyle, net worth is high, and the founder is free.

## 7. Design guardrails (derived from the above)

- **Passive, tax-free income is the crown jewel** — it must carry the most scoring weight.
- **Good debt ≠ bad debt.** Asset-backed/productive debt must be modeled and rewarded
  (or at least not penalized) differently from consumer/collections debt.
- **Leverage efficiency is a first-class metric** — controlling large assets/income with
  little of your own cash is the skill being taught; the score must see it.
- **Revenue saturates.** Grinding plateaus so players must graduate to leverage.
- **Lifestyle gates the win.** Wealth earned by wrecking health/relationships is not
  "paradise" — low lifestyle should cap the final score.
- **Every mechanic should be legible.** If a player can't tell *why* something worked,
  the "aha" is lost. Surface the cause (e.g. "tax-free because it's a policy loan").

## 8. Alignment gaps — status (updated 2026-07-03; originally "fix first" blockers)

The four original blockers are addressed in code (`scoring_weights.json` v3 +
`calculateFinalScores`); verified against source 2026-07-03:

- ✅ **Scoring key mismatch** — fixed. Scoring reads the engine's real keys
  (`insurance_cash_value`, `real_estate_equity`/`real_estate_debt`, `investment_positions`,
  `private_bank_balance`); the intended path scores.
- ✅ **Good vs bad debt** — fixed. Net worth subtracts bad debt (cards/collections) fully,
  other debt at half, and asset-backed/productive debt not at all; leverage efficiency is a
  first-class score (OPM multiple, safety-gated against margin calls / reckless LTV).
- ✅ **Revenue over-weighting** — fixed. `business_revenue` carries ZERO composite weight
  (fuel, not the goal); revenue saturates via `revenue_capacity` in `monthlyTick`.
- 🔶 **Passive/tax path reachability** — heavily built out (Epic Life hub, roadmap, ALIS,
  policy funding flow) but reachability-for-a-novice is validated only by owner + bot
  playtests so far. Open until external novice playtesters confirm the "aha" lands
  (see CLAUDE.md "Pending work" → process-remedy queue).

New gaps found later get logged here first. Keep this section truthful — the `/release`
and `/promote` doc-truth step checks it every ship.

## 9. Build order (working backwards from the goal)

1. **Win condition / scoring** — encode "efficiency creates wealth." (done — scoring v3)
2. **Make the golden path dominant & reachable** — rewards + unlock flow + legibility.
3. **Cap brute-force grinding** — revenue saturation.
4. **Balance numbers** — energy, archetype starts, costs — toward the defined target.

---
*Scoring weights live in `config/scoring_weights.json` (v3) — six end-game pillars per this
document; passive income carries the top weight, `business_revenue` carries none.*
