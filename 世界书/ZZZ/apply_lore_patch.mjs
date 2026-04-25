import fs from 'fs';
import path from 'path';

const dir = '/Users/ningqing/Documents/tavern_helper_template/世界书/ZZZ';
const files = fs.readdirSync(dir);
const charFiles = files.filter(f => f.startsWith('char:') && (f.endsWith('.yaml') || f.endsWith('.txt')));

// 核心剧透关键词（包含简繁体）
// 只要包含这些词，说明该事件一定有主角（你）的参与，属于未发生的沙盒主线/支线剧情
const spoilerKeywords = [
    '法厄同', '绳匠', '繩匠', '玩家', '主角', '哲', '铃', '鈴',
    '委托', '委託', '代理人', '邀约', '邀約', '主线', '主線', 
    '秘闻', '秘聞', '纪事', '紀事', '视界', '視界'
];

// 历史背景事件白名单（这些是绝对的历史往事，塑造了角色性格，绝不能删）
const safeEvents = ['旧都陷落', '舊都陷落', '阿苟思空洞', '阿苟思', '白银计划', '白銀計畫', '鬼族战争'];

let modifiedCount = 0;

charFiles.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 按行处理
    const lines = content.split('\n');
    let newLines = [];
    
    let currentBlock = false;
    let currentBlockName = '';
    let currentBlockLines = [];
    
    // 我们只对这四个最容易包含剧透的字段动刀
    const targetFields = ['重要事件:', '刻骨铭心的往事:', '人生转折点:', '心路历程:'];
    
    const processBlock = () => {
        if (!currentBlock) return;
        
        if (targetFields.includes(currentBlockName)) {
            let blockText = currentBlockLines.join('\n');
            let isSpoiler = false;
            
            // 1. 关键词检测：是否包含主角或委托
            for (let kw of spoilerKeywords) {
                if (blockText.includes(kw)) {
                    isSpoiler = true;
                    break;
                }
            }
            
            // 2. 命名事件检测：如果包含了《》、「」、『』或【】包裹的“事件”，且不在白名单内，通常是游戏的主线章节
            if (!isSpoiler) {
                let eventMatch = blockText.match(/[「『【《]([^」』】》]+)[」』】》]事件/);
                if (eventMatch) {
                    let evt = eventMatch[1];
                    let isSafe = safeEvents.some(se => evt.includes(se));
                    if (!isSafe) {
                        isSpoiler = true;
                    }
                }
            }
            
            // 执行替换或保留
            if (isSpoiler) {
                // 不删除字段名，而是用中立的沙盒描述替换，彻底抹除剧透，同时省下大量 Token
                newLines.push(`${currentBlockName}暂无记录（待在沙盒RP中经历与探索）`);
            } else {
                newLines.push(...currentBlockLines);
            }
        } else {
            newLines.push(...currentBlockLines);
        }
        
        currentBlock = false;
        currentBlockName = '';
        currentBlockLines = [];
    };
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        let isNewField = false;
        let matchedField = '';
        
        // 匹配 YAML 键名 (例如 "出生背景:" 或 "【背景故事】")
        if (line.match(/^[^\s]+:/)) {
            isNewField = true;
            matchedField = line.match(/^([^\s]+:)/)[1];
        } else if (line.startsWith('【')) {
            isNewField = true;
            matchedField = line;
        }
        
        if (isNewField) {
            processBlock();
            currentBlock = true;
            currentBlockName = matchedField;
            currentBlockLines.push(line);
        } else {
            if (currentBlock) {
                currentBlockLines.push(line);
            } else {
                newLines.push(line);
            }
        }
    }
    processBlock(); // 处理最后一块
    
    let newContent = newLines.join('\n');
    if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        modifiedCount++;
    }
});

console.log(`手术完成！成功清理了 ${modifiedCount} 个角色文件中的未发生剧透，并保留了所有历史背景！`);
