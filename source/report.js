(() => {
'use strict';
const DATA=__DATA__;
const teams=DATA.teams;
const state={team:'Beta',metric:'productivity',sort:'value',method:'chain',bugs:20,fix:0};
const $=id=>document.getElementById(id);
const n=(v,d=2)=>new Intl.NumberFormat('ru-RU',{maximumFractionDigits:d}).format(v);
const rub=v=>n(v,2)+' ₽';
const infos=__TEAM_INFO__;
const metrics={productivity:{label:'Задач на участника за 2 недели',unit:'задач/участника',dec:3,caption:'Выполненные задачи / численность команды за две недели.'},cost_per_task:{label:'Расчётная стоимость задачи',unit:'₽/задачу',dec:0,caption:'Стоимость учтённых работ по ставке часа / выполненные задачи.'},density100:{label:'Багов на 100 задач',unit:'багов/100 задач',dec:2,caption:'Количество багов на каждые 100 выполненных задач.'},bug_cost:{label:'Стоимость исправлений',unit:'₽',dec:0,caption:'Количество багов × трудозатраты на исправление одного бага × ставка часа.'},q:{label:'Выполненные задачи',unit:'задач за 2 недели',dec:0,caption:'Абсолютный выпуск команды за двухнедельный период.'}};
const factorLabels=['Трудозатраты на задачу','Багов на задачу','Трудозатраты на исправление одного бага','Ставка часа'];
const getTeam=()=>teams.find(t=>t.team===state.team);
function barChart(container,list,key,{hero=false}={}){
 const compact=hero&&container.clientWidth<300;const w=Math.max(compact?180:280,Math.floor(container.clientWidth)),left=compact?47:74,right=compact?72:(key==='bug_cost'?92:85),plot=w-left-right,row=44,h=list.length*row+39;
 const values=list.map(t=>t[key]);const rawMax=Math.max(...values);const magnitude=10**Math.floor(Math.log10(rawMax));const max=Math.ceil(rawMax/magnitude)*magnitude;const meta=metrics[key];
 const s=[];s.push(`<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${meta.label}: ${list.map(t=>t.team+' '+n(t[key],meta.dec)).join(', ')}"><title>${meta.label}</title>`);
 (compact?[0,1]:[0,.5,1]).forEach(f=>{const x=left+plot*f;s.push(`<line x1="${x}" y1="3" x2="${x}" y2="${list.length*row}" stroke="#d6e0e3" stroke-width=".7"/><text x="${x}" y="${h-9}" text-anchor="${f===0?'start':f===1?'end':'middle'}">${compact&&f? n(max*f/1000,0)+' тыс.':n(max*f,key==='bug_cost'?0:1)}</text>`);});
 list.forEach((t,i)=>{const y=i*row+14,bw=t[key]/max*plot;const fill=hero&&t.team==='Beta'?'#9AAAC0':'#354C70';s.push(`<text class="team" x="0" y="${y+13}">${t.team}</text><rect x="${left}" y="${y}" width="${bw}" height="20" rx="2" fill="${fill}"><title>${t.team}: ${n(t[key],meta.dec)} ${meta.unit}</title></rect><text class="value" x="${left+bw+7}" y="${y+14}">${n(t[key],meta.dec)}</text>`);});
 s.push('</svg>');container.innerHTML=s.join('');
}
function renderComparison(){
 const list=teams.slice().sort(state.sort==='name'?(a,b)=>a.team.localeCompare(b.team):(a,b)=>b[state.metric]-a[state.metric]);
 barChart($('compare-chart'),list,state.metric);
 $('metric-caption').textContent=metrics[state.metric].unit+'. '+metrics[state.metric].caption;
 $('selected-metric-header').textContent=metrics[state.metric].label;
 $('comparison-body').innerHTML=list.map(t=>`<tr class="${t.team===state.team?'selected-row':''}"><td><button class="team-link" type="button" data-team="${t.team}">${t.team}</button></td><td>${n(t.productivity,3)}</td><td>${n(t.density100,2)}</td><td>${n(t.cost_per_task,0)}</td><td>${n(t[state.metric],metrics[state.metric].dec)}</td></tr>`).join('');
 $('comparison-body').querySelectorAll('[data-team]').forEach(b=>b.addEventListener('click',()=>{selectTeam(b.dataset.team);$('team').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}));
}
function selectTeam(name){state.team=name;$('scenario-team').value=name;renderTeam();renderComparison();renderScenario();}
function renderTeam(){
 const t=getTeam(),i=infos[t.team];$('team-name').textContent=t.team;$('team-tag').textContent=i.tag;$('team-observation').textContent=i.observation;$('team-action').textContent=i.action;$('team-expected').textContent='Ожидаемый результат: '+i.expected;$('team-deadline').textContent=i.deadline;$('team-owner').textContent='Ответственные: '+i.owner+'.';$('team-measure').textContent='Контроль результата: '+i.measure;
 $('team-buttons').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.team===state.team)));
 $('team-metrics').innerHTML=[[n(t.productivity,3),'задач на участника'],[n(t.density100,2),'багов на 100 задач'],[rub(t.cost_per_task),'стоимость задачи'],[rub(t.bug_cost),'стоимость исправлений']].map(([v,l])=>`<div class="team-metric"><div class="value num">${v}</div><div class="label">${l}</div></div>`).join('');
 $('team-source').innerHTML=[['Численность',t.n],['Выполнено задач',t.q],['Средние трудозатраты на задачу, ч',t.t],['Количество багов',t.b],['Средние трудозатраты на исправление одного бага, ч',t.f],['Ставка, ₽/ч',n(t.r,0)],['Переработки, число событий',t.w]].map(([l,v])=>`<tr><td>${l}</td><td class="num">${typeof v==='number'?n(v):v}</td></tr>`).join('');
 $('formula-cost').textContent=`Исправления: ${t.b} × ${n(t.f)} ч × ${n(t.r,0)} ₽/ч = ${rub(t.bug_cost)}`;
 $('formula-price').textContent=`На задачу: (${t.q} × ${n(t.t)} + ${t.b} × ${n(t.f)}) × ${n(t.r,0)} / ${t.q} = ${rub(t.cost_per_task)}`;
 $('alternative-cost').textContent='Если исправления уже включены в T: '+n(t.t)+' × '+n(t.r,0)+' = '+rub(t.included_cost_per_task)+' на задачу.';
}
__FACTOR_RENDER__
function renderScenario(){
 const t=getTeam(),sb=state.bugs/100,sf=state.fix/100;const hours=t.b*t.f,remaining=hours*(1-sb)*(1-sf),released=hours-remaining;const newCost=(t.q*t.t+remaining)*t.r;
 $('bugs-drop-label').textContent=state.bugs+'%';$('fix-drop-label').textContent=state.fix+'%';$('scenario-hours').textContent=n(released,2)+' ч';$('scenario-value').textContent=rub(released*t.r);$('scenario-base').textContent=rub(hours*t.r);$('scenario-new').textContent=rub(remaining*t.r);$('scenario-unit').textContent=rub(newCost/t.q);$('scenario-percent').textContent=n((1-(1-sb)*(1-sf))*100,2)+'%';$('scenario-inputs').textContent=`База ${t.team}: баги — ${n(t.b,0)}; трудозатраты на исправление одного бага — ${n(t.f)} ч; ставка — ${n(t.r,0)} ₽/ч.`;
}
$('team-buttons').innerHTML=teams.map(t=>`<button type="button" data-team="${t.team}" aria-pressed="${t.team===state.team}">${t.team}</button>`).join('');
$('team-buttons').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>selectTeam(b.dataset.team)));
$('metric').addEventListener('change',e=>{state.metric=e.target.value;renderComparison();});$('sort-order').addEventListener('change',e=>{state.sort=e.target.value;renderComparison();});
document.querySelectorAll('[data-method]').forEach(b=>b.addEventListener('click',()=>{state.method=b.dataset.method;renderFactors();}));
$('scenario-team').addEventListener('change',e=>selectTeam(e.target.value));
$('bugs-drop').addEventListener('input',e=>{state.bugs=Number(e.target.value);renderScenario();});$('fix-drop').addEventListener('input',e=>{state.fix=Number(e.target.value);renderScenario();});
$('reset-scenario').addEventListener('click',()=>{state.bugs=0;state.fix=0;$('bugs-drop').value=0;$('fix-drop').value=0;renderScenario();});
$('menu-toggle').addEventListener('click',()=>{let v=$('menu-toggle').getAttribute('aria-expanded')!=='true';$('menu-toggle').setAttribute('aria-expanded',String(v));$('main-nav').classList.toggle('open',v);});$('main-nav').querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{$('main-nav').classList.remove('open');$('menu-toggle').setAttribute('aria-expanded','false');}));

