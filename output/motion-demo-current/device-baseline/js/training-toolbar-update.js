/* Keep existing training handlers; move their actual buttons into the drawer. */
(()=>{if(!document.getElementById('iwDrawer'))return;
const icons={media:'<path d="M4 6h16M4 12h16M4 18h16M8 3v6m8 0v6M10 15v6"/>',flip:'<path d="m7 3 10 4 4 10-10 4-8-10zM8 6l10 12M2 5l3-3m14 20 3-3"/>',stop:'<rect x="6" y="6" width="12" height="12" rx="1" fill="currentColor" stroke="none"/>',pause:'<path d="M8 5v14M16 5v14" stroke-width="4"/>',play:'<path d="m7 4 13 8-13 8z" fill="currentColor" stroke="none"/>'};
function data(name){return 'url("data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+icons[name]+'</svg>')+'")'}
const drawer=document.getElementById('iwDrawer'),toolbar=document.createElement('div');toolbar.className='iw-drawer-toolbar';toolbar.setAttribute('aria-label','Training controls');
const media=document.createElement('button');media.id='iwMediaControl';media.type='button';media.className='iw-toolbar-icon';media.setAttribute('aria-label','多媒体控制');media.title='多媒体控制';media.onclick=()=>parent.postMessage({type:'motion-media-control'},location.protocol==='file:'?'*':location.origin);toolbar.append(media);
for(const id of ['iwFlipBtn','iwEndBtn','iwPlayBtn']){const b=document.getElementById(id);if(b){b.classList.add('iw-toolbar-icon');toolbar.append(b)}}drawer.insertBefore(toolbar,drawer.querySelector('.iw-content'));
const style=document.createElement('style');style.textContent=`
#iwDrawer .iw-summary,#iwDrawer #iwBedControls{display:none!important}
#immersiveWorkoutScreen .action-dock--immersive{display:none!important}
#iwDrawer{box-sizing:border-box;max-width:calc(100% - 20px);max-height:68%;overflow:hidden;background:linear-gradient(145deg,#10283dea,#0b2038ef);border-radius:16px}
#iwDrawer .iw-handle{padding:8px 10px 4px;flex-shrink:0;min-height:16px}
.iw-drawer-toolbar{display:flex;justify-content:flex-end;align-items:center;gap:6px;padding:8px 12px 12px;flex-shrink:0}
#iwDrawer .iw-toolbar-icon{position:relative;display:grid;place-items:center;width:26px;height:26px;min-width:26px;min-height:26px;padding:0;margin:0;border-radius:7px;border:1px solid #7294b666;background:#152f4880;color:#d6e7f8;box-shadow:none;font-size:0!important;line-height:0;cursor:pointer}
#iwDrawer .iw-toolbar-icon::before{content:'';display:block;width:17px;height:17px;background-color:currentColor;mask-repeat:no-repeat;mask-position:center;mask-size:contain;-webkit-mask-repeat:no-repeat;-webkit-mask-position:center;-webkit-mask-size:contain}
#iwMediaControl::before{mask-image:${data('media')};-webkit-mask-image:${data('media')}}
#iwFlipBtn::before{mask-image:${data('flip')};-webkit-mask-image:${data('flip')}}
#iwEndBtn.iw-toolbar-icon{background:#a94a6680;border-color:#b86d8099;color:#ffafc4}
#iwEndBtn::before{mask-image:${data('stop')};-webkit-mask-image:${data('stop')}}
#iwPlayBtn.iw-toolbar-icon{background:#ee970b;border-color:#ffbe50;color:#fff4d8}
#iwPlayBtn::before{mask-image:${data('pause')};-webkit-mask-image:${data('pause')}}
#iwPlayBtn[data-paused=true]::before{mask-image:${data('play')};-webkit-mask-image:${data('play')}}
#iwDrawer .iw-content{box-sizing:border-box;min-width:0;min-height:0;width:100%;overflow-x:hidden;overflow-y:auto;scrollbar-width:thin}
#iwDrawer .iw-mode-group{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;width:100%!important;max-width:100%!important;box-sizing:border-box;gap:4px;overflow:hidden}
#iwDrawer .iw-mode-btn{flex:1 1 0;min-width:0!important;width:auto!important;padding:6px 3px;font-size:12px;overflow-wrap:anywhere}
#iwDrawer .iw-weight-row,#iwDrawer .iw-param-panel,#iwDrawer .iw-chart-card{max-width:100%;box-sizing:border-box;min-width:0}
`;document.head.append(style);
const play=document.getElementById('iwPlayBtn');function sync(){const zh=window.MotionI18n?.language!=='en';for(const [id,z,e]of [['iwMediaControl','多媒体控制','Media controls'],['iwFlipBtn','翻转页面','Flip view'],['iwEndBtn','结束训练','End training']]){const b=document.getElementById(id);b.title=zh?z:e;b.setAttribute('aria-label',b.title)}const paused=/Play|Resume|继续/.test(play.textContent);play.dataset.paused=String(paused);play.title=zh?(paused?'继续训练':'暂停训练'):(paused?'Resume training':'Pause training');play.setAttribute('aria-label',play.title)}
new MutationObserver(sync).observe(play,{childList:true,characterData:true,subtree:true});document.addEventListener('motionlanguagechange',sync);sync();})();
