const okRows = rows => rows.filter(r=>r.status==='ok');

/* discover test types present, with friendly labels & a stable color */
function testTypes(rows){
  const seen=[...new Set(rows.map(r=>r.test))];
  const order=['cloudflare_full','cdn_cloudflare','cdn_hetzner','cdn_ovh','cdn_vultr'];
  seen.sort((a,b)=>{const ia=order.indexOf(a),ib=order.indexOf(b);return (ia<0?99:ia)-(ib<0?99:ib);});
  return seen;
}
function cdnColor(test){
  if(test.includes('hetzner'))return CH.hetzner;
  if(test.includes('ovh'))return CH.ovh;
  if(test.includes('vultr'))return CH.vultr;
  if(test.includes('cloudflare'))return CH.cf;
  return CH.up;
}
function prettyTest(t){
  return ({cloudflare_full:'Cloudflare (full)',cdn_cloudflare:'Cloudflare (CDN)',
    cdn_hetzner:'Hetzner',cdn_ovh:'OVH',cdn_vultr:'Vultr'})[t] || t;
}

/* ---------- Chart.js defaults ---------- */
function applyChartDefaults(){
  const C=Chart;
  C.defaults.color=CH.txt2;
  C.defaults.font.family="'JetBrains Mono','Inter',monospace";
  C.defaults.font.size=11;
  C.defaults.maintainAspectRatio=false;
  C.defaults.animation = false;   // rebuild-on-toggle charts must not queue animations (avoids stale _fn crash)
  C.defaults.plugins.legend.display=false;
  C.defaults.plugins.tooltip.backgroundColor='#0B0E14';
  C.defaults.plugins.tooltip.borderColor='#2E3A52';
  C.defaults.plugins.tooltip.borderWidth=1;
  C.defaults.plugins.tooltip.titleColor='#E7ECF5';
  C.defaults.plugins.tooltip.bodyColor='#93A0B8';
  C.defaults.plugins.tooltip.padding=10;
  C.defaults.plugins.tooltip.cornerRadius=8;
  C.defaults.plugins.tooltip.titleFont={family:"'JetBrains Mono'",size:11};
  C.defaults.plugins.tooltip.bodyFont={family:"'JetBrains Mono'",size:12};
}
function timeAxis(extra={}){
  return Object.assign({
    type:'linear',
    grid:{color:CH.grid,drawTicks:false},
    border:{display:false},
    ticks:{maxRotation:0,autoSkipPadding:24,callback:v=>fmtTick(v)},
  },extra);
}
function valAxis(title){
  return {grid:{color:CH.grid,drawTicks:false},border:{display:false},
    title:{display:!!title,text:title,color:CH.txt3,font:{size:10}},beginAtZero:false};
}
function lineDataset(label,color,points,opt={}){
  return Object.assign({
    label,data:points,borderColor:color,backgroundColor:color,
    pointRadius:0,pointHitRadius:8,borderWidth:1.6,tension:.25,spanGaps:true,
  },opt);
}
function baseLineCfg(datasets, yTitle, tipUnit){
  return {
    type:'line',
    data:{datasets},
    options:{
      parsing:false, normalized:true,
      interaction:{mode:'nearest',intersect:false,axis:'x'},
      plugins:{
        decimation:{enabled:true,algorithm:'lttb',samples:600},
        tooltip:{callbacks:{
          title:items=>items.length?fmtFull(items[0].parsed.x):'',
          label:it=>`${it.dataset.label}: ${fmt(it.parsed.y,1)}${tipUnit||''}`
        }}
      },
      scales:{x:timeAxis(),y:valAxis(yTitle)}
    }
  };
}
function render(key, canvasId, cfg){
  const cv=$('#'+canvasId);
  cv.style.display='';                        // un-hide if a prior empty-state hid it
  const e=cv.parentElement.querySelector('.empty');
  if(e) e.style.display='none';
  if(charts[key]) charts[key].destroy();
  charts[key]=new Chart(cv.getContext('2d'), cfg);
}

function statCards(sel,items){
  const c=$(sel); c.innerHTML='';
  items.forEach(([k,v])=>{
    const el=document.createElement('div');el.className='stat';
    el.innerHTML=`<div class="k">${k}</div><div class="v">${v}</div>`;c.appendChild(el);
  });
}
function renderEmpty(canvasId, key, msg){
  if(charts[key]){charts[key].destroy();delete charts[key];}
  const cv=$('#'+canvasId), box=cv.parentElement;
  let e=box.querySelector('.empty');
  cv.style.display='none';
  if(!e){e=document.createElement('div');e.className='empty';box.appendChild(e);}
  e.innerHTML=`<svg width="30" height="30" viewBox="0 0 24 24" fill="none" style="opacity:.4"><path d="M3 12 L8 12 L10 8 L12 16 L14 12 L21 12" stroke="#5E6B83" stroke-width="1.4" stroke-linecap="round"/></svg><div>${msg}</div>`;
  e.style.display='grid';
}
function escapeHtml(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
