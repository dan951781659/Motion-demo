/* Simulated (drawn) illustration of the Pilates bed — no photos.
   Side view: machine on the left, the bed hinged at the machine foot.
   folded  = bed stands upright against the machine
   lowered = bed laid flat next to the machine (the "red box" position, user must pull it out)
   extended= bed pulled out and locked
   BedArt.svg(stage) → markup;  BedArt.css → shared stylesheet (inject once). */
(()=>{
const css=`
.bart{width:100%;height:100%;display:block}
.bart .bed{transform-origin:84px 150px;transform-box:view-box}
.bart .bed-pose-folded{transform:rotate(-90deg)}
.bart .bed-pose-lowered{transform:rotate(0)}
.bart .bed-pose-extended{transform:translateX(96px)}
.bart .bed-pose-stopped{transform:rotate(-48deg)}
.bart .bed-lowering{animation:bart-low 3.5s ease-in-out forwards}
.bart .bed-retracting{animation:bart-up 3.5s ease-in-out forwards}
.bart .bed-locking{animation:bart-out 1s ease-out both}
@keyframes bart-low{from{transform:rotate(-90deg)}to{transform:rotate(0)}}
@keyframes bart-up{0%{transform:translateX(96px)}25%{transform:translateX(0) rotate(0)}100%{transform:translateX(0) rotate(-90deg)}}
@keyframes bart-out{from{transform:translateX(0)}to{transform:translateX(96px)}}
.bart .ghost{fill:none;stroke-width:2;stroke-dasharray:6 4}
.bart .ghost.go{stroke:#1264c6;animation:bart-blink 1.1s ease-in-out infinite alternate}
.bart .ghost.ok{stroke:#2bb673;stroke-dasharray:none}
.bart .ghost.bad{stroke:#d92d3a}
@keyframes bart-blink{from{opacity:.35}to{opacity:1}}
.bart .arrow{animation:bart-nudge 1s ease-in-out infinite alternate}
@keyframes bart-nudge{from{transform:translateX(-5px)}to{transform:translateX(5px)}}
.bart .arrow.back{animation-name:bart-nudge-back}
@keyframes bart-nudge-back{from{transform:translateX(5px)}to{transform:translateX(-5px)}}
`;
const POSE={folded:'folded',lowering:'lowering',stopped:'stopped',pull:'lowered',timeout:'lowered',locked:'locking',push:'extended',pushTimeout:'extended',retracting:'retracting'};
function svg(stage){
  const bad=stage==='timeout'||stage==='pushTimeout';
  const pose=POSE[stage]||'folded';
  const cls=pose==='lowering'?'bed bed-lowering':pose==='retracting'?'bed bed-retracting':pose==='locking'?'bed bed-locking':'bed bed-pose-'+pose;
  const edge=bad?'#d92d3a':stage==='locked'?'#2bb673':'#8b97a8';
  const lock=bad?'#d92d3a':(stage==='locked'||stage==='folded')?'#2bb673':'#f5a524';
  /* ghost target & arrow */
  let hint='';
  if(stage==='pull'||stage==='timeout')hint='<rect class="ghost '+(bad?'bad':'go')+'" x="180" y="129" width="124" height="25" rx="7"/><g class="arrow'+(bad?'':'')+'" '+(bad?'style="animation:none"':'')+'><path d="M150 112h34m-9-8 9 8-9 8" fill="none" stroke="'+(bad?'#d92d3a':'#1264c6')+'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g><text x="242" y="123" font-size="9" fill="'+(bad?'#d92d3a':'#1264c6')+'" text-anchor="middle">拉出到位位置</text>';
  if(stage==='push'||stage==='pushTimeout')hint='<rect class="ghost '+(bad?'bad':'go')+'" x="82" y="129" width="124" height="25" rx="7"/><g class="arrow back" '+(bad?'style="animation:none"':'')+'><path d="M238 112h-34m9-8-9 8 9 8" fill="none" stroke="'+(bad?'#d92d3a':'#1264c6')+'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g><text x="144" y="123" font-size="9" fill="'+(bad?'#d92d3a':'#1264c6')+'" text-anchor="middle">推回到位位置</text>';
  if(stage==='locked')hint='<rect class="ghost ok" x="180" y="129" width="124" height="25" rx="7"/>';
  const lockIcon='<g transform="translate(106 112)"><rect x="-8" y="0" width="16" height="12" rx="3" fill="'+lock+'"/><path d="M-5 0v-4a5 5 0 0 1 10 0v4" fill="none" stroke="'+lock+'" stroke-width="2.4"/></g>';
  const showLock=(stage==='locked'||bad||stage==='folded');
  return '<svg class="bart" viewBox="0 0 320 190" preserveAspectRatio="xMidYMid meet" role="img" aria-label="普拉提床示意图">'
   +'<rect x="0" y="0" width="320" height="190" fill="none"/>'
   /* floor */
   +'<line x1="0" y1="166" x2="320" y2="166" stroke="#9aa6b6" stroke-width="2"/><rect x="0" y="166" width="320" height="24" fill="#9aa6b6" opacity=".12"/>'
   /* machine */
   +'<rect x="12" y="28" width="72" height="138" rx="10" fill="#2a3b52"/><rect x="20" y="38" width="56" height="60" rx="6" fill="#16263a"/><rect x="26" y="46" width="44" height="6" rx="3" fill="#3b82c4"/><rect x="26" y="58" width="30" height="5" rx="2.5" fill="#566b86"/><rect x="26" y="68" width="38" height="5" rx="2.5" fill="#566b86"/>'
   +'<text x="48" y="120" font-size="10" fill="#c4d2e4" text-anchor="middle" font-weight="700">Motion</text><rect x="24" y="130" width="48" height="4" rx="2" fill="#566b86"/>'
   /* rail */
   +'<rect x="84" y="152" width="224" height="6" rx="3" fill="#b9c3d0"/>'
   +hint
   /* bed */
   +'<g class="'+cls+'"><rect x="84" y="136" width="120" height="16" rx="5" fill="#c9d1db" stroke="'+edge+'" stroke-width="'+(bad||stage==='locked'?2.5:1.5)+'"/><rect x="88" y="132" width="112" height="9" rx="4.5" fill="#f3efe6" stroke="#d8d0bf"/><circle cx="84" cy="150" r="4" fill="#697689"/></g>'
   +(showLock?lockIcon:'')
   +'</svg>';
}
window.BedArt={svg,css};
})();
