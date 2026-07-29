/* ===================================================================== */
/*  RELIABILITY                                                          */
/* ===================================================================== */
function drawReliability(){
  const rows=inRange();
  const byDay={};
  rows.forEach(r=>{const k=parts(r.ms).dayKey;(byDay[k]=byDay[k]||{ok:0,err:0,ms:r.ms,items:[]});
    byDay[k][r.status==='error'?'err':'ok']++; if(r.status==='error')byDay[k].items.push(r);});
  const days=Object.keys(byDay).sort();
  if(!days.length){ renderEmpty('cRel','reliability','No data in range.'); $('#relStats').innerHTML=''; return; }
  const errPct=days.map(k=>{const d=byDay[k];return d.ok+d.err? d.err/(d.ok+d.err)*100:0;});
  const totals=days.map(k=>byDay[k].ok+byDay[k].err);

  render('rel','cRel',{
    data:{labels:days,datasets:[
      {type:'bar',label:'Error %',data:errPct,yAxisID:'y',
        backgroundColor:errPct.map(p=>p>5?CH.load:p>0?CH.lat:'#26334a'),borderRadius:3,maxBarThickness:30},
      {type:'line',label:'Tests/day',data:totals,yAxisID:'y1',borderColor:CH.txt2,
        borderWidth:1.2,pointRadius:0,tension:.3}
    ]},
    options:{
      interaction:{mode:'index',intersect:false},
      plugins:{tooltip:{callbacks:{
        label:it=>it.dataset.label==='Error %'?`${fmt(it.parsed.y,1)}% failed`:`${fmt(it.parsed.y,0)} tests`}}},
      scales:{
        x:{grid:{display:false},border:{display:false},ticks:{callback:(v,i)=>days[i].slice(5)}},
        y:{position:'left',grid:{color:CH.grid,drawTicks:false},border:{display:false},beginAtZero:true,
          title:{display:true,text:'error %',color:CH.txt3,font:{size:10}},ticks:{callback:v=>v+'%'}},
        y1:{position:'right',grid:{display:false},border:{display:false},beginAtZero:true,
          title:{display:true,text:'tests',color:CH.txt3,font:{size:10}}}
      }
    }
  });

  const errs=rows.filter(r=>r.status==='error');
  statCards('#relStats',[
    ['Total tests',`${fmt(rows.length,0)}`],
    ['Failed',`${fmt(errs.length,0)}`],
    ['Overall error rate',`${fmt(rows.length?errs.length/rows.length*100:0,2)}<small>%</small>`],
    ['Worst day',`${fmt(Math.max(...errPct),1)}<small>%</small>`],
    ['Clean days',`${fmt(errPct.filter(p=>p===0).length,0)}<small>/${days.length}</small>`],
  ]);

  // recent error list
  const byMsg={}; errs.forEach(e=>{byMsg[e.error_msg||'(no message)']=(byMsg[e.error_msg||'(no message)']||0)+1;});
  const list=Object.entries(byMsg).sort((a,b)=>b[1]-a[1]).slice(0,5);
  $('#relList').innerHTML = list.length
    ? '<b style="color:var(--txt-2)">Failure reasons:</b><br>'+list.map(([m,n])=>`<span class="mono" style="color:var(--err)">${n}×</span> ${escapeHtml(m)}`).join('<br>')
    : '<span class="pill good">no failures in range</span>';
}

