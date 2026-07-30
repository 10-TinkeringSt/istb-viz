/* ===================================================================== */
/*  SPEED TRENDS                                                         */
/* ===================================================================== */
function drawSpeed(){
  const test=$('#speedTest [aria-pressed="true"]').dataset.t;
  const metric=$('#speedMetric [aria-pressed="true"]').dataset.m;
  const rows=okRows(inRange()).filter(r=>r.test===test);
  const unit=metric.includes('mbps')?' Mbps':' ms';
  const yt=metric.includes('mbps')?'Mbps':'ms';
  // Always show size-split lines; use the original three fixed colors per size
  const sizes=['small','medium','large'];
  const cols = { small: CH.jit, medium: CH.down, large: CH.up };
  let datasets = sizes.map(sz=>{
    const pts=rows.filter(r=>r.file_size===sz&&r[metric]!=null).map(r=>({x:r.ms,y:r[metric]}));
    return lineDataset(SIZE_LBL[sz],cols[sz],pts);
  }).filter(d=>d.data.length);

  if(!datasets.length || datasets.every(d=>!d.data.length)){
    renderEmpty('cSpeed','speed', metric==='upload_mbps'&&test.startsWith('cdn_')
      ? 'CDN tests measure download only — no upload data here.'
      : 'No data for this combination in the selected range.');
    $('#speedStats').innerHTML=''; return;
  }
  const cfg=baseLineCfg(datasets,yt,unit);
  cfg.options.plugins.legend={display:true,position:'bottom',
    labels:{boxWidth:10,boxHeight:10,usePointStyle:true,pointStyle:'rectRounded',padding:16}};
  render('speed','cSpeed',cfg);

  // stats
  const all=rows.filter(r=>r[metric]!=null).map(r=>r[metric]);
  statCards('#speedStats',[
    ['Median',`${fmt(quantile(all,.5),1)} <small>${yt}</small>`],
    ['Mean',`${fmt(mean(all),1)} <small>${yt}</small>`],
    [`p5 — p95${infoIcon('p5p95')}`,`${fmt(quantile(all,.05),0)}–${fmt(quantile(all,.95),0)}`],
    ['Min',`${fmt(Math.min(...all),1)}`],
    ['Max',`${fmt(Math.max(...all),1)}`],
    ['Samples',`${fmt(all.length,0)}`],
  ]);
}

