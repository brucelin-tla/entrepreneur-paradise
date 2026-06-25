# Release Notes

## v0.14.2 — 2026-06-25
**Dashboard redesign — clearer money/credit, compact vitals**
- Money bar split into three segments: **Cash | Personal Credit | Business Credit**, each showing available + its own utilization %, tap → `showCreditAvail`. (Was Cash + one merged "Credit avail · P/B% used".)
- Stats reordered into a clean second row: **Customers · Revenue · Burn·Runway**, then Credit Score, then the conditional cards.
- New `showRevenue()` breakdown popup (tap Revenue): business income (customers × value/customer, delivery-capacity + seasonal notes) vs. passive/asset income (real estate, private lending, policy), with totals.
- `renderBars` compacted: Energy/Fitness/Freedom and the three skills now render as two 3-column mini-bar rows (~147px) instead of six stacked full-width bars (~220px). Skill labels shortened (Marketing/Operations/Finance).

## v0.14.1 — 2026-06-25
**Credit/loan display fix**
- Loan/credit amounts that scale with `calcCreditCapacity` (or revenue multiplier) now live entirely in the `resolveMonth` handlers. Removed the misleading fixed base $ (cash/total_debt/available_credit/business_credit_limit/insurance_cash_value/real_estate equity & debt/investment_positions) from those actions' config `effects`, so the results effect-list no longer contradicts the dynamic narrative. Affected: `bank_personal_loan`, `business_term_loan`, `business_credit_line`, `qualify_more_credit`, `business_credit_card_0pct`, `premium_financing`, `buy_real_estate`, `private_lending`.
- `buy_real_estate` / `private_lending` handlers now reproduce the full prior totals (incl. the level-scaling that `scaleActionEffects` used to apply to `monthly_revenue`/`operating_expenses`) — behavior preserved, just relocated.
- New `creditPreview(id)` renders an "≈ $X" estimate on the action card (after the description) for all eight actions, computed from current credit/revenue/cash.

## v0.14.0 — 2026-06-25
**Capability gates + money bar**
- Replaced all `monthly_revenue` prerequisites in marketing & finance with capability/structure gates. New `needs:[actionIds]` prerequisite in `meetsReq` (e.g. Paid Ads / Sales / Webinar need `build_offer`). Finance keeps its order via entity/credit/owner-pay/DSCR.
- `getLockedReason` shows "Needs: <action>"; added `actionLabel()` helper.
- Dashboard: Cash + Credit rendered as a full-width money bar (cash | credit avail · P/B util).

## v0.13.9 — 2026-06-25
**Bundled dashboard cards**
- Cash + Credit combined into one card; Monthly Burn + Runway combined into one (5 core cards, ~2 rows)
- Fixed customer label pluralization ("0 customers" / "1 customer")

## v0.13.8 — 2026-06-25
**Consolidated stats dashboard**
- Trimmed the core stat cards (7 early-game vs 13); merged pipeline + customers into one card
- Policy Value, Passive Income, Owner Salary, Staff, Total Loans now show only when non-zero, so the dashboard grows with relevance instead of front-loading empty cards

## v0.13.7 — 2026-06-25
**Smarter auto-pay (business credit to 30%, then cash)**
- `payCost()` waterfall: business credit up to 30% utilization → cash → remaining business credit → personal credit (last resort). Keeps business credit in the healthy zone and preserves liquidity while protecting personal utilization.
- Removed the manual "how do you want to pay?" popup — payment is automatic

## v0.13.6 — 2026-06-25
**Credit priority, restructure timing, runway**
- Funding order is now cash → business credit → personal credit (personal = last resort), protecting personal utilization. New `coverShortfall()` handles action payments and monthly-burn shortfalls.
- Debt Restructure is deferred to after `monthlyTick` (post-expenses), so the utilization fix isn't undone by forced borrowing the same turn
- Added a "Runway" dashboard stat (months of expenses covered by cash + credit), colored red→green; "Profitable" when cash-flow positive
- Fixed dashboard passive-income readout to match the engine ($100k / 10%)

## v0.13.5 — 2026-06-25
**Freeform operations**
- Removed all `monthly_revenue_gte` gates from operations — affordability (cash or credit) + logical structure are the only gates now
- Regrouped operations into three strategic directions: Run It Lean, Build a Team, Productize & Scale
- Lowered full_systemization team requirement (4→2) so a lean operator can still reach "runs without you"

## v0.13.4 — 2026-06-25
**Marketing funnel + action logic**
- Marketing directions now map to the funnel: "Audience & Offer" = lead generation, "Get Customers" = converting leads into customers (lead-gen actions moved out of Get Customers)
- `build_offer` now also generates leads (fits its lead-gen direction)
- `do_work_yourself` requires ≥1 customer — no more delivering client work with no clients

## v0.13.3 — 2026-06-25
**Compact locked actions**
- Locked actions render as compact one-line rows under an "Unlocks next" label instead of full greyed-out cards — tighter menu, less scrolling

## v0.13.2 — 2026-06-25
**Title-screen background art**
- Added a self-contained SVG hero backdrop (dusk skyline, horizon glow, stars, growth line) behind the title; bottom fade keeps text readable. Works on Pages and in the offline build.

## v0.13.1 — 2026-06-25
**Collapsible action menu**
- Direction groups are now an accordion (one open at a time) with option counts — shorter menu, less scrolling, "pick a direction" flow

## v0.13.0 — 2026-06-25
**Menu, situational finance, in-game changelog**
- Action menu grouped by direction; all takeable options visible (no more buried choices)
- Finance actions (credit lines, loans, balance transfer, lending, real estate) scale to the player's real numbers
- End-screen recap ("Left On The Table") shows only options the player actually saw
- Added accumulating "What's New" changelog + version/timestamp on the title screen (driven by `PATCH_NOTES` in js/game.js)

## v0.12.0 — 2026-06-25
**Anti-grind economy**
- Revenue capped by built capacity; progressive tax drag, team coordination cost, leaky-bucket churn; mentor renamed to Bruce

## v0.11.0 — 2026-06-25
**Scoring + teaching layer**
- Scoring rebuilt around capital efficiency; 67 in-the-moment lessons + consequence events; eased early game

---

## v0.10.0 — January 9, 2025
**Game Simplification & Deployment Fix**
- Consolidated 69 actions → 29 (58% reduction)
- Finance: 30 → 12 actions | Marketing: 18 → 7 | Operations: 21 → 10
- Fixed hardcoded action ID arrays for proper deployment
- Added choice within actions (2-4 strategic flavors per card)
- Generalized insurance policy type (UL/IUL/hybrid)

---

## v0.9.0 — June 24, 2026
**Previous Release**
- Core mechanic overhaul
- Difficulty rebalance
- Context-aware sorting

---

## How to Update Version

When making changes, update:
1. **index.html** - Change version string in title screen
2. **RELEASE_NOTES.md** - Add entry with date and changes
3. **Commit message** - Include timestamp in format: `YYYY-MM-DD HH:MM`

Example:
```bash
git commit -m "Feature: Add new mechanic — 2025-01-09 14:30

Description of changes...

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```
