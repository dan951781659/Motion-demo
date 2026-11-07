/* V6: Pilates-bed control rebuilt per the approved proposal (bed-control-proposal.html).
   - Entering the page pauses training, so no 训练状态 / 轨道锁 rows.
   - Flow: 展开普拉提床 → 放下中 → 请向外拉出（10 秒窗口）→ 已锁定；窗口超时卡扣自动重新锁止并触发全局红色置顶横幅。
   - Device only reports 到位 / 未到位 (no percentage). */
(()=>{
const T=(z,e)=>prefs.language==='en'?e:z;
const S=window.V6Bed={stage:'folded',left:10,alarm:null,voice:true,prev:'',said:''};
const WINDOW=10,LOWER_MS=3500,RETRACT_MS=3500;
let tick=null,tm=null;
const clear=()=>{clearInterval(tick);clearTimeout(tm);tick=tm=null};
const say=t=>{S.said=t;if(!S.voice)return;try{const u=new SpeechSynthesisUtterance(t);u.lang='zh-CN';speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}};

/* Final on-device copy. The spoken prompt is exactly the on-screen description (d), nothing else is shown twice. */
const COPY={
  folded:{t:'普拉提床已收起',d:'当前仅支持力量训练。如需普拉提训练，请展开普拉提床。',short:'已收起'},
  lowering:{t:'普拉提床放下中',d:'请勿靠近普拉提床，请勿放置物品。',short:'放下中'},
  stopped:{t:'普拉提床已停止',d:'普拉提床停在中途，普拉提训练暂不可用。',short:'已停止'},
  pull:{t:'请将普拉提床向外拉出',d:'请在 {n} 秒内将普拉提床向外拉出到位，到位后将自动锁定。',short:'请拉出'},
  locked:{t:'普拉提床已锁定',d:'普拉提训练已就绪，可返回训练。',short:'已锁定'},
  timeout:{t:'普拉提床未完全拉出',d:'卡扣已重新锁止，请重新解锁后再拉出。',short:'未完全拉出'},
  push:{t:'请将普拉提床推回',d:'请在 {n} 秒内将普拉提床手动推回原位，到位后将自动收起。',short:'请推回'},
  pushTimeout:{t:'普拉提床未完全推入',d:'卡扣已重新锁止，请重新解锁后再推回。',short:'未完全推入'},
  retracting:{t:'普拉提床收起中',d:'请勿靠近普拉提床，请勿放置物品。',short:'收起中'}
};
const descOf=(stage,n)=>COPY[stage].d.replace('{n}',n==null?WINDOW:Math.max(n,0));
/* "已为你暂停训练" only while the bed is moving or waiting for the user (not when fully out and locked / folded / latched) */
const PAUSE_NOTE=['lowering','stopped','pull','push','retracting'];
const BANNER={out:['普拉提床未完全拉出','卡扣已重新锁止，普拉提训练暂不可用'],in:['普拉提床未完全推入','卡扣已重新锁止，请重新处理']};

/* ---------- state transitions ---------- */
function set(stage){
  S.stage=stage;S.alarm=stage==='timeout'?'out':stage==='pushTimeout'?'in':null;
  refresh();
}
function refresh(){
  syncBanner();
  if(route==='bedControl'&&end==='device')render();
  else if(document.querySelector('.v5-panel')&&typeof paintPanel==='function')paintPanel();
}
function windowStart(stage){
  clear();S.left=WINDOW;say(descOf(stage,S.left));set(stage);
  tick=setInterval(()=>{
    S.left--;
    if(S.left===3)say(descOf(stage,3));
    document.querySelectorAll('[data-v6cd]').forEach(e=>{e.textContent=Math.max(S.left,0);const r=e.closest('.v6b-ring');if(r){r.style.setProperty('--p',Math.max(S.left,0)/WINDOW*100);r.classList.toggle('warn',S.left<=3)}});
    document.querySelectorAll('[data-v6desc]').forEach(e=>{e.textContent=descOf(stage,S.left)});
    if(S.left<=0){clear();const bad=stage==='pull'?'timeout':'pushTimeout';say(descOf(bad));set(bad)}
  },1000);
}
const A=window.v6Bed={
  open(){if(S.stage!=='folded')return;clear();say(descOf('lowering'));set('lowering');tm=setTimeout(()=>windowStart('pull'),LOWER_MS)},
  stop(){if(!['lowering','retracting'].includes(S.stage))return;S.prev=S.stage;clear();set('stopped')},
  resume(){if(S.stage!=='stopped')return;const p=S.prev||'lowering';clear();set(p);tm=setTimeout(()=>p==='lowering'?windowStart('pull'):set('folded'),LOWER_MS)},
  pulled(){if(S.stage!=='pull')return notify('当前不在等待拉出状态');clear();say(descOf('locked'));set('locked')},
  relock(){if(S.stage==='timeout')windowStart('pull');else if(S.stage==='pushTimeout')windowStart('push')},
  close(){if(S.stage!=='locked')return;windowStart('push')},
  pushed(){if(S.stage!=='push')return notify('当前不在等待推回状态');clear();say(descOf('retracting'));set('retracting');tm=setTimeout(()=>set('folded'),RETRACT_MS)},
  timeout(){clear();S.left=0;say(descOf('timeout'));set('timeout')},
  reset(){clear();set('folded')},
  voice(){S.voice=!S.voice;if(!S.voice)try{speechSynthesis.cancel()}catch(e){}render()},
  back(){go('training')}
};

/* ---------- page ---------- */
const icon=(p)=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>';
function ring(){
  const p=Math.max(0,S.left)/WINDOW*100;
  return '<div class="v6b-ring'+(S.left<=3?' warn':'')+'" style="--p:'+p+'"><b data-v6cd>'+S.left+'</b><small>秒</small></div>';
}
function hero(){
  const st=S.stage;
  const pic=BedArt.svg(st);
  const cd=['pull','push'].includes(st)?ring():'';
  const prog=['lowering','retracting'].includes(st)?'<span class="v6b-prog"><i></i></span>':'';
  const bad=['timeout','pushTimeout'].includes(st)?' bad':'';
  return '<div class="v6b-hero'+bad+'">'+pic+cd+prog+'</div>';
}
function steps(){
  const closing=['push','pushTimeout','retracting'].includes(S.stage)||(S.stage==='folded'&&S.prev==='closed');
  const names=closing?['手动推回','自动收起','已收起']:['放下普拉提床','拉出普拉提床','自动锁定'];
  const idx={folded:-1,lowering:0,stopped:0,pull:1,timeout:1,locked:3,push:0,pushTimeout:0,retracting:1}[S.stage];
  const bad=['timeout','pushTimeout'].includes(S.stage);
  return '<div class="v6b-steps">'+names.map((n,i)=>'<div class="'+(i<idx?'done':i===idx?(bad?'bad':'on'):'')+'"><i>'+(i<idx?'✓':i+1)+'</i>'+n+'</div>').join('')+'</div>';
}
function actions(){
  switch(S.stage){
    case 'folded':return btn('展开普拉提床',"v6Bed.open()");
    case 'lowering':case 'retracting':return btn('停止',"v6Bed.stop()",'secondary');
    case 'stopped':return btn('继续',"v6Bed.resume()");
    case 'pull':case 'push':return ''; /* waiting for the sensor: countdown + description only, nothing to tap */
    case 'locked':return btn('收起普拉提床',"v6Bed.close()",'secondary');
    case 'timeout':case 'pushTimeout':return btn('重新解锁',"v6Bed.relock()",'danger');
  }
  return '';
}
pages.bedControl=()=>{
  const c=COPY[S.stage],bad=['timeout','pushTimeout'].includes(S.stage);
  const desc=['pull','push'].includes(S.stage)?'<span data-v6desc>'+descOf(S.stage,S.left)+'</span>':c.d;
  const hideBack=['lowering','retracting'].includes(S.stage);
  const top=hideBack?'<div class="pagebar v6b-nobar"><h2>'+T('普拉提床控制','Pilates bed control')+'</h2><span class="muted small">Motion</span></div>':bar(T('普拉提床控制','Pilates bed control'),'quickSettings');
  const note=PAUSE_NOTE.includes(S.stage)?'<p class="v6b-note">'+T('已为你暂停训练，操作完成后可继续','Training paused. Resume when done.')+'</p>':'';
  return top+'<div class="pad meeting-bed v6b">'+hero()+steps()+'<div class="v6b-copy'+(bad?' bad':'')+'"><h2 class="v6b-title'+(bad?' bad':S.stage==='locked'?' ok':'')+'">'+c.t+'</h2><p class="v6b-desc">'+desc+'</p>'+note+'</div>'+(actions()?'<div class="v6b-actions">'+actions()+'</div>':'')+'</div>';
};

/* ---------- global red banner (device, every page except the bed page) ---------- */
function frameEl(){return document.getElementById('frame')}
function syncBanner(){
  const f=frameEl();if(!f)return;
  let b=document.getElementById('v6-banner');
  if(!b){b=document.createElement('div');b.id='v6-banner';b.setAttribute('role','alert');b.onclick=()=>go('bedControl');f.appendChild(b)}
  const show=!!S.alarm&&end==='device'&&route!=='bedControl';
  f.classList.toggle('v6-alert',show);
  if(show){const [t,d]=BANNER[S.alarm];b.innerHTML='<span class="v6-ic">!</span><div><b>'+t+'</b><small>'+d+'</small></div><u>去处理</u>'}
  window.dispatchEvent(new Event('v6-bed-change'));
}
const baseRender=render;
render=function(){baseRender();syncBanner();
  if(route==='bedControl'){/* entering the page pauses training */S.paused=true;
    const bb=document.getElementById('backbar');
    if(bb){if(['lowering','retracting'].includes(S.stage))bb.remove();else bb.innerHTML=btn(T('返回','Back'),"go('quickSettings')",'secondary')}}};
paintPanel=(prior=>function(){prior();
  const t=[...document.querySelectorAll('.v5-tile')].find(b=>/bedControl/.test(b.getAttribute('onclick')||''));
  if(t){const sm=t.querySelector('small');if(sm)sm.textContent=COPY[S.stage].short;t.classList.toggle('v6-alert-tile',!!S.alarm)}
})(paintPanel);

/* ---------- review controls ---------- */
reviewControls=(prior=>function(key){
  if(key!=='床体控制')return prior(key);
  return '<div class="review-scenarios"><p class="review-cap">模拟设备回传 · 仅供评审</p>'
   +btn('拉出到位（传感器）',"v6Bed.pulled()",'secondary')+btn('拉出超时（卡扣自动锁止）',"v6Bed.timeout()",'secondary')+btn('推回到位（传感器）',"v6Bed.pushed()",'secondary')+btn('重置为已收起',"v6Bed.reset()",'secondary')
   +'<p class="review-cap">全局横幅 · 去其他页面查看</p>'+btn('去首页查看横幅',"go('home')",'secondary')+btn('去 AI 训练查看横幅',"go('training')",'secondary')+btn('去普拉提训练查看',"go('springQuick');v5SpringPage('pilates')",'secondary')
   +'<p class="review-cap">语音播报（内容与页面说明文案一致）</p>'+btn(S.voice?'语音播报：开（点击关闭）':'语音播报：关（点击开启）',"v6Bed.voice()",'secondary')+'</div>';
})(reviewControls);

/* ---------- styles ---------- */
const css=document.createElement('style');css.textContent=BedArt.css+`
#page:has(.v6b){display:flex;flex-direction:column;overflow:hidden}
#page:has(.v6b) .pagebar{flex:none}
.v6b{flex:1;min-height:0;display:flex;flex-direction:column;gap:0;padding:8px 16px 12px!important}
.v6b-hero{position:relative;flex:0 0 45%;min-height:200px;border-radius:18px;overflow:hidden;background:linear-gradient(180deg,#f7fafc,#e8eef5);border:1px solid var(--d-line)}
.v6b-hero.bad{box-shadow:inset 0 0 0 2px var(--d-error,#d92d3a)}
.v6b-hero .bart{height:100%}
.v6b-ring{position:absolute;right:12px;top:12px;width:72px;height:72px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(#1264c6 calc(var(--p,100)*1%),#d5dee8 0);color:#0f1c2e;box-shadow:0 6px 18px #0b162440}
.v6b-ring::after{content:"";position:absolute;inset:6px;border-radius:50%;background:#fff}
.v6b-ring b,.v6b-ring small{position:relative;z-index:1}
.v6b-ring b{font-size:26px;line-height:1;font-variant-numeric:tabular-nums}
.v6b-ring small{position:absolute;bottom:12px;font-size:10px;color:#6b7888}
.v6b-ring.warn{background:conic-gradient(#f5a524 calc(var(--p,100)*1%),#f3e4c4 0);color:#7a4a00}
.v6b-prog{position:absolute;left:0;right:0;bottom:0;height:5px;background:#0003}
.v6b-prog i{display:block;height:100%;width:40%;background:var(--d-action,#1264c6);animation:v6bar 1.1s linear infinite}
@keyframes v6bar{from{margin-left:-40%}to{margin-left:100%}}
.v6b-nobar{pointer-events:none}
.v6b-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:10px 0 4px;flex:none}
.v6b-steps div{display:flex;flex-direction:column;align-items:center;gap:4px;font-size:11px;color:var(--d-secondary);padding-top:8px;border-top:3px solid var(--d-line)}
.v6b-steps i{font-style:normal;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;font-size:11px;background:var(--d-soft)}
.v6b-steps .on{color:var(--d-primary);border-color:var(--d-primary)}
.v6b-steps .on i{background:var(--d-action,#1264c6);color:#fff}
.v6b-steps .done{color:var(--d-success,#2bb673);border-color:var(--d-success,#2bb673)}
.v6b-steps .done i{background:var(--d-success,#2bb673);color:#fff}
.v6b-steps .bad{color:var(--d-error,#d92d3a);border-color:var(--d-error,#d92d3a)}
.v6b-steps .bad i{background:var(--d-error,#d92d3a);color:#fff}
.v6b-copy{flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center;text-align:center;padding:8px 8px 4px;border-radius:14px}
.v6b-copy.bad{background:#fde6e8;padding:16px 14px}
.v6b-title{margin:0;font-size:24px;line-height:1.25;letter-spacing:-.02em}
.v6b-title.ok{color:var(--d-success,#2bb673)}
.v6b-title.bad{color:var(--d-error,#d92d3a)}
.v6b-desc{margin:8px 0 0;font-size:15px;line-height:1.55;color:var(--d-secondary)}
.v6b-copy.bad .v6b-desc{color:#8a2430}
.v6b-actions{display:flex;flex-direction:column;gap:8px;margin-top:8px;flex:none}
.v6b-actions button{margin:0;height:56px;font-size:16px;border-radius:14px;width:100%}
.frame.device .v6b-actions button.danger,.v6b-actions button.danger{background:#d92d3a;color:#fff;border:0}
.v6b-note{margin:10px 0 0;text-align:center;font-size:12px;color:var(--d-secondary)}
.v6b-voice{display:flex;gap:6px;align-items:center;justify-content:center;margin:0;font-size:12px;color:var(--d-secondary)}
.v6b-voice svg{width:14px;height:14px;flex:none}
/* global red banner: pushes page content down instead of covering it */
#frame{position:relative}
#v6-banner{display:none;position:absolute;left:0;right:0;top:0;z-index:60;height:var(--v6-h,46px);box-sizing:border-box;align-items:center;gap:10px;padding:0 12px;background:#d92d3a;color:#fff;cursor:pointer}
#v6-banner .v6-ic{flex:none;width:22px;height:22px;border-radius:50%;background:#fff;color:#d92d3a;display:grid;place-items:center;font-weight:900;font-size:14px}
#v6-banner div{flex:1;min-width:0;display:flex;flex-direction:column;line-height:1.25}
#v6-banner b{font-size:13px}
#v6-banner small{font-size:11px;opacity:.95}
#v6-banner u{flex:none;text-decoration:none;font-size:12px;font-weight:700;border:1px solid #ffffffb0;border-radius:8px;padding:4px 10px}
#frame.v6-alert{--v6-h:56px}
#frame.v6-alert #v6-banner{display:flex;height:auto;min-height:var(--v6-h)}
#frame.v6-alert #page{height:calc(100% - var(--v6-h))!important;margin-top:var(--v6-h)}
#frame.v6-alert #statusbar{display:none}
#v6-banner small{white-space:normal;overflow:visible;text-overflow:clip}
.frame.device .v5-tile.v6-alert-tile{background:var(--d-error-bg,#fde6e8);border-color:var(--d-error,#d92d3a);color:var(--d-error,#d92d3a)}
.frame.device .v5-tile.v6-alert-tile small,.frame.device .v5-tile.v6-alert-tile svg{color:var(--d-error,#d92d3a)}
/* single back control: the bottom 返回 bar only (header ‹ hidden on this page) */
#page:has(.v6b-title) .pagebar>button{display:none}
`;
document.head.appendChild(css);
syncBanner();render();
})();
