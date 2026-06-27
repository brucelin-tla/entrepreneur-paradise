# Release Notes

## v0.23.3 — 2026-06-26
**Fixes: business-credit display, mobile tutorial tap-blocking, Epic card size**

- **Business credit display (`renderStats`):** the business "Credit" row now shows `—` when `business_credit_limit` is 0 (no line established yet) instead of a misleading `$0 0%`.
- **Mobile tutorial tap-blocking (`renderTutorialStep`):** on interactive "wait" steps the tip box is now `pointer-events:none` (the Skip button re-enables itself), so taps pass through to the action cards underneath — previously the tip overlay blocked taps on mobile. Tall-target steps (the action list) also pin the tip to the bottom so cards stay visible.
- **Epic Life Membership card (`actions_finance.json`):** trimmed the description so the card isn't oversized.

## v0.23.2 — 2026-06-26
**Epic Life Membership — a done-for-you wealth concierge that auto-runs the financial playbook**

- **New finance action `epic_life_membership`** ($500 setup + $300/mo, added to `operating_expenses` on enroll, sets `_epic_life`). Models a real concierge service so players feel its value.
- **Concierge engine (`_epicLifePick` / resolveMonth injection):** once active, each month the engine picks the single highest-priority financial move that's genuinely needed, has its prereqs met, and is comfortably affordable (`funds ≥ cost×1.1`), then injects it as an extra action processed through the normal resolution loop (so all costs, special handlers, completion and before/after reporting apply). Priority order follows the DESIGN waterfall: banking → asset-protection holding structure → insurance → debt restructure (util>45) → credit repair (negatives) → utilization paydown (util>30) → fund accumulation policy → activate tax-free passive income. One-time setups fire once; the credit/debt optimizers run as-needed. Result cards are attributed with a 🌟 **Epic Life** badge.
- **Handled actions hidden from the menu (`EPIC_HANDLED` / `_epicHandled`):** the covered finance actions are locked from manual selection and shown in a "🌟 Epic Life Membership handles these for you" panel instead.
- **More deal flow:** opportunity-category events are ~1.6× more likely while the membership is active (`checkEvents`).
- **Balance:** perks still cost their real cash (business-funded) and the membership is a monthly drag, so it accelerates the optimal path rather than creating free money — and the affordability gate makes the engine stand down when the business can't afford a move (verified it stops cleanly when cash runs low). A config `funding` override and the `funds×1.1` buffer keep it from over-leveraging. Widened `banking_relationship` prereq to include `multi_entity`.

## v0.23.1 — 2026-06-26
**Interactive first-month tutorial + dashboard UI/UX refinements: at-a-glance net cash flow & runway, grouped stats, color-coded mastery, decluttered action menu**

- **Business-vs-personal funding (`payCost` callers / `lifeActionIsPersonal`):** Marketing/Operations/Finance actions are now always funded by the business (the four personal-wealth finance actions no longer special-cased to personal). Life rewards route by a new classifier — executive health/performance, professional development, thought-leadership and team spend (`LIFE_BUSINESS_FUNDED`) draw from the business; family/luxury/spiritual/giving/personal-estate draw from personal cash. `confirmLifestyle` now routes through `payCost` instead of always hitting business cash. Stops personal cash being drained to ~0 each month. A config `funding` field overrides the default per action.
- **Accurate "Build Personal Credit" copy:** reworked the description/lesson/narratives (and the in-menu credit preview) to reflect real credit mechanics — dispute *genuine* errors, lower utilization, resolve collections, on-time history — instead of the credit-repair-mill myth of "disputing away" legitimate negative marks. Game mechanic (resolve negatives → ~650, then utilization → 750-800) unchanged.
- **Clearer action previews (`actionPreview`/`lifeActionPreview`):** reworked to "Stats impacted:" — names every affected stat (full coverage incl. the special finance actions via the `IMPACTS` map; no more blank previews), shows the current value only for money/credit-score stats, and formats credit score as a plain number (not `$`). Life-action cards get the same treatment, mapping their effects to the five Personal Mastery dimensions (💪 Body / 🧠 Mind / 🕊️ Spirit / ❤️ Heart / ✨ Luxury).
- **Tidier result cost line (`showResults`):** the per-action cost now names the funding pool(s) — `from cash` / `from business credit` / `from personal cash + personal credit` — instead of repeating the dollar amount per source.
- **Hands-on tutorial (`TUTORIAL_STEPS`/`_tutNotify`/`_tutReposition`):** the month-1 walkthrough now drives the real game loop. "wait" steps make the spotlight overlay click-through (`pointerEvents` toggles per step) and the player's actual selections advance the tour — pick Marketing → Operations → Finance (riding the existing auto-tab-advance), then End Turn, then a closing "that's the loop" tip on the results screen. `selectAction` fires `_tutNotify('select')`, `resolveMonth` fires `_tutNotify('endturn')`.
- **Net cash flow + runway (`renderStats`/`netRow`):** new Net/mo row on both the Personal and Business sides — income minus expenses, color-coded (green positive / red negative), with a `~Nmo` runway estimate (liquid = cash + available credit ÷ monthly burn) shown when net is negative.
- **Grouped dashboard (`subLab`):** each side split into labeled sections — Personal → MONEY / CAPACITY, Business → MONEY / OPERATIONS — replacing the unlabeled spacer gaps so the eye lands faster.
- **Color-coded Personal Mastery sub-stats:** the 💪🧠🕊️❤️✨ dimension row now colors each value (red < 30, gold < 60) and spreads them evenly, so a neglected dimension reads as a warning at a glance.
- **Decluttered action menu (`actionPreview`/`_cfoHintShown`):** the "🔒 Hire a fractional CFO to forecast results" hint now renders once per menu render instead of repeating on every action card.

