/* V5 frame patches. Runs from the parent page against same-origin device pages (AI / strength / pilates).
   - multi-select spring configuration shared by the three training pages
   - pilates page aligned to the on-device layout
   - recognition guide open/close hook, taller AI drawer, rep counter display */
(()=>{
const SPRINGS=[['s1',6,'#35e05a'],['s2',6.5,'#ffe033'],['s3',6.5,'#ffe033'],['s4',13.5,'#ff5266'],['s5',13.5,'#ff5266']];
const fmt=n=>Number.isInteger(n)?n.toFixed(1):String(n);
/* glossy coil-spring art (same look as the on-device pilates page) */
const icon=c=>{const ys=[9,18,27,36,45];return '<svg viewBox="0 0 40 56" aria-hidden="true" style="color:'+c+'">'+ys.map(y=>
  /* back half (darker), front half (bright tube) + specular highlight → glossy 3D coil */
  '<path d="M6 '+y+'A14 4.4 0 0 1 34 '+y+'" fill="none" stroke="currentColor" stroke-opacity=".45" stroke-width="3" stroke-linecap="round"/>'+
  '<path d="M6 '+y+'A14 4.4 0 0 0 34 '+y+'" fill="none" stroke="currentColor" stroke-width="5.2" stroke-linecap="round"/>'+
  '<path d="M10 '+(y+2.6)+'A11 3 0 0 0 28 '+(y+3)+'" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.3" stroke-linecap="round"/>').join('')+'</svg>'};
const CSS=`
.v5s-row{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}
.v5s-item{display:flex;flex-direction:column;align-items:center;gap:4px;padding:6px 2px 4px;border-radius:12px;background:transparent;border:0;color:#7d8794;cursor:pointer;font:inherit}
.v5s-item svg{width:34px;height:48px;opacity:.34;filter:saturate(.7) brightness(.8)}
.v5s-item b{font-size:17px;font-weight:800;font-style:italic;letter-spacing:0;color:#7d8794}
.v5s-item small{font-size:9px;font-weight:700;margin-left:2px}
.v5s-item.selected b{color:var(--c);text-shadow:0 0 8px color-mix(in srgb,var(--c) 55%,transparent)}
.v5s-item.selected svg{opacity:1;filter:drop-shadow(0 0 8px var(--c)) drop-shadow(0 0 3px var(--c)) brightness(1.1)}
[hidden]{display:none!important}
.v5s-item:disabled{cursor:default;opacity:.6}
.v5s-note{margin:10px 2px 0;font-size:12px;line-height:1.5;color:#9fb2c7}
.v5s-note b{color:#f1f5fb;font-weight:700}
.v5s-card .panel-title{margin-bottom:8px}
.v5s-card[hidden]{display:none}
`;
function addCss(d,id,text){if(d.getElementById(id))return;const s=d.createElement('style');s.id=id;s.textContent=text;(d.head||d.documentElement).append(s)}
function items(){return SPRINGS.map(([id,kg,c],i)=>`<button type="button" class="v5s-item" data-id="${id}" style="--c:${c}" aria-pressed="false" aria-label="弹簧${i+1} ${kg} kg">${icon(c)}<b>${fmt(kg)}<small>kg</small></b></button>`).join('')}

/* Multi-select controller. host = element that receives the .v5s-row; cfg provides read/write of the page's resistance. */
function controller(host,cfg){
  const sel=new Set(cfg.initial?[cfg.initial]:[]);let lastMode='';
  host.innerHTML='<div class="v5s-row">'+items()+'</div>'+(cfg.note===false?'':'<p class="v5s-note"></p>');
  const note=host.querySelector('.v5s-note');
  const sum=()=>Math.round(SPRINGS.filter(s=>sel.has(s[0])).reduce((a,s)=>a+s[1],0)*10)/10;
  function paint(){const locked=cfg.locked();
    /* springs are only shown in 弹簧 (spring) weight mode, everywhere */
    const spring=cfg.mode()==='spring';if(cfg.container)cfg.container.hidden=!spring;host.hidden=!spring;
    try{host.ownerDocument.documentElement.classList.toggle('v5-spring-on',spring)}catch(e){}host.querySelectorAll('.v5s-item').forEach(b=>{const on=sel.has(b.dataset.id);b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));b.disabled=locked});
    if(note)note.innerHTML=locked?'训练进行中，请先暂停再调整弹簧。':sel.size?'已选 <b>'+sel.size+'</b> 根，总阻力 <b>'+cfg.read()+' kg</b>（可多选，为所选弹簧之和）':'未选择弹簧，可多选，总阻力为所选弹簧之和。'}
  host.addEventListener('click',e=>{const b=e.target.closest('.v5s-item');if(!b||b.disabled)return;const id=b.dataset.id;if(sel.has(id)){if(sel.size===1)return;sel.delete(id)}else sel.add(id);cfg.write(sum());paint()});
  cfg.onManual&&cfg.onManual(()=>{sel.clear();paint()});
  if(sel.size)setTimeout(()=>{cfg.write(sum());paint()},60);
  setInterval(()=>{const m=cfg.mode();if(cfg.autoSpring&&m==='spring'&&lastMode!=='spring'&&!sel.size){sel.add('s1');cfg.write(sum())}lastMode=m;
    if(sel.size&&Math.abs(cfg.read()-sum())>0.01){sel.clear()} /* manual fine-tuning on the dial releases the preset highlight */
    paint()},250);
  paint();return {sel,paint};
}

