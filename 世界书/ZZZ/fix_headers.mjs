import fs from 'fs';
import path from 'path';

const dir = '/Users/ningqing/Documents/tavern_helper_template/世界书/ZZZ';
const files = fs.readdirSync(dir).filter(f => f.startsWith('char:') && f.endsWith('.yaml'));

let fixedCount = 0;

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let lines = content.split('\n');
    
    // 检查是否以 "name: xxx" 开头（而非 【基本信息】）
    if (!lines[0].trim().startsWith('name:')) return;
    
    let charName = lines[0].replace('name:', '').trim();
    
    // 找到第一个 【xxx】 标题的位置
    let firstHeaderIdx = -1;
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim().startsWith('【') && lines[i].trim().endsWith('】')) {
            firstHeaderIdx = i;
            break;
        }
    }
    
    if (firstHeaderIdx === -1) return;
    
    // 收集 name 和第一个标题之间的"孤儿行"（别号等）
    let orphanLines = [];
    for (let i = 1; i < firstHeaderIdx; i++) {
        let t = lines[i].trim();
        if (t) orphanLines.push(t);
    }
    
    // 构建新的开头
    let newHeader = ['【基本信息】', `姓名:${charName}`];
    if (orphanLines.length > 0) {
        newHeader.push(`别号:${orphanLines.join('、')}`);
    }
    
    // 接下来检查【外貌特征】下面是否有应该在【基本信息】里的字段
    // (性别、种族、年龄、籍贯、生日、血型、职业 等应该在基本信息里)
    let basicInfoFields = ['性别', '种族', '年龄', '籍贯', '生日', '血型', '职业', '所属', '属性', '武器'];
    
    // 从第一个标题开始，如果是【外貌特征】，把基本信息字段移上来
    let restLines = lines.slice(firstHeaderIdx);
    let movedFields = [];
    
    if (restLines[0].trim() === '【外貌特征】') {
        let newRestLines = [restLines[0]]; // 保留 【外貌特征】
        for (let i = 1; i < restLines.length; i++) {
            let line = restLines[i];
            let fieldName = line.split(':')[0].trim();
            
            if (basicInfoFields.includes(fieldName)) {
                movedFields.push(line);
            } else {
                newRestLines.push(line);
            }
            
            // 如果碰到下一个标题，停止检查
            if (i > 0 && restLines[i].trim().startsWith('【') && restLines[i].trim().endsWith('】')) {
                // 把剩下的全部加上
                newRestLines.push(...restLines.slice(i + 1));
                break;
            }
        }
        restLines = newRestLines;
    }
    
    // 把移出的基本信息字段加到header下面
    newHeader.push(...movedFields);
    
    // 组合最终内容
    let newContent = [...newHeader, ...restLines].join('\n');
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    fixedCount++;
    console.log(`✅ ${file}: name:${charName} → 【基本信息】姓名:${charName}` + (movedFields.length > 0 ? ` (移入${movedFields.length}个字段)` : ''));
});

console.log(`\n完成！修复了 ${fixedCount} 个文件的开头格式。`);
