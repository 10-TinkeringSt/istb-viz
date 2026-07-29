/* ===================================================================== */
/*  ISP EVIDENCE                                                         */
/* ===================================================================== */
function drawDispute(){
  const rows=okRows(inRange()).filter(r=>r.test==='cloudflare_full');
  const all=inRange();
  const advD=num($('#advDown').value), advU=num($('#advUp').value);
  const thr=Math.min(100,Math.max(1,num($('#advThresh').value)||50));
  const dl=rows.filter(r=>r.download_mbps!=null).map(r=>r.download_mbps);
  const ul=rows.filter(r=>r.upload_mbps!=null).map(r=>r.upload_mbps);
  const lat=rows.filter(r=>r.latency_ms!=null).map(r=>r.latency_ms);
  const span=RAW.length?((all.length?all[all.length-1].ms-all[0].ms:0)/86400000):0;
  $('#evTz').textContent=state.tz==='utc'?'UTC':'local';

  if(!dl.length){
    $('#evSummary').textContent='No full-test download data in the selected range.';
    $('#evGrid').innerHTML=''; $('#evFoot').textContent='—'; return;
  }
  const medD=quantile(dl,.5), medU=quantile(ul,.5);
  const belowD = advD ? dl.filter(v=>v<advD*thr/100).length/dl.length*100 : null;
  const belowU = advU ? ul.filter(v=>v<advU*thr/100).length/ul.length*100 : null;

  // title + verdict pill
  let pill='', title='Performance summary';
  if(advD){
    const pct=medD/advD*100;
    if(pct>=80){pill='<span class="pill good">meets expectations</span>';title='Connection meets advertised speed';}
    else if(pct>=50){pill='<span class="pill warn">under target</span>';title='Connection falls short of advertised speed';}
    else{pill='<span class="pill bad">sustained underperformance</span>';title='Sustained underperformance vs advertised';}
  }
  $('#evTitle').innerHTML=`${title} ${pill}`;

  // plain-language summary
  let s=`Between <b>${fmtTick(all[0].ms)}</b> and <b>${fmtTick(all[all.length-1].ms)}</b> (${span.toFixed(1)} days), `+
        `<b>${rows.length.toLocaleString()}</b> full speed tests were run. `+
        `The median download speed was <b>${fmt(medD,0)} Mbps</b> and median upload <b>${fmt(medU,0)} Mbps</b>.`;
  if(advD){
    s+=` That download is <b>${fmt(medD/advD*100,0)}%</b> of the advertised <b>${fmt(advD,0)} Mbps</b>. `+
       `<span class="${belowD>25?'bad':''}">${fmt(belowD,0)}% of tests fell below ${thr}% of the advertised rate</span> (${fmt(advD*thr/100,0)} Mbps).`;
  }
  if(advU){
    s+=` Upload reached <b>${fmt(medU/advU*100,0)}%</b> of the advertised ${fmt(advU,0)} Mbps.`;
  }
  $('#evSummary').innerHTML=s;

  // grid
  const grid=$('#evGrid'); grid.innerHTML='';
  const cellTargets=evCell('Advertised targets',[
    ['Download',advD?`${fmt(advD,0)} Mbps`:'—'],
    ['Upload',advU?`${fmt(advU,0)} Mbps`:'—'],
    ['Threshold',`${fmt(thr,0)}%`],
  ]);
  const cellDown=evCell('Download',[
    ['Median',`${fmt(medD,1)} Mbps`],['Mean',`${fmt(mean(dl),1)} Mbps`],
    ['p5 (worst 5%)',`${fmt(quantile(dl,.05),1)} Mbps`],['p95 (best 5%)',`${fmt(quantile(dl,.95),1)} Mbps`],
    ['Minimum',`${fmt(Math.min(...dl),1)} Mbps`],
    advD?['% of advertised',`${fmt(medD/advD*100,0)}%`]:null,
    belowD!=null?[`% below ${thr}% target`,`${fmt(belowD,0)}%`]:null,
  ]);
  const cellUp=evCell('Upload',[
    ['Median',`${fmt(medU,1)} Mbps`],['Mean',`${fmt(mean(ul),1)} Mbps`],
    ['p5',`${fmt(quantile(ul,.05),1)} Mbps`],['p95',`${fmt(quantile(ul,.95),1)} Mbps`],
    advU?['% of advertised',`${fmt(medU/advU*100,0)}%`]:null,
    belowU!=null?[`% below ${thr}% target`,`${fmt(belowU,0)}%`]:null,
  ]);
  const cellLat=evCell('Latency & reliability',[
    ['Median latency',`${fmt(quantile(lat,.5),0)} ms`],
    ['p95 latency',`${fmt(quantile(lat,.95),0)} ms`],
    ['Tests run',`${rows.length.toLocaleString()}`],
    ['Failed tests',`${all.filter(r=>r.status==='error').length}`],
    ['Test cadence',`~${fmt(span?rows.length/span:0,0)}/day`],
  ]);
  grid.append(cellTargets,cellDown,cellUp,cellLat);
  $('#evFoot').textContent=`${RAW.length.toLocaleString()} total rows in file · ${rows.length.toLocaleString()} full tests in range · threshold ${thr}% of advertised`;
}
function evCell(title,rows){
  const el=document.createElement('div'); el.className='ev-cell';
  el.innerHTML=`<div class="t">${title}</div>`+
    rows.filter(Boolean).map(([l,v])=>`<div class="ev-row"><span class="lab">${l}</span><span class="num">${v}</span></div>`).join('');
  return el;
}