## v0.23.0 — 2026-06-26
**Personal Mastery system, Company Culture, C-suite AI overhaul, Creditworthiness scoring dimension, Executive Assistant & General Counsel, private-banking deals, full stat transparency**

- **Personal Mastery (`lifeDims`/`calcPersonalMastery`/`calcEnergyRecovery`):** Life reorganized into five dimensions (Body/Mind/Spirit/Heart/Luxury); mastery = their average and drives monthly energy recovery (~10/mo at low mastery → ~22 at high, firm-but-recoverable). Diminishing returns on Life gains (`_scaleLifestyleEffects`). New tiered Life actions (company retreat, dream car/home, world sabbatical, leadership coaching, nutrition). Dashboard gauge + `showMastery` popup; Life check-in regrouped by theme.
- **End-screen showcase + leaderboard badges (`buildLifeShowcase`/`calcBadges`):** "The Life You Built" panel; badges of honor stored on leaderboard entries and shown in `renderLBList`/`showRunDetail`.
- **Company Culture (`company_culture` stat):** culture actions — `company_retreat` (Life), `build_benefits_package`, `grant_stock_incentives` (needs C-Corp), `reincorporate_c_corp`. `checkEvents` scales people-event probability inversely with culture (~3× at low culture); two new high-stakes culture-gated events (`team_mutiny`, `star_defection`). Culture gauge on the Business dashboard.
- **Credit rework:** `build_personal_credit` disputes resolve over 2–3 months (delayed via `_credit_repair`, `credit_negatives`), clearing to ~650 then drifting toward a utilization-based ceiling. New `build_dnb_profile` + reworked `calcBizCreditScore` (credibility markers + tradelines + history).
- **C-suite AI & UX:** execs offer their own promotions; CFO follows a priority ladder (separate → protect → tax → D&B → wealth) in `bestAction`. Unified "Your Team's Plan" panel + single `runTeamMonth` button (retires the focus-toggle/board-button split). Life-action cadence: board = monthly, full C-suite = every other month, else quarterly.
- **Executive Assistant & General Counsel:** `hire_executive_assistant` auto-manages utilization/credit/D&B/tax-reserve each month; `hire_general_counsel` mitigates 7 legal/HR events. **Milestone perks** (`_perks`): Fully Protected softens bad-event cash ~20%, Tax-Smart trims tax drag ~30%, Funding Ready +12% credit capacity.
- **Scoring:** new 7th radar dimension **Creditworthiness** (personal score + D&B + low utilization), weights rebalanced to sum 1.0. Milestones +3 (Referral Engine, Strong Culture, Business Credit Built → 18, balanced 6/6/6); debrief items added for the new systems. **Full stats dump** (`_statSnapshot`/`buildStatsDump`) on the end screen and every leaderboard entry — every tracked scalar incl. hidden flags + derived values.
- **Private banking:** new `pre_ipo_allocation` opportunity (pre-IPO + private-credit deals) gated on being a private-banking client. Fixed `scaleEventEffects` so opt-in deal *returns* (investment_positions/real_estate_equity/other_monthly_revenue) scale with the cash cost.
- **Earlier in this cycle:** save/resume runs, full action-history log, before→after on results & event outcomes, 7 action consolidations, accumulation-policy merge, event-choice number hiding (deals still show the offer), leads now cumulative (≥ customers), contractor → "Work With a Vendor Contractor".

## v0.22.7 — 2026-06-26
**Save/resume in-progress runs, action-history tracking, event before→after**

