(() => {
  const device=window.MotionDevice, $=id=>document.getElementById(id);
  if(!device)return;
  const translate=text=>window.MotionI18n?.t(text)||text;
  if(!$('iwBedControls')){
    const message=$('dcEntryMessage');
    if(!message)return;
    function show(reason){message.hidden=!reason;message.textContent=reason;message.scrollIntoView({block:'nearest'});}
    document.addEventListener('click',event=>{
      if(!event.target.closest('#startTrainingModalBtn,#todayPlanActionBtn,#strengthTrainingBtn,#pilatesTrainingBtn,#resistanceCardioBtn'))return;
      const reason=device.trainingReason();
      if(reason){event.preventDefault();event.stopImmediatePropagation();location.href='plan-b-immersive-workout.html';}
    },true);
    if(new URLSearchParams(location.search).has('deviceControl')){
      show(device.trainingReason());history.replaceState(null,'',location.pathname);
    }
    return;
  }
  const modal=$('bedConfirmModal'), screen=$('immersiveWorkoutScreen');
  let pending=null, lastTarget=0, bedAction='raise', previous=[], returnFocus=null;
  function close(){modal.hidden=true;pending=null;previous.forEach(([node,inert])=>node.inert=inert);previous=[];returnFocus?.focus({preventScroll:true});}
  function ask(action){
    if(device.reason(action))return;
    pending=action;returnFocus=document.activeElement;
    $('dcConfirmTitle').textContent=action==='unlock'?'Unlock the rail?':action==='raise'?'Raise the bed?':'Lower the bed?';
    $('dcConfirmText').textContent=action==='unlock'?'Keep everyone off the bed. The rail will unlock for 5 seconds so you can adjust its position by hand, then automatically relock. Wait for Locked before use.':'Make sure nobody is on the bed and the movement area is clear. Stay beside the device and keep the bed in view. You can stop movement at any time.';
    $('dcConfirmAction').textContent=action==='unlock'?'Unlock Rail':action==='raise'?'Raise Bed':'Lower Bed';
    previous=[...modal.parentElement.children].filter(node=>node!==modal).map(node=>[node,node.inert]);previous.forEach(([node])=>node.inert=true);
    modal.hidden=false;render(device.snapshot());$('dcCancel').focus({preventScroll:true});
  }
  function render(s){
    const paused=screen.classList.contains('iw-demo-paused');
    const position=s.motion?(s.motion.to===90?'Raising…':'Lowering…'):s.angle<.1?'Lowered':s.angle>89.9?'Upright':'Stopped';
    const lock=s.lock==='locked'?'Locked':s.lock==='relocking'?'Relocking…':`Unlocked · ${Math.max(0,Math.ceil((s.unlockUntil-Date.now())/1000))}s`;
    $('dcBedStatus').textContent=position;$('dcRailStatus').textContent=lock;
    $('dcBedGroup').setAttribute('transform',`rotate(${s.angle} 190 125)`);
    $('dcStop').hidden=!s.motion;$('dcMoveButtons').hidden=!!s.motion;
    if(s.motion)lastTarget=s.motion.to;
    bedAction=s.angle<.1?'raise':s.angle>89.9?'lower':lastTarget===90?'raise':'lower';
    $('dcBedAction').textContent=bedAction==='raise'?'Raise Bed':'Lower Bed';
    $('dcBedAction').disabled=!!device.reason(bedAction);$('dcUnlock').disabled=!!device.reason('unlock');
    $('dcUnlock').textContent=s.lock==='unlocked'?'Auto-locking soon':s.lock==='relocking'?'Confirming lock…':'Unlock Rail';
    $('dcRailNote').textContent=s.angle>.1?'Available when the bed is fully lowered.':s.lock==='locked'?'Temporarily release the rail to adjust the bed by hand. Automatically relocks after 5 seconds.':s.lock==='unlocked'?'Adjust the rail now. Keep off the bed until locking is confirmed.':'Waiting for lock confirmation…';
    $('dcPauseHint').textContent=paused?'Workout paused. Keep everyone off the bed before adjusting it.':'Pause your workout to adjust the bed or unlock the rail.';
    $('dcWarning').textContent=!s.connected?'Device disconnected. Reconnect before controlling the bed.':!paused?'':s.trainingActive?'Another workout is active. Pause it before controlling the bed.':s.motion?'Bed in motion. Keep the area clear and remain beside the device.':s.angle>.1 && s.angle<89.9?'Fully unfold or fold the bed before continuing your workout.':s.lock!=='locked'?'Wait for the rail to lock before resuming your workout.':'';
    if(pending){const reason=device.reason(pending);$('dcConfirmAction').disabled=!!reason;$('dcConfirmWarning').textContent=reason;}
  }
  $('dcBedAction').addEventListener('click',()=>ask(bedAction));
  $('dcUnlock').addEventListener('click',()=>ask('unlock'));
  $('dcStop').addEventListener('click',()=>device.command('stop'));
  $('dcCancel').addEventListener('click',close);
  $('dcConfirmAction').addEventListener('click',()=>{if(pending && device.command(pending)){close();render(device.snapshot());if(device.snapshot().motion)$('dcStop').focus({preventScroll:true});}});
  modal.addEventListener('click',event=>{if(event.target===modal)close();});
  document.addEventListener('keydown',event=>{
    if(modal.hidden)return;
    if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();close();}
    if(event.key==='Tab'){
      const buttons=[...modal.querySelectorAll('button')].filter(button=>!button.disabled);
      const first=buttons[0],last=buttons.at(-1);
      if(event.shiftKey && document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();}
    }
  },true);
  // Stop the existing play handler before it resumes with an unsafe bed state.
  $('iwPlayBtn').addEventListener('click',event=>{
    if(!screen.classList.contains('iw-demo-paused'))return;
    const reason=device.trainingReason();
    if(reason){event.preventDefault();event.stopImmediatePropagation();$('iwDrawer').classList.add('open');$('dcWarning').textContent=translate(reason);$('dcWarning').scrollIntoView({block:'nearest'});}
  },true);
  new MutationObserver(()=>render(device.snapshot())).observe(screen,{attributes:true,attributeFilter:['class']});
  document.addEventListener('motionlanguagechange',()=>render(device.snapshot()));
  device.subscribe(render);
})();
