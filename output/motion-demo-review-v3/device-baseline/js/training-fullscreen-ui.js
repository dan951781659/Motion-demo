/* One visual focus; switching views does not recreate players or reset training. */
(()=>{const scene=document.getElementById('immersiveWorkoutScreen');if(!scene)return;scene.classList.add('fullscreen-training');const drawer=document.getElementById('iwDrawer'),swap=document.getElementById('iwPipSwap');drawer.classList.remove('open');
function labels(){const en=window.MotionI18n?.language==='en',user=scene.dataset.focus==='user';swap.textContent=en?(user?'Your view · Show coach':'Coach view · Show yourself'):(user?'我的画面 · 切换课程':'课程画面 · 切换自己');swap.setAttribute('aria-label',swap.textContent);swap.disabled=false;const image=document.getElementById('iwUserImage');if(image)scene.style.setProperty('--live-art','url("'+image.getAttribute('src')+'")')}
new MutationObserver(labels).observe(scene,{attributes:true,attributeFilter:['data-focus']});new MutationObserver(labels).observe(document.getElementById('iwUserImage'),{attributes:true,attributeFilter:['src']});document.addEventListener('motionlanguagechange',labels);labels();
const style=document.createElement('style');style.textContent=`
#immersiveWorkoutScreen.fullscreen-training{background:#06101b;isolation:isolate}
#immersiveWorkoutScreen.fullscreen-training .iw-media-pane{position:absolute!important;inset:0!important;left:0!important;top:0!important;right:0!important;bottom:0!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;min-width:0!important;border:0!important;border-radius:0!important;aspect-ratio:auto!important;box-shadow:none!important;transform:none!important;overflow:hidden!important;z-index:0!important;background:#081320!important}
#immersiveWorkoutScreen.fullscreen-training[data-focus=coach] .iw-user-pane,#immersiveWorkoutScreen.fullscreen-training[data-focus=user] .iw-coach-pane{display:none!important}
#immersiveWorkoutScreen.fullscreen-training[data-focus=coach] .iw-coach-pane,#immersiveWorkoutScreen.fullscreen-training[data-focus=user] .iw-user-pane{display:block!important}
#immersiveWorkoutScreen.fullscreen-training .iw-media-pane::before{content:'';position:absolute;inset:-24px;z-index:0;background-position:center;background-size:cover;filter:blur(24px) brightness(.45);pointer-events:none}
#immersiveWorkoutScreen.fullscreen-training .iw-coach-pane::before{background-image:url('assets/strength-training-frame.png')}
#immersiveWorkoutScreen.fullscreen-training .iw-user-pane::before{background-image:var(--live-art,url('assets/immersive-camera/reached.png'))}
#immersiveWorkoutScreen.fullscreen-training .iw-video,#immersiveWorkoutScreen.fullscreen-training #iwUserImage{position:relative!important;z-index:1!important;display:block!important;width:100%!important;height:100%!important;max-width:none!important;object-fit:contain!important;object-position:center!important;background:transparent!important;transform:none!important}
#immersiveWorkoutScreen.fullscreen-training::after{content:'';position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(180deg,#06101bf2 0%,#06101b75 12%,transparent 28%,transparent 68%,#06101ba6 87%,#06101be8 100%)}
#immersiveWorkoutScreen.fullscreen-training .iw-overlay{z-index:2!important}
#immersiveWorkoutScreen.fullscreen-training .iw-demo-top{z-index:3!important}
#immersiveWorkoutScreen.fullscreen-training #iwPipSwap{top:108px!important;left:14px!important;right:auto!important;width:168px!important;min-width:168px!important;max-width:210px!important;height:28px!important;min-height:28px!important;aspect-ratio:auto!important;white-space:nowrap!important;display:block!important;box-sizing:border-box!important;padding:0 12px!important;border-radius:20px!important;background:#153247a6!important;border:1px solid #acd9f526!important;box-shadow:none!important;font-size:11px!important;line-height:28px!important;z-index:8!important}
#immersiveWorkoutScreen.fullscreen-training .iw-demo-feedback{top:132px!important;right:16px!important;left:auto!important;width:102px!important;height:auto!important;padding:0!important;background:none!important;border:none!important;border-radius:0!important;box-shadow:none!important;pointer-events:none!important;z-index:4!important}
#immersiveWorkoutScreen.fullscreen-training .soft-score-label{font-size:10px!important;color:#d2e2efaa!important;line-height:14px!important;text-align:right!important}
#immersiveWorkoutScreen.fullscreen-training .iw-demo-score{align-items:flex-end!important;gap:5px!important}
#immersiveWorkoutScreen.fullscreen-training .iw-demo-number{text-align:right!important}
#immersiveWorkoutScreen.fullscreen-training .iw-demo-number b{font-size:42px!important;font-weight:600!important;color:#f1f7fc!important;text-shadow:0 2px 12px #0006}
#immersiveWorkoutScreen.fullscreen-training .iw-demo-gauge{width:100%!important;height:6px!important;min-height:6px!important;max-height:6px!important;opacity:.85}
#immersiveWorkoutScreen.fullscreen-training .iw-demo-gauge i{border-radius:6px!important}
#immersiveWorkoutScreen.fullscreen-training .iw-demo-results-area{top:auto!important;bottom:106px!important;height:82px!important;left:14px!important;right:14px!important;z-index:5!important}
#immersiveWorkoutScreen.fullscreen-training[data-drawer=open] .iw-demo-results-area{top:auto!important;bottom:46%!important;height:64px!important}
#immersiveWorkoutScreen.fullscreen-training .iw-demo-result-row,#immersiveWorkoutScreen.fullscreen-training .iw-demo-result-bubble{background:#13283bd6!important;border:1px solid #a5c5e52b!important;border-radius:14px!important;backdrop-filter:blur(16px);box-shadow:0 4px 18px #0002!important}
#immersiveWorkoutScreen.fullscreen-training .iw-drawer{background:linear-gradient(145deg,#10283de8,#0b2038ee)!important;backdrop-filter:blur(24px);border:1px solid #a4cced20!important;z-index:10!important}
#immersiveWorkoutScreen.fullscreen-training .motion-path{z-index:2;inset:0!important}
#immersiveWorkoutScreen.fullscreen-training .motion-path span{bottom:110px!important;left:14px!important;font-size:8px!important;color:#c6d9e59e!important;background:#08172473!important;padding:3px 6px!important;border-radius:5px!important}
#immersiveWorkoutScreen.fullscreen-training .iw-demo-trigger{bottom:100px!important}
`;document.head.append(style);
})();