- **Save & resume (`_snapshot`/`_loadSnapshot`/`saveProgress`/`resumeSave`/`deleteSave`/`renderSaves`/`_savesHtml`):** the Year 1/2 checkpoint has a name+Save box that persists the run (state, month, history, playLog) to `localStorage` (`ep_saves`). A "▶ Continue a Saved Run" list appears on the title screen (`#resume-list`, rendered in `init`) and the leaderboard (`#lb-resume`), so a refresh no longer loses progress. Completing a run clears its in-progress save.
- **Action history (`_playLog`, `buildChoiceLog`, `showRunDetail`):** every Marketing/Operations/Finance choice is logged `{m,c,l,s}`. The end screen shows a color-coded month-by-month "Your Choices — Full History"; leaderboard entries carry `playLog` and are clickable to view that player's choices in a popup. End-screen inserts wrapped in `#end-extra` to avoid duplication on repeat views.
- **Event before→after (`_baSnapshot`/`_baRows`/`_baRowsHtml`):** `resolveEvent` snapshots the dashboard before applying effects and renders before→after rows (cash, personal cash, total debt, credit limit/util, credit available, credit score, leads, customers, team, brand equity, systems, revenue capacity), color-coded by direction. Non-tracked effects (energy, audit risk, etc.) still list below.

## v0.22.6 — 2026-06-26
**Results-screen financial transparency, CFO-gated forecasts, event dashboard, insolvency/lose condition, realistic company sale, resume-after-early-end, onboarding tweaks**

- **Cash & Credit results (`resolveMonth`/`showResults`):** per-action cost + funding source (`💸 Cost −$X · from cash/business credit/personal`), an end-of-month "📊 Cash & Credit — This Month" summary (start→end for cash, business/personal credit available, total debt + action-spend breakdown), and per-action before→after rows for **cash**, **personal cash**, **total debt** (red when worse), credit metrics, personal credit score, and headline stats. Keys shown in before→after are suppressed from the effect chips (`_baKeys`). Direction-aware coloring via an optional 4th row element.
- **Money chips finance-only:** ± money effect chips render only on Finance result cards; Marketing/Operations keep stat chips.
- **CFO-gated action previews (`actionPreview`):** action cards always show impacted dashboard stats + current values; the projected **result** (creditPreview projections for credit/finance actions, or `current → ~projected` scaled deltas for stat actions) is gated behind completing `hire_fractional_cfo` (`🔒 Hire a fractional CFO to forecast the result`). Adds `build_personal_credit` creditPreview case + personal-credit-score before→after.
- **Event dashboard (`renderStats(targetId)`):** the full stats panel renders on every random-event and tax screen (`#event-dashboard` added to `index.html`).
- **Insolvency / lose condition (`_settleCashOrLose`, `loseGame`):** cash can't sit negative — shortfalls auto-draw business→personal credit; if cash AND credit are exhausted, an "Insolvent — Game Over" screen appears. Hooked in `resolveEvent`, `monthlyTick` (via `_pendingLose`→`showResults`). Opt-in **opportunity** events skip `scaleEventEffects`' never-fatal cap (`skipCap`) so they cost their true price.
- **Realistic company sale (`acquisition_offer` handler in `resolveEvent`):** proceeds become **personal** income, taxed ~23.8% (LTCG + NIIT), equity forfeited (`capital_account`→0); narrative teaches the mechanic.
- **Resume after early end (`endGame`/`resumeFromEnd`):** ending at a Year 1/2 checkpoint shows a "↩ Resume — Keep Building" button that returns to the next month.
- **Onboarding:** +25% action success in months 1–3 (fewer early partials). Email campaign (`config/actions_marketing.json`) no longer subtracts leads (`leads: -8`/`-3` removed) — you keep your contacts; pipeline only shrinks via natural conversion or bad-PR events.

## v0.22.5 — 2026-06-26
**Skip redundant opening screen; mentor name consistency**

- **Removed opening screen (`selectArchetype`):** archetype selection now calls `startGame()` directly instead of showing the `opening-screen` ("Month 1" + "Begin Your Journey"). The month-1 narrative beat already renders in the game screen's `month-narrative`, and the tutorial fires there, so the intermediate screen was redundant. All three archetypes have month-1 beats, so no intro content is lost; the `opening-screen` markup stays in `index.html` unused.
- **Mentor name consistency (`config/narrative_beats.json`):** the 7 beat `mentor_line` prose references read "Bruce" while the display header reads "Marcus Webb" (from v0.22.3). Aligned the prose to "Marcus Webb". Historical `PATCH_NOTES` entries that mention "Bruce" are left intact as changelog history.