/* --- AI training page --- */

function loadRecog(w,d,initial){
  if(d.getElementById('v5-recog-js'))return;
  const sc=d.createElement('script');sc.id='v5-recog-js';sc.src='v5-recognition-camera.js?v=1';
  sc.onload=()=>{const r=parentRoute(w);if(initial&&(r==='springQuick'||r==='trainingData'))w.__v5Recog(false)};
  d.body.appendChild(sc);
}
function patchAI(w,d){
  addCss(d,'v5-ai-css',CSS+`
#iwDemo-trigger,#iwDemo-trigger:disabled{background:transparent!important;border:0!important;box-shadow:none!important}
.soft-training .iw-drawer{max-height:calc(100% - 12px)!important}
.iw-drawer .iw-weight-row{margin:6px 0 4px!important;height:110px!important}
.iw-drawer .iw-dial-container{transform:scale(.84);transform-origin:center}
.iw-drawer .iw-chart-card{padding:8px 10px!important}
.iw-drawer .iw-chart-card canvas{height:58px!important}
.iw-drawer .iw-param-panel{margin-bottom:6px!important}
.iw-spring-shortcuts{display:none!important}
.v5s-ai{padding:4px 0 2px}
.v5s-ai .v5s-item svg{width:32px;height:46px}
.v5s-ai .v5s-item{padding:6px 2px 4px;background:transparent}
.v5s-ai .v5s-item b{font-size:15px}
.v5s-ai .v5s-note{display:none}
.iw-dial-container{touch-action:none;cursor:grab}
`);
  /* unified naming: 重量模式 (was 阻力模式 in the AI drawer) */
  const rename=()=>{const tw=d.createTreeWalker(d.body,4);let n;while((n=tw.nextNode())){if(/阻力模式/.test(n.nodeValue))n.nodeValue=n.nodeValue.replace(/阻力模式/g,'重量模式');else if(/^\s*阻力\s*$/.test(n.nodeValue))n.nodeValue=n.nodeValue.replace('阻力','重量')}d.querySelectorAll('[aria-label*="阻力模式"]').forEach(e=>e.setAttribute('aria-label',e.getAttribute('aria-label').replace(/阻力模式/g,'重量模式')))};
  rename();if(!d.__v5Rn){d.__v5Rn=1;setInterval(rename,800)}
  dialDrag(d);
  const old=d.querySelector('.iw-spring-shortcuts');if(!old||d.querySelector('.v5s-ai'))return;
  const host=d.createElement('div');host.className='v5s-ai';old.after(host);
  const val=()=>Number(d.getElementById('iwWeightValue').textContent);
  controller(host,{
    autoSpring:true,
    mode:()=>w.eval('iwState.mode'),
    locked:()=>!!w.PlanBImmersiveDemo?.snapshot().playing,
    read:()=>val(),
    write:t=>{w.eval('iwState.weightLeft=iwState.weightRight=iwState.weight='+t);w.syncIwWeightUI()}
  });
  w.__v5Recog=function(open){
    const o=d.getElementById('iwAiReadyOverlay');if(!o)return;
    if(open){if(w.MotionCameraRecognition)w.MotionCameraRecognition.open();else loadRecog(w,d)}
    else{try{w.MotionCameraRecognition&&w.MotionCameraRecognition.stop()}catch(e){}w.clearIwRecognitionFlow&&w.clearIwRecognitionFlow();o.classList.remove('is-visible');o.setAttribute('aria-hidden','true');const ov=d.querySelector('.iw-overlay');if(ov)ov.inert=false}
  };
  /* V3 recognition guide ("AI 识别" camera panel) */
  if(!w.MotionCameraRecognition&&!d.getElementById('v5-recog-js'))loadRecog(w,d,true);
}

