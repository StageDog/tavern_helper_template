import fs from 'fs';
import path from 'path';

const dir = '/Users/ningqing/Documents/tavern_helper_template/世界书/ZZZ';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.txt'));

let convertedCount = 0;
let renamedCount = 0;

// Helper to convert JSON sections to YAML lines
function mapJsonToYaml(json) {
    let lines = [];
    
    if (json.name || json.alias) {
        lines.push('【基本信息】');
        if (json.name) lines.push(`姓名:${json.name}`);
        if (json.alias && Array.isArray(json.alias)) lines.push(`别号:${json.alias.join('、')}`);
        if (json.gender) lines.push(`性别:${json.gender}`);
    }
    
    if (json.appearance) {
        lines.push('【外貌特征】');
        for (let k in json.appearance) {
            let v = json.appearance[k];
            let kName = k === 'gender' ? '性别' : k === 'hair' ? '发型' : k === 'eyes' ? '瞳色' : k === 'outfit' ? '服饰风格' : k === 'physique' ? '体型' : k === 'accessories' ? '配饰' : k === 'vibe' ? '气质描述' : k;
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
                    lines.push(`${ab.name}:${ab.description}`);
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

files.forEach(file => {
    // Skip scripts, settings or meta files
    if (file.startsWith('[') || file.endsWith('.js') || file.endsWith('.mjs')) return;
    
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    const baseName = file.substring(0, file.lastIndexOf('.'));
    const newFilePath = path.join(dir, `${baseName}.yaml`);

    let isJson = false;
    let jsonObj = null;
    let trimmed = content.trim();

    if (trimmed.startsWith('{') || trimmed.startsWith('"name"')) {
        try {
            if (trimmed.startsWith('"name"')) {
                jsonObj = JSON.parse('{' + trimmed + '}');
            } else {
                jsonObj = JSON.parse(trimmed);
            }
            isJson = true;
        } catch (e) {
            try {
                let fixed = trimmed.replace(/"name": \["([^"]+)", "alias"\]: \[/, '"name": "$1",\n  "alias": [');
                jsonObj = JSON.parse('{' + fixed + '}');
                isJson = true;
            } catch (err) {
                // Not valid json
            }
        }
    }

    if (isJson && jsonObj) {
        // Map to YAML
        let yamlContent = mapJsonToYaml(jsonObj);
        fs.writeFileSync(newFilePath, yamlContent, 'utf8');
        fs.unlinkSync(filePath);
        convertedCount++;
    } else {
        // It's already YAML disguised as TXT, just rename it
        fs.writeFileSync(newFilePath, content, 'utf8');
        fs.unlinkSync(filePath);
        renamedCount++;
    }
});

console.log(`格式统一完成！`);
console.log(`- 修复并转换为 YAML 格式的 JSON 角色：${convertedCount} 个`);
console.log(`- 直接重命名为 .yaml 的文件：${renamedCount} 个`);
