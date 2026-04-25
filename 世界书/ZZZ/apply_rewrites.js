const fs = require('fs');
const path = require('path');

const dir = '/Users/ningqing/Documents/tavern_helper_template/世界书/ZZZ';
const files = fs.readdirSync(dir).filter(f => f.startsWith('char:') && (f.endsWith('.yaml') || f.endsWith('.txt')));

const spoilerKeywords = [
    '法厄同', '绳匠', '繩匠', '玩家', '主角', '哲', '铃', '鈴',
    '委托', '委託', '代理人', '邀约', '邀約', '主线', '主線', 
    '秘闻', '秘聞', '纪事', '紀事', '视界', '視界'
];
const safeEvents = ['旧都陷落', '舊都陷落', '阿苟思空洞', '阿苟思', '白银计划', '白銀計畫', '鬼族战争'];

let modifiedCount = 0;

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if it's JSON format (usually char:xxx.txt starting with spaces and quotes)
    if (content.trim().startsWith('{') || content.trim().startsWith('"name"')) {
        let isJson = true;
        let jsonObj;
        try {
            // Some might not have outer braces if they start with "name"
            if (content.trim().startsWith('"name"')) {
                jsonObj = JSON.parse('{' + content + '}');
            } else {
                jsonObj = JSON.parse(content);
            }
        } catch (e) {
            // Broken JSON, we will try to fix the common error: ["般岳", "alias"]: [
            try {
                let fixedContent = content.replace(/"name": \["([^"]+)", "alias"\]: \[/, '"name": "$1",\n  "alias": [');
                jsonObj = JSON.parse('{' + fixedContent + '}');
                isJson = true;
                content = '{' + fixedContent + '}'; // Update original content to valid JSON so we can stringify later
            } catch (err) {
                isJson = false;
            }
        }

        if (isJson && jsonObj.background) {
            let changed = false;
            
            const checkSpoiler = (text) => {
                if (typeof text !== 'string') return false;
                for (let kw of spoilerKeywords) {
                    if (text.includes(kw)) return true;
                }
                let m1 = text.match(/[「『【《]([^」』】》]+)[」』】》]事件/);
                let m2 = text.match(/[「『【《]([^」』】》]*事件)[」』】》]/);
                let evt = (m1 && m1[1]) || (m2 && m2[1]);
                if (evt) {
                    if (!safeEvents.some(se => evt.includes(se))) return true;
                }
                return false;
            };

            if (jsonObj.background.achievements && Array.isArray(jsonObj.background.achievements)) {
                let newAch = [];
                for (let ach of jsonObj.background.achievements) {
                    if (!checkSpoiler(ach)) {
                        newAch.push(ach);
                    }
                }
                if (newAch.length === 0) newAch.push("暂无记录（待在沙盒RP中经历与探索）");
                if (newAch.length !== jsonObj.background.achievements.length) {
                    jsonObj.background.achievements = newAch;
                    changed = true;
                }
            }
            
            if (jsonObj.background.identity && checkSpoiler(jsonObj.background.identity)) {
                jsonObj.background.identity = "暂无记录（待在沙盒RP中经历与探索）";
                changed = true;
            }
            if (jsonObj.background.current_status && checkSpoiler(jsonObj.background.current_status)) {
                jsonObj.background.current_status = "暂无记录（待在沙盒RP中经历与探索）";
                changed = true;
            }

            // Clean up relationships containing spoilers
            if (jsonObj.relationships) {
                let relKeys = Object.keys(jsonObj.relationships);
                for (let key of relKeys) {
                    let rel = jsonObj.relationships[key];
                    if (checkSpoiler(key) || (rel.description && checkSpoiler(rel.description))) {
                        delete jsonObj.relationships[key];
                        changed = true;
                    }
                }
            }

            if (changed) {
                fs.writeFileSync(filePath, JSON.stringify(jsonObj, null, 2), 'utf8');
                modifiedCount++;
            }
        }
    } else {
        // YAML processing for edge cases where "事件" was inside quotes: 『帆布巷爆破事件』
        let lines = content.split('\n');
        let newLines = [];
        let currentBlock = false;
        let currentBlockName = '';
        let currentBlockLines = [];
        const targetFields = ['重要事件:', '刻骨铭心的往事:', '人生转折点:', '心路历程:'];
        let changed = false;

        const processBlock = () => {
            if (!currentBlock) return;
            if (targetFields.includes(currentBlockName)) {
                let blockText = currentBlockLines.join('\n');
                let isSpoiler = false;
                
                if (blockText.includes('暂无记录（待在沙盒RP中经历与探索）')) {
                    newLines.push(...currentBlockLines);
                    currentBlock = false;
                    currentBlockName = '';
                    currentBlockLines = [];
                    return;
                }

                for (let kw of spoilerKeywords) {
                    if (blockText.includes(kw)) {
                        isSpoiler = true;
                        break;
                    }
                }
                if (!isSpoiler) {
                    // Match "「阿苟思」事件" OR "「阿苟思事件」"
                    let eventMatch1 = blockText.match(/[「『【《]([^」』】》]+)[」』】》]事件/);
                    let eventMatch2 = blockText.match(/[「『【《]([^」』】》]*事件)[」』】》]/);
                    let evt = (eventMatch1 && eventMatch1[1]) || (eventMatch2 && eventMatch2[1]);
                    
                    if (evt) {
                        if (!safeEvents.some(se => evt.includes(se))) {
                            isSpoiler = true;
                        }
                    }
                }
                if (isSpoiler) {
                    newLines.push(`${currentBlockName}暂无记录（待在沙盒RP中经历与探索）`);
                    changed = true;
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
        processBlock();

        if (changed) {
            fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
            modifiedCount++;
        }
    }
});

console.log(`补充手术完成！成功修复并清理了 ${modifiedCount} 个遗漏文件（含 JSON 格式的 txt 文件和命名剧透边缘情况）。`);
