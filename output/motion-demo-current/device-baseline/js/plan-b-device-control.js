(() => {
  const device=window.MotionDevice, $=id=>document.getElementById(id);
  if(!device || !$('deviceControlOpen'))return;
  const modal=$('deviceControlModal');let previous=[],pending=null,lastTarget=0,bedAction='raise';
  const focusPanel=()=>modal.querySelector('[role=dialog]').focus({preventScroll:true});
  function open(){previous=[...modal.parentElement.children].filter(n=>n!==modal).map(n=>[n,n.inert]);previous.forEach(([n])=>n.inert=true);modal.hidden=false;focusPanel();}
  function close(){modal.hidden=true;previous.forEach(([n,v])=>n.inert=v);previous=[];cancel();$('deviceControlOpen').focus({preventScroll:true});}
  function cancel(){pending=null;$('dcConfirm').hidden=true;$('dcControls').hidden=false;$('dcClose').hidden=false;}
  function ask(action){if(device.reason(action))return;pending=action;$('dcControls').hidden=true;$('dcConfirm').hidden=false;$('dcClose').hidden=true;
    $('dcConfirmTitle').textContent=action==='unlock'?'Unlock the rail?':action==='raise'?'Raise the bed?':'Lower the bed?';
    $('dcConfirmText').textContent=action==='unlock'?'Keep everyone off the bed. The rail will unlock for 5 seconds so you can adjust its position by hand, then automatically relock. Wait for Locked before use.':'Make sure nobody is on the bed and the movement area is clear. Stay beside the device and keep the bed in view. You can stop movement at any time.';
    $('dcConfirmAction').textContent=action==='unlock'?'Unlock Rail':action==='raise'?'Raise Bed':'Lower Bed';$('dcCancel').focus({preventScroll:true});
  }
  function render(s){
    const position=s.motion?(s.motion.to===90?'Raising…':'Lowering…'):s.angle<.1?'Lowered':s.angle>89.9?'Upright':'Stopped';
    const lock=s.lock==='locked'?'Locked':s.lock==='relocking'?'Relocking…':`Unlocked · ${Math.max(0,Math.ceil((s.unlockUntil-Date.now())/1000))}s`;
    $('dcCardStatus').textContent=!s.connected?'Disconnected':s.trainingActive?'Connected · Workout in progress':`Connected · ${position} · ${lock}`;
    $('dcConnection').textContent='MotionStation 01'+(s.connected?' · Connected':' · Disconnected');
    $('dcBedStatus').textContent=position;$('dcRailStatus').textContent=lock;
    $('dcBedGroup').setAttribute('transform',`rotate(${s.angle} 190 125)`);
    $('dcStop').hidden=!s.motion;$('dcMoveButtons').hidden=!!s.motion;
    if(s.motion)lastTarget=s.motion.to;
    bedAction=s.angle<.1?'raise':s.angle>89.9?'lower':lastTarget===90?'raise':'lower';
    $('dcBedAction').textContent=bedAction==='raise'?'Raise Bed':'Lower Bed';
    $('dcBedAction').disabled=!!device.reason(bedAction);
    $('dcUnlock').disabled=!!device.reason('unlock');
    $('dcUnlock').textContent=s.lock==='unlocked'?'Auto-locking soon':s.lock==='relocking'?'Confirming lock…':'Unlock Rail';
    $('dcRailNote').textContent=s.angle>.1?'Available when the bed is fully lowered.':s.lock==='locked'?'Temporarily release the rail to adjust the bed by hand. Automatically relocks after 5 seconds.':s.lock==='unlocked'?'Adjust the rail now. Keep off the bed until locking is confirmed.':'Waiting for lock confirmation…';
    $('dcWarning').textContent=!s.connected?'Device disconnected. Reconnect before controlling the bed.':s.trainingActive?'Workout in progress. Bed movement and rail unlocking are disabled, including during pauses and rest.':s.motion?'Bed in motion. Keep the area clear and remain beside the device.':s.angle>.1 && s.angle<89.9?`Movement stopped. Select ${bedAction==='raise'?'Raise Bed':'Lower Bed'} to continue.`:'';
    if(pending){const why=device.reason(pending);$('dcConfirmAction').disabled=!!why;$('dcConfirmWarning').textContent=why;}
  }
  $('deviceControlOpen').addEventListener('click',open);$('dcClose').addEventListener('click',close);modal.addEventListener('click',e=>{if(e.target===modal)close();});
  $('dcBedAction').addEventListener('click',()=>ask(bedAction));
  $('dcUnlock').addEventListener('click',()=>ask('unlock'));
  $('dcStop').addEventListener('click',()=>device.command('stop'));
  $('dcCancel').addEventListener('click',()=>{cancel();focusPanel();});
  $('dcConfirmAction').addEventListener('click',()=>{if(!pending)return;const action=pending;if(!device.command(action))return;cancel();render(device.snapshot());if(device.snapshot().motion)$('dcStop').focus({preventScroll:true});else focusPanel();});
  document.addEventListener('keydown',e=>{if(modal.hidden)return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();if(pending){cancel();focusPanel();}else close();}if(e.key==='Tab'){const b=[...modal.querySelectorAll('button')].filter(n=>!n.disabled && n.getClientRects().length);const first=b[0],last=b.at(-1);if(!b.length){e.preventDefault();focusPanel();return;}if(!b.includes(document.activeElement)){e.preventDefault();(e.shiftKey?last:first).focus({preventScroll:true});}else if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus({preventScroll:true});}else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus({preventScroll:true});}}},true);
  device.subscribe(render);
  // Block original home training actions during movement, unlocked rail or invalid bed position.
  document.addEventListener('click',e=>{if(!e.target.closest('#startTrainingModalBtn,#todayPlanActionBtn,#strengthTrainingBtn,#pilatesTrainingBtn,#resistanceCardioBtn'))return;const why=device.trainingReason();if(why){e.preventDefault();e.stopImmediatePropagation();if(modal.hidden)open();$('dcEntryMessage').textContent=why;}},true);
  if(new URLSearchParams(location.search).has('deviceControl')){open();try{$('dcEntryMessage').textContent=sessionStorage.getItem('demo7-entry-blocked')||device.trainingReason();sessionStorage.removeItem('demo7-entry-blocked');}catch(_){}history.replaceState(null,'',location.pathname);}
})();
