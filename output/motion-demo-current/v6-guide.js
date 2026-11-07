/* 床体引导：从力量训练切到普拉提训练时引导用户展开普拉提床；反过来则引导收起。
   纯设备端功能：设备按「目标动作的适用场景 + 普拉提床当前状态」自动判断，
   床状态来自设备 / 固件，文案随设备语言，与管理后台无关，不经过发布。
   实际的展开 / 收起流程沿用「床体控制」页，这里只负责在切换处把用户带过去。 */
(()=>{
const T=(z,e)=>prefs.language==='en'?e:z;
const G=window.V6Guide={mode:'pilates',pending:false};  /* mode: pilates 目标是普拉提 / strength 目标是力量 / same 同场景切换 */
routes.bedGuide='床体引导';
notes.bedGuide=['床体引导','力量与普拉提切换时，引导用户展开或收起普拉提床。'];
pages.bedGuide=function(){
  const st=V6Bed.stage;
  let t,d,primary='',ready=false,ok=false;
  if(G.mode==='same'){
    ready=true;t=T('无需处理床体','No bed action needed');d=T('同一训练场景内切换动作，不触发床体引导，直接进入安装准备。','Switching within the same training type does not trigger bed guidance.');
  }else if(G.mode==='pilates'){
    if(st==='locked'){ready=ok=true;t=T('普拉提床已就绪','Pilates bed ready');d=T('普拉提床已展开并锁定，可以开始安装准备。','The Pilates bed is out and locked. Continue to setup.')}
    else{
      t=T('请展开普拉提床','Please unfold the Pilates bed');
      d=T('接下来是普拉提训练，需要先展开普拉提床并向外拉出到位。展开过程中请勿靠近床体，周围不要放置物品。','Pilates training is next. Unfold the bed and pull it out. Keep clear of the bed while it moves.');
      primary=st==='folded'?btn(T('展开普拉提床','Unfold Pilates bed'),"V6Guide.pending=true;v6Bed.open();go('bedControl')"):btn(T('前往床体控制','Open bed control'),"V6Guide.pending=true;go('bedControl')");
    }
  }else{
    if(st==='folded'){ready=ok=true;t=T('普拉提床已收起','Pilates bed folded');d=T('可以开始力量训练的安装准备。','You can continue to strength training setup.')}
    else{
      t=T('请收起普拉提床','Please fold the Pilates bed');
      d=T('接下来是力量训练，需要先把普拉提床收起。收起前请将床上的物品取下，并确认周围无人。','Strength training is next. Fold the Pilates bed first. Clear the bed and keep people away.');
      primary=st==='locked'?btn(T('收起普拉提床','Fold Pilates bed'),"V6Guide.pending=true;v6Bed.close();go('bedControl')"):btn(T('前往床体控制','Open bed control'),"V6Guide.pending=true;go('bedControl')");
    }
  }
  const stage=G.mode==='same'?(V6Bed.stage==='locked'?'locked':'folded'):st;
  const hero='<div class="v6b-hero'+(ok?'':'')+'">'+BedArt.svg(stage)+'</div>';
  const acts=ready?btn(T('继续','Continue'),"V6Guide.pending=false;go('prepare')"):primary;
  return bar(T('床体引导','Bed guidance'),'library')+'<div class="pad v6b v6g">'+hero+'<div class="v6b-copy"><h2 class="v6b-title'+(ok?' ok':'')+'">'+t+'</h2><p class="v6b-desc">'+d+'</p></div><div class="v6b-actions">'+acts+'</div></div>';
};
if(typeof ruleMap!=='undefined')ruleMap.bedGuide='床体引导';
if(!quick.device.includes('bedGuide')){const i=quick.device.indexOf('prepare');quick.device.splice(i>=0?i:0,0,'bedGuide')}
/* 从引导页进入床体控制后，返回键回到引导页 */
const baseRender=render;
render=function(){
  baseRender();
  if(route==='bedControl'&&G.pending){const bb=document.getElementById('backbar');if(bb&&bb.querySelector('button'))bb.innerHTML=btn(T('返回','Back'),"go('bedGuide')",'secondary')}
};
window.addEventListener('v6-bed-change',()=>{if(route==='bedGuide'&&end==='device')render()});
reviewControls=(prior=>function(key){
  if(key!=='床体引导')return prior(key);
  return '<div class="review-scenarios"><p class="review-cap">切换场景 · 仅供评审</p>'
   +btn('力量 → 普拉提（床已收起）',"V6Guide.mode='pilates';V6Guide.pending=false;v6Bed.reset();render()",'secondary')
   +btn('普拉提 → 力量（床已展开锁定）',"V6Guide.mode='strength';V6Guide.pending=false;V6Bed.stage='locked';V6Bed.alarm=null;render()",'secondary')
   +btn('同场景内切换（不触发）',"V6Guide.mode='same';render()",'secondary')
   +'<p class="review-cap">模拟床体状态</p>'
   +btn('床已展开并锁定（传感器到位）',"V6Bed.stage='locked';V6Bed.alarm=null;render()",'secondary')
   +btn('床已收起',"v6Bed.reset()",'secondary')+'</div>';
})(reviewControls);
})();
