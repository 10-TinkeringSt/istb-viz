/* ===================================================================== */
/*  CDN COMPARISON                                                       */
/* ===================================================================== */
function drawCdn(){
  const size=$('#cdnSize [aria-pressed="true"]').dataset.s;
  const smooth=$('#cdnSmooth [aria-pressed="true"]').dataset.sm;
  const rows=okRows(inRange());

  // discover test types dynamically and include those that have data for the selected size
  const tests = testTypes(rows) || [];
  const sources = tests.map(t=>({test:t,label:prettyTest(t),color:cdnColor(t)}))
    .filter(s=>rows.some(r=>r.test===s.test && r.file_size===size && r.download_mbps!=null));

  const datasets=[], statRows=[];
  for(const s of sources){
    let series=rows.filter(r=>r.test===s.test && r.file_size===size && r.download_mbps!=null);
    let pts;
    if(smooth==='daily'){
      const byDay={};
      series.forEach(r=>{const k=parts(r.ms).dayKey;(byDay[k]=byDay[k]||[]).push(r);});
      pts=Object.keys(byDay).sort().map(k=>{
        const arr=byDay[k].map(r=>r.download_mbps);
        return {x:byDay[k][0].ms, y:mean(arr)};
      });
    }else{
      pts=series.map(r=>({x:r.ms,y:r.download_mbps}));
    }
    datasets.push(lineDataset(s.label,s.color,pts,{borderWidth:1.5}));
    const vals=series.map(r=>r.download_mbps);
    statRows.push([s.label, vals.length?`${fmt(quantile(vals,.5),0)} <small>Mbps med</small>`:'—', s.color]);
  }
  if(datasets.every(d=>!d.data.length)){ renderEmpty('cCdn','cdn','No CDN data for this size in range.'); $('#cdnStats').innerHTML=''; return; }
  const cfg=baseLineCfg(datasets,'Download Mbps',' Mbps');
  cfg.options.plugins.legend={display:true,position:'bottom',
    labels:{boxWidth:10,boxHeight:10,usePointStyle:true,pointStyle:'rectRounded',padding:16}};
  render('cdn','cCdn',cfg);

  const sc=$('#cdnStats'); sc.innerHTML='';
  statRows.forEach(([k,v,c])=>{
    const el=document.createElement('div');el.className='stat';
    el.innerHTML=`<div class="k" style="display:flex;align-items:center;gap:6px"><span class="dot" style="width:8px;height:8px;border-radius:2px;background:${c}"></span>${k}</div><div class="v">${v}</div>`;
    sc.appendChild(el);
  });
}

