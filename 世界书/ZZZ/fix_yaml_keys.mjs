import fs from 'fs';
import path from 'path';

const dir = '/Users/ningqing/Documents/tavern_helper_template/世界书/ZZZ';
const files = fs.readdirSync(dir).filter(f => f.startsWith('char:') && f.endsWith('.yaml'));

// "Implicit keys need to be on a single line" 的真正原因：
// 在 YAML 中，如果一行的值部分包含冒号后跟空格，解析器会认为这是嵌套的key
// 但我们的格式不是标准YAML，而是简化的 key:value 格式
// 真正的问题是某些行太长（超过1024字符），YAML解析器会报这个错

let totalFixed = 0;

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let lines = content.split('\n');
    let issues = [];
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        // 检查超长行（YAML限制隐式key不超过1024字符）
        if (line.length > 1024) {
            issues.push({ line: i + 1, len: line.length, preview: line.substring(0, 60) + '...' });
        }
        // 检查 name: 后面跟了多行的模式（key跨行）
        if (line.match(/^name:\s/) && i + 1 < lines.length && !lines[i+1].match(/^[\s]*[【\w]/) && !lines[i+1].includes(':')) {
            issues.push({ line: i + 1, len: 0, preview: `name行后跟裸文本: "${lines[i+1].substring(0,40)}"` });
        }
    }
    
    if (issues.length > 0) {
        console.log(`⚠️  ${file}:`);
        issues.forEach(iss => {
            console.log(`   行 ${iss.line}: ${iss.len > 0 ? `长度=${iss.len}` : ''} ${iss.preview}`);
        });
    }
});
