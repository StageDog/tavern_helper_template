import fs from 'fs';
import path from 'path';

const dir = '/Users/ningqing/Documents/tavern_helper_template/世界书/ZZZ';
const files = fs.readdirSync(dir).filter(f => f.startsWith('char:') && f.endsWith('.yaml'));

let convertedCount = 0;

// Helper to convert JSON sections to YAML lines
function mapJsonToYaml(json) {
    let lines = [];
    
    if (json.name || json.alias) {
        lines.push('【基本信息】');
        if (json.name) {
            let nameVal = Array.isArray(json.name) ? json.name[0] : json.name;
            lines.push(`姓名:${nameVal}`);
        }
        if (json.alias) {
            let aliasVal = Array.isArray(json.alias) ? json.alias.join('、') : json.alias;
            lines.push(`别号:${aliasVal}`);
        }
        if (json.gender) lines.push(`性别:${json.gender}`);
        if (json.appearance && json.appearance.gender) lines.push(`性别:${json.appearance.gender}`);
    }
    
    if (json.appearance) {
        lines.push('【外貌特征】');
        for (let k in json.appearance) {
            let v = json.appearance[k];
            if (k === 'gender') continue; // already handled
            let kName = k === 'hair' ? '发型' : k === 'eyes' ? '瞳色' : k === 'outfit' ? '服饰风格' : k === 'physique' ? '体型' : k === 'accessories' ? '配饰' : k === 'vibe' ? '气质描述' : k;
            if (Array.isArray(v)) lines.push(`${kName}:${v.join('、')}`);
            else lines.push(`${kName}:${v}`);
        }
    }
    
    if (json.personality) {
        lines.push('【性格特点】');
        for (let k in json.personality) {
            let v = json.personality[k];
            let kName = k === 'traits' ? '性格类型' : k === 'likes' ? '喜好' : k === 'dislikes' ? '厌恶' : k;
            if (Array.isArray(v)) lines.push(`${kName}:${v.join('、')}`);
            else lines.push(`${kName}:${v}`);
        }
    }
    
    if (json.special_abilities) {
        lines.push('【战斗专长】');
        if (Array.isArray(json.special_abilities)) {
            for (let ab of json.special_abilities) {
                if (ab.name && ab.description) {
                    let nameVal = Array.isArray(ab.name) ? ab.name[0] : ab.name;
                    lines.push(`${nameVal}:${ab.description}`);
                }
            }
        }
    }
    
    if (json.background) {
        lines.push('【背景故事】');
        for (let k in json.background) {
            let v = json.background[k];
            let kName = k === 'identity' ? '身份背景' : k === 'achievements' ? '重要事件' : k === 'interests' ? '兴趣爱好' : k === 'current_status' ? '当前状态' : k;
            if (Array.isArray(v)) lines.push(`${kName}:${v.join(' / ')}`);
            else lines.push(`${kName}:${v}`);
        }
    }
    
    if (json.relationships) {
        lines.push('【人际关系】');
        for (let k in json.relationships) {
            let rel = json.relationships[k];
            if (typeof rel === 'object') {
                lines.push(`${k}:${rel.nature || ''} - ${rel.description || ''}`);
            } else {
                lines.push(`${k}:${rel}`);
            }
        }
    }
    
    if (json.dialogue_examples) {
        lines.push('【自己的台词语气】');
        for (let k in json.dialogue_examples) {
            lines.push(`${k}:${json.dialogue_examples[k]}`);
        }
    }
    
    return lines.join('\n');
}

function fixJsonString(str) {
    // Escape raw newlines inside strings to prevent parsing errors
    str = str.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, function(match) {
        return match.replace(/\r?\n/g, '\\n');
    });

    // Basic structural fixes for missing commas
    str = str.replace(/"\s*\n\s*"/g, '",\n"');
    str = str.replace(/\]\s*\n\s*"/g, '],\n"');
    str = str.replace(/\}\s*\n\s*"/g, '},\n"');
    
    // Fix multiple root JSON objects (e.g. }\n{ ) by turning them into an array of objects
    str = str.replace(/\}\s*\{/g, '},{');
    
    // Fix specific typo: "name": ["般岳", "alias"]: [
    str = str.replace(/"name":\s*\[\s*"([^"]+)",\s*"alias"\s*\]:\s*\[/, '"name": "$1",\n  "alias": [');
    
    // Fix edge case array description syntax: "name": ["命破·火", "description"]: "..."
    str = str.replace(/"name":\s*\[\s*"([^"]+)",\s*"description"\s*\]:\s*/g, '"name": "$1",\n"description": ');

    // Remove standalone control chars like İŞÇİ
    str = str.replace(/İŞÇİ/g, '');

    return str;
}

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let trimmed = content.trim();

    if (trimmed.startsWith('{') || trimmed.startsWith('"name"')) {
        let jsonObj = null;
        let isJson = false;
        
        let jsonStr = trimmed;
        if (!jsonStr.startsWith('{')) jsonStr = '{' + jsonStr;
        if (!jsonStr.endsWith('}')) jsonStr = jsonStr + '}';
        
        jsonStr = fixJsonString(jsonStr);
        
        try {
            // 使用 eval 来实现最大程度的容错（允许单引号、省略键引号、尾随逗号等）
            let parsedArr = eval('[' + jsonStr + ']');
            // 将多个根节点对象合并为一个完整的对象
            jsonObj = Object.assign({}, ...parsedArr);
            isJson = true;
        } catch (err) {
            console.error(`无法解析 JSON 文件: ${file} | 错误: ${err.message}`);
        }

        if (isJson && jsonObj) {
            let yamlContent = mapJsonToYaml(jsonObj);
            fs.writeFileSync(filePath, yamlContent, 'utf8');
            convertedCount++;
        }
    }
});

console.log(`成功将 ${convertedCount} 个原本是残缺 JSON 格式的角色文件修复并转换为标准的 YAML 格式！`);
