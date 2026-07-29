/* ===================================================================== */
/*  BOOT + GLOBAL CONTROLS                                               */
/* ===================================================================== */
function boot(){
  applyChartDefaults();
  $('#app').classList.remove('hidden');
  $('#toolbar').style.display='flex';
  $('#rowCount').textContent=`${RAW.length.toLocaleString()} rows · ${testTypes(RAW).length} test types`;
  buildSpeedTestSeg();
  ovSel={dl:{small:true,medium:true,large:true,band:true,cdns:new Set()},ul:{small:true,medium:true,large:true,band:true}};
  buildOverviewControls();
  wireControls();
  refreshAll();
}

function wireControls(){
  $$('#toolbar .seg [data-range]').forEach(b=>b.addEventListener('click',()=>{
    state.rangeDays=+b.dataset.range; segPress(b); refreshAll();
  }));
  $$('#toolbar .seg [data-tz]').forEach(b=>b.addEventListener('click',()=>{
    state.tz=b.dataset.tz; segPress(b); $('#evTz').textContent=state.tz==='utc'?'UTC':'local'; refreshAll();
  }));
  $$('.tab').forEach(t=>t.addEventListener('click',()=>selectTab(t.dataset.tab)));

  // view-local controls
  $$('#speedTest button,#speedMetric button,#speedSize button').forEach(b=>
    b.addEventListener('click',()=>{segPress(b);drawSpeed();}));
  $$('#cdnSize button,#cdnSmooth button').forEach(b=>
    b.addEventListener('click',()=>{segPress(b);drawCdn();}));
  $$('#todMetric button').forEach(b=>
    b.addEventListener('click',()=>{segPress(b);drawTod();}));
  ['advDown','advUp','advThresh'].forEach(id=>{
    const el=$('#'+id);
    el.addEventListener('input',drawDispute);
    el.addEventListener('blur',()=>{
      const n=num(el.value);
      el.value = n!=null ? String(Math.trunc(n)) : '';
      refreshAll();
    });
    el.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); el.blur(); }});
  });
}
function segPress(btn){ [...btn.parentElement.children].forEach(c=>c.setAttribute('aria-pressed', c===btn?'true':'false')); }

function selectTab(tab){
  state.tab=tab;
  $$('.tab').forEach(t=>t.setAttribute('aria-selected', t.dataset.tab===tab?'true':'false'));
  $$('.view').forEach(v=>v.classList.toggle('hidden', v.dataset.panel!==tab));
  drawTab(tab);
}
function buildSpeedTestSeg(){
  const seg=$('#speedTest'); seg.innerHTML='';
  testTypes(RAW).forEach((t,i)=>{
    const b=document.createElement('button');
    b.dataset.t=t; b.textContent=prettyTest(t); b.setAttribute('aria-pressed', i===0?'true':'false');
    // keep test-type buttons neutral (no per-test color)
    b.addEventListener('click',()=>{segPress(b);drawSpeed();});
    seg.appendChild(b);
  });
}

function refreshAll(){
  drawInstrument();
  drawTab(state.tab);
}
function drawTab(tab){
  ({overview:drawOverview,speed:drawSpeed,latency:drawLatency,jitter:drawJitter,
    cdn:drawCdn,tod:drawTod,reliability:drawReliability,dispute:drawDispute}[tab]||(()=>{}))();
}

