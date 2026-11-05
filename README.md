# Motion demo

Motion 设备端 V2.2.0 与 APP V1.2.0 产品评审项目，包括完整交互 Demo、页面规则编辑器、演示资源、摄像头骨骼识别资源、最终 PRD 及截图。

## 启动预览

在仓库目录执行：

```bash
python3 -m http.server 4187 --bind 127.0.0.1
```

浏览器打开 http://127.0.0.1:4187/ 。进入 AI 训练后点击“开启摄像头”，允许摄像头权限；也可使用明确标注的示例模式。摄像头与姿态识别在本机运行。

## 最新版本

默认入口为 `output/motion-demo-review-v3/index.html`（规则 V3 精简定稿）。

## 项目内容

- `output/motion-demo-review-v3/`：最新规则 V3 精简定稿及完整资源。
- `output/motion-demo-current/`：设备端与 APP 交互 Demo、媒体资源、主题、模拟状态及验证脚本。
- `output/motion-final-prd/`：最终需求文档与对应页面截图。
- `output/motion-preparation-update/`：训练准备专题文档与截图。

最终文档：[Motion 设备端 V2.2.0 与 APP V1.2.0 最终 PRD](output/motion-final-prd/Motion设备端V2.2.0与APP-V1.2.0最终PRD.md)。

## 编辑规则

页面右侧点击“编辑规则”，修改自动保存在当前浏览器。通过“导出全部修改”下载 `rulebook-data.js`，替换 Demo 目录内同名文件后再提交到 Git。浏览器本地草稿不会自动写回仓库。

## 验证

```bash
npm install
npm run verify:controls
npm run verify:camera
```

摄像头验证使用虚拟设备，先启动上面的本地预览服务；验证脚本需要本机 Google Chrome。

## 演示边界

账号、设备控制、训练评分和音乐音量使用模拟状态；摄像头画面与骨骼点使用本机采集和本地姿态模型。正式数据接口和硬件联动以 PRD 各模块定义为准。
