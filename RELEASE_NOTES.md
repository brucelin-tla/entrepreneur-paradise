# Release Notes

## v0.41.0 — 2026-06-30
**Global leaderboard + Google sign-in (Supabase) — multiplayer foundation**

**Backend:** Supabase project (`runs` table, RLS: read-all / insert-update-delete-own via `auth.uid()`), Google OAuth provider (consent screen published, `email`/`profile` scopes). SDK loaded via CDN in `index.html`; `SUPA_URL`/`SUPA_KEY` (publishable key, public-safe) + `GOOGLE_G` consts in `js/game.js`.

**Auth (`_initSupabase`):** creates the client, wires `LB_BACKEND = { fetchTop, submit }`, tracks session via `getSession` + `onAuthStateChange`. Helpers: `_isSignedIn`, `_authName`, `signInGoogle` (`signInWithOAuth`, redirectTo = current page), `signOutGoogle`, `_afterAuth` (refreshes auth UI + flushes pending). Graceful no-op if the SDK is absent (offline `game.html` stays local-only).

**Global leaderboard:** `_sbFetchTop(arch,months)` (top-10 by composite) + `_sbRowToEntry` mapping → feeds the existing `_paintLB`. The Global tab now pulls real data; **browsing needs no login**. Auth bar (`_authBarHtml`) on the Global tab shows the signed-in identity or a **Sign in with Google** button.

**Posting:** `saveToLeaderboard` posts to the global board when signed in; when signed out it **queues the run** (`_queuePendingGlobal` → `ep_pending_global`) and offers Google sign-in, then `_flushPendingGlobal` auto-submits it on return (OAuth redirects away, so the run is persisted across the round-trip). `_sbSubmit` inserts with `user_id = auth.uid()` (RLS-enforced).

**Next:** partnership-deal multiplayer event (cast a real pooled company as the counterparty) + fictional seed pool.

## v0.40.0 — 2026-06-30
**v0.4 series — UI consistency pass, leaderboard rebuild (global-ready), founder cards, achievements (traps + scams), redeem codes, company name, continue confirm**

**Shared title-screen chrome:** new `.page-head` + `.back-chip` CSS — Choose-Your-Founder, Load Game, and Leaderboard now share one header pattern with the Back button in the same top-left spot. Main menu rows moved from inline styles to a lean `.menu-item` class.

**Founder cards redone (`renderArchetypes` + config):** archetypes relabeled **New / Established / Stuck Founder** with graduated-length descriptions, plus a uniform 4-stat row (Cash / Rev / Credit / Debt) computed from `initial_state` and color-coded. New `.arch-*` styles; `min-height` on the description floors card height so they read as a consistent set.

**Leaderboard rebuild (`showLeaderboard`/`renderLBList`/`_paintLB`):** centered 420px column with top breathing room; **Global / This-Device** scope toggle (`_lbScope`) — Global shows a "coming soon" state until a backend is wired; 🥇🥈🥉 medals on the top 3; your own run highlighted (`_myLBName`); company names in rows + run-detail. Drop-in backend seam: set `Game.LB_BACKEND = { async fetchTop(arch,months), async submit(entry) }` (decision: build UI now, wire Supabase later). `serve.ps1`/`launch.json` now honor `$env:PORT` + `autoPort`.

**Achievements:**
- **Traps (per-run):** survive all 7 `TRAPS` in one run → 🪤 Trap Survivor badge. Tracked in `state._traps_hit` (logged when taken; "survive" = finish the run alive). `buildTrapPanel` shows discovered traps (locked 🔒 until found) on the end screen + run-detail. `TRAP_META` holds display names.
- **Scams (lifetime, across runs):** events tagged `"scam": true` with the catastrophic choice flagged `"scam_trap": true` (`crypto_friend_scam`, `coworker_investment_scam`); resolving a scam without going all-in increments `ep_scams_survived` (localStorage). Tiers 3 / 6 / 9 → 🕵️ Scam-Wise / 🛡️ Scam-Proof / 🥷 Untouchable (`SCAM_TIERS`, `buildScamPanel`). Both panels' badges flow through `calcBadges` → leaderboard. (Only 2 distinct scams exist today, so 9 is a long-haul lifetime flex.)

**Redeem codes:** main-menu 🎟 Redeem Code → popup. `REDEEM_CODES` map (normalized keys); live code `epiclife` unlocks New Game+. Redeemed codes persist in `ep_codes`; handles invalid / already-redeemed.

