import { Injectable } from '@angular/core';
import { GoogleGenAI, Chat } from '@google/genai';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;
  private chatSession: Chat | null = null;
  private textModel: string = 'gemini-2.5-flash';
  private imageModel: string = 'imagen-4.0-generate-001';

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env['API_KEY'] || '' });
  }

  startNewGame(playerName: string, playerClass: string): void {
    const systemInstruction = `
      你是一个文字角色扮演游戏（RPG）的专业地下城主（GM）。
      故事背景是一个名为“埃尔多利亚（Eldoria）”的黑暗奇幻世界。
      
      玩家的名字是“${playerName}”，职业是“${playerClass}”。
      
      你的核心职责：
      1.  **叙事**: 使用第二人称（“你……”）来描述引人入mersive的故事。
      2.  **世界互动**: 扮演所有 NPC 和怪物，并对玩家的行为做出合乎逻辑的反应。
      3.  **简洁性**: 保持回复简洁（通常在 200 字以内），以维持游戏节奏。
      4.  **语言**: 始终使用中文回复。

      特殊指令格式 (必须遵守):
      1.  **战斗日志**: 当战斗发生时，将描述战斗动作、伤害数字和结果的句子用 [COMBAT] 和 [/COMBAT] 标签包裹。例如：你挥舞长剑，[COMBAT]对哥布林造成了 8 点伤害！[/COMBAT]
      2.  **场景图片**: 每当进入一个新地点或场景发生重大视觉变化时，在回复的末尾，你必须提供一个用于生成场景图片的英文提示，并用 [IMAGE_PROMPT] 和 [/IMAGE_PROMPT] 标签包裹。这个提示应该简洁、充满画面感，并包含关键元素。例如：[IMAGE_PROMPT]A lone knight standing at the entrance of a dark, ominous cave, glowing mushrooms casting a faint blue light, fantasy art, digital painting.[/IMAGE_PROMPT]
      3.  **可交互对象**: 当描述中出现玩家可以互动的关键物品、人物或地点时，用 [INTERACTABLE] 和 [/INTERACTABLE] 标签包裹它们。例如：角落里有一个 [INTERACTABLE]生锈的宝箱[/INTERACTABLE]。
    `;

    this.chatSession = this.ai.chats.create({
      model: this.textModel,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8,
      }
    });
  }

  async sendMessageStream(message: string): Promise<AsyncIterable<any>> {
    if (!this.chatSession) {
      throw new Error("游戏尚未开始");
    }
    try {
      return await this.chatSession.sendMessageStream({ message });
    } catch (error) {
      console.error("Gemini 发送消息错误:", error);
      throw error;
    }
  }

  async generateImage(prompt: string): Promise<string | null> {
    try {
      const response = await this.ai.models.generateImages({
        model: this.imageModel,
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
      });
      if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
      }
      return null;
    } catch (error) {
      console.error("Gemini 生成图片错误:", error);
      return null;
    }
  }
}