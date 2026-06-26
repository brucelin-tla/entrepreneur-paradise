# Release Notes

## v0.17.1 — 2026-06-25
**Bug fixes for the separated-cash regressions + balance pass**

- **Staff no longer vanish:** the payroll-layoff check now runs *after* this month's revenue and counts ALL available credit (personal + business), only laying off if you genuinely can't make payroll (was checking pre-revenue and could fire immediately). Root cause of disappearing staff was also an event (`market_recession` "cut expenses") combined with the next item.
- **`operating_expenses` / `cogs` can never go negative:** clamped `≥0` in `applyEffects`. Negative opex was free money (`cash += revenue − opex`) — e.g. a −$3,000 opex event drove it to −$2,600.
- **IUL funding fixed + made aggressive:** the monthly contribution is folded into the owner-draw (`personalExp`, credited `×0.98`) so it actually funds from the business — previously the auto-fund read `personal_cash` (~$0 early) and silently skipped. Now scales with revenue: `min(15% revenue, businessLevel×5000)`. (Cash value: stuck at ~$3k → ~$70k by month 12 in testing.)
- **Bigger owner draw / personal income:** `owner_pay` auto-scales to `min(operating profit, max(living+1500, 25% revenue))` every month (not just after S-Corp). Pre-revenue $0; once profitable it covers living + the IUL with real surplus accumulating in `personal_cash`.
- **`debt_restructure` stays comprehensive + de-duplicates the menu:** restored the full play (0% business line `12000×cf` + installment paydown + shift personal balances onto it + `5000×cf` working cash). Once it's available (finance at leverage stage + LLC + score ≥600), `getAvailableActions` hides the now-redundant `bank_personal_loan` / `business_term_loan` / `business_credit_line` / `qualify_more_credit`.
- **Event scaling pass:** `scaleEventEffects` now scales cash/revenue `×min(6,level)`, opex/cogs/total_debt `×min(3,level)`, plus a **never-fatal cap** — a single event's negative cash hit can't exceed ~60% of everything you could tap (cash + personal cash + all credit). (Verified: a raw −$100k event capped to −$6k for a small player.)
- Verified: `bank_personal_loan` routing correct (pre-LLC personal installment, post-LLC business — installment excluded from utilization). Staff stick and grow; IUL grows fast; owner pay/personal cash scale; no negative opex; full 36-month runs (new + stuck) finite/stable; no console errors.

## v0.17.0 — 2026-06-25
**Legal owner-draw model: capital account + pass-through tax + business-credit liquidation; Business gauge bars**

- **Business gauge bars:** Leads / Customers / Staff now render as mini-bars at the bottom of the Business column (new `cgauge` helper), mirroring Energy / Personal Mastery / Freedom on the Personal side. Fill = `min(100, leads)`, `min(100, customers)`, `min(100, staff×10)`; the actual count is the value shown. Replaced the plain count rows; Owner Equity moved up into the financial rows.

When personal cash can't cover personal expenses (separated/post-LLC), the engine no longer commingles by spending business credit directly on personal costs. Instead (`monthlyTick`):
- **Funding waterfall:** personal cash → owner draw from business cash → **liquidate the business credit line (~6%) into business cash, then draw** → personal credit as the last resort. Each draw runs through `_recordDraw`.
- **Capital account (owner equity):** new `capital_account` state — grows by monthly retained net income (`revenue − cogs − opex − owner_pay − pass-through tax`) and is reduced by every owner draw. Shown as an **Owner Equity** row on the Business panel and in the Income breakdown, with cumulative `_owner_draws_total`.
- **Pass-through tax to personal, settled at year-end:** the existing year-end tax event (`showTaxEvent`/`resolveTax`, months 12/24/36) now bills the **personal** side when separated (LLC/S-Corp pass-through) — "pay from cash" gates on `personal_cash`, and cash/reserve/partial payments track `personal_tax_ytd`. The optional **Set Up Monthly Tax Reserve** action pre-funds it from `personal_cash` into `tax_reserve` (so no reserve = year-end lump; reserve = smoothed monthly). No standalone monthly tax drain (removed the earlier double-count); business-side reserve stays gated to non-separated.
- Verified headless: business-credit liquidation funds the draw when business cash is short; draws/capital/pass-through tax all track; full 36-month run finite with no spiral; personal cash self-balances positive; no console errors.

## v0.16.0 — 2026-06-25
**Personal/business cash routing for policies & loans + "NEW" action badges + random-events balance pass**

