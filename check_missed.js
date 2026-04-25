const fs = require('fs');
const path = require('path');
const dir = '/Users/ningqing/Documents/tavern_helper_template/世界书/ZZZ';
const files = fs.readdirSync(dir).filter(f => f.startsWith('char:') && (f.endsWith('.yaml') || f.endsWith('.txt')));
const spoilerKeywords = ['法厄同', '绳匠', '主角', '玩家', '哲', '铃', '委托', '代理人', '邀约', '主线'];
let missed = [];
files.forEach(f => {
  let content = fs.readFileSync(path.join(dir, f), 'utf8');
  if (content.includes('暂无记录（待在沙盒RP中经历与探索）')) return; // already patched
  let hasSpoiler = spoilerKeywords.some(kw => content.includes(kw));
  if (hasSpoiler) missed.push(f);
});
console.log("Missed files:", missed);