/* --- shared helper for strength / pilates pages --- */
function pageControls(d,ids){return {group:d.getElementById(ids.group),value:d.getElementById(ids.value),plus:d.getElementById(ids.plus),minus:d.getElementById(ids.minus)}}
function setByStepping(c,target){let old=Number(c.value.textContent);for(let i=0;i<120&&old!==target;i++){(old<target?c.plus:c.minus).click();const n=Number(c.value.textContent);if(n===old)break;old=n}}
/* Drag the weight dial like a knob: every DEG degrees of rotation = one +/- step (same as tapping the buttons). */
function dialDrag(d,onStep){
  const dial=d.querySelector('.iw-dial-container');if(!dial||dial.dataset.v5Drag)return;dial.dataset.v5Drag='1';
  const kids=[...dial.parentElement.children].filter(e=>e.tagName==='BUTTON');
  const minus=kids[0],plus=kids[kids.length-1];if(!minus||!plus||minus===plus)return;
  const DEG=16;let last=null,acc=0,id=null;
  const ang=e=>{const r=dial.getBoundingClientRect();return Math.atan2(e.clientY-(r.top+r.height/2),e.clientX-(r.left+r.width/2))*180/Math.PI};
  dial.addEventListener('pointerdown',e=>{if(e.button>0)return;id=e.pointerId;last=ang(e);acc=0;try{dial.setPointerCapture(id)}catch(_){}dial.style.cursor='grabbing';e.preventDefault()});
  dial.addEventListener('pointermove',e=>{if(last==null||e.pointerId!==id)return;const a=ang(e);let dlt=a-last;if(dlt>180)dlt-=360;if(dlt<-180)dlt+=360;last=a;acc+=dlt;
    while(Math.abs(acc)>=DEG){const up=acc>0;acc-=up?DEG:-DEG;const b=up?plus:minus;if(b.disabled)continue;onStep&&onStep(up);b.click()}});
  const end=e=>{if(e.pointerId!==id)return;last=null;id=null;dial.style.cursor='';try{dial.releasePointerCapture(e.pointerId)}catch(_){}};
  dial.addEventListener('pointerup',end);dial.addEventListener('pointercancel',end);
}
function parentRoute(w){try{return w.parent.eval('route')}catch(e){return ''}}
/* The baseline pages are laid out for a 400 x 711 design canvas; scale it to the 1080 x 1920 device like the real screen does. */
const SCALE_CSS=`
html{width:1080px!important;height:1920px!important;overflow:hidden!important;background:#06101c!important}
body{width:400px!important;height:711.111px!important;margin:0!important;padding:0!important;transform:scale(2.7)!important;transform-origin:0 0!important;overflow:hidden!important}
.pilates-view,#pilatesScreenWrap,[id$="ScreenWrap"]{height:711.111px!important;max-width:none!important}
.bottom-bar{max-width:none!important}
`;

