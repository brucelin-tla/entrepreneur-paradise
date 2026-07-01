# Part 1 Restructure Spec — Entrepreneur Paradise (episodic, 18-month Part 1)

**Date:** 2026-07-01 · **Status:** BUILT & VERIFIED on beta (unpushed as of this note) — §2 spine (m12 screen removed → tax/save/continue; m18 finale + carry-state), §3 early passive drip (+$340/mo at policy open), §4 mid-game milestones, §5 Q4 dip → guaranteed decision event, §6 Part-1 composite (build pillars, no lifestyle gate) + rank tier, plus full congruence pass (leaderboard 18 & 36 only, m24 re-hook, reframed beats/tutorial/subtitle, NG+ moved to finale). All verified in the harness, no console errors.
**Decisions locked by owner:** (1) Episodic, **carry-state** handoff. (2) Spec Part 1 first, ship it as the first deliverable.

Built on `RETENTION_AND_DIFFICULTY_FINDINGS.md` (v0.50.0 research). Respects `DESIGN.md`
(leverage/credit/insurance/passive = OPTIMAL path; brute-force revenue ceilings; **passive
tax-free income is the crown jewel**) and the "verify design first / no artificial caps" rules.

---

## 0. The thesis in one line
Players quit at **month 12** (research "smoking gun": the checkpoint hands them an *End Here / post
score* off-ramp) — **before ever tasting passive income, which lands at ~m18.** So: make **month 18
the payoff finale of Part 1**, get them there with the research's mid-game hooks, then carry their
save into Part 2. The natural break now lands *on* the crown jewel, not before it.

---

## 1. The two parts

### Part 1 — "Build the Machine" (m1–18) · Foundation → Leverage
Arc: bootstrap → good debt → business credit/banking → insurance/protection → open the cash-value
policy → **CLIMAX at m18: Wealth stage unlocks, the passive engine turns on.** Part 1 ends the moment
the machine is built. Shippable and satisfying alone.

### Part 2 — "It Runs Without You" (m19–36) · Wealth stage
Passive tax-free income compounds; the lifestyle standard-of-living ladder, the concierge hub, and the
`NIGHTLY_QUEUE.md` wealth toolkit (retirement, Augusta, hire-your-kids, dynasty trusts) live here.
Ends in **Paradise** (passive covers your life). *(Part 2 is a later build — see §7.)*

---

## 2. The month-18 finale + carry-state handoff (the core new mechanic)

**Current:** `resolveMonth`/month-advance fires `showCheckpoint()` at `month===12||month===24`
([game.js ~2627]); checkpoint shows composite/radar/debrief + **"Keep Going"** and **"🏁 End Here —
Lock In & Post My Score"** ([showCheckpoint ~2785]). m36 → `endGame()`.

