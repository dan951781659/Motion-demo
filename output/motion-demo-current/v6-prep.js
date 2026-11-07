/* V6 训练准备：只做安装。内容完全来自管理后台「安装方案模板」已发布的版本：
   可选引导视频 + 1～5 张自定义卡片（图片 / 主标题 / 副标题）+ 顶部标签。
   后台发布后，这里在下次进入页面时同步；没有视频、没有图片、只调卡扣、增减箱体都是模板自己的内容，页面不写死。 */
(()=>{
const T=(z,e)=>prefs.language==='en'?e:z;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const PUBKEY='motionAdminDemo.pub.v5';
const C=(title,sub)=>({title,sub,img:false});
/* 后台还没打开过时用的内置已发布样例，与后台种子一致 */
const DEF={
  acts:{2:'坐姿双手绳索高位下拉',4:'站立位双手绳索胸推',5:'站姿高位绳索弯举',6:'站姿双头绳面拉',8:'弹簧阻力卷腹',9:'平板支撑',15:'站姿绳索侧平举'},
  tpls:[
    {id:'T-bh',name:'平板凳 · 手柄 · 最高一档',on:true,members:[2],tags:['平板凳','手柄','最高一档'],video:{name:'平板凳+手柄安装.mp4',poster:true},cards:[C('放置平板凳','请在器械前放置平板凳。'),C('更换手柄','请把配件更换为手柄。'),C('调整卡扣','请把卡扣调到最高一档。')]},
    {id:'T-chest',name:'手柄 · 与肩同高',on:true,members:[4],tags:['手柄','与肩同高'],video:null,cards:[C('更换手柄','请把配件更换为手柄。'),C('调整卡扣','请把卡扣调到与肩同高的位置。')]},
    {id:'T-rope',name:'双头绳 · 与肩同高',on:true,members:[5,6],tags:['双头绳','与肩同高'],video:null,cards:[C('更换双头绳','请把配件更换为双头绳。'),C('调整卡扣','请把卡扣调到与肩同高的位置。')]},
    {id:'T-clip',name:'仅调卡扣 · 最低一档',on:true,members:[15],tags:[],video:null,cards:[C('调整卡扣','请把卡扣调到最低一档，无需更换配件。')]},
    {id:'T-pbox',name:'普拉提 · 放置箱体',on:true,members:[8],tags:['箱体'],video:{name:'普拉提放置箱体.mp4',poster:true},cards:[C('放置箱体','请把箱体放到普拉提床上。'),C('确认箱体固定','请确认箱体卡稳后再开始。')]}
  ]
};
function store(){try{const s=JSON.parse(localStorage.getItem(PUBKEY)||'null');if(s&&s.tpls&&s.acts)return s}catch(e){}return DEF}
/* 动作 → 已发布且启用的模板；没有则视为未归属，直接进入动作详情 */
function tplOf(name){
  const s=store();const id=Object.keys(s.acts).find(k=>s.acts[k]===name);
  if(id==null)return null;
  return s.tpls.find(t=>t.on&&t.members.includes(+id))||null;
}
const ACTS={
  first:{name:'坐姿双手绳索高位下拉'},
  same:{name:'站姿双头绳面拉',prev:'站姿高位绳索弯举'},
  clip:{name:'站姿绳索侧平举'},
  chest:{name:'站立位双手绳索胸推'},
  pbox:{name:'弹簧阻力卷腹'},
  skip:{name:'平板支撑'}
};
window.V6Prep={scene:'first',vfail:false};
function artImg(){return '<svg viewBox="0 0 280 140" aria-hidden="true"><rect x="118" y="28" width="44" height="88" rx="10" fill="#2a3b52"/><path d="M86 70h32m8 0h32" stroke="#3b82c4" stroke-width="6" stroke-linecap="round"/><circle cx="78" cy="70" r="10" fill="#e8eef6" stroke="#8aa0b8" stroke-width="3"/><circle cx="202" cy="70" r="10" fill="#e8eef6" stroke="#8aa0b8" stroke-width="3"/></svg>'}
function vidSvg(still){
  return '<svg viewBox="0 0 160 90" class="v6p-vsvg'+(still?' still':'')+'" aria-hidden="true"><rect x="18" y="8" width="10" height="74" rx="3" fill="#2a3b52"/><rect x="132" y="8" width="10" height="74" rx="3" fill="#2a3b52"/><path d="M32 47h96" stroke="#3b82c4" stroke-width="2" stroke-dasharray="4 3"/><g class="v6p-clip"><rect x="13" y="44" width="20" height="7" rx="2" fill="#f5a524"/></g><circle class="v6p-h" cx="132" cy="47" r="7" fill="#e8eef6" stroke="#8aa0b8" stroke-width="2"/></svg>';
}
function video(t){
  if(!t.video)return '';
  const fail=V6Prep.vfail;
  return '<div class="v6p-vid'+(fail?' fail':'')+'">'+vidSvg(fail)+'<span class="v6p-vtag">'+(fail?T('视频暂不可用 · 显示封面','Video unavailable · cover shown'):T('示例视频 · 循环播放 · 静音','Sample video · looping · muted'))+'</span></div>';
}
function card(c,i){
  return '<div class="v6p-card"><div class="v6p-art">'+(c.img?artImg():'<span class="v6p-num">'+(i+1)+'</span>')+'</div><div class="v6p-body"><b>'+esc(c.title)+'</b>'+(c.sub?'<p>'+esc(c.sub)+'</p>':'')+'</div></div>';
}
routes.moveDetail='动作详情';
notes.moveDetail=['动作详情','安装准备完成后进入原动作详情页。'];
pages.moveDetail=function(){return ''};
if(typeof ruleMap!=='undefined')ruleMap.moveDetail='动作详情';
if(typeof sourceDevice!=='undefined')sourceDevice.moveDetail='plan-b-move-detail.html?idx=0&cat=strength&filter=recommended';
finishPrep=function(){checked=true;go('moveDetail')};
pages.prepare=function(){
  const a=ACTS[V6Prep.scene]||ACTS.first;
  if($('#state')&&$('#state').value==='error'){
    return bar(T('训练准备','Training preparation'),'library')+'<div class="pad prep-guide v6p"><div class="v6p-skip"><b>'+T('安装内容加载失败','Could not load setup')+'</b><p>'+T('可重试，或直接查看动作详情。','Retry, or open the action detail.')+'</p></div>'+btn(T('重试','Retry'),"$('#state').value='normal';render()")+btn(T('查看动作详情','View action'),'finishPrep()','secondary')+'</div>';
  }
  const t=tplOf(a.name);
  const prevT=a.prev?tplOf(a.prev):null;
  let body,head='<div class="v6p-head"><h3 class="v6p-name">'+esc(a.name)+'</h3>';
  if(!t){
    body='<div class="v6p-skip"><b>'+T('本动作无需安装准备','No setup needed')+'</b><p>'+T('该动作没有归属的安装方案模板，或模板已停用 / 未发布，直接查看动作详情。','This action has no published setup template. Open the action detail.')+'</p></div>';
  }else if(prevT&&prevT.id===t.id){
    body='<div class="v6p-skip"><b>'+T('安装未变化','Setup unchanged')+'</b><p>'+T('与上一个动作使用同一个安装方案，已跳过安装提示。','Same setup template as the last action.')+'</p></div>';
  }else{
    if(t.tags&&t.tags.length)head+='<div class="v6p-tags">'+t.tags.map(x=>'<span>'+esc(x)+'</span>').join('')+'</div>';
    body=video(t)+t.cards.map(card).join('');
  }
  head+='</div>';
  return bar(T('训练准备','Training preparation'),'library')+'<div class="pad prep-guide v6p">'+head+'<div class="v6p-cards">'+body+'</div>'+btn(T('已完成，查看动作','Done, view action'),'finishPrep()')+'</div>';
};
reviewControls=(prior=>function(key){
  if(key!=='训练准备')return prior(key);
  return '<div class="review-scenarios"><p class="review-cap">安装准备 · 仅供评审（内容来自后台已发布的模板）</p>'
   +btn('有视频 + 3 张卡（凳 + 手柄 + 卡扣）',"V6Prep.scene='first';render()",'secondary')
   +btn('连续同模板（跳过）',"V6Prep.scene='same';render()",'secondary')
   +btn('只调卡扣（1 张卡，无视频）',"V6Prep.scene='clip';render()",'secondary')
   +btn('无视频图文卡（手柄 + 卡扣）',"V6Prep.scene='chest';render()",'secondary')
   +btn('普拉提 · 放置箱体（有视频）',"V6Prep.scene='pbox';render()",'secondary')
   +btn('未归属模板（直接进动作）',"V6Prep.scene='skip';render()",'secondary')
   +'<p class="review-cap">视频兜底</p>'
   +btn(V6Prep.vfail?'模拟视频加载失败：开（点击关闭）':'模拟视频加载失败：关（点击开启）',"V6Prep.vfail=!V6Prep.vfail;render()",'secondary')+'</div>';
})(reviewControls);
/* 后台发布后，设备端 Demo 同步刷新 */
window.addEventListener('storage',e=>{if(e.key===PUBKEY&&route==='prepare'&&end==='device')render()});
const css=document.createElement('style');css.textContent=`
#page:has(.v6p){display:flex;flex-direction:column;overflow:hidden}
#page:has(.v6p) .pagebar{flex:none}
.v6p{flex:1;min-height:0;display:flex;flex-direction:column;padding:8px 16px 12px!important}
.v6p-head{flex:none;margin-bottom:8px}
.v6p .v6p-name{margin:0 0 6px;font-size:20px}
.v6p-tags{display:flex;gap:6px;flex-wrap:wrap}
.v6p-tags span{font-size:12px;padding:2px 10px;border-radius:99px;background:var(--d-soft);color:var(--d-secondary)}
.v6p-cards{flex:1;min-height:0;overflow:auto;display:block;padding:2px 0 10px}
.v6p-vid{position:relative;aspect-ratio:16/9;border-radius:16px;overflow:hidden;background:#0d1e33;border:1px solid var(--d-line);margin-bottom:10px}
.v6p-vid.fail{filter:saturate(.6) brightness(.85)}
.v6p-vsvg{width:100%;height:100%;display:block}
.v6p-vtag{position:absolute;left:10px;bottom:8px;font-size:11px;padding:2px 8px;border-radius:99px;background:#000a;color:#fff}
.v6p-clip{animation:v6pclip 4s ease-in-out infinite}.v6p-h{animation:v6ph 4s ease-in-out infinite}
.v6p-vsvg.still .v6p-clip,.v6p-vsvg.still .v6p-h{animation:none}
@keyframes v6pclip{0%,15%{transform:translateY(0)}45%,60%{transform:translateY(-26px)}85%,100%{transform:translateY(0)}}
@keyframes v6ph{0%,50%{fill:#e8eef6}70%,100%{fill:#3b82c4}}
.v6p-card{display:flex;gap:12px;align-items:center;background:var(--d-soft);border:1px solid var(--d-line);border-radius:16px;padding:10px 12px;min-width:0;width:100%;box-sizing:border-box;margin-bottom:10px}
.v6p-art{width:80px;height:64px;flex:none;border-radius:12px;background:#1a2a3d;display:grid;place-items:center;overflow:hidden}
.v6p-art svg{width:74px;height:58px;display:block}
.v6p-num{width:30px;height:30px;border-radius:50%;background:#2c4766;color:#dbe8f7;display:grid;place-items:center;font-size:15px;font-weight:700}
.v6p-body{flex:1;min-width:0}
.v6p-body b{display:block;font-size:16px;margin-bottom:4px;color:var(--d-text)}
.v6p-body p{margin:0;font-size:13px;line-height:1.5;color:var(--d-secondary)}
.v6p-skip{margin:auto 0;text-align:center;padding:28px 12px;border-radius:16px;background:var(--d-soft)}
.v6p-skip b{display:block;font-size:18px;margin-bottom:8px}
.v6p-skip p{margin:0;color:var(--d-secondary)}
.v6p>button{flex:none;height:56px;font-size:16px;border-radius:14px;margin-top:4px}
`;document.head.appendChild(css);
})();
