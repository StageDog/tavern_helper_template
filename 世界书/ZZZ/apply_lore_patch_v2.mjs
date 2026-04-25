import fs from 'fs';
import path from 'path';

const dir = '/Users/ningqing/Documents/tavern_helper_template/世界书/ZZZ';
const files = fs.readdirSync(dir).filter(f => f.startsWith('char:') && f.endsWith('.yaml'));

// 更加精准的剧透关键词，去除了“哲”、“铃”、“代理人”等容易误伤的单字/通用词
const spoilerKeywords = [
    '法厄同', '绳匠', '繩匠', '玩家', '主角',
    '委托', '委託', '邀约', '邀約', '主线', '主線',
    '代理人秘闻', '代理人秘聞', '纪事', '紀事', '独家视界', '獨家視界', '同行'
];

const safeEvents = ['旧都陷落', '舊都陷落', '阿苟思空洞', '阿苟思', '白银计划', '白銀計畫', '鬼族战争'];

// 需要进行逐行剧透扫描的区块
const targetSections = ['【性格特点】', '【战斗专长】', '【背景故事】', '【人际关系】', '【价值观念】', '【自己的台词语气】'];

let modifiedCount = 0;

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    let lines = content.split('\n');
    let newLines = [];
    let currentSection = '';
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // 更新当前所在的区块
        if (line.startsWith('【') && line.endsWith('】')) {
            currentSection = line.trim();
            newLines.push(line);
            continue;
        }
        
        // 如果当前不在目标区块，原样保留
        if (!targetSections.includes(currentSection)) {
            newLines.push(line);
            continue;
        }
        
        // 如果这行本来就是中立描述，跳过处理
        if (line.includes('暂无记录（待在沙盒RP中经历与探索）')) {
            newLines.push(line);
            continue;
        }
        
        let isSpoiler = false;
        
        // 1. 关键词扫描
        for (let kw of spoilerKeywords) {
            if (line.includes(kw)) {
                isSpoiler = true;
                break;
            }
        }
        
        // 2. 命名事件扫描
        if (!isSpoiler) {
            let m1 = line.match(/[「『【《]([^」』】》]+)[」』】》]事件/);
            let m2 = line.match(/[「『【《]([^」』】》]*事件)[」』】》]/);
            let evt = (m1 && m1[1]) || (m2 && m2[1]);
            
            if (evt) {
                let isSafe = safeEvents.some(se => evt.includes(se));
                if (!isSafe) {
                    isSpoiler = true;
                }
            }
        }
        
        // 3. 执行替换
        if (isSpoiler) {
            // 尝试分离 键 和 值
            let match = line.match(/^([^:：]+)[:：](.*)$/);
            if (match) {
                let key = match[1];
                // 保留键，将值替换为中立描述
                newLines.push(`${key}:暂无记录（待在沙盒RP中经历与探索）`);
            } else {
                // 如果没有冒号（可能是多行文本），整行替换
                newLines.push(`暂无记录（待在沙盒RP中经历与探索）`);
            }
        } else {
            newLines.push(line);
        }
    }
    
    let newContent = newLines.join('\n');
    if (newContent !== originalContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        modifiedCount++;
    }
});

console.log(`全领域瘦身手术完成！成功在 ${modifiedCount} 个角色文件的战斗专长、人际关系等全部区块中清除了未发生剧透！`);
