(() => {
  const pair = (en, zh) => ({en, zh});
  const articles = [
    {id:'strength', category:pair('Strength training','力量训练'), title:pair('How do I adjust resistance?','如何调整力量训练的阻力？'), intro:pair('Find the resistance controls in your workout screen.','在训练页面中找到阻力控制区域。'), image:'resistance', caption:pair('Example: use − and + to change the displayed resistance.','示意：使用 − 和 + 调整屏幕上的阻力数值。'), steps:[
      [pair('Open a strength workout','进入力量训练'),pair('From Home, choose Free Training, then Strength Training. Review the workout settings before starting.','在首页选择自由训练，再选择力量训练。开始前先查看训练配置。')],
      [pair('Adjust the value','调整阻力'),pair('Use − or + beside the kg value. The step size shown below the control tells you how much each tap changes the resistance.','点击 kg 数值旁的 − 或 +。控件下方的步进值表示每次点击调整的幅度。')],
      [pair('Check the mode','确认模式'),pair('The selected resistance mode appears beside the controls. Pause the workout if you need time to review your settings.','当前阻力模式显示在控制区域。需要仔细查看设置时，可以先暂停训练。')]]},
    {id:'pilates', category:pair('Pilates','普拉提'), title:pair('Where do I start a Pilates workout?','如何开始普拉提训练？'), intro:pair('Choose Pilates from the free training options.','在自由训练选项中选择普拉提。'), image:'pilates', caption:pair('Choose Pilates, review the settings, then start.','选择普拉提，确认配置后开始训练。'), steps:[
      [pair('Prepare the bed','准备床体'),pair('Before entering the workout, open Device Control on Home. Check that the bed is fully lowered and the rail status is Locked.','进入训练前，在首页打开设备控制，确认床体已完全展开，轨道状态为“已锁定”。')],
      [pair('Choose Pilates','选择普拉提'),pair('Open Free Training and select Pilates to enter its workout screen.','打开自由训练，选择普拉提，进入对应的训练页面。')],
      [pair('Review and start','确认并开始'),pair('Review the resistance mode and value, then select Start. Duration and workout metrics appear on screen during the session.','查看阻力模式和数值，再点击开始。训练时，页面会显示时长和相关运动指标。')]]},
    {id:'bed', category:pair('Device use','设备使用'), title:pair('How do I lower or raise the bed?','如何展开或折叠床体？'), intro:pair('Bed movement is controlled from Home, outside a workout.','床体升降需要在训练之外，通过首页进行控制。'), image:'bed', caption:pair('The available action changes with the bed position.','可用按钮会根据床体当前状态切换。'), steps:[
      [pair('Open Device Control','打开设备控制'),pair('Return to Home and select Device Control. Bed movement is unavailable during training, including pauses and rest.','返回首页，点击设备控制。训练过程中，包括暂停和休息阶段，都不能控制床体升降。')],
      [pair('Choose the available action','选择当前可用操作'),pair('When the bed is lowered, select Raise Bed. When upright, select Lower Bed. Keep people and objects clear of the bed and its movement area.','床体展开时选择“折叠床体”，竖直时选择“展开床体”。确保床上无人，并清空床体及其运动范围内的物品。')],
      [pair('Confirm and wait','确认并等待完成'),pair('Read the confirmation message, then confirm. Stay beside the device and watch the bed. Use Stop Movement if you need to stop it.','阅读二次确认提示后再确认操作。留在设备旁观察床体，必要时点击“停止移动”。')]]},
    {id:'rail', category:pair('Device use','设备使用'), title:pair('Why does the rail lock again automatically?','为什么轨道解锁后会自动重新锁定？'), intro:pair('Unlocking is temporary so you can adjust the rail by hand.','解锁仅临时生效，便于手动调整轨道。'), image:'rail', caption:pair('Unlock → adjust by hand → wait for Locked.','解锁 → 手动调整 → 等待“已锁定”。'), steps:[
      [pair('Check the bed position','确认床体状态'),pair('End the workout and return to Home. Rail unlocking is available only when the bed is fully lowered.','结束训练并返回首页。只有床体完全展开时，才能使用轨道解锁功能。')],
      [pair('Unlock briefly','临时解锁'),pair('In Device Control, select Unlock Rail and confirm. You have a 5-second adjustment window, then automatically relocks.','在设备控制中点击“解锁轨道”并确认。提供 5 秒调整时间，随后自动重新锁定。')],
      [pair('Wait for confirmation','等待锁定确认'),pair('Keep everyone off the bed while adjusting. Wait until the status says Locked before using the bed. If more adjustment is needed, unlock again from Device Control.','调整时请勿让任何人上床。等待状态变为“已锁定”后再使用。如需继续调整，可在设备控制中再次解锁。')]]},
    {id:'records', category:pair('Workout records','训练记录'), title:pair('Where can I review my workouts?','在哪里查看训练记录？'), intro:pair('Review your training history from Profile.','在“我的”页面查看训练历史。'), image:'records', caption:pair('Review duration, volume and workout trends.','查看训练时长、训练容量及变化趋势。'), steps:[
      [pair('Open your profile','进入“我的”'),pair('Select Profile in the bottom navigation, then open the training records entry.','点击底部导航中的“我的”，再打开训练记录入口。')],
      [pair('Choose a time range','选择统计范围'),pair('Use Week, Month or All to change the overview. Switch to the records list to browse individual sessions.','通过周、月或全部切换统计范围，也可以切换到记录列表查看单次训练。')],
      [pair('Open a report','查看训练报告'),pair('Select a completed workout to view its report. Available metrics depend on the workout type; AI analysis appears for supported workouts.','选择已完成的训练查看报告。不同训练类型显示的指标不同，支持 AI 的训练会显示对应分析。')]]},
    {id:'contact', category:pair('More help','更多帮助'), title:pair('Still need help? Contact support','问题还没解决？联系客服'), intro:pair('Include the page name and a short description of what happened so our team can understand your question.','请提供页面名称，并简要描述遇到的问题，方便客服了解情况。'), image:'contact', caption:pair('Browse FAQs on your phone or ask our support team.','在手机上查看常见问题，或向客服咨询。'), steps:[]}
  ];
  const root = document.getElementById('helpContent');
  if (!root) return;
  const isDetail = document.body.dataset.helpPage === 'detail';
  const selected = articles.find(a => a.id === new URLSearchParams(location.search).get('article'));
  const text = value => value[window.MotionI18n.language];
  const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const tr = (en,zh) => escape(text(pair(en,zh)));
  function illustration(type) {
    const drawings = {
      resistance:'<rect x="72" y="37" width="216" height="106" rx="18"/><circle cx="110" cy="90" r="17"/><path d="M102 90h16M242 90h16m-8-8v16"/><circle cx="250" cy="90" r="17"/><text x="180" y="99" text-anchor="middle" fill="currentColor" stroke="none" font-size="27">10 kg</text>',
      pilates:'<rect x="67" y="104" width="226" height="22" rx="8"/><path d="M84 126v22m190-22v22M155 75l51 7 32 21M155 75l-26 28m77-21 22-25"/><circle cx="139" cy="60" r="13"/><path d="M80 88V52h-17m215 52V47h18"/>',
      bed:'<path d="M56 136h100m-88 0v17m77-17v17M237 136V37m0 99h30"/><rect x="53" y="115" width="108" height="17" rx="5"/><rect x="239" y="35" width="17" height="102" rx="5"/><path d="M173 112q0-49 48-49m-12-9 12 9-12 9"/>',
      rail:'<path d="M48 130h264m-264 12h264"/><rect x="103" y="104" width="154" height="23" rx="6"/><rect x="158" y="50" width="44" height="38" rx="7"/><path d="M167 50V37a13 13 0 0 1 26 0v13M181 65v10M65 111h21m-7-7 7 7-7 7M277 111h21m-14-7-7 7 7 7"/>',
      records:'<rect x="78" y="29" width="204" height="126" rx="12"/><path d="M101 130h159"/><path d="M120 129V91m40 38V75m40 54V96m40 33V61" stroke-width="15"/><path d="m112 66 39-13 48 10 47-22" stroke="#ff6b35"/>',
      contact:'<rect x="84" y="38" width="192" height="104" rx="22"/><path d="m114 142-11 19 39-19M111 76h138m-138 25h94"/>'
    };
    return `<svg viewBox="0 0 360 180" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${drawings[type]}</svg>`;
  }
  function contact() {
    return `<section class="help-contact"><div class="help-qr-grid">
      <figure><img src="assets/help-feedback/faq-demo.svg" width="160" height="160" alt="${tr('FAQ QR code','常见问题二维码')}"><figcaption>${tr('FAQs on your phone','手机查看常见问题')}</figcaption></figure>
      <figure><img src="assets/help-feedback/wechat-demo.svg" width="160" height="160" alt="${tr('WeChat support QR code','微信客服二维码')}"><figcaption>${tr('WeChat Support','微信客服')}</figcaption></figure></div>
      <dl><div><dt>${tr('Email','邮箱')}</dt><dd>support@example.com</dd></div><div><dt>${tr('Phone','联系电话')}</dt><dd>+1 (202) 555-0148</dd></div></dl></section>`;
  }
  function render() {
    document.title=text(pair('Help & Feedback','帮助与反馈'))+' · MotionStation';
    document.getElementById('helpBack').textContent=text(pair('Back','返回'));
    document.getElementById('helpBack').href=isDetail?'plan-b-help-feedback.html':'plan-b-profile.html';
    document.getElementById('helpPageTitle').textContent=text(pair('Help & Feedback','帮助与反馈'));
    if (!isDetail) {
      root.innerHTML=`<p class="help-intro">${tr('Quick answers to help you get started.','快速了解训练与设备使用。')}</p><h2 class="help-section-label">${tr('Frequently asked questions','常见问题')}</h2><ol class="help-list">${articles.map(a=>`<li><a href="plan-b-help-detail.html?article=${a.id}"><span><small>${escape(text(a.category))}</small><h3>${escape(text(a.title))}</h3></span><span class="help-chevron" aria-hidden="true">›</span></a></li>`).join('')}</ol>`;
      return;
    }
    if(!selected){root.innerHTML=`<h2>${tr('Article not found','未找到该问题')}</h2><p class="help-intro">${tr('Return to the question list and choose an article.','请返回问题列表，选择需要查看的内容。')}</p>`;return;}
    root.innerHTML=`<article><p class="help-category">${escape(text(selected.category))}</p><h2 class="help-article-title">${escape(text(selected.title))}</h2><p class="help-intro">${escape(text(selected.intro))}</p><figure class="help-illustration">${illustration(selected.image)}<figcaption>${escape(text(selected.caption))}</figcaption></figure><ol class="help-steps">${selected.steps.map(([h,p])=>`<li><h3>${escape(text(h))}</h3><p>${escape(text(p))}</p></li>`).join('')}</ol>${selected.id==='contact'?contact():''}</article>`;
  }
  render();
  document.addEventListener('motionlanguagechange',render);
})();
