(() => {
  const screen=document.getElementById('immersiveWorkoutScreen');
  const swap=document.getElementById('iwPipSwap');
  const camera=document.getElementById('iwUserPane');
  const image=document.getElementById('iwUserImage');
  const entry=document.getElementById('iwAiReadyOverlay');
  if(!screen || !swap || !camera || !image) return;
  const files=['reached.png','reached.png','both-missed.png','one-missed.png','torso-lean.png','both-missed.png'];
  const frames=files.map(file=>{const picture=new Image();picture.src='assets/immersive-camera/'+file;return picture;});
  const localized=(en,zh)=>window.MotionI18n?.language==='zh'?zh:en;
  let state=0;
  function label(){
    const main=screen.classList.contains('iw-camera-main');
    swap.setAttribute('aria-pressed',String(main));
    swap.setAttribute('aria-label',main?localized('Show coach in main view','将教练画面切换至主画面'):localized('Show your camera in main view','将用户画面切换至主画面'));
    image.alt=state===3?localized('Standing cable row with uneven arms','站姿拉力训练，双臂不同步'):state===4?localized('Standing cable row with an unstable torso','站姿拉力训练，躯干偏斜'):state===5?localized('Body partly outside the camera view','身体未完整进入镜头'):localized('Standing cable row with symmetrical movement','站姿拉力训练，双臂对称发力');
    document.getElementById('iwCameraStatus').textContent=localized('Full body not detected','无法识别完整动作');
  }
  function sync(){swap.disabled=entry.classList.contains('is-visible') || document.getElementById('iwDrawer').classList.contains('open');}
  swap.addEventListener('click',event=>{event.stopPropagation();if(swap.disabled)return;screen.classList.toggle('iw-camera-main');label();});
  screen.addEventListener('planb:demo-result',event=>{
    state=event.detail.stateIndex;
    image.src=frames[state].src;
    camera.classList.toggle('is-unknown',!!event.detail.unknown);
    label();
  });
  new MutationObserver(sync).observe(entry,{attributes:true,attributeFilter:['class']});
  new MutationObserver(sync).observe(document.getElementById('iwDrawer'),{attributes:true,attributeFilter:['class']});
  document.addEventListener('motionlanguagechange',label);
  label();sync();
})();
