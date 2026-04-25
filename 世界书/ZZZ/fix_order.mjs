import fs from 'fs';

const filePath = '/Users/ningqing/Documents/tavern_helper_template/世界书/zzz.yaml';
let content = fs.readFileSync(filePath, 'utf8');
let lines = content.split('\n');

let fixedCount = 0;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('文件: ZZZ/char:')) {
        for (let j = i - 1; j >= Math.max(0, i - 100); j--) {
            if (lines[j].match(/^\s+-\s+名称:/) && j < i - 1) break;
            let m = lines[j].match(/^(\s+)顺序: (\d+)/);
            if (m && m[2] !== '100') {
                lines[j] = `${m[1]}顺序: 100`;
                fixedCount++;
                break;
            } else if (m && m[2] === '100') {
                break;
            }
        }
    }
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log(`完成！将 ${fixedCount} 个角色条目的插入顺序改为 100。`);
