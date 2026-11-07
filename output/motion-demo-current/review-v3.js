/* ==========================================================================
 * Motion 规则 V3 · 评审界面补丁
 * - 左栏追加 6 个全局入口：版本与范围 / 主要操作流程 / 待确认事项 / 验收口径 /
 *   FR 索引 / UI 文案表（不再提供「本页改动说明」，改动记录见 CHANGELOG.md）
 * - 规则面板：版本元信息、标记图例、小节目录、恢复原始规则
 * - FR 锚点直达：index.html#fr-bed-02
 * - 导出前 diff 预览（C-03）
 * 加载顺序：必须在 spring-shortcuts.js 与 rule-editor.js 之后（本文件最后加载）
 * ========================================================================== */
(() => {
  /* ------------------------------------------------------------ 1. 样式 */
  const css = document.createElement('style');
  css.textContent = `
  .rv{color:#1656d6 !important}
  .fr-id{display:inline-block;margin-left:8px;padding:0 5px;border:1px solid #cfdbe9;border-radius:4px;
    font:600 10px/1.7 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.02em;color:#7b8a9d !important;vertical-align:2px}
  .rv-block,.rv-block p,.rv-block li,.rv-block td,.rv-block th,.rv-block h3,.rv-block h4,.rv-block b,.rv-block span{color:#1656d6 !important}
  .rv-meta{font-size:12px !important;color:#7b8a9d !important;margin:2px 0 0 !important}
  .rv-legend{margin:14px 0;padding:10px 12px;background:#f2f7ff;border:1px solid #d7e4f7;border-radius:8px;font-size:12px;line-height:1.7;color:#43566f}
  .rv-legend b{color:#1c3f6e;margin-right:6px}
  .rv-legend span{display:inline-block;margin-right:14px}
  .v3-frame-warn{position:absolute;left:12px;right:12px;bottom:12px;z-index:9;background:#fff7ed;border:1px solid #f0c69a;border-radius:8px;padding:10px 12px;font-size:12px;line-height:1.6;color:#8a4b12;box-shadow:0 6px 18px rgba(20,32,48,.12)}
  .v3-frame-warn b{display:block;margin-bottom:2px;color:#7a3d05}
  .v3-frame-warn code{background:#fde8cf;padding:0 4px;border-radius:3px}
  .rv-legend span.rv{margin-right:14px}
  .rv-toc{display:flex;flex-wrap:wrap;gap:6px;padding:10px 0 14px;border-bottom:1px solid #e8edf4;margin-bottom:6px}
  .rv-toc a{display:block;padding:3px 8px;background:#eef4ff;border-radius:999px;color:#2a60a8;text-decoration:none;font-size:12px;line-height:1.6}
  .rv-toc a:hover{background:#dde9ff}
  .rv-reset{background:white !important;color:#a33a3a !important;border:1px solid #ecc9c9 !important}
  .rule-list{margin:8px 0 8px 0;padding-left:20px}
  .rule-list li{margin:5px 0;line-height:1.85}
  .rule-table table{width:100%;border-collapse:collapse;margin:10px 0;font-size:13px}
  .rule-table td,.rule-table th{border:1px solid #dce5f0;padding:7px 8px;vertical-align:top;line-height:1.7}
  .rule-table th{background:#f0f5fb;text-align:left;white-space:nowrap;font-size:12px;color:#33465f}
  .review-cap{margin:10px 0 6px !important;font-size:12px !important;color:#64758b !important;letter-spacing:.02em}
  .v3-overlay{position:fixed;inset:0;background:rgba(18,32,48,.45);display:flex;align-items:center;justify-content:center;z-index:9999}
  .v3-dialog{width:min(900px,92vw);max-height:86vh;display:flex;flex-direction:column;background:#fff;border-radius:12px;box-shadow:0 18px 50px rgba(16,32,52,.3);overflow:hidden}
  .v3-dialog-h{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid #e6edf6;font-size:14px;color:#1c3350}
  .v3-dialog-h button{border:0;background:transparent;font-size:20px;line-height:1;cursor:pointer;color:#7b8a9d}
  .v3-dialog-b{padding:14px 18px 18px;overflow:auto;font-size:13px;line-height:1.7;color:#33465f}
  .diff-box{max-height:46vh;overflow:auto;background:#fbfdff;border:1px solid #dce5f0;border-radius:8px;padding:10px;font:12px/1.7 ui-monospace,Menlo,monospace;white-space:pre-wrap}
  .diff-box .add{color:#1a7f4b;background:#eefaf3}
  .diff-box .del{color:#b03a3a;background:#fdf1f1;text-decoration:line-through}
  .diff-box .mod{color:#7b8a9d;font-weight:600;margin-top:8px}
  `;
  document.head.appendChild(css);

  /* ------------------------------------------------------------ 2. 全局入口 */
  const MODULES = [
    ['scope', '版本与范围', '版本与范围', '本次发布的端、模块与保持不变的范围。'],
    ['flows', '主要操作流程', '主要操作流程', '四条主链路、命令时序通则与跨流程约束。'],
    ['pending', '待确认事项', '发布前待确认事项', '唯一登记处：20 项，其中阻塞开发 11 项。'],
    ['acceptance', '验收口径', '验收口径', '验收方式、跨模块一致性与异常边界要求。'],
    ['frIndex', 'FR 索引', '需求编号索引', '全部小节的需求编号与锚点，供用例与缺陷单互链。'],
    ['copyTable', 'UI 文案表', 'UI 文案表', '中英文案与 COPY 编号，正文引用编号。']
  ];
  for (const [r, label, ruleKey, desc] of MODULES) {
    routes[r] = label;
    notes[r] = [label, desc];
    pages[r] = () => bar(label, 'home') +
      '<div class="pad"><p>' + desc + '</p>' +
      '<p class="muted small">完整规则见右侧「' + ruleKey + '」。</p></div>';
    ruleMap[r] = ruleKey;
  }

  const head = ['scope', 'flows'];
  const tail = ['pending', 'acceptance', 'copyTable', 'frIndex'];
  const uniq = a => a.filter((v, i) => a.indexOf(v) === i);
  const withGlobals = list => {
    const out = uniq([...head, ...list.filter(r => !tail.includes(r))]);
    const at = out.indexOf('rules');
    return at < 0 ? [...out, ...tail] : [...out.slice(0, at), ...tail, ...out.slice(at)];
  };
  quick.device = withGlobals(quick.device);
  quick.app = withGlobals(quick.app);

  /* 设置排在常见问题之前，符合自检顺序 */
  const orderSettings = list => {
    const out = list.filter(x => x !== 'settings');
    const at = out.indexOf('help');
    if (at >= 0) out.splice(at, 0, 'settings');
    return out;
  };
  quick.device = orderSettings(quick.device);

  /* ------------------------------------------------------------ 3. 面板增强 */
  const resetRule = key => {
    try {
      const storageKey = 'motion-page-rule-edits-v1';
      const all = JSON.parse(localStorage.getItem(storageKey) || '{}');
      if (all[key]) { delete all[key]; localStorage.setItem(storageKey, JSON.stringify(all)); }
    } catch (_) { }
    document.querySelectorAll('.editable-rule-body').forEach(b => {
      if (b.dataset.ruleKey === key) b.innerHTML = window.MotionRuleEdits.get(key);
    });
    paintRules();
  };

  const headingText = h => {
    const c = h.cloneNode(true);
    c.querySelectorAll('.fr-id').forEach(n => n.remove());
    return c.textContent.trim();
  };

  const enhancePanel = function () {
    const panel = document.getElementById('module-rules');
    if (!panel) return;

    const header = panel.querySelector('.module-rule-header');
    if (header && !header.querySelector('.rv-meta')) {
      const meta = document.createElement('p');
      meta.className = 'rv-meta';
      meta.textContent = '会议修订 V5 · 2026-11-07 · 待确认项见「发布前待确认事项」';
      header.appendChild(meta);
    }

    if (header && !panel.querySelector('.rv-legend')) {
      const legend = document.createElement('div');
      legend.className = 'rv-legend';
      legend.innerHTML = '<b>标记</b><span class="rv">蓝色＝本版新增或修正的规则</span>' +
        '<span>FR 编号＝小节锚点，地址栏 #fr-bed-02 可直达</span>' +
        '<span>「（HW-01）」＝待确认编号；整章新增的全局章节不逐句标色</span>';
      header.insertAdjacentElement('afterend', legend);
    }

    const body = panel.querySelector('.editable-rule-body');
    if (body) {
      panel.querySelectorAll('.rv-toc').forEach(n => n.remove());
      const hs = [...body.querySelectorAll('h3')];
      if (hs.length >= 2) {
        const toc = document.createElement('nav');
        toc.className = 'rv-toc';
        hs.forEach((h, i) => {
          if (!h.id) h.id = 'rv-' + (body.dataset.ruleKey || 'm').replace(/\s+/g, '') + '-' + i;
          const a = document.createElement('a');
          a.href = '#' + h.id;
          a.textContent = headingText(h);
          a.onclick = ev => { ev.preventDefault(); h.scrollIntoView({ block: 'start', behavior: 'smooth' }); };
          toc.appendChild(a);
        });
        body.parentNode.insertBefore(toc, body);
      }
    }

    const tools = panel.querySelector('.rule-edit-tools');
    if (tools && body && !tools.querySelector('.rv-reset')) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'rv-reset';
      b.textContent = '恢复本模块原始规则';
      b.onclick = () => {
        if (confirm('将丢弃本模块在浏览器内的本地修改，恢复为 V3 规则原文。继续？')) resetRule(body.dataset.ruleKey);
      };
      tools.appendChild(b);
    }
  };

  const basePaint = paintRules;
  paintRules = function () { basePaint(); enhancePanel(); };

  const baseModal = modal;
  modal = function (title, html) { baseModal(title, html); enhancePanel(); };

  /* ------------------------------------------------------------ 4. FR 锚点直达 */
  function jumpToFR(id) {
    const book = window.MotionRulebook || {};
    let key = null;
    for (const k of Object.keys(book)) if ((book[k] || '').indexOf('id="' + id + '"') >= 0) { key = k; break; }
    if (!key) return;
    const routeKey = Object.keys(ruleMap).find(r => ruleMap[r] === key);
    if (!routeKey || typeof go !== 'function') return;
    go(routeKey);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 120);
  }

  function handleHash() {
    const id = decodeURIComponent((location.hash || '').slice(1));
    if (!/^fr-/.test(id)) return;
    const el = document.getElementById(id);
    if (el) { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
    jumpToFR(id);
  }

  /* ------------------------------------------------------------ 5. 导出 diff 预览 */
  const splitBlocks = html => String(html)
    .replace(/<\/(p|li|h3|h4|tr|div|table|ul|section)>/g, '$&\n')
    .split('\n').map(s => s.trim()).filter(Boolean);

  const strip = s => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

  function lcsDiff(a, b) {
    const n = a.length, m = b.length;
    const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    const out = []; let i = 0, j = 0;
    while (i < n && j < m) {
      if (a[i] === b[j]) { out.push([' ', a[i]]); i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push(['-', a[i]]); i++; }
      else { out.push(['+', b[j]]); j++; }
    }
    while (i < n) out.push(['-', a[i++]]);
    while (j < m) out.push(['+', b[j++]]);
    return out;
  }

  function diffHTML(baseHtml, curHtml) {
    const d = lcsDiff(splitBlocks(baseHtml), splitBlocks(curHtml));
    const changed = d.filter(x => x[0] !== ' ');
    const html = changed.map(([op, line]) =>
      '<div class="' + (op === '+' ? 'add' : 'del') + '">' + op + ' ' +
      strip(line).replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</div>'
    ).join('') || '<div class="mod">（仅格式差异）</div>';
    return { html, add: changed.filter(x => x[0] === '+').length, del: changed.filter(x => x[0] === '-').length };
  }

  function showDialog(title, html) {
    document.querySelectorAll('.v3-overlay').forEach(n => n.remove());
    const o = document.createElement('div');
    o.className = 'v3-overlay';
    o.innerHTML = '<div class="v3-dialog"><div class="v3-dialog-h"><b>' + title + '</b>' +
      '<button type="button" aria-label="关闭">×</button></div><div class="v3-dialog-b">' + html + '</div></div>';
    document.body.appendChild(o);
    o.querySelector('button').onclick = () => o.remove();
    o.onclick = e => { if (e.target === o) o.remove(); };
  }

  window.exportMotionRules = function () {
    const cur = window.MotionRuleEdits.all();
    const base = window.MotionRulebook;
    const changed = Object.keys(cur).filter(k => cur[k] !== base[k]);
    if (!changed.length) { showDialog('导出规则', '<p>当前没有修改，无需导出。</p>'); return; }
    let html = '<p>共修改 <b>' + changed.length + '</b> 个模块。确认后导出 <code>rulebook-data.js</code>；取消不会改动磁盘文件。</p>';
    for (const k of changed) {
      const d = diffHTML(base[k] || '', cur[k]);
      html += '<p class="review-cap">' + k + '　<span style="color:#1a7f4b">+' + d.add + '</span>　<span style="color:#b03a3a">−' + d.del + '</span></p>' +
        '<div class="diff-box">' + d.html + '</div>';
    }
    html += '<p><button type="button" onclick="confirmExportRules()" style="background:#2463ab;color:#fff;border:0;border-radius:6px;padding:9px 16px;font-size:13px;cursor:pointer">确认导出</button></p>';
    showDialog('导出前确认 · 逐段 diff', html);
  };

  window.confirmExportRules = function () {
    const blob = new Blob(['/* Motion page rules, exported ' + new Date().toISOString() + ' */\nwindow.MotionRulebook=' +
      JSON.stringify(window.MotionRuleEdits.all(), null, 2) + ';\n'], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = 'rulebook-data.js'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  window.addEventListener('hashchange', handleHash);

  /* 进入规则类页面时默认展示对应模块 */
  render();
  if (/^#fr-/.test(location.hash || '')) setTimeout(handleHash, 400);
})();