# Retention & Difficulty Findings — Entrepreneur Paradise

**Date:** 2026-06-30 · **Build tested:** beta **v0.50.0** (emergent plateau: true) · **Status:** findings + proposal, NOTHING implemented yet.

This doc lets another session act on these findings cold. Two investigations: (A) is the game
too easy / a free win? (B) why do players quit ~month 12, and how do we hook them longer +
more edutainment. Everything below respects `DESIGN.md` (leverage/credit/insurance/passive is
the OPTIMAL path; brute-force revenue hits a ceiling; **passive tax-free income is the crown
jewel**) and the "verify design decisions first" + "no artificial caps" rules.

---

## A. Difficulty verdict — the SHIPPED start (`new`) is NOT a free win

Ran the 5-persona playtest harness (`tools/playtest-personas.js`), ~250 games, **zero bugs**,
plateau holding (peakCust ≤ ~280, team ≤ 4 every persona — no leak).

On the shipped `new` archetype (the only one enabled; `stuck`/`established` are test-only):

| Persona (player type) | `new` survival | Composite | Reads as |
|---|---|---|---|
| operator (plays finance ladder) | 15/15 | **303** | intended path optimal ✅ |
| hustler (revenue grinder, skips finance) | 6/6 | 190 (~63% of operator) | brute force ceilings ✅ |
| pincher (scared, hoards cash) | 5/6 | 122 | survives but loses ✅ |
| gambler (reckless over-leverage) | 1/6 | 40 | recklessness dies ✅ |
| tourist (inattentive, random, 30% skip) | 7/15 | 57 | coasting fails ~half ✅ |

**Conclusion:** healthy curve — you can't coast to a win. Difficulty is well-tuned; do NOT
make it harder across the board.

**Two caveats:**
1. **The skilled operator never dies — 15/15 even on the HARD `stuck` start.** Once a player
   knows the finance path there is *zero* failure risk. Correct by design, but it's likely why
   the game feels like a free win *to the designer* (who plays like an operator). The lever, if
   we want tension for knowledgeable players, is **managed downside variance mid-game** — not a
   flat difficulty bump. (This converges with retention fix B-5 below.)
2. **`established` is easy mode** (tourist random play survived 9/15, comp 218). Only matters if
   it's ever enabled. Leave it as a test archetype.

Harness note: the `tourist` persona is HIGH variance — small-N medians are unreliable; trust the
ordering and the `new` column. Preview silently navigates back to root `/` between heavy evals;
always re-check `location.href.includes('/beta/')` and re-inject the harness, and trust `_build`.

---

## B. Retention — why players quit ~month 12 (game is 36 months)

### The smoking gun
`showCheckpoint()` at month 12 hands the player an **"End Here" button that locks in their score
and posts to the leaderboard** — a textbook *compulsion exit ramp* placed exactly at the 1-year
psychological boundary. We give explicit permission to leave, right before the payoff.

### Everything around month 12 reinforces "you're done"
| Factor | Where | Effect |
|---|---|---|
| Milestone drought months 8–14 (rewards front-loaded to m1–5) | `MILESTONES` array / `checkMilestones()` | progress feels invisible, no celebration |
| Silent Q4 revenue dip −15% months 10–12, no narrative | `monthlyTick` seasonal block | feels like regression right before the scorecard |
| Character arcs already resolved (~m11) | `_dueArcEvent()` (star operator ~m10, toxic closer ~m9–11) | the people-drama carrying m7–11 goes quiet |
| Wealth stage (the payoff) is ~m18–20+ away | `stage_thresholds.json` (Leverage→Wealth) | passive tax-free income never TASTED before quitting |
| Checkpoint is a scorecard, not a cliffhanger | `showCheckpoint()` | "Year 2 proves it works without you" is stated but nothing mechanically pulls them in |

**Net:** a month-12 quitter has learned the loop, run out of new toys, felt a dip, and been
handed an exit button — **before ever experiencing the thing the whole game is about.**

### Research backing (external)
- Reward gap too long → players quit before the next hit; fix by layering faster micro-rewards
  inside the slow loop. (GameAnalytics core loop)
- Escalation: the 100th turn shouldn't feel like the 1st. (gamedesignskills)
- Small completion points act as OFF-RAMPS — make month 12 a re-hook, not a finish line.
  (access-ability, compulsion exit ramps)
- Nested loops micro/meso/macro; always show a near goal. (Keewano, featureupvote)

