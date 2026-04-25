import fs from 'fs';
import path from 'path';

const dir = '/Users/ningqing/Documents/tavern_helper_template/世界书/ZZZ';
const zzzYamlPath = '/Users/ningqing/Documents/tavern_helper_template/世界书/zzz.yaml';

// 完整重命名映射表（已经过用户审核修正）
const renameMap = {
  // === fac: 势力/组织 ===
  '---坎卜斯黑枝---.yaml': 'fac:坎卜斯黑枝.yaml',
  '---天琴座---.yaml': 'fac:天琴座.yaml',
  '---妄想天使---.yaml': 'fac:妄想天使.yaml',
  'TOPS企业联盟.yaml': 'fac:TOPS企业联盟.yaml',
  '三闸,三闸.yaml': 'fac:三闸.yaml',
  '刑侦特勤组.yaml': 'fac:刑侦特勤组.yaml',
  '卡吕冬之子.yaml': 'fac:卡吕冬之子.yaml',
  '反舌鸟,怪盗团.yaml': 'fac:反舌鸟.yaml',
  '合规管理局.yaml': 'fac:合规管理局.yaml',
  '噬尾蛇.yaml': 'fac:噬尾蛇.yaml',
  '對空六課.yaml': 'fac:對空六課.yaml',
  '奧波勒斯小隊.yaml': 'fac:奧波勒斯小隊.yaml',
  '新艾利都卫戍部队.yaml': 'fac:新艾利都卫戍部队.yaml',
  '机车联盟,霸主.yaml': 'fac:机车联盟.yaml',
  '机车帮.yaml': 'fac:机车帮.yaml',
  '白祇重工.yaml': 'fac:白祇重工.yaml',
  '白銀小隊.yaml': 'fac:白銀小隊.yaml',
  '称颂会.yaml': 'fac:称颂会.yaml',
  '称颂会历史.yaml': 'fac:称颂会历史.yaml',
  '空洞调查协会.yaml': 'fac:空洞调查协会.yaml',
  '維多利亞居家服務.yaml': 'fac:維多利亞居家服務.yaml',
  '狡兔屋.yaml': 'fac:狡兔屋.yaml',
  '视像公司,帕尔曼.yaml': 'fac:视像公司.yaml',
  '高瞻集团.yaml': 'fac:高瞻集团.yaml',
  '猩红贵族.yaml': 'fac:猩红贵族.yaml',
  '新艾利都公共安全_H.A.N.D_新艾利都市政厅.yaml': 'lore:新艾利都公共安全.yaml', // 用户指定为lore

  // === loc: 地点/区域 ===
  '【场景】星环.yaml': 'loc:星环.yaml',
  '云岿山.yaml': 'loc:云岿山.yaml',
  '六分街.yaml': 'loc:六分街.yaml',
  '卫非地半岛.yaml': 'loc:卫非地半岛.yaml',
  '厄尔庇斯港.yaml': 'loc:厄尔庇斯港.yaml',
  '外环.yaml': 'loc:外环.yaml',
  '巨洞.yaml': 'loc:巨洞.yaml',
  '幻海奇境.yaml': 'loc:幻海奇境.yaml',
  '斯科特前哨.yaml': 'loc:斯科特前哨.yaml',
  '星环.yaml': 'loc:星环塔.yaml',
  '流明广场.yaml': 'loc:流明广场.yaml',
  '澄辉坪.yaml': 'loc:澄辉坪.yaml',
  '炽木镇.yaml': 'loc:炽木镇.yaml',
  '航天城.yaml': 'loc:航天城.yaml',
  '回响斗技场.yaml': 'loc:回响斗技场.yaml',
  '随便观.yaml': 'loc:随便观.yaml',
  '随机播放.yaml': 'loc:随机播放.yaml',
  '老油田_灰烬湖.yaml': 'loc:老油田_灰烬湖.yaml',
  '瘴晦.yaml': 'loc:瘴晦.yaml',
  '莱姆尼安空洞.yaml': 'loc:莱姆尼安空洞.yaml',
  '青溟秘境.yaml': 'loc:青溟秘境.yaml',
  '海神雕像.yaml': 'loc:海神雕像.yaml', // 用户指定为loc

  // === npc: 非代理人角色 ===
  'A少女.yaml': 'npc:A少女.yaml',
  '丹.yaml': 'npc:丹.yaml',
  '乙,三乙工作室.yaml': 'npc:乙.yaml',
  '卡米尔.yaml': 'npc:卡米尔.yaml',
  '司教.yaml': 'npc:司教.yaml',
  '埃洛温.yaml': 'npc:埃洛温.yaml',
  '小枝.yaml': 'npc:小枝.yaml',
  '市长五月花.yaml': 'npc:市长五月花.yaml',
  '德·温特夫人.yaml': 'npc:德·温特夫人.yaml',
  '梅丽娜.yaml': 'npc:梅丽娜.yaml',
  '梅若拉可.yaml': 'npc:梅若拉可.yaml',
  '桐岛.yaml': 'npc:桐岛.yaml',
  '欧斯.yaml': 'npc:欧斯.yaml',
  '泰瑞丝.yaml': 'npc:泰瑞丝.yaml',
  '珍.yaml': 'npc:珍.yaml',
  '艾芙琳·谢瓦利埃.yaml': 'npc:艾芙琳·谢瓦利埃.yaml',
  '达米安.yaml': 'npc:达米安.yaml',
  '阿奇.yaml': 'npc:阿奇.yaml',
  '莱拉克.yaml': 'npc:莱拉克.yaml',
  '老爹.yaml': 'npc:老爹.yaml',
  '黛娜.yaml': 'npc:黛娜.yaml',
  '维克.yaml': 'npc:维克.yaml',
  '维纳斯.yaml': 'npc:维纳斯.yaml',
  '露比,琳,梦奈.yaml': 'npc:露比_琳_梦奈.yaml',
  '菲洛克.yaml': 'npc:菲洛克.yaml',
  '萝卜.yaml': 'npc:萝卜.yaml',
  '摩尔斯.yaml': 'npc:摩尔斯.yaml',
  '奥伦达.yaml': 'npc:奥伦达.yaml',
  '医生_秘密医生.yaml': 'npc:医生_秘密医生.yaml',
  '饮茶仙.yaml': 'npc:饮茶仙.yaml',
  '挽昼.yaml': 'npc:挽昼.yaml',

  // === lore: 世界观/设定/概念 ===
  '以太.yaml': 'lore:以太.yaml',
  '以太干扰探针.yaml': 'lore:以太干扰探针.yaml',
  '以太适性.yaml': 'lore:以太适性.yaml',
  '以太適性退化綜合症.yaml': 'lore:以太適性退化綜合症.yaml',
  '七英雄.yaml': 'lore:七英雄.yaml',
  '凶厄猎捕.yaml': 'lore:凶厄猎捕.yaml',
  '原色 (Original Me).yaml': 'lore:原色.yaml',
  '地狱巡回赛.yaml': 'lore:地狱巡回赛.yaml',
  '妖精.yaml': 'lore:妖精.yaml',
  '寄生体.yaml': 'lore:寄生体.yaml',
  '智能构装.yaml': 'lore:智能构装.yaml',
  '时序原野.yaml': 'lore:时序原野.yaml',
  '空洞.yaml': 'lore:空洞.yaml',
  '觉感术.yaml': 'lore:觉感术.yaml',
  '谐振体.yaml': 'lore:谐振体.yaml',
  '辉耀体,以太建筑.yaml': 'lore:辉耀体.yaml',
  '法厄同的旋律.yaml': 'lore:法厄同的旋律.yaml',
  '樂園遊夢記 (Wonderland Reverie).yaml': 'lore:樂園遊夢記.yaml',
  '拟境序列的隐匿代码.yaml': 'lore:拟境序列的隐匿代码.yaml',
  '海钓探幽.yaml': 'lore:海钓探幽.yaml',
  '镀金胡萝卜日.yaml': 'lore:镀金胡萝卜日.yaml',
  '闪亮 (Shining).yaml': 'lore:闪亮.yaml',
  '熊形希人.yaml': 'lore:熊形希人.yaml',     // 用户指定：人种→lore
  '鬼人.yaml': 'lore:鬼人.yaml',             // 用户指定：人种→lore

  // === mob: 怪物/以骸 ===
  '未知复合侵蚀体.yaml': 'mob:未知复合侵蚀体.yaml',
  '死路屠夫.yaml': 'mob:死路屠夫.yaml',
  '牲鬼 - 布林格.yaml': 'mob:牲鬼_布林格.yaml',
  '布林格.yaml': 'mob:布林格.yaml',
  '霸主侵蚀体．庞培.yaml': 'mob:霸主侵蚀体_庞培.yaml',
  '征服者.yaml': 'mob:征服者.yaml',
  '離子體·多佩岡亞.yaml': 'mob:離子體_多佩岡亞.yaml',
  '帕里库斯.yaml': 'mob:帕里库斯.yaml',
  '夜种·约珥.yaml': 'mob:夜种_约珥.yaml',
  '尼尼微,蜂群.yaml': 'mob:尼尼微.yaml',
  '雷.yaml': 'mob:雷.yaml',

  // === item: 物品 ===
  '爆能可乐_霓光可乐.yaml': 'item:爆能可乐.yaml',
  '辉瓷匕首与靴刃.yaml': 'item:辉瓷匕首与靴刃.yaml',
  '贝鲁姆.yaml': 'item:贝鲁姆.yaml',
  '天琴座之星.yaml': 'item:天琴座之星.yaml',
  '维尼与维迪.yaml': 'item:维尼与维迪.yaml', // 用户指定为item
};

