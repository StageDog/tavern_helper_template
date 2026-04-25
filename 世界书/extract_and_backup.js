const fs = require('fs');
const path = require('path');

const zzzDir = '/Users/ningqing/Documents/tavern_helper_template/世界书/ZZZ';
const backupDir = '/Users/ningqing/Documents/tavern_helper_template/世界书/backup_chars_skills';
const outputJson = '/Users/ningqing/Documents/tavern_helper_template/世界书/skills_to_rewrite.json';

// Create backup directory
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const files = fs.readdirSync(zzzDir);
const extractionData = [];

for (const file of files) {
  if (file.startsWith('char:')) {
    const srcPath = path.join(zzzDir, file);
    const destPath = path.join(backupDir, file);
    
    // Backup the file
    fs.copyFileSync(srcPath, destPath);

    const content = fs.readFileSync(srcPath, 'utf8');
    
    // Extract info using basic string matching since it's formatted text
    // Example format:
    // 【基本信息】
    // 姓名:賽斯·洛威爾
    // 別号:永遠不死
    // ...
    // 【技能专长】
    // 普通攻擊:熱身火花／火力鎮壓...
    
    let nameMatch = content.match(/姓名:(.*)/);
    let weaponMatch = content.match(/武器:(.*)/);
    let factionMatch = content.match(/所属:(.*)/);
    let elementMatch = content.match(/属性:(.*)/);
    
    let skillsMatch = content.match(/【技能专长】\n([\s\S]*?)(?=\n【|$)/);
    
    if (skillsMatch) {
      extractionData.push({
        file: file,
        name: nameMatch ? nameMatch[1].trim() : 'Unknown',
        weapon: weaponMatch ? weaponMatch[1].trim() : 'Unknown',
        faction: factionMatch ? factionMatch[1].trim() : 'Unknown',
        element: elementMatch ? elementMatch[1].trim() : 'Unknown',
        skills: skillsMatch[1].trim()
      });
    }
  }
}

fs.writeFileSync(outputJson, JSON.stringify(extractionData, null, 2), 'utf8');
console.log(`Backed up files to ${backupDir}`);
console.log(`Extracted ${extractionData.length} character skills to ${outputJson}`);