Personal/business breakdown separation:
- `showRevenue` → "Income Sources" split into **Business Revenue** (customers × value) and **Personal Income** (owner salary/draw + passive/asset income incl. policy).
- `showBurn` → split into **Business** (opex, COGS, owner salary, debt service, tax reserve) and **Personal** (living, lifestyle) subtotals.
- `showCreditScore` → "Credit Scores" split into **Personal — FICO** (300–850) and **Business — D&B** (0–100, via `calcBizCreditScore`); DTI factor now gated to `monthly_revenue > 2000` so it doesn't show absurd % at near-zero revenue. (`showCreditAvail` / `showDebt` were already split.)
- **Policy cash value as personal asset:** new "Policy Value" row in the Personal dashboard column (links to the policy breakdown); already counted in net worth.
- **Personal income increases personal cash:** rewrote the owner-draw in `monthlyTick` to explicitly transfer salary business→personal as income, then pay personal living/lifestyle from `personal_cash` (top-up draw only if salary fell short) — so salary surplus + passive visibly accumulate in personal cash. Verified: 5000→9302 in one month with a 6k salary.

Cash-pool routing (matches the separated economy):
- **Accumulation policy is personal:** `setup_accumulation_policy`, `fund_accumulation_policy`, `policy_loan`, `premium_financing`, `activate_passive_income` action costs now route through `payCost(..., fromPersonal=true)`; the monthly auto-fund deducts from `personal_cash` (not business) when separated; `policy_loan` proceeds pay into `personal_cash`.
- **Loans follow LLC status:** `bank_personal_loan` and `business_term_loan` book the debt to `business_installment_debt` when `isSeparated()` (LLC+), else `_installment_debt` (personal). (`debt_restructure` already requires an LLC.)
- **Protection bundle is a business expense:** `combined_insurance` → "Business Insurance Stack" now includes **general business liability** alongside income protection + key-person life (the one life policy the business buys). Effects `operating_expenses` 400→550, `litigation_exposure` −5→−15; cost $400→$500. Still paid from business (`operating_expenses`).
- Verified headless: LLC loan → business debt, sole-prop loan → personal debt, policy loan → personal cash, monthly funding deducted from personal cash; no console errors.

**"NEW" action badges + random-events balance pass**