document.querySelectorAll('[data-factor-view]').forEach(b=>b.addEventListener('click',()=>{const donut=b.dataset.factorView==='donut';$('waterfall-view').hidden=donut;$('donut-view').hidden=!donut;document.querySelectorAll('[data-factor-view]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('factor-view-description').textContent=donut?'Доля каждого фактора в разнице стоимости задачи Beta и Alpha.':'Как от стоимости задачи Alpha перейти к стоимости задачи Beta.';}));
document.querySelectorAll('[data-mini-panel]').forEach(button=>button.addEventListener('click',()=>{const id=button.dataset.miniPanel;document.querySelectorAll('[data-mini-panel]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));document.querySelectorAll('.mini-screen').forEach(panel=>panel.hidden=panel.id!==id);if(id==='mini-overview')barChart($('hero-chart'),teams,'bug_cost',{hero:true});}));
document.querySelectorAll('[data-select-team]').forEach(link=>link.addEventListener('click',()=>selectTeam(link.dataset.selectTeam)));
$('mini-team-rows').innerHTML=teams.slice().sort((a,b)=>b.productivity-a.productivity).map(t=>`<div><span>${t.team}</span><strong>${n(t.productivity,3)}</strong></div>`).join('');

const redraw=()=>{barChart($('hero-chart'),teams,'bug_cost',{hero:true});renderComparison();renderFactors();};
renderTeam();renderScenario();redraw();
if('ResizeObserver'in window){let prev=0;new ResizeObserver(entries=>{const w=entries[0].contentRect.width;if(Math.abs(w-prev)>1){prev=w;redraw();}}).observe(document.querySelector('.hero-grid'));}
})();
