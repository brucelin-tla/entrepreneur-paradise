# Release Notes

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