- **NEW badge:** `renderActions` records `_action_new_month[id] = this.month` the first time an action becomes available (added alongside the existing `_actions_seen` tracking). The card shows a green `NEW` pill + `.is-new` accent border while `_action_new_month[id] === this.month`, so it persists across re-renders that month and clears next month. New CSS `.new-badge` / `.action-card.is-new`.
- **Events rebalance** (`config/events.json`, philosophy: revenue *gates* events, doesn't inflate bad-event probability; preparation pays off; the wealth engine is rewarded):
  - Stopped revenue-scaling negative probability on `founder_health_crisis`, `capital_crunch`, `major_lawsuit_wealth` (→ `null`); reduced `liability_lawsuit` (1.5e-6→5e-7) and `scaling_chaos` (2e-6→6e-7) scale factors.
  - Reduced brutal magnitudes: `liability_lawsuit` settle −12k→−6k; `major_lawsuit_wealth` settle −25k→−12k & unprotected_extra −35k→−20k; `major_lawsuit` settle −25k→−15k; `tax_audit` attorney −10k→−7k.
  - Filled mitigation gaps: `rate_hike` `mitigated_by` []→[banking_relationship, advanced_tax_strategy]; `capital_crunch` gained a "Cover from cash reserves" choice (no debt) + `mitigated_by` [banking_relationship, setup_accumulation_policy].
  - `health_scare`: moved `income_protection` from probability-mitigation into a proper `protection` block (shielded_when insurance_coverage≥1, else −4k ER bill).
  - `key_client_loss` scale_factor 0.5→2 (churn-rate scaling was effectively dead). `real_estate_deal` base .03→.05 + scales with `personal_credit_score` (strong credit surfaces more deals).
  - **Added 2 positive wealth-path events:** `policy_loan_opportunity` (borrow tax-free against cash value into a passive position — uses non-scaled stats to avoid the cash ×level blowup) and `passive_income_milestone` (celebrate recurring tax-free income). Corrects the EV asymmetry where only defensive safeguards were rewarded.
  - `checkEvents` now collects all events that pass their roll and picks one at random (was: first in array order) — removes array-order bias, fair variety.
  - Verified headless: all new/edited events fire and resolve (both choices) with no errors/NaN; `meetsReq` handles the new `insurance_*` requires.

## v0.15.0 — 2026-06-25
**Personal/Business dashboard split + marketing & ops reorg + wealth-path cleanup**

Dashboard rebuilt as two side-by-side columns (`renderStats`) — **Personal (left, accent) | divider | Business (right, blue)** — clean label/value ledger rows instead of scattered cards. The `showCreditAvail` and `showDebt` popups got matching colored section headers (Personal=accent, Business=blue, Policy=gold) for clear separation. Panels:
- **Personal**: cash, credit score, credit avail (+util), income/mo (owner pay + passive), expense/mo (living + lifestyle), loans (personal revolving + installment + policy loan).
- **Business**: cash, **D&B-style score 0–100** (`calcBizCreditScore`, shown as `xx/100`), credit avail (+util), revenue/mo, expense/mo (opex + COGS), loans (biz revolving + installment + RE), then Leads → Customers → Staff. **Locked until an LLC is formed**
- Container forced to `display:block` so the two flex columns fill the full width (the `.stats-grid` 3-col CSS was clamping it to a third); verified at 390px mobile width. (`isSeparated()` = entity ∉ none/sole_prop); shows the requirement until then.
- Removed the three skill bars (Marketing/Operations/Finance) from `renderBars`; renamed **Fitness → Personal Mastery** (the `fitness_level` mechanic is unchanged, display-only rename). Skill *mechanic* still applies under the hood.

True separate balances (economy refactor in `monthlyTick` / `payCost`):
- New `personal_cash` pool + `personal_cash` init. Pre-LLC everything stays commingled in `cash`. Post-LLC: business `cash` takes revenue and pays COGS/opex/debt service, then an owner draw/salary `= max(owner_pay, living+lifestyle)` transfers business→personal; personal pays living/lifestyle from `personal_cash`; passive income (policy loans + RE/lending `other_monthly_revenue`) lands in personal. Stopped folding passive into `monthly_revenue` (now business-only revenue).
- Solvency preserved: a personal-cash deficit rolls back into the business shortfall handler, so no new soft-lock paths. Lifestyle action costs draw from personal cash/credit when separated (`payCost(amount, fromPersonal)`). Net-worth score now includes `personal_cash`.
- Verified headless: pre- and post-LLC `monthlyTick` produce finite values and a correct split; `renderStats` renders both locked and unlocked states without error; no console errors.

Finance bundled 30 → 22 actions (overlapping actions merged into stronger single moves). Each bundle **registers its constituent legacy IDs** into `_completed_actions` so all event `mitigated_by`, debrief checks, and tax-drag `_completed_actions.includes(...)` keep working unchanged:
- **establish_business** ("Form LLC & Set Up Books") = `form_llc` + `open_business_account` + `basic_bookkeeping`; $700; bookkeeping is now a recurring +$150/mo `operating_expenses`.
- **build_personal_credit** = `build_personal_credit_repair` + `_optimize`; $600; removed the score-based either/or stage filter.
- **debt_restructure** (enhanced) = absorbs `business_credit_strategy` — full optimal play in one move: installment paydown (deferred `applyDebtRestructure`) + 0% business line (`12000×cf`) + shift personal balances onto it + `5000×cf` working cash; $800; leverage stage, gated by LLC + score ≥600.
- **combined_insurance** = `income_protection` + `keyman_insurance`; $400 + recurring premium; replicates the coverage calc.
- **elect_s_corp** ("Elect S-Corp & Operating Agreement") = `payroll_setup` + `s_corp_election`; $2,500; dropped the old double-charged $3,500 payroll opex (owner pay now flows via the draw model).
- **advanced_tax_strategy** = `tax_planning_session` + `tax_optimization`; $3,500; replicates the `tax_rate −0.02` handler.
- **asset_protection_stack** = `multi_entity` + `asset_protection`; $10,000; relaxed the real-estate prereq for reachability.
- Removed the standalone `business_credit_strategy` handler/creditPreview/util-boost refs (folded into debt_restructure). Verified headless: all 7 bundles register legacy IDs and apply effects; entity chain llc→s_corp→multi_entity; no console errors.

Finance also consolidated from six ADIR groups into three (matching Marketing/Operations):
- **Foundation & Credit** (13): entity/books (`open_business_account`, `basic_bookkeeping`, `form_llc`) + credit-building (`build_personal_credit_repair/optimize`, `pay_down_debt`, `debt_restructure`) + capital (`bank_personal_loan`, `business_credit_strategy`, `business_credit_line`, `qualify_more_credit`, `business_term_loan`, `banking_relationship`) → credit score + borrowing power.
- **Tax & Protection** (9): `income_protection`, `payroll_setup`, `s_corp_election`, `multi_entity`, `monthly_tax_reserve`, `tax_planning_session`, `tax_optimization`, `keyman_insurance`, `asset_protection` → tax efficiency + protection.
- **Wealth & Passive Income** (8): `setup_accumulation_policy`, `fund_accumulation_policy`, `activate_passive_income`, `policy_loan`, `premium_financing`, `buy_real_estate`, `private_lending`, `acquire_competitor` → passive tax-free income + net worth.
- ADIR-only change; all 30 actions retained (verified: 13+9+8, no drops/dupes/dangling refs).

**Marketing funnel reorg + action cleanup/balance pass**

Marketing reorganized into three outcome-matched buckets (ADIR `marketing` groups):
- **Offer & Value** (`build_offer`, `brand_pr_push`, `content_engine`, `franchise_licensing`) — drive value-per-customer via `brand_equity` (feeds `revPerCust`) + `revenue_capacity`.
- **Lead Generation** (`cold_outreach`, `local_networking`, `basic_social_content`, `paid_ads_test`, `lead_magnet`, `referral_asks`, `referral_partnerships`, `jv_affiliate_network`) — primary lever is `leads`.
- **Sales & Conversion** (`webinar_funnel`, `build_sales_team`, `crm_pipeline`, `email_campaign`) — feed new **`sales_conversion`** stat.
- New `sales_conversion` lever: `convRate` (and dashboard convPct) now use `min(0.20, sales_conversion*0.01)` instead of per-id completion flags (`offerB`/`crmB`/`salesB` removed). Each sales action grants points (sales team +7, CRM +6, webinar +5, email +4); diminishing-returns on repeats keeps it bounded. Display base conv unified 0.03→0.05 to match engine.
- Stripped the dead `monthly_revenue` numbers from all marketing `effects` (recomputed away each tick — they only mislead). Real revenue still flows from `customer_base × revPerCust`.

Operations reorganized into three outcome-matched buckets (ADIR `operations` groups):
- **Capacity & Delivery** (`do_work_yourself`, `hire_first_contractor`, `hire_delivery_team`, `fulfillment_system`, `build_ip`, `vertical_integration`, `multi_location`) — drive `revenue_capacity` / throughput / margin (`cogs`).
- **Systems & Freedom** (`write_first_sop`, `basic_automation`, `project_management`, `hiring_pipeline`, `middle_management`, `full_systemization`, `hire_fractional_cfo`, `hire_hr_manager`) — drive `systems_maturity` ↑ + `key_person_dependency` ↓.
- **Quality & Retention** (`basic_quality_control`, `client_onboarding`, `hire_client_success`) — drive `churn_rate` ↓.
- **Cut** `hire_sales_rep` and `hire_content_creator` (dedup — they duplicated marketing's `build_sales_team` / `content_engine` and reached into marketing's domain); removed their `monthlyTick` auto-effects. Ops 20→18.
- Stripped dead `monthly_revenue` from `do_work_yourself` (now pays real `cash`), `multi_location`, `vertical_integration` (real levers `customer_base`/`cogs` carry it). No new stat needed — all three levers already existed and were wired.

**Wealth-path dedup + balance:**
- **`fund_accumulation_policy`** is now a one-time "Start Monthly Policy Funding" toggle. Handler computes a monthly allocation from `monthly_revenue*0.10 + cash*0.03 + bizAvail*0.02` capped at `businessLevel*3000`; `monthlyTick` auto-fund now credits **98%** of the contribution to cash value (~2% cost of insurance). Removed the dead `insurance_cash_value:10000` effect and the spam-to-win loop (was repeatable, free, +$30k/click).
- **Passive income** no longer auto-unlocks at a cash-value threshold. New one-time **`activate_passive_income`** (wealth; needs `setup_accumulation_policy` + `insurance_cash_value_gte:5000`) sets `_passive_income_active`. `monthlyTick` then pays `cv*0.06/12` to cash, accrues it to `insurance_passive_loan_total` **and** `insurance_loan_balance` (shows under Loans); loan balance compounds `*1.0041`/mo (~5%/yr) with no cash impact; cash value still grows ~7%/yr. Replaced every `cv>=100000`/`>=250000` gate (dashboard, `showCreditAvail`, freedom note, debrief, scoring) with the `_passive_income_active` flag.
- **Merged** `business_credit_card_0pct` + `balance_transfer` + `move_debt_to_business` → single one-time **`business_credit_strategy`** (qualify 0% business line via `calcCreditCapacity` + shift personal revolving onto it). Updated ADIR, `creditPreview`, util-boost ids, EXEMPT_DIM.
- **`build_sales_team`** reworked: effects now `team_size+1 / revenue_capacity+8000 / kpd-10 / leads+8` (dropped the big customer_base/revenue grant). Adds a `+0.07` lead-conversion bonus (mirrored in `renderStats` convPct) and a `monthly_revenue*0.04` commission drag in `monthlyTick` — cost scales with the business.
- **`acquire_competitor`** moved marketing → finance (wealth). Now an investment: `investment_positions += 30000*mult`, `other_monthly_revenue += 1.5%`, plus `operating_expenses` write-off (2%). No longer a capital sink competing with the leverage pivot.
- Counts: Marketing 17→16, Finance unchanged at 30 (−3 merged, +3 new). Doc note added to CLAUDE.md re: static `monthly_revenue` being recomputed each tick.

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
