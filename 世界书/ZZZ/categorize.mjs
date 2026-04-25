import fs from 'fs';
import path from 'path';

const dir = '/Users/ningqing/Documents/tavern_helper_template/世界书/ZZZ';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.yaml'));

let categories = {
    'fac:': [],
    'loc:': [],
    'npc:': [],
    'mob:': [],   // 怪物/以骸
    'lore:': [],  // 世界观设定
    'item:': [],  // 物品/装备
    'char:': [],  // 已经分好类的角色
    'story:': [], // 已经分好类的故事
    'uncategorized:': []
};

// 简单的启发式分类函数
function categorize(filename, content) {
    if (filename.startsWith('char:')) return 'char:';
    if (filename.startsWith('story:')) return 'story:';
    if (filename.startsWith('[')) return 'uncategorized:'; // 忽略系统文件
    
    const contentStr = content.toLowerCase();
    
    // 检查关键字
    if (filename.includes('组织') || filename.includes('势力') || filename.includes('公司') || filename.includes('帮') || filename.includes('小队') || filename.includes('特勤组') || filename.includes('屋') || filename.includes('重工')) {
        return 'fac:';
    }
    if (contentStr.includes('势力') || contentStr.includes('阵营') || contentStr.includes('组织') || contentStr.includes('公司') || contentStr.includes('集团')) {
        // Double check it's not a location or character
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
    
    // 如果包含性别、年龄等，且不是char，那很可能是npc
    if (contentStr.includes('性别:') || contentStr.includes('外貌特征') || contentStr.includes('年龄:') || contentStr.includes('职业:')) {
        return 'npc:';
    }
    
    return 'uncategorized:';
}

for (let file of files) {
    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const cat = categorize(file, content);
    categories[cat].push(file);
}

// 打印分类结果
for (let cat in categories) {
    if (cat === 'char:' || cat === 'story:') continue;
    console.log(`\n=== ${cat} (${categories[cat].length} 个文件) ===`);
    console.log(categories[cat].join(', '));
}
