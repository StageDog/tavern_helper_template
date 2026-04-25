import fs from 'fs';
import path from 'path';

const dir = '/Users/ningqing/Documents/tavern_helper_template/世界书/ZZZ';
const files = fs.readdirSync(dir).filter(f => f.startsWith('char:') && f.endsWith('.yaml'));

let emptyFiles = [];
let jsonFiles = [];
let okFiles = 0;

files.forEach(file => {
    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, 'utf8').trim();
    
    if (content.length === 0) {
        emptyFiles.push(file);
    } else if (content.startsWith('{') || content.startsWith('"')) {
        jsonFiles.push(file);
    } else {
        okFiles++;
    }
});

console.log(`\n=== 角色文件健康检查报告 ===`);
console.log(`✅ 格式正常的 YAML 文件: ${okFiles} 个`);
console.log(`\n❌ 内容为空的文件 (${emptyFiles.length} 个):`);
emptyFiles.forEach(f => console.log(`   - ${f}`));
console.log(`\n⚠️  仍为 JSON 格式的文件 (${jsonFiles.length} 个):`);
jsonFiles.forEach(f => console.log(`   - ${f}`));
