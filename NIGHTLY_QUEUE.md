# Nightly Build Queue — Entrepreneur Paradise beta

The nightly routine (`ep-finance-overhaul-nightly`) builds the TOPMOST item under
"## APPROVED — build" (one per run), verifies in the harness, rebuilds `beta/game.html`,
commits to `main` (beta/ only — NO push, NO version bump), then moves the item to "## DONE".
It never builds from "## IDEAS" or "## NEEDS OWNER INPUT". Reports land at
`.claude/scheduled-tasks/ep-finance-overhaul-nightly/last-report.md`.

Every item must serve DESIGN.md (leverage/credit/insurance/passive is the OPTIMAL path;
brute-force revenue hits a ceiling; passive tax-free income is the crown jewel) and be
LEGIBLE — surface WHY to the player. Follow existing patterns (config action + resolveMonth
handler + ADIR group + accurate `lesson`). Numbers below are starting points — tune later.

---

## APPROVED — build (topmost first; one per run)

### 1. Retirement plan — Solo 401(k) / SEP (→ cash-balance upgrade)
- **id** `retirement_plan` · finance · stage `leverage` · ADIR group "Protect & Optimize Taxes" · `one_time` setup.
- **prereq** `needs:["establish_business"]`, `monthly_revenue_gte: 8000`. **cash_cost** ~1500 (setup). 
- **Handler** sets `_retirement_active=true`. **monthlyTick block** (mirror the captive_insurance loop): contribution = `min(round(monthly_revenue*0.08), 1900)` (≈ the ~$23k/yr employee elective limit, scaled small); it's PRE-TAX/deductible, so the real cash cost is `contribution*(1-tax_rate)` — subtract that from cash; add the FULL contribution to a new `_retirement_balance` that compounds tax-deferred (`*1.005/mo`, ~6%/yr).
- **Net worth + assets:** add `_retirement_balance` to `calcNetWorth` and a row in `showAssets` ("Retirement account — grows tax-deferred; pre-tax now, taxed at withdrawal").
- **Lesson (accurate):** a Solo 401(k)/SEP lets an owner shelter a big chunk of income pre-tax (Solo 401k ~$23k employee + employer up to ~$69k total; SEP ~25% of comp) — it's a DEFERRAL (taxed when you withdraw in retirement), or pick Roth to pay tax now and withdraw tax-free. High earners can later add a cash-balance/defined-benefit plan to shelter $100k+/yr.
- **Legibility:** narrative shows "$X/mo sheltered pre-tax (real cost only $Y after the deduction), compounding tax-deferred."

### 2. Hire your kids / family
- **id** `hire_your_kids` · finance · stage `leverage` · ADIR group "Protect & Optimize Taxes" · `one_time` toggle.
- **prereq** `needs:["establish_business"]`, `monthly_revenue_gte: 8000`. **cash_cost** 0.
- **Handler** sets `_family_payroll=true`. **monthlyTick:** a modest deductible wage (e.g., `round(min(monthly_revenue*0.02, 1200))`) is paid to family — model the tax benefit by reducing the tax drag / crediting back `wage*tax_rate` (you deduct it; the child owes ~$0 under their standard deduction). Small `lifestyle_legacy` and `lifestyle_relationships` bump (family + legacy). Keep the net effect modest — it's a smart efficiency, not a windfall.
- **Lesson (accurate):** paying your kids a REASONABLE wage for REAL work moves income from your high bracket to their ~0% bracket (under the standard deduction), the business deducts the wages, and they can fund a Roth IRA early. Must be legitimate, documented work at a fair rate.