**Company name:** prompted when forming the LLC (`establish_business` → `_pendingCompanyName` → `promptCompanyName` after results). Stored `state.company_name`, shown as a tappable chip above the month label (`_renderCompanyName`, with a "+ Name your company" nudge once you have an entity), included in the leaderboard entry (`company`) + run-detail. HTML-escaped via `_esc`. Groundwork for future async-multiplayer / PvP (leaderboard snapshots become a pool of other players' companies).

**Continue confirm:** the Continue action (main-menu item + Load Game card) now routes through `confirmResumeAuto` → in-game styled Yes/No before loading the autosave.

## v0.39.0 — 2026-06-30
**Real-game main menu + credit/loan realism pass (4 fixes)**

**Main menu redesign:** title screen restructured to a proper menu (`renderMainMenu`): **New Game** → `showProfileSelect()` (the 3 archetypes move to a sub-view with a Back button), conditional **New Game+** / **Continue** (autosave) / **Load Game** (named saves → `showLoadGame` → `renderSaves` now the Load view), **Leaderboard**, **What's New** (`showWhatsNew` popup of the full changelog), and a footer with version + an **update indicator** (`_renderUpdateIcon`; glows gold when `_checkForUpdate` finds a newer build). `init` renders the menu; leaderboard Back → `showMainMenu`. Offline `game.html` build verified.

**Credit/loan realism (all 4 audited fixes):**
- **Risk-based interest** (`calcDebtInterest` rewritten): rate now varies by debt type AND credit score. Unsecured personal revolving (credit cards) ~18–26% APR by score; term/business debt risk-priced (`riskMult` 0.7→1.6) so **good credit = cheaper money** (verified term APR 6.7% at 760 vs 15.4% at 560); real estate cheap secured (~6%/yr); policy/private-bank near-free.
- **Income/DTI in approval** (`_creditApprovalChance`): added `dtiMult` (≤36→1, ≤43→0.85, ≤55→0.6, else 0.35) and a DSCR guard (`<1 → ×0.65`). Verified: same 10% utilization / 720 score, approval 92% at high income vs 55% at 48% DTI.
- **Hard inquiries fade** (`monthlyTick`): non-Epic members now drop 1 inquiry every 6 months (Epic still clears all + $1k), so only recent credit-shopping drags approval. Verified 4→3 after 6 months.
- **Punishing card APR:** unsecured revolving charged ~18–26% (was the ~9.6% business rate) — makes carrying card balances the real wealth-killer it is. (Watch the Stuck archetype's card load on playtest.)

## v0.38.1 — 2026-06-30
**Derogatory marks tuned to real life — diminishing score impact, hard approval gate**

- **Score (diminishing/capped):** new `_payHistoryFactor(neg) = 1 − 0.45·(1 − e^(−neg·0.55))` replaces the old linear `1 − neg·0.18` in both `calcFicoTarget` and `_estimateScore`. First mark hits hardest, marginal damage tapers, floors ~0.55. Verified per-negative score drops: −37 / −21 / −12 / ~−5, score floors ~696 at 6 marks (was tanking toward the 400s).
- **Approval (the real bite):** `_creditApprovalChance` now multiplies by `negMult` — `0→1, 1→0.6, 2→0.4, 3→0.25, 4→0.15, 5+→0.08`. Verified approval (good utilization): 92% → 50% → 33% → 21% → **6%** at 0/1/2/3/5+ negatives. One mark stings; several nearly block new credit — matching real lender behavior. Credit repair / Epic Life (which clears negatives) is the path back in.

## v0.38.0 — 2026-06-30
**Factor-based credit in New Game+ (computed score), hard-inquiry mechanic, Epic inquiry-removal perk**

- **New Game+ credit = computed, not picked.** Replaced the raw "credit score" slider with a **credit-profile** section that mirrors a 3B report: available credit (limit), revolving balance owed (→ utilization), derogatory marks (0–6), credit history (weak/average/strong), and hard inquiries (none / under 5 / 5+). A live **"Estimated myFICO 3B"** readout (`_ngpUpdateScore` → `_estimateScore`) recomputes on every change using the same factor weights as `calcFicoTarget`. `startNgPlus` sets `credit_negatives`, `_credit_history_base`, `credit_inquiries` and **computes** `personal_credit_score` from them.
- **Hard-inquiry mechanic** (`credit_inquiries`):
  - Every credit application (`CREDIT_APPROVAL` actions) is a hard pull → `+1` inquiry.
  - **Approval:** `_creditApprovalChance` adds `inqMult` — `≥5 → ×0.5`, `≥2 → ×0.85` (5+ roughly halves odds). Verified: 92% → 78% → 46% at 0 / 3 / 5+ inquiries.
  - **Score:** `calcFicoTarget`'s new-credit factor now `0.85 − min(0.45, inq×0.06)`; length-of-history factor uses a `_credit_history_base` baseline (so NG+ "weak↔strong history" is real). Defaults preserve normal play (inq 0, base 0.45).
- **Epic Life exclusive — inquiry removal:** in `monthlyTick`, every 6 months an Epic member's concierge clears all hard inquiries, **+$1,000** to `_epicSavings`/`_epic_savings_total`, and a "🧹 Inquiries Cleared · Epic Life" result banner (`_inquiriesCleared`). Verified Epic clears (4→0, +$1k); non-Epic keeps them.
- `_saveDefaults` adds `credit_inquiries:0` for migrated saves.

## v0.37.0 — 2026-06-30
**New Game+ (sandbox start-customizer)**

- **Unlock:** reaching **month 12+ as the New Business Owner** sets `localStorage.ep_ngplus` (persists across runs). `isNgPlusUnlocked()`.
- **Title card:** `_ngPlusCardHtml()` (gold "🔁 New Game+ — UNLOCKED") prepended in `renderSaves`, opens `showNewGamePlus()`.
- **Customizer popup** (`showNewGamePlus`) — two groups per the agreed scope:
  - **A · Starting position:** sliders for starting cash ($0–150k), personal credit score (500–820), available credit, starting debt (handicap), living expenses, energy; selects for business-at-start (zero / small ~$8k / established ~$40k) and entity (none / LLC / S-Corp).
  - **B · Head-start perks** (toggles): ⭐ Epic Life membership, fractional CFO, established business credit (+$20k line + D&B), funded cash-value policy ($15k cash value), banking relationship.
- **Start** (`startNgPlus`): clones the `new` archetype into an `ngplus` position, applies the slider/select values to `initial_state`, runs `selectArchetype(p, /*noStart*/true)`, then applies perks + `_tutorial_seen=true` (**no tutorial**) + `_ngplus=true`, and launches. `selectArchetype` gained a `noStart` param so perks can be applied before `startGame()`.
- **Sandbox / unranked:** NG+ runs set `state._ngplus`; the end screen replaces the leaderboard save with a "sandbox run — not ranked" note (a custom starting hand would skew rankings).
- Verified: unlock card shows, form renders all controls, starting applies cash/score/entity/business/perks correctly, tutorial skipped, ngplus flagged. No console errors.
- **Year-1 unlock notice:** `showCheckpoint()` shows a "🔁 New Game+ Unlocked!" panel (next to Save & resume) when finishing year 1 as the New Business Owner — prompts the player to save this run, then try NG+.
- **Scope note:** groups C (world/difficulty) and D (carryover) were intentionally deferred per design discussion.

**Update detection (cache/version awareness)**
- New `version.json` (`{"v":"0.37.0"}`) — **must be bumped on every release** alongside `PATCH_NOTES`. `_checkForUpdate()` (called in `init`) fetches it cache-busted (`no-store`), so even a browser running cached/old `game.js` learns a newer build is live and shows a fixed "🔄 A new version is available — Update now" bar (`_showUpdateBanner` → `_applyUpdate` reloads). `loadConfig` now appends `?v=<PATCH_NOTES[0].v>` to config fetches so config stays consistent with the loaded code version.
- **Caveat:** the reload gets fresh assets once GitHub Pages' ~10-min asset cache has expired (almost always true by detection time). For *guaranteed-instant* freshness, version the `js/game.js`/`css` URLs in `index.html` (would also need a matching `build.ps1` change) — deferred to keep the load path / offline build untouched.

## v0.36.1 — 2026-06-30
**Save version check + one-click update/migration**

- Saves now stamp the game version (`_snapshot().gv = PATCH_NOTES[0].v`). Added `_curVersion()` and a semver `_verLt(a,b)` (a missing `gv` counts as older).
- **Older-save detection + update flow:** the title-screen "Continue your game" card shows a gold notice + an **"⬆ Update Save to vX"** button when the autosave predates the current build (and each saved run gets a "⚠ older version" tag). The button opens `showSaveUpdate()` — a popup that previews **all patch notes since the save's version** (`_patchNotesSince(gv)`) and an "⬆ Update my save to vX" confirm.
- **Migration:** `applySaveUpdate()` → `_migrateSave(snap)` fills in fields newer mechanics expect (`_saveDefaults()`, only when missing — never overwrites progress), stamps `gv` to current, and persists. The warning/button then clear. `_loadSnapshot` also runs `_migrateSave` so **resuming any old save auto-updates it**. Most patches "retro-activate" on their own because the engine recomputes from state each tick; migration just makes the state shape current. Verified: an old save (v0.33.0, missing new fields) updates to current, gains the new defaults, keeps existing data (cash etc.), and the notice clears.

## v0.36.0 — 2026-06-30
**Epic membership waives advisory fees (with savings shown), realistic debt-restructure pricing, concierge ladder reorder, sales-team closes customers, operations energy dividend**

- **Epic concierge waives professional fees.** `EPIC_WAIVED = ['wyoming_holding_llc','build_personal_credit','debt_restructure']` — when the concierge runs these, the member pays **$0** (cost zeroed in `_epicLifePick`). The would-be professional fee (`_epicServiceFee`: holding $3,000; credit-repair `min(2500, 600 + derogatories×300)`; debt-restructure the success fee) is recorded as `_epicSavings` (month) + `state._epic_savings_total` (lifetime) and shown on the "Your Concierge This Month" card ("💰 Saved you $X … $Y to date"). Verified: concierge runs the Wyoming LLC free and books $3,000 saved.
- **Debt-restructure priced realistically** (`_debtRestructureFee` = `min(2000, round(0.10 × 17000 × creditCapacity))` — a lending expert's ~10% success fee on the ~$17k×capacity credit/loan it qualifies, capped at $2k). `actionCashCost` special-cases `debt_restructure` (→ fee for manual, $0 for Epic). Replaces the old flat cost.
- **Concierge ladder reorder:** `wyoming_holding_llc` now comes **before** `banking_relationship`, and banking is gated on the holding company existing — the bank sees the clean parent LLC first.
- **Sales & Conversion → customers, not just leads:**
  - `build_sales_team` monthly handler now **closes** customers (`min(3×businessLevel, available leads)`) in addition to generating leads — a dedicated closer converts pipeline. Verified +7 customers/mo contribution.
  - `crm_pipeline` now adds `customer_base: 3` (failure 1) to match its own "three forgotten leads turned into deals" narrative (previously it only lifted `sales_conversion`, adding customers indirectly via the monthly conversion rate). Audit: all other Sales & Conversion actions already add customers directly.
- **Operations energy dividend:** `actionEnergyCost` now applies a systems discount — `disc = min(0.4, systems_maturity/250)` — so hands-on moves cost up to ~40% less energy as you systemize. Verified: a 10-energy action costs 10 / 8 / 6 at systems 0 / 50 / 100. (Invest energy in systems now → cheaper actions later.)

## v0.35.0 — 2026-06-30
**Two-bar roadmap (Funding Ready, then Epic Life System) + realistic credit-approval underwriting**

- **Roadmap = two tracked progress bars, one at a time.** `_epicRoadmapData()` now returns `systemPct` (Protection + Expense + Reserve completion), plus `activeLabel`/`activePct`: **Funding Ready** until it hits 100%, then **Epic Life System**. The compact milestone (result screen + Finance menu) and the "Your Concierge This Month" card now show the active bar's label, %, and swing (month-start snapshot split into `_roadmapStartFr`/`_roadmapStartSys`) instead of a single blended overall %.
- **Credit approvals are underwritten on personal utilization + myFICO 3B.** New `_creditApprovalChance()` — **at or under 30% utilization there is no penalty** (the healthy zone); the cliff is only above it: ≤30%→0.92, >30%→0.50, >50%→0.30, >70%→0.07, then scaled by personal FICO (≥760→×1.1 … <600→×0.3), because lenders pull the owner's personal credit and personal guarantee **even for business credit**. `CREDIT_APPROVAL = ['bank_personal_loan','business_credit_line']`; these now use the approval chance (not the flat 0.6 success_rate, and not skill/energy-modified). Verified (FICO 720): u5/u15/u29/u30 all → 92% (flat), u31→50%, u55→15%; a poor FICO still drags approval even at low utilization.
  - **Legibility:** each application card shows a `~N% approval` chip (red ⚠ below 45%, with the current util%); a decline writes a dynamic narrative explaining the utilization / personal-FICO reason.
  - `business_credit_line` failure now withholds the line (was granting a $5k consolation) and applies a small hard-inquiry score ding, matching a real decline.

## v0.34.0 — 2026-06-29
**myFICO-weighted credit score (utilization = 30%), achievement energy boost, milestone-banner declutter**

- **Credit score follows the real myFICO 3B factor weights.** New `calcFicoTarget()` composes the five FICO factors — payment history 35% (`credit_negatives`), **amounts owed / utilization 30%** (`calcPersUtil`), length of history 15% (scales with `month`), credit mix 10% (revolving + installment + business), new credit 10% (capped lower during an open repair) — into a 300–850 target. `monthlyTick` now drifts `personal_credit_score` toward that target (±9/−4 per month) whenever a credit repair isn't actively running (the repair branch still handles derogatory removal). Verified: utilization alone swings the target ~148 pts (5%→90%) = `0.30 × 0.9 × 550`, i.e. exactly its 30% share. Replaces the old utilization-only ceiling.
- **Achievement energy boost:** unlocking milestones grants a minor energy bump (+4 each, capped +12/month) in `monthlyTick` (`_milestoneEnergy`), surfaced as a `⚡ +N` chip on the milestone banner. A little morale momentum for progress.
- **Milestone-banner declutter:** multiple milestones unlocking in one month now collapse into a single "🏆 N Milestones Unlocked" banner (titles listed + lead mentor line) instead of one full card each — fixes the wall of trophy cards under the concierge card. A single unlock still gets its full moment.
- **Concierge card trim:** dropped the "✓ Completed:" roadmap-node line from the "Your Concierge This Month" card — it overlapped with the achievement banner directly below it. The card keeps what the concierge ran + the roadmap % swing + the next step.

## v0.33.0 — 2026-06-29
**Roadmap surfacing (result-screen milestone + non-member preview) and the Key-Man Leverage loop (Phase 2, hybrid framing)**

**Roadmap UX (items 1 & 2):**
- Refactored the roadmap into a shared `_epicRoadmapData()` (single source of truth) consumed by the full modal view and a new compact view.
- **`_epicMilestoneCompact()`** — a glanceable card: overall % bar + current stage + next node, tappable to open the full roadmap. Shown to **non-members** on the result screen (locked teaser/upsell) and to **members on the Finance action menu** (replacing the old "Epic Life Membership handles these for you" list, which was redundant).
- **`_epicMonthCard()`** — a richer card at the **top of the result screen for members**: what the concierge ran this month (`_epicLastMove`, captured when the epic move resolves) + its narrative, the **roadmap swing** (overall % vs `_roadmapStart` snapshot taken at month start), any **newly-completed nodes** (diff vs `_roadmapStartDone`), and the next milestone. Tappable to the full roadmap. (Members get this instead of the compact teaser; non-members keep the teaser.)
- **Non-member locked preview:** `_epicRoadmapHtml({locked})` renders the roadmap (with the player's real progress) for non-members too, dimmed + framed as "🔒 Concierge Roadmap — Preview" with an upsell line. Wired into `showEpicLife` for everyone.

**Key-Man Leverage loop (Phase 2 — hybrid, as agreed):**
- **Portfolio tracking:** each `buy_real_estate` adds a leveraged, operator-run unit (`_asset_units`, `_asset_income`).
- **New action `key_man_policy`** (finance, wealth, repeatable, `_asset_units_gte: 1`, in "Wealth & Passive Income"): covers operators up to the current portfolio (`_keyman_units = _asset_units`); premium scales at ~$180/mo per covered operator, reconciled into `operating_expenses` by delta so re-taking just tops up.
- **New event `key_operator_loss`** (people, `requires _asset_units_gte 1`, probability scales with `_asset_units`): custom resolution in `resolveEvent`. Losing an operator **always** stops that asset's income (`other_monthly_revenue -= perUnitIncome`, unit removed). **Covered** → the policy retires that property's *specific* mortgage (`real_estate_debt`/`total_debt -= min(perUnitDebt, …)`, one policy consumed, `_keyman_claims_total += claim`) — contained, **never net-positive** (you lose the income stream in exchange). **Uncovered** → the loan remains while its income is gone, plus a ~2×-income scramble cash hit. Verified both paths: covered retires exactly the per-unit loan; uncovered leaves debt unchanged.
- **Visibility ("tracked and visible"):** a **🏗️ Leverage Engine** panel in the roadmap — income-property count, asset debt, 🔑 key-operator coverage (n/units · %, color-coded), a red uninsured-operators warning pointing to the action, and a claims-to-date note ("covering each specific loan, never a windfall").
- **Phase 3+ (not built):** private-lending/PE are unlevered (no per-asset loan) so they're outside the key-man-debt loop for now; accumulation-policy/key-man-on-people-running-other-asset-types could extend later.

**Dev infra:** `serve.ps1` now sends `Cache-Control: no-cache` so local edits always reload fresh (no effect on the live GitHub Pages site).

## v0.32.0 — 2026-06-29
**Epic Life "Concierge Roadmap" — the golden path made visible (progress bars + coverage gauge + Freedom finish line)**

- **New `_epicRoadmapHtml()`**, rendered inside the Epic Life modal (`showEpicLife`) for active members. Visualizes the golden path as nested progress bars, surfaced one stage/layer at a time by % completion. Every node maps to existing game state/flags (no new subsystems) — purely a read-only view.
  - **Bar 1 — Funding Ready** (gates Bar 2): Credit optimization (`credit_negatives===0 && score≥680`) · Debt restructure (`debt_restructure`) · Holding company (`wyoming_holding_llc` / `_holding_company` / `entity ∈ {c_corp, multi_entity}` / `setup_family_office`) · Banking relationship (`banking_relationship` or banker trusted/champion). Below 100% it shows only this bar + an unlock hint.
- **New action — `wyoming_holding_llc`** (finance, leverage stage, "Tax & Protection" group): a Wyoming holding LLC (registered agent, business address, operating agreement, NAICS code). Effects: sets `_holding_company`, `litigation_exposure −20`, `personal_guarantee_exposure −12k`, `business_credit_limit +12k` (better bank access), `audit_risk +2`; $3k one-time, 90% success. Distinct from `asset_protection_stack` (the wealth-stage full holding+trust+umbrella) — this is the earlier *funding-ready* structural layer. Wired into the menu, `EPIC_HANDLED`, the concierge `_epicLifePick` ladder (built before the protection stack), and the roadmap's Holding-company node. (Player wrote "NAIC" — modeled as **NAICS** industry code, the identifier banks actually use.)
- **Debt-coverage gauge:** kept **inclusive** (passive + business profit) ÷ debt service, per decision — the lenient reading.
- **Emergency fund → 3 months:** the roadmap Reserve node and the v0.31.0 pay-yourself-first auto-cushion now both target **3× living expenses** (floor of the 3–6 month range), up from 2×.
  - **Bar 2 — Epic Life System**, layers revealed as each fills: **Protection** (insurance / entity / counsel / asset-protection trust) → **Expense** (lower taxes / lower debt service / reserve discipline) → **Reserve** (accumulation policy / investments / emergency fund).
  - **Payoff readouts** (once reserve underway or passive active): a **Debt-coverage gauge** = (passive income + business profit) ÷ monthly debt service, color-coded (≥1.25× green, ≥1× gold, <1 red) — the safety signal as leverage/debt grows; and a **Freedom bar** = passive income ÷ lifestyle cost, with the tax-free policy portion called out, culminating in a **🏝️ Paradise** banner at 100%.
- Verified across early / funding-complete / fully-built states (layers gate correctly, coverage + Freedom + Paradise render); no console errors.
- **Scope:** Phase 1 of the larger Epic Life vision — visualizes the *existing* path. The key-man / income-producing-asset / mortality-claim mechanics are a planned Phase 2 (agreed framing: **hybrid** — an asset's key-man/loan-protection policy covers that asset's specific loan on a person loss, but is never net-positive overall; asset cash flow stays the primary debt-payer, insurance the backstop).

## v0.31.0 — 2026-06-29
**Solvency correctness (false-insolvency + negative-credit bugs) + earned second chances (personal cushion, earlier runway warning)**

> Triggered by a player report: a run ended "Insolvent — Out of Cash & Credit" while $1,914 cash and +$1,885 accessible capital remained. Two bugs reproduced it exactly.

- **Bug — false insolvency (the report):** the solvency check (`_settleCashOrLose` + the `monthlyTick` cash check) only considered the *business's* cash + credit + tax reserve. A business shortfall declared game-over **without ever tapping the owner's personal cash**, even though accessible capital (which includes personal cash) was positive — contradicting the game-over screen's own "cash + all available credit" definition. Fix: new `_tapPersonalToSurvive(need)` — a last-resort owner capital contribution from `personal_cash`, run after business cash → credit → tax reserve, before declaring `_pendingLose`. Reached only when otherwise insolvent, so a normal month never touches the cushion. A truly broke owner (no cash, no credit) still correctly goes insolvent (verified).
- **Bug — negative available credit:** drawing the *full* remaining credit line subtracted the 3% cash-advance fee **on top of** the limit, leaving `available_credit` at `-fee` (the reported "−$29"). Fixed in all four draw sites (`coverShortfall` ×2, `payCost` personal branch, the `monthlyTick` personal-credit draw): principal is now capped at `floor(avail/1.03)` so principal + fee ≤ the limit and credit floors cleanly at $0.
- **Earned cushion (pay-yourself-first):** owner pay now adds a small, bounded draw in profitable months to build a personal emergency fund up to ~3 months of living costs (`reserveTarget = living×3`, cushion ≤ 10% of revenue, capped by affordability), then stops once funded. Verified: cushion engages early, backs off when the fund is full; still capped by `afford` so it never hands out free money or hollows out retained equity.
- **Earlier runway warning:** `showResults` stashes the month's runway (`_lastRunwayMo`); when it falls to ≤3 months, `resultPrimary` fires a one-time `_lowRunwaySpotlight` on the runway figure (how to act before the cliff). Re-arms only after runway recovers to ≥6 months / cash-flow positive (`state._runwayWarned`) — loud, not nagging.
- **Second-life note:** mirrors the tax-reserve rescue — a "🛟 Saved by Your Personal Savings" popup (`_ownerRescue`) when personal cash covers a would-be-fatal shortfall, nudging the player to fix the burn.
- Deliberately did **not** raise the base pay scale (a blanket forgiveness lever that dilutes the margin-of-safety lesson and shifts equity out of the business). Second chances stay *earned*.

## v0.30.1 — 2026-06-29
**Cost/label consistency pass, realistic MCA rework (revenue holdback), Cash & Credit panel reorg, copy de-bloat**

- **Cost-field consistency:** new actions were mislabeled (cash prices buried in `effects.cash`, ongoing payroll in `effects.operating_expenses`) so cards/results showed no proper tags. Fixed to the native pattern — one-time price → `cash_cost` (vanity $3.5k, influencer $18k, national $45k, off-market $30k); ongoing payroll → `recurring_cost` (offshore $12k/mo, closer $9k/mo). Now each shows the 💵 cost tag + funding source, or the 🔁 recurring tag + "ongoing operating expense" result line + burn itemization. `restructure_team` shows a dynamic cost tag (severance / legal). Added `_clearRecurring(id)` + `_reduceRecurring(amount)` so firing/downsizing keeps `_active_recurring_costs` in sync with `operating_expenses`.
- **MCA reworked to model reality** (`fast_working_capital`): now a $25,000 advance repaid at a 1.3× factor (~$32,500, 30% fee) via a **20% revenue holdback** each month until cleared, then it falls off. No credit-score or credit-line hit (pre-approved on revenue). Gated `monthly_revenue_gte: 10000`. New `mca_factor`/`mca_holdback` config fields; `_mca_balance`/`_mca_holdback`/`_mca_paid` state; holdback processed in `monthlyTick` after revenue finalizes; card tag "🔁 X% of revenue till repaid".
- **Cash & Credit panel reorganized:** middle section = credit score, credit available, cash, total debt; bottom section = business revenue, then total expenses this month with the MCA holdback **folded into the total** (footnoted with `#` + balance remaining) instead of a separate line.
- **Copy de-bloat:** trimmed all new trap lessons/narratives/tips to the house length (lessons now 219–349 chars vs the existing 222 avg).

## v0.30.0 — 2026-06-29
**Voluntary downsizing action, offshore-trap payroll fix, "high-ticket closer" trap wired to the payroll mechanic**

> Patch notes keep the traps vague (no spoilers). Dev detail below.

- **New `restructure_team` action** (operations, `team_size_gte: 4`, repeatable) — the missing recovery path for over-hiring. Dynamic handler in `resolveMonth`: cuts up to 4 heads, trims `operating_expenses` ~$2k/head, charges ~$1.5k/head severance (via `coverShortfall`), +key-person dependency, −8 culture. Sets `_dyn_narrative`.
- **Offshore trap fix:** `rapid_offshore_scaleup` now adds `operating_expenses: 12000` (team_size alone never created payroll opex, so the "heavy fixed cost" narrative was false). Now taking it genuinely flips you cash-flow negative.
- **New "high-ticket closer" trap** (`hire_highticket_closer`, marketing/leverage, in `TRAPS`): bait is +8 conversion / +8 customers, but +$9k/mo payroll, −18 culture, and sets `_toxic_closer` (boolean rides in `effects`, hidden from preview since `_`-prefixed). While employed, `monthlyTick` applies churn +0.03, brand −3, litigation +6 each month. He can only be removed via `restructure_team`, which now **prioritizes firing the closer**: clears the flag, −$9k opex, but +25 litigation and ~$12k legal/settlement (he threatens to sue), culture +10 relief. `isActionLocked` force-opens `restructure_team` whenever `_toxic_closer` is set (fireable even with a tiny team).
- **Rescue surfacing generalized** to `_needsRestructure()` (overstaffed-and-bleeding OR toxic closer): floats `restructure_team` to the top (urgency +25), shows a red badge ("⚠ FIRE THE CLOSER" / "⚠ CUT PAYROLL — FIX THIS"), and fires a one-time spotlight tip.
- **Reusable `recurring_term`** (shipped 0.29.0, used here conceptually): term-limited recurring costs fall off when paid.

## v0.29.0 — 2026-06-29
**Hidden trap actions (one per stage ×3 categories), tax-reserve second life, realistic term-limited predatory debt, insolvency-screen polish**

> Player-facing patch notes deliberately keep the traps vague (no spoilers). Dev detail below.

- **6 disguised "trap" actions** — appealing copy, always a setback (`success_rate: 1`, damage in `effects`). One per stage across finance/ops/marketing:
  - **Foundation:** `fast_working_capital` (finance, merchant cash advance), `vanity_follower_boost` (marketing, bought followers).
  - **Leverage:** `rapid_offshore_scaleup` (operations, cheap mass hiring → payroll + culture/churn/brand hit), `influencer_megadeal` (marketing, junk reach).
  - **Wealth:** `offmarket_guaranteed_fund` (finance, affinity-fraud scam: −$30k + lawsuit/audit risk), `national_ad_blitz` (marketing, unmeasured spend).
  - Each carries a `lesson` that reveals the trap after the fact. They sit in real ADIR groups to blend in; a CFO's card projections expose their true numbers (intended). New `const TRAPS=[…]`; `mk_funnel` milestone filters traps so taking one can't falsely "build a funnel".
- **Term-limited recurring costs** — new `recurring_term` action field. Registered alongside the recurring cost (`_recurring_expiry`), processed in `monthlyTick`: when the term ends, the cost is removed from `operating_expenses` + `_active_recurring_costs` and a "paid off" ripple posts. `fast_working_capital` uses a 9-month term (strangles cash flow, then falls off); debt double-count removed from its effects.
- **Tax reserve = second life** — `_tapTaxReserveToSurvive(need)`: when cash + all credit are exhausted, the tax reserve is drained ONLY if it fully covers the gap (a partial drain wouldn't save you, so it's left intact and you still lose). Wired into both insolvency paths (`monthlyTick` cash check + `_settleCashOrLose`). On a save, a 🛟 "Saved by Your Tax Reserve" popup fires (`_taxRescue`), reminding the player the year-end bill still comes.
- **Insolvency screen polish:** Accessible Capital now renders red when ≤ 0 (`accCol`); the game-over walkthrough is a single `_spotlightTip` step highlighting the negative Accessible Capital (`#result-accessible`) instead of the old 2-step panel→runway sequence.
- **`pay_down_debt` card fix:** the `$0` plan tag now distinguishes "⚠ no spare cash" (utilization/DTI high but broke) from "already healthy" (genuinely low).

## v0.28.0 — 2026-06-29
**Six-pillar end-game scoring (Protection + Freedom added), streamlined insolvency/game-over flow, game-over graphic & walkthrough**

- **Scoring rewrite to six pillars** (`config/scoring_weights.json` v3, `calculateFinalScores`): **Passive Income** (0.26, crown jewel — tax-free quality folded in), **Leverage** (0.18), **Protection** (0.14, NEW), **Freedom** (0.14, NEW), **Lifestyle** (0.16, also gates), **Net Worth** (0.12). Standalone `tax_efficiency` and `creditworthiness` removed — credit folds into Leverage/Protection as an enabler, tax-free quality into Passive Income & Protection. `business_revenue` dropped from scored output (computed inline in `determineArchetype` for flavor only).
- **New Protection score:** legal entity (LLC→S/C-corp→multi-entity) + asset-protection trust (basic/full/dynasty) + insurance coverage (vs ~$500k) + cash reserves (~6 months of burn), 25 pts each.
- **New Freedom score:** surfaces existing `calcFreedom()` (owner-independence) as a first-class scored pillar.
- **Definitions without revealing scoring:** each pillar card on the year checkpoint and both end screens is tappable (`showDimInfo` → `_renderScoreCards`), opening a plain-English `player_description` from config — no weights or formulas shown. "Tap any pillar" hint added.
- **Radar + archetype updated** to the six pillars; `drawRadarOn` now plots 6 axes (was 7 with Revenue/Tax/Credit); `determineArchetype` rewritten to use protection/freedom.
- **Insolvency flow streamlined:** `_pendingLose` now short-circuits at the top of `nextMonth`, clearing any queued event/tax — the run ends right after the Cash & Credit card instead of forcing an event and tax bill first.
- **Game-over teaching on the final Cash & Credit card** (`_gameOverSpotlight`, fired from `resultPrimary` on a losing month): red panel border + "❌ Insolvent" header, negative cash/credit rendered red (`posRow` valRed), and a 2-step spotlight (why the run ends → the 0-month runway). Redundant `loseGame` pop-up suppressed once the walkthrough ran (`_gameover_tut_seen`).
- **Bankruptcy graphic** (`_brokeGraphic`): replaced the crude stick-figure SVG with a clean emoji hero (😩 + 💸💸💸 + "GAME OVER" / "BANKRUPT — OUT OF CASH & CREDIT") in a red-tinted card. Used in the spotlight and the score-screen fallback popup.
- **Tighter final month:** no random events in month 36 (`checkEvents` returns null at `month>=36`); the month-36 year checkpoint is skipped (go straight to the final score — it duplicated the end screen).
- **First-event onboarding** upgraded from a single pop-up to a 2-step guided spotlight (the situation → your choices).

## v0.27.1 — 2026-06-29
**Tutorial resume + concise copy, progress-aware event onboarding, game-over explainer**

- **Tutorial resume fix:** `_tutorial_seen` is now set only on `endTutorial` (which also `autoSave()`s), instead of when the tour starts — so refreshing mid-month-1 resumes the tutorial instead of skipping it. Re-show guarded by `!this._tutActive`. All step bodies trimmed for concision.
- **Progress-aware events:** `checkEvents` returns null in month 1. `market_recession` (previously `requires: {}`) now requires `monthly_revenue_gte 10000` + `customer_base_gte 8`. The forced first event only fires once there's a real business (`customer_base>=1 || monthly_revenue>0`), excludes `macro`, prefers gentle categories, and respects every event's `requires` — so no nonsensical events (employee quits with no staff, recession pre-revenue). First event ever shows a one-time "📣 Events Happen" explainer (`_first_event_seen`).
- **Game-over explainer (`loseGame`):** a "💥 Game Over — Insolvent" pop-up now appears over the score screen, leading with the specific `_pendingLose` reason and explaining how to avoid it (margin of safety: reserves, credit lines before you need them, insurance, watch runway).

## v0.27.0 — 2026-06-29
**Autosave/resume, energy realism rebalance, real-estate fixes, results-before-game-over, dashboard/expense fixes**

- **Autosave & resume:** the run autosaves each month to `ep_autosave` (written at the END of `renderMonth`, after unlock tips are marked, so a refresh doesn't replay them). Title screen shows a "↩ Continue your game" card (`_autoSaveHtml`/`resumeAuto`/`discardAuto`); cleared on `endGame`/`loseGame`. Added a `beforeunload` warning during a live game.
- **Energy rebalance (config):** retuned `energy_cost` across all action sets on the principle *founder-involved = higher energy, pay-to-delegate = lower*. Big drops on delegated/paid actions (hire delivery team 15→6, middle mgmt 12→6, contractor 10→6, content engine 8→6, family office 8→5, asset protection 12→6, dynasty/c-corp/s-corp/advanced-tax/premium-financing lowered, RE/acquisition 12→8, debt restructure 12→8); trimmed extremes (discount promo 22→12, webinar 18→12, full systemization 15→10, fulfillment 14→9, vertical integration 14→8); DIY stays high (do-it-yourself 18, cold outreach 15). Lower overall drain means the off-cadence Life check-in (energy ≤30) is no longer effectively forced mid/late game.
- **Real estate:** passive income now displays correctly — dashboard Income/mo and `showNetFlow` use actual `other_monthly_revenue` (+ policy + private-bank interest) instead of a legacy `real_estate_owned×1800` formula that was never set. Added a **depreciation write-off** to `buy_real_estate` (~building/27.5yr) that reduces taxable income with narrative.
- **Results before game-over:** insolvency no longer short-circuits to the end screen. `showResults` renders normally, the triggered event story plays, and `loseGame` fires when the player advances (`nextMonth` checks `_pendingLose` after events/tax). Event-caused insolvency (`resolveEvent`) now sets `_pendingLose` and renders the outcome story first.
- **Net Worth persistence:** once revealed (on a positive month) the dashboard row stays even when net worth goes negative (shown red).
- **Debt breakdown:** real estate, policy loans, and private-bank line now always listed under a "Secured & Other Debt" section regardless of personal/business scope; total reflects all shown.
- **Staff & payroll:** `hire_executive_assistant` and `hire_general_counsel` now grant `team_size +1`. `showBurn` itemizes Operating Expenses into each recurring salary (`_active_recurring_costs`) + executive pay (`calcExecComp`). Result Cash & Credit panel adds a "📈 Business revenue" row with MoM swing (`_msStart.rev`).
- **Scam events:** going all-in now hits hard (large scaled cash loss + new debt + credit-score hit + energy); shielded by CFO/family office via `shielded_multiplier` + new `payout` handler. Reworded choices so the conservative option doesn't telegraph the scam ("Put in a small starter position", "Ask to see audited returns first").
- **Build Personal Credit:** description fixed (no "cut utilization"); ~45% chance of an automatic credit-limit increase (raises `available_credit`, lowering utilization).
- **Low energy:** raises failure risk (0.8 <30, 0.6 in burnout) AND dampens outcome (×0.85 / ×0.7); reworded "weaker" → "fails more & deliver less".
- **Fixes:** `owner_pay` removed from action "Stats impacted" (auto-managed) and dropped from `elect_s_corp` effects; Life unlock tip no longer double-fires; tapping a stat clears its ⓘ on whichever dashboard is visible (incl. event screen).

## v0.26.0 — 2026-06-28
**Dashboard stat-info system, life-action economy overhaul, energy/spending/partial fixes, scam events, key-person fix**

- **Dashboard stat-info (`renderStats`, popups, `statInfo`):** clickable stat rows route through `Game.statInfo(key)` → scoped popup (personal vs business split for credit score, credit, debt, income/revenue, burn; single-scope for net worth, owner equity, mastery, cash flow). Each popup leads with a concise intro + a PERSONAL/BUSINESS scope chip + a "Mark all as viewed" footer. Unviewed stats pulse an `info-new` ⓘ badge; `_statsViewed` tracks per-key, `renderStats()` re-renders to clear badges. D&B Score now clickable. Personal credit labeled **MyFICO 3B**.
- **Life-action economy:** Life menu (`getAvailableActions('lifestyle')`) now shows a balanced spread — cheapest option per subcategory (weakest dims first) + cheapest fill, cap 10 — so basics (sleep, gym, meditation, hike) are always reachable (fixes "sleep gated"). Meditation now free. New low-cost recovery actions: nature_hike (free), treat_dessert, retail_therapy, spa_massage, home_cooking, rec_sports_league. All 39→45 actions now have a real applied `effects.energy`; energy badge bottom-right of cards. Each card tagged 👤 Personal / 🏢 Business (`lifeActionIsPersonal`). Costs realism pass (recurring vs one-time; trimmed steep personal splurges: vacation 15k→9k, sabbatical 30k→18k, yacht 60k→38k, etc.). `calcEnergyRecovery` slope 0.12→0.16 (mastery matters more: ~10→26/mo).
- **Energy mechanics:** low energy now raises failure risk (penalty 0.8 <30, 0.6 in burnout) AND dampens success outcome (×0.85 / ×0.7); gauge/tutorial reworded from "weaker" to "fails more & delivers less". `_turnEnergy` nets a selected Life action's energy gain so the burnout warning is accurate; Life opens off-cadence and surfaces strongest recovery when energy ≤30; lifestyle affordability counts credit.
- **Scam events:** `crypto_friend_scam` and `coworker_investment_scam` (opportunity category). Going all-in hits hard (large scaled cash loss + new debt + credit-score hit + energy); `protection.shielded_by` a fractional CFO / family office with `shielded_multiplier` cuts the loss to ~10-15%. New `protection.payout` handler in `resolveEvent`.
- **Key-person insurance fix:** `key_person_loss` rewritten from "poached" (a departure) to a health emergency / illness / injury / death — the situations key-person insurance actually covers — and added a real `payout` lump sum (+$25k) when covered; the resignation event (`key_employee_quits`) stays payout-free.
- **Spending order (`payCost`):** business expenses now spend business **cash first**, then a little business-credit float (≤util cap), then the credit backstop — no surprise debt; personal cash never touched by a business cost.
- **Hiring costs visible:** `build_sales_team` / `hire_first_contractor` recurring salaries (prior release); C-suite hires (fractional CRO/COO/CFO + full-time promotes) now show an estimated "🔁 ~$X/mo pay" tag from `calcExecFrac`/`calcExecFull` (they charge via the exec-comp mechanic, so it's an estimate, not a fixed `recurring_cost`).
- **Turn button consistency (`updateConfirmButton`):** "End Turn →" when all categories picked; otherwise primary navigates and the secondary shows count + skip ("Skip Turn (0/N)" / "Skip {rest} & End Turn ({done}/{N})"), scaling with 3 or 4 active categories.
- **Partial handling:** result badge "Partial" → "Didn't finish"; a partial no longer marks an action done (`_completed_actions`/`_action_counts` only increment on success), so it doesn't satisfy capability gates or show "done ×N" — still retryable at half cost.
- **Build Personal Credit:** description no longer says "cut utilization"; now a card issuer may auto-raise your limit (~45% chance) — implemented as an `available_credit` bump that lowers utilization.
- **Tutorial Back button** restored and made safe (revisiting a picked action shows "Next" without deselecting; disabled across the resolved-month boundary).

## v0.25.0 — 2026-06-28
**Tutorial pass — synced with recent UI/balance changes, redundancy removed**

- **Cash-flow step (`#dash-cashflow`):** removed the stale "~X mo left" runway reference (the per-column runway was removed in v0.24.3); now describes monthly burn and points to the breakdown popup for runway.
- **Result-screen steps de-duplicated:** the separate `#tut-result-card` and `#tut-result-detail` steps both told the player to "tap anywhere on a card" after the whole-card-tap change — merged into one step (with "tap again to collapse"); tutorial went 17→16 steps.
- **Money panel step (`#month-cash-panel`):** refreshed to match the redesigned panel — accessible capital + runway, then the month-over-month credit-score/cash/credit/debt swings and spend.
- **Recommendation/explanation alignment (`_tutRecPick`):** operations now prefers `study_business_content` first so the highlighted card always matches the "Why this move?" explanation (previously relied on `do_work_yourself` being locked at month 1). Marketing (`cold_outreach` = "Outbound Prospecting") and finance (`establish_business` = "Form LLC") already matched.
- **Life unlock tip:** now lists all five Personal Mastery dimensions (added Spirit) and notes that a Life action restores energy when you're low (financeable if cash is tight).

## v0.24.4 — 2026-06-28
**Life-action energy rework, accurate burnout calc, recovery safety valve, hiring recurring costs**

- **Life action energy boosts — all real & balanced:** 10 Mind(legacy)/Spirit(philanthropy) actions previously showed an energy gain that was never applied (`effects.energy` missing). All now have a real, applied `effects.energy` (+5–8), with `energy_cost` aligned. Every one of the 39 life actions now gives a genuine energy boost, with variety across all five Personal Mastery dimensions (Body +5–25, Mind +6–8, Spirit +5–20, Heart +5–25, Luxury +5–30).
- **Energy gain shown bottom-right of life cards (`showLifestyleScreen`):** the `⚡ +N energy` badge is `margin-left:auto` (bottom-right) and reads from `effects.energy` (the value actually applied) rather than the unused `energy_cost`.
- **Burnout warning nets Life energy (`_turnEnergy`):** previously `Math.max(0,energy_cost)` clamped a selected Life action's restorative energy to 0. Now a selected Life action's energy gain is netted against the turn's drain, so the `⚡ left` tag and the burnout confirm are accurate (and `left` is capped at 100).
- **Recovery is always reachable:**
  - `getAvailableActions('lifestyle')` affordability now counts credit (`canAfford`, was cash-only) — an expensive recovery action can be financed when cash is tight.
  - When energy ≤30, the life option list surfaces the strongest energy-restoring actions first (sorted by energy gain) instead of the usual weakest-dimension priority.
  - `_lifeOpen` now opens the Life check-in off-cadence when energy ≤30, so you can proactively recharge in a crisis month instead of waiting for the quarterly cadence.
- **Hiring recurring costs:** `build_sales_team` ("Hire a Salesperson", +$3,000/mo) and `hire_first_contractor` ("Vendor Contractor", +$1,500/mo) now carry a monthly salary like every other hire — previously a one-time fee bought permanent headcount for free. (C-suite hires were already recurring via the exec-comp mechanic; other staff hires already had `recurring_cost`.)

## v0.24.3 — 2026-06-28
**Dashboard info-screen audit + plain-language descriptions, result-screen color fix**

- **Dashboard info popups — concise intros added:** `showCreditAvail`, `showDebt`, `showRevenue`, `showBurn`, `showAssets`, `showCreditScore` now each lead with a one-sentence plain-language explanation of what the stat is and why it matters. (`showNetFlow`, `showMastery`, `showOwnerEquity` already had intros.)
- **Owner Equity explainer (`showOwnerEquity`):** the Owner Equity row now opens a dedicated beginner-friendly popup (your stake in the business; grows from retained profit, shrinks from owner draws / partner share; rolls into Net Worth) with live numbers — instead of (confusingly) opening the Revenue screen.
- **D&B Score now tappable:** the Business D&B row opens the Credit Scores popup (which has the Business–D&B section); footnote clarified that D&B rates the *business* so the company can borrow on its own name without a personal guarantee.
- **Result-screen color fix (`resolveMonth` before→after rows):** rows for credit score, credit limit, business/personal utilization, credit available, and all status-bar stats (leads, customers, team, brand equity, systems, revenue capacity) were pushed without a color and defaulted to green. Now colored by direction — utilization **up = red**, all the "good when up" stats **down = red** (e.g. brand equity falling now shows red, rising utilization shows red). The event-outcome rows and Cash & Credit panel already handled direction correctly.
- **Dashboard cleanup (`netRow`):** removed the per-column "~X mo left" runway under Personal/Business Cash flow/mo — the two columns used different liquid pools and showed conflicting, misleading numbers. Full runway still lives on the result-screen Cash & Credit panel and the cash-flow breakdown popup.

## v0.24.2 — 2026-06-28
**No-coasting fix: lead decay so business revenue must be worked**

- **Lead decay (`monthlyTick`):** the not-yet-converted lead pool now goes stale each month (~5–18%/mo, reduced by brand equity: `decay = max(0.05, 0.18 − brand_equity/1000)`). Previously leads were a permanent reservoir that auto-reconverted churned customers for free, so a built-up base reached an equilibrium where revenue held forever with zero input (verified: coasting *grew* customers 120→128 and held revenue at $38,400/mo indefinitely). Now coasting causes gradual decline (sim: 120→82 customers / −33% revenue over 10 idle months), while active marketing (fresh leads each turn) easily sustains it. Retention levers still matter — lower churn (client success, systems maturity) slows the bleed; strong brand keeps leads warm longer. Aligns with DESIGN.md: only passive *tax-free* income should arrive without work; raw business revenue is fuel, not the goal.
- Known minor follow-up: the CFO revenue forecast (`showCfoReport`) uses a separate rough projection that doesn't model lead decay, so it may slightly overstate a coasting player's outlook.

## v0.24.1 — 2026-06-28
**Result-screen Cash & Credit redesign, tap-to-expand cards, balance + immersion polish**

- **Cash & Credit panel redesign (`showResults`):** simplified to icon rows on a single line (`white-space:nowrap`, no before→after) — 📊 Credit score, 💵 Cash, 💳 Credit available (business+personal combined), 🏦 Total debt — each with a colored ▲/▼ delta chip (`posRow` takes an optional formatter; `_msStart` now captures `persScore`). 💰 Accessible capital shows a **true month-over-month** swing (vs `this._prevAccessible`, the stored prior-month end value; reset in `selectArchetype`; no swing in month 1). 📉 Expenses-this-month line shows funding source (· cash / credit).
- **Tap-to-expand result cards:** whole card is clickable to toggle details (`onclick`+`cursor:pointer` when a detail block exists); removed the separate toggle. `toggleResultDetail(id,ev)` ignores `.term-link` taps so glossary terms still work. Result tutorial steps updated to "tap anywhere on a card".
- **Merged result button:** single two-tap `#result-next-btn` → `resultPrimary()` — first tap flashes the Cash & Credit panel ("💳 Check Cash & Credit"), second advances ("Next Month →").
- **Balance — established start:** cash 45k→60k, available_credit 10k→25k, operating_expenses 18k→14k. Established was the most fragile archetype (started cash-flow −$2.1k/mo on ~1.5mo runway → death-spiraled on early events); now ~+$1.9k/mo baseline with slack. Lifestyle-creep trap (owner_pay=25% of revenue) still provides the danger.
- **Balance — early-game cushion (`scaleEventEffects`):** RANDOM negative shocks in months 1-9 scaled down ~30% (fading to full by m9); opt-in opportunities untouched.
- **Immersion:** native `window.confirm` (missing-picks + burnout) replaced with the in-game styled popup (`_confirm`/`_confirmYes`; `confirmActions` split into `_checkBurnoutThenResolve`). Energy gauge warning sub-text now renders on its own row below the bar (`gauge` `subBelow` param) so it doesn't overflow into the business column on mobile.
- **Fixes:** Net Worth tutorial tip gated on live `calcNetWorth()>0` (matches the row's render condition); result before→after no longer shows an unchanged "Business credit limit" row when an action is financed on credit (decoupled limit/utilization rows); new-month navigator button reads "Next: Marketing →" (`_nextUnselectedCat` includes the current category); `_lost`/`gameOver` reset on new game.

## v0.24.0 — 2026-06-28
**Burnout/negative-energy mechanic, illness↔insurance trade-off, dashboard & result icons, layout/copy polish**

- **Overcommit/burnout:** `confirmActions` warns when committed energy (`_turnEnergy`) exceeds available; energy can go negative (floored −40 in `applyEffects` and the resolveMonth charge); dashboard energy gauge shows the real value + "⚠ burnout · high illness risk" sub with a clamped bar.
- **Ungated low energy:** `canAfford`/`getLockedReason` only block an action when it would breach −40 ("Too exhausted") — low/negative energy otherwise never locks actions.
- **Illness risk:** `checkEvents` `healthMult` now uses un-floored energy (capped 5×) so deep burnout sharply raises burnout/personal/health event odds; the Business Insurance Stack pays medical reimbursement + critical-illness lump sums (from the earlier health pass).
- **Icons:** dashboard rows/gauges (`RICON`, gauge labels) and result-screen chips + before/after rows (`_keyIcon`/`_lblIcon`) share the same stat icons.
- **Net Worth / Owner Equity:** Net Worth row shows only while `calcNetWorth()>0`; its ▲/▼ delta moved to its own line (no overflow into the business column); Owner Equity gets a matching swing via new `_oeStart`.
- **Action sort:** already-taken repeatables sink below fresh actions (retry → NEW → fresh → taken-before → locked → completed).
- **Tutorial:** new result-screen step spotlighting `#tut-result-detail` ("Details & lesson").
- **Copy:** trimmed Build Personal Credit lesson and Business Insurance Stack description/lesson.

## v0.23.25 — 2026-06-28
**Turn-flow UX: stay-on-pick, card/tag cleanup, dashboard icons, button labels**

- **Stay on the picked move (`selectAction`):** removed auto-advance; after selecting, you stay on that category and the "Next: …" button pulses (`_flashNextBtn` / `btnPulse` keyframes). `switchCategory` clears the pulse.
- **Last-pick prompt:** when the only unselected category is the current one, the primary button reads "Take Action" and `primaryActionBtn` focuses/flashes the cards instead of ending the turn; "End Turn" escape stays visible.
- **Card cleanup:** group tag + NEW/RETRY/SELECTED badges share a `.card-toprow`; cost tags use icons (💵 cash, ⚡ energy w/o minus, 🔁 recurring); selected card shows per-turn energy as a compact right-aligned "⚡ left: N" tag (`_turnEnergy`).
- **Dashboard icons (`renderStats`):** `RICON` map prepends icons to money/credit rows; gauges and Leads/Customers/Staff/Culture rows get icons too.
- **Button labels:** Take Action, End Turn, Next Month →, Take Life Action, Skip, Run the Month — capitalized and concise.

## v0.23.24 — 2026-06-28
**Action-list polish, per-turn energy summary, early-game action balance**

- **Selected card stays in place:** dropped the selected-to-top sort in `renderActions` (order now retry → NEW → urgency); selected just gets the highlight where it sits.
- **Per-turn energy summary:** new `_turnEnergy()` sums energy across all picked moves (exec/team picks excluded); the selected card shows "This turn: X of Y energy committed · Z left", gold ≤15 left, red "over budget!" when negative.
- **Removed CFO-forecast upsell** line from `actionPreview` (returned plain `curLine`).
- **Removed Read-more collapse:** descriptions are concise now, so the `.desc-clamp`/`.desc-toggle`/`_toggleDesc` collapse was removed; descriptions render in full.
- **Navigator focuses the cards:** `primaryActionBtn` calls new `_focusActionList()` after `switchCategory` — scrolls to the action list and flashes it (`.attn-flash` keyframes) instead of just flipping the icon.
- **Early-game action balance (config):** Operations was 1 choice at month 1 / 3 at month 2 vs marketing 4–5 and finance 6. Freed `basic_quality_control` and `write_first_sop` prereqs (→ available from start); `do_work_yourself` now gated on `leads_gte:1` (+ still `needs:["study_business_content"]`) instead of `customer_base_gte:1`. Trimmed the glut: marketing `do_sales_yourself` now needs `leads_gte:1`; finance `monthly_tax_reserve` now needs `establish_business`. Result ~ M1 3/3/4, M2 5/4/6, M3 8/5/7.

## v0.23.23 — 2026-06-27
**Concise action descriptions**

- Rewrote the `description` field of all ~76 actions across `actions_marketing.json`, `actions_operations.json`, `actions_finance.json`, and `actions_marketing_simplified.json` to one short sentence each (card stays scannable). Detail/teaching remains in `lesson` + `narrative_*` shown on the result screen. Preserved the accumulation-policy setup-cost clarification and the Epic first-game warning. No other fields touched; all four files validate.

## v0.23.22 — 2026-06-27
**Flat tagged action list, collapsible descriptions**

- **Action list redesign (`renderActions`):** dropped the collapsible direction-group accordion (`_openDir` no longer used for layout). All actions render as one flat list; each card gets a `.group-tag` from `_grpOf` (built from `ADIR`). Sort order: selected → retry (`_partial_actions`) → NEW (`_action_new_month`) → other available (by `urgency`); then locked "Unlocks next" compact rows; then completed (still behind "Show N completed").
- **Collapsible descriptions:** descriptions >95 chars (tags stripped) render with `.action-desc.desc-clamp` (2-line `-webkit-line-clamp`) and a `.desc-toggle` ("Read more ▾"/"Show less ▴"). `_toggleDesc(id)` flips per-card state in `_descOpen` and re-renders; toggle uses `event.stopPropagation()` so it doesn't select the action.

## v0.23.21 — 2026-06-27
**Turn-navigator button, guided business-unlock walkthrough**

- **Primary button as navigator (`primaryActionBtn`, `updateConfirmButton`, `_nextUnselectedCat`):** until all active categories have a pick, the bottom button reads `Next: [category] →` and calls `switchCategory` to the next unselected category (wraps); a secondary `#endturn-now-btn` ("End turn now") appears as an early-exit. All selected → `Confirm Actions →`. `switchCategory` now also calls `updateConfirmButton` (was leaving the label stale). Button markup in index.html points at `Game.primaryActionBtn()`.
- **Business-unlock guided walk (`_spotlightSeq`/`_seqNext`/`_renderSeqStep`):** the one-off `business` unlock tip is now a 2-step sequence — Step 1 `#biz-money` (financials), Step 2 `#biz-ops` (Leads → Customers → Staff / Culture). The business column's money + operations blocks are wrapped in `#biz-money` / `#biz-ops` in `renderStats`. Reusable sequence runner (Step N of M, Next/Got it/Skip) built on `_positionSpotlight`.

## v0.23.20 — 2026-06-27
**Health-neglect illness risk, insurance cash claims, half-cost retries, taken-before markers, cost-text fixes**

- **Illness risk scales with neglect (`checkEvents`):** new `healthMult = 1 + neglect*2.2` (neglect from low energy + low Body dimension, 0→~1.2) multiplies `burnout`/`personal`/`health_risk` events. `health_scare` gate relaxed to `energy_lte:40` (base 0.12→0.06); `founder_health_crisis` base 0.07→0.035. Verified: healthy 0%, tired ~12.5%/mo, wrecked ~19.7%/mo.
- **Insurance cash claims (`resolveEvent`, events.json):** shielded health events now (a) reimburse `claim_pct` of the out-of-pocket cost and (b) pay a tax-free critical-illness lump sum (`critical_illness:true`, `recovery_months`) sized to `max(8000, (living+lifestyle expenses)*months)`. Insured `founder_health_crisis` nets +$9,600 vs uninsured −$9,000. `combined_insurance` copy updated to name critical/chronic illness cover.
- **Half-cost retries:** `isRetry(a)` (action in `_partial_actions`) → `actionCashCost`/`actionEnergyCost` apply 0.5×. Card badge "↻ RETRY — HALF COST", discounted tags, and result energy uses `_ro._energySpent`.
- **Taken-before markers (`renderActions`):** repeatable actions taken in prior months get a `✓ done ×N` accent pill + `.taken-before` left-border/tint (CSS).
- **Cost-text accuracy:** `paid_ads_test` description/narrative no longer hardcode $500 (cost scales with business level); `fund_accumulation_policy` description clarifies the shown cost is setup-only, ongoing funding is the monthly auto-fund.

## v0.23.19 — 2026-06-27
**Mobile tutorial stability, energy burnout warnings, Net Worth reveal gating**

- **Tutorial placement (`_positionSpotlight`, `renderTutorialStep`):** `scrollIntoView` runs once (first pass `place(true)`); later passes (`420ms`, `900ms`) re-align from the settled rect with `doScroll=false`, killing the up/down jump and fixing first-load misalignment of `#month-label`. Added `transition:top .18s` on `#tut-tip`.
- **Dynamic hint arrow:** `#tut-arrow` set to `↑`/`↓` by `_positionSpotlight` based on whether the tip lands below/above the target. Baked-in arrows removed from `waitHint`s.
- **Button-aware End Turn step:** body is now a function and `waitHint:'__btn__'` resolves to the live `#confirm-actions-btn` label ("Confirm Actions →" / "End Turn (x/3 actions)").
- **Removed Back button:** dropped `backBtn`/dropped reverse nav from the interactive tour (reversing across a completed action selection broke the flow). `tutPrev` left unused but harmless.
- **Energy warnings:** new one-time `energy_low` tip in `_maybeShowUnlockTip` (fires at `energy ≤ 45`, points at `#dash-energy`), plus inline gauge sub in `renderStats`: `⚠ +rec/mo · rest soon` (≤45) → `⚠ low · moves weaker` (≤30). Explains the sub-30 effectiveness penalty and Life→Mastery→recovery loop.
- **Net Worth reveal:** `_reveal('networth')` now requires `calcNetWorth() > 0` (plus `sep || month≥4`); month-4 unlock tip points to ⭐ Epic instead.

## v0.23.18 — 2026-06-27
**Ownership-aware net worth (CFO), Operations gating, Epic-during-tutorial guard**

- **CFO net worth applies ownership % (`showCfoReport`):** `own = 1 − _partner_equity`; net worth uses `valuation × own`, with a new "Your Equity Stake (70%)" line. Dashboard Net Worth unchanged (book equity, already partner-adjusted via the monthly profit skim).
- **Operations progression:** `do_work_yourself` now requires `needs:["study_business_content"]` (plus a customer) — learn → do → delegate (`hire_first_contractor` still needs `do_work_yourself`).
- **Epic icon guard:** `#epic-btn` no longer renders while `_tutActive` is true (belt-and-suspenders on top of the `sep && month≥4` reveal gate).

## v0.23.17 — 2026-06-27
**Result-screen declutter, tutorial highlight fix, real partnership equity, premium-financing rework, event-text accuracy**

- **Result screen collapse (`showResults`/`toggleResultDetail`):** per-card stat chips + before→after + lesson hidden behind a "▾ Details" toggle; headline/narrative/cost stay visible.
- **Spotlight placement fix (`_positionSpotlight`):** centers the target and places the tip in whichever gap has room (the old top-pin hid top-of-page elements behind the tip). Unlock tips now spotlight their element (`_spotlightTip` + ids `biz-col`, `life-btn`, `dash-networth`, `epic-btn`).
- **Delayed Life payoffs (`nextMonth`/`renderMonth`):** apply quietly and surface as a "🌱 …paid off" note atop the next month (no separate "Ripples" screen/extra click).
- **Partnership equity is real (`_partner_equity`/monthlyTick skim):** accepting a 30% partner now removes 30% of monthly profit from cash + capital account; outcome narrative shows the actual scaled cash received.
- **Premium Financing rework:** `net_worth_gte` gate (≥$5M, added to `meetsReq`/`getLockedReason`); handler now a policy-secured low-interest loan sized to net worth (funded cash value = borrowed − ~2% COI, no free money; loan via `insurance_loan_balance`, netted from death benefit). `cash_cost` 0, recurring removed; description says "accumulation policy (whole life or IUL)".
- **Event text accuracy:** genericized flat dollar figures in outcomes that scale (tax attorney, lawsuit settle/fight, IRS audit).

## v0.23.16 — 2026-06-27
**Comprehensive onboarding: progressive disclosure + guided first-month tutorial; team-plan energy/Life/icon fixes**

- **Progressive disclosure (`_reveal`/`_maybeShowUnlockTip`):** advanced UI hidden until relevant, sticky once shown, archetype-aware. Personal Mastery + dimensions + Freedom reveal with Life; Net Worth once building wealth; ⭐ Epic after LLC + a few months; 🏆 Achievements after month 2. One-time contextual tips when Business, Life, Net Worth and Epic first appear.
- **Guided first-month tutorial (`TUTORIAL_STEPS`/dynamic bodies/row+gauge ids):** step-by-step dashboard walkthrough with live numbers (cash, debt, monthly burn + runway, energy, months left); after each category pick it pauses on the chosen action with a "why" explanation (auto-advance paused during the tour, tutorial drives the category via `step.cat`); result-screen walkthrough highlighting the result card (`#tut-result-card`) and the Cash & Credit panel (`#month-cash-panel`).
- **Team plan:** exec/team-run actions cost the player no energy (`_execRun` gate in `resolveMonth`, also hides the energy line on results); Life is always the player's own pick (`runTeamMonth` no longer auto-fills lifestyle; panel shows "🏖️ Life — always your pick"); team-plan icons match the action bar (CFO 💰, Life 🏖️).

## v0.23.15 — 2026-06-27
**Icon action bar — no more overlap**

- **Category controls as uniform icons (`renderCategoryTabs`/`CAT_ICON`):** Marketing 📣, Operations ⚙️, Finance 💰, Life 🏖️, Epic ⭐ — all same-size `.cat-icon` buttons. Categories grouped left in a scroll area, Epic (gold) pinned right; the Epic button no longer overlaps the other tabs on mobile (replaced the earlier sticky approach with a scroll-area + sibling layout). Active highlights green, chosen shows a ✓, names surface via the step indicator and `title` tooltips.

## v0.23.14 — 2026-06-27
**Epic Life guardrails + enrollment decoupling; mobile display fixes; tutorial alignment**

- **Cash-reserve guardrail (`_epicLifePick` / resolveMonth):** Epic perks spend CASH ONLY (never credit) and only if they leave ≥1 month of core expenses; otherwise it waits. Credit repair now prioritized first.
- **Hard-mode pacing:** for the Stuck archetype, Epic holds expensive protective setup (asset protection, insurance) until the business is stable (credit cleared + profitable).
- **Enrollment decoupled from Finance slot (`enrollEpicLife`/`_epic_enroll_pending`/`epicbuy`):** enrolling no longer occupies/cancels the Finance action — both resolve on End Turn; added a Cancel-enrollment option.
- **Mobile display:** `#epic-btn` shortened to "⭐ Epic" and `position:sticky;right:0` so it stays visible; compacted `.cat-tab` padding; `Cash flow/mo` runway wraps to a second line so it no longer overflows into the business column.
- **Tutorial alignment (`renderTutorialStep`):** re-place after the action-card fade-in settles so the finance highlight lines up exactly.

## v0.23.13 — 2026-06-27
**Epic Life result-card polish**

- **No energy cost (`_epicLifePick`):** Epic perks run with `energy_cost: 0` — the concierge does the work, so no "energy spent" line.
- **Premium styling (`showResults`):** Epic result card title + badge render in gold (`⭐ Epic Life`).
- **Correct money flow (`resolveMonth`):** Epic perks now resolve first (matching their top position in results), so before→after numbers chain in order instead of appearing out of sequence.

## v0.23.12 — 2026-06-26
**Epic Life button + plans, "Cash flow/mo" rename, locked-down tutorial**

- **Epic Life Membership as a tabs-row button (`renderCategoryTabs`/`showEpicLife`/`enrollEpicLife`):** right-aligned ⭐ button opens a popup with details, pricing, the warning, and two plans — Monthly ($500 setup + $300/mo, carried in operating_expenses) or Annual ($500 setup + $3,000/yr billed up front, renews every 12 months via `monthlyTick`; saves $600/yr). Removed from the Finance action menu and from auto-pick; plan stored in `_epic_plan`.
- **"Net/mo" → "Cash flow/mo" (`renderStats`/`showNetFlow`):** clearer label, runway suffix reads "~Nmo left", and a tap opens a plain-English breakdown (income/revenue in − expenses out, plus what runway means).
- **Locked-down tutorial (`renderTutorialStep`):** the overlay is now fully modal — blocks all taps and scrolling (`pointer-events:auto`, `touch-action:none`, touchmove guard). Only an invisible click-proxy over the spotlighted element (and the tip's buttons) is interactive. The Epic Life step highlights the new button.

## v0.23.11 — 2026-06-26
**Tutorial coaching + smaller mobile tip + Epic Life slide; new Operations & Marketing actions**

- **Tutorial recommends the move (`_tutRecPick` / `renderTutorialStep`):** "pick an action" steps now spotlight a single curated recommended card (opens its group, scrolls to it) instead of the whole list — Marketing → Outbound Prospecting, Operations → Study Business Content (or Do the Work Yourself once you have a customer), Finance → Form an LLC. Deliberately curated so it never points at the high-volume/low-value traps.
- **Smaller tutorial tip on mobile (CSS):** reduced padding/font/width/button sizes.
- **Epic Life Membership slide:** new tutorial step introduces the concierge with a ⚠️ "play your first game without it" warning; same warning added to the action's description.
- **New Operations action `study_business_content`** (Capacity & Delivery): $0 cash, 8 energy, builds systems maturity; **`hire_first_contractor` now gated behind `do_work_yourself`** ("master it before you delegate it").
- **New Marketing action `discount_promotion`** (Sales & Conversion): $0 cash, 22 energy, `{ customer_base +12, brand_equity −8, sales_conversion +3 }` — lots of low-paying customers and an energy drain that erodes pricing power.

## v0.23.10 — 2026-06-26
**New founder-led sales action + tutorial tip placement fix**

- **`do_sales_yourself` (Marketing → Sales & Conversion):** new foundation-stage, repeatable action — $0 cash, 14 energy. Effects `{ customer_base +5, sales_conversion +2, brand_equity +2 }`, 0.85 success. Added to the `ADIR` "Sales & Conversion" group. The scrappy founder-led close option before you can afford a team or funnel.
- **Tutorial tip placement (`renderTutorialStep`/`place`):** the tip is now pinned to the top (`top:10`) and the highlighted target is scrolled to sit just below it (`window.scrollBy`), so it never covers the element it points at. Tap-through on wait steps preserved.

## v0.23.9 — 2026-06-26
**Life-mastery clarity, recurring-cost sweep (Group A+B), event revenue-model fixes, policy-deal fix, popup scroll lock**

- **Life → Personal Mastery panel, unified (`_masteryPanel`):** both the quarterly check-in (`confirmLifestyle`) and the delegated-life result card (`resolveMonth`) now show `✨ Personal Mastery X → Y` with the dimensions (💪🧠🕊️❤️✨) and energy that moved. Life actions in the delegated path **always succeed** now (they were rolling a 0.7 chance and could no-op).
- **Recurring costs (Group A + B, 15 actions):** moved ongoing monthly costs out of one-time `effects.operating_expenses` into a `recurring_cost` field for family office, board, general counsel, S-corp, C-corp, LLC/bookkeeping, premium financing, and all 8 team hires — so they display as `🔁 +$X/mo ongoing` and tag the menu. Net gameplay effect unchanged (generic handler adds to opex once on activation). Group C (ongoing *savings*) left as-is.
- **Event revenue-model sweep:** removed all flat `monthly_revenue` effects from events (they were recomputed away each tick — cosmetic and misleading, e.g. "biggest client left → revenue zeroed"). Persistent client losses now use `customer_base`; one-month rest/health dips use real `cash`; growth opportunities (big contract, partnership, referral surge) now grant `customer_base` so the gains actually persist; the real-estate deal's rental income moved to `other_monthly_revenue` (persistent passive). Opportunity events are now genuinely rewarding; loss events cost real, lasting ground.
- **Policy-funded deal (`policy_loan_opportunity`):** the borrow-against-policy deal gave a level-scaled position for an unscaled loan (free wealth) and ignored policy capacity. Now you can only borrow up to ~90% of cash value, the position funded equals the amount borrowed, and cash value is untouched.
- **Popup scroll lock (`showPopup`/`_lockScroll`):** opening any dashboard info screen pins the background (iOS-safe) and restores scroll position on close.

## v0.23.8 — 2026-06-26
**Energy spend shown on result cards**

- **`showResults`:** each action card now shows an energy line — `⚡ −X energy spent` (orange) or `⚡ +X energy gained` (green) — based on the action's `energy_cost`, so the energy a move cost is visible alongside its cash cost and effects.

## v0.23.7 — 2026-06-26
**Net Worth on the personal dashboard with a trend indicator**

- **`calcNetWorth(state)`:** new helper — assets (cash + personal cash + investments + real-estate equity + policy cash value + retained business equity + private-bank balance) minus debt (total debt + insurance loan + private-bank loan).
- **Net Worth row (`renderStats`):** added to the bottom of the personal Money column (parallel to business Owner Equity), showing the value plus a **▲/▼ month-over-month change** vs the net worth snapshotted at the start of the month (`_nwStart`, captured in `resolveMonth`). Tappable → full asset breakdown (`showAssets`).

## v0.23.6 — 2026-06-26
**Recurring costs modeled & displayed properly (Business Insurance Stack)**

- **`combined_insurance` config:** moved the $550/mo premium out of one-time `effects.operating_expenses` into a proper `recurring_cost: 550` field.
- **Generic recurring-cost handler (`resolveMonth`):** any non-lifestyle action with a `recurring_cost` now adds it to `operating_expenses` once on activation (tracked in `_active_recurring_costs` to prevent double-charging). Unified the Epic Life Membership's $300/mo onto this path (removed its bespoke add).
- **Result card display (`showResults`):** actions with a recurring cost show the one-time charge as **Setup −$X** and a separate purple **🔁 +$X/mo ongoing operating expense** line, instead of a misleading one-time chip. The action menu already surfaces the `$X/mo ongoing` tag.

## v0.23.5 — 2026-06-26
**Bug fix: business term loan no longer inflates personal credit**

- **`bank_personal_loan` (separated branch):** removed the stray `s.available_credit += 10000×cf` that was bumping personal revolving credit availability (and dropping personal utilization) on what's described as a business term loan. A term loan is now purely `business_installment_debt` + cash + total debt, matching its narrative.

## v0.23.4 — 2026-06-26
**Result-screen decision clarity: accessible capital + runway, transparent financing fees, Epic perks first, mentor blurb removed**

- **Cash & Credit panel (`showResults`):** now leads with **Accessible capital** (cash + personal + business available credit) and **Runway** (`accessible / monthly net burn`, or "Profitable" when cash-flow positive). The action-cost line now shows the cost and names the funding source(s), with any 3% credit cash-advance fee broken out separately (`+$X credit financing fee`) so the funded amount no longer looks mismatched (e.g. an $800 cost drawn on credit no longer reads as "$824 personal").
- **Epic Life perks first:** results are reordered so 🌟 Epic Life concierge moves appear above the player's Marketing/Operations/Finance/Life cards.
- **Removed mentor blurb:** the monthly mentor/character commentary box on the result screen is gone — redundant with each action's lesson line and the achievement banners (`_pendingCharLine` no longer rendered).

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
