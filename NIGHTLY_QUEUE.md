# Nightly Build Queue — Entrepreneur Paradise beta

The nightly routine (`ep-finance-overhaul-nightly`) builds ONLY items under
"## APPROVED — build". Move an idea up to APPROVED — **with a clear spec** — once you've
signed off on the design. Anything under "## IDEAS" is NOT built automatically; it needs
your sign-off first. The routine builds at most one approved item per run, commits it to
`main` (beta/ only, no push, no version bump), and moves it to DONE for your review.

It also leaves a nightly QA/balance/accuracy report at
`.claude/scheduled-tasks/ep-finance-overhaul-nightly/last-report.md` every run.

---

## APPROVED — build (topmost first; one per run)

_(none yet — add fully-specced, signed-off items here)_

---

## IDEAS — need owner sign-off before building

- **Retirement plan** — Solo 401(k)/SEP → cash-balance/defined-benefit (Protect & Optimize Taxes): big pre-tax deduction + wealth, Roth option = tax-free growth.
- **Hire your kids/family** on payroll — income shifting, deduct wages, fund their Roth.
- **Augusta Rule** — rent your home to your business up to 14 days/yr, tax-free.
- **Wealth-stage trusts** — dynasty / asset-protection (irrevocable) trusts that actually shield assets + pass wealth tax-free.
- **Deepen `elect_s_corp`** — teach the reasonable-salary-vs-distribution self-employment-tax lesson interactively.
- **Balance tuning pass** — velocity 12% edge, RE 3%/yr appreciation, captive premium (6% rev, ×1.004/mo), Section 179 capacity (cost×0.5), MCA 1.4 factor, character-arc severities.

---

## DONE (awaiting owner review)

_(nightly moves built items here after committing)_
