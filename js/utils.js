/* ---------- helpers ---------- */
const $ = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const num = v => (v===''||v==null||Number.isNaN(+v)) ? null : +v;
const fmt = (v,d=0)=> v==null||Number.isNaN(v) ? '—' : (+v).toLocaleString(undefined,{maximumFractionDigits:d,minimumFractionDigits:d});

function quantile(arr, q){
  if(!arr.length) return null;
  const s=[...arr].sort((a,b)=>a-b);
  const pos=(s.length-1)*q, base=Math.floor(pos), rest=pos-base;
  return s[base+1]!==undefined ? s[base]+rest*(s[base+1]-s[base]) : s[base];
}
const mean = a => a.length ? a.reduce((x,y)=>x+y,0)/a.length : null;

/* timezone-aware date parts */
function parts(ms){
  const d=new Date(ms);
  if(state.tz==='utc') return {h:d.getUTCHours(), dayKey:d.toISOString().slice(0,10), y:d.getUTCFullYear(),mo:d.getUTCMonth(),da:d.getUTCDate()};
  return {h:d.getHours(), dayKey:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,
          y:d.getFullYear(),mo:d.getMonth(),da:d.getDate()};
}
function fmtTick(ms){
  const d=new Date(ms), o=state.tz==='utc'?{timeZone:'UTC'}:{};
  return d.toLocaleString(undefined,{month:'short',day:'numeric',...o});
}
function fmtFull(ms){
  const d=new Date(ms), o=state.tz==='utc'?{timeZone:'UTC'}:{};
  return d.toLocaleString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',...o});
}

