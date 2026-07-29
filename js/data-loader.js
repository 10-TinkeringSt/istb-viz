const dropEl=$('#drop'), fileInput=$('#fileInput');
['dragenter','dragover'].forEach(e=>dropEl.addEventListener(e,ev=>{ev.preventDefault();dropEl.classList.add('drag');}));
['dragleave','drop'].forEach(e=>dropEl.addEventListener(e,ev=>{ev.preventDefault();dropEl.classList.remove('drag');}));
dropEl.addEventListener('drop',ev=>{ const f=ev.dataTransfer.files[0]; if(f) handleFile(f); });
dropEl.addEventListener('click',()=>fileInput.click());
dropEl.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){e.preventDefault();fileInput.click();} });
fileInput.addEventListener('change',e=>{ const f=e.target.files[0]; if(f) handleFile(f); });
$('#newFile').addEventListener('click',()=>{
  $('#app').classList.add('hidden'); $('#toolbar').style.display='none';
  $('#dropView').classList.remove('hidden'); $('#dropErr').innerHTML='';
  Object.values(charts).forEach(c=>c&&c.destroy()); charts={};
});

function showErr(msg){
  $('#dropErr').innerHTML = `<div class="errbox"><b>Couldn't read that file.</b> ${msg}</div>`;
  $('#loadingView').classList.add('hidden');
  $('#dropView').classList.remove('hidden');
}

async function handleFile(file){
  $('#dropView').classList.add('hidden');
  $('#dropErr').innerHTML='';
  $('#loadingView').classList.remove('hidden');
  const name=file.name.toLowerCase();
  try{
    let rows;
    if(name.endsWith('.csv')){
      $('#loadingMsg').textContent='Parsing CSV…';
      rows = parseCSV(await file.text());
    }else{
      $('#loadingMsg').textContent='Opening SQLite database…';
      rows = await parseDB(await file.arrayBuffer());
    }
    RAW = normalize(rows);
    if(!RAW.length){ showErr('No usable rows found. Expected an ISTB <code>results</code> table.'); return; }
    $('#loadingView').classList.add('hidden');
    boot();
  }catch(err){
    console.error(err);
    showErr(String(err && err.message || err));
  }
}

/* CSV parser — RFC-4180-ish, handles quoted fields & embedded newlines */
function parseCSV(text){
  const rows=[]; let row=[], field='', i=0, q=false;
  if(text.charCodeAt(0)===0xFEFF) text=text.slice(1); // strip BOM
  while(i<text.length){
    const c=text[i];
    if(q){
      if(c==='"'){ if(text[i+1]==='"'){field+='"';i+=2;continue;} q=false;i++;continue; }
      field+=c;i++;continue;
    }
    if(c==='"'){q=true;i++;continue;}
    if(c===','){row.push(field);field='';i++;continue;}
    if(c==='\r'){i++;continue;}
    if(c==='\n'){row.push(field);rows.push(row);row=[];field='';i++;continue;}
    field+=c;i++;
  }
  if(field.length||row.length){row.push(field);rows.push(row);}
  if(!rows.length) return [];
  const header=rows[0].map(h=>h.trim());
  return rows.slice(1).filter(r=>r.length>1).map(r=>{
    const o={}; header.forEach((h,j)=>o[h]= r[j]===undefined?'':r[j]); return o;
  });
}

/* SQLite via sql.js */
async function parseDB(buf){
  const SQL = await initSqlJs({ locateFile: f=>`https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${f}` });
  const db = new SQL.Database(new Uint8Array(buf));
  let res;
  try{ res = db.exec("SELECT * FROM results ORDER BY id"); }
  catch(e){ throw new Error('No <code>results</code> table in this database.'); }
  if(!res.length) return [];
  const cols=res[0].columns;
  return res[0].values.map(v=>{ const o={}; cols.forEach((c,j)=>o[c]=v[j]); return o; });
}

/* normalize either source into a common shape */
function normalize(rows){
  const out=[];
  for(const r of rows){
    const ts = r.timestamp;
    if(!ts) continue;
    const ms = new Date(String(ts).trim()).getTime();
    if(Number.isNaN(ms)) continue;
    out.push({
      id:+r.id||0, ms, ts:String(ts),
      test:(r.test||'').trim(),
      file_size:(r.file_size||'').trim()||null,
      download_mbps:num(r.download_mbps),
      upload_mbps:num(r.upload_mbps),
      latency_ms:num(r.latency_ms),
      loaded_latency_ms:num(r.loaded_latency_ms),
      jitter_ms:num(r.jitter_ms),
      server:(r.server||'').trim()||null,
      status:(r.status||'').trim()||'ok',
      error_msg:(r.error_msg||'').trim()||null,
    });
  }
  out.sort((a,b)=>a.ms-b.ms);
  return out;
}

/* ---------- filtering ---------- */
function inRange(){
  if(!state.rangeDays) return RAW;
  const max = RAW[RAW.length-1].ms;
  const cut = max - state.rangeDays*86400000;
  return RAW.filter(r=>r.ms>=cut);
}
