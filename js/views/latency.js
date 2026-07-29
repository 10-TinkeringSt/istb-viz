/* ===================================================================== */
/*  LATENCY & BUFFERBLOAT                                                */
/* ===================================================================== */
const latSel={unloaded:true,loaded:true};

function drawLatency(){
  const cf=okRows(inRange()).filter(r=>r.test==='cloudflare_full');
  const unloadedAll=cf.filter(r=>r.latency_ms!=null).map(r=>({x:r.ms,y:r.latency_ms}));
  const loadedAll=cf.filter(r=>r.loaded_latency_ms!=null).map(r=>({x:r.ms,y:r.loaded_latency_ms}));

  if(!unloadedAll.length){ renderEmpty('cLatency','latency','No latency data in range.'); $('#latStats').innerHTML=''; return; }

  const ds=[];
  const med=cf.filter(r=>r.loaded_latency_ms!=null&&r.latency_ms!=null);
  if(med.length && latSel.unloaded && latSel.loaded){
    const envMin = med.map(r=>({x:r.ms,y:Math.min(r.latency_ms,r.loaded_latency_ms)}));
    const envMax = med.map(r=>({x:r.ms,y:Math.max(r.latency_ms,r.loaded_latency_ms)}));
    const bandBg = envMax.map((_,i)=> med[i].loaded_latency_ms>med[i].latency_ms ? 'rgba(248,116,106,0.14)' : 'rgba(0,0,0,0)');
    ds.push({label:'_min',data:envMin,borderColor:'transparent',pointRadius:0,fill:false,spanGaps:true});
    ds.push({label:'_band',data:envMax,borderColor:'transparent',backgroundColor:bandBg,pointRadius:0,fill:{target:'-1'},spanGaps:true});
  }

  if(latSel.unloaded) ds.push(lineDataset('Unloaded (idle)',CH.unloaded,unloadedAll));
  if(latSel.loaded) ds.push(lineDataset('Loaded (under transfer)',CH.load,loadedAll,{borderWidth:1.8}));

  if(!ds.length){ renderEmpty('cLatency','latency','No latency series selected.'); $('#latStats').innerHTML=''; buildLatencyLegend(); return; }

  const cfg=baseLineCfg(ds,'ms',' ms');
  cfg.options.plugins.tooltip.filter=it=>!it.dataset.label.startsWith('_');
  render('latency','cLatency',cfg);
  buildLatencyLegend();

  // stats and bufferbloat metrics
  const deltas=med.map(r=>r.loaded_latency_ms-r.latency_ms);
  const ul=unloadedAll.map(p=>p.y);
  const ld=med.map(r=>r.loaded_latency_ms);
  const medDelta=quantile(deltas,.5);
  const grade = medDelta==null?'—': medDelta<5?'minimal': medDelta<30?'moderate':'severe';
  statCards('#latStats',[
    ['Median unloaded',`${fmt(quantile(ul,.5),0)} <small>ms</small>`],
    ['Median loaded',`${fmt(quantile(ld,.5),0)} <small>ms</small>`],
    ['Bufferbloat (median Δ)',`${fmt(medDelta,1)} <small>ms</small>`],
    ['Worst-case Δ (p95)',`${fmt(quantile(deltas,.95),0)} <small>ms</small>`],
    ['Bufferbloat grade',`<span class="pill ${grade==='minimal'?'good':grade==='moderate'?'warn':'bad'}">${grade}</span>`],
    ['p95 unloaded',`${fmt(quantile(ul,.95),0)} <small>ms</small>`],
  ]);
}

function buildLatencyLegend(){
  const el=$('#latSeries'); if(!el) return;
  el.innerHTML='';
  ['unloaded','loaded'].forEach(key=>{
    const defs={
      unloaded:{label:'Unloaded (idle)',color:CH.unloaded},
      loaded:{label:'Loaded (under transfer)',color:CH.load}
    }[key];
    const btn=document.createElement('button');
    btn.className='chk'; btn.type='button';
    btn.setAttribute('aria-pressed', latSel[key]?'true':'false');
    btn.innerHTML=`<span class="box" style="color:${defs.color}"></span><span style="color:var(--txt-2)">${defs.label}</span>`;
    btn.addEventListener('click',()=>{ latSel[key]=!latSel[key]; drawLatency(); });
    el.appendChild(btn);
  });
}

