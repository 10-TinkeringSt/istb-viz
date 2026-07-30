/* ===================================================================== */
/*  INFO TOOLTIPS — short glossary text reused from help.md, shown on    */
/*  hover (desktop) and tap (touch), dismissible, viewport-clamped.      */
/* ===================================================================== */
const GLOSSARY = {
  speed: `How much data your connection can move in a second, usually measured in Mbps (megabits per second). This is what people usually mean when they say "my internet is fast" or "slow." Downloading is data coming to you; upload is data going out from you — most home connections are quite a bit faster at downloading than uploading.`,
  latency: `How long it takes for a small signal to reach a server and come back — usually just a few thousandths of a second (milliseconds). Think of it as "reaction time" rather than speed: a connection can be fast (good download speeds) but still feel laggy (high latency), or vice versa. Low latency matters most for anything happening in real time — calls, video chats, online games.`,
  jitter: `How much your latency wobbles from one moment to the next, rather than how high it is. Imagine two connections that both average the same "reaction time" — one stays steady every time, the other swings wildly high and low. The steady one will feel smooth on a call; the wobbly one will feel choppy, even though its average looks identical. Low, flat jitter is good; spiky jitter means an unstable connection.`,
  testCycle: `One full round of testing — typically your bot runs several tests back to back (for example, a small file, then a medium file, then a large file) and we group those together as a single cycle when building certain charts.`,
  errorRate: `The percentage of tests that failed to complete at all, rather than just running slow. A rising error rate, or a cluster of errors around a specific time, often points to an outage or a genuinely broken connection rather than ordinary slowness.`,
  p5p95: `A way of describing your worst and best typical results, without being thrown off by a one-off fluke. "p5" means 5% of your tests were slower than this — so it's roughly "even on a bad day, this is about what you got." "p95" is the mirror image — roughly your best typical result, not counting rare lucky bursts. These numbers are widely used by network engineers and regulators for exactly this reason: they're a fair, hard-to-argue-with way to describe "how bad does it usually get," rather than cherry-picking a single best or worst result.`,
  spreadBand: `On charts with more than one line (for example, small/medium/large file downloads), the shaded area shows the full range between your slowest and fastest result at each point in time. A wide band means the different sizes performed very differently; a narrow band means they were all roughly the same.`,
  advertised: `"Advertised speed" is what your provider promised you'd get. The "underperformance threshold" is the minimum speed you expect to see — if your median download is below that, it counts as underperforming.`,
};

/* returns markup for a small "(i)" icon; embed inline in any template string */
function infoIcon(key){
  const text=GLOSSARY[key];
  if(!text) return '';
  return ` <button type="button" class="info-ico" data-tip-key="${key}" aria-label="${escapeHtml(text)}">i</button>`;
}

(function(){
  let bubble=null, openIcon=null, locked=false;

  function ensureBubble(){
    if(!bubble){
      bubble=document.createElement('div');
      bubble.className='info-tip';
      document.body.appendChild(bubble);
    }
    return bubble;
  }
  function positionTip(icon){
    const r=icon.getBoundingClientRect();
    const bw=bubble.offsetWidth, bh=bubble.offsetHeight;
    let left=r.left+r.width/2-bw/2;
    left=Math.max(8, Math.min(left, window.innerWidth-bw-8));
    let top=r.bottom+8;
    if(top+bh>window.innerHeight-8) top=r.top-bh-8;
    if(top<8) top=8;
    bubble.style.left=left+'px';
    bubble.style.top=top+'px';
  }
  function showTip(icon){
    const text=GLOSSARY[icon.dataset.tipKey];
    if(!text) return;
    ensureBubble();
    bubble.textContent=text;
    bubble.style.visibility='hidden';
    bubble.classList.add('show');
    positionTip(icon);
    bubble.style.visibility='';
    openIcon=icon;
  }
  function hideTip(){
    if(bubble) bubble.classList.remove('show');
    openIcon=null;
  }

  document.addEventListener('mouseover',e=>{
    if(locked) return;
    const ic=e.target.closest && e.target.closest('.info-ico');
    if(ic) showTip(ic);
  });
  document.addEventListener('mouseout',e=>{
    if(locked) return;
    const ic=e.target.closest && e.target.closest('.info-ico');
    if(ic && (!e.relatedTarget || !ic.contains(e.relatedTarget))) hideTip();
  });
  document.addEventListener('focusin',e=>{
    const ic=e.target.closest && e.target.closest('.info-ico');
    if(ic) showTip(ic);
  });
  document.addEventListener('focusout',e=>{
    if(locked) return;
    const ic=e.target.closest && e.target.closest('.info-ico');
    if(ic) hideTip();
  });
  document.addEventListener('click',e=>{
    const ic=e.target.closest && e.target.closest('.info-ico');
    if(ic){
      e.preventDefault(); e.stopPropagation();
      if(locked && openIcon===ic){ hideTip(); locked=false; }
      else { showTip(ic); locked=true; }
      return;
    }
    if(locked){ hideTip(); locked=false; }
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){ hideTip(); locked=false; }
  });
  window.addEventListener('scroll',()=>{ hideTip(); locked=false; }, true);
  window.addEventListener('resize',()=>{ hideTip(); locked=false; });
})();
