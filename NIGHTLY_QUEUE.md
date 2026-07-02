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

### 2. Big Bets — concentrated high-conviction plays (SPEC pending)
Periodic distressed-acquisition / development / private-lending-tranche opportunities with a
**sizing × timing × funding** decision (own cash vs leverage). Can 3× or crater. Plugs into the spine
(right stance/phase = the window). Full spec after #1 lands.

### 3. Drama events — chaos where Protection pays off (SPEC pending)
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

---

## ✅ DONE (shipped to beta — awaiting nothing)
- **`retirement_plan`** — Solo 401(k)/SEP, pre-tax monthly sweep into `_retirement_balance`. *(built)*
- **`hire_your_kids`** — family payroll tax-shift, monthly `wage*tax_rate` credit. *(built)*
- **The Leverage Pack (v0.60.0)** — Pledged Asset Line, Short-Term Rental, Cash-Out Refi, ×N-owned
  shuffled menu, Portfolio dashboard view, `living_trust` Protection fix. *(shipped to beta)*
