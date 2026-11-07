/* V5: compact quick panel, volume as a settings sub-page, spring shortcuts on the real AI training page. */
(()=>{
const T=(z,e)=>prefs.language==='en'?e:z;
if(!Number.isFinite(prefs.musicVolume))prefs.musicVolume=30;
Object.assign(paths,{
  moon:'<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" fill="currentColor" stroke="none"/>',
  bed:'<path d="M3 7v12M21 19v-5a3 3 0 0 0-3-3H3M3 15h18M7 11V9.5A1.5 1.5 0 0 1 8.5 8h1A1.5 1.5 0 0 1 11 9.5V11"/>',
  chevron:'<path d="m9 5 7 7-7 7"/>',
  swap:'<path d="M4 8h14l-3-3M20 16H6l3 3"/>',
  music:'<path d="M9 18V5l11-2v13" /><circle cx="6.5" cy="18" r="2.5" fill="currentColor"/><circle cx="17.5" cy="16" r="2.5" fill="currentColor"/>',
  sunLine:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  speakerOff:'<path d="M3 9h4l5-4v14l-5-4H3z" fill="currentColor" stroke="none"/><path d="m16 9 5 6m0-6-5 6"/>',
  speakerLow:'<path d="M3 9h4l5-4v14l-5-4H3z" fill="currentColor" stroke="none"/><path d="M15.5 10a3 3 0 0 1 0 4"/>',
  speakerHigh:'<path d="M3 9h4l5-4v14l-5-4H3z" fill="currentColor" stroke="none"/><path d="M15.5 9.5a4 4 0 0 1 0 5M18 7a8 8 0 0 1 0 10"/>'
});

/* Shared slider: value is mirrored in --v so the fill follows the thumb. */
function v5Slider(k,label,cls=''){return `<label class="v5-pill ${cls}" style="--v:${prefs[k]}%"><input type="range" min="0" max="100" step="1" value="${prefs[k]}" aria-label="${label}" data-v5-range="${k}" oninput="v5Range('${k}',this.value)">${cls.includes('with-label')?`<span class="v5-pill-label">${label}</span>`:''}<b data-v5-value="${k}">${prefs[k]}%</b></label>`}
window.v5Range=function(k,v){v=Math.max(0,Math.min(100,Math.round(Number(v)||0)));if(k==='musicVolume')setMusicVolume(v);else{prefs[k]=v;savePrefs()}document.querySelectorAll(`[data-v5-range="${k}"]`).forEach(el=>{el.value=v;el.closest('.v5-pill,.v5-track')?.style.setProperty('--v',v+'%')});document.querySelectorAll(`[data-v5-value="${k}"]`).forEach(el=>el.textContent=v+'%');document.querySelectorAll(`[data-v5-mute="${k}"]`).forEach(el=>el.innerHTML=qcIcon(v?'speakerLow':'speakerOff'))};

function bedStatus(){return (pages.bedControl().match(/meeting-bed[\s\S]*?<h2>(.*?)<\/h2>/)||[])[1]||T('已收起','Folded')}
window.v5OpenRoute=function(r){panelOpen=false;$('#global-control')?.remove();go(r)};
window.v5Theme=function(theme){selectPref('theme',theme);panelOpen=true;paintPanel()};
window.v5LightToggle=function(){prefs.light=!prefs.light;savePrefs();paintPanel()};
window.v5LightMode=function(){if(!prefs.light)return;prefs.lightMode=prefs.lightMode==='steady'?'breathing':'steady';savePrefs();paintPanel()};
window.v5Playlist=function(){modal(T('播放列表','Playlist'),musicTracks.map((t,i)=>btn(t+(i===trackIndex?`<span class="muted">${T('播放中','Playing')}</span>`:''),`trackIndex=${i};musicSeconds=0;closeModal();paintPanel()`,'menu')).join('')+btn(T(shuffleMusic?'随机播放：已开启':'随机播放：已关闭',shuffleMusic?'Shuffle: on':'Shuffle: off'),'shuffleMusic=!shuffleMusic;v5Playlist()','secondary'))};

paintPanel=function(){
  if(end!=='device')return;$('#global-control')?.remove();if(!panelOpen){paintRules();return}
  const dark=prefs.theme==='dark',light=prefs.light;
  const tile=(icon,label,sub,fn,on)=>`<button type="button" class="v5-tile${on?' on':''}" onclick="${fn}" aria-pressed="${!!on}">${qcIcon(icon)}<b>${label}</b><small>${sub}</small></button>`;
  const overlay=document.createElement('div');overlay.id='global-control';
  overlay.innerHTML=`<div class="gc-shade" onclick="closePanel()"></div><section class="gc-panel v5-panel" aria-label="${T('快捷设置','Quick settings')}"><button class="gc-grip" onclick="closePanel()" aria-label="${T('收起快捷设置','Close quick settings')}"></button>
<div class="v5-tiles">${tile('wifi','Wi-Fi','MS-使用',"globalDetail('Wi-Fi')",true)}${tile('moon',T('深色模式','Dark mode'),T(dark?'已开启':'已关闭',dark?'On':'Off'),`v5Theme('${dark?'light':'dark'}')`,dark)}${tile('bed',T('床体控制','Bed'),bedStatus(),"v5OpenRoute('bedControl')",false)}${tile('gear',T('设置','Settings'),T('全部设置','All settings'),'panelSettings()',false)}</div>
<div class="v5-levels"><div class="v5-level">${qcIcon('sunLine')}${v5Slider('brightness',T('屏幕亮度','Display brightness'))}</div><div class="v5-level">${qcIcon('speakerHigh')}${v5Slider('volume',T('整机音量','System volume'))}<button type="button" class="v5-more" onclick="v5OpenRoute('musicVolume')" aria-label="${T('音量设置','Volume settings')}">${qcIcon('chevron')}</button></div></div>
<div class="v5-light${light?'':' off'}"><button type="button" class="v5-icon-toggle${light?' on':''}" onclick="v5LightToggle()" aria-pressed="${light}" aria-label="${T('氛围灯开关','Ambient light')}">${qcIcon('bulb')}</button>${v5Slider('lightLevel',T('氛围灯','Ambient light'),'with-label')}<button type="button" class="v5-chip" onclick="v5LightMode()" ${light?'':'disabled'} aria-label="${T('切换氛围灯模式','Switch light mode')}">${qcIcon('swap')}${T(prefs.lightMode==='steady'?'常亮':'呼吸',prefs.lightMode==='steady'?'Steady':'Breathing')}</button></div>
<div class="v5-music"><span class="v5-music-art">${qcIcon('music')}</span><div class="v5-music-meta"><div class="v5-music-title"><b>${musicName()}</b><small><span id="music-current">${clock(musicSeconds)}</span> / 02:30</small></div><div class="qc-music-progress v5-progress"><input aria-label="${T('播放进度','Progress')}" type="range" max="150" value="${musicSeconds}" oninput="musicSeconds=Number(this.value);document.querySelector('#music-current').textContent=clock(musicSeconds)"></div></div><div class="v5-transport"><button type="button" aria-label="${T('上一首','Previous')}" onclick="changeTrack(-1)">${qcIcon('prev')}</button><button type="button" class="v5-play" aria-label="${T(musicPlaying?'暂停':'播放',musicPlaying?'Pause':'Play')}" onclick="musicPlaying=!musicPlaying;paintPanel()">${qcIcon(musicPlaying?'pause':'play')}</button><button type="button" aria-label="${T('下一首','Next')}" onclick="changeTrack(1)">${qcIcon('next')}</button><button type="button" aria-label="${T('播放列表','Playlist')}" onclick="v5Playlist()">${qcIcon('list')}</button></div></div>
</section>`;
  $('#frame').append(overlay);paintRules();
};

/* Volume settings: second-level page under Settings. */
const volumeRows=[['volume','整机音量','System volume','课程、指导语音、提示音与音乐的总音量','Overall output for courses, guidance, alerts and music'],['musicVolume','背景音乐','Background music','只调节音乐，不影响课程与指导语音','Music only. Course video and guidance are unchanged']];
const muted={};
window.v5Mute=function(k){if(prefs[k]){muted[k]=prefs[k];v5Range(k,0)}else v5Range(k,muted[k]||30)};
window.v5Step=function(k,d){v5Range(k,prefs[k]+d)};
routes.musicVolume='音量设置';notes.musicVolume=['音量设置','设置 › 音量设置：整机音量与背景音乐分开调节'];
pages.musicVolume=()=>bar(T('音量设置','Volume'),'settings')+'<div class="pad v5-volume"><div class="group">'+volumeRows.map(([k,z,e,dz,de])=>`<div class="v5-volume-row"><div class="v5-volume-head"><button type="button" class="v5-mute" data-v5-mute="${k}" onclick="v5Mute('${k}')" aria-label="${T('静音','Mute')}">${qcIcon(prefs[k]?'speakerLow':'speakerOff')}</button><div><b>${T(z,e)}</b><small>${T(dz,de)}</small></div><span data-v5-value="${k}">${prefs[k]}%</span></div><div class="v5-track" style="--v:${prefs[k]}%"><button type="button" class="v5-step" onclick="v5Step('${k}',-5)" aria-label="${T('减小','Decrease')}">−</button><input type="range" min="0" max="100" step="1" value="${prefs[k]}" aria-label="${T(z,e)}" data-v5-range="${k}" oninput="v5Range('${k}',this.value)"><button type="button" class="v5-step" onclick="v5Step('${k}',5)" aria-label="${T('增大','Increase')}">+</button></div></div>`).join('')+'</div><p class="v5-volume-note">'+T('整机音量为 0 时所有声音静音。','All sound is muted when system volume is 0.')+'</p></div>';
const settingsPage=pages.settings;
pages.settings=()=>{const html=settingsPage();return end!=='device'?html:html.replace(/(onclick="globalDetail\((?:'|&#39;)音量(?:'|&#39;)\)">)[^<]*<span class="muted">[^<]*<\/span>/,`$1${T('音量设置','Volume')}<span class="muted">${T('整机','System')} ${prefs.volume}% · ${T('音乐','Music')} ${prefs.musicVolume}%　›</span>`)};
const detail=globalDetail;globalDetail=function(name){if(name==='音量')return go('musicVolume');detail(name)};
activeRule=(prior=>function(){if(route==='musicVolume')return '音量设置';return prior()})(activeRule);
quick.device=quick.device.filter(r=>r!=='musicVolume');quick.device.splice(quick.device.indexOf('settings')+1,0,'musicVolume');

/* Spring shortcuts and training data show the real device pages; the review panel only picks which page to show. */
const PAGES={ai:['AI 训练','plan-b-immersive-workout.html'],strength:['自由训练 · 力量','free-training-strength-temp.html'],pilates:['普拉提训练','plan-b-free-training-pilates.html'],records:['训练记录','plan-b-training-records.html']};
let springPage='ai',dataPage='ai';
const syncSources=()=>{sourceDevice.springQuick=PAGES[springPage][1];sourceDevice.trainingData=PAGES[dataPage][1]};
syncSources();
routes.springQuick='弹簧快捷切换';notes.springQuick=['弹簧快捷切换','AI 训练、普拉提训练页内的弹簧配置（自由训练·力量不展示），支持多选'];
sourceDevice.quickSettings='index-plan-b-home.html';
pages.springQuick=pages.trainingData=()=>'';
window.v5SpringPage=k=>{springPage=k;syncSources();render()};
window.v5DataPage=k=>{dataPage=k;syncSources();render()};
window.v5Count=k=>{const r=V5Reps;if(k==='valid')r.n++;else if(k==='dup')notify('重复事件已忽略，次数不变');else if(k==='reset')r.n=0;else if(k==='on')r.supported=true;else if(k==='off')r.supported=false;V5Frame.reps($('#current-device'));if(k==='on'||k==='off')notify(r.supported?'已设为支持计次':'已设为不支持计次，次数显示“—”')};
const tabsFor=(fn,cur,list)=>list.map(k=>btn(PAGES[k][0],`${fn}('${k}')`,'secondary'+(k===cur?' v5-on':''))).join('');
window.v5Recog=open=>V5Frame.recog($('#current-device'),open);
reviewControls=(prior=>function(key){
  if(key==='弹簧快捷切换')return '<div class="review-scenarios"><p class="review-cap">演示页面 · 仅供评审</p>'+tabsFor('v5SpringPage',springPage,['ai','pilates'])+'</div>';
  if(key==='训练数据与次数')return '<div class="review-scenarios"><p class="review-cap">演示页面 · 仅供评审</p>'+tabsFor('v5DataPage',dataPage,['ai','strength','pilates','records'])+'<p class="review-cap">模拟算法回传</p>'+btn('有效动作 +1',"v5Count('valid')",'secondary')+btn('重复事件（不重复计次）',"v5Count('dup')",'secondary')+btn('次数清零',"v5Count('reset')",'secondary')+'<p class="review-cap">计次能力</p>'+btn('支持计次',"v5Count('on')",'secondary')+btn('不支持计次',"v5Count('off')",'secondary')+'</div>';
  const base=prior(key);
  if(key==='AI 训练')return base.replace(/<\/div>$/,'<p class="review-cap">识别指引 · 仅供评审</p>'+btn('打开识别指引',"v5Recog(true)",'secondary')+btn('关闭识别指引',"v5Recog(false)",'secondary')+'</div>');
  return base})(reviewControls);

function readyAI(f,{drawer,mode,play},tries=0){const w=f.contentWindow;if(!w||!w.setIwMode||!w.PlanBImmersiveDemo||!w.clearIwRecognitionFlow){if(tries<100)setTimeout(()=>readyAI(f,{drawer,mode,play},tries+1),200);return}
  const d=w.document;w.clearIwRecognitionFlow();const o=d.getElementById('iwAiReadyOverlay');if(o){o.classList.remove('is-visible');o.setAttribute('aria-hidden','true')}
  const ov=d.querySelector('.iw-overlay');if(ov)ov.inert=false;d.getElementById('iwDrawer')?.classList.toggle('open',!!drawer);if(mode)w.setIwMode(mode);
  const playing=!!w.PlanBImmersiveDemo.snapshot().playing;if(playing!==!!play)w.PlanBImmersiveDemo.togglePlaying()}
function patchSoon(f){let n=0;const t=setInterval(()=>{window.V5Frame.patch(f);if(++n>40)clearInterval(t)},400)}
function onFrameLoad(f){patchSoon(f);if(route==='springQuick'&&springPage==='ai')readyAI(f,{drawer:true,mode:'spring',play:false});if(route==='trainingData'&&dataPage==='ai')readyAI(f,{drawer:false,play:true})}
function mountFrames(){if(end!=='device')return;const f=$('#current-device');if(!f)return;
  if(!f.dataset.v5L){f.dataset.v5L='1';f.addEventListener('load',()=>onFrameLoad(f))}
  const ai=(route==='springQuick'&&springPage==='ai')||(route==='trainingData'&&dataPage==='ai');
  if(ai&&window.MotionAIPage&&!f.srcdoc){f.removeAttribute('src');f.srcdoc=window.MotionAIPage}
  else if(!ai&&['springQuick','trainingData'].includes(route)&&f.contentDocument&&f.contentDocument.readyState==='complete')patchSoon(f)}
window.addEventListener('motion-ai-ready',()=>{if(['springQuick','trainingData'].includes(route))render()});

const v5Render=render;render=function(){
  v5Render();
  if(end!=='device')return;
  document.querySelector('.meeting-data-options')?.remove();
  if(route==='musicVolume'&&$('#backbar'))$('#backbar').innerHTML=btn(T('返回设置','Back to settings'),"go('settings')",'secondary');
  if(['springQuick','quickSettings','trainingData'].includes(route))$('#backbar')?.remove();
  mountFrames();
  const sub=[...$('#routes').children].find(b=>b.getAttribute('onclick')==="go('musicVolume')");
  if(sub){sub.classList.add('v5-subnav');if(route==='musicVolume')[...$('#routes').children].find(b=>b.getAttribute('onclick')==="go('settings')")?.classList.add('v5-parent')}
};
const stampMeta=()=>{const meta=document.querySelector('.rv-meta');if(meta)meta.textContent='会议修订 V5 · 2026-11-06'};
paintRules=(prior=>function(){prior();stampMeta()})(paintRules);
render=(prior=>function(){prior();stampMeta()})(render);
render();
})();