### 3. Deepen `elect_s_corp` (salary vs. distribution lesson)
- **Modify the existing `elect_s_corp` handler** (don't add a new action). On/after election, model the real mechanic: a "reasonable salary" (~45% of profit as W-2) plus distributions; only the DISTRIBUTION portion escapes the ~15.3% self-employment/payroll tax. Apply that SE-tax saving (reduce the tax drag) scaled to profit, and **add `audit_risk`** if the implied salary is too low (lowballing is the top S-corp audit trigger).
- **Legibility:** narrative spells it out — "you took $Z as a reasonable salary and $Y as distributions, saving ~$ in self-employment tax; keep the salary defensible or you raise audit risk." Keep the existing liability-shield benefit.

### 4. Augusta Rule (§280A(g))
- **id** `augusta_rule` · finance · stage `leverage` · ADIR group "Protect & Optimize Taxes" · `one_time` toggle (recurs annually).
- **prereq** `needs:["establish_business"]`, `monthly_revenue_gte: 8000`. **cash_cost** 0.
- **Handler** sets `_augusta_active=true`. **monthlyTick:** once a year (`month%12===0`) the business pays the owner fair-market rent for ≤14 days of legitimate business use of the home — `amount ≈ round(min(monthly_revenue*0.5, 18000))`. Add `amount` to `personal_cash` TAX-FREE, and let the business deduct it (reduce tax drag / it's a deductible expense). 
- **Lesson (accurate):** §280A(g) lets you rent your home to your business up to 14 days/yr — tax-free income to you, deductible to the business — IF it's genuine business use (e.g., board/strategy meetings), documented, at a fair market rate.

### 5. Wealth-stage trusts — irrevocable / dynasty (asset protection)
- **id** `asset_protection_trust` · finance · stage `wealth` · ADIR group "Build Wealth & Passive Income" (or Protect) · `one_time`.
- **prereq** `needs:["wyoming_holding_llc"]` (or elect_s_corp), `net_worth_gte` ~300000. **cash_cost** scales (~15000 legal).
- **Handler** sets `trust_structure='dynasty'` (this makes the existing `showAssets` "protected from lawsuits and estate tax" note + the tax-drag reduction at the tax-inefficiency block fire CORRECTLY — they already key off trust_structure). Big `litigation_exposure` reduction; mark assets shielded so a downturn margin-call deficiency can't reach personal cash; flavor of estate-tax removal.
- **Lesson (accurate + the trade-off):** an IRREVOCABLE trust protects assets from lawsuits and removes them from your taxable estate (dynasty = passes to heirs across generations, skipping estate tax) — but the price is CONTROL: you legally give up direct ownership. That's the real trade revocable living trusts don't make.

### 6. Player feedback UI + behavioral telemetry — CLIENT-SIDE ONLY (no-op hook)
- Build ONLY the client side, mirroring the leaderboard "build UI now, wire backend later" pattern (`LB_BACKEND` hook). **Do NOT attempt to provision/​wire Supabase** — that needs the owner's credentials (see NEEDS OWNER INPUT).
- **Feedback:** on the end-of-run / loss results screen, an unobtrusive prompt — "Help improve the game: what would you change?" with category chips (Too hard / Confusing lesson / Bug / Idea / Other) + optional short text. Plus a tiny "💡 Suggest" link in the title-screen footer (next to What's New). On submit → `submitFeedback(obj)` which stores to `localStorage` AND posts to a `FEEDBACK_ENDPOINT` IF defined (guarded no-op until wired). Confirmation toast. Keep it skippable and out of the way — must not clutter.
- **Telemetry (anonymous, no PII):** accumulate a per-run telemetry object — month reached at end/quit, final composite/score, action counts by id, which lessons/info popups were opened, milestones hit, win/lose. Flush via `flushTelemetry()` → `localStorage` + a `TELEMETRY_ENDPOINT` no-op hook. No names, no personal data.
- **Verify** no console errors and that nothing clutters the normal flow. Leave the Supabase wiring + the nightly suggestion-triage for after the owner sets up the backend.

---

## NEEDS OWNER INPUT (do NOT auto-build)

- **Balance-tuning pass** — APPROVED in concept, but picking the actual numbers (velocity 12% edge, RE 3%/yr appreciation, captive premium, §179 capacity, MCA factor, arc severities) is a DESIGN decision per `verify-design-decisions-first`. Flow: the nightly QA report proposes specific tuning numbers from playtest data → owner approves → THEN it's promoted here with the exact numbers to apply. (Don't let the routine pick balance numbers on its own.)
- **Feedback/telemetry backend** — provision Supabase tables (`suggestions`, `telemetry`) + wire the `FEEDBACK_ENDPOINT`/`TELEMETRY_ENDPOINT` hooks. Needs owner credentials; do WITH the owner, then enable the nightly suggestion-triage (cluster + rank submissions through the DESIGN.md lens).

---

## IDEAS — need owner sign-off before building

_(empty — all current ideas have been promoted above)_

---

## DONE (awaiting owner review)

_(nightly moves built items here after committing)_
