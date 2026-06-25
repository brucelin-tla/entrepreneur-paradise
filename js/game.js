// Entrepreneur Paradise — game code
let CONFIG={};
async function loadConfig(){const files=['starting_positions','actions_marketing','actions_operations','actions_finance','lifestyle_options','events','stage_thresholds','scoring_weights','archetypes','characters','narrative_beats'];let ue=false;for(const f of files){if(!ue){try{const r=await fetch('config/'+f+'.json');if(!r.ok)throw 0;CONFIG[f]=await r.json();continue;}catch(e){ue=true;}}if(ue&&window.EMBEDDED_CONFIG&&window.EMBEDDED_CONFIG[f])CONFIG[f]=window.EMBEDDED_CONFIG[f];}}
const CATS=['marketing','operations','finance'],CL={marketing:'Marketing',operations:'Operations',finance:'Finance',lifestyle:'Life'};
const MK=['monthly_revenue','cash','operating_expenses','total_debt','owner_pay','cogs','real_estate_equity','life_insurance_cv','investment_positions','available_credit','personal_guarantee_exposure','living_expenses','lifestyle_expenses','tax_reserve'];
const IK=['total_debt','operating_expenses','audit_risk','litigation_exposure','key_person_dependency','cogs','partner_conflict_risk','living_expenses','lifestyle_expenses','personal_guarantee_exposure','churn_rate'];
const BOOST_IDS=['customer_acquisition_sprint','build_content_presence','manage_debt','get_borrowing_power','build_delivery_foundation','scale_delivery','hire_specialists'];
// Action directions — group the menu by theme so every takeable option stays visible (pick a direction, see its A/B/C)
const ADIR={finance:[['Foundation',['open_business_account','basic_bookkeeping','form_llc','income_protection']],['Build Credit',['build_personal_credit_repair','build_personal_credit_optimize','balance_transfer','move_debt_to_business','debt_restructure','pay_down_debt']],['Get Capital',['bank_personal_loan','business_credit_card_0pct','business_credit_line','business_term_loan','qualify_more_credit']],['Structure & Tax',['payroll_setup','s_corp_election','banking_relationship','monthly_tax_reserve','tax_planning_session','tax_optimization','multi_entity']],['Protect',['keyman_insurance','asset_protection']],['Wealth Engine',['setup_accumulation_policy','fund_accumulation_policy','policy_loan','premium_financing','buy_real_estate','private_lending']]],marketing:[['Get Customers',['cold_outreach','local_networking','referral_asks','paid_ads_test']],['Audience & Offer',['basic_social_content','email_campaign','lead_magnet','build_offer']],['Scale Sales',['build_sales_team','crm_pipeline','webinar_funnel','referral_partnerships','brand_pr_push']],['Leverage & Expand',['content_engine','jv_affiliate_network','franchise_licensing','acquire_competitor']]],operations:[['Deliver & Document',['do_work_yourself','hire_first_contractor','write_first_sop','basic_quality_control','client_onboarding','basic_automation']],['Build the Team',['hire_delivery_team','hire_sales_rep','hire_content_creator','hire_client_success','hiring_pipeline','project_management','middle_management']],['Systematize & Scale',['fulfillment_system','full_systemization','hire_fractional_cfo','hire_hr_manager','build_ip','vertical_integration','multi_location']]]};
// Patch notes — newest first. Add a new entry on every release; the title screen version + What's New derive from this.
const PATCH_NOTES=[
{v:'0.13.1',d:'2026-06-25 07:55',n:['Action menu is now collapsible — tap a direction to reveal its options, so the menu is short and easy to scan instead of one long scroll']},
{v:'0.13.0',d:'2026-06-25 07:49',n:['Action menu grouped by direction — every option stays visible, no more buried choices','Finance actions (credit lines, loans, balance transfer, lending, real estate) now scale to your real numbers','End-screen recap shows only the options you actually saw','Added this What\'s New changelog']},
{v:'0.12.0',d:'2026-06-25',n:['Anti-grind: revenue is capped by your capacity — build offer/systems/team to scale','Progressive tax drag, team coordination cost, and leaky-bucket churn punish unstructured growth','Mentor renamed to Bruce — ends with a question, not advice']},
{v:'0.11.0',d:'2026-06-25',n:['Scoring rebuilt around capital efficiency — passive tax-free income is the crown','The golden path teaches itself: in-the-moment lessons + real-consequence events','Easier early game; fixed wiped real-estate/lending income']},
{v:'0.10.0',d:'2026-06-24',n:['Rebuilt into a modular codebase; baseline release']}
];

