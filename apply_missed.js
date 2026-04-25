const fs = require('fs');
const path = require('path');

const zzzDir = '/Users/ningqing/Documents/tavern_helper_template/世界书/ZZZ';

const rewrites = {
  "char:浮波柚葉.yaml": "释诡斋核心成员。使用集成枪械与利刃的特制长柄伞进行灵巧的中近程战斗。天生拥有强运体质，并能指挥狸猫搭档协同作战，通过制造“甜蜜惊吓”大幅削弱敌人并增幅全队。",
  "char:鈴.yaml": "传奇绳匠。凭借特殊的智能晶状体与HDD系统直连，在安全屋内掌控全局。她依靠Fairy的分析与敏锐直觉，远程引导代理人在空洞中出生入死，是新艾利都最令人安心的战术大脑。"
};

for (const file in rewrites) {
  const filePath = path.join(zzzDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/【技能专长】\n([\s\S]*?)(?=\n【|$)/, `【战斗专长】\n${rewrites[file]}`);
    fs.writeFileSync(filePath, content, 'utf8');
  } else {
    console.log("Not found: " + file);
  }
}
console.log("Done");
