---
description: Run an automated multi-persona playthrough of Entrepreneur Paradise and report balance/bugs
---

Drive automated playthroughs with five **player-persona bots** and produce a balance + bug
report. Do NOT ask the user to play manually. The bots and runner live in
`tools/playtest-personas.js` (a dev tool, not shipped in the game).

## Setup
1. `preview_start` name `game` (runs `serve.ps1` on port 3000).
2. **Navigate to the build under test and CONFIRM it.** Dev work lives in `beta/`, so default
   to it: `preview_eval` → `location.href='http://localhost:3000/beta/index.html?cb='+Date.now()`.
   (Root `/` is the stale LIVE build — only test it if explicitly asked.)
3. Inject the harness and **check the build stamp** so results can't be mis-attributed:
   `fetch('http://localhost:3000/tools/playtest-personas.js?cb='+Date.now()).then(r=>r.text()).then(t=>eval(t))`
   — the return string names the version and whether the emergent-plateau economy is present
   (`(emergent plateau)` = beta; `(OLD/root — NOT beta!)` = you're on the wrong build, fix step 2).

## Run the suite
- `preview_eval` → `JSON.stringify(EP.sweep())` — all 5 personas × 3 archetypes (stuck/new/established),
  N=6 each, aggregated and **stamped with `_build`** (url + version).
- For a tighter read on one persona: `JSON.stringify(EP.sweep(['operator'],20))`.
- Single raw game for debugging: `EP.runBot('new','gambler')`.

## The five personas (each tests a distinct thing)
- **operator** — skilled player on the intended path (finance ladder, runway discipline, no traps).
  *Expectation:* survives all archetypes, **highest composite** (validates the intended path is optimal).
- **hustler** — revenue grinder; maxes marketing/ops, neglects finance/leverage.
  *Expectation:* survives but **~half the composite** of operator (validates brute-force hits a ceiling).
- **gambler** — reckless over-leverager; most-expensive action, debt-funded, grabs every deal.
  *Expectation:* **blows up weak starts** (stuck/new), survives only the cushioned start (downside fires).
- **pincher** — timid bootstrapper; cheap/free only, hoards cash, no debt, never hires.
  *Expectation:* survives but **lowest composite** + low revenue (can't win by playing scared).
- **tourist** — inattentive casual; random affordable action, ~30% skip, random event choices.
  *Expectation:* mediocre/variable; mainly a **robustness/chaos** check (no crashes).

## Report (the deliverable)
Lead with the **build stamp** (`_build`), then:
1. **Bugs** — any non-empty `bugs` arrays (NaN/undefined, mid-run navigation, crashes). Should be empty.
2. **Plateau check** — `medPeakCust` should sit at/below market reach (~300) and `medMaxTeam` should
   stay lean (~≤8) for EVERY persona. A persona blowing past that = the emergent plateau is leaking.
3. **Design hierarchy** — does composite rank operator > hustler/tourist > pincher, and does gambler
   self-destruct on weak starts? If not, the intended-path-is-optimal thesis is at risk.
4. **Survival curve** — per archetype, is the difficulty sane (e.g. stuck hard, new/established gentler)?
5. **Specific fixes** — file + config key + suggested change for each real issue. Distinguish a GAME
   problem from a BOT problem (e.g. a bot mishandling an event choice is a harness fix, not a balance bug).

Stop the server when done.

## Notes
- The harness stamps provenance because the preview can silently navigate back to root; always trust
  `_build` over assumption.
- To extend: add a persona to the `personas` object in `tools/playtest-personas.js` (give it `pick`,
  `ev`, `tax`). Keep each persona a coherent *player type*, not an optimizer.
