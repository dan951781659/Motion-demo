/* Device-only bed control review entry. Uses the existing shared safety state. */
(() => {
const zh=()=>prefs.language==='zh';
const t=(a,b)=>zh()?a:b;
routes.bedControl='床体控制';
notes.bedControl=['床体控制','全局快捷控制中的床体操作与安全规则'];
pages.bedControl=()=>bar(tr('床体位置'),'home')+'<div class="pad"><h3>'+t('床体控制','Bed control')+'</h3><p>'+t('通过全局快捷面板操作床体。','Operate the bed from quick controls.')+'</p><button class="primary" onclick="openPanel()">'+t('打开床体控制','Open bed controls')+'</button></div>'; 
if(!quick.device.includes('bedControl'))quick.device.splice(1,0,'bedControl');
featureRules.bedControl=['床体控制与安全互斥',[
'左侧“床体控制”直接打开全局快捷面板并定位床体卡片；与原上滑入口共用状态和操作。',
'训练未暂停时明确提示原因，可点击“暂停训练后操作”；暂停后仍检查连接、状态回传、其他训练、轨道锁定和床体推入到位。',
'折叠／展开前二次确认床上无人、周围无遮挡；移动期间显示进度和“停止移动”，禁止轨道解锁及恢复训练。模拟移动约4秒。',
'停止后显示“已停止”，可在条件满足后继续原方向移动；未完全展开时禁止恢复训练。',
'暂停训练入口置于床体及轨道控制按钮上方；未满足条件时按钮直接置灰并展示具体原因，不能依靠点击后的反应判断是否可操作。',
'轨道仅在床体完全展开且停止、训练暂停时解锁。确认后临时解锁，模拟5秒后进入重新锁定，再等待模拟锁定回传；实际时长待硬件确认。',
'断连或状态未知时禁止发送新命令，移动中停止结果不明确时提示使用设备旁实体安全操作；不把超时推断为已锁定。',
'卡片下方“模拟场景”仅用于验收：可验证断连、推入未到位及锁定回传超时。恢复模拟连接后须主动同步状态。APP不提供床体控制。'
]];
const priorRules=paintRules;
paintRules=function(){priorRules();if(route==='bedControl'){const box=$('#product-rules'),r=featureRules.bedControl;if(box)box.innerHTML='<p class="caption">本页新增／优化功能</p><h2>'+r[0]+'</h2><ol>'+r[1].map(x=>'<li>'+x+'</li>').join('')+'</ol>';}};
const oldPaint=paintPanel;
paintPanel=function(){oldPaint();const card=document.querySelector('.qc-bed');if(!card)return;
if(route==='bedControl'){card.open=true;bedExpanded=true;}
const tip=document.createElement('div');tip.className='bed-control-help';tip.innerHTML=`<p class="small muted">${t('床体调整前请确保床上无人，周围无遮挡。','Ensure the bed is empty and its surroundings are clear.')}</p><button class="secondary" id="bed-pause" onclick="pauseForBed()">${t('暂停训练后操作','Pause training to operate')}</button><p class="small" id="bed-live" role="status" aria-live="polite"></p><details><summary>${t('模拟场景 · 仅用于验收','Simulated review scenarios')}</summary><div class="bed-scenarios">${[['normal','正常／同步状态','Normal / sync'],['disconnect','设备断连','Disconnect'],['sensor','推入未到位','Bed not in position'],['timeout','锁定回传超时','Lock timeout']].map(([id,a,b])=>`<button class="secondary" onclick="bedScenario('${id}')">${t(a,b)}</button>`).join('')}</div></details>`;
card.append(tip);
const preflight=document.createElement('div');preflight.className='bed-preflight';
preflight.innerHTML=`<p class="small" id="bed-training-status"></p>`;
preflight.append(tip.querySelector('#bed-pause'));
card.querySelector('summary').after(preflight);
const lockReason=document.createElement('p');lockReason.id='bed-lock-reason';lockReason.className='small muted';lockReason.setAttribute('aria-live','polite');card.querySelector('#gc-unlock').after(lockReason);
updateBedReview();if(route==='bedControl')requestAnimationFrame(()=>card.scrollIntoView({block:'start',behavior:'smooth'}));};
window.pauseForBed=function(){trainPaused=true;const f=document.querySelector('#current-device');f?.contentWindow?.postMessage({type:'motion-bed-pause-request'},'*');updateGlobalBed();updateBedReview();notify(t('已暂停模拟训练，可检查床体操作条件','Simulation paused. Check bed readiness.'));};
window.bedScenario=function(s){if(bed.position.includes('正在'))return notify(t('请先停止床体移动，再切换模拟场景','Stop bed movement before changing scenarios'));
if(s==='normal'){bed.connected=true;bed.unknown=false;bed.sensorReady=true;bed.timeout=false;bed.lock='已锁定';bed.relockDue=0;bed.confirmDue=0;bed.remaining=0;}
if(s==='disconnect'){bed.connected=false;bed.unknown=true;}
if(s==='sensor')bed.sensorReady=false;
if(s==='timeout'){bed.connected=true;bed.unknown=false;bed.timeout=true;bed.lock='正在重新锁定';bed.relockDue=0;bed.confirmDue=Date.now()-1;}
updateGlobalBed();updateBedReview();};
function updateBedReview(){const p=document.querySelector('#bed-pause');if(!p)return;p.hidden=trainPaused;document.querySelector('#bed-training-status').textContent=trainPaused?t('训练已暂停，可检查下方操作条件。','Training paused. Check the conditions below.'):t('请先暂停训练，再调整床体或解锁轨道。','Pause training before moving the bed or unlocking the rail.');const moving=bed.position.includes('正在');const reason=canBed('移动');document.querySelector('#bed-live').textContent=moving?t('床体移动中，请勿靠近。可随时停止。','Bed moving. Keep clear; stop at any time.'):bed.timeout?t('锁定回传超时：请检查设备，收到锁定确认前不可恢复训练。','Lock confirmation timed out. Check device before resuming.'):reason||t('条件已满足，可折叠／展开；轨道解锁须床体完全展开。','Ready to move. Rail unlocking requires a fully unfolded bed.');
const u=document.querySelector('#gc-unlock');if(u){
const lockWhy=bed.position!=='已展开'?t('床体完全展开后才可解锁轨道。','Fully unfold the bed before unlocking the rail.'):canBed('解锁');
u.disabled=!!lockWhy;u.setAttribute('aria-disabled',String(u.disabled));
u.textContent=tr(bed.lock==='已解锁'?'已解锁':bed.lock==='正在重新锁定'?'正在重新锁定':'解锁轨道');
u.title=lockWhy||t('解锁轨道','Unlock rail');
document.querySelector('#bed-lock-reason').textContent=lockWhy||t('床体已完全展开，满足条件，可解锁轨道。','Bed fully unfolded and ready to unlock.');
}}
const oldRender=render;render=function(){if(route==='bedControl'){panelOpen=true;bedExpanded=true;}oldRender();if(route==='bedControl'){$('#reviewtitle').textContent=t('床体控制','Bed control');const r=featureRules.bedControl;const box=$('#product-rules');if(box)box.innerHTML='<p class="caption">本页新增／优化功能</p><h2>'+r[0]+'</h2><ol>'+r[1].map(x=>'<li>'+x+'</li>').join('')+'</ol>';}};
setInterval(()=>{if(panelOpen){updateGlobalBed();updateBedReview();}},200);
const style=document.createElement('style');style.textContent='.qc-bed button:disabled{opacity:.38!important;cursor:not-allowed!important;filter:grayscale(1);box-shadow:none!important}.qc-bed button:not(:disabled){cursor:pointer}.bed-preflight{padding:12px 0 14px;margin-bottom:12px;border-bottom:1px solid #54768b}.bed-preflight p{margin:0 0 10px}.bed-preflight button{width:100%}.bed-control-help{border-top:1px solid #54768b;margin-top:14px;padding-top:10px}.bed-control-help summary{font-size:12px}.bed-scenarios{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.bed-scenarios button{font-size:12px;padding:10px}.qc-bed{scroll-margin-top:12px}';document.head.append(style);
render();
})();