**Change:**
- **NEW `showPart1Finale()` at `month===18`** — a themed climax screen (not the generic checkpoint):
  - Headline: *"Part 1 Complete — Your Wealth Machine Is Built."*
  - The moment framed as the payoff: passive income now flowing, Wealth stage unlocked.
  - **Part 1 rank** on the BUILD pillars (see §6) — a "Machine Builder" grade, its own tiered title.
  - Primary CTA: **"▶ Begin Part 2 — Watch It Compound"** → carries state forward (reuse
    `continueFromCheckpoint()`: `month++; renderMonth()`), `autoSave()` first.
  - Secondary, de-emphasized: **"🏁 Finish here & post Part 1 score"** → `endGame()` (Part 1 is a
    legit complete run for casual players; keep the leaderboard tier, just don't make it the loud button).
  - Cliffhanger copy for Part 2: *"Year 2 proves the machine runs without you — now scale the passive
    engine into freedom, lifestyle, and legacy."*
- **m12: NO checkpoint screen (owner-locked).** Remove the year-1 checkpoint screen entirely — no
  composite, no radar, no "End Here" button. m12 becomes a quiet **auto-save + April tax-season prep beat**:
  taxes already fall due at m12 (`_pendingTax` at m12/24/36), so frame it as *"April tax season is coming —
  get your reserve ready,"* teeing up the existing tax event instead of an off-ramp. Momentum, not a finish line.
- **m24:** with the m12 screen gone and m18 as the Part-1 finale, m24 becomes Part 2's midpoint re-hook
  (toward m36). **m36** unchanged (final score / Paradise ending).

**Files:** `showCheckpoint` + the `month===12||month===24` trigger (~2627); new `showPart1Finale`;
`continueFromCheckpoint`, `autoSave`, `endGame` (reused). `narrative_beats.json` (m18 beat → point at finale).

---

## 3. Taste passive income BEFORE m18 (research #1 — most on-thesis)
The crown jewel currently lands only at the m18 climax; the mid-section (m8–14) must give a **first drip**
so momentum carries to the finale.
- On opening the **cash-value policy** (or first finance-ladder passive step), start a small **legible**
  `other_monthly_revenue` stream by ~m8–10 (survives the revenue recompute — use `other_monthly_revenue`,
  NOT `monthly_revenue`). Starting number ~**$300–400/mo** (tune).
- Copy: *"+$340/mo — money that shows up whether you work or not. This is the engine."*
- Fire a milestone the first month it appears (see §4: `fi_first_passive`).
- **Files:** policy handler in `resolveMonth` + `monthlyTick`; `MILESTONES`.

---

## 4. Kill the milestone drought m8–16 (research #3)
`MILESTONES` shape (real): `{id,cat,title,desc,mentor,check:(s,g)=>bool}` ([game.js:24+]),
evaluated by `checkMilestones()` ([~1064]). Add ~4–6 that fire in the current gap. Proposed:
- `fi_first_passive` — *"First Passive Dollar"* · `check: s=>(s.other_monthly_revenue||0)>0` (ties to §3).
- `fi_credit_line` — *"Business Line Opened"* · `check: s=>(s.business_credit_limit||0)>0` (may exist as
  `fi_banked`; add a distinct "line drawn" beat if not).
- `op_first_manager` — *"First Manager Past 90 Days"* · a tenure/`_manager` flag beat.
- `fi_protected` — *"Protected"* · `check: (s,g)=>g._perks && (has insurance + entity)`.
- `xp_halfway_wealth` — *"Halfway to the Machine"* · `check: s => leverage-stage progress ≥ ~50%` (from
  `stage_thresholds.json` distance to Wealth).
- `fi_5k_passive` — *"$5k/mo Passive"* · `check: s=>(s.other_monthly_revenue||0)>=5000` (Part-1 stretch).
Keep them incremental beats (mentor line via Marcus Webb), not gates.

---

## 5. Narrate the Q4 dip as a CHOICE (research #5 — also the difficulty lever)
Today `monthlyTick` applies a silent seasonal **−15% revenue m10–12** — feels like regression right
before the (old) scorecard. Convert to a **seasonal event with a choice** (~m10–12, GUARANTEED once in
Part 1): weather it / run a discount push / cut costs — each with a real trade-off. This is the "managed
mid-game downside" the difficulty findings (caveat A-1) call for, so even a skilled operator sweats before
the finale. **Files:** `monthlyTick` seasonal block + `events.json` (new `people`/`macro`-style event,
guaranteed-scheduled, not random).

---

## 6. Scoring split
- **Part 1 rank (m18):** score the BUILD pillars — **Leverage, Protection, first Passive Income** (plus
  Net Worth as a tiebreak). Reuse `calculateFinalScores`/`calcComposite`; add a Part-1 tiering + title
  ("Bootstrapper → Operator → Machine Builder"). Do NOT gate Part 1 on Lifestyle (that's Part 2's pillar).
- **Full run / Part 2 (m36):** unchanged — full 6-pillar composite, `calcComposite` lifestyle<30 gate,
  Paradise ending. Part 2 emphasizes Passive Income, Freedom, Lifestyle, Net Worth, Legacy.
- **Files:** `calculateFinalScores`, `calcComposite`, `_renderScoreCards`, `buildDebrief`, radar draw.

---

## 7. Ship sequencing
**Part 1 v1 (first beta release) =** §2 (m18 finale + carry-state, strip m12 off-ramp) + §3 (early passive
drip) + §4 (mid-game milestones). This is the tightest testable set that hits the exact quit moment.
Then §5 (Q4 event) + §6 (Part-1 rank) as a fast follow. **Part 2** (Wealth chapter content: wire the
handoff destination, then fill with the `NIGHTLY_QUEUE.md` toolkit) is a separate, later track.
Verify each with `/playtest` (the 5-persona harness) — watch that median month-reached climbs past 12 and
Part-1 completion (reaching m18) rises. Two-key gate before promote.

---

## 8. Decisions (owner-locked) + remaining tuning
1. **m12 checkpoint — REMOVED (locked).** No year-1 checkpoint screen. m12 = quiet auto-save + April
   tax-season prep beat (see §2).
2. **Leaderboard tiers — m18 & m36 ONLY (locked).** Part-1 rank posts at m18; full run posts at m36. No
   m12 or m24 leaderboard tiers. *(Files: `showPart1Finale` post-score, `endGame`/leaderboard post, and
   remove any interim m12/m24 posting.)*
3. **Wealth-stage timing (owner OK pending):** confirm the finance-path player reliably reaches Wealth by
   ~m18 so the finale lands on the real unlock — may need a small `stage_thresholds.json` nudge. Finale
   fires on `month===18` regardless; this only ensures the thing it celebrates has actually happened.
4. **Numbers to tune:** first-passive-drip size (~$300–400), Q4 event severity/choices, Part-1 rank tier
   thresholds, exact months for the new milestones.

---

## Reference (verified in beta v0.51.0)
- Month advance + checkpoint trigger: `month===12||month===24` → `showCheckpoint()` (~2627); `>36`→`endGame`.
- `showCheckpoint()` ~2785 (composite/600, radar, debrief, Keep Going / End Here + auto-save + NG+ unlock).
- `MILESTONES` const ~24; `checkMilestones()` ~1064; results set `_milestones_new` (~2450).
- Stages Foundation(m1–7)→Leverage(m6–17)→Wealth(m18+) per `stage_thresholds.json`; beats m1/6/12/18/24/30/36.
- `other_monthly_revenue` = the recompute-proof passive channel. Scoring: `calculateFinalScores`,
  `calcComposite`, `buildDebrief`, `determineArchetype`.
