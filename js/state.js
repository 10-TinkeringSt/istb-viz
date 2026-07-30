"use strict";
/* =========================================================================
   ISTB Telemetry Viewer — browser-only SPA
   Data model is discovered from the file, not hardcoded, so unexpected
   test types (e.g. a legacy cdn_cloudflare) still appear instead of breaking.
   ========================================================================= */

const CH = {            /* channel colors, read from CSS so they stay in sync */
  down:'#4DD0E1', up:'#A78BFA', unloaded:'#5BC5EF', lat:'#F6B66B', load:'#F8746A', jit:'#7BDC8A',
  hetzner:'#F2B53D', ovh:'#FF82BD', vultr:'#5B8DEF', cf:'#4DD0E1', cfFull:'#4DD0E1',
  grid:'#19212F', txt2:'#93A0B8', txt3:'#5E6B83'
};
const SIZE_BYTES = { small:'1 MB', medium:'10 MB', large:'25 MB' };

/* size color palettes (shared) */
const DL_SIZE = { small:'#9CE8F2', medium:'#4DD0E1', large:'#2293AE' };
const UL_SIZE = { small:'#CDBEFB', medium:'#A78BFA', large:'#6E4BD6' };
const SIZE_LBL = { small:'Small · 1MB', medium:'Medium · 10MB', large:'Large · 25MB' };
let DL_BAND = 'rgba(77,208,225,.12)';
let UL_BAND = 'rgba(167,139,250,.12)';

let RAW = [];           // all normalized rows
let charts = {};        // live Chart instances by key
let state = { rangeDays:0, tz:'local', tab:'overview' };
