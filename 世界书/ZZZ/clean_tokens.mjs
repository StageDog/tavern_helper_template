import fs from 'fs';
import path from 'path';

const dir = '/Users/ningqing/Documents/tavern_helper_template/世界书/ZZZ';
const files = fs.readdirSync(dir).filter(f => f.startsWith('char:') && f.endsWith('.yaml'));

let modifiedCount = 0;

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    let lines = content.split('\n');
    let newLines = [];
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // 彻底删除这些浪费 Token 的行
        if (line.includes('暂无记录（待在沙盒RP中经历与探索）') || line.includes('暂无记录(待在沙盒RP中经历与探索)')) {
            continue;
        }
        
        newLines.push(line);
    }
    
    // 第二遍扫描：清理可能变成空壳的区块标题（比如【人际关系】下面全被删光了，那这个标题也没必要留着）
    let finalLines = [];
    for (let i = 0; i < newLines.length; i++) {
        let line = newLines[i];
        if (line.trim().startsWith('【') && line.trim().endsWith('】')) {
            // 如果下一行也是标题，或者已经是文件末尾，说明这个区块是空的，直接丢弃
            if (i + 1 === newLines.length || (newLines[i+1].trim().startsWith('【') && newLines[i+1].trim().endsWith('】'))) {
                continue;
            }
        }
        finalLines.push(line);
    }
    
    let newContent = finalLines.join('\n');
    if (newContent !== originalContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        modifiedCount++;
    }
});

console.log(`Token 极致优化完成！成功在 ${modifiedCount} 个角色文件中删除了冗余的废话描述，清空了空壳区块，释放了海量上下文空间！`);