function patchStrength(w,d){
  dialDrag(d);
  /* strength: same canvas scaling + typography as the pilates page; no spring shortcuts here */
  addCss(d,'v5-st-css',SCALE_CSS+`
.status-bar{font-size:11px!important;padding:6px 10px 0!important}
.page-header{padding:2px 10px 6px!important}
.page-header h1{font-family:system-ui,-apple-system,"PingFang SC",sans-serif!important;font-size:26px!important;font-weight:500!important}
.dashboard{gap:6px!important;padding:0 8px!important;margin-bottom:56px!important;max-width:none!important}
.dashboard .panel{padding:9px 10px!important;border-radius:12px!important}
.dashboard .panel-title{font-size:9px!important;font-weight:500!important;color:#9fb0c4!important;margin-bottom:6px!important}
.metrics{display:grid!important;grid-template-columns:repeat(6,minmax(0,1fr))!important;gap:6px!important}
.metrics .metric:nth-child(-n+3){grid-column:span 2!important}
.metrics .metric:nth-child(n+4){grid-column:span 3!important}
.metrics .metric{padding:4px 8px!important;min-width:0!important;border-radius:9px!important}
.metrics .metric label{font-size:8.5px!important;margin-bottom:3px!important;display:block}
.metrics .metric strong{font:italic 800 19px/1.1 system-ui,-apple-system,"PingFang SC",sans-serif!important}
.metrics .metric strong small{font-size:7.5px!important;font-style:normal;margin-left:2px}
.chart-panel-header,.config-row,.config-label{font-size:9px!important}
.chart-tab{font-size:8px!important;padding:2px 8px!important}
.seg-btn{font-size:9px!important;padding:5px 8px!important}
.iw-dial-value{font-size:17px!important}
.resistance-block .resistance-control{zoom:.78}
.chart-wrap{height:96px!important;min-height:0!important;flex:none!important}
.chart-wrap canvas{width:100%!important;height:100%!important}
.metrics{display:grid!important;gap:6px!important}
.bottom-bar{gap:6px!important;padding:8px 10px 14px!important}
.bottom-bar button{font-size:9px!important;min-height:26px!important;border-radius:8px!important}
`);
}