const Game={
state:null,month:1,selectedActions:{},selectedLifestyle:null,actionHistory:[],eventHistory:[],lifestyleHistory:[],monthlySnapshots:[],currentCategory:'marketing',_lbFrom:'title',

GLOSSARY:{'EBITDA':'Earnings Before Interest, Taxes, Depreciation & Amortization — your business\'s operating profit.','COGS':'Cost of Goods Sold — direct costs to deliver your product/service.','DSCR':'Debt Service Coverage Ratio — operating income divided by debt payments. Above 1.25 is healthy.','SOP':'Standard Operating Procedure — written steps so anyone can do a task without you.','LOC':'Line of Credit — revolving credit you draw from as needed.','LLC':'Limited Liability Company — separates personal assets from business liability.','S-Corp':'S Corporation — tax election splitting income between salary and distributions to save taxes.','CRM':'Customer Relationship Management — software tracking prospects and deals.','EIN':'Employer Identification Number — your business tax ID.','HELOC':'Home Equity Line of Credit.','OPM':'Other People\'s Money — borrowed or investor capital.','JV':'Joint Venture — parties pooling resources for a project.','IP':'Intellectual Property — proprietary methods or technology.','Net Worth':'Assets minus liabilities.','Brand Equity':'Market recognition and perceived value of your business.','Key-Person Dependency':'How much the business relies on you personally.','Churn Rate':'Percentage of customers lost each month.','Utilization':'Percentage of available credit in use. Below 30% boosts score.','Tradeline':'A credit account on your report.','Monthly Burn':'Total monthly expenses across life and business.','Living Expenses':'Personal cost of living — rent, food, utilities, transport.','Holding Company':'A parent entity that owns your operating business(es). It manages money, holds assets, and isolates your personal finances from business operations and liabilities.','Operating Entity':'The business entity that runs day-to-day operations, holds contracts, employs staff, and takes on business debt. Sits under the holding company.','Liability Shield':'Legal separation between entities so that debts and lawsuits against one entity can\'t reach the assets of another.'},

async init(){await loadConfig();this.renderArchetypes();this.renderTitleMeta();},
renderTitleMeta(){const v=PATCH_NOTES[0],vl=document.getElementById('version-line');if(vl)vl.textContent='v'+v.v+' — '+v.d;const wn=document.getElementById('whats-new');if(!wn)return;const full=this._showFullLog,list=full?PATCH_NOTES:[PATCH_NOTES[0]];let h='<div style="max-width:420px;margin:18px auto 0;text-align:left;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px 14px;"><div style="font-size:0.8rem;font-weight:700;color:var(--gold);margin-bottom:4px;">What\'s New</div>';for(const e of list){h+='<div style="font-size:0.7rem;color:var(--text2);margin:8px 0 3px;">v'+e.v+' · '+e.d+'</div>';h+=e.n.map(x=>'<div style="font-size:0.82rem;color:var(--text);margin:3px 0;line-height:1.45;">• '+x+'</div>').join('');}h+='<div style="text-align:center;margin-top:10px;"><span style="color:var(--blue);cursor:pointer;font-size:0.78rem;" onclick="Game._showFullLog='+(!full)+';Game.renderTitleMeta();">'+(full?'Show less ▴':'Full changelog ▾')+'</span></div></div>';wn.innerHTML=h;},
renderArchetypes(){const l=document.getElementById('archetype-list');l.innerHTML='';CONFIG.starting_positions.positions.filter(p=>p.enabled!==false).forEach(p=>{const c=document.createElement('div');c.className='archetype-card fade-in';c.innerHTML='<h3>'+p.label+'</h3><div class="tagline">'+p.tagline+'</div><p>'+p.description+'</p>';c.onclick=()=>this.selectArchetype(p);l.appendChild(c);});},

selectArchetype(p){
this.archetype=p;this.state=JSON.parse(JSON.stringify(p.initial_state));
this.state._stages=JSON.parse(JSON.stringify(p.stage_overrides));this.state._completed_actions=[];this.state._active_lifestyle_costs={};this.state._action_counts={};
this.state._mentor_state='unavailable';this.state._banker_state='stranger';this.state._rival_state='unknown';this.state._family_state=p.id==='established'?'strained':'coping';
this.state._audit_events=0;this.state._market_cycle='normal';this.state._ytd_taxable_income=0;
this.state.fitness_level=this.state.fitness_level||50;this.state.living_expenses=this.state.living_expenses||3000;this.state.lifestyle_expenses=this.state.lifestyle_expenses||0;
this.state.leads=this.state.leads||0;this.state.tax_reserve=this.state.tax_reserve||0;this.state.tax_rate=this.state.tax_rate||0.25;
this.state.skill_marketing=this.state.skill_marketing||0;this.state.skill_operations=this.state.skill_operations||0;this.state.skill_finance=this.state.skill_finance||0;
this.month=1;this.selectedActions={};this.actionHistory=[];this.eventHistory=[];this.lifestyleHistory=[];this.monthlySnapshots=[];this._pendingTax=false;
this.showScreen('opening-screen');
const b=CONFIG.narrative_beats.fixed_beats.find(x=>x.month===1&&x.archetype===p.id);
document.getElementById('opening-narrative').innerHTML=b?b.narrative.replace(/\n/g,'<br>'):p.opening_narrative.replace(/\n/g,'<br>');
const m=document.getElementById('opening-mentor');if(b&&b.mentor_line){m.style.display='block';m.innerHTML='<div class="char-name">Bruce — Mentor</div>'+b.mentor_line;}else m.style.display='none';},

startGame(){this.state._mentor_state='introduced';this.renderMonth();},
showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById(id).classList.add('active');window.scrollTo(0,0);},
showPopup(t,b){document.getElementById('popup-title').innerHTML=t;document.getElementById('popup-body').innerHTML=b;document.getElementById('popup-container').style.display='block';},
hidePopup(){document.getElementById('popup-container').style.display='none';},
showGlossary(t){this.showPopup(t,'<div style="color:var(--text);line-height:1.7;">'+(this.GLOSSARY[t]||'No definition available.')+'</div>');},
term(w,d){return'<span class="term-link" onclick="Game.showGlossary(\''+w.replace(/'/g,"\\'")+'\')\">'+(d||w)+'</span>';},
linkTerms(t){const terms=Object.keys(this.GLOSSARY).sort((a,b)=>b.length-a.length);for(const w of terms)t=t.replace(new RegExp('\\b'+w.replace(/[-\/\\^$*+?.()|[\]{}]/g,'\\$&')+'\\b','g'),'<span class="term-link" onclick="Game.showGlossary(\''+w.replace(/'/g,"\\'")+'\')">'+w+'</span>');return t;},
getStage(c){return this.state._stages[c]||'foundation';},
updateStages(){const th=CONFIG.stage_thresholds.thresholds;for(const c of CATS){if(this.state._stages[c]==='foundation'&&this.meetsReq(th[c].foundation_to_leverage))this.state._stages[c]='leverage';if(this.state._stages[c]==='leverage'&&this.meetsReq(th[c].leverage_to_wealth))this.state._stages[c]='wealth';}},
meetsReq(r){if(!r||Object.keys(r).length===0)return true;for(const[k,v]of Object.entries(r)){if(k==='cash_gte'){const ba=Math.max(0,(this.state.business_credit_limit||0)-(this.state.business_credit_used||0));if((this.state.cash||0)+(this.state.available_credit||0)+ba<v)return false;continue;}if(k.endsWith('_gte')&&(this.state[k.replace('_gte','')]||0)<v)return false;if(k.endsWith('_lte')&&(this.state[k.replace('_lte','')]||0)>v)return false;if(k.endsWith('_in')&&!v.includes(this.state[k.replace('_in','')]))return false;if(k.endsWith('_not')&&this.state[k.replace('_not','')]===v)return false;if((k==='entity_structure'||k==='business_credit_profile')&&this.state[k]!==v)return false;}return true;},
canAfford(a){const bizAvail=Math.max(0,(this.state.business_credit_limit||0)-(this.state.business_credit_used||0));const totalFunds=(this.state.cash||0)+(this.state.available_credit||0)+bizAvail;if(a.cash_cost&&totalFunds<a.cash_cost)return false;if(a.energy_cost>0&&this.state.energy<a.energy_cost)return false;return true;},
getAvailableActions(cat){let pool;if(cat==='marketing')pool=CONFIG.actions_marketing.actions;else if(cat==='operations')pool=CONFIG.actions_operations.actions;else if(cat==='finance')pool=CONFIG.actions_finance.actions;
else if(cat==='lifestyle'){const s=this.state,subs={health:s.lifestyle_health||0,relationships:s.lifestyle_relationships||0,experiences:s.lifestyle_experiences||0,spiritual:s.lifestyle_spiritual||0,philanthropy:s.lifestyle_philanthropy||0,legacy:s.lifestyle_legacy||0};
const weakest=Object.entries(subs).sort((a,b)=>a[1]-b[1]).slice(0,3).map(e=>e[0]);
const all=CONFIG.lifestyle_options.actions.filter(a=>(s.cash||0)>=(a.cash_cost||0));
const prioritized=all.filter(a=>weakest.includes(a.subcategory));
const others=all.filter(a=>!weakest.includes(a.subcategory));
return[...prioritized,...others].slice(0,6);}
const stages=['foundation','leverage','wealth'],idx=stages.indexOf(this.getStage(cat));return pool.filter(a=>{if(stages.indexOf(a.stage)>idx)return false;if(a.id==='build_personal_credit_repair')return this.state.personal_credit_score<600||(this.state.debt_breakdown&&this.state.debt_breakdown.collections>0);if(a.id==='build_personal_credit_optimize')return this.state.personal_credit_score>=600&&!(this.state.debt_breakdown&&this.state.debt_breakdown.collections>0);return true;});},
isActionCompleted(a){return a.one_time&&this.state._completed_actions.includes(a.id);},
isActionLocked(a){return this.isActionCompleted(a)||!this.meetsReq(a.prerequisites||{})||!this.canAfford(a);},

calcDebtInterest(){const bizDebt=(this.state.total_debt||0)-(this.state.real_estate_debt||0);return Math.round(bizDebt*0.008)+Math.round((this.state.real_estate_debt||0)*0.005);},
calcDebtPrincipal(){const bizDebt=(this.state.total_debt||0)-(this.state.real_estate_debt||0);return Math.round(bizDebt*0.01)+Math.round((this.state.real_estate_debt||0)*0.005);},
calcMonthlyBurn(){const s=this.state;return(s.operating_expenses||0)+(s.owner_pay||0)+(s.living_expenses||0)+(s.lifestyle_expenses||0)+this.calcDebtInterest()+this.calcDebtPrincipal();},
calcEnergyRecovery(){const s=this.state;return 13+Math.round((s.fitness_level||0)/5)+Math.round((s.lifestyle_health||0)/10);},
calcFreedom(){const s=this.state;return Math.min(100,Math.max(0,Math.round((100-(s.key_person_dependency||100))+Math.min(20,(s.team_size||0)*3)+Math.min(20,(s.systems_maturity||0)/5)+(s._completed_actions&&s._completed_actions.includes('middle_management')?10:0)+(s._completed_actions&&s._completed_actions.includes('hire_fractional_cfo')?15:0)+(s._completed_actions&&s._completed_actions.includes('hire_hr_manager')?10:0))));},
calcBusinessLevel(){return Math.min(10,Math.max(1,(this.state.monthly_revenue||0)/5000));},
calcCreditCapacity(){const s=this.state;const credit=Math.max(0.3,Math.min(2.5,((s.personal_credit_score||600)-560)/120));const size=1+Math.min(3,(s.monthly_revenue||0)/20000);const prof=(s.business_credit_profile==='established')?1.25:1;return Math.round(credit*size*prof*100)/100;},
getFounderRole(){const f=this.calcFreedom();if(f>80)return'Chairman';if(f>60)return'CEO';if(f>40)return'Director';if(f>20)return'Manager';return'Operator';},
scaleActionEffects(effects,cat){const s=this.state,scaled=JSON.parse(JSON.stringify(effects)),level=this.calcBusinessLevel(),skill=(s['skill_'+cat]||0);for(const k in scaled){if(typeof scaled[k]!=='number')continue;if(k==='monthly_revenue'&&scaled[k]>0)scaled[k]=Math.round(scaled[k]*Math.min(2.5,level));if(k==='leads'&&scaled[k]>0)scaled[k]=Math.round(scaled[k]*(1+(s.brand_equity||0)/300+skill/300));if(k==='customer_base'&&scaled[k]>0)scaled[k]=Math.round(scaled[k]*(1+skill/400));if(k==='revenue_capacity')scaled[k]=Math.round(scaled[k]*Math.min(2.5,level));if(k==='operating_expenses'&&scaled[k]>0)scaled[k]=Math.round(scaled[k]*Math.min(2,level));}return scaled;},
scaleEventEffects(effects){const scaled=JSON.parse(JSON.stringify(effects)),level=this.calcBusinessLevel();for(const k in scaled){if(typeof scaled[k]!=='number')continue;if(k==='cash')scaled[k]=Math.round(scaled[k]*Math.min(5,level));if(k==='monthly_revenue')scaled[k]=Math.round(scaled[k]*Math.min(5,level));if(k==='operating_expenses')scaled[k]=Math.round(scaled[k]*Math.min(3,level));if(k==='total_debt'&&scaled[k]<0)scaled[k]=Math.round(scaled[k]*Math.min(3,level));if(k==='customer_base')scaled[k]=Math.round(scaled[k]*Math.min(3,Math.max(1,(this.state.customer_base||1)/20)));}return scaled;},

renderMonth(){
this.showScreen('game-screen');this.selectedActions={};this.currentCategory='marketing';this._showAllActions=false;this._isQuarterlyMonth=(this.month%3===0);this._activeCats=this._isQuarterlyMonth?['marketing','operations','finance','lifestyle']:['marketing','operations','finance'];this.updateStages();
document.getElementById('month-label').textContent='Month '+this.month+' — '+this.getFounderRole();
const hs=CATS.map(c=>this.getStage(c)).reduce((a,b)=>({foundation:0,leverage:1,wealth:2}[a]>={foundation:0,leverage:1,wealth:2}[b]?a:b));
const badge=document.getElementById('stage-badge');badge.textContent=hs;badge.style.background=hs==='wealth'?'var(--gold)':hs==='leverage'?'var(--blue)':'var(--accent2)';
const beat=CONFIG.narrative_beats.fixed_beats.find(b=>b.month===this.month&&(b.archetype===null||b.archetype===this.archetype.id));
const narEl=document.getElementById('month-narrative');
if(beat){narEl.style.display='block';narEl.innerHTML='<strong>'+beat.title+'</strong><br><br>'+beat.narrative.replace(/\n/g,'<br>');}
else if(this.month>1){narEl.style.display='block';const cl=CONFIG.narrative_beats.monthly_cliffhangers.filter(c=>this.meetsReq(c.requires));narEl.innerHTML=cl.length?cl[Math.floor(Math.random()*cl.length)].text:'';}else narEl.style.display='none';
const charEl=document.getElementById('character-line'),cl2=this.getCharLine();
if(cl2){charEl.style.display='block';charEl.innerHTML='<div class="char-name">'+cl2.name+'</div>'+cl2.line;}else charEl.style.display='none';
if(beat&&beat.mentor_line&&!cl2){charEl.style.display='block';charEl.innerHTML='<div class="char-name">Bruce — Mentor</div>'+beat.mentor_line;}
this.renderStats();this.renderBars();this.renderStepIndicator();this.renderCategoryTabs();this.renderActions();this.updateConfirmButton();},

getCharLine(){const ch=CONFIG.characters.characters;if(Math.random()>0.35)return null;if(this.state.energy<=30&&this.state._family_state!=='thriving'){const l=ch.family.lines[this.state._family_state]||[];if(l.length)return{name:'Family',line:l[Math.floor(Math.random()*l.length)]};}if(this.month%4===0){if(this.state._rival_state==='unknown'&&this.month>=3)this.state._rival_state='acquaintance';if(this.state._rival_state==='acquaintance'&&this.month>=8)this.state._rival_state='competitor';if(this.state._rival_state==='competitor'&&this.month>=24&&Math.random()>0.5)this.state._rival_state='fallen';if(this.state._rival_state==='competitor'&&this.month>=30)this.state._rival_state='respect';const l=ch.rival.lines[this.state._rival_state]||[];if(l.length)return{name:'Jordan Blake — Rival',line:l[Math.floor(Math.random()*l.length)]};}if(this.state._mentor_state!=='unavailable'){if(this.month>=6)this.state._mentor_state='advising';if(this.month>=18)this.state._mentor_state='trusted';const l=ch.mentor.lines[this.state._mentor_state]||[];if(l.length){let line=l[Math.floor(Math.random()*l.length)];const la=this.actionHistory.length>0?this.actionHistory[this.actionHistory.length-1]:null;if(la)line=line.replace('{last_action}',la.label||'made a move').replace('{assessment}',Math.random()>0.5?'the right call':'risky, but defensible');return{name:'Bruce — Mentor',line};}}return null;},

renderStats(){
const s=this.state,burn=this.calcMonthlyBurn();
const cv=s.customer_base>0?Math.round((s.monthly_revenue||0)/s.customer_base):0;
const pla=Math.max(0,Math.round((s.insurance_cash_value||0)*0.9)-(s.insurance_loan_balance||0));
const bizAvail=Math.max(0,(s.business_credit_limit||0)-(s.business_credit_used||0));
const totalAvail=(s.available_credit||0)+bizAvail+pla;
const icv=s.insurance_cash_value||0;
const persUtil=this.calcPersUtil(),bizUtil=this.calcBizUtil();
const totalLoans=(s._installment_debt||0)+(s.business_installment_debt||0)+(s.real_estate_debt||0);
const policyPassive=(s.insurance_cash_value||0)>=250000?Math.round((s.insurance_cash_value||0)*0.07/12):0;
const passiveInc=(s.real_estate_owned||0)*1800+policyPassive+Math.round((s.investment_positions||0)*0.01);
const baseConv=0.03,skConv=(s.skill_marketing||0)/300,brConv=(s.brand_equity||0)/1000,ofB=s._completed_actions&&s._completed_actions.includes('build_offer')?0.05:0,crB=s._completed_actions&&s._completed_actions.includes('crm_pipeline')?0.05:0;
const convPct=Math.round(Math.min(0.5,baseConv+skConv+brConv+ofB+crB)*100);
const stats=[
{label:'Cash',value:this.fmtMoney(s.cash),color:s.cash>5000?'positive':s.cash<2000?'negative':'warning'},
{label:'Credit (P:'+persUtil+'% B:'+bizUtil+'%)',value:this.fmtMoney(totalAvail),color:totalAvail>0?'positive':'neutral',info:'CreditAvail'},
{label:icv>0?'Policy Value':'Policy (none)',value:this.fmtMoney(icv),color:icv>0?'positive':'neutral'},
{label:'Revenue',value:this.fmtMoney(s.monthly_revenue),color:'positive'},
{label:this.term('Monthly Burn'),value:this.fmtMoney(burn),color:burn>s.monthly_revenue?'negative':'neutral',info:'Burn'},
{label:'Owner Salary',value:s.owner_pay?this.fmtMoney(s.owner_pay):'No Salary',color:s.owner_pay?'positive':'neutral'},
{label:'Credit Score',value:Math.round(s.personal_credit_score),color:s.personal_credit_score<620?'negative':s.personal_credit_score<700?'warning':'positive',info:'CreditScore'},
{label:'Total Loans',value:this.fmtMoney(totalLoans),color:totalLoans>30000?'negative':'neutral',info:'Debt'},
{label:'Passive Income',value:this.fmtMoney(passiveInc),color:passiveInc>0?'positive':'neutral'},
{label:'Pipeline ('+convPct+'% conv)',value:''+(s.leads||0),color:'neutral'},
{label:'Customers',value:s.customer_base+' <span style="font-size:0.6rem;color:var(--text2)">@'+this.fmtMoney(cv)+'</span>',color:'neutral'},
{label:'Staff',value:''+(s.team_size||0),color:'neutral'}];
document.getElementById('stats-dashboard').innerHTML=stats.map(st=>'<div class="stat-card"><div class="stat-value stat-'+st.color+'" style="font-size:0.95rem;">'+st.value+(st.info?'<span class="info-btn" onclick="Game.show'+st.info+'()">i</span>':'')+'</div><div class="stat-label">'+st.label+'</div></div>').join('');},

calcPersUtil(){const s=this.state,persRev=Math.max(0,(s.total_debt||0)-(s._installment_debt||0)-(s.business_credit_used||0)-(s.business_installment_debt||0)),persLim=persRev+(s.available_credit||0);return persLim>0?Math.round((persRev/persLim)*100):0;},
calcBizUtil(){const s=this.state,bizUsed=s.business_credit_used||0,bizLim=s.business_credit_limit||0;return bizLim>0?Math.round((bizUsed/bizLim)*100):0;},

showCreditAvail(){const s=this.state,pa=s.available_credit||0,persUsed=Math.max(0,(s.total_debt||0)-(s._installment_debt||0)-(s.business_credit_used||0)-(s.business_installment_debt||0)),persLim=persUsed+pa;
const ba=Math.max(0,(s.business_credit_limit||0)-(s.business_credit_used||0)),bu=s.business_credit_used||0,bl=s.business_credit_limit||0;
const icv=s.insurance_cash_value||0,pla=Math.max(0,Math.round(icv*0.9)-(s.insurance_loan_balance||0)),ilb=s.insurance_loan_balance||0;
let h='<div style="font-weight:600;color:var(--text);margin-bottom:6px;">Personal Credit</div>';
h+='<div class="breakdown-row"><span>Available</span><span>'+this.fmtMoney(pa)+'</span></div>';
h+='<div class="breakdown-row"><span>Used / Limit</span><span>'+this.fmtMoney(persUsed)+' / '+this.fmtMoney(persLim)+'</span></div>';
h+='<div class="breakdown-row"><span>'+this.term('Utilization')+'</span><span style="color:'+(this.calcPersUtil()>30?'var(--gold)':'var(--accent)')+'">'+this.calcPersUtil()+'%</span></div>';
h+='<div style="font-weight:600;color:var(--text);margin:10px 0 6px;border-top:1px solid var(--border);padding-top:8px;">Business Credit</div>';
h+='<div class="breakdown-row"><span>Available</span><span>'+this.fmtMoney(ba)+'</span></div>';
h+='<div class="breakdown-row"><span>Used / Limit</span><span>'+this.fmtMoney(bu)+' / '+this.fmtMoney(bl)+'</span></div>';
h+='<div class="breakdown-row"><span>'+this.term('Utilization')+'</span><span style="color:'+(this.calcBizUtil()>50?'var(--gold)':'var(--accent)')+'">'+this.calcBizUtil()+'%</span></div>';
if(icv>0){h+='<div style="font-weight:600;color:var(--text);margin:10px 0 6px;border-top:1px solid var(--border);padding-top:8px;">Policy</div>';
h+='<div class="breakdown-row"><span>Cash Value</span><span>'+this.fmtMoney(icv)+'</span></div>';
h+='<div class="breakdown-row"><span>Loan Available (90%)</span><span>'+this.fmtMoney(pla)+'</span></div>';
if(ilb>0)h+='<div class="breakdown-row"><span>Loan Outstanding</span><span style="color:var(--gold)">'+this.fmtMoney(ilb)+'</span></div>';
if(icv>=250000){const moP=Math.round(icv*0.10/12);h+='<div class="breakdown-row"><span>Monthly Passive Income</span><span style="color:var(--accent)">'+this.fmtMoney(moP)+'/mo</span></div>';h+='<div class="breakdown-row"><span>Cumulative Policy Loans</span><span style="color:var(--text2)">'+this.fmtMoney(s.insurance_passive_loan_total||0)+'</span></div>';h+='<div class="breakdown-detail" style="font-style:italic;">Tax-free income from insurer. Deducted from death benefit only.</div>';}
else h+='<div class="breakdown-detail">Passive income unlocks at $250K ('+Math.round(icv/250000*100)+'% there)</div>';
if(s.insurance_coverage)h+='<div class="breakdown-row"><span>Protection Coverage</span><span>'+this.fmtMoney(s.insurance_coverage)+'</span></div>';}
h+='<div class="breakdown-row breakdown-total"><span>Total Available</span><span style="color:var(--accent)">'+this.fmtMoney(pa+ba+pla)+'</span></div>';
this.showPopup('Credit Available',h);},

showDebt(){const s=this.state,persRev=Math.max(0,(s.total_debt||0)-(s._installment_debt||0)-(s.business_credit_used||0)-(s.business_installment_debt||0)-(s.real_estate_debt||0)),persInst=s._installment_debt||0;
const bizRev=s.business_credit_used||0,bizInst=s.business_installment_debt||0,reDbt=s.real_estate_debt||0;
const insLoan=s.insurance_loan_balance||0,totalAll=(s.total_debt||0)+insLoan,moPay=this.calcDebtInterest()+this.calcDebtPrincipal();
let h='<div style="font-weight:600;color:var(--text);margin-bottom:6px;">Personal Debt</div>';
h+='<div class="breakdown-row"><span>Revolving (cards)</span><span style="color:var(--red)">'+this.fmtMoney(persRev)+'</span></div>';
h+='<div class="breakdown-row"><span>Installment (loans)</span><span style="color:var(--gold)">'+this.fmtMoney(persInst)+'</span></div>';
h+='<div style="font-weight:600;color:var(--text);margin:10px 0 6px;border-top:1px solid var(--border);padding-top:8px;">Business Debt</div>';
h+='<div class="breakdown-row"><span>Revolving (LOC)</span><span style="color:var(--red)">'+this.fmtMoney(bizRev)+'</span></div>';
h+='<div class="breakdown-row"><span>Installment (loans)</span><span style="color:var(--gold)">'+this.fmtMoney(bizInst)+'</span></div>';
if(reDbt>0){h+='<div style="font-weight:600;color:var(--text);margin:10px 0 6px;border-top:1px solid var(--border);padding-top:8px;">Real Estate (property-secured)</div>';
h+='<div class="breakdown-row"><span>Mortgage/HELOC</span><span style="color:var(--blue)">'+this.fmtMoney(reDbt)+'</span></div>';
h+='<div class="breakdown-detail">Does not impact business loan qualification</div>';}
if(insLoan>0)h+='<div class="breakdown-row"><span>Policy Loan</span><span style="color:var(--text2)">'+this.fmtMoney(insLoan)+'</span></div>';
h+='<div class="breakdown-row breakdown-total"><span>Total Outstanding</span><span style="color:var(--red)">'+this.fmtMoney(totalAll)+'</span></div>';
h+='<div style="margin-top:10px;border-top:1px solid var(--border);padding-top:8px;">';
h+='<div class="breakdown-row"><span>Monthly Payments</span><span>'+this.fmtMoney(moPay)+'</span></div>';
const persLim=persRev+(s.available_credit||0),pu=this.calcPersUtil(),bu=this.calcBizUtil();
h+='<div class="breakdown-row"><span>Personal '+this.term('Utilization')+'</span><span style="color:'+(pu>30?'var(--gold)':'var(--accent)')+'">'+pu+'% ('+this.fmtMoney(persRev)+'/'+this.fmtMoney(persLim)+')</span></div>';
if((s.business_credit_limit||0)>0)h+='<div class="breakdown-row"><span>Business '+this.term('Utilization')+'</span><span style="color:'+(bu>50?'var(--gold)':'var(--accent)')+'">'+bu+'% ('+this.fmtMoney(bizRev)+'/'+this.fmtMoney(s.business_credit_limit||0)+')</span></div>';
const bizMoPay=Math.round(((s.total_debt||0)-(s.real_estate_debt||0))*0.018),dti=(s.monthly_revenue||0)>0?Math.round((bizMoPay/s.monthly_revenue)*100):0;
h+='<div class="breakdown-row"><span>DTI (excl RE)</span><span style="color:'+(dti>50?'var(--red)':dti>36?'var(--gold)':'var(--accent)')+'">'+dti+'%</span></div></div>';
this.showPopup('Debt Breakdown',h);},

showEbitda(){const s=this.state,rev=s.monthly_revenue||0,cogs=s.cogs||0,opex=s.operating_expenses||0,ebitda=rev-cogs-opex;this.showPopup(this.term('EBITDA'),'<div class="breakdown-row"><span>Revenue</span><span style="color:var(--accent)">$'+this.fmt(rev)+'</span></div><div class="breakdown-row"><span>- '+this.term('COGS')+'</span><span style="color:var(--red)">$'+this.fmt(cogs)+'</span></div><div class="breakdown-row"><span>- Operating Expenses</span><span style="color:var(--red)">$'+this.fmt(opex)+'</span></div><div class="breakdown-row breakdown-total"><span>= '+this.term('EBITDA')+'</span><span style="color:'+(ebitda>=0?'var(--accent)':'var(--red)')+'">$'+this.fmt(ebitda)+'</span></div>');},

showBurn(){const s=this.state,opex=s.operating_expenses||0,pay=s.owner_pay||0,living=s.living_expenses||0,lifestyle=s.lifestyle_expenses||0,interest=this.calcDebtInterest(),principal=this.calcDebtPrincipal(),total=this.calcMonthlyBurn();let detail='';if(this.state._active_lifestyle_costs&&Object.keys(this.state._active_lifestyle_costs).length)detail=Object.entries(this.state._active_lifestyle_costs).map(([id,cost])=>'<div class="breakdown-detail">· '+id.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())+': $'+this.fmt(cost)+'/mo</div>').join('');const taxRes=this.state._completed_actions.includes('monthly_tax_reserve')?Math.round(((s.monthly_revenue||0)-(s.cogs||0)-(s.operating_expenses||0))*(s.tax_rate||0.25)):0;this.showPopup(this.term('Monthly Burn'),'<div class="breakdown-row"><span>Operating Expenses</span><span>$'+this.fmt(opex)+'</span></div><div class="breakdown-row"><span>Owner\'s Pay</span><span>$'+this.fmt(pay)+'</span></div><div class="breakdown-row"><span>'+this.term('Living Expenses')+'</span><span>$'+this.fmt(living)+'</span></div><div class="breakdown-row"><span>Lifestyle Expenses</span><span>$'+this.fmt(lifestyle)+'</span></div>'+detail+'<div class="breakdown-row"><span>Debt Interest</span><span>$'+this.fmt(interest)+'</span></div><div class="breakdown-row"><span>Debt Principal</span><span>$'+this.fmt(principal)+'</span></div>'+(taxRes?'<div class="breakdown-row"><span>Tax Reserve ('+Math.round((s.tax_rate||0.25)*100)+'%)</span><span>$'+this.fmt(taxRes)+'</span></div>':'')+'<div class="breakdown-row breakdown-total"><span>Total</span><span style="color:var(--red)">$'+this.fmt(total+(taxRes))+'</span></div>');},

showCreditScore(){const s=this.state,score=Math.round(s.personal_credit_score),f=[];
if(s.debt_breakdown&&s.debt_breakdown.collections>0)f.push({l:'Collections on report',i:'negative',d:'$'+this.fmt(s.debt_breakdown.collections)+' in collections'});
if(score<580)f.push({l:'Very low score',i:'negative',d:'Below 580 — most lenders won\'t work with you'});
const persRev=Math.max(0,(s.total_debt||0)-(s._installment_debt||0)-(s.business_credit_used||0)-(s.business_installment_debt||0)),persLim=persRev+(s.available_credit||0),pu=this.calcPersUtil();
if(pu>70)f.push({l:'Very high personal utilization ('+pu+'%)',i:'negative',d:this.fmtMoney(persRev)+' used of '+this.fmtMoney(persLim)+' personal revolving limit.'});
else if(pu>30)f.push({l:'High personal utilization ('+pu+'%)',i:'warning',d:this.fmtMoney(persRev)+' of '+this.fmtMoney(persLim)+'. Below 30% boosts score.'});
else if(persLim>0)f.push({l:'Low personal utilization ('+pu+'%)',i:'positive',d:this.fmtMoney(persRev)+' of '+this.fmtMoney(persLim)+'. Helping your score.'});
const bu=this.calcBizUtil();if((s.business_credit_limit||0)>0){if(bu>50)f.push({l:'High business utilization ('+bu+'%)',i:'warning',d:this.fmtMoney(s.business_credit_used||0)+' of '+this.fmtMoney(s.business_credit_limit||0)});else f.push({l:'Healthy business utilization ('+bu+'%)',i:'positive',d:this.fmtMoney(s.business_credit_used||0)+' of '+this.fmtMoney(s.business_credit_limit||0)});}
const bizMoPay=Math.round(((s.total_debt||0)-(s.real_estate_debt||0))*0.018),moInc=s.monthly_revenue||1,dti=Math.round((bizMoPay/moInc)*100);
if(dti>50)f.push({l:'Very high DTI ('+dti+'%)',i:'negative',d:'Business debt payments exceed 50% of income. RE debt excluded.'});
else if(dti>36)f.push({l:'High DTI ('+dti+'%)',i:'warning',d:'Most lenders want below 36%. RE debt excluded.'});
else if(dti>0)f.push({l:'Healthy DTI ('+dti+'%)',i:'positive',d:'Below 36% — manageable risk. RE debt excluded.'});
if(s.business_credit_profile==='none')f.push({l:'No business credit',i:'warning',d:'Not established yet'});
else if(s.business_credit_profile==='building')f.push({l:'Building business credit',i:'neutral',d:'Being established'});
else f.push({l:'Established business credit',i:'positive',d:'Strong history'});
if(['llc','s_corp','c_corp','multi_entity'].includes(s.entity_structure))f.push({l:'Entity established',i:'positive',d:s.entity_structure.replace(/_/g,' ').toUpperCase()});
if(s._banker_state==='trusted'||s._banker_state==='champion')f.push({l:'Strong banking relationship',i:'positive',d:'Banker trusts you'});
if(!f.length)f.push({l:'Average profile',i:'neutral',d:'No major factors'});
const cm={positive:'var(--accent)',negative:'var(--red)',warning:'var(--gold)',neutral:'var(--text2)'},im={positive:'↑',negative:'↓',warning:'~',neutral:'·'};
this.showPopup('Credit Score','<div style="font-size:1.1rem;font-weight:700;color:'+(score>=700?'var(--accent)':score>=620?'var(--gold)':'var(--red)')+'">'+score+'</div>'+f.map(x=>'<div style="padding:5px 0;border-bottom:1px solid var(--border);"><div style="color:'+cm[x.i]+';font-weight:600;">'+im[x.i]+' '+x.l+'</div><div style="font-size:0.75rem;color:var(--text2);">'+x.d+'</div></div>').join('')+'<div style="margin-top:8px;font-size:0.72rem;color:var(--text2);font-style:italic;">Utilization = revolving credit (cards, LOC) only. DTI = all debt vs income — lenders check this for loans.</div>');},

renderBars(){const s=this.state,e=Math.max(0,Math.min(100,s.energy)),f=Math.max(0,Math.min(100,s.fitness_level||0)),rec=this.calcEnergyRecovery();
const eC=e>60?'var(--accent)':e>30?'var(--gold)':'var(--red)',fC=f>60?'var(--blue)':f>30?'var(--gold)':'var(--red)';
let html='<div class="bar-row"><div class="bar-label"><span>Energy (+'+rec+'/mo)</span><span>'+Math.round(e)+'/100</span></div><div class="bar-track"><div class="bar-fill" style="width:'+e+'%;background:'+eC+'"></div></div></div>';
html+='<div class="bar-row"><div class="bar-label"><span>Fitness</span><span>'+Math.round(f)+'/100</span></div><div class="bar-track"><div class="bar-fill" style="width:'+f+'%;background:'+fC+'"></div></div></div>';
const fr=this.calcFreedom(),frC=fr>60?'var(--accent)':fr>30?'var(--gold)':'var(--red)';
html+='<div class="bar-row"><div class="bar-label"><span>Freedom ('+this.getFounderRole()+')</span><span>'+fr+'/100</span></div><div class="bar-track"><div class="bar-fill" style="width:'+fr+'%;background:'+frC+'"></div></div></div>';
html+='<div style="margin-top:8px;margin-bottom:4px;font-size:0.7rem;color:var(--text2);text-transform:uppercase;letter-spacing:0.5px;">Skills (improve by taking actions)</div>';
const skillData=[{key:'skill_marketing',label:'Marketing Skill',color:'var(--accent)'},{key:'skill_operations',label:'Operations Skill',color:'var(--blue)'},{key:'skill_finance',label:'Finance Skill',color:'var(--gold)'}];
for(const sk of skillData){const val=Math.round(this.state[sk.key]||0);html+='<div class="bar-row"><div class="bar-label"><span>'+sk.label+'</span><span>'+val+'/100</span></div><div class="bar-track"><div class="bar-fill" style="width:'+val+'%;background:'+sk.color+'"></div></div></div>';}
document.getElementById('bars-section').innerHTML=html;},

renderStepIndicator(){const ac=this._activeCats||CATS,ci=ac.indexOf(this.currentCategory),total=ac.length;document.getElementById('step-indicator').innerHTML='Step '+(ci+1)+'/'+total+': '+ac.map(c=>{if(this.selectedActions[c])return'<span style="color:var(--accent)">✓ '+CL[c]+'</span>';if(c===this.currentCategory)return'<span class="step-current">→ '+CL[c]+'</span>';return'<span>'+CL[c]+'</span>';}).join(' · ');},
renderCategoryTabs(){const ac=this._activeCats||CATS;document.getElementById('cat-tabs').innerHTML=ac.map(c=>'<div class="cat-tab '+(this.currentCategory===c?'active':this.selectedActions[c]?'done':'')+'" onclick="Game.switchCategory(\''+c+'\')">'+CL[c]+(this.selectedActions[c]?' ✓':'')+'</div>').join('');},
switchCategory(c){this.currentCategory=c;this._showAllActions=false;this.renderStepIndicator();this.renderCategoryTabs();this.renderActions();},

isActionOutgrown(a){const s=this.state,sk=s['skill_'+a.category]||0;if(a.stage==='foundation'&&sk>40&&this.getStage(a.category)!=='foundation')return true;
const rules={customer_acquisition_sprint:sk>30&&s.customer_base>20,build_delivery_foundation:sk>30&&(s.team_size||0)>1,build_content_presence:sk>40&&s.brand_equity>40,automate_tasks:(s.systems_maturity||0)>30};return rules[a.id]||false;},

renderActions(){const actions=this.getAvailableActions(this.currentCategory),sel=this.selectedActions[this.currentCategory];
const urgency=a=>{const s=this.state;let u=0;
if(s.cash<2000){if(a.effects&&(a.effects.cash>0||a.effects.available_credit>0||a.effects.business_credit_limit>0))u+=10;if(a.id==='bank_personal_loan'||a.id==='business_term_loan'||a.id==='policy_loan'||a.id==='business_credit_line')u+=15;}
if((s.total_debt||0)>20000&&(a.id==='debt_restructure'||a.id==='pay_down_debt'||a.id==='balance_transfer'))u+=8;
if(this.calcPersUtil()>50&&(a.id==='debt_restructure'||a.id==='balance_transfer'||a.id==='qualify_more_credit'))u+=8;
if((s.leads||0)>15&&(a.id==='email_campaign'||a.id==='webinar_funnel'))u+=8;
if((s.team_size||0)>=4&&!s._completed_actions.includes('middle_management')&&a.id==='middle_management')u+=10;
if((s.customer_base||0)<5&&(a.effects&&a.effects.leads>0||a.effects&&a.effects.customer_base>0))u+=8;
if(s.energy<30&&a.energy_cost<0)u+=5;
return u;};
const card=a=>{const done=this.isActionCompleted(a),locked=this.isActionLocked(a),isSel=sel&&sel.id===a.id;const reason=done?'Already completed':locked?this.getLockedReason(a):'';const outgrown=!done&&!locked&&this.isActionOutgrown(a);const cls=done?'completed-action':isSel?'selected':locked?'locked':'';const onclick=(locked||done)?'':"Game.selectActionPayment('"+this.currentCategory+"','"+a.id+"')";const desc=this.linkTerms(a.description);const rc=(this.state._action_counts||{})[a.id]||0;const repeatBadge=(!a.one_time&&rc>0)?'<span class="repeat-badge">×'+rc+'</span>':'';
const needsCredit=!done&&!locked&&a.cash_cost&&this.state.cash<a.cash_cost&&(this.state.cash+(this.state.available_credit||0))>=a.cash_cost;
return'<div class="action-card '+cls+' fade-in" style="'+(outgrown?'opacity:0.6;':'')+'" onclick="'+onclick+'"><h4>'+a.label+repeatBadge+'</h4><p>'+desc+'</p><div class="action-costs">'+
(a.id==='pay_down_debt'?'<span class="cost-tag cost-cash">~'+this.fmtMoney(Math.max(500,Math.round(Math.min(this.state.cash*0.2,(this.state.total_debt||0)*0.15))))+' cash</span>':(a.cash_cost?'<span class="cost-tag cost-cash">$'+this.fmt(a.cash_cost)+'</span>':''))+
(a.energy_cost>0?'<span class="cost-tag cost-energy">⚡-'+a.energy_cost+' energy</span>':'')+
(a.energy_cost<0?'<span class="cost-tag cost-energy-gain">⚡+'+Math.abs(a.energy_cost)+' energy</span>':'')+
(a.recurring_cost?'<span class="cost-tag cost-recurring">$'+a.recurring_cost+'/mo ongoing</span>':'')+
(needsCredit?'<span class="cost-tag" style="background:rgba(59,130,246,0.15);color:var(--blue)">credit available</span>':'')+
(outgrown?'<span class="cost-tag" style="background:rgba(156,163,180,0.1);color:var(--text2);font-size:0.65rem;">lower impact</span>':'')+
(done?'<span class="cost-tag cost-done">✓ Done</span>':'')+
(!done&&locked?'<span class="cost-tag cost-locked">'+reason+'</span>':'')+
'</div></div>';};
if(!this.state._actions_seen)this.state._actions_seen=[];actions.forEach(a=>{if(!this.isActionCompleted(a)&&!this.isActionLocked(a)&&!this.state._actions_seen.includes(a.id))this.state._actions_seen.push(a.id);});
const byId={};actions.forEach(a=>byId[a.id]=a);const dirs=ADIR[this.currentCategory]||[];const cat=this.currentCategory,used={};let listHtml='';
const hdr=t=>'<div style="padding:12px 0 6px;font-size:0.72rem;color:var(--gold);text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid var(--border);margin-top:6px;">'+t+'</div>';
const groups=[];for(const grp of dirs){const inDir=grp[1].map(id=>byId[id]).filter(Boolean);inDir.forEach(a=>used[a.id]=1);const avail=inDir.filter(a=>!this.isActionCompleted(a)&&!this.isActionLocked(a)).sort((a,b)=>urgency(b)-urgency(a));const lockd=inDir.filter(a=>!this.isActionCompleted(a)&&this.isActionLocked(a));if(avail.length||lockd.length)groups.push({name:grp[0],avail,lockd});}
if(!this._openDir)this._openDir={};const cur=this._openDir[cat];if(cur===undefined||(cur!=='__none__'&&!groups.some(g=>g.name===cur))){const def=groups.find(g=>g.avail.length)||groups[0];this._openDir[cat]=def?def.name:'__none__';}
for(const g of groups){const open=this._openDir[cat]===g.name,cnt=g.avail.length,sg=sel&&g.avail.concat(g.lockd).some(a=>a.id===sel.id);listHtml+='<div onclick="Game._openDir[\''+cat+'\']=\''+(open?'__none__':g.name)+'\';Game.renderActions();" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;padding:11px 13px;margin-top:8px;background:var(--surface);border:1px solid '+(sg?'var(--accent)':'var(--border)')+';border-radius:var(--radius-sm);"><span style="font-size:0.9rem;font-weight:600;color:var(--gold);">'+(open?'▾ ':'▸ ')+g.name+(sg?' <span style=\"color:var(--accent);font-size:0.72rem;\">✓ chosen</span>':'')+'</span><span style="font-size:0.72rem;color:var(--text2);">'+(cnt?cnt+(cnt===1?' option':' options'):'—')+'</span></div>';if(open)listHtml+=g.avail.map(card).join('')+g.lockd.map(card).join('');}
const ungrouped=actions.filter(a=>!used[a.id]&&!this.isActionCompleted(a));if(ungrouped.length)listHtml+=ungrouped.map(card).join('');
const completed=actions.filter(a=>this.isActionCompleted(a));if(completed.length){if(this._showAllActions)listHtml+=hdr('Completed')+completed.map(card).join('')+'<div style="text-align:center;padding:10px;"><span style="color:var(--text2);cursor:pointer;font-size:0.85rem;" onclick="Game._showAllActions=false;Game.renderActions();">Show less ▴</span></div>';else listHtml+='<div style="text-align:center;padding:10px;"><span style="color:var(--text2);cursor:pointer;font-size:0.85rem;" onclick="Game._showAllActions=true;Game.renderActions();">Show '+completed.length+' completed ▾</span></div>';}
document.getElementById('action-list').innerHTML=listHtml;},

selectActionPayment(cat,id){const action=this.getAvailableActions(cat).find(a=>a.id===id);if(!action||this.isActionLocked(action))return;
if(action.id==='pay_down_debt'){this._paymentMethod='cash';this.selectAction(cat,id);return;}
if(!action.cash_cost||this.state.cash>=action.cash_cost){this._paymentMethod='cash';this.selectAction(cat,id);return;}
const cost=action.cash_cost,cash=Math.max(0,this.state.cash),creditNeeded=cost-cash,splitFee=Math.round(creditNeeded*0.03),fullFee=Math.round(cost*0.03);
let choices='<div style="margin-bottom:12px;"><strong>'+action.label+'</strong> — '+this.fmtMoney(cost)+'</div>';
if(cash>0)choices+='<div class="choice-card" onclick="Game.hidePopup();Game._paymentMethod=\'split\';Game.selectAction(\''+cat+'\',\''+id+'\')"><h4>Use cash + credit</h4><div class="choice-effects">'+this.fmtMoney(cash)+' cash + '+this.fmtMoney(creditNeeded)+' credit <span style="color:var(--gold)">(+'+this.fmtMoney(splitFee)+' fee)</span></div></div>';
choices+='<div class="choice-card" onclick="Game.hidePopup();Game._paymentMethod=\'credit\';Game.selectAction(\''+cat+'\',\''+id+'\')"><h4>Put it all on credit</h4><div class="choice-effects">'+this.fmtMoney(cost)+' credit <span style="color:var(--gold)">(+'+this.fmtMoney(fullFee)+' fee)</span></div></div>';
this.showPopup('How do you want to pay?',choices);},

getLockedReason(a){const totalFunds=(this.state.cash||0)+(this.state.available_credit||0);if(a.cash_cost&&totalFunds<a.cash_cost)return'Not enough cash or credit';if(a.energy_cost>0&&this.state.energy<a.energy_cost)return'Low energy';for(const[k,v]of Object.entries(a.prerequisites||{})){if(k.endsWith('_gte'))return'Need '+k.replace('_gte','').replace(/_/g,' ')+' ≥ '+v;if(k.endsWith('_lte'))return'Need '+k.replace('_lte','').replace(/_/g,' ')+' ≤ '+v;if(k.endsWith('_in'))return'Need upgrade';}return'Locked';},

selectAction(cat,id){const actions=this.getAvailableActions(cat),action=actions.find(a=>a.id===id);if(!action||this.isActionLocked(action))return;if(this.selectedActions[cat]&&this.selectedActions[cat].id===id){delete this.selectedActions[cat];if(this._paymentMethods)delete this._paymentMethods[id];}else{this.selectedActions[cat]=action;if(!this._paymentMethods)this._paymentMethods={};this._paymentMethods[action.id]=this._paymentMethod||'cash';const ac=this._activeCats||CATS,ci=ac.indexOf(cat);if(ci<ac.length-1&&!this.selectedActions[ac[ci+1]]){setTimeout(()=>{this.currentCategory=ac[ci+1];this._showAllActions=false;this.renderStepIndicator();this.renderCategoryTabs();this.renderActions();this.updateConfirmButton();window.scrollTo({top:document.getElementById('step-indicator').offsetTop-10,behavior:'smooth'});},200);return;}}this.renderStepIndicator();this.renderCategoryTabs();this.renderActions();this.updateConfirmButton();},
updateConfirmButton(){const btn=document.getElementById('confirm-actions-btn'),ac=this._activeCats||CATS,count=Object.keys(this.selectedActions).length,total=ac.length;btn.disabled=false;btn.textContent=count<total?'End Turn ('+count+'/'+total+' actions)':'Confirm Actions →';},
confirmActions(){this.resolveMonth();},

resolveMonth(){
const results=[];
for(const[cat,action]of Object.entries(this.selectedActions)){
const skillKey='skill_'+cat,skillBonus=(this.state[skillKey]||0)/200;
const repeatCount=(this.state._action_counts||{})[action.id]||0;
const EXEMPT_DIM=['debt_restructure','banking_relationship','tax_planning_session','fund_accumulation_policy','policy_loan','pay_down_debt','balance_transfer','build_personal_credit_repair','build_personal_credit_optimize'];
const isDimExempt=action.one_time||EXEMPT_DIM.includes(action.id);
const diminishing=isDimExempt?0:Math.min(0.25,repeatCount*0.05);
const penalty=this.state.energy<30?0.85:1;
const success=Math.random()<((action.success_rate||0.7)*penalty+skillBonus-diminishing);
let effects=success?this.scaleActionEffects(action.effects,cat):(action.failure_effects?this.scaleActionEffects(action.failure_effects,cat):{});
if(!isDimExempt&&repeatCount>2){const dimMult=Math.max(0.4,1-repeatCount*0.1);for(const k in effects){if(typeof effects[k]==='number'&&effects[k]>0&&k!=='team_size')effects[k]=Math.round(effects[k]*dimMult);}}
const DELAY_IDS=['customer_acquisition_sprint','build_content_presence','build_delivery_foundation','scale_delivery','sales_infrastructure','hire_specialists','scale_beyond_limits'];
if(DELAY_IDS.includes(action.id)){const immediate={},delayed={};for(const k in effects){if(typeof effects[k]==='number'){if(k==='energy'||k==='cash'||k==='operating_expenses'||k==='team_size'||k==='key_person_dependency'){immediate[k]=effects[k];}else{delayed[k]=effects[k];}}else{immediate[k]=effects[k];}}
effects=immediate;if(Object.keys(delayed).length){if(!this.state._delayed_effects)this.state._delayed_effects=[];this.state._delayed_effects.push({month:this.month+2,effects:delayed});}}
this.applyEffects(effects);
if(action.id==='pay_down_debt'){const pd=Math.max(500,Math.round(Math.min(this.state.cash*0.2,(this.state.total_debt||0)*0.15)));if(success){this.state.cash-=pd;this.state.total_debt=Math.max(0,this.state.total_debt-pd);this.state.personal_credit_score=Math.min(850,this.state.personal_credit_score+Math.round(pd/500));}else{const pp=Math.round(pd*0.6);this.state.cash-=pp;this.state.total_debt=Math.max(0,this.state.total_debt-pp);this.state.personal_credit_score=Math.min(850,this.state.personal_credit_score+2);}}
const _cost=action.id==='pay_down_debt'?0:(action.cash_cost||0),_pm=(this._paymentMethods||{})[action.id]||'cash';
if(_pm==='credit'){const _fee=Math.round(_cost*0.03);this.state.available_credit-=(_cost+_fee);this.state.total_debt+=(_cost+_fee);}
else if(_pm==='split'){const _fc=Math.min(this.state.cash,_cost),_cc=_cost-_fc,_fee=Math.round(_cc*0.03);this.state.cash-=_fc;this.state.available_credit-=(_cc+_fee);this.state.total_debt+=(_cc+_fee);}
else{if(this.state.cash>=_cost){this.state.cash-=_cost;}else{const _fc=Math.max(0,this.state.cash),_cc=_cost-_fc,_fee=Math.round(_cc*0.03);this.state.cash=0;this.state.available_credit-=(_cc+_fee);this.state.total_debt+=(_cc+_fee);}}
if(action.energy_cost>0)this.state.energy-=action.energy_cost;
if(!this.state._completed_actions.includes(action.id))this.state._completed_actions.push(action.id);
this.state._action_counts[action.id]=(this.state._action_counts[action.id]||0)+1;
this.state[skillKey]=Math.min(100,(this.state[skillKey]||0)+(action.id==='do_work_yourself'?5:2));
if(action.id==='tax_planning_session'&&success)this.state.tax_rate=Math.max(0.15,(this.state.tax_rate||0.25)-0.02);
if(action.id==='policy_loan'&&success){const loanAmt=Math.round((this.state.insurance_cash_value||0)*0.9);this.state.cash+=loanAmt;this.state.insurance_loan_balance=(this.state.insurance_loan_balance||0)+loanAmt;}
if(action.id==='fund_accumulation_policy'&&success){const fundAmt=Math.max(500,Math.round(Math.min(this.state.cash*0.10,this.calcBusinessLevel()*3000)));this.state.cash-=fundAmt;this.state.insurance_cash_value=(this.state.insurance_cash_value||0)+fundAmt;this.state._auto_fund_insurance=true;this.state._insurance_monthly_amount=Math.round(fundAmt/2);}
if(action.id==='debt_restructure'&&success){const s=this.state;const persRev=Math.max(0,(s.total_debt||0)-(s._installment_debt||0)-(s.business_credit_used||0)-(s.business_installment_debt||0));const persLim=persRev+(s.available_credit||0);const beforeUtil=persLim>0?Math.round(persRev/persLim*100):0;const movable=Math.max(0,persRev-(s.real_estate_debt||0));const target=0.22;let swap=Math.max(0,Math.min(movable,Math.round(persRev-target*persLim)));if(swap>0){s._installment_debt=(s._installment_debt||0)+swap;s.available_credit=(s.available_credit||0)+swap;const afterUtil=this.calcPersUtil();s.personal_credit_score=Math.min(850,(s.personal_credit_score||0)+Math.max(4,Math.round((beforeUtil-afterUtil)/2)));s._dyn_narrative='Your lending expert moved '+this.fmtMoney(swap)+' of revolving debt into a fixed-rate installment loan. Utilization dropped from '+beforeUtil+'% to '+afterUtil+'% — now you\'re bankable. Same debt, better structure, higher score.';}else{s._dyn_narrative='Your utilization is already healthy at '+beforeUtil+'%. The expert refined a couple of terms, but there was little revolving debt left to restructure.';}}
if(action.id==='business_term_loan'&&success){const cf=this.calcCreditCapacity();this.state.cash+=Math.round(25000*(cf-1));this.state.total_debt+=Math.round(25000*(cf-1));this.state.available_credit=(this.state.available_credit||0)+Math.round(10000*(cf-1));this.state.business_installment_debt=(this.state.business_installment_debt||0)+Math.round(25000*cf);this.state._dyn_narrative='Your banking relationship delivered a '+this.fmtMoney(Math.round(25000*cf))+' fixed-rate term loan — sized to your revenue and credit.';}
if(action.id==='business_credit_line'&&success){const cf=this.calcCreditCapacity();this.state.business_credit_limit=(this.state.business_credit_limit||0)+Math.round(15000*(cf-1));this.state._dyn_narrative='Approved — a '+this.fmtMoney(Math.round(15000*cf))+' revolving line in the business name. Your credit and revenue did the talking.';}
if(action.id==='qualify_more_credit'&&success){const cf=this.calcCreditCapacity();this.state.business_credit_limit=(this.state.business_credit_limit||0)+Math.round(15000*(cf-1));this.state._dyn_narrative='Approved for '+this.fmtMoney(Math.round(15000*cf))+' in additional credit. Lower utilization, more runway, more leverage on tap.';}
if(action.id==='business_credit_card_0pct'&&success){const cf=this.calcCreditCapacity();this.state.business_credit_limit=(this.state.business_credit_limit||0)+Math.round(10000*(cf-1));this.state._dyn_narrative='Approved: a '+this.fmtMoney(Math.round(10000*cf))+' card at 0% for the intro period. Free money — if you clear it before the rate kicks in.';}
if(action.id==='premium_financing'&&success){const mult=Math.max(1,Math.min(5,(this.state.monthly_revenue||0)/20000));this.state.insurance_cash_value=(this.state.insurance_cash_value||0)+Math.round(25000*(mult-1));this.state.total_debt+=Math.round(20000*(mult-1));this.state._dyn_narrative='Structured: '+this.fmtMoney(Math.round(20000*mult))+' borrowed at low rates funds '+this.fmtMoney(Math.round(25000*mult))+' of tax-free cash value.';}
if(action.id==='bank_personal_loan'&&success){const cf=Math.max(0.6,Math.min(2.5,((this.state.personal_credit_score||600)-560)/120));this.state.cash+=Math.round(10000*(cf-1));this.state.total_debt+=Math.round(10000*(cf-1));this.state._installment_debt=(this.state._installment_debt||0)+Math.round(10000*cf);this.state._dyn_narrative='Approved for '+this.fmtMoney(Math.round(10000*cf))+'. Your credit spoke for itself — funds in your account by Friday.';}
if(action.id==='move_debt_to_business'&&success){const s=this.state,persRev=Math.max(0,(s.total_debt||0)-(s._installment_debt||0)-(s.business_credit_used||0)-(s.business_installment_debt||0)-(s.real_estate_debt||0)),bizAvail=Math.max(0,(s.business_credit_limit||0)-(s.business_credit_used||0)),moveAmt=Math.min(persRev,bizAvail);s.available_credit=(s.available_credit||0)+moveAmt;s.business_credit_used=(s.business_credit_used||0)+moveAmt;}
if(action.id==='buy_real_estate'){const s=this.state;const mult=Math.max(1,Math.min(4,1+(s.monthly_revenue||0)/40000));const baseEq=success?20000:10000,baseMort=success?80000:85000,baseRev=success?2500:1200,baseOpx=success?1800:2200;s.real_estate_debt=(s.real_estate_debt||0)+Math.round(baseMort*mult);s.real_estate_equity=(s.real_estate_equity||0)+Math.round(baseEq*(mult-1));s.total_debt+=Math.round(baseMort*(mult-1));s.operating_expenses=(s.operating_expenses||0)+Math.round(baseOpx*(mult-1));s.other_monthly_revenue=(s.other_monthly_revenue||0)+Math.round(baseRev*mult);if(success)s._dyn_narrative='You closed on a '+this.fmtMoney(Math.round(baseEq*mult)+Math.round(baseMort*mult))+' property — '+this.fmtMoney(Math.round(baseEq*mult))+' equity, '+this.fmtMoney(Math.round(baseMort*mult))+' financed. It cash-flows and appreciates while you sleep.';}
if(action.id==='private_lending'){const s=this.state;if(success){const extra=Math.min(Math.round((s.cash||0)*0.4),180000);if(extra>0){s.cash-=extra;s.investment_positions=(s.investment_positions||0)+extra;}const pos=20000+(extra>0?extra:0);s.other_monthly_revenue=(s.other_monthly_revenue||0)+Math.round(pos*0.012);s._dyn_narrative='You deployed '+this.fmtMoney(pos)+' into private loans at ~14% annual. The interest checks start arriving — you\'re the bank now.';}else{s.other_monthly_revenue=(s.other_monthly_revenue||0)+180;}}
if(action.id==='balance_transfer'&&success){const s=this.state;const revolving=Math.max(0,(s.total_debt||0)-(s._installment_debt||0)-(s.business_installment_debt||0)-(s.real_estate_debt||0)-(s.business_credit_used||0));const transferred=Math.min(revolving,15000);const saved=Math.round(transferred*0.008);s.operating_expenses=Math.max(0,(s.operating_expenses||0)-saved);s._dyn_narrative=transferred>0?'You moved '+this.fmtMoney(transferred)+' of high-interest balances onto a 0% card, cutting about '+this.fmtMoney(saved)+'/mo in interest. Clear it before the intro rate ends.':'Not much high-interest revolving to move — but the new 0% card gives you flexibility.';}
if(action.id==='income_protection'&&success){const annRev=(this.state.monthly_revenue||0)*12,annSal=(this.state.owner_pay||0)*12,liab=this.state.total_debt||0;this.state.insurance_coverage=Math.max(Math.round(annRev*2.5),Math.round(annSal*15))+liab;}
// Lifestyle action handling
if(cat==='lifestyle'){if(action.recurring_cost&&!this.state._active_lifestyle_costs[action.id]){this.state._active_lifestyle_costs[action.id]=action.recurring_cost;this.state.lifestyle_expenses=(this.state.lifestyle_expenses||0)+action.recurring_cost;}
const buffs={mentor_others:{delay:3,effects:{leads:5,brand_equity:5,monthly_revenue:500},narrative:"Your mentee referred a client to you."},volunteer_time:{delay:2,effects:{brand_equity:8,leads:3},narrative:"Someone from the volunteer site reached out — they need what you offer."},faith_community:{delay:4,effects:{leads:4,brand_equity:3,lifestyle_relationships:5},narrative:"A fellow member mentioned your business to their network."},family_trip:{delay:1,effects:{energy:10,lifestyle_relationships:5},narrative:"You came back recharged. The clarity is showing up in your work."},therapy_coaching:{delay:2,effects:{energy:8,lifestyle_health:3},narrative:"The patterns your therapist helped you see — you're catching them now."},learn_new_skill:{delay:3,effects:{brand_equity:5,leads:3},narrative:"The class led to an unexpected client connection."},charity_donation:{delay:2,effects:{brand_equity:8},narrative:"The charity featured your business in their donor spotlight."}};
if(buffs[action.id]){const b=buffs[action.id];if(!this.state._lifestyle_buffs)this.state._lifestyle_buffs=[];this.state._lifestyle_buffs.push({trigger_month:this.month+b.delay,effects:b.effects,narrative:b.narrative,source:action.label});}
this.lifestyleHistory.push(action);}
const _dn=this.state._dyn_narrative;this.state._dyn_narrative=null;this.actionHistory.push(action);results.push({action,success,effects,narrative:_dn||(cat==='lifestyle'?action.narrative:(success?action.narrative_success:action.narrative_failure))});}
this.monthlyTick();this.updateRelationships();this.monthlySnapshots.push(JSON.parse(JSON.stringify(this.state)));
const evt=this.checkEvents();this.showResults(results,evt);},

applyEffects(effects){for(const[k,v]of Object.entries(effects)){if(k==='entity_structure'||k==='business_credit_profile'||k==='trust_structure')this.state[k]=v;else if(k==='collections_removed'){if(this.state.debt_breakdown)delete this.state.debt_breakdown.collections;}else if(typeof v==='boolean')this.state[k]=v;else this.state[k]=(this.state[k]||0)+v;}this.state.energy=Math.max(0,Math.min(100,this.state.energy));this.state.personal_credit_score=Math.max(300,Math.min(850,this.state.personal_credit_score));this.state.brand_equity=Math.max(0,Math.min(100,this.state.brand_equity));this.state.systems_maturity=Math.max(0,Math.min(100,this.state.systems_maturity));this.state.key_person_dependency=Math.max(0,Math.min(100,this.state.key_person_dependency));this.state.fitness_level=Math.max(0,Math.min(100,this.state.fitness_level||0));this.state.churn_rate=Math.max(0,Math.min(0.5,this.state.churn_rate));this.state.customer_base=Math.max(0,this.state.customer_base);this.state.total_debt=Math.max(0,this.state.total_debt);this.state.team_size=Math.max(0,this.state.team_size);this.state.leads=Math.max(0,this.state.leads||0);},

monthlyTick(){const s=this.state;
// Process delayed effects
if(s._delayed_effects){const ready=s._delayed_effects.filter(d=>d.month<=this.month);s._delayed_effects=s._delayed_effects.filter(d=>d.month>this.month);for(const d of ready)this.applyEffects(d.effects);}
// Churn — leaky bucket: a large base with low systems/no retention churns faster
{const sizeChurn=Math.max(0,((s.customer_base||0)-30)/30*0.01)*Math.max(0,1-(s.systems_maturity||0)/100);const effChurn=Math.min(0.4,(s.churn_rate||0)+sizeChurn);s.customer_base=Math.max(0,s.customer_base-Math.floor(s.customer_base*effChurn));}
// Lead conversion
const baseConv=0.05,skillConv=(s.skill_marketing||0)/300,brandConv=(s.brand_equity||0)/1000,offerB=s._completed_actions&&s._completed_actions.includes('build_offer')?0.05:0,crmB=s._completed_actions&&s._completed_actions.includes('crm_pipeline')?0.05:0;
const convRate=Math.min(0.5,baseConv+skillConv+brandConv+offerB+crmB);const converted=Math.floor((s.leads||0)*convRate);
s.customer_base+=converted;s.leads=Math.max(0,(s.leads||0)-converted);
// Revenue = customers × value per customer (recalculated each month)
const revPerCust=Math.round(100+(s.brand_equity||0)*5+(s._completed_actions&&s._completed_actions.includes('build_offer')?200:0)+(s.skill_marketing||0)*2);
s.monthly_revenue=s.customer_base*revPerCust;
// Revenue capacity cap — you can only capture demand up to what the business can deliver; beyond it revenue is heavily dampened (market saturation / strained delivery). Capacity grows via offer, sales infra, systems, team.
{const cap=8000+((s.team_size||0)*5000)+(s.revenue_capacity||0);if(s.monthly_revenue>cap)s.monthly_revenue=Math.round(cap+(s.monthly_revenue-cap)*0.25);}
// Seasonal dip — Q4 each year (months 10-12, 22-24, 34-36)
const monthInYear=((this.month-1)%12)+1;if(monthInYear>=10)s.monthly_revenue=Math.round(s.monthly_revenue*0.85);
s.monthly_revenue+=(s.other_monthly_revenue||0); // persistent income from assets (real estate, lending) — survives the monthly recompute above
// Payroll obligation
const payroll=(s.team_size||0)*2500;if(payroll>0&&s.cash<payroll&&(s.available_credit||0)<payroll){const lost=Math.ceil((payroll-Math.max(0,s.cash))/2500);s.team_size=Math.max(0,(s.team_size||0)-lost);s.key_person_dependency=Math.min(100,(s.key_person_dependency||0)+lost*8);s.operating_expenses=Math.max(0,(s.operating_expenses||0)-lost*2500);}
s.cash+=s.monthly_revenue-s.cogs-s.operating_expenses-(s.owner_pay||0);
const interest=this.calcDebtInterest(),principal=this.calcDebtPrincipal();s.cash-=interest;s.cash-=principal;s.total_debt=Math.max(0,s.total_debt-principal);
s.cash-=(s.living_expenses||0);s.cash-=(s.lifestyle_expenses||0);
// People scaling drag — headcount past 3 without management/systems creates coordination cost
{const team=s.team_size||0;if(team>3){const hasMgmt=s._completed_actions.includes('middle_management')||s._completed_actions.includes('full_systemization')||s._completed_actions.includes('hire_hr_manager');const sysFactor=Math.max(0.1,1-(s.systems_maturity||0)/100);const coordCost=Math.round((team-3)*1500*sysFactor*(hasMgmt?0.3:1));if(coordCost>0)s.cash-=coordCost;}}
// Tax inefficiency drag — high profit without tax structure overpays the IRS every month
{const profit=Math.max(0,s.monthly_revenue-s.cogs-s.operating_expenses-(s.owner_pay||0));if(profit>5000){let ineff=0.10;if(['s_corp','c_corp','multi_entity'].includes(s.entity_structure))ineff-=0.07;if(s._completed_actions.includes('tax_optimization'))ineff-=0.04;if(s._completed_actions.includes('tax_planning_session'))ineff-=0.02;ineff=Math.max(0,ineff)*Math.min(1,profit/40000);s.cash-=Math.round(profit*ineff);}}
const taxableIncome=Math.max(0,s.monthly_revenue-s.cogs-s.operating_expenses);s._ytd_taxable_income=(s._ytd_taxable_income||0)+taxableIncome;
if(s._completed_actions.includes('monthly_tax_reserve')){const res=Math.round(taxableIncome*(s.tax_rate||0.25));s.tax_reserve+=res;s.cash-=res;}
const bizDebtSvc=Math.round(((s.total_debt||0)-(s.real_estate_debt||0))*0.018),ebitda=s.monthly_revenue-s.cogs-s.operating_expenses;s.dscr=bizDebtSvc>0?Math.round((ebitda/bizDebtSvc)*100)/100:99;
s.energy=Math.min(100,s.energy+this.calcEnergyRecovery());s.fitness_level=Math.max(0,(s.fitness_level||0)-1);
if(s.insurance_cash_value>0)s.insurance_cash_value=Math.round(s.insurance_cash_value*1.0057);
if(s.insurance_cash_value>=100000){const moPassive=Math.round(s.insurance_cash_value*0.10/12);s.cash+=moPassive;s.insurance_passive_loan_total=(s.insurance_passive_loan_total||0)+moPassive;}
if(this.month%8===0){const r=Math.random();if(r<0.2){s._market_cycle='recession';s.monthly_revenue=Math.round(s.monthly_revenue*0.85);}else if(r<0.5){s._market_cycle='boom';s.monthly_revenue=Math.round(s.monthly_revenue*1.1);}else s._market_cycle='normal';}
if(s.cash<0&&(s.available_credit||0)>0){const shortfall=Math.abs(s.cash),fee=Math.round(shortfall*0.03),totalDraw=shortfall+fee,actualDraw=Math.min(totalDraw,s.available_credit);s.cash=actualDraw>=totalDraw?0:s.cash+actualDraw;s.available_credit-=actualDraw;s.total_debt+=actualDraw;}
if(s.cash<0&&(s.available_credit||0)<=0){s.cash=0;s.monthly_revenue=Math.round(s.monthly_revenue*0.8);s.personal_credit_score=Math.max(300,s.personal_credit_score-30);}
// Auto-fund insurance
if(s._completed_actions&&s._completed_actions.includes('setup_accumulation_policy')&&s._auto_fund_insurance){const mf=s._insurance_monthly_amount||500;if(s.cash>=mf){s.cash-=mf;s.insurance_cash_value=(s.insurance_cash_value||0)+mf;}}
// Owner salary auto-scales — minimum 10% of revenue, max 20%, 8% monthly raises
if(s.owner_pay>0){const minPay=Math.round(s.monthly_revenue*0.10),maxPay=Math.round(s.monthly_revenue*0.20);if(s.owner_pay<minPay)s.owner_pay=minPay;else if(s.monthly_revenue>s.owner_pay*4)s.owner_pay=Math.round(Math.min(maxPay,s.owner_pay*1.08));}
// Auto-actions from key hires
const bl=this.calcBusinessLevel();
if(s._completed_actions&&s._completed_actions.includes('hire_fractional_cfo')){if(s.business_credit_profile==='building')s.business_credit_profile='established';s.personal_credit_score=Math.min(850,s.personal_credit_score+1);s.business_credit_limit=(s.business_credit_limit||0)+Math.round(500*bl);const pr=Math.max(0,(s.total_debt||0)-(s._installment_debt||0)-(s.business_credit_used||0)-(s.business_installment_debt||0)-(s.real_estate_debt||0));if(pr>1000){const as=Math.round(pr*0.05);s._installment_debt=(s._installment_debt||0)+as;s.available_credit=(s.available_credit||0)+Math.round(as*0.8);}}
if(s._completed_actions&&s._completed_actions.includes('hire_hr_manager')&&this.month%3===0&&s.monthly_revenue>(s.team_size||0)*5000){s.team_size=(s.team_size||0)+1;s.operating_expenses=(s.operating_expenses||0)+2500;s.key_person_dependency=Math.max(0,(s.key_person_dependency||0)-3);}
if(s._completed_actions&&s._completed_actions.includes('hire_sales_rep')){s.leads=(s.leads||0)+Math.round(5*bl);}
if(s._completed_actions&&s._completed_actions.includes('hire_content_creator')){s.brand_equity=Math.min(100,(s.brand_equity||0)+2);s.leads=(s.leads||0)+Math.round(3*bl);}
if(s._completed_actions&&s._completed_actions.includes('hire_client_success')){s.churn_rate=Math.max(0.01,(s.churn_rate||0)-0.005);}
},

updateRelationships(){const s=this.state;if(s.monthly_revenue>10000&&s.dscr>1.5){if(s._banker_state==='stranger')s._banker_state='neutral';else if(s._banker_state==='neutral')s._banker_state='trusted';else if(s._banker_state==='trusted'&&this.month>20)s._banker_state='champion';}else if(s.dscr<1.0)s._banker_state='skeptical';const ls=s.lifestyle_health+s.lifestyle_relationships;if(ls>80)s._family_state='thriving';else if(ls>50)s._family_state='stable';else if(ls>25)s._family_state='coping';else s._family_state='strained';},
checkEvents(){const cs=this.state;cs._bad_debt=Math.max(0,(cs.total_debt||0)-(cs.real_estate_debt||0)-(cs.business_installment_debt||0)-(cs.insurance_loan_balance||0)-(cs._installment_debt||0));for(const evt of CONFIG.events.events.filter(e=>this.meetsReq(e.requires))){let p=evt.base_probability;if(evt.probability_scales_with&&evt.scale_factor)p+=(this.state[evt.probability_scales_with]||0)*evt.scale_factor;if(evt.mitigated_by)for(const id of evt.mitigated_by)if(this.state._completed_actions.includes(id))p*=0.5;if(Math.random()<p)return evt;}return null;},

showResults(results,triggeredEvent){this.showScreen('result-screen');document.getElementById('result-month-label').textContent='Month '+this.month+' — Results';
let html='';if(!results.length)html='<div class="result-narrative fade-in">You took the month off. Sometimes rest is the most productive thing you can do.</div>';
for(const r of results){html+='<div class="result-narrative fade-in"><strong>'+r.action.label+'</strong> — '+(r.success?'<span style="color:var(--accent)">Success</span>':'<span style="color:var(--gold)">Partial</span>')+'<br><br>'+r.narrative+'</div><div class="effect-list">';for(const[k,v]of Object.entries(r.effects)){if(typeof v!=='number'||v===0)continue;const abs=Math.abs(v),isMoney=MK.includes(k);if(isMoney&&abs<500)continue;if(!isMoney&&abs<3)continue;const inv=IK.includes(k),color=inv?(v>0?'var(--red)':'var(--accent)'):(v>0?'var(--accent)':'var(--red)');html+='<div class="effect-item"><span>'+this.formatStatName(k)+'</span><span style="color:'+color+';font-weight:600">'+(isMoney?this.fmtMoney(v):(v>0?'+':'')+v)+'</span></div>';}html+='</div>';if(r.success&&r.action.lesson&&!(this.state._lessons_shown||[]).includes(r.action.id)){(this.state._lessons_shown=(this.state._lessons_shown||[])).push(r.action.id);html+='<div class="narrative-box fade-in" style="border-left-color:var(--gold);margin-top:8px;"><strong>💡 The Real Lesson</strong><br>'+this.linkTerms(r.action.lesson)+'</div>';}}
document.getElementById('results-content').innerHTML=html;this._pendingEvent=triggeredEvent;this._pendingTax=(this.month===12||this.month===24||this.month===36);},

nextMonth(){
if(this._pendingEvent){const e=this._pendingEvent;this._pendingEvent=null;this.showEvent(e);return;}
if(this._pendingTax){this._pendingTax=false;this.showTaxEvent();return;}
// Batch all lifestyle buffs into one screen
const triggered=(this.state._lifestyle_buffs||[]).filter(b=>b.trigger_month<=this.month);
if(triggered.length){this.state._lifestyle_buffs=(this.state._lifestyle_buffs||[]).filter(b=>b.trigger_month>this.month);
let bhtml='';for(const buff of triggered){this.applyEffects(buff.effects);bhtml+='<div class="result-narrative fade-in"><strong>'+buff.source+' — Payoff</strong><br><br>'+buff.narrative+'</div>';}
this.showScreen('result-screen');document.getElementById('result-month-label').textContent='Ripples From Past Choices';document.getElementById('results-content').innerHTML=bhtml;return;}
if(this.month===12||this.month===24||this.month===36){this.showCheckpoint();return;}
this.month++;if(this.month>36){this.endGame();return;}this.renderMonth();},

showEvent(evt){this.showScreen('event-screen');document.getElementById('event-month-label').textContent='Month '+this.month+' — Event';document.getElementById('event-box').innerHTML='<div class="event-category">'+evt.category+'</div><div class="event-narrative">'+evt.narrative+'</div>';const mit=(evt.mitigated_by||[]).filter(id=>this.state._completed_actions.includes(id));let note=mit.length?'<div class="narrative-box fade-in" style="border-left-color:var(--accent);margin-bottom:12px;"><strong>Your preparation pays off.</strong> Impact reduced.</div>':'';
evt._scaledChoices=evt.choices.map(c=>({label:c.label,outcome_narrative:c.outcome_narrative,effects:this.scaleEventEffects(c.effects)}));
document.getElementById('event-choices').innerHTML=note+evt._scaledChoices.map((c,i)=>{const eff=Object.entries(c.effects).filter(([k,v])=>typeof v==='number'&&v!==0).map(([k,v])=>(MK.includes(k)?this.fmtMoney(v):(v>0?'+':'')+v)+' '+this.formatStatName(k)).join(', ');return'<div class="choice-card fade-in" onclick="Game.resolveEvent('+i+')"><h4>'+c.label+'</h4><div class="choice-effects">'+eff+'</div></div>';}).join('');this.currentEvent=evt;this.eventHistory.push(evt);},

resolveEvent(ci){const evt=this.currentEvent,c=evt._scaledChoices?evt._scaledChoices[ci]:evt.choices[ci];
// Risk & consequence: protection (e.g. LLC, asset protection) changes the OUTCOME and explains why — see DESIGN.md legibility goal.
let effects=Object.assign({},c.effects),protNote='';
if(evt.protection){let shielded=false;if(evt.protection.shielded_when)shielded=this.meetsReq(evt.protection.shielded_when);if(!shielded&&evt.protection.shielded_by)shielded=(this.state._completed_actions||[]).includes(evt.protection.shielded_by);
if(shielded){protNote='<div class="narrative-box fade-in" style="border-left-color:var(--accent);margin-top:12px;"><strong>Protected.</strong> '+evt.protection.protected_note+'</div>';if(evt.protection.shielded_multiplier!=null)for(const k in effects){if(typeof effects[k]==='number')effects[k]=Math.round(effects[k]*evt.protection.shielded_multiplier);}}
else{protNote='<div class="narrative-box fade-in" style="border-left-color:var(--red);margin-top:12px;"><strong>Unprotected.</strong> '+evt.protection.unprotected_note+'</div>';if(evt.protection.unprotected_extra)for(const k in evt.protection.unprotected_extra){const v=evt.protection.unprotected_extra[k];effects[k]=(typeof effects[k]==='number'?effects[k]:0)+v;}}}
this.applyEffects(effects);this.showScreen('result-screen');document.getElementById('result-month-label').textContent='Event Outcome';document.getElementById('results-content').innerHTML='<div class="result-narrative fade-in"><strong>'+c.label+'</strong><br><br>'+c.outcome_narrative+'</div><div class="effect-list">'+Object.entries(effects).filter(([k,v])=>typeof v==='number'&&v!==0).map(([k,v])=>{const inv=IK.includes(k),color=inv?(v>0?'var(--red)':'var(--accent)'):(v>0?'var(--accent)':'var(--red)');return'<div class="effect-item"><span>'+this.formatStatName(k)+'</span><span style="color:'+color+';font-weight:600">'+(MK.includes(k)?this.fmtMoney(v):(v>0?'+':'')+v)+'</span></div>';}).join('')+'</div>'+protNote;this.currentEvent=null;},

showTaxEvent(){const s=this.state,taxOwed=Math.round((s._ytd_taxable_income||0)*(s.tax_rate||0.25)),year=Math.ceil(this.month/12);
this.showScreen('event-screen');document.getElementById('event-month-label').textContent='Tax Season — Year '+year;
document.getElementById('event-box').innerHTML='<div class="event-category">TAXES</div><div class="event-narrative">The IRS doesn\'t care how hard your year was. Your accountant slides the number across the table: <strong>$'+this.fmt(taxOwed)+'</strong> owed.'+(s.tax_reserve>0?' You have $'+this.fmt(s.tax_reserve)+' in your tax reserve.':'')+'</div>';
let choices=[];
if(s.cash>=taxOwed)choices.push('<div class="choice-card fade-in" onclick="Game.resolveTax(\'cash\','+taxOwed+')"><h4>Pay in full from cash</h4><div class="choice-effects">-$'+this.fmt(taxOwed)+' cash</div></div>');
if(s.tax_reserve>=taxOwed)choices.push('<div class="choice-card fade-in" onclick="Game.resolveTax(\'reserve\','+taxOwed+')"><h4>Pay from tax reserve</h4><div class="choice-effects">-$'+this.fmt(taxOwed)+' from reserve</div></div>');
if(s.tax_reserve>0&&s.tax_reserve<taxOwed){const remainder=taxOwed-s.tax_reserve;choices.push('<div class="choice-card fade-in" onclick="Game.resolveTax(\'partial_reserve\','+taxOwed+')"><h4>Use reserve + pay rest from cash</h4><div class="choice-effects">-$'+this.fmt(s.tax_reserve)+' reserve, -$'+this.fmt(remainder)+' cash</div></div>');}
const partial=Math.round(taxOwed*0.3),debt=Math.round(taxOwed*0.7);
choices.push('<div class="choice-card fade-in" onclick="Game.resolveTax(\'plan\','+taxOwed+')"><h4>Pay what you can, payment plan</h4><div class="choice-effects">-$'+this.fmt(partial)+' cash, +$'+this.fmt(debt)+' debt, +audit risk</div></div>');
choices.push('<div class="choice-card fade-in" onclick="Game.resolveTax(\'extend\','+taxOwed+')"><h4>Can\'t pay — request extension</h4><div class="choice-effects">+$'+this.fmt(taxOwed)+' debt, -15 credit score, +audit risk</div></div>');
document.getElementById('event-choices').innerHTML=choices.join('');this.currentEvent=null;},

resolveTax(method,amount){const s=this.state;let narrative='';
if(method==='cash'){s.cash-=amount;narrative='Check written. Painful, but clean.';}
else if(method==='reserve'){s.tax_reserve-=amount;narrative='This is exactly what the reserve was for.';}
else if(method==='partial_reserve'){const remainder=amount-s.tax_reserve;s.cash-=remainder;s.tax_reserve=0;narrative='Reserve covered most of it. The rest came from cash.';}
else if(method==='plan'){s.cash-=Math.round(amount*0.3);s.total_debt+=Math.round(amount*0.7);s.audit_risk+=10;s.operating_expenses+=Math.round(amount*0.7/12);narrative='Payment plan set up. Interest and penalties apply. Added to monthly obligations.';}
else{s.total_debt+=amount;s.audit_risk+=20;s.personal_credit_score=Math.max(300,s.personal_credit_score-15);s.operating_expenses+=Math.round(amount/12);narrative='Extension filed. The debt compounds, and the IRS remembers.';}
s._ytd_taxable_income=0;
this.showScreen('result-screen');document.getElementById('result-month-label').textContent='Tax Outcome';
document.getElementById('results-content').innerHTML='<div class="result-narrative fade-in">'+narrative+'</div>';
this._pendingTax=false;},

showCheckpoint(){
const scores=this.calculateFinalScores(),composite=this.calcComposite(scores),year=Math.ceil(this.month/12);
let html='<div class="month-header"><h2>Year '+year+' Complete</h2></div>';
html+='<div class="checkpoint-label">COMPOSITE SCORE</div><div class="checkpoint-score">'+composite+' <span style="font-size:0.9rem;color:var(--text2)">/ 1000</span></div>';
html+='<div class="radar-wrap"><canvas id="cp-radar" width="260" height="260"></canvas></div>';
const labels={net_worth:'Net Worth',business_revenue:'Revenue',passive_income:'Passive',leverage_efficiency:'Leverage',tax_efficiency:'Tax Eff.',lifestyle:'Lifestyle'};
html+='<div class="stats-grid">'+Object.entries(scores).map(([k,v])=>'<div class="stat-card"><div class="stat-value" style="color:var(--accent)">'+Math.round(v)+'</div><div class="stat-label">'+(labels[k]||k)+'</div></div>').join('')+'</div>';
if(this.month<36)html+='<button class="btn-primary" onclick="Game.continueFromCheckpoint()">Keep Going — Year '+(year+1)+'</button>';
html+='<button class="btn-outline" onclick="Game.endGame()" style="margin-top:8px;">Cash Out — End My Run</button>';
document.getElementById('checkpoint-content').innerHTML=html;this.showScreen('checkpoint-screen');
setTimeout(()=>{const cv=document.getElementById('cp-radar');if(cv)this.drawRadarOn(cv,scores);},100);},

continueFromCheckpoint(){this.month++;this.renderMonth();},

showLifestyleScreen(){this.showScreen('lifestyle-screen');this.selectedLifestyle=null;const s=this.state;const scores=[{label:'Health',value:Math.round(s.lifestyle_health),color:s.lifestyle_health>40?'positive':'negative'},{label:'Relationships',value:Math.round(s.lifestyle_relationships),color:s.lifestyle_relationships>40?'positive':'negative'},{label:'Experiences',value:Math.round(s.lifestyle_experiences),color:'neutral'},{label:'Spiritual',value:Math.round(s.lifestyle_spiritual),color:'neutral'},{label:'Philanthropy',value:Math.round(s.lifestyle_philanthropy),color:'neutral'},{label:'Legacy',value:Math.round(s.lifestyle_legacy),color:'neutral'}];document.getElementById('lifestyle-scores').innerHTML='<div style="display:flex;gap:8px;margin-bottom:8px;grid-column:span 3;"><div class="stat-card" style="flex:1;"><div class="stat-value stat-positive" style="font-size:0.9rem;">'+this.fmtMoney(s.cash)+'</div><div class="stat-label">Cash</div></div><div class="stat-card" style="flex:1;"><div class="stat-value stat-neutral" style="font-size:0.9rem;">'+this.fmtMoney(s.available_credit||0)+'</div><div class="stat-label">Credit</div></div></div>'+scores.map(st=>'<div class="stat-card"><div class="stat-value stat-'+st.color+'">'+st.value+'</div><div class="stat-label">'+st.label+'</div></div>').join('');
this._sortedLifestyle=[...CONFIG.lifestyle_options.actions];
const subScores={health:s.lifestyle_health||0,relationships:s.lifestyle_relationships||0,experiences:s.lifestyle_experiences||0,spiritual:s.lifestyle_spiritual||0,philanthropy:s.lifestyle_philanthropy||0,legacy:s.lifestyle_legacy||0};
let listHtml='',curSub='';
this._sortedLifestyle.forEach(a=>{
if(a.subcategory!==curSub){curSub=a.subcategory;listHtml+='<div style="padding:10px 0 6px;font-size:0.75rem;color:var(--gold);text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid var(--border);margin-top:8px;">'+curSub+(subScores[curSub]!==undefined?' <span style="color:var(--text2);text-transform:none;letter-spacing:0;">— Score: '+Math.round(subScores[curSub])+'</span>':'')+'</div>';}
const afford=this.state.cash>=(a.cash_cost||0),active=a.recurring_cost&&this.state._active_lifestyle_costs&&this.state._active_lifestyle_costs[a.id];
const outgrown=afford&&(a.cash_cost||0)<3000&&(subScores[a.subcategory]||0)>60;
const lrc=(this.state._action_counts||{})[a.id]||0,lRepeat=lrc>0?'<span class="repeat-badge">×'+lrc+'</span>':'';
const tier=(a.cash_cost||0)>=8000?'Premium':(a.cash_cost||0)>=3000?'Standard':'Basic';
const tierColor=tier==='Premium'?'var(--gold)':tier==='Standard'?'var(--blue)':'var(--text2)';
listHtml+='<div class="action-card '+(afford?'':'locked')+' fade-in" style="'+(outgrown?'opacity:0.6;':'')+'" onclick="'+(afford?"Game.selectLifestyle('"+a.id+"')":'')+'"><h4>'+a.label+lRepeat+(active?' <span style="color:var(--accent);font-size:0.75rem;">(active)</span>':'')+' <span style="font-size:0.65rem;color:'+tierColor+'">'+tier+'</span></h4><p>'+a.description+'</p><div class="action-costs">'+(a.cash_cost?'<span class="cost-tag cost-cash">$'+this.fmt(a.cash_cost)+'</span>':'')+(a.energy_cost<0?'<span class="cost-tag cost-energy-gain">⚡+'+Math.abs(a.energy_cost)+' energy</span>':'')+(a.recurring_cost&&!active?'<span class="cost-tag cost-recurring">$'+a.recurring_cost+'/mo ongoing</span>':'')+(outgrown?'<span class="cost-tag" style="background:rgba(156,163,180,0.1);color:var(--text2);font-size:0.65rem;">lower impact</span>':'')+'</div></div>';});
document.getElementById('lifestyle-list').innerHTML=listHtml;
document.getElementById('lifestyle-btn').disabled=true;},

selectLifestyle(id){const list=this._sortedLifestyle||CONFIG.lifestyle_options.actions;this.selectedLifestyle=list.find(a=>a.id===id);document.querySelectorAll('#lifestyle-list .action-card').forEach(c=>c.classList.remove('selected'));const idx=list.findIndex(a=>a.id===id),cards=document.querySelectorAll('#lifestyle-list .action-card');if(cards[idx])cards[idx].classList.add('selected');document.getElementById('lifestyle-btn').disabled=false;document.getElementById('lifestyle-btn').textContent='Choose: '+this.selectedLifestyle.label;},

confirmLifestyle(){if(!this.selectedLifestyle)return;const a=this.selectedLifestyle;this.state.cash-=(a.cash_cost||0);this.applyEffects(a.effects);if(a.recurring_cost&&!this.state._active_lifestyle_costs[a.id]){this.state._active_lifestyle_costs[a.id]=a.recurring_cost;this.state.lifestyle_expenses=(this.state.lifestyle_expenses||0)+a.recurring_cost;}
const buffs={mentor_others:{delay:3,effects:{leads:5,brand_equity:5,monthly_revenue:500},narrative:"Your mentee referred a client to you. 'You helped me — let me return the favor,' she said."},volunteer_time:{delay:2,effects:{brand_equity:8,leads:3},narrative:"Someone from the volunteer site reached out — they need exactly what you offer. 'I liked how you showed up that Saturday.'"},faith_community:{delay:4,effects:{leads:4,brand_equity:3,lifestyle_relationships:5},narrative:"A fellow member mentioned your business to their network. Three warm introductions this week."},family_trip:{delay:1,effects:{energy:10,lifestyle_relationships:5},narrative:"You came back recharged. Your partner said you seem lighter. The clarity is showing up in your work."},therapy_coaching:{delay:2,effects:{energy:8,lifestyle_health:3},narrative:"The patterns your therapist helped you see — you're catching them in real time now."},learn_new_skill:{delay:3,effects:{brand_equity:5,leads:3},narrative:"The class led to an unexpected connection — your instructor runs a business and just became a client."},charity_donation:{delay:2,effects:{brand_equity:8},narrative:"The charity featured your business in their donor spotlight newsletter. 2,000 people saw it."}};
if(buffs[a.id]){const b=buffs[a.id];if(!this.state._lifestyle_buffs)this.state._lifestyle_buffs=[];this.state._lifestyle_buffs.push({trigger_month:this.month+b.delay,effects:b.effects,narrative:b.narrative,source:a.label});}
if(!this.state._action_counts)this.state._action_counts={};this.state._action_counts[a.id]=(this.state._action_counts[a.id]||0)+1;
this.lifestyleHistory.push(a);this.showScreen('result-screen');document.getElementById('result-month-label').textContent='Lifestyle — '+a.subcategory;document.getElementById('results-content').innerHTML='<div class="result-narrative fade-in"><strong>'+a.label+'</strong><br><br>'+a.narrative+'</div>';this.selectedLifestyle=null;},

skipLifestyle(){this.state.lifestyle_health=Math.max(0,(this.state.lifestyle_health||0)-2);this.state.lifestyle_relationships=Math.max(0,(this.state.lifestyle_relationships||0)-2);this.state.energy=Math.max(0,this.state.energy-3);this.showScreen('result-screen');document.getElementById('result-month-label').textContent='Quarterly Check-In — Skipped';document.getElementById('results-content').innerHTML='<div class="result-narrative fade-in">You skipped the life check-in this quarter. The business needed every dollar and every hour. But the people in your life noticed your absence — and so did your body.<br><br><div class="effect-list"><div class="effect-item"><span>Health</span><span style="color:var(--red)">-2</span></div><div class="effect-item"><span>Relationships</span><span style="color:var(--red)">-2</span></div><div class="effect-item"><span>Energy</span><span style="color:var(--red)">-3</span></div></div></div>';},

buildDebrief(){const s=this.state,c=id=>s._completed_actions&&s._completed_actions.includes(id),seen=id=>s._actions_seen&&s._actions_seen.includes(id),sa=ids=>ids.some(seen);
const items=[
{done:c('form_llc')||['llc','s_corp','c_corp','multi_entity'].includes(s.entity_structure),ids:['form_llc'],name:'Legal Protection',got:'You shielded your personal assets behind an LLC.',miss:'You saw the LLC option but never formed one — one lawsuit could reach everything you own.'},
{done:c('build_personal_credit_optimize')||c('build_personal_credit_repair'),ids:['build_personal_credit_optimize','build_personal_credit_repair'],name:'Credit Building',got:'You built your credit into an asset that unlocks cheap capital.',miss:'Credit-building was on the menu but you skipped it — the key that unlocks all good debt.'},
{done:c('payroll_setup'),ids:['payroll_setup'],name:'Pay Yourself Properly',got:'You put yourself on real payroll — clean books and S-Corp ready.',miss:'Owner payroll was available — skipping it left tax savings and lender credibility behind.'},
{done:c('s_corp_election'),ids:['s_corp_election'],name:'Tax-Smart Structure',got:'You elected S-Corp and legally cut your self-employment tax.',miss:'The S-Corp election was on the table — a tax lever employees never get.'},
{done:c('setup_accumulation_policy'),ids:['setup_accumulation_policy'],name:'The Tax-Free Money Engine',got:'You opened a cash-value policy — your tax-advantaged wealth engine.',miss:'You could have opened a cash-value policy — the tax-free passive income engine, untouched.'},
{done:(s.insurance_passive_loan_total||0)>0||(s.insurance_cash_value||0)>=100000,ids:['fund_accumulation_policy','policy_loan','setup_accumulation_policy'],name:'Tax-Free Passive Income',got:'Your policy throws off tax-free passive income — money without work.',miss:'You started down the policy path but never reached passive tax-free income.'},
{done:c('buy_real_estate')||(s.real_estate_owned||0)>0,ids:['buy_real_estate'],name:'Leverage Into Assets',got:"You used the bank's money to control income-producing property.",miss:'Real estate was available — you never used leverage to acquire a cash-flowing asset.'},
{done:c('private_lending'),ids:['private_lending'],name:'Become the Bank',got:"You lent capital for returns — money working while you don't.",miss:'Private lending was on the menu — you never put your capital to work as a lender.'},
{done:c('asset_protection')||c('multi_entity')||(s.trust_structure&&s.trust_structure!=='none'),ids:['asset_protection','multi_entity'],name:'Asset Protection',got:"You walled off your wealth so a lawsuit can't reach it.",miss:'Asset protection was available — your wealth sat exposed without it.'},
{done:c('build_offer'),ids:['build_offer'],name:'Irresistible Offer',got:'You packaged a premium offer that sells itself.',miss:'Refining your offer was available — the fastest lever on revenue, left unpulled.'},
{done:c('full_systemization')||(s.key_person_dependency!=null&&s.key_person_dependency<30),ids:['full_systemization'],name:'Systems = Freedom',got:'You built a business that runs without you — real freedom.',miss:'Full systemization was within reach — the business still leans on you.'}];
const learned=items.filter(i=>i.done),missed=items.filter(i=>!i.done&&sa(i.ids));
let h='<div class="epilogue-box" style="text-align:left;margin-top:16px;"><div style="font-size:1.1rem;font-weight:700;color:var(--gold);margin-bottom:4px;">What You Learned</div><div style="color:var(--text2);font-size:0.85rem;margin-bottom:10px;">You put '+learned.length+' core wealth principles into practice'+(missed.length?', and left '+missed.length+' on the table.':'.')+'</div>';
if(learned.length){h+='<div style="color:var(--text2);font-size:0.72rem;text-transform:uppercase;letter-spacing:1px;margin:10px 0 6px;">Put Into Practice</div>';for(const i of learned)h+='<div style="margin-bottom:7px;font-size:0.9rem;"><span style="color:var(--accent);font-weight:600;">&#10003; '+i.name+'</span> — '+i.got+'</div>';}
if(missed.length){h+='<div style="color:var(--text2);font-size:0.72rem;text-transform:uppercase;letter-spacing:1px;margin:14px 0 6px;">Left On The Table <span style="text-transform:none;opacity:0.7;">(you saw these but didn\'t take them)</span></div>';for(const i of missed)h+='<div style="margin-bottom:7px;font-size:0.9rem;opacity:0.9;"><span style="color:var(--gold);font-weight:600;">&#9675; '+i.name+'</span> — '+i.miss+'</div>';}
h+='</div>';return h;},
endGame(){
this.showScreen('end-screen');const scores=this.calculateFinalScores(),arch=this.determineArchetype(scores),composite=this.calcComposite(scores);
document.getElementById('end-title').textContent=arch.title;document.getElementById('end-subtitle').textContent=arch.subtitle;
this.drawRadarOn(document.getElementById('radar-canvas'),scores);
const labels={net_worth:'Net Worth',business_revenue:'Revenue',passive_income:'Passive Income',leverage_efficiency:'Leverage',tax_efficiency:'Tax Efficiency',lifestyle:'Lifestyle'};
document.getElementById('score-breakdown').innerHTML='<div class="stat-card wide"><div class="stat-value" style="color:var(--gold);font-size:1.5rem;">'+composite+' <span style="font-size:0.8rem;color:var(--text2)">/ 1000</span></div><div class="stat-label">Composite Score</div></div>'+Object.entries(scores).map(([k,v])=>'<div class="stat-card"><div class="stat-value" style="color:var(--accent)">'+Math.round(v)+'</div><div class="stat-label">'+(labels[k]||k)+'</div></div>').join('');
document.getElementById('epilogue').textContent=arch.epilogue;
document.getElementById('epilogue').insertAdjacentHTML('afterend',this.buildDebrief());
document.getElementById('end-save').innerHTML='<input id="player-name" class="name-input" placeholder="Enter your name for the leaderboard" maxlength="20"><button class="btn-primary" onclick="Game.saveToLeaderboard()">Save to Leaderboard</button>';},

saveToLeaderboard(){
const name=(document.getElementById('player-name').value||'').trim()||'Anonymous';
const scores=this.calculateFinalScores(),composite=this.calcComposite(scores);
const entry={name,archetype:this.archetype.id,months:this.month>36?36:this.month,composite,scores,date:new Date().toISOString().split('T')[0]};
let lb=JSON.parse(localStorage.getItem('ep_leaderboard')||'[]');lb.push(entry);localStorage.setItem('ep_leaderboard',JSON.stringify(lb));
const isRecord=lb.filter(e=>e.archetype===entry.archetype&&e.months===entry.months).sort((a,b)=>b.composite-a.composite)[0].name===entry.name;
document.getElementById('end-save').innerHTML='<div style="text-align:center;color:var(--accent);font-weight:600;margin:12px 0;">✓ Saved!'+(isRecord?' New record for '+this.archetype.label+' — '+entry.months+' months!':'')+'</div><button class="btn-outline" onclick="Game.showLeaderboard(\'end\')">View Leaderboard</button>';},

showLeaderboard(from){
this._lbFrom=from||'title';this.showScreen('leaderboard-screen');
const lb=JSON.parse(localStorage.getItem('ep_leaderboard')||'[]');
const archetypes=['stuck','new','established'],durations=[12,24,36];
const archLabels={stuck:'Stuck',new:'New',established:'Established'};
const selArch=this.archetype?this.archetype.id:'new',selDur=this.month||36;
let html='<div class="month-header"><h2>Leaderboard</h2></div>';
html+='<div class="lb-tabs" id="lb-arch-tabs">'+archetypes.map(a=>'<div class="lb-tab '+(a===selArch?'active':'')+'" onclick="Game.filterLB(\''+a+'\')">'+archLabels[a]+'</div>').join('')+'</div>';
html+='<div class="lb-tabs" id="lb-dur-tabs">'+durations.map(d=>'<div class="lb-tab '+(d===Math.min(36,Math.ceil(selDur/12)*12)?'active':'')+'" onclick="Game.filterLBDur('+d+')">'+d+' Mo</div>').join('')+'</div>';
html+='<div id="lb-list"></div>';
html+='<button class="btn-secondary" onclick="Game.showScreen(\''+(from==='end'?'end-screen':'title-screen')+'\')">Back</button>';
document.getElementById('lb-content').innerHTML=html;
this._lbArch=selArch;this._lbDur=Math.min(36,Math.ceil(selDur/12)*12);this.renderLBList();},

filterLB(arch){this._lbArch=arch;document.querySelectorAll('#lb-arch-tabs .lb-tab').forEach(t=>t.classList.remove('active'));event.target.classList.add('active');this.renderLBList();},
filterLBDur(dur){this._lbDur=dur;document.querySelectorAll('#lb-dur-tabs .lb-tab').forEach(t=>t.classList.remove('active'));event.target.classList.add('active');this.renderLBList();},

renderLBList(){const lb=JSON.parse(localStorage.getItem('ep_leaderboard')||'[]');const filtered=lb.filter(e=>e.archetype===this._lbArch&&e.months===this._lbDur).sort((a,b)=>b.composite-a.composite).slice(0,10);
document.getElementById('lb-list').innerHTML=filtered.length?filtered.map((e,i)=>'<div class="lb-entry fade-in"><span class="lb-rank">#'+(i+1)+'</span><span class="lb-name">'+e.name+'</span><span class="lb-score">'+e.composite+'pts</span><span class="lb-date">'+e.date+'</span></div>').join(''):'<div style="text-align:center;color:var(--text2);padding:30px;">No runs completed yet for this category.</div>';},

// v2 scoring — see DESIGN.md. Capital efficiency wins, not raw revenue.
calculateFinalScores(){const s=this.state;
const cv=s.insurance_cash_value||0,reOwned=s.real_estate_owned||0,reEquity=s.real_estate_equity||0,reDebt=s.real_estate_debt||0,invest=s.investment_positions||0,polLoan=s.insurance_loan_balance||0,bd=s.debt_breakdown||{};
const badDebt=(bd.credit_card||0)+(bd.collections||0);
const otherDebt=Math.max(0,(s.total_debt||0)-reDebt-(bd.credit_card||0)-(bd.collections||0)-polLoan);
// Passive, mostly tax-free, monthly income: policy-loan income (10%/yr once CV>=250k) + RE cashflow (~$700/property) + lending interest (12%/yr)
const passiveMonthly=(cv>=100000?cv*0.10/12:0)+reOwned*700+invest*0.01;
// Leverage efficiency: % of productive asset base financed with good (OPM) debt, ramped by asset scale
const controlled=reEquity+reDebt+invest+cv,goodDebt=reDebt+(s.business_installment_debt||0)+polLoan;
const lev=controlled<1000?0:Math.min(100,(goodDebt/controlled)*130*Math.min(1,controlled/50000));
// Net worth, leverage-aware: mortgage already netted inside reEquity; bad debt counts fully, other debt half, good debt not subtracted
const nw=(s.cash||0)+reEquity+invest+cv-polLoan-badDebt-otherDebt*0.5+(s.available_credit||0)*0.1;
const taxFreeBonus=passiveMonthly>0?Math.min(20,passiveMonthly/300):0;
return{net_worth:Math.min(100,Math.max(0,(nw/250000)*100)),business_revenue:Math.min(100,(s.monthly_revenue||0)/600),passive_income:Math.min(100,passiveMonthly/120),leverage_efficiency:Math.round(lev),tax_efficiency:Math.min(100,Math.max(0,30+(['s_corp','c_corp','multi_entity'].includes(s.entity_structure)?20:0)+((s.trust_structure&&s.trust_structure!=='none')?15:0)-(s._audit_events||0)*10+((0.25-(s.tax_rate||0.25))*200)+taxFreeBonus)),lifestyle:Math.min(100,(s.lifestyle_health||0)*0.2+(s.lifestyle_relationships||0)*0.2+(s.lifestyle_experiences||0)*0.15+(s.lifestyle_spiritual||0)*0.15+(s.lifestyle_philanthropy||0)*0.15+(s.lifestyle_legacy||0)*0.15)};},
// Strong lifestyle gate: a wrecked life caps the final score (no "paradise" if you burned out). lifestyle 65+ = full, ~32 = half, floored at 0.3.
calcComposite(scores){const w=CONFIG.scoring_weights?CONFIG.scoring_weights.dimensions:{};let c=0;for(const[k,d]of Object.entries(w))c+=(scores[k]||0)*(d.weight||0);const gate=Math.max(0.3,Math.min(1,(scores.lifestyle||0)/65));return Math.round(c*10*gate);},
determineArchetype(scores){let best=CONFIG.archetypes.win_archetypes[0],bs=-1;for(const a of CONFIG.archetypes.win_archetypes){let sc=0;if(a.requires_dominant&&scores[a.requires_dominant])sc=scores[a.requires_dominant];if(a.requires_secondary&&scores[a.requires_secondary])sc+=scores[a.requires_secondary]*0.5;if(a.requires_low)sc+=scores[a.requires_low]<30?20:-30;if(sc>bs){bs=sc;best=a;}}return best;},

drawRadarOn(canvas,scores){const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height,cx=w/2,cy=h/2,r=w/2-30;const lb=['Net Worth','Passive','Leverage','Tax Eff.','Lifestyle','Revenue'],vl=[scores.net_worth,scores.passive_income,scores.leverage_efficiency,scores.tax_efficiency,scores.lifestyle,scores.business_revenue],n=6;ctx.clearRect(0,0,w,h);for(let ring=1;ring<=4;ring++){ctx.beginPath();for(let i=0;i<=n;i++){const a=(Math.PI*2*i/n)-Math.PI/2,rr=r*ring/4;i===0?ctx.moveTo(cx+rr*Math.cos(a),cy+rr*Math.sin(a)):ctx.lineTo(cx+rr*Math.cos(a),cy+rr*Math.sin(a));}ctx.strokeStyle='#2d3a50';ctx.lineWidth=1;ctx.stroke();}for(let i=0;i<n;i++){const a=(Math.PI*2*i/n)-Math.PI/2;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+r*Math.cos(a),cy+r*Math.sin(a));ctx.strokeStyle='#2d3a50';ctx.stroke();ctx.fillStyle='#9ca3b4';ctx.font='10px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(lb[i],cx+(r+20)*Math.cos(a),cy+(r+20)*Math.sin(a));}ctx.beginPath();for(let i=0;i<=n;i++){const idx=i%n,a=(Math.PI*2*idx/n)-Math.PI/2,v=(vl[idx]/100)*r;i===0?ctx.moveTo(cx+v*Math.cos(a),cy+v*Math.sin(a)):ctx.lineTo(cx+v*Math.cos(a),cy+v*Math.sin(a));}ctx.fillStyle='rgba(16,185,129,0.2)';ctx.fill();ctx.strokeStyle='#10b981';ctx.lineWidth=2;ctx.stroke();for(let i=0;i<n;i++){const a=(Math.PI*2*i/n)-Math.PI/2,v=(vl[i]/100)*r;ctx.beginPath();ctx.arc(cx+v*Math.cos(a),cy+v*Math.sin(a),3,0,Math.PI*2);ctx.fillStyle='#10b981';ctx.fill();}},

fmt(n){n=Math.round(n);const a=Math.abs(n);return a>=1000?a.toLocaleString():a.toString();},
fmtMoney(n){n=Math.round(n);const a=Math.abs(n),str=a>=1000?a.toLocaleString():a.toString();return(n<0?'-$':'$')+str;},
formatStatName(k){return k.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());}
};
Game.init();