## v0.22.4 — 2026-06-26
**Before → after stat numbers on the Results screen**

- **Status-bar stat deltas (`resolveMonth` / `showResults`):** snapshot `leads`, `customer_base`, `team_size`, `brand_equity`, `systems_maturity`, `revenue_capacity` before `applyEffects`, then add any that changed to the action's `beforeAfter` table (e.g. "Leads 0 → 10", "Team size 0 → 1"). Reuses the existing before→after block used for credit metrics.
- **De-dup:** keys shown in the before→after table (`_ro._baKeys`) are suppressed from the effect "chips" so a stat isn't shown twice. Money stat `revenue_capacity` formats with `fmtMoney`; counts/scores render as integers. Delayed-effect actions don't show these rows until the effect actually lands (2 months later), avoiding misleading numbers.

## v0.22.3 — 2026-06-26
**Mentor commentary moved to Results screen; mentor renamed back to Marcus Webb**

- **Mentor → Results (`renderMonth` / `showResults`):** the recurring character/mentor line no longer renders in `#character-line` on the action screen (kept hidden). It's stashed in `this._pendingCharLine` and rendered at the top of the monthly Results screen as a gold-accent `narrative-box`, reducing clutter above the action choices.
- **Name revert:** display name reverted "Bruce — Mentor" → "Marcus Webb — Mentor" across opening, milestone, fixed-beat, and recurring lines (`getCharLine`, `mentorMilestoneLine`, `selectArchetype`); `config/characters.json` mentor name updated to match.

## v0.22.2 — 2026-06-26
**Selected action floats to top + brighter highlight**

- **Selected → top (`renderActions` group sort):** flipped the in-group sort so the selected action sorts to the **top** of its direction group (`return sb-sa`) instead of the bottom. Keeps the active choice in view instead of pushing it under the fold.
- **Brighter selected style (`.action-card.selected`):** fill `rgba(16,185,129,0.12)→0.2`, glow ring `0.35→0.5` and drop shadow `0.22→0.3` for clearer visibility.

## v0.22.1 — 2026-06-26
**Interactive spotlight tutorial (replaces the single scrolling popup)**

- **Guided coachmark tour (`showTutorial` → `renderTutorialStep`/`tutNext`/`tutPrev`/`endTutorial`, steps in `TUTORIAL_STEPS`):** month-1 tutorial rebuilt from one scrolling popup into a 6-step spotlight walkthrough. A full-screen dim (`#tut-hole` box-shadow cutout) darkens everything except the highlighted element; each step `scrollIntoView`s its target, draws a pulsing accent border, and shows a tooltip auto-placed below/above (center fallback for tall/absent targets).
- **Steps:** intro (centered, no cutout) → `#stats-dashboard` → `#cat-tabs` → `#action-list` → `#month-narrative` → `#confirm-actions-btn`. Original copy (the loop, dashboard, events, leverage→passive-income path, NEW badge / Achievements) preserved and distributed across the relevant highlighted areas.
- **Controls:** Skip / Back / Next, a "Step X of N" counter, and progress dots; overlay is built and torn down dynamically (no `index.html` changes). Still gated by `state._tutorial_seen` in `renderMonth`.
- **Note:** uses instant `scrollIntoView` (smooth no-ops in the headless preview). New CSS under "Interactive spotlight tutorial" in `css/styles.css`.

## v0.22.0 — 2026-06-26
**First-month tutorial, end-after-Y1/Y2/Y3 messaging, action-menu UX overhaul, partial-retry mechanic, selected-action visibility, before→after credit, policy funding gate**

- **Tutorial:** `showTutorial()` shown on month 1 (`renderMonth`, gated by `state._tutorial_seen`), dismissable via the popup's Got it/overlay. Explains the monthly loop, dashboard, events, and the leverage→passive-income path; notes you can end after Year 1/2/3.
- **End-the-run clarity:** tutorial intro reworded ("up to 36 months… cash out at the end of Year 1, 2, or 3"). `showCheckpoint` cash-out button → "🏁 End Here — Lock In My Final Score" with an explainer line; month-36 checkpoint shows "See Your Final Score →".
- **Action-menu UX:** default-open group now prioritizes a group with an unselected partial → unselected NEW → any unselected action (was "first group with avail"). Group headers show **↻ RETRY** and **NEW** markers (computed over unselected avail). Within a group, sort = unselected (partial → new → urgency) with the **selected action pushed to the bottom**.
- **Partial-retry mechanic:** one-time actions only enter `_completed_actions` (and lock) on full success; a partial sets `_partial_actions[id]`. Retry gets `+0.35` success and the flag clears on success. Cards show a "↻ PARTIAL — RETRY" badge; partials sort to the top of their group.
- **Selected-action visibility:** `.action-card.selected` now has a 2px accent border + glow + tint + left bar, plus a "✓ SELECTED" badge in the card title. `.action-card.is-new` border reverted to normal (a NEW card no longer looks selected).
- **Before→after credit on results:** `resolveMonth` snapshots business credit limit/utilization, personal utilization, and available credit per action; `_ro.beforeAfter` renders a compact before→after table on the result card for any action that moved them.
- **Accumulation policy gate:** `setup_accumulation_policy` now requires `cash_gte: 50000` (cash + available credit) so it only appears once the player can realistically fund the ~$50k/yr it wants; description/lesson updated; `getLockedReason` shows "Need $50,000 in cash or credit".

