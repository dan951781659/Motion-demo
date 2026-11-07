/* 训练准备只做安装，已取消完整／简洁两种模式，也没有自绘的「动作开始」页。
   页面本体在 v6-prep.js。本文件只保留两件事：
   1. 准备完成后进入设备端原动作详情；
   2. 模拟数据选「空数据」（无配件、无需安装）时，跳过准备直接进入动作详情。 */
function finishPrep(){checked=true;go('moveDetail')}
const priorPrepRender=render;
render=function(){
  if(route==='prepare'&&$('#state').value==='empty'){$('#state').value='normal';route='moveDetail'}
  priorPrepRender();
};
render();
