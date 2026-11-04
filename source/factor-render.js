function renderFactors(){
 const values=DATA[state.method],base=teams[0].cost_per_task,end=teams[1].cost_per_task;
 let accumulated=base;
 $('factor-flow').innerHTML=`<div class="flow-start"><span>Начало · Alpha</span><strong>${rub(base)}</strong></div>`+values.map((v,i)=>{
  accumulated+=v;
  return `<button type="button" class="flow-item" data-flow-factor="${i}" aria-expanded="false" aria-controls="flow-detail-${i}"><span class="flow-main"><strong>${factorLabels[i]}</strong><span class="flow-value">+${rub(v)}</span></span><span class="flow-intermediate">Промежуточная стоимость: ${rub(accumulated)}</span><span class="flow-detail" id="flow-detail-${i}" hidden>${n(v/DATA.cost_gap*100,1)}% общей разницы стоимости по выбранному методу.</span></button>`;
 }).join('')+`<div class="flow-end"><span>Итог · Beta</span><strong>${rub(end)}</strong></div>`;
 $('factor-flow').querySelectorAll('[data-flow-factor]').forEach(button=>button.addEventListener('click',()=>{
  const expanded=button.getAttribute('aria-expanded')!=='true';
  button.setAttribute('aria-expanded',String(expanded));
  $(button.getAttribute('aria-controls')).hidden=!expanded;
 }));
 $('donut-feedback').textContent='Выберите фактор, чтобы увидеть его вклад.';
 const dc=$('donut-chart'),legend=$('donut-legend'),colors=['#304b72','#6780a2','#93a5bd','#c0cada'];let offset=0;
 if(values.some(v=>v<0)||DATA.cost_gap<=0){dc.innerHTML='<p>Этот вид недоступен для отрицательных вкладов. Выберите «От Alpha к Beta».</p>';legend.innerHTML='';}
 else{const arcs=values.map((v,i)=>{const fraction=v/DATA.cost_gap,seg=`<circle cx="100" cy="100" r="78" fill="none" stroke="${colors[i]}" stroke-width="25" pathLength="100" stroke-dasharray="${fraction*100} ${100-fraction*100}" stroke-dashoffset="${-offset*100}" />`;offset+=fraction;return seg;}).join('');dc.innerHTML=`<svg viewBox="0 0 200 200" role="img" aria-label="Вклад четырёх факторов в разницу стоимости ${rub(DATA.cost_gap)}"><g transform="rotate(-90 100 100)">${arcs}</g><text x="100" y="94" text-anchor="middle" class="donut-total">${n(DATA.cost_gap,2)}</text><text x="100" y="113" text-anchor="middle" class="donut-caption">₽ / задача</text></svg>`;legend.innerHTML=factorLabels.map((f,i)=>`<button type="button" class="donut-factor" data-donut-factor="${i}" aria-pressed="false"><span class="donut-swatch" style="background:${colors[i]}"></span><span>${f}</span><strong>+${rub(values[i])}</strong></button>`).join('');legend.querySelectorAll('[data-donut-factor]').forEach(button=>button.addEventListener('click',()=>{const i=Number(button.dataset.donutFactor);legend.querySelectorAll('button').forEach(b=>{b.classList.toggle('chosen',b===button);b.setAttribute('aria-pressed',String(b===button));});$('donut-feedback').textContent=`${factorLabels[i]}: +${rub(values[i])}, ${n(values[i]/DATA.cost_gap*100,1)}% общей разницы по выбранному методу.`;}));}
 $('factor-body').innerHTML=factorLabels.map((f,i)=>`<tr><td>${f}</td><td class="num">+${n(values[i],2)}</td></tr>`).join('')+`<tr class="sum"><td>Общая разница</td><td class="num">+${n(DATA.cost_gap,2)}</td></tr>`;
 document.querySelectorAll('[data-method]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.method===state.method)));
 $('factor-method-text').textContent=state.method==='chain'?'Порядок замены: трудозатраты на задачу, баги на задачу, трудозатраты на исправление одного бага, ставка часа. Вклады факторов зависят от порядка замены.':'Метод Шепли усредняет вклады по всем 24 порядкам замены четырёх факторов.';
}
