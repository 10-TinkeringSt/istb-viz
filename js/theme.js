/* ===================================================================== */
/*  THEME (dark / light) — swaps chart channel colors + Chart.js defaults */
/*  to match whichever theme is active; persists choice in localStorage. */
/* ===================================================================== */
const THEME_KEY='istb-theme';

const DARK_THEME_COLORS={
  down:'#4DD0E1', up:'#A78BFA', unloaded:'#5BC5EF', lat:'#F6B66B', load:'#F8746A', jit:'#7BDC8A',
  hetzner:'#F2B53D', ovh:'#FF82BD', vultr:'#5B8DEF', cf:'#4DD0E1', cfFull:'#4DD0E1',
  grid:'#19212F', txt2:'#93A0B8', txt3:'#5E6B83',
  tooltipBg:'#0B0E14', tooltipBorder:'#2E3A52', tooltipTitle:'#E7ECF5',
  dlBand:'rgba(77,208,225,.12)', ulBand:'rgba(167,139,250,.12)',
};
const LIGHT_THEME_COLORS={
  down:'#0E93A8', up:'#7C5CD9', unloaded:'#1C8FC4', lat:'#B8790A', load:'#D6483C', jit:'#238F4C',
  hetzner:'#A67C00', ovh:'#C43D8E', vultr:'#2F5FC7', cf:'#0E93A8', cfFull:'#0E93A8',
  grid:'#E7EBF3', txt2:'#5B667A', txt3:'#8993A6',
  tooltipBg:'#FFFFFF', tooltipBorder:'#C4CCDC', tooltipTitle:'#1B2333',
  dlBand:'rgba(14,147,168,.14)', ulBand:'rgba(124,92,217,.14)',
};

function themeColorSet(theme){ return theme==='light' ? LIGHT_THEME_COLORS : DARK_THEME_COLORS; }

/* pushes the theme's palette into the mutable CH/DL_BAND/UL_BAND globals
   (state.js) and into live Chart.js defaults, so every subsequent draw
   picks up the right colors without each view file knowing about themes. */
function applyThemeColors(theme){
  const c=themeColorSet(theme);
  Object.assign(CH,{
    down:c.down, up:c.up, unloaded:c.unloaded, lat:c.lat, load:c.load, jit:c.jit,
    hetzner:c.hetzner, ovh:c.ovh, vultr:c.vultr, cf:c.cf, cfFull:c.cfFull,
    grid:c.grid, txt2:c.txt2, txt3:c.txt3,
  });
  DL_BAND=c.dlBand; UL_BAND=c.ulBand;
  if(typeof Chart!=='undefined'){
    Chart.defaults.color=CH.txt2;
    Chart.defaults.plugins.tooltip.backgroundColor=c.tooltipBg;
    Chart.defaults.plugins.tooltip.borderColor=c.tooltipBorder;
    Chart.defaults.plugins.tooltip.titleColor=c.tooltipTitle;
    Chart.defaults.plugins.tooltip.bodyColor=CH.txt2;
  }
}

function setTheme(theme){
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  applyThemeColors(theme);
  if(typeof RAW!=='undefined' && RAW.length && typeof refreshAll==='function') refreshAll();
}

function initTheme(){
  const saved=localStorage.getItem(THEME_KEY);
  const theme = saved==='light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  applyThemeColors(theme);
  const btn=$('#themeBtn');
  if(btn){
    btn.addEventListener('click',()=>{
      const next = document.documentElement.getAttribute('data-theme')==='light' ? 'dark' : 'light';
      setTheme(next);
    });
  }
}
document.addEventListener('DOMContentLoaded', initTheme);