// 需要删除的重复文件
const deleteFiles = [
  '波可娜.yaml', // 重复，保留 char:波可娜.yaml
];

// ===== 执行 =====
let zzzContent = fs.readFileSync(zzzYamlPath, 'utf8');
let renamedCount = 0;
let refUpdated = 0;
let deletedCount = 0;

// 1. 删除重复文件
for (const file of deleteFiles) {
  const filePath = path.join(dir, file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    deletedCount++;
    console.log(`🗑️  删除重复: ${file}`);
  }
}

// 2. 重命名文件 + 更新 zzz.yaml 引用
for (const [oldName, newName] of Object.entries(renameMap)) {
  const oldPath = path.join(dir, oldName);
  const newPath = path.join(dir, newName);

  if (!fs.existsSync(oldPath)) {
    console.log(`⏭️  跳过(不存在): ${oldName}`);
    continue;
  }

  // 重命名物理文件
  fs.renameSync(oldPath, newPath);
  renamedCount++;

  // 更新 zzz.yaml 中的引用
  // 引用格式: 文件: ZZZ/xxx (不含.yaml后缀)
  const oldRef = 'ZZZ/' + oldName.replace('.yaml', '');
  const newRef = 'ZZZ/' + newName.replace('.yaml', '');

  if (zzzContent.includes(oldRef)) {
    zzzContent = zzzContent.split(oldRef).join(newRef);
    refUpdated++;
    console.log(`✅ ${oldName} → ${newName} (引用已更新)`);
  } else {
    console.log(`✅ ${oldName} → ${newName} (无引用需要更新)`);
  }
}

// 3. 写回 zzz.yaml
fs.writeFileSync(zzzYamlPath, zzzContent, 'utf8');

console.log(`\n===== 完成 =====`);
console.log(`重命名: ${renamedCount} 个文件`);
console.log(`引用更新: ${refUpdated} 条`);
console.log(`删除重复: ${deletedCount} 个`);
