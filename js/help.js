/* ===================================================================== */
/*  HELP MODAL                                                           */
/* ===================================================================== */
function initHelp(){
  const overlay=$('#helpOverlay'), btn=$('#helpBtn'), closeBtn=$('#helpClose');
  let lastFocus=null;

  function onKeydown(e){
    if(e.key==='Escape') closeHelp();
  }
  function openHelp(){
    lastFocus=document.activeElement;
    overlay.classList.remove('hidden');
    document.body.classList.add('help-open');
    document.addEventListener('keydown', onKeydown);
    closeBtn.focus();
  }
  function closeHelp(){
    overlay.classList.add('hidden');
    document.body.classList.remove('help-open');
    document.removeEventListener('keydown', onKeydown);
    if(lastFocus && lastFocus.focus) lastFocus.focus();
  }

  btn.addEventListener('click', openHelp);
  closeBtn.addEventListener('click', closeHelp);
  overlay.addEventListener('click', e=>{ if(e.target===overlay) closeHelp(); });
}
document.addEventListener('DOMContentLoaded', initHelp);
