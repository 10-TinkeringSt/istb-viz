/* ===================================================================== */
/*  PDF REPORT — captures the dashboard exactly as currently displayed:  */
/*  whatever range/toggle/advertised-speed selections are active right   */
/*  now, flowing continuously with page breaks only on overflow, fully   */
/*  client-side (jsPDF + html2canvas). Each captured block keeps its own */
/*  live theme styling (dark or light) against the plain white PDF page. */
/* ===================================================================== */

/* panels to capture, one block each, in the requested reading order */
const PDF_CHART_TARGETS=[
  {tab:'overview', canvasId:'cOverviewDl'},
  {tab:'overview', canvasId:'cOverviewUl'},
  {tab:'speed',    canvasId:'cSpeed'},
  {tab:'cdn',      canvasId:'cCdn'},
  {tab:'latency',  canvasId:'cLatency'},
  {tab:'jitter',   canvasId:'cJitter'},
  {tab:'tod',      canvasId:'cTod'},
  {tab:'reliability', canvasId:'cRel'},
];

function advValuesMissing(){
  return num($('#advDown').value)==null || num($('#advUp').value)==null || num($('#advThresh').value)==null;
}

function showAdvPrompt(){
  const overlay=$('#advPromptOverlay');
  overlay.classList.remove('hidden');
  document.body.classList.add('help-open');
  const ok=$('#advPromptOk');
  function close(){
    overlay.classList.add('hidden');
    document.body.classList.remove('help-open');
    document.removeEventListener('keydown', onKey);
    ok.removeEventListener('click', close);
    overlay.removeEventListener('click', onBackdrop);
  }
  function onKey(e){ if(e.key==='Escape'||e.key==='Enter') close(); }
  function onBackdrop(e){ if(e.target===overlay) close(); }
  ok.addEventListener('click', close);
  overlay.addEventListener('click', onBackdrop);
  document.addEventListener('keydown', onKey);
  ok.focus();
}

async function generatePdfReport(){
  if(!RAW.length) return;
  if(advValuesMissing()){ showAdvPrompt(); return; }

  const overlay=$('#pdfOverlay'), msgEl=$('#pdfProgressMsg');
  const setMsg=t=>{ if(msgEl) msgEl.textContent=t; };
  overlay.classList.remove('hidden');
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));

  const revealedTabs=new Set(PDF_CHART_TARGETS.map(t=>t.tab));
  revealedTabs.add('dispute');
  const sectionState={};
  revealedTabs.forEach(tab=>{
    const el=document.querySelector(`.view[data-panel="${tab}"]`);
    if(el) sectionState[tab]={el, wasHidden:el.classList.contains('hidden')};
  });

  try{
    const {jsPDF}=window.jspdf;
    const doc=new jsPDF({unit:'pt', format:'a4', compress:true});
    const pageW=doc.internal.pageSize.getWidth();
    const pageH=doc.internal.pageSize.getHeight();
    const margin=36;
    const flow={y:margin};

    setMsg('Capturing summary…');
    await addSummaryBlock(doc, pageW, pageH, margin, flow);

    for(let i=0;i<PDF_CHART_TARGETS.length;i++){
      const t=PDF_CHART_TARGETS[i];
      setMsg(`Rendering chart ${i+1} of ${PDF_CHART_TARGETS.length}…`);
      await addChartBlock(doc, t, pageW, pageH, margin, flow);
    }

    setMsg('Saving PDF…');
    const stamp=new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
    doc.save(`istb-report-${stamp}.pdf`);
  }catch(err){
    console.error('PDF report generation failed:', err);
    alert("Sorry, the PDF report couldn't be generated. See the browser console for details.");
  }finally{
    Object.values(sectionState).forEach(s=>{ if(s.wasHidden) s.el.classList.add('hidden'); });
    overlay.classList.add('hidden');
  }
}

async function revealSection(tab){
  const sec=document.querySelector(`.view[data-panel="${tab}"]`);
  if(sec && sec.classList.contains('hidden')) sec.classList.remove('hidden');
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  return sec;
}

/* moves to a fresh page if `neededH` won't fit in what's left of the current one */
function ensureSpace(doc, pageH, margin, flow, neededH){
  if(flow.y+neededH > pageH-margin){
    doc.addPage();
    flow.y=margin;
  }
}

/* background to fill in behind each capture — matches the page's own theme so
   rounded-corner anti-aliasing fringes blend in instead of turning black under JPEG */
function pageBgColor(){
  return (getComputedStyle(document.documentElement).getPropertyValue('--ink')||'#0B0E14').trim();
}

/* places a themed DOM-capture image in the flowing layout, breaking the page
   only if it doesn't fit what's left — never splits a block across pages.
   Captured as JPEG (not PNG): these are gradient/photo-like panel screenshots,
   not flat icon art, so PNG's lossless encoding was mostly wasted bytes —
   ~90%+ quality JPEG at a print-adequate scale looks identical but is a
   fraction of the file size. */
async function placeElementImage(doc, el, pageW, pageH, margin, flow, gapAfter){
  const canvas=await html2canvas(el,{backgroundColor:pageBgColor(), scale:1.5});
  const availW=pageW-margin*2;
  let w=availW, h=w*canvas.height/canvas.width;
  const maxH=pageH-margin*2;               // cap so an oversized block still fits a fresh page
  if(h>maxH){ h=maxH; w=h*canvas.width/canvas.height; }
  ensureSpace(doc, pageH, margin, flow, h);
  const x=margin+(availW-w)/2;
  doc.addImage(canvas.toDataURL('image/jpeg',0.9),'JPEG', x, flow.y, w, h, undefined, 'FAST');
  flow.y += h + (gapAfter==null?18:gapAfter);
}

async function addSummaryBlock(doc, pageW, pageH, margin, flow){
  doc.setFont('helvetica','bold'); doc.setFontSize(16); doc.setTextColor(20,20,20);
  doc.text('ISTB Speed Telemetry — Report', margin, flow.y);
  flow.y+=20;

  doc.setFont('helvetica','normal'); doc.setFontSize(9.5); doc.setTextColor(110,110,110);
  const period=($('#periodRange')?.textContent||'').trim();
  const line = period ? `Generated ${new Date().toLocaleString()} · data period: ${period}` : `Generated ${new Date().toLocaleString()}`;
  doc.text(line, margin, flow.y);
  flow.y+=18;

  // instrument header cluster — captured as-is (verdict, all readout tiles), current theme
  const instEl=document.querySelector('.instrument');
  await placeElementImage(doc, instEl, pageW, pageH, margin, flow, 20);

  // ISP evidence tab — populate with whatever range/tz/advertised values are currently set,
  // then snapshot; drawDispute() only re-renders, it never changes a selection
  const disputeSec=await revealSection('dispute');
  drawDispute();
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  const evEl=(disputeSec&&disputeSec.querySelector('.evidence'))||disputeSec;
  await placeElementImage(doc, evEl, pageW, pageH, margin, flow, 20);
}

async function addChartBlock(doc, target, pageW, pageH, margin, flow){
  await revealSection(target.tab);
  drawTab(target.tab);   // re-render with whatever selections/toggles are already active
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));

  const cv=document.getElementById(target.canvasId);
  const panel=cv && cv.closest('.panel');
  if(!panel) return;
  // the whole panel (title, description, controls, chart-or-empty-state, stats) is captured
  // together so the report keeps the exact live theme and shows which toggles are selected
  await placeElementImage(doc, panel, pageW, pageH, margin, flow, 20);
}
