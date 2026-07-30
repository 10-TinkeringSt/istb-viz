/* ===================================================================== */
/*  OVERVIEW                                                             */
/* ===================================================================== */
/* ovSel: which sizes/band are toggled in the overview panels */
let ovSel={
  dl:{small:true,medium:true,large:true,band:true},
  ul:{small:true,medium:true,large:true,band:true},
};

/* group cloudflare_full rows into test cycles (rows seconds apart = one cycle) */
function cfCycles(cf, metric){
  const sorted=[...cf].sort((a,b)=>a.ms-b.ms);
  const cycles=[]; let cur=null;
  for(const r of sorted){
    if(!cur || r.ms-cur.ms>120000){ cur={ms:r.ms, vals:{}}; cycles.push(cur); }
    if(r[metric]!=null && r.file_size) cur.vals[r.file_size]=r[metric];
  }
  return cycles;
}
/* build datasets for a metric, honouring which sizes + band are selected.
   Order is always [ (_min,_band)?, ...sizeLines ] so the fill target '-1' is stable. */
function bandDatasets(cf, metric, sizeCols, bandCol, sel){
  const cyc=cfCycles(cf, metric);
  const shown=['small','medium','large'].filter(s=>sel[s]);
  const at=k=>cyc.map(c=>({x:c.ms, y:c.vals[k]!=null?c.vals[k]:null}));
  const env=fn=>cyc.map(c=>{const v=shown.map(s=>c.vals[s]).filter(x=>x!=null);
    return {x:c.ms, y:v.length?fn(...v):null};});
  const ds=[];
  if(sel.band && shown.length>=2){
    ds.push({label:'_min',data:env(Math.min),borderColor:'transparent',pointRadius:0,fill:false,spanGaps:true});
    ds.push({label:'_band',data:env(Math.max),borderColor:'transparent',backgroundColor:bandCol,pointRadius:0,
      fill:{target:'-1'},spanGaps:true});
  }
  shown.forEach(s=>ds.push(lineDataset(SIZE_LBL[s],sizeCols[s],at(s),{borderWidth:s==='large'?1.6:1.3})));
  return ds;
}
/* legend chips for a chart */
function legendInline(sel, items){
  $(sel).innerHTML=items.map(([c,t,dash])=>
    `<span class="li"><span class="dot" style="background:${c}${dash?';height:2px;border-radius:0;border-top:2px dashed '+c+';background:transparent':''}"></span>${t}</span>`
  ).join('');
}

function drawOverview(){
  const rows=okRows(inRange());
  const tests = testTypes(rows);
  const selectedTest = tests && tests.length ? (tests.includes('cloudflare_full') ? 'cloudflare_full' : tests[0]) : null;
  const cf = selectedTest ? rows.filter(r=>r.test===selectedTest) : [];

  /* ---- download: sizes + band + selected compare sources ---- */
  {
    const hasData=cf.some(r=>r.download_mbps!=null);
    // use the original three fixed colors for size lines (small, medium, large)
    const sizeCols = { small: CH.jit, medium: CH.down, large: CH.up };
    const ds=hasData?bandDatasets(cf,'download_mbps',sizeCols,DL_BAND,ovSel.dl):[];
    if(!hasData || !ds.length){
      renderEmpty('cOverviewDl','overviewDl', hasData? 'Nothing selected — tick a size above.' : `No ${selectedTest?prettyTest(selectedTest):'test'} download data in range.`);
    }else{
      const cfg=baseLineCfg(ds,'Download Mbps',' Mbps');
      cfg.options.plugins.decimation.enabled=false;     // keep band datasets index-aligned
      cfg.options.plugins.tooltip.filter=it=>!it.dataset.label.startsWith('_');
      render('overviewDl','cOverviewDl',cfg);
    }
  }

  /* ---- upload: sizes + band (no compare sources; CDNs have no upload) ---- */
  {
    const hasData=cf.some(r=>r.upload_mbps!=null);
    // apply the same three fixed colors for upload panel as requested
    const sizeColsUl = { small: CH.jit, medium: CH.down, large: CH.up };
    const ds=hasData?bandDatasets(cf,'upload_mbps',sizeColsUl,UL_BAND,ovSel.ul):[];
    if(!hasData || !ds.length){
      renderEmpty('cOverviewUl','overviewUl', hasData? 'Nothing selected — tick a size above.' : `No ${selectedTest?prettyTest(selectedTest):'test'} upload data in range.`);
    }else{
      const cfg=baseLineCfg(ds,'Upload Mbps',' Mbps');
      cfg.options.plugins.decimation.enabled=false;
      cfg.options.plugins.tooltip.filter=it=>!it.dataset.label.startsWith('_');
      render('overviewUl','cOverviewUl',cfg);
    }
  }
}

