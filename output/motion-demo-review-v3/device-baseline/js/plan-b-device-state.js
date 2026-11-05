/* Demo device adapter. Real products must enforce interlocks on the device itself. */
(() => {
  'use strict';
  const KEY='motionstation-demo13-device', CHANNEL='motionstation-demo13-device';
  const training=/\/(free-training-strength-temp|plan-b-free-training-pilates|plan-b-plan-training|plan-b-immersive-workout)\.html$/.test(location.pathname);
  const id=crypto.randomUUID?.() || String(Math.random());
  let channel; try { channel=new BroadcastChannel(CHANNEL); } catch (_) {}
  const initial=()=>({revision:0,connected:true,angle:0,motion:null,lock:'locked',unlockUntil:0,relockUntil:0,training:{},previewTraining:false});
  let state=initial();
  try { state={...state,...JSON.parse(localStorage.getItem(KEY)||'null')}; } catch (_) {}
  let joined=false, paused=false;
  const leaseMs=15000;
  function prune(){for(const [key,value] of Object.entries(state.training)){if(!value || Date.now()-(value.seen || 0)>leaseMs)delete state.training[key];}}
  function heartbeat(){if(joined){prune();state.training[id]={seen:Date.now(),paused};save();}}
  const listeners=new Set();
  function emit(){listeners.forEach(fn=>fn(snapshot()));}
  function save(){state.revision=Math.max(Date.now(),state.revision+1);try{localStorage.setItem(KEY,JSON.stringify(state));}catch(_){} channel?.postMessage({type:'state',state});emit();}
  function receive(next){if(next?.revision>state.revision){state=next;emit();}}
  channel?.addEventListener('message',event=>{if(event.data.type==='request')channel.postMessage({type:'state',state});else receive(event.data.state);});
  window.addEventListener('storage',event=>{if(event.key===KEY && event.newValue)try{receive(JSON.parse(event.newValue));}catch(_){}});
  channel?.postMessage({type:'request'});
  function angle(){if(!state.motion)return state.angle;const m=state.motion;return m.from+(m.to-m.from)*Math.min(1,(Date.now()-m.start)/m.duration);}
  // Demo sessions have finite leases; old tabs and old demo versions must not leave permanent locks.
  function active(){prune();return Object.values(state.training).some(session=>!session.paused);}
  function snapshot(){return {...state,angle:angle(),trainingActive:active()};}
  function trainingReason(){const s=snapshot();if(!s.connected)return 'Connect the device before starting a workout.';if(s.motion)return 'Wait until the bed has stopped moving.';if(s.lock!=='locked')return 'Wait for the rail to confirm it is locked.';if(s.angle>0.1 && s.angle<89.9)return 'Fully unfold or fold the bed before continuing your workout.';return '';}
  function reason(action){const s=snapshot();if(!s.connected)return 'Device disconnected. Reconnect to control the bed.';if(!joined || !paused || !/plan-b-immersive-workout\.html$/.test(location.pathname) || document.getElementById('iwAiReadyOverlay')?.classList.contains('is-visible'))return 'Pause your workout to control the Pilates bed.';if(s.trainingActive)return 'Another workout is active. Pause it before controlling the bed.';if(s.motion)return 'The bed is moving. Stop or wait for it to finish.';if(s.lock!=='locked')return 'Wait for the rail to lock before moving the bed.';if(action==='unlock' && s.angle>0.1)return 'Lower the bed fully to unlock the rail.';if(action==='raise' && s.angle>=89.9)return 'The bed is already upright.';if(action==='lower' && s.angle<=0.1)return 'The bed is already lowered.';return '';}
  function command(action){
    if(action==='stop'){if(!state.motion)return false;state.angle=angle();state.motion=null;save();return true;}
    if(reason(action))return false;
    if(action==='unlock'){state.lock='unlocked';state.unlockUntil=Date.now()+5000;state.relockUntil=state.unlockUntil+900;}
    else if(action==='raise'||action==='lower'){const to=action==='raise'?90:0;state.motion={from:state.angle,to,start:Date.now(),duration:Math.max(1200,Math.abs(to-state.angle)/90*6500)};}
    else return false;
    save();return true;
  }
  function preview(kind){
    if(kind==='connection'){if(state.motion)command('stop');state.connected=!state.connected;}
    if(kind==='training'){if(!state.previewTraining && trainingReason())return false;state.previewTraining=!state.previewTraining;}
    save();return true;
  }
  function tick(){let changed=false;const now=Date.now();
    if(state.motion && now>=state.motion.start+state.motion.duration){state.angle=state.motion.to;state.motion=null;changed=true;}
    if(state.lock==='unlocked' && now>=state.unlockUntil){state.lock='relocking';changed=true;}
    if(state.lock==='relocking' && now>=state.relockUntil){state.lock='locked';changed=true;}
    if(changed)save();else emit();
  }
  setInterval(tick,200);
  window.MotionDevice={snapshot,reason,trainingReason,command,preview,setPaused(value){paused=!!value;heartbeat();},subscribe(fn){listeners.add(fn);fn(snapshot());return()=>listeners.delete(fn);}};
  function enterTraining(){
    const problem=trainingReason();
    // The immersive page also hosts bed recovery controls; enter it paused if needed.
    if(problem && !/plan-b-immersive-workout\.html$/.test(location.pathname)){try{sessionStorage.setItem('demo7-entry-blocked',problem);}catch(_){}location.replace('plan-b-immersive-workout.html');return;}
    if(problem)paused=true;
    joined=true;heartbeat();
  }
  if(training){enterTraining();setInterval(heartbeat,3000);}
  window.addEventListener('pagehide',()=>{if(joined){if(state.motion)command('stop');delete state.training[id];save();joined=false;}});
  window.addEventListener('focus',heartbeat);
  window.addEventListener('pageshow',event=>{if(training && event.persisted)enterTraining();});
})();