function patchPilates(w,d){
  addCss(d,'v5-pl-css',CSS+SCALE_CSS+`
#pilatesScreenWrap .page-header h1{font-family:system-ui,-apple-system,"PingFang SC","Microsoft YaHei",sans-serif!important;font-size:26px!important;font-weight:500!important;letter-spacing:.02em!important}
.panel-metrics .metrics{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}
.panel-metrics .metric{min-width:0!important}
html:not(.v5-show-reps) .panel-metrics .metric.v5-reps{display:none!important}
html.v5-show-reps .panel-metrics .metrics{grid-template-columns:repeat(6,minmax(0,1fr))!important}
html.v5-show-reps .panel-metrics .metric:nth-child(-n+3){grid-column:span 2!important}
html.v5-show-reps .panel-metrics .metric:nth-child(n+4){grid-column:span 3!important}
html[data-motion-device][data-motion-theme] body .chart-tab.chart-tab.chart-tab.active{background:#ff9500!important;background-image:none!important;color:#1d1405!important;border-color:transparent!important;box-shadow:none!important}
html body #pilatesStartBtn.btn-start{background:#ff9500!important;background-image:none!important;color:#1d1405!important;font-weight:700!important;border-color:transparent!important;box-shadow:0 8px 24px #ff950040!important}
html body #pilatesEndBtn.btn-end,html body #pilatesFlipBtn.btn-flip{background:#0d1a2b!important;color:#e8eef6!important;border:1px solid #9eb9d11f!important}
.meeting-pilates-springs,.spring-bar{display:none!important}
.dashboard{align-content:stretch!important}
.v5s-card{align-self:start!important}
.status-bar-icons .v5-ip{font-size:inherit}
.status-bar-icons{opacity:1!important;align-items:center}
/* typography of the on-device pilates page (400 x 711 design canvas) */
#pilatesScreenWrap .status-bar{font-size:11px!important;padding:6px 10px 0!important}
#pilatesScreenWrap .status-bar-left{gap:8px}
#pilatesScreenWrap .page-header{padding:2px 10px 6px!important}
.dashboard{gap:6px!important;padding:0 8px!important;margin-bottom:56px!important}
.dashboard .panel{padding:9px 10px!important;border-radius:12px!important}
.dashboard .panel-title{font-size:9px!important;font-weight:500!important;color:#9fb0c4!important;margin-bottom:6px!important;letter-spacing:.02em}
.panel-metrics .metrics{gap:6px!important}
.panel-metrics .metric{padding:6px 8px!important;border-radius:9px!important}
.panel-metrics .metric label{font-size:8.5px!important}
.panel-metrics .metric strong{font:italic 800 19px/1.1 system-ui,-apple-system,"PingFang SC",sans-serif!important;letter-spacing:.01em}
.panel-metrics .metric strong small{font-size:7.5px!important;font-style:normal;margin-left:2px;color:#8da0b6}
.chart-panel-header{font-size:9px!important}
.chart-tab{font-size:8px!important;padding:2px 8px!important}
.config-row{font-size:9px!important}
.seg-btn{font-size:9px!important;padding:5px 8px!important}
.iw-dial-value{font-size:17px!important}
#pilatesStepNote{font-size:7.5px!important}
.resistance-block{padding:2px 0 0!important}
.resistance-block .resistance-control{zoom:.78}
.config-label{font-size:9px!important}
.panel-metrics .metric{padding:4px 8px!important}
.panel-metrics .metric label{margin-bottom:3px!important;display:block}
.chart-wrap{min-height:90px!important;flex:1 1 auto!important}
.chart-wrap canvas{width:100%!important;height:100%!important}
.dashboard{grid-template-rows:auto minmax(110px,1fr) auto!important}
html.v5-spring-on .dashboard{grid-template-rows:auto auto minmax(110px,1fr) auto!important}
.bottom-bar{gap:6px!important;padding:8px 10px 14px!important}
.bottom-bar button{font-size:9px!important;min-height:26px!important;border-radius:8px!important}
.v5s-card .v5s-item svg{width:30px;height:44px}
.v5s-card .v5s-item b{font-size:14px}
.iw-dial-container{touch-action:none;cursor:grab}
`);
  if(!d.__v5Bed){d.__v5Bed=1;
    const sync=()=>{let a=null;try{a=w.parent.V6Bed.alarm}catch(e){}
      d.documentElement.classList.toggle('v5-show-reps',parentRoute(w)==='trainingData');
      const b=d.getElementById('pilatesStartBtn');if(!b)return;b.disabled=!!a;b.style.opacity=a?'.4':'';
      let n=d.getElementById('v5-bed-note');
      if(a&&!n){n=d.createElement('div');n.id='v5-bed-note';n.style.cssText='position:fixed;left:16px;right:16px;bottom:64px;z-index:20;padding:6px 10px;border-radius:8px;background:#4a1c24;color:#ffb3ba;font-size:11px;text-align:center;border:1px solid #d92d3a';n.textContent='普拉提床未完全拉出，普拉提训练暂不可用';d.body.appendChild(n)}
      else if(!a&&n)n.remove()};
    setInterval(sync,400);sync()}
  if(d.querySelector('.v5s-card'))return;
  const title=d.querySelector('.page-header h1');if(title)title.textContent='普拉提训练';
  const end=d.getElementById('pilatesEndBtn');if(end)end.textContent='结束训练';
  const start=d.getElementById('pilatesStartBtn');if(start)start.textContent='开始训练';
  for(const m of d.querySelectorAll('.panel-metrics .metric')){const l=m.querySelector('label,span,small');if(l&&/次数/.test(m.textContent))m.classList.add('v5-reps')}
  d.querySelectorAll('.config-row *').forEach(e=>{if(e.children.length===0&&/^\s*阻力模式\s*$/.test(e.textContent))e.textContent='重量模式'});
  const ic=d.querySelector('.status-bar-icons');if(ic)ic.innerHTML='<span class="v5-ip">IP: 10.0.2.15</span><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9h4l5-4v14l-5-4H3z"/><path d="M16 8a6 6 0 0 1 0 8" fill="none" stroke="currentColor" stroke-width="2"/></svg><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0M8.5 16a6 6 0 0 1 7 0"/></svg>';
  const c=pageControls(d,{group:'pilatesModeGroup',value:'pilatesResistanceDisplayVal',plus:'pilatesResistancePlus',minus:'pilatesResistanceMinus'});
  if(!c.group||!c.plus)return;
  c.group.querySelector('[data-mode="standard"]')?.click();
  const total=d.getElementById('pilatesResistanceValue');
  let ov=null;                                   /* exact total (the dial itself only steps in whole kg) */
  const apply=()=>{if(ov==null)return;const t=fmt(ov);if(c.value.textContent!==t)c.value.textContent=t;if(total&&total.textContent!==t)total.textContent=t};
  const mo=new w.MutationObserver(apply);[c.value,total].forEach(n=>n&&mo.observe(n,{childList:true,characterData:true,subtree:true}));
  let manualCb=null;
  [c.plus,c.minus].forEach(b=>b.addEventListener('click',e=>{if(e.isTrusted){ov=null;manualCb&&manualCb()}}));
  dialDrag(d,()=>{ov=null;manualCb&&manualCb()});
  const card=d.createElement('article');card.className='panel v5s-card';card.innerHTML='<h2 class="panel-title">弹簧配置</h2><div class="v5s-host"></div>';
  d.querySelector('.chart-panel').before(card);
  controller(card.querySelector('.v5s-host'),{
    initial:'s1',note:false,autoSpring:true,container:card,
    mode:()=>c.group.querySelector('.active')?.dataset.mode||'',
    locked:()=>c.plus.disabled,
    read:()=>ov!=null?ov:Number(c.value.textContent),
    write:t=>{setByStepping(c,Math.round(t));ov=t;apply()},
    onManual:fn=>{manualCb=fn}
  });
}

