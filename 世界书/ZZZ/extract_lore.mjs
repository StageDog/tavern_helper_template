import fs from 'fs';
import path from 'path';

const dir = '/Users/ningqing/Documents/tavern_helper_template/世界书/ZZZ';
const files = fs.readdirSync(dir);
const charFiles = files.filter(f => f.startsWith('char:') && (f.endsWith('.yaml') || f.endsWith('.txt')));

let loreDict = {};
const headersToExtract = ['【背景故事】', '【人际关系】'];
const allMainHeaders = [
    '【基本信息】', '【外貌特征】', '【性格特点】', '【战斗专长】', 
    '【背景故事】', '【人际关系】', '【价值观念】', '【自己的台词语气】', 
    '【附加设定】', '【角色设定】'
];

charFiles.forEach(file => {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    const lines = content.split('\n');
    
    let currentSection = null;
    let extracted = {};
    
    lines.forEach(line => {
        let matchedHeader = headersToExtract.find(h => line.startsWith(h));
        if (matchedHeader) {
            currentSection = matchedHeader;
            extracted[currentSection] = [];
            return;
        }
        
        if (currentSection) {
            if (allMainHeaders.some(h => line.startsWith(h))) {
                currentSection = null;
                return;
            }
            if (line.trim() !== '') {
                extracted[currentSection].push(line);
            }
        }
    });
    
    if (Object.keys(extracted).length > 0) {
        loreDict[file] = {};
        for (let sec in extracted) {
            loreDict[file][sec] = extracted[sec].join('\n');
        }
    }
});

fs.writeFileSync(path.join(dir, 'lore_dump.json'), JSON.stringify(loreDict, null, 2));
console.log(`成功提取 ${charFiles.length} 个角色的背景故事和人际关系，已保存至 lore_dump.json`);