## v0.21.2 — 2026-06-26
**Consolidated results screen, smarter Aggressive Debt Paydown, sensible event mitigation notes + richer recession choices**

- **Results screen consolidation (`showResults`):** one compact card per action — title + Success/Partial badge, short narrative, effects as inline pill "chips" (instead of vertical effect-lists), and lessons as a single light line (first-time only). Milestone/passive banners tightened. No horizontal overflow on mobile.
- **Aggressive Debt Paydown rework:** new `_debtPaydownPlan()` + `calcDTI()`. Spends ~60% of liquid cash to pay revolving down to just under 30% utilization (math accounts for the freed limit, so it lands ~29% without overshooting). Only pays installment loans if DTI > 30%. `_dyn_narrative` shows before→after utilization (and DTI when loans are paid); card cost-tag estimates the deploy or shows "already healthy." Config description/lesson updated to teach utilization-first.
- **Event mitigation notes (`_mitigationNote`):** replaced the hardcoded "…lowered the odds — softens the blow" with a per-safeguard phrase map describing what each safeguard actually does (credit line → "room to act from strength," clean books → "quick to answer and hard to dispute," etc.). Opportunity events lead with "You're positioned to seize this."
- **Recession choices reworked (`market_recession`):** three distinct strategies — Play offense (borrow cheap, grab share — on-theme OPM), Reposition to recession-proof demand, Batten down and wait — with richer, scaled effects.
- **Copy:** `hire_first_contractor` description clarified (delegate delivery to focus on revenue-generating work).

## v0.21.1 — 2026-06-26
**Checkpoint debrief, play-style-aware ending titles (The Grinder), debrief milestones, finance milestone rework, credit-action de-dup**

- **Checkpoint debrief:** `showCheckpoint` now renders `buildDebrief()` at the Year 1/2 checkpoints, so the "What You Learned / Left On The Table" feedback shows without ending the run.
- **Ending titles by play style (`determineArchetype` rewrite):** selects by score profile + neglect rather than a single dominant dimension. New `the_grinder` archetype (config) for high-revenue/low-leverage-passive-tax runs ("a high-paying job, not freedom"). `freedom_architect` is now the full-win pinnacle (efficient passive+leverage+tax AND lifestyle ≥50); `burnout_billionaire` for money-but-lifestyle<30; cashflow_king / leverage_master / empire_builder for the respective standouts; weak-run fallback by single strongest area.
- **Debrief milestones:** `buildDebrief` appends a "🏆 Milestones — X/15 unlocked" section (unlocked + still-on-the-table), shown on both the end screen and the checkpoints.
- **Finance milestones reworked + reordered:** ladder is now Made It Legal → Business Banking → Creditworthy → Funding Ready → Tax-Smart → Money Engine → Tax-Free Passive Income. `fi_funding_ready` now keys only on its unique signals (separated + `debt_restructure` + no `debt_breakdown.collections`), removing overlap with `fi_legit`/`fi_banked`; `fi_legit` now covers LLC+bank account, `fi_banked` is the first-business-credit step.
- **Credit action de-dup:** `qualify_more_credit` relabeled "Expand Your Credit Lines" and gated `needs:['business_credit_line']` so it no longer appears alongside "Open Business Line of Credit" as a duplicate.

## v0.21.0 — 2026-06-26
**Milestones/achievements system, Achievements panel, Funding Ready milestone, freedom-score rebalance**

