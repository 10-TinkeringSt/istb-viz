/* ===================================================================== */
/*  TIME OF DAY                                                          */
/* ===================================================================== */
function drawTod(){
  const metric=$('#todMetric [aria-pressed="true"]').dataset.m;
  const cf=okRows(inRange()).filter(r=>r.test==='cloudflare_full'&&r[metric]!=null);
  const buckets=Array.from({length:24},()=>[]);
  cf.forEach(r=>buckets[parts(r.ms).h].push(r[metric]));
  const means=buckets.map(b=>b.length?mean(b):null);
  const counts=buckets.map(b=>b.length);
  const unit=metric.includes('mbps')?'Mbps':'ms';
  const lowerIsBetter=metric==='latency_ms';

  const valid=means.filter(v=>v!=null);
  const lo=Math.min(...valid), hi=Math.max(...valid);
  const colors=means.map(v=>{
    if(v==null) return '#26334a';
    const t=(v-lo)/((hi-lo)||1);            // 0..1
    const good = lowerIsBetter ? 1-t : t;   // 1=good
    return good>.66?CH.down: good>.33?CH.lat:CH.load;
  });

  if(!valid.length){ renderEmpty('cTod','tod','No data for this metric in range.'); $('#todVerdict').innerHTML=''; return; }
  render('tod','cTod',{
    type:'bar',
    data:{labels:[...Array(24).keys()].map(h=>String(h).padStart(2,'0')),
      datasets:[{data:means,backgroundColor:colors,borderRadius:4,maxBarThickness:34}]},
    options:{
      plugins:{tooltip:{callbacks:{
        title:it=>`${it[0].label}:00–${it[0].label}:59 ${state.tz==='utc'?'UTC':'local'}`,
        label:it=>`${fmt(it.parsed.y,1)} ${unit} · ${counts[it.dataIndex]} tests`}}},
      scales:{
        x:{grid:{display:false},border:{display:false},title:{display:true,text:`hour of day (${state.tz==='utc'?'UTC':'local'})`,color:CH.txt3,font:{size:10}}},
        y:valAxis(unit)
      }
    }
  });

  // verdict text — compare peak evening (18-23) to off-peak (1-6)
  const avgRange=(a,b)=>{const arr=[];for(let h=a;h<=b;h++)if(means[h]!=null)arr.push(means[h]);return mean(arr);};
  const peak=avgRange(18,23), quiet=avgRange(1,6);
  let msg='';
  if(peak!=null&&quiet!=null){
    const drop=lowerIsBetter ? (peak-quiet)/quiet*100 : (quiet-peak)/quiet*100;
    const label=metric.includes('mbps')?'slower':'higher latency';
    if(drop>15) msg=`<span class="pill bad">peak-hour dip</span> Evenings (18:00–23:59) run about <b style="color:var(--err)">${fmt(Math.abs(drop),0)}% ${label}</b> than the quiet early hours — a classic congestion or throttling signature.`;
    else if(drop>5) msg=`<span class="pill warn">slight dip</span> Evenings are about ${fmt(Math.abs(drop),0)}% ${label} than off-peak — mild, possibly normal contention.`;
    else msg=`<span class="pill good">flat</span> Performance holds steady across the day — no obvious peak-hour throttling.`;
  }
  $('#todVerdict').innerHTML=msg;
}

