---
description: Version-bump, update RELEASE_NOTES, rebuild, and commit/push Entrepreneur Paradise
argument-hint: [version] "[summary of changes]"
---

Ship a release of Entrepreneur Paradise. Arguments: `$1` = new version (e.g.
`0.11.0`), `$2` = short summary. If arguments are missing, infer the version
(bump patch/minor based on the change) and summarize the diff yourself, then
confirm with the user before committing.

Steps:
1. **Verify it works** — run the playthrough sanity check (at minimum: serve via
   `preview_start` name `game`, confirm no console errors and the title screen
   loads). Do not release a broken build.
2. **Bump the version string** in `index.html` (the `v0.x.x — <date>` line on the
   title screen, around line 11). Use today's date and time.
3. **Update `RELEASE_NOTES.md`** — add a new entry at the top following the existing
   format: version, date, a bold title, and bullet points of changes.
4. **Rebuild the offline file** — run `build.ps1` to regenerate `game.html`.
5. **Commit** with the project's timestamp format:
   ```
   <type>: <summary> — YYYY-MM-DD HH:MM

   <details>

   Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
   ```
6. **Push** to `origin main` (GitHub Pages auto-deploys index.html + css + js + config).
7. Report the deployed version and remind the user GitHub Pages may take ~1 min.
