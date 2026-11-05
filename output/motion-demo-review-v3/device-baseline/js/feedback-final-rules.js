(()=>{const scene=document.getElementById('immersiveWorkoutScreen');if(!scene)return;const style=document.createElement('style');style.textContent=`
#immersiveWorkoutScreen.fullscreen-training .iw-demo-results-area{left:14px!important;right:14px!important;height:152px!important;bottom:102px!important}
#immersiveWorkoutScreen.fullscreen-training .iw-demo-result-list{right:18%!important;overflow:visible!important}
#immersiveWorkoutScreen.fullscreen-training .iw-demo-result-bubble{left:0!important;right:0!important;bottom:56px!important;min-height:58px!important;max-height:84px!important;padding:14px 16px 14px 46px!important;border-radius:18px!important}
#immersiveWorkoutScreen.fullscreen-training #iwDemo-bubble-title{font-size:17px!important;line-height:1.4!important;font-weight:600!important}
#immersiveWorkoutScreen.fullscreen-training .iw-demo-result-row{padding:9px 12px 9px 38px!important;min-height:40px!important;height:auto!important;max-height:58px!important;border-radius:13px!important;transform:translateY(calc(var(--index)*-62px))!important}
#immersiveWorkoutScreen.fullscreen-training .iw-demo-result-row strong{font-size:12px!important;line-height:1.5!important}
#immersiveWorkoutScreen.fullscreen-training[data-drawer=open] .iw-demo-results-area{bottom:46%!important;height:152px!important}
`;document.head.append(style)})();
