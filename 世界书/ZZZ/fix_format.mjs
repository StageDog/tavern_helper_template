import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const dir = '/Users/ningqing/Documents/tavern_helper_template/世界书/ZZZ';
const repoRoot = '/Users/ningqing/Documents/tavern_helper_template';

// 英文标题 → 中文标题
const headerMap = {
    '【name】': '【基本信息】',
    '【alias】': null,
    '【appearance】': '【外貌特征】',
    '【personality】': '【性格特点】',
    '【background】': '【背景故事】',
    '【dialogue_examples】': '【自己的台词语气】',
    '【special_abilities】': '【战斗专长】',
    '【relationships】': '【人际关系】',
};

// 英文字段名 → 中文字段名
const fieldMap = {
    'gender': '性别', 'race': '种族', 'hair': '发型', 'eyes': '瞳色',
    'outfit': '服饰风格', 'physique': '体型', 'accessories': '配饰',
    'vibe': '气质描述', 'traits': '性格类型', 'likes': '喜好',
    'dislikes': '厌恶', 'identity': '身份背景', 'achievements': '重要事件',
    'interests': '兴趣爱好', 'current_status': '当前状态',
};

// 从git获取原始txt文件内容
function getGitOriginal(charName) {
    try {
        const gitPath = `世界书/ZZZ/char:${charName}.txt`;
        const content = execSync(`git show HEAD:'${gitPath}'`, { cwd: repoRoot, encoding: 'utf8' });
        return content;
    } catch (e) {
        return null;
    }
}

// 从原始JSON提取special_abilities文本
function extractAbilities(jsonStr) {
    try {
        // 修复多根节点
        let fixed = jsonStr.replace(/\}\s*\{/g, '},{');
        // 修复字符串内换行
        fixed = fixed.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, m => m.replace(/\r?\n/g, '\\n'));
        // 修复缺失逗号
        fixed = fixed.replace(/"\s*\n\s*"/g, '",\n"');
        fixed = fixed.replace(/\]\s*\n\s*"/g, '],\n"');
        fixed = fixed.replace(/\}\s*\n\s*"/g, '},\n"');
        // 修复 ["name", "description"]: 语法
        fixed = fixed.replace(/"name":\s*\[\s*"([^"]+)",\s*"description"\s*\]:\s*/g, '"name": "$1", "description": ');
        
        let parsed;
        try {
            parsed = eval('[' + fixed + ']');
        } catch(e) {
            return null;
        }
        let merged = Object.assign({}, ...parsed);
        
        if (!merged.special_abilities) return null;
        
        let lines = [];
        for (let ab of merged.special_abilities) {
            if (typeof ab === 'object') {
                let name = ab.name;
                if (Array.isArray(name)) name = name[0];
                let desc = ab.description || '';
                if (name && desc) {
                    lines.push(`${name}:${desc}`);
                }
            }
        }
        return lines.length > 0 ? lines.join('\n') : null;
    } catch (e) {
        return null;
    }
}

// 修复关系行: "name:nature:xxx, description:yyy" → "name:xxx - yyy"
function fixRelationshipLine(line) {
    let m = line.match(/^(.+?):nature:(.+?),\s*description:(.+)$/);
    if (m) {
        return `${m[1]}:${m[2]} - ${m[3]}`;
    }
    return line;
}

// ==== 处理有英文标题的文件 ====
const englishHeaderFiles = ['仪绛','千夏','南宫羽','塞西莉亚','照','爱芮','琉音','葉瞬光','葉釋淵'];

let fixedCount = 0;

for (let charName of englishHeaderFiles) {
    const filePath = path.join(dir, `char:${charName}.yaml`);
    if (!fs.existsSync(filePath)) continue;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let lines = content.split('\n');
    let newLines = [];
    let currentSection = '';
    let abilitiesRecovered = false;
    
    // 先尝试从git恢复战斗专长
    let recoveredAbilities = null;
    if (content.includes('[object Object]')) {
        let gitContent = getGitOriginal(charName);
        if (gitContent) {
            recoveredAbilities = extractAbilities(gitContent);
        }
    }
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let trimmed = line.trim();
        
        // 修复标题
        if (trimmed.match(/^【[a-z_]+】$/i)) {
            let mapped = headerMap[trimmed];
            if (mapped === null) {
                // 【alias】的内容合并到上一个标题下
                continue;
            }
            if (mapped) {
                newLines.push(mapped);
                currentSection = mapped;
                continue;
            }
        }
        
        // 处理 [object Object] 行
        if (trimmed.includes('[object Object]')) {
            if (recoveredAbilities) {
                newLines.push(recoveredAbilities);
                abilitiesRecovered = true;
            }
            continue;
        }
        
        // 修复英文字段名
        let fieldMatch = line.match(/^([a-zA-Z_]+):(.*)/);
        if (fieldMatch && fieldMap[fieldMatch[1]]) {
            line = `${fieldMap[fieldMatch[1]]}:${fieldMatch[2]}`;
        }
        
        // 修复关系格式
        if (currentSection === '【人际关系】') {
            line = fixRelationshipLine(line);
        }
        
        // 更新当前区块
        if (trimmed.startsWith('【') && trimmed.endsWith('】')) {
            currentSection = trimmed;
        }
        
        newLines.push(line);
    }
    
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
    fixedCount++;
    console.log(`✅ ${charName}: 标题/字段名已中文化` + (abilitiesRecovered ? ' + 战斗专长已从git恢复' : (content.includes('[object Object]') ? ' ⚠️ 战斗专长git恢复失败' : '')));
}

// ==== 处理千夏（只有[object Object]问题，标题已经是中文的） ====
{
    const filePath = path.join(dir, 'char:千夏.yaml');
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('[object Object]')) {
            let gitContent = getGitOriginal('千夏');
            let recovered = gitContent ? extractAbilities(gitContent) : null;
            if (recovered) {
                content = content.replace(/\[object Object\].*/, recovered);
                fs.writeFileSync(filePath, content, 'utf8');
                console.log('✅ 千夏: 战斗专长已从git恢复');
            } else {
                console.log('⚠️ 千夏: 战斗专长git恢复失败');
            }
            fixedCount++;
        }
    }
}

console.log(`\n修复完成！共处理 ${fixedCount} 个文件。`);
console.log(`\n⚠️ 以下散文式文件需要人工审查，格式差异太大无法自动修复：`);
console.log(`   - char:fairy.yaml`);
console.log(`   - char:拉米尔.yaml`);
console.log(`   - char:格莉丝.yaml`);
console.log(`   - char:浅羽悠真.yaml`);
