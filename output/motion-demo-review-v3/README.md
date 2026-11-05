# Motion 评审 Demo · 规则 V3（精简定稿）

本目录是 `motion-demo-current` 的修订副本，**原目录一行未改**。

- 依据：`../motion-final-prd/Motion-Demo规则页评审报告-2026-11-04.md`
- 改动记录：见 `CHANGELOG.md`（原页面内的「本页改动说明」已移除）

## 三个版本怎么选

| 目录 | 用途 |
| --- | --- |
| `motion-demo-current/` | V1 原始 Demo，未改动 |
| `motion-demo-review-v2/` | V2 首轮修订，带蓝色新增＋删除线对照，适合逐句看改了什么 |
| `motion-demo-review-v3/` | **V3 精简定稿**，只留判定口径，适合评审与开发看规则 |

## 本版三个变化

1. **文案精简**：每个模块由 9 个固定小节合并为 6 个（规则 / 异常与边界 / 数据来源与更新 / 状态保存与重置 / 适用条件与能力边界）。删掉互相复述的小节、演示过程描述与铺垫句；12 个模块正文 9407 → 8742 字，AI 训练 3194 → 2082 字（-35%）。
2. **页内改动说明移除**：左栏不再有「本页改动说明」，20 项改动与评审编号对照移到 `CHANGELOG.md`；同屏不再用删除线展示旧文（需要对照时看 V1 文件或 V2 目录）。
3. **补齐上版遗留**：FR 编号体系（108 个小节，`#fr-bed-02` 可直达）、需求编号索引、UI 文案表（COPY-01～17 中英对照）、导出前逐段 diff 预览、评审控件标题降级、总览页快捷入口、默认外观口径。

## 分享给别人怎么看（重要）

设备预览是 iframe 加载 `device-baseline/plan-b-*.html`。**把单个 `index.html` 传到资料库/网盘这类"网页快照"里分享时，只有根目录资源会被带走**，子目录的样式与图片会丢失，设备预览就变成一块深色底＋几行没样式的字。

现在已经做了处理：

- 25 个设备页已被打包成**单文件自带资源**（CSS、JS、图片全部内联），只取到 HTML 就能完整渲染；原始文件在 `device-baseline/_src/`。
- 父页面用到的两张设备图已挪到根目录 `assets/`，不再反向引用子目录。
- 万一还有页面加载不到样式，预览区会显示一条橙色说明，而不是黑屏。

推荐分享方式（按可靠性排序）：

1. **把整个目录部署成静态站点**（任意静态托管），发站点首页链接——所有资源按原路径提供，不会有裁剪。
2. **整目录打包成 zip 发出去**，对方解压后双击 `index.html`。
3. 只能在资料库单文件预览时：设备端预览已是自包含，可以正常看；但 `device-baseline/_src/` 与"现状／历史参考"里的旧 APP Demo（`app-baseline/`，Expo 打包产物）仍依赖子目录，会不完整。

修改设备页后需要重新打包：`node tools/bundle-device-pages.cjs`；改坏了要还原原始页：`node tools/bundle-device-pages.cjs --restore`。

## 怎么看

- 打开 `index.html` / `device.html` / `app.html`；左栏前两项为「版本与范围」「主要操作流程」，末尾为「待确认事项」「验收口径」「UI 文案表」「FR 索引」。
- 右侧规则面板：
  - **蓝色**＝本版新增或修正的规则（整章新增的全局章节不逐句标色）；
  - **FR-BED-02** 这类小标签＝小节锚点，可在地址栏用 `index.html#fr-bed-02` 直达；
  - **（HW-01）** 这类括注＝待确认编号，登记在《发布前待确认事项》，共 20 项、阻塞 11 项；
  - 面板顶部有小节目录，编辑区有「恢复本模块原始规则」。
- `rules.html` 可一页读完全部 18 个章节，顶部有全局章节跳转。
- 导出规则会先弹出 diff 预览，确认后才下载 `rulebook-data.js`。

## 文件变更

| 文件 | 变更 |
| --- | --- |
| `rulebook-v3-data.js` | **新增**：12 个模块正文整体重写（不修改 `rulebook-data.js`） |
| `rulebook-v3-appendix.js` | **新增**：4 个全局章节＋UI 文案表＋FR 索引＋排序＋修订号 |
| `review-v3.js` | **新增**：左栏入口、元信息与图例、小节目录、恢复原始、FR 锚点、导出 diff |
| `rules.html` | 重写样式与图例，加全局章节快捷入口 |
| `index.html` / `device.html` / `app.html` | 仅替换 `<script>` 引用与标题 |
| `module-rule-panel.js` | 「演示状态 · 仅供评审」等标题由 h3 降为小号说明（C-09）；演示图改用根目录 `assets/` |
| `device-baseline/*.html` | 打包成单文件自带资源（原始页备份在 `device-baseline/_src/`） |
| `tools/bundle-device-pages.cjs` | **新增**：设备页内联打包脚本，`--restore` 可还原 |
| `rulebook-data.js` | 未改动（V1 基线） |

回滚：删掉三个 V3 文件与对应 `<script>`、还原 `rules.html` 即可回到 V2/V1。

## 验证

- `node verify-page-rules.cjs`：8 个模块 + 计次模拟 + 注销弹窗全部 PASS，`ERRORS []`
- 17 个左栏入口逐个渲染：0 处非法嵌套（`p` 内嵌块级元素、`tbody` 内嵌 `p` 均为 0），FR 标签与小节目录数量一致
- `rules.html`：18 个章节、108 个 FR 标签、快捷入口正常
- `index.html#fr-bed-02` 深链：自动切到「床体控制」并定位到该小节
- 分享自包含验证：删掉 `device-baseline/css|js|assets` 三个目录后重跑，25 个设备页 0 样式缺失、0 破图、0 404
- 控制台剩余报错仅 1 条，为原版同样存在的 `device-baseline/index-plan-b-home.html` 加载中断（abort），非本版引入

## 待办提醒

- 占位值（状态新鲜 2s、命令超时 8s、失识别 800ms/3 帧、评分阈值、注销期限与冷静期、验证码风控）确认后替换；清单见 `CHANGELOG.md` 第四节。
- 文案表英文为初稿，需语言审核。
- 摄像头与本地骨骼识别预览：在本目录执行 `python3 -m http.server 4191 --bind 127.0.0.1`，打开 `http://127.0.0.1:4191/index.html?view=recognition`。
