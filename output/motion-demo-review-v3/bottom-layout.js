/* Keep both the visual handle and its hit box outside all tab buttons. */
(()=>{const previous=render;render=function(){previous();const native=!!$('#current-device');const tabs=end==='device'&&(native?['home','profile','library','records'].includes(route):$('#bottomnav')&&getComputedStyle($('#bottomnav')).display!=='none');$('#frame').dataset.dockedTabs=String(!!tabs)};render()})();
