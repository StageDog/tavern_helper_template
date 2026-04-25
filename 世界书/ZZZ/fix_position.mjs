import fs from 'fs';

const filePath = '/Users/ningqing/Documents/tavern_helper_template/世界书/zzz.yaml';
let content = fs.readFileSync(filePath, 'utf8');
let lines = content.split('\n');

let fixedCount = 0;
let alreadyCorrect = 0;

// 所有可能的插入位置类型
const positionTypes = ['角色定义之后', '作者注释之前', '作者注释之后', '指定深度'];

for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    if (line.startsWith('文件: ZZZ/char:')) {
        let found = false;
        for (let j = i - 1; j >= Math.max(0, i - 100); j--) {
            if (lines[j].match(/^\s+-\s+名称:/) && j < i - 1) break;
            
            let trimJ = lines[j].trim();
            
            if (trimJ === '类型: 角色定义之前') {
                alreadyCorrect++;
                found = true;
                break;
            }
            
            for (let pt of positionTypes) {
                if (trimJ === `类型: ${pt}`) {
                    lines[j] = lines[j].replace(`类型: ${pt}`, '类型: 角色定义之前');
                    fixedCount++;
                    found = true;
                    break;
                }
            }
            if (found) break;
        }
        if (!found) {
            let charName = line.replace('文件: ZZZ/char:', '');
            console.log(`⚠️  ${charName}: 未找到插入位置配置`);
        }
    }
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log(`\n完成！修改了 ${fixedCount} 个角色条目为「角色定义之前」，${alreadyCorrect} 个已经是正确的。`);
