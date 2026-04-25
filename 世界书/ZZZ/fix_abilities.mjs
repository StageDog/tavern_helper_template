import fs from 'fs';
import path from 'path';

const dir = '/Users/ningqing/Documents/tavern_helper_template/世界书/ZZZ';
const origDir = '/Users/ningqing/Documents/nova-creator-cli/世界书/ZZZ';

// 角色名 → 原始文件名的映射（手动匹配）
const nameToOrigFile = {
    '仪绛': '仪绛.yaml',
    '千夏': '千夏.txt',
    '南宫羽': '南宫羽.yaml',
    '塞西莉亚': '塞西莉亚.yaml',
    '照': '照.yaml',
    '爱芮': '愛芮.yaml',
    '琉音': '琉音.yaml',
    '葉瞬光': '葉瞬光.yaml',
    '葉釋淵': '葉釋淵.yaml',
};

function extractAbilities(content) {
    let trimmed = content.trim();
    
    // JSON格式
    if (trimmed.startsWith('{') || trimmed.startsWith('"')) {
        try {
            let fixed = trimmed;
            if (!fixed.startsWith('{')) fixed = '{' + fixed;
            if (!fixed.endsWith('}')) fixed = fixed + '}';
            fixed = fixed.replace(/\}\s*\{/g, '},{');
            fixed = fixed.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, m => m.replace(/\r?\n/g, '\\n'));
            fixed = fixed.replace(/"\s*\n\s*"/g, '",\n"');
            fixed = fixed.replace(/\]\s*\n\s*"/g, '],\n"');
            fixed = fixed.replace(/\}\s*\n\s*"/g, '},\n"');
            fixed = fixed.replace(/"name":\s*\[\s*"([^"]+)",\s*"description"\s*\]:\s*/g, '"name": "$1", "description": ');
            
            let parsed = eval('[' + fixed + ']');
            let merged = Object.assign({}, ...parsed);
            
            let abilities = merged.special_abilities;
            if (abilities && Array.isArray(abilities)) {
                let lines = [];
                for (let ab of abilities) {
                    if (typeof ab === 'object') {
                        let name = Array.isArray(ab.name) ? ab.name[0] : ab.name;
                        let desc = ab.description || '';
                        if (name && desc) lines.push(`${name}:${desc}`);
                    }
                }
                if (lines.length > 0) return lines.join('\n');
            }
            
            // 尝试中文键名
            let skillObj = merged['技能专长'] || merged['技能专长与强化形态'];
            if (skillObj && typeof skillObj === 'object') {
                let lines = [];
                for (let k in skillObj) {
                    let v = skillObj[k];
                    if (typeof v === 'string') {
                        lines.push(`${k}:${v}`);
                    } else if (typeof v === 'object') {
                        let parts = [];
                        for (let sk in v) parts.push(`${sk}:${v[sk]}`);
                        lines.push(`${k}:${parts.join('。')}`);
                    }
                }
                if (lines.length > 0) return lines.join('\n');
            }
        } catch (e) {}
    }
    
    // YAML格式 - 查找【战斗专长】或【special_abilities】区块
    let lines = content.split('\n');
    let inSection = false;
    let result = [];
    for (let line of lines) {
        let t = line.trim();
        if (t === '【战斗专长】' || t === '【special_abilities】') {
            inSection = true;
            continue;
        }
        if (t.startsWith('【') && t.endsWith('】')) {
            if (inSection) break;
            continue;
        }
        if (inSection && t && !t.includes('[object Object]')) {
            result.push(line);
        }
    }
    if (result.length > 0) return result.join('\n');
    
    return null;
}

// 扫描所有空战斗专长的文件
const files = fs.readdirSync(dir).filter(f => f.startsWith('char:') && f.endsWith('.yaml'));
let fixedCount = 0;

for (let file of files) {
    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    let hasEmptyAbilities = false;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() === '【战斗专长】') {
            if (i + 1 >= lines.length || (lines[i+1].trim().startsWith('【') && lines[i+1].trim().endsWith('】'))) {
                hasEmptyAbilities = true;
            }
            break;
        }
    }
    
    if (!hasEmptyAbilities) continue;
    
    let charName = file.replace('char:', '').replace('.yaml', '');
    
    // 查找原始文件
    let origFileName = nameToOrigFile[charName];
    let origContent = null;
    
    if (origFileName) {
        let origPath = path.join(origDir, origFileName);
        if (fs.existsSync(origPath)) origContent = fs.readFileSync(origPath, 'utf8');
    }
    
    if (!origContent) {
        // 自动搜索
        for (let prefix of ['', '角色：', '角色_ ']) {
            for (let ext of ['.yaml', '.txt']) {
                let p = path.join(origDir, `${prefix}${charName}${ext}`);
                if (fs.existsSync(p)) { origContent = fs.readFileSync(p, 'utf8'); break; }
            }
            if (origContent) break;
        }
    }
    
    if (!origContent) {
        console.log(`❌ ${charName}: 在nova-creator-cli中找不到原始文件`);
        continue;
    }
    
    let recovered = extractAbilities(origContent);
    if (!recovered) {
        console.log(`❌ ${charName}: 无法从原始文件提取战斗专长`);
        continue;
    }
    
    let newLines = [];
    for (let i = 0; i < lines.length; i++) {
        newLines.push(lines[i]);
        if (lines[i].trim() === '【战斗专长】') {
            newLines.push(recovered);
        }
    }
    
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
    fixedCount++;
    console.log(`✅ ${charName}: 战斗专长已恢复！`);
}

console.log(`\n完成！成功恢复 ${fixedCount} 个文件的战斗专长。`);
