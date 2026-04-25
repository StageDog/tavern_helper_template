import fs from 'fs';
import path from 'path';

const dir = '/Users/ningqing/Documents/tavern_helper_template/世界书/ZZZ';
const files = fs.readdirSync(dir).filter(f => f.startsWith('char:') && f.endsWith('.yaml'));

// 正确的中文标题集合
const correctHeaders = ['【基本信息】','【外貌特征】','【性格特点】','【战斗专长】','【背景故事】','【人际关系】','【价值观念】','【自己的台词语气】'];

// 英文标题 -> 中文标题的映射
const headerMap = {
    '【name】': '【基本信息】',
    '【alias】': null, // 合并到基本信息
    '【appearance】': '【外貌特征】',
    '【personality】': '【性格特点】',
    '【background】': '【背景故事】',
    '【dialogue_examples】': '【自己的台词语气】',
    '【special_abilities】': '【战斗专长】',
    '【relationships】': '【人际关系】',
};

// 英文字段名 -> 中文字段名的映射
const fieldMap = {
    'gender': '性别',
    'race': '种族',
    'hair': '发型',
    'eyes': '瞳色',
    'outfit': '服饰风格',
    'physique': '体型',
    'accessories': '配饰',
    'vibe': '气质描述',
    'traits': '性格类型',
    'likes': '喜好',
    'dislikes': '厌恶',
    'identity': '身份背景',
    'achievements': '重要事件',
    'interests': '兴趣爱好',
    'current_status': '当前状态',
};

let issues = [];

files.forEach(file => {
    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let fileIssues = [];
    
    // 检查1: 英文标题
    let hasEnglishHeaders = false;
    for (let line of lines) {
        let trimmed = line.trim();
        if (trimmed.match(/^【[a-z_]+】$/i)) {
            hasEnglishHeaders = true;
            break;
        }
    }
    if (hasEnglishHeaders) fileIssues.push('英文标题');
    
    // 检查2: [object Object] 垃圾数据
    if (content.includes('[object Object]')) fileIssues.push('[object Object]垃圾');
    
    // 检查3: 完全没有标题（散文格式）
    let hasAnyHeader = lines.some(l => l.trim().startsWith('【') && l.trim().endsWith('】'));
    if (!hasAnyHeader) fileIssues.push('无标题结构(散文式)');
    
    // 检查4: 英文字段名
    let hasEnglishFields = false;
    for (let line of lines) {
        let m = line.match(/^([a-zA-Z_]+):/);
        if (m && fieldMap[m[1]]) {
            hasEnglishFields = true;
            break;
        }
    }
    if (hasEnglishFields) fileIssues.push('英文字段名');
    
    // 检查5: Tab分隔符（如格莉丝格式）
    if (content.includes('\t')) fileIssues.push('Tab分隔');
    
    // 检查6: nature:/description: 子字段
    if (content.match(/nature:[^,]+, description:/)) fileIssues.push('nature/description子字段');
    
    if (fileIssues.length > 0) {
        issues.push({ file, issues: fileIssues });
    }
});

console.log(`\n=== 格式规范性检查报告 ===`);
console.log(`✅ 格式完全规范: ${files.length - issues.length} 个`);
console.log(`⚠️  需要修复: ${issues.length} 个\n`);
issues.forEach(({file, issues: iss}) => {
    console.log(`  ${file}`);
    iss.forEach(i => console.log(`    ❌ ${i}`));
});