/* one toggle chip */
function chip(container,{label,color,on,dashed,onToggle,disabled,infoKey}){
  const b=document.createElement('button');
  b.className='chk'; b.disabled = !!disabled; b.setAttribute('aria-pressed',on?'true':'false');
  const mark=dashed
    ? `<span class="swh" style="border-top-color:${color}"></span>`
    : `<span class="box" style="color:${color}"></span>`;
  b.innerHTML=`${mark}<span style="color:var(--txt-2)">${label}</span>`;
  if(!b.disabled){
    b.addEventListener('click',()=>{
      const nowOn=b.getAttribute('aria-pressed')!=='true';
      b.setAttribute('aria-pressed',nowOn?'true':'false');
      onToggle(nowOn);
    });
  }
  container.appendChild(b);
  if(infoKey){
    // icon lives outside the (possibly disabled) button so it stays independently interactive
    container.insertAdjacentHTML('beforeend', infoIcon(infoKey));
  }
  return b;
}

/* build the grouped toggle chips for both overview charts */
function buildOverviewControls(){
  const dlS=$('#ovDlSizes'), ulS=$('#ovUlSizes');
  const dlR=$('#ovDlRight'), ulR=$('#ovUlRight');
  if(!dlS) return;
  dlS.innerHTML=''; ulS.innerHTML=''; if(dlR) dlR.innerHTML=''; if(ulR) ulR.innerHTML='';
  // size chips: when toggled, rebuild controls so the spread band button state updates
  const sizeChipCols = { small: CH.jit, medium: CH.down, large: CH.up };
  ['small','medium','large'].forEach(s=>{
    chip(dlS,{label:SIZE_LBL[s],color:sizeChipCols[s],on:ovSel.dl[s],onToggle:v=>{ovSel.dl[s]=v; buildOverviewControls(); drawOverview();}});
    chip(ulS,{label:SIZE_LBL[s],color:sizeChipCols[s],on:ovSel.ul[s],onToggle:v=>{ovSel.ul[s]=v; buildOverviewControls(); drawOverview();}});
  });
  // spread band buttons — disabled when fewer than 2 sizes are selected
  const dlCount = ['small','medium','large'].filter(s=>ovSel.dl[s]).length;
  const ulCount = ['small','medium','large'].filter(s=>ovSel.ul[s]).length;
  if(dlCount<2) ovSel.dl.band=false;
  if(ulCount<2) ovSel.ul.band=false;
  // render spread band chips in the right-hand container so they appear separated from the size chips
  if(dlR) chip(dlR,{label:'Spread band',color:'rgba(77,208,225,.55)',on:ovSel.dl.band,onToggle:v=>{ovSel.dl.band=v;drawOverview();},disabled:dlCount<2,infoKey:'spreadBand'});
  else chip(dlS,{label:'Spread band',color:'rgba(77,208,225,.55)',on:ovSel.dl.band,onToggle:v=>{ovSel.dl.band=v;drawOverview();},disabled:dlCount<2,infoKey:'spreadBand'});
  if(ulR) chip(ulR,{label:'Spread band',color:'rgba(167,139,250,.55)',on:ovSel.ul.band,onToggle:v=>{ovSel.ul.band=v;drawOverview();},disabled:ulCount<2,infoKey:'spreadBand'});
  else chip(ulS,{label:'Spread band',color:'rgba(167,139,250,.55)',on:ovSel.ul.band,onToggle:v=>{ovSel.ul.band=v;drawOverview();},disabled:ulCount<2,infoKey:'spreadBand'});
}