- **Milestones (`MILESTONES` const, 15 total):** category-tagged achievements with `check(state, game)` predicates across Marketing (first customer, funnel built, brand, demand engine), Operations (first hire, systemized, team, runs-without-you), and Finance (made it legal, creditworthy, business banking, **funding ready**, tax-smart, money engine, tax-free passive income). `checkMilestones()` runs at the end of `monthlyTick`, recording `{id, month}` into `state._milestones_achieved`; `initMilestones()` marks already-true ones at month 0 on `startGame` so they aren't celebrated retroactively.
- **Surfacing:** newly-unlocked milestones render as 🏆 cards on the results screen (`showResults`, color-coded by category, with Bruce's note) and the mentor section leads with `mentorMilestoneLine()` the following month.
- **Achievements panel:** `showAchievements()` popup + an always-visible "🏆 Achievements — X/15" button on the dashboard (`renderStats`). Groups all milestones by category, shows unlocked (🏆 + month) vs locked (🔒 + description), with a big progress count.
- **Funding Ready (finance):** unlocks on LLC + `open_business_account` + `debt_restructure` + clean credit file (no `debt_breakdown.collections`). Per design feedback, "no negative" = clean credit (collections cleared / disputes resolved), not non-negative cash.
- **Freedom rebalance (`calcFreedom`):** key-person dependency now weighted 0.5 (was the dominant term); team/systems capped contributions; and direct bonuses for fractional execs (+6/+8/+4 CRO/COO/CFO), full-time bumps (+4/+8/+4), board (+16), plus ops hires (middle management, HR, full systemization). Hiring a C-suite now visibly climbs Operator → Director → CEO → Chairman.

## v0.20.0 — 2026-06-26
**Fractional→full-time C-suite, OPM-tied growth, CFO leverage unlock, private banking 1% facility, policy-loan fixes**

- **Two-tier C-suite (fractional → full-time):** `hire_cro/coo/cfo` are now affordable *fractional* hires (set `_cro_hired` etc; auto-pick/highlight as before). New `promote_cro_fulltime`/`promote_coo_fulltime`/`promote_cfo_fulltime` (gated on the fractional + ~$70-80k/mo + structural maturity) set `_x_fulltime`. Comp is tiered: `calcExecFrac` (clamp $3.5k+2.5%rev, 3.5k–11k) vs `calcExecFull` (clamp $12k+7%rev, 12k–48k) — full-time ~3-4×, summed per exec by tier in `calcExecComp`. Monthly auto-growth (team/capacity/brand) now gates on `_x_fulltime` only; promotions excluded from `bestAction` auto-pick.
- **CFO leverage unlock:** `calcCreditCapacity` ×1.15 (fractional) / ×1.4 (full-time); `payCost` healthy-utilization cap 0.30 → 0.42 / 0.55; `calcDebtInterest` business rate ×0.9 / ×0.8. "Leverage harder and safer."
- **Growth tied to OPM:** `actionCashCost` scaling raised (up to 5× with business level) on repeatable marketing/ops actions — cash alone can't fund growth, forcing productive use of credit lines.
- **Tax efficiency tightened:** monthly inefficiency drag base 0.10→0.16, S-corp credit 0.07→0.10, denom profit/40k→/30k, small trust credit — profitable unstructured businesses bleed cash, rewarding S-corp/tax structure.
- **Private banking reworked (`liquid_cash_gte` 2,000,000):** new `meetsReq` key for literal cash. Handler deposits ~85% of cash into `private_bank_balance` (earns ~5%/yr in `monthlyTick`) and draws 90% as `private_bank_loan` at ~1%/yr (charged in `calcDebtInterest`, its own bucket — not in `total_debt`, so it doesn't pollute utilization/DTI). Shown in `showAssets` (deposit) and `showDebt` (1% line); counted in net-worth/leverage/passive scoring. PE and family office decoupled from the old `private_banking` prereq.
- **Policy fixes:** `policy_loan` draws only remaining headroom (90% of CV − existing loan balance); monthly passive-income draw capped to the same headroom. `activate_passive_income` and `policy_loan` now gate **only** on having cash value (5000 / 1000) — no stage/needs gates.
- **Art + difficulty:** detailed inline-SVG founder portraits per archetype; Easy/Medium/Hard badges, sorted.
- **Year-1 pacing:** `scaleActionEffects` `lvlF` curve softened (1× until ~$15k/mo, ~2.4× by $50k/mo); C-suite revenue gates raised earlier in the dev cycle.

## v0.19.1 — 2026-06-25
**Difficulty badges on the founder picker**

- `renderArchetypes` now reads a `difficulty` field (`Easy`/`Medium`/`Hard`) from each starting position, renders a color-coded pill badge in the card header (Easy = accent/green, Medium = gold, Hard = red), and sorts the cards easy → hard. Added `difficulty` to `starting_positions.json`: New = Easy, Established = Medium, Stuck = Hard.

## v0.19.0 — 2026-06-25
**Stuck & Established archetypes re-enabled, late-game cost/effect scaling, C-suite auto-growth**

- **Archetypes restored (`starting_positions.json`):** removed `enabled:false` from `stuck` and `established`.
  - **Stuck** (hard, recoverable): re-tuned for a survivable-but-hard dig-out — `cash 7000`, `available_credit 6000`, `total_debt 27000` (cards 17k / collections 7k / personal loan 3k), `personal_credit_score 540`, sole-prop, `living_expenses 2200`, `churn 0.10`, `customer_base 22` / `brand_equity 22` (~$3.8k real revenue), `revenue_capacity 7000`. The credit→LLC→`debt_restructure` sequence reaches Finance Leverage stage (~655 credit) by month 5–6 with positive cash; ignoring it bleeds out via the underwater credit-penalty spiral. (`locked_until` is dead config — gating is the global `stage_thresholds.json` + `stage_overrides`.)
  - **Established** (medium): `customer_base 85→105` so recomputed revenue (~$36k/mo) matches the "$480k/year" narrative; finance starts foundation but immediately promotes to Leverage (meets global thresholds). Blind spots intact: litigation 45, audit 30, key-person 75, LLC (not S-corp), no insurance/asset protection.
- **Late-game balance:** new `actionCashCost(a)` scales repeatable Marketing/Operations action costs up to 4× with `calcBusinessLevel()` (one-time and Finance actions unchanged); wired through `canAfford`, `getLockedReason`, the card cost tag, the needs-credit hint, and the `resolveMonth` charge. `scaleActionEffects` now also scales `leads`/`customer_base` by a business-level factor (up to ~3×) and `revenue_capacity` cap 2.5→3, so bigger spend yields bigger impact.
- **C-suite auto-growth (`monthlyTick`):** with `_coo_hired`, capacity grows (~900×level/mo), systems +1, key-person −1, and auto-hires staff (+payroll) when `revenue > team×6000`; with `_cro_hired`, leads (+5×level), capacity (+600×level) and brand +1 each month — on top of their auto-picked actions.

## v0.18.0 — 2026-06-25
**C-suite executives, Board autopilot, Family Office & Legacy investments, billionaire lifestyle, asset visibility, 600-point score**

- **Executive hires (CRO / COO / CFO):** new prestige hires — `hire_cro` (Marketing menu), `hire_coo` (Operations menu), `hire_cfo` (Finance menu), each in a new "Executive Team" ADIR group. Gated on revenue + entity/team. The CRO and COO auto-pre-select the best action in their category each month (`_autoPicked`, badged "CRO pick"/"COO pick", overridable); the CFO stars the best Finance move (`_cfoPick`, "CFO ★") without picking it. Picks come from `bestAction(cat)` → new `_actionValue(a,cat)` scorer (projects scaled effect impact + explicit high values for handler-based golden-path moves like passive income/policy/PE/real estate; discounts credit-building once credit is high).
- **Focus Mode:** when all three execs are hired, `_setupActionMenu()` drops Marketing & Operations from `_activeCats`, lands the player on Finance, and `renderActions` shows an executive-team banner with the auto-picks; `toggleFocus()` restores the full menu. The pick's accordion group auto-opens so its badge is visible.
- **Scaling exec compensation + bonuses:** removed the flat salary from the hire effects. `calcExecPerHead()` = `clamp($8k + 6% of monthly revenue, $8k, $35k)`; `calcExecComp()` × heads, applied each `monthlyTick` as a delta to `operating_expenses` (flows through burn/EBITDA/tax/profit). Successful exec auto-picks pay a performance bonus (3% of revenue, $1k–$15k) shown as its own result card.
- **Board of Directors capstone:** `establish_board` (needs all 3 hires + `activate_passive_income`) sets `_board_active`. Adds a "🏛 Let the Board run this month" button (`boardRunMonth`) that auto-fills the CFO's Finance pick + best lifestyle (`_bestLifestyle`) and resolves the month in one tap.
- **Family Office & Legacy investments (new finance ADIR group):** `private_banking` (sweeps idle cash into a yield portfolio), `private_equity_fund` (large illiquid position, marked up, distributions), `setup_family_office` (coordination + ~5%/yr portfolio appreciation in tick), `dynasty_trust` (lawsuit/estate-tax protection, lower tax rate, legacy). resolveMonth handlers route capital into `investment_positions` + `other_monthly_revenue`.
- **Billionaire lifestyle options:** `private_jet`, `superyacht_charter`, `private_estate`, `art_collection`, `philanthropic_foundation_major` added to `lifestyle_options.json`.
- **Asset visibility:** new `Investments` row on the personal dashboard (shown when `investment_positions>0`) → `showAssets()` popup (gross assets − debt = net worth, dynasty-trust note). CFO Briefing now gated on `_cfo_hired` (not just `hire_fractional_cfo`) and includes an Investments line.
- **NEW badge relocation:** removed from the category tabs (`renderCategoryTabs`); now rendered on the specific accordion group header (`renderActions`, `gNew`) that contains a newly-unlocked action.
- **Composite score out of 600:** `calcComposite` now `×6` instead of `×10` (six dimensions × 100); checkpoint and end-screen labels updated to "/ 600". Still weighted (revenue weight 0) with the lifestyle gate.

## v0.17.2 — 2026-06-25
**End-turn confirm + NEW-on-tabs + dashboard polish + debt-restructure result + capital-options fix**

- **CFO Briefing:** hiring `hire_fractional_cfo` unlocks a `📊 CFO Briefing` button on the dashboard (`showCfoReport`). It shows **company value** (≈3× annual profit, or 0.5× revenue early), **net worth** (liquid + RE equity + business value + policy − debt), liquid assets, policy cash value, total debt, monthly profit & margin, burn·runway, DSCR; a **6-month revenue projection** (mirrors the engine's conversion/churn/capacity); and one prioritized recommendation each for **Marketing / Operations / Finance** (`_cfoMktg` / `_cfoOps` / `_cfoFin`, contextual to the player's weakest levers). The hire result points the player to it.
- **Money-movement on result screens:** `policy_loan` now sets a dynamic narrative showing amount + personal cash before → after and adds `cash` to the effect list. Monthly passive income is stored (`_lastPassive` {amt, before, after, month}) in the tick and rendered as its own "Tax-Free Passive Income — Received" block in `showResults` (before → after).
- **Policy mechanics spelled out:** `showCreditAvail` policy section now notes cash value grows ~7%/yr (compounds even while borrowed), loan outstanding accrues ~5%/yr, and the cumulative loan is netted from the death benefit at death (never repaid from pocket). (Rates were already correct: `×1.0057/mo` ≈ 7%/yr growth, `×1.0041/mo` ≈ 5%/yr loan.)
- **Event protection legibility:** new `_safeguardName()` maps shield ids/conditions to friendly names. `resolveEvent` now shows **"Protected — {safeguard}"** plus the damage avoided (the `unprotected_extra` it dodged, or the `shielded_multiplier` reduction); when unprotected it shows **"How to prepare next time: {safeguard}"**. The mitigated-by note on the event screen names the actions that lowered the odds.
- **Lawsuit prep:** added a `protection` block to `major_lawsuit` (`shielded_when` LLC+ → `shielded_multiplier 0.6`, `unprotected_extra` credit/PG hit), so an LLC now cuts a major lawsuit's *damage*, not just its probability — fixing "got sued and couldn't prepare against it" (the prep actions were already reachable; the damage just wasn't reducible).
- **Tax extension no longer hits credit:** removed the `personal_credit_score −15` from `resolveTax`'s `extend` path (a tax extension isn't reported to the bureaus); it still adds the deferred tax to debt, `audit_risk +20`, and the monthly interest/penalty. Updated the choice label.
- **End-turn confirmation:** `confirmActions` now checks selected vs active categories; if fewer than all are chosen it `window.confirm`s ("…N/total selected. End the month anyway?") listing the missing categories, and aborts if you cancel.
- **NEW badge on category tabs:** new `scanNewActions()` (called in `renderMonth` before the tabs) marks newly-available actions across ALL active categories up-front into `_action_new_month`; `categoryHasNew(c)` drives a `NEW` pill on each `cat-tab` for the month a fresh option appears there.

- **Dashboard:** moved **Credit Score** (personal) and **D&B Score** (business) to the top row of each column, above Cash; renamed the **Loans** row to **Debt** on both sides.
- **`debt_restructure` result now shows actual numbers:** the deferred `applyDebtRestructure` builds one combined narrative from the stored amounts (`dr.lim`, `dr.moveAmt`, `dr.cashLoan`) + the revolving→installment swap, e.g. *"opened a $15,000 business line at 0%; shifted $12,000 of personal balances onto your business credit; pulled $6,250 in working cash."* The handler also adds `cash` / `business_credit_limit` / `business_credit_used` to the result effect-list.
- **Capital-options fix:** `business_credit_line`, `qualify_more_credit`, `business_term_loan` moved from leverage → **foundation stage** (their prereqs already gate them), so they're usable *before* `debt_restructure`. The hide-once-available logic now only fires when `debt_restructure` is genuinely usable (`getAvailableActions` checks the real action's stage/prereqs/affordability), so you always have at least one capital option.
- Verified: capital options visible at foundation with an LLC; debt-restructure result narrative + effects show real amounts; dashboard reorder/rename render; no console errors.

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