/* --- rep counter display (value comes from the review panel) --- */
window.V5Reps={n:0,supported:true,last:null};
function repEl(d){const a=d.getElementById('training-reps');if(a)return a;for(const m of d.querySelectorAll('.metric')){const l=m.querySelector('label');if(l&&/次数|Reps/i.test(l.textContent))return m.querySelector('strong')}return null}
function applyReps(d){const el=repEl(d);if(!el)return;const r=window.V5Reps,small=el.querySelector('small');if(el.id==='training-reps'){el.textContent=r.supported?r.n:'—';const u=el.nextElementSibling;if(u&&u.tagName==='SMALL')u.style.visibility=r.supported?'':'hidden'}else{el.innerHTML=(r.supported?r.n:'—')+(r.supported?' <small>次</small>':'')}}
window.V5Frame={
  patch(f){try{const w=f.contentWindow,d=f.contentDocument;if(!w||!d||!d.body)return;const p=w.location.pathname;
    if(w.setIwMode&&w.PlanBImmersiveDemo&&w.syncIwWeightUI)patchAI(w,d);
    else if(/free-training-strength-temp\.html$/.test(p))patchStrength(w,d);
    else if(/plan-b-free-training-pilates\.html$/.test(p))patchPilates(w,d);
    applyReps(d)}catch(e){}},
  reps(f){try{applyReps(f.contentDocument)}catch(_){}},
  recog(f,open){try{f.contentWindow.__v5Recog?.(open)}catch(_){}}
};
})();
