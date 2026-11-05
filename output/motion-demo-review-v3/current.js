/* 仅在左栏显示本轮增量入口；原功能仍在页面内部可达。 */
const quick={device:['prepare','training','help','settings','profile'],app:['account','help']};
const sourceDevice={home:'index-plan-b-home.html',library:'plan-b-all-training.html',plans:'plan-b-my-training-plans.html',profile:'plan-b-profile.html',records:'plan-b-training-records.html'};
const inheritedRender=render;
render=function(){inheritedRender();$('#routes').innerHTML=quick[end].map(r=>btn(routes[r],`go('${r}')`,route===r?'selected':'')).join('');if(end==='device'&&sourceDevice[route]&&$('#comparison').value==='after'){$('#page').innerHTML=`<iframe id="current-device" allow="camera" class="compareframe" title="最新设备原页面增量修改" src="device-baseline/${sourceDevice[route]}"></iframe>`;$('#statusbar').style.display='none';$('#bottomnav').style.display='none';const back=$('#backbar');if(back)back.remove();$('#noteBody').textContent+=' 本页直接复用指定最新设备 HTML，保留其现有模块和布局。'}else $('#statusbar').style.display='flex';$('#eyebrow').textContent=end==='device'?'设备端 · 指定最新 HTML 页面及增量交互':'APP · 基于指定 Flutter 页面结构的浏览器交互稿';};
window.addEventListener('message',e=>{if((location.protocol==='file:'||e.origin===location.origin)&&e.data?.type==='motion-route'&&routes[e.data.route])go(e.data.route)});
// APP 无当前可运行原生构建：不再把旧 RN 包当作当前 APP 对照。
const oldBaseline=showBaseline;showBaseline=function(){if(end==='device')oldBaseline();else{$('#comparison').value='after';notify('APP 当前基线为 Flutter 源码；此处不使用旧 RN 参考冒充现状。')}};
render();
routes.trainingControls='床体互斥与异常状态';notes.trainingControls=notes.training;pages.trainingControls=()=>pages.training();quick.device.splice(5,0,'trainingControls');
sourceDevice.training='plan-b-immersive-workout.html';
const emitOriginal=emitResult;emitResult=function(i){const f=$('#current-device');if(f){f.contentWindow.postMessage({type:'motion-feedback',index:i},location.protocol==='file:'?'*':location.origin);return}emitOriginal(i)};
const unknownOriginal=emitUnknown;emitUnknown=function(){const f=$('#current-device');if(f){f.contentWindow.postMessage({type:'motion-feedback',index:5},location.protocol==='file:'?'*':location.origin);return}unknownOriginal()};
// Supplemental state scenarios use the same target state machine without replacing the primary original screen.
const sourceRender=render;render=function(){if(route==='trainingControls'){const keep=route;route='training';delete sourceDevice.training;sourceRender();sourceDevice.training='plan-b-immersive-workout.html';route=keep;$('#reviewtitle').textContent='床体互斥与异常状态';$('#routes').innerHTML=quick[end].map(r=>btn(routes[r],`go('${r}')`,r===route?'selected':'')).join('')}else sourceRender()};
render();
const targetUpdate=updateTraining;updateTraining=function(){if(route==='trainingControls'){route='training';try{targetUpdate()}finally{route='trainingControls'}}else targetUpdate()};
window.addEventListener('message',e=>{if((location.protocol!=='file:'&&e.origin!==location.origin)||e.data?.type!=='motion-current-page')return;if(e.source!==$('#current-device')?.contentWindow)return;const r=e.data.route;if(r&&route!==r&&quick[end].includes(r))go(r)});

routes.help='常见问题';render();
function syncDeviceViewport(){const frame=$('#frame'),native=end==='device'&&!!$('#current-device');frame.classList.toggle('native-viewport',native);if(native){frame.style.setProperty('--device-scale',frame.clientWidth/1080);const f=$('#current-device');f.width='1080';f.height='1920';f.setAttribute('scrolling','no')}if(end==='device')$('#eyebrow').textContent='设备端 · 1080 × 1920 · 9:16 等比预览';}
const beforeResolutionRender=render;render=function(){beforeResolutionRender();syncDeviceViewport()};new ResizeObserver(syncDeviceViewport).observe($('#frame'));render();
