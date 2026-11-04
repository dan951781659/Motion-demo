/* Display-only localization: data keys, user input and stored workout data remain stable. */
(() => {
  'use strict';
  const KEY = 'motionstation-demo9-language';
  const dictionaries = window.MotionTranslations || { en: {}, zh: {} };
  const normalize = value => String(value).replace(/\s+/g, ' ').trim();
  let language = 'en';
  try { language = localStorage.getItem(KEY) === 'zh' ? 'zh' : 'en'; } catch (_) {}
  const originals = new WeakMap();
  const lower = {};
  for (const lang of ['en', 'zh']) lower[lang] = Object.fromEntries(Object.entries(dictionaries[lang]).map(([k,v]) => [k.toLowerCase(),v]));
  const skip = 'script,style,textarea,[contenteditable="true"],[translate="no"],.wifi-name,[data-user-name],[data-user-avatar],input';
  const attrs = ['placeholder','aria-label','title','alt'];
  function translate(value, target = language) {
    const text = normalize(value);
    const dictionary = dictionaries[target];
    if (!text) return value;
    let result = dictionary[text] || lower[target][text.toLowerCase()];
    if (result) return String(value).replace(text, result) === value ? result : String(value).replace(text,result);
    // Resolve independently rendered segments before variable-length patterns.
    if (/[·•|\n]/.test(value)) return String(value).split(/([·•|\n])/).map(s => {
      if (/^[·•|\n]$/.test(s) || !s.trim()) return s;
      return s.match(/^\s*/)[0] + translate(s.trim(),target) + s.match(/\s*$/)[0];
    }).join('');
    if (target === 'zh') {
      const patterns = [
        [/^(\d+) items?$/i, '$1 项'],
        [/^(\d+) sessions?$/i, '$1 次训练'],
        [/^(\d+) settings?$/i, '$1 次设置'],
        [/^(\d+)s rest$/i, '休息 $1s'],
        [/^(\d+\s*\/\s*\d+) reps$/i, '$1 次'],
        [/^Week (\d+),? Day (\d+)$/i, '第 $1 周，第 $2 天'],
        [/^Week (\d+)$/i, '第 $1 周'],
        [/^W(\d+)$/, '第 $1 周'],
        [/^Day (\d+) of (\d+)$/i, '第 $1 天，共 $2 天'],
        [/^Day(\d+)$/i, '第 $1 天'],
        [/^Move (\d+)$/i, '动作 $1'],
        [/^Step:\s*(.+)$/i, '步进：$1'],
        [/^Combo\s*[*×]\s*(\d+)$/i, '连击 × $1'],
        [/^(Better|Good|Perfect) (\d+)%$/i, (_,s,n)=>translate(s,target)+' '+n+'%'],
        [/^(Peak|Avg) (.+)$/i, (_,s,n)=>translate(s,target)+' '+n],
        [/^Great Job, (.+)$/i, '做得很棒，$1'],
        [/^Session ([a-z0-9-]+)$/i, '会话 $1'],
        [/^Up next: (.+)$/i, (_,s)=>'下一个：'+translate(s,target)],
        [/^Rescheduled to (.+)$/i, '已改期至 $1'],
        [/^([+-]?\d+)% vs last day$/i, '较昨日 $1%'],
        [/^(.+): (\d+)% occurrences$/i,(_,s,n)=>translate(s,target)+'：出现比例 '+n+'%'],
        [/^Across (\d+) sets of (.+), (\d+)% reps showed form errors\.$/i,(_,n,s,p)=>translate(s,target)+'共完成 '+n+' 组，其中 '+p+'% 的动作出现姿势错误。'],
        [/^AI reviewed (\d+) moves\. Average form score (.+)\.$/i,'AI 已评估 $1 个动作，平均动作评分 $2。'],
        [/^Movement stopped\. Select (Raise Bed|Lower Bed) to continue\.$/i,(_,s)=>'床体已停止。选择“'+translate(s,target)+'”继续。'],
        [/^(Training type|Scene): (.+)$/i,(_,a,b)=>translate(a,target)+'：'+translate(b,target)],
        [/^(.+) cover image$/i,(_,s)=>translate(s,target)+'封面'],
        [/^(.+) detail$/i,(_,s)=>translate(s,target)+'详情'],
        [/^Open plan detail for (.+)$/i,(_,s)=>'查看'+translate(s,target)+'计划详情'],
        [/^Illustration for (.+)$/i,(_,s)=>translate(s,target)+'动作示意图'],
        [/^Equipment setup illustration for (.+)$/i,(_,s)=>translate(s,target)+'器械安装示意图'],
        [/^Resend (?:code )?in (\d+)s$/i, '重新发送（$1s）'],
        [/^Resend(?: code)? \((\d+)s\)$/i, '重新发送（$1s）'],
        [/^(\d+) (reps?|sets?|days?|weeks?|moves?|exercises?|workouts?|plans?)$/i, (_,n,u) => n+' '+({rep:'次',set:'组',day:'天',week:'周',move:'个动作',exercise:'个动作',workout:'次训练',plan:'个计划'}[u.toLowerCase().replace(/s$/,'')])],
        [/^Set (\d+)(.*)$/i, '第 $1 组$2'],
        [/^Day (\d+)(.*)$/i, '第 $1 天$2'],
        [/^Level (\d+)(.*)$/i, '档位 $1$2'],
        [/^Step (\d+)(.*)$/i, '步进 $1$2'],
        [/^Rest (\d+)(.*)$/i, '休息 $1$2'],
        [/^Connect to (.+)$/i, '连接到 $1'],
        [/^Auto-lock in (\d+)s$/i, '$1s 后自动锁定'],
        [/^Next: (.+)$/i, (_,s) => '下一个：'+translate(s,target)],
        [/^(\d+) of (\d+)$/i, '$1 / $2']
      ];
      for (const [regex,replacement] of patterns) if(regex.test(text)) return text.replace(regex,replacement);
    } else {
      const patterns = [[/^第\s*(\d+)\s*组(.*)$/, 'Set $1$2'],[/^档位\s*(\d+)(.*)$/,'Level $1$2'],[/^步进[：:]?\s*(.+)$/,'Step: $1'],[/^休息\s*(\d+)(.*)$/,'Rest $1$2'],[/^(\d+)\s*次$/, '$1 reps'],[/^(\d+)\s*组$/, '$1 sets'],[/^连击\s*×\s*(\d+)$/,'Combo × $1'],[/^平均\s*(.+)$/,'Avg $1'],[/^左\s*(.+)$/,'L $1'],[/^右\s*(.+)$/,'R $1'],[/^提交\s*(.+)$/,'Submit $1']];
      for(const [regex,replacement] of patterns) if(regex.test(text)) return text.replace(regex,replacement);
    }
    return value;
  }
  function field(node, key, value, write) {
    let record=originals.get(node);
    if(!record) { record={}; originals.set(node,record); }
    if(!record[key] || record[key].rendered !== value) record[key]={source:value,rendered:value};
    const source=record[key].source;
    let next=translate(source);
    if(language==='zh' && normalize(source)==='Back' && node.parentElement) {
      if(node.parentElement.closest('figcaption')) next='背面';
      else if(node.parentElement.closest('.all-training-filter-chip,.cat-target,.tr-muscle-legend,[data-i18n-context="muscle"]')) next='背部';
    }
    record[key].rendered=next;
    if(next !== value) write(next);
  }
  function visit(node) {
    if(node.nodeType===3) {
      if(node.parentElement && !node.parentElement.closest(skip)) field(node,'text',node.nodeValue,v=>node.nodeValue=v);
      return;
    }
    if(node.nodeType!==1 && node.nodeType!==9) return;
    if(node.nodeType===1) {
      if(node.matches('script,style,textarea,[translate="no"],[contenteditable="true"]')) return;
      for(const attr of attrs) if(node.hasAttribute(attr)) field(node,attr,node.getAttribute(attr),v=>node.setAttribute(attr,v));
    }
    for(const child of Array.from(node.childNodes)) visit(child);
  }
  let observer;
  function refresh() {
    document.documentElement.lang=language==='zh'?'zh-CN':'en';
    if(observer) observer.disconnect();
    visit(document);
    if(observer) observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attrs});
  }
  function setLanguage(next,persist=true) {
    language=next==='zh'?'zh':'en';
    if(persist) try { localStorage.setItem(KEY,language); } catch(_) {}
    refresh();
    document.dispatchEvent(new CustomEvent('motionlanguagechange',{detail:{language}}));
  }
  window.MotionI18n={t:translate,translate,setLanguage,refresh,get language(){return language;}};
  document.documentElement.lang=language==='zh'?'zh-CN':'en';
  window.addEventListener('storage',e=>{if(e.key===KEY)setLanguage(e.newValue,false);});
  function start(){
    observer=new MutationObserver(records=>{
      observer.disconnect();
      for(const r of records) {
        if(r.type==='childList') r.addedNodes.forEach(visit);
        else visit(r.target);
      }
      observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attrs});
    });
    refresh();
  }
  // This script runs in <head>. Observe parser insertions immediately so each
  // text batch is localized in a microtask before the browser paints it.
  // Waiting for DOMContentLoaded also waits for unrelated deferred resources.
  start();
})();
