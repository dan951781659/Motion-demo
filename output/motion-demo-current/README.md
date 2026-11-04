# Motion 当前评审 Demo

入口 index.html（device.html、app.html亦可）。无需登录或连接真实设备。

左侧仅列修改模块和全局评审入口。训练准备、床体控制、AI训练、训练数据与次数、全局快捷设置、FAQ、设置、我的各自对应页面规则；APP为设置与FAQ，注销弹窗显示流程规则。

规则唯一来源 rulebook-data.js，rules.html与右侧共用。Motion最终方案与需求规则.md为同源文本导出，不需要另查历史PRD。

每模块覆盖修改、状态、操作、异常、联动、验收、数据来源、保存重置及适用边界。正式数据契约待确认部分明确标注；所有设备、相机、账号及训练数据均为模拟。

设备1080×1920等比预览；全屏训练主画面与小画框切换、圆环评分；错误放大保持3秒后左下5秒，最多两条。

验证：node verify-page-rules.cjs。

摄像头与本地骨骼识别：运行 python3 -m http.server 4187 --bind 127.0.0.1 --directory output/motion-demo-current，打开 http://127.0.0.1:4187/index.html?view=recognition。点击开启摄像头并允许权限。模型与运行文件位于 device-baseline/vendor/pose；MediaPipe Tasks Vision 0.10.14，官方文档：https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker/web_js 。视频在本机处理。