Sources: gameanalytics.com/blog/how-to-perfect-your-games-core-loop ·
access-ability.uk/2022/04/25/addictive-gameplay-loops-and-compulsion-exit-ramps ·
keewano.com/blog/game-mechanics-players-hooked · featureupvote.com/blog/game-retention

---

## C. The plan — convert month 12 from off-ramp to launch ramp (ranked)

All additive hooks; none are flat caps. Numbers are starting points to tune.

### 🥇 Tier 1 — highest leverage, do first
1. **Taste passive income BEFORE month 12.** Crown jewel is currently Wealth-stage (~m18+), so
   most quitters never feel it. Add a small, legible *first drip* on the finance path by ~m8–10
   (e.g. first policy dividend / a modest `other_monthly_revenue` stream when the cash-value
   policy is opened). Copy: *"+$340/mo — money that shows up whether you work or not. This is the
   engine."* **Most on-thesis single change.** *(MILESTONES + policy handler in `resolveMonth`/`monthlyTick`; use `other_monthly_revenue` so it survives the revenue recompute)*
2. **Turn the checkpoint into a re-hook.** In `showCheckpoint()`, before End/Continue, add a
   **Year 2 preview**: the specific mechanic about to unlock + a projected-score delta
   (*"Year-2 builders averaged 2.4× this score — your passive engine is about to compound"*).
   Keep "End Here" (the 12/24/36 leaderboard tiers are genuinely good for casual players) but
   make Continue the obvious pull. *(`showCheckpoint`)*
3. **Kill the milestone drought.** Add ~4–6 mid-game milestones firing in the m8–16 gap —
   incremental beats (*"Credit line opened," "First manager past 90 days," "First $5k passive,"
   "Halfway to Wealth stage"*). Layer faster micro-rewards so the reward gap never gets long
   enough to quit in. *(MILESTONES array + `checkMilestones`)*

### 🥈 Tier 2
4. **"Next goal" HUD.** Players see cryptic locked buttons (*"unlocks: systems_maturity ≥50"*)
   at 42 and don't know how to close it. Surface ONE near-carrot: *"2 more SOPs → unlocks
   business credit lines."* The reason string is already computed in `getLockedReason` — promote
   it to a visible goal line. *(`renderActions`)*
5. **Narrate the Q4 dip (ALSO the difficulty fix).** Turn the silent −15% into a *seasonal event
   with a choice* (weather it / discount push / cut costs). Converts regression into agency +
   drama exactly when the game goes quiet. **This is where retention and the difficulty caveat
   A-1 converge** — managed downside so even skilled players sweat. *(`monthlyTick` seasonal +
   `events.json`)*

### 🥉 Tier 3 — polish
6. **Guarantee a drama beat months 13–17** (downturn is currently random m14–21 → ~50% miss the
   danger window). *(event scheduling)*
7. **Per-turn micro-win:** every results screen shows ≥1 stat as a progress bar toward a named
   threshold, not just before→after. *(`showResults`)*

### Recommended first release
Ship **Tier 1 as one focused beta release** (highest-leverage, hits the exact quit moment).
Tightest testable pair to start = **#1 (early passive drip) + #3 (mid-game milestones)**.
Spec exact config keys + numbers before writing code; then `/balance` or `/playtest` to verify,
and confirm with owner before promote (two-key gate).

---

## Game structure reference (for whoever builds this)
- Turn: pick ONE action from Marketing/Ops/Finance → results screen (before→after stats,
  milestone banners w/ Marcus Webb mentor line, cliffhanger). ~2–3 min/turn.
- Stages: Foundation (m1–~7) → Leverage (~m6–17) → Wealth (~m18+), per `stage_thresholds.json`;
  advances per-category when that category's thresholds are met.
- Narrative beats fire at m1/6/12/18/24/30/36 (`narrative_beats.json`) but m12 & m18 do nothing
  MECHANICALLY — beats only.
- Checkpoints m12 & m24: composite (0–600), 6-pillar radar (Passive Income, Leverage, Protection,
  Freedom, Lifestyle, Net Worth), debrief, Continue/End. m36 → final score, no checkpoint.
- Scoring: `calculateFinalScores`, `calcComposite` (lifestyle <30 gates final to 30%),
  `buildDebrief` ("Left On The Table" = seen-but-not-taken), `determineArchetype` (6 win types).
- Key funcs: `showCheckpoint`, `checkMilestones`, `updateStages`, `_dueArcEvent`, `monthlyTick`.
