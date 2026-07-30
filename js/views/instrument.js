/* ===================================================================== */
/*  INSTRUMENT HEADER                                                    */
/* ===================================================================== */
function drawInstrument(){
  const rows=inRange();
  const cf=okRows(rows).filter(r=>r.test==='cloudflare_full');
  const dl=cf.map(r=>r.download_mbps).filter(v=>v!=null);
  const ul=cf.map(r=>r.upload_mbps).filter(v=>v!=null);
  const lat=cf.map(r=>r.latency_ms).filter(v=>v!=null);
  const jit=cf.map(r=>r.jitter_ms).filter(v=>v!=null);
  const errs=rows.filter(r=>r.status==='error').length;
  const errRate = rows.length ? errs/rows.length*100 : 0;

  // period
  if(RAW.length){
    const span=(RAW[RAW.length-1].ms-RAW[0].ms)/86400000;
    $('#periodDays').textContent=`${span.toFixed(1)} days`;
    $('#periodRange').textContent=`${fmtTick(rows.length?rows[0].ms:RAW[0].ms)} – ${fmtTick(rows.length?rows[rows.length-1].ms:RAW[RAW.length-1].ms)}`;
  }

  // readouts
  const ro=$('#readouts'); ro.innerHTML='';
  const cards=[
    {k:'Median download',info:['speed'],c:CH.down,v:fmt(quantile(dl,.5),0),u:'Mbps',sub:`min ${fmt(Math.min(...(dl.length?dl:[NaN])),0)} · max ${fmt(Math.max(...(dl.length?dl:[NaN])),0)}`},
    {k:'Median upload',info:['speed','p5p95'],c:CH.up,v:fmt(quantile(ul,.5),0),u:'Mbps',sub:`p5 ${fmt(quantile(ul,.05),0)} · p95 ${fmt(quantile(ul,.95),0)}`},
    {k:'Median latency',info:['latency','p5p95'],c:CH.lat,v:fmt(quantile(lat,.5),0),u:'ms',sub:`p95 ${fmt(quantile(lat,.95),0)} ms`},
    {k:'Median jitter',info:['jitter','p5p95'],c:CH.jit,v:fmt(quantile(jit,.5),0),u:'ms',sub:`p95 ${fmt(quantile(jit,.95),0)} ms`},
    {k:'Tests run',info:['testCycle'],c:CH.txt2,v:fmt(rows.length,0),u:'',sub:`${cf.length} full-test rows`},
    {k:'Error rate',info:['errorRate'],c:errRate>2?CH.load:CH.jit,v:fmt(errRate,1),u:'%',sub:`${errs} failed`,cls:errRate>2?'bad':'good'},
  ];
  cards.forEach(c=>{
    const el=document.createElement('div'); el.className='ro';
    el.innerHTML=`<div class="k"><span class="swatch" style="background:${c.c}"></span>${c.k}</div>
      <div class="v">${c.v}<small>${c.u}</small></div>
      <div class="sub ${c.cls||''}">${c.sub}</div>
      ${infoIcon(c.info)}`;
    ro.appendChild(el);
  });

  // verdict
  setVerdict(dl, ul, errRate);

  /*
  // sparkline strip — latest ~120 cf download points
  const pts=cf.filter(r=>r.download_mbps!=null && r.file_size==='large').slice(-160).map(r=>({x:r.ms,y:r.download_mbps}));
  $('#stripNow').textContent = pts.length ? `now ${fmt(pts[pts.length-1].y,0)} Mbps` : 'no data';
  render('strip','stripCanvas',{
    type:'line',
    data:{datasets:[{data:pts,borderColor:CH.down,borderWidth:1.4,pointRadius:0,tension:.3,
      fill:true,backgroundColor:(ctx)=>{const g=ctx.chart.ctx.createLinearGradient(0,0,0,60);
        g.addColorStop(0,'rgba(77,208,225,.28)');g.addColorStop(1,'rgba(77,208,225,0)');return g;}}]},
    options:{parsing:false,plugins:{tooltip:{enabled:false},decimation:{enabled:true,algorithm:'lttb',samples:200}},
      scales:{x:{type:'linear',display:false},y:{display:false,beginAtZero:true}},
      animation:false,interaction:{mode:null}}
  });
  */
}
function setVerdict(dl, ul, errRate){
  const advD=num($('#advDown').value);
  const led=$('#verdictLed'), txt=$('#verdictText');
  led.className='led';
  led.title='';
  led.onclick=null;
  if(!dl.length){ led.classList.add('warn'); txt.textContent='No full-test data in range'; return; }
  if(!advD){
    led.classList.add('off');
    led.title='Enter advertised download speed to enable the verdict';
    led.onclick=()=>$('#advDown').focus();
    txt.textContent='Enter \'Advertised Download\' value for a decision on ISP performance';
    return;
  }
  const medD=quantile(dl,.5);
  const pct=medD/advD*100;
  if(pct>=80){led.classList.add('ok');txt.textContent=`On track — ${fmt(pct,0)}% of advertised download`;}
  else if(pct>=50){led.classList.add('warn');txt.textContent=`Under target — ${fmt(pct,0)}% of advertised download`;}
  else{led.classList.add('err');txt.textContent=`Sustained underperformance — ${fmt(pct,0)}% of advertised`;}
}

