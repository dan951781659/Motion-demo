/* 管理后台作为第三端：左栏只留三个后台页，中间是后台，右侧是该页规则。
   同时收口设备端 / APP 端左栏，并让 APP 注册沿用原注册页。 */
(function(){
  const sw=document.querySelector('.switch');
  if(!sw||document.getElementById('v6-admin-btn'))return;
  const st=document.createElement('style');
  st.textContent=
    '.switch{flex-wrap:wrap}#v6-admin-btn{flex:1 1 100%;margin-top:6px}'+
    'body.v6-admin .tools,body.v6-admin .stage,body.v6-admin .caption{display:none!important}'+
    /* 三栏宽度可调：左栏、右侧规则可拖动，中间后台自适应占满剩余宽度；整体窄于 960px 时才出现横向滚动条。 */
    'body.v6-admin>aside{width:var(--v6-left,210px)}'+
    'body.v6-admin>main{height:100dvh;overflow:auto;width:calc(100% - var(--v6-left,210px))}'+
    'body.v6-admin .workspace{display:grid!important;grid-template-columns:minmax(0,1fr) 12px var(--v6-right,420px)!important;width:100%;min-width:0;gap:0;align-items:start}'+
    /* 自适应：宽度放不下「后台 + 右侧规则」时，右侧规则整块移到后台下方，纵向滚动阅读 */
    'body.v6-admin.v6-stack .workspace{grid-template-columns:minmax(0,1fr)!important;row-gap:20px}'+
    'body.v6-admin.v6-stack .v6-rz.rz-right{display:none!important}'+
    'body.v6-admin.v6-stack .workspace>article{position:static!important;max-height:none!important;width:100%!important;height:auto!important}'+
    'body.v6-admin.v6-stack #v6-admin-frame{height:max(640px,calc(100dvh - 150px))}'+
    'body.v6-admin .workspace>article{min-width:0;margin:0}'+
    '#v6-admin-frame{display:none;width:100%;height:calc(100dvh - 150px);min-height:640px;border:1px solid #d5dbe5;border-radius:12px;background:#fff}'+
    '.v6-rz{display:none;cursor:col-resize;touch-action:none;position:relative;z-index:40;user-select:none}'+
    '.v6-rz::after{content:"";position:absolute;top:0;bottom:0;left:50%;width:2px;margin-left:-1px;background:transparent;border-radius:2px;transition:background .12s}'+
    '.v6-rz:hover::after,.v6-rz.drag::after{background:#1264c6}'+
    '.v6-rz i{position:absolute;top:50%;left:50%;width:6px;height:34px;margin:-17px 0 0 -3px;border-radius:4px;background:#b7c3d4;opacity:.9}'+
    '.v6-rz:hover i,.v6-rz.drag i{background:#1264c6}'+
    'body.v6-admin .v6-rz.rz-right{display:block;align-self:stretch;min-height:640px}'+
    'body.v6-admin #v6-rz-left{display:block;position:fixed;top:0;bottom:0;left:calc(var(--v6-left,210px) - 6px);width:12px}'+
    'body.v6-dragging{cursor:col-resize;user-select:none}body.v6-dragging iframe{pointer-events:none}'+
    '#v6-rz-tip{position:fixed;z-index:80;top:12px;padding:3px 10px;border-radius:99px;background:#1d2b3a;color:#fff;font-size:12px;display:none;pointer-events:none}'+
    'body.v6-admin #v6-admin-frame{display:block}'+
    /* 底部用常驻的横向滚动条代替左右按钮：拖动或触控板横滑都可以 */
    'body.v6-admin>main{padding-bottom:18px;scrollbar-width:auto;scrollbar-color:#8aa0bd #e3e9f1}'+
    'body.v6-admin>main::-webkit-scrollbar{height:16px;width:12px}'+
    'body.v6-admin>main::-webkit-scrollbar-track{background:#e3e9f1;border-top:1px solid #d5dbe5}'+
    'body.v6-admin>main::-webkit-scrollbar-thumb{background:#8aa0bd;border-radius:8px;border:3px solid #e3e9f1}'+
    'body.v6-admin>main::-webkit-scrollbar-thumb:hover{background:#5f7a9c}'+
    '#v6-theme{flex:1 1 100%;display:flex;align-items:center;gap:8px;margin-top:8px;font-size:12px;color:#64758b}'+
    '#v6-theme span.t{white-space:nowrap}#v6-theme .seg{display:flex;flex:1;border:1px solid #cdd6e2;border-radius:8px;overflow:hidden;background:#fff}'+
    '#v6-theme .seg button{flex:1;width:auto;border:0;border-radius:0;padding:5px 0;background:transparent;color:#3a4656;cursor:pointer;font-size:12px;margin:0}'+
    '#v6-theme .seg button.on{background:#1264c6;color:#fff}'+
    '#app-register-frame{display:block;width:100%;height:100%;min-height:640px;border:0;background:#020408}';
  document.head.appendChild(st);
  const b=document.createElement('button');
  b.id='v6-admin-btn';b.textContent='管理后台';b.type='button';
  sw.appendChild(b);
  const ws=document.querySelector('.workspace');
  const fr=document.createElement('iframe');
  fr.id='v6-admin-frame';fr.title='管理后台';
  ws.insertBefore(fr, ws.firstChild);

  /* 可调宽度：左栏 / 右侧规则 */
  const LK='motion-admin-layout',LDEF={left:210,right:420};
  let lay=Object.assign({},LDEF);try{Object.assign(lay,JSON.parse(localStorage.getItem(LK)||'{}'))}catch(e){}
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const FRAME_MIN=800,RIGHT_MIN=300;
  const mainEl=document.querySelector('body>main');
  function applyLay(){
    lay.left=clamp(lay.left,170,380);
    lay.right=clamp(lay.right,RIGHT_MIN,Math.max(320,Math.min(900,window.innerWidth*0.6)));
    document.documentElement.style.setProperty('--v6-left',lay.left+'px');
    /* 可用宽度 = 窗口 − 左栏 − 主区左右内边距；后台至少保留 FRAME_MIN，装不下就上下堆叠 */
    const cs=getComputedStyle(mainEl);
    const avail=window.innerWidth-lay.left-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight)-(mainEl.offsetWidth-mainEl.clientWidth);
    const stack=window.innerWidth<=650||avail<FRAME_MIN+12+RIGHT_MIN;
    document.body.classList.toggle('v6-stack',stack);
    const eff=stack?lay.right:clamp(lay.right,RIGHT_MIN,avail-12-FRAME_MIN);
    document.documentElement.style.setProperty('--v6-right',eff+'px');
  }
  applyLay();window.addEventListener('resize',applyLay);
  if(window.ResizeObserver)new ResizeObserver(applyLay).observe(mainEl);
  const tip=document.createElement('div');tip.id='v6-rz-tip';document.body.appendChild(tip);
  const mkRz=(id,cls,title)=>{const d=document.createElement('div');d.id=id;d.className='v6-rz '+cls;d.title=title;d.innerHTML='<i></i>';return d};
  const rzL=mkRz('v6-rz-left','rz-left','拖动调整左栏宽度，双击恢复'),rzR=mkRz('v6-rz-right','rz-right','拖动调整右侧规则宽度，双击恢复');
  document.body.appendChild(rzL);
  const art=ws.querySelector('article');
  ws.insertBefore(rzR,art||null);
  function drag(el,onMove,label){
    el.addEventListener('pointerdown',e=>{
      e.preventDefault();try{el.setPointerCapture(e.pointerId)}catch(x){}el.classList.add('drag');document.body.classList.add('v6-dragging');tip.style.display='block';
      const mv=ev=>{onMove(ev);applyLay();tip.textContent=label();tip.style.left=Math.min(window.innerWidth-160,Math.max(8,ev.clientX+14))+'px'};
      const up=()=>{el.classList.remove('drag');document.body.classList.remove('v6-dragging');tip.style.display='none';el.removeEventListener('pointermove',mv);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);try{localStorage.setItem(LK,JSON.stringify(lay))}catch(x){}};
      el.addEventListener('pointermove',mv);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
    });
  }
  drag(rzL,ev=>{lay.left=ev.clientX},()=>'左栏 '+Math.round(lay.left)+'px');
  drag(rzR,ev=>{const m=document.querySelector('body>main');const r=m.getBoundingClientRect();lay.right=r.left+m.clientWidth-parseFloat(getComputedStyle(m).paddingRight)-ev.clientX-6},()=>{const f=document.getElementById('v6-admin-frame');return '后台 '+Math.round(f.getBoundingClientRect().width)+'px · 规则 '+Math.round(lay.right)+'px'});
  const resetLay=k=>()=>{lay[k]=LDEF[k];applyLay();try{localStorage.setItem(LK,JSON.stringify(lay))}catch(x){}};
  rzL.addEventListener('dblclick',resetLay('left'));rzR.addEventListener('dblclick',resetLay('right'));

  /* 三端各自独立的深色 / 浅色：设备端、APP 端、管理后台互不影响，各自记住 */
  const TK='motion-theme-by-end',ADMIN_TK='motion-theme-admin';
  let themes={};try{themes=JSON.parse(localStorage.getItem(TK)||'{}')}catch(e){}
  const curEnd=()=>document.body.classList.contains('v6-admin')?'admin':end;
  const getTheme=e=>e==='device'?prefs.theme:e==='app'?(themes.app||'dark'):(localStorage.getItem(ADMIN_TK)||'dark');
  const tbox=document.createElement('div');
  tbox.id='v6-theme';
  tbox.innerHTML='<span class="t" id="v6-theme-label">外观</span><div class="seg"><button type="button" data-t="light">浅色</button><button type="button" data-t="dark">深色</button></div>';
  sw.parentNode.insertBefore(tbox,sw.nextSibling);
  const thSel=document.getElementById('theme');
  if(thSel&&thSel.closest('label'))thSel.closest('label').style.display='none';
  function paintTheme(){
    const e=curEnd(),t=getTheme(e);
    document.getElementById('v6-theme-label').textContent=({device:'设备端外观',app:'APP 端外观',admin:'后台外观'})[e];
    tbox.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));
  }
  function applyTheme(t){
    const e=curEnd();
    if(e==='device'){selectPref('theme',t)}
    else if(e==='app'){themes.app=t;localStorage.setItem(TK,JSON.stringify(themes));thSel.value=t;render()}
    else{localStorage.setItem(ADMIN_TK,t);try{fr.contentWindow.postMessage({type:'admin-theme',theme:t},location.protocol==='file:'?'*':location.origin)}catch(x){}}
    paintTheme();
  }
  tbox.addEventListener('click',ev=>{const t=ev.target.getAttribute&&ev.target.getAttribute('data-t');if(t)applyTheme(t)});

  const ADMIN=[['actions','动作库管理'],['templates','安装方案模板'],['ai','AI动作列表']];
  const DEVICE=['home','scope','bedGuide','prepare','moveDetail','bedControl','training','springQuick','trainingData','quickSettings','settings','musicVolume','help','profile'];
  const APP=['registration','account','profile','help'];
  /* 待确认事项 / 验收口径 / UI 文案表 / FR 索引 / 规则与修改总览 在中间只是占位手机页，
     内容与 rules.html（完整功能规则）重复，已从左栏移除。 */
  const TAIL=[];
  let adminPage='actions';

  routes.registration='注册账号';
  pages.registration=function(){
    return '<iframe id="app-register-frame" title="注册账号（原注册页 + 头像上传）" src="app-register.html?v=1"></iframe>';
  };

  function listFor(which){
    const pages=(which==='app'?APP:DEVICE).filter(r=>routes[r]);
    return pages.concat(TAIL.filter(r=>routes[r]&&!pages.includes(r)));
  }
  function paintAdminNav(){
    $('#routes').innerHTML=ADMIN.map(([id,label])=>btn(label,"v6AdminGo('"+id+"')",id===adminPage?'selected':'')).join('');
  }
  function paintAdminRules(){
    const article=document.querySelector('article'); if(!article||typeof paintRules!=='function')return;
    const key=ADMIN.find(x=>x[0]===adminPage)[1];
    const prev=paintRules;
    paintRules=function(){
      if(!document.body.classList.contains('v6-admin'))return prev();
      let panel=document.getElementById('module-rules');
      if(!panel){panel=document.createElement('div');panel.id='module-rules';article.append(panel)}
      for(const n of article.children)n.style.display=n===panel?'':'none';
      const body=(window.MotionRulebook&&window.MotionRulebook[key])||'';
      const editor=typeof ruleEditorHTML==='function'?ruleEditorHTML(key):body;
      panel.innerHTML='<div class="module-rule-header"><span>当前页面功能规则</span><h2>'+key+'</h2><p>规则仅对应当前演示页面；正式数据来源与模拟行为分别说明。</p></div>'+editor;
    };
    paintRules();
    paintRules=prev;
  }
  function tell(page){
    adminPage=page;paintTheme();
    try{fr.contentWindow.postMessage({type:'admin-nav',page:page},location.protocol==='file:'?'*':location.origin)}catch(e){}
    const name=ADMIN.find(x=>x[0]===page)[1];
    const e=document.getElementById('eyebrow'),t=document.getElementById('reviewtitle');
    if(e)e.textContent='管理后台 / 桌面端'; if(t)t.textContent=name;
    paintAdminNav(); paintAdminRules();
  }
  window.v6AdminGo=tell;
  function enter(){
    document.body.classList.add('v6-admin');
    b.classList.add('selected');paintTheme();
    document.querySelectorAll('[data-end]').forEach(x=>x.classList.remove('selected'));
    if(!fr.getAttribute('src'))fr.src='admin-demo.html?v=18&embed=1';
    else tell(adminPage);
    tell(adminPage);
  }
  function leave(){
    document.body.classList.remove('v6-admin');
    b.classList.remove('selected');setTimeout(paintTheme,0);
  }
  b.addEventListener('click',enter);
  document.querySelectorAll('[data-end]').forEach(x=>x.addEventListener('click',()=>{if(document.body.classList.contains('v6-admin'))leave()},true));
  window.addEventListener('message',e=>{
    if((location.protocol!=='file:'&&e.origin!==location.origin))return;
    if(e.data?.type==='admin-theme'){paintTheme();return}
    if(e.data?.type!=='admin-page')return;
    if(!document.body.classList.contains('v6-admin'))return;
    if(ADMIN.some(x=>x[0]===e.data.page)){adminPage=e.data.page;paintAdminNav();paintAdminRules();
      const t=document.getElementById('reviewtitle'); if(t)t.textContent=ADMIN.find(x=>x[0]===adminPage)[1];}
  });

  const navRender=render;
  render=function(){
    const adminOn=document.body.classList.contains('v6-admin');
    if(!adminOn){
      const list=listFor(end);
      if(list.length&&!list.includes(route))route=list[0];
    }
    if(!adminOn&&end==='app')thSel.value=themes.app||'dark';
    navRender();
    paintTheme();
    if(adminOn){paintAdminNav();paintAdminRules();
      const e=document.getElementById('eyebrow'); if(e)e.textContent='管理后台 / 桌面端';
      return}
    const list=listFor(end);
    $('#routes').innerHTML=list.map(r=>btn(routes[r],`go('${r}')`,r===route?'selected':'')).join('');
  };
  /* 其他脚本重绘时会把顶部小标题改回「设备端…」，后台状态下始终改回来。 */
  const eb=document.getElementById('eyebrow');
  if(eb)new MutationObserver(()=>{if(document.body.classList.contains('v6-admin')&&eb.textContent!=='管理后台 / 桌面端')eb.textContent='管理后台 / 桌面端'}).observe(eb,{childList:true,characterData:true,subtree:true});
  render();
  if(new URLSearchParams(location.search).get('view')==='admin')setTimeout(enter,0);
})();
