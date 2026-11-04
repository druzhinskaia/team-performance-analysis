(() => {
'use strict';
const book=JSON.parse(document.getElementById('workbook-data').textContent);
const deck=JSON.parse(document.getElementById('deck-data').textContent);
const dialog=document.getElementById('material-reader');
const body=document.getElementById('reader-body');
const title=document.getElementById('reader-title');
const intro=document.getElementById('reader-intro');
const download=document.getElementById('reader-download');
const hint=document.getElementById('reader-footnote');
const catalog={
 excel:{title:'Excel-отчёт',intro:'Все семь листов подготовленного файла с вычисленными значениями и формулами.',href:'files/01_calculations.xlsx?v=20261104-r3',name:'01_Расчёты_Дружинская.xlsx',button:'Скачать Excel',hint:'Для изменения данных и пересчёта формул скачайте XLSX. Интерактивные сценарии доступны в разделе «Сценарий».'},
 slides:{title:'Презентация',intro:'Семь слайдов презентации.',href:'files/02_presentation.pptx?v=20261104-r3',name:'02_Презентация_Дружинская.pptx',button:'Скачать PowerPoint',hint:'Для редактирования слайдов и заметок докладчика скачайте PPTX.'},
 guide:{title:'Инструкция по использованию',intro:'Полный текст Word-инструкции к итоговому комплекту.',href:'files/08_guide.docx?v=20261104-r3',name:'08_Инструкция_для_заказчика.docx',button:'Скачать Word',hint:'DOCX содержит эту же инструкцию и таблицы для использования вместе с файлами комплекта.'}
};
let mode='',lastFocus=null,slide=0,sheet=2,showFormulas=false;
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const columnName=n=>{let s='';for(;n>0;n=Math.floor((n-1)/26))s=String.fromCharCode(65+(n-1)%26)+s;return s;};
const setDownload=key=>{const item=catalog[key];download.href=item.href;download.download=item.name;download.textContent=item.button;};
function inspectCell(address){
 const c=book.sheets[sheet].cells[address];
 body.querySelectorAll('.cell-selected').forEach(el=>el.classList.remove('cell-selected'));
 body.querySelector(`[data-cell="${address}"]`)?.closest('td')?.classList.add('cell-selected');
 const target=document.getElementById('cell-inspector');
 target.innerHTML=`<p><strong>${escapeHtml(book.sheets[sheet].name)}!${address}</strong> · Результат: ${escapeHtml(c.text)}</p><code>${escapeHtml(c.formula)}</code>`;
}
function sheetTable(){
 const data=book.sheets[sheet],skip=new Set(),merges=new Map();
 for(const m of data.merges){merges.set(`${m[0]},${m[1]}`,m);for(let r=m[0];r<=m[2];r++)for(let c=m[1];c<=m[3];c++)if(r!==m[0]||c!==m[1])skip.add(`${r},${c}`);}
 let out='<table class="sheet-grid" aria-label="'+escapeHtml(data.name)+'"><colgroup><col style="width:42px">';
 for(const w of data.widths)out+=`<col style="width:${w}px">`;
 out+='</colgroup><thead><tr><th class="col-letter sheet-corner" scope="col">№</th>';
 for(let c=1;c<=data.columns;c++)out+=`<th class="col-letter" scope="col">${columnName(c)}</th>`;
 out+='</tr></thead><tbody>';
 for(let r=1;r<=data.rows;r++){
  out+=`<tr><th class="row-index" scope="row">${r}</th>`;
  for(let c=1;c<=data.columns;c++){
   if(skip.has(`${r},${c}`))continue;
   const address=columnName(c)+r,cell=data.cells[address],m=merges.get(`${r},${c}`);
   let cls=cell?.numeric?'cell-number':'',attrs='';
   if(!cell)cls+=' cell-blank';
   if(cell?.formula)cls+=' cell-has-formula';
   if(showFormulas&&cell?.formula)cls+=' cell-formula';
   if(m)attrs+=` colspan="${m[3]-m[1]+1}" rowspan="${m[2]-m[0]+1}"`;
   const styles=cell?.style||{};
   const css=[styles.fill?`background:${styles.fill}`:'',styles.color?`color:${styles.color}`:'',styles.bold?'font-weight:700':'',styles.size?`font-size:${styles.size}px`:''].filter(Boolean).join(';');
   const value=escapeHtml(showFormulas&&cell?.formula?cell.formula:cell?.text||'');
   out+=`<td class="${cls}"${attrs} style="${css}" title="${address}">`+(cell?.formula?`<button class="cell-formula-button" data-cell="${address}" type="button" aria-label="Ячейка ${address}: ${escapeHtml(cell.text)}. Показать формулу">${value}</button>`:value)+'</td>';
  }
  out+='</tr>';
 }
 return out+'</tbody></table>';
}
function renderSheet(){
 const select=body.querySelector('#sheet-picker'),toggle=body.querySelector('#formula-toggle');
 body.querySelector('#sheet-scroll').innerHTML=sheetTable();
 body.querySelector('#cell-inspector').innerHTML='<p>Нажмите на ячейку с вычисленным значением, чтобы увидеть её формулу и результат.</p>';
 body.querySelectorAll('[data-cell]').forEach(el=>el.addEventListener('click',()=>inspectCell(el.dataset.cell)));
 select.value=String(sheet);toggle.checked=showFormulas;
 document.getElementById('sheet-scroll').scrollTop=0;
 document.getElementById('sheet-scroll').scrollLeft=0;
}
function renderExcel(){
 body.innerHTML=`<div class="reader-tools"><label class="reader-field" for="sheet-picker">Лист Excel<select id="sheet-picker">${book.sheets.map((s,i)=>`<option value="${i}">${escapeHtml(s.name)}</option>`).join('')}</select></label><label class="reader-check" for="formula-toggle"><input id="formula-toggle" type="checkbox">Показывать формулы</label></div><p class="reader-hint">Таблицу можно прокручивать по горизонтали. Ячейки с формулами открывают подробный расчёт.</p><div class="cell-inspector" id="cell-inspector" role="status" aria-live="polite"></div><div class="sheet-scroll" id="sheet-scroll" role="region" aria-label="Содержимое листа Excel" tabindex="0"></div>`;
 body.querySelector('#sheet-picker').addEventListener('change',e=>{sheet=Number(e.target.value);renderSheet();});
 body.querySelector('#formula-toggle').addEventListener('change',e=>{showFormulas=e.target.checked;renderSheet();});
 renderSheet();
}
function updateSlide(){
 const current=deck[slide],image=body.querySelector('#slide-image');
 image.src=current.src;image.alt=`Слайд ${slide+1}. ${current.title}. ${current.alt}`;
 body.querySelector('#slide-status').textContent=`${slide+1} из ${deck.length}`;
 body.querySelector('#slide-caption').textContent=current.title;
 body.querySelector('#previous-slide').disabled=slide===0;
 body.querySelector('#next-slide').disabled=slide===deck.length-1;
 body.querySelectorAll('[data-slide]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.slide)===slide)));
}
function renderSlides(){
 body.innerHTML=`<div class="slide-stage"><img id="slide-image" width="1280" height="720" alt=""><p class="slide-caption" id="slide-caption"></p><div class="slide-nav"><button type="button" class="reader-step" id="previous-slide"><svg class="drawn-arrow arrow-left" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M20 12H4M11 5l-7 7 7 7"/></svg> Назад</button><span class="slide-counter" id="slide-status" aria-live="polite"></span><button type="button" class="reader-step" id="next-slide">Далее <svg class="drawn-arrow arrow-right" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 12h16M13 5l7 7-7 7"/></svg></button></div><div class="slide-picker" aria-label="Выбор слайда">${deck.map((s,i)=>`<button type="button" data-slide="${i}" aria-label="Слайд ${i+1}: ${escapeHtml(s.title)}" aria-pressed="false">${i+1}</button>`).join('')}</div></div>`;
 body.querySelector('#previous-slide').addEventListener('click',()=>{if(slide>0){slide--;updateSlide();}});
 body.querySelector('#next-slide').addEventListener('click',()=>{if(slide<deck.length-1){slide++;updateSlide();}});
 body.querySelectorAll('[data-slide]').forEach(b=>b.addEventListener('click',()=>{slide=Number(b.dataset.slide);updateSlide();}));
 updateSlide();
}
function openReader(key,trigger){
 if(!catalog[key])return;
 lastFocus=trigger||document.activeElement;mode=key;
 title.textContent=catalog[key].title;intro.textContent=catalog[key].intro;hint.textContent=catalog[key].hint;setDownload(key);
 if(key==='excel')renderExcel();
 else if(key==='slides')renderSlides();
 else{body.replaceChildren(document.getElementById('instruction-content').content.cloneNode(true));}
 body.scrollTop=0;dialog.showModal();document.body.style.overflow='hidden';document.getElementById('reader-close').focus();
}
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>openReader(b.dataset.view,b)));
document.getElementById('reader-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const box=dialog.getBoundingClientRect();if(e.clientX<box.left||e.clientX>box.right||e.clientY<box.top||e.clientY>box.bottom)dialog.close();});
dialog.addEventListener('close',()=>{mode='';document.body.style.overflow='';lastFocus?.focus();});
dialog.addEventListener('keydown',e=>{
 if(mode!=='slides'||e.altKey||e.ctrlKey||e.metaKey||e.target.matches('input,select,textarea'))return;
 if(e.key==='ArrowRight'&&slide<deck.length-1){slide++;updateSlide();e.preventDefault();}
 if(e.key==='ArrowLeft'&&slide>0){slide--;updateSlide();e.preventDefault();}
});
})();
