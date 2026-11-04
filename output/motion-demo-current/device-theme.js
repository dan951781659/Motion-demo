/* Device entry point: shared components, semantic theme palette, independent of APP. */
(()=>{
 function apply(p){document.documentElement.dataset.motionDevice='true';document.documentElement.dataset.motionTheme=p?.theme==='light'?'light':'dark';document.documentElement.style.colorScheme=p?.theme==='light'?'light':'dark'}
 try{apply(JSON.parse(localStorage.getItem('motion-global-prefs')||'{}'))}catch(_){apply({})}
 window.addEventListener('message',e=>{if(e.data?.type==='motion-settings'&&(e.source===parent||parent===window))apply(e.data.prefs)});
 window.addEventListener('storage',e=>{if(e.key==='motion-global-prefs')try{apply(JSON.parse(e.newValue||'{}'))}catch(_){}});
 for(const href of ['../device-ui.css','../device-theme-system.css']){const l=document.createElement('link');l.rel='stylesheet';l.href=href;document.head.append(l)}
 const s=document.createElement('script');s.src='../device-theme-runtime.js';document.head.append(s);
})();
