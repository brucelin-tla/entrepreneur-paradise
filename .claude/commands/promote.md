---
description: Promote the validated beta/ build to the LIVE root (with the two-key gate); stop before pushing for owner confirmation
---

Promote `beta/` to the live root game. This is the **highest-risk operation** in the repo —
it changes what real prospects/leads see on the live URL. Follow the gate; never shortcut it.

## The gate — BOTH keys required before promoting
1. **Machine key — `/playtest` GREEN on beta.** Run `/playtest`. Require, on the beta build
   (confirm the `_build` stamp says beta + emergent plateau):
   - 0 bugs (no NaN/undefined, no mid-run navigation, no crashes),
   - plateau holds for every persona (peak customers ≤ ~reach, teams lean ~≤8),
   - design hierarchy intact (operator > hustler/tourist > pincher; gambler self-destructs on weak starts),
   - sane survival curve.
   If anything is red, STOP — fix on beta first, do not promote.
2. **Human key — owner's mobile playtest.** Confirm the owner has actually played the beta build
   and is happy with the *feel* (pacing, clarity, fun, the first-timer experience). Bots can't judge
   this. If the owner hasn't playtested, STOP and ask them to before promoting.

Only with BOTH keys turned do you proceed.

## Promote
3. **Run the engine:** `promote.ps1` (from repo root). It copies beta → root (game.js, version.json,
   css, config), strips BETA branding from index.html, and rebuilds root `game.html`. game.js is
   decoupled (the Beta-Tester button is in both builds, shown only on live), so this is a clean copy —
   no manual button reconciliation.
4. **RELEASE_NOTES.md** — add ONE consolidated live-release entry at the top summarizing the batch
   being promoted (synthesize from the beta `PATCH_NOTES` entries that are newer than the last live
   release). RELEASE_NOTES tracks LIVE releases only; the in-game "What's New" already rode along in
   game.js's `PATCH_NOTES`.

## Verify (preview) — BEFORE committing
5. `preview_start` name `game`, load **root** `http://localhost:3000/?cb=<ts>` (NOT /beta/). Confirm:
   - version line shows the promoted version (matches `version.json` and `PATCH_NOTES[0].v`),
   - the 🧪 Beta Tester button IS present on the live menu (it should now render — you're not in /beta/),
   - the title/h1 show NO "BETA" badge and no "Testing build",
   - no console errors; a quick `EP`/naive smoke run reaches month 36.
   Also grep the built `game.html` for exactly one `window.EMBEDDED_CONFIG = {` (idempotent build).

## Commit — then STOP
6. Stage the root files (`js/game.js css/ config/ index.html version.json game.html RELEASE_NOTES.md`)
   and commit: `release: promote v<X.Y.Z> to live — <one-line summary>`.
7. **Do NOT push.** Surface the diff summary and the `/playtest` result to the owner and ask for explicit
   confirmation to push to main (per the confirm-before-push rule). Push only on an explicit yes.

## After the push (next dev cycle)
8. Beta is now equal to live. For the next batch, keep developing in `beta/` as usual and bump the beta
   version (e.g. to the next minor) so beta and live are distinguishable again.

## Notes
- Live is the funnel — judge the promotion by whether a NEW player's first 5 minutes are better, not by
  feature count. If in doubt, keep it on beta.
- Keep a fast rollback ready: the previous live state is the prior root commit (`git revert` + repush).
