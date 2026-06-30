// Entrepreneur Paradise — game code
let CONFIG={};
async function loadConfig(){const files=['starting_positions','actions_marketing','actions_operations','actions_finance','lifestyle_options','events','stage_thresholds','scoring_weights','archetypes','characters','narrative_beats'];let ue=false;for(const f of files){if(!ue){try{const _cv=(typeof PATCH_NOTES!=='undefined'&&PATCH_NOTES[0])?PATCH_NOTES[0].v:'';const r=await fetch('config/'+f+'.json'+(_cv?'?v='+_cv:''));if(!r.ok)throw 0;CONFIG[f]=await r.json();continue;}catch(e){ue=true;}}if(ue&&window.EMBEDDED_CONFIG&&window.EMBEDDED_CONFIG[f])CONFIG[f]=window.EMBEDDED_CONFIG[f];}}
const CATS=['marketing','operations','finance'],CL={marketing:'Marketing',operations:'Operations',finance:'Finance',lifestyle:'Life'};
const MK=['monthly_revenue','cash','operating_expenses','total_debt','owner_pay','cogs','real_estate_equity','life_insurance_cv','investment_positions','available_credit','personal_guarantee_exposure','living_expenses','lifestyle_expenses','tax_reserve'];
const IK=['total_debt','operating_expenses','audit_risk','litigation_exposure','key_person_dependency','cogs','partner_conflict_risk','living_expenses','lifestyle_expenses','personal_guarantee_exposure','churn_rate'];
const BOOST_IDS=['customer_acquisition_sprint','build_content_presence','manage_debt','get_borrowing_power','build_delivery_foundation','scale_delivery','hire_specialists'];
// Action directions — group the menu by theme so every takeable option stays visible (pick a direction, see its A/B/C)
const ADIR={finance:[['Build Your Foundation',['establish_business','build_dnb_profile','build_personal_credit','banking_relationship']],['Debt & Credit',['pay_down_debt','debt_restructure','bank_personal_loan','business_credit_line','sba_loan','equipment_financing','velocity_banking','merchant_cash_advance']],['Protect & Optimize Taxes',['elect_s_corp','wyoming_holding_llc','living_trust','combined_insurance','monthly_tax_reserve']],['Build Wealth & Passive Income',['fund_accumulation_policy','activate_passive_income','policy_loan','buy_real_estate']]],marketing:[['Your Team',['hire_sales_manager']],['Get Leads',['cold_outreach','basic_social_content','paid_ads_test','influencer_megadeal']],['Build Trust',['build_offer','content_engine','referral_asks']],['Close the Sale',['do_sales_yourself','crm_pipeline']]],operations:[['Your Team',['hire_ops_manager']],['Deliver the Work',['study_business_content','do_work_yourself','hire_first_contractor','rapid_offshore_scaleup']],['Build Systems',['write_first_sop','fulfillment_system','project_management']],['Keep Customers Happy',['basic_quality_control','client_onboarding']]]};
// Disguised "trap" actions — appealing on the surface, always a setback. They sit in real ADIR groups to blend in, but must NOT count toward capability milestones (e.g. building a funnel).
const TRAPS=['rapid_offshore_scaleup','influencer_megadeal'];
// Display metadata for the trap "achievements" — revealed only after a player has taken & lived through that trap (kept secret beforehand so finding them stays part of the game).
const TRAP_META={rapid_offshore_scaleup:{i:'🌏',n:'Offshore Over-Hire'},influencer_megadeal:{i:'📣',n:'Influencer Megadeal'}};
// Supabase backend (publishable key is public-safe; data is protected by Row Level Security). Used for the global leaderboard + future async-multiplayer.
const SUPA_URL='https://widdgynledwpqaqndtvz.supabase.co';
const SUPA_KEY='sb_publishable_YTOYoDxjm7MpIuvvSjwOyQ_ToGCW3PQ';
const GOOGLE_G='<svg width="16" height="16" viewBox="0 0 48 48" style="vertical-align:middle;flex-shrink:0;"><path fill="#FFC107" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.3 5.3C41.4 36.6 44 30.9 44 24c0-1.3-.1-2.3-.4-3.5z"/></svg>';
// Credit-approval actions — success is underwritten by personal utilization + myFICO 3B (see _creditApprovalChance), not the flat success_rate.
const CREDIT_APPROVAL=['bank_personal_loan','business_credit_line','debt_restructure','sba_loan'];
const LOAN_APPROVAL=['bank_personal_loan','sba_loan'];/* term loans underwritten on DTI; the rest of CREDIT_APPROVAL is revolving credit underwritten on utilization. debt_restructure qualifies you for BOTH a line and a loan, so it's underwritten on the worse of the two (see resolveMonth). */
// Advisory/setup services the Epic concierge performs in-house, so the member pays NO fee (just the membership). These are professional fees — NOT capital deployment (funding a policy, tax reserve, buying assets, insurance premiums are never "waived"). Savings shown via _epicServiceFee.
const EPIC_WAIVED=['wyoming_holding_llc','build_personal_credit','debt_restructure'];
// Milestones / achievements — grouped by category. check(state, game)=>bool. Surfaced on the results screen and called out by the mentor.
const MILESTONES=[
{id:'mk_first_customer',cat:'marketing',title:'First Paying Customer',desc:'Landed your very first customer.',mentor:'Your first paying customer — proof someone will pay for what you do. Everything real starts here.',check:s=>(s.customer_base||0)>=1},
{id:'mk_funnel',cat:'marketing',title:'Funnel Built',desc:'An offer, a lead source, and a way to close — a complete funnel.',mentor:'You’ve got a real funnel now: an offer, traffic, and a way to close. That’s a machine you can pour fuel into.',check:s=>{const done=id=>(s._completed_actions||[]).includes(id),grp=n=>((ADIR.marketing.find(x=>x[0]===n)||[null,[]])[1]).filter(id=>!TRAPS.includes(id));return done('build_offer')&&grp('Lead Generation').some(done)&&grp('Sales & Conversion').some(done);}},
{id:'mk_brand',cat:'marketing',title:'Brand Recognized',desc:'Brand equity passed 50.',mentor:'People know your name before you pitch. Brand is the cheapest salesperson you’ll ever have.',check:s=>(s.brand_equity||0)>=50},
{id:'mk_demand',cat:'marketing',title:'Demand Engine',desc:'Revenue crossed $50k/mo.',mentor:'$50k a month in demand. The top of your funnel is officially humming.',check:s=>(s.monthly_revenue||0)>=50000},
{id:'mk_referral',cat:'marketing',title:'Referral Engine',desc:'Built a referral & affiliate partner network.',mentor:'Other people’s audiences now feed your funnel on commission — near-zero-cost leads that compound. The cheapest growth there is.',check:s=>(s._completed_actions||[]).includes('referral_partnerships')},
{id:'op_first_hire',cat:'operations',title:'Hired Your First Person',desc:'Grew the team to one.',mentor:'Your first hire. You just stopped being the only pair of hands — that’s how a job becomes a business.',check:s=>(s.team_size||0)>=1},
{id:'op_systems',cat:'operations',title:'Systemized',desc:'Systems maturity passed 50.',mentor:'Documented systems mean the work doesn’t live in your head anymore. That’s real leverage.',check:s=>(s.systems_maturity||0)>=50},
{id:'op_team',cat:'operations',title:'Built a Team',desc:'Grew to a team of five.',mentor:'Five people rowing with you. Your job now is to steer, not to row.',check:s=>(s.team_size||0)>=5},
{id:'op_free',cat:'operations',title:'Runs Without You',desc:'Key-person dependency dropped below 20.',mentor:'The business barely needs you now. That’s when it stops being a job and becomes an asset you could sell.',check:s=>(s.key_person_dependency==null?100:s.key_person_dependency)<=20},
{id:'op_culture',cat:'operations',title:'Strong Culture',desc:'Company culture passed 70.',mentor:'People who feel valued and share in the upside don’t create drama — they cover for each other. Culture is the cheapest insurance against the people problems that sink founders.',check:s=>(s.company_culture||0)>=70},
{id:'fi_legit',cat:'finance',title:'Made It Legal',desc:'Formed an LLC and opened a business bank account.',mentor:'An LLC shields everything you own from the business, and a real business account ends commingling. You’re a legitimate entity now.',check:(s,g)=>g.isSeparated()},
{id:'fi_banked',cat:'finance',title:'Business Banking',desc:'Opened your first credit in the company’s name.',mentor:'Credit in the business’s name, not yours — the first step to scaling on the company’s own balance sheet instead of your household.',check:s=>(s.business_credit_limit||0)>0||['building','established'].includes(s.business_credit_profile)},
{id:'fi_credit',cat:'finance',title:'Creditworthy',desc:'Personal credit score hit 700.',mentor:'700 credit. You just unlocked cheaper money than most business owners can ever get.',check:s=>(s.personal_credit_score||0)>=700},
{id:'fi_dnb',cat:'finance',title:'Business Credit Built',desc:'Established a D&B business-credit profile.',mentor:'Your business now borrows on its OWN name — a DUNS profile, reporting tradelines, an established rating. That’s how you scale on the company’s balance sheet instead of your household.',check:s=>s.business_credit_profile==='established'||(!!s._dnb_profile&&(s.business_credit_limit||0)>0)},
{id:'fi_funding_ready',cat:'finance',title:'Funding Ready',desc:'Debt restructured and a clean credit file — no collections, negatives disputed off. The lender-ready profile.',mentor:'This is what a lender wants to see: debt restructured, utilization healthy, and a clean report with no collections. You’re fundable now — capital is there when you want to deploy it.',check:(s,g)=>g.isSeparated()&&(s._completed_actions||[]).includes('debt_restructure')&&!(((s.debt_breakdown||{}).collections||0)>0)},
{id:'fi_tax',cat:'finance',title:'Tax-Smart Structure',desc:'Elected S-Corp (or beyond).',mentor:'S-Corp — you legally stopped overpaying the IRS. That’s money that now compounds for you.',check:s=>['s_corp','c_corp','multi_entity'].includes(s.entity_structure)},
{id:'fi_engine',cat:'finance',title:'Money Engine Built',desc:'Built $5k+ of policy cash value.',mentor:'Your cash-value policy is funded — the tax-free engine the wealthy quietly run their whole lives on.',check:s=>(s.insurance_cash_value||0)>=5000},
{id:'fi_passive',cat:'finance',title:'Tax-Free Passive Income',desc:'Switched on passive, tax-free income.',mentor:'The crown jewel: money arriving every month without you working, and tax-free. This is what the whole game was pointing at.',check:s=>!!s._passive_income_active}
];
const MILES_BY_ID={};MILESTONES.forEach(m=>MILES_BY_ID[m.id]=m);
// Patch notes — newest first. Add a new entry on every release; the title screen version + What's New derive from this.
const PATCH_NOTES=[
{v:'0.44.0',d:'2026-06-29 23:55',n:[
'New Epic Life perk — Velocity Banking (Finance → Debt & Credit, members only). Run your household through a line of credit and sweep your surplus straight at your debt, paying it down years faster. You choose the vehicle: a HELOC against your property (attacks the mortgage and builds equity quicker) or a credit line (attacks revolving debt).',
'You\'re in the driver\'s seat: pick how aggressively to sweep (Conservative 50% / Balanced 75% / Aggressive 100% of each month\'s surplus), then use the ⚡ Velocity chip on your dashboard to chunk extra cash, retune, switch vehicle, or pause — any month, no turn needed. A live readout shows interest saved, equity built, and your payoff date with vs. without velocity.',
'Real estate now behaves like the real thing: your mortgage actually amortizes each month and that paid-down principal becomes equity (tenants paying down your loan), and the property appreciates ~3%/yr — so buying, holding, and accelerating the loan all build real wealth over time.',
'The discipline still bites: velocity banking only accelerates while you\'re cash-flow positive — go negative and the deficit rides the line, and in a credit crunch an over-used line can get frozen. Keep it lightly used and it\'s pure upside.',
'Mobile fix: the bottom "Next / End Turn" bar no longer covers the last items in your action list — you can now scroll all the way down to your Life actions and the "Show completed" toggle. Added safe-area spacing so the buttons clear the phone\'s home indicator too.',
'Four new finance plays so the money menu stays meaningful through the mid-game: an SBA Loan (the cheapest real growth capital — big, low-rate, long-term, but underwritten hard on your debt-to-income); Finance Equipment with Section 179 (good debt that lifts capacity AND writes off the whole cost this year); a Living Trust (skip probate, start your asset-protection plan); and — as a cautionary lesson — the Merchant Cash Advance trap (instant cash, no credit check, but a 1.4 factor rate ≈ 60%+ APR that shows you exactly why good credit matters).',
]},
{v:'0.43.6',d:'2026-06-29 23:40',n:[
'Real estate reworked to be realistic: its real benefit is now the depreciation tax shield (it actually lowers your taxable income), the rent just about covers the mortgage, and the economy sets your entry price — buy in a downturn and you start with more equity. No more fantasy 30%/yr rent yields.',
'Business dashboard funnel readout: Leads → Customers → Brand Equity (brand is the lever that lifts both conversion and revenue per customer). Staff & Culture show only once you\'ve hired.',
'Tutorial polish: the "burn" number now matches the dashboard (includes debt service), the walkthrough scrolls you back to the top of the results when it ends, and the short-runway warning no longer suggests cutting payroll you don\'t have.',
'Energy & Life are now explained in one short, combined tip instead of three overlapping popups.',
'Epic Life roadmap rebuilt: Funding Ready (clean credit + lower utilization) → Protection (insurance, holding company, banking relationship = multiple lending sources for downturns) → Build Wealth (cash-value policy, passive income, income property) → Freedom. The concierge runs it in that order and no longer spams a debt restructure you wouldn\'t be approved for.',
'Your cash-value policy now doubles as your tax reserve: at tax time you can borrow against it (tax-free) to pay the IRS — no cash out, no credit hit, and your cash value keeps compounding behind the loan. The infinite-banking move. No policy yet? Pay from your tax reserve as before.',
'Your tax reserve now earns ~4%/yr (a money-market account) — and when you open a cash-value policy you\'re offered the chance to fold the reserve in, where it grows faster and tax-free while still covering your taxes.',
'"Major company reaches out" opportunity rebalanced — no more surprise upfront cash hit and a wall of red; taking the contract now clearly grows your customers, brand value and revenue capacity, with honest, modest costs.',
]},
{v:'0.43.5',d:'2026-06-29 23:10',n:[
'Debt restructure is now underwritten like the credit it qualifies you for — if your utilization or DTI is too high (the same reason a credit line or loan would be declined), it can be declined too. A declined restructure costs no fee, and the card warns you up front when approval is unlikely.',
'Result screen now shows your Runway swing (▲/▼ months) month-over-month, next to the runway number.',
'Clearer action menus across the board: Marketing reads as a funnel (Get Leads → Build Trust → Close the Sale), Operations as Deliver the Work → Build Systems → Keep Customers Happy, and Finance as Foundation → Debt & Credit → Protect & Optimize Taxes → Build Wealth. Many action names simplified to plain language.',
'Reworked first-month tutorial: clearer dashboard tour, a dedicated step teaching the Leads → Customers → Revenue funnel and Marketing\'s three jobs, updated to the new action names, and a stronger business-unlock walkthrough.',
]},
{v:'0.43.4',d:'2026-06-29 22:40',n:[
'Fixed the category icons being squashed by the new economy banner — the banner now sits in its own row right above the Step 1/3 line and the icons, and the duplicate market message on the result screen is gone.',
'Dashboard trim: Personal Passive income now sits below Debt; Business side drops Owner Equity and shows Net Worth below Debt (no month-over-month swing).',
'Tap your Personal Cash for a breakdown — now includes your owner draws to date (total you\'ve paid yourself out of the business).',
'Economy banner auto-collapses to a slim chip after a couple of months, re-expanding on a phase change (or tap it anytime) — less clutter, still readable.',
'Dashboard expenses now include debt service (interest + principal) — on the Personal side before you form an LLC, on the Business side after — so your cash flow reads true.',
'Result screen: the Total-expenses breakdown is now a clean money-out list (revenue is shown separately above, no longer mixed into the expense total).',
'Interest rates are now real: your variable business lines & loans float with the Fed/market rate (shown in the Debt breakdown). Booms, downturns and Fed-hike events genuinely raise your monthly debt service; recovery eases it. The "Fed raised rates" event now has teeth — "absorb it" steps your rate up for good, while paying down or refinancing blunts it.',
]},
{v:'0.43.3',d:'2026-06-29 22:10',n:[
'Result P&L fix: your owner pay is no longer double-counted as an expense — it\'s a draw that funds your living expenses (which are already counted). Total expenses, net, and runway now reflect the real cash swing.',
'Economy at a glance: the current market phase (Expansion / Boom / Downturn / Recovery) now shows as a persistent signal right above the category icons.',
'Cleaner cards: credit/loan actions no longer show a success %, just a plain "approval not guaranteed" warning when your odds are low. Passive income no longer labels itself "tax-free" on the dashboard.',
'Naming your company now happens in month 2, right after the business panel unlocks and its walkthrough finishes — a calmer moment than mid-first-turn.',
'Dashboard tidy: Net Worth now sits on the Business side and Passive income on the Personal side, each right above its Debt row.',
]},
{v:'0.43.2',d:'2026-06-29 21:30',n:[
'Leaner action menus — Marketing & Operations trimmed to 10 focused moves each, Finance to the core wealth path. Less clutter, clearer flow: learn the business → delegate to a manager → focus on Finance.',
'Result Cash & Credit panel reordered as a mini P&L (revenue & expenses up top, then accessible capital, then balance sheet).',
'Debt restructure now shows the working-capital loan in the cash & debt swing.',
]},
{v:'0.43.1',d:'2026-06-29 19:00',n:[
'Manager model: hire a Sales Manager (Marketing) and Ops Manager (Operations) instead of a C-suite. Finance is always yours.',
'Team mode activates when both managers hired — they handle their categories automatically.',
'Dashboard: Income/Revenue rows highlighted green, Expense rows red, Cash flow bold below.',
]},
{v:'0.43.0',d:'2026-06-30 19:00',n:[
'BIG update — Finance & Economy overhaul (testing build). Your small business now caps lean (~$80–200k/mo, set by your SYSTEMS, not headcount) — real wealth comes from FINANCE leveraging the cash & credit it throws off.',
'A live economy: an Expansion → Boom → Downturn → Recovery cycle plays out across your 36 months. The prepared get rich in the bust; the over-leveraged get squeezed.',
'New play — Velocity Banking: run your household through a line of credit and sweep surplus cash flow at your debt. Powerful while cash-flow positive; it bites if you go negative or lean on the line in a downturn.',
'New keystone — Buy the Dip: in the downturn, deploy tax-free policy cash and reserves into distressed assets at a deep discount.',
'Real-estate leverage now has teeth: over-leverage (high LTV, thin reserves) can trigger a margin call / forced sale in the crash, while conservative leverage rides through.',
'Loans vs. credit now underwrite separately — term loans on your debt-to-income, revolving credit on your utilization (no more one dragging the other down).',
'Leaner, more focused action menus so each decision matters more (extra options temporarily set aside for this test build).',
'Scoring rewards finance MASTERY — net worth, passive income and leverage efficiency now climb on a curve that separates dabblers from pros.',
]},
{v:'0.42.2',d:'2026-06-30 18:00',n:[
'Fixed utilization reading ~96% “but healthy” the moment you bought real estate — your mortgage was wrongly counted as credit-card utilization. Now your score climbs as it should.',
'Fixed the menu asking you to “hire a fractional CRO” when you already have one (a failed hire roll left the role unmarked). Self-heals existing games.',
'Luxury life actions (jets, estates, art, foundations) are no longer locked when you have the personal cash for them — they’re paid from personal cash, not business cash.',
'Your C-suite now builds out prerequisites and stops spamming the same move every month (no more Debt Restructure every single turn).',
'Full C-suite: one clear “▶ Run the Month” button at the bottom — no more mid-screen button.',
'Attorney/lawsuit and other repeat events are throttled in the late game — no more back-to-back spam.',
'Continuing from a year checkpoint now resumes the NEXT month instead of replaying the year-end month and re-taxing you.',
'“Saved by personal savings” no longer pops up every month — it warns once, then escalates.',
'Tap your personal Expense/mo for a full breakdown.',
'Leaderboard: tap a run to see its win-title, radar hexagon, and full score breakdown.',
'Checkpoint now auto-saves (company name + date) — just choose whether to post to the leaderboard.',
'Established Founder now starts “2 years in” — LLC and the basics already done, so you play from a high level.',
]},
{v:'0.42.1',d:'2026-06-30 17:00',n:[
'Fixed a death spiral where delegating/auto-played moves could overspend across categories and bankrupt you in a single month — your team now keeps a runway buffer.',
'Epic Life concierge now runs Debt Restructure when you’re cash-strapped and maxed out — it was being blocked exactly when you needed the rescue (it’s free for members and frees up your utilization).',
'Owner pay rebalanced: when the business is tight you draw only what you need to live, so it stops draining the company to $0 — when it’s healthy you still pay yourself a full wage.',
'Tap your personal Expense/mo on the dashboard for a full breakdown (living + lifestyle + recurring costs).',
'“Saved by your personal savings” no longer pops up every single month — it shows once, then escalates every few months if the spiral continues.',
]},
{v:'0.42.0',d:'2026-06-30 16:30',n:[
'Leaderboard revamp: 🌐 Global / 📱 This Device (Global first), runs grouped by founder with a 12mo/24mo/36mo tag in one list, and tap any run for its score with collapsible choice history + achievements.',
'You can now post a 12 or 24-month run to the leaderboard right from the year checkpoint — and there’s a Main Menu button there too.',
'Funding realism: a banking relationship gets you bigger credit lines and easier approvals; forming a Wyoming holding LLC assigns the correct NAICS code so you qualify more easily (wrong/missing structure can get you declined).',
'Your COO now invests in company culture when it slips (benefits / equity grants), with a low-culture warning.',
'When a team member leaves, their exact cost is removed and the role re-opens with a ↻ Rehire tag.',
'Clearer money moves: forming an LLC shows the business-credit boost, private equity says it commits ~half your cash, and policy-loan deals show the real amount you can borrow.',
'Full C-suite “Run the Month” now still prompts you to pick your Life action.',
'Energy rebalanced so it stays a real constraint, and the business expense breakdown no longer shows line items that add up past the total.'
]},
{v:'0.41.0',d:'2026-06-30 15:21',n:[
'🌐 Global leaderboard is live — switch the leaderboard to Global to see top founders across all players. Browsing is open to everyone.',
'Sign in with Google to post your runs to the global board (solo play still needs no login).',
'Your company name, score, and badges now show on the global board.'
]},
{v:'0.40.0',d:'2026-06-30 14:33',n:[
'Refreshed menus — a consistent look across screens, with the Back button in the same place everywhere.',
'Founder select redone: New / Established / Stuck Founder, each showing your starting cash, revenue, credit, and debt at a glance.',
'Leaderboard redesign — a Global / This-Device toggle (global coming soon), 🥇🥈🥉 medals, your own run highlighted, and company names.',
'Name your company when you form your LLC — it shows on your dashboard and the leaderboard.',
'New achievements: 🪤 Trap Survivor (find and survive every trap in one run) and 🕵️ Scam-Survived tiers (3 / 6 / 9 scams dodged across all your runs).',
'🎟 Redeem Code: enter a code from the main menu to unlock content.',
'Continue now asks you to confirm before resuming your saved game.'
]},
{v:'0.39.0',d:'2026-06-30 06:30',n:[
'New main menu — a clean title screen: New Game → choose your founder, plus New Game+, Continue, Load Game, Leaderboard, and What’s New, with a live update indicator.',
'Credit & loans behave much more like real life now: your interest rate scales with your credit score (good credit = cheaper money), credit-card balances carry a punishing ~18–26% APR, lenders weigh your income / ability-to-repay on approval, and hard inquiries fade over time so only recent credit-shopping keeps hurting you.'
]},
{v:'0.38.1',d:'2026-06-30 05:30',n:[
'Derogatory marks now behave like real life: the first one dings your score the most, then each additional mark hurts less and the damage caps — your score won’t bottom out just from a few negatives.',
'But negatives are now an approval killer where it counts: even one hurts your odds, and several (collections, charge-offs) nearly shut you out of new credit — exactly like a real lender. Clearing them (credit repair / Epic Life) is the way back in.'
]},
{v:'0.38.0',d:'2026-06-30 05:00',n:[
'New Game+ credit is realistic now: you don’t pick a score — you set your utilization, derogatory marks, credit history, and hard inquiries (like reading your own 3B report), and your myFICO is computed live from them.',
'New mechanic — hard inquiries: every credit application is a hard pull, and stacking up 5 or more meaningfully drags your approval odds (and dips your score). Customize your starting inquiries in New Game+ (none / under 5 / 5+).',
'Epic Life exclusive: your concierge disputes hard inquiries off your report every 6 months — saving you ~$1,000 each time and keeping your approval odds high.'
]},
{v:'0.37.0',d:'2026-06-30 04:00',n:[
'New Game+! Play a full year as the New Business Owner and you unlock a sandbox mode where you customize your starting hand — cash, credit score, available credit, starting debt, living expenses, energy, your business size, and entity type.',
'New Game+ head-start perks: start with Epic Life membership, a fractional CFO, established business credit, a funded cash-value policy, and/or a banking relationship already in place.',
'New Game+ skips the tutorial and is a free sandbox — experiment freely; these runs aren’t ranked on the leaderboard. Finishing your first year now also tells you it’s unlocked, right at the year checkpoint.',
'The game now checks for new versions on the title screen — when a newer build is live, you’ll get a “🔄 Update now” bar so you’re never stuck on an old version.'
]},
{v:'0.36.1',d:'2026-06-30 03:00',n:[
'Saved games now remember their version. If your save is from an older build, the title screen shows an “⬆ Update Save” button — it previews everything that’s changed since your save, then updates the file in place so the latest mechanics and balance apply, with your progress kept.',
'Resuming any older save now brings it up to date automatically.'
]},
{v:'0.36.0',d:'2026-06-30 02:00',n:[
'Epic Life membership now covers the professional fees for the services your concierge runs in-house — your holding-company setup, credit optimization, and debt restructuring cost you nothing, and your monthly results show how much you saved.',
'Debt restructuring is priced like real life now — a lending expert’s ~10% success fee on the credit/loan you qualify for, capped at $2,000 (free for Epic members).',
'Your concierge now sets up the holding company first, then builds your banking relationship on the new LLC.',
'A dedicated salesperson now closes deals into paying customers each month, not just leads — and installing a CRM converts a few forgotten leads into customers too.',
'Operations pays an energy dividend: the more you systemize, the less energy your hands-on moves cost (up to ~40% at full systems maturity). Spend energy building systems now to spend far less later.'
]},
{v:'0.35.0',d:'2026-06-30 00:30',n:[
'Your Epic Life roadmap now tracks two separate goals — Funding Ready first, then the Epic Life System — showing one bar at a time as you complete each.',
'Credit approvals are realistic now: applying for a credit line or term loan can be declined when your personal credit utilization is high (above ~30%), and lenders pull your personal myFICO 3B even for business credit. Each application shows your approximate approval odds up front.'
]},
{v:'0.34.0',d:'2026-06-29 23:30',n:[
'Your personal credit score now tracks the real myFICO model more closely — credit utilization drives about 30% of it, alongside payment history, credit age, mix, and new credit.',
'Achievements now give a small energy boost when you unlock them — a bit of momentum for hitting a milestone.',
'Cleaner results screen: when several achievements unlock in the same month they collapse into one banner instead of stacking into a wall.'
]},
{v:'0.33.0',d:'2026-06-29 22:30',n:[
'Epic Life members get a “Your Concierge This Month” card atop the results — what your concierge did this month, your roadmap progress swing, anything newly completed, and your next milestone. The concierge roadmap also shows on your Finance menu now.',
'Not a member yet? You can now see a locked preview of the Epic Life roadmap on the results screen, so you know what the concierge would build for you.',
'New end-game leverage loop: buy income properties, then insure the people running them. If an operator is lost, a key-man / loan-protection policy retires that property’s specific mortgage — a real backstop, not a windfall. Coverage and claims are tracked in a new “Leverage Engine” panel.'
]},
{v:'0.32.0',d:'2026-06-29 21:30',n:[
'Epic Life Membership now shows your Concierge Roadmap — progress bars for the wealth playbook your team is building, revealed one stage at a time.',
'Stage 1 “Funding Ready” (credit → debt → holding company → banking) unlocks Stage 2 “Epic Life System” — Protection, Expense, then Reserve layers.',
'New action: form a Wyoming Holding LLC (registered agent, operating agreement) — a wealth-management layer that shields assets from operating liabilities and improves your access to bank credit.',
'New payoff readouts: a Debt-coverage gauge (is your income covering your debt as you leverage?) and a Freedom bar that fills as passive income covers your lifestyle — hit 100% for Paradise.'
]},
{v:'0.31.0',d:'2026-06-29 21:00',n:[
'Fixed a bug that could end your run as “insolvent” while you still had personal cash — the business can now draw on your personal savings to cover a shortfall before it’s game over.',
'Fixed available credit showing a small negative number after a maxed-out draw; credit now stops cleanly at your limit.',
'New: you automatically build a personal emergency fund in profitable months (pay yourself first) — a real cushion for a bad month.',
'New: an earlier “short runway” warning so you can course-correct before you hit the wall.'
]},
{v:'0.30.1',d:'2026-06-29 19:30',n:[
'Clearer costs everywhere: actions now show their upfront price and any ongoing monthly cost with consistent tags — on the card and on the results screen.',
'Cleaner end-of-month Cash & Credit panel: credit, cash and debt grouped in the middle; business revenue and your total expenses (cash-advance repayments included) grouped at the bottom.',
'Financing options behave more like real life — some are repaid as a cut of your revenue until cleared, then fall off, rather than touching your credit.',
'Copy and balance tuning across recently added decisions.'
]},
{v:'0.30.0',d:'2026-06-29 18:30',n:[
'New Operations move — "Restructure & Downsize": cut an oversized team and trim monthly payroll fast when hiring gets ahead of your revenue. It costs severance and dents morale, but it can save a bleeding business.',
'More high-stakes hiring and growth decisions to weigh across every stage — some shortcuts look great on the surface and bite back hard. Read the fine print before you commit.',
'When payroll starts dragging you under, the game now flags the fix loudly (a red tag, a top-of-list nudge, and a heads-up) so you don\'t miss your way out.'
]},
{v:'0.29.0',d:'2026-06-29 17:00',n:[
'New actions across Marketing, Operations, and Finance at every stage — more decisions to weigh each run. Read the fine print: a tempting shortcut isn\'t always the smart move.',
'Your tax reserve is now a lifeline: if you\'d otherwise run out of cash and credit, a big enough reserve can pull you back from bankruptcy — a real reward for setting money aside. (The IRS bill still comes.)',
'Clearer game-over screen: your Accessible Capital is highlighted in red when it goes negative, with a single, focused explanation of why the run ended.',
'Predatory financing now behaves realistically — high-cost advances strangle your cash flow for a while, then fall off once they\'re paid off.',
'The "pay down debt" option no longer says "already healthy" when you simply have no spare cash — it now tells you straight.'
]},
{v:'0.28.0',d:'2026-06-29 15:30',n:[
'Your final score is now built on six clear pillars: Passive Income, Leverage, Protection, Freedom, Lifestyle, and Net Worth. Tap any pillar on the results screen to see what it means.',
'New "Protection" and "Freedom" pillars reward shielding your wealth (entity, trust, insurance, reserves) and building a business that runs without you — not just raw revenue.',
'Going broke is no longer a slog: insolvency now ends the run right after the Cash & Credit card — no more event or tax bill popping up after you\'ve already lost.',
'Clearer game-over screen: a bankruptcy graphic, your cash and credit shown in red, and a short walkthrough of why the run ended and the 0-month runway.',
'Tighter final month — no random event in month 36, and the year-end recap no longer shows before your final score (one less screen).',
'Your very first event now walks you through the situation and your choices step by step.'
]},
{v:'0.27.1',d:'2026-06-29 14:00',n:[
'Tutorial no longer disappears if you refresh during your first month — it resumes where it left off, and the step text is tighter and to the point.',
'Events now respect your progress: none in month 1, and they only happen once your business is real — no "an employee quit" when you have no staff, no "recession" before you have revenue. Your first event is introduced with a quick pop-up explaining how events work.',
'When the game ends in insolvency, a pop-up now explains exactly why — what blew up and how to avoid it next time (margin of safety: reserves, credit lines, insurance, watch your runway).'
]},
{v:'0.27.0',d:'2026-06-29 11:00',n:[
'Your progress is now saved automatically — refresh or close the tab and pick up right where you left off from the title screen (with a warning if you try to leave mid-month).',
'Energy rebalanced to be realistic: doing the work yourself costs more energy, paying people to do it costs less. So delegating (hiring, outsourcing, specialists) buys back your energy — and you’re no longer forced into a Life check-in every few months just to keep going.',
'Real estate now works properly: its passive income shows correctly in your income and cash flow, and it comes with a depreciation write-off that shelters your taxable income — the signature real-estate tax break.',
'Going broke now plays out: instead of cutting straight to Game Over, you see the results screen (Cash & Credit shows you went over) and the event story explains how it blew up — then the run ends.',
'Net Worth stays on your dashboard even if it dips negative (shown in red), and the Debt breakdown now lists every debt you carry — including real estate, policy loans, and your private-bank line.',
'Hiring an Executive Assistant or General Counsel now adds to your staff count, and the Monthly Burn breakdown itemizes payroll (each salary + executive pay) so you can see exactly where the money goes. The result screen also shows your business revenue and its month-over-month swing.',
'Scam-event choices no longer telegraph the trap, and going all-in on one really hurts (lost cash, new debt, a credit hit) — a fractional CFO or family office sees through it and shields you.',
'Polish: low energy now clearly means moves “fail more & deliver less” (worse in burnout); Build Personal Credit can prompt an automatic credit-limit increase; owner-pay no longer shows as a misleading action “impact”; the Life check-in tip no longer appears twice; and tapping a stat clears its ⓘ everywhere, including on event screens.'
]},
{v:'0.26.0',d:'2026-06-28 21:30',n:[
'Tap any dashboard stat to learn it — popups are now split Personal vs Business with a short, plain-language explanation; stats you haven\'t opened pulse with an ⓘ badge, and each popup has a “Mark all as viewed” button. (Personal credit is shown as your MyFICO 3B score.)',
'Life check-in shows a balanced spread across all five areas, so basics like sleep, gym and meditation are always reachable; meditation is now free, and there are more low-cost ways to recharge (a hike, dessert, retail therapy, a spa day, cooking at home, a rec sports league).',
'Life actions are clearer: each is tagged 👤 Personal or 🏢 Business expense, several over-priced personal splurges were brought down to earth, and energy boosts were rebalanced so every life action genuinely restores energy. Building Personal Mastery now speeds your monthly energy recovery more noticeably.',
'Low energy now means moves are more likely to FAIL and deliver LESS (worse in burnout) — clearer than the old “weaker.” A picked Life action’s energy now counts toward your turn, so the burnout warning is accurate, and when you’re low the Life check-in opens off-schedule so you can always recover (financeable if cash is tight).',
'New scam events: a friend’s “guaranteed 10x” crypto and a coworker’s Ponzi “private fund.” Go all-in and it really hurts (lost cash, new debt, a credit hit); a fractional CFO or family office sees through it and shields you.',
'Key-person insurance fixed: it pays out when a key person is lost to illness, injury or death (not when they simply quit) — with a real lump-sum benefit to fund the transition.',
'Spending uses your business’s own cash first before adding any credit/debt; hiring a salesperson, contractor, and the whole C-suite now clearly show their ongoing monthly pay.',
'Turn button is consistent: “End Turn” once everything’s picked, otherwise it shows your progress and what you’d skip (e.g. “Skip 1 & End Turn (2/3)” / “Skip Turn (0/4)”). A partial result is no longer marked “done” and reads “Didn’t finish” (retry at half cost). Tutorial gets a working Back button.'
]},
{v:'0.25.0',d:'2026-06-28 20:00',n:[
'First-time tutorial refreshed to match the current game: the cash-flow step no longer references the old “months left” readout, the results walkthrough is tighter (one clear “tap the card to expand” step instead of two), and the end-of-month money panel step now describes what it actually shows (accessible capital, runway, and your credit-score/cash/credit/debt swings).',
'Tutorial guidance is consistent: the recommended first Operations move and its explanation now always match, and the Life check-in tip covers all five Personal Mastery areas plus how a Life action restores energy when you’re running low.'
]},
{v:'0.24.4',d:'2026-06-28 19:00',n:[
'Life actions reworked around energy: every life action now gives a real, balanced energy boost (shown as a green ⚡ tag on the bottom-right of each card), with good variety across all five Personal Mastery areas — big restorative trips/retreats give the most, smaller habits give a steady bump.',
'Burnout warning is accurate now: if you pick a Life action that restores energy, that energy counts toward your turn — so it won\'t falsely warn you about burning out when you\'re actually recharging.',
'You can always recover when you need to: when your energy runs low, the Life check-in opens even off its normal schedule, surfaces your strongest energy-restoring options first, and lets you finance a recovery on credit if cash is tight (yes, even the expensive ones).',
'Hiring is now an ongoing cost: hiring a Salesperson and a Vendor Contractor add a monthly salary like every other hire — no more free permanent staff from a one-time fee.'
]},
{v:'0.24.3',d:'2026-06-28 18:00',n:[
'Tap any dashboard stat to understand it: Credit, Debt, Income, Burn, Net Worth, Credit Score, Cash Flow, Owner Equity and Personal Mastery now each open with a plain-English one-liner explaining what it is and why it matters. Your business D&B score is now tappable too.',
'Owner Equity now opens its own clear explainer (your stake in the business — how it grows and shrinks) instead of the revenue screen.',
'Result screen color fix: a rising credit utilization now shows red (it\'s bad), and a falling stat like brand equity shows red too — colors finally match good vs. bad in every direction.',
'Cleaner dashboard: removed the per-column “months left” under Personal/Business cash flow, which showed two different numbers and was misleading (full runway still lives on the result screen and the cash-flow breakdown).'
]},
{v:'0.24.2',d:'2026-06-28 17:00',n:[
'No more coasting: your customers don\'t stick around for free. Leads go cold over time, so if you stop marketing — and stop supporting clients — your customer base and revenue slowly erode. Keep generating demand and invest in retention (client success, systems, strong brand) to hold your ground. The only income that truly arrives without work is passive, tax-free income — the endgame you\'re building toward.'
]},
{v:'0.24.1',d:'2026-06-28 16:00',n:[
'Result screen, cleaner Cash & Credit panel: icon rows on a single line showing your credit score, cash, available credit and debt — each with an up/down swing — plus accessible capital vs last month and this month\'s expenses with how they were paid (cash or credit).',
'Tap anywhere on a result card now expands its details & lesson (no more hunting for the small toggle).',
'"Check Cash & Credit" is merged into the bottom button: first tap jumps you to the panel, second tap starts the next month.',
'Established business start rebalanced — more cash and credit cushion and lower fixed costs, so it\'s no longer the easiest run to accidentally go broke on.',
'Early-game bad luck softened: random setbacks in your first 9 months hit ~30% lighter while you\'re still building reserves.',
'Burnout and other warnings now use the in-game popup style (no more jarring browser dialogs), and the low-energy warning sits on its own line so it no longer overflows on mobile.',
'Polish: the new-month button now reads "Next: Marketing →" first; the Net Worth tip only shows when Net Worth is actually on the dashboard; and a confusing "credit limit" line no longer appears when an action is financed on credit.'
]},
{v:'0.24.0',d:'2026-06-28 15:00',n:[
'Burnout is now a real choice: if your moves cost more energy than you have, you get a warning, can push through into the red (negative energy), and running on empty sharply raises your chance of getting sick that month. Low or negative energy no longer blocks actions — you can always grind, you just risk your health.',
'Illness risk scales with how run-down you are (low energy + neglected Body), and the Business Insurance Stack now pays real cash claims when it hits — so the trade-off between hustle and protection actually bites.',
'Dashboard has icons on every stat for quick scanning, and the result screen now uses those same icons on stat changes. Net Worth only shows once it’s actually positive, and both Net Worth and Owner Equity show their month-over-month swing on a tidy second line.',
'Action list: already-done moves sink below ones you haven’t tried; first-time tutorial now points out the “Details & lesson” expander on the result screen.',
'Tightened a bunch of copy — Build Personal Credit and Business Insurance Stack descriptions/lessons are shorter and clearer.',
]},
{v:'0.23.25',d:'2026-06-28 13:00',n:[
'Picking a move now keeps you on it so you can read what you chose — and the “Next: …” button gently pulses to invite you onward (it scrolls and highlights the next set of cards). When only your current category is left, it simply says “Take Action”.',
'Cleaner action cards: status tags (group name · NEW · RETRY · SELECTED) share one row, costs use icons (💵 / ⚡ / 🔁), and your selected move shows how much energy you’ve committed this turn vs what’s left.',
'Dashboard got icons — cash, credit, revenue, debt, net worth, energy, leads, customers, staff and more are now easy to scan at a glance instead of a wall of text.',
'Button labels tightened up across the board (Take Action, End Turn, Next Month →, Take Life Action, Run the Month).',
]},
{v:'0.23.24',d:'2026-06-28 11:00',n:[
'Action menu polish: your selected move now stays put instead of jumping to the top, the selected card shows your total energy committed this turn vs what you have left (turns red if you overcommit), and the “🔒 hire a CFO to forecast” clutter is gone. Descriptions are short enough now that the “Read more” collapse was removed.',
'The “Next: …” button now scrolls and highlights the action cards so your attention lands on the actual choices, not just the category icons.',
'Early-game balance: Operations is no longer empty in the first months — Quality Control and Document & Automate Systems are available from the start, and Do the Work Yourself opens once you have a pipeline. Marketing’s “Do the Sales Yourself” now needs at least one lead, and the tax reserve waits until you’ve formed your business. Month-to-month choices are far more even across Marketing / Operations / Finance.',
]},
{v:'0.23.23',d:'2026-06-27 23:30',n:[
'Every action card description is now short and to the point — one quick line on what the move is. The full explanation (narrative + lesson) still shows on the result screen after you play it.',
]},
{v:'0.23.22',d:'2026-06-27 22:30',n:[
'Action menu redesigned: no more collapsing groups — every available action shows together, each card tagged with its group name. Ordered so it’s easy to scan: your current pick first, then any half-cost retries, then NEW, then the rest; locked “unlocks next” and completed actions fall to the bottom.',
'Long action descriptions are now collapsed to a couple of lines with a per-card “Read more ▾” — expand just the ones you want to dig into and keep the list scannable.',
]},
{v:'0.23.21',d:'2026-06-27 21:15',n:[
'The bottom button now guides you through your turn: until all three moves are set it reads “Next: Marketing/Operations/Finance →” and walks you to the next action you still need to pick, with a small “End turn now” option if you want to skip ahead. Once all three are chosen it becomes “Confirm Actions →”.',
'When your business first unlocks, a quick 2-step walkthrough goes over your business finances first (cash, revenue, credit, expenses, debt, owner equity), then your operational engine — Leads → Customers → Staff (and Culture).',
]},
{v:'0.23.20',d:'2026-06-27 20:00',n:[
'Health now matters: the more you run yourself down (low energy + neglected Body), the easier you get sick — illness/burnout events scale with neglect, so healthy founders are barely exposed and run-down ones get hit often. No more random blowups.',
'Insurance pays real cash claims: with the Business Insurance Stack, a health crisis reimburses most of the medical bill AND pays a tax-free critical/chronic-illness lump sum (a few months of living costs) — so getting sick while insured can leave you cash-positive instead of broke. The stack now spells out its critical & chronic illness cover.',
'Retrying a partial action is now half price on both cash and energy — you’ve done the legwork, just finishing the job. Cards show a “↻ RETRY — HALF COST” badge and the discounted numbers.',
'Actions you’ve already run in earlier months are clearly marked with a green “✓ done ×N” pill and an accent edge, so it’s obvious what you’ve picked before.',
'Fixed cost text that didn’t match the actual charge: “Test Paid Ads” no longer quotes a flat $500 (the budget scales with your business), and the accumulation policy clarifies its shown cost is just setup — ongoing funding flows from your monthly cash flow.',
]},
{v:'0.23.19',d:'2026-06-27 18:30',n:[
'Tutorial polish on mobile: the spotlight no longer jumps around (it scrolls once, then settles), the hint arrow now points the right way (↑/↓) at the highlighted spot, and the “end your turn” prompt matches the real button (“Confirm Actions” / “End Turn”). Removed the Back button — the tour now moves one way, fixing a bug where going back broke it.',
'Energy gives you a heads-up now: when it runs low you get a one-time warning (and the gauge flags “rest soon” / “low · moves weaker”) explaining that below 30 your moves get weaker — and that investing in 🏖️ Life raises Personal Mastery, which recovers energy faster. No more burning out by surprise.',
'Net Worth now waits for a positive month before it appears (and at month 4 you’re pointed to the ⭐ Epic concierge instead) — no celebrating a negative figure.',
]},
{v:'0.23.18',d:'2026-06-27 17:15',n:[
'Net worth is now ownership-aware: the CFO briefing shows your equity stake (e.g., 70% with a partner) and counts only your share of the company’s value — the dashboard Net Worth keeps tracking your real, partner-adjusted retained equity.',
'Operations has a clearer path: “Do the Work Yourself” now unlocks after “Study Business Content” (learn → do → delegate).',
'Safety fix: the ⭐ Epic Life icon can no longer appear during the first-month tutorial.',
]},
{v:'0.23.17',d:'2026-06-27 16:00',n:[
'Result screen decluttered: each card now shows the headline, narrative and cost, with the stat-change details and lesson tucked behind a “▾ Details” toggle.',
'Tutorial highlighting fixed on mobile — the spotlight now lines up with the right element every time, and feature-unlock tips (Business, Life, Net Worth, Epic) point right at the new thing on screen.',
'Delayed Life payoffs no longer interrupt with a separate screen — they apply and show as a small “🌱 …paid off” note atop the next month.',
'Partnerships now have teeth: accepting a 30%-equity partner really takes 30% of your monthly profit (it used to be just flavor), and the outcome shows the actual cash you received.',
'Premium Financing reworked to be realistic: it’s a low-interest bank loan secured by your policy (no free money — the funded cash value equals what you borrowed, minus cost of insurance), sized to your net worth, and only available once your net worth passes $5M. Works with whole life or IUL.',
'Cleaned up several event outcome descriptions that showed flat dollar amounts when the real number scales with your business.',
]},
{v:'0.23.16',d:'2026-06-27 14:30',n:[
'Much friendlier onboarding: the early game starts lean and reveals features as they become relevant — Personal Mastery & Freedom appear with your first Life check-in, Net Worth once you’re building wealth, the ⭐ Epic concierge after you’ve learned the basics, with a one-time tip the first time each shows up.',
'The first-month tutorial is now a real walkthrough: it steps through your situation on the dashboard (your cash, your debt, your monthly burn & runway, your energy), and after you pick each move it pauses to explain WHY — talk to people for leads, study to build systems, form an LLC to unlock the business. It also walks you through the results screen.',
'Your team works for you: with a full C-suite, the moves they run no longer cost you energy — and your 🏖️ Life action is always your own pick (the team never auto-chooses it). Team-plan icons now match the action bar.',
]},
{v:'0.23.15',d:'2026-06-27 12:15',n:[
'Cleaner action bar: Marketing, Operations, Finance, Life and Epic Life are now compact same-size icons (📣 ⚙️ 💰 🏖️ ⭐) — the Epic ⭐ no longer overlaps the other tabs on mobile. Tap any to switch; the step line and tooltips still name them.',
]},
{v:'0.23.14',d:'2026-06-27 11:00',n:[
'Epic Life is gentler on your wallet: it spends only from cash (never your credit) and always leaves about a month of expenses in the bank — so it can’t drain you or quietly add debt. On Hard mode it also holds off on the expensive setup until your business is stable, and it now fixes your credit first.',
'Enrolling Epic Life no longer uses up your Finance action — you can enroll AND still make a finance move the same month (with a Cancel option).',
'Mobile fixes: the ⭐ Epic button stays put on the right and no longer runs off-screen, and the “Cash flow/mo” figure no longer spills into the business column.',
'Tutorial: the finance highlight now lines up correctly with the recommended action.',
]},
{v:'0.23.13',d:'2026-06-27 09:30',n:[
'Epic Life results polish: the concierge’s monthly move no longer costs you energy, shows in premium gold, and now runs first — so the before→after numbers flow in order from the top of the results instead of looking out of sequence.',
]},
{v:'0.23.12',d:'2026-06-26 23:30',n:[
'Epic Life Membership is now a ⭐ button in the action tabs row — tap it anytime to see what it does, the pricing, and enroll. Two plans: Monthly ($500 + $300/mo) or Annual ($500 + $3,000/yr, save $600).',
'Cleaner dashboard wording: “Net/mo” is now “Cash flow/mo” — tap it for a plain-English breakdown (money in − money out, and what “runway” means).',
'Tighter tutorial: the screen is now locked during the walkthrough — you can only tap the highlighted spot (or Skip/Next), no scrolling or clicking around. The Epic Life step now points at its button.',
]},
{v:'0.23.11',d:'2026-06-26 22:45',n:[
'Tutorial now coaches your first moves: it highlights the single best action to tap (a sensible starter, not a trap) instead of the whole list, the tip box is smaller on mobile, and a new slide introduces Epic Life Membership with a heads-up to play your first game without it.',
'New Operations action — “Study Business Content (Books & YouTube)”: free, costs energy, builds how well you run things. “Work With a Vendor Contractor” now unlocks after you’ve done the work yourself first.',
'New Marketing action — “Offer a Discount to Drive Sales”: floods you with low-paying, high-maintenance customers and drains lots of energy. Easy volume, but it erodes your pricing power — use sparingly.',
]},
{v:'0.23.10',d:'2026-06-26 22:10',n:[
'New Marketing action under Sales & Conversion — “Do the Sales Yourself”: no cash, just energy. Founder-led selling that turns your pipeline into paying customers when you can’t yet afford a team or a funnel.',
'Tutorial fix: the tip now sits pinned at the top of the screen and the highlighted area scrolls in just below it, so it no longer covers what it’s pointing at (and you can still tap through on mobile).',
]},
{v:'0.23.9',d:'2026-06-26 21:30',n:[
'Life rewards now clearly show their Personal Mastery impact (which dimensions moved + your new mastery score) — on both the quarterly check-in and when your team frees up a Life slot. Life actions also always land now (no more random “nothing happened”).',
'Recurring costs read correctly: family office, board, counsel, S/C-corp, bookkeeping, premium financing and every team hire now show as “🔁 +$X/mo ongoing” instead of a confusing one-time charge.',
'Event fixes so revenue behaves sensibly: losing a big client (or clients) now actually reduces your customer base proportionally instead of briefly zeroing your revenue, and growth opportunities (big contracts, partnerships, referrals, real estate) now deliver real, lasting gains.',
'Borrowing against your policy to fund a deal now respects your actual borrowing room (up to ~90% of cash value); the position funded equals what you borrowed, and your cash value keeps compounding untouched.',
'Opening any dashboard info screen no longer lets the page behind it scroll.',
]},
{v:'0.23.8',d:'2026-06-26 20:30',n:[
'Result cards now show the energy each action spent (or gained), so you can see what a move cost you.',
]},
{v:'0.23.7',d:'2026-06-26 20:15',n:[
'Your personal dashboard now shows Net Worth (all assets minus all debt) with a month-over-month trend arrow (▲/▼), so you can see at a glance whether your wealth is growing. Tap it for the full asset breakdown.',
]},
{v:'0.23.6',d:'2026-06-26 19:55',n:[
'Business Insurance Stack now reads correctly as what it is: a one-time setup plus an ongoing monthly premium. Result cards show recurring costs as “🔁 +$X/mo ongoing,” and the menu shows the monthly premium up front.',
]},
{v:'0.23.5',d:'2026-06-26 19:35',n:[
'Bug fix: a business term loan no longer wrongly bumps your personal credit available (and personal utilization). A term loan is now purely installment debt + cash, as the description says.',
]},
{v:'0.23.4',d:'2026-06-26 19:15',n:[
'Result screen is clearer for decisions: the Cash & Credit panel now leads with your total accessible capital (cash + all available credit) and how many months of runway you have. Action costs read straight — any credit financing fee is shown separately instead of making the numbers look off.',
'Epic Life Membership moves now appear at the top of your results, above your own actions.',
'Removed the monthly mentor blurb on the results screen — it was redundant with each action’s lesson and your achievements.',
]},
{v:'0.23.3',d:'2026-06-26 18:45',n:[
'Fixes: business credit now shows “—” until you actually have a business credit line (instead of $0); the tutorial no longer blocks tapping actions on mobile; and the Epic Life Membership card is more compact.',
]},
{v:'0.23.2',d:'2026-06-26 18:15',n:[
'New Finance option — Epic Life Membership ($500 + $300/mo): a done-for-you wealth concierge. Once enrolled it quietly runs your financial playbook in the background — credit optimization, debt restructuring, a protective holding structure, banking, insurance, your tax-free accumulation policy, then switching on passive income — executing the single most relevant move each month and surfacing more investment opportunities. The actions it covers are marked “handled” so you don’t need to pick them. (It’s a real-life service — the game lets you feel the value.)',
]},
{v:'0.23.1',d:'2026-06-26 17:30',n:[
'Money comes from the right pocket: Marketing, Operations and Finance moves are now funded by the business, and life rewards draw from the business only when they’re genuine business spend (executive health, coaching, team retreats) — purely personal treats (vacations, dream car/home) come from your personal cash. Keeps your personal account from getting drained to zero every month.',
'Reworked the "Build Personal Credit" action to reflect how credit really works — correct genuine errors, lower utilization, and resolve collections — instead of implying you can just dispute legitimate marks away.',
'Action cards are clearer about what they change: every action now lists the exact stats it impacts. Money & credit-score stats also show your current value for reference; everything else just names the stat (no confusing numbers). Life actions now show which Personal Mastery dimensions (💪🧠🕊️❤️✨) they build, too.',
'Result screen tidier: the cost line now just says where the money came from (e.g. “from cash” or “from business credit”) instead of repeating the dollar amount per source.',
'The first-month tutorial is now hands-on: instead of just pointing at the screen, it walks you through actually making your first Marketing, Operations and Finance moves and ending the turn — so you learn the loop by playing it.',
'Dashboard now shows Net/mo at a glance (income minus expenses, color-coded) with a quick runway estimate (~months of cushion) when you’re burning cash — for both your personal finances and the business.',
'Cleaner stats layout: each side is now grouped into MONEY and CAPACITY (Operations for the business) so the numbers that matter are easier to scan.',
'Personal Mastery dimensions (💪🧠🕊️❤️✨) are now color-coded — neglected areas turn red so you can see at a glance what’s being starved.',
'Decluttered the action menu: the “hire a CFO to forecast results” hint now appears once instead of on every card.',
]},
{v:'0.23.0',d:'2026-06-26 16:45',n:[
'Personal Mastery is now a real system: your life splits into five dimensions (💪 Body, 🧠 Mind, 🕊️ Spirit, ❤️ Heart, ✨ Luxury). Build them up — neglect them and your energy recovery drops, making it hard to act. Cheap habits give diminishing returns; the bigger investments matter.',
'New Life rewards: company retreats, dream car, dream home, world sabbatical, leadership coaching, nutrition, and more. The end screen shows off "The Life You Built" with badges of honor that also appear on the leaderboard.',
'Company Culture matters now: run retreats, real benefits, and equity/stock incentives (needs a C-Corp) to keep your team. Neglect it and you face high-stakes people events — team mutinies and star defections that can rock the company.',
'Credit reworked to feel like real life: clearing collections takes a couple months and lifts you toward ~650, then lowering utilization carries you toward 750–800. New "Build Your D&B Business Credit Profile" builds business credit on the company’s name.',
'New hires that run things for you: an Executive Assistant (auto-manages utilization, credit, D&B, tax reserve) and General Counsel (heads off lawsuits). Your C-suite now also proposes their own promotions and the CFO prioritizes protecting & structuring the business first.',
'Cleaner team controls: one "Your Team’s Plan" panel with a single "Run the month" button. Delegating buys you life time — a full C-suite lets you take a Life action every other month, a full board every month.',
'Scoring upgrade: a new "Creditworthiness" dimension on the radar, plus milestone perks (Fully Protected softens events, Tax-Smart cuts drag, Funding Ready boosts credit capacity). The end screen now shows EVERY tracked stat, viewable for any player on the leaderboard.',
'Private banking clients get invited to exclusive off-market deals — pre-IPO allocations and private credit not available to anyone else.',
'Save & resume your run, see your full month-by-month choices, and before→after numbers on every result and event. Action menus consolidated and decluttered; event choices no longer spoil the outcome (deals still show the offer).']},
{v:'0.22.7',d:'2026-06-26 15:22',n:['Save & resume: at the Year 1 / Year 2 checkpoint you can add your name and save your run, then pick it back up from the title screen or leaderboard — even after closing the tab.','The end screen now lists your full month-by-month choices (Marketing / Operations / Finance), and you can tap any leaderboard entry to see how that player played.','Event outcomes now show before → after numbers (cash, debt, credit, leads, etc.) just like action results.']},
{v:'0.22.6',d:'2026-06-26 15:12',n:['Results now show a “Cash & Credit — This Month” summary (start → end) plus each action’s cost and how it was funded.','Action cards show which stats they’ll impact and your current numbers — the projected result unlocks once you hire a fractional CFO.','Per-action results show before → after for cash, total debt, credit and key stats — so a loan’s debt increase and a campaign’s cost are both visible (credit only shows when it actually changes).','Money (+/− cash) effects now appear only on Finance results, keeping Marketing/Operations cards focused.','Random events now show your full dashboard so you can decide with your numbers in view.','Cash can no longer go negative: shortfalls draw on your credit automatically, and if cash AND credit run dry, the game ends (insolvent).','Selling your company is now realistic: proceeds are personal income, taxed ~23.8% capital gains, and you forfeit the equity.','You can now resume a run after ending early at a year checkpoint.','Gentler first 3 months — fewer partial results while you find your footing.','Launching an email campaign no longer makes your leads go backward — you keep your contacts.']},
{v:'0.22.5',d:'2026-06-26 14:05',n:['Faster start: picking your path now drops you straight into Month 1 — the old “Begin Your Journey” screen was redundant with the in-game tutorial and intro.','Mentor’s name is now consistent everywhere — Marcus Webb.']},
{v:'0.22.4',d:'2026-06-26 13:50',n:['Results now show before → after numbers for the stats an action moved — leads, customers, team size, brand equity, systems maturity and revenue capacity — so you can see exactly what changed.']},
{v:'0.22.3',d:'2026-06-26 13:35',n:['Less clutter on the action screen: your mentor’s comments now appear on the monthly Results screen instead of above your choices.','Mentor is back to his original name — Marcus Webb.']},
{v:'0.22.2',d:'2026-06-26 13:20',n:['Your selected action now jumps to the TOP of its group (was sinking to the bottom) so it stays in view.','The selected action is easier to see — brighter green fill and a stronger glow.']},
{v:'0.22.1',d:'2026-06-26 13:00',n:['Tutorial reimagined as a guided walkthrough: the screen dims and each part of the game lights up one at a time — your dashboard, the action tabs, the action list, the story panel and the End Turn button — with a short explanation for each.','Step through it at your own pace with Next / Back, or skip the whole tour anytime.']},
{v:'0.22.0',d:'2026-06-26 12:49',n:['New: a first-month tutorial explains how to play — and you can skip it anytime.','You can end your run after Year 1, 2, or 3 — you don\'t have to play all 36 months. The tutorial and the year-end checkpoint now make this clear, with an “End Here — Lock In My Final Score” option.','Action menu reworked: the most relevant group auto-opens, NEW and ↻ RETRY markers show on group headers, unselected actions float to the top, and your selected action is clearly marked and moved to the bottom so it’s out of the way.','Partial successes can now be retried: a one-time action that only partially lands stays on the menu (badged ↻ PARTIAL — RETRY) and your next attempt is far more likely to succeed.','Selected actions are now obvious — a bright SELECTED badge, glowing border and tint — and a newly-unlocked action no longer looks selected.','Credit actions now show before → after on the result (e.g. business limit $10k → $45k, utilization 60% → 13%).','Accumulation policy now unlocks only once you can fund it — you need about $50k of capacity (cash or credit) before it appears.']},
{v:'0.21.2',d:'2026-06-26 11:42',n:['Results screen consolidated — each action is now one compact card with its outcome and inline stat “chips,” lessons trimmed to a single line. Much easier to read.','Aggressive Debt Paydown reworked: it now uses spare cash to drop your credit utilization just under 30%, and only pays down installment loans if your DTI is also high — the result screen shows the before→after numbers.','Event "preparation helped" notes now make sense — e.g. an open credit line "gives you room to act from strength," not "lowered the odds." Each safeguard is described by what it actually does.','Recession event choices are no longer generic: Play offense (borrow cheap to grab market share), Reposition to recession-proof demand, or Batten down and wait.','"Hire Your First Contractor" description clarified — delegate delivery so you can focus on revenue-generating work.']},
{v:'0.21.1',d:'2026-06-26 11:09',n:['You now see your debrief ("What You Learned" + milestones) at the Year 1 and Year 2 checkpoints — no need to end the run to get feedback.','Your ending title now reflects how you actually played: master leverage + finance efficiency AND enjoy the lifestyle/toys to earn Freedom Architect; grind revenue while skipping leverage, passive income and tax structure and you get "The Grinder" — a high-paying job, not freedom.','The debrief now lists your milestones — what you unlocked and what\'s still on the table.','Finance milestones reordered into a clean ladder (Made It Legal → Business Banking → Creditworthy → Funding Ready → Tax-Smart → Money Engine → Tax-Free Passive Income); "Funding Ready" now means debt restructured + a clean credit file, no longer overlapping the others.','Removed a redundant credit action: "Apply for Additional Credit Lines" is now "Expand Your Credit Lines" and only appears after you\'ve opened your first business line.']},
{v:'0.21.0',d:'2026-06-26 10:49',n:['New: Milestones! Hit key moments across Marketing, Operations and Finance — first customer, funnel built, first hire, runs without you, made it legal, tax-free passive income, and more. Each pops on your results screen and your mentor Bruce calls it out.','New: 🏆 Achievements panel on your dashboard — see every milestone grouped by category, what you\'ve unlocked, and what\'s still ahead (X/15).','Finance milestone "Funding Ready": LLC formed, business bank account open, debt restructured, and a clean credit file (no collections / negatives disputed off) — the lender-ready profile.','Freedom score rebalanced: hiring your C-suite and building a team/board now properly raise your Freedom (Operator → Director → CEO → Chairman), instead of being stuck as Manager.']},
{v:'0.20.0',d:'2026-06-26 08:41',n:['C-suite now starts FRACTIONAL (part-time, affordable) and can be promoted to FULL-TIME — full-timers cost 3-4× and actively build the business, but you can only carry that payroll with strong margins and smart leverage. The "can\'t afford great people yet" ceiling is the lesson.','Growth is now tied to using OPM: marketing & operations actions cost more as you scale, so you must fund growth with credit — build your credit lines and you scale fast; rely on cash alone and you stall.','Tax efficiency matters more: a profitable business with no S-Corp/structure bleeds noticeably more cash each month — electing S-Corp and optimizing taxes frees the cash to afford growth and people.','Your CFO now lets you leverage harder AND safer: more credit capacity, cheaper debt, and a higher safe utilization — full-time CFO unlocks the most.','Private Banking reworked: requires $2M cash, then you deposit it (earning ~5%/yr) and borrow against it at just 1%/yr — your money earns while near-free money funds your growth. Shown in your Assets and Debt breakdowns.','Bug fix: policy loans can no longer exceed 90% of your cash value (the monthly tax-free income respects the same cap).','Tax-free passive income and policy loans now only require having cash value in the policy — no other gates.','New detailed founder artwork on the home screen, and difficulty badges (Easy/Medium/Hard).','Re-tuned so the business and net worth grow at a realistic pace in year one instead of ballooning.']},
{v:'0.19.1',d:'2026-06-25 22:35',n:['The founder picker now shows a difficulty badge on each option (Easy / Medium / Hard) and lists them easy → hard: New Business Owner (Easy), Established Business Owner (Medium), Stuck Business Owner (Hard)']},
{v:'0.19.0',d:'2026-06-25 22:23',n:['Two new ways to play are back: The Stuck Business Owner (hard mode — bad credit, heavy debt, tight cash; dig out by fixing your credit and restructuring debt the smart way) and The Established Business Owner (medium — a 2-year head start with a small team and good income, but real blind spots to cover: taxes, lawsuits, insurance, owner dependency)','Late-game balance: repeatable Marketing & Operations actions now cost more as your company grows (up to 4×) and deliver proportionally bigger results, so they stay a real decision instead of pocket change','Your C-suite now grows the business on their own each month — the COO builds the team and raises delivery capacity (auto-hiring when revenue supports it), and the CRO adds leads, capacity and brand — on top of the moves they pick for you']},
{v:'0.18.0',d:'2026-06-25 22:03',n:['Hire a C-suite: a Chief Revenue Officer and Chief Operating Officer each automatically pick and execute the smartest move in their area every month (you can still override), and a Chief Financial Officer stars the best finance move for you','Once all three are hired, Marketing & Operations fold into a "Focus Mode" banner so you can focus on the big capital and lifestyle decisions — one tap hands control back any time','Executive pay is realistic and scales with the company (a market salary plus performance bonuses when their picks land), and their picks now favor genuinely high-leverage moves instead of busywork','New Family Office & Legacy plays: open a Private Banking relationship, invest in a Private Equity fund, set up a Family Office, and establish a Dynasty Trust — billionaire-tier wealth structure','Convene a Board of Directors (after your execs + passive income are in place) to put the company on autopilot — "Let the Board run the month" executes everything in one tap','New billionaire lifestyle options: fly private, charter a superyacht, buy a private estate, build an art collection, and endow a major foundation','All investments now show up as a tappable Investments line on your dashboard with a full asset & net-worth breakdown','The CFO Briefing now opens as soon as you hire your CFO, and includes your investment assets','NEW badges moved off the category tabs and onto the specific action group that unlocked something new','Composite score is now out of 600 (six dimensions) instead of 1000']},
{v:'0.17.2',d:'2026-06-25 19:45',n:['Hire a Fractional CFO and you get a real CFO Briefing on your dashboard — company value, net worth, assets, monthly profit & margin, runway, a 6-month revenue projection, and one focused recommendation each for marketing, operations and finance','Policy loans and tax-free passive income now show the actual money moving on the result screen — the amount, and your personal cash before → after','Policy mechanics spelled out: cash value grows ~7%/yr (even while borrowed against), outstanding loans accrue ~5%/yr, and the cumulative loan is netted from your death benefit at death — never repaid from your pocket','When you’re protected from an event, it now names the safeguard (e.g. "your LLC") and the damage it avoided; when you’re not, it tells you exactly how to prepare next time','Major lawsuits can now be prepared against — an LLC cuts the damage, not just the odds','Requesting a tax extension no longer hurts your credit score (a tax extension isn\'t reported to the bureaus) — it still accrues interest, penalties and audit risk','Ending a month with actions still unspent now asks you to confirm (e.g. "1/3 selected — end anyway?"), so you don\'t skip a category by accident','Category tabs now show a NEW badge the month a fresh option appears there, so you notice newly-unlocked actions','Dashboard: Credit Score (and the business D&B score) now sit at the very top of each column, above Cash; the "Loans" line is renamed "Debt"','The Restructure Your Debt result now spells out the actual money moved — the 0% line opened, balances shifted to business credit, and working cash pulled','Fixed: you can now see the business credit-line and loan options earlier (foundation stage) before they fold into the debt-restructure play; you always have a capital option available']},
{v:'0.17.1',d:'2026-06-25 18:45',n:['Fixed: hired staff no longer vanish — people only leave if you genuinely can\'t make payroll after revenue and all your credit; and operating expenses can never go negative (was an event exploit)','Fixed: you can now actually fund your IUL policy, and it funds aggressively (scales with revenue) — drawn from the business as a personal expense instead of silently skipping when personal cash was $0','Fixed: you now pay yourself a real living-wage draw once profitable (a bigger draw, ~25% of revenue), so personal income and cash are no longer starved','"Restructure & Optimize Your Debt" stays the full play (0% business line + pay down cards + shift to business credit + working cash); once it\'s available, the now-redundant standalone credit-line and loan actions fold into it','Random events now scale with your business size and are capped so a single event can never wipe a prepared player']},
{v:'0.17.0',d:'2026-06-25 17:30',n:['Leads, Customers, and Staff now show as mini-bars on the Business side — mirroring Energy, Personal Mastery, and Freedom on the Personal side','Paying yourself is now modeled the legal way: when personal cash runs short, the business borrows on its own line (~6%) into business cash, then pays you a documented owner draw — no commingling','Your capital account (owner equity) is now tracked — it grows with retained business profit and goes down as you take draws, shown on the Business panel and in the Income breakdown','Pass-through taxes (LLC/S-Corp) are settled at year-end from your personal side, tracked as "pass-through tax paid" — set up the monthly tax reserve to pre-fund it instead of getting hit with a lump','Funding order for personal needs: personal cash → owner draw from business cash → liquidate business credit → personal credit as the last resort']},
{v:'0.16.0',d:'2026-06-25 16:45',n:['Every breakdown now splits Personal vs Business — tap Income, Expenses, or Credit Score and you\'ll see your personal side and your business side separately (your business even has its own D&B score)','Your policy\'s cash value now shows as a personal asset, and your salary/passive income visibly lands in your personal cash each month','Money now flows to the right pocket: your insurance/accumulation policy is funded entirely from personal cash, and policy loans pay into your personal account','Loans land where they belong — once you form an LLC, new bank/business loans sit on the business; before that, they\'re personal','The protection policies (income, key-person life, and now general business liability) are a business expense the company pays — key-person is the one life policy the business itself buys','New actions now show a "NEW" badge the first month they unlock — you\'ll never miss a freshly-available move','Rebalanced random events: growing your revenue no longer makes lawsuits and cash-crunches more likely (it just makes them possible), and big settlements are survivable for the prepared','Weak spots can now be prepared for — rate hikes are mitigable, and a capital crunch can be covered from cash reserves (no forced debt) if you kept a buffer','New wealth-path events reward the money engine: borrow tax-free against your policy to seize a deal, and a passive-income milestone moment','Events now fire with fair variety instead of defaulting to the same few; protection (LLC, trust, insurance) visibly pays off when trouble hits']},
{v:'0.15.0',d:'2026-06-25 14:30',n:['Finance streamlined: bundled overlapping actions into stronger single moves — Form LLC & Set Up Books (with monthly bookkeeping), Build Personal Credit, Elect S-Corp & Operating Agreement, Asset Protection Stack, Advanced Tax Strategy, Insure Yourself & the Business, and a full Restructure & Optimize Your Debt play (30 → 22 actions)','Finance actions consolidated from six groups into three clear sections — Foundation & Credit (get established and bankable), Tax & Protection (keep more and shield it), and Wealth & Passive Income (the engine) — matching Marketing and Operations','Dashboard now shows Personal (left) and Business (right) side by side with a divider — clean ledger rows for cash, credit score, credit, expenses, loans, income; the Business side stays locked until you form an LLC, then unlocks business cash, revenue, customers & more','Your money now truly separates once you incorporate: the business earns revenue and pays its bills, then pays you a salary/draw into your personal account where your living costs and tax-free passive income land','Removed the Marketing/Operations/Finance skill bars and renamed Fitness to Personal Mastery for a cleaner founder strip','Operations actions reorganized into three clear stages — Capacity & Delivery (deliver more), Systems & Freedom (run it without you), and Quality & Retention (keep the customers you win)','Removed two duplicate "hire" actions that overlapped marketing; operations is now tighter and each action drives its stage','Marketing actions reorganized into a clean funnel — Offer & Value (raises what each customer is worth), Lead Generation (fills the pipeline), and Sales & Conversion (turns leads into customers) — and every action now actually drives its category’s outcome','Conversion is now a real, stacking stat: sales actions (sales team, CRM, webinar, email nurture) each lift your close rate, shown live on the dashboard','Insurance funding is now an automatic monthly contribution — sized to your revenue, cash, and business credit, with a ~2% cost of insurance off the top (no more free spam-to-win button)','New "Activate Tax-Free Passive Income" — switch on policy-loan income any time; your cash value keeps growing ~7%/yr while the loan accrues ~5%/yr and is netted from the death benefit (zero impact on your money today, viewable under Loans)','Merged three overlapping credit moves into one "Business Credit Strategy": qualify 0% business credit AND shift personal balances onto it in a single play','Hiring a salesperson is now realistic — it lifts your lead conversion, and the cost scales as the business grows','"Acquire a Competitor" is now a finance play: an investment that throws off passive cash flow plus depreciation write-offs that cut your taxes']},
{v:'0.14.2',d:'2026-06-25 13:35',n:['Cleaner dashboard: Cash, Personal Credit, and Business Credit now sit together at the top — each with its own utilization at a glance','Customers, Revenue, and Burn share the next row; tap Revenue to see where it comes from (customers vs. passive/asset income)','Energy, Fitness, Freedom, and Skills condensed into a tighter strip that takes far less space']},
{v:'0.14.1',d:'2026-06-25 13:15',n:['Loans & credit lines now show an estimated amount right on the action card — sized to your credit and revenue, before you commit','Results no longer contradict themselves: the headline amount you see when a loan funds is the amount you actually get']},
{v:'0.14.0',d:'2026-06-25 12:59',n:['Actions now unlock by capability, not revenue — e.g. Test Paid Ads needs an Offer first. If you can afford it (cash or credit), money is never the gate.','Cash and available Credit are now a clear money bar at the top of the dashboard']},
{v:'0.13.9',d:'2026-06-25 10:09',n:['Tighter dashboard — Cash+Credit combined into one card, Monthly Burn+Runway into another; customer count now reads "0 customers" properly']},
{v:'0.13.8',d:'2026-06-25 10:01',n:['Slimmer stats dashboard — fewer cards, and stats like Policy, Passive Income, Salary, and Staff only appear once they matter (pipeline + customers merged into one)']},
{v:'0.13.7',d:'2026-06-25 09:48',n:['Smarter auto-pay: uses business credit up to 30% utilization first (keeps your credit healthy), then cash, then stretches business, with personal credit as the last resort — no more "how do you want to pay?" prompt']},
{v:'0.13.6',d:'2026-06-25 09:41',n:['Credit now draws in the right order — cash first, then business credit, with personal credit as a last resort (protects your utilization)','Debt Restructure now runs after the month\'s expenses, so your utilization stays fixed instead of getting re-messed','New "Runway" readout shows how many months of expenses your resources cover, green when healthy, red when low']},
{v:'0.13.5',d:'2026-06-25 09:32',n:['Operations is now freeform: actions are no longer gated behind revenue — if you can afford it (cash or credit), you can do it','Pick your own operations strategy: Run It Lean, Build a Team, or Productize & Scale']},
{v:'0.13.4',d:'2026-06-25 09:27',n:['Marketing now follows the funnel: "Audience & Offer" generates leads, "Get Customers" converts leads into customers','"Do the Work Yourself" now unlocks once you have your first client (no more delivering to nobody)']},
{v:'0.13.3',d:'2026-06-25 09:22',n:['Locked actions now show as compact one-line rows under "Unlocks next" instead of big greyed-out cards — tighter menu, less scrolling']},
{v:'0.13.2',d:'2026-06-25 08:02',n:['New title-screen backdrop — a dusk city skyline with a rising growth line, for a more premium first impression']},
{v:'0.13.1',d:'2026-06-25 07:55',n:['Action menu is now collapsible — tap a direction to reveal its options, so the menu is short and easy to scan instead of one long scroll']},
{v:'0.13.0',d:'2026-06-25 07:49',n:['Action menu grouped by direction — every option stays visible, no more buried choices','Finance actions (credit lines, loans, balance transfer, lending, real estate) now scale to your real numbers','End-screen recap shows only the options you actually saw','Added this What\'s New changelog']},
{v:'0.12.0',d:'2026-06-25',n:['Anti-grind: revenue is capped by your capacity — build offer/systems/team to scale','Progressive tax drag, team coordination cost, and leaky-bucket churn punish unstructured growth','Mentor renamed to Bruce — ends with a question, not advice']},
{v:'0.11.0',d:'2026-06-25',n:['Scoring rebuilt around capital efficiency — passive tax-free income is the crown','The golden path teaches itself: in-the-moment lessons + real-consequence events','Easier early game; fixed wiped real-estate/lending income']},
{v:'0.10.0',d:'2026-06-24',n:['Rebuilt into a modular codebase; baseline release']}
];

const Game={
state:null,month:1,selectedActions:{},selectedLifestyle:null,actionHistory:[],eventHistory:[],lifestyleHistory:[],monthlySnapshots:[],currentCategory:'marketing',_lbFrom:'title',

GLOSSARY:{'EBITDA':'Earnings Before Interest, Taxes, Depreciation & Amortization — your business\'s operating profit.','COGS':'Cost of Goods Sold — direct costs to deliver your product/service.','DSCR':'Debt Service Coverage Ratio — operating income divided by debt payments. Above 1.25 is healthy.','SOP':'Standard Operating Procedure — written steps so anyone can do a task without you.','LOC':'Line of Credit — revolving credit you draw from as needed.','LLC':'Limited Liability Company — separates personal assets from business liability.','S-Corp':'S Corporation — tax election splitting income between salary and distributions to save taxes.','CRM':'Customer Relationship Management — software tracking prospects and deals.','EIN':'Employer Identification Number — your business tax ID.','HELOC':'Home Equity Line of Credit.','OPM':'Other People\'s Money — borrowed or investor capital.','JV':'Joint Venture — parties pooling resources for a project.','IP':'Intellectual Property — proprietary methods or technology.','Net Worth':'Assets minus liabilities.','Brand Equity':'Market recognition and perceived value of your business.','Key-Person Dependency':'How much the business relies on you personally.','Churn Rate':'Percentage of customers lost each month.','Utilization':'Percentage of available credit in use. Below 30% boosts score.','Tradeline':'A credit account on your report.','Monthly Burn':'Total monthly expenses across life and business.','Living Expenses':'Personal cost of living — rent, food, utilities, transport.','Holding Company':'A parent entity that owns your operating business(es). It manages money, holds assets, and isolates your personal finances from business operations and liabilities.','Operating Entity':'The business entity that runs day-to-day operations, holds contracts, employs staff, and takes on business debt. Sits under the holding company.','Liability Shield':'Legal separation between entities so that debts and lawsuits against one entity can\'t reach the assets of another.'},

async init(){await loadConfig();this._initSupabase();this.renderMainMenu();this.renderTitleMeta();this._renderUpdateIcon();this._checkForUpdate();
// Warn before an accidental refresh/close mid-game (progress is autosaved, but this prevents the surprise). Only fires during a live run.
window.addEventListener('beforeunload',(e)=>{const live=['game-screen','event-screen','lifestyle-screen','result-screen'].some(id=>{const el=document.getElementById(id);return el&&el.classList.contains('active');});if(live&&this.archetype&&!this._lost){e.preventDefault();e.returnValue='';}});},
renderTitleMeta(){const v=PATCH_NOTES[0],vl=document.getElementById('version-line');if(vl)vl.textContent='v'+v.v+' — '+v.d;const wn=document.getElementById('whats-new');if(!wn)return;const full=this._showFullLog,list=full?PATCH_NOTES:[PATCH_NOTES[0]];let h='<div style="max-width:420px;margin:18px auto 0;text-align:left;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px 14px;"><div style="font-size:0.8rem;font-weight:700;color:var(--gold);margin-bottom:4px;">What\'s New</div>';for(const e of list){h+='<div style="font-size:0.7rem;color:var(--text2);margin:8px 0 3px;">v'+e.v+' · '+e.d+'</div>';h+=e.n.map(x=>'<div style="font-size:0.82rem;color:var(--text);margin:3px 0;line-height:1.45;">• '+x+'</div>').join('');}h+='<div style="text-align:center;margin-top:10px;"><span style="color:var(--blue);cursor:pointer;font-size:0.78rem;" onclick="Game._showFullLog='+(!full)+';Game.renderTitleMeta();">'+(full?'Show less ▴':'Full changelog ▾')+'</span></div></div>';wn.innerHTML=h;},
archAvatar(id){const A={
new:'<svg viewBox="0 0 64 64" width="60" height="60" aria-hidden="true"><circle cx="32" cy="32" r="31" fill="rgba(16,185,129,0.13)" stroke="var(--accent)" stroke-width="2"/><circle cx="32" cy="11" r="5" fill="var(--gold)"/><rect x="30" y="15" width="4" height="3" rx="1" fill="#8a6d1f"/><g stroke="var(--gold)" stroke-width="1.4" stroke-linecap="round"><line x1="22" y1="11" x2="25" y2="11"/><line x1="39" y1="11" x2="42" y2="11"/><line x1="24.5" y1="5" x2="26.5" y2="7"/><line x1="39.5" y1="5" x2="37.5" y2="7"/></g><path d="M16 58c0-10 7-15 16-15s16 5 16 15z" fill="#10b981"/><path d="M27 43h10v6H27z" fill="#eab98f"/><circle cx="32" cy="34" r="9" fill="#f2c8a0"/><path d="M22.5 33c0-6 5-9 9.5-9s9.5 3 9.5 9c-3-3.2-6-4.4-9.5-4.4s-6.5 1.2-9.5 4.4z" fill="#4a3526"/><circle cx="29" cy="34" r="1.2" fill="#2a2018"/><circle cx="35" cy="34" r="1.2" fill="#2a2018"/><path d="M29 38c1.6 1.6 4.4 1.6 6 0" stroke="#b9745a" stroke-width="1.3" fill="none" stroke-linecap="round"/></svg>',
established:'<svg viewBox="0 0 64 64" width="60" height="60" aria-hidden="true"><circle cx="32" cy="32" r="31" fill="rgba(212,175,55,0.13)" stroke="var(--gold)" stroke-width="2"/><g opacity="0.5" fill="var(--gold)"><rect x="40" y="21" width="4" height="11"/><rect x="45" y="15" width="4" height="17"/><rect x="50" y="24" width="4" height="8"/></g><path d="M15 58c0-10 8-15 17-15s17 5 17 15z" fill="#1f2a44"/><path d="M27 42l5 9 5-9z" fill="#f5f5f5"/><path d="M30.7 43l1.3 3-1.6 6 1.6 2.2 1.6-2.2-1.6-6 1.3-3z" fill="var(--gold)"/><path d="M28 41h8v5h-8z" fill="#eab98f"/><circle cx="32" cy="32" r="9" fill="#f2c8a0"/><path d="M22.5 31c0-6 4.5-9 9.5-9s9.5 3 9.5 9c-2.2-2.4-4.5-3.4-9.5-3.4s-7.3 1-9.5 3.4z" fill="#2e2620"/><circle cx="29" cy="32" r="1.2" fill="#2a2018"/><circle cx="35" cy="32" r="1.2" fill="#2a2018"/><path d="M30 36.5h4" stroke="#b9745a" stroke-width="1.3" stroke-linecap="round"/></svg>',
stuck:'<svg viewBox="0 0 64 64" width="60" height="60" aria-hidden="true"><circle cx="32" cy="32" r="31" fill="rgba(239,68,68,0.13)" stroke="var(--red)" stroke-width="2"/><path d="M40 17l4 6 4-3 5 9" stroke="var(--red)" stroke-width="2" fill="none" opacity="0.55" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 58c0-9 7-14 16-14s16 5 16 14z" fill="#7a3b3b"/><path d="M27 42h10v6H27z" fill="#eab98f"/><circle cx="32" cy="34" r="9" fill="#f2c8a0"/><path d="M22.5 33c0-6 5-10 9.5-10s9.5 4 9.5 10c-2-3-4.2-4-6.2-3-1-2-3.2-2-4.4 0-2.2-1-5.4 0-8.4 3z" fill="#3b2f2a"/><path d="M26.5 31.5l3.2 1.2M37.5 31.5l-3.2 1.2" stroke="#3b2f2a" stroke-width="1.3" stroke-linecap="round"/><circle cx="29" cy="34.5" r="1.2" fill="#2a2018"/><circle cx="35" cy="34.5" r="1.2" fill="#2a2018"/><path d="M29 39.5c1.6-1.6 4.4-1.6 6 0" stroke="#a14b4b" stroke-width="1.3" fill="none" stroke-linecap="round"/><path d="M40.5 31c0 1.6-1 2.6-2 2.6s-2-1-2-2.6 2-3.6 2-3.6 2 2 2 3.6z" fill="#3b82f6"/></svg>'
};return A[id]||'';},
renderArchetypes(){const l=document.getElementById('archetype-list');l.innerHTML='';
const DIFF={Easy:{r:0,c:'var(--accent)'},Medium:{r:1,c:'var(--gold)'},Hard:{r:2,c:'var(--red)'}};
// compact money for the at-a-glance stat row ($7k, $4.2k, $40k)
const kfmt=v=>{v=+v||0;if(v>=1000){const n=v/1000;return '$'+(n>=10?Math.round(n):Math.round(n*10)/10)+'k';}return '$'+Math.round(v);};
const credCol=s=>s<580?'var(--red)':s<670?'var(--gold)':'var(--accent)';
CONFIG.starting_positions.positions.filter(p=>p.enabled!==false).slice().sort((a,b)=>((DIFF[a.difficulty]||{r:1}).r)-((DIFF[b.difficulty]||{r:1}).r)).forEach(p=>{
const c=document.createElement('div');c.className='archetype-card fade-in';
const d=p.difficulty?(DIFF[p.difficulty]||{c:'var(--text2)'}):null;
const badge=d?'<span class="arch-diff" style="color:'+d.c+';border-color:'+d.c+';">'+p.difficulty+'</span>':'';
const av=this.archAvatar(p.id),is=p.initial_state||{};
const stat=(label,val,col)=>'<div class="arch-stat"><span class="as-val" style="color:'+(col||'var(--text)')+';">'+val+'</span><span class="as-label">'+label+'</span></div>';
const stats='<div class="arch-stats">'+stat('Cash',kfmt(is.cash),is.cash>0?'var(--accent)':'var(--text2)')+stat('Rev/mo',kfmt(is.monthly_revenue),is.monthly_revenue>0?'var(--text)':'var(--text2)')+stat('Credit',is.personal_credit_score||'—',credCol(is.personal_credit_score||0))+stat('Debt',kfmt(is.total_debt),is.total_debt>0?'var(--red)':'var(--text2)')+'</div>';
c.innerHTML='<div class="arch-top">'+(av?'<div class="arch-av">'+av+'</div>':'')+'<div class="arch-head"><div class="arch-title-row"><h3>'+p.label+'</h3>'+badge+'</div><div class="tagline">'+p.tagline+'</div></div></div><p class="arch-desc">'+p.description+'</p>'+stats;
c.onclick=()=>this.selectArchetype(p);l.appendChild(c);});},

selectArchetype(p,noStart){
this.archetype=p;this.state=JSON.parse(JSON.stringify(p.initial_state));
this.state._stages=JSON.parse(JSON.stringify(p.stage_overrides));if(!Array.isArray(this.state._completed_actions))this.state._completed_actions=[];/* an archetype may pre-seed completed actions (e.g. Established starts 2 years in) — keep them */this.state._active_lifestyle_costs={};this.state._action_counts={};
this.state._mentor_state='unavailable';this.state._banker_state='stranger';this.state._rival_state='unknown';this.state._family_state=p.id==='established'?'strained':'coping';
this.state._audit_events=0;this.state._market_cycle='normal';this.state._ytd_taxable_income=0;
this.state.fitness_level=this.state.fitness_level||50;this.state.living_expenses=this.state.living_expenses||3000;this.state.lifestyle_expenses=this.state.lifestyle_expenses||0;
this.state.leads=this.state.leads||0;this.state.tax_reserve=this.state.tax_reserve||0;this.state.tax_rate=this.state.tax_rate||0.25;
this.state.personal_cash=this.state.personal_cash||0;this.state.capital_account=this.state.capital_account||0;this.state._owner_draws_total=this.state._owner_draws_total||0;this.state.personal_tax_ytd=this.state.personal_tax_ytd||0;
this.state.skill_marketing=this.state.skill_marketing||0;this.state.skill_operations=this.state.skill_operations||0;this.state.skill_finance=this.state.skill_finance||0;
this.state.credit_negatives=this.state.credit_negatives||0;this.state.company_culture=this.state.company_culture||45;
this.month=1;this.selectedActions={};this.actionHistory=[];this.eventHistory=[];this.lifestyleHistory=[];this.monthlySnapshots=[];this._playLog=[];this._pendingTax=false;this._lost=false;this.gameOver=false;this._prevAccessible=null;this._prevRunwayMo2=null;this._taxRescue=0;this._ownerRescue=0;this._lastRunwayMo=null;this._atCheckpoint=false;
// Straight into month 1 — the opening narrative beat + tutorial both live on the game screen, so a separate opening screen was redundant.
if(!noStart)this.startGame();},

startGame(){this.state._mentor_state='introduced';this.initMilestones();this.renderMonth();},
// ---- New Game+ (Sandbox) — unlocked after a full year (month 12+) as the New Business Owner ----
isNgPlusUnlocked(){try{return localStorage.getItem('ep_ngplus')==='1';}catch(e){return false;}},
// ---- Redeem codes (unlock content via a code, e.g. "epiclife" → New Game+) ----
// To add a code: give it a normalized key (lowercase, alphanumeric only) + an apply() that flips the unlock.
REDEEM_CODES:{
epiclife:{label:'New Game+',msg:'New Game+ unlocked! Customize your starting hand from the main menu.',apply(){try{localStorage.setItem('ep_ngplus','1');}catch(e){}}}
},
_normCode(c){return (c||'').toLowerCase().replace(/[^a-z0-9]/g,'');},
_redeemedCodes(){try{return JSON.parse(localStorage.getItem('ep_codes')||'[]');}catch(e){return [];}},
showRedeem(){const h='<div style="font-size:0.8rem;color:var(--text2);line-height:1.5;margin-bottom:10px;">Have an unlock code? Enter it below to unlock bonus content.</div><input id="redeem-input" class="name-input" placeholder="Enter code" autocomplete="off" autocapitalize="off" spellcheck="false" onkeydown="if(event.key===\'Enter\')Game.redeemCode()"><button class="btn-primary" style="margin-top:4px;" onclick="Game.redeemCode()">Redeem</button><div id="redeem-msg" style="min-height:18px;margin-top:10px;font-size:0.82rem;font-weight:600;text-align:center;line-height:1.45;"></div>';this.showPopup('🎟 Redeem a Code',h);setTimeout(()=>{const i=document.getElementById('redeem-input');if(i)i.focus();},40);},
redeemCode(){const el=document.getElementById('redeem-input'),msg=document.getElementById('redeem-msg');if(!msg)return;const code=this._normCode(el&&el.value);if(!code){msg.style.color='var(--text2)';msg.textContent='Enter a code first.';return;}const def=this.REDEEM_CODES[code];if(!def){msg.style.color='var(--red)';msg.textContent='✕ That code isn’t valid.';return;}const done=this._redeemedCodes();if(done.includes(code)){msg.style.color='var(--gold)';msg.textContent='Already redeemed — '+def.label+' is unlocked.';return;}try{def.apply();}catch(e){}done.push(code);try{localStorage.setItem('ep_codes',JSON.stringify(done));}catch(e){}msg.style.color='var(--accent)';msg.innerHTML='✓ '+def.msg;if(el){el.value='';el.disabled=true;}this.renderMainMenu();},
// ---- Company name (set when forming the LLC; shown on the dashboard + leaderboard; groundwork for player-vs-player) ----
_esc(s){return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));},
promptCompanyName(isNew){const cur=(this.state&&this.state.company_name)||'';
const h='<div style="font-size:0.82rem;color:var(--text2);line-height:1.5;margin-bottom:10px;">'+(isNew?'Your LLC is officially filed — congratulations. What\'s the company called? This name represents you on the leaderboard.':'Rename your company.')+'</div><input id="company-input" class="name-input" placeholder="e.g. Summit Ventures LLC" maxlength="28" autocomplete="off" value="'+this._esc(cur)+'" onkeydown="if(event.key===\'Enter\')Game.saveCompanyName()"><button class="btn-primary" style="margin-top:4px;" onclick="Game.saveCompanyName()">'+(isNew?'Name My Company':'Save')+'</button>';
this.showPopup('🏢 Name Your Company',h);setTimeout(()=>{const i=document.getElementById('company-input');if(i){i.focus();if(i.select)i.select();}},40);},
saveCompanyName(){const el=document.getElementById('company-input');const name=((el&&el.value)||'').replace(/\s+/g,' ').trim().slice(0,28);if(this.state)this.state.company_name=name;this.hidePopup();this._renderCompanyName();if(name&&this.autoSave)this.autoSave();},
// Company line above the month label: a name (tap to rename) once set, a "name your company" nudge once you have an entity, nothing before that.
_renderCompanyName(){const el=document.getElementById('month-label');if(!el)return;const s=this.state||{},cn=s.company_name||'',role='Month '+this.month+' — '+this.getFounderRole();
const hasEntity=['llc','s_corp','c_corp','multi_entity'].includes(s.entity_structure)||(s._completed_actions||[]).includes('form_llc');
const chip=cn?'<span onclick="Game.promptCompanyName(false)" style="display:block;font-size:0.7rem;color:var(--gold);font-weight:700;cursor:pointer;letter-spacing:0.3px;" title="Tap to rename your company">🏢 '+this._esc(cn)+'</span>':(hasEntity?'<span onclick="Game.promptCompanyName(false)" style="display:block;font-size:0.66rem;color:var(--text2);font-weight:600;cursor:pointer;opacity:0.85;" title="Name your company">🏢 + Name your company</span>':'');
el.innerHTML=chip+role;},
// ---- Main menu (real-game style: New Game → profile select, conditional Continue/Load/NG+, update icon) ----
renderMainMenu(){const mm=document.getElementById('main-menu');if(!mm)return;const auto=this.loadAutoSave(),saves=this.loadSaves(),ngp=this.isNgPlusUnlocked();
const item=(icon,label,sub,onclick,gold)=>'<div class="menu-item'+(gold?' gold':'')+'" onclick="'+onclick+'"><span class="mi-icon">'+icon+'</span><span class="mi-body"><span class="mi-label">'+label+'</span>'+(sub?'<span class="mi-sub">'+sub+'</span>':'')+'</span><span class="mi-chev">›</span></div>';
let h=item('▶','New Game','Choose your founder profile','Game.showProfileSelect()',true);
if(ngp)h+=item('🔁','New Game+','Sandbox — customize your start','Game.showNewGamePlus()');
if(auto&&auto.month<=36)h+=item('↩','Continue','Month '+auto.month+' · '+this._archLabel(auto.archetype),'Game.confirmResumeAuto()');
if(saves&&saves.length)h+=item('💾','Load Game',saves.length+' saved run'+(saves.length>1?'s':''),'Game.showLoadGame()');
h+=item('🏆','Leaderboard','See the top runs','Game.showLeaderboard(\'title\')');
h+=item('🎟','Redeem Code','Unlock content with a code','Game.showRedeem()');
h+=item('📋','What\'s New','v'+this._curVersion(),'Game.showWhatsNew()');
mm.innerHTML=h;},
showMainMenu(){this.showScreen('title-screen');const mm=document.getElementById('main-menu');if(mm)mm.style.display='';['profile-select','resume-list','whats-new'].forEach(id=>{const e=document.getElementById(id);if(e)e.style.display='none';});this.renderMainMenu();this._renderUpdateIcon();window.scrollTo(0,0);},
showProfileSelect(){const mm=document.getElementById('main-menu');if(mm)mm.style.display='none';const ps=document.getElementById('profile-select');if(ps)ps.style.display='';this.renderArchetypes();window.scrollTo(0,0);},
showLoadGame(){const mm=document.getElementById('main-menu');if(mm)mm.style.display='none';const rl=document.getElementById('resume-list');if(rl)rl.style.display='';this.renderSaves();window.scrollTo(0,0);},
showWhatsNew(){let h='<div style="max-height:55vh;overflow:auto;">';for(const e of PATCH_NOTES){h+='<div style="margin-bottom:11px;"><div style="font-weight:700;color:var(--gold);font-size:0.8rem;">v'+e.v+' · '+e.d+'</div>'+e.n.map(x=>'<div style="font-size:0.78rem;color:var(--text2);margin:3px 0;line-height:1.45;">• '+x+'</div>').join('')+'</div>';}h+='</div>';this.showPopup('📋 What\'s New',h);},
_renderUpdateIcon(){const el=document.getElementById('update-icon');if(!el)return;const av=this._updateAvailable;el.innerHTML='<span onclick="Game._applyUpdate()" title="'+(av?'New version available — tap to update':'Up to date — tap to check for updates')+'" style="cursor:pointer;font-size:0.72rem;'+(av?'color:var(--gold);font-weight:700;':'color:var(--text2);opacity:0.55;')+'">⟳'+(av?' Update available':'')+'</span>';},
// Update detection: version.json (bumped each release) is fetched cache-busted, so even a cached/old game.js learns a newer build is live and offers a one-tap refresh. (version.json must be bumped on every deploy alongside PATCH_NOTES.)
_checkForUpdate(){try{fetch('version.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():null).then(j=>{if(j&&j.v&&this._verLt(this._curVersion(),j.v)){this._updateAvailable=true;this._showUpdateBanner(j.v);this._renderUpdateIcon();}}).catch(()=>{});}catch(e){}},
_showUpdateBanner(v){if(document.getElementById('ep-update-banner'))return;const b=document.createElement('div');b.id='ep-update-banner';b.style.cssText='position:fixed;left:0;right:0;bottom:0;z-index:99999;background:linear-gradient(135deg,#f0b429,#b8932f);color:#1a1205;padding:11px 14px;display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:0.82rem;font-weight:700;box-shadow:0 -3px 14px rgba(0,0,0,0.45);';b.innerHTML='<span>🔄 A new version (v'+v+') is available.</span><button onclick="Game._applyUpdate()" style="background:#1a1205;color:#f0b429;border:none;border-radius:999px;padding:7px 16px;font-weight:700;cursor:pointer;white-space:nowrap;">Update now</button>';document.body.appendChild(b);},
_applyUpdate(){try{location.reload();}catch(e){location.href=location.pathname+'?u='+Date.now();}},
_ngpFmt(id,val){val=+val;if(id==='ngp-score'||id==='ngp-energy'||id==='ngp-neg')return Math.round(val);return this.fmtMoney(Math.round(val));},
_ngPlusCardHtml(){if(!this.isNgPlusUnlocked())return '';return '<div style="max-width:420px;margin:0 auto 14px;text-align:left;"><div onclick="Game.showNewGamePlus()" style="cursor:pointer;background:linear-gradient(135deg,rgba(212,175,55,0.15),rgba(59,130,246,0.1));border:1px solid var(--gold);border-radius:var(--radius-sm);padding:12px 14px;"><div style="font-size:0.86rem;font-weight:700;color:var(--gold);">🔁 New Game+ <span style="font-size:0.58rem;background:var(--gold);color:#1a1205;border-radius:999px;padding:1px 7px;vertical-align:middle;">UNLOCKED</span></div><div style="font-size:0.72rem;color:var(--text2);margin-top:3px;line-height:1.45;">Customize your starting position — cash, credit, business, even a head start with Epic Life. Sandbox mode (unranked), no tutorial.</div><div style="margin-top:8px;text-align:right;font-size:0.74rem;color:var(--gold);font-weight:700;">Customize &amp; Start →</div></div></div>';},
showNewGamePlus(){
const sl=(label,id,min,max,val,step,hint)=>'<div style="margin:9px 0;"><div style="display:flex;justify-content:space-between;font-size:0.76rem;"><span style="color:var(--text2);">'+label+'</span><span id="'+id+'-v" style="font-weight:700;color:var(--gold);">'+this._ngpFmt(id,val)+'</span></div><input id="'+id+'" type="range" min="'+min+'" max="'+max+'" value="'+val+'" step="'+step+'" style="width:100%;accent-color:var(--gold);" oninput="document.getElementById(\''+id+'-v\').textContent=Game._ngpFmt(this.id,this.value);Game._ngpUpdateScore()">'+(hint?'<div style="font-size:0.62rem;color:var(--text2);opacity:0.7;">'+hint+'</div>':'')+'</div>';
const sel=(label,id,opts,def)=>'<div style="margin:9px 0;"><div style="font-size:0.76rem;color:var(--text2);margin-bottom:3px;">'+label+'</div><select id="'+id+'" onchange="Game._ngpUpdateScore()" style="width:100%;padding:7px;background:var(--surface);color:var(--text);border:1px solid var(--border);border-radius:var(--radius-sm);">'+opts.map(o=>'<option value="'+o[0]+'"'+(def!=null&&String(o[0])===String(def)?' selected':'')+'>'+o[1]+'</option>').join('')+'</select></div>';
const chk=(id,label,hint)=>'<label style="display:flex;align-items:flex-start;gap:8px;margin:7px 0;cursor:pointer;"><input id="'+id+'" type="checkbox" style="margin-top:2px;accent-color:var(--gold);"><span><span style="font-size:0.8rem;font-weight:600;">'+label+'</span>'+(hint?'<br><span style="font-size:0.66rem;color:var(--text2);">'+hint+'</span>':'')+'</span></label>';
const hdr=t=>'<div style="font-size:0.7rem;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:0.6px;margin:14px 0 4px;border-top:1px solid var(--border);padding-top:10px;">'+t+'</div>';
let h='<div style="font-size:0.78rem;color:var(--text2);line-height:1.5;margin-bottom:6px;">Build your own starting hand. <strong>Sandbox mode — unranked</strong>, and no tutorial. Go wild or set a personal challenge.</div>';
h+=hdr('Starting position');
h+=sl('💵 Starting cash','ngp-cash',0,150000,10000,1000)+sl('🏠 Living expenses / mo','ngp-living',1500,12000,3200,100)+sl('⚡ Starting energy','ngp-energy',30,100,80,5);
h+=sel('🏢 Business at start','ngp-stage',[['zero','From zero — no revenue yet'],['small','Small existing — ~$8k/mo, 20 customers'],['established','Established — ~$40k/mo, 100 customers, small team']]);
h+=sel('📑 Entity structure','ngp-entity',[['none','None (sole prop)'],['llc','LLC'],['s_corp','S-Corp']]);
h+=hdr('Credit profile — like your own 3B report');
h+='<div style="background:rgba(212,175,55,0.1);border:1px solid var(--gold);border-radius:var(--radius-sm);padding:9px 11px;margin:4px 0 4px;display:flex;justify-content:space-between;align-items:center;"><span style="font-size:0.74rem;color:var(--text2);">Estimated myFICO 3B</span><span id="ngp-score-est" style="font-size:1.15rem;font-weight:800;color:var(--gold);">—</span></div>';
h+='<div style="font-size:0.64rem;color:var(--text2);opacity:0.75;margin-bottom:2px;">You don\'t pick the score — it\'s computed from these, exactly like the bureaus do.</div>';
h+=sl('💳 Available credit (limit)','ngp-credit',0,60000,6000,1000)+sl('🏦 Revolving balance owed','ngp-debt',0,60000,4000,1000,'balance vs limit = your utilization')+sl('⚠ Derogatory marks','ngp-neg',0,6,0,1,'collections / late payments');
h+=sel('📅 Credit history','ngp-history',[['0.3','Weak — thin or young file'],['0.55','Average'],['0.85','Strong — long, clean history']],'0.55');
h+=sel('🔍 Hard inquiries','ngp-inq',[['0','None'],['3','Under 5'],['6','5 or more — hurts approval']],'0');
h+=hdr('Head-start perks');
h+=chk('ngp-epic','⭐ Start with Epic Life membership','Your concierge runs the financial playbook from day one.')+chk('ngp-cfo','💰 Start with a fractional CFO','Better credit capacity + auto financial housekeeping.')+chk('ngp-bizcredit','🏢 Business credit already established','$20k business line + a built D&B profile.')+chk('ngp-policy','🛡 Funded cash-value policy','Start with $15k of policy cash value building.')+chk('ngp-banking','🤝 Banking relationship in place','Your banker already trusts you.');
h+='<button class="btn-primary" style="margin-top:14px;background:linear-gradient(135deg,var(--gold),#b8932f);color:#1a1205;font-weight:700;" onclick="Game.startNgPlus()">🔁 Start New Game+ →</button>';
this.showPopup('🔁 New Game+ — Customize Your Start',h);setTimeout(()=>this._ngpUpdateScore(),30);},
// Live myFICO estimate for the customizer: utilization (from balance vs limit) + derogatories + history + inquiries → score, recomputed on every change.
_ngpUpdateScore(){const el=document.getElementById('ngp-score-est');if(!el)return;const g=id=>{const e=document.getElementById(id);return e?+e.value:0;};const debt=g('ngp-debt'),avail=g('ngp-credit'),neg=g('ngp-neg'),hist=g('ngp-history')||0.55,inq=g('ngp-inq'),lim=debt+avail,util=lim>0?Math.round(debt/lim*100):0;el.textContent=this._estimateScore(util,neg,hist,inq)+'  ·  '+util+'% util';},
startNgPlus(){const v=id=>{const e=document.getElementById(id);return e?e.value:null;},num=id=>Math.round(+v(id)||0),chk=id=>{const e=document.getElementById(id);return !!(e&&e.checked);};
const base=CONFIG.starting_positions.positions.find(x=>x.id==='new');const p=JSON.parse(JSON.stringify(base));p.id='ngplus';p.label='New Game+';p.difficulty=null;const is=p.initial_state;
is.cash=num('ngp-cash');is.available_credit=num('ngp-credit');is.total_debt=num('ngp-debt');is.debt_breakdown=num('ngp-debt')>0?{credit_card:num('ngp-debt')}:{};is.personal_guarantee_exposure=num('ngp-debt');is.living_expenses=num('ngp-living');is.energy=num('ngp-energy');
// Credit profile → state factors, and the starting score COMPUTED from them (not picked), matching calcFicoTarget.
const _neg=num('ngp-neg'),_hist=+v('ngp-history')||0.55,_inq=num('ngp-inq'),_lim=(is.total_debt||0)+(is.available_credit||0),_util=_lim>0?Math.round((is.total_debt||0)/_lim*100):0;
is.credit_negatives=_neg;is._credit_history_base=_hist;is.credit_inquiries=_inq;is.personal_credit_score=this._estimateScore(_util,_neg,_hist,_inq);
const stage=v('ngp-stage');if(stage==='small'){is.monthly_revenue=8000;is.customer_base=20;is.brand_equity=20;is.revenue_capacity=12000;is.leads=25;is.cogs=1500;is.operating_expenses=3000;is.churn_rate=0.05;}else if(stage==='established'){is.monthly_revenue=40000;is.customer_base=100;is.brand_equity=50;is.revenue_capacity=60000;is.leads=120;is.cogs=12000;is.operating_expenses=14000;is.team_size=3;is.churn_rate=0.06;is.systems_maturity=25;}
const ent=v('ngp-entity');if(ent&&ent!=='none')is.entity_structure=ent;
this.selectArchetype(p,true);const s=this.state;s._tutorial_seen=true;s._ngplus=true;
if(chk('ngp-epic')){s._epic_life=true;s._epic_plan='monthly';s.operating_expenses=(s.operating_expenses||0)+300;}
if(chk('ngp-cfo')){s._cfo_hired=true;if(!s._completed_actions.includes('hire_fractional_cfo'))s._completed_actions.push('hire_fractional_cfo');}
if(chk('ngp-bizcredit')){s.business_credit_profile='established';s.business_credit_limit=Math.max(s.business_credit_limit||0,20000);s._dnb_profile=true;s._dnb_tradelines=4;if(!s._completed_actions.includes('build_dnb_profile'))s._completed_actions.push('build_dnb_profile');}
if(chk('ngp-policy')){s.insurance_cash_value=15000;s._auto_fund_insurance=true;if(!s._completed_actions.includes('fund_accumulation_policy'))s._completed_actions.push('fund_accumulation_policy');}
if(chk('ngp-banking')){s._banker_state='trusted';if(!s._completed_actions.includes('banking_relationship'))s._completed_actions.push('banking_relationship');}
this.hidePopup();this.showScreen('game-screen');this.startGame();},
showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById(id).classList.add('active');window.scrollTo(0,0);},
showPopup(t,b){document.getElementById('popup-title').innerHTML=t;document.getElementById('popup-body').innerHTML=b;document.getElementById('popup-container').style.display='block';this._lockScroll();},
hidePopup(){document.getElementById('popup-container').style.display='none';const dflt=document.querySelector('#popup-container .popup-box > button.btn-secondary');if(dflt)dflt.style.display='';this._onConfirmYes=null;this._unlockScroll();},
// In-game styled confirm (replaces native window.confirm so warnings match the game's look). Renders body + Cancel/confirm buttons into the popup; hides the default "Got it".
_confirm(title,body,yesLabel,onYes){this._onConfirmYes=onYes;document.getElementById('popup-title').innerHTML=title;document.getElementById('popup-body').innerHTML=body+'<div style="display:flex;gap:8px;margin-top:14px;"><button class="btn-secondary" style="flex:1;margin-top:0;" onclick="Game.hidePopup()">Cancel</button><button class="btn-primary" style="flex:1;margin-top:0;" onclick="Game._confirmYes()">'+yesLabel+'</button></div>';const dflt=document.querySelector('#popup-container .popup-box > button.btn-secondary');if(dflt)dflt.style.display='none';document.getElementById('popup-container').style.display='block';this._lockScroll();},
_confirmYes(){const cb=this._onConfirmYes;this._onConfirmYes=null;this.hidePopup();if(cb)cb();},
// Lock background scroll while a popup is open (iOS-safe: pin the body and restore scroll position on close).
_lockScroll(){if(this._scrollLocked)return;this._scrollLocked=true;this._scrollY=window.scrollY||window.pageYOffset||0;const b=document.body;b.style.position='fixed';b.style.top=(-this._scrollY)+'px';b.style.left='0';b.style.right='0';b.style.width='100%';b.style.overflow='hidden';},
_unlockScroll(){if(!this._scrollLocked)return;this._scrollLocked=false;const b=document.body;b.style.position='';b.style.top='';b.style.left='';b.style.right='';b.style.width='';b.style.overflow='';window.scrollTo(0,this._scrollY||0);},
TUTORIAL_STEPS:[
{sel:null,title:'Welcome to Entrepreneur Paradise',body:'You\'ve got <strong>36 months</strong> to turn a stuck situation into real wealth — and you can <strong>cash out</strong> at the end of Year 1, 2, or 3 to lock in your score. The endgame isn\'t a giant business; it\'s <strong>passive, tax-free income</strong> that pays for the life you want. Let\'s play your first month together.'},
{sel:'#stats-dashboard',title:'Your dashboard',body:'This is your whole picture — <strong>you</strong> on the left, your <strong>business</strong> on the right (locked until you form an LLC). Tap any stat anytime for a plain-English breakdown.'},
{sel:'#dash-cash',title:'Cash is oxygen',body:function(){return '<strong>'+this.fmtMoney(this.isSeparated()?(this.state.personal_cash||0):(this.state.cash||0))+'</strong> in the bank. It funds everything until the business pays for itself — <strong>don\'t let it hit zero</strong>.';}},
{sel:'#dash-debt',title:'Your debt',body:function(){const d=Math.max(0,(this.state.total_debt||0)-(this.state.business_credit_used||0)-(this.state.business_installment_debt||0)-(this.state.real_estate_debt||0))+(this.state.insurance_loan_balance||0);return 'About <strong>'+this.fmtMoney(d)+'</strong> in credit-card debt. Turning bad debt into good credit is a core part of the game.';}},
{sel:'#dash-cashflow',title:'Your burn — the clock',body:function(){const sep=this.isSeparated();const dsvc=this.calcDebtInterest()+this.calcDebtPrincipal();const exp=(this.state.living_expenses||0)+(this.state.lifestyle_expenses||0)+(sep?0:dsvc);return 'You spend ~<strong>'+this.fmtMoney(exp)+'/mo</strong> on living costs and debt payments. Your cash drops by this every month until revenue covers it — that\'s the clock you\'re racing.';}},
{sel:'#dash-energy',title:'Your energy',body:'Most moves cost <strong>energy</strong>, and it refills slowly. You can\'t do everything at once — that\'s why you get just <strong>three moves a month</strong>.'},
{sel:null,title:'How you make money — the funnel',body:'<div style="text-align:center;margin-bottom:10px;font-size:0.95rem;"><span style="color:var(--accent);font-weight:700;">🎯 Leads</span> <span style="color:var(--text2);">→</span> <span style="color:var(--blue);font-weight:700;">👥 Customers</span> <span style="color:var(--text2);">→</span> <span style="color:var(--gold);font-weight:700;">💰 Revenue</span></div><div style="font-size:0.84rem;line-height:1.55;color:var(--text2);margin-bottom:8px;">Each month, a share of your <strong>leads</strong> convert into paying <strong>customers</strong> — and customers × what they pay = <strong>revenue</strong>. Marketing has three jobs, and you rotate between them:</div><div style="font-size:0.82rem;line-height:1.5;"><div style="margin:4px 0;"><strong style="color:var(--accent);">🎯 Get Leads</strong> — fill the top of the pipeline.</div><div style="margin:4px 0;"><strong style="color:var(--blue);">🤝 Build Trust</strong> — a stronger brand converts more leads <em>and</em> raises what each customer pays.</div><div style="margin:4px 0;"><strong style="color:var(--gold);">💰 Close the Sale</strong> — turn leads into customers and lift your close rate.</div></div><div style="font-size:0.78rem;color:var(--gold);margin-top:9px;">Leads go cold if you don\'t convert them — so keep all three turning.</div>'},
{sel:'#action-list',cat:'marketing',title:'Move 1 — Get Leads',body:'Let\'s fill the top of your funnel. <strong>Tap the highlighted Marketing move.</strong>',wait:'select',waitHint:'Tap the highlighted action'},
{cat:'marketing',explain:true,title:'Why this move?',body:'<strong>Cold Outreach</strong> — calls and DMs — is the cheapest way to fill your pipeline when you\'re starting out. These leads will convert into customers over the coming months as you build trust and close them.'},
{sel:'#action-list',cat:'operations',title:'Move 2 — Operations',body:'Operations delivers the work and builds the <strong>systems</strong> that let you grow without burning out. <strong>Tap the highlighted move.</strong>',wait:'select',waitHint:'Tap the highlighted action'},
{cat:'operations',explain:true,title:'Why this move?',body:'<strong>Learn the Craft</strong> is free and builds your <em>systems</em> — understand the work deeply before you hand it off to anyone else.'},
{sel:'#action-list',cat:'finance',title:'Move 3 — Finance',body:'Finance is where the real wealth is built — credit, leverage, and <strong>passive income</strong>. <strong>Tap the highlighted move.</strong>',wait:'select',waitHint:'Tap the highlighted action'},
{cat:'finance',explain:true,title:'Why this move?',body:'<strong>Form Your LLC</strong> shields your personal assets and <strong>unlocks the Business side</strong> of your dashboard — where your funnel comes to life.'},
{sel:'#confirm-actions-btn',title:'End your turn',body:function(){var b=document.getElementById('confirm-actions-btn');var t=(b&&b.textContent.trim())||'Confirm Actions';return 'All three moves are in. <strong>Tap "'+t+'"</strong> to play out the month and see what happens.';},wait:'endturn',waitHint:'__btn__'},
{sel:'#tut-result-card',_noBack:true,title:'Your results',body:'Your moves play out here. <strong>Tap any card</strong> to see the exact stat changes and a quick <strong>lesson</strong> behind each one.'},
{sel:'#month-cash-panel',title:'Your money this month',body:'Your monthly bottom line — accessible capital, <strong>runway</strong>, and how your cash, credit and debt moved. Watch the runway: if it hits zero, the run is over.'},
{sel:null,title:'That\'s the loop',body:'Every month: read your dashboard, make your three moves, end the turn, learn. Keep the <strong>funnel</strong> turning, build <strong>safeguards before</strong> trouble hits, and steer your profits toward <strong>passive, tax-free income</strong>. That\'s the path to paradise — now go build.'}
],
showTutorial(){this._tutStep=0;this._tutActive=true;this.renderTutorialStep();},
// During the tutorial, recommend one sensible first move per category (curated, not the raw value-maximizer — so it never points at the discount/“sell yourself” traps). Falls back to the first available non-hire action.
_tutRecPick(cat){const prefs={marketing:['cold_outreach','basic_social_content','paid_ads_test'],operations:['study_business_content','do_work_yourself','basic_quality_control'],finance:['establish_business','build_personal_credit','monthly_tax_reserve']}[cat]||[];
const ok=id=>{const a=this.getAvailableActions(cat).find(x=>x.id===id);return a&&!this.isActionLocked(a)&&!this.isActionCompleted(a);};
for(const id of prefs)if(ok(id))return id;
const any=this.getAvailableActions(cat).find(a=>!this.isActionLocked(a)&&!this.isActionCompleted(a)&&!/^(hire_|promote_)/.test(a.id));return any?any.id:null;},
renderTutorialStep(){
const steps=this.TUTORIAL_STEPS,i=this._tutStep,step=steps[i];
if(!step){return this.endTutorial();}
let ov=document.getElementById('tut-overlay');
if(!ov){ov=document.createElement('div');ov.id='tut-overlay';ov.innerHTML='<div id="tut-hole"></div><div id="tut-hit"></div><div id="tut-tip"></div>';document.body.appendChild(ov);
ov.addEventListener('touchmove',function(e){if(e.target.id==='tut-overlay'||e.target.id==='tut-hole')e.preventDefault();},{passive:false});}
const hole=document.getElementById('tut-hole'),tip=document.getElementById('tut-tip'),hit=document.getElementById('tut-hit');
// The overlay is fully modal: it blocks all taps and scrolling. Only the spotlighted area (via an invisible click-proxy) and the tip's buttons are interactive.
ov.style.pointerEvents='auto';ov.style.touchAction='none';tip.style.pointerEvents='auto';
const dots=steps.map((s,k)=>'<span class="tut-dot'+(k===i?' on':'')+'"></span>').join('');
const nextLabel=i===steps.length-1?'Got it':'Next';
let hintBase=step.waitHint||'';
if(hintBase==='__btn__'){var _cb=document.getElementById('confirm-actions-btn');hintBase='Tap "'+((_cb&&_cb.textContent.trim())||'Confirm Actions')+'"';}
// A "select" step whose move is already chosen (e.g. you tapped Back onto it) is treated as done — show Next instead of asking you to re-tap (re-tapping would deselect it).
const selDone=step.wait==='select'&&step.cat&&!!this.selectedActions[step.cat];
const effWait=selDone?null:step.wait;
// Back is available except on the very first step and after the month has resolved (you can't un-resolve a turn — result-phase steps carry _noBack).
const canBack=i>0&&!step._noBack;
const backBtn=canBack?'<button class="tut-back" onclick="Game.tutPrev()">← Back</button>':'';
const navRight=effWait?'<span class="tut-wait"><span id="tut-arrow">↓</span> '+hintBase+'</span>':'<button class="tut-next" onclick="Game.tutNext()">'+nextLabel+'</button>';
const bodyHtml=(typeof step.body==='function')?step.body.call(this):step.body;
tip.innerHTML='<div class="tut-count">Step '+(i+1)+' of '+steps.length+'</div><div class="tut-title">'+step.title+'</div><div class="tut-body">'+bodyHtml+'</div><div class="tut-nav"><button class="tut-skip" onclick="Game.endTutorial()">Skip tour</button><div class="tut-spacer"></div>'+backBtn+navRight+'</div><div class="tut-dots">'+dots+'</div>';
// The tutorial drives the category itself (auto-advance is paused during the tour) so each pick stays put for its explanation.
if(step.cat&&this.currentCategory!==step.cat){this.currentCategory=step.cat;this._showAllActions=false;this.renderStepIndicator();this.renderCategoryTabs();this.renderActions();}
let target=step.sel?document.querySelector(step.sel):null,hitAction=null;
// On "pick an action" steps, spotlight the single recommended action card; tapping it (the only tappable spot) selects that move.
if(effWait==='select'){const cat=this.currentCategory,recId=this._tutRecPick(cat);if(recId){const grp=(ADIR[cat]||[]).find(g=>g[1].includes(recId));if(grp){this._openDir=this._openDir||{};this._openDir[cat]=grp[0];this.renderActions();}const card=document.querySelector('#action-list .action-card[onclick*="\''+recId+'\'"]');if(card){target=card;hitAction=()=>this.selectActionPayment(cat,recId);}}}
else if(step.explain||selDone){const card=document.querySelector('#action-list .action-card.selected');if(card)target=card;} // pause on the just-picked action (incl. when revisited via Back) — highlight it, no re-tap
else if(effWait==='endturn'){hitAction=()=>this.confirmActions();}
// Scroll the target into view ONCE, then re-place from the settled rect WITHOUT re-scrolling — re-scrolling on every pass is what made the box jump up and down on mobile. Extra late passes catch slow first-load layout (fonts/SVG) so "Month 1 — Operator" lines up.
const place=(doScroll)=>this._positionSpotlight(target,hitAction,doScroll);
setTimeout(()=>place(true),60);
setTimeout(()=>place(false),420);
setTimeout(()=>place(false),900);
},
// Shared spotlight placement: center the target, put the tip in whichever gap (below/above) has room so it never hides the highlight. Used by the tutorial and the one-off unlock tips.
_positionSpotlight(target,hitAction,doScroll){const hole=document.getElementById('tut-hole'),tip=document.getElementById('tut-tip'),hit=document.getElementById('tut-hit'),arrow=document.getElementById('tut-arrow');if(!hole||!tip)return;
tip.style.left='50%';tip.style.transform='translateX(-50%)';
const th=tip.offsetHeight,gap=12,vh=window.innerHeight,pad=8;
if(target){
if(doScroll!==false&&target.scrollIntoView)target.scrollIntoView({block:'center'});
const r=target.getBoundingClientRect();
hole.style.display='block';hole.classList.add('pulse');
hole.style.top=(r.top-pad)+'px';hole.style.left=(r.left-pad)+'px';hole.style.width=(r.width+pad*2)+'px';hole.style.height=(r.height+pad*2)+'px';
if(hitAction){hit.style.display='block';hit.style.top=(r.top-pad)+'px';hit.style.left=(r.left-pad)+'px';hit.style.width=(r.width+pad*2)+'px';hit.style.height=(r.height+pad*2)+'px';hit.onclick=hitAction;}
else{hit.style.display='none';hit.onclick=null;}
const below=vh-(r.bottom+pad),above=(r.top-pad);let top;
if(below>=th+gap)top=r.bottom+pad+gap;else if(above>=th+gap)top=r.top-pad-gap-th;else top=Math.max(8,vh-th-8);
top=Math.max(8,top);
tip.style.top=top+'px';
// Point the hint arrow at the highlight: ↑ when the tip sits below the target, ↓ when above.
if(arrow)arrow.textContent=(top>r.top)?'↑':'↓';
}else{hole.style.display='none';hole.classList.remove('pulse');if(hit){hit.style.display='none';hit.onclick=null;}tip.style.top=Math.max(10,(vh-th)/2)+'px';}},
// A one-off spotlight (used by feature-unlock tips): highlights an element and shows a "Got it" card. Reuses the tutorial overlay.
_spotlightTip(sel,title,body){let ov=document.getElementById('tut-overlay');
if(!ov){ov=document.createElement('div');ov.id='tut-overlay';ov.innerHTML='<div id="tut-hole"></div><div id="tut-hit"></div><div id="tut-tip"></div>';document.body.appendChild(ov);ov.addEventListener('touchmove',function(e){if(e.target.id==='tut-overlay'||e.target.id==='tut-hole')e.preventDefault();},{passive:false});}
const tip=document.getElementById('tut-tip');ov.style.pointerEvents='auto';ov.style.touchAction='none';tip.style.pointerEvents='auto';
tip.innerHTML='<div class="tut-title">'+title+'</div><div class="tut-body">'+body+'</div><div class="tut-nav"><div class="tut-spacer"></div><button class="tut-next" onclick="Game._closeSpotlight()">Got it</button></div>';
const target=sel?document.querySelector(sel):null;setTimeout(()=>this._positionSpotlight(target,null),60);setTimeout(()=>this._positionSpotlight(target,null),380);},
_closeSpotlight(){const ov=document.getElementById('tut-overlay');if(ov)ov.remove();this._seq=null;
// After the business-panel walkthrough ends, name the company (month 2+, business unlocked, not yet named).
if(this._nameAfterBizTip){this._nameAfterBizTip=false;if(this.month>=2&&this.isSeparated()&&!(this.state&&this.state.company_name)){setTimeout(()=>{if(document.getElementById('popup-container').style.display!=='block')this.promptCompanyName(true);},350);}}},
// A short multi-step guided spotlight (e.g. the business-unlock walk: financials first, then Leads/Customers/Staff). Steps: [{sel,t,b}].
_spotlightSeq(steps,idx){this._seq=steps;this._seqIdx=idx||0;this._renderSeqStep();},
_seqNext(){if(!this._seq)return;this._seqIdx++;if(this._seqIdx>=this._seq.length)return this._closeSpotlight();this._renderSeqStep();},
_renderSeqStep(){const step=this._seq[this._seqIdx];if(!step)return this._closeSpotlight();
let ov=document.getElementById('tut-overlay');
if(!ov){ov=document.createElement('div');ov.id='tut-overlay';ov.innerHTML='<div id="tut-hole"></div><div id="tut-hit"></div><div id="tut-tip"></div>';document.body.appendChild(ov);ov.addEventListener('touchmove',function(e){if(e.target.id==='tut-overlay'||e.target.id==='tut-hole')e.preventDefault();},{passive:false});}
const tip=document.getElementById('tut-tip');ov.style.pointerEvents='auto';ov.style.touchAction='none';tip.style.pointerEvents='auto';
const last=this._seqIdx===this._seq.length-1,dots=this._seq.map((s,k)=>'<span class="tut-dot'+(k===this._seqIdx?' on':'')+'"></span>').join('');
tip.innerHTML='<div class="tut-count">Step '+(this._seqIdx+1)+' of '+this._seq.length+'</div><div class="tut-title">'+step.t+'</div><div class="tut-body">'+step.b+'</div><div class="tut-nav"><button class="tut-skip" onclick="Game._closeSpotlight()">Skip</button><div class="tut-spacer"></div><button class="tut-next" onclick="Game._seqNext()">'+(last?'Got it':'Next →')+'</button></div><div class="tut-dots">'+dots+'</div>';
const target=step.sel?document.querySelector(step.sel):null;setTimeout(()=>this._positionSpotlight(target,null,true),60);setTimeout(()=>this._positionSpotlight(target,null,false),420);setTimeout(()=>this._positionSpotlight(target,null,false),900);},
tutNext(){this._tutStep++;this.renderTutorialStep();},
tutPrev(){if(this._tutStep>0){this._tutStep--;this.renderTutorialStep();}},
endTutorial(){this._tutActive=false;this._tutFinalPending=false;if(this.state)this.state._tutorial_seen=true;this.autoSave();/* mark done + persist, so it won't replay on refresh */const ov=document.getElementById('tut-overlay');if(ov)ov.remove();/* the tutorial ended scrolled down on the result panel — return the player to the top so they can read/scroll the results on their own */setTimeout(()=>window.scrollTo({top:0,behavior:'smooth'}),60);},
// Interactive tutorial: the player's real game actions drive the walkthrough forward.
_tutNotify(kind){if(!this._tutActive)return;const step=this.TUTORIAL_STEPS[this._tutStep];if(!step||step.wait!==kind)return;
if(kind==='endturn'){this._tutFinalPending=true;const ov=document.getElementById('tut-overlay');if(ov)ov.remove();return;}
this.tutNext();},
// After a selection auto-switches the active tab/re-renders, keep the spotlight aligned.
_tutReposition(){if(this._tutActive&&document.getElementById('tut-overlay'))this.renderTutorialStep();},
showGlossary(t){this.showPopup(t,'<div style="color:var(--text);line-height:1.7;">'+(this.GLOSSARY[t]||'No definition available.')+'</div>');},
term(w,d){return'<span class="term-link" onclick="Game.showGlossary(\''+w.replace(/'/g,"\\'")+'\')\">'+(d||w)+'</span>';},
linkTerms(t){const terms=Object.keys(this.GLOSSARY).sort((a,b)=>b.length-a.length);for(const w of terms)t=t.replace(new RegExp('\\b'+w.replace(/[-\/\\^$*+?.()|[\]{}]/g,'\\$&')+'\\b','g'),'<span class="term-link" onclick="Game.showGlossary(\''+w.replace(/'/g,"\\'")+'\')">'+w+'</span>');return t;},
getStage(c){return this.state._stages[c]||'foundation';},
updateStages(){const th=CONFIG.stage_thresholds.thresholds;for(const c of CATS){if(this.state._stages[c]==='foundation'&&this.meetsReq(th[c].foundation_to_leverage))this.state._stages[c]='leverage';if(this.state._stages[c]==='leverage'&&this.meetsReq(th[c].leverage_to_wealth))this.state._stages[c]='wealth';}},
meetsReq(r){if(!r||Object.keys(r).length===0)return true;for(const[k,v]of Object.entries(r)){if(k==='needs'){for(const id of v)if(!(this.state._completed_actions||[]).includes(id))return false;continue;}if(k==='cash_gte'){const ba=Math.max(0,(this.state.business_credit_limit||0)-(this.state.business_credit_used||0));if((this.state.cash||0)+(this.state.available_credit||0)+ba<v)return false;continue;}if(k==='liquid_cash_gte'){if(((this.state.cash||0)+(this.state.personal_cash||0))<v)return false;continue;}if(k==='net_worth_gte'){if(this.calcNetWorth()<v)return false;continue;}if(k.endsWith('_gte')&&(this.state[k.replace('_gte','')]||0)<v)return false;if(k.endsWith('_lte')&&(this.state[k.replace('_lte','')]||0)>v)return false;if(k.endsWith('_in')&&!v.includes(this.state[k.replace('_in','')]))return false;if(k.endsWith('_not')&&this.state[k.replace('_not','')]===v)return false;if((k==='entity_structure'||k==='business_credit_profile')&&this.state[k]!==v)return false;}return true;},
canAfford(a){const bizAvail=Math.max(0,(this.state.business_credit_limit||0)-(this.state.business_credit_used||0));const totalFunds=(this.state.cash||0)+(this.state.available_credit||0)+bizAvail;const cc=this.actionCashCost(a);if(cc&&totalFunds<cc)return false;const ec=this.actionEnergyCost(a);if(ec>0&&(this.state.energy||0)-ec<-40)return false;/* low/negative energy no longer blocks — you can push into burnout — unless it would breach the -40 floor */return true;},
getAvailableActions(cat){let pool;if(cat==='marketing')pool=CONFIG.actions_marketing.actions;else if(cat==='operations')pool=CONFIG.actions_operations.actions;else if(cat==='finance')pool=CONFIG.actions_finance.actions;
else if(cat==='lifestyle'){const s=this.state,subs={health:s.lifestyle_health||0,relationships:s.lifestyle_relationships||0,experiences:s.lifestyle_experiences||0,spiritual:s.lifestyle_spiritual||0,philanthropy:s.lifestyle_philanthropy||0,legacy:s.lifestyle_legacy||0};
// Affordability counts credit (like business actions), so you can always finance a recovery action — even an expensive one — when you need it.
const all=CONFIG.lifestyle_options.actions.filter(a=>!this.isActionCompleted(a)&&this.canAfford(a));
const energyOf=a=>(a.effects&&a.effects.energy>0)?a.effects.energy:(a.energy_cost<0?-a.energy_cost:0);
const CAP=10;
// Running low on energy → surface the strongest energy-restoring options first so recovery is always within reach.
if((s.energy||0)<=30)return[...all].sort((a,b)=>energyOf(b)-energyOf(a)).slice(0,CAP);
// Balanced spread: pick the two cheapest options from EACH area (weakest dimensions first) so basics like sleep, gym, meditation stay reachable, then fill the rest with the cheapest remaining.
const byCat={};all.forEach(a=>{(byCat[a.subcategory]=byCat[a.subcategory]||[]).push(a);});
const cats=Object.keys(subs).filter(c=>byCat[c]&&byCat[c].length).sort((x,y)=>subs[x]-subs[y]);
const reps=[];cats.forEach(c=>{const cheapest=byCat[c].slice().sort((a,b)=>(a.cash_cost||0)-(b.cash_cost||0))[0];if(cheapest)reps.push(cheapest);});
const repIds=new Set(reps.map(a=>a.id));
const rest=all.filter(a=>!repIds.has(a.id)).sort((a,b)=>(a.cash_cost||0)-(b.cash_cost||0));
return[...reps,...rest].slice(0,CAP);}
const stages=['foundation','leverage','wealth'],idx=stages.indexOf(this.getStage(cat));const drA=cat==='finance'?pool.find(a=>a.id==='debt_restructure'):null,restructAvail=drA&&stages.indexOf(drA.stage)<=idx&&this.meetsReq(drA.prerequisites||{})&&this.canAfford(drA),HIDE_AFTER=['bank_personal_loan','business_credit_line'];return pool.filter(a=>{if(a.enabled===false)return false;/* curated-off actions (lean test set) — hidden from the menu but kept in config, reversible */if(stages.indexOf(a.stage)>idx)return false;if(restructAvail&&HIDE_AFTER.includes(a.id))return false;return true;});},
isActionCompleted(a){return a.one_time&&this.state._completed_actions.includes(a.id);},
isActionLocked(a){const forceOpen=(a.id==='restructure_team'&&this.state._toxic_closer);/* a toxic closer must be fireable even with a small team */return this._epicHandled(a)||this._epicOnlyLocked(a)||this.isActionCompleted(a)||(!forceOpen&&!this.meetsReq(a.prerequisites||{}))||!this.canAfford(a);},

// Risk-priced, by debt type: unsecured personal revolving (credit cards) is brutal (~18–26% APR by score), term/business debt is risk-based (good credit = cheaper money), real estate is cheap secured debt, policy/private-bank loans are near-free.
calcDebtInterest(){const s=this.state,score=s.personal_credit_score||600,cfo=s._cfo_hired?0.9:1;
const persRev=Math.max(0,(s.total_debt||0)-(s._installment_debt||0)-(s.business_credit_used||0)-(s.business_installment_debt||0)-(s.real_estate_debt||0));
const termBiz=(s._installment_debt||0)+(s.business_installment_debt||0)+(s.business_credit_used||0);
const re=s.real_estate_debt||0,pb=s.private_bank_loan||0;
const riskMult=score>=760?0.7:score>=700?0.85:score>=640?1:score>=600?1.3:1.6;/* better credit = cheaper money */
// Variable-rate debt floats with the Fed/base rate the macro cycle sets (s._market_rate, ~4.5% expansion → ~7%+ in a tight downturn), plus any persistent rate-hike premium. So when the Fed raises rates (boom/downturn, or a rate-hike event), the player's monthly debt service actually climbs — and falls when rates ease.
const baseRate=(s._market_rate!=null?s._market_rate:0.05)+(s._rate_premium||0),rateAdj=baseRate-0.05;/* delta from the ~5% neutral base the numbers were tuned around */
const cardRate=Math.max(0.012,0.0183+rateAdj/12)*(score>=720?0.85:score>=640?1:1.2);/* ~18–26% APR cards, floating with the base rate */
const termRate=(0.05+baseRate)/12;/* business term loans & credit lines: ~5% lender margin over the base rate */
return Math.round(persRev*cardRate)+Math.round(termBiz*termRate*riskMult*cfo)+Math.round(re*0.005)+Math.round(pb*0.000833);},
calcDebtPrincipal(){const s=this.state,bizDebt=(s.total_debt||0)-(s.real_estate_debt||0);return Math.round(bizDebt*0.01)+Math.round((s.real_estate_debt||0)*0.005);},
calcMonthlyBurn(){const s=this.state;return(s.operating_expenses||0)+(s.owner_pay||0)+(s.living_expenses||0)+(s.lifestyle_expenses||0)+this.calcDebtInterest()+this.calcDebtPrincipal();},
// Total net worth: all assets (cash, investments, real-estate equity, policy cash value, retained business equity, private-bank balance) minus all debt.
calcNetWorth(st){const s=st||this.state;const cash=(s.cash||0)+(s.personal_cash||0),inv=s.investment_positions||0,re=s.real_estate_equity||0,cv=s.insurance_cash_value||0,cap=Math.max(0,s.capital_account||0),pbb=s.private_bank_balance||0,debt=(s.total_debt||0)+(s.insurance_loan_balance||0)+(s.private_bank_loan||0);return cash+inv+re+cv+cap+pbb-debt;},
// VELOCITY BANKING ENGINE (shared) — apply a "chunk": a lump payment swept at your debt. The edge: parking income on a simple-interest line saves the interest you'd otherwise pay, and that saving knocks EXTRA principal off (~12% acceleration). Routes to the MORTGAGE (paying it down builds equity dollar-for-dollar and shaves years) when you run a HELOC against owned property, otherwise to REVOLVING debt (frees the limit → lower utilization → score). Caps the contribution at your cash and the target balance so it can never overdraw or overpay. Reused by both the month-end auto-sweep and the dashboard "Chunk extra now" button so they behave identically.
_velocityApply(amount){const s=this.state;const heloc=s._velocity_vehicle==='heloc'&&(s.real_estate_debt||0)>0;const target=heloc?'mortgage':'revolving';
 const persRev=Math.max(0,(s.total_debt||0)-(s._installment_debt||0)-(s.business_credit_used||0)-(s.business_installment_debt||0)-(s.real_estate_debt||0));
 const targetBal=target==='mortgage'?(s.real_estate_debt||0):(s.total_debt||0)-(s.real_estate_debt||0);
 amount=Math.max(0,Math.min(Math.round(amount),Math.floor(Math.max(0,s.cash||0)),Math.ceil(targetBal/1.12)));/* contribution capped so chunk + ~12% accel never overshoots the balance */
 if(amount<=0||targetBal<=0)return{total:0,accel:0,target,equity:0};
 const accel=Math.min(Math.max(0,targetBal-amount),Math.round(amount*0.12));s.cash=(s.cash||0)-amount;let equityBuilt=0;
 if(target==='mortgage'){const pay=Math.min((s.real_estate_debt||0),amount+accel);s.real_estate_debt=Math.max(0,(s.real_estate_debt||0)-pay);s.total_debt=Math.max(0,(s.total_debt||0)-pay);s.real_estate_equity=(s.real_estate_equity||0)+pay;equityBuilt=pay;}
 else{let pay=amount+accel;s.total_debt=Math.max(0,(s.total_debt||0)-pay);const rv=Math.min(pay,persRev);if(rv>0){s.available_credit=(s.available_credit||0)+rv;pay-=rv;}const bz=Math.min(pay,s.business_credit_used||0);if(bz>0){s.business_credit_used=Math.max(0,(s.business_credit_used||0)-bz);pay-=bz;}/* remainder hits installment — no revolving limit to free */}
 s._velocity_interest_saved=(s._velocity_interest_saved||0)+accel;s._velocity_total_chunked=(s._velocity_total_chunked||0)+amount;if(equityBuilt)s._velocity_equity_built=(s._velocity_equity_built||0)+equityBuilt;
 s.personal_credit_score=Math.min(850,(s.personal_credit_score||0)+(this.calcPersUtil()<30?2:1));
 return{total:amount+accel,accel,target,equity:equityBuilt};},
// Live readout for the velocity panel/popup: which debt is being attacked, payoff ETA at the normal amortization pace vs with the recent velocity chunk, and lifetime interest saved / equity built.
_velocityReadout(){const s=this.state;const heloc=s._velocity_vehicle==='heloc'&&(s.real_estate_debt||0)>0;const target=heloc?'mortgage':'revolving';
 const targetBal=target==='mortgage'?(s.real_estate_debt||0):Math.max(0,(s.total_debt||0)-(s.real_estate_debt||0));
 const modeKey=s._velocity_mode||'balanced';
 const modeLabel={conservative:'Conservative',balanced:'Balanced',aggressive:'Aggressive'}[modeKey]||'Balanced';
 const targetLabel=target==='mortgage'?'Mortgage':'Revolving debt';const vehicleLabel=heloc?'HELOC (home equity)':'credit line';
 const normalPay=target==='mortgage'?Math.max(1,Math.round(targetBal*0.005)):Math.max(1,Math.round(targetBal*0.01));
 const chunk=s._velocity_chunk||0,withVel=normalPay+chunk;
 const etaBase=targetBal>0?Math.ceil(targetBal/normalPay):0,etaVel=targetBal>0&&withVel>0?Math.ceil(targetBal/withVel):0;
 const fmtMo=m=>m<=0?'—':m>=24?(Math.round(m/12*10)/10)+' yrs':m+' mo';
 return{heloc,target,targetBal,modeKey,modeLabel,targetLabel,vehicleLabel,interestSaved:s._velocity_interest_saved||0,equityBuilt:s._velocity_equity_built||0,totalChunked:s._velocity_total_chunked||0,etaBaseText:fmtMo(etaBase),etaVelText:fmtMo(etaVel)};},
// The Velocity Banking control panel — reached from the Finance action card (turn-on consumes the finance move) OR the ⚡ dashboard chip (ongoing tuning & manual chunks are free, no turn).
openVelocityControl(){const s=this.state;
 if(!s._epic_life){this.showPopup('👑 Velocity Banking — Epic Life perk','<div style="font-size:0.82rem;color:var(--text2);line-height:1.55;">Velocity banking is an <strong>Epic Life membership</strong> play. Your concierge sets up the line, and you get the ⚡ control to sweep surplus cash at your debt — paying a mortgage or revolving balance down years faster and building equity quicker.</div><div style="font-size:0.78rem;color:var(--text2);line-height:1.5;margin-top:10px;">Join Epic Life from the Finance menu to unlock it (along with the rest of the concierge wealth engine).</div>');return;}
 const active=!!s._velocity_active;
 const reDebt=(s.real_estate_debt||0),reEq=(s.real_estate_equity||0),hasRE=reDebt>0&&reEq>0;
 const lineCap=(s.available_credit||0)+Math.max(0,(s.business_credit_limit||0)-(s.business_credit_used||0)),revDebt=Math.max(0,(s.total_debt||0)-reDebt),hasLine=lineCap>0||revDebt>0;
 if(!s._velocity_vehicle)s._velocity_vehicle=hasRE?'heloc':'line';if(!s._velocity_mode)s._velocity_mode='balanced';if(s._velocity_vehicle==='heloc'&&!hasRE)s._velocity_vehicle='line';
 const cash=Math.max(0,Math.floor(s.cash||0));
 let h='<div style="font-size:0.78rem;color:var(--text2);line-height:1.5;margin-bottom:10px;">Park your income on a line of credit and <strong>sweep every surplus dollar at your debt</strong>. The interest you\'d have paid is redirected to principal (~12% acceleration), so the balance falls years faster — and on a mortgage, that paid-down principal becomes <strong>equity</strong>.</div>';
 const vBtn=(key,label,sub,enabled)=>{const on=s._velocity_vehicle===key;return '<div '+(enabled?'onclick="Game.velSetVehicle(\''+key+'\')" style="cursor:pointer;':'style="opacity:0.45;')+'flex:1;border:1px solid '+(on?'var(--accent)':'var(--border)')+';background:'+(on&&enabled?'rgba(34,197,94,0.12)':'var(--surface)')+';border-radius:6px;padding:8px;text-align:center;"><div style="font-size:0.74rem;font-weight:700;color:'+(on&&enabled?'var(--accent)':'var(--text)')+';">'+label+'</div><div style="font-size:0.56rem;color:var(--text2);margin-top:2px;line-height:1.3;">'+sub+'</div></div>';};
 h+='<div style="font-size:0.58rem;color:var(--text2);text-transform:uppercase;letter-spacing:0.6px;margin-bottom:4px;">Vehicle</div><div style="display:flex;gap:8px;margin-bottom:12px;">'+vBtn('heloc','🏠 HELOC',hasRE?'Home equity → attack the mortgage':'Buy a rental first',hasRE)+vBtn('line','💳 Credit line',hasLine?'A line → attack revolving debt':'Open a line first',hasLine)+'</div>';
 const mBtn=(key,label,sub)=>{const on=(s._velocity_mode||'balanced')===key;return '<div onclick="Game.velSetMode(\''+key+'\')" style="cursor:pointer;flex:1;border:1px solid '+(on?'var(--gold)':'var(--border)')+';background:'+(on?'rgba(245,200,66,0.12)':'var(--surface)')+';border-radius:6px;padding:7px 4px;text-align:center;"><div style="font-size:0.7rem;font-weight:700;color:'+(on?'var(--gold)':'var(--text)')+';">'+label+'</div><div style="font-size:0.54rem;color:var(--text2);margin-top:2px;">'+sub+'</div></div>';};
 h+='<div style="font-size:0.58rem;color:var(--text2);text-transform:uppercase;letter-spacing:0.6px;margin-bottom:4px;">Aggressiveness — surplus swept each month</div><div style="display:flex;gap:6px;margin-bottom:12px;">'+mBtn('conservative','Conservative','50%')+mBtn('balanced','Balanced','75%')+mBtn('aggressive','Aggressive','100%')+'</div>';
 if(active){const vd=this._velocityReadout();
  h+='<div style="border-top:1px solid var(--border);margin:10px 0;padding-top:8px;">';
  h+='<div class="breakdown-row"><span>Attacking</span><span>'+vd.targetLabel+' · '+this.fmtMoney(vd.targetBal)+'</span></div>';
  h+='<div class="breakdown-row"><span>Payoff — normal</span><span style="color:var(--text2)">'+vd.etaBaseText+'</span></div>';
  h+='<div class="breakdown-row"><span>Payoff — with velocity</span><span style="color:var(--accent)">'+vd.etaVelText+'</span></div>';
  h+='<div class="breakdown-row"><span>Interest saved to date</span><span style="color:var(--accent)">'+this.fmtMoney(vd.interestSaved)+'</span></div>';
  if(vd.equityBuilt>0)h+='<div class="breakdown-row"><span>Extra equity built</span><span style="color:var(--accent)">'+this.fmtMoney(vd.equityBuilt)+'</span></div>';
  h+='</div>';
  h+='<div style="font-size:0.58rem;color:var(--text2);text-transform:uppercase;letter-spacing:0.6px;margin:4px 0;">Chunk extra now — from your '+this.fmtMoney(cash)+' cash · no turn</div>';
  if(cash>0){const presets=[2000,5000,10000].filter(a=>a<=cash);const cBtn=(amt,lbl)=>'<button onclick="Game.velChunk('+amt+')" style="flex:1;background:var(--accent);color:#04210f;border:none;border-radius:6px;padding:8px;font-weight:700;font-size:0.72rem;cursor:pointer;">'+lbl+'</button>';let chunks='';presets.forEach(a=>chunks+=cBtn(a,'💥 '+this.fmtMoney(a)));chunks+=cBtn(cash,'💥 Max');h+='<div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap;">'+chunks+'</div>';}
  else h+='<div style="font-size:0.72rem;color:var(--text2);margin-bottom:10px;">No spare cash to chunk right now — build surplus first.</div>';
  h+='<button onclick="Game.velPause()" style="width:100%;background:var(--surface);color:var(--text2);border:1px solid var(--border);border-radius:6px;padding:8px;font-size:0.74rem;cursor:pointer;">⏸ Pause velocity banking</button>';
 } else {const canOn=(s._velocity_vehicle==='heloc'&&hasRE)||(s._velocity_vehicle==='line'&&hasLine);
  h+=canOn?'<button onclick="Game.velTurnOn()" style="width:100%;background:var(--accent);color:#04210f;border:none;border-radius:6px;padding:11px;font-weight:700;font-size:0.82rem;cursor:pointer;">⚡ Turn on Velocity Banking</button><div style="font-size:0.58rem;color:var(--text2);text-align:center;margin-top:6px;">Uses this month\'s finance move to set up the line. Tuning &amp; extra chunks after that are free.</div>':'<div style="font-size:0.74rem;color:var(--gold);text-align:center;padding:8px;line-height:1.5;">You need a line to run your cash flow through. Open a business/personal credit line, or buy a rental property to borrow against, then come back.</div>';}
 this.showPopup('⚡ Velocity Banking',h);},
velSetVehicle(v){const s=this.state;const hasRE=(s.real_estate_debt||0)>0&&(s.real_estate_equity||0)>0;if(v==='heloc'&&!hasRE)return;s._velocity_vehicle=v;this.openVelocityControl();if(s._velocity_active)this._refreshDashboards();},
velSetMode(m){this.state._velocity_mode=m;this.openVelocityControl();if(this.state._velocity_active)this._refreshDashboards();},
velChunk(amt){const s=this.state;if(!s._velocity_active)return;const res=this._velocityApply(amt);if(res.total>0)s._velocity_chunk=(s._velocity_chunk||0)+res.total;this._refreshDashboards();this.openVelocityControl();},
velPause(){this.state._velocity_active=false;this.hidePopup();this._refreshDashboards();this.showPopup('⚡ Velocity Banking paused','Velocity banking is off. Your surplus stays in cash and your debt amortizes at the normal pace. Turn it back on anytime from the Finance menu → Debt &amp; Credit.');},
velTurnOn(){const s=this.state;const hasRE=(s.real_estate_debt||0)>0&&(s.real_estate_equity||0)>0;const lineCap=(s.available_credit||0)+Math.max(0,(s.business_credit_limit||0)-(s.business_credit_used||0)),revDebt=Math.max(0,(s.total_debt||0)-(s.real_estate_debt||0)),hasLine=lineCap>0||revDebt>0;if(s._velocity_vehicle==='heloc'&&!hasRE)s._velocity_vehicle='line';const canOn=(s._velocity_vehicle==='heloc'&&hasRE)||(s._velocity_vehicle==='line'&&hasLine);if(!canOn){this.openVelocityControl();return;}this.hidePopup();this.selectAction('finance','velocity_banking');},
// Progressive disclosure: hide advanced UI until it's relevant, so the early game isn't overwhelming. Reveals are STICKY (once shown, stay shown) and adapt to archetype (relevant state reveals early).
_reveal(f){const s=this.state;if(!s._revealed)s._revealed={};if(s._revealed[f])return true;const m=this.month,sep=this.isSeparated();let on=false;
switch(f){
case 'mastery': on=(this._activeCats||[]).includes('lifestyle')||m>=3; break; // Personal Mastery, life dimensions & Freedom — surface when Life becomes a thing
case 'networth': on=(sep||m>=4)&&this.calcNetWorth()>0; break; // save the Net Worth reveal/tip for a positive month — no celebrating a negative figure
case 'epic': on=(sep&&m>=4); break; // the advanced concierge — learn the basics first
case 'achievements': on=((s._milestones_achieved||[]).length>0)||m>=2; break;
default: on=true;}
if(on)s._revealed[f]=true;return on;},
// One-time contextual tip the first time a feature appears, so learning is spread across the run instead of dumped up front.
_maybeShowUnlockTip(){const s=this.state;if(this._tutActive)return;if(!s._tips_shown)s._tips_shown=[];
const _rec=this.calcEnergyRecovery();
const tips=[
{k:'toxic_closer',show:!!s._toxic_closer,sel:'#biz-ops',t:'⚠ Your Closer Is a Liability',b:'His fake guarantees are catching up: churn up, brand eroding, <strong>lawsuit risk rising</strong> every month — and he costs ~$9,000/mo. Fire him in <strong>⚙️ Operations</strong> → <strong>Restructure &amp; Downsize</strong> (red <strong>⚠ FIRE THE CLOSER</strong> tag). He\'ll threaten to sue, but the bleeding stops.'},
{k:'overstaffed',show:this._overstaffed(),sel:'#biz-ops',t:'⚠ Payroll Is Bleeding You',b:'Big team, but the business is <strong>burning cash</strong>. Fast fix: <strong>⚙️ Operations</strong> → <strong>Restructure &amp; Downsize</strong> (red <strong>⚠ CUT PAYROLL</strong> tag) cuts people and trims monthly payroll. Costs severance and dents morale, but it buys survival.'},
{k:'business',show:this.isSeparated(),sel:'#biz-col',seq:[
{sel:'#biz-money',t:'🔓 Business Unlocked — the Money',b:'Your business is now its own legal entity, with finances kept <strong>separate</strong> from your personal side. Read these first: <strong>revenue</strong>, <strong>cash</strong>, <strong>credit</strong>, monthly <strong>expenses</strong>, <strong>debt</strong>, and your <strong>net worth</strong>. This is the health of the engine — and it pays you a salary/draw into your personal account.'},
{sel:'#biz-ops',t:'Your funnel: Leads → Customers → Brand',b:'This is what drives the money. <strong>Leads</strong> come from Marketing and convert into paying <strong>Customers</strong>, and your <strong>Brand Equity</strong> is the lever that makes more of them convert — and pay more each. Remember Marketing\'s three jobs: <strong style="color:var(--accent);">Get Leads</strong> to fill the pipeline, <strong style="color:var(--blue);">Build Trust</strong> to grow your brand, and <strong style="color:var(--gold);">Close the Sale</strong>. Rotate between them — leads go cold if you don\'t convert them.'}
]},
{k:'life',show:(this._activeCats||[]).includes('lifestyle'),sel:'#life-btn',t:'⚡ Energy & 🏖️ Life',b:'Your moves cost <strong>energy</strong>, and it refills slowly — run low and they start failing (and you risk getting sick). The fix is the <strong>🏖️ Life</strong> icon: a Life action restores energy now and builds <strong>Personal Mastery</strong>, which speeds your recovery for good. Don\'t run on empty.'},
{k:'epic',show:this._reveal('epic'),sel:'#epic-btn',t:'⭐ Epic Life Membership',b:'A done-for-you wealth concierge is now available — this <strong>⭐</strong> icon. It\'s powerful and runs the financial playbook for you. If you\'re still learning, try finishing a run <em>without</em> it first.'},
{k:'networth',show:this._reveal('networth')&&this.calcNetWorth()>0,sel:'#dash-networth',t:'📈 Net Worth Is Now Tracked',b:'Your dashboard now shows <strong>Net Worth</strong> right here — everything you own minus everything you owe, with a month-over-month trend. This is the real scoreboard of the wealth you\'re building.'},
];
for(const tip of tips){if(tip.show&&s._tips_shown.indexOf(tip.k)<0){s._tips_shown.push(tip.k);if(tip.k==='business'&&!s.company_name)this._nameAfterBizTip=true;/* once the business-panel walkthrough closes, prompt for the company name */if(tip.seq){if(document.querySelector(tip.seq[0].sel))this._spotlightSeq(tip.seq,0);else this.showPopup(tip.seq[0].t,tip.seq[0].b);}else if(document.querySelector(tip.sel))this._spotlightTip(tip.sel,tip.t,tip.b);else this.showPopup(tip.t,tip.b);return;}}},
// C-suite compensation scales with the company. Fractional (part-time) is affordable; full-time A-players cost ~3-4x — only sustainable with strong margins + leverage. That gap is the "can't afford good people" ceiling.
calcExecFrac(){const r=this.state.monthly_revenue||0;return Math.round(Math.max(3500,Math.min(11000,3500+r*0.025)));},
calcExecFull(){const r=this.state.monthly_revenue||0;return Math.round(Math.max(12000,Math.min(48000,12000+r*0.07)));},
calcExecComp(){const s=this.state;const mgr=Math.round(Math.max(2500,Math.min(4500,2500+(s.monthly_revenue||0)*0.015)));let c=0;if(s._cro_hired)c+=mgr;if(s._coo_hired)c+=mgr;if(s._cfo_hired)c+=Math.round(mgr*0.6);return c;},
isSeparated(){return !['none','sole_prop',undefined,null,''].includes(this.state.entity_structure);},
_recordDraw(amt){this.state._owner_draws_total=(this.state._owner_draws_total||0)+amt;this.state.capital_account=(this.state.capital_account||0)-amt;},
// D&B (business credit) score — built from a real business identity (DUNS, phone, address, website/social), reporting vendor tradelines, and credit/loan history. Maxes ~100 only when ALL are in place and utilization is healthy.
calcBizCreditScore(){const s=this.state;const profKnown=s.business_credit_profile&&s.business_credit_profile!=='none';if(!profKnown&&!(s.business_credit_limit>0)&&!s._dnb_profile)return 0;
const prof=s.business_credit_profile==='established'?45:s.business_credit_profile==='building'?28:14;
const cred=s._dnb_profile?22:0;                              // DUNS + business phone + address + website/social presence
const lim=Math.min(18,(s.business_credit_limit||0)/2500);    // credit & loan history depth
const tradelines=Math.min(15,(s._dnb_tradelines||0)*3);      // vendor accounts reporting on-time payments
const util=this.calcBizUtil();const pen=util>50?Math.round((util-50)*0.4):0;
return Math.max(0,Math.min(100,Math.round(prof+cred+lim+tradelines-pen)));},
// Personal Mastery — the five dimensions of a life well-lived, built from your Life investments.
lifeDims(){const s=this.state,c=v=>Math.max(0,Math.min(100,Math.round(v)));return {Body:c((s.lifestyle_health||0)*0.75+(s.fitness_level||0)*0.25),Mind:c(s.lifestyle_legacy||0),Spirit:c(((s.lifestyle_spiritual||0)+(s.lifestyle_philanthropy||0))/2),Heart:c(s.lifestyle_relationships||0),Luxury:c(s.lifestyle_experiences||0)};},
LIFE_THEME:{health:'Body',relationships:'Heart',spiritual:'Spirit',philanthropy:'Spirit',experiences:'Luxury',legacy:'Mind'},
LIFE_ICON:{Body:'💪',Mind:'🧠',Spirit:'🕊️',Heart:'❤️',Luxury:'✨'},
calcPersonalMastery(){const d=this.lifeDims();return Math.round((d.Body+d.Mind+d.Spirit+d.Heart+d.Luxury)/5);},
// Energy recovery is driven by Personal Mastery — neglect your life and you recover slowly (firm but recoverable); invest in it and you run on a full tank.
calcEnergyRecovery(){const m=this.calcPersonalMastery();return Math.max(4,Math.round(6+m*0.10));},/* recovery ~6/mo early → ~16/mo at full mastery (rebalanced down — energy stays a real constraint) */
calcFreedom(){const s=this.state,c=id=>s._completed_actions&&s._completed_actions.includes(id);
// Low dependency still matters, but a real team/exec layer + governance is what actually frees the founder.
let f=(100-(s.key_person_dependency||100))*0.5
+Math.min(14,(s.team_size||0)*2)
+Math.min(14,(s.systems_maturity||0)/6)
+(c('middle_management')?6:0)+(c('hire_hr_manager')?6:0)+(c('full_systemization')?8:0)+(c('hire_fractional_cfo')?6:0)
+(s._cro_hired?8:0)+(s._coo_hired?12:0)+(s._cfo_hired?4:0)
+(s._board_active?16:0);
return Math.min(100,Math.max(0,Math.round(f)));},
calcBusinessLevel(){return Math.min(10,Math.max(1,(this.state.monthly_revenue||0)/5000));},
calcCreditCapacity(){const s=this.state;const credit=Math.max(0.3,Math.min(2.5,((s.personal_credit_score||600)-560)/120));const size=1+Math.min(3,(s.monthly_revenue||0)/20000);const prof=(s.business_credit_profile==='established')?1.25:1;const cfo=s._cfo_hired?1.15:1;const fund=this._perks().fundingReady?1.12:1;const bank=this._hasBanking()?1.18:1;/* a real banking relationship (deposits + history) gets you bigger lines */return Math.round(credit*size*prof*cfo*fund*bank*100)/100;},
// Funding levers beyond your personal file: a banking relationship (you bank/deposit there, so you're known) and a verified NAICS classification (the holding-company setup assigns the right code). Both gate how lenders see a BUSINESS applicant.
_hasBanking(){const s=this.state;return !!((s._completed_actions||[]).includes('banking_relationship')||['trusted','champion'].includes(s._banker_state));},
_naicsVerified(){const s=this.state;return !!(s._naics_ok||s._holding_company||['c_corp','multi_entity'].includes(s.entity_structure)||(s._completed_actions||[]).includes('wyoming_holding_llc')||(s._completed_actions||[]).includes('setup_family_office'));},
// Milestone perks — completing the foundational milestones grants permanent, mechanical boosts (so the C-suite/player actually values them, not just badges).
_perks(){const s=this.state,c=id=>(s._completed_actions||[]).includes(id);return {protected:c('combined_insurance')&&(c('asset_protection_stack')||c('asset_protection')),taxSmart:['s_corp','c_corp','multi_entity'].includes(s.entity_structure)&&c('advanced_tax_strategy'),fundingReady:c('debt_restructure')&&(s.credit_negatives||0)===0&&s.business_credit_profile==='established'};},
getFounderRole(){const f=this.calcFreedom();if(f>80)return'Chairman';if(f>60)return'CEO';if(f>40)return'Director';if(f>20)return'Manager';return'Operator';},
// Milestones already true at game start are marked (month 0) so they're not celebrated retroactively.
initMilestones(){const s=this.state;if(!s._milestones_achieved)s._milestones_achieved=[];const have=new Set(s._milestones_achieved.map(m=>m.id));for(const m of MILESTONES){if(have.has(m.id))continue;try{if(m.check(s,this))s._milestones_achieved.push({id:m.id,month:0});}catch(e){}}s._milestones_new=[];},
checkMilestones(){const s=this.state;if(!s._milestones_achieved)s._milestones_achieved=[];const have=new Set(s._milestones_achieved.map(m=>m.id));const newly=[];for(const m of MILESTONES){if(have.has(m.id))continue;try{if(m.check(s,this)){s._milestones_achieved.push({id:m.id,month:this.month});newly.push(m.id);}}catch(e){}}return newly;},
mentorMilestoneLine(){const s=this.state,recent=(s._milestones_achieved||[]).filter(m=>m.month>0&&m.month===this.month-1);if(!recent.length)return null;const m=MILES_BY_ID[recent[recent.length-1].id];if(!m)return null;return{name:'Marcus Webb — Mentor',line:'🏆 Milestone unlocked — <strong>'+m.title+'</strong>. '+m.mentor};},
scaleActionEffects(effects,cat){const s=this.state,scaled=JSON.parse(JSON.stringify(effects)),level=this.calcBusinessLevel(),skill=(s['skill_'+cat]||0),lvlF=Math.min(2.4,Math.max(1,1+(level-3)*0.22));for(const k in scaled){if(typeof scaled[k]!=='number')continue;if(k==='monthly_revenue'&&scaled[k]>0)scaled[k]=Math.round(scaled[k]*Math.min(2.5,level));if(k==='leads'&&scaled[k]>0)scaled[k]=Math.round(scaled[k]*(1+(s.brand_equity||0)/300+skill/300)*lvlF);if(k==='customer_base'&&scaled[k]>0)scaled[k]=Math.round(scaled[k]*(1+skill/400)*lvlF);if(k==='revenue_capacity')scaled[k]=Math.round(scaled[k]*Math.min(3,level));if(k==='operating_expenses'&&scaled[k]>0)scaled[k]=Math.round(scaled[k]*Math.min(2,level));}return scaled;},
// Diminishing returns on Life dimensions: a gain shrinks as that dimension fills, so cheap repeats give little and you're pushed toward variety + bigger investments. Energy/business effects are untouched.
_scaleLifestyleEffects(effects){const s=this.state,LK=['lifestyle_health','lifestyle_relationships','lifestyle_experiences','lifestyle_spiritual','lifestyle_philanthropy','lifestyle_legacy','fitness_level'],out=JSON.parse(JSON.stringify(effects));for(const k of LK){if(typeof out[k]==='number'&&out[k]>0){const cur=s[k]||0,f=Math.max(0.2,1-cur/140);out[k]=Math.max(1,Math.round(out[k]*f));}}
// Energy from a life action gives diminishing returns when you're already well-rested — so it's not a free top-up to 100 every quarter.
if(typeof out.energy==='number'&&out.energy>0){const e=s.energy||0;if(e>70)out.energy=Math.max(1,Math.round(out.energy*0.4));else if(e>50)out.energy=Math.max(1,Math.round(out.energy*0.7));}
return out;},
// Late-game cost scaling: repeatable marketing/ops actions cost more as the company grows, so they stay a real decision instead of pocket change (effects scale too, via scaleActionEffects).
// A second attempt after a partial costs half — you've already done most of the legwork, just need to finish the job.
isRetry(a){return !!(a&&this.state._partial_actions&&this.state._partial_actions[a.id]);},
actionCashCost(a){if(a.id==='debt_restructure')return a._epic?0:this._debtRestructureFee();/* min($2k, 10% success fee on the credit/loan qualified); free for Epic members */const base=a.cash_cost||0;if(!base)return 0;const retry=this.isRetry(a)?0.5:1;if(a.one_time||(a.category!=='marketing'&&a.category!=='operations'))return Math.round(base*retry);return Math.round(base*Math.min(5,Math.max(1,0.4+this.calcBusinessLevel()*0.6))*retry);},
actionEnergyCost(a){let e=a.energy_cost||0;if(e<=0)return e;if(this.isRetry(a))e*=0.5;
// Operational systems pay an energy DIVIDEND: documented SOPs, project management and automation mean your hands-on moves drain less energy as systems_maturity rises (up to ~40% off at full maturity). You spend energy building systems now to spend less on everything later.
const disc=Math.min(0.4,(this.state.systems_maturity||0)/250);e*=(1-disc);
return Math.max(1,Math.round(e));},
// Total energy your currently-picked moves will spend this turn (exec/team-run picks cost you none), vs what you have.
_turnEnergy(){let used=0;for(const[c,act]of Object.entries(this.selectedActions||{})){const execRun=(this._autoPicked&&this._autoPicked[c]===act.id)||(c==='finance'&&this._cfoPick===act.id);if(execRun)continue;if(c==='lifestyle'){const g=(act.effects&&act.effects.energy>0)?act.effects.energy:(act.energy_cost<0?-act.energy_cost:0);used-=g;/* a selected Life action RESTORES energy — net it against the turn's drain so the burnout warning is accurate */}else used+=Math.max(0,this.actionEnergyCost(act));}const have=Math.min(100,this.state.energy||0);return{used,have,left:Math.min(100,have-used)};},
scaleEventEffects(effects,skipCap){const scaled=JSON.parse(JSON.stringify(effects)),level=this.calcBusinessLevel(),s=this.state;for(const k in scaled){if(typeof scaled[k]!=='number')continue;if(k==='cash'||k==='monthly_revenue'||k==='investment_positions'||k==='real_estate_equity'||k==='other_monthly_revenue')scaled[k]=Math.round(scaled[k]*Math.min(6,level));else if(k==='operating_expenses'||k==='cogs')scaled[k]=Math.round(scaled[k]*Math.min(3,level));else if(k==='total_debt')scaled[k]=Math.round(scaled[k]*Math.min(3,level));else if(k==='customer_base')scaled[k]=Math.round(scaled[k]*Math.min(3,Math.max(1,(s.customer_base||1)/20)));}
// Early-game cushion: ramp down RANDOM negative shocks in months 1-9 (~30% at the start, fading to full strength by month 9) so early bad luck isn't fatal before you've built reserves. Opt-in opportunities (skipCap) are untouched.
if(!skipCap&&this.month<=9){const em=Math.min(1,0.7+0.033*(this.month-1));if(scaled.cash&&scaled.cash<0)scaled.cash=Math.round(scaled.cash*em);for(const k of['operating_expenses','cogs','total_debt'])if(scaled[k]>0)scaled[k]=Math.round(scaled[k]*em);}
// Never-fatal cap on RANDOM negative events: a single bad event's cash hit can't exceed ~60% of everything you could tap. Opt-in opportunities (real estate, etc.) are NOT capped — you chose to spend, and the credit/lose path handles funding.
if(!skipCap&&scaled.cash&&scaled.cash<0){const cushion=Math.round(((s.cash||0)+(s.personal_cash||0)+(s.available_credit||0)+Math.max(0,(s.business_credit_limit||0)-(s.business_credit_used||0)))*0.6);if(-scaled.cash>cushion)scaled.cash=-Math.max(cushion,1000);}
// "Fully Protected" milestone perk: insurance + asset protection soften a bad event's cash hit by ~20%.
if(scaled.cash&&scaled.cash<0&&this._perks().protected)scaled.cash=Math.round(scaled.cash*0.8);
return scaled;},

renderMonth(){
this._atCheckpoint=false;/* we're rendering a real month now — clear the checkpoint flag so saves record this month */
this._syncExecCompletions();/* heal any exec role filled via a failed roll so the menu doesn't re-offer it (covers older saves too) */
this.showScreen('game-screen');this.selectedActions={};this.currentCategory='marketing';this._showAllActions=false;this._isQuarterlyMonth=(this.month%3===0);if(this.state)this.state._velocity_chunk=0;/* reset the velocity readout each planning turn; manual chunks (this screen) + the month-end auto-sweep accumulate into it */this.updateStages();this._setupActionMenu();
this._renderCompanyName();
const hs=CATS.map(c=>this.getStage(c)).reduce((a,b)=>({foundation:0,leverage:1,wealth:2}[a]>={foundation:0,leverage:1,wealth:2}[b]?a:b));
const badge=document.getElementById('stage-badge');badge.textContent=hs;badge.style.background=hs==='wealth'?'var(--gold)':hs==='leverage'?'var(--blue)':'var(--accent2)';
const beat=CONFIG.narrative_beats.fixed_beats.find(b=>b.month===this.month&&(b.archetype===null||b.archetype===this.archetype.id));
const narEl=document.getElementById('month-narrative');
const _rip=this.state._pendingRipples||[];this.state._pendingRipples=[];
const ripHtml=_rip.length?_rip.map(r=>'<div style="border-left:3px solid var(--accent);padding-left:9px;margin-bottom:8px;"><strong style="color:var(--accent);font-size:0.86rem;">🌱 '+r.source+' paid off</strong><br><span style="color:var(--text2);">'+r.narrative+'</span></div>').join(''):'';
let _mainNar='';
if(beat)_mainNar='<strong>'+beat.title+'</strong><br><br>'+beat.narrative.replace(/\n/g,'<br>');
else if(this.month>1){const cl=CONFIG.narrative_beats.monthly_cliffhangers.filter(c=>this.meetsReq(c.requires));_mainNar=cl.length?cl[Math.floor(Math.random()*cl.length)].text:'';}
if(ripHtml||_mainNar){narEl.style.display='block';narEl.innerHTML=ripHtml+_mainNar;}else narEl.style.display='none';
const charEl=document.getElementById('character-line');charEl.style.display='none';
const cl2=this.mentorMilestoneLine()||this.getCharLine();
this._pendingCharLine=cl2?{name:cl2.name,line:cl2.line}:((beat&&beat.mentor_line)?{name:'Marcus Webb — Mentor',line:beat.mentor_line}:null);
this.renderStats();this.renderBars();this.renderStepIndicator();this.scanNewActions();this.renderCategoryTabs();this.renderActions();this.updateConfirmButton();
// New Game+ unlock: reaching a full year as the New Business Owner earns the sandbox start-customizer (persists across runs).
if(this.archetype&&this.archetype.id==='new'&&this.month>=12){try{localStorage.setItem('ep_ngplus','1');}catch(e){}}
if(this.month===1&&!this.state._tutorial_seen&&!this._tutActive){this.showTutorial();}/* _tutorial_seen is set only when the tour finishes (endTutorial) — so a refresh mid-tutorial resumes it instead of skipping it */
else this._maybeShowUnlockTip();
this.autoSave();/* save AFTER tips are marked shown, so a refresh+resume won't replay the same unlock tip */},
scanNewActions(){if(!this.state._actions_seen)this.state._actions_seen=[];if(!this.state._action_new_month)this.state._action_new_month={};for(const c of (this._activeCats||CATS).filter(x=>x!=='lifestyle')){this.getAvailableActions(c).forEach(a=>{if(!this.isActionCompleted(a)&&!this.isActionLocked(a)&&!this.state._actions_seen.includes(a.id)){this.state._actions_seen.push(a.id);this.state._action_new_month[a.id]=this.month;}});}},
categoryHasNew(c){if(c==='lifestyle'||!this.state._action_new_month)return false;return this.getAvailableActions(c).some(a=>!this.isActionCompleted(a)&&!this.isActionLocked(a)&&this.state._action_new_month[a.id]===this.month);},

getCharLine(){const ch=CONFIG.characters.characters;if(Math.random()>0.35)return null;if(this.state.energy<=30&&this.state._family_state!=='thriving'){const l=ch.family.lines[this.state._family_state]||[];if(l.length)return{name:'Family',line:l[Math.floor(Math.random()*l.length)]};}if(this.month%4===0){if(this.state._rival_state==='unknown'&&this.month>=3)this.state._rival_state='acquaintance';if(this.state._rival_state==='acquaintance'&&this.month>=8)this.state._rival_state='competitor';if(this.state._rival_state==='competitor'&&this.month>=24&&Math.random()>0.5)this.state._rival_state='fallen';if(this.state._rival_state==='competitor'&&this.month>=30)this.state._rival_state='respect';const l=ch.rival.lines[this.state._rival_state]||[];if(l.length)return{name:'Jordan Blake — Rival',line:l[Math.floor(Math.random()*l.length)]};}if(this.state._mentor_state!=='unavailable'){if(this.month>=6)this.state._mentor_state='advising';if(this.month>=18)this.state._mentor_state='trusted';const l=ch.mentor.lines[this.state._mentor_state]||[];if(l.length){let line=l[Math.floor(Math.random()*l.length)];const la=this.actionHistory.length>0?this.actionHistory[this.actionHistory.length-1]:null;if(la)line=line.replace('{last_action}',la.label||'made a move').replace('{assessment}',Math.random()>0.5?'the right call':'risky, but defensible');return{name:'Marcus Webb — Mentor',line};}}return null;},

renderStats(targetId){
const s=this.state,sep=this.isSeparated(),fmt=v=>this.fmtMoney(v);
const persUtil=this.calcPersUtil(),bizUtil=this.calcBizUtil();
const policyPassive=s._passive_income_active?Math.round((s.insurance_cash_value||0)*0.06/12):0;
const passiveInc=(s.other_monthly_revenue||0)+policyPassive+Math.round((s.private_bank_balance||0)*0.004);/* actual passive paid to cash each month (real estate, lending, PE, etc.) — matches the Income Sources breakdown */
const persCash=sep?(s.personal_cash||0):(s.cash||0);
const persLoan=Math.max(0,(s.total_debt||0)-(s.business_credit_used||0)-(s.business_installment_debt||0)-(s.real_estate_debt||0))+(s.insurance_loan_balance||0);
const debtSvc=this.calcDebtInterest()+this.calcDebtPrincipal();/* interest + principal; mechanically paid from s.cash each month (line in monthlyTick) — pre-LLC that's the player's only cash (personal), post-LLC it's business cash */
const persExp=(s.living_expenses||0)+(s.lifestyle_expenses||0)+(sep?0:debtSvc),persInc=(s.owner_pay||0)+passiveInc,persScore=Math.round(s.personal_credit_score),persAvail=s.available_credit||0;
const bizCash=s.cash||0,bizAvail=Math.max(0,(s.business_credit_limit||0)-(s.business_credit_used||0));
const bizLoan=(s.business_credit_used||0)+(s.business_installment_debt||0)+(s.real_estate_debt||0),bizExp=(s.operating_expenses||0)+(s.cogs||0)+(sep?debtSvc:0),bizScore=this.calcBizCreditScore();
const scoreCol=v=>v<620?'var(--red)':v<700?'var(--gold)':'var(--accent)',dbCol=v=>v<40?'var(--red)':v<70?'var(--gold)':'var(--accent)',cashCol=v=>v>5000?'var(--accent)':v<2000?'var(--red)':'var(--gold)';
const m=(v,col)=>'<span style="color:'+col+';">'+fmt(v)+'</span>';
const RICON={'Credit Score':'📊','Cash':'💵','Credit':'💳','Income/mo':'📈','Passive/mo':'👑','Expense/mo':'📉','Cash flow/mo':'💸','Debt':'🏦','Policy Value':'🛡️','Investments':'📊','Net Worth':'💎','D&B Score':'🏢','Revenue/mo':'📈','Owner Equity':'💼'};
const _vs=s._statsViewed||{};
const row=(label,valHtml,click,id,statKey)=>{const onclk=statKey?('Game.statInfo(\''+statKey+'\')'):click;const ic=!!onclk;const badge=ic?(statKey&&!_vs[statKey]?'<span class="info-btn info-new">i</span>':'<span class="info-btn">i</span>'):'';return '<div'+(id?' id="'+id+'"':'')+' style="display:flex;justify-content:space-between;align-items:baseline;gap:4px;padding:3px 1px;border-bottom:1px solid rgba(127,127,127,0.14);'+(ic?'cursor:pointer;':'')+'"'+(ic?' onclick="'+onclk+'"':'')+'><span style="font-size:0.6rem;color:var(--text2);white-space:nowrap;">'+(RICON[label]?'<span style="font-size:0.72rem;">'+RICON[label]+'</span> ':'')+label+(badge?' '+badge:'')+'</span><span style="font-size:0.8rem;font-weight:700;text-align:right;white-space:nowrap;">'+valHtml+'</span></div>';};
const colHead=(t,col)=>'<div style="font-size:0.66rem;font-weight:700;color:'+col+';text-transform:uppercase;letter-spacing:0.6px;text-align:center;padding-bottom:4px;margin-bottom:3px;border-bottom:2px solid '+col+';">'+t+'</div>';
const subLab=t=>'<div style="font-size:0.52rem;color:var(--text2);text-transform:uppercase;letter-spacing:0.9px;opacity:0.55;margin:8px 0 1px;text-align:center;">'+t+'</div>';
const netRow=(label,net,liquid,click,id,statKey)=>{const c=net>=0?'var(--accent)':'var(--red)';const v='<span style="color:'+c+'">'+(net>=0?'+':'&#8722;')+fmt(Math.abs(net))+'</span>';return row(label,v,click,id,statKey);};
const hlRow=(label,valHtml,bg,id,statKey)=>{const onclk=statKey?('Game.statInfo(\''+statKey+'\')'):null;const badge=statKey?(!(_vs[statKey])?'<span class="info-btn info-new">i</span>':'<span class="info-btn">i</span>'):'';return '<div'+(id?' id="'+id+'"':'')+' style="display:flex;justify-content:space-between;align-items:baseline;gap:4px;padding:3px 5px;margin:1px 0;border-radius:4px;background:'+bg+';'+(onclk?'cursor:pointer;':'')+'"'+(onclk?' onclick="'+onclk+'"':'')+'><span style="font-size:0.6rem;color:var(--text2);white-space:nowrap;">'+(RICON[label]?'<span style="font-size:0.72rem;">'+RICON[label]+'</span> ':'')+label+(statKey?' '+badge:'')+'</span><span style="font-size:0.8rem;font-weight:700;text-align:right;white-space:nowrap;">'+valHtml+'</span></div>';};
let P=colHead('Personal','var(--accent)');P+=subLab('Money');
P+=hlRow('Income/mo',m(persInc,persInc>0?'var(--accent)':'var(--text2)'),'rgba(34,197,94,0.12)',null,'p_income');
P+=hlRow('Expense/mo',m(persExp,'var(--gold)'),'rgba(239,68,68,0.12)',null,'p_expense');
P+=netRow('Cash flow/mo',persInc-persExp,persCash+persAvail,null,'dash-cashflow','p_flow');
P+=row('Credit Score','<span style="color:'+scoreCol(persScore)+'">'+persScore+'</span>',null,null,'p_score');
P+=row('Cash',m(persCash,cashCol(persCash)),null,'dash-cash','p_cash');
P+=row('Credit',m(persAvail,persAvail>0?'var(--accent)':'var(--text2)')+' <span style="font-size:0.58rem;color:var(--text2);font-weight:400;">'+persUtil+'%</span>',null,null,'p_credit');
P+=row('Debt',m(persLoan,persLoan>30000?'var(--red)':'var(--text)'),null,'dash-debt','p_debt');
if(passiveInc>0)P+=row('Passive/mo',m(passiveInc,'var(--gold)'),null,null,'p_passive');
if((s.insurance_cash_value||0)>0)P+=row('Policy Value',m(s.insurance_cash_value,'var(--accent)'),null,null,'p_policy');
if((s.investment_positions||0)>0)P+=row('Investments',m(s.investment_positions,'var(--accent)'),null,null,'p_invest');
const enReal=Math.min(100,s.energy||0),en=Math.max(0,enReal),mas=this.calcPersonalMastery(),fr=this.calcFreedom(),rec=this.calcEnergyRecovery();
const enC=enReal>60?'var(--accent)':enReal>30?'var(--gold)':'var(--red)',masC=mas>60?'var(--blue)':mas>30?'var(--gold)':'var(--red)',frC=fr>60?'var(--accent)':fr>30?'var(--gold)':'var(--red)';
const gauge=(label,v,col,sub,id,subBelow)=>'<div'+(id?' id="'+id+'"':'')+' style="padding:4px 1px 2px;"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:4px;"><span style="font-size:0.6rem;color:var(--text2);white-space:nowrap;">'+label+'</span><span style="font-size:0.75rem;font-weight:700;color:'+col+';white-space:nowrap;">'+Math.round(v)+((sub&&!subBelow)?' <span style="font-size:0.54rem;color:var(--text2);font-weight:400;">'+sub+'</span>':'')+'</span></div><div class="bar-track" style="height:4px;margin-top:3px;"><div class="bar-fill" style="width:'+Math.max(0,Math.min(100,v))+'%;background:'+col+'"></div></div>'+((sub&&subBelow)?'<div style="font-size:0.54rem;color:'+col+';font-weight:600;margin-top:3px;line-height:1.2;">'+sub+'</div>':'')+'</div>';
const cgauge=(label,val,fill,col)=>'<div style="padding:4px 1px 2px;"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:4px;"><span style="font-size:0.6rem;color:var(--text2);white-space:nowrap;">'+label+'</span><span style="font-size:0.75rem;font-weight:700;color:'+col+';white-space:nowrap;">'+val+'</span></div><div class="bar-track" style="height:4px;margin-top:3px;"><div class="bar-fill" style="width:'+Math.max(0,Math.min(100,fill))+'%;background:'+col+'"></div></div></div>';
const _d=this.lifeDims(),dCol=v=>v<30?'var(--red)':v<60?'var(--gold)':'var(--text2)',_dsub=Object.keys(_d).map(k=>'<span style="color:'+dCol(_d[k])+';white-space:nowrap;">'+this.LIFE_ICON[k]+_d[k]+'</span>').join(' ');
const enSub=enReal<0?'⚠ burnout · high illness risk':en<=30?'⚠ low · moves fail more & deliver less':en<=45?'⚠ +'+rec+'/mo · rest soon':'+'+rec+'/mo';
P+=subLab('Capacity')+gauge('⚡ Energy',enReal,enC,enSub,'dash-energy',enReal<=45);
if(this._reveal('mastery'))P+='<div onclick="Game.statInfo(\'p_mastery\')" style="cursor:pointer;">'+gauge('🧠 Personal Mastery',mas,masC,(_vs['p_mastery']?'ⓘ':'⚠ ⓘ'))+'</div><div style="font-size:0.6rem;text-align:center;margin:0 0 2px;display:flex;justify-content:space-between;gap:2px;">'+_dsub+'</div>'+gauge('🕊️ Freedom',fr,frC,this.getFounderRole());
let B=colHead('Business',sep?'var(--blue)':'var(--text2)');
if(sep){
B+='<div id="biz-money">'+subLab('Money');
B+=hlRow('Revenue/mo',m(s.monthly_revenue,'var(--accent)'),'rgba(34,197,94,0.12)',null,'b_revenue');
B+=hlRow('Expense/mo',m(bizExp,'var(--gold)'),'rgba(239,68,68,0.12)',null,'b_expense');
B+=netRow('Cash flow/mo',(s.monthly_revenue||0)-bizExp,bizCash+bizAvail,null,null,'b_flow');
B+=row('D&B Score','<span style="color:'+(bizScore?dbCol(bizScore):'var(--text2)')+'">'+(bizScore?bizScore+'/100':'—')+'</span>',null,null,'b_dnb');
B+=row('Cash',m(bizCash,cashCol(bizCash)));
B+=row('Credit',(s.business_credit_limit||0)>0?(m(bizAvail,bizAvail>0?'var(--accent)':'var(--text2)')+' <span style="font-size:0.58rem;color:var(--text2);font-weight:400;">'+bizUtil+'%</span>'):'<span style="color:var(--text2)">—</span>',null,null,'b_credit');
B+=row('Debt',m(bizLoan,bizLoan>50000?'var(--red)':'var(--text)'),null,null,'b_debt');
/* Net Worth (consolidated) lives on the business side, right below debt; once revealed it stays visible even if it dips negative (shown red). No swing shown. */
{const nwNow=this.calcNetWorth();const nwHtml='<span style="color:'+(nwNow>=0?'var(--accent)':'var(--red)')+'">'+fmt(nwNow)+'</span>';if(this._reveal('networth'))B+=row('Net Worth',nwHtml,null,'dash-networth','p_networth');}
const _cul=s.company_culture==null?45:s.company_culture,_culC=_cul>60?'var(--accent)':_cul>35?'var(--gold)':'var(--red)';
const _brand=Math.round(s.brand_equity||0),_brC=_brand>60?'var(--accent)':_brand>30?'var(--gold)':'var(--text2)';
// Funnel readout: Leads → Customers → Brand Equity (the lever that lifts conversion AND revenue per customer). Staff & Culture only appear once you've hired — they affect your delivery-capacity ceiling.
B+='</div><div id="biz-ops">'+subLab('Funnel')+cgauge('🎯 Leads',s.leads||0,Math.min(100,s.leads||0),'var(--accent)')+cgauge('👥 Customers',s.customer_base||0,Math.min(100,s.customer_base||0),'var(--accent)')+cgauge('✨ Brand Equity',_brand,_brand,_brC)+((s.team_size||0)>0?cgauge('👷 Staff',s.team_size||0,Math.min(100,(s.team_size||0)*10),'var(--accent)')+cgauge('🎭 Culture',Math.round(_cul),_cul,_culC):'')+'</div>';
}else{
B+='<div style="text-align:center;padding:16px 6px;color:var(--text2);"><div style="font-size:1.3rem;">🔒</div><div style="font-size:0.6rem;margin-top:6px;line-height:1.45;">Form an LLC to separate and unlock your business finances</div></div>';
}
const hasCfo=s._cfo_hired||(s._completed_actions||[]).includes('hire_fractional_cfo');const cfoBtn=hasCfo?'<div onclick="Game.showCfoReport()" style="cursor:pointer;text-align:center;background:var(--surface);border:1px solid var(--blue);border-radius:var(--radius-sm);padding:7px;margin-bottom:8px;font-size:0.76rem;font-weight:600;color:var(--blue);">📊 CFO Briefing — value, net worth, assets, runway & projections</div>':'';
const achBtn=this._reveal('achievements')?'<div onclick="Game.showAchievements()" style="cursor:pointer;text-align:center;background:var(--surface);border:1px solid var(--gold);border-radius:var(--radius-sm);padding:7px;margin-bottom:8px;font-size:0.76rem;font-weight:600;color:var(--gold);">🏆 Achievements — '+((s._milestones_achieved||[]).length)+'/'+MILESTONES.length+' milestones</div>':'';
const velBtn=s._velocity_active?(()=>{const vd=this._velocityReadout();return '<div onclick="Game.openVelocityControl()" style="cursor:pointer;text-align:center;background:var(--surface);border:1px solid var(--accent);border-radius:var(--radius-sm);padding:7px;margin-bottom:8px;font-size:0.74rem;font-weight:600;color:var(--accent);">⚡ Velocity · '+vd.modeLabel+' → '+vd.targetLabel+' · saved '+this.fmtMoney(vd.interestSaved)+' · tap to chunk / tune</div>';})():'';
const _dash=document.getElementById(targetId||'stats-dashboard');_dash.style.display='block';_dash.innerHTML=cfoBtn+achBtn+velBtn+'<div style="display:flex;align-items:stretch;gap:16px;"><div style="flex:1;min-width:0;">'+P+'</div><div style="width:1px;background:var(--border);"></div><div id="biz-col" style="flex:1;min-width:0;">'+B+'</div></div>';},

calcPersUtil(){const s=this.state,persRev=Math.max(0,(s.total_debt||0)-(s._installment_debt||0)-(s.business_credit_used||0)-(s.business_installment_debt||0)-(s.real_estate_debt||0)),persLim=persRev+(s.available_credit||0);return persLim>0?Math.round((persRev/persLim)*100):0;},/* exclude the real-estate mortgage — it's installment debt, not revolving credit-card utilization. Counting it spiked util to ~96% the moment you leveraged into RE, contradicting the paydown logic (which already excludes it). Now matches the canonical personal-revolving formula used everywhere else. */
calcBizUtil(){const s=this.state,bizUsed=s.business_credit_used||0,bizLim=s.business_credit_limit||0;return bizLim>0?Math.round((bizUsed/bizLim)*100):0;},
// Payment-history factor (the 35% pillar): real derogatories hit hardest on the FIRST mark, then the marginal damage tapers and floors out (a file with 6 collections isn't 6× worse than one). Diminishing curve from 1.0 → ~0.55. Their REAL bite is on approvals (see _creditApprovalChance), not bottomless score loss.
_payHistoryFactor(neg){neg=Math.max(0,neg||0);return 1-0.45*(1-Math.exp(-neg*0.55));},
// myFICO 3B-style target score: the five FICO factors at their real weights — payment history 35%, amounts owed / utilization 30%, length of history 15%, credit mix 10%, new credit 10%. The live personal_credit_score drifts toward this each month (monthlyTick), so utilization moves ~30% of the score, exactly like the real model.
calcFicoTarget(){const s=this.state,u=this.calcPersUtil(),neg=s.credit_negatives||0;
const fPay=this._payHistoryFactor(neg);/* payment history (35%): first derogatory hurts most, then caps */
const fUtil=u===0?0.9:u<=9?1:u<=29?0.8:u<=49?0.55:u<=74?0.3:0.1;/* amounts owed / utilization (30%): a hair of usage scores a touch better than literally 0% */
const fLen=Math.min(1,(s._credit_history_base!=null?s._credit_history_base:0.45)+(Math.min(this.month,48)/48)*0.55);/* length of history (15%): a starting baseline (weak↔strong, customizable in New Game+) that ages over the run */
const hasRev=((s.available_credit||0)>0)||u>0,hasInst=((s._installment_debt||0)>0)||((s.business_installment_debt||0)>0),hasBiz=(s.business_credit_limit||0)>0,types=(hasRev?1:0)+(hasInst?1:0)+(hasBiz?1:0);
const fMix=Math.min(1,0.55+0.15*types);/* credit mix (10%) */
const inq=s.credit_inquiries||0;const fNew=Math.max(0.3,(s._credit_repair?0.7:0.85)-Math.min(0.45,inq*0.06));/* new credit (10%): hard inquiries (and an open repair) cap the top — each inquiry shaves a little */
return Math.round(300+550*(0.35*fPay+0.30*fUtil+0.15*fLen+0.10*fMix+0.10*fNew));},
// Real-life credit underwriting for approval actions (lines, cards, term loans): personal utilization is the dominant gate — above 30% approval odds fall off a cliff — and the lender pulls your personal myFICO 3B even for BUSINESS credit (the owner personally guarantees it). Returns the chance of approval.
_creditApprovalChance(isLoan){const s=this.state,score=Math.round(s.personal_credit_score||600);
// The dominant gate differs by product: a term LOAN is underwritten on debt-to-income (can your cash flow service the payment?); a revolving CREDIT line/card is underwritten on UTILIZATION (how much of your existing limits are you already using?). They don't cross-contaminate — high utilization never sinks a loan, and high DTI never sinks a card.
let p;if(isLoan){const dti=this.calcDTI();p=dti<=36?0.92:dti<=43?0.6:dti<=55?0.35:dti<=70?0.18:0.08;}
else{const u=this.calcPersUtil();p=u<=30?0.92:u<=40?0.5:u<=50?0.3:u<=70?0.15:0.07;/* at/under 30% utilization is the healthy zone — the cliff is only ABOVE 30% */}
const inq=s.credit_inquiries||0,inqMult=inq>=5?0.5:inq>=2?0.85:1;/* a stack of recent hard inquiries reads as credit-hungry — 5+ roughly halves approval odds */
// Derogatories are an approval KILLER in real life — lenders decline on active collections/charge-offs almost regardless of the score. One mark stings; a few nearly shut you out. (Clearing them — credit repair / Epic — is the path back in.)
const neg=s.credit_negatives||0,negMult=neg<=0?1:neg===1?0.6:neg===2?0.4:neg===3?0.25:neg===4?0.15:0.08;
const fico=score>=760?1.1:score>=720?1:score>=680?0.9:score>=640?0.75:score>=600?0.5:0.3;
// Banking relationship → the lender already knows you (deposits + history) → easier yes. NAICS classification → a verified holding-company code reads as a legit business; an unverified/wrong code gets flagged and declined until fixed.
const bankMult=this._hasBanking()?1.12:1;const _hasEntity=['llc','s_corp','c_corp','multi_entity'].includes(s.entity_structure);const naicsMult=this._naicsVerified()?1.05:(_hasEntity?0.75:1);/* only a real business entity can carry a wrong NAICS code; no entity = personal loan, NAICS irrelevant */
return Math.max(0.03,Math.min(0.96,p*fico*inqMult*negMult*bankMult*naicsMult));},
// Debt restructure is a CONSOLIDATION — it moves your maxed personal balances onto a new business line, so high current utilization is the problem it CURES, not a reason to decline. A lender underwrites it on your income/DTI and credit health (score, derogatories, banking, entity), with an expert-assist uplift. So it's approvable exactly when you need it (high util) as long as your income can service it and your credit isn't wrecked.
_restructureApprovalChance(){return Math.min(0.92,this._creditApprovalChance(true)*1.35);},
// Lightweight myFICO estimate for the New Game+ customizer — same factor weights as calcFicoTarget, fed by the chosen utilization / derogatories / history / inquiries (no live state).
_estimateScore(util,neg,histBase,inq){const fPay=this._payHistoryFactor(neg),fUtil=util===0?0.9:util<=9?1:util<=29?0.8:util<=49?0.55:util<=74?0.3:0.1,fLen=Math.min(1,histBase),fMix=0.7,fNew=Math.max(0.3,0.85-Math.min(0.45,inq*0.06));return Math.round(300+550*(0.35*fPay+0.30*fUtil+0.15*fLen+0.10*fMix+0.10*fNew));},
// Debt-restructure fee: a lending expert charges a ~10% success fee on the credit + loan they qualify you for (~$17k × capacity here), capped at $2,000 — whichever is lower. Waived for Epic members (handled in-house).
_debtRestructureFee(){return Math.min(2000,Math.round(0.10*17000*this.calcCreditCapacity()));},
// What an outside professional would charge for a service the Epic concierge performs in-house — shown to members as money saved.
_epicServiceFee(id){const s=this.state;
if(id==='wyoming_holding_llc')return 3000;/* formation attorney + registered agent + operating agreement */
if(id==='build_personal_credit')return Math.min(2500,600+(s.credit_negatives||0)*300);/* credit-repair service: setup + per-derogatory */
if(id==='debt_restructure')return this._debtRestructureFee();/* lending expert's success fee */
const a=CONFIG.actions_finance.actions.find(x=>x.id===id);return a?this.actionCashCost(a):0;},
calcDTI(){const s=this.state,svc=Math.round(((s.total_debt||0)-(s.real_estate_debt||0))*0.018);return (s.monthly_revenue||0)>0?Math.round(svc/s.monthly_revenue*100):0;},
// Aggressive paydown: spend spare cash to drop revolving utilization toward ≤30%; only touch installment loans if DTI is also >30%.
_debtPaydownPlan(){const s=this.state,pool=Math.max(0,(s.cash||0))+(this.isSeparated()?Math.max(0,(s.personal_cash||0)):0);let budget=Math.round(pool*0.6);
const persRev=Math.max(0,(s.total_debt||0)-(s._installment_debt||0)-(s.business_credit_used||0)-(s.business_installment_debt||0)-(s.real_estate_debt||0)),avail=s.available_credit||0;
// Total limit (persRev+avail) is constant as you pay revolving (balance frees the limit), so to land just under 30%: balance ≤ 0.29×(limit).
const targetBal=0.29*(persRev+avail),payRev=Math.max(0,Math.min(Math.round(persRev-targetBal),budget,persRev));budget-=payRev;
let payLoan=0;if(this.calcDTI()>30&&budget>0)payLoan=Math.min(s._installment_debt||0,budget);
return {payRev:Math.round(payRev),payLoan:Math.round(payLoan)};},

// Dashboard stat-info dispatcher: marks the stat viewed (clears its pulsing badge), then opens the scoped info popup.
STAT_INFO:{p_score:{scope:'personal',fn:'showCreditScore'},b_dnb:{scope:'business',fn:'showCreditScore'},p_credit:{scope:'personal',fn:'showCreditAvail'},b_credit:{scope:'business',fn:'showCreditAvail'},p_policy:{scope:'personal',fn:'showCreditAvail'},p_income:{scope:'personal',fn:'showRevenue'},p_passive:{scope:'personal',fn:'showRevenue'},b_revenue:{scope:'business',fn:'showRevenue'},p_flow:{scope:'personal',fn:'showNetFlow'},b_flow:{scope:'business',fn:'showNetFlow'},p_cash:{scope:'personal',fn:'showCash'},p_debt:{scope:'personal',fn:'showDebt'},b_debt:{scope:'business',fn:'showDebt'},b_expense:{scope:'business',fn:'showBurn'},p_expense:{scope:'personal',fn:'showBurn'},p_networth:{scope:'personal',fn:'showAssets'},p_invest:{scope:'personal',fn:'showAssets'},p_mastery:{scope:'personal',fn:'showMastery'},b_equity:{scope:'business',fn:'showOwnerEquity'}},
// Re-render whichever dashboard is currently on screen (the game dashboard, or the event-screen one) so the viewed badge clears wherever you tapped it.
_refreshDashboards(){['stats-dashboard','event-dashboard'].forEach(id=>{const el=document.getElementById(id);if(el&&el.offsetParent!==null){try{this.renderStats(id);}catch(e){}}});},
statInfo(key){const d=this.STAT_INFO[key];if(!d)return;if(!this.state._statsViewed)this.state._statsViewed={};this.state._statsViewed[key]=true;this._refreshDashboards();this[d.fn](d.scope);},
_statsUnviewed(){const vs=this.state._statsViewed||{};return Object.keys(this.STAT_INFO).filter(k=>!vs[k]).length;},
markAllStatsViewed(){if(!this.state._statsViewed)this.state._statsViewed={};Object.keys(this.STAT_INFO).forEach(k=>this.state._statsViewed[k]=true);this._refreshDashboards();this.hidePopup();},
_scopeChip(scope){return scope?('<div><span class="scope-chip '+scope+'">'+(scope==='business'?'Business':'Personal')+'</span></div>'):'';},
_statFooter(){const left=this._statsUnviewed();return '<div class="stat-footer"><button onclick="Game.markAllStatsViewed()">✓ Mark all stats as viewed'+(left>0?' ('+left+' left)':'')+'</button></div>';},
showCreditAvail(scope){const s=this.state,pa=s.available_credit||0,persUsed=Math.max(0,(s.total_debt||0)-(s._installment_debt||0)-(s.business_credit_used||0)-(s.business_installment_debt||0)),persLim=persUsed+pa;
const ba=Math.max(0,(s.business_credit_limit||0)-(s.business_credit_used||0)),bu=s.business_credit_used||0,bl=s.business_credit_limit||0;
const icv=s.insurance_cash_value||0,pla=Math.max(0,Math.round(icv*0.9)-(s.insurance_loan_balance||0)),ilb=s.insurance_loan_balance||0;
const pers=scope!=='business',biz=scope!=='personal';
let h=this._scopeChip(scope)+'<div style="font-size:0.84rem;color:var(--text2);line-height:1.55;margin-bottom:10px;">Credit you can still borrow right now'+(pers&&biz?' — personal cards, your business line, and (with a policy) your insurance cash value':biz?' on your business line of credit':' on your personal cards and (with a policy) your insurance cash value')+'. Keeping <strong>utilization</strong> (how much of your limit is used) low protects your credit score.</div>';
if(pers){h+='<div style="font-weight:700;color:var(--accent);text-transform:uppercase;font-size:0.7rem;letter-spacing:0.5px;border-bottom:2px solid var(--accent);padding-bottom:3px;margin-bottom:6px;">Personal Credit</div>';
h+='<div class="breakdown-row"><span>Available</span><span>'+this.fmtMoney(pa)+'</span></div>';
h+='<div class="breakdown-row"><span>Used / Limit</span><span>'+this.fmtMoney(persUsed)+' / '+this.fmtMoney(persLim)+'</span></div>';
h+='<div class="breakdown-row"><span>'+this.term('Utilization')+'</span><span style="color:'+(this.calcPersUtil()>30?'var(--gold)':'var(--accent)')+'">'+this.calcPersUtil()+'%</span></div>';}
if(biz){h+='<div style="font-weight:700;color:var(--blue);text-transform:uppercase;font-size:0.7rem;letter-spacing:0.5px;border-bottom:2px solid var(--blue);padding-bottom:3px;margin:14px 0 6px;">Business Credit</div>';
h+='<div class="breakdown-row"><span>Available</span><span>'+this.fmtMoney(ba)+'</span></div>';
h+='<div class="breakdown-row"><span>Used / Limit</span><span>'+this.fmtMoney(bu)+' / '+this.fmtMoney(bl)+'</span></div>';
h+='<div class="breakdown-row"><span>'+this.term('Utilization')+'</span><span style="color:'+(this.calcBizUtil()>50?'var(--gold)':'var(--accent)')+'">'+this.calcBizUtil()+'%</span></div>';}
if(pers&&icv>0){h+='<div style="font-weight:700;color:var(--gold);text-transform:uppercase;font-size:0.7rem;letter-spacing:0.5px;border-bottom:2px solid var(--gold);padding-bottom:3px;margin:14px 0 6px;">Policy</div>';
h+='<div class="breakdown-row"><span>Cash Value</span><span>'+this.fmtMoney(icv)+'</span></div>';
h+='<div class="breakdown-detail">Grows ~7%/yr, tax-free — compounds even while borrowed against.</div>';
h+='<div class="breakdown-row"><span>Loan Available (90%)</span><span>'+this.fmtMoney(pla)+'</span></div>';
if(ilb>0){h+='<div class="breakdown-row"><span>Loan Outstanding</span><span style="color:var(--gold)">'+this.fmtMoney(ilb)+'</span></div>';h+='<div class="breakdown-detail">Accrues ~5%/yr. The cumulative loan is netted from your death benefit when you die — never repaid from your pocket.</div>';}
if(s._passive_income_active){const moP=Math.round(icv*0.06/12);h+='<div class="breakdown-row"><span>Monthly Passive Income</span><span style="color:var(--accent)">'+this.fmtMoney(moP)+'/mo</span></div>';h+='<div class="breakdown-row"><span>Cumulative Policy Loans</span><span style="color:var(--text2)">'+this.fmtMoney(s.insurance_passive_loan_total||0)+'</span></div>';h+='<div class="breakdown-detail" style="font-style:italic;">Tax-free income from insurer. Cash value grows ~7%/yr; the loan accrues ~5%/yr and is netted from the death benefit only.</div>';}
else h+='<div class="breakdown-detail">Activate tax-free passive income with the "Activate Tax-Free Passive Income" finance action.</div>';
if(s.insurance_coverage)h+='<div class="breakdown-row"><span>Protection Coverage</span><span>'+this.fmtMoney(s.insurance_coverage)+'</span></div>';}
h+='<div class="breakdown-row breakdown-total"><span>Total Available</span><span style="color:var(--accent)">'+this.fmtMoney((pers?pa+pla:0)+(biz?ba:0))+'</span></div>';
h+=this._statFooter();
this.showPopup('Credit Available'+(scope?(' — '+(biz&&!pers?'Business':'Personal')):''),h);},

showDebt(scope){const s=this.state,persRev=Math.max(0,(s.total_debt||0)-(s._installment_debt||0)-(s.business_credit_used||0)-(s.business_installment_debt||0)-(s.real_estate_debt||0)),persInst=s._installment_debt||0;
const bizRev=s.business_credit_used||0,bizInst=s.business_installment_debt||0,reDbt=s.real_estate_debt||0;
const insLoan=s.insurance_loan_balance||0,pbLoan=s.private_bank_loan||0,totalAll=(s.total_debt||0)+insLoan+pbLoan,moPay=this.calcDebtInterest()+this.calcDebtPrincipal();
const pers=scope!=='business',biz=scope!=='personal';
let h=this._scopeChip(scope)+'<div style="font-size:0.84rem;color:var(--text2);line-height:1.55;margin-bottom:10px;">Everything you owe, by type. <strong>Revolving</strong> (cards/lines) hurts your score when you use too much of the limit; <strong>installment</strong> (fixed loans) is gentler. Less debt — and the right structure — means healthier credit and lower payments.</div>';
if(pers){h+='<div style="font-weight:700;color:var(--accent);text-transform:uppercase;font-size:0.7rem;letter-spacing:0.5px;border-bottom:2px solid var(--accent);padding-bottom:3px;margin-bottom:6px;">Personal Debt</div>';
h+='<div class="breakdown-row"><span>Revolving (cards)</span><span style="color:var(--red)">'+this.fmtMoney(persRev)+'</span></div>';
h+='<div class="breakdown-row"><span>Installment (loans)</span><span style="color:var(--gold)">'+this.fmtMoney(persInst)+'</span></div>';}
if(biz){h+='<div style="font-weight:700;color:var(--blue);text-transform:uppercase;font-size:0.7rem;letter-spacing:0.5px;border-bottom:2px solid var(--blue);padding-bottom:3px;margin:14px 0 6px;">Business Debt</div>';
h+='<div class="breakdown-row"><span>Revolving (LOC)</span><span style="color:var(--red)">'+this.fmtMoney(bizRev)+'</span></div>';
h+='<div class="breakdown-row"><span>Installment (loans)</span><span style="color:var(--gold)">'+this.fmtMoney(bizInst)+'</span></div>';}
// Secured / other debts always show (regardless of personal/business view) so you always see your full obligations — real estate, policy loans, private-bank line.
if(reDbt>0||insLoan>0||pbLoan>0){h+='<div style="font-weight:600;color:var(--text);margin:10px 0 6px;border-top:1px solid var(--border);padding-top:8px;">Secured & Other Debt</div>';
if(reDbt>0){h+='<div class="breakdown-row"><span>🏠 Real Estate (mortgage/HELOC)</span><span style="color:var(--blue)">'+this.fmtMoney(reDbt)+'</span></div>';h+='<div class="breakdown-detail">Property-secured — does not impact business loan qualification.</div>';}
if(insLoan>0){h+='<div class="breakdown-row"><span>🛡️ Policy Loan</span><span style="color:var(--text2)">'+this.fmtMoney(insLoan)+'</span></div>';h+='<div class="breakdown-detail">Borrowed against your policy — netted from the death benefit, never repaid from pocket.</div>';}
if(pbLoan>0){h+='<div class="breakdown-row"><span>🏦 Private Bank Line (1%)</span><span style="color:var(--accent)">'+this.fmtMoney(pbLoan)+'</span></div>';h+='<div class="breakdown-detail">Backed by your deposit — just ~1%/yr, the cheapest leverage you have.</div>';}}
const _debtTotal=(pers?(persRev+persInst):0)+(biz?(bizRev+bizInst):0)+reDbt+insLoan+pbLoan;
h+='<div class="breakdown-row breakdown-total"><span>Total Outstanding</span><span style="color:var(--red)">'+this.fmtMoney(_debtTotal)+'</span></div>';
h+='<div style="margin-top:10px;border-top:1px solid var(--border);padding-top:8px;">';
h+='<div class="breakdown-row"><span>Monthly Payments</span><span>'+this.fmtMoney(moPay)+'</span></div>';
{const br=Math.round(((s._market_rate!=null?s._market_rate:0.05)+(s._rate_premium||0))*1000)/10,ph=(s._cycle&&s._cycle.phase)||'expansion';h+='<div class="breakdown-row"><span>Base rate (Fed) · '+ph+'</span><span style="color:'+(br>=6?'var(--red)':br>=5?'var(--gold)':'var(--accent)')+'">'+br.toFixed(1)+'%</span></div>';h+='<div class="breakdown-detail">Your variable business lines & loans float with this rate. It climbs in booms and downturns (and after a Fed-hike event) and eases in recovery — so your monthly interest moves with it. Pay down balances or refinance to fixed to blunt the swings.</div>';}
const persLim=persRev+(s.available_credit||0),pu=this.calcPersUtil(),bu=this.calcBizUtil();
if(pers)h+='<div class="breakdown-row"><span>Personal '+this.term('Utilization')+'</span><span style="color:'+(pu>30?'var(--gold)':'var(--accent)')+'">'+pu+'% ('+this.fmtMoney(persRev)+'/'+this.fmtMoney(persLim)+')</span></div>';
if(biz&&(s.business_credit_limit||0)>0)h+='<div class="breakdown-row"><span>Business '+this.term('Utilization')+'</span><span style="color:'+(bu>50?'var(--gold)':'var(--accent)')+'">'+bu+'% ('+this.fmtMoney(bizRev)+'/'+this.fmtMoney(s.business_credit_limit||0)+')</span></div>';
const bizMoPay=Math.round(((s.total_debt||0)-(s.real_estate_debt||0))*0.018),dti=(s.monthly_revenue||0)>0?Math.round((bizMoPay/s.monthly_revenue)*100):0;
if(biz)h+='<div class="breakdown-row"><span>DTI (excl RE)</span><span style="color:'+(dti>50?'var(--red)':dti>36?'var(--gold)':'var(--accent)')+'">'+dti+'%</span></div>';h+='</div>';
h+=this._statFooter();this.showPopup('Debt Breakdown'+(scope?(' — '+(biz&&!pers?'Business':'Personal')):''),h);},

showEbitda(){const s=this.state,rev=s.monthly_revenue||0,cogs=s.cogs||0,opex=s.operating_expenses||0,ebitda=rev-cogs-opex;this.showPopup(this.term('EBITDA'),'<div class="breakdown-row"><span>Revenue</span><span style="color:var(--accent)">$'+this.fmt(rev)+'</span></div><div class="breakdown-row"><span>- '+this.term('COGS')+'</span><span style="color:var(--red)">$'+this.fmt(cogs)+'</span></div><div class="breakdown-row"><span>- Operating Expenses</span><span style="color:var(--red)">$'+this.fmt(opex)+'</span></div><div class="breakdown-row breakdown-total"><span>= '+this.term('EBITDA')+'</span><span style="color:'+(ebitda>=0?'var(--accent)':'var(--red)')+'">$'+this.fmt(ebitda)+'</span></div>');},

showRevenue(scope){const s=this.state,biz=s.monthly_revenue||0,cust=s.customer_base||0,perCust=cust>0?Math.round(biz/cust):0,cap=8000+((s.team_size||0)*5000)+(s.revenue_capacity||0);
const policyPassive=s._passive_income_active?Math.round((s.insurance_cash_value||0)*0.06/12):0,passive=(s.other_monthly_revenue||0)+policyPassive,salary=s.owner_pay||0;
const wantP=scope!=='business',wantB=scope!=='personal';
const head=(t,col)=>'<div style="font-weight:700;color:'+col+';text-transform:uppercase;font-size:0.7rem;letter-spacing:0.5px;border-bottom:2px solid '+col+';padding-bottom:3px;margin:0 0 6px;">'+t+'</div>';
let h=this._scopeChip(scope)+'<div style="font-size:0.84rem;color:var(--text2);line-height:1.55;margin-bottom:10px;">Where your money comes from each month — your <strong>business revenue</strong> (customers × value each)'+(wantP&&wantB?' and your <strong>personal income</strong> (your pay plus any passive/asset income)':'')+'.</div>';
if(wantB){h+=head('Business Revenue','var(--blue)');
h+='<div class="breakdown-row"><span>'+cust+' '+(cust===1?'customer':'customers')+' × ~'+this.fmtMoney(perCust)+'/mo</span><span style="color:var(--accent)">'+this.fmtMoney(biz)+'</span></div>';
const monthInYear=((this.month-1)%12)+1;if(monthInYear>=10)h+='<div class="breakdown-detail">Seasonal Q4 dip applied (−15%)</div>';
h+='<div class="breakdown-detail">Delivery capacity '+this.fmtMoney(cap)+'/mo — demand past this is heavily dampened.</div>';}
if(wantP){h+=head('Personal Income','var(--accent)');
if(salary>0)h+='<div class="breakdown-row"><span>Owner salary / draw</span><span style="color:var(--accent)">'+this.fmtMoney(salary)+'</span></div>';
if(passive>0){if((s.real_estate_owned||0)>0)h+='<div class="breakdown-detail">· '+s.real_estate_owned+' rental propert'+(s.real_estate_owned>1?'ies':'y')+'</div>';
if((s.investment_positions||0)>0)h+='<div class="breakdown-detail">· Private lending ('+this.fmtMoney(s.investment_positions)+' deployed)</div>';
if(policyPassive>0)h+='<div class="breakdown-detail">· Tax-free policy income</div>';
h+='<div class="breakdown-row"><span>Passive / asset income</span><span style="color:var(--accent)">'+this.fmtMoney(passive)+'</span></div>';}
if(salary===0&&passive===0)h+='<div class="breakdown-detail">No personal income yet — put yourself on payroll (S-Corp) and switch on passive income.</div>';
h+='<div class="breakdown-row breakdown-total"><span>Personal income/mo</span><span style="color:var(--accent)">'+this.fmtMoney(salary+passive)+'</span></div>';
if(this.isSeparated())h+='<div class="breakdown-detail" style="margin-top:6px;">Owner draws to date '+this.fmtMoney(s._owner_draws_total||0)+' · Capital account '+this.fmtMoney(s.capital_account||0)+' · Pass-through tax paid '+this.fmtMoney(s.personal_tax_ytd||0)+'</div>';}
h+=this._statFooter();this.showPopup((wantB&&!wantP?'Business Revenue':wantP&&!wantB?'Personal Income':'Income Sources'),h);},
// Personal cash explainer — also the home for owner draws-to-date (the cumulative cash you've pulled from the business into your own pocket), now that the Owner Equity row is gone.
showCash(scope){const s=this.state,sep=this.isSeparated(),pc=sep?(s.personal_cash||0):(s.cash||0);
let h=this._scopeChip(scope||'personal')+'<div style="font-size:0.84rem;color:var(--text2);line-height:1.55;margin-bottom:10px;">Your <strong>personal cash</strong> — money in your own pocket. It pays your living and lifestyle, and it\'s where your owner pay/draws and passive income land. Don\'t let it hit zero.</div>';
h+='<div class="breakdown-row breakdown-total"><span>Personal cash</span><span style="color:'+(pc>5000?'var(--accent)':pc<2000?'var(--red)':'var(--gold)')+'">'+this.fmtMoney(pc)+'</span></div>';
if(sep){h+='<div class="breakdown-row"><span>Owner draws to date</span><span style="color:var(--gold)">'+this.fmtMoney(s._owner_draws_total||0)+'</span></div>';
h+='<div class="breakdown-detail">Total you\'ve paid yourself out of the business into your personal account — money in your pocket (it draws down your business equity).</div>';
if((s.personal_tax_ytd||0)>0)h+='<div class="breakdown-row"><span>Pass-through tax paid (YTD)</span><span style="color:var(--text2)">'+this.fmtMoney(s.personal_tax_ytd||0)+'</span></div>';}
h+=this._statFooter();this.showPopup('Your Cash',h);},
// Plain-language explainer for Owner Equity (the capital account) — a new owner clicking the dashboard row should learn what it is, not land on the revenue screen.
showOwnerEquity(scope){const s=this.state,cap=s.capital_account||0;
let h=this._scopeChip(scope||'business')+'<div style="line-height:1.6;color:var(--text2);font-size:0.86rem;margin-bottom:10px;"><strong style="color:var(--text);">Owner Equity</strong> is your <strong>stake in the business</strong> — the slice of the company\'s value that actually belongs to you (its retained worth, like the equity you\'d have in a house you own).<br><br>It <strong>grows</strong> when the business keeps profit (revenue minus costs, your pay, and taxes) and <strong>shrinks</strong> when you take money out as an owner draw'+(s._partner_equity>0?' or pay your partner their share':'')+'. It rolls into your overall <strong>Net Worth</strong>.</div>';
const retain=Math.round((s.monthly_revenue||0)-(s.cogs||0)-(s.operating_expenses||0)-(s.owner_pay||0));
h+='<div class="breakdown-row breakdown-total"><span>Owner Equity (your stake)</span><span style="color:'+(cap>=0?'var(--accent)':'var(--red)')+'">'+this.fmtMoney(cap)+'</span></div>';
h+='<div class="breakdown-row"><span>Retained profit this month</span><span style="color:'+(retain>=0?'var(--accent)':'var(--red)')+'">'+(retain>=0?'+':'−')+this.fmtMoney(Math.abs(retain))+'</span></div>';
h+='<div class="breakdown-detail">Revenue − costs − operating expenses − your pay. Kept in the business, this builds your equity.</div>';
h+='<div class="breakdown-row"><span>Owner draws to date</span><span style="color:var(--gold)">'+this.fmtMoney(s._owner_draws_total||0)+'</span></div>';
h+='<div class="breakdown-detail">Cash you\'ve taken out for yourself — puts money in your pocket but lowers your equity.</div>';
if(s._partner_equity>0)h+='<div class="breakdown-row"><span>Partner owns</span><span style="color:var(--gold)">'+Math.round(s._partner_equity*100)+'%</span></div>';
h+='<div class="breakdown-detail" style="margin-top:8px;">💡 High equity means a valuable company you own — but equity isn\'t cash in hand. Turning it into personal wealth (draws, a sale, or borrowing against it) is the real game.</div>';
h+=this._statFooter();this.showPopup('Owner Equity',h);},
showAssets(scope){const s=this.state,cash=(s.cash||0)+(s.personal_cash||0),inv=s.investment_positions||0,re=s.real_estate_equity||0,cv=s.insurance_cash_value||0,cap=Math.max(0,s.capital_account||0),pbb=s.private_bank_balance||0,debt=(s.total_debt||0)+(s.insurance_loan_balance||0)+(s.private_bank_loan||0),gross=cash+inv+re+cv+cap+pbb,net=gross-debt;
const r=(l,v,d)=>'<div class="breakdown-row"><span>'+l+'</span><span style="color:var(--accent)">'+this.fmtMoney(v)+'</span></div>'+(d?'<div class="breakdown-detail">'+d+'</div>':'');
let h=this._scopeChip(scope||'personal')+'<div style="font-size:0.84rem;color:var(--text2);line-height:1.55;margin-bottom:10px;">Your <strong>net worth</strong> — everything you own (cash, investments, property, policy value, your business stake) minus everything you owe. The real scoreboard of the wealth you\'re building.</div>';
h+='<div style="font-weight:700;color:var(--accent);text-transform:uppercase;font-size:0.7rem;letter-spacing:0.5px;border-bottom:2px solid var(--accent);padding-bottom:3px;margin-bottom:6px;">Assets</div>';
h+=r('Cash (personal + business)',cash);
if(pbb>0)h+=r('Private Bank Deposit',pbb,'Earns ~5%/yr (~'+this.fmtMoney(Math.round(pbb*0.004))+'/mo) and backs your 1% credit line.');
if(inv>0)h+=r('Investments',inv,'Private equity, private lending & managed portfolio'+(s._family_office?' — optimized by your family office':'')+'. Throws off ~'+this.fmtMoney(Math.round(inv*0.01))+'/mo passive.');
if(re>0)h+=r('Real Estate Equity',re);
if(cv>0)h+=r('Policy Cash Value',cv,'Grows ~7%/yr tax-free.');
if(cap>0)h+=r('Business Equity (capital account)',cap);
h+='<div class="breakdown-row"><span style="color:var(--text2)">Gross Assets</span><span style="color:var(--text2)">'+this.fmtMoney(gross)+'</span></div>';
h+='<div class="breakdown-row"><span>− Total Debt</span><span style="color:var(--red)">'+this.fmtMoney(debt)+'</span></div>';
h+='<div class="breakdown-row breakdown-total"><span>Net Worth</span><span style="color:var(--accent)">'+this.fmtMoney(net)+'</span></div>';
if(s.trust_structure&&!['none','basic_llc',undefined].includes(s.trust_structure))h+='<div class="breakdown-detail" style="margin-top:6px;">🛡 Held in your '+(s.trust_structure==='dynasty'?'dynasty trust':'trust')+' — protected from lawsuits and estate tax.</div>';
h+=this._statFooter();this.showPopup('Your Assets',h);},
showAchievements(){const s=this.state,have={};(s._milestones_achieved||[]).forEach(m=>have[m.id]=m.month);const total=MILESTONES.length,done=Object.keys(have).length;const CATL={marketing:'Marketing',operations:'Operations',finance:'Finance'},colOf=c=>c==='marketing'?'var(--accent)':c==='operations'?'var(--blue)':'var(--gold)';
let h='<div style="text-align:center;margin-bottom:10px;"><span style="font-size:1.5rem;font-weight:800;color:var(--gold);">'+done+' / '+total+'</span><div style="font-size:0.68rem;color:var(--text2);text-transform:uppercase;letter-spacing:1px;">Milestones Unlocked</div></div>';
for(const cat of ['marketing','operations','finance']){const col=colOf(cat);h+='<div style="font-weight:700;color:'+col+';text-transform:uppercase;font-size:0.7rem;letter-spacing:0.5px;border-bottom:2px solid '+col+';padding-bottom:3px;margin:12px 0 6px;">'+CATL[cat]+'</div>';
for(const m of MILESTONES.filter(x=>x.cat===cat)){const got=have[m.id]!==undefined;h+='<div style="display:flex;gap:8px;align-items:flex-start;padding:5px 1px;opacity:'+(got?'1':'0.5')+';"><span style="font-size:0.95rem;line-height:1.2;">'+(got?'🏆':'🔒')+'</span><div style="flex:1;min-width:0;"><div style="font-size:0.82rem;font-weight:600;color:'+(got?'var(--text)':'var(--text2)')+';">'+m.title+(got&&have[m.id]>0?' <span style="font-size:0.62rem;color:var(--text2);font-weight:400;">— month '+have[m.id]+'</span>':'')+'</div><div style="font-size:0.7rem;color:var(--text2);line-height:1.4;">'+m.desc+'</div></div></div>';}}
this.showPopup('🏆 Achievements',h);},
showNetFlow(side){const s=this.state,fm=v=>this.fmtMoney(Math.round(v)),sep=this.isSeparated();
let inLabel,inVal,outVal,liquid;
if(side==='business'){inLabel='Revenue in';inVal=s.monthly_revenue||0;outVal=(s.operating_expenses||0)+(s.cogs||0);liquid=(s.cash||0)+Math.max(0,(s.business_credit_limit||0)-(s.business_credit_used||0));}
else{const policyPassive=s._passive_income_active?Math.round((s.insurance_cash_value||0)*0.06/12):0,passiveInc=(s.other_monthly_revenue||0)+policyPassive+Math.round((s.private_bank_balance||0)*0.004);inLabel='Income in';inVal=(s.owner_pay||0)+passiveInc;outVal=(s.living_expenses||0)+(s.lifestyle_expenses||0);liquid=(sep?(s.personal_cash||0):(s.cash||0))+(s.available_credit||0);}
const net=inVal-outVal;
let h=this._scopeChip(side==='business'?'business':'personal')+'<div style="font-size:0.85rem;line-height:1.6;margin-bottom:10px;">How much your '+(side==='business'?'business':'personal')+' cash changes each month — money coming in minus money going out. <strong style="color:var(--accent)">Green/positive</strong> = your cash is growing; <strong style="color:var(--red)">red/negative</strong> = you\'re spending it down.</div>';
h+='<div class="breakdown-row"><span>'+inLabel+'</span><span style="color:var(--accent)">+'+fm(inVal)+'</span></div>';
h+='<div class="breakdown-row"><span>Expenses out</span><span style="color:var(--red)">−'+fm(outVal)+'</span></div>';
h+='<div class="breakdown-row breakdown-total"><span>Cash flow / month</span><span style="color:'+(net>=0?'var(--accent)':'var(--red)')+'">'+(net>=0?'+':'−')+fm(Math.abs(net))+'</span></div>';
if(net<0&&liquid>0)h+='<div class="breakdown-detail" style="margin-top:8px;">At this rate your cash + available credit ('+fm(liquid)+') lasts about <strong>'+Math.floor(liquid/Math.abs(net))+' months</strong> — that\'s the “runway” shown next to it.</div>';
else if(net>=0)h+='<div class="breakdown-detail" style="margin-top:8px;">You\'re cash-flow positive — no runway clock ticking.</div>';
h+=this._statFooter();this.showPopup((side==='business'?'Business':'Personal')+' Cash Flow',h);},
showBurn(scope){const s=this.state,opex=s.operating_expenses||0,cogs=s.cogs||0,pay=s.owner_pay||0,living=s.living_expenses||0,lifestyle=s.lifestyle_expenses||0,interest=this.calcDebtInterest(),principal=this.calcDebtPrincipal();
const taxRes=this.state._completed_actions.includes('monthly_tax_reserve')?Math.round(Math.max(0,(s.monthly_revenue||0)-cogs-opex-(s._re_depreciation||0))*(s.tax_rate||0.25)):0;
let detail='';if(s._active_lifestyle_costs&&Object.keys(s._active_lifestyle_costs).length)detail=Object.entries(s._active_lifestyle_costs).map(([id,cost])=>'<div class="breakdown-detail">· '+id.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())+': $'+this.fmt(cost)+'/mo</div>').join('');
const bizTotal=opex+cogs+pay+interest+principal+taxRes,persTotal=living+lifestyle;
const head=(t,col,first)=>'<div style="font-weight:700;color:'+col+';text-transform:uppercase;font-size:0.7rem;letter-spacing:0.5px;border-bottom:2px solid '+col+';padding-bottom:3px;margin:'+(first?'0 0 6px':'14px 0 6px')+';">'+t+'</div>';
const wantP=scope!=='business',wantB=scope!=='personal';
let h=this._scopeChip(scope)+'<div style="font-size:0.84rem;color:var(--text2);line-height:1.55;margin-bottom:10px;">Everything that goes out each month'+(wantP&&wantB?' — business costs plus your personal living and lifestyle':wantB?' to run the business':' on your personal living and lifestyle')+'. This is your <strong>burn</strong>: the number your income has to clear before you\'re actually building wealth.</div>';
if(wantB){h+=head('Business','var(--blue)',true);
h+='<div class="breakdown-row"><span>Operating Expenses</span><span>$'+this.fmt(opex)+'</span></div>';
// Itemize what's inside operating expenses — payroll/salaries from hires and executive pay — so it's clear where the money goes.
{const ec=this.calcExecComp?this.calcExecComp():0;let bd='';if(s._active_recurring_costs)bd+=Object.entries(s._active_recurring_costs).map(([id,c])=>'<div class="breakdown-detail">· '+this.actionLabel(id)+': $'+this.fmt(c)+'/mo</div>').join('');if(ec>0)bd+='<div class="breakdown-detail">· Executive pay (CRO/COO/CFO): $'+this.fmt(ec)+'/mo</div>';if(bd)h+=bd;}
if(cogs>0)h+='<div class="breakdown-row"><span>COGS</span><span>$'+this.fmt(cogs)+'</span></div>';
if(pay>0)h+='<div class="breakdown-row"><span>Owner Salary / Draw</span><span>$'+this.fmt(pay)+'</span></div>';
h+='<div class="breakdown-row"><span>Debt Service</span><span>$'+this.fmt(interest+principal)+'</span></div>';
if(taxRes)h+='<div class="breakdown-row"><span>Tax Reserve ('+Math.round((s.tax_rate||0.25)*100)+'%)</span><span>$'+this.fmt(taxRes)+'</span></div>'+(((s.tax_reserve||0)>0)?'<div class="breakdown-detail">Reserve balance $'+this.fmt(Math.round(s.tax_reserve))+' earns ~4%/yr in a money market — fold it into a cash-value policy to grow it tax-free.</div>':'');
h+='<div class="breakdown-row"><span style="color:var(--text2)">Business subtotal</span><span style="color:var(--text2)">$'+this.fmt(bizTotal)+'</span></div>';}
if(wantP){h+=head('Personal','var(--accent)',!wantB);
h+='<div class="breakdown-row"><span>'+this.term('Living Expenses')+'</span><span>$'+this.fmt(living)+'</span></div>';
h+='<div class="breakdown-row"><span>Lifestyle Expenses</span><span>$'+this.fmt(lifestyle)+'</span></div>'+detail;
h+='<div class="breakdown-row"><span style="color:var(--text2)">Personal subtotal</span><span style="color:var(--text2)">$'+this.fmt(persTotal)+'</span></div>';}
h+='<div class="breakdown-row breakdown-total"><span>Total</span><span style="color:var(--red)">$'+this.fmt((wantB?bizTotal:0)+(wantP?persTotal:0))+'</span></div>';
h+=this._statFooter();this.showPopup((wantB&&!wantP?'Business Expenses':wantP&&!wantB?'Personal Expenses':this.term('Monthly Burn')),h);},

showMastery(){const d=this.lifeDims(),m=this.calcPersonalMastery(),rec=this.calcEnergyRecovery();const bar=(k)=>{const v=d[k],col=v>60?'var(--accent)':v>30?'var(--gold)':'var(--red)';return '<div style="margin:7px 0;"><div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:2px;"><span>'+this.LIFE_ICON[k]+' '+k+'</span><span style="font-weight:700;color:'+col+';">'+v+'</span></div><div class="bar-track" style="height:6px;"><div class="bar-fill" style="width:'+v+'%;background:'+col+'"></div></div></div>';};
let h=this._scopeChip('personal')+'<div style="font-size:0.84rem;color:var(--text2);line-height:1.5;margin-bottom:8px;">A life well-lived across five dimensions. Your <strong>Personal Mastery</strong> is their average — and it drives how fast your energy recovers each month (<strong>+'+rec+'/mo</strong> right now).</div>';
h+=['Body','Mind','Spirit','Heart','Luxury'].map(bar).join('');
h+='<div style="font-size:0.78rem;color:var(--gold);background:rgba(212,175,55,0.08);border-radius:var(--radius-sm);padding:8px 10px;margin-top:8px;">Neglect your life — coasting on cheap habits — and energy recovery falls, making it hard to act. Invest in yourself (especially the bigger, unlocked experiences) and you run on a full tank.</div>';
h+=this._statFooter();this.showPopup('Personal Mastery — '+m+'/100',h);},
showCreditScore(scope){const s=this.state,score=Math.round(s.personal_credit_score),biz=this.calcBizCreditScore();const wantP=scope!=='business',wantB=scope!=='personal';
const cm={positive:'var(--accent)',negative:'var(--red)',warning:'var(--gold)',neutral:'var(--text2)'},im={positive:'↑',negative:'↓',warning:'~',neutral:'·'};
const frow=x=>'<div style="padding:5px 0;border-bottom:1px solid var(--border);"><div style="color:'+cm[x.i]+';font-weight:600;">'+im[x.i]+' '+x.l+'</div><div style="font-size:0.75rem;color:var(--text2);">'+x.d+'</div></div>';
const head=(t,col,first)=>'<div style="font-weight:700;color:'+col+';text-transform:uppercase;font-size:0.7rem;letter-spacing:0.5px;border-bottom:2px solid '+col+';padding-bottom:3px;margin:'+(first?'0 0 6px':'14px 0 6px')+';">'+t+'</div>';
const pf=[];
if(s.debt_breakdown&&s.debt_breakdown.collections>0)pf.push({l:'Collections on report',i:'negative',d:'$'+this.fmt(s.debt_breakdown.collections)+' in collections'});
if(score<580)pf.push({l:'Very low score',i:'negative',d:'Below 580 — most lenders won\'t work with you'});
const persRev=Math.max(0,(s.total_debt||0)-(s._installment_debt||0)-(s.business_credit_used||0)-(s.business_installment_debt||0)),persLim=persRev+(s.available_credit||0),pu=this.calcPersUtil();
if(pu>70)pf.push({l:'Very high utilization ('+pu+'%)',i:'negative',d:this.fmtMoney(persRev)+' used of '+this.fmtMoney(persLim)+' revolving limit.'});
else if(pu>30)pf.push({l:'High utilization ('+pu+'%)',i:'warning',d:this.fmtMoney(persRev)+' of '+this.fmtMoney(persLim)+'. Below 30% boosts score.'});
else if(persLim>0)pf.push({l:'Low utilization ('+pu+'%)',i:'positive',d:this.fmtMoney(persRev)+' of '+this.fmtMoney(persLim)+'. Helping your score.'});
if(!pf.length)pf.push({l:'Average profile',i:'neutral',d:'No major factors'});
const bf=[];const bu=this.calcBizUtil();
if((s.business_credit_limit||0)>0){if(bu>50)bf.push({l:'High utilization ('+bu+'%)',i:'warning',d:this.fmtMoney(s.business_credit_used||0)+' of '+this.fmtMoney(s.business_credit_limit||0)});else bf.push({l:'Healthy utilization ('+bu+'%)',i:'positive',d:this.fmtMoney(s.business_credit_used||0)+' of '+this.fmtMoney(s.business_credit_limit||0)});}
const bizMoPay=Math.round(((s.total_debt||0)-(s.real_estate_debt||0))*0.018),moInc=s.monthly_revenue||1,dti=Math.round((bizMoPay/moInc)*100);
if((s.monthly_revenue||0)>2000){if(dti>50)bf.push({l:'Very high DTI ('+dti+'%)',i:'negative',d:'Debt payments exceed 50% of income. RE excluded.'});
else if(dti>36)bf.push({l:'High DTI ('+dti+'%)',i:'warning',d:'Most lenders want below 36%. RE excluded.'});
else if(dti>0)bf.push({l:'Healthy DTI ('+dti+'%)',i:'positive',d:'Below 36% — manageable. RE excluded.'});}
if(!s.business_credit_profile||s.business_credit_profile==='none')bf.push({l:'No business credit',i:'warning',d:'Not established yet'});
else if(s.business_credit_profile==='building')bf.push({l:'Building business credit',i:'neutral',d:'Being established'});
// Company culture (only meaningful once you have a team) — flag it when it slips so retention/churn risk is visible.
if((s.team_size||0)>0){const _cul=s.company_culture==null?45:s.company_culture;if(_cul<30)bf.push({l:'Weak culture ('+_cul+')',i:'negative',d:'High turnover & churn risk. Benefits or equity grants rebuild it.'});else if(_cul<50)bf.push({l:'Shaky culture ('+_cul+')',i:'warning',d:'Invest in a benefits package or equity to retain your team.'});else bf.push({l:'Strong culture ('+_cul+')',i:'positive',d:'Your team is engaged and sticking around.'});}
else bf.push({l:'Established business credit',i:'positive',d:'Strong history'});
if(['llc','s_corp','c_corp','multi_entity'].includes(s.entity_structure))bf.push({l:'Entity established',i:'positive',d:s.entity_structure.replace(/_/g,' ').toUpperCase()});
if(s._banker_state==='trusted'||s._banker_state==='champion')bf.push({l:'Strong banking relationship',i:'positive',d:'Banker trusts you'});
if(!bf.length)bf.push({l:'No business credit yet',i:'neutral',d:'Form an LLC and open business credit'});
let h=this._scopeChip(scope)+'<div style="font-size:0.84rem;color:var(--text2);line-height:1.55;margin-bottom:10px;">'+(wantB&&!wantP?'Your <strong>D&B score</strong> rates your business\'s creditworthiness — build it and the company can borrow on its own name, without your personal guarantee.':'Your <strong>credit score</strong> is how lenders judge your reliability — it sets how much you can borrow and how cheaply. The biggest levers are paying on time and keeping <strong>utilization</strong> low.')+' Here\'s what\'s helping or hurting it right now.</div>';
if(wantP){h+=head('Personal — MyFICO 3B','var(--accent)',true);
h+='<div style="font-size:1.1rem;font-weight:700;color:'+(score>=700?'var(--accent)':score>=620?'var(--gold)':'var(--red)')+'">'+score+' <span style="font-size:0.7rem;color:var(--text2);">/ 850</span></div>'+pf.map(frow).join('');}
if(wantB){h+=head('Business — D&B','var(--blue)',!wantP);
h+='<div style="font-size:1.1rem;font-weight:700;color:'+(biz>=70?'var(--accent)':biz>=40?'var(--gold)':'var(--text2)')+'">'+(biz?biz+' <span style="font-size:0.7rem;color:var(--text2);">/ 100</span>':'—')+'</div>'+bf.map(frow).join('');}
h+='<div style="margin-top:8px;font-size:0.72rem;color:var(--text2);font-style:italic;">'+(wantP?'MyFICO 3B (300–850) is your personal score across all three bureaus. ':'')+(wantB?'D&B (0–100) rates your <strong>business</strong> — build it and the company can borrow on its own name, without your personal guarantee. ':'')+'Utilization = revolving credit only; DTI = all debt vs income.</div>';
h+=this._statFooter();this.showPopup(wantB&&!wantP?'Business Credit Score (D&B)':wantP&&!wantB?'Personal Credit Score (MyFICO 3B)':'Credit Scores',h);},
showCfoReport(){const s=this.state,rev=s.monthly_revenue||0,cogs=s.cogs||0,opex=s.operating_expenses||0;
const opProfit=Math.max(0,rev-cogs-opex),margin=rev>0?Math.round(opProfit/rev*100):0;
const valuation=Math.round(Math.max(opProfit*12*3,rev*12*0.5));
const own=1-(s._partner_equity||0),myStake=Math.round(valuation*own);
const liquid=(s.cash||0)+(s.personal_cash||0)+(s.investment_positions||0)+(s.insurance_cash_value||0),reEq=s.real_estate_equity||0;
const debt=(s.total_debt||0)+(s.insurance_loan_balance||0),netWorth=liquid+reEq+myStake-debt;
const burn=this.calcMonthlyBurn(),netFlow=rev-cogs-burn;
const runway=netFlow>=0?'Profitable':(Math.floor(((s.cash||0)+(s.personal_cash||0)+(s.available_credit||0))/Math.max(1,-netFlow))+' mo runway');
const revPerCust=Math.round(100+(s.brand_equity||0)*5+((s._completed_actions||[]).includes('build_offer')?200:0)+(s.skill_marketing||0)*2);
const convRate=Math.min(0.5,0.05+(s.skill_marketing||0)/300+(s.brand_equity||0)/1000+Math.min(0.20,(s.sales_conversion||0)*0.01));
const cap=8000+((s.team_size||0)*5000)+(s.revenue_capacity||0);
let cust=s.customer_base||0,leads=s.leads||0;for(let i=0;i<6;i++){const conv=Math.floor(leads*convRate);cust+=conv;leads=Math.max(0,leads-conv);cust=Math.max(0,cust-Math.floor(cust*(s.churn_rate||0.05)));}
let projRev=cust*revPerCust;if(projRev>cap)projRev=Math.round(cap+(projRev-cap)*0.25);projRev+=(s.other_monthly_revenue||0);
const row=(l,v,col)=>'<div class="breakdown-row"><span>'+l+'</span><span style="color:'+(col||'var(--text)')+';font-weight:700">'+v+'</span></div>';
const head=(t,c,first)=>'<div style="font-weight:700;color:'+c+';text-transform:uppercase;font-size:0.7rem;letter-spacing:0.5px;border-bottom:2px solid '+c+';padding-bottom:3px;margin:'+(first?'0 0 6px':'14px 0 6px')+';">'+t+'</div>';
let h='<div style="font-size:0.72rem;color:var(--text2);font-style:italic;margin-bottom:8px;">Your fractional CFO’s read on the business:</div>';
h+=head('The Numbers','var(--accent)',true);
h+=row('Company Value (est.)',this.fmtMoney(valuation),'var(--accent)');
if(own<1)h+=row('Your Equity Stake ('+Math.round(own*100)+'%)',this.fmtMoney(myStake),'var(--accent)');
h+=row('Your Net Worth',this.fmtMoney(netWorth),netWorth>=0?'var(--accent)':'var(--red)');
h+=row('Liquid Assets',this.fmtMoney(liquid));
if((s.investment_positions||0)>0)h+=row('Investments',this.fmtMoney(s.investment_positions),'var(--accent)');
if(reEq>0)h+=row('Real Estate Equity',this.fmtMoney(reEq));
if((s.insurance_cash_value||0)>0)h+=row('Policy Cash Value',this.fmtMoney(s.insurance_cash_value));
h+=row('Total Debt',this.fmtMoney(debt),'var(--gold)');
h+=row('Monthly Profit',this.fmtMoney(opProfit)+' · '+margin+'% margin',opProfit>0?'var(--accent)':'var(--red)');
h+=row('Burn · Runway',this.fmtMoney(burn)+' · '+runway,netFlow>=0?'var(--accent)':'var(--gold)');
h+=row('DSCR',(s.dscr>=99?'—':s.dscr),(s.dscr>=1.25||s.dscr>=99)?'var(--accent)':'var(--gold)');
h+='<div class="breakdown-detail">Company value ≈ 3× annual profit (or 0.5× revenue early). Net worth includes the business, your cash, assets and policy, minus debt.</div>';
h+=head('6-Month Projection','var(--blue)');
h+=row('Customers',cust);h+=row('Revenue/mo',this.fmtMoney(projRev),'var(--accent)');
h+='<div class="breakdown-detail">At your current conversion ('+Math.round(convRate*100)+'%) and churn ('+Math.round((s.churn_rate||0)*100)+'%/mo). Delivery capacity tops out at '+this.fmtMoney(cap)+'/mo — beyond it, revenue is heavily dampened.</div>';
h+=head('Where I’d Focus','var(--gold)');
h+='<div class="breakdown-detail" style="margin-bottom:5px;"><strong style="color:var(--accent)">Marketing:</strong> '+this._cfoMktg(s,cap,convRate)+'</div>';
h+='<div class="breakdown-detail" style="margin-bottom:5px;"><strong style="color:var(--blue)">Operations:</strong> '+this._cfoOps(s)+'</div>';
h+='<div class="breakdown-detail"><strong style="color:var(--gold)">Finance:</strong> '+this._cfoFin(s)+'</div>';
this.showPopup('CFO Briefing',h);},
_cfoMktg(s,cap,convRate){if((s.monthly_revenue||0)>=cap*0.9)return 'You’re near delivery capacity ('+this.fmtMoney(cap)+'/mo). Raise capacity (hire delivery, systemize) before pouring in more leads — extra demand is wasted.';if(convRate<0.12&&(s.leads||0)>10)return 'Conversion is '+Math.round(convRate*100)+'% with '+(s.leads||0)+' leads waiting. A sales action (CRM, sales hire, webinar, email nurture) turns that pipeline into revenue.';if((s.customer_base||0)<10)return 'Thin pipeline. Pour into lead gen (outreach, ads, referrals, lead magnet) to fill the top of the funnel.';return 'Funnel looks healthy. Lift value-per-customer (sharpen your Offer, build brand) to grow revenue without more headcount.';},
_cfoOps(s){if((s.churn_rate||0)>0.06)return 'Churn is '+Math.round((s.churn_rate||0)*100)+'%/mo — you’re leaking customers as fast as you win them. Retention (client success, onboarding, quality control) plugs the bucket.';if((s.key_person_dependency||0)>50)return 'Key-person dependency is '+(s.key_person_dependency||0)+'. The business leans too hard on you — document SOPs and add a manager so it runs without you.';if((s.team_size||0)>3&&(s.systems_maturity||0)<40)return 'Your team ('+(s.team_size||0)+') has outgrown your systems — coordination is costing you. Systemize before hiring more.';return 'Operations are stable. Keep building systems and lowering key-person dependency to scale without your hours.';},
_cfoFin(s){if(!this.isSeparated())return 'Form an LLC — it shields your personal assets from lawsuits and unlocks business credit. This is your #1 gap.';if(this.calcPersUtil()>50)return 'Personal credit utilization is '+this.calcPersUtil()+'%. Restructure your debt onto business credit to drop utilization and lift your score.';const opProfit=Math.max(0,(s.monthly_revenue||0)-(s.cogs||0)-(s.operating_expenses||0));if(opProfit>8000&&!['s_corp','c_corp','multi_entity'].includes(s.entity_structure))return 'At '+this.fmtMoney(opProfit)+'/mo profit you’re overpaying self-employment tax. Elect S-Corp to split salary and distributions.';if(opProfit>4000&&!(s._completed_actions||[]).includes('fund_accumulation_policy'))return 'You’re profitable but cash sits idle. Open an accumulation policy and fund it — it compounds tax-free and becomes your passive-income engine.';if((s._completed_actions||[]).includes('fund_accumulation_policy')&&!s._passive_income_active&&(s.insurance_cash_value||0)>5000)return 'Your policy is built up — activate tax-free passive income to start paying yourself without working.';return 'Solid footing. Keep funding the policy and deploying into income assets (real estate, private lending) for passive, tax-free cash flow.';},

renderBars(){const s=this.state,e=Math.max(0,Math.min(100,s.energy)),f=Math.max(0,Math.min(100,s.fitness_level||0)),rec=this.calcEnergyRecovery();
const eC=e>60?'var(--accent)':e>30?'var(--gold)':'var(--red)',fC=f>60?'var(--blue)':f>30?'var(--gold)':'var(--red)';
const fr=this.calcFreedom(),frC=fr>60?'var(--accent)':fr>30?'var(--gold)':'var(--red)';
const cell=(label,num,col,sub)=>{const v=Math.round(num);return '<div style="text-align:center;"><div style="font-size:0.6rem;color:var(--text2);text-transform:uppercase;letter-spacing:0.3px;">'+label+'</div><div style="font-size:0.95rem;font-weight:700;color:'+col+';line-height:1.25;">'+v+'</div><div class="bar-track" style="height:4px;margin-top:3px;"><div class="bar-fill" style="width:'+v+'%;background:'+col+'"></div></div>'+(sub?'<div style="font-size:0.55rem;color:var(--text2);margin-top:2px;white-space:nowrap;">'+sub+'</div>':'')+'</div>';};
const grid=cells=>'<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">'+cells+'</div>';
const el=document.getElementById('bars-section');if(el){el.innerHTML='';el.style.display='none';}},

renderStepIndicator(){const ac=this._activeCats||CATS,ci=ac.indexOf(this.currentCategory),total=ac.length;document.getElementById('step-indicator').innerHTML='Step '+(ci+1)+'/'+total+': '+ac.map(c=>{if(this.selectedActions[c])return'<span style="color:var(--accent)">✓ '+CL[c]+'</span>';if(c===this.currentCategory)return'<span class="step-current">→ '+CL[c]+'</span>';return'<span>'+CL[c]+'</span>';}).join(' · ');},
CAT_ICON:{marketing:'📣',operations:'⚙️',finance:'💰',lifestyle:'🏖️'},
// Short, at-a-glance read on the current economy phase — shown persistently above the category icons.
_ECON_LABELS:{expansion:{i:'📈',n:'Expansion',d:'steady growth — build reserves, keep leverage low',c:'var(--accent)'},boom:{i:'🔥',n:'Boom',d:'hot & frothy — get liquid, a turn is coming',c:'var(--gold)'},downturn:{i:'📉',n:'Downturn',d:'assets on sale but credit is freezing — the prepared win',c:'var(--red)'},recovery:{i:'🌱',n:'Recovery',d:'rebound — rates low, credit loosening',c:'var(--accent)'}},
// The economy signal sits in its own bar right above the step-indicator + category icons (not inside the flex icon row, which would squash the icons).
renderEconSignal(){const s=this.state;const si=document.getElementById('step-indicator');if(!si||!s)return;let bar=document.getElementById('econ-signal');if(!bar){bar=document.createElement('div');bar.id='econ-signal';si.parentNode.insertBefore(bar,si);}const ph=(s._cycle&&s._cycle.phase)||'expansion',E=this._ECON_LABELS[ph]||this._ECON_LABELS.expansion;
// Auto-collapse: the full description shows for the phase's first ~2 months (and the game's opening), then collapses to a slim chip to cut clutter. A new phase re-arms it; the player can tap to toggle anytime.
if(this._econLastPhase!==ph){this._econLastPhase=ph;this._econExpanded=null;}
const since=s._econ_phase_since||1,recentlyChanged=(this.month-since)<2;
const expanded=(this._econExpanded!=null)?this._econExpanded:recentlyChanged;
bar.setAttribute('title','The economy moves in a loop: Expansion → Boom → Downturn → Recovery. Tap to '+(expanded?'collapse':'expand')+'.');
bar.setAttribute('onclick','Game._econExpanded='+(expanded?'false':'true')+';Game.renderEconSignal();');
bar.setAttribute('style','display:flex;align-items:center;gap:6px;font-size:0.66rem;color:var(--text2);margin:0 0 6px;padding:'+(expanded?'4px 9px':'3px 9px')+';background:rgba(127,127,127,0.08);border-radius:6px;line-height:1.35;cursor:pointer;');
bar.innerHTML='<span style="font-size:0.9rem;">'+E.i+'</span><span><strong style="color:'+E.c+';">'+E.n+'</strong>'+(expanded?' <span style="color:var(--text2);">· '+E.d+'</span>':'')+'</span>';},
renderCategoryTabs(){const ac=this._activeCats||CATS;
this.renderEconSignal();
const tabs=ac.map(c=>{const on=this.currentCategory===c,done=!!this.selectedActions[c];return '<div'+(c==='lifestyle'?' id="life-btn"':'')+' class="cat-tab cat-icon'+(on?' active':done?' done':'')+'" title="'+CL[c]+'" onclick="Game.switchCategory(\''+c+'\')">'+(this.CAT_ICON[c]||'•')+(done&&!on?'<span style="font-size:0.62rem;">✓</span>':'')+'</div>';}).join('');
const member=!!this.state._epic_life,pendingEpic=!!this.state._epic_enroll_pending;
const epic=(!this._tutActive&&(this._reveal('epic')||member||pendingEpic))?'<div id="epic-btn" class="cat-tab cat-icon" title="Epic Life Membership" style="background:linear-gradient(135deg,var(--gold),#b8932f);color:#1a1205;border-color:var(--gold);font-weight:700;" onclick="Game.showEpicLife()">⭐'+((member||pendingEpic)?'<span style="font-size:0.62rem;">✓</span>':'')+'</div>':'';
document.getElementById('cat-tabs').innerHTML='<div class="cat-tabs-scroll">'+tabs+'</div>'+epic;},
showEpicLife(){const s=this.state,a=(CONFIG.actions_finance.actions||[]).find(x=>x.id==='epic_life_membership')||{};const fm=v=>this.fmtMoney(v);
const member=!!s._epic_life,selected=!!s._epic_enroll_pending;
const setup=a.cash_cost||500,mo=a.recurring_cost||300,yr=3000;
let h='<div style="font-size:0.85rem;line-height:1.6;">'+(a.description||'')+'</div>';
h+='<div style="font-size:0.8rem;line-height:1.55;color:var(--text2);margin-top:8px;">It runs the single highest-priority money move for you each month — building credit, protection, banking, your tax-free policy, then switching on passive income — and surfaces more investment opportunities.</div>';
h+='<div style="margin-top:10px;padding:9px 12px;background:rgba(239,68,68,0.08);border-left:3px solid var(--red);border-radius:var(--radius-sm);font-size:0.78rem;line-height:1.5;"><strong>⚠️ Very powerful.</strong> If this is your first game, try a full run without it so you learn how the money moves yourself first.</div>';
if(member)h+='<div style="margin-top:12px;text-align:center;font-weight:700;color:var(--accent);">✓ Active — '+(s._epic_plan==='annual'?'annual plan ('+fm(yr)+'/yr)':'monthly plan ('+fm(mo)+'/mo)')+'. Your concierge is running your playbook.</div>';
else if(selected){h+='<div style="margin-top:12px;text-align:center;font-weight:700;color:var(--accent);">✓ Selected — '+(s._epic_plan==='annual'?'annual':'monthly')+' plan enrolls when you End Turn (it doesn\'t use your Finance action or any energy — your team handles it).</div>';
h+='<button class="btn-secondary" style="margin-top:8px;" onclick="Game.cancelEpicLife()">Cancel enrollment</button>';}
else{h+='<div style="margin-top:12px;font-size:0.72rem;color:var(--text2);text-transform:uppercase;letter-spacing:0.5px;">Choose a plan ('+fm(setup)+' setup either way) — enrolling doesn’t use your Finance action or energy</div>';
h+='<button class="btn-primary" style="margin-top:8px;" onclick="Game.enrollEpicLife(\'monthly\')">Monthly — '+fm(setup)+' setup + '+fm(mo)+'/mo</button>';
h+='<button class="btn-primary" style="margin-top:8px;" onclick="Game.enrollEpicLife(\'annual\')">Annual — '+fm(setup)+' setup + '+fm(yr)+'/yr <span style="font-weight:400;opacity:0.85;">(save '+fm(mo*12-yr)+'/yr)</span></button>';}
h+=this._epicRoadmapHtml({locked:!member});
this.showPopup('⭐ Epic Life Membership',h);},
// Concierge roadmap DATA — shared source of truth for the full modal view and the compact result-screen milestone. Every node maps to real game state/flags. Stages: Funding Ready → (Protection → Expense → Reserve) → Freedom.
_epicRoadmapData(){const s=this.state,c=id=>(s._completed_actions||[]).includes(id),ent=s.entity_structure;
const N=(done,label)=>({done:!!done,label:label}),pctOf=g=>Math.round(g.filter(n=>n.done).length/g.length*100);
// Trimmed to the lean finance path — every node is reachable with an action that still exists.
// Order mirrors the concierge's execution. Funding Ready = clean credit + lower utilization (get approvable for early, small amounts).
const fundingReady=[
 N((s.credit_negatives||0)===0&&(s.personal_credit_score||0)>=680,'Credit optimization'),
 N(c('debt_restructure'),'Debt restructure')];
// Protection = insurance + the holding company + a banking relationship: structure plus MULTIPLE sources of lending, so a downturn (when credit tightens) can't freeze you out.
const protect=[
 N(c('combined_insurance'),'Insurance'),
 N(c('wyoming_holding_llc')||s._holding_company||['c_corp','multi_entity'].includes(ent),'Holding company'),
 N(c('banking_relationship')||['trusted','champion'].includes(s._banker_state),'Banking relationship')];
// Wealth = the cash-value policy (which also covers your taxes via a tax-free loan), passive income, and income property.
const wealth=[
 N((s.insurance_cash_value||0)>0||c('fund_accumulation_policy')||c('monthly_tax_reserve')||(s.tax_reserve||0)>0,'Cash-value policy'),
 N(s._passive_income_active||c('activate_passive_income'),'Passive income on'),
 N((s.real_estate_owned||0)>0||c('buy_real_estate'),'Income property')];
const policyPassive=s._passive_income_active?Math.round((s.insurance_cash_value||0)*0.06/12):0;
const passiveInc=(s.other_monthly_revenue||0)+policyPassive+Math.round((s.private_bank_balance||0)*0.004);
const persExp=(s.living_expenses||0)+(s.lifestyle_expenses||0);
const freedomPct=persExp>0?Math.min(100,Math.round(passiveInc/persExp*100)):0;
const frPct=pctOf(fundingReady),pPct=pctOf(protect),wPct=pctOf(wealth);
const firstUndone=g=>g.find(n=>!n.done);
let stage,nextNode;
if(frPct<100){stage='Funding Ready';nextNode=(firstUndone(fundingReady)||{}).label;}
else if(pPct<100){stage='Protection';nextNode=(firstUndone(protect)||{}).label;}
else if(wPct<100){stage='Build Wealth';nextNode=(firstUndone(wealth)||{}).label;}
else if(freedomPct<100){stage='Freedom';nextNode='Grow passive income to cover your lifestyle';}
else{stage='Paradise';nextNode=null;}
const groups=[fundingReady,protect,wealth];
const allNodes=groups.reduce((a,g)=>a+g.length,0)+1/* freedom */,doneNodes=groups.reduce((a,g)=>a+g.filter(n=>n.done).length,0)+(freedomPct>=100?1:0);
const overallPct=Math.round(doneNodes/allNodes*100);
// Two tracked progress bars, surfaced one at a time: Funding Ready first, then the Epic Life System (Protect + Build Wealth).
const sysGroups=[protect,wealth],sysAll=sysGroups.reduce((a,g)=>a+g.length,0),sysDone=sysGroups.reduce((a,g)=>a+g.filter(n=>n.done).length,0);
const systemPct=Math.round(sysDone/sysAll*100);
const activeLabel=frPct<100?'Funding Ready':'Epic Life System',activePct=frPct<100?frPct:systemPct;
return {fundingReady,protect,wealth,frPct,pPct,wPct,policyPassive,passiveInc,persExp,freedomPct,stage,nextNode,overallPct,systemPct,activeLabel,activePct};},
// Full roadmap rendered in the Epic Life modal. opts.locked dims it + frames it as a preview (for non-members per the upsell).
_epicRoadmapHtml(opts){opts=opts||{};const locked=!!opts.locked,s=this.state,fmt=v=>this.fmtMoney(v),D=this._epicRoadmapData();
const bar=(pct,col)=>'<div class="bar-track" style="height:7px;margin:5px 0;"><div class="bar-fill" style="width:'+Math.max(0,Math.min(100,pct))+'%;background:'+(col||'var(--gold)')+';"></div></div>';
const chips=g=>'<div style="display:flex;flex-wrap:wrap;gap:4px 12px;font-size:0.72rem;">'+g.map(n=>'<span style="color:'+(n.done?'var(--accent)':'var(--text2)')+';white-space:nowrap;">'+(n.done?'✓':'○')+' '+n.label+'</span>').join('')+'</div>';
const section=(title,pct,col,inner)=>'<div style="margin-top:12px;"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;"><span style="font-size:0.82rem;font-weight:700;">'+title+'</span><span style="font-size:0.78rem;font-weight:700;color:'+col+';">'+pct+'%</span></div>'+bar(pct,col)+inner+'</div>';
let html='<div style="margin-top:14px;border-top:1px solid var(--border);padding-top:10px;'+(locked?'opacity:0.85;':'')+'"><div style="font-size:0.7rem;color:var(--text2);text-transform:uppercase;letter-spacing:0.6px;margin-bottom:2px;">'+(locked?'🔒 Concierge Roadmap — Preview':'Your Concierge Roadmap')+'</div>';
if(locked)html+='<div style="font-size:0.72rem;color:var(--gold);margin-bottom:6px;line-height:1.45;">This is the playbook a concierge would build for you — these bars show your own progress. Enroll to put it on autopilot.</div>';
html+=section('🏦 Funding Ready',D.frPct,'var(--blue)',chips(D.fundingReady));
if(D.frPct<100){html+='<div style="font-size:0.72rem;color:var(--text2);margin-top:8px;">Finish <strong>Funding Ready</strong> to unlock the <strong>Epic Life System</strong> — a fundable profile is the foundation everything else leverages.</div></div>';return html;}
html+='<div style="margin-top:14px;font-size:0.82rem;font-weight:700;color:var(--gold);">⭐ Epic Life System</div>';
html+=section('🛡 Protection',D.pPct,'var(--accent)',chips(D.protect));
if(D.pPct>=100)html+=section('👑 Build Wealth',D.wPct,'var(--accent)',chips(D.wealth));
else html+='<div style="font-size:0.7rem;color:var(--text2);margin-top:6px;">Protect what you have first — Build Wealth unlocks once this fills.</div>';
if(D.pPct>=100&&D.wPct>=100){
 html+='<div style="margin-top:14px;border-top:1px dashed var(--border);padding-top:8px;">';
 html+=section('🕊️ Freedom — passive income covers lifestyle',D.freedomPct,D.freedomPct>=100?'var(--accent)':'var(--gold)','<div style="font-size:0.72rem;color:var(--text2);">'+fmt(D.passiveInc)+'/mo passive vs '+fmt(D.persExp)+'/mo lifestyle'+(D.policyPassive>0?' · <span style="color:var(--accent);">'+fmt(D.policyPassive)+'/mo tax-free</span>':'')+'</div>');
 if(D.freedomPct>=100)html+='<div style="margin-top:8px;padding:8px 10px;background:rgba(16,185,129,0.1);border-left:3px solid var(--accent);border-radius:var(--radius-sm);font-size:0.76rem;color:var(--accent);font-weight:600;">🏝️ Paradise: your passive income now covers your lifestyle — you\'re financially free.</div>';
 html+='</div>';
}
html+='</div>';return html;},
// Compact milestone shown on the result screen — one glanceable bar + the next step, tappable to open the full roadmap. Members see live progress; non-members see a locked teaser that upsells.
_epicMilestoneCompact(){const s=this.state,member=!!s._epic_life,pending=!!s._epic_enroll_pending,mem=member||pending;
if(!mem&&!this._reveal('epic'))return '';/* don't clutter the early game before the concierge is even a thing */
const D=this._epicRoadmapData(),paradise=D.stage==='Paradise';
// Show ONE of the two tracked bars at a time: Funding Ready, then the Epic Life System.
const head=mem?'⭐ '+D.activeLabel:'⭐ Epic Life Roadmap 🔒';
const line=paradise?'🏝️ Paradise — passive income covers your lifestyle':(D.nextNode?'next: <strong>'+D.nextNode+'</strong>':D.activeLabel+' complete');
const tap=mem?'':' · tap to preview';
return '<div onclick="Game.showEpicLife()" style="cursor:pointer;background:var(--surface);border:1px solid '+(mem?'var(--gold)':'var(--border)')+';border-left:3px solid var(--gold);border-radius:var(--radius-sm);padding:9px 12px;margin-bottom:9px;">'
 +'<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;"><span style="font-size:0.8rem;font-weight:700;color:'+(mem?'var(--gold)':'var(--text2)')+';">'+head+'</span><span style="font-size:0.78rem;font-weight:700;color:var(--gold);">'+D.activePct+'%</span></div>'
 +'<div class="bar-track" style="height:5px;margin:5px 0 4px;"><div class="bar-fill" style="width:'+D.activePct+'%;background:var(--gold);"></div></div>'
 +'<div style="font-size:0.7rem;color:var(--text2);">'+line+tap+'</div></div>';},
// Result-screen card (members only): what the concierge ran this month + the roadmap swing (overall %, newly-completed nodes, next step). Tappable to the full roadmap.
_epicMonthCard(){const s=this.state;if(!s._epic_life)return '';const D=this._epicRoadmapData();
const did=this._epicLastMove;
// Swing on the currently-active bar (Funding Ready, then Epic Life System) vs its month-start snapshot.
const active=D.frPct<100?'fr':'sys',startPct=active==='fr'?(this._roadmapStartFr!=null?this._roadmapStartFr:D.frPct):(this._roadmapStartSys!=null?this._roadmapStartSys:D.systemPct),delta=D.activePct-startPct;
const deltaTxt=delta>0?'<span style="color:var(--accent);font-weight:700;">▲ +'+delta+'%</span>':'<span style="color:var(--text2);">no change</span>';
let body='';
if(did&&did.label){body+='<div style="font-size:0.76rem;margin-bottom:4px;"><span style="color:var(--text2);">Your concierge ran:</span> <strong>'+did.label+'</strong></div>';if(did.narrative)body+='<div style="font-size:0.72rem;color:var(--text2);line-height:1.45;margin-bottom:6px;">'+did.narrative+'</div>';}
else body+='<div style="font-size:0.74rem;color:var(--text2);margin-bottom:6px;">Your concierge held steady this month — the playbook is on track and nothing urgent needed doing. Your membership still covers your protection, banking and policy upkeep in the background.</div>';
const saved=this._epicSavings||0,savedTot=s._epic_savings_total||0;
if(saved>0)body+='<div style="font-size:0.74rem;color:var(--accent);margin-bottom:6px;background:rgba(16,185,129,0.08);border-radius:var(--radius-sm);padding:6px 9px;line-height:1.4;">💰 Saved you <strong>'+this.fmtMoney(saved)+'</strong> in professional fees this month — done in-house, no charge'+(savedTot>saved?' · <strong>'+this.fmtMoney(savedTot)+'</strong> saved to date':'')+'.</div>';
body+='<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;font-size:0.76rem;border-top:1px solid rgba(127,127,127,0.15);padding-top:6px;"><span style="color:var(--text2);">'+D.activeLabel+' progress</span><span><strong>'+D.activePct+'%</strong> '+deltaTxt+'</span></div>';
body+='<div style="font-size:0.72rem;color:var(--text2);margin-top:3px;">'+(D.stage==='Paradise'?'🏝️ Paradise reached — passive income covers your lifestyle':'Next: <strong>'+(D.nextNode||D.stage)+'</strong>')+'</div>';
return '<div onclick="Game.showEpicLife()" style="cursor:pointer;background:linear-gradient(135deg,rgba(212,175,55,0.12),rgba(59,130,246,0.08));border:1px solid var(--gold);border-radius:var(--radius-sm);padding:11px 13px;margin-bottom:10px;"><div style="font-size:0.84rem;font-weight:700;color:var(--gold);margin-bottom:5px;">⭐ Your Concierge This Month</div>'+body+'<div style="text-align:right;font-size:0.66rem;color:var(--text2);margin-top:5px;">tap for full roadmap →</div></div>';},
enrollEpicLife(plan){if(this.state._epic_life)return this.hidePopup();this.state._epic_plan=(plan==='annual'?'annual':'monthly');this.state._epic_enroll_pending=true;this.hidePopup();this.renderCategoryTabs();},
cancelEpicLife(){this.state._epic_enroll_pending=false;this.hidePopup();this.renderCategoryTabs();},
switchCategory(c){this.currentCategory=c;this._showAllActions=false;this.renderStepIndicator();this.renderCategoryTabs();this.renderActions();this.updateConfirmButton();const _b=document.getElementById('confirm-actions-btn');if(_b)_b.classList.remove('btn-flash');},

isActionOutgrown(a){const s=this.state,sk=s['skill_'+a.category]||0;if(a.stage==='foundation'&&sk>40&&this.getStage(a.category)!=='foundation')return true;
const rules={customer_acquisition_sprint:sk>30&&s.customer_base>20,build_delivery_foundation:sk>30&&(s.team_size||0)>1,build_content_presence:sk>40&&s.brand_equity>40,automate_tasks:(s.systems_maturity||0)>30};return rules[a.id]||false;},

// Overstaffed & bleeding: a large team while cash flow is negative — the signal that the Restructure rescue should be surfaced loudly.
_overstaffed(){const s=this.state;if((s.team_size||0)<5)return false;const netFlow=(s.monthly_revenue||0)-(s.cogs||0)-this.calcMonthlyBurn();return netFlow<0;},
// Either you're overstaffed and bleeding, or a toxic closer needs firing — both call for the Restructure rescue.
_needsRestructure(){return this._overstaffed()||!!this.state._toxic_closer;},
_actionUrgency(a){const s=this.state;let u=0;
if(a.id==='restructure_team'&&this._needsRestructure())u+=25;// float the payroll-cut rescue to the top when you're overstaffed/bleeding or stuck with a toxic closer
if(s.cash<2000){if(a.effects&&(a.effects.cash>0||a.effects.available_credit>0||a.effects.business_credit_limit>0))u+=10;if(a.id==='bank_personal_loan'||a.id==='policy_loan'||a.id==='business_credit_line')u+=15;}
if((s.total_debt||0)>20000&&(a.id==='debt_restructure'||a.id==='pay_down_debt'))u+=8;
if(this.calcPersUtil()>50&&(a.id==='debt_restructure'||a.id==='build_personal_credit'||a.id==='business_credit_line'))u+=8;
if((s.leads||0)>15&&(a.id==='email_campaign'||a.id==='webinar_funnel'))u+=8;
if((s.team_size||0)>=4&&!s._completed_actions.includes('middle_management')&&a.id==='middle_management')u+=10;
if((s.customer_base||0)<5&&(a.effects&&a.effects.leads>0||a.effects&&a.effects.customer_base>0))u+=8;
if(s.energy<30&&a.energy_cost<0)u+=5;
// generic tiebreak so an auto-pick always has a sensible default: reward growth/value effects, freshness; avoid pricey or low-impact
const ef=a.effects||{};if(ef.leads>0)u+=2;if(ef.customer_base>0)u+=2;if(ef.brand_equity>0)u+=1;if(ef.systems_maturity>0)u+=1;if(ef.key_person_dependency<0)u+=2;if(ef.other_monthly_revenue>0)u+=3;
if(this.isActionOutgrown&&this.isActionOutgrown(a))u-=4;
if((s._action_counts||{})[a.id])u-=Math.min(3,(s._action_counts[a.id]));
return u;},
// Reverse prerequisite map: actionId → [ids of actions that list it in their `needs` gate]. Built once. Lets the auto-pilot recognize a "gateway" move that unlocks other actions.
_neededBy(id){if(!this.__neededBy){const m={};const all=[].concat(CONFIG.actions_marketing.actions,CONFIG.actions_operations.actions,CONFIG.actions_finance.actions);for(const b of all){const n=(b.prerequisites&&b.prerequisites.needs)||[];for(const nid of n)(m[nid]=m[nid]||[]).push(b.id);}this.__neededBy=m;}return this.__neededBy[id]||[];},
// A not-yet-taken action is a "gateway" when some other action is gated behind completing it (`needs`). Completing it once builds out the tree, so the auto-pilot should prioritize it over repeating a grind.
_isGateway(a){return !(this.state._completed_actions||[]).includes(a.id)&&this._neededBy(a.id).length>0;},
// ORG CAPACITY — how big a team your infrastructure can actually carry. The founder alone leads only a handful: finite bandwidth, narrow span of control, and (honestly) a builder's lack of large-team LEADERSHIP skill — the skills that won early customers aren't the skills to lead 50. Systems extend the founder's reach but cap out (~8 solo: you're still the single bottleneck). Real scale comes from MANAGEMENT — hiring people who bring the leadership the founder doesn't have. Strong culture lets people self-manage. Team beyond this = "management debt".
_orgCapacity(){const s=this.state,c=id=>(s._completed_actions||[]).includes(id),sys=s.systems_maturity||0;
 const founderBase=3;/* a founder personally leads only a few people well */
 const founderCeiling=Math.min(5,sys/20);/* systems extend your reach — but only so far (~8 solo max); you're not a trained large-team leader */
 const sysMult=1+sys/100;/* systems make each real manager more effective */
 let mgmt=0;if(c('middle_management'))mgmt+=5;if(c('full_systemization'))mgmt+=6;if(c('hire_hr_manager'))mgmt+=5;if(s._mgr_marketing)mgmt+=5;if(s._coo_hired)mgmt+=6;
 const cultureBonus=Math.max(0,((s.company_culture==null?45:s.company_culture)-45)/12);/* high culture = people self-manage, less oversight needed */
 return Math.round((founderBase+founderCeiling+mgmt*sysMult+cultureBonus)*10)/10;},
_orgOverextension(){return Math.max(0,(this.state.team_size||0)-this._orgCapacity());},
// "Go big" plays that backfire if your SYSTEMS can't absorb the demand/scale. Value = the systems_maturity you need before they pay off instead of setting you back.
_SCALE_TRAPS:{national_ad_blitz:55,influencer_megadeal:50,franchise_licensing:60,rapid_offshore_scaleup:45},
// MACRO CYCLE — the economy moves in a readable loop: Expansion → Boom → Downturn → Recovery → … Each phase sets the drivers the finance game keys off: the IUL index credit (0% floor in a bust, capped in a boom), market interest rates (variable-loan & credit cost), asset prices (cheap in a downturn = the buying opportunity), and credit availability (frozen in a bust). Booms precede busts — that's the lesson: prepare while it's good, act when it turns. Returns/durations carry mild randomness so timing isn't a metronome, but the ORDER is learnable.
_CYCLE_PHASES:{expansion:{idx:0.09,rate:0.045,asset:1.0,tight:false,rev:1.0,dur:[5,8],tell:'📈 Expansion — steady growth. Build your war chest and keep leverage conservative; the cycle always turns.'},boom:{idx:0.12,rate:0.065,asset:1.14,tight:false,rev:1.06,dur:[3,5],tell:'🔥 Boom — markets are hot and assets are pricey (don’t overpay), rates are climbing, and recruiters are circling your people. Booms precede busts — get liquid and ready.'},downturn:{idx:0.0,rate:0.055,asset:0.74,tight:true,rev:0.85,dur:[3,6],tell:'📉 Downturn — assets are ON SALE and forced sellers are everywhere, but credit is freezing up. If you prepared (funded policy, reserves, low leverage) this is when fortunes are made; if you over-borrowed, this is the squeeze.'},recovery:{idx:0.11,rate:0.035,asset:0.9,tight:false,rev:0.96,dur:[4,6],tell:'🌱 Recovery — the rebound. The ones who bought the dip are watching it pay off; rates are low and credit is loosening again.'}},
_advanceMarketCycle(){const s=this.state;
 // ONE compressed cycle across the 3-year game, shaped like real life: a calm expansion, a frothy boom, then THE downturn (~year 2) and a recovery. The downturn is INEVITABLE but jittered — its month and depth are rolled once per run — so the lesson always lands but can't be timed. You know a bust is coming; you just don't know exactly when. Stay ready.
 if(s._downturn_start==null){s._downturn_start=14+Math.floor(Math.random()*8);/* hits month 14-21 */s._downturn_len=4+Math.floor(Math.random()*4);/* lasts 4-7 months */s._downturn_depth=0.8+Math.random()*0.5;/* severity 0.8-1.3 */}
 const m=this.month||1,ds=s._downturn_start,de=ds+s._downturn_len,boomStart=ds-4,depth=s._downturn_depth||1;
 let phase;if(m<boomStart)phase='expansion';else if(m<ds)phase='boom';else if(m<de)phase='downturn';else phase='recovery';
 const P=this._CYCLE_PHASES[phase];
 s._index_return=(phase==='downturn')?0:Math.max(0,Math.min(0.12,P.idx+(Math.random()-0.5)*0.03))/12;/* monthly IUL credit: TRUE 0% in a bust (the floor — no growth while your loan keeps compounding), else up to ~12% cap */
 s._market_rate=Math.round((P.rate+(P.tight?0.015:0)+(Math.random()-0.5)*0.008)*1000)/1000;/* variable loan / credit rate — ticks up when credit tightens */
 s._asset_discount=(phase==='downturn')?Math.max(0.6,1-0.26*depth):P.asset;/* deeper bust = cheaper assets */
 s._credit_tight=P.tight;s._cycle={phase:phase};
 s._market_cycle=(phase==='boom')?'boom':(phase==='downturn')?'recession':'normal';/* back-compat with existing event scaling */
 // Telegraph: once per phase turn, PLUS an escalating warning in the last boom month before the bust — the signs are there if you read them.
 // The current phase is shown persistently in the econ-signal bar above the category icons, so we no longer push a per-phase narrative ripple here (avoids a duplicate economic message). The escalating pre-bust warning below still fires — it's a distinct, can't-miss alert.
 if(s._cycle_phase_shown!==phase){s._cycle_phase_shown=phase;s._econ_phase_since=m;}/* stamp when this phase began — drives the econ banner's auto-expand window */
 else if(phase==='boom'&&m>=ds-1&&!s._cycle_warned){s._cycle_warned=true;s._pendingRipples=(s._pendingRipples||[]).concat([{source:'The Market',narrative:'⚠️ The market is overheating — rates climbing, valuations stretched, everyone euphoric. A turn is coming; you can feel it. Get liquid, trim leverage, keep your powder dry.'}]);}
 return phase;},
// DRY POWDER — the capital you can actually deploy in a frozen credit market (the buy-the-dip fuel). In a downturn banks won't lend, so what counts is your POLICY cash value (borrowable tax-free, no credit check, untouched by the crash thanks to the 0% floor) and the CASH RESERVES you kept liquid instead of over-extending. Credit lines are deliberately excluded — that's the lesson: the prepared act, the over-leveraged are frozen out.
_dryPowder(){const s=this.state;
 const policy=Math.max(0,Math.round(0.9*(s.insurance_cash_value||0)-(s.insurance_loan_balance||0)));/* up to ~90% of cash value, less any existing loan */
 const burn=Math.max(0,this.calcMonthlyBurn());const cash=Math.max(0,Math.round((s.cash||0)+(s.personal_cash||0)-burn));/* keep ~1 month of operating cash back */
 return {policy:policy,cash:cash,total:policy+cash};},
// Best stage-available action within one ADIR function group (excluding hires) — used by delegation specialists to run "their function" each month.
_bestInGroup(cat,grpName){const grp=(ADIR[cat]||[]).find(g=>g[0]===grpName);if(!grp)return null;const ids=grp[1];const acts=this.getAvailableActions(cat).filter(a=>ids.includes(a.id)&&!/^(hire_|promote_)/.test(a.id)&&!this.isActionLocked(a));if(!acts.length)return null;return acts.slice().sort((a,b)=>this._actionValue(b,cat)-this._actionValue(a,cat))[0];},
// Golden-path / handler-based payoffs that live in resolveMonth, not config effects — valued explicitly so executives chase real wealth-building (passive income highest, per DESIGN.md).
_HV:{activate_passive_income:95000,fund_accumulation_policy:62000,buy_real_estate:72000,private_equity_fund:66000,private_lending:60000,premium_financing:52000,acquire_competitor:55000,private_banking:46000,setup_family_office:44000,dynasty_trust:42000,elect_s_corp:40000,debt_restructure:38000,combined_insurance:30000,business_credit_line:26000,bank_personal_loan:24000,banking_relationship:22000,monthly_tax_reserve:18000,advanced_tax_strategy:30000,asset_protection_stack:28000},
// Rough value of a (possibly locked) action without recursing back into _actionValue — used to decide which locked targets are worth working toward.
_lockedTargetValue(L,cat){let v=this._HV[L.id]||0;const ef=this.scaleActionEffects(L.effects||{},cat);v+=(ef.other_monthly_revenue||0)*6000+(ef.customer_base||0)*800+(ef.revenue_capacity||0)*1.2+(ef.brand_equity||0)*250+(ef.systems_maturity||0)*180+(ef.team_size||0)*1200+(ef.insurance_cash_value||0)*0.5+(ef.dscr||0)*2500;return v;},
// If `a` advances the prerequisites of a LOCKED, high-value action in this track, reward it — so the execs build TOWARD the unlock (raise brand for the national ad blitz, elect S-Corp for the wealth tier, hit the systems threshold for vertical integration) instead of only ever taking what's already open.
_unlockBonus(a,cat){const s=this.state,pool=this.getAvailableActions(cat)||[],ef=this.scaleActionEffects(a.effects||{},cat),aef=a.effects||{};let bonus=0;
 for(const L of pool){if(L.id===a.id||this.isActionCompleted(L)||!this.isActionLocked(L))continue;const Lval=this._lockedTargetValue(L,cat);if(Lval<10000)continue;/* only chase genuinely worthwhile targets */
  const pr=L.prerequisites||{};let weight=0;
  if(pr.needs&&pr.needs.includes(a.id))weight=1;/* a clears a needs-gate — decisive */
  for(const k in pr){
   if(k.endsWith('_gte')){const stat=k.replace('_gte','');const gap=pr[k]-(s[stat]||0);if(gap>0&&(ef[stat]||0)>0)weight=Math.max(weight,Math.min(1,(ef[stat]||0)/gap));}/* weight by the FRACTION of the remaining gap this move closes — the action that crosses the threshold beats one that only nudges it */
   else if(k==='entity_structure'||k==='entity_structure_in'){const want=k==='entity_structure'?[pr[k]]:pr[k];if(aef.entity_structure&&want.includes(aef.entity_structure))weight=1;}
   else if(k==='business_credit_profile'){if(aef.business_credit_profile===pr[k])weight=1;}
  }
  if(weight>0)bonus+=Math.min(Lval,80000)*0.22*weight;
 }
 return Math.min(bonus,32000);},
// Estimate an action's real value (projected, scaled impact) so an executive auto-pick lands on a genuinely high-leverage move, not a random low-value one.
_actionValue(a,cat){const s=this.state,ef=this.scaleActionEffects(a.effects||{},cat);let v=0;
v+=(ef.customer_base||0)*800;v+=(ef.leads||0)*150;v+=(ef.brand_equity||0)*250;v+=(ef.revenue_capacity||0)*1.2;v+=(ef.systems_maturity||0)*320;v+=(ef.other_monthly_revenue||0)*6000;v+=(ef.team_size||0)*((s.team_size||0)>=8?-700:300);v+=(ef.sales_conversion||0)*400;v+=(ef.dscr||0)*2500;v+=(ef.insurance_cash_value||0)*0.5;
// Systems matter more than people now — they set the revenue ceiling and tame management debt. Headcount past a lean ~8 is a LIABILITY (coordination/churn/people problems), so adding bodies there scores negative.
v+=(ef.personal_credit_score||0)*250*Math.max(0,Math.min(1,(760-(s.personal_credit_score||600))/200)); // credit gains worthless once your score is already high
v+=(ef.available_credit||0)*0.15*Math.max(0.2,Math.min(1,1-(s.cash||0)/200000));v+=(ef.business_credit_limit||0)*0.12*Math.max(0.2,Math.min(1,1-(s.cash||0)/200000)); // more credit matters less when flush with cash
v-=(ef.key_person_dependency||0)*200;v-=(ef.churn_rate||0)*30000;v-=(ef.audit_risk||0)*120;v-=(ef.operating_expenses||0)*0.4;
// Company culture: the COO invests in it — weighted heavily when it's slipping (so benefits/equity get picked) and lightly when healthy; culture-destroying moves get penalized the same way.
{const _cul=s.company_culture==null?45:s.company_culture;v+=(ef.company_culture||0)*(120+Math.max(0,55-_cul)*22);}
v-=(a.cash_cost||0)*0.2;v-=Math.max(0,a.energy_cost||0)*120;
// Recurring monthly cost is the real burden (e.g. Rapid Offshore Scale-Up adds $12k/mo in payroll) — weigh several months of it, scaled down a touch when the business easily covers it, so the auto-pilot doesn't load up on ongoing burn it doesn't need.
if(a.recurring_cost){const profit=Math.max(0,(s.monthly_revenue||0)-(s.cogs||0)-(s.operating_expenses||0));const ease=Math.max(0.35,Math.min(1,1-profit/120000));v-=a.recurring_cost*4*ease;}
// Golden-path / handler-based moves carry their payoff in resolveMonth, not in config effects — value them explicitly so executives prioritize real wealth-building (passive income highest, per DESIGN.md).
const HV=this._HV;
if(HV[a.id]!==undefined)v+=HV[a.id];
v+=this._unlockBonus(a,cat);// reward progress toward a locked high-value action in this track (build the prerequisite, hit the stat gate) so the execs work their way up, not just sideways
{const st=this._SCALE_TRAPS[a.id];if(st!==undefined){const sysGap=st-(s.systems_maturity||0);if(sysGap>0)v-=900*sysGap;}}// a "go big" play before your systems can deliver is a trap — heavily avoid it until you've systematized (then it's a real scaling move)
v+=this._actionUrgency(a)*60; // fold in situational urgency
const cnt=(s._action_counts||{})[a.id]||0;v*=Math.max(0.22,1-cnt*0.22); // steeper repeat decay so the auto-pilot stops hammering one repeatable when fresh moves are still on the table
if((s._exec_last||{})[cat]===a.id)v*=0.2; // hard demote the exact move the execs ran LAST month for this track → they rotate (content engine ↔ sales team ↔ ...) instead of spamming the same one every turn
if(this.isActionOutgrown(a))v*=0.3;
if(a.one_time&&!cnt)v*=1.35; // fresh one-time unlocks are worth grabbing
if(this._isGateway(a))v+=14000; // completing this clears a `needs` gate blocking other actions — build out the prerequisite tree before grinding
v*=(a.success_rate||0.7);
return v;},
// Cash already committed by this month's other selected actions (so per-category auto-picks don't collectively overspend).
_committedCash(exceptCat){let t=0;for(const c in (this.selectedActions||{})){if(c===exceptCat||c==='lifestyle')continue;const a=this.selectedActions[c];if(a)t+=this.actionCashCost(a)||0;}return t;},
// Would taking `a` (on top of already-committed spend) still leave a safety runway? Keeps auto/delegated play from bankrupting the month.
_fitsRunway(a,cat){const s=this.state;const bizAvail=Math.max(0,(s.business_credit_limit||0)-(s.business_credit_used||0));const liquidity=(s.cash||0)+(s.available_credit||0)+bizAvail;const burn=this.calcMonthlyBurn?this.calcMonthlyBurn():2500;const reserve=Math.max(2500,Math.round(burn));return this._committedCash(cat)+(this.actionCashCost(a)||0)<=liquidity-reserve;},
bestAction(cat){const acts=this.getAvailableActions(cat).filter(a=>!this.isActionCompleted(a)&&!this.isActionLocked(a)&&!['hire_sales_manager','hire_ops_manager','hire_cfo','establish_board','epic_life_membership','iul_variable_loan','open_db_plan_pretax','merchant_cash_advance'].includes(a.id));if(!acts.length)return null;/* the variable loan, pre-tax DB plan, and the predatory MCA are deliberate high-stakes player choices — never auto-picked (the safe default is what the team runs) */
// An exec offers its own full-time promotion the moment it's available & affordable — a strategic upgrade, not a repeatable grind.
const promo=acts.find(a=>/^promote_(cro|coo|cfo)_fulltime$/.test(a.id));if(promo&&this.canAfford(promo)&&this._fitsRunway(promo,cat))return promo;
// The CFO does its job in order before chasing wealth: separate the business, protect it, get the tax structure right, build the business-credit identity — these are the milestones execs were skipping.
if(cat==='finance'){const ladder=['establish_business','combined_insurance','asset_protection_stack','elect_s_corp','advanced_tax_strategy','monthly_tax_reserve','build_dnb_profile','debt_restructure'];for(const id of ladder){const a=acts.find(x=>x.id===id);if(!a||!this.canAfford(a))continue;if(id==='debt_restructure'){if(this.calcPersUtil()<=45)continue;/* restructure's job is to move PERSONAL revolving debt down — only do it when personal utilization is actually high, not every month (when util is low there's nothing to restructure and it just balloons the credit line). Capital-positive, so runway-exempt. */return a;}if(this._fitsRunway(a,cat))return a;}}
// COO protects the team: when culture is slipping, build it (equity grant preferred, else a benefits package) before anything else available.
if(cat==='operations'&&(this.state.team_size||0)>0){const _cul=this.state.company_culture==null?45:this.state.company_culture;if(_cul<45){const a=acts.find(x=>x.id==='grant_stock_incentives')||acts.find(x=>x.id==='build_benefits_package');if(a&&this.canAfford(a)&&this._fitsRunway(a,cat))return a;}}
const sorted=acts.slice().sort((a,b)=>this._actionValue(b,cat)-this._actionValue(a,cat));
// Prefer the highest-value move that still leaves a runway; if nothing fits, take the highest-value action that's still outright affordable; only if even that fails, the cheapest available (keeps the month moving without an overspend bankruptcy).
return sorted.find(a=>this._fitsRunway(a,cat))||sorted.find(a=>this.canAfford(a))||acts.slice().sort((a,b)=>(this.actionCashCost(a)||0)-(this.actionCashCost(b)||0))[0];},
_setupActionMenu(){const s=this.state;this._autoPicked={};this._paymentMethods=this._paymentMethods||{};
const autoCat=(cat,flag)=>{if(!flag)return;const b=this.bestAction(cat);if(b){this.selectedActions[cat]=b;this._paymentMethods[b.id]=this._paymentMethods[b.id]||'cash';this._autoPicked[cat]=b.id;}};
autoCat('marketing',s._cro_hired);autoCat('operations',s._coo_hired);
this._cfoPick=s._cfo_hired?((this.bestAction('finance')||{}).id||null):null;
// open the accordion group containing each officer's pick so its badge is visible
this._openDir=this._openDir||{};const grpOf=(cat,id)=>{const dirs=ADIR[cat]||[];for(const g of dirs)if(g[1].includes(id))return g[0];return null;};
if(this._autoPicked.marketing){const gn=grpOf('marketing',this._autoPicked.marketing);if(gn)this._openDir.marketing=gn;}
if(this._autoPicked.operations){const gn=grpOf('operations',this._autoPicked.operations);if(gn)this._openDir.operations=gn;}
if(this._cfoPick){const gn=grpOf('finance',this._cfoPick);if(gn)this._openDir.finance=gn;}
// Life-action cadence scales with how hands-off you've made the business: a full board frees you EVERY month, a full C-suite every OTHER month, otherwise the default quarterly check-in.
// Safety valve: if you're running low on energy, the Life check-in opens off-cadence so you can always choose to recover (financeable if cash is tight).
const _allExec=s._cro_hired&&s._coo_hired;
const _lifeOpen=s._board_active?true:((_allExec?(this.month%2===0):this._isQuarterlyMonth)||(s.energy||0)<=30);
const base=_lifeOpen?['marketing','operations','finance','lifestyle']:['marketing','operations','finance'];
const allExec=s._cro_hired&&s._coo_hired;
if(allExec&&this._focusMode!==false){this._activeCats=base.filter(c=>c!=='marketing'&&c!=='operations');if(!this._activeCats.includes(this.currentCategory))this.currentCategory='finance';}
else this._activeCats=base;},
toggleFocus(){this._focusMode=this._focusMode===false?true:false;this._setupActionMenu();this.renderStepIndicator();this.renderCategoryTabs();this.renderActions();this.updateConfirmButton();},
_bestLifestyle(){const s=this.state,subs={health:s.lifestyle_health||0,relationships:s.lifestyle_relationships||0,experiences:s.lifestyle_experiences||0,spiritual:s.lifestyle_spiritual||0,philanthropy:s.lifestyle_philanthropy||0,legacy:s.lifestyle_legacy||0};const opts=(CONFIG.lifestyle_options.actions||[]).filter(a=>((this.isSeparated()&&this.lifeActionIsPersonal(a))?(s.personal_cash||0):(s.cash||0))>=(a.cash_cost||0));if(!opts.length)return null;const score=a=>{let v=0;const ef=a.effects||{};for(const k in ef){if(typeof ef[k]==='number'&&(k.indexOf('lifestyle_')===0||k==='energy'||k==='fitness_level'))v+=ef[k];}v+=(100-(subs[a.subcategory]||0))*0.5;const cnt=(s._action_counts||{})[a.id]||0;v*=Math.max(0.5,1-cnt*0.2);return v;};return opts.slice().sort((a,b)=>score(b)-score(a))[0];},
// Epic Life Membership — finance actions the concierge runs for you (so the player no longer picks them manually).
EPIC_HANDLED:['wyoming_holding_llc','asset_protection_stack','combined_insurance','debt_restructure','build_personal_credit','pay_down_debt','banking_relationship','fund_accumulation_policy','activate_passive_income','policy_loan'],
EPIC_ONLY:['velocity_banking'],/* exclusive members-only plays — visible in the menu as an Epic perk, but the control & mechanism stay locked until you join */
_epicHandled(a){return !!this.state._epic_life&&this.EPIC_HANDLED.includes(a.id)&&!this.isActionCompleted(a);},
_epicOnlyLocked(a){return this.EPIC_ONLY.includes(a.id)&&!this.state._epic_life;},
// Each month pick the single highest-priority financial move that's genuinely needed, available (prereqs met) and comfortably affordable. Returns a cloned action flagged _epic, or null. Executed as an extra action in resolveMonth and attributed to the membership.
_epicLifePick(){const s=this.state,fin=id=>CONFIG.actions_finance.actions.find(a=>a.id===id),util=this.calcPersUtil();
const persRev=()=>Math.max(0,(s.total_debt||0)-(s._installment_debt||0)-(s.business_credit_used||0)-(s.business_installment_debt||0)-(s.real_estate_debt||0));
const profit=()=>Math.max(0,(s.monthly_revenue||0)-(s.cogs||0)-(s.operating_expenses||0));
// Hard mode (Stuck owner): hold the expensive protective setup until the business is genuinely stable — don't bypass the dig-out or accelerate insolvency.
const stuck=this.archetype&&this.archetype.id==='stuck',stable=(s.credit_negatives||0)===0&&profit()>3000;
const specs=[
 // 1. Fix credit first — it's the gate to everything else, and the player can't do these manually while Epic is active.
 {id:'build_personal_credit',need:()=>(s.credit_negatives||0)>0&&!s._credit_repair},
 // 2. Debt restructure EARLY — its job is to get utilization down, and it doesn't need a holding company or a bank yet. But only run it when the client would actually be APPROVED — otherwise it's a wasted, declined application every month.
 {id:'debt_restructure',need:()=>util>45&&persRev()>2000&&this._restructureApprovalChance()>=0.5},
 {id:'pay_down_debt',need:()=>util>30&&(s.cash||0)>2000},
 // PROTECTION — insurance, the holding company, then a banking relationship. Together these give you structure plus MULTIPLE sources of lending, so a downturn can't freeze you out.
 {id:'combined_insurance',need:()=>this.isSeparated()&&(!stuck||stable)},
 {id:'wyoming_holding_llc',need:()=>this.isSeparated()&&(!stuck||stable)},
 // Banking relationship comes after you're insured + structured (the bank sees a clean, protected profile) — your lending-access safety net for downturns.
 {id:'banking_relationship',once:true,need:()=>(!!s._holding_company||(s._completed_actions||[]).includes('wyoming_holding_llc'))&&(s._completed_actions||[]).includes('combined_insurance')},
 // WEALTH — fund the cash-value policy (which also covers your taxes via a tax-free loan), then switch on passive income.
 {id:'fund_accumulation_policy',need:()=>profit()>3000},
 {id:'activate_passive_income',need:()=>(s.insurance_cash_value||0)>5000&&!s._passive_income_active},
];
// Cash-reserve guardrail: Epic spends only from CASH (never credit) and never below ~1 month of core expenses — so it can't drain you or quietly add debt.
const reserve=Math.round((s.operating_expenses||0)+(s.cogs||0)+(s.living_expenses||0)+(s.lifestyle_expenses||0));
for(const spec of specs){const a=fin(spec.id);if(!a)continue;
 if((a.one_time||spec.once)&&(s._completed_actions||[]).includes(a.id))continue;
 if(!this.meetsReq(a.prerequisites||{}))continue;
 if(!spec.need())continue;
 // Effective cost to the member: concierge-waived setup actions (debt restructure, LLC, credit repair) are FREE — so the cash-reserve guardrail must not block them. debt_restructure in particular is a capital-injection rescue (new business line + working cash) and is exactly what a cash-starved member needs.
 const cost=EPIC_WAIVED.includes(a.id)?0:this.actionCashCost(a);
 if(cost>0&&(s.cash||0)-cost<reserve)continue; // wait until you can pay from cash and still keep a month's cushion
 const perk=Object.assign({},a);perk._epic=true;perk.success_rate=2;perk.energy_cost=0;
 // Concierge covers advisory/setup fees in-house — the member pays nothing; record the would-be professional fee to surface as savings.
 if(EPIC_WAIVED.includes(a.id)){perk.cash_cost=0;perk._waivedFee=this._epicServiceFee(a.id);}
 return perk;}
return null;},
boardRunMonth(){const s=this.state;if(!s._board_active)return;const delegFin=this._canDelegateFinance();if(delegFin&&!this.selectedActions['finance']){const f=this.bestAction('finance');if(f){this.selectedActions['finance']=f;this._paymentMethods=this._paymentMethods||{};this._paymentMethods[f.id]='cash';}}
if(!delegFin&&this._hasRequiredFinance()&&!this.selectedActions['finance']){if(this.currentCategory!=='finance')this.switchCategory('finance');this._focusActionList();this.showPopup('💰 Your call — the Finance move','The money decisions stay yours until you reach the <strong>Wealth stage</strong> in Finance (or switch on passive income). Pick this month\'s finance move below.');return;}
if((this._activeCats||[]).includes('lifestyle')&&!this.selectedActions['lifestyle']){const l=this._bestLifestyle();if(l){this.selectedActions['lifestyle']=l;this._paymentMethods[l.id]='cash';}}this.resolveMonth();},
renderActions(){const actions=this.getAvailableActions(this.currentCategory).filter(a=>!this._epicHandled(a)&&a.id!=='epic_life_membership'),sel=this.selectedActions[this.currentCategory];this._cfoHintShown=false;
const urgency=a=>this._actionUrgency(a);
// Each action's direction-group name, shown as a tag on the card (replaces the old collapsible groups).
const _grpOf={};for(const grp of (ADIR[this.currentCategory]||[]))for(const id of grp[1])_grpOf[id]=grp[0];
const card=a=>{const done=this.isActionCompleted(a),locked=this.isActionLocked(a),isSel=sel&&sel.id===a.id;const reason=done?'Already completed':locked?this.getLockedReason(a):'';const outgrown=!done&&!locked&&this.isActionOutgrown(a);const rc=(this.state._action_counts||{})[a.id]||0;const takenBefore=!done&&!a.one_time&&rc>0&&!isSel;
const cls=done?'completed-action':isSel?'selected':locked?'locked':takenBefore?'taken-before':'';const onclick=(locked||done)?'':"Game.selectActionPayment('"+this.currentCategory+"','"+a.id+"')";const desc=this.linkTerms(a.description);const repeatBadge=(!a.one_time&&rc>0&&!isSel)?'<span class="repeat-badge">✓ done ×'+rc+'</span>':'';const isNew=!done&&!locked&&this.state._action_new_month&&this.state._action_new_month[a.id]===this.month;const newBadge=isNew?'<span class="new-badge">NEW</span>':'';
const isPartial=!done&&!locked&&this.state._partial_actions&&this.state._partial_actions[a.id];const partialBadge=isPartial?'<span class="new-badge" style="background:var(--gold);color:#1a1205;">↻ RETRY — HALF COST</span>':'';
const rehireBadge=(!done&&!locked&&this.state._rehire&&this.state._rehire[a.id])?'<span class="new-badge" style="background:var(--orange);color:#1a1205;">↻ REHIRE</span>':'';
// Prerequisite marker: this action is a gate for other actions still to come. Mark it so the player knows it opens up the tree (tooltip lists what it unlocks).
const _unlocks=(!done&&this._isGateway(a))?this._neededBy(a.id).filter(id=>!(this.state._completed_actions||[]).includes(id)):[];
const unlockBadge=_unlocks.length?'<span class="new-badge" style="background:var(--blue);color:#fff;" title="Completing this unlocks: '+_unlocks.map(id=>this._esc(this.actionLabel(id)||id)).join(', ')+'">🔑 UNLOCKS'+(_unlocks.length>1?' '+_unlocks.length:'')+'</span>':'';
const cat0=this.currentCategory;const offBadge=(this._autoPicked&&this._autoPicked[cat0]===a.id)?'<span class="new-badge" style="background:var(--gold);color:#1a1205;">'+(cat0==='marketing'?'CRO pick':'COO pick')+'</span>':((cat0==='finance'&&this._cfoPick===a.id)?'<span class="new-badge" style="background:var(--blue);color:#fff;">CFO ★</span>':'');
const _cc=this.actionCashCost(a);const needsCredit=!done&&!locked&&_cc&&this.state.cash<_cc&&(this.state.cash+(this.state.available_credit||0))>=_cc;
const selBadge=isSel?'<span class="new-badge" style="background:var(--accent);color:#04130d;">✓ SELECTED</span>':'';
const grpName=_grpOf[a.id];const grpTag=grpName?'<span class="group-tag">'+grpName+'</span>':'';
// Top row: group name + status badges (NEW / RETRY / SELECTED / picks) together on one line.
const rescueBadge=(!done&&!locked&&a.id==='restructure_team'&&this._needsRestructure())?'<span class="new-badge" style="background:var(--red);color:#fff;">'+(this.state._toxic_closer?'⚠ FIRE THE CLOSER':'⚠ CUT PAYROLL — FIX THIS')+'</span>':'';
const topInner=grpTag+rescueBadge+rehireBadge+unlockBadge+selBadge+partialBadge+offBadge+newBadge+repeatBadge;const topRow=topInner?'<div class="card-toprow">'+topInner+'</div>':'';
return'<div class="action-card '+cls+(isNew?' is-new':'')+' fade-in" style="'+(outgrown?'opacity:0.6;':'')+'" onclick="'+onclick+'">'+topRow+'<h4>'+a.label+'</h4><p>'+desc+'</p>'+(!done?this.actionPreview(a):'')+'<div class="action-costs">'+
(a.id==='pay_down_debt'?(()=>{const pl=this._debtPaydownPlan(),est=pl.payRev+pl.payLoan;
// est=$0 has two very different causes — don't lump them as "already healthy". If utilization/DTI is high but you have no spare cash, say so (you're stuck, not fine).
if(est>0)return '<span class="cost-tag cost-cash">💵 ~'+this.fmt(est)+'</span>';
const unhealthy=this.calcPersUtil()>30||this.calcDTI()>30;
return '<span class="cost-tag cost-locked">'+(unhealthy?'⚠ no spare cash':'already healthy')+'</span>';})():
// Restructure's cost is dynamic (severance scales with heads cut; firing a toxic closer means a legal/settlement bill) — preview it like pay_down_debt.
a.id==='restructure_team'?(()=>{const s=this.state;if(s._toxic_closer)return '<span class="cost-tag cost-cash">💵 ~'+this.fmt(12000)+' legal</span>';const cut=Math.min(s.team_size||0,4);return cut>0?'<span class="cost-tag cost-cash">💵 ~'+this.fmt(cut*1500)+' severance</span>':'';})():
// MCA is repaid as a % of revenue until cleared — show the holdback terms instead of a fixed cost.
a.id==='fast_working_capital'?'<span class="cost-tag cost-recurring" title="repaid as a share of revenue until cleared">🔁 '+Math.round((a.mca_holdback||0.2)*100)+'% of revenue till repaid</span>':
(_cc?'<span class="cost-tag cost-cash">💵 '+this.fmt(_cc)+'</span>':''))+
((this.actionEnergyCost(a))>0?'<span class="cost-tag cost-energy">⚡'+this.actionEnergyCost(a)+'</span>':'')+
(a.energy_cost<0?'<span class="cost-tag cost-energy-gain">⚡+'+Math.abs(a.energy_cost)+'</span>':'')+
(a.recurring_cost?'<span class="cost-tag cost-recurring" title="recurring monthly cost">🔁 💵'+a.recurring_cost+'/mo</span>':'')+
(()=>{const MGR=['hire_sales_manager','hire_ops_manager','hire_cfo'];const s=this.state,mgr=Math.round(Math.max(2500,Math.min(4500,2500+(s.monthly_revenue||0)*0.015)));const amt=a.id==='hire_cfo'?Math.round(mgr*0.6):MGR.includes(a.id)?mgr:0;return amt?'<span class="cost-tag cost-recurring" title="ongoing manager pay — scales with your revenue">🔁 ~'+this.fmt(amt)+'/mo pay</span>':'';})()+
(needsCredit?'<span class="cost-tag" style="background:rgba(59,130,246,0.15);color:var(--blue)">credit available</span>':'')+
(!done&&!locked&&CREDIT_APPROVAL.includes(a.id)?(()=>{const isLoan=LOAN_APPROVAL.includes(a.id),isRestr=a.id==='debt_restructure',ch=isRestr?this._restructureApprovalChance():this._creditApprovalChance(isLoan);if(ch>=0.6)return '';/* decent odds — no clutter, just let them apply */const msg=ch<0.35?'Approval unlikely right now':'Approval not guaranteed';return '<span class="cost-tag" style="background:rgba(239,68,68,0.12);color:var(--red);" title="'+(isRestr?'this qualifies you for a business line AND a working-capital loan — underwritten on both your utilization and DTI':(isLoan?'term loans are underwritten on your debt-to-income (DTI)':'revolving credit is underwritten on your personal utilization'))+' + myFICO 3B — pay down balances / debt to improve your odds">⚠ '+msg+'</span>';})():'')+
(outgrown?'<span class="cost-tag" style="background:rgba(156,163,180,0.1);color:var(--text2);font-size:0.65rem;">lower impact</span>':'')+
(done?'<span class="cost-tag cost-done">✓ Done</span>':'')+
(!done&&locked?'<span class="cost-tag cost-locked">'+reason+'</span>':'')+
(isSel?(()=>{const te=this._turnEnergy(),col=te.left<0?'var(--red)':te.left<=15?'var(--gold)':'var(--accent)';return '<span class="cost-tag" style="margin-left:auto;background:rgba(127,127,127,0.12);color:'+col+';font-weight:700;">⚡ left: '+te.left+'</span>';})():'')+
'</div></div>';};
if(!this.state._actions_seen)this.state._actions_seen=[];if(!this.state._action_new_month)this.state._action_new_month={};actions.forEach(a=>{if(!this.isActionCompleted(a)&&!this.isActionLocked(a)&&!this.state._actions_seen.includes(a.id)){this.state._actions_seen.push(a.id);this.state._action_new_month[a.id]=this.month;}});
let listHtml='';
const hdr=t=>'<div style="padding:12px 0 6px;font-size:0.72rem;color:var(--gold);text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid var(--border);margin-top:6px;">'+t+'</div>';
const isPartialA=a=>this.state._partial_actions&&this.state._partial_actions[a.id],isNewA=a=>this.state._action_new_month&&this.state._action_new_month[a.id]===this.month;
// One flat list with group-name tags on each card. Order: retry (finish what you started) → NEW → other available (by urgency) → locked (unlocks next) → completed. The selected card stays in its natural spot (it doesn't jump to the top).
const _takenBefore=a=>!a.one_time&&((this.state._action_counts||{})[a.id]||0)>0;
const avail=actions.filter(a=>!this.isActionCompleted(a)&&!this.isActionLocked(a)).sort((a,b)=>{const pa=isPartialA(a)?1:0,pb=isPartialA(b)?1:0;if(pa!==pb)return pb-pa;const na=isNewA(a)?1:0,nb=isNewA(b)?1:0;if(na!==nb)return nb-na;const ta=_takenBefore(a)?1:0,tb=_takenBefore(b)?1:0;if(ta!==tb)return ta-tb;/* actions you've already run before sink below ones you haven't */return urgency(b)-urgency(a);});
const locked=actions.filter(a=>!this.isActionCompleted(a)&&this.isActionLocked(a));
const completed=actions.filter(a=>this.isActionCompleted(a));
const lockRow=a=>{const _gw=this._neededBy(a.id).some(id=>!(this.state._completed_actions||[]).includes(id));return '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:6px 12px;opacity:0.55;font-size:0.78rem;"><span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">🔒 '+a.label+(_gw?' <span title="prerequisite — unlocks more actions once taken" style="color:var(--blue);">🔑</span>':'')+(_grpOf[a.id]?' <span class="group-tag" style="opacity:0.8;">'+_grpOf[a.id]+'</span>':'')+'</span><span style="color:var(--text2);font-size:0.68rem;text-align:right;flex-shrink:0;">'+this.getLockedReason(a)+'</span></div>';};
listHtml+=avail.length?avail.map(card).join(''):'<div style="text-align:center;padding:14px;color:var(--text2);font-size:0.8rem;">No moves available here right now.</div>';
if(locked.length)listHtml+='<div style="padding:10px 12px 2px;font-size:0.66rem;color:var(--text2);text-transform:uppercase;letter-spacing:0.5px;opacity:0.7;">Unlocks next</div>'+locked.map(lockRow).join('');
if(completed.length){if(this._showAllActions)listHtml+=hdr('Completed')+completed.map(card).join('')+'<div style="text-align:center;padding:10px;"><span style="color:var(--text2);cursor:pointer;font-size:0.85rem;" onclick="Game._showAllActions=false;Game.renderActions();">Show less ▴</span></div>';else listHtml+='<div style="text-align:center;padding:10px;"><span style="color:var(--text2);cursor:pointer;font-size:0.85rem;" onclick="Game._showAllActions=true;Game.renderActions();">Show '+completed.length+' completed ▾</span></div>';}
// Unified "Your Team's Plan" panel — one place that shows every exec's pick (and the board/lifestyle), with a single button to run the month. Replaces the old separate focus-toggle + board-button.
const s2=this.state,allExec=s2._cro_hired&&s2._coo_hired,teamMode=allExec||s2._board_active;let banner='';
if(teamMode){const roleRow=(emoji,role,c,recId)=>{const selA=this.selectedActions[c],isAuto=selA&&(this._autoPicked||{})[c]===selA.id,id=selA?selA.id:recId,lbl=id?this.actionLabel(id):'standing pat',tag=(selA&&!isAuto)?'<span style="color:var(--accent);font-size:0.64rem;">your pick</span>':(id?'<span style="color:var(--text2);font-size:0.64rem;">'+role+'’s pick</span>':'');return '<div style="display:flex;justify-content:space-between;gap:8px;font-size:0.76rem;padding:3px 0;border-bottom:1px solid rgba(127,127,127,0.1);"><span style="color:var(--text2);white-space:nowrap;">'+emoji+' '+role+'</span><span style="text-align:right;min-width:0;"><span style="color:var(--text);">'+lbl+'</span> '+tag+'</span></div>';};
let rows='';if(s2._cro_hired)rows+=roleRow('📣','Sales Manager','marketing',(this._autoPicked||{}).marketing);if(s2._coo_hired)rows+=roleRow('⚙️','Ops Manager','operations',(this._autoPicked||{}).operations);if(s2._cfo_hired)rows+=roleRow('💰','CFO','finance',this._cfoPick);
if((this._activeCats||[]).includes('lifestyle'))rows+='<div style="display:flex;justify-content:space-between;gap:8px;font-size:0.76rem;padding:3px 0;border-bottom:1px solid rgba(127,127,127,0.1);"><span style="color:var(--text2);white-space:nowrap;">🏖️ Life</span><span style="color:var(--accent);font-size:0.64rem;">always your pick</span></div>';
banner='<div style="background:linear-gradient(135deg,rgba(212,175,55,0.12),rgba(59,130,246,0.1));border:1px solid var(--gold);border-radius:var(--radius-sm);padding:12px 14px;margin-bottom:10px;"><div style="font-size:0.84rem;font-weight:700;color:var(--gold);margin-bottom:6px;">'+(s2._board_active?'🏛 Your Board & Team — Plan This Month':'👔 Your Managers — Plan This Month')+'</div>'+rows+'<div style="font-size:0.68rem;color:var(--text2);margin:7px 0 9px;line-height:1.45;">Your managers handle Marketing &amp; Ops — you own Finance. Override any manager line by picking your own move below.</div>'+(allExec?'<div style="text-align:center;margin-top:7px;"><span onclick="Game.toggleFocus()" style="cursor:pointer;font-size:0.72rem;color:var(--blue);font-weight:600;">'+((this._activeCats||CATS).includes('marketing')?'Hide Marketing &amp; Ops menus (let execs handle)':'Show all menus to override Marketing &amp; Ops')+'</span></div>':'')+'</div>';}
// On the finance tab, members see their concierge roadmap milestone (replaces the old "handles these for you" list — the milestone says what's being built and what's next, which is the useful version).
let epicPanel='';
if(this.state._epic_life&&this.currentCategory==='finance')epicPanel=this._epicMilestoneCompact();
document.getElementById('action-list').innerHTML=banner+epicPanel+listHtml;},
// One button runs the month with the team's plan: fill any category the player didn't set with the exec/board pick, then resolve.
// You can only hand FINANCE to the CFO once you've actually learned it — reached the Wealth stage in Finance, or personally switched on tax-free passive income. The money decisions are the game's core lesson, so they stay yours until then (the CFO still advises). Marketing & ops can be delegated from the day you hire the exec.
_canDelegateFinance(){return this.getStage('finance')==='wealth'||(this.state._completed_actions||[]).includes('activate_passive_income');},
// SILENT anti-stuck safety net (no player-facing "optional" label): is there a finance move the player is genuinely meant to pick this month? Excludes the always-on velocity perk, concierge-handled actions, completed and locked actions. Used ONLY to avoid hard-blocking the team/board "pick a Finance move" gate when the menu has nothing pickable — the visible flow still treats Finance as a normal step.
_hasRequiredFinance(){return this.getAvailableActions('finance').some(a=>a.id!=='epic_life_membership'&&a.id!=='velocity_banking'&&!this._epicHandled(a)&&!this.isActionCompleted(a)&&!this.isActionLocked(a));},
runTeamMonth(){const ac=this._activeCats||CATS;this._paymentMethods=this._paymentMethods||{};const delegFin=this._canDelegateFinance();
for(const c of ac){if(c==='lifestyle')continue;/* Life is always the player's own pick */if(c==='finance'&&!delegFin)continue;/* finance is yours until you graduate to Wealth */if(this.selectedActions[c])continue;const b=this.bestAction(c);if(b){this.selectedActions[c]=b;this._paymentMethods[b.id]=this._paymentMethods[b.id]||'cash';this._autoPicked=this._autoPicked||{};this._autoPicked[c]=b.id;}}
// Finance stays the player's own call until Wealth stage — prompt if it's unset.
if(ac.includes('finance')&&!delegFin&&this._hasRequiredFinance()&&!this.selectedActions['finance']){if(this.currentCategory!=='finance')this.switchCategory('finance');this._focusActionList();this.showPopup('💰 Your call — the Finance move','Your execs run marketing & operations, but the <strong>money decisions stay yours</strong> until you reach the <strong>Wealth stage</strong> in Finance (or switch on passive income). This is the part that actually builds wealth — pick this month\'s finance move below. Once you graduate, your CFO can take it over too.');return;}
// Life is the player's own pick — if it's available this month and not chosen yet, prompt for it instead of silently skipping it.
if(ac.includes('lifestyle')&&!this.selectedActions['lifestyle']){if(this.currentCategory!=='lifestyle')this.switchCategory('lifestyle');this._focusActionList();this.showPopup('🏖️ One more — your Life action','Your team has the business handled this month. <strong>Your Life action is always your own pick</strong> — choose one life investment below, then run the month.');return;}
this.resolveMonth();},

selectActionPayment(cat,id){const action=this.getAvailableActions(cat).find(a=>a.id===id);if(!action||this.isActionLocked(action))return;if(id==='velocity_banking'){this.openVelocityControl();return;}/* velocity banking opens its control panel instead of a plain queue: turn-on consumes the finance turn, ongoing tuning/chunks are free */this._paymentMethod='cash';this.selectAction(cat,id);},

getLockedReason(a){const s=this.state,bizAvail=Math.max(0,(s.business_credit_limit||0)-(s.business_credit_used||0)),totalFunds=(s.cash||0)+(s.available_credit||0)+bizAvail,pr=a.prerequisites||{};if(this._epicOnlyLocked(a))return'👑 Epic Life members only';if(pr.needs){const miss=pr.needs.find(id=>!(s._completed_actions||[]).includes(id));if(miss)return'Needs: '+this.actionLabel(miss);}{const cc=this.actionCashCost(a);if(cc&&totalFunds<cc)return'Not enough cash or credit';}{const ec=this.actionEnergyCost(a);if(ec>0&&(s.energy||0)-ec<-40)return'Too exhausted';}for(const[k,v]of Object.entries(pr)){if(k==='needs')continue;if(k==='liquid_cash_gte')return'Need '+this.fmtMoney(v)+' in cash';if(k==='cash_gte')return'Need '+this.fmtMoney(v)+' in cash or credit';if(k==='net_worth_gte')return'Need '+this.fmtMoney(v)+' net worth';if(k.endsWith('_gte'))return'Need '+k.replace('_gte','').replace(/_/g,' ')+' ≥ '+v;if(k.endsWith('_lte'))return'Need '+k.replace('_lte','').replace(/_/g,' ')+' ≤ '+v;if(k.endsWith('_in')||k==='entity_structure')return'Need upgrade';}return'Locked';},
actionLabel(id){for(const c of ['actions_marketing','actions_operations','actions_finance']){const a=((CONFIG[c]||{}).actions||[]).find(x=>x.id===id);if(a)return a.label;}return id.replace(/_/g,' ');},
// Action-card preview: name every stat an action impacts. Money & credit-score stats also show the CURRENT value (those need a reference point); operational stats (leads, brand, systems…) just name the stat. The projected RESULT is gated behind hiring a fractional CFO.
actionPreview(a){const s=this.state,cfo=(s._completed_actions||[]).includes('hire_fractional_cfo');
const LBL={leads:'Leads',customer_base:'Customers',team_size:'Team',brand_equity:'Brand equity',systems_maturity:'Systems',revenue_capacity:'Revenue capacity',personal_credit_score:'Credit score',business_credit_limit:'Business credit',monthly_revenue:'Revenue',real_estate_equity:'RE equity',investment_positions:'Investments',insurance_cash_value:'Cash value',life_insurance_cv:'Cash value',cash:'Cash',operating_expenses:'Operating expense',cogs:'COGS',owner_pay:'Owner pay',total_debt:'Debt',available_credit:'Credit available',living_expenses:'Living expense',lifestyle_expenses:'Lifestyle expense',tax_reserve:'Tax reserve',company_culture:'Culture',churn_rate:'Churn',audit_risk:'Audit risk',litigation_exposure:'Lawsuit risk',key_person_dependency:'Key-person risk',personal_guarantee_exposure:'Personal guarantee'};
// Stats that need a current number to be meaningful: money + credit score.
const MONEYISH=['cash','monthly_revenue','operating_expenses','cogs','owner_pay','total_debt','available_credit','business_credit_limit','real_estate_equity','investment_positions','insurance_cash_value','life_insurance_cv','living_expenses','lifestyle_expenses','tax_reserve','revenue_capacity'];
const showVal=k=>MONEYISH.includes(k)||k==='personal_credit_score';
const label=k=>LBL[k]||this.formatStatName(k);
const IMPACTS={business_credit_line:['business_credit_limit'],bank_personal_loan:['cash'],premium_financing:['insurance_cash_value'],debt_restructure:['business_credit_limit','cash'],buy_real_estate:['real_estate_equity'],private_lending:['investment_positions'],build_personal_credit:['personal_credit_score'],build_dnb_profile:['business_credit_limit'],pay_down_debt:['total_debt','available_credit','personal_credit_score'],monthly_tax_reserve:['tax_reserve','cash'],activate_passive_income:['cash','insurance_cash_value'],policy_loan:['cash','insurance_cash_value'],sba_loan:['cash','total_debt'],equipment_financing:['cash','total_debt','revenue_capacity'],merchant_cash_advance:['cash','total_debt']};
const keys=[],seen={},add=k=>{if(k[0]==='_'||seen[k])return;seen[k]=1;keys.push(k);};
const eff=a.effects||{};for(const k in eff)if(typeof eff[k]==='number'&&eff[k]!==0&&k!=='owner_pay')add(k);(IMPACTS[a.id]||[]).forEach(add);// owner_pay is auto-set each month (~25% of revenue), so listing it as an action's "impact" is misleading
const special=this.creditPreview(a.id);
if(!keys.length&&!special)return '';
const fmv=k=>k==='personal_credit_score'?Math.round(s[k]||0):this.fmtMoney(Math.round(s[k]||0));
const cur=k=>showVal(k)?(label(k)+' <strong style="color:var(--text);">'+fmv(k)+'</strong>'):label(k);
const curLine=keys.length?'<p style="margin:-2px 0 0;font-size:0.72rem;color:var(--text2);">Stats impacted: '+keys.map(cur).join(' · ')+'</p>':'';
if(cfo){
if(special)return curLine+special;
const scaled=this.scaleActionEffects(eff,a.category),proj=keys.filter(k=>scaled[k]).map(k=>{const after=Math.round((s[k]||0)+scaled[k]);return showVal(k)?(label(k)+' '+fmv(k)+' → ~'+this.fmtMoney(after)):(label(k)+' → ~'+after);});
return proj.length?'<p style="margin:-2px 0 0;font-size:0.72rem;color:var(--gold);font-weight:600;">📊 '+proj.join(' · ')+'</p>':curLine;}
return curLine;},
creditPreview(id){const s=this.state,cf=this.calcCreditCapacity(),fm=v=>this.fmtMoney(Math.round(v));let txt='';switch(id){
case 'business_credit_line':txt='≈ '+fm(15000*cf)+' line, sized to your credit & revenue';break;
case 'bank_personal_loan':{if(this.isSeparated()){txt='≈ '+fm(25000*cf)+' business term loan, sized to your revenue & credit';}else{const c2=Math.max(0.6,Math.min(2.5,((s.personal_credit_score||600)-560)/120));txt='≈ '+fm(10000*c2)+' personal loan now — larger business loan once you form an LLC';}break;}
case 'premium_financing':{const m=Math.max(1,Math.min(5,(s.monthly_revenue||0)/20000));txt='≈ '+fm(25000*m)+' tax-free cash value from '+fm(20000*m)+' borrowed';break;}
case 'debt_restructure':txt='≈ '+fm(12000*cf)+' business line + '+fm(5000*cf)+' working cash, sized to your credit';break;
case 'buy_real_estate':{const m=Math.max(1,Math.min(4,1+(s.monthly_revenue||0)/40000));txt='≈ '+fm(100000*m)+' property, '+fm(20000*m)+' equity, sized to your revenue';break;}
case 'private_lending':{const extra=Math.min(Math.round((s.cash||0)*0.4),180000),pos=20000+(extra>0?extra:0);txt='≈ '+fm(pos)+' deployed from your cash';break;}
case 'build_personal_credit':{const neg=s.credit_negatives||0;if(neg>0)txt='Resolves '+neg+' negative mark'+(neg>1?'s':'')+' over ~'+Math.ceil(neg/2)+' months → ~650, then lower utilization lifts it higher';else txt='Clean file — minor boost (+6); your real lever now is utilization';break;}
case 'sba_loan':txt='≈ '+fm(50000*cf)+' low-rate long-term loan, sized to your credit & revenue';break;
case 'equipment_financing':{const m=Math.max(1,Math.min(4,1+(s.monthly_revenue||0)/40000));txt='≈ '+fm(15000*m)+' equipment financed, +'+fm(Math.round(15000*m*0.5))+'/mo capacity, ~'+fm(Math.round(15000*m*(s.tax_rate||0.25)*0.85))+' tax saved (Section 179)';break;}
case 'merchant_cash_advance':{const m=Math.max(1,Math.min(3,1+(s.monthly_revenue||0)/30000));txt='⚠ Get '+fm(20000*m)+' today, owe '+fm(Math.round(20000*m*1.4))+' (1.4 factor ≈ 60%+ APR)';break;}
default:return '';}
return '<p style="margin:-2px 0 0;font-size:0.74rem;color:var(--gold);font-weight:600;">'+txt+'</p>';},
// Cash can never sit negative: a shortfall auto-draws on available credit (business → personal) as an emergency loan. Returns true if solvent, false if cash/credit ran dry (→ game over).
_settleCashOrLose(){const s=this.state;
if(this.isSeparated()&&(s.personal_cash||0)<0){let need=-s.personal_cash;s.personal_cash=0;if((s.cash||0)>0){const d=Math.min(s.cash,need);s.cash-=d;need-=d;}if(need>0)need=this.coverShortfall(need);if(need>0)need=this._tapTaxReserveToSurvive(need);if(need>0)s.personal_cash=-need;}
if((s.cash||0)<0){let need=-s.cash;s.cash=0;if(need>0)need=this.coverShortfall(need);if(need>0)need=this._tapTaxReserveToSurvive(need);if(need>0)need=this._tapPersonalToSurvive(need);if(need>0)s.cash=-need;}
return !((s.cash||0)<0||(s.personal_cash||0)<0);},
loseGame(reason){this._lost=true;this.clearAutoSave();this.showScreen('end-screen');const scores=this.calculateFinalScores();
document.getElementById('end-title').textContent='Insolvent — Game Over';
document.getElementById('end-subtitle').textContent=reason||'You ran out of cash and credit.';
this.drawRadarOn(document.getElementById('radar-canvas'),scores);
document.getElementById('score-breakdown').innerHTML=this._renderScoreCards(scores);
document.getElementById('epilogue').textContent='The business couldn\'t meet its obligations — cash and credit both ran dry. Every empire needs a margin of safety: build the reserve and the credit lines before you need them, not when the bill comes due.';
{const _ex=document.getElementById('end-extra');if(_ex)_ex.remove();}document.getElementById('epilogue').insertAdjacentHTML('afterend','<div id="end-extra">'+this.buildChoiceLog(this._playLog)+'</div>');
document.getElementById('end-save').innerHTML='<button class="btn-primary" onclick="location.reload()">Start Over</button>';
// Explain WHY the run ended, in a clear pop-up over the score screen — unless the on-card game-over walkthrough already covered it.
if(!(this.state&&this.state._gameover_tut_seen))setTimeout(()=>this.showPopup('💥 Game Over — Insolvent',this._brokeGraphic()+'<div style="line-height:1.6;font-size:0.9rem;"><strong style="color:var(--red);">'+(reason||'You ran out of cash and credit.')+'</strong><br><br>When a month\'s bills exceed your <strong>cash + all available credit</strong>, the business can\'t pay — and the run ends. Avoid it with a <strong>margin of safety</strong> built ahead of time: keep a cash reserve, open credit lines <em>before</em> you need them, insure the big risks, and don\'t over-leverage. Watch your <strong>runway</strong> on the Cash &amp; Credit panel each month — when it gets short, pull back.</div>'),250);},

selectAction(cat,id){const actions=this.getAvailableActions(cat),action=actions.find(a=>a.id===id);if(!action||this.isActionLocked(action))return;let justPicked=false;if(this.selectedActions[cat]&&this.selectedActions[cat].id===id){delete this.selectedActions[cat];if(this._paymentMethods)delete this._paymentMethods[id];}else{this.selectedActions[cat]=action;if(!this._paymentMethods)this._paymentMethods={};this._paymentMethods[action.id]=this._paymentMethod||'cash';this._tutNotify('select');justPicked=true;}this.renderStepIndicator();this.renderCategoryTabs();this.renderActions();this.updateConfirmButton();this._tutReposition();
// Stay on the move they just picked so they can read it — but pulse the "Next: …" button to invite them onward.
if(justPicked&&!this._tutActive&&this._nextUnselectedCat())this._flashNextBtn();},
_flashNextBtn(){const btn=document.getElementById('confirm-actions-btn');if(!btn)return;btn.classList.remove('btn-flash');void btn.offsetWidth;btn.classList.add('btn-flash');},
// The next active category that still needs a pick — preferring one OTHER than where you are now, so the button reads like "go forward".
_nextUnselectedCat(){const ac=this._activeCats||CATS,start=ac.indexOf(this.currentCategory);for(let i=0;i<ac.length;i++){const c=ac[(start+i)%ac.length];if(!this.selectedActions[c])return c;}return null;},
// Primary bottom button: until all three moves are set it walks you to your next action; once they're all set it ends the turn.
primaryActionBtn(){const s=this.state,team=(s._cro_hired&&s._coo_hired)||s._board_active;if(team)return this.runTeamMonth();/* full C-suite/board: the bottom button just runs the month (execs fill any line you didn't override) */
const ac=this._activeCats||CATS,unsel=ac.filter(c=>!this.selectedActions[c]);if(!unsel.length)return this.confirmActions();const nxt=this._nextUnselectedCat();if(nxt&&nxt!==this.currentCategory){this.switchCategory(nxt);return this._focusActionList();}return this._focusActionList();/* last pick is on this screen — nudge the cards rather than end the turn */},
// Pull the player's eye to the actual choices: scroll the action cards into view and give them a brief highlight (not just flip the category icon).
_focusActionList(){const list=document.getElementById('action-list'),ind=document.getElementById('step-indicator');const anchor=ind||list;if(anchor&&anchor.scrollIntoView)anchor.scrollIntoView({behavior:'smooth',block:'start'});if(list){list.classList.remove('attn-flash');void list.offsetWidth;list.classList.add('attn-flash');setTimeout(()=>list.classList.remove('attn-flash'),900);}},
updateConfirmButton(){const btn=document.getElementById('confirm-actions-btn'),sec=document.getElementById('endturn-now-btn'),ac=this._activeCats||CATS,total=ac.length,unsel=ac.filter(c=>!this.selectedActions[c]),done=total-unsel.length;btn.disabled=false;
{const s=this.state,team=(s._cro_hired&&s._coo_hired)||s._board_active;if(team){btn.textContent='▶ Run the Month';if(sec)sec.style.display='none';return;}}/* team mode: one clear bottom action, no category-cycling */
// All moves chosen → the primary button ends the turn. Otherwise it navigates to the next move, and the secondary button consistently shows how many are picked and that ending now skips the rest.
if(!unsel.length){btn.textContent='End Turn →';if(sec)sec.style.display='none';return;}
const nxt=this._nextUnselectedCat();
btn.textContent='Next: '+CL[nxt]+' →';
if(sec){sec.style.display='block';sec.textContent=done===0?('Skip Turn (0/'+total+')'):('Skip '+unsel.length+' & End Turn ('+done+'/'+total+')');}},
confirmActions(){const ac=this._activeCats||CATS,count=Object.keys(this.selectedActions).length,total=ac.length;if(count<total){const missing=ac.filter(c=>!this.selectedActions[c]).map(c=>CL[c]).join(', ');return this._confirm('End the month early?','You haven\'t chosen an action for: <strong>'+missing+'</strong> ('+count+'/'+total+' selected).<br><br>End the month anyway?','End month',()=>this._checkBurnoutThenResolve());}
this._checkBurnoutThenResolve();},
_checkBurnoutThenResolve(){const te=this._turnEnergy();if(te.left<0){return this._confirm('⚠️ Burnout warning','Your moves this month need <strong>'+te.used+'</strong> energy but you only have <strong>'+te.have+'</strong>. You\'ll push into the red (<strong>'+te.left+'</strong>) — and running on empty makes you much more likely to get sick this month.<br><br>Push through anyway?','Push through',()=>this.resolveMonth());}
this.resolveMonth();},

coverShortfall(amount){const s=this.state;let need=Math.max(0,Math.round(amount));const bizAvail=Math.max(0,(s.business_credit_limit||0)-(s.business_credit_used||0));if(bizAvail>0&&need>0){const d=Math.min(need,Math.floor(bizAvail/1.03)),fee=Math.round(d*0.03);if(d>0){s.business_credit_used=(s.business_credit_used||0)+d+fee;s.total_debt=(s.total_debt||0)+d+fee;need-=d;}}if((s.available_credit||0)>0&&need>0){const d=Math.min(need,Math.floor((s.available_credit||0)/1.03)),fee=Math.round(d*0.03);if(d>0){s.available_credit-=(d+fee);s.total_debt=(s.total_debt||0)+d+fee;need-=d;}}return need;},
// Remove a named recurring cost entirely (e.g. firing the staffer it pays for): drop it from operating_expenses AND the itemized burn breakdown, keeping them in sync. Returns the amount cleared.
_clearRecurring(id){const s=this.state,c=(s._active_recurring_costs&&s._active_recurring_costs[id])||0;if(c>0){s.operating_expenses=Math.max(0,(s.operating_expenses||0)-c);delete s._active_recurring_costs[id];}return c;},
// Shave a total amount off the recurring-cost lines (largest first) so the itemized burn breakdown never sums to more than operating_expenses after a downsize.
_reduceRecurring(amount){const s=this.state;let rem=Math.round(amount||0);if(rem<=0||!s._active_recurring_costs)return;for(const[id,c]of Object.entries(s._active_recurring_costs).sort((a,b)=>b[1]-a[1])){if(rem<=0)break;const d=Math.min(c,rem);s._active_recurring_costs[id]=c-d;rem-=d;if(s._active_recurring_costs[id]<=0)delete s._active_recurring_costs[id];}},
// Invariant: the itemized recurring-cost lines can never sum to more than operating expenses (minus exec pay, shown separately). Events/actions that cut opex directly would otherwise leave stale line items totaling MORE than the displayed total. Trims the largest items back into line.
_syncRecurring(){const s=this.state;if(!s._active_recurring_costs)return;const sum=Object.values(s._active_recurring_costs).reduce((a,b)=>a+(+b||0),0);const exec=this.calcExecComp?this.calcExecComp():0;const cap=Math.max(0,(s.operating_expenses||0)-exec);if(sum>cap)this._reduceRecurring(sum-cap);},
// When a team member leaves, drop the single largest recurring cost line (a hire is nearly always the biggest) and reduce opex by exactly that — so the expense breakdown loses the right line, not a generic amount. Returns the salary removed.
// A C-suite role is "filled" once its flag is set — even from a FAILED hire/promote roll (failure_effects still set the flag). Mark the action completed so the menu never re-offers a role you already have. Self-heals older saves on the next month render.
_syncExecCompletions(){const s=this.state,F={hire_sales_manager:'_cro_hired',hire_ops_manager:'_coo_hired',hire_cfo:'_cfo_hired'};if(!s._completed_actions)s._completed_actions=[];for(const id in F){if(s[F[id]]&&!s._completed_actions.includes(id))s._completed_actions.push(id);}},
_removeDepartedRole(){const s=this.state;if(!s._active_recurring_costs)return 0;const e=Object.entries(s._active_recurring_costs).filter(x=>x[0]!=='key_man_policy').sort((a,b)=>b[1]-a[1]);if(!e.length)return 0;const id=e[0][0],amt=this._clearRecurring(id);
// Re-open the role so the player can re-hire it, flagged with a Rehire tag in the menu.
if(s._completed_actions){const ix=s._completed_actions.indexOf(id);if(ix>=0)s._completed_actions.splice(ix,1);}
if(!s._rehire)s._rehire={};s._rehire[id]=this.month;this._lastDeparted=id;
return amt;},
// Second life: a player who set aside a tax reserve can drain it to escape game over — but ONLY if it fully covers the gap (a partial drain wouldn't save you, so the reserve stays intact and you lose anyway). The IRS bill still comes (year-end reserve is now smaller). Reward for discipline; surfaced via _taxRescue in showResults.
_tapTaxReserveToSurvive(need){const s=this.state;if(need<=0)return need;if((s.tax_reserve||0)<need)return need;s.tax_reserve-=need;this._taxRescue=(this._taxRescue||0)+need;return 0;},
// Last-resort survival: the owner injects their PERSONAL cash to cover a business shortfall (a capital contribution — the mirror of the owner-draw). Only reached after business cash, all credit, and the tax reserve are exhausted, so it never touches the cushion in a normal month — it just stops the game from declaring you broke while you still have money. Drains what it can (partial is fine).
_tapPersonalToSurvive(need){const s=this.state;if(need<=0||!this.isSeparated())return need;const d=Math.min(Math.max(0,s.personal_cash||0),need);if(d>0){s.personal_cash-=d;need-=d;this._ownerRescue=(this._ownerRescue||0)+d;}return need;},
payCost(amount,fromPersonal){const s=this.state;let need=Math.max(0,Math.round(amount));if(fromPersonal&&this.isSeparated()){if((s.personal_cash||0)>0&&need>0){const d=Math.min(s.personal_cash,need);s.personal_cash-=d;need-=d;}if((s.available_credit||0)>0&&need>0){const d=Math.min(need,Math.floor((s.available_credit||0)/1.03)),fee=Math.round(d*0.03);if(d>0){s.available_credit-=(d+fee);s.total_debt=(s.total_debt||0)+d+fee;need-=d;}}if(need>0)need=this.coverShortfall(need);return need;}
// Business expense: spend the business's own cash FIRST (don't rack up debt while cash is sitting there), then a little business-credit float (kept under the utilization cap), then the credit backstop. Personal cash is never touched by a business cost.
if((s.cash||0)>0&&need>0){const d=Math.min(s.cash,need);s.cash-=d;need-=d;}
const _utilCap=s._cfo_hired?0.42:0.30;const healthy=Math.max(0,Math.floor((s.business_credit_limit||0)*_utilCap)-(s.business_credit_used||0));if(healthy>0&&need>0){const d=Math.min(healthy,need);s.business_credit_used=(s.business_credit_used||0)+d;s.total_debt=(s.total_debt||0)+d;need-=d;}if(need>0)need=this.coverShortfall(need);return need;},
applyDebtRestructure(dr){const s=this.state;dr=dr||{};const persRev=Math.max(0,(s.total_debt||0)-(s._installment_debt||0)-(s.business_credit_used||0)-(s.business_installment_debt||0));const persLim=persRev+(s.available_credit||0);const beforeUtil=persLim>0?Math.round(persRev/persLim*100):0;const movable=Math.max(0,persRev-(s.real_estate_debt||0));let swap=Math.max(0,Math.min(movable,Math.round(persRev-0.22*persLim)));if(swap>0){s._installment_debt=(s._installment_debt||0)+swap;s.available_credit=(s.available_credit||0)+swap;}const afterUtil=this.calcPersUtil();if(swap>0)s.personal_credit_score=Math.min(850,(s.personal_credit_score||0)+Math.max(4,Math.round((beforeUtil-afterUtil)/2)));const parts=[];if(dr.lim)parts.push('opened a '+this.fmtMoney(dr.lim)+' business line at 0%');if(swap>0)parts.push('moved '+this.fmtMoney(swap)+' of revolving card debt into a fixed-rate installment loan (utilization '+beforeUtil+'% → '+afterUtil+'%)');if(dr.moveAmt>0)parts.push('shifted '+this.fmtMoney(dr.moveAmt)+' of personal balances onto your business credit, off your personal report');if(dr.cashLoan)parts.push('pulled '+this.fmtMoney(dr.cashLoan)+' in working cash');return parts.length?('Your lending expert '+parts.join('; ')+'. Same debt — restructured into a higher score and usable cash.'):('Your utilization is already healthy at '+beforeUtil+'%. Little revolving debt left to restructure.');},
resolveMonth(){
this._tutNotify('endturn');
const results=[];const _execBonuses=[];
// Month-start cash/credit snapshot + action-spend accumulator for the end-of-month summary
const _S0=this.state,_msStart={cash:_S0.cash||0,personalCash:_S0.personal_cash||0,bizUsed:_S0.business_credit_used||0,bizLim:_S0.business_credit_limit||0,avail:_S0.available_credit||0,debt:_S0.total_debt||0,persScore:_S0.personal_credit_score||0,rev:_S0.monthly_revenue||0};
this._nwStart=this.calcNetWorth(); // net worth at the start of the month → month-over-month trend on the dashboard
this._oeStart=this.state.capital_account||0; // owner equity at month start → its own trend swing
// Epic members: snapshot the roadmap (overall % + which nodes are done) at month start and reset the concierge-move capture, so the result-screen "Your Concierge This Month" card can show the swing + what changed.
this._epicLastMove=null;this._epicSavings=0;if(this.state._epic_life){const _D0=this._epicRoadmapData();this._roadmapStartFr=_D0.frPct;this._roadmapStartSys=_D0.systemPct;}
const _spend={total:0,cash:0,biz:0,pers:0};
// Epic Life concierge runs one extra high-priority finance move this month (selected from start-of-turn state), processed through the normal loop so all costs/handlers apply.
// Epic Life enrollment resolves as its own move (not your Finance action) so it never conflicts with a finance pick.
if(this.state._epic_enroll_pending&&!this.state._epic_life){const _m=Object.assign({},CONFIG.actions_finance.actions.find(x=>x.id==='epic_life_membership'));_m.success_rate=2;_m.energy_cost=0;_m._epic=true;this.selectedActions['epicbuy']=_m;this.state._epic_enroll_pending=false;}
if(this.state._epic_life){const _perk=this._epicLifePick();if(_perk)this.selectedActions['epic']=_perk;}
// Resolve the Epic Life move FIRST so its before→after reflects start-of-month numbers — matching its position at the top of the results.
const _entries=Object.entries(this.selectedActions),_isEpic=e=>e[0]==='epic'||e[0]==='epicbuy',_ordered=_entries.filter(_isEpic).concat(_entries.filter(e=>!_isEpic(e)));
for(const[cat,action]of _ordered){
if(cat==='marketing'||cat==='operations'||cat==='finance'){this.state._exec_last=this.state._exec_last||{};this.state._exec_last[cat]=action.id;}/* remember this month's move per track so the auto-pilot rotates next month instead of repeating it */
const _cb={bizLim:this.state.business_credit_limit||0,bizUtil:this.calcBizUtil(),persUtil:this.calcPersUtil(),avail:this.state.available_credit||0,debt:this.state.total_debt||0,persScore:this.state.personal_credit_score||0,cash:this.state.cash||0,pcash:this.state.personal_cash||0};
const _SB=['leads','customer_base','team_size','brand_equity','systems_maturity','revenue_capacity'],_sbBefore={};_SB.forEach(k=>_sbBefore[k]=this.state[k]||0);
const _lifeDB=cat==='lifestyle'?this.lifeDims():null,_lifeMB=cat==='lifestyle'?this.calcPersonalMastery():null,_lifeEnB=cat==='lifestyle'?Math.round(this.state.energy):null;
const skillKey='skill_'+cat,skillBonus=(this.state[skillKey]||0)/200;
const repeatCount=(this.state._action_counts||{})[action.id]||0;
const EXEMPT_DIM=['debt_restructure','banking_relationship','fund_accumulation_policy','policy_loan','pay_down_debt','build_personal_credit'];
const isDimExempt=action.one_time||EXEMPT_DIM.includes(action.id);
const diminishing=isDimExempt?0:Math.min(0.25,repeatCount*0.05);
// Running low on energy raises your failure risk; pushing into the red (burnout) raises it sharply.
const penalty=this.state.energy<0?0.6:this.state.energy<30?0.8:1;
const retryBoost=(this.state._partial_actions&&this.state._partial_actions[action.id])?0.35:0; // a second attempt after a partial is far more likely to land
const earlyBoost=(this.month<=3&&cat!=='lifestyle')?0.25:0; // gentler onboarding — fewer partials in the first 3 months
const _isCreditApp=CREDIT_APPROVAL.includes(action.id);
// Credit applications are underwritten (utilization + personal myFICO), not skill/energy-modified — a lender doesn't care how rested you are, only how your file reads.
const _apprCh=action.id==='debt_restructure'?this._restructureApprovalChance():this._creditApprovalChance(LOAN_APPROVAL.includes(action.id));
const success=cat==='lifestyle'?true:(action._epic?true:(_isCreditApp?(Math.random()<_apprCh):(Math.random()<((action.success_rate||0.7)*penalty+skillBonus-diminishing+retryBoost+earlyBoost))));// life actions always land; the Epic concierge only attempts moves it has already vetted (e.g. it won't apply for credit it can't get), so its move lands too
if(_isCreditApp)this.state.credit_inquiries=(this.state.credit_inquiries||0)+1;/* every application is a hard pull — they pile up and drag approval/score (Epic clears them every 6 months) */
let effects=success?this.scaleActionEffects(action.effects,cat):(action.failure_effects?this.scaleActionEffects(action.failure_effects,cat):{});
if(cat==='lifestyle')effects=this._scaleLifestyleEffects(effects); // life gains diminish as a dimension fills — cheap repeats give less, pushing variety + bigger investments
// Low energy also dampens the OUTCOME — even a success delivers less when you're running on empty (and far less in burnout).
if(cat!=='lifestyle'&&success&&this.state.energy<30){const perf=this.state.energy<0?0.7:0.85;for(const k in effects){if(typeof effects[k]==='number'&&effects[k]>0&&k!=='team_size'&&k!=='energy')effects[k]=Math.max(1,Math.round(effects[k]*perf));}}
if(!isDimExempt&&repeatCount>2){const dimMult=Math.max(0.4,1-repeatCount*0.1);for(const k in effects){if(typeof effects[k]==='number'&&effects[k]>0&&k!=='team_size')effects[k]=Math.round(effects[k]*dimMult);}}
const DELAY_IDS=['customer_acquisition_sprint','build_content_presence','build_delivery_foundation','scale_delivery','sales_infrastructure','hire_specialists','scale_beyond_limits'];
if(DELAY_IDS.includes(action.id)){const immediate={},delayed={};for(const k in effects){if(typeof effects[k]==='number'){if(k==='energy'||k==='cash'||k==='operating_expenses'||k==='team_size'||k==='key_person_dependency'){immediate[k]=effects[k];}else{delayed[k]=effects[k];}}else{immediate[k]=effects[k];}}
effects=immediate;if(Object.keys(delayed).length){if(!this.state._delayed_effects)this.state._delayed_effects=[];this.state._delayed_effects.push({month:this.month+2,effects:delayed});}}
this.applyEffects(effects);
// SCALE TRAP — the seductive "go big" plays flood you with demand or headcount you can't deliver on without SYSTEMS. Pull the trigger before the infrastructure is there and it backfires realistically: refunds, 1-star reviews, churn, burnout — you go BACKWARD. Systematize first and the same play scales you. (A small team's bread-and-butter is the modest lead-gen / nurture / sales moves — these big bets are traps until you're ready.)
{const need=this._SCALE_TRAPS[action.id];
 if(need!==undefined&&success){const have=this.state.systems_maturity||0;if(have<need){const s=this.state,shortfall=Math.min(1,(need-have)/need),lost=Math.round((s.customer_base||0)*0.15*shortfall);
  s.customer_base=Math.max(0,(s.customer_base||0)-lost);s.brand_equity=Math.max(0,(s.brand_equity||0)-Math.round(18*shortfall));s.churn_rate=Math.min(0.5,(s.churn_rate||0)+0.06*shortfall);s.leads=Math.max(s.customer_base||0,Math.round((s.leads||0)*(1-0.25*shortfall)));s.energy=Math.max(-40,(s.energy||0)-Math.round(10*shortfall));
  s._pendingRipples=(s._pendingRipples||[]).concat([{source:(action.label||'Scale play')+' — backfired',narrative:'You scaled faster than your systems could deliver. The flood became refunds, bad reviews and burnout — '+(lost>0?lost+' customers lost, ':'')+'brand and churn hit. Build systems FIRST, then go big.'}]);}}}
if(action.id==='pay_down_debt'){const s=this.state,eff=success?1:0.6,beforeUtil=this.calcPersUtil(),beforeDti=this.calcDTI(),plan=this._debtPaydownPlan();
let payRev=Math.round(plan.payRev*eff),payLoan=Math.round(plan.payLoan*eff),total=payRev+payLoan;
// deduct cash (business first, then personal)
let need=total;if((s.cash||0)>0&&need>0){const d=Math.min(s.cash,need);s.cash-=d;need-=d;}if(this.isSeparated()&&(s.personal_cash||0)>0&&need>0){const d=Math.min(s.personal_cash,need);s.personal_cash-=d;need-=d;}
if(payRev>0){s.total_debt=Math.max(0,s.total_debt-payRev);s.available_credit=(s.available_credit||0)+payRev;} // paying a card frees the limit → lower utilization
if(payLoan>0){s._installment_debt=Math.max(0,(s._installment_debt||0)-payLoan);s.total_debt=Math.max(0,s.total_debt-payLoan);}
const afterUtil=this.calcPersUtil(),afterDti=this.calcDTI();
s.personal_credit_score=Math.min(850,(s.personal_credit_score||0)+Math.max(1,Math.round(Math.max(0,beforeUtil-afterUtil)/2)+(payLoan>0?2:0)));
if(total>0){const parts=['Put '+this.fmtMoney(total)+' of spare cash to work clearing debt'];if(payRev>0)parts.push('paid down '+this.fmtMoney(payRev)+' of revolving balances — utilization '+beforeUtil+'% → '+afterUtil+'%');if(payLoan>0)parts.push('knocked '+this.fmtMoney(payLoan)+' off installment loans — DTI '+beforeDti+'% → '+afterDti+'%');s._dyn_narrative=parts.join('; ')+'. '+(afterUtil<=30?'Utilization is in the healthy zone now — exactly what lenders and the scoring models reward.':'Utilization is dropping toward the 30% sweet spot.');effects.personal_credit_score=(effects.personal_credit_score||0);}
else s._dyn_narrative='Your utilization ('+beforeUtil+'%) and DTI ('+beforeDti+'%) are already healthy — no high-interest revolving debt worth paying down right now. Keep that cash working elsewhere.';}
const _cost=(action.id==='pay_down_debt'||(action.id==='debt_restructure'&&!success))?0:this.actionCashCost(action),_pm=(this._paymentMethods||{})[action.id]||'cash';/* the lending expert charges only a SUCCESS fee — a declined restructure costs nothing */
const _payB={cash:this.state.cash||0,pc:this.state.personal_cash||0,bu:this.state.business_credit_used||0,ac:this.state.available_credit||0};
// Marketing/Operations/Finance always run on the business; only a purely-personal life action draws personal cash. Epic Life perks spend CASH ONLY (never credit) — guarded by its cash-reserve rule.
if(cat==='epic'){const d=Math.min(_cost,Math.max(0,this.state.cash||0));this.state.cash-=d;if(_cost>d)this.coverShortfall(_cost-d);}
else this.payCost(_cost,cat==='lifestyle'&&this.lifeActionIsPersonal(action));
// How this cost was actually funded (business cash, business credit, personal cash, personal credit)
const _fund={cash:Math.max(0,_payB.cash-(this.state.cash||0)),biz:Math.max(0,(this.state.business_credit_used||0)-_payB.bu),persCash:Math.max(0,_payB.pc-(this.state.personal_cash||0)),persCredit:Math.max(0,_payB.ac-(this.state.available_credit||0))};
if(_cost>0){_spend.total+=_cost;_spend.cash+=_fund.cash;_spend.biz+=_fund.biz;_spend.pers+=_fund.persCash+_fund.persCredit;}
// Exec/team-run actions (the C-suite did the work) cost the player no energy; only your own hands-on moves do.
const _execRun=(this._autoPicked&&this._autoPicked[cat]===action.id)||(cat==='finance'&&this._cfoPick===action.id);
const _energyCost=this.actionEnergyCost(action);if(_energyCost>0&&!_execRun)this.state.energy=Math.max(-40,this.state.energy-_energyCost);/* energy can go negative (burnout) down to a floor */
// One-time actions only "complete" (and lock) on a full success — a partial leaves them available to retry. Repeatable actions register as before.
// Only a SUCCESS counts as "done" — a partial result isn't marked complete (doesn't satisfy capability gates) and doesn't get a "done ×N" pill; you can retry it.
if(success&&!this.state._completed_actions.includes(action.id))this.state._completed_actions.push(action.id);
this._syncExecCompletions();/* a failed exec hire/promote still fills the role (flag set in failure_effects) — mark it completed so the menu stops offering it */
if(success&&this.state._rehire&&this.state._rehire[action.id])delete this.state._rehire[action.id];/* role re-filled — clear the rehire flag */
// Log a trap the moment it's taken (traps are always a setback, so success/fail doesn't matter). "Survived" is settled by reaching the run's end alive — a lost run never gets the badge.
if(TRAPS.includes(action.id)){if(!this.state._traps_hit)this.state._traps_hit=[];if(!this.state._traps_hit.includes(action.id))this.state._traps_hit.push(action.id);}
if(!this.state._partial_actions)this.state._partial_actions={};if(cat!=='lifestyle'){if(success)delete this.state._partial_actions[action.id];else this.state._partial_actions[action.id]=true;}
if(success||cat==='lifestyle')this.state._action_counts[action.id]=(this.state._action_counts[action.id]||0)+1;
// Non-lifestyle recurring costs (insurance premiums, memberships) become an ongoing monthly operating expense — added once when first activated.
if(success&&cat!=='lifestyle'&&action.recurring_cost&&action.id!=='epic_life_membership'){if(!this.state._active_recurring_costs)this.state._active_recurring_costs={};if(!this.state._active_recurring_costs[action.id]){this.state._active_recurring_costs[action.id]=action.recurring_cost;this.state.operating_expenses=(this.state.operating_expenses||0)+action.recurring_cost;
// Term-limited recurring cost (e.g. a cash advance that gets paid off): mark when it should stop draining.
if(action.recurring_term){if(!this.state._recurring_expiry)this.state._recurring_expiry={};this.state._recurring_expiry[action.id]=this.month+action.recurring_term;}}}
if(this._autoPicked&&this._autoPicked[cat]===action.id&&success&&['marketing','operations','finance'].includes(cat)){const role=cat==='marketing'?'CRO':cat==='operations'?'COO':'CFO';const bonus=Math.max(1000,Math.min(15000,Math.round((this.state.monthly_revenue||0)*0.03)));this.payCost(bonus,false);_execBonuses.push({role,bonus,label:action.label});}
this.state[skillKey]=Math.min(100,(this.state[skillKey]||0)+(action.id==='do_work_yourself'?5:2));
if(action.id==='advanced_tax_strategy'&&success){this.state.tax_rate=Math.max(0.15,(this.state.tax_rate||0.25)-0.02);['tax_planning_session','tax_optimization'].forEach(id=>{if(!this.state._completed_actions.includes(id))this.state._completed_actions.push(id);});}
if(action.id==='policy_loan'&&success){const sep=this.isSeparated(),cv=this.state.insurance_cash_value||0,headroom=Math.max(0,Math.round(cv*0.9)-(this.state.insurance_loan_balance||0)),loanAmt=headroom,before=sep?(this.state.personal_cash||0):(this.state.cash||0);if(loanAmt<=0){this.state._dyn_narrative='You\'ve already borrowed up to 90% of your '+this.fmtMoney(cv)+' cash value — there\'s no loan room left right now. Keep funding the policy (or let it compound) to open more borrowing capacity.';}else{if(sep)this.state.personal_cash=before+loanAmt;else this.state.cash=before+loanAmt;this.state.insurance_loan_balance=(this.state.insurance_loan_balance||0)+loanAmt;effects.cash=(effects.cash||0)+loanAmt;this.state._dyn_narrative='Policy loan approved instantly — no credit check, no taxes. '+this.fmtMoney(loanAmt)+' (your remaining room up to 90% of the '+this.fmtMoney(cv)+' cash value) went straight into your personal cash: '+this.fmtMoney(before)+' → '+this.fmtMoney(before+loanAmt)+'. The cash value keeps compounding at ~7%/yr as if you never touched it; the loan accrues ~5%/yr and is netted from your death benefit — never repaid from your pocket.';}}
if(action.id==='activate_passive_income'&&success){this.state._passive_income_active=true;if(!this.state._iul_loan_type)this.state._iul_loan_type='wash';/* safe default: net ~0%, lapse-proof */}
if(action.id==='velocity_banking'&&success){const s=this.state;s._velocity_active=true;s._velocity_spiral_streak=0;if(!s._velocity_vehicle)s._velocity_vehicle=((s.real_estate_debt||0)>0&&(s.real_estate_equity||0)>0)?'heloc':'line';if(!s._velocity_mode)s._velocity_mode='balanced';const vd=this._velocityReadout(),pct=({conservative:'50%',balanced:'75%',aggressive:'100%'})[s._velocity_mode];s._dyn_narrative='Velocity banking is ON — running through your '+vd.vehicleLabel+', sweeping '+pct+' of each month\'s surplus at your '+vd.targetLabel.toLowerCase()+' ('+this.fmtMoney(vd.targetBal)+'). The interest you\'d have paid now knocks extra principal off, so it pays down years faster'+(vd.target==='mortgage'?' and your equity builds quicker':'')+'. Chunk extra or retune anytime from the ⚡ Velocity chip on your dashboard — no turn needed.';}
if(action.id==='iul_variable_loan'&&success){this.state._iul_loan_type='variable';/* opt into the index-arbitrage loan — higher income, real lapse risk */}
if(action.id==='open_db_plan_pretax'&&success){this.state._iul_funding_type='pre_tax';/* fund the policy through a qualified DB plan with deductible business dollars — requires the corporate structure */}
if(action.id==='hire_fractional_cfo'&&success)this.state._dyn_narrative='Your fractional CFO is on board — and the first thing she did was build you a real financial picture. Tap the new 📊 CFO Briefing on your dashboard any time: company value, net worth, runway, a 6-month projection, and exactly where she’d focus your marketing, operations, and finance.';
// Credit repair: disputes take 30-90 days. On success, schedule the marks to fall off over ~3 months (2/mo); the score climbs each month until the file is clean (~650), after which utilization carries it higher. A clean file has little to repair → minor boost.
if(action.id==='build_personal_credit'&&success){const s=this.state,neg=s.credit_negatives||0;
if(neg>0){const startScore=s.personal_credit_score||0,gainPer=Math.max(12,Math.round((650-startScore)/neg)),months=Math.ceil(neg/2);s._credit_repair={remaining:neg,per:2,gainPer,floor:650,startMonth:this.month+1};s._dyn_narrative='Disputes filed on all '+neg+' negative marks, and new tradelines are reporting. Nothing changes this month — the bureaus take 30-90 days. Starting next month you\'ll watch the marks fall off and your score climb over ~'+months+' months. Clearing them gets you near 650; after that, lowering utilization is what carries you toward 750-800.';}
else{const before=s.personal_credit_score||0;s.personal_credit_score=Math.min(850,before+6);s._dyn_narrative='Your file is already clean — no negatives to dispute. New tradelines and rent reporting nudged you '+before+' → '+s.personal_credit_score+'. With nothing to repair, the gains are small; your real lever now is keeping utilization low.';}
// Active credit management sometimes prompts a card issuer to auto-raise your limit — free utilization relief that quietly lifts the score (happens from time to time, not every time).
if(Math.random()<0.45){const persRev=Math.max(0,(s.total_debt||0)-(s._installment_debt||0)-(s.business_credit_used||0)-(s.business_installment_debt||0)-(s.real_estate_debt||0)),lim=persRev+(s.available_credit||0),bump=Math.round(Math.max(1500,lim*0.15));s.available_credit=(s.available_credit||0)+bump;s._dyn_narrative=(s._dyn_narrative||'')+' <strong>Bonus:</strong> a card issuer automatically raised your limit by '+this.fmtMoney(bump)+' — that drops your utilization and quietly lifts your score, no payment required.';}}
if(success){const _reg={establish_business:['form_llc','open_business_account','basic_bookkeeping'],build_personal_credit:['build_personal_credit_repair','build_personal_credit_optimize'],elect_s_corp:['payroll_setup','s_corp_election'],asset_protection_stack:['multi_entity','asset_protection']}[action.id];if(_reg)_reg.forEach(id=>{if(!this.state._completed_actions.includes(id))this.state._completed_actions.push(id);});}
// Forming the LLC → prompt the founder to name their company (shown on the dashboard + leaderboard; sets up future player-vs-player features). Fired after the results render.
if(action.id==='establish_business'&&success&&!this.state.company_name)this.state._needs_company_name=true;/* prompt is deferred until after the business panel unlocks AND its tutorial ends (handled in _closeSpotlight), so naming lands ~month 2 in a calm moment */
if(action.id==='fund_accumulation_policy'&&success){const s=this.state;s._auto_fund_insurance=true;const cur=Math.round(Math.min((s.monthly_revenue||0)*0.15,this.calcBusinessLevel()*5000));s._dyn_narrative='Policy opened and automatic funding is on — about '+this.fmtMoney(cur)+'/mo (scaling up with your revenue) flows into your policy, a ~2% cost of insurance off the top. Every contribution compounds tax-free and grows your borrowing base.';if((s.tax_reserve||0)>0)this._pendingReserveFold=true;/* offer to roll the existing tax reserve into the new policy */}
if(action.id==='debt_restructure'){let _dr={success};if(success){const s=this.state,cf=this.calcCreditCapacity(),lim=Math.round(12000*cf);s.business_credit_limit=(s.business_credit_limit||0)+lim;const persRev=Math.max(0,(s.total_debt||0)-(s._installment_debt||0)-(s.business_credit_used||0)-(s.business_installment_debt||0)-(s.real_estate_debt||0)),bizAvail=Math.max(0,(s.business_credit_limit||0)-(s.business_credit_used||0)),moveAmt=Math.min(persRev,bizAvail);s.available_credit=(s.available_credit||0)+moveAmt;s.business_credit_used=(s.business_credit_used||0)+moveAmt;const cashLoan=Math.round(5000*cf);s.cash+=cashLoan;s.total_debt+=cashLoan;s.business_installment_debt=(s.business_installment_debt||0)+cashLoan;if(!s._completed_actions.includes('business_credit_strategy'))s._completed_actions.push('business_credit_strategy');_dr.lim=lim;_dr.moveAmt=moveAmt;_dr.cashLoan=cashLoan;effects.cash=(effects.cash||0)+cashLoan;effects.total_debt=(effects.total_debt||0)+cashLoan;effects.business_credit_limit=(effects.business_credit_limit||0)+lim;effects.business_credit_used=(effects.business_credit_used||0)+moveAmt;}this._deferRestructure=_dr;}
if(action.id==='hire_general_counsel'&&success){this.state._gc_hired=true;}
if(action.id==='fast_working_capital'&&success){const s=this.state,adv=(action.effects&&action.effects.cash)||25000;s._mca_balance=Math.round(adv*(action.mca_factor||2));s._mca_holdback=action.mca_holdback||0.2;s._dyn_narrative='You took the advance — '+this.fmtMoney(adv)+' now, but you\'ll repay '+this.fmtMoney(s._mca_balance)+'. Starting next month the lender skims '+Math.round(s._mca_holdback*100)+'% of your revenue until it\'s cleared — it bleeds your top line, but it doesn\'t touch your credit.';}
if(action.id==='restructure_team'&&success){const s=this.state;
if(s._toxic_closer){
// Firing the toxic closer takes priority — and he doesn't go quietly. His pay comes off the books (clear his recurring line so the burn breakdown stays consistent), but he lawyers up and threatens to sue.
s._toxic_closer=false;s.team_size=Math.max(0,(s.team_size||0)-1);let closerOpex=this._clearRecurring('hire_highticket_closer');if(closerOpex===0){closerOpex=Math.min(s.operating_expenses||0,9000);s.operating_expenses=Math.max(0,(s.operating_expenses||0)-closerOpex);}
const legal=12000;s.cash=(s.cash||0)-legal;if(s.cash<0){const unc=this.coverShortfall(-s.cash);s.cash=0;if(unc>0)s.cash=-unc;}
s.litigation_exposure=(s.litigation_exposure||0)+25;s.company_culture=Math.min(100,(s.company_culture==null?45:s.company_culture)+10);
s._dyn_narrative='You cut the closer loose — and he didn\'t go quietly. He lawyered up: '+this.fmtMoney(legal)+' in legal fees and settlement, and your lawsuit risk jumps. But the fake-promise bleeding stops, payroll drops '+this.fmtMoney(closerOpex)+'/mo, and the team can breathe again.';}
else{const cut=Math.min(s.team_size||0,4);
if(cut>0){s.team_size=Math.max(0,(s.team_size||0)-cut);const opexCut=Math.min(s.operating_expenses||0,cut*2000);s.operating_expenses=Math.max(0,(s.operating_expenses||0)-opexCut);this._reduceRecurring(opexCut);const severance=cut*1500;s.cash=(s.cash||0)-severance;if(s.cash<0){const unc=this.coverShortfall(-s.cash);s.cash=0;if(unc>0)s.cash=-unc;}
s.key_person_dependency=Math.min(100,(s.key_person_dependency||0)+cut*4);s.company_culture=Math.max(0,(s.company_culture==null?45:s.company_culture)-8);
s._dyn_narrative='You let '+cut+' people go — payroll down '+this.fmtMoney(opexCut)+'/mo, severance '+this.fmtMoney(severance)+'. Leaner team, lighter burn, but morale dipped and more rides on you now.';}
else s._dyn_narrative='Your team is already lean — there\'s nothing to cut here.';}}
if(action.id==='hire_executive_assistant'&&success){this.state._ea_hired=true;this.state._dyn_narrative='Your executive assistant is on board and already owns the financial housekeeping — utilization paydowns, credit and D&B upkeep, and the monthly tax reserve all run on autopilot now. You won\'t spend another turn on these chores.';}
if(action.id==='epic_life_membership'&&success){const s=this.state;s._epic_life=true;const plan=s._epic_plan||'monthly';
if(plan==='annual'){this.payCost(3000,false);s._epic_renew_month=this.month+12;s._dyn_narrative='Epic Life is active — annual plan. '+this.fmtMoney(3000)+'/year billed up front (you save '+this.fmtMoney(300*12-3000)+' vs monthly). Your concierge runs the single highest-priority financial move for you each month — protection, credit, banking, your policy, then passive income.';}
else{s.operating_expenses=(s.operating_expenses||0)+(action.recurring_cost||300);s._dyn_narrative='Epic Life is active — monthly plan at '+this.fmtMoney(action.recurring_cost||300)+'/mo. Your concierge runs the single highest-priority financial move for you each month — protection, credit, banking, your policy, then passive income.';}}
if(action.id==='build_dnb_profile'&&success){const s=this.state;s._dnb_profile=true;s._dnb_tradelines=(s._dnb_tradelines||0)+3;if(!s.business_credit_profile||s.business_credit_profile==='none')s.business_credit_profile='building';s._dyn_narrative='Your business has its own credit identity now — DUNS number, phone, address, website and socials, plus three net-30 vendor accounts reporting on-time. Your D&B score climbs as the tradelines age and you add more credit history.';}
if(action.id==='business_credit_line'&&success){const cf=this.calcCreditCapacity(),lim=Math.round(15000*cf);this.state.business_credit_limit=(this.state.business_credit_limit||0)+lim;this.state._dnb_tradelines=(this.state._dnb_tradelines||0)+1;this.state._dyn_narrative='Approved — a '+this.fmtMoney(lim)+' revolving line in the business name. Your credit and revenue did the talking, and the new tradeline deepens your D&B file.';}
// Spell out the credit bump explicitly — it lands on BUSINESS credit (company's name), not your personal limit, which is where players miss it. (Limit already applied via config effects; this only narrates it.)
if(action.id==='wyoming_holding_llc'){this.state._naics_ok=true;/* clean entity gets the correct NAICS code assigned → underwriters stop flagging you */const bump=Math.round((effects&&effects.business_credit_limit)||0);if(bump>0)this.state._dyn_narrative='The Wyoming holding LLC is filed — clean parent entity, registered agent, operating agreement, and the <strong>correct NAICS code</strong> assigned. Underwriters read the structure as a legit, lower-risk business, so your <strong>business</strong> credit limit rose by <strong>'+this.fmtMoney(bump)+'</strong> to '+this.fmtMoney(this.state.business_credit_limit||0)+' and future funding gets easier to qualify for. (Business credit, in the company’s name — separate from your personal limit.)';}
if(action.id==='premium_financing'&&success){const s=this.state,nw=this.calcNetWorth();
// Bank lends against your collateral to fund the policy premium; the loan (low interest, ~5%/yr) is secured by the policy and netted from the death benefit. No free money: cash value funded = amount borrowed minus a ~2% cost of insurance.
const borrow=Math.round(Math.max(500000,Math.min(2500000,nw*0.3))),funded=Math.round(borrow*0.98);
s.insurance_cash_value=(s.insurance_cash_value||0)+funded;
s.insurance_loan_balance=(s.insurance_loan_balance||0)+borrow;
s._dyn_narrative='Premium financing structured: the bank lent '+this.fmtMoney(borrow)+' (a low-rate loan secured by the policy), funding '+this.fmtMoney(funded)+' of premium after a ~2% cost of insurance. The cash value now compounds ~7%/yr — above the ~5% loan rate — so the spread builds tax-free wealth on the bank\'s money. Nothing leaves your pocket; the loan is netted from the death benefit.';}
if(action.id==='bank_personal_loan'&&success){const s=this.state,_sep=this.isSeparated();let loan;if(_sep){const cf=this.calcCreditCapacity();loan=Math.round(25000*cf);s.business_installment_debt=(s.business_installment_debt||0)+loan;s._dyn_narrative='Your banking relationship delivered a '+this.fmtMoney(loan)+' fixed-rate business term loan — sized to your revenue and credit.';}else{const c2=Math.max(0.6,Math.min(2.5,((s.personal_credit_score||600)-560)/120));loan=Math.round(10000*c2);s._installment_debt=(s._installment_debt||0)+loan;s._dyn_narrative='Approved for '+this.fmtMoney(loan)+'. Your credit spoke for itself — funds in your account by Friday.';}s.cash+=loan;s.total_debt+=loan;}
// SBA loan — large, low-rate, long-term growth capital; underwritten on DTI (in CREDIT_APPROVAL/LOAN_APPROVAL, so `success` is already the approval roll). Bigger than a standard term loan.
if(action.id==='sba_loan'&&success){const s=this.state,cf=this.calcCreditCapacity();const loan=Math.round(50000*cf);s.cash+=loan;s.total_debt+=loan;s.business_installment_debt=(s.business_installment_debt||0)+loan;s._sba_loan=(s._sba_loan||0)+loan;s._dyn_narrative='SBA loan approved — '+this.fmtMoney(loan)+' in working capital at a low fixed rate over a long term. This is the cheapest growth money a small business can get; deploy it into things that earn more than it costs.';}
// SECTION 179 equipment — finance a productive asset (good debt), lift capacity, and deduct the full cost this year (immediate tax saving credited to cash). Repeatable.
if(action.id==='equipment_financing'&&success){const s=this.state;const mult=Math.max(1,Math.min(4,1+(s.monthly_revenue||0)/40000));const cost=Math.round(15000*mult);s.total_debt+=cost;s.business_installment_debt=(s.business_installment_debt||0)+cost;const capBump=Math.round(cost*0.5);s.revenue_capacity=(s.revenue_capacity||0)+capBump;s.systems_maturity=Math.min(100,(s.systems_maturity||0)+4);const taxSaved=Math.round(cost*(s.tax_rate||0.25)*0.85);s.cash+=taxSaved;s._equip_units=(s._equip_units||0)+1;s._dyn_narrative='You financed '+this.fmtMoney(cost)+' of equipment — capacity is up about '+this.fmtMoney(capBump)+'/mo. Section 179 let you deduct the full '+this.fmtMoney(cost)+' this year, putting ~'+this.fmtMoney(taxSaved)+' back in your pocket. The bank funded the asset; the tax code funded part of the payment.';}
// MERCHANT CASH ADVANCE — the bad-debt trap: instant cash, no credit check, but a 1.4 factor rate means you owe 40% more, repaid out of daily sales. Deliberately punishing to teach why good credit matters.
if(action.id==='merchant_cash_advance'&&success){const s=this.state;const mult=Math.max(1,Math.min(3,1+(s.monthly_revenue||0)/30000));const got=Math.round(20000*mult),owed=Math.round(got*1.4);s.cash+=got;s.total_debt+=owed;s.business_installment_debt=(s.business_installment_debt||0)+owed;s._mca_taken=(s._mca_taken||0)+1;s._dyn_narrative='You got '+this.fmtMoney(got)+' today — but you owe '+this.fmtMoney(owed)+' (a 1.4 factor rate ≈ 60%+ APR), repaid daily out of your sales. THIS is the cost of needing money when your credit can\'t get you a real loan. Every dollar of good credit you build is a dollar you never have to borrow this way.';}
if(action.id==='buy_real_estate'){const s=this.state;const mult=Math.max(1,Math.min(4,1+(s.monthly_revenue||0)/40000));
// THE ECONOMY IS THE ENTRY LEVER: you buy at the cycle price. In a downturn assets are cheap (_asset_discount < 1), so the same purchase carries MORE built-in equity; in a boom you overpay.
const disc=Math.max(0.6,Math.min(1.05,s._asset_discount!=null?s._asset_discount:1));
const fairValue=Math.round((success?100000:92000)*mult);/* what the property is actually worth */
const price=Math.round(fairValue*disc);/* what you pay this cycle */
const mort=Math.round(price*0.8);/* 80% financed */
const equity=fairValue-mort;/* your stake is vs FAIR value — buy cheap in a bust and you're instantly up */
s.real_estate_debt=(s.real_estate_debt||0)+mort;s.total_debt+=mort;s.real_estate_equity=(s.real_estate_equity||0)+equity;
// Cash flow is modest and NOT the point — net rent roughly covers the mortgage. The returns are the TAX SHIELD, tenants paying down your loan, and appreciation.
const noi=Math.round(fairValue*(success?0.008:0.005));s.other_monthly_revenue=(s.other_monthly_revenue||0)+noi;
s._asset_units=(s._asset_units||0)+1;s._asset_income=(s._asset_income||0)+noi;
// THE BENEFIT — depreciation: a non-cash paper deduction (~building value / 27.5yr) that shelters your taxable income, cutting your tax bill while no cash leaves your pocket.
const reDepr=Math.round(price*0.8/27.5/12);s._re_depreciation=(s._re_depreciation||0)+reDepr;
s._dyn_narrative=success?('You closed on a '+this.fmtMoney(fairValue)+' property for '+this.fmtMoney(price)+(disc<0.95?' — a soft market handed you a discount, so you start with extra equity':'')+'. The rent barely beats the mortgage ('+this.fmtMoney(noi)+'/mo net), and that\'s fine: the real win is the <strong>'+this.fmtMoney(reDepr)+'/mo depreciation write-off</strong> sheltering your income, plus tenants paying down your loan and the property appreciating.'):('The deal closed on tougher terms — thinner equity and slim cash flow — but you still locked in the depreciation tax shield and a foothold in the market.');}
if(action.id==='private_lending'){const s=this.state;if(success){const extra=Math.min(Math.round((s.cash||0)*0.4),180000),add=(extra>0?extra:0);if(extra>0)s.cash-=extra;s.investment_positions=(s.investment_positions||0)+20000+add;const pos=20000+add;s.other_monthly_revenue=(s.other_monthly_revenue||0)+Math.round(pos*0.012);s._dyn_narrative='You deployed '+this.fmtMoney(pos)+' into private loans at ~14% annual. The interest checks start arriving — you\'re the bank now.';}else{s.investment_positions=(s.investment_positions||0)+15000;s.other_monthly_revenue=(s.other_monthly_revenue||0)+180;}}
if(action.id==='acquire_competitor'){const s=this.state;if(success){const mult=Math.max(1,Math.min(3,1+(s.monthly_revenue||0)/40000)),pos=Math.round(30000*mult),passive=Math.round(pos*0.015),writeoff=Math.round(pos*0.02);s.investment_positions=(s.investment_positions||0)+pos;s.other_monthly_revenue=(s.other_monthly_revenue||0)+passive;s.operating_expenses=Math.max(0,(s.operating_expenses||0)-writeoff);s._dyn_narrative='You acquired the competitor as an investment — '+this.fmtMoney(pos)+' in book value throwing off '+this.fmtMoney(passive)+'/mo passive cash flow, plus '+this.fmtMoney(writeoff)+'/mo in depreciation write-offs cutting your taxes.';}else{s.investment_positions=(s.investment_positions||0)+10000;s.other_monthly_revenue=(s.other_monthly_revenue||0)+150;s._dyn_narrative='Integration was rocky and much of the acquired revenue churned — but the remaining book value still trickles in passive income.';}}
if(action.id==='private_banking'&&success){const s=this.state,sep=this.isSeparated(),pt=sep&&(s.personal_cash||0)>(s.cash||0)?'personal_cash':'cash';const deposit=Math.round((s[pt]||0)*0.85);if(deposit>0){s[pt]-=deposit;s.private_bank_balance=(s.private_bank_balance||0)+deposit;const loan=Math.round(deposit*0.9);s[pt]+=loan;s.private_bank_loan=(s.private_bank_loan||0)+loan;const moInt=Math.round(s.private_bank_balance*0.004);s._dyn_narrative='Private bank relationship open. You deposited '+this.fmtMoney(deposit)+' (earning ~5%/yr — about '+this.fmtMoney(moInt)+'/mo) and immediately drew '+this.fmtMoney(loan)+' against it at just 1%/yr. Your capital keeps earning while '+this.fmtMoney(loan)+' of near-free money lands in your account to deploy. The 5% you earn vs the 1% you pay is pure spread — this is leveraging OPM at its hardest.';}else{s._dyn_narrative='Your private bank relationship is open, but there\'s little cash to deposit right now. Build up your balance and they\'ll set up the interest-earning deposit and your 1% credit line.';}}
if(action.id==='private_equity_fund'){const s=this.state;const commit=success?Math.min(Math.round((s.cash||0)*0.5),250000):Math.min(Math.round((s.cash||0)*0.25),60000);if(commit>0)s.cash-=commit;const marked=Math.round(commit*(success?1.1:1.0));s.investment_positions=(s.investment_positions||0)+marked;s.other_monthly_revenue=(s.other_monthly_revenue||0)+Math.round(commit*(success?0.009:0.004));if(success)s._dyn_narrative='You committed '+this.fmtMoney(commit)+' to the PE fund. It\'s illiquid — locked up while the managers buy and scale companies — but already marked at '+this.fmtMoney(marked)+' and sending quarterly distributions. This is how big money compounds quietly.';else s._dyn_narrative='Your capital call of '+this.fmtMoney(commit)+' is in; the fund\'s deals are still closing, so distributions start small and ramp up.';}
if(action.id==='setup_family_office'&&success){this.state._fo_yield_boost=true;}
if(action.id==='combined_insurance'&&success){const annRev=(this.state.monthly_revenue||0)*12,annSal=(this.state.owner_pay||0)*12,liab=this.state.total_debt||0;this.state.insurance_coverage=Math.max(Math.round(annRev*2.5),Math.round(annSal*15))+liab;['income_protection','keyman_insurance'].forEach(id=>{if(!this.state._completed_actions.includes(id))this.state._completed_actions.push(id);});}
// Key-Man Leverage: cover the operators running your income properties up to the current portfolio size; the monthly premium scales with how many you cover (managed as a recurring cost, reconciled by delta so re-taking just tops it up).
if(action.id==='key_man_policy'&&success){const s=this.state;s._keyman_units=s._asset_units||0;const targetPrem=Math.round((s._keyman_units||0)*180),cur=s._keyman_premium||0;if(targetPrem!==cur){s.operating_expenses=Math.max(0,(s.operating_expenses||0)+(targetPrem-cur));s._keyman_premium=targetPrem;if(!s._active_recurring_costs)s._active_recurring_costs={};s._active_recurring_costs['key_man_policy']=targetPrem;}s._dyn_narrative='Key-man / loan-protection policies are in force on the people running your income properties — <strong>'+(s._keyman_units||0)+' operator'+((s._keyman_units===1)?'':'s')+' covered</strong>, ~'+this.fmtMoney(targetPrem)+'/mo in premiums. If one is lost, the policy retires that property\'s specific mortgage so the leverage can\'t bury you. A backstop, not a windfall.';}
// Lifestyle action handling
if(cat==='lifestyle'){if(action.recurring_cost&&!this.state._active_lifestyle_costs[action.id]){this.state._active_lifestyle_costs[action.id]=action.recurring_cost;this.state.lifestyle_expenses=(this.state.lifestyle_expenses||0)+action.recurring_cost;}
const buffs={mentor_others:{delay:3,effects:{leads:5,brand_equity:5,monthly_revenue:500},narrative:"Your mentee referred a client to you."},volunteer_time:{delay:2,effects:{brand_equity:8,leads:3},narrative:"Someone from the volunteer site reached out — they need what you offer."},faith_community:{delay:4,effects:{leads:4,brand_equity:3,lifestyle_relationships:5},narrative:"A fellow member mentioned your business to their network."},family_trip:{delay:1,effects:{energy:10,lifestyle_relationships:5},narrative:"You came back recharged. The clarity is showing up in your work."},therapy_coaching:{delay:2,effects:{energy:8,lifestyle_health:3},narrative:"The patterns your therapist helped you see — you're catching them now."},learn_new_skill:{delay:3,effects:{brand_equity:5,leads:3},narrative:"The class led to an unexpected client connection."},charity_donation:{delay:2,effects:{brand_equity:8},narrative:"The charity featured your business in their donor spotlight."}};
if(buffs[action.id]){const b=buffs[action.id];if(!this.state._lifestyle_buffs)this.state._lifestyle_buffs=[];this.state._lifestyle_buffs.push({trigger_month:this.month+b.delay,effects:b.effects,narrative:b.narrative,source:action.label});}
this.lifestyleHistory.push(action);}
// Credit declined: explain the underwriting reason (high utilization / personal myFICO pull) so the lesson lands.
if(_isCreditApp&&!success){const s=this.state,isLoan=LOAN_APPROVAL.includes(action.id),u=this.calcPersUtil(),dti=this.calcDTI(),sc=Math.round(s.personal_credit_score||0);let _why='Declined. '+(isLoan?(dti>36?'Your <strong>debt-to-income is '+dti+'%</strong> — above the ~36% a lender wants to see your cash flow service, so the payment looks too tight. ':''):(u>30?'Your personal credit utilization is at <strong>'+u+'%</strong> — well above the ~30% lenders want to see, so you read as overextended. ':''))+(isLoan?'The bank also pulled your personal <strong>myFICO 3B ('+sc+')</strong>. ':'Even though this is business credit, the bank pulled your personal <strong>myFICO 3B ('+sc+')</strong> and leaned on your personal guarantee. ');
if(!this._naicsVerified()&&['llc','s_corp','c_corp','multi_entity'].includes(s.entity_structure))_why+='Your business also tripped an underwriting flag: its <strong>NAICS industry code looks off</strong>, so the file got kicked out. A <strong>Wyoming holding-company setup</strong> assigns the correct code and clears this. ';
if(!this._hasBanking())_why+='And you have <strong>no banking relationship</strong> here — you\'re a stranger applying cold. Build the relationship (bank and deposit with them) and they lend far more readily. ';
_why+=(isLoan?(dti>36?'Lower your debt-to-income (pay down debt or grow revenue) under ~36% and reapply — approval odds jump sharply.':'Shore up the gaps above, then reapply.'):(u>30?'Pay your revolving balances under 30% and reapply — approval odds jump sharply.':'Shore up the gaps above, then reapply.'));this.state._dyn_narrative=_why;}
const _dn=this.state._dyn_narrative;this.state._dyn_narrative=null;this.actionHistory.push(action);(this._playLog=this._playLog||[]).push({m:this.month,c:cat,l:action.label,s:success});const _ro={action,success,effects,narrative:_dn||(cat==='lifestyle'?action.narrative:(success?action.narrative_success:action.narrative_failure)),cost:_cost,fund:_fund,_execRun:_execRun,_energySpent:(_execRun?0:_energyCost)};
if(cat==='lifestyle')_ro._mastery=this._masteryPanel(_lifeDB,_lifeMB,_lifeEnB);
// Before → after on credit metrics this action moved (limit/utilization/available credit)
{const sep=this.isSeparated(),RED='var(--red)',GRN='var(--accent)',af={bizLim:this.state.business_credit_limit||0,bizUtil:this.calcBizUtil(),persUtil:this.calcPersUtil(),avail:this.state.available_credit||0,persScore:this.state.personal_credit_score||0,cash:this.state.cash||0,pcash:this.state.personal_cash||0,debt:this.state.total_debt||0},rows=[];_ro._baKeys=[];_ro._scoreMoved=af.persScore!==_cb.persScore;
// Cash this action moved (cost paid, or loan/sale proceeds added)
if(Math.round(af.cash)!==Math.round(_cb.cash)){rows.push([sep?'Business cash':'Cash',this.fmtMoney(_cb.cash),this.fmtMoney(af.cash),af.cash<_cb.cash?RED:GRN]);if(!effects.cash)_ro._baKeys.push('cash');}
if(sep&&Math.round(af.pcash)!==Math.round(_cb.pcash)){rows.push(['Personal cash',this.fmtMoney(_cb.pcash),this.fmtMoney(af.pcash),af.pcash<_cb.pcash?RED:GRN]);_ro._baKeys.push('personal_cash');}
if(af.persScore!==_cb.persScore)rows.push(['Personal credit score',''+_cb.persScore,''+af.persScore,af.persScore>=_cb.persScore?GRN:RED]);
if(af.bizLim!==_cb.bizLim)rows.push(['Business credit limit',this.fmtMoney(_cb.bizLim),this.fmtMoney(af.bizLim),af.bizLim>=_cb.bizLim?GRN:RED]);
if(af.bizLim>0&&af.bizUtil!==_cb.bizUtil)rows.push(['Business utilization',_cb.bizUtil+'%',af.bizUtil+'%',af.bizUtil<=_cb.bizUtil?GRN:RED]);
if(af.persUtil!==_cb.persUtil)rows.push(['Personal utilization',_cb.persUtil+'%',af.persUtil+'%',af.persUtil<=_cb.persUtil?GRN:RED]);
if(af.avail!==_cb.avail&&af.bizLim===_cb.bizLim)rows.push(['Personal credit available',this.fmtMoney(_cb.avail),this.fmtMoney(af.avail),af.avail>=_cb.avail?GRN:RED]);
// Total debt this action moved (e.g. a loan adds debt without touching the credit limit)
if(Math.round(af.debt)!==Math.round(_cb.debt)){rows.push(['Total debt',this.fmtMoney(_cb.debt),this.fmtMoney(af.debt),af.debt>_cb.debt?RED:GRN]);if(!effects.total_debt)_ro._baKeys.push('total_debt');}
// Status-bar stats this action moved directly (leads, customers, team, etc.)
const _sbLbl={leads:'Leads',customer_base:'Customers',team_size:'Team size',brand_equity:'Brand equity',systems_maturity:'Systems maturity',revenue_capacity:'Revenue capacity'};
for(const k of _SB){const bv=_sbBefore[k],av=this.state[k]||0;if(Math.round(av)!==Math.round(bv)){const money=k==='revenue_capacity';rows.push([_sbLbl[k],money?this.fmtMoney(bv):''+Math.round(bv),money?this.fmtMoney(av):''+Math.round(av),av>=bv?GRN:RED]);_ro._baKeys.push(k);}}
if(rows.length)_ro.beforeAfter=rows;}
results.push(_ro);if(cat==='epic'||cat==='epicbuy')this._epicLastMove={label:action.label,narrative:_ro.narrative,success:success};if(action._waivedFee){this._epicSavings=(this._epicSavings||0)+action._waivedFee;this.state._epic_savings_total=(this.state._epic_savings_total||0)+action._waivedFee;}if(action.id==='debt_restructure'&&this._deferRestructure)this._deferRestructure.ro=_ro;}
delete this.selectedActions['epic'];delete this.selectedActions['epicbuy'];
for(const b of _execBonuses){results.push({action:{label:b.role+' Performance Bonus'},success:true,effects:{cash:-b.bonus},narrative:'Your '+b.role+' hit their targets executing “'+b.label+'” — you paid a '+this.fmtMoney(b.bonus)+' performance bonus. Great executives earn their keep.'});}
this.monthlyTick();if(this._deferRestructure){const dr=this._deferRestructure;this._deferRestructure=null;if(dr.success){const n=this.applyDebtRestructure(dr);if(dr.ro)dr.ro.narrative=n;}}this._syncRecurring();this.updateRelationships();this.monthlySnapshots.push(JSON.parse(JSON.stringify(this.state)));
this._monthCashSummary={start:_msStart,spend:_spend};
const evt=this.checkEvents();this.showResults(results,evt);},

applyEffects(effects){for(const[k,v]of Object.entries(effects)){if(k==='entity_structure'||k==='business_credit_profile'||k==='trust_structure')this.state[k]=v;else if(k==='collections_removed'){if(this.state.debt_breakdown)delete this.state.debt_breakdown.collections;}else if(typeof v==='boolean')this.state[k]=v;else this.state[k]=(this.state[k]||0)+v;}this.state.energy=Math.max(-40,Math.min(100,this.state.energy));this.state.personal_credit_score=Math.max(300,Math.min(850,this.state.personal_credit_score));this.state.brand_equity=Math.max(0,Math.min(100,this.state.brand_equity));this.state.systems_maturity=Math.max(0,Math.min(100,this.state.systems_maturity));this.state.key_person_dependency=Math.max(0,Math.min(100,this.state.key_person_dependency));this.state.fitness_level=Math.max(0,Math.min(100,this.state.fitness_level||0));this.state.churn_rate=Math.max(0,Math.min(0.5,this.state.churn_rate));this.state.customer_base=Math.max(0,this.state.customer_base);this.state.total_debt=Math.max(0,this.state.total_debt);this.state.team_size=Math.max(0,this.state.team_size);this.state.leads=Math.max(0,this.state.leads||0,this.state.customer_base||0);this.state.company_culture=Math.max(0,Math.min(100,this.state.company_culture==null?45:this.state.company_culture));this.state.operating_expenses=Math.max(0,this.state.operating_expenses||0);this.state.cogs=Math.max(0,this.state.cogs||0);},

monthlyTick(){const s=this.state;
// C-suite salaries scale with revenue each month — adjust the portion of opex we own by the delta (keeps it in burn/EBITDA/tax/profit)
{const ec=this.calcExecComp(),delta=ec-(s._exec_comp_applied||0);if(delta){s.operating_expenses=Math.max(0,(s.operating_expenses||0)+delta);s._exec_comp_applied=ec;}}
// Macro cycle advances FIRST so this month's drivers (IUL index credit, market rate, asset prices, credit availability) are set before the financial sections use them.
this._advanceMarketCycle();
// Process delayed effects
if(s._delayed_effects){const ready=s._delayed_effects.filter(d=>d.month<=this.month);s._delayed_effects=s._delayed_effects.filter(d=>d.month>this.month);for(const d of ready)this.applyEffects(d.effects);}
// Toxic high-ticket closer: while he's on the team his fake promises and guarantees keep doing damage — rising churn, brand erosion, and climbing lawsuit risk. The pressure builds until you fire him (via Restructure & Downsize).
if(s._toxic_closer){s.churn_rate=Math.min(0.5,(s.churn_rate||0)+0.03);s.brand_equity=Math.max(0,(s.brand_equity||0)-3);s.litigation_exposure=(s.litigation_exposure||0)+6;}
// Term-limited recurring costs falling off (e.g. a merchant cash advance, once it's paid off): stop the monthly drain, drop it from the burn breakdown, and post a "paid off" note.
if(s._recurring_expiry){for(const id of Object.keys(s._recurring_expiry)){if(this.month>=s._recurring_expiry[id]){const c=(s._active_recurring_costs||{})[id]||0;if(c){s.operating_expenses=Math.max(0,(s.operating_expenses||0)-c);delete s._active_recurring_costs[id];}delete s._recurring_expiry[id];s._pendingRipples=(s._pendingRipples||[]).concat([{source:this.actionLabel(id)||'Financed cost',narrative:'Fully paid off — the recurring payments stop. An expensive way to borrow; lesson learned.'}]);}}}
// Delegation ladder — marketing specialists auto-run their function each month. You LEARNED the play by doing it; a specialist now repeats it for a salary (no energy, no action slot). A Marketing Manager lifts them from "solid" (0.85) to better-than-you (1.15) and the Director (CRO) takes the whole function. Only the persistent growth effects carry — the salary (recurring_cost) is already in opex.
{const sysMat=s.systems_maturity||0;
 // A hire is only as good as the SYSTEMS behind them. Drop people onto no SOPs/processes and the output craters AND swings wildly month to month (real life: an unsupported new hire flails). Systemize first and the same salary compounds reliably. This is the lesson — systems scale you, not headcount.
 const sysFactor=0.15+0.85*Math.min(1,sysMat/90);/* 0.15 at zero systems → 1.0 only once truly dialed in (~90) — efficiency is earned slowly */
 let consistency=Math.min(1,sysMat/75);if(s._mgr_marketing)consistency=Math.min(1,consistency+0.3);/* low systems = erratic; a manager steadies the team */
 const mgrBoost=s._mgr_marketing?1.2:1.0;
 const runSpec=(flag,grp,who)=>{if(!s[flag]||s._cro_hired)return;/* the CRO/Director covers marketing once hired */const a=this._bestInGroup('marketing',grp);if(!a)return;
  const variance=consistency+(1-consistency)*Math.random();/* wide swing when unsystematized, tight when dialed-in */
  const q=sysFactor*mgrBoost*variance*0.32;/* 0.32 base — deliberately slow: a specialist SUPPLEMENTS your work at real-world pace, it doesn't rocket your growth or replace strategy */
  const ef=this.scaleActionEffects(a.effects||{},'marketing'),apply={};['leads','customer_base','brand_equity','sales_conversion','revenue_capacity'].forEach(k=>{if(ef[k])apply[k]=Math.round(ef[k]*q);});
  if(Object.keys(apply).length){this.applyEffects(apply);const tag=sysMat<35?' — but with no systems behind them, the results are thin and uneven':(s._mgr_marketing?' — manager-coordinated, steady output':'');s._pendingRipples=(s._pendingRipples||[]).concat([{source:who,narrative:'ran '+a.label+' this month'+tag+'.'}]);}};
 runSpec('_spec_leadgen','Lead Generation','Lead-Gen Specialist');runSpec('_spec_convert','Sales & Conversion','Sales Specialist');}
// Churn — leaky bucket: a large base with low systems/no retention churns faster
{const sizeChurn=Math.max(0,((s.customer_base||0)-30)/30*0.01)*Math.max(0,1-(s.systems_maturity||0)/100);const effChurn=Math.min(0.4,(s.churn_rate||0)+sizeChurn);s.customer_base=Math.max(0,s.customer_base-Math.floor(s.customer_base*effChurn));}
// Lead decay — un-nurtured prospects go cold. The not-yet-converted lead pool shrinks each month, so you can't coast on a one-time pile of leads: without fresh marketing (and retention to slow churn) the customer base erodes. Strong brand keeps prospects warm longer. (DESIGN: only passive TAX-FREE income should arrive without work — business revenue must be worked.)
{const decay=Math.max(0.05,0.18-(s.brand_equity||0)/1000);const pool=Math.max(0,(s.leads||0)-(s.customer_base||0));const stale=Math.floor(pool*decay);if(stale>0)s.leads=Math.max(s.customer_base||0,(s.leads||0)-stale);}
// Lead conversion — leads are CUMULATIVE contacts you keep; only the not-yet-converted pool turns into customers, so leads never go below customers.
const baseConv=0.05,skillConv=(s.skill_marketing||0)/300,brandConv=(s.brand_equity||0)/1000,salesConv=Math.min(0.20,(s.sales_conversion||0)*0.01);
const convRate=Math.min(0.5,baseConv+skillConv+brandConv+salesConv);const pool=Math.max(0,(s.leads||0)-(s.customer_base||0));const converted=Math.floor(pool*convRate);
s.customer_base=(s.customer_base||0)+converted; // converting a lead doesn't delete the contact — leads stay
s.leads=Math.max(s.leads||0,s.customer_base||0); // invariant: always at least as many leads (total contacts) as customers
// Revenue = customers × value per customer (recalculated each month)
const revPerCust=Math.round(100+(s.brand_equity||0)*5+(s._completed_actions&&s._completed_actions.includes('build_offer')?200:0)+(s.skill_marketing||0)*2);
s.monthly_revenue=s.customer_base*revPerCust;
// Revenue capacity cap — you can only capture demand up to what the business can deliver; beyond it revenue is heavily dampened (market saturation / strained delivery). Capacity grows via offer, sales infra, systems, team.
// A small, efficient business has a NATURAL size ceiling. Past a healthy level, extra capacity buys sharply less revenue — you can't grind operations to infinity. Real wealth comes mid-to-late from FINANCE leveraging the cash & credit this business throws off, not from making the business itself enormous. (DESIGN.md: brute-force revenue must hit a ceiling; passive tax-free income is the crown jewel.)
{const team=s.team_size||0,sys=s.systems_maturity||0;
 // Your ceiling is set by SYSTEMS, not hustle or headcount (Gerber's E-Myth; Greiner's coordination crisis). A lean op tops out ~$80-120k/mo. Only deep systems infrastructure lifts it, and even maxed it walls out at the edge of "No Man's Land" (~$2M/yr) — the real stall zone (Tatum) where, without enterprise infrastructure, management debt + churn + people problems compound faster than you can grow. Headcount past a lean team buys almost nothing here. The way forward isn't a bigger business; it's FINANCE leveraging the cash & credit you built.
 const base=45000,systemsHeadroom=Math.min(sys,100)*900,teamHeadroom=Math.min(team,8)*3000,capacityTail=Math.min(s.revenue_capacity||0,50000)*0.4;
 const cap=base+systemsHeadroom+teamHeadroom+capacityTail;
 // HARD wall (not a soft damp): the business physically cannot push past ~110% of its systems-set ceiling. Lean+low systems ≈ $80-110k/mo; fully systematized ≈ $180-200k (the edge of No Man's Land, ~$2M/yr). To go further you'd need enterprise infrastructure this game doesn't hand you — because the point is to plateau lean and let FINANCE build the wealth.
 const wall=Math.round(cap*1.1);if(s.monthly_revenue>wall)s.monthly_revenue=wall;}
// Seasonal dip — Q4 each year (months 10-12, 22-24, 34-36)
const monthInYear=((this.month-1)%12)+1;if(monthInYear>=10)s.monthly_revenue=Math.round(s.monthly_revenue*0.85);
// Macro-cycle revenue tilt — booms lift demand, downturns bite (the same cycle that drives the finance game).
{const _ph=(s._cycle&&s._cycle.phase)||'expansion',_rt=(this._CYCLE_PHASES[_ph]||{}).rev||1;if(_rt!==1)s.monthly_revenue=Math.round((s.monthly_revenue||0)*_rt);}
// Merchant cash advance holdback: the lender skims a fixed % of revenue every month until the (much larger) balance is cleared — then it falls off. No credit involvement; it just bleeds the top line.
if((s._mca_balance||0)>0){const hold=Math.round((s.monthly_revenue||0)*(s._mca_holdback||0.2)),pay=Math.min(hold,s._mca_balance);if(pay>0){s.cash=(s.cash||0)-pay;s._mca_balance-=pay;}s._mca_paid=pay;if(s._mca_balance<=0){s._mca_balance=0;s._pendingRipples=(s._pendingRipples||[]).concat([{source:'Cash Advance',narrative:'Finally cleared — the revenue holdback stops. An expensive way to borrow; lesson learned.'}]);}}
else s._mca_paid=0;
const sep=this.isSeparated(); // business & personal money split once an LLC is formed
// Business operating cash: revenue in; COGS, opex, debt service out
s.cash+=s.monthly_revenue-s.cogs-s.operating_expenses;
const interest=this.calcDebtInterest(),principal=this.calcDebtPrincipal();s.cash-=interest;s.cash-=principal;s.total_debt=Math.max(0,s.total_debt-principal);
// REAL-ESTATE AMORTIZATION: the RE share of this month's principal isn't just debt service — it converts mortgage debt into EQUITY (tenants paying down your loan). Mirror it into real_estate_debt (down) and real_estate_equity (up) so the mortgage actually amortizes and the equity actually builds — the real-world mechanic velocity banking exists to accelerate.
{const rePrin=Math.min(s.real_estate_debt||0,Math.round((s.real_estate_debt||0)*0.005));if(rePrin>0){s.real_estate_debt=Math.max(0,(s.real_estate_debt||0)-rePrin);s.real_estate_equity=(s.real_estate_equity||0)+rePrin;s._re_amort_ytd=(s._re_amort_ytd||0)+rePrin;}
// Appreciation: the property gains value over time (~3%/yr), all of which lands in your equity (debt is fixed). Paused in a credit-tight downturn — the margin-call/haircut logic handles drops there.
if((s._asset_units||0)>0&&!s._credit_tight){const appr=Math.round(((s.real_estate_debt||0)+(s.real_estate_equity||0))*0.0025);if(appr>0){s.real_estate_equity=(s.real_estate_equity||0)+appr;s._re_appr_ytd=(s._re_appr_ytd||0)+appr;}}}
// Payroll: people only leave if you genuinely can't make payroll after this month's revenue and ALL your available credit (personal + business)
{const payroll=(s.team_size||0)*2500,reserves=Math.max(0,s.cash)+(s.available_credit||0)+Math.max(0,(s.business_credit_limit||0)-(s.business_credit_used||0));if(payroll>0&&reserves<payroll){const lost=Math.min(s.team_size||0,Math.ceil((payroll-reserves)/2500));s.team_size=Math.max(0,(s.team_size||0)-lost);s.key_person_dependency=Math.min(100,(s.key_person_dependency||0)+lost*8);s.operating_expenses=Math.max(0,(s.operating_expenses||0)-lost*2000);}}
// Owner draw/salary moves business→personal to cover personal needs; personal expenses paid from personal cash (commingled before the LLC)
// Tax reserve (optional): post-LLC the owner sets aside their pass-through tax from personal cash into the reserve, to cover the year-end bill. The tax itself is assessed/paid at year-end (showTaxEvent).
const _taxableInc=Math.max(0,(s.monthly_revenue||0)-(s.cogs||0)-(s.operating_expenses||0)-(s._re_depreciation||0));/* real-estate depreciation is a non-cash deduction that shelters taxable income */
const monthlyReserve=(sep&&s._completed_actions.includes('monthly_tax_reserve'))?Math.round(_taxableInc*(s.tax_rate||0.25)):0;
if(monthlyReserve)s.tax_reserve=(s.tax_reserve||0)+monthlyReserve;
const insFunding=(s._completed_actions&&s._completed_actions.includes('fund_accumulation_policy')&&s._auto_fund_insurance)?Math.round(Math.min((s.monthly_revenue||0)*0.15,this.calcBusinessLevel()*5000)):0; // accumulation IUL funding (aggressive, scales with revenue) is a personal expense, covered by the owner draw
const personalExp=(s.living_expenses||0)+(s.lifestyle_expenses||0)+monthlyReserve+(sep?insFunding:0);
if(sep){const salary=Math.min(s.owner_pay||0,Math.max(0,s.cash));s.cash-=salary;s.personal_cash=(s.personal_cash||0)+salary; // salary (W-2) is personal income → personal cash
s.personal_cash-=personalExp; // personal pays its own living/lifestyle (+ sets aside tax reserve if active)
// Shortfall: the owner takes a LEGAL draw — first from business cash, then by liquidating the business line at ~6% into business cash, then personal credit last
if(s.personal_cash<0){const d=Math.min(-s.personal_cash,Math.max(0,s.cash));if(d>0){s.cash-=d;s.personal_cash+=d;this._recordDraw(d);}}
if(s.personal_cash<0){const bizCredit=Math.max(0,(s.business_credit_limit||0)-(s.business_credit_used||0)),liq=Math.min(-s.personal_cash,bizCredit);if(liq>0){s.business_credit_used=(s.business_credit_used||0)+liq;s.total_debt=(s.total_debt||0)+liq;s.personal_cash+=liq;this._recordDraw(liq);}} // liquidate business credit → business cash → draw
if(s.personal_cash<0){const pc=Math.min(-s.personal_cash,Math.floor((s.available_credit||0)/1.03));if(pc>0){const fee=Math.round(pc*0.03);s.available_credit-=(pc+fee);s.total_debt=(s.total_debt||0)+pc+fee;s.personal_cash+=pc;}} // personal credit as last resort (fee fits within the limit — never overdraws available credit)
if(insFunding>0){const _pre=s._iul_funding_type==='pre_tax',_cr=Math.round(insFunding*0.98);s.insurance_cash_value=(s.insurance_cash_value||0)+_cr;if(_pre)s._ytd_taxable_income=Math.max(0,(s._ytd_taxable_income||0)-insFunding);else s.insurance_basis=(s.insurance_basis||0)+_cr;} // funding lands in the policy. POST-tax: already-taxed premiums become BASIS → only gains taxed later. PRE-tax (DB-plan): the contribution is DEDUCTIBLE — it lowers your taxable income now (the real benefit) — but there's no basis, so the whole balance is taxable on a draw or lapse.
const netInc=Math.round((s.monthly_revenue||0)-(s.cogs||0)-(s.operating_expenses||0)-(s.owner_pay||0));s.capital_account=(s.capital_account||0)+netInc;} // retained profit grows the owner's equity
else{s.cash-=(s.living_expenses||0)+(s.lifestyle_expenses||0);if(insFunding>0&&s.cash>=insFunding){s.cash-=insFunding;const _cr=Math.round(insFunding*0.98);s.insurance_cash_value=(s.insurance_cash_value||0)+_cr;if(s._iul_funding_type==='pre_tax')s._ytd_taxable_income=Math.max(0,(s._ytd_taxable_income||0)-insFunding);else s.insurance_basis=(s.insurance_basis||0)+_cr;}}
// An equity partner really takes their cut of monthly profit — this is what "they own 30% of every dollar" means in practice.
if(s._partner_equity>0){const prof=Math.max(0,(s.monthly_revenue||0)-(s.cogs||0)-(s.operating_expenses||0)),skim=Math.round(prof*s._partner_equity);if(skim>0){s.cash=(s.cash||0)-skim;s.capital_account=(s.capital_account||0)-skim;s._partner_skim=skim;}}
// MANAGEMENT DEBT — when the team outgrows the infrastructure (systems + management + culture) that can support it, the gap compounds into real drag. Every reason a founder hits the wall, modeled off ONE honest ratio: team_size vs Org Capacity.
{const cap=this._orgCapacity(),team=s.team_size||0,over=Math.max(0,team-cap);s._orgCap=Math.round(cap);s._orgOver=Math.round(over*10)/10;
 if(over>0){
  // A. Coordination drag — communication channels explode quadratically (Brooks's Law: n(n-1)/2). A small overrun stings; a big one hemorrhages.
  s.cash-=Math.round(over*over*300+over*1000);
  // B. Productivity dilution — an overstretched team delivers LESS, not more (diminishing returns + green hires + shirking you can't monitor). Over-hiring actively cuts your output.
  s.monthly_revenue=Math.round((s.monthly_revenue||0)*Math.max(0.55,1-over*0.025));
  // C. Culture & quality spiral — context dilutes, standards slip, customers feel it.
  s.company_culture=Math.max(0,(s.company_culture==null?45:s.company_culture)-Math.min(7,over*0.7));
  s.churn_rate=Math.min(0.5,(s.churn_rate||0)+Math.min(0.05,over*0.005));
  s.brand_equity=Math.max(0,(s.brand_equity||0)-Math.min(3,over*0.3));
  // D. Fragility — knowledge concentrates in individuals (key-person risk) when you're stretched thin.
  s.key_person_dependency=Math.min(100,(s.key_person_dependency||0)+Math.min(5,over*0.4));
  s._pendingRipples=(s._pendingRipples||[]).concat([{source:'Management debt',narrative:'Your team of '+team+' has outgrown what your systems & leadership can carry (~'+Math.round(cap)+'). Coordination, culture and quality are all slipping. Build systems and hire real managers — or trim back to a lean team.'}]);
 }}
 // EMPLOYEE RETENTION — keeping a team is a constant fight against a market that will out-pay and out-benefit you. People leave for more money, better benefits, equity, room to grow, or because they're burned out — and the bigger/better your team, the harder recruiters pull at them. You can only sustain the headcount your PAY, BENEFITS, EQUITY, CULTURE, GROWTH PATH and SYSTEMS can hold. Hire past that and people churn out faster than you replace them — which is exactly why small businesses stay small.
 {const team=s.team_size||0;
  if(team>0){const c=id=>(s._completed_actions||[]).includes(id),cul=s.company_culture==null?45:s.company_culture,over=s._orgOver||0;
   let pull=0.03+Math.min(0.18,team*0.005)+Math.min(0.06,(s.monthly_revenue||0)/3000000);/* recruiters target your trained people; the bigger the team the more of it is in play — pull keeps climbing, so even a well-run shop can't hold an ever-larger team */
   if(s._market_cycle==='boom')pull+=0.04;/* hot market = everyone's poaching */
   let hold=0;if(c('build_benefits_package'))hold+=0.05;if(c('grant_stock_incentives'))hold+=0.06;if(c('hire_hr_manager'))hold+=0.03;if(c('middle_management')||s._coo_hired||s._mgr_marketing)hold+=0.03;/* career path */hold+=Math.max(-0.05,(cul-50)/600);/* culture retains or repels */
   const burnout=Math.min(0.12,over*0.012)+((s.energy||0)<25?0.03:0);
   const attrition=Math.max(0.01,Math.min(0.4,pull+burnout-hold));
   const exp=team*attrition,leavers=Math.floor(exp)+((Math.random()<(exp-Math.floor(exp)))?1:0);
   if(leavers>0){s.team_size=Math.max(0,team-leavers);s.key_person_dependency=Math.min(100,(s.key_person_dependency||0)+leavers*3);s.operating_expenses=Math.max(0,(s.operating_expenses||0)-leavers*2000);s.cash-=leavers*2500;/* backfill/recruiting cost */s.systems_maturity=Math.max(0,(s.systems_maturity||0)-Math.min(4,leavers));/* knowledge walks out, systems take a hit */
    // THE TREADMILL — backfilling drains YOUR time (hiring, onboarding, firefighting) and the green replacements deliver less for a while. The more people, the more leave, the more you retrain — you run flat out just to stand still.
    s.energy=Math.max(-40,(s.energy||0)-Math.min(8,leavers*3));
    s._churn_drag=Math.min(0.35,(s._churn_drag||0)+leavers*0.04);
    s._turnover_streak=(s._turnover_streak||0)+1;
    s._pendingRipples=(s._pendingRipples||[]).concat([{source:'Turnover',narrative:leavers+' '+(leavers===1?'person':'people')+' left for better pay/benefits elsewhere. Now it\'s hire, onboard, retrain — your time, not theirs — and output dips while the replacements ramp. Hold a team only by out-retaining the market: pay, benefits, equity, culture, growth.'}]);}
   else s._turnover_streak=0;
   // Retraining drag decays as replacements ramp up — but a constantly-churning team never gets ahead.
   if(s._churn_drag>0){s.monthly_revenue=Math.round((s.monthly_revenue||0)*(1-s._churn_drag));s._churn_drag=Math.max(0,s._churn_drag*0.8);}
   // THE LESSON — when you're clearly stuck on the treadmill, name it and point the way out: stop trying to out-grow a natural ceiling; let FINANCE build the wealth.
   if((s._turnover_streak||0)>=3&&!s._scaleLessonShown){s._scaleLessonShown=true;s._pendingRipples=(s._pendingRipples||[]).concat([{source:'The founder’s trap',narrative:'You keep hiring and they keep leaving — every month is retraining, not progress. A small business has a natural size; you can\'t out-muscle it with more bodies. From here, real wealth doesn\'t come from a bigger payroll — it comes from FINANCE: leverage the cash & credit you\'ve built into tax-free passive income.'}]);}
  }}
// Tax inefficiency drag — high profit without tax structure overpays the IRS every month
{const profit=Math.max(0,s.monthly_revenue-s.cogs-s.operating_expenses-(s.owner_pay||0)-(s._re_depreciation||0));if(profit>5000){let ineff=0.16;if(['s_corp','c_corp','multi_entity'].includes(s.entity_structure))ineff-=0.10;if(s._completed_actions.includes('tax_optimization'))ineff-=0.04;if(s._completed_actions.includes('tax_planning_session'))ineff-=0.02;if((s.trust_structure&&s.trust_structure!=='none'&&s.trust_structure!=='basic_llc'))ineff-=0.02;ineff=Math.max(0,ineff)*Math.min(1,profit/30000);if(this._perks().taxSmart)ineff*=0.7;/* Tax-Smart milestone perk: a dialed-in structure trims the residual drag */s.cash-=Math.round(profit*ineff);}}
const taxableIncome=Math.max(0,s.monthly_revenue-s.cogs-s.operating_expenses-(s._re_depreciation||0));s._ytd_taxable_income=(s._ytd_taxable_income||0)+taxableIncome;
if(!sep&&s._completed_actions.includes('monthly_tax_reserve')){const res=Math.round(taxableIncome*(s.tax_rate||0.25));s.tax_reserve+=res;s.cash-=res;}
const bizDebtSvc=Math.round(((s.total_debt||0)-(s.real_estate_debt||0))*0.018),ebitda=s.monthly_revenue-s.cogs-s.operating_expenses;s.dscr=bizDebtSvc>0?Math.round((ebitda/bizDebtSvc)*100)/100:99;
// VELOCITY BANKING — running the household through a line of credit instead of a checking account. The edge is real but conditional: park income on a simple-interest line and every surplus dollar retires MORE than a dollar of amortizing principal (the interest you'd have paid is saved), freeing capital years faster and lowering utilization → score. But it's a CASH-FLOW strategy: it only accelerates while you're cash-flow positive. Go negative and the deficit rides on the line and compounds (the spiral). And in a credit-tight downturn the lender can FREEZE/cut the line — which only hurts if you were leaning on it. Discipline (positive CF + lightly-used line) is rewarded; over-leverage is punished.
if(s._velocity_active&&(s.total_debt||0)>0){
 const fcf=Math.round((s.monthly_revenue||0)-(s.cogs||0)-(s.operating_expenses||0)-interest-principal-(s.living_expenses||0)-(s.lifestyle_expenses||0));
 const persRev=Math.max(0,(s.total_debt||0)-(s._installment_debt||0)-(s.business_credit_used||0)-(s.business_installment_debt||0)-(s.real_estate_debt||0));
 const lineLim=(s.business_credit_limit||0)+(persRev+(s.available_credit||0)),lineUsed=(s.business_credit_used||0)+persRev,lineUtil=lineLim>0?lineUsed/lineLim:0;
 // HELOC/line FREEZE — once per downturn, the lender cuts the line. Devastating if you were leaning on it (high utilization); a non-event if you kept it lightly used.
 if(s._credit_tight&&!s._velocity_frozen_cycle){s._velocity_frozen_cycle=true;
  if(lineUtil>0.5){const cut=Math.round((s.available_credit||0)*0.4)+Math.round(Math.max(0,(s.business_credit_limit||0)-(s.business_credit_used||0))*0.4);s.available_credit=Math.max(0,(s.available_credit||0)-Math.round((s.available_credit||0)*0.4));s.business_credit_limit=Math.max(s.business_credit_used||0,Math.round((s.business_credit_limit||0)*0.7));s.personal_credit_score=Math.max(300,(s.personal_credit_score||0)-8);
   s._pendingRipples=(s._pendingRipples||[]).concat([{source:'Velocity Banking — line frozen',narrative:'The downturn hit and your lender slashed your credit line — and you were leaning on it. With the line you run your household through suddenly cut, you\'re scrambling for cash and your utilization just spiked. THIS is the risk of velocity banking on a heavily-used line: in a credit crunch the bank pulls the rug exactly when you need it most. The disciplined keep the line lightly used so a freeze is a non-event.'}]);}
  else s._pendingRipples=(s._pendingRipples||[]).concat([{source:'Velocity Banking',narrative:'Credit tightened in the downturn and the bank trimmed your line — but you\'d kept it lightly used, so it barely registers. This is the discipline velocity banking demands: a line you don\'t depend on can\'t be used against you.'}]);}
 if(!s._credit_tight)s._velocity_frozen_cycle=false;/* reset once credit loosens, so the next downturn can freeze again */
 if(fcf>0){
  // AUTO-SWEEP — chunk a fraction of this month's surplus per your aggressiveness setting (conservative 50% / balanced 75% / aggressive 100%). The actual mechanics (route to the mortgage vs revolving, ~12% velocity acceleration, equity build, score) live in _velocityApply so the dashboard "Chunk extra now" button reuses the exact same engine.
  const modeFrac=({conservative:0.5,balanced:0.75,aggressive:1.0})[s._velocity_mode]||0.75;
  const res=this._velocityApply(fcf*modeFrac);
  s._velocity_spiral_streak=0;s._velocity_chunk=(s._velocity_chunk||0)+res.total;/* add to any manual chunk already done this month for the result readout */
 } else if(fcf<-200){
  // SPIRAL — negative cash flow means the deficit rides on the line and compounds. Velocity banking AMPLIFIES bad cash flow just as it amplifies good.
  const bleed=Math.round(Math.min(-fcf,lineUsed||(-fcf))*0.04);if(bleed>0){s.cash=(s.cash||0)-bleed;s.total_debt=(s.total_debt||0)+bleed;}
  s._velocity_spiral_streak=(s._velocity_spiral_streak||0)+1;/* leave _velocity_chunk intact — a manual chunk made during planning still counts toward the readout */
  if(s._velocity_spiral_streak>=2)s._pendingRipples=(s._pendingRipples||[]).concat([{source:'Velocity Banking — the spiral',narrative:'Your cash flow has gone negative, and velocity banking cuts both ways: with nothing to chunk, the shortfall is riding on your line and compounding. The strategy only builds wealth while you\'re cash-flow positive — right now it\'s working against you. Fix the cash flow (cut burn, lift revenue) or the line balance keeps climbing.'}]);
 }
}
// REAL-ESTATE LEVERAGE — the downturn margin-call test. Leverage cuts both ways: in good times the bank's money amplifies your returns, but when asset prices fall the debt stays fixed while equity evaporates — and a credit-tight market means you can't refinance your way out. The OVER-leveraged (high LTV going in, property that barely services its own debt, no reserves) get a MARGIN CALL → forced to sell into the crash at the worst possible price, realizing the loss. The CONSERVATIVELY leveraged (more equity down, healthy property cash flow, reserves on hand) take only a paper dip that recovers. This is the discipline real estate demands — and the mirror image of buy-the-dip: the forced sellers in a downturn are exactly who the prepared buy from.
if(s._credit_tight&&(s.real_estate_debt||0)>0&&(s._asset_units||0)>0&&!s._re_squeeze_cycle){s._re_squeeze_cycle=true;
 const debt=s.real_estate_debt||0,eq=s.real_estate_equity||0,value=debt+eq,units=s._asset_units||1,depth=s._downturn_depth||1;
 const haircut=Math.min(0.32,0.13*depth+0.05);/* property values fall 13-32% in the bust, deeper when the downturn is severe */
 const markedValue=Math.round(value*(1-haircut)),markedEq=markedValue-debt;/* debt is fixed; equity absorbs the whole drop and can go underwater */
 const ltv=markedValue>0?debt/markedValue:2;/* post-crash loan-to-value */
 const reSvc=Math.round(debt*0.006),reDSCR=reSvc>0?(s._asset_income||0)/reSvc:99;/* can the rents cover the mortgage? */
 const dp=this._dryPowder?this._dryPowder():{total:Math.max(0,(s.cash||0)+(s.personal_cash||0))},reserves=dp.total;
 if(ltv>0.90&&reDSCR<1.1&&reserves<reSvc*6){
  // MARGIN CALL — underwater, the property can't carry itself, and there's no cushion or refinance. The lender forces a sale of one property into the depressed market. Underwater means the sale doesn't even clear the loan — you eat the deficiency in cash, plus selling costs, and lose the income.
  const perDebt=Math.round(debt/units),perEq=Math.round(eq/units),perInc=Math.round((s._asset_income||0)/units);
  const proceeds=Math.round((perDebt+perEq)*(1-haircut)),deficiency=Math.max(0,perDebt-proceeds),sellCost=Math.round((perDebt+perEq)*0.06);
  s.real_estate_debt=Math.max(0,debt-perDebt);s.total_debt=Math.max(0,(s.total_debt||0)-perDebt);
  s.real_estate_equity=Math.max(0,eq-perEq);s._asset_units=Math.max(0,units-1);
  s.other_monthly_revenue=Math.max(0,(s.other_monthly_revenue||0)-perInc);s._asset_income=Math.max(0,(s._asset_income||0)-perInc);
  s.cash=(s.cash||0)-(deficiency+sellCost);if(s.cash<0){const unc=this.coverShortfall(-s.cash);s.cash=0;if(unc>0)s.cash=-unc;}
  s.personal_credit_score=Math.max(300,(s.personal_credit_score||0)-25);/* a forced sale / loan workout craters your credit */
  s._re_margin_called=(s._re_margin_called||0)+1;
  s._pendingRipples=(s._pendingRipples||[]).concat([{source:'Real Estate — MARGIN CALL',narrative:'The crash caught you over-leveraged. Property values fell ~'+Math.round(haircut*100)+'%, your loan-to-value blew past 90% (underwater), the rents no longer cover the mortgage, and with credit frozen you can\'t refinance. The lender forced a sale — and selling into the bottom, the '+this.fmtMoney(proceeds)+' didn\'t even clear the '+this.fmtMoney(perDebt)+' loan. You ate '+this.fmtMoney(deficiency+sellCost)+' in deficiency and costs, lost '+this.fmtMoney(perInc)+'/mo of income, and your credit took a 25-point hit. THIS is over-leverage: in the good times it amplified your returns, in the bust it nearly buried you. More equity down, property that covers its own debt, and reserves are what carry you through.'}]);
 } else {
  // RODE IT THROUGH — leverage was conservative (or reserves/cash flow covered it). Equity dips on paper but you're never forced to sell, so it recovers with the market.
  s._pendingRipples=(s._pendingRipples||[]).concat([{source:'Real Estate',narrative:'Property values dipped ~'+Math.round(haircut*100)+'% in the downturn, so your equity is down on paper. But your leverage was conservative — '+(ltv<=0.90?'healthy LTV':'')+(reDSCR>=1.1?(ltv<=0.90?', ':'')+'rents cover the mortgage':'')+(reserves>=reSvc*6?', reserves on hand':'')+' — so no lender can force your hand. You hold, the income keeps flowing, and the equity recovers as the market does. This is why you don\'t over-leverage: staying power turns a crash into a non-event.'}]);
 }
}
if(!s._credit_tight)s._re_squeeze_cycle=false;/* reset once the downturn passes, so the next cycle can test again */
// Executive Assistant: runs the financial housekeeping BEFORE the credit drift evaluates — utilization paydown, credit + D&B upkeep, tax reserve — so the score rewards the now-healthy file.
if(s._ea_hired){const persRev=Math.max(0,(s.total_debt||0)-(s._installment_debt||0)-(s.business_credit_used||0)-(s.business_installment_debt||0)-(s.real_estate_debt||0)),avail=s.available_credit||0,lim=persRev+avail;
if(lim>0&&persRev/lim>0.3){const target=Math.round(persRev-0.28*lim),pay=Math.max(0,Math.min(target,Math.round((s.cash||0)*0.5)));if(pay>0){s.cash-=pay;s.total_debt=Math.max(0,s.total_debt-pay);s.available_credit=(s.available_credit||0)+pay;}}
if((s.credit_negatives||0)===0&&!s._credit_repair)s.personal_credit_score=Math.min(815,(s.personal_credit_score||0)+2);
if(s._dnb_profile){if(this.month%2===0)s._dnb_tradelines=Math.min(8,(s._dnb_tradelines||0)+1);if(s.business_credit_profile==='building'&&this.month%6===0)s.business_credit_profile='established';}
if(!s._completed_actions.includes('monthly_tax_reserve'))s._completed_actions.push('monthly_tax_reserve');}
// Credit repair plays out over months: disputed marks fall off and the score climbs each month until the file is clean (~650). Then, with no derogatories, the score gravitates toward a utilization-based ceiling — just like real FICO (payment history + amounts owed are ~65% of the score).
s._lastCreditRepair=null;
if(s._credit_repair&&this.month>=(s._credit_repair.startMonth||0)){const cr=s._credit_repair,before=s.personal_credit_score||0,remove=Math.min(cr.per,cr.remaining);cr.remaining-=remove;s.credit_negatives=Math.max(0,(s.credit_negatives||0)-remove);s.personal_credit_score=Math.min(850,before+cr.gainPer*remove);
if(cr.remaining<=0){if(s.personal_credit_score<cr.floor)s.personal_credit_score=cr.floor;if(s.debt_breakdown)delete s.debt_breakdown.collections;s._credit_repair=null;}
s._lastCreditRepair={month:this.month,removed:remove,remaining:(s._credit_repair?s._credit_repair.remaining:0),before:Math.round(before),after:Math.round(s.personal_credit_score)};}
else{const target=this.calcFicoTarget(),cur=s.personal_credit_score||0;if(cur<target)s.personal_credit_score=Math.min(target,cur+9);else if(cur>target+10)s.personal_credit_score=Math.max(target,cur-4);}/* drift toward the myFICO-weighted target (utilization ~30%); the repair branch above handles active derogatory removal */
// Epic Life perk (exclusive): the concierge disputes hard inquiries off your report every 6 months — saving the ~$1,000 a credit-repair service charges and lifting your approval odds.
if(s._epic_life&&this.month%6===0&&(s.credit_inquiries||0)>0){s._inquiriesCleared=s.credit_inquiries;s.credit_inquiries=0;this._epicSavings=(this._epicSavings||0)+1000;s._epic_savings_total=(s._epic_savings_total||0)+1000;}
// Without Epic, hard inquiries still age off naturally — one drops every 6 months, so only RECENT credit-shopping keeps hurting your odds.
else if(!s._epic_life&&this.month%6===0&&(s.credit_inquiries||0)>0)s.credit_inquiries=Math.max(0,(s.credit_inquiries||0)-1);
s.energy=Math.min(100,s.energy+this.calcEnergyRecovery());s.fitness_level=Math.max(0,(s.fitness_level||0)-1);
// IUL cash value is INDEXED to the cycle now — 0% floor in a downturn, capped (~12%/yr) in a boom, ~7-8% average. Your collateral holds in a crash (the floor) exactly when assets are cheap — that's the IUL's edge.
// IUL ENGINE — the loan TYPE is the decision. WASH (~3.5%): the borrowed slice is parked at a matching rate → net 0%, the loan can NEVER outrun the collateral, lapse-proof (but the borrowed portion stops earning the index). VARIABLE (market ~5%): the FULL cash value keeps earning the index (0-15%) → positive arbitrage when the index beats the rate, but in a downturn the index floors at 0% while the loan keeps compounding — borrow too hard and the loan passes the cash value, the policy LAPSES, and the gains become taxable ordinary income (phantom income).
{const idx=(s._index_return!=null)?s._index_return:0.0058,variable=s._iul_loan_type==='variable',washRate=0.035/12,varRate=(s._market_rate!=null?s._market_rate:0.05)/12;
 if((s.insurance_cash_value||0)>0){const CV=s.insurance_cash_value,loan=s.insurance_loan_balance||0;
  if(!variable&&loan>0){const bf=Math.min(1,loan/Math.max(1,CV));s.insurance_cash_value=Math.round(CV*(1+idx*(1-bf)+washRate*bf));}/* wash: borrowed slice earns the wash rate, not the index */
  else s.insurance_cash_value=Math.round(CV*(1+idx));
  s._iul_last_credit=Math.round(idx*12*1000)/10;}
 if((s.insurance_loan_balance||0)>0)s.insurance_loan_balance=Math.round((s.insurance_loan_balance||0)*(1+(variable?varRate:washRate)));}
if(s._family_office&&(s.investment_positions||0)>0)s.investment_positions=Math.round(s.investment_positions*1.004); // family office optimizes allocation — portfolio appreciates ~5%/yr
if((s.private_bank_balance||0)>0){const _pt2=sep?'personal_cash':'cash';s[_pt2]=(s[_pt2]||0)+Math.round(s.private_bank_balance*0.004);} // private bank deposit earns ~5%/yr while you borrow against it at 1%
if((s.tax_reserve||0)>0)s.tax_reserve=Math.round((s.tax_reserve||0)*(1+0.04/12)); // tax reserve sits in a money-market account earning ~4%/yr fixed (taxable) — a policy grows faster and tax-free
{const _pt=sep?'personal_cash':'cash';s[_pt]=(s[_pt]||0)+(s.other_monthly_revenue||0); // asset income (real estate, lending) → personal once separated
s._lastPassive=null;if(s._passive_income_active&&s.insurance_cash_value>0){const _var=s._iul_loan_type==='variable',cap=(_var?0.97:0.85)*s.insurance_cash_value/* variable borrows closer to the edge — and pays for it in a downturn */,headroom=Math.max(0,Math.round(cap)-(s.insurance_loan_balance||0)),moPassive=Math.min(Math.round(s.insurance_cash_value*(_var?0.08:0.06)/12),headroom),_pb=s[_pt]||0;if(moPassive>0){const _preI=s._iul_funding_type==='pre_tax',_net=_preI?Math.round(moPassive*(1-Math.min(0.4,s.tax_rate||0.25))):moPassive;/* POST-tax: income is TAX-FREE (Roth). PRE-tax: it's deferred income coming due — taxable (Traditional). */s[_pt]=_pb+_net;s.insurance_passive_loan_total=(s.insurance_passive_loan_total||0)+moPassive;s.insurance_loan_balance=(s.insurance_loan_balance||0)+moPassive;s._lastPassive={amt:_net,gross:moPassive,taxed:_preI,before:Math.round(_pb),after:Math.round(_pb+_net),month:this.month};}}}
// LAPSE — if the loan ever reaches the cash value, the policy collapses: gains taxed as ordinary income (you owe tax on money you already spent), and the tax-free engine is gone. Only the variable loan can get here; the wash loan is structurally safe.
if(s._iul_loan_type==='variable'&&(s.insurance_cash_value||0)>0&&(s.insurance_loan_balance||0)>=(s.insurance_cash_value||0)*0.95){const gain=Math.max(0,(s.insurance_cash_value||0)-(s.insurance_basis||0)),tax=Math.round(gain*(s.tax_rate||0.25));s.cash=(s.cash||0)-tax;s.insurance_cash_value=0;s.insurance_loan_balance=0;s._passive_income_active=false;s._auto_fund_insurance=false;s._iul_lapsed=true;
 s._pendingRipples=(s._pendingRipples||[]).concat([{source:'⚠ Policy LAPSED',narrative:'Your IUL collapsed — the variable loan compounded past the cash value (a downturn flatlined your growth while the loan kept accruing). The '+this.fmtMoney(gain)+' of gains are now taxable ordinary income: a '+this.fmtMoney(tax)+' bill on money you already spent. Your tax-free engine is gone. The lesson: never borrow so hard that a bad market can pass your collateral — that\'s what the wash loan protects against.'}]);}
/* market cycle is advanced at the top of the tick; its revenue tilt is applied where revenue is computed */
if(sep&&s.personal_cash<0){s.cash+=s.personal_cash;s.personal_cash=0;} // personal deficit rolls into the business shortfall handler below
if(s.cash<0){const _short=Math.abs(s.cash);s.cash=0;let _unc=this.coverShortfall(_short);if(_unc>0)_unc=this._tapTaxReserveToSurvive(_unc);if(_unc>0)_unc=this._tapPersonalToSurvive(_unc);if(_unc>0){s.cash=-_unc;this._pendingLose='Your business ran out of cash and credit to cover this month\'s obligations.';}}
// Owner pays themselves a draw/salary scaled to what the business can afford — covers a living wage once profitable (a draw pre-S-Corp, formal salary after); S-Corp just optimizes its tax treatment
{const debtSvc=this.calcDebtInterest()+this.calcDebtPrincipal();
// Pay yourself from FREE cash flow — what the business generates AFTER servicing its debt — not from gross EBITDA. Otherwise the owner draws every dollar of operating profit and the business is left with nothing to cover debt service or build a buffer (it limps at $0 cash forever, one event from insolvency).
const freeCF=Math.max(0,(s.monthly_revenue||0)-(s.cogs||0)-(s.operating_expenses||0)-debtSvc);
const survival=(s.living_expenses||0)+(s.lifestyle_expenses||0); // the owner's actual personal obligations — covering exactly this avoids a separate shortfall draw, so it's the MINIMUM business drain (never starve them, but don't pad it either)
const baseTarget=Math.max((s.living_expenses||0)+1500,Math.round((s.monthly_revenue||0)*0.25)); // the comfortable "living wage" target, paid only when free cash flow allows
// Pay-yourself-first: in profitable months draw a little extra to build a personal emergency fund up to ~3 months of living costs, then stop. Earned and bounded — a real cushion for a bad month, not a routine pay raise (so it never just hands out free money or hollows out the business).
const reserveTarget=Math.round((s.living_expenses||0)*3),reserveGap=Math.max(0,reserveTarget-Math.max(0,s.personal_cash||0)),cushion=Math.min(reserveGap,Math.round((s.monthly_revenue||0)*0.1));
// Cap discretionary pay (the 25%-of-revenue + emergency-fund cushion) at free cash flow minus a business buffer, so a stressed business retains a cushion; survival pay is always allowed.
const bizBuffer=Math.round(((s.cogs||0)+(s.operating_expenses||0))*0.25);
const cap=Math.max(survival,freeCF-bizBuffer);
const target=Math.min(baseTarget+cushion,cap);s.owner_pay=Math.max(0,Math.round(target));}
// Epic Life annual plan renews once a year (monthly plan is carried in operating_expenses instead).
if(s._epic_life&&s._epic_plan==='annual'&&s._epic_renew_month&&this.month>=s._epic_renew_month){this.payCost(3000,false);s._epic_renew_month=this.month+12;}
// Auto-actions from key hires
const bl=this.calcBusinessLevel();
if(s._completed_actions&&s._completed_actions.includes('hire_fractional_cfo')){if(s.business_credit_profile==='building')s.business_credit_profile='established';s.personal_credit_score=Math.min(850,s.personal_credit_score+1);s.business_credit_limit=(s.business_credit_limit||0)+Math.round(500*bl);const pr=Math.max(0,(s.total_debt||0)-(s._installment_debt||0)-(s.business_credit_used||0)-(s.business_installment_debt||0)-(s.real_estate_debt||0));if(pr>1000){const as=Math.round(pr*0.05);s._installment_debt=(s._installment_debt||0)+as;s.available_credit=(s.available_credit||0)+Math.round(as*0.8);}}
if(s._completed_actions&&s._completed_actions.includes('hire_hr_manager')&&this.month%3===0&&(s.team_size||0)<8&&s.monthly_revenue>(s.team_size||0)*5000){s.team_size=(s.team_size||0)+1;s.operating_expenses=(s.operating_expenses||0)+2500;s.key_person_dependency=Math.max(0,(s.key_person_dependency||0)-3);}
if(s._completed_actions&&s._completed_actions.includes('build_sales_team')){s.cash-=Math.round((s.monthly_revenue||0)*0.04);s.leads=(s.leads||0)+Math.round(6*bl);/* a dedicated sales team prospects AND closes — it converts pipeline into paying customers, not just leads */const _closed=Math.min(Math.round(3*bl),Math.max(0,(s.leads||0)-(s.customer_base||0)));if(_closed>0)s.customer_base=(s.customer_base||0)+_closed;}
if(s._completed_actions&&s._completed_actions.includes('hire_client_success')){s.churn_rate=Math.max(0.01,(s.churn_rate||0)-0.005);}
// FULL-TIME executives build the business on their own each month — team, capacity, pipeline, brand. Fractional execs only pick moves; the active engine is what you pay full-time pay for.
if(s._coo_hired){s.systems_maturity=Math.min(100,(s.systems_maturity||0)+0.5);s.key_person_dependency=Math.max(0,(s.key_person_dependency||0)-0.5);}
if(s._cro_hired){s.leads=(s.leads||0)+Math.round(2*bl);s.brand_equity=Math.min(100,(s.brand_equity||0)+0.5);}
this.state._milestones_new=this.checkMilestones();
// Hitting a milestone is a morale win — a minor energy boost on each unlock (capped), surfaced on the milestone banner.
this._milestoneEnergy=0;if(this.state._milestones_new.length){const boost=Math.min(8,this.state._milestones_new.length*3);this.state.energy=Math.min(100,(this.state.energy||0)+boost);this._milestoneEnergy=boost;}
},

updateRelationships(){const s=this.state;if(s.monthly_revenue>10000&&s.dscr>1.5){if(s._banker_state==='stranger')s._banker_state='neutral';else if(s._banker_state==='neutral')s._banker_state='trusted';else if(s._banker_state==='trusted'&&this.month>20)s._banker_state='champion';}else if(s.dscr<1.0)s._banker_state='skeptical';const ls=s.lifestyle_health+s.lifestyle_relationships;if(ls>80)s._family_state='thriving';else if(ls>50)s._family_state='stable';else if(ls>25)s._family_state='coping';else s._family_state='strained';},
checkEvents(){const cs=this.state;
// No events in month 1 — the first month is for learning the core loop (and the tutorial). Events unlock from month 2 on.
if(this.month<2)return null;
// No events in the final month — the run is wrapping up; an unrecoverable surprise right before scoring is just noise (keeps the end-game tight).
if(this.month>=36)return null;
cs._bad_debt=Math.max(0,(cs.total_debt||0)-(cs.real_estate_debt||0)-(cs.business_installment_debt||0)-(cs.insurance_loan_balance||0)-(cs._installment_debt||0));const passers=[];const cul=this.state.company_culture==null?45:this.state.company_culture,culMult=Math.max(0.2,1+(50-cul)/50*0.8);/* low culture nearly doubles people-problem odds; strong culture cuts them ~80% */
// Health neglect → illness risk. The lower your energy and Body, the more an illness/burnout event compounds. Healthy founders are barely exposed; run-down ones get sick often. (Insurance pays the claim when it hits.)
const _en=Math.min(100,cs.energy||0),_body=this.lifeDims().Body;const _neglect=Math.max(0,(60-_en))/60*0.6+Math.max(0,(50-_body))/50*0.6;/* 0 (healthy) .. >1.2 once you run the energy negative */const healthMult=Math.min(5,1+_neglect*2.2);/* up to ~3.6x run-down, higher (capped 5x) once energy goes negative */
const catLast=cs._eventCatMonth||{},idLast=cs._eventIdMonth||{};
for(const evt of CONFIG.events.events.filter(e=>this.meetsReq(e.requires))){let p=evt.base_probability;if(evt.probability_scales_with&&evt.scale_factor)p+=(this.state[evt.probability_scales_with]||0)*evt.scale_factor;if(evt.category==='people')p*=culMult;if(evt.category==='burnout'||evt.category==='personal'||evt.health_risk)p*=healthMult;if(evt.category==='opportunity'&&this.state._epic_life)p*=1.6;/* Epic Life surfaces more deal flow */if(evt.mitigated_by)for(const id of evt.mitigated_by)if(this.state._completed_actions.includes(id))p*=0.5;
// Anti-spam: cap any single event's monthly odds, and cool down both the exact event (no re-fire for ~8 months) and its whole category (suppressed for ~3 months) — so the late game stops drowning you in back-to-back lawsuits/audits of the same kind. Opportunity is exempt from the category cooldown (deal flow is a good thing).
p=Math.min(p,0.30);const im=idLast[evt.id];if(im!=null&&this.month-im<8)p*=0.12;const cm=catLast[evt.category];if(cm!=null&&evt.category!=='opportunity'&&this.month-cm<3)p*=0.25;
if(Math.random()<p)passers.push(evt);}
// Force a guaranteed FIRST event so the player learns the mechanic — but only once there's a real business for something to happen to (at least a customer or some revenue), so the event makes sense. Until then, no event. Prefer a gentler scenario; introduced with a one-time explainer in showEvent.
if(!cs._first_event_seen&&!passers.length&&((cs.customer_base||0)>=1||(cs.monthly_revenue||0)>0)){const eligible=CONFIG.events.events.filter(e=>this.meetsReq(e.requires)&&e.category!=='macro');if(eligible.length){const gentle=eligible.filter(e=>['opportunity','people','operations'].includes(e.category));const poolF=gentle.length?gentle:eligible;return poolF[Math.floor(Math.random()*poolF.length)];}}
const chosen=passers.length?passers[Math.floor(Math.random()*passers.length)]:null;if(chosen){cs._eventCatMonth=catLast;cs._eventIdMonth=idLast;catLast[chosen.category]=this.month;idLast[chosen.id]=this.month;}return chosen;},

// Result screen primary button — two-tap: first tap jumps to the Cash & Credit panel, second advances the month.
resultPrimary(){if(!this._ccChecked&&document.getElementById('month-cash-panel')){this._ccChecked=true;const nb=document.getElementById('result-next-btn');if(nb)nb.textContent='Next Month →';this.checkCashCredit();
// Losing month: the moment you open the Cash & Credit card, walk through WHY the run is ending — the red cash/credit and the 0-month runway.
if(this._pendingLose){setTimeout(()=>this._gameOverSpotlight(),650);}
else{const s=this.state,mo=this._lastRunwayMo;
// Early warning: when runway falls to ~3 months or less, sound the alarm BEFORE the cliff — once per descent. Re-arms only after the runway recovers (≥6 months / cash-flow positive), so it's loud, not nagging.
if(mo!=null&&mo<=3){if(!s._runwayWarned){s._runwayWarned=true;setTimeout(()=>this._lowRunwaySpotlight(),650);}}
else if(mo==null||mo>=6){s._runwayWarned=false;}}
return;}this.nextMonth();},
// Short-runway warning shown on the Cash & Credit panel — points at the runway figure and tells the player how to act before insolvency.
_lowRunwaySpotlight(){const mo=this._lastRunwayMo;if(mo==null)return;const m=Math.max(0,Math.floor(mo));const body='<div style="line-height:1.6;font-size:0.9rem;">Heads up — at this month\'s burn, your <strong>cash + all available credit</strong> lasts only about <strong>'+m+' month'+(m===1?'':'s')+'</strong>. That\'s your <strong>runway</strong>, and it\'s getting short.<br><br>Act <em>before</em> it hits zero: pour your moves into <strong>revenue</strong> (more leads, close more sales), <strong>open or draw a credit line</strong> while you still qualify, hold off on expensive one-off moves, and keep a cash reserve. The run ends the month your bills exceed everything you can access — don\'t wait for the cliff.</div>';const sel=document.getElementById('result-runway')?'#result-runway':(document.getElementById('month-cash-panel')?'#month-cash-panel':null);if(sel)this._spotlightTip(sel,'⚠️ Short Runway — Act Now',body);else this.showPopup('⚠️ Short Runway — Act Now',body);},
// Result screen: jump to the end-of-month Cash & Credit panel and flash it.
checkCashCredit(){const el=document.getElementById('month-cash-panel');if(!el)return;el.scrollIntoView({behavior:'smooth',block:'center'});el.classList.remove('attn-flash');void el.offsetWidth;el.classList.add('attn-flash');setTimeout(()=>el.classList.remove('attn-flash'),900);},
// Bankruptcy graphic — a clean emoji-art hero (defeated founder, money flying away). Emojis render as the platform's polished artwork. Decorative; shown in the game-over walkthrough.
// To swap in a real illustration later: drop a PNG at assets/game-over.png and replace the inner markup with <img src="assets/game-over.png" ...>.
_brokeGraphic(){return '<div style="text-align:center;background:linear-gradient(180deg,rgba(239,68,68,0.12),rgba(239,68,68,0));border:1px solid rgba(239,68,68,0.25);border-radius:14px;padding:16px 12px 12px;margin:2px auto 10px;max-width:260px;">'
+'<div style="font-size:60px;line-height:1;">😩</div>'
+'<div style="font-size:26px;line-height:1;margin-top:4px;letter-spacing:6px;">💸💸💸</div>'
+'<div style="font-weight:800;color:var(--red);letter-spacing:3px;margin-top:10px;font-size:1.1rem;">GAME OVER</div>'
+'<div style="font-size:0.66rem;color:var(--text2);margin-top:2px;letter-spacing:0.5px;">BANKRUPT — OUT OF CASH &amp; CREDIT</div>'
+'</div>';},
// Game-over walkthrough on the final Cash & Credit card: ONE step — graphic + highlight the now-negative accessible capital (cash + all credit), which is what ended the run.
_gameOverSpotlight(){if(this.state)this.state._gameover_tut_seen=true;
const body=this._brokeGraphic()+'<div style="line-height:1.55;">Your <strong>accessible capital</strong> — cash plus every available credit line — has run dry (it\'s now <strong style="color:var(--red);">negative</strong>). With nothing left to cover the bills, the business is insolvent and the run ends here.<br><br>Next time: keep a cash reserve and open credit lines <em>before</em> you need them.</div>';
const sel=document.getElementById('result-accessible')?'#result-accessible':(document.getElementById('month-cash-panel')?'#month-cash-panel':null);
if(sel)this._spotlightTip(sel,'💥 Game Over — Insolvent',body);
else this.showPopup('💥 Game Over — Insolvent',body);},
toggleResultDetail(id,ev){if(ev&&ev.target&&ev.target.closest&&ev.target.closest('.term-link'))return;/* don't toggle when tapping a glossary term inside the card */const d=document.getElementById(id);if(!d)return;const open=d.style.display!=='none';d.style.display=open?'none':'block';const t=d.previousElementSibling;if(t)t.innerHTML=t.innerHTML.replace(open?'▴':'▾',open?'▾':'▴');},
showResults(results,triggeredEvent){/* Insolvency no longer jumps straight to game over — we render the results (Cash & Credit shows you went over) and let any triggered event play out first; the game-over fires when you advance (see nextMonth). */
this.showScreen('result-screen');document.getElementById('result-month-label').textContent='Month '+this.month+' — Results';
let html='';if(this.state._epic_life&&!this._pendingLose)html+=this._epicMonthCard();
if(!results.length)html+='<div class="result-narrative fade-in">You took the month off. Sometimes rest is the most productive thing you can do.</div>';
// Mentor commentary removed — redundant with each action's lesson and the achievement banners.
this._pendingCharLine=null;
// Epic Life concierge moves show first, above your own Marketing/Operations/Finance/Life results.
results=results.filter(r=>r.action&&r.action._epic).concat(results.filter(r=>!(r.action&&r.action._epic)));
// Milestone banner(s): a single unlock gets its full moment (title + mentor line); multiple unlocks in one month collapse into ONE compact banner (titles listed + the lead mentor line) so the result screen doesn't become a wall of trophy cards.
const _newMs=(this.state._milestones_new||[]).map(id=>MILES_BY_ID[id]).filter(Boolean);
if(_newMs.length===1){const m=_newMs[0],col=m.cat==='marketing'?'var(--accent)':m.cat==='operations'?'var(--blue)':'var(--gold)';html+='<div class="fade-in" style="background:rgba(212,175,55,0.08);border:1px solid '+col+';border-left-width:3px;border-radius:var(--radius-sm);padding:9px 12px;margin-bottom:9px;"><div style="font-size:0.88rem;font-weight:700;">🏆 '+m.title+' <span style="font-size:0.6rem;color:var(--text2);text-transform:uppercase;font-weight:600;letter-spacing:0.5px;">'+m.cat+'</span>'+(this._milestoneEnergy>0?' <span style="font-size:0.62rem;color:var(--accent);font-weight:700;">⚡ +'+this._milestoneEnergy+'</span>':'')+'</div><div style="font-size:0.74rem;color:var(--text2);margin-top:3px;line-height:1.45;">'+m.mentor+'</div></div>';}
else if(_newMs.length>1){html+='<div class="fade-in" style="background:rgba(212,175,55,0.08);border:1px solid var(--gold);border-left-width:3px;border-radius:var(--radius-sm);padding:9px 12px;margin-bottom:9px;"><div style="font-size:0.88rem;font-weight:700;color:var(--gold);">🏆 '+_newMs.length+' Milestones Unlocked'+(this._milestoneEnergy>0?' <span style="font-size:0.66rem;color:var(--accent);">⚡ +'+this._milestoneEnergy+' energy</span>':'')+'</div><div style="font-size:0.76rem;color:var(--text);margin-top:4px;line-height:1.5;">'+_newMs.map(m=>m.title).join(' · ')+'</div><div style="font-size:0.72rem;color:var(--text2);margin-top:4px;line-height:1.45;">'+_newMs[0].mentor+'</div></div>';}
if(_newMs.length)this.state._milestones_new=[];
// Compact passive-income banner
const _lp=this.state._lastPassive;if(_lp&&_lp.month===this.month&&_lp.amt>0)html+='<div class="fade-in" style="background:rgba(16,185,129,0.07);border:1px solid var(--accent);border-left-width:3px;border-radius:var(--radius-sm);padding:9px 12px;margin-bottom:9px;"><div style="font-size:0.86rem;font-weight:700;color:var(--accent);">Tax-Free Passive Income · +'+this.fmtMoney(_lp.amt)+'</div><div style="font-size:0.74rem;color:var(--text2);margin-top:3px;line-height:1.45;">Paid to you tax-free ('+this.fmtMoney(_lp.before)+' → '+this.fmtMoney(_lp.after)+'), borrowed against cash value that keeps growing ~7%/yr.</div></div>';
// Credit-repair progress banner — marks falling off and the score climbing month by month
const _crp=this.state._lastCreditRepair;if(_crp&&_crp.month===this.month){html+='<div class="fade-in" style="background:rgba(59,130,246,0.07);border:1px solid var(--blue);border-left-width:3px;border-radius:var(--radius-sm);padding:9px 12px;margin-bottom:9px;"><div style="font-size:0.86rem;font-weight:700;color:var(--blue);">📈 Credit Repair · '+_crp.removed+' negative'+(_crp.removed>1?'s':'')+' removed · score '+_crp.before+' → '+_crp.after+'</div><div style="font-size:0.74rem;color:var(--text2);margin-top:3px;line-height:1.45;">'+(_crp.remaining>0?_crp.remaining+' mark'+(_crp.remaining>1?'s':'')+' still under dispute — keep going, your score climbs as each one falls off.':'Your file is clean now. From here, lowering credit utilization is what carries your score toward 750-800.')+'</div></div>';this.state._lastCreditRepair=null;}
// Epic Life cleared hard inquiries this month (every-6-month perk)
if(this.state._inquiriesCleared){html+='<div class="fade-in" style="background:rgba(212,175,55,0.08);border:1px solid var(--gold);border-left-width:3px;border-radius:var(--radius-sm);padding:9px 12px;margin-bottom:9px;"><div style="font-size:0.86rem;font-weight:700;color:var(--gold);">🧹 Inquiries Cleared · Epic Life</div><div style="font-size:0.74rem;color:var(--text2);margin-top:3px;line-height:1.45;">Your concierge disputed <strong>'+this.state._inquiriesCleared+' hard inquir'+(this.state._inquiriesCleared>1?'ies':'y')+'</strong> off your report — saved you <strong>~$1,000</strong> in credit-repair fees and lifted your approval odds. (Exclusive to Epic Life, every 6 months.)</div></div>';this.state._inquiriesCleared=0;}
// One compact card per action: title + badge, short narrative, inline effect chips, light lesson line
let _firstCard=true,_ci=0;for(const r of results){
const chips=[];for(const[k,v]of Object.entries(r.effects)){if(typeof v!=='number'||v===0)continue;if(r._baKeys&&r._baKeys.includes(k))continue;if(k==='personal_credit_score'&&r._scoreMoved)continue;if(r._mastery&&(k.indexOf('lifestyle_')===0||k==='fitness_level'||k==='energy'))continue;/* dimension panel covers these */const abs=Math.abs(v),isMoney=MK.includes(k);if(isMoney&&(!r.action||r.action.category!=='finance'))continue;if(isMoney&&abs<500)continue;if(!isMoney&&abs<3)continue;const inv=IK.includes(k),color=inv?(v>0?'var(--red)':'var(--accent)'):(v>0?'var(--accent)':'var(--red)');const val=isMoney?((v>0?'+':'')+this.fmtMoney(v)):((v>0?'+':'')+v);chips.push('<span style="font-size:0.7rem;font-weight:700;background:rgba(127,127,127,0.12);border-radius:999px;padding:2px 8px;color:'+color+';white-space:nowrap;">'+val+' '+(this._keyIcon(k)?this._keyIcon(k)+' ':'')+this.formatStatName(k)+'</span>');}
const firstLesson=r.success&&r.action.lesson&&!(this.state._lessons_shown||[]).includes(r.action.id);if(firstLesson)(this.state._lessons_shown=(this.state._lessons_shown||[])).push(r.action.id);
// Collapse the verbose stat-change details + lesson behind a per-card toggle to cut the wall of text.
const _chipsH=chips.length?'<div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:8px;">'+chips.join('')+'</div>':'';
const _baH=r.beforeAfter?'<div style="margin-top:8px;background:rgba(127,127,127,0.08);border-radius:var(--radius-sm);padding:6px 9px;">'+r.beforeAfter.map(row=>'<div style="display:flex;justify-content:space-between;gap:8px;font-size:0.73rem;padding:2px 0;"><span style="color:var(--text2);">'+(this._lblIcon(row[0])?this._lblIcon(row[0])+' ':'')+row[0]+'</span><span style="white-space:nowrap;"><span style="color:var(--text2);">'+row[1]+'</span> <span style="color:'+(row[3]||'var(--accent)')+';font-weight:700;">→ '+row[2]+'</span></span></div>').join('')+'</div>':'';
const _lesH=firstLesson?'<div style="font-size:0.73rem;color:var(--gold);line-height:1.5;margin-top:8px;border-top:1px dashed var(--border);padding-top:6px;"><strong>💡 Lesson:</strong> '+this.linkTerms(r.action.lesson)+'</div>':'';
const _det=_chipsH+_baH+_lesH;
const _detBlock=_det?'<div'+(_firstCard?' id="tut-result-detail"':'')+' style="margin-top:7px;font-size:0.72rem;color:var(--blue);font-weight:600;">▾ Tap card for details'+(firstLesson?' & lesson':'')+'</div><div id="rdet'+_ci+'" style="display:none;">'+_det+'</div>':'';
html+='<div class="fade-in"'+(_firstCard?' id="tut-result-card"':'')+(_det?' onclick="Game.toggleResultDetail(\'rdet'+_ci+'\',event)"':'')+' style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);padding:11px 13px;margin-bottom:9px;'+(_det?'cursor:pointer;':'')+'">'+
'<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;"><strong style="font-size:0.92rem;'+(r.action._epic?'color:var(--gold);':'')+'">'+(r.action._epic?'🌟 ':'')+r.action.label+'</strong><span style="font-size:0.64rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:'+(r.action._epic?'var(--gold)':(r.success?'var(--accent)':'var(--gold)'))+';white-space:nowrap;">'+(r.action._epic?'⭐ Epic Life':(r.success?'Success':'Didn\'t finish'))+'</span></div>'+
(r.narrative?'<div style="font-size:0.8rem;color:var(--text2);line-height:1.5;margin-top:5px;">'+r.narrative+'</div>':'')+
((r.cost>0)?(()=>{const f=r.fund||{},src=[];if(f.cash>0)src.push('cash');if(f.biz>0)src.push('business credit');if(f.persCash>0)src.push('personal cash');if(f.persCredit>0)src.push('personal credit');return '<div style="font-size:0.73rem;color:var(--text2);margin-top:6px;">💸 '+(r.action.recurring_cost?'Setup':'Cost')+' <strong style="color:var(--red);">−'+this.fmtMoney(r.cost)+'</strong>'+(src.length?' <span style="color:var(--text2);">· from '+src.join(' + ')+'</span>':'')+'</div>';})():'')+
((r.success&&r.action.recurring_cost)?'<div style="font-size:0.73rem;color:var(--purple);margin-top:4px;">🔁 +'+this.fmtMoney(r.action.recurring_cost)+'/mo ongoing operating expense</div>':'')+
((r.action.energy_cost&&r.action.energy_cost!==0&&!r._mastery&&!r._execRun)?(()=>{const _es=(r._energySpent!=null&&r.action.energy_cost>0)?r._energySpent:r.action.energy_cost;return '<div style="font-size:0.73rem;color:'+(_es>0?'var(--orange)':'var(--accent)')+';margin-top:4px;">⚡ '+(_es>0?'−'+_es+' energy spent':'+'+Math.abs(_es)+' energy gained')+'</div>';})():'')+
(r._mastery||'')+
_detBlock+
'</div>';_firstCard=false;_ci++;}
// End-of-month Cash & Credit position — before → after for the whole month, plus how this month's action costs were funded
const _mc=this._monthCashSummary;if(_mc){const s=this.state,st=_mc.start,sp=_mc.spend,sep=this.isSeparated(),fm=v=>this.fmtMoney(Math.round(v));
const cashThen=st.cash+(sep?st.personalCash:0),cashNow=(s.cash||0)+(sep?(s.personal_cash||0):0);
const bizAvail0=Math.max(0,st.bizLim-st.bizUsed),bizAvail1=Math.max(0,(s.business_credit_limit||0)-(s.business_credit_used||0));
const posRow=(icon,lbl,b,a,goodUp,fmtFn,rowId)=>{const F=fmtFn||fm,up=Math.round(a)>Math.round(b),down=Math.round(a)<Math.round(b),col=(!up&&!down)?'var(--text2)':((up===!!goodUp)?'var(--accent)':'var(--red)'),d=Math.round(a-b),swing=d!==0?' <span style="color:'+col+';font-weight:700;">'+(d>0?'▲':'▼')+F(Math.abs(d))+'</span>':'';const valRed=Math.round(a)<=0&&!!goodUp;/* a "more is better" position at zero/negative = danger → red */return'<div'+(rowId?' id="'+rowId+'"':'')+' style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;font-size:0.78rem;padding:3px 0;white-space:nowrap;"><span style="color:var(--text2);">'+icon+' '+lbl+'</span><span><span style="font-weight:700;'+(valRed?'color:var(--red);':'')+'">'+F(a)+'</span>'+swing+'</span></div>';};
const _n=v=>Math.round(v);
// Middle section — credit score, credit available, cash, total debt. (Business revenue moved to the bottom section, next to expenses.)
let rows='';rows+=posRow('📊','Credit score',st.persScore,s.personal_credit_score||0,true,_n);rows+=posRow('💳','Credit available',bizAvail0+(st.avail||0),bizAvail1+(s.available_credit||0),true,null,'result-credit-row');rows+=posRow('💵','Cash',cashThen,cashNow,true,null,'result-cash-row');rows+=posRow('🏦','Total debt',st.debt,s.total_debt||0,false);
// Total accessible capital (cash + all available credit) and how long it lasts at the current burn — the two numbers that drive decisions.
const accessible=cashNow+(s.available_credit||0)+bizAvail1;
// Month-over-month swing in accessible capital (vs the start of this month).
// Swing vs the previous month's accessible capital (stored end-of-month). No swing in month 1 — there's no prior month to compare to.
const accDelta=(this._prevAccessible!=null)?Math.round(accessible-this._prevAccessible):null;this._prevAccessible=accessible;
const accSwing=accDelta?'<span style="font-weight:700;color:'+(accDelta>0?'var(--accent)':'var(--red)')+';">'+(accDelta>0?'▲':'▼')+fm(Math.abs(accDelta))+'</span>':'';
const netFlow=(s.monthly_revenue||0)-(s.cogs||0)-(this.calcMonthlyBurn()-(s.owner_pay||0));/* owner pay is a draw funding living (already in burn), not a net outflow — exclude so runway matches the real cash swing */
// Stash this month's runway (in months; null when cash-flow positive) so resultPrimary can fire an early "short runway" warning when the player opens the Cash & Credit panel.
this._lastRunwayMo=netFlow>=0?null:accessible/Math.max(1,-netFlow);
const runway=netFlow>=0?'Profitable':(Math.max(0,Math.floor(accessible/Math.max(1,-netFlow)))+' mo');
const runCol=netFlow>=0?'var(--accent)':(accessible/Math.max(1,-netFlow)<4?'var(--red)':'var(--gold)');
// Runway swing vs last month (in months). Only shown when both months have a finite runway — crossing to/from "Profitable" is self-evident from the value itself.
const runwayMo=netFlow>=0?Infinity:Math.max(0,Math.floor(accessible/Math.max(1,-netFlow)));const _prevRun=this._prevRunwayMo2;this._prevRunwayMo2=runwayMo;
const runSwing=(_prevRun!=null&&isFinite(runwayMo)&&isFinite(_prevRun)&&runwayMo!==_prevRun)?'<span style="font-weight:700;color:'+(runwayMo>_prevRun?'var(--accent)':'var(--red)')+';">'+(runwayMo>_prevRun?'▲':'▼')+Math.abs(runwayMo-_prevRun)+' mo</span>':'';
const accCol=accessible<=0?'var(--red)':'var(--accent)';/* out of cash + credit → highlight the number red (the run is over) */const capBlock='<div style="display:flex;justify-content:space-between;align-items:flex-end;gap:8px;margin-bottom:7px;padding-bottom:7px;border-bottom:1px solid var(--border);"><span><div style="font-size:0.6rem;color:var(--text2);text-transform:uppercase;letter-spacing:0.5px;">💰 Accessible capital</div><div id="result-accessible" style="font-size:1.15rem;font-weight:800;color:'+accCol+';white-space:nowrap;">'+fm(accessible)+(accSwing?' <span style="font-size:0.7rem;">'+accSwing+'</span>':'')+'</div><div style="font-size:0.58rem;color:var(--text2);">cash + credit</div></span><span style="text-align:right;"><div style="font-size:0.6rem;color:var(--text2);text-transform:uppercase;letter-spacing:0.5px;">Runway</div><div id="result-runway" style="font-size:1.05rem;font-weight:800;color:'+runCol+';">'+runway+(runSwing?' <span style="font-size:0.7rem;">'+runSwing+'</span>':'')+'</div><div style="font-size:0.58rem;color:var(--text2);">'+(netFlow>=0?'cash-flow positive':'at current burn')+'</div></span></div>';
// Bottom section — business revenue, then total money out this month: recurring burn (opex + payroll + living/lifestyle + debt service) + COGS + this month's action costs + any merchant cash-advance holdback (folded into the total, footnoted with #).
const revRow=((s.monthly_revenue||0)>0||(st.rev||0)>0)?posRow('📈','Business revenue',st.rev||0,s.monthly_revenue||0,true):'';
const mcaPaid=s._mca_paid||0;
const burnOut=this.calcMonthlyBurn(),cogsOut=s.cogs||0,totalExp=(burnOut-(s.owner_pay||0))+cogsOut+sp.total+mcaPaid;/* owner pay is a draw to you (it funds your living expenses, which ARE counted) — not a separate outflow, so exclude it to avoid double-counting */
const _src=[];if(sp.cash>0)_src.push('cash');if(sp.biz>0||sp.pers>0)_src.push('credit');
// Expense breakdown — mini P&L layout
const _execComp=this.calcExecComp?this.calcExecComp():0;
const _opexBase=Math.max(0,(s.operating_expenses||0)-_execComp);
const _debtSvc=this.calcDebtInterest()+this.calcDebtPrincipal();
const _iRow=(lbl,amt,col)=>'<div style="display:flex;justify-content:space-between;font-size:0.72rem;padding:2px 0;"><span style="color:var(--text2);">'+lbl+'</span><span style="color:'+(col||'var(--text)')+';font-weight:600;">'+amt+'</span></div>';
const _div='<div style="border-top:1px dashed rgba(127,127,127,0.25);margin:4px 0;"></div>';
// Pure expense breakdown — only money OUT (revenue lives in the Business revenue row above; this list sums to Total expenses).
const _bkHtml='<div style="margin-top:6px;background:rgba(127,127,127,0.07);border-radius:6px;padding:7px 9px;">'+
  (cogsOut>0?_iRow('COGS','−'+fm(cogsOut),'var(--red)'):'')+
  (_opexBase>0?_iRow('Operating expenses','−'+fm(_opexBase),'var(--red)'):'')+
  (_execComp>0?_iRow('Manager pay','−'+fm(_execComp),'var(--red)'):'')+
  ((s.living_expenses||0)>0?_iRow('Living expenses','−'+fm(s.living_expenses||0),'var(--red)'):'')+
  ((s.lifestyle_expenses||0)>0?_iRow('Lifestyle','−'+fm(s.lifestyle_expenses||0),'var(--red)'):'')+
  (_debtSvc>0?_iRow('Debt service','−'+fm(_debtSvc),'var(--red)'):'')+
  (sp.total>0?_iRow('Action costs','−'+fm(sp.total),'var(--red)'):'')+
  (mcaPaid>0?_iRow('MCA holdback','−'+fm(mcaPaid),'var(--red)'):'')+
  _div+
  _iRow('Total expenses','−'+fm(totalExp),'var(--red)')+
  ((s.owner_pay||0)>0?'<div style="font-size:0.62rem;color:var(--text2);margin-top:5px;line-height:1.4;">💼 You paid yourself '+fm(s.owner_pay||0)+' this month — that\'s a draw that funds your living expenses above, not an extra cost.</div>':'')+
  '</div>';
const expLine='<div onclick="var d=document.getElementById(\'exp-bk\');d.style.display=d.style.display===\'none\'?\'block\':\'none\';" style="cursor:pointer;display:flex;justify-content:space-between;align-items:baseline;gap:8px;font-size:0.78rem;padding:3px 0;white-space:nowrap;"><span style="color:var(--text2);">📉 Total expenses <span style="font-size:0.64rem;color:var(--blue);">▾ breakdown</span></span><span><strong style="color:var(--red);">−'+fm(totalExp)+'</strong></span></div><div id="exp-bk" style="display:none;">'+_bkHtml+'</div>';
const mcaFoot=(mcaPaid>0||(s._mca_balance||0)>0)?'<div style="font-size:0.66rem;color:var(--text2);text-align:right;margin-top:-1px;">'+((s._mca_balance||0)>0?' · '+fm(s._mca_balance)+' left':' · cleared')+'</div>':'';
const plBlock='<div style="margin-bottom:7px;padding-bottom:7px;border-bottom:1px dashed var(--border);">'+revRow+expLine+mcaFoot+'</div>';
const _lose=!!this._pendingLose;const _panelEdge=_lose?'var(--red)':'var(--gold)';const _panelTitle=_lose?'<span style="color:var(--red);">❌ Insolvent — Out of Cash & Credit</span>':'📊 Cash & Credit — This Month';html+='<div id="month-cash-panel" class="fade-in" style="background:var(--surface);border:1px solid '+(_lose?'var(--red)':'var(--border)')+';border-left:3px solid '+_panelEdge+';border-radius:var(--radius-sm);padding:11px 13px;margin-bottom:9px;"><div style="font-size:0.86rem;font-weight:700;margin-bottom:6px;">'+_panelTitle+'</div>'+plBlock+capBlock+rows+'</div>';this._monthCashSummary=null;}
if(!this._pendingLose&&!this.state._epic_life)html+=this._epicMilestoneCompact();/* non-members get the compact teaser here; members get the richer "Your Concierge This Month" card at the top instead */
document.getElementById('results-content').innerHTML=html;{const nb=document.getElementById('result-next-btn');if(nb){this._ccChecked=false;nb.textContent=document.getElementById('month-cash-panel')?'💳 Check Cash & Credit':'Next Month →';}}this._pendingEvent=triggeredEvent;this._pendingTax=(this.month===12||this.month===24||this.month===36);
if(this._tutFinalPending){this._tutFinalPending=false;this._tutStep++;setTimeout(()=>this.renderTutorialStep(),120);}
// Second life: your tax reserve just covered a shortfall that would have ended the run. Celebrate the discipline — and remind them the IRS bill is still coming.
if(this._taxRescue){const amt=this._taxRescue;this._taxRescue=0;const resLeft=this.state.tax_reserve||0;setTimeout(()=>this.showPopup('🛟 Saved by Your Tax Reserve','<div style="line-height:1.6;font-size:0.9rem;">You were about to run out of cash and credit — but you\'d set aside a <strong>tax reserve</strong>, and draining <strong>$'+this.fmt(amt)+'</strong> of it kept you in the game. That discipline just bought you a <strong>second life</strong>.<br><br>But remember: that money was the IRS\'s. Your year-end tax bill is still coming, and there\'s now <strong>$'+this.fmt(resLeft)+'</strong> left in the reserve. Rebuild it when you can.</div>'),260);}
// Second life #2: your personal emergency fund just covered a business shortfall that would have ended the run. Reward the pay-yourself-first discipline — and nudge them to fix the burn so they don't lean on it again.
else if(this._ownerRescue){const amt=this._ownerRescue;this._ownerRescue=0;const persLeft=this.state.personal_cash||0,s=this.state;s._ownerRescueCount=(s._ownerRescueCount||0)+1;const recur=s._ownerRescueCount>1,last=s._ownerRescueLastShown==null?-99:s._ownerRescueLastShown;
// Throttle: the dramatic "second life" pop-up the FIRST time, then at most once every 4 months — a chronically short business taps personal savings every month, and a full-screen pop-up each time is just spam (the month's Cash & Credit panel already shows the shortfall).
if(!recur||this.month-last>=4){s._ownerRescueLastShown=this.month;
 const body=recur
  ?'<div style="line-height:1.6;font-size:0.9rem;">Your business came up short <strong>again</strong> and leaned on your <strong>personal savings</strong> — <strong>$'+this.fmt(amt)+'</strong> this month ('+s._ownerRescueCount+' months total). You\'ve got <strong>$'+this.fmt(persLeft)+'</strong> left.<br><br>This is a <strong>spiral</strong>: the business still isn\'t paying its own way, and your savings are the only thing between you and game over. Fix the burn now — cut costs, raise revenue, restructure your debt, or open credit — before the cushion runs out.</div>'
  :'<div style="line-height:1.6;font-size:0.9rem;">The business came up short this month and ran out of cash and credit — but you injected <strong>$'+this.fmt(amt)+'</strong> from your <strong>personal savings</strong> to cover it. Building that cushion ahead of time just kept you in the game.<br><br>You\'ve got <strong>$'+this.fmt(persLeft)+'</strong> of personal cash left. Don\'t make a habit of it — fix the burn (cut costs, raise revenue, or open credit) so the business pays its own way.</div>';
 setTimeout(()=>this.showPopup(recur?'⚠ Leaning on Personal Savings Again':'🛟 Saved by Your Personal Savings',body),260);}}
// Just opened a cash-value policy and you're holding a tax reserve → offer to fold it in. The policy grows tax-free (vs the money-market reserve's taxable ~4%) and still covers taxes via a tax-free loan when due.
if(this._pendingReserveFold){this._pendingReserveFold=false;const res=Math.round(this.state.tax_reserve||0);if(res>0&&document.getElementById('popup-container').style.display!=='block'){const into=Math.round(res*0.98);setTimeout(()=>this._confirm('🛡️ Fold your tax reserve into the policy?','<div style="line-height:1.6;font-size:0.9rem;">You\'ve got <strong>$'+this.fmt(res)+'</strong> in your tax reserve — a money-market account earning ~4%/yr (taxable). Roll it into your new policy and it compounds <strong>tax-free</strong> instead, and it still covers your taxes: when the IRS bill comes you borrow against it tax-free. A ~2% cost of insurance applies, so about <strong>$'+this.fmt(into)+'</strong> lands as cash value.</div>','Fold it in',()=>{const s=this.state,amt=Math.round(s.tax_reserve||0);if(amt>0){const credited=Math.round(amt*0.98);s.tax_reserve=0;s.insurance_cash_value=(s.insurance_cash_value||0)+credited;s.insurance_basis=(s.insurance_basis||0)+credited;this.autoSave();this.renderStats&&this.renderStats();this.showPopup('✓ Reserve Folded In','<div style="line-height:1.6;font-size:0.9rem;">Your '+this.fmtMoney(amt)+' reserve is now in the policy, compounding tax-free. When taxes are due, borrow against it tax-free — your money never stops working.</div>');}}),300);}}
// LLC just formed → name the company (skip if a rescue pop-up is already up; rare on a formation month).
},

nextMonth(){
// Insolvency ends the run immediately after the Cash & Credit card — no event/tax detour first. You already saw HOW it blew up (red panel + game-over walkthrough); piling an event and a tax bill on top before the end screen was just tedious. Clear any queued event/tax and go straight to game over.
if(this._pendingLose){const r=this._pendingLose;this._pendingLose=null;this._pendingEvent=null;this._pendingTax=false;return this.loseGame(r);}
if(this._pendingEvent){const e=this._pendingEvent;this._pendingEvent=null;this.showEvent(e);return;}
if(this._pendingTax){this._pendingTax=false;this.showTaxEvent();return;}
// Delayed lifestyle payoffs apply quietly and surface as a small note atop next month — no extra screen/click.
const triggered=(this.state._lifestyle_buffs||[]).filter(b=>b.trigger_month<=this.month);
if(triggered.length){this.state._lifestyle_buffs=(this.state._lifestyle_buffs||[]).filter(b=>b.trigger_month>this.month);
for(const buff of triggered)this.applyEffects(buff.effects);
this.state._pendingRipples=(this.state._pendingRipples||[]).concat(triggered.map(b=>({source:b.source,narrative:b.narrative})));}
// Year checkpoints at 12 & 24 only. Month 36 skips the checkpoint and goes straight to the final score — the end screen already shows the composite, radar, and debrief, so a checkpoint first was a redundant extra screen.
if(this.month===12||this.month===24){this.showCheckpoint();return;}
this.month++;if(this.month>36){this.endGame();return;}this.renderMonth();},

showEvent(evt){this.showScreen('event-screen');this.renderStats('event-dashboard');document.getElementById('event-month-label').textContent='Month '+this.month+' — Event';document.getElementById('event-box').innerHTML='<div class="event-category">'+evt.category+'</div><div class="event-narrative">'+evt.narrative+'</div>';let note=this._mitigationNote(evt);
// First event ever → explain the mechanic with a one-time pop-up (events start from month 2).
if(!this.state._first_event_seen){this.state._first_event_seen=true;setTimeout(()=>this._spotlightSeq([
{sel:'#event-box',t:'📣 Events Happen',b:'Every business hits the unexpected — a lawsuit, a windfall, a key person out sick. <strong>This is the situation.</strong> Read it carefully; the details and your dashboard hint at the smart move.'},
{sel:'#event-choices',t:'Your call',b:'Choose how to respond. Your <strong>choice</strong> — and the <strong>safeguards you set up beforehand</strong> (LLC, insurance, cash reserves) — decide how it lands. There\'s often no perfect option; pick the smartest one.'}
],0),140);}
evt._scaledChoices=evt.choices.map(c=>({label:c.label,outcome_narrative:c.outcome_narrative,effects:this.scaleEventEffects(c.effects,evt.category==='opportunity')}));
// Policy loan: the deal is bounded by what your policy can actually lend (up to ~90% of cash value, less any existing loan) — NOT a generic scaled figure. Show the real number so the offer matches what you'll get, and so it's clear this is borrowed (a loan you owe), not free money.
if(evt.id==='policy_loan_opportunity'&&evt._scaledChoices[0]){const _s=this.state,_room=Math.max(0,Math.round(0.9*(_s.insurance_cash_value||0)-(_s.insurance_loan_balance||0)));evt._scaledChoices[0].effects={insurance_loan_balance:_room,investment_positions:_room,other_monthly_revenue:Math.round(_room*0.012)};}
// Buy-the-dip: show the live terms — the discount on the table and the dry powder you can actually deploy right now (policy + reserves), so the prepared see what they can seize and the unprepared see exactly what they're missing.
if(evt.id==='buy_the_dip'){const _s=this.state,dp=this._dryPowder(),disc=Math.round((1-Math.max(0.6,Math.min(0.95,_s._asset_discount||0.78)))*100),enough=dp.total>=8000;note+='<div class="narrative-box fade-in" style="border-left-color:'+(enough?'var(--gold)':'var(--red)')+';margin-bottom:12px;"><strong>On the table:</strong> assets ~'+disc+'% below market. <strong>Deployable dry powder right now: '+this.fmtMoney(dp.total)+'</strong>'+(dp.policy>0?' — incl. '+this.fmtMoney(dp.policy)+' borrowable tax-free against your policy':'')+'.'+(enough?'':' <span style="color:var(--red);">Too thin to move on a deal this size — credit\'s frozen and you\'ve no reserve to deploy.</span>')+'</div>';}
// Choices no longer reveal the outcome numbers — you decide from the narrative + your dashboard, then see results after. The ONE exception is a deal/offer (an opportunity): you should see the terms on the table (price, financing, equity), but not the downstream stat impacts.
const isOffer=evt.category==='opportunity',OFFER_KEYS=['cash','total_debt','available_credit','real_estate_equity','investment_positions','insurance_cash_value','business_credit_limit'];
document.getElementById('event-choices').innerHTML=note+evt._scaledChoices.map((c,i)=>{let inner='';if(isOffer){const parts=Object.entries(c.effects).filter(([k,v])=>typeof v==='number'&&v!==0&&OFFER_KEYS.includes(k)).map(([k,v])=>(MK.includes(k)?this.fmtMoney(v):(v>0?'+':'')+v)+' '+this.formatStatName(k));if(parts.length)inner='<div class="choice-effects" style="color:var(--text2);"><span style="font-weight:600;">The offer:</span> '+parts.join(', ')+'</div>';}return'<div class="choice-card fade-in" onclick="Game.resolveEvent('+i+')"><h4>'+c.label+'</h4>'+inner+'</div>';}).join('');this.currentEvent=evt;this.eventHistory.push(evt);},

_mitigationNote(evt){const have=(evt.mitigated_by||[]).filter(id=>(this.state._completed_actions||[]).includes(id));if(!have.length)return '';
const P={business_credit_line:'your open business line of credit gives you room to act from strength — cover a gap or seize an opening instead of scrambling',banking_relationship:'your banking relationship means a friendly lender actually picks up the phone',build_offer:'your sharp offer keeps demand resilient when others fade',content_engine:'your content engine keeps leads coming in on their own',client_onboarding:'your onboarding set clear expectations, so there are fewer surprises',basic_quality_control:'your quality controls catch problems before clients do',crm_pipeline:'your CRM keeps the pipeline full, so no single loss sinks you',hire_client_success:'your client-success function keeps people from churning',write_first_sop:'your documented SOPs keep the work running without the person who left',middle_management:'your management layer absorbs the shock so it doesn’t all land on you',full_systemization:'your systemized operation keeps humming with or without any one person',fulfillment_system:'your fulfillment system keeps delivery on track under strain',project_management:'your project management keeps the team coordinated instead of firefighting',hire_hr_manager:'your HR lead handles the people side professionally',keyman_insurance:'your key-man policy cushions the financial blow',fund_accumulation_policy:'your policy’s cash value is a tax-free reserve you can borrow against fast',basic_bookkeeping:'your clean books make this quick to answer and hard to dispute',s_corp_election:'your S-Corp structure keeps your filings clean',tax_optimization:'your tax planning leaves little to question',tax_planning_session:'your tax planning leaves little to question',hire_fractional_cfo:'your CFO has the financials buttoned up',advanced_tax_strategy:'your advanced tax structure keeps more cash in your hands',form_llc:'your LLC keeps the claim at the company, not your household',asset_protection:'your asset-protection structure walls off what you’ve built',gym_routine:'the habits you built give you the resilience to handle this',meditation_practice:'the habits you built give you the resilience to handle this',annual_physical:'staying on top of your health meant you caught it early',vertical_integration:'controlling more of your supply chain blunts the disruption'};
const uniq=[...new Set(have.map(id=>P[id]||(this._safeguardName(id)+' helps here')))];
const lead=evt.category==='opportunity'?'You’re positioned to seize this:':'Your preparation is paying off:';
return '<div class="narrative-box fade-in" style="border-left-color:var(--accent);margin-bottom:12px;"><strong>'+lead+'</strong> '+uniq.join('; ')+'.</div>';},
_safeguardName(p){if(typeof p==='string'){const map={keyman_insurance:'your key-person policy',income_protection:'your income protection',form_llc:'your LLC',asset_protection:'your asset-protection trust',client_onboarding:'your client onboarding',basic_quality_control:'your quality controls',banking_relationship:'your banking relationship',basic_bookkeeping:'your bookkeeping',write_first_sop:'your documented SOPs',middle_management:'your management layer',full_systemization:'your systemized business'};return map[p]||this.actionLabel(p)||'your preparation';}if(p&&typeof p==='object'){if(p.entity_structure_in||p.entity_structure)return 'your LLC';if(p.trust_structure_not||p.trust_structure)return 'your asset-protection trust';if(p.insurance_coverage_gte)return 'your insurance coverage';if(p.personal_credit_score_gte)return 'your strong credit';}return 'your preparation';},
// Snapshot of the dashboard figures an outcome can move, for before → after display
_baSnapshot(){const s=this.state;return {cash:s.cash||0,pcash:s.personal_cash||0,debt:s.total_debt||0,bizLim:s.business_credit_limit||0,bizUtil:this.calcBizUtil(),persUtil:this.calcPersUtil(),avail:s.available_credit||0,persScore:s.personal_credit_score||0,leads:s.leads||0,customer_base:s.customer_base||0,team_size:s.team_size||0,brand_equity:s.brand_equity||0,systems_maturity:s.systems_maturity||0,revenue_capacity:s.revenue_capacity||0};},
_baRows(b){const s=this.state,sep=this.isSeparated(),RED='var(--red)',GRN='var(--accent)',fm=v=>this.fmtMoney(Math.round(v)),rows=[];
const mrow=(lbl,bv,av,goodUp)=>{const up=Math.round(av)>Math.round(bv),dn=Math.round(av)<Math.round(bv);if(!up&&!dn)return;rows.push([lbl,fm(bv),fm(av),(up===!!goodUp)?GRN:RED]);};
const nrow=(lbl,bv,av,goodUp,suf)=>{const up=Math.round(av)>Math.round(bv),dn=Math.round(av)<Math.round(bv);if(!up&&!dn)return;rows.push([lbl,Math.round(bv)+(suf||''),Math.round(av)+(suf||''),(up===!!goodUp)?GRN:RED]);};
mrow(sep?'Business cash':'Cash',b.cash,s.cash||0,true);if(sep)mrow('Personal cash',b.pcash,s.personal_cash||0,true);
mrow('Total debt',b.debt,s.total_debt||0,false);
const bizLim=s.business_credit_limit||0,bizUtil=this.calcBizUtil(),persUtil=this.calcPersUtil(),avail=s.available_credit||0;
if(bizLim!==b.bizLim)mrow('Business credit limit',b.bizLim,bizLim,true);
if(bizLim>0&&bizUtil!==b.bizUtil)nrow('Business utilization',b.bizUtil,bizUtil,false,'%');
if(persUtil!==b.persUtil)nrow('Personal utilization',b.persUtil,persUtil,false,'%');
if(avail!==b.avail&&bizLim===b.bizLim)mrow('Personal credit available',b.avail,avail,true);
nrow('Personal credit score',b.persScore,s.personal_credit_score||0,true);
nrow('Leads',b.leads,s.leads||0,true);nrow('Customers',b.customer_base,s.customer_base||0,true);nrow('Team size',b.team_size,s.team_size||0,true);
nrow('Brand equity',b.brand_equity,s.brand_equity||0,true);nrow('Systems maturity',b.systems_maturity,s.systems_maturity||0,true);
mrow('Revenue capacity',b.revenue_capacity,s.revenue_capacity||0,true);
return rows;},
// Stat icons (match the dashboard) for the result screen — by stat key (effect chips) and by before→after row label.
_keyIcon(k){return ({cash:'💵',personal_cash:'💵',monthly_revenue:'📈',revenue_capacity:'📈',operating_expenses:'📉',cogs:'📉',total_debt:'🏦',available_credit:'💳',business_credit_limit:'💳',personal_credit_score:'📊',leads:'🎯',customer_base:'👥',team_size:'👷',brand_equity:'✨',systems_maturity:'⚙️',company_culture:'🎭',insurance_cash_value:'🛡️',investment_positions:'📊',real_estate_equity:'🏠',owner_pay:'💼',tax_reserve:'🧾'})[k]||'';},
_lblIcon(l){return ({'Cash':'💵','Business cash':'💵','Personal cash':'💵','Personal credit score':'📊','Business credit limit':'💳','Business utilization':'💳','Personal utilization':'💳','Personal credit available':'💳','Total debt':'🏦','Leads':'🎯','Customers':'👥','Team size':'👷','Brand equity':'✨','Systems maturity':'⚙️','Revenue capacity':'📈'})[l]||'';},
_baRowsHtml(rows){return rows.length?'<div style="margin-top:10px;background:rgba(127,127,127,0.08);border-radius:var(--radius-sm);padding:8px 11px;"><div style="font-size:0.68rem;color:var(--text2);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px;">Before → After</div>'+rows.map(row=>'<div style="display:flex;justify-content:space-between;gap:8px;font-size:0.74rem;padding:2px 0;"><span style="color:var(--text2);">'+(this._lblIcon(row[0])?this._lblIcon(row[0])+' ':'')+row[0]+'</span><span style="white-space:nowrap;"><span style="color:var(--text2);">'+row[1]+'</span> <span style="color:'+(row[3]||'var(--accent)')+';font-weight:700;">→ '+row[2]+'</span></span></div>').join('')+'</div>':'';},
resolveEvent(ci){const evt=this.currentEvent,c=evt._scaledChoices?evt._scaledChoices[ci]:evt.choices[ci];
// Risk & consequence: protection (e.g. LLC, asset protection) changes the OUTCOME and explains why — see DESIGN.md legibility goal.
const _evtBefore=this._baSnapshot();
let effects=Object.assign({},c.effects),protNote='',saleNote='';
// Selling the company (full acquisition): proceeds are personal income, taxed as capital gains, and you forfeit the equity/upside — not just business cash sitting in the account.
if(evt.id==='acquisition_offer'&&ci===0){const s=this.state,proceeds=effects.cash||0;delete effects.cash;const tax=Math.round(proceeds*0.238),net=proceeds-tax;s.personal_cash=(s.personal_cash||0)+net;s.personal_tax_ytd=(s.personal_tax_ytd||0)+tax;s.capital_account=0;saleNote='<div class="narrative-box fade-in" style="border-left-color:var(--gold);margin-top:12px;">You sold the company — converting illiquid equity into cash. The <strong>'+this.fmtMoney(proceeds)+'</strong> sale price is <strong>personal</strong> income, less <strong>'+this.fmtMoney(tax)+'</strong> in long-term capital-gains tax (~23.8%: 20% federal + 3.8% NIIT). Net to you: <strong>'+this.fmtMoney(net)+'</strong>. Your equity and its future cash flow now belong to the buyer — your wealth is only what survived the tax.</div>';}
// Borrowing against your policy to fund a deal: you can only deploy what the policy actually supports (up to ~90% of cash value, less any existing loan). The position funded equals the amount borrowed — and the cash value itself is untouched (it keeps compounding via the monthly tick).
if(evt.id==='policy_loan_opportunity'&&ci===0){const s=this.state,room=Math.max(0,Math.round(0.9*(s.insurance_cash_value||0)-(s.insurance_loan_balance||0))),want=effects.investment_positions||15000,deploy=Math.min(want,room);delete effects.investment_positions;delete effects.insurance_loan_balance;delete effects.other_monthly_revenue;if(deploy>0){s.insurance_loan_balance=(s.insurance_loan_balance||0)+deploy;s.investment_positions=(s.investment_positions||0)+deploy;s.other_monthly_revenue=(s.other_monthly_revenue||0)+Math.round(deploy*0.012);c.outcome_narrative='You borrowed '+this.fmtMoney(deploy)+' tax-free against your policy — up to ~90% of its '+this.fmtMoney(s.insurance_cash_value||0)+' cash value — and deployed it into a passive position throwing off ~'+this.fmtMoney(Math.round(deploy*0.012))+'/mo. The cash value keeps compounding as if you never touched it; the loan is simply netted from your death benefit, never repaid from your pocket.';}else{c.outcome_narrative='Your policy doesn\'t have borrowing room right now — you can borrow up to ~90% of the cash value, less any existing loan. Keep funding the policy and this kind of on-demand, tax-free deal opens back up.';}}
// BUY THE DIP — the keystone payoff. In the downturn, the prepared deploy dry powder into distressed assets at a deep discount while the over-leveraged are frozen out (or forced sellers). Funded POLICY-FIRST (tax-free, no credit check, frozen-proof) then cash reserves; assets are marked at their post-recovery value, so the discount you captured is instant equity, plus high yield on the cheap basis. Everything is computed here — the config choice effects are empty.
if(evt.id==='buy_the_dip'){const s=this.state;
 if(ci===0){const dp=this._dryPowder(),discount=Math.max(0.6,Math.min(0.95,s._asset_discount||0.78));
  const cap=Math.min(300000,Math.max(60000,Math.round(this.calcNetWorth()*0.4)));let deploy=Math.min(dp.total,cap);
  if(deploy<8000){c.outcome_narrative='The deal of the decade is sitting right in front of you — distressed assets '+Math.round((1-discount)*100)+'% below market, motivated sellers everywhere — and you can\'t move on it. Credit is frozen, your policy has little or no cash value to borrow against, and your reserves are thin. <strong>This is the hard lesson of the downturn:</strong> the dip only pays the prepared. A funded policy you could borrow against tax-free, dry powder you kept liquid instead of over-extending — that\'s what turns a crash into the buying opportunity of a lifetime. Next cycle, be ready before the music stops.';}
  else{let need=deploy,fromPolicy=Math.min(need,dp.policy);if(fromPolicy>0){s.insurance_loan_balance=(s.insurance_loan_balance||0)+fromPolicy;need-=fromPolicy;}
   let fromCash=Math.min(need,dp.cash);if(fromCash>0){let r=fromCash;const fc=Math.min(r,s.cash||0);s.cash=(s.cash||0)-fc;r-=fc;if(r>0)s.personal_cash=(s.personal_cash||0)-r;need-=fromCash;}
   deploy=fromPolicy+fromCash;const marked=Math.round(deploy/discount);/* bought at a discount, marked at post-recovery value */const dipAlpha=marked-deploy;const monthlyCF=Math.round(marked*0.011);/* cheap basis throws off high yield (~13%/yr) */
   s.investment_positions=(s.investment_positions||0)+marked;s.other_monthly_revenue=(s.other_monthly_revenue||0)+monthlyCF;s._bought_dip=(s._bought_dip||0)+1;
   const srcParts=[];if(fromPolicy>0)srcParts.push(this.fmtMoney(fromPolicy)+' borrowed tax-free against your policy');if(fromCash>0)srcParts.push(this.fmtMoney(fromCash)+' from your reserves');
   c.outcome_narrative='You moved while the rest of the market was paralyzed. You deployed <strong>'+this.fmtMoney(deploy)+'</strong> ('+srcParts.join(' + ')+') into distressed assets at a <strong>'+Math.round((1-discount)*100)+'% discount</strong> — the kind of basis you only get in a crash. Marked at their normalized value of ~<strong>'+this.fmtMoney(marked)+'</strong>, you\'re already up <strong>'+this.fmtMoney(dipAlpha)+'</strong> in equity, and the cheap basis throws off <strong>'+this.fmtMoney(monthlyCF)+'/mo</strong> in passive cash flow. '+(fromPolicy>0?'This is exactly why you funded the policy: when banks slammed the window shut, your cash value didn\'t care — tax-free capital, no application, no approval, and the 0% floor meant the crash never even dented it.':'You kept your powder dry instead of over-extending, so when the discount came you could actually act.')+' This is how fortunes transfer in a downturn — to whoever prepared for it.';}}
  else{c.outcome_narrative='You stayed liquid and let it pass. Discipline has its own value — preserving reserves is never wrong. But assets this cheap, with sellers this motivated, are exactly what the prepared spend the good years getting ready for. The cycle always turns; the question is whether you\'ll have dry powder when it does.';}}
// Partnership deal: the cash injection scales with your business level, so put the ACTUAL amount in the narrative instead of a flat "$20K".
if(evt.id==='partner_offer'){const cashAmt=effects.cash||0;if(ci===0){this.state._partner_equity=0.30;c.outcome_narrative='The deal is signed — <strong>'+this.fmtMoney(cashAmt)+'</strong> in the bank plus a Rolodex of connections, in exchange for 30% equity. From now on your partner takes <strong>30% of every month\'s profit</strong> — it comes straight out of your cash and equity. That\'s the real price of selling a stake.';}else if(ci===1)c.outcome_narrative='She took the revenue-share — <strong>'+this.fmtMoney(cashAmt)+'</strong> upfront and you kept all your equity. Less capital now, but every future dollar stays yours.';}
// Key-Man Leverage — hybrid claim: losing an operator always stops that asset's income; if the operator was insured, the policy retires that property's SPECIFIC mortgage (covered = contained), otherwise the loan remains while the income that served it is gone (uninsured = the lesson). The claim never exceeds that loan — never a windfall.
if(evt.id==='key_operator_loss'){const s=this.state;const units=Math.max(1,s._asset_units||1);const perDebt=Math.round((s.real_estate_debt||0)/units),perInc=Math.round((s._asset_income||s.other_monthly_revenue||0)/units),covered=(s._keyman_units||0)>0;
 s.other_monthly_revenue=Math.max(0,(s.other_monthly_revenue||0)-perInc);s._asset_income=Math.max(0,(s._asset_income||0)-perInc);s._asset_units=Math.max(0,(s._asset_units||0)-1);
 if(covered){const claim=Math.min(perDebt,s.real_estate_debt||0);s.real_estate_debt=Math.max(0,(s.real_estate_debt||0)-claim);s.total_debt=Math.max(0,(s.total_debt||0)-claim);s._keyman_units=Math.max(0,(s._keyman_units||0)-1);s._keyman_claims_total=(s._keyman_claims_total||0)+claim;
  const targetPrem=Math.round((s._keyman_units||0)*180),cur=s._keyman_premium||0;if(targetPrem!==cur){s.operating_expenses=Math.max(0,(s.operating_expenses||0)+(targetPrem-cur));s._keyman_premium=targetPrem;if(s._active_recurring_costs)s._active_recurring_costs['key_man_policy']=targetPrem;}
  c.outcome_narrative='Tragic — but you had insured them. The <strong>key-man / loan-protection policy paid out '+this.fmtMoney(claim)+'</strong>, retiring the mortgage on that property outright. You have lost its '+this.fmtMoney(perInc)+'/mo income while you place a new operator, but the debt is gone — the loss is contained, not catastrophic. This is exactly what the policy is for: it covers that specific loan, never a windfall.';}
 else{const hit=Math.max(0,Math.round(perInc*2));if(hit>0){s.cash=(s.cash||0)-hit;if(s.cash<0){const u=this.coverShortfall(-s.cash);s.cash=0;if(u>0)s.cash=-u;}}c.outcome_narrative='You had no key-man coverage on them. That property still owes <strong>'+this.fmtMoney(perDebt)+'</strong> on its mortgage, but the '+this.fmtMoney(perInc)+'/mo income that serviced it just stopped — and you are out '+this.fmtMoney(hit)+' scrambling to cover the gap and re-staff. This is the danger of leveraging on people you have not insured.';}}
if(evt.protection){let shielded=false;if(evt.protection.shielded_when)shielded=this.meetsReq(evt.protection.shielded_when);if(!shielded&&evt.protection.shielded_by)shielded=(this.state._completed_actions||[]).includes(evt.protection.shielded_by);
const safeguard=this._safeguardName(evt.protection.shielded_by||evt.protection.shielded_when);
if(shielded){const avoided=[];if(evt.protection.unprotected_extra)for(const k in evt.protection.unprotected_extra){const v=evt.protection.unprotected_extra[k];if(typeof v==='number'&&v!==0)avoided.push(MK.includes(k)?this.fmtMoney(Math.abs(v)):Math.abs(v)+' '+this.formatStatName(k));}const savedNote=avoided.length?'<br><span style="color:var(--accent);font-size:0.8rem;">Damage avoided: '+avoided.join(', ')+'.</span>':(evt.protection.shielded_multiplier!=null?'<br><span style="color:var(--accent);font-size:0.8rem;">Damage cut to '+Math.round(evt.protection.shielded_multiplier*100)+'% of what it would have been.</span>':'');
// Insurance pays a claim: reimburse most of the out-of-pocket medical/recovery cost in the chosen outcome.
let claimNote='';if(evt.protection.claim_pct&&typeof effects.cash==='number'&&effects.cash<0){const claim=Math.round(-effects.cash*evt.protection.claim_pct);effects.cash+=claim;claimNote='<br><span style="color:var(--accent);font-size:0.8rem;">Medical claim paid: +'+this.fmtMoney(claim)+'.</span>';}
// Critical/chronic-illness riders in the stack pay a tax-free LUMP SUM — extra cash to live on while you can't work. Sized to a few months of your living costs.
if(evt.protection.critical_illness){const months=evt.protection.recovery_months||2;const monthlyLiving=(this.state.living_expenses||3200)+(this.state.lifestyle_expenses||0);const benefit=Math.round(Math.max(8000,monthlyLiving*months));effects.cash=(typeof effects.cash==='number'?effects.cash:0)+benefit;claimNote+='<br><span style="color:var(--accent);font-size:0.8rem;">Critical-illness benefit paid: +'+this.fmtMoney(benefit)+' tax-free — '+months+' month'+(months===1?'':'s')+' of living costs covered while you recover.</span>';}
// Key-person policy lump-sum benefit: pays the business a fixed sum (on death/disability/critical illness of a key person) to fund the transition.
if(evt.protection.payout){const pb=Math.round(evt.protection.payout);effects.cash=(typeof effects.cash==='number'?effects.cash:0)+pb;claimNote+='<br><span style="color:var(--accent);font-size:0.8rem;">Key-person policy paid out: +'+this.fmtMoney(pb)+' to fund the transition.</span>';}
protNote='<div class="narrative-box fade-in" style="border-left-color:var(--accent);margin-top:12px;"><strong>Protected — '+safeguard+'.</strong> '+evt.protection.protected_note+savedNote+claimNote+'</div>';if(evt.protection.shielded_multiplier!=null)for(const k in effects){if(typeof effects[k]==='number')effects[k]=Math.round(effects[k]*evt.protection.shielded_multiplier);}}
else{protNote='<div class="narrative-box fade-in" style="border-left-color:var(--red);margin-top:12px;"><strong>Unprotected.</strong> '+evt.protection.unprotected_note+'<br><span style="color:var(--gold);font-size:0.8rem;">How to prepare next time: '+safeguard+'.</span></div>';if(evt.protection.unprotected_extra)for(const k in evt.protection.unprotected_extra){const v=evt.protection.unprotected_extra[k];effects[k]=(typeof effects[k]==='number'?effects[k]:0)+v;}}}
this.applyEffects(effects);
// A voluntary departure (team_size dropped) removes THAT person's actual cost line — not a generic flat amount — so the breakdown stays exact. Replaces the choice's generic opex cut with the real salary removed.
if(evt.category==='people'&&(effects.team_size||0)<0){this._lastDeparted=null;let _removed=0;for(let i=0;i<(-(effects.team_size||0));i++)_removed+=this._removeDepartedRole();if(_removed>0&&typeof effects.operating_expenses==='number'&&effects.operating_expenses<0)this.state.operating_expenses-=effects.operating_expenses;if(_removed>0&&this._lastDeparted)c.outcome_narrative=(c.outcome_narrative||'')+' <span style="color:var(--accent);">That role is now open — you can <strong>re-hire</strong> it from the menu (look for the ↻ Rehire tag).</span>';}
this._syncRecurring();/* safety: keep the itemized recurring lines from exceeding the total */
// If this choice bankrupts you, don't cut to game over — render the outcome story first (so you see how it blew up); the run ends when you advance.
if(!this._settleCashOrLose())this._pendingLose='You couldn\'t cover the cost of that decision — cash and credit both ran dry.';
this.showScreen('result-screen');document.getElementById('result-month-label').textContent='Event Outcome';
const _baHtml=this._baRowsHtml(this._baRows(_evtBefore));
// Remaining effects not covered by the before→after rows (energy, audit risk, churn, etc.)
const _covered=['cash','personal_cash','total_debt','business_credit_limit','business_credit_used','available_credit','personal_credit_score','leads','customer_base','team_size','brand_equity','systems_maturity','revenue_capacity'];
const _otherEff=Object.entries(effects).filter(([k,v])=>typeof v==='number'&&v!==0&&!_covered.includes(k));
const _effHtml=_otherEff.length?'<div class="effect-list">'+_otherEff.map(([k,v])=>{const inv=IK.includes(k),color=inv?(v>0?'var(--red)':'var(--accent)'):(v>0?'var(--accent)':'var(--red)');return'<div class="effect-item"><span>'+this.formatStatName(k)+'</span><span style="color:'+color+';font-weight:600">'+(MK.includes(k)?this.fmtMoney(v):(v>0?'+':'')+v)+'</span></div>';}).join('')+'</div>':'';
// Scam-survival achievement: facing a tagged scam and NOT going all-in (the scam_trap choice) = you saw through it. Counts across every run (lifetime).
if(evt.scam){const fell=!!(evt.choices&&evt.choices[ci]&&evt.choices[ci].scam_trap);if(!fell)this._recordScamSurvived();}
document.getElementById('results-content').innerHTML='<div class="result-narrative fade-in"><strong>'+c.label+'</strong><br><br>'+c.outcome_narrative+'</div>'+_baHtml+_effHtml+saleNote+protNote;this.currentEvent=null;},
// ---- Scam-survival achievement (lifetime, across all runs) — tiers at 3 / 6 / 9 ----
SCAM_TIERS:[[3,'🕵️','Scam-Wise'],[6,'🛡️','Scam-Proof'],[9,'🥷','Untouchable']],
_scamsSurvivedLifetime(){try{return +localStorage.getItem('ep_scams_survived')||0;}catch(e){return 0;}},
_recordScamSurvived(){try{localStorage.setItem('ep_scams_survived',this._scamsSurvivedLifetime()+1);}catch(e){}if(this.state)this.state._scams_survived=(this.state._scams_survived||0)+1;},
_scamTierBadge(life){let t=null;for(const[n,i,name]of this.SCAM_TIERS)if(life>=n)t={i,n:name};return t;},
buildScamPanel(life,run){if(life==null)life=this._scamsSurvivedLifetime();if(run==null)run=(this.state&&this.state._scams_survived)||0;const top=life>=9;
const rows=this.SCAM_TIERS.map(([n,i,name])=>{const done=life>=n;return '<div style="display:flex;align-items:center;gap:9px;padding:5px 0;border-bottom:1px solid rgba(127,127,127,0.1);opacity:'+(done?'1':'0.5')+';"><span style="font-size:1rem;width:20px;text-align:center;">'+(done?i:'🔒')+'</span><span style="flex:1;font-size:0.8rem;'+(done?'':'color:var(--text2);')+'">'+name+' <span style="color:var(--text2);font-size:0.72rem;">— survive '+n+'</span></span><span style="font-size:0.74rem;font-weight:700;color:'+(done?'var(--accent)':'var(--text2)')+';">'+(done?'✓':'—')+'</span></div>';}).join('');
return '<div style="background:var(--surface);border:1px solid '+(top?'var(--gold)':'var(--border)')+';border-radius:var(--radius-sm);padding:14px;margin-top:14px;text-align:left;"><div style="display:flex;justify-content:space-between;align-items:center;"><span style="font-size:0.9rem;font-weight:700;color:'+(top?'var(--gold)':'var(--text)')+';">🕵️ Scams Survived</span><span style="font-size:0.82rem;font-weight:700;color:'+(top?'var(--gold)':'var(--text2)')+';">'+life+' lifetime</span></div><div style="font-size:0.7rem;color:var(--text2);margin:2px 0 8px;">Spot a “guaranteed, act-now” pitch and don’t go all in. Counts across every run'+(run>0?' · +'+run+' this run':'')+'.</div>'+rows+(top?'<div style="margin-top:10px;text-align:center;background:linear-gradient(135deg,rgba(212,175,55,0.18),rgba(59,130,246,0.1));border:1px solid var(--gold);border-radius:var(--radius-sm);padding:9px;font-size:0.8rem;font-weight:700;color:var(--gold);">🥷 Untouchable — 9 scams dodged. Nobody’s getting one past you.</div>':'')+'</div>';},

showTaxEvent(){const s=this.state,taxOwed=Math.round((s._ytd_taxable_income||0)*(s.tax_rate||0.25)),year=Math.ceil(this.month/12),sep=this.isSeparated(),payCash=sep?(s.personal_cash||0):(s.cash||0);
this.showScreen('event-screen');this.renderStats('event-dashboard');document.getElementById('event-month-label').textContent='Tax Season — Year '+year;
document.getElementById('event-box').innerHTML='<div class="event-category">TAXES</div><div class="event-narrative">The IRS doesn\'t care how hard your year was. Your accountant slides the number across the table: <strong>$'+this.fmt(taxOwed)+'</strong> owed.'+(s.tax_reserve>0?' You have $'+this.fmt(s.tax_reserve)+' in your tax reserve.':'')+'</div>';
let choices=[];
if(payCash>=taxOwed)choices.push('<div class="choice-card fade-in" onclick="Game.resolveTax(\'cash\','+taxOwed+')"><h4>Pay in full from '+(sep?'personal cash':'cash')+'</h4><div class="choice-effects">-$'+this.fmt(taxOwed)+(sep?' personal cash':' cash')+'</div></div>');
// THE POLICY PATH (dual purpose): if you have a funded cash-value policy, borrow against it tax-free to pay the IRS. The borrowed slice is a wash and the rest of your cash value keeps earning ~7%/yr — so it pays your taxes AND keeps compounding. Shown first when available; nothing leaves your pocket and it never touches your credit.
const policyBorrowable=Math.floor((s.insurance_cash_value||0)*0.9)-(s.insurance_loan_balance||0);
if(policyBorrowable>=taxOwed&&taxOwed>0)choices.push('<div class="choice-card fade-in" onclick="Game.resolveTax(\'policy\','+taxOwed+')"><h4>🛡️ Borrow against your policy (tax-free)</h4><div class="choice-effects">+$'+this.fmt(taxOwed)+' policy loan · cash value keeps earning interest behind it · no cash out, no credit hit</div></div>');
else if(policyBorrowable>0&&taxOwed>0&&payCash>=(taxOwed-policyBorrowable)){const rest=taxOwed-policyBorrowable;choices.push('<div class="choice-card fade-in" onclick="Game.resolveTax(\'policy_partial\','+taxOwed+')"><h4>🛡️ Borrow what your policy allows + pay the rest</h4><div class="choice-effects">+$'+this.fmt(policyBorrowable)+' policy loan, -$'+this.fmt(rest)+(sep?' personal cash':' cash')+' · cash value keeps earning</div></div>');}
// THE RESERVE PATH (for players who set aside a tax reserve instead of a policy):
if(s.tax_reserve>=taxOwed)choices.push('<div class="choice-card fade-in" onclick="Game.resolveTax(\'reserve\','+taxOwed+')"><h4>Pay from tax reserve</h4><div class="choice-effects">-$'+this.fmt(taxOwed)+' from reserve</div></div>');
if(s.tax_reserve>0&&s.tax_reserve<taxOwed){const remainder=taxOwed-s.tax_reserve;choices.push('<div class="choice-card fade-in" onclick="Game.resolveTax(\'partial_reserve\','+taxOwed+')"><h4>Use reserve + pay rest from '+(sep?'personal cash':'cash')+'</h4><div class="choice-effects">-$'+this.fmt(s.tax_reserve)+' reserve, -$'+this.fmt(remainder)+(sep?' personal cash':' cash')+'</div></div>');}
const partial=Math.round(taxOwed*0.3),debt=Math.round(taxOwed*0.7);
choices.push('<div class="choice-card fade-in" onclick="Game.resolveTax(\'plan\','+taxOwed+')"><h4>Pay what you can, payment plan</h4><div class="choice-effects">-$'+this.fmt(partial)+' cash, +$'+this.fmt(debt)+' debt, +audit risk</div></div>');
choices.push('<div class="choice-card fade-in" onclick="Game.resolveTax(\'extend\','+taxOwed+')"><h4>Can\'t pay — request extension</h4><div class="choice-effects">+$'+this.fmt(taxOwed)+' debt, +audit risk (no credit hit)</div></div>');
document.getElementById('event-choices').innerHTML=choices.join('');this.currentEvent=null;},

resolveTax(method,amount){const s=this.state,sep=this.isSeparated();let narrative='';
if(method==='cash'){if(sep){s.personal_cash=(s.personal_cash||0)-amount;s.personal_tax_ytd=(s.personal_tax_ytd||0)+amount;}else s.cash-=amount;narrative='Check written. Painful, but clean.';}
else if(method==='reserve'){s.tax_reserve-=amount;if(sep)s.personal_tax_ytd=(s.personal_tax_ytd||0)+amount;narrative='This is exactly what the reserve was for.';}
else if(method==='partial_reserve'){const remainder=amount-s.tax_reserve;if(sep){s.personal_cash=(s.personal_cash||0)-remainder;s.personal_tax_ytd=(s.personal_tax_ytd||0)+amount;}else s.cash-=remainder;s.tax_reserve=0;narrative='Reserve covered most of it. The rest came from '+(sep?'personal cash':'cash')+'.';}
else if(method==='policy'){s.insurance_loan_balance=(s.insurance_loan_balance||0)+amount;if(sep)s.personal_tax_ytd=(s.personal_tax_ytd||0)+amount;narrative='You borrowed against your policy to pay the IRS — tax-free, no credit hit, and your cash value keeps compounding behind the loan. Your policy is your bank: this is the infinite-banking move the wealthy use to pay taxes without ever touching their invested capital.';}
else if(method==='policy_partial'){const pb=Math.floor((s.insurance_cash_value||0)*0.9)-(s.insurance_loan_balance||0),borrow=Math.max(0,Math.min(pb,amount)),rest=amount-borrow;s.insurance_loan_balance=(s.insurance_loan_balance||0)+borrow;if(sep){s.personal_cash=(s.personal_cash||0)-rest;s.personal_tax_ytd=(s.personal_tax_ytd||0)+amount;}else s.cash-=rest;narrative='Your policy covered '+this.fmtMoney(borrow)+' of the bill tax-free (its cash value keeps earning behind the loan), and you topped up the last '+this.fmtMoney(rest)+' from '+(sep?'personal cash':'cash')+'.';}
else if(method==='plan'){s.cash-=Math.round(amount*0.3);s.total_debt+=Math.round(amount*0.7);s.audit_risk+=10;s.operating_expenses+=Math.round(amount*0.7/12);narrative='Payment plan set up. Interest and penalties apply. Added to monthly obligations.';}
else{s.total_debt+=amount;s.audit_risk+=20;s.operating_expenses+=Math.round(amount/12);narrative='Extension filed. Interest and penalties accrue and the IRS remembers — but a tax extension doesn\'t touch your credit score.';}
s._ytd_taxable_income=0;
this.showScreen('result-screen');document.getElementById('result-month-label').textContent='Tax Outcome';
document.getElementById('results-content').innerHTML='<div class="result-narrative fade-in">'+narrative+'</div>';
this._pendingTax=false;},

showCheckpoint(){
this._atCheckpoint=true;/* saves taken here resume on the NEXT month, not a replay of the year-end month (see _snapshot) */
const scores=this.calculateFinalScores(),composite=this.calcComposite(scores),year=Math.ceil(this.month/12);
let html='<div class="month-header"><h2>Year '+year+' Complete</h2></div>';
html+='<div class="checkpoint-label">COMPOSITE SCORE</div><div class="checkpoint-score">'+composite+' <span style="font-size:0.9rem;color:var(--text2)">/ 600</span></div>';
html+='<div class="radar-wrap"><canvas id="cp-radar" width="260" height="260"></canvas></div>';
html+='<div class="stats-grid">'+this._renderScoreCards(scores)+'</div>';
html+=this.buildDebrief();
if(this.month<36){html+='<button class="btn-primary" onclick="Game.continueFromCheckpoint()">Keep Going — Year '+(year+1)+'</button>';
html+='<button class="btn-outline" onclick="Game.endGame()" style="margin-top:8px;">🏁 End Here — Lock In My Final Score</button>';
html+='<div style="text-align:center;font-size:0.72rem;color:var(--text2);margin-top:6px;">You can stop after Year '+year+' — your run is scored right here. Or keep building toward Year '+(year+1)+'.</div>';
this.autoSave();/* checkpoint is auto-persisted — no manual name/save step needed */
{const _co=(this.state.company_name||'').trim(),_dt=new Date().toISOString().split('T')[0];html+='<div style="margin-top:14px;background:rgba(16,185,129,0.08);border:1px solid var(--accent);border-radius:var(--radius-sm);padding:11px 14px;font-size:0.74rem;color:var(--text2);line-height:1.5;">💾 <strong style="color:var(--accent);">Progress auto-saved</strong>'+(_co?' — '+this._esc(_co):'')+' · '+_dt+'.<br>Close the tab anytime and pick it back up from <strong>Continue</strong> on the title screen.</div>';}
// Post this checkpoint run to the leaderboard now (and keep playing). Uses the name field above.
html+='<div id="cp-post-box" style="margin-top:10px;"><button class="btn-outline" onclick="Game.postCheckpoint()" style="margin:0;">🏆 Post This Year’s Run to the Leaderboard</button><div style="text-align:center;font-size:0.66rem;color:var(--text2);margin-top:5px;">Ranks your Year '+year+' score now — you can still keep playing toward a bigger run.</div></div>';
// First full year as the New Business Owner unlocks New Game+ — tell them here (right next to Save), so they can stash this run and go experiment.
if(year===1&&this.archetype&&this.archetype.id==='new')html+='<div style="margin-top:14px;background:linear-gradient(135deg,rgba(212,175,55,0.15),rgba(59,130,246,0.1));border:1px solid var(--gold);border-radius:var(--radius-sm);padding:12px 14px;"><div style="font-size:0.82rem;font-weight:700;color:var(--gold);margin-bottom:5px;">🔁 New Game+ Unlocked!</div><div style="font-size:0.72rem;color:var(--text2);line-height:1.5;">You finished a full year — you\'ve earned <strong>New Game+</strong>: a fresh run with a <strong>fully customizable</strong> starting position (cash, credit, business size, entity) and head-start perks — you can even begin with <strong>Epic Life</strong>. No tutorial, pure sandbox.<br><br>Want to try it? <strong>Save your progress above</strong> first so you can come back to this run, then pick <strong>🔁 New Game+</strong> on the title screen anytime.</div></div>';}
else html+='<button class="btn-primary" onclick="Game.endGame()">See Your Final Score →</button>';
html+='<button class="btn-secondary" onclick="Game.autoSave();Game.showMainMenu()" style="margin-top:14px;">🏠 Main Menu</button>';
document.getElementById('checkpoint-content').innerHTML=html;this.showScreen('checkpoint-screen');
setTimeout(()=>{const cv=document.getElementById('cp-radar');if(cv)this.drawRadarOn(cv,scores);},100);},

continueFromCheckpoint(){this.month++;this.renderMonth();},

// Funding rule for life actions: executive health/performance, professional development, thought-leadership and team spend are legitimate BUSINESS expenses (paid from business cash/credit); everything purely personal (family, luxury, spiritual, giving, personal estate) is paid from PERSONAL cash. Keeps personal cash from being drained by what are really business investments. A config `funding` field overrides if present.
LIFE_BUSINESS_FUNDED:['executive_health_retreat','concierge_medicine','fitness_training','gym_routine','sleep_routine','morning_routine','annual_physical','therapy_coaching','nutrition_coach','learn_new_skill','masterclass_workshop','leadership_coaching','write_book','mentor_others','company_retreat'],
lifeActionIsPersonal(a){if(!a)return true;if(a.funding)return a.funding!=='business';return !this.LIFE_BUSINESS_FUNDED.includes(a.id);},
// Personal Mastery impact panel (shared by the quarterly check-in and the delegated-life result card): which dimensions moved + the new mastery score, given before-snapshots.
_masteryPanel(dB,mB,enB){const dA=this.lifeDims(),mA=this.calcPersonalMastery(),enA=Math.round(this.state.energy);
let rows=['Body','Mind','Spirit','Heart','Luxury'].filter(k=>dA[k]!==dB[k]).map(k=>{const up=dA[k]>dB[k];return '<div style="display:flex;justify-content:space-between;font-size:0.78rem;padding:2px 0;"><span style="color:var(--text2)">'+this.LIFE_ICON[k]+' '+k+'</span><span><span style="color:var(--text2)">'+dB[k]+'</span> <span style="color:'+(up?'var(--accent)':'var(--red)')+';font-weight:700;">→ '+dA[k]+'</span></span></div>';}).join('');
if(enA!==enB)rows+='<div style="display:flex;justify-content:space-between;font-size:0.78rem;padding:2px 0;"><span style="color:var(--text2)">⚡ Energy</span><span><span style="color:var(--text2)">'+enB+'</span> <span style="color:'+(enA>enB?'var(--accent)':'var(--red)')+';font-weight:700;">→ '+enA+'</span></span></div>';
if(!rows&&mA===mB)return '';const mUp=mA>=mB;
return '<div class="fade-in" style="background:var(--surface);border:1px solid var(--border);border-left:3px solid var(--purple);border-radius:var(--radius-sm);padding:11px 13px;margin:10px 0 9px;"><div style="font-size:0.86rem;font-weight:700;margin-bottom:5px;">✨ Personal Mastery '+mB+' → <span style="color:'+(mUp?'var(--accent)':'var(--red)')+'">'+mA+'</span></div>'+rows+'</div>';},
// Life-action preview: name the Personal Mastery dimension(s) the action builds, plus any other stat it touches (money shows its current value, like the other action menus).
lifeActionPreview(a){const s=this.state,DIM={lifestyle_health:'Body',fitness_level:'Body',lifestyle_legacy:'Mind',lifestyle_spiritual:'Spirit',lifestyle_philanthropy:'Spirit',lifestyle_relationships:'Heart',lifestyle_experiences:'Luxury'};
const MONEYISH=['cash','monthly_revenue','insurance_cash_value','investment_positions','real_estate_equity'],LBL={brand_equity:'Brand equity',leads:'Leads',monthly_revenue:'Revenue',cash:'Cash'};
const eff=a.effects||{},seen={},other=[];
for(const k in eff){if(typeof eff[k]!=='number'||eff[k]===0||k[0]==='_')continue;if(DIM[k]){seen[DIM[k]]=1;}else if(k==='energy'){if(!seen._en){seen._en=1;other.push('Energy');}}else{const lbl=LBL[k]||this.formatStatName(k);other.push(MONEYISH.includes(k)?(lbl+' <strong style="color:var(--text);">'+this.fmtMoney(Math.round(s[k]||0))+'</strong>'):lbl);}}
const dimParts=['Body','Mind','Spirit','Heart','Luxury'].filter(d=>seen[d]).map(d=>this.LIFE_ICON[d]+' '+d);
const parts=dimParts.concat(other);
return parts.length?'<p style="margin:-2px 0 6px;font-size:0.72rem;color:var(--text2);">Stats impacted: '+parts.join(' · ')+'</p>':'';},
showLifestyleScreen(){this.showScreen('lifestyle-screen');this.selectedLifestyle=null;const s=this.state;const d=this.lifeDims(),mastery=this.calcPersonalMastery();
const scores=['Body','Mind','Spirit','Heart','Luxury'].map(k=>({label:this.LIFE_ICON[k]+' '+k,value:d[k],color:d[k]>50?'positive':d[k]>25?'warning':'negative'}));
document.getElementById('lifestyle-scores').innerHTML='<div style="display:flex;gap:8px;margin-bottom:8px;grid-column:span 3;"><div class="stat-card" style="flex:1;"><div class="stat-value stat-positive" style="font-size:0.9rem;">'+this.fmtMoney(this.isSeparated()?(s.personal_cash||0):(s.cash||0))+'</div><div class="stat-label">'+(this.isSeparated()?'Personal Cash':'Cash')+'</div></div><div class="stat-card" style="flex:1;"><div class="stat-value" style="font-size:0.9rem;color:'+(mastery>50?'var(--accent)':mastery>25?'var(--gold)':'var(--red)')+';">'+mastery+'</div><div class="stat-label">Personal Mastery</div></div></div>'+scores.map(st=>'<div class="stat-card"><div class="stat-value stat-'+st.color+'">'+st.value+'</div><div class="stat-label">'+st.label+'</div></div>').join('');
// Group actions by the five Personal-Development themes (weakest dimensions first)
const themeVal={Body:d.Body,Mind:d.Mind,Spirit:d.Spirit,Heart:d.Heart,Luxury:d.Luxury};
// Rotating batch: rather than dumping all 45 options every quarter, show a curated handful per theme that CHANGES each visit. Weakest dimensions lead; freshest (not recently shown) options are preferred, so each life check-in looks different. Whatever you saw last time rotates to the back; older options cycle back in.
const PER_THEME=3,recent=this.state._life_recent||[],pocketOf=a=>(this.isSeparated()&&this.lifeActionIsPersonal(a))?(s.personal_cash||0):(s.cash||0);
const _themes=['Body','Mind','Spirit','Heart','Luxury'].sort((x,y)=>(themeVal[x]||0)-(themeVal[y]||0));
let _batch=[];
for(const th of _themes){const inTheme=CONFIG.lifestyle_options.actions.filter(a=>(this.LIFE_THEME[a.subcategory]||'Luxury')===th);
 inTheme.sort((a,b)=>{const fa=recent.includes(a.id)?1:0,fb=recent.includes(b.id)?1:0;if(fa!==fb)return fa-fb;/* fresh first */const af=pocketOf(a)>=(a.cash_cost||0)?0:1,bf=pocketOf(b)>=(b.cash_cost||0)?0:1;if(af!==bf)return af-bf;/* affordable first */return (a.cash_cost||0)-(b.cash_cost||0);/* cheaper first */});
 _batch=_batch.concat(inTheme.slice(0,PER_THEME));}
this._sortedLifestyle=_batch;
// Remember what we just showed (front = most recent) so next quarter rotates to different options; cap so older ones become eligible again.
this.state._life_recent=_batch.map(a=>a.id).concat(recent.filter(id=>!_batch.some(a=>a.id===id))).slice(0,2*PER_THEME*_themes.length);
let listHtml='',curSub='';
this._sortedLifestyle.forEach(a=>{
const theme=this.LIFE_THEME[a.subcategory]||'Luxury';
if(theme!==curSub){curSub=theme;listHtml+='<div style="padding:10px 0 6px;font-size:0.75rem;color:var(--gold);text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid var(--border);margin-top:8px;">'+this.LIFE_ICON[theme]+' '+theme+' <span style="color:var(--text2);text-transform:none;letter-spacing:0;">— '+(themeVal[theme]||0)+'/100</span></div>';}
// Check the pocket that actually PAYS for it: personal cash for personal treats (vacations, jets, estates), business cash for business-funded ones (exec health, team retreats). A separated founder with a fat personal account shouldn't see luxuries locked just because business cash is deployed.
const _pocket=(this.isSeparated()&&this.lifeActionIsPersonal(a))?(s.personal_cash||0):(s.cash||0);
const afford=_pocket>=(a.cash_cost||0),active=a.recurring_cost&&this.state._active_lifestyle_costs&&this.state._active_lifestyle_costs[a.id];
const outgrown=afford&&(a.cash_cost||0)<3000&&(themeVal[this.LIFE_THEME[a.subcategory]||'Luxury']||0)>60;
const lrc=(this.state._action_counts||{})[a.id]||0,lRepeat=lrc>0?'<span class="repeat-badge">×'+lrc+'</span>':'';
const tier=(a.cash_cost||0)>=8000?'Premium':(a.cash_cost||0)>=3000?'Standard':'Basic';
const tierColor=tier==='Premium'?'var(--gold)':tier==='Standard'?'var(--blue)':'var(--text2)';
const egain=(a.effects&&a.effects.energy>0)?a.effects.energy:(a.energy_cost<0?-a.energy_cost:0);// energy this life action actually restores (effects.energy is what's applied)
listHtml+='<div class="action-card '+(afford?'':'locked')+' fade-in" style="'+(outgrown?'opacity:0.6;':'')+'" onclick="'+(afford?"Game.selectLifestyle('"+a.id+"')":'')+'"><h4>'+a.label+lRepeat+(active?' <span style="color:var(--accent);font-size:0.75rem;">(active)</span>':'')+' <span style="font-size:0.65rem;color:'+tierColor+'">'+tier+'</span></h4><p>'+a.description+'</p>'+this.lifeActionPreview(a)+'<div class="action-costs">'+(a.cash_cost?'<span class="cost-tag cost-cash">$'+this.fmt(a.cash_cost)+'</span>':'')+'<span class="cost-tag" style="background:rgba(127,127,127,0.12);color:var(--text2);font-size:0.62rem;" title="which pocket pays for this">'+(this.lifeActionIsPersonal(a)?'👤 Personal':'🏢 Business')+'</span>'+(a.recurring_cost&&!active?'<span class="cost-tag cost-recurring">$'+a.recurring_cost+'/mo ongoing</span>':'')+(outgrown?'<span class="cost-tag" style="background:rgba(156,163,180,0.1);color:var(--text2);font-size:0.65rem;">lower impact</span>':'')+(egain>0?'<span class="cost-tag cost-energy-gain" style="margin-left:auto;">⚡ +'+egain+' energy</span>':'')+'</div></div>';});
document.getElementById('lifestyle-list').innerHTML=listHtml;
document.getElementById('lifestyle-btn').disabled=true;},

selectLifestyle(id){const list=this._sortedLifestyle||CONFIG.lifestyle_options.actions;this.selectedLifestyle=list.find(a=>a.id===id);document.querySelectorAll('#lifestyle-list .action-card').forEach(c=>c.classList.remove('selected'));const idx=list.findIndex(a=>a.id===id),cards=document.querySelectorAll('#lifestyle-list .action-card');if(cards[idx])cards[idx].classList.add('selected');document.getElementById('lifestyle-btn').disabled=false;document.getElementById('lifestyle-btn').textContent='Take Life Action';},

confirmLifestyle(){if(!this.selectedLifestyle)return;const a=this.selectedLifestyle;const _dB=this.lifeDims(),_mB=this.calcPersonalMastery(),_enB=Math.round(this.state.energy);this.payCost(a.cash_cost||0,this.lifeActionIsPersonal(a));this.applyEffects(this._scaleLifestyleEffects(a.effects));if(a.recurring_cost&&!this.state._active_lifestyle_costs[a.id]){this.state._active_lifestyle_costs[a.id]=a.recurring_cost;this.state.lifestyle_expenses=(this.state.lifestyle_expenses||0)+a.recurring_cost;}
const buffs={mentor_others:{delay:3,effects:{leads:5,brand_equity:5,monthly_revenue:500},narrative:"Your mentee referred a client to you. 'You helped me — let me return the favor,' she said."},volunteer_time:{delay:2,effects:{brand_equity:8,leads:3},narrative:"Someone from the volunteer site reached out — they need exactly what you offer. 'I liked how you showed up that Saturday.'"},faith_community:{delay:4,effects:{leads:4,brand_equity:3,lifestyle_relationships:5},narrative:"A fellow member mentioned your business to their network. Three warm introductions this week."},family_trip:{delay:1,effects:{energy:10,lifestyle_relationships:5},narrative:"You came back recharged. Your partner said you seem lighter. The clarity is showing up in your work."},therapy_coaching:{delay:2,effects:{energy:8,lifestyle_health:3},narrative:"The patterns your therapist helped you see — you're catching them in real time now."},learn_new_skill:{delay:3,effects:{brand_equity:5,leads:3},narrative:"The class led to an unexpected connection — your instructor runs a business and just became a client."},charity_donation:{delay:2,effects:{brand_equity:8},narrative:"The charity featured your business in their donor spotlight newsletter. 2,000 people saw it."}};
if(buffs[a.id]){const b=buffs[a.id];if(!this.state._lifestyle_buffs)this.state._lifestyle_buffs=[];this.state._lifestyle_buffs.push({trigger_month:this.month+b.delay,effects:b.effects,narrative:b.narrative,source:a.label});}
if(!this.state._action_counts)this.state._action_counts={};this.state._action_counts[a.id]=(this.state._action_counts[a.id]||0)+1;
this.lifestyleHistory.push(a);
const _impact=this._masteryPanel(_dB,_mB,_enB);
this.showScreen('result-screen');document.getElementById('result-month-label').textContent='Lifestyle — '+a.subcategory;document.getElementById('results-content').innerHTML='<div class="result-narrative fade-in"><strong>'+a.label+'</strong><br><br>'+a.narrative+'</div>'+_impact;this.selectedLifestyle=null;},

skipLifestyle(){this.state.lifestyle_health=Math.max(0,(this.state.lifestyle_health||0)-2);this.state.lifestyle_relationships=Math.max(0,(this.state.lifestyle_relationships||0)-2);this.state.energy=Math.max(0,this.state.energy-3);this.showScreen('result-screen');document.getElementById('result-month-label').textContent='Quarterly Check-In — Skipped';document.getElementById('results-content').innerHTML='<div class="result-narrative fade-in">You skipped the life check-in this quarter. The business needed every dollar and every hour. But the people in your life noticed your absence — and so did your body.<br><br><div class="effect-list"><div class="effect-item"><span>Health</span><span style="color:var(--red)">-2</span></div><div class="effect-item"><span>Relationships</span><span style="color:var(--red)">-2</span></div><div class="effect-item"><span>Energy</span><span style="color:var(--red)">-3</span></div></div></div>';},

buildDebrief(){const s=this.state,c=id=>s._completed_actions&&s._completed_actions.includes(id),seen=id=>s._actions_seen&&s._actions_seen.includes(id),sa=ids=>ids.some(seen);
const items=[
{done:c('form_llc')||['llc','s_corp','c_corp','multi_entity'].includes(s.entity_structure),ids:['form_llc'],name:'Legal Protection',got:'You shielded your personal assets behind an LLC.',miss:'You saw the LLC option but never formed one — one lawsuit could reach everything you own.'},
{done:c('build_personal_credit_optimize')||c('build_personal_credit_repair'),ids:['build_personal_credit_optimize','build_personal_credit_repair'],name:'Credit Building',got:'You built your credit into an asset that unlocks cheap capital.',miss:'Credit-building was on the menu but you skipped it — the key that unlocks all good debt.'},
{done:c('payroll_setup'),ids:['payroll_setup'],name:'Pay Yourself Properly',got:'You put yourself on real payroll — clean books and S-Corp ready.',miss:'Owner payroll was available — skipping it left tax savings and lender credibility behind.'},
{done:c('s_corp_election'),ids:['s_corp_election'],name:'Tax-Smart Structure',got:'You elected S-Corp and legally cut your self-employment tax.',miss:'The S-Corp election was on the table — a tax lever employees never get.'},
{done:c('fund_accumulation_policy'),ids:['fund_accumulation_policy'],name:'The Tax-Free Money Engine',got:'You opened a cash-value policy — your tax-advantaged wealth engine.',miss:'You could have opened a cash-value policy — the tax-free passive income engine, untouched.'},
{done:(s.insurance_passive_loan_total||0)>0||!!s._passive_income_active,ids:['fund_accumulation_policy','activate_passive_income'],name:'Tax-Free Passive Income',got:'Your policy throws off tax-free passive income — money without work.',miss:'You started down the policy path but never reached passive tax-free income.'},
{done:c('buy_real_estate')||(s.real_estate_owned||0)>0,ids:['buy_real_estate'],name:'Leverage Into Assets',got:"You used the bank's money to control income-producing property.",miss:'Real estate was available — you never used leverage to acquire a cash-flowing asset.'},
{done:c('private_lending'),ids:['private_lending'],name:'Become the Bank',got:"You lent capital for returns — money working while you don't.",miss:'Private lending was on the menu — you never put your capital to work as a lender.'},
{done:c('asset_protection')||c('multi_entity')||(s.trust_structure&&s.trust_structure!=='none'),ids:['asset_protection','multi_entity'],name:'Asset Protection',got:"You walled off your wealth so a lawsuit can't reach it.",miss:'Asset protection was available — your wealth sat exposed without it.'},
{done:c('build_offer'),ids:['build_offer'],name:'Irresistible Offer',got:'You packaged a premium offer that sells itself.',miss:'Refining your offer was available — the fastest lever on revenue, left unpulled.'},
{done:c('full_systemization')||(s.key_person_dependency!=null&&s.key_person_dependency<30),ids:['full_systemization'],name:'Systems = Freedom',got:'You built a business that runs without you — real freedom.',miss:'Full systemization was within reach — the business still leans on you.'},
{done:c('build_dnb_profile')||s.business_credit_profile==='established',ids:['build_dnb_profile'],name:'Business Creditworthiness',got:'You built the company its own credit identity — it borrows on its name, not yours.',miss:'A D&B business-credit profile was available — without it, the business still leans on your personal guarantee.'},
{done:c('hire_general_counsel'),ids:['hire_general_counsel'],name:'Legal Counsel',got:'You put a lawyer between you and the lawsuits before they happened.',miss:'General counsel was on the menu — one ugly dispute can cost far more than the retainer would have.'},
{done:c('grant_stock_incentives')||(s.company_culture||0)>=65,ids:['grant_stock_incentives','build_benefits_package','company_retreat'],name:'Culture & Ownership',got:'You built a culture people stay for — benefits, retreats, and real equity that turns employees into owners.',miss:'Culture-building (benefits, retreats, equity) was available — neglect it and the people problems compound.'}];
const learned=items.filter(i=>i.done),missed=items.filter(i=>!i.done&&sa(i.ids));
let h='<div class="epilogue-box" style="text-align:left;margin-top:16px;"><div style="font-size:1.1rem;font-weight:700;color:var(--gold);margin-bottom:4px;">What You Learned</div><div style="color:var(--text2);font-size:0.85rem;margin-bottom:10px;">You put '+learned.length+' core wealth principles into practice'+(missed.length?', and left '+missed.length+' on the table.':'.')+'</div>';
if(learned.length){h+='<div style="color:var(--text2);font-size:0.72rem;text-transform:uppercase;letter-spacing:1px;margin:10px 0 6px;">Put Into Practice</div>';for(const i of learned)h+='<div style="margin-bottom:7px;font-size:0.9rem;"><span style="color:var(--accent);font-weight:600;">&#10003; '+i.name+'</span> — '+i.got+'</div>';}
if(missed.length){h+='<div style="color:var(--text2);font-size:0.72rem;text-transform:uppercase;letter-spacing:1px;margin:14px 0 6px;">Left On The Table <span style="text-transform:none;opacity:0.7;">(you saw these but didn\'t take them)</span></div>';for(const i of missed)h+='<div style="margin-bottom:7px;font-size:0.9rem;opacity:0.9;"><span style="color:var(--gold);font-weight:600;">&#9675; '+i.name+'</span> — '+i.miss+'</div>';}
const haveM={};(s._milestones_achieved||[]).forEach(m=>haveM[m.id]=1);const gotM=MILESTONES.filter(m=>haveM[m.id]),missM=MILESTONES.filter(m=>!haveM[m.id]);
h+='<div style="color:var(--text2);font-size:0.72rem;text-transform:uppercase;letter-spacing:1px;margin:14px 0 6px;border-top:1px solid var(--border);padding-top:10px;">🏆 Milestones — '+gotM.length+'/'+MILESTONES.length+' unlocked</div>';
if(gotM.length)h+='<div style="font-size:0.85rem;line-height:1.7;">'+gotM.map(m=>'<span style="color:var(--accent);">&#127942; '+m.title+'</span>').join(' &nbsp;·&nbsp; ')+'</div>';
if(missM.length)h+='<div style="font-size:0.8rem;line-height:1.7;margin-top:6px;opacity:0.7;"><span style="color:var(--gold);">Still on the table:</span> '+missM.map(m=>m.title).join(' &nbsp;·&nbsp; ')+'</div>';
h+='</div>';return h;},
endGame(){
this.clearAutoSave();// the run is over — don't offer to resume it
this.showScreen('end-screen');const scores=this.calculateFinalScores(),arch=this.determineArchetype(scores),composite=this.calcComposite(scores);
document.getElementById('end-title').textContent=arch.title;document.getElementById('end-subtitle').textContent=arch.subtitle;
this.drawRadarOn(document.getElementById('radar-canvas'),scores);
document.getElementById('score-breakdown').innerHTML='<div class="stat-card wide"><div class="stat-value" style="color:var(--gold);font-size:1.5rem;">'+composite+' <span style="font-size:0.8rem;color:var(--text2)">/ 600</span></div><div class="stat-label">Composite Score</div></div>'+this._renderScoreCards(scores);
document.getElementById('epilogue').textContent=arch.epilogue;
{const _ex=document.getElementById('end-extra');if(_ex)_ex.remove();}document.getElementById('epilogue').insertAdjacentHTML('afterend','<div id="end-extra">'+this.buildLifeShowcase()+this.buildTrapPanel(this.state._traps_hit)+this.buildScamPanel()+this.buildDebrief()+this.buildChoiceLog(this._playLog)+this.buildStatsDump(this._statSnapshot())+'</div>');
// New Game+ is a sandbox run — not ranked on the leaderboard (custom starting hand would skew it).
document.getElementById('end-save').innerHTML=(this.state&&this.state._ngplus)?'<div style="text-align:center;color:var(--gold);font-size:0.84rem;font-weight:600;padding:6px 0;">🔁 New Game+ — sandbox run (not ranked on the leaderboard).</div>':'<input id="player-name" class="name-input" placeholder="Enter your name for the leaderboard" maxlength="20"><button class="btn-primary" onclick="Game.saveToLeaderboard()">Save to Leaderboard</button>';
// Ended early (before month 36)? You can pick the run back up where you left off.
if(this.month<36)document.getElementById('end-save').insertAdjacentHTML('beforebegin','<button class="btn-outline" onclick="Game.resumeFromEnd()" style="margin-bottom:10px;">↩ Resume — Keep Building (Year '+Math.ceil(this.month/12)+'+)</button>');},
resumeFromEnd(){this._lost=false;this.month++;if(this.month>36){this.month=36;}this.renderMonth();},

// ---- Save / resume of in-progress runs (persisted across page refreshes) ----
_archLabel(id){const p=CONFIG.starting_positions.positions.find(x=>x.id===id);return p?p.label:id;},
loadSaves(){try{return JSON.parse(localStorage.getItem('ep_saves')||'[]');}catch(e){return [];}},
// A save taken AT a year checkpoint is a post-tax, end-of-year state but this.month is still 12/24 — record the NEXT month so resuming starts fresh on month 13/25 instead of replaying the year-end month (and re-running the tax). Leaderboard posts use this.month directly, so they still read as a 12/24-month run.
_snapshot(){return {v:1,gv:(PATCH_NOTES[0]||{}).v,archetype:this.archetype.id,month:this.month+(this._atCheckpoint?1:0),state:this.state,actionHistory:this.actionHistory,eventHistory:this.eventHistory,lifestyleHistory:this.lifestyleHistory,playLog:this._playLog||[]};},
// Current game version + a semver "older-than" check, so the title screen can flag a save written by an earlier build.
_curVersion(){return (PATCH_NOTES[0]||{}).v||'';},
_verLt(a,b){if(!a)return true;/* no recorded version = pre-versioning save = older */const pa=String(a).split('.').map(Number),pb=String(b).split('.').map(Number);for(let i=0;i<3;i++){const x=pa[i]||0,y=pb[i]||0;if(x!==y)return x<y;}return false;},
_saveVerNote(gv){const cur=this._curVersion();if(!cur||!this._verLt(gv,cur))return '';return '<div style="font-size:0.68rem;color:var(--gold);background:rgba(212,175,55,0.1);border:1px solid var(--gold);border-radius:var(--radius-sm);padding:6px 9px;margin-bottom:9px;line-height:1.45;">⚠ This save is from an <strong>older version</strong>'+(gv?' (v'+gv+')':'')+'. Update it to <strong>v'+cur+'</strong> to apply the latest mechanics and balance — your progress is kept.</div>';},
// Migrate a save snapshot to the current build: fill in fields newer mechanics expect (only when missing — never overwrite progress) and stamp the version. Most patches "retro-activate" on their own because the engine computes from state each tick; this makes the state shape current and clears the older-version flag.
_saveDefaults(){return {_asset_units:0,_asset_income:0,_keyman_units:0,_keyman_premium:0,_keyman_claims_total:0,_holding_company:false,_naics_ok:false,_rehire:{},_epic_savings_total:0,company_culture:45,credit_inquiries:0};},
_migrateSave(snap){if(!snap)return snap;if(snap.state){const d=this._saveDefaults();for(const k in d){if(snap.state[k]===undefined)snap.state[k]=d[k];}}snap.gv=this._curVersion();return snap;},
// Patch notes for every version newer than the save — the "what changed" the update applies.
_patchNotesSince(gv){const items=PATCH_NOTES.filter(p=>this._verLt(gv,p.v));if(!items.length)return '<div style="color:var(--text2);font-size:0.8rem;">Your save is already current.</div>';return items.map(p=>'<div style="margin-bottom:10px;"><div style="font-weight:700;color:var(--gold);font-size:0.82rem;">v'+p.v+'</div><ul style="margin:4px 0 0;padding-left:18px;font-size:0.74rem;color:var(--text2);line-height:1.5;">'+p.n.map(n=>'<li style="margin-bottom:3px;">'+n+'</li>').join('')+'</ul></div>').join('');},
// Title-screen update flow: preview what's new since the save, then apply on confirm.
showSaveUpdate(){const s=this.loadAutoSave();if(!s)return;const cur=this._curVersion();const body='<div style="font-size:0.82rem;line-height:1.5;margin-bottom:10px;">Bring your in-progress game (<strong>v'+(s.gv||'pre-release')+'</strong>) up to <strong>v'+cur+'</strong>. <strong>Your progress is kept</strong> — the latest mechanics and balance simply start applying. Everything added since your save:</div><div style="max-height:42vh;overflow:auto;border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px 12px;background:var(--surface);">'+this._patchNotesSince(s.gv)+'</div><button class="btn-primary" style="margin-top:12px;background:linear-gradient(135deg,var(--gold),#b8932f);color:#1a1205;" onclick="Game.applySaveUpdate()">⬆ Update my save to v'+cur+'</button>';this.showPopup('⬆ Update Your Saved Game',body);},
applySaveUpdate(){let s=this.loadAutoSave();if(!s){this.hidePopup();return;}const from=s.gv||'pre-release';s=this._migrateSave(s);try{localStorage.setItem('ep_autosave',JSON.stringify(s));}catch(e){}this.hidePopup();if(this.renderSaves)this.renderSaves();const cur=this._curVersion();setTimeout(()=>this.showPopup('✓ Save Updated','<div style="line-height:1.6;font-size:0.9rem;">Updated from <strong>v'+from+'</strong> to <strong>v'+cur+'</strong>. The latest mechanics and balance apply from here — tap <strong>Continue</strong> to keep playing.</div>'),150);},
_loadSnapshot(s){s=this._migrateSave(s);/* resuming any save brings it current */this.archetype=CONFIG.starting_positions.positions.find(p=>p.id===s.archetype)||this.archetype;this.state=s.state;this.month=s.month;this.actionHistory=s.actionHistory||[];this.eventHistory=s.eventHistory||[];this.lifestyleHistory=s.lifestyleHistory||[];this._playLog=s.playLog||[];this.monthlySnapshots=[];this.selectedActions={};this._pendingTax=false;this._pendingEvent=null;this._lost=false;this._deferRestructure=null;this._atCheckpoint=false;},
// Autosave: silently persist the current run after each month so an accidental refresh never loses progress. Separate from named manual saves.
autoSave(){if(!this.archetype||!this.state||this._lost)return;try{const snap=this._snapshot();snap.savedAt=new Date().toISOString().split('T')[0];localStorage.setItem('ep_autosave',JSON.stringify(snap));}catch(e){}},
clearAutoSave(){try{localStorage.removeItem('ep_autosave');}catch(e){}},
loadAutoSave(){try{return JSON.parse(localStorage.getItem('ep_autosave')||'null');}catch(e){return null;}},
resumeAuto(){const s=this.loadAutoSave();if(!s)return;this._loadSnapshot(s);this.showScreen('game-screen');this.renderMonth();},
// Yes/No guard before resuming the in-progress game.
confirmResumeAuto(){const s=this.loadAutoSave();if(!s)return;this._confirm('↩ Resume your game?','Pick up <strong>'+this._archLabel(s.archetype)+'</strong> at <strong>Month '+s.month+' of 36</strong>?','Resume',()=>this.resumeAuto());},
discardAuto(){this.clearAutoSave();this.renderSaves();},
saveProgress(){const el=document.getElementById('cp-save-name');const name=((el&&el.value)||'').trim()||'Anonymous';
let saves=this.loadSaves();const snap=this._snapshot();snap.name=name;snap.savedAt=new Date().toISOString().split('T')[0];snap.composite=this.calcComposite(this.calculateFinalScores());
saves=saves.filter(s=>!(s.name===name&&s.archetype===snap.archetype));saves.push(snap);
try{localStorage.setItem('ep_saves',JSON.stringify(saves));}catch(e){if(el&&el.parentElement)el.parentElement.innerHTML='<div style="text-align:center;color:var(--red);font-size:0.8rem;">Could not save — browser storage is full.</div>';return;}
if(el&&el.parentElement)el.parentElement.innerHTML='<div style="text-align:center;color:var(--accent);font-weight:600;margin:8px 0;font-size:0.84rem;">✓ Saved as “'+name+'”. Refresh anytime — resume it from the title screen or the leaderboard.</div>';},
resumeSave(i){const s=this.loadSaves()[i];if(!s)return;this._loadSnapshot(s);this.showScreen('game-screen');this.renderMonth();},
deleteSave(i){let saves=this.loadSaves();saves.splice(i,1);localStorage.setItem('ep_saves',JSON.stringify(saves));this.renderSaves();const lr=document.getElementById('lb-resume');if(lr)lr.innerHTML=this._savesHtml();},
_savesHtml(){const saves=this.loadSaves();if(!saves.length)return '';
return '<div style="max-width:420px;margin:0 auto 16px;text-align:left;"><div style="font-size:0.8rem;font-weight:700;color:var(--accent);margin-bottom:6px;">▶ Continue a Saved Run</div>'+saves.map((s,i)=>'<div style="display:flex;align-items:center;gap:8px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px 12px;margin-bottom:6px;"><div style="flex:1;min-width:0;cursor:pointer;" onclick="Game.resumeSave('+i+')"><div style="font-weight:700;font-size:0.86rem;">'+s.name+'</div><div style="font-size:0.7rem;color:var(--text2);">'+this._archLabel(s.archetype)+' · Month '+s.month+' · saved '+s.savedAt+(s.composite!=null?' · '+s.composite+' pts':'')+(this._verLt(s.gv,this._curVersion())?' · <span style="color:var(--gold);">⚠ older version</span>':'')+'</div></div><button class="btn-secondary" style="width:auto;margin:0;padding:6px 12px;font-size:0.76rem;" onclick="Game.resumeSave('+i+')">Resume</button><button title="Delete save" onclick="Game.deleteSave('+i+')" style="background:none;border:none;color:var(--text2);font-size:1rem;cursor:pointer;padding:0 4px;">✕</button></div>').join('')+'</div>';},
_autoSaveHtml(){const s=this.loadAutoSave();if(!s||s.month>36)return '';return '<div style="max-width:420px;margin:0 auto 14px;text-align:left;"><div style="background:rgba(16,185,129,0.1);border:1px solid var(--accent);border-radius:var(--radius-sm);padding:12px 14px;"><div style="font-size:0.86rem;font-weight:700;color:var(--accent);margin-bottom:2px;">↩ Continue your game</div><div style="font-size:0.72rem;color:var(--text2);margin-bottom:9px;">'+this._archLabel(s.archetype)+' · Month '+s.month+' of 36 · autosaved '+(s.savedAt||'')+'</div>'+this._saveVerNote(s.gv)+(this._verLt(s.gv,this._curVersion())?'<button class="btn-primary" style="margin:0 0 8px;width:100%;background:linear-gradient(135deg,var(--gold),#b8932f);color:#1a1205;font-weight:700;" onclick="Game.showSaveUpdate()">⬆ Update Save to v'+this._curVersion()+'</button>':'')+'<div style="display:flex;gap:8px;"><button class="btn-primary" style="margin:0;flex:1;" onclick="Game.confirmResumeAuto()">Continue →</button><button class="btn-secondary" style="margin:0;width:auto;padding:10px 12px;" onclick="if(confirm(\'Discard your in-progress game and start fresh?\'))Game.discardAuto();">Discard</button></div></div></div>';},
// Load Game view (back button + autosave card + named saves), refreshed after save/delete.
renderSaves(){const el=document.getElementById('resume-list');if(!el)return;const empty=!this.loadAutoSave()&&!this.loadSaves().length;el.innerHTML='<div class="page-head"><button class="back-chip" onclick="Game.showMainMenu()">← Back</button><span class="page-title accent">Continue / Load Game</span></div>'+this._autoSaveHtml()+this._savesHtml()+(empty?'<div style="text-align:center;color:var(--text2);font-size:0.82rem;padding:24px 0;">No saved games yet — start a New Game.</div>':'');},
// ---- Full action history (how the run was actually played) ----
buildChoiceLog(log){if(!log||!log.length)return '';const cc={marketing:'var(--accent)',operations:'var(--blue)',finance:'var(--gold)',lifestyle:'var(--purple)'};
const byMonth={};log.forEach(e=>{(byMonth[e.m]=byMonth[e.m]||[]).push(e);});
let rows='';Object.keys(byMonth).sort((a,b)=>(+a)-(+b)).forEach(m=>{const items=byMonth[m].map(e=>'<span style="color:'+(cc[e.c]||'var(--text2)')+';">'+e.l+(e.s===false?' ⚠':'')+'</span>').join('<span style="color:var(--text2);"> · </span>');rows+='<div style="display:flex;gap:8px;font-size:0.74rem;padding:4px 0;border-bottom:1px solid rgba(127,127,127,0.12);"><span style="color:var(--text2);width:36px;flex-shrink:0;">M'+m+'</span><span style="flex:1;min-width:0;">'+items+'</span></div>';});
return '<div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px 14px;margin-top:14px;text-align:left;"><div style="font-size:0.82rem;font-weight:700;color:var(--gold);margin-bottom:5px;">Your Choices — Full History</div><div style="font-size:0.62rem;color:var(--text2);margin-bottom:8px;"><span style="color:var(--accent);">●</span> Marketing&nbsp; <span style="color:var(--blue);">●</span> Operations&nbsp; <span style="color:var(--gold);">●</span> Finance&nbsp; <span style="color:var(--purple);">●</span> Life&nbsp; · ⚠ partial</div>'+rows+'</div>';},
// Badges of honor — earned from Personal Mastery + the dimensions and marquee luxuries of the life you built.
calcBadges(){const d=this.lifeDims(),m=this.calcPersonalMastery(),c=id=>(this.lifestyleHistory||[]).some(a=>a&&a.id===id),b=[];
if(m>=80)b.push({i:'🏆',n:'Renaissance Founder'});else if(m>=60)b.push({i:'⭐',n:'Well-Rounded Life'});
// Found and survived every trap in the game — the leaderboard flex.
{const hit=this.state._traps_hit||[];if(TRAPS.every(t=>hit.includes(t)))b.push({i:'🪤',n:'Trap Survivor'});}
// Lifetime scam-survival tier (3/6/9) — also a leaderboard flex.
{const st=this._scamTierBadge(this._scamsSurvivedLifetime());if(st)b.push(st);}
if(d.Body>=80)b.push({i:'💪',n:'Peak Health'});if(d.Mind>=80)b.push({i:'🧠',n:'Sage'});if(d.Spirit>=80)b.push({i:'🕊️',n:'Centered'});if(d.Heart>=80)b.push({i:'❤️',n:'Devoted'});if(d.Luxury>=80)b.push({i:'✨',n:'Lives Large'});
if(c('private_jet'))b.push({i:'🛩️',n:'Flies Private'});if(c('superyacht_charter'))b.push({i:'🛥️',n:'Superyacht Life'});if(c('dream_car'))b.push({i:'🏎️',n:'Dream Car'});if(c('dream_home')||c('private_estate'))b.push({i:'🏡',n:'Dream Home'});
return b;},
buildLifeShowcase(){const d=this.lifeDims(),m=this.calcPersonalMastery(),badges=this.calcBadges();
const bar=k=>{const v=d[k],col=v>60?'var(--accent)':v>30?'var(--gold)':'var(--red)';return '<div style="margin:5px 0;"><div style="display:flex;justify-content:space-between;font-size:0.76rem;"><span>'+this.LIFE_ICON[k]+' '+k+'</span><span style="font-weight:700;color:'+col+';">'+v+'</span></div><div class="bar-track" style="height:5px;"><div class="bar-fill" style="width:'+v+'%;background:'+col+'"></div></div></div>';};
const seen={},marquee=[];(this.lifestyleHistory||[]).forEach(a=>{if(!a||seen[a.id])return;seen[a.id]=1;if((a.cash_cost||0)>=5000||a.one_time)marquee.push(a.label);});
let h='<div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px;margin-top:14px;text-align:left;"><div style="font-size:0.9rem;font-weight:700;color:var(--gold);">🌴 The Life You Built</div><div style="font-size:0.72rem;color:var(--text2);margin:2px 0 8px;">Personal Mastery '+m+'/100</div>';
h+=['Body','Mind','Spirit','Heart','Luxury'].map(bar).join('');
if(badges.length)h+='<div style="margin-top:10px;">'+badges.map(b=>'<span title="'+b.n+'" style="display:inline-block;background:rgba(212,175,55,0.12);border:1px solid var(--gold);border-radius:999px;padding:3px 9px;margin:3px 4px 0 0;font-size:0.72rem;color:var(--gold);">'+b.i+' '+b.n+'</span>').join('')+'</div>';
if(marquee.length)h+='<div style="margin-top:8px;font-size:0.72rem;color:var(--text2);">Flexes: '+marquee.join(' · ')+'</div>';
return h+'</div>';},
// Trap achievements — the traps you found and lived through. Undiscovered ones stay hidden (🔒) so finding them is part of the game. All of them = the "Trap Survivor" flex.
buildTrapPanel(hit){hit=hit||[];const total=TRAPS.length,got=TRAPS.filter(t=>hit.includes(t)).length,all=got===total;
const rows=TRAPS.map(t=>{const m=TRAP_META[t]||{i:'🪤',n:'Trap'},done=hit.includes(t);return '<div style="display:flex;align-items:center;gap:9px;padding:5px 0;border-bottom:1px solid rgba(127,127,127,0.1);opacity:'+(done?'1':'0.5')+';"><span style="font-size:1rem;width:20px;text-align:center;">'+(done?m.i:'🔒')+'</span><span style="flex:1;font-size:0.8rem;'+(done?'':'color:var(--text2);')+'">'+(done?m.n:'Undiscovered trap')+'</span><span style="font-size:0.74rem;font-weight:700;color:'+(done?'var(--accent)':'var(--text2)')+';">'+(done?'✓ Survived':'—')+'</span></div>';}).join('');
return '<div style="background:var(--surface);border:1px solid '+(all?'var(--gold)':'var(--border)')+';border-radius:var(--radius-sm);padding:14px;margin-top:14px;text-align:left;"><div style="display:flex;justify-content:space-between;align-items:center;"><span style="font-size:0.9rem;font-weight:700;color:'+(all?'var(--gold)':'var(--text)')+';">🪤 Traps Survived</span><span style="font-size:0.82rem;font-weight:700;color:'+(all?'var(--gold)':'var(--text2)')+';">'+got+' / '+total+'</span></div><div style="font-size:0.7rem;color:var(--text2);margin:2px 0 8px;">Tempting moves that always backfire. Take one and live to tell the tale to log it.</div>'+rows+(all?'<div style="margin-top:10px;text-align:center;background:linear-gradient(135deg,rgba(212,175,55,0.18),rgba(59,130,246,0.1));border:1px solid var(--gold);border-radius:var(--radius-sm);padding:9px;font-size:0.8rem;font-weight:700;color:var(--gold);">🏆 Trap Survivor — you found and survived every trap. Flex earned for the leaderboard.</div>':'')+'</div>';},
// Snapshot of EVERY tracked scalar in the run (plus key derived values) — stored on the leaderboard so anyone can inspect the full picture.
_statSnapshot(){const s=this.state,out={};for(const k in s){const v=s[k];if(typeof v==='number'||typeof v==='string'||typeof v==='boolean')out[k]=v;}
out.personal_mastery=this.calcPersonalMastery();out.freedom=this.calcFreedom();out.dnb_score=this.calcBizCreditScore();out.biz_utilization=this.calcBizUtil();out.pers_utilization=this.calcPersUtil();out.founder_role=this.getFounderRole();out.actions_completed=(s._completed_actions||[]).length;out.milestones_hit=(s._milestones_achieved||[]).length;
return out;},
buildStatsDump(snap){if(!snap)return '';const MONEYK={cash:1,personal_cash:1,monthly_revenue:1,other_monthly_revenue:1,operating_expenses:1,cogs:1,owner_pay:1,living_expenses:1,lifestyle_expenses:1,total_debt:1,_installment_debt:1,business_installment_debt:1,real_estate_debt:1,available_credit:1,business_credit_limit:1,business_credit_used:1,insurance_cash_value:1,insurance_loan_balance:1,insurance_passive_loan_total:1,investment_positions:1,real_estate_equity:1,private_bank_balance:1,private_bank_loan:1,tax_reserve:1,capital_account:1,personal_guarantee_exposure:1,_owner_draws_total:1,personal_tax_ytd:1,_ytd_taxable_income:1};
const fmtV=(k,v)=>{if(typeof v==='boolean')return v?'<span style="color:var(--accent)">✓</span>':'<span style="color:var(--text2)">—</span>';if(typeof v==='string')return this.formatStatName(v);if(MONEYK[k])return this.fmtMoney(Math.round(v));if(k==='churn_rate'||k==='tax_rate')return (Math.round(v*1000)/10)+'%';if(/utilization/.test(k))return Math.round(v)+'%';return (Math.round(v*100)/100);};
const shown={},row=k=>{if(!(k in snap))return '';shown[k]=1;return '<div style="display:flex;justify-content:space-between;gap:8px;font-size:0.71rem;padding:2px 0;border-bottom:1px solid rgba(127,127,127,0.08);"><span style="color:var(--text2);">'+this.formatStatName(k.replace(/^_/,''))+'</span><span style="text-align:right;white-space:nowrap;">'+fmtV(k,snap[k])+'</span></div>';};
const groups=[['📊 Scores',['personal_mastery','freedom','dnb_score','biz_utilization','pers_utilization','actions_completed','milestones_hit','founder_role']],['💵 Money & Assets',['cash','personal_cash','available_credit','business_credit_limit','business_credit_used','total_debt','insurance_cash_value','investment_positions','real_estate_equity','real_estate_owned','real_estate_debt','private_bank_balance','private_bank_loan','tax_reserve','capital_account']],['📈 Income & Expenses',['monthly_revenue','other_monthly_revenue','owner_pay','operating_expenses','cogs','living_expenses','lifestyle_expenses','dscr']],['🏢 Business',['customer_base','leads','team_size','brand_equity','systems_maturity','key_person_dependency','sales_conversion','churn_rate','revenue_capacity','company_culture','audit_risk','litigation_exposure','partner_conflict_risk']],['🏦 Credit & Structure',['personal_credit_score','credit_negatives','business_credit_profile','_dnb_tradelines','entity_structure','trust_structure','tax_rate']],['🌴 Life & Energy',['energy','fitness_level','lifestyle_health','lifestyle_relationships','lifestyle_experiences','lifestyle_spiritual','lifestyle_philanthropy','lifestyle_legacy']],['👔 Team & Roles',['_cfo_hired','_cro_hired','_coo_hired','_ea_hired','_gc_hired','_board_active','_passive_income_active','_dnb_profile','_auto_fund_insurance','_family_office']]];
let body='';for(const[title,keys]of groups){const rows=keys.map(row).join('');if(rows)body+='<div style="font-size:0.68rem;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:0.5px;margin:10px 0 2px;">'+title+'</div>'+rows;}
const other=Object.keys(snap).filter(k=>!shown[k]&&!/^(_completed_actions|_actions_seen|_action_counts|_milestones_achieved)$/.test(k)).sort();
if(other.length)body+='<div style="font-size:0.68rem;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:0.5px;margin:10px 0 2px;">⚙ Other tracked values</div>'+other.map(row).join('');
return '<details style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px 14px;margin-top:14px;text-align:left;"><summary style="cursor:pointer;font-size:0.86rem;font-weight:700;color:var(--gold);">📋 All Tracked Stats <span style="color:var(--text2);font-weight:400;font-size:0.72rem;">(everything, including the hidden ones)</span></summary><div style="margin-top:8px;">'+body+'</div></details>';},
showRunDetail(i){const e=(this._lbFiltered||[])[i];if(!e)return;
// Win-title for the run (stored on newer entries; derived for older ones).
let _title=e.title,_sub=e.subtitle;if(!_title&&e.scores){try{const a=this.determineArchetype(e.scores);_title=a.title;_sub=a.subtitle;}catch(_){}}
let h=(e.company?'<div style="font-weight:700;color:var(--gold);font-size:0.98rem;margin-bottom:2px;">🏢 '+this._esc(e.company)+'</div>':'');
h+='<div style="font-size:0.76rem;color:var(--text2);margin-bottom:10px;">'+this._archLabel(e.archetype)+' · '+e.months+'-month run · '+e.date+'</div>';
// End-game score + win-title, front and centre, with the radar hexagon
h+='<div style="text-align:center;background:linear-gradient(135deg,rgba(212,175,55,0.14),rgba(59,130,246,0.08));border:1px solid var(--gold);border-radius:var(--radius-sm);padding:12px;margin-bottom:12px;">'+(_title?'<div style="font-size:0.95rem;font-weight:800;color:var(--gold);line-height:1.2;">'+this._esc(_title)+'</div>'+(_sub?'<div style="font-size:0.66rem;color:var(--text2);margin:2px 0 8px;">'+this._esc(_sub)+'</div>':'<div style="height:6px;"></div>'):'')+'<div style="font-size:1.7rem;font-weight:800;color:var(--gold);line-height:1;">'+e.composite+' <span style="font-size:0.8rem;color:var(--text2);font-weight:600;">/ 600</span></div><div style="font-size:0.62rem;color:var(--text2);text-transform:uppercase;letter-spacing:0.6px;margin-top:3px;">Composite Score</div>'+(e.mastery?'<div style="font-size:0.7rem;color:var(--text2);margin-top:4px;">Personal Mastery '+e.mastery+'/100</div>':'')+(e.scores?'<div style="margin-top:8px;"><canvas id="lb-radar" width="240" height="240" style="max-width:100%;"></canvas></div><div class="stats-grid" style="margin-top:6px;">'+this._renderScoreCards(e.scores)+'</div>':'')+'</div>';
const det=(title,inner)=>'<details style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px 14px;margin-bottom:10px;text-align:left;"><summary style="cursor:pointer;font-size:0.86rem;font-weight:700;color:var(--gold);">'+title+'</summary><div style="margin-top:8px;">'+inner+'</div></details>';
// Achievements — collapsed (badges + traps + scams)
let ach=(e.badges&&e.badges.length)?'<div style="margin-bottom:4px;">'+e.badges.map(b=>'<span style="display:inline-block;background:rgba(212,175,55,0.12);border:1px solid var(--gold);border-radius:999px;padding:3px 9px;margin:2px 4px 2px 0;font-size:0.72rem;color:var(--gold);">'+b.i+' '+b.n+'</span>').join('')+'</div>':'';
if(e.traps&&e.traps.length)ach+=this.buildTrapPanel(e.traps);
if(e.scams!=null)ach+=this.buildScamPanel(e.scams,e.scamsRun||0);
if(ach)h+=det('🏅 Achievements',ach);
// Choice history — collapsed
const log=this.buildChoiceLog(e.playLog||[]);
h+=log?det('📜 Choice History',log):'<div style="color:var(--text2);font-size:0.8rem;margin-bottom:8px;">No action history was recorded for this run.</div>';
if(e.stats)h+=this.buildStatsDump(e.stats);
this.showPopup(e.name+'’s Run',h);
if(e.scores)setTimeout(()=>{const cv=document.getElementById('lb-radar');if(cv)this.drawRadarOn(cv,e.scores);},80);},

// Shared run-entry builder (end screen + year checkpoint both post via this).
_buildLBEntry(name){const scores=this.calculateFinalScores();const _arch=this.determineArchetype(scores);return {name:name,archetype:this.archetype.id,months:this.month>36?36:this.month,composite:this.calcComposite(scores),scores:scores,title:_arch.title,subtitle:_arch.subtitle,playLog:this._playLog||[],badges:this.calcBadges(),mastery:this.calcPersonalMastery(),company:(this.state.company_name||''),traps:(this.state._traps_hit||[]).slice(),scams:this._scamsSurvivedLifetime(),scamsRun:(this.state._scams_survived||0),stats:this._statSnapshot(),date:new Date().toISOString().split('T')[0]};},
// Post the current year-checkpoint run to the leaderboard (local always; global if signed in, else queue + offer sign-in). Lets a 12/24-month run be ranked while you keep playing.
postCheckpoint(){const el=document.getElementById('cp-save-name');const name=((el&&el.value)||this._authName()||'').trim()||'Anonymous';const entry=this._buildLBEntry(name);this._myLBName=name;let lb=JSON.parse(localStorage.getItem('ep_leaderboard')||'[]');lb.push(entry);localStorage.setItem('ep_leaderboard',JSON.stringify(lb));const box=document.getElementById('cp-post-box');let msg;if(this._sb){if(this._isSignedIn()){this._lbSubmitGlobal(entry);msg='<div style="text-align:center;color:var(--accent);font-weight:600;font-size:0.82rem;">✓ Posted your '+entry.months+'-month run to the global leaderboard.</div>';}else{this._queuePendingGlobal(entry);msg='<div style="text-align:center;color:var(--text2);font-size:0.76rem;margin-bottom:8px;">Saved to this device — sign in to post it to the global board:</div><button onclick="Game.signInGoogle()" class="btn-secondary" style="margin:0;display:flex;align-items:center;justify-content:center;gap:8px;">'+GOOGLE_G+' Sign in with Google</button>';}}else{msg='<div style="text-align:center;color:var(--accent);font-weight:600;font-size:0.82rem;">✓ Saved to this device’s leaderboard.</div>';}if(box)box.innerHTML=msg;},
saveToLeaderboard(){
const name=(document.getElementById('player-name').value||'').trim()||'Anonymous';
const entry=this._buildLBEntry(name),composite=entry.composite;
let lb=JSON.parse(localStorage.getItem('ep_leaderboard')||'[]');lb.push(entry);localStorage.setItem('ep_leaderboard',JSON.stringify(lb));
this._myLBName=name;let _globalNote='';
// Global board: post now if signed in, otherwise queue the run + offer Google sign-in (which auto-posts on return).
if(this._sb){if(this._isSignedIn()){this._lbSubmitGlobal(entry);_globalNote='<div style="text-align:center;color:var(--accent);font-size:0.78rem;margin-bottom:8px;">✓ Posted to the global leaderboard.</div>';}else{this._queuePendingGlobal(entry);_globalNote='<button onclick="Game.signInGoogle()" class="btn-secondary" style="margin:0 0 10px;display:flex;align-items:center;justify-content:center;gap:8px;">'+GOOGLE_G+' Sign in with Google to post globally</button>';}}
// Completed runs no longer need their in-progress save
let _sv=this.loadSaves().filter(s=>!(s.name===name&&s.archetype===this.archetype.id));localStorage.setItem('ep_saves',JSON.stringify(_sv));
const isRecord=lb.filter(e=>e.archetype===entry.archetype&&e.months===entry.months).sort((a,b)=>b.composite-a.composite)[0].name===entry.name;
document.getElementById('end-save').innerHTML='<div style="text-align:center;color:var(--accent);font-weight:600;margin:12px 0;">✓ Saved!'+(isRecord?' New record for '+this.archetype.label+' — '+entry.months+' months!':'')+'</div>'+_globalNote+'<button class="btn-outline" onclick="Game.showLeaderboard(\'end\')">View Leaderboard</button>';},

// ---- Global leaderboard hook (backend wired later — see RELEASE_NOTES "v0.4 leaderboard") ----
// To go live: set Game.LB_BACKEND = { async fetchTop(arch,months){return [entries]}, async submit(entry){} }.
// fetchTop returns entries in the SAME shape as local (name, composite, archetype, months, badges, playLog, stats, date),
// already sorted desc by composite and capped to the top 10. submit() pushes one finished run. Until set, Global shows a "coming soon" state.
LB_BACKEND:null,
_lbSubmitGlobal(entry){if(this.LB_BACKEND&&this.LB_BACKEND.submit){try{Promise.resolve(this.LB_BACKEND.submit(entry)).catch(()=>{});}catch(e){}}},

// ---- Supabase: Google auth + global leaderboard backend ----
_initSupabase(){try{
if(!window.supabase||!window.supabase.createClient)return; // offline build / SDK didn't load → stays local-only
this._sb=window.supabase.createClient(SUPA_URL,SUPA_KEY);
this.LB_BACKEND={fetchTop:(a,m)=>this._sbFetchTop(a,m),submit:(e)=>this._sbSubmit(e)};
this._sb.auth.getSession().then(({data})=>{this._authUser=(data&&data.session)?data.session.user:null;this._afterAuth();});
this._sb.auth.onAuthStateChange((_e,session)=>{this._authUser=session?session.user:null;this._afterAuth();});
}catch(e){}},
_isSignedIn(){return !!this._authUser;},
_authName(){const u=this._authUser;if(!u)return '';const m=u.user_metadata||{};return m.full_name||m.name||((u.email||'').split('@')[0])||'Player';},
async signInGoogle(){if(!this._sb)return;try{await this._sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.href.split('#')[0].split('?')[0]}});}catch(e){}},
async signOutGoogle(){if(!this._sb)return;try{await this._sb.auth.signOut();}catch(e){}this._authUser=null;this._afterAuth();},
// Runs after auth state settles (initial load + sign in/out): refresh visible auth UI + flush any run queued before a sign-in redirect.
_afterAuth(){this._flushPendingGlobal();const lb=document.getElementById('leaderboard-screen');if(lb&&lb.classList.contains('active'))this.showLeaderboard(this._lbFrom);},
// Map a DB row → the entry shape the leaderboard UI expects.
_sbRowToEntry(r){return {name:r.name,company:r.company,archetype:r.archetype,months:r.months,composite:r.composite,scores:r.scores||null,mastery:r.mastery||0,badges:r.badges||[],traps:r.traps||[],scams:r.scams||0,scamsRun:0,playLog:r.play_log||[],stats:r.stats||null,date:(r.created_at||'').split('T')[0]};},
async _sbFetchTop(arch){const {data,error}=await this._sb.from('runs').select('name,company,archetype,months,composite,scores,badges,mastery,traps,scams,play_log,stats,created_at').eq('archetype',arch).order('composite',{ascending:false}).limit(10);if(error)throw error;return (data||[]).map(r=>this._sbRowToEntry(r));},
async _sbSubmit(entry){const u=this._authUser;if(!u)return;const row={user_id:u.id,name:entry.name,company:entry.company||'',archetype:entry.archetype,months:entry.months,composite:entry.composite,scores:entry.scores||null,badges:entry.badges||[],mastery:entry.mastery||0,traps:entry.traps||[],scams:entry.scams||0,stats:entry.stats||null,play_log:entry.playLog||[]};const {error}=await this._sb.from('runs').insert(row);if(error)throw error;},
// Posting requires sign-in, which redirects away (losing the run). So stash the entry, sign in, and auto-post it on return.
_queuePendingGlobal(entry){try{localStorage.setItem('ep_pending_global',JSON.stringify(entry));}catch(e){}},
_flushPendingGlobal(){if(!this._isSignedIn())return;let e=null;try{e=JSON.parse(localStorage.getItem('ep_pending_global')||'null');}catch(_){}if(!e)return;try{localStorage.removeItem('ep_pending_global');}catch(_){}this._myLBName=e.name;Promise.resolve(this._sbSubmit(e)).catch(()=>{});},
// Sign-in button / signed-in identity, shown on the global leaderboard tab.
_authBarHtml(){if(!this._sb)return '';
if(this._isSignedIn())return '<div style="display:flex;align-items:center;gap:8px;justify-content:space-between;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);padding:8px 12px;margin-bottom:10px;font-size:0.78rem;"><span style="color:var(--text2);min-width:0;">Signed in as <strong style="color:var(--text);">'+this._esc(this._authName())+'</strong></span><span onclick="Game.signOutGoogle()" style="color:var(--blue);cursor:pointer;font-weight:600;flex-shrink:0;">Sign out</span></div>';
return '<div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px 12px;margin-bottom:10px;"><div style="font-size:0.76rem;color:var(--text2);margin-bottom:7px;">Sign in to post your runs to the global board.</div><button onclick="Game.signInGoogle()" class="btn-secondary" style="margin:0;display:flex;align-items:center;justify-content:center;gap:8px;">'+GOOGLE_G+' Sign in with Google</button></div>';},

showLeaderboard(from){
this._lbFrom=from||'title';this.showScreen('leaderboard-screen');
const archetypes=['new','established','stuck'];
const archLabels={new:'New',established:'Established',stuck:'Stuck'};
const selArch=this.archetype?this.archetype.id:(this._lbArch||'new');
this._lbArch=selArch;this._lbScope=this._lbScope||'global';
const backTo=from==='end'?'Game.showScreen(\'end-screen\')':'Game.showMainMenu()';
let html='<div class="page-head"><button class="back-chip" onclick="'+backTo+'">← Back</button><span class="page-title gold">🏆 Leaderboard</span></div>';
html+='<div class="lb-scope"><div class="lb-seg '+(this._lbScope==='global'?'active':'')+'" onclick="Game.setLBScope(\'global\')">🌐 Global</div><div class="lb-seg '+(this._lbScope==='local'?'active':'')+'" onclick="Game.setLBScope(\'local\')">📱 This Device</div></div>';
if(this._lbScope==='global')html+=this._authBarHtml();
html+='<div class="lb-tabs" id="lb-arch-tabs">'+archetypes.map(a=>'<div class="lb-tab '+(a===selArch?'active':'')+'" onclick="Game.filterLB(\''+a+'\')">'+archLabels[a]+'</div>').join('')+'</div>';
html+='<div id="lb-list"></div>';
document.getElementById('lb-content').innerHTML=html;this.renderLBList();},

setLBScope(scope){this._lbScope=scope;document.querySelectorAll('.lb-scope .lb-seg').forEach(s=>s.classList.remove('active'));if(typeof event!=='undefined'&&event&&event.target)event.target.classList.add('active');if(scope==='global')this.showLeaderboard(this._lbFrom);else this.renderLBList();},
filterLB(arch){this._lbArch=arch;document.querySelectorAll('#lb-arch-tabs .lb-tab').forEach(t=>t.classList.remove('active'));if(typeof event!=='undefined'&&event&&event.target)event.target.classList.add('active');this.renderLBList();},

async renderLBList(){const el=document.getElementById('lb-list');if(!el)return;
if(this._lbScope==='global'){
if(!this.LB_BACKEND){el.innerHTML='<div class="lb-note">🌐 <strong>Global leaderboard — coming soon.</strong><br>Compete with founders everywhere. Once the global board is connected, the runs you submit will show up here.</div>';this._lbFiltered=[];return;}
el.innerHTML='<div class="lb-note">Loading global runs…</div>';
let rows=[];try{rows=await this.LB_BACKEND.fetchTop(this._lbArch)||[];}catch(e){el.innerHTML='<div class="lb-note">⚠ Couldn’t reach the global leaderboard.<br>Check your connection and try again.</div>';this._lbFiltered=[];return;}
this._lbFiltered=rows;this._paintLB(rows,el);return;}
const lb=JSON.parse(localStorage.getItem('ep_leaderboard')||'[]');
const filtered=lb.filter(e=>e.archetype===this._lbArch).sort((a,b)=>b.composite-a.composite).slice(0,10);
this._lbFiltered=filtered;this._paintLB(filtered,el);},

_paintLB(filtered,el){const MEDAL=['🥇','🥈','🥉'];const me=(this._myLBName||'').toLowerCase();
el.innerHTML=filtered.length?filtered.map((e,i)=>{const rank=i<3?'<span class="lb-rank lb-medal">'+MEDAL[i]+'</span>':'<span class="lb-rank">#'+(i+1)+'</span>';const mine=me&&(e.name||'').toLowerCase()===me;const durTag=e.months?'<span style="font-size:0.58rem;font-weight:700;color:var(--text2);background:rgba(127,127,127,0.16);border-radius:6px;padding:1px 5px;margin-left:5px;vertical-align:middle;">'+e.months+'mo</span>':'';
return '<div class="lb-entry fade-in'+(mine?' me':'')+'" style="cursor:pointer;" onclick="Game.showRunDetail('+i+')">'+rank+'<span class="lb-name">'+e.name+durTag+(e.badges&&e.badges.length?' <span style="font-size:0.78rem;" title="badges of honor">'+e.badges.slice(0,5).map(b=>b.i).join('')+'</span>':'')+(e.playLog&&e.playLog.length?' <span style="color:var(--text2);font-size:0.68rem;">▸</span>':'')+(e.company?'<span style="display:block;font-size:0.66rem;color:var(--text2);font-weight:400;">🏢 '+this._esc(e.company)+'</span>':'')+'</span><span class="lb-score">'+e.composite+'pts</span><span class="lb-date">'+e.date+'</span></div>';}).join(''):'<div class="lb-note">No runs here yet — finish a 12, 24, or 36-month run to claim the top spot.</div>';},

// v2 scoring — see DESIGN.md. Capital efficiency wins, not raw revenue.
// The six scored pillars, in display order (radar + breakdown). Definitions live in config/scoring_weights.json (player_description) — no weights/formulas shown.
scoreDims:['passive_income','leverage_efficiency','protection','freedom','lifestyle','net_worth'],
_dimMeta(k){const d=(CONFIG.scoring_weights&&CONFIG.scoring_weights.dimensions&&CONFIG.scoring_weights.dimensions[k])||{};return{label:d.label||this.formatStatName(k),desc:d.player_description||''};},
showDimInfo(k){const m=this._dimMeta(k);this.showPopup(m.label,'<div style="line-height:1.65;font-size:0.9rem;color:var(--text);">'+(m.desc||'')+'</div>');},
// Tappable pillar cards (each opens its plain-English definition). Used on the year checkpoint and both end screens.
_renderScoreCards(scores){return '<div style="grid-column:1/-1;text-align:center;font-size:0.72rem;color:var(--text2);margin-bottom:2px;">Tap any pillar to see what it measures</div>'+this.scoreDims.map(k=>{const m=this._dimMeta(k);return '<div class="stat-card" onclick="Game.showDimInfo(\''+k+'\')" style="cursor:pointer;"><div class="stat-value" style="color:var(--accent)">'+Math.round(scores[k]||0)+'</div><div class="stat-label">'+m.label+' <span style="opacity:0.45;">ⓘ</span></div></div>';}).join('');},
calculateFinalScores(){const s=this.state;
const cv=s.insurance_cash_value||0,reOwned=s.real_estate_owned||0,reEquity=s.real_estate_equity||0,reDebt=s.real_estate_debt||0,invest=s.investment_positions||0,polLoan=s.insurance_loan_balance||0,pbBal=s.private_bank_balance||0,pbLoan=s.private_bank_loan||0,bd=s.debt_breakdown||{};
const badDebt=(bd.credit_card||0)+(bd.collections||0);
const otherDebt=Math.max(0,(s.total_debt||0)-reDebt-(bd.credit_card||0)-(bd.collections||0)-polLoan);
// Logarithmic ladder helper (defined up here so leverage_efficiency can use it too).
const _lg=(v,lo,hi)=>Math.max(0,Math.min(100,100*Math.log10(Math.max(1,v)/lo)/Math.log10(hi/lo)));
// Passive, mostly tax-free, monthly income: policy-loan income (10%/yr once CV>=250k) + RE cashflow (~$700/property) + lending interest (12%/yr)
const passiveMonthly=(s._passive_income_active?cv*0.06/12:0)+reOwned*700+invest*0.01+pbBal*0.004;
// LEVERAGE EFFICIENCY — "max wealth with the least of your OWN money," but SAFELY. Not raw debt (over-leveraging is what the downturn margin-call punishes); efficiency is the asset base you CONTROL per dollar of your own equity, via other people's money — then gated by how safe that leverage is. A master controls ~4-5× their own capital through serviceable OPM; a blow-up (margin call, dangerous LTV, consumer debt) is the opposite of efficient and drags the score down.
const controlled=reEquity+reDebt+invest+cv+pbBal;/* full productive asset base you command */
const opm=reDebt+polLoan+pbLoan;/* other people's money financing that base (mortgages, policy loans, private-bank spread) */
const netEquity=Math.max(2000,controlled-opm);/* YOUR actual skin in the game */
const mult=controlled/netEquity;/* OPM multiple — assets controlled per dollar of your own equity */
const scaleRamp=Math.min(1,controlled/200000);/* needs real asset scale (~$200k+) before the multiple counts — a tiny leveraged sliver doesn't max it */
let levRaw=_lg(mult,1,5)*scaleRamp;/* 1×→0, 2×→43, 3×→68, 4×→86, 5×+→100 */
// SAFETY gate — efficient leverage is SERVICEABLE leverage. A margin-call blow-up, a dangerously high real-estate LTV, or consumer "bad" debt all mark the leverage as reckless, not efficient — and pull the score well below a conservative borrower's.
let safety=1;if(s._re_margin_called)safety*=0.5;const _reVal=reEquity+reDebt,_reLTV=_reVal>0?reDebt/_reVal:0;if(_reLTV>0.85)safety*=0.6;else if(_reLTV>0.75)safety*=0.85;if(badDebt>0)safety*=0.85;
const lev=controlled<1000?0:Math.round(Math.max(0,Math.min(100,levRaw*safety)));
// Net worth, leverage-aware: mortgage already netted inside reEquity; bad debt counts fully, other debt half, good debt not subtracted
const nw=(s.cash||0)+(s.personal_cash||0)+reEquity+invest+cv+pbBal-polLoan-pbLoan-badDebt-otherDebt*0.5+(s.available_credit||0)*0.1;
// Protection — how well the wealth is shielded: legal entity (liability separation) + asset-protection trust + insurance coverage + cash reserves. Credit/tax structure fold in here as the "don't lose it" pillar.
const ent=s.entity_structure,trust=s.trust_structure;
const entPts=(ent==='multi_entity')?25:(ent==='c_corp')?23:(ent==='s_corp')?21:(ent==='llc')?15:0;
const trustPts=(trust==='dynasty')?25:(trust==='full')?19:(trust==='basic_llc')?11:0;
const insPts=Math.min(25,((s.insurance_coverage||0)/500000)*25);
const burnP=Math.max(1,this.calcMonthlyBurn()),reserves=(s.tax_reserve||0)+Math.max(0,(s.cash||0)+(s.personal_cash||0));
const resvPts=Math.min(25,(reserves/burnP/6)*25);/* ~6 months of burn held in reserve/cash = full */
const protection=Math.round(Math.min(100,entPts+trustPts+insPts+resvPts));
// Six end-game pillars (DESIGN.md). Passive tax-free income is the crown jewel; freedom (owner-independence) + leverage encode "max wealth & lifestyle with the least of your own money and time."
// Logarithmic ladders so finance MASTERY differentiates instead of capping early. Tuned for the lean-business economy: passive $1k→0, $10k→50, $30k→74, $100k→100; net worth $50k→0, $1M→50, $5M→77, $20M→100. A finance dabbler lands ~50; a master climbs toward 100.
return{passive_income:Math.round(_lg(passiveMonthly,1000,100000)),leverage_efficiency:Math.round(lev),protection:protection,freedom:this.calcFreedom(),lifestyle:Math.min(100,(s.lifestyle_health||0)*0.2+(s.lifestyle_relationships||0)*0.2+(s.lifestyle_experiences||0)*0.15+(s.lifestyle_spiritual||0)*0.15+(s.lifestyle_philanthropy||0)*0.15+(s.lifestyle_legacy||0)*0.15),net_worth:Math.round(_lg(nw,50000,20000000))};},
// Strong lifestyle gate: a wrecked life caps the final score (no "paradise" if you burned out). lifestyle 65+ = full, ~32 = half, floored at 0.3.
calcComposite(scores){const w=CONFIG.scoring_weights?CONFIG.scoring_weights.dimensions:{};let c=0;for(const[k,d]of Object.entries(w))c+=(scores[k]||0)*(d.weight||0);const gate=Math.max(0.3,Math.min(1,(scores.lifestyle||0)/65));return Math.round(c*6*gate);},
determineArchetype(scores){const A=id=>CONFIG.archetypes.win_archetypes.find(a=>a.id===id)||CONFIG.archetypes.win_archetypes[0];
const nw=scores.net_worth||0,pas=scores.passive_income||0,lev=scores.leverage_efficiency||0,prot=scores.protection||0,life=scores.lifestyle||0,free=scores.freedom||0;
const rev=Math.min(100,((this.state&&this.state.monthly_revenue)||0)/600);/* fuel, not a scored pillar — inline for archetype flavor only (guarded: may be called for a leaderboard entry with no live state) */
const moneyStrong=Math.max(nw,rev,pas,lev)>=45;
const efficient=pas>=45&&lev>=40&&prot>=40; // mastered the point: OPM leverage + protected, passive-income engine
// 1. Won the money, wrecked the life
if(life<30&&moneyStrong)return A('burnout_billionaire');
// 2. Brute-forced revenue, skipped leverage/passive/protection — missed the whole point
if(rev>=50&&lev<35&&pas<35&&prot<45)return A('the_grinder');
// 3. The full win: efficient leverage + finance AND the lifestyle/toys
if(efficient&&life>=50)return A('freedom_architect');
// 4. Passive income is the standout (the crown jewel)
if(pas>=40&&pas>=lev&&pas>=nw&&pas>=rev)return A('cashflow_king');
// 5. Leverage / net worth via OPM is the standout
if(Math.max(lev,nw)>=40&&Math.max(lev,nw)>=rev&&Math.max(lev,nw)>=pas)return A('leverage_master');
// 6. Real revenue engine with at least some structure
if(rev>=40)return A('empire_builder');
// 7. Weak/partial run — name it by the single strongest area, leaning to the lesson
const top=Math.max(nw,rev,pas,lev,life);
if(top===life)return A('freedom_architect');if(top===pas)return A('cashflow_king');if(top===rev)return A('the_grinder');return A('leverage_master');},

drawRadarOn(canvas,scores){const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height,cx=w/2,cy=h/2,r=w/2-30;const lb=['Passive','Leverage','Protection','Freedom','Lifestyle','Net Worth'],vl=[scores.passive_income,scores.leverage_efficiency,scores.protection,scores.freedom,scores.lifestyle,scores.net_worth],n=6;ctx.clearRect(0,0,w,h);for(let ring=1;ring<=4;ring++){ctx.beginPath();for(let i=0;i<=n;i++){const a=(Math.PI*2*i/n)-Math.PI/2,rr=r*ring/4;i===0?ctx.moveTo(cx+rr*Math.cos(a),cy+rr*Math.sin(a)):ctx.lineTo(cx+rr*Math.cos(a),cy+rr*Math.sin(a));}ctx.strokeStyle='#2d3a50';ctx.lineWidth=1;ctx.stroke();}for(let i=0;i<n;i++){const a=(Math.PI*2*i/n)-Math.PI/2;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+r*Math.cos(a),cy+r*Math.sin(a));ctx.strokeStyle='#2d3a50';ctx.stroke();ctx.fillStyle='#9ca3b4';ctx.font='10px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(lb[i],cx+(r+20)*Math.cos(a),cy+(r+20)*Math.sin(a));}ctx.beginPath();for(let i=0;i<=n;i++){const idx=i%n,a=(Math.PI*2*idx/n)-Math.PI/2,v=(vl[idx]/100)*r;i===0?ctx.moveTo(cx+v*Math.cos(a),cy+v*Math.sin(a)):ctx.lineTo(cx+v*Math.cos(a),cy+v*Math.sin(a));}ctx.fillStyle='rgba(16,185,129,0.2)';ctx.fill();ctx.strokeStyle='#10b981';ctx.lineWidth=2;ctx.stroke();for(let i=0;i<n;i++){const a=(Math.PI*2*i/n)-Math.PI/2,v=(vl[i]/100)*r;ctx.beginPath();ctx.arc(cx+v*Math.cos(a),cy+v*Math.sin(a),3,0,Math.PI*2);ctx.fillStyle='#10b981';ctx.fill();}},

fmt(n){n=Math.round(n);const a=Math.abs(n);return a>=1000?a.toLocaleString():a.toString();},
fmtMoney(n){n=Math.round(n);const a=Math.abs(n),str=a>=1000?a.toLocaleString():a.toString();return(n<0?'-$':'$')+str;},
formatStatName(k){return k.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());}
};
Game.init();
