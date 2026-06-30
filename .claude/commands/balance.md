---
description: Make a gameplay balance/tuning change on beta the right way — design-checked, harness-validated, before/after reported
---

Tune a balance/economy lever in `$ARGUMENTS` (or the change just discussed) on the **beta** build,
following the project's design discipline. Balance work is the dominant recurring task here — this
keeps every change honest and verified instead of improvised.

## 1. Design check FIRST (before touching code)
- Read the relevant part of `DESIGN.md` (the north star: leverage/credit/insurance/passive is the
  OPTIMAL path; brute-force revenue must hit a ceiling; passive tax-free income is the crown jewel).
- Honor the standing principles: **no artificial caps / flat maxes / over-limit penalties — slowdowns
  must emerge from mechanics** (see memory `no-artificial-caps-principle`); and **confirm design
  decisions with the owner before implementing** anything that changes how the game plays/feels
  (`verify-design-decisions-first`). If the change is a real design call (not a small number nudge),
  propose the approach and get an OK before coding.

## 2. Find the real lever
- Tune numbers in `config/*.json` where possible; mechanics live in `beta/js/game.js`.
- Watch the known gotchas: static `monthly_revenue` in marketing/ops effects is recomputed away every
  tick — to move revenue, tune `customer_base` / `brand_equity` / reach drivers, not `monthly_revenue`.
  Persistent passive income uses `other_monthly_revenue`. The revenue plateau is the emergent
  `mktReach` ceiling — adjust its capacity/demand constants, not a clamp.

## 3. Change it on beta
- Edit only `beta/` files. Keep one source of truth (e.g. `mktReach`) — don't duplicate a formula.
- If the change should surface to the player, update the relevant readout/lesson text too (accuracy).

## 4. Validate with the harness (REQUIRED)
- `preview_start` name `game`, load beta, inject `tools/playtest-personas.js`, confirm the `_build`
  stamp says beta + emergent plateau (never tune against a contaminated/root build).
- Run `EP.sweep()` (and a tighter `EP.sweep(['operator'],12+)` if a survival/plateau number is in play).
- Read the result against the rubric: plateau holds, design hierarchy intact, survival sane, 0 bugs.
  Iterate the numbers until it lands. Tuning numbers are an owner decision — if you're choosing the
  exact value, present options/recommendation rather than picking silently.

## 5. Report before/after — then decide on release
- Show the owner the before/after (the metric you moved + the harness table).
- If it's a shippable batch, follow `/release` (beta version bump + PATCH_NOTES + RELEASE_NOTES +
  rebuild `beta/game.html` + commit) — beta only, no push, per confirm-before-push.
- Do NOT promote to live here; that's `/promote` with its own gate.
