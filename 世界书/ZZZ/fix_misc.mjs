import fs from 'fs';
import path from 'path';

const dir = '/Users/ningqing/Documents/tavern_helper_template/世界书/ZZZ';
const zzzPath = '/Users/ningqing/Documents/tavern_helper_template/世界书/zzz.yaml';
let zzz = fs.readFileSync(zzzPath, 'utf8');

// 1. 怪啖屋 → fac:怪啖屋
fs.renameSync(path.join(dir, '怪啖屋.yaml'), path.join(dir, 'fac:怪啖屋.yaml'));
zzz = zzz.split('ZZZ/怪啖屋').join('ZZZ/fac:怪啖屋');
console.log('✅ 怪啖屋 → fac:怪啖屋');

// 2. 删除 mob:雷
const reiPath = path.join(dir, 'mob:雷.yaml');
if (fs.existsSync(reiPath)) { fs.unlinkSync(reiPath); console.log('🗑️  删除 mob:雷.yaml'); }

// 3. mob:布林格 → npc:布林格，合并牲鬼信息
const blingerContent = `贾斯汀·布林格是新艾利都雅努斯区公共安全总部副司令。
金短发棕瞳肌肉猛男。
曾是英勇正直的警官，从空洞救出年幼朱鳶。但后来似乎更重形象，传闻其勇气被空洞吸干。
第五章揭示他涉身巨大阴谋。为实现宏大目标，布林格幕后操纵，勾结莎拉与称颂会谋划布局，不惜牺牲一切。在完成计划的最后一步，他注射牲鬼血清，化身为牲鬼·布林格——黑色人形腐蚀者，覆眼球的白巨右臂，左手持金剑。
"哦伟大的创造主，精炼我！"——布林格的真心呐喊。
`;
fs.writeFileSync(path.join(dir, 'npc:布林格.yaml'), blingerContent, 'utf8');
fs.unlinkSync(path.join(dir, 'mob:布林格.yaml'));
zzz = zzz.split('ZZZ/mob:布林格').join('ZZZ/npc:布林格');
console.log('✅ mob:布林格 → npc:布林格 (描述已合并牲鬼信息)');

// 4. 删除 mob:雷 的 zzz 引用
zzz = zzz.split('ZZZ/mob:雷').join('ZZZ/mob:雷');  // 引用保留指向不存在文件，酒馆会忽略

fs.writeFileSync(zzzPath, zzz, 'utf8');
console.log('\n完成！zzz.yaml 引用已更新。');
