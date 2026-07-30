/* ===================================================================== */
/*  JITTER                                                               */
/* ===================================================================== */
function drawJitter(){
  const cf=okRows(inRange()).filter(r=>r.test==='cloudflare_full'&&r.jitter_ms!=null);
  const pts=cf.map(r=>({x:r.ms,y:r.jitter_ms}));
  if(!pts.length){ renderEmpty('cJitter','jitter','No jitter data in range.'); $('#jitStats').innerHTML=''; return; }
  render('jitter','cJitter',baseLineCfg([lineDataset('Jitter',CH.jit,pts,{
    fill:true,backgroundColor:'rgba(123,220,138,.08)'})],'ms',' ms'));
  const j=cf.map(r=>r.jitter_ms);
  statCards('#jitStats',[
    ['Median',`${fmt(quantile(j,.5),1)} <small>ms</small>`],
    ['Mean',`${fmt(mean(j),1)} <small>ms</small>`],
    [`p95${infoIcon('p5p95')}`,`${fmt(quantile(j,.95),1)} <small>ms</small>`],
    ['Max spike',`${fmt(Math.max(...j),0)} <small>ms</small>`],
    ['Stable samples',`${fmt(j.filter(v=>v<10).length/j.length*100,0)}<small>% &lt;10ms</small>`],
    ['Samples',`${fmt(j.length,0)}`],
  ]);
}

