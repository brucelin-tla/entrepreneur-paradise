# Part 2 Design Backlog — Entrepreneur Paradise

**Routines are now PREPARE-ONLY.** The night routines (`part2-lab`, `part2-research`) research,
playtest, and write proposals + reports — they do NOT build game code, commit, or change balance
numbers overnight. This file is a **design backlog the owner + Claude build in-session**, top-down
by priority. The owner approves; Claude builds and verifies during a working session.

**Part 2 north star:** the small-business owner has their machine built — now it's about **capital
allocation under uncertainty.** Read economic trends & company drama; make big risky bets or play
it safe; the right call in the middle of chaos. Every item must serve DESIGN.md (leverage / credit /
insurance / passive-tax-free income is the OPTIMAL path; brute-force revenue hits a ceiling) and be
LEGIBLE — surface WHY to the player. Prefer ELEVATING existing systems (the macro cycle, buy-the-dip,
margin calls, survival runway) over net-new systems.

---

## ▶ NOW — build next in-session (Part 2)

> ### 🏦 THE CAPITAL ENGINE — the Part-2 umbrella (owner-set direction, 2026-07-02)
> Everything in Part 2 serves one loop: **the player's blended cost of capital vs. their yield on
> capital, and how that spread widens over 36 months.** Borrow cheaper than you earn, keep the
> spread wide, recycle relentlessly — the Epic Life method stated as a game loop.
> The stations: the **Cycle Spine** (#1) decides WHEN to lean on the engine; the **Banking Ladder**
> (#2) grows access + drops the cost of capital over time; **0% stacking** (#3) and **Dream Home +
> HELOC** (#4) are the cheap-capital sources; **velocity banking** (built) is the debt-attack loop;
> the **Cost-of-Capital readout** (#5) makes the whole spread visible and optimizable; **Big Bets**
> (#6) are the non-traditional deals the top of the ladder unlocks; the **dream life** is what the
> passive income pays for (lifestyle funded by cash flow, never principal).
> **Build order:** 1 → 2 → 3 → 4 → 5 → 6. Each is a shippable beta rev on its own; do not mega-merge.

### 1. The Cycle-Reading Spine  ⭐ SPEC — owner review before build
**The core Part-2 loop.** Turns the (currently invisible) macro cycle into the main event: each
quarter the player *reads* fuzzy signals and *picks a stance*, then lives with the reckoning. This is
the spine everything else (Big Bets, Drama) plugs into. Build this FIRST.

**Grounds on what already exists** (do not reinvent): `_CYCLE_PHASES` (expansion→boom→downturn→
recovery, jittered `_downturn_start`/`_downturn_len`/`_downturn_depth`), `_asset_discount`,
`_credit_tight`, `_market_rate`, `_index_return`, the buy-the-dip payoff, and the RE + PAL margin
calls. Today these run in the background; the spine promotes them to a decision.

**A) The Signals Panel (READ) — fuzzy, not a readout.** Each Part-2 quarter (month ≥19, every 3
months → ~6 decision points) surface **2–3 noisy leading indicators** hinting at the phase without
confirming it. Derive from live state + a noise layer so they can mislead:
- credit loosening/tightening (`_credit_tight` + `_market_rate` trend)
- assets frothy/cheap (`_asset_discount`)
- "rivals are levering up / getting cautious" (flavor hint at a top / capitulation)
- the index ran hot / just printed 0% (`_index_return`)
Noise is the point — experts weigh signals, they don't get a crystal ball; the jitter keeps it unsolved.

**B) The Stance Decision (ACT) — one legible choice.** Each quarter pick a capital-allocation stance
(stored `_capital_stance`), which tunes how existing systems behave for the next quarter:
- **Risk-On / Aggressive** — deploy dry powder, lever toward a higher LTV target. Wins entering
  recovery/expansion (cheap assets + credit); punished at the top (overpay, margin-call exposure).
- **Risk-Off / Defensive** — hold dry powder, deleverage, build reserves. Wins into a downturn (you
  become the buyer when others are forced sellers); costs upside if the boom keeps running.
- **Balanced / Hedge** — split. Lower variance, lower ceiling.
Stance feeds: buy-the-dip deploy size, the leverage target that nudges the margin-call thresholds,
and the reserve target that feeds survival runway.

**C) The Reckoning (PAYOFF).** When the cycle phase flips, resolve the read: stance-matched-phase →
reward (bought the dip / dodged the top); misread (aggressive into a bust, defensive through a boom)
→ the existing margin-call / missed-gains consequence fires. The margin-call & buy-the-dip systems
BECOME the scoring of the read.

**Legibility:** after each cycle turn, one plain-English line — "You held dry powder as credit tightened,
then bought distressed assets at a discount — textbook," or "You levered up at the top; the downturn
forced a sale." **Why it stays fun for experts:** jittered timing + noisy signals mean no dominant
"always-aggressive / always-defensive" line; each run's cycle differs; stakes ratchet with net worth.

**Implementation sketch (in-session):** a quarterly Capital-Allocation decision (reuse the event/
decision UI), gated `month≥19 && month%3===0`; signals computed from the cycle state + noise;
`_capital_stance` read by the buy-the-dip deploy, the margin-call thresholds, and the reserve target;
reckoning narrative emitted from `monthlyTick` on phase flip. **Open questions for the owner:** exact
stance effects/magnitudes, how loud the signals are (how readable vs punishing), and whether stance is
locked for the quarter or re-choosable.

### 2. The Banking Relationship Ladder  🏦 SPEC — the engine's progression spine
**The gap:** `banking_relationship` is a one-time +$5k bump, then the bank goes dead. In real life —
and in the Epic Life method — the relationship IS the asset: it compounds into bigger lines, cheaper
rates, and access to instruments retail customers never see.

**The mechanic — four tiers, climbed by track record, not by clicking:**
- **Tiers:** Local bank → Regional → Commercial → **Private banking**. Stored `_bank_tier` (0–3).
- **You qualify, you don't buy:** tier advancement reads what banks actually read — months of
  on-time history (no missed-payment flags), deposit balances (avg cash), DSCR, utilization
  discipline (<30%), years operating, net worth. Meeting a tier's bar surfaces a "the bank invites
  you upstairs" event; the player takes a meeting (finance move) to accept.
- **Each tier pays three ways:**
  1. **Size** — `calcCreditCapacity` gets a tier multiplier: lines/loans scale up per tier.
  2. **Price** — the player's borrowing spread over `_market_rate` narrows per tier (this is the
     cost-of-capital lever; it feeds the #5 readout directly).
  3. **Access** — instruments gate on tier: PAL + premium financing become Commercial/Private
     unlocks; Big Bets (#6) deal flow opens at the top ("deals your banker calls YOU about").
- **It can go backwards:** missed payments / maxed utilization / a margin call dents the
  relationship (tier freeze or demotion warning first — legible, not gotcha).
- **Legibility:** a small bank-tier chip on the dashboard + a "what the bank sees" panel (the
  qualifying stats vs. next tier's bar) — teaches players to read themselves like a lender does.
- **Open for owner:** the four tier bars (numbers), rate discount per tier, whether demotion is
  real or warning-only.

### 3. 0% Business Card Stacking — the promo-cliff mechanic  💳 OWNER-REQUESTED (2026-07-02)
**The gap:** a `business_credit_card_0pct` action existed pre-simplification and was cut. Today
business credit limit is a ladder of one-time bumps (Banking Relationship +$5k, Holding Co +$12k,
Business Credit Line ≈$15k×capacity) and then goes static. There is NO repeatable "expand your 0%
business credit" loop — yet funding via 0% business cards is literally the Epic Life entry move.

**The mechanic (small, self-contained — can build before or alongside #1):**
- Repeatable finance action **"Stack 0% Business Cards"**, gated on `business_credit_profile`
  established + personal score threshold; each take adds `business_credit_limit` scaled by
  `calcCreditCapacity`, with diminishing size per round (banks see the inquiries).
- **The promo cliff is the lesson:** each stacked tranche carries an intro window (~12–15 months,
  tracked per-tranche, e.g. `_promo_tranches:[{amt,expires}]`). While in-window: 0% carry. When it
  expires with a balance still on it: interest kicks in hard (+ monthly drag, credit-score pressure)
  unless paid down or moved (Restructure Your Debt becomes the natural escape valve — its "0% intro
  buys time" lesson text finally gets real teeth).
- Pairs with the existing `liquidateCredit` credit→cash move: stack → liquidate → deploy → clear
  before the cliff. That's the actual TLA funding sequence, now playable and testable.
- **Legibility:** the card row / money bar shows "0% until m24" per tranche; the cliff month fires a
  plain-English reckoning line either way (cleared it = "free money, executed" / carried it = the cost).
- **Compliance note:** frame as education ("how 0% intro windows work"), no bank names, no
  guaranteed-approval implication — consistent with existing action lesson style.
- **Open for owner:** intro window length, how punishing the cliff is, stack cap (rounds or total
  limit), whether failed stacking attempts ding the score.
- **Engine tie-in:** ladder tier (#2) sets the stack cap and tranche size — better bank, bigger stacks.

### 4. Dream Home + HELOC — one asset, two systems  🏡 SPEC (un-parks HELOC, 2026-07-02)
**The insight that un-parked HELOC:** the game has no personal residence, which killed HELOC-as-
capital (it just duplicated Cash-Out Refi/PAL). But the owner also wants **dream-life building** —
and buying your dream home is BOTH: a lifestyle milestone AND a personal asset you can borrow
against. One purchase feeds two systems, and HELOC stops being a duplicate.
- **Buy the Dream Home** (lifestyle action, Wealth stage): big down payment + mortgage; adds
  `_home_value`/`_home_debt` to state; feeds `calcFreedom` (a top-tier lifestyle line); price scales
  with `_asset_discount` (the cycle applies — buying the house at the top is a real mistake).
- **Open a HELOC** (finance action, gated on home equity): revolving line vs. the house, distinct
  from Cash-Out Refi (lump sum vs. rentals) and PAL (vs. portfolio). Draws fund deals or feed
  **velocity banking** — the HELOC velocity vehicle finally attacks a REAL mortgage instead of the
  rental portfolio's.
- **The teaching edge:** borrowing against your home is the sharpest personal-vs-business line in
  the game — the safeguards (reserves, protection, LTV cushion) matter MORE here. Misuse should
  sting harder than any business-side leverage. Frame per compliance: education, not advice.
- **Dream-life rule (applies to ALL lifestyle purchases):** funded by passive income, never
  principal — the scoring's strong-lifestyle gate becomes playable: passive covers the home, the
  travel, the toys. The crown jewel (passive tax-free income) is what pays for paradise.

### 5. Blended Cost-of-Capital Readout — the legibility layer  📊 SPEC
One dashboard line + expandable panel: *"Borrowing at 3.4% blended · portfolio yielding 8.9% ·
spread +5.5% on $410k deployed."* Computed from every liability's rate (cards/tranches, lines,
mortgages, HELOC, policy loans, MCA if you were desperate) weighted by balance, vs. yield on
deployed assets (rentals, STR, index, private lending, passive). Every move visibly moves the
spread — stack a card, climb a tier, velocity-attack a loan, refi. Experts min-max it; new players
finally SEE why the methodology works. Without this, the engine is invisible plumbing. Build after
#2–#4 exist so the readout has real inputs (a thin v1 after #2 is fine).

### 6. Big Bets — concentrated high-conviction plays (SPEC pending)
Periodic distressed-acquisition / development / private-lending-tranche opportunities with a
**sizing × timing × funding** decision (own cash vs leverage). Can 3× or crater. Plugs into the spine
(right stance/phase = the window) and **gates on the Banking Ladder** — the non-traditional deals
are what a Private-banking relationship buys: your banker calls YOU. Full spec after #1–#2 land.

### 7. Drama events — chaos where Protection pays off (SPEC pending)
Branching crisis events (partner cash-out, key-operator defection, lawsuit, aggressive-tax audit,
rival's move, health/liquidity crunch) whose menu + outcome are set by earlier Protection choices
(trust / insurance / entity / reserves). Reuses the event system. Full spec after #1.

---

## ⏸ PART 1 BACKLOG — deprioritized (not the current focus)

Older Part-1 tax tactics. Fine to build opportunistically, but Part 2 comes first.
- **Deepen `elect_s_corp`** (salary-vs-distribution SE-tax lesson + audit-risk if salary too low). *Possibly partially present — verify before building.*
- **Augusta Rule** (`augusta_rule`, §280A(g)) — not built.
- **Wealth-stage irrevocable / dynasty trust** (`asset_protection_trust`, sets `trust_structure='dynasty'`) — not built. Note: `living_trust` now sets `basic_llc`; this is the wealth-stage upgrade.
- **Player feedback UI + anonymous telemetry** (client-side only, no-op endpoint hooks) — not built.

---

## 🔒 NEEDS OWNER INPUT (do NOT auto-build)
- **Balance-tuning numbers** — the routines PROPOSE tuning from playtest data; the owner picks the
  actual numbers (per `verify-design-decisions-first`).
- **Feedback/telemetry backend** — Supabase tables + endpoint wiring; needs owner credentials.
- ~~**HELOC as a capital source (PARKED 2026-07-02, owner-raised).**~~ **UN-PARKED same day** —
  resolved by the Dream Home insight: the personal residence enters the game as a lifestyle asset,
  making HELOC a distinct (non-duplicate) capital source. Spec: NOW item #4.

---

## ✅ DONE (shipped to beta — awaiting nothing)
- **`retirement_plan`** — Solo 401(k)/SEP, pre-tax monthly sweep into `_retirement_balance`. *(built)*
- **`hire_your_kids`** — family payroll tax-shift, monthly `wage*tax_rate` credit. *(built)*
- **The Leverage Pack (v0.60.0)** — Pledged Asset Line, Short-Term Rental, Cash-Out Refi, ×N-owned
  shuffled menu, Portfolio dashboard view, `living_trust` Protection fix. *(shipped to beta)*
