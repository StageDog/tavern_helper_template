import fs from 'fs';
import path from 'path';

const dir = '/Users/ningqing/Documents/tavern_helper_template/世界书/ZZZ';
const zzzYamlPath = path.join(dir, '../zzz.yaml');

// 1. 找到所有蓝灯条目引用的文件
let zzzContent = fs.readFileSync(zzzYamlPath, 'utf8');
let lines = zzzContent.split('\n');
let blueLightFiles = new Set();
let isBlueLight = false;

for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (line.match(/^\s+-\s+名称:/)) {
        isBlueLight = false;
    } else if (line === '类型: 蓝灯') {
        isBlueLight = true;
    } else if (line.startsWith('文件: ZZZ/') && isBlueLight) {
        let filename = line.replace('文件: ZZZ/', '') + '.yaml';
        blueLightFiles.add(filename);
    }
}

console.log(`找到了 ${blueLightFiles.size} 个被蓝灯引用的文件，将跳过它们。`);

// 2. 获取所有文件
const files = fs.readdirSync(dir).filter(f => f.endsWith('.yaml'));

let renameMap = {};

function categorize(filename, content) {
    const contentStr = content.toLowerCase();
    
    // 检查关键字
    if (filename.includes('组织') || filename.includes('势力') || filename.includes('公司') || filename.includes('帮') || filename.includes('小队') || filename.includes('特勤组') || filename.includes('屋') || filename.includes('重工')) {
        return 'fac:';
    }
    if (contentStr.includes('势力') || contentStr.includes('阵营') || contentStr.includes('组织') || contentStr.includes('公司') || contentStr.includes('集团')) {
        if (!contentStr.includes('性别:') && !contentStr.includes('地点') && !contentStr.includes('区域')) return 'fac:';
    }
    
    if (filename.includes('街') || filename.includes('广场') || filename.includes('港') || filename.includes('镇') || filename.includes('空洞') || filename.includes('山') || filename.includes('前哨')) {
        return 'loc:';
    }
    if (contentStr.includes('地点') || contentStr.includes('区域') || contentStr.includes('城市') || contentStr.includes('场景')) {
        if (!contentStr.includes('性别:')) return 'loc:';
    }
    
    if (filename.includes('以骸') || filename.includes('侵蚀体') || filename.includes('屠夫') || contentStr.includes('以骸') || contentStr.includes('怪物')) {
        if (!contentStr.includes('性别:')) return 'mob:';
    }
    
    if (contentStr.includes('设定') || contentStr.includes('世界观') || contentStr.includes('现象') || contentStr.includes('概念') || filename.includes('历史') || filename.includes('综合症')) {
        return 'lore:';
    }
    
    if (contentStr.includes('物品') || contentStr.includes('装备') || contentStr.includes('武器') || filename.includes('可乐') || filename.includes('匕首')) {
        if (!contentStr.includes('性别:')) return 'item:';
    }
    
    if (contentStr.includes('性别:') || contentStr.includes('外貌特征') || contentStr.includes('年龄:') || contentStr.includes('职业:')) {
        return 'npc:';
    }
    
    return 'uncategorized:';
}

for (let file of files) {
    if (file.startsWith('char:') || file.startsWith('story:') || file.startsWith('[')) continue;
    if (blueLightFiles.has(file)) continue;
    if (file === '【场景】星环.yaml') {
        renameMap[file] = 'loc:星环.yaml';
        continue;
    }
    if (file.startsWith('---') && file.endsWith('---.yaml')) {
        // 去除多余的破折号
        let cleanName = file.replace(/^-+|-+\.yaml$/g, '');
        renameMap[file] = categorize(cleanName, fs.readFileSync(path.join(dir, file), 'utf8')) + cleanName + '.yaml';
        continue;
    }
    
    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const prefix = categorize(file, content);
    
    // 生成新文件名
    renameMap[file] = prefix + file;
}

const logDir = path.join(dir, 'log');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}
const mapPath = path.join(logDir, 'rename_map.json');
fs.writeFileSync(mapPath, JSON.stringify(renameMap, null, 2), 'utf8');

console.log(`\n已生成自动分类映射表：${mapPath}`);
console.log(`共有 ${Object.keys(renameMap).length} 个文件待重命名。`);
console.log(`\n分类统计：`);
let counts = {};
Object.values(renameMap).forEach(v => {
    let p = v.split(':')[0] + ':';
    counts[p] = (counts[p] || 0) + 1;
});
console.log(counts);
