// Entrepreneur Paradise — playtest persona harness (dev tool; NOT shipped in the game).
// Inject into the running game via preview_eval: Read this file and pass its full contents
// as the `expression`. It installs `window.EP` with five player-archetype bots and a sweep
// runner. Every result is stamped with the build it ran against (url + version + whether the
// emergent-plateau economy is present) so a test can never be silently mis-attributed.
//
// Usage after injecting:
//   EP.build()                       -> {url, v, emergentPlateau}  (sanity-check what you're testing)
//   EP.sweep()                       -> all 5 personas x 3 archetypes, N=6, aggregated + stamped
//   EP.sweep(['operator'], 20)       -> one persona, N=20
//   EP.runBot('new','gambler')       -> a single game (raw metrics)
//
// The five personas (each a recognizable real player, testing a distinct thing):
//   operator  — skilled player on the intended path (finance ladder, runway discipline, no traps)
//   hustler   — revenue grinder; maxes marketing/ops, neglects finance/leverage
//   gambler   — reckless over-leverager; most-expensive action, debt-funded, grabs every deal
//   pincher   — timid bootstrapper; only cheap/free actions, hoards cash, no debt, never hires
//   tourist   — inattentive casual; random affordable action, ~30% skip, random event choices
(function(){
  function liquid(){const s=Game.state;return (s.cash||0)+(s.personal_cash||0)+(s.available_credit||0)+Math.max(0,(s.business_credit_limit||0)-(s.business_credit_used||0));}
  function cashOf(c){return (c&&c.effects&&typeof c.effects.cash==='number')?c.effects.cash:0;}
  // Persona-flavored event choice. 'prudent' never accepts a deal it can't fund (the bug that used
  // to bankrupt cash-poor founders when bots blindly took choice 0).
  function evChoice(evt,mode){
    const ch=evt._scaledChoices||evt.choices||[]; if(ch.length<=1)return 0;
    if(mode==='random')return Math.floor(Math.random()*ch.length);
    if(mode==='aggressive'){let b=0,bv=Infinity;ch.forEach((c,i)=>{const v=cashOf(c);if(v<bv){bv=v;b=i;}});return b;} // biggest spend / the deal
    if(mode==='thrifty'){let b=0,bv=-Infinity;ch.forEach((c,i)=>{const v=cashOf(c);if(v>bv){bv=v;b=i;}});return b;} // least outflow / decline
    const liq=liquid(),aff=i=>(-cashOf(ch[i]))<=liq*0.9; // prudent
    if(aff(0))return 0; for(let i=0;i<ch.length;i++)if(aff(i))return i; return ch.length-1;
  }
  const bestId=cat=>{const b=Game.bestAction(cat);return b?b.id:null;};
  const personas={
    operator:{desc:'Skilled — intended path (finance ladder, runway discipline, no traps; enrolls Epic to unlock the now-members-only wealth engine). Late game he DIVERSIFIES the leverage plays: PAL when cash-rich, an STR after the first rental, a conservative cash-out refi when LTV is low.', epic:true,
      pick(cat){if(cat==='finance'){const s=Game.state,own=id=>((s._action_counts||{})[id]||0);
        const av={};Game.getAvailableActions('finance').forEach(a=>{if(!Game.isActionLocked(a)&&Game.canAfford(a))av[a.id]=1;});
        if(av.private_banking&&own('private_banking')===0&&(s.cash||0)>80000)return 'private_banking';           // cash-rich → assets working twice
        if(av.buy_str&&own('buy_str')===0&&own('buy_real_estate')>=1)return 'buy_str';                          // diversify after the first rental
        const _v=(s.real_estate_equity||0)+(s.real_estate_debt||0),_ltv=_v>0?(s.real_estate_debt||0)/_v:1;
        if(av.cash_out_refi&&(s.real_estate_equity||0)>=80000&&_ltv<0.6)return 'cash_out_refi';                 // recycle equity only when leverage is conservative
      }return bestId(cat);}, ev:'prudent', tax(){return 0;},
      terms:{buy_real_estate:{downPct:25},buy_str:{downPct:25},private_banking:{drawPct:50},cash_out_refi:{ltvPct:60}}},/* disciplined: cushion on every lever */
    hustler:{desc:'Revenue grinder — maxes marketing/ops, neglects finance/leverage',
      pick(cat){if(cat==='finance'){const b=Game.bestAction('finance');if(b&&(b.id==='establish_business'||(Game.actionCashCost(b)||0)===0))return b.id;return null;}return bestId(cat);}, ev:'prudent', tax(){return 0;}},
    gambler:{desc:'Reckless over-leverager — most expensive action, debt-funded, grabs every deal. Pulls equity out (cash-out refi) the moment it exists — max LTV, no cushion — exactly the profile the margin call punishes.',
      pick(cat){let av=Game.getAvailableActions(cat).filter(a=>!Game.isActionLocked(a));if(!av.length)return null;
        if(cat==='finance'&&av.some(a=>a.id==='cash_out_refi'&&Game.canAfford(a)))return 'cash_out_refi'; // free money?? pull it ALL, every time
        const aff=av.filter(a=>Game.canAfford(a));return (aff.length?aff:av).slice().sort((x,y)=>(Game.actionCashCost(y)||0)-(Game.actionCashCost(x)||0))[0].id;}, ev:'aggressive', tax(n){return n-1;},
      terms:{buy_real_estate:{downPct:10},buy_str:{downPct:10},private_banking:{drawPct:70},cash_out_refi:{ltvPct:75}}},/* max leverage on every slider — the profile the margin call exists to punish */
    pincher:{desc:'Timid bootstrapper — only cheap/free actions, hoards cash, no debt, never hires',
      pick(cat){const s=Game.state,budget=Math.max(0,(s.cash||0))*0.15,bad=/loan|credit_line|credit_card|mca|financing|restructure|velocity|hire|premium|real_estate|private_|acquire|captive|buy_str|cash_out|refi/i;let av=Game.getAvailableActions(cat).filter(a=>!Game.isActionLocked(a)&&!bad.test(a.id)&&(Game.actionCashCost(a)||0)<=budget);if(!av.length)return null;av.sort((x,y)=>(Game.actionCashCost(x)||0)-(Game.actionCashCost(y)||0));return av[0].id;}, ev:'thrifty', tax(){return 0;}},
    tourist:{desc:'Inattentive casual — random affordable action, ~30% skip, random choices',
      pick(cat){if(Math.random()<0.3)return null;const av=Game.getAvailableActions(cat).filter(a=>!Game.isActionLocked(a)&&Game.canAfford(a));if(!av.length)return null;return av[Math.floor(Math.random()*av.length)].id;}, ev:'random', tax(n){return Math.floor(Math.random()*n);}}
  };
  function build(){return {url:location.href, v:(typeof PATCH_NOTES!=='undefined'&&PATCH_NOTES[0])?PATCH_NOTES[0].v:'?', emergentPlateau:(typeof Game.mktReach==='function')};}
  function runBot(archId,key){
    const P=personas[key], startUrl=location.href;
    Game.selectArchetype(CONFIG.starting_positions.positions.find(p=>p.id===archId));
    if(P.terms&&Game.state)Game.state._dealTerms=JSON.parse(JSON.stringify(P.terms));/* persona's standing deal terms (panel defaults otherwise) */
    let g=0,sumR=0,nR=0,maxTeam=0,peakRev=0,peakCust=0; const bugs=[];
    const scrId=()=>{const e=document.querySelector('.screen.active');return e?e.id:null;};
    while(g++<4000){const sc=scrId(); if(sc==='end-screen')break;
      if(sc==='game-screen'){const s=Game.state; if(Game.month>=18){sumR+=s.monthly_revenue||0;nR++;} maxTeam=Math.max(maxTeam,s.team_size||0);peakRev=Math.max(peakRev,s.monthly_revenue||0);peakCust=Math.max(peakCust,s.customer_base||0);
        // Epic-path personas enroll once they're an LLC with a little cushion — the wealth engine (policy/velocity) is now members-only.
        if(P.epic&&!Game.state._epic_life&&!Game.state._epic_enroll_pending&&Game.isSeparated()&&(Game.state.cash||0)>4000)Game.enrollEpicLife('monthly');
        const cats=Game._activeCats||['marketing','operations','finance'];
        for(const c of cats){if(Game.selectedActions[c])continue;const id=P.pick(c);if(id){const a=Game.getAvailableActions(c).find(x=>x.id===id);if(a&&!Game.isActionLocked(a)){
          // Panel-routed finance actions (policy loan/passive, velocity banking, the deal-panel investments) open a control panel for a human; a bot completes them by queuing the action directly (deal terms come from P.terms, set at run start).
          if(c==='finance'&&(id==='policy_loan'||id==='activate_passive_income'||id==='velocity_banking'||id==='buy_real_estate'||id==='buy_str'||id==='private_banking'||id==='cash_out_refi'||id==='equipment_financing'))Game.selectAction(c,id);
          else Game.selectActionPayment(c,id);
        }}}
        Game.resolveMonth();
        const s2=Game.state; for(const k of ['cash','monthly_revenue','customer_base','total_debt']){const v=s2[k];if(v!==undefined&&(typeof v!=='number'||isNaN(v)||!isFinite(v)))bugs.push('NaN '+k+' '+key+'/'+archId+'@m'+Game.month);}
      } else if(sc==='event-screen'){if(Game.currentEvent){const ch=Game.currentEvent.choices||[1];let i=evChoice(Game.currentEvent,P.ev);Game.resolveEvent(Math.max(0,Math.min(i,ch.length-1)));}else{const cards=document.querySelectorAll('#event-choices .choice-card');if(cards.length){let i=P.tax(cards.length);cards[Math.max(0,Math.min(i,cards.length-1))].click();}else Game.nextMonth();}}
      else if(sc==='result-screen')Game.nextMonth(); else if(sc==='lifestyle-screen')Game.nextMonth();
      else if(sc==='checkpoint-screen'){Game.month<36?Game.continueFromCheckpoint():Game.endGame();} else break;
    }
    if(location.href!==startUrl)bugs.push('PAGE NAVIGATED mid-run: '+startUrl+' -> '+location.href);
    const s=Game.state, scores=Game.calculateFinalScores();
    return {lost:!!Game._lost,deathM:Game._lost?Game.month:null,steady:nR?Math.round(sumR/nR):0,peakRev:Math.round(peakRev),peakCust:Math.round(peakCust),nw:Math.round(Game.calcNetWorth()),composite:Game.calcComposite(scores),passive:Math.round(s.other_monthly_revenue||0),maxTeam,bugs};
  }
  function med(a){if(!a.length)return null;const b=a.slice().sort((x,y)=>x-y);return b[Math.floor(b.length/2)];}
  function sweep(keys,N,archs){
    keys=keys||Object.keys(personas); N=N||6; archs=archs||['stuck','new','established'];
    const res={_build:build(),_N:N,personas:{}};
    for(const key of keys){const byArch={};
      for(const arch of archs){const runs=[];for(let i=0;i<N;i++)runs.push(runBot(arch,key));
        const sv=runs.filter(r=>!r.lost);
        byArch[arch]={survived:sv.length+'/'+N,medComposite:med(runs.map(r=>r.composite)),medSteadyK:med(sv.map(r=>Math.round(r.steady/1000))),medPeakRevK:med(runs.map(r=>Math.round(r.peakRev/1000))),medPeakCust:med(runs.map(r=>r.peakCust)),medMaxTeam:med(runs.map(r=>r.maxTeam)),bugs:runs.flatMap(r=>r.bugs)};
      }
      res.personas[key]=byArch;
    }
    return res;
  }
  window.EP={personas,build,runBot,sweep,_helpers:{liquid,cashOf,evChoice,med}};
  return 'EP harness installed — personas: '+Object.keys(personas).join(', ')+' | build v'+build().v+(build().emergentPlateau?' (emergent plateau)':' (OLD/root — NOT beta!)');
})();
