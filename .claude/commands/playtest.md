---
description: Run an automated full playthrough of Entrepreneur Paradise and report balance/bugs
---

Drive a complete automated playthrough of the game in the preview and produce a
balance + bug report. Do NOT ask the user to play manually.

## Setup
1. Start the local server: `preview_start` with name `game` (runs `serve.ps1` on port 3000).
2. Confirm no console errors and that `CONFIG` has all sections loaded (`preview_eval`).

## Drive the game via `preview_eval` (the `Game` global is the API)
Key API (in `js/game.js`):
- `CONFIG.starting_positions.positions` — list of archetypes.
- `Game.selectArchetype(pos)` then `Game.startGame()` — begin a run.
- `Game.state` — full game state (`cash`, `month`, `monthly_revenue`, `total_debt`,
  `energy`, `_completed_actions`, `_stages`, etc.).
- `Game.getAvailableActions(cat)` for cat in `['marketing','operations','finance']`.
- `Game.isActionLocked(a)` / `Game.canAfford(a)` — filter to playable actions.
- `Game.selectActionPayment(cat, id)` — select an action for a category.
- `Game.confirmActions()` — resolve the month (advances to events/lifestyle/results).
- After resolving, handle whatever screen is active (`.screen.active` id):
  event-screen (pick a choice), lifestyle-screen (choose or skip), result-screen
  (`Game.nextMonth()`).

## What to do
- Play **all 36 months for at least 3 different archetypes** (include "stuck",
  "new", and an established one). Each month, pick a sensible/playable action per
  category (prefer affordable, non-locked, stage-appropriate actions).
- After each month, snapshot key state: month, cash, monthly_revenue, total_debt,
  energy, stage per category, founder role, completed actions count.
- Reach the end screen and capture the final score breakdown.

## Report (the deliverable)
Produce a concise report covering:
1. **Bugs** — actions with no effect, NaN/undefined stats, locked-forever actions,
   prerequisites that never unlock, console errors, crashes.
2. **Balance** — does each archetype survive to month 36 or go bankrupt? Is the
   Foundation→Leverage→Wealth progression reachable? Are any actions strictly
   dominant or useless? Is the difficulty curve reasonable?
3. **Specific fixes** — file + config key + suggested change for each issue.

Stop the server when done.
