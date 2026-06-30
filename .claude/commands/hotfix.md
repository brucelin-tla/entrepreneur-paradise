---
description: Patch a bug that is live on main, in BOTH root and beta, without promoting unreleased beta work
---

Fix a bug that is **live on root** right now, without either (a) leaving live broken until the next
promotion, or (b) shipping all of beta's unfinished work just to fix one thing. This is the ONE
sanctioned exception to "always work in beta" — keep it surgical and scoped to the single bug.

## 1. Reproduce & locate (on the LIVE build)
- `preview_start` name `game`, load **root** `http://localhost:3000/?cb=<ts>` (the live build — NOT /beta/).
- Reproduce the bug; find the exact cause in root's `js/game.js` / `config/` / `css/`.
- Keep the fix as small as possible. A hotfix is not a refactor.

## 2. Fix root (live)
- Apply the minimal fix to the root files.
- **Patch-bump the live version:** root `version.json` + a new `PATCH_NOTES[0]` entry in root
  `js/game.js` (increment the PATCH digit, e.g. 0.42.5 → 0.42.6; short player-facing note) +
  a RELEASE_NOTES.md entry. Rebuild root `game.html` (`build.ps1` from root).
- Verify in preview on root: bug gone, no console errors, version line updated.

## 3. Reconcile beta (so the two don't diverge on this fix)
- Beta has evolved, so the buggy code may look different there. Determine which case applies:
  - **Beta still has the bug** → apply the equivalent fix to beta (`beta/js/game.js` etc.), bump
    beta's `PATCH_NOTES`/`version.json` if you're treating it as a beta release, rebuild
    `beta/game.html`, and verify on `/beta/`.
  - **Beta already fixed it** (its evolution superseded the buggy code) → no change needed; note this.
- The goal is "**the bug is gone in BOTH builds**," not an identical diff.

## 4. Commit — then STOP
- Commit root and beta changes (one commit is fine):
  `hotfix: <bug> — live v<patch> + beta reconciled`.
- **Do NOT push.** Show the owner the diff + the before/after repro and ask for explicit confirmation
  to push to main (per confirm-before-push). Live hotfixes still go out only on an explicit yes.

## Notes
- If the bug is also reachable in a way the persona bots would hit, add/adjust a check in
  `tools/playtest-personas.js` so `/playtest` catches a regression next time.
- If a "hotfix" starts growing beyond a few lines or touches multiple systems, it's not a hotfix —
  do it on beta and let it ride the next promotion instead.
