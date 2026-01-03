import { z } from 'zod';

// ---------------------
// 1. 通用定义
// ---------------------

// 角色通用 Schema
const CharacterSchema = z
  .object({
    姓名: z.string().prefault(''),

    // 关系系统
    关系: z.enum(['拒绝', '交易', '顺从', '忠诚', '性奴']).optional(),
    关系倾向: z.enum(['拒绝', '交易', '顺从', '忠诚', '性奴']).optional(),

    // 健康系统
    健康: z.coerce
      .number()
      .min(0)
      .max(100)
      .prefault(100)
      .describe('范围0-100。记录健康数值。获得食物/温暖增加；受伤/饥饿/寒冷减少。'),
    健康更新原因: z.string().prefault('').describe('记录健康值变化的原因和数值，格式：+/-X, 原因描述'),
    健康状况: z
      .enum(['健康', '亚健康', '生病/受伤', '重病/濒死', '无', '死亡'])
      .prefault('健康')
      .describe('>=80:健康; 60-79:亚健康; 30-59:生病/受伤; <30:重病/濒死'),

    // 外貌与状态 (纯文本描述)
    衣着: z.string().prefault('').describe('详细描述当前的衣着状态'),
    舌唇: z.string().prefault('').describe('口腔、嘴唇的状态'),
    胸乳: z.string().prefault('').describe('胸部的状态'),
    私穴: z.string().prefault('').describe('私处的详细状态'),
    神态样貌: z.string().prefault('').describe('面部表情和神态'),
    动作姿势: z.string().prefault('').describe('身体姿态和动作'),

    // 心理
    内心想法: z.string().prefault('').describe('第一人称内心独白'),

    // 系统控制
    登场状态: z.enum(['登场', '离场']).prefault('离场').describe('值为"登场"时显示在UI。角色不出现时设为"离场"'),
  })
  .prefault({
    姓名: '',
    健康: 100,
    健康更新原因: '',
    健康状况: '健康',
    衣着: '',
    舌唇: '',
    胸乳: '',
    私穴: '',
    神态样貌: '',
    动作姿势: '',
    内心想法: '',
    登场状态: '离场',
  });

// 2. 世界环境
const WorldSchema = z
  .object({
    地址: z.string().prefault('').describe('当前所在的物理位置'),
    日期: z.string().prefault('').describe('格式：末日纪元，XXXX年XX月XX日'),
    时间: z.string().prefault('').describe('格式：时间段 - HH:MM'),
    末日天数: z.coerce.number().prefault(0).describe('自"永恒暴雪"降临以来的总天数'),
  })
  .prefault({
    地址: '',
    日期: '',
    时间: '',
    末日天数: 0,
  });

// 3. 庇护所
const ShelterSchema = z
  .object({
    庇护所等级: z.coerce.number().max(10).prefault(1),
    今日投掷点数: z.string().prefault('').describe('记录每日升级判定结果'),
    距离上次升级: z.string().prefault('').describe('记录保底进度'),
    庇护所能力: z
      .array(
        z.object({
          name: z.string(),
          desc: z.string(),
        }),
      )
      .prefault([])
      .describe('已激活的庇护所能力列表。请严格参照世界书条目<庇护所升级能力>添加新能力。'),
    可扩展区域: z
      .object({
        医疗翼: z.string().prefault('未解锁').describe('等级3解锁'),
        制造工坊: z.string().prefault('未解锁').describe('等级4解锁'),
        载具格纳库: z.string().prefault('未解锁').describe('等级7解锁'),
      })
      .prefault({
        医疗翼: '未解锁',
        制造工坊: '未解锁',
        载具格纳库: '未解锁',
      })
      .describe('记录庇护所可扩展区域的解锁状态'),
  })
  .prefault({
    庇护所等级: 1,
    今日投掷点数: '',
    距离上次升级: '',
    庇护所能力: [],
    可扩展区域: {
      医疗翼: '未解锁',
      制造工坊: '未解锁',
      载具格纳库: '未解锁',
    },
  });

// 3.1 房间系统
const RoomSchema = z
  .object({
    玄关: z
      .object({
        临时客房A入住者: z.array(z.string()).prefault([]).describe('临时客房A入住者姓名列表'),
        临时客房B入住者: z.array(z.string()).prefault([]).describe('临时客房B入住者姓名列表'),
      })
      .prefault({
        临时客房A入住者: [],
        临时客房B入住者: [],
      })
      .describe('玄关区域房间状态'),
    核心区: z
      .object({
        主卧室使用者: z.array(z.string()).prefault([]).describe('主卧室使用者姓名列表'),
        主浴室使用者: z.array(z.string()).prefault([]).describe('主浴室使用者姓名列表'),
      })
      .prefault({
        主卧室使用者: [],
        主浴室使用者: [],
      })
      .describe('核心区域房间状态'),
    楼层房间: z
      .object({
        楼层20房间: z
          .record(z.string(), z.object({ 入住者: z.array(z.string()) }).prefault({ 入住者: [] }))
          .prefault({})
          .describe('20层各房间状态，key为房间号'),
        楼层19房间: z
          .record(z.string(), z.object({ 入住者: z.array(z.string()) }).prefault({ 入住者: [] }))
          .prefault({})
          .describe('19层各房间状态，key为房间号'),
      })
      .prefault({
        楼层20房间: {},
        楼层19房间: {},
      })
      .describe('楼层房间状态'),
  })
  .prefault({
    玄关: {
      临时客房A入住者: [],
      临时客房B入住者: [],
    },
    核心区: {
      主卧室使用者: [],
      主浴室使用者: [],
    },
    楼层房间: {
      楼层20房间: {},
      楼层19房间: {},
    },
  });

// 4. 其他住户
const NeighborsSchema = z
  .object({
    言语: z.string().prefault('').describe('其他幸存者的总体言语状态'),
    行为: z.string().prefault('').describe('其他幸存者的总体行为状态'),
  })
  .prefault({
    言语: '',
    行为: '',
  });

// 5. 主 Schema
// ---------------------
const MissionSchema = z
  .object({
    当前阶段: z.string().prefault('阶段一：秩序的萌芽').describe('主线任务的当前阶段名称'),
    阶段目标: z
      .array(z.string())
      .prefault(['肃清20、19、21层的敌对幸存者', '庇护至少3个核心女性角色或家庭', '完成一个公寓内部的情报碎片任务'])
      .describe('当前阶段需要达成的目标列表'),
    目标完成状态: z
      .record(z.string(), z.boolean())
      .prefault({
        '0': false,
        '1': false,
        '2': false,
      })
      .describe('目标完成状态，key为索引字符串（0/1/2...），value为true表示完成'),
    情报碎片: z
      .record(
        z.string(),
        z
          .object({
            编号: z.string().prefault(''),
            描述: z.string().prefault(''),
            价值: z.string().prefault(''),
            风险: z.string().prefault(''),
            状态: z.enum(['未探索', '已探索', '已完成']).prefault('未探索'),
          })
          .prefault({
            编号: '',
            描述: '',
            价值: '',
            风险: '',
            状态: '未探索',
          }),
      )
      .prefault({})
      .describe('已解锁的情报碎片'),
  })
  .prefault({
    当前阶段: '阶段一：秩序的萌芽',
    阶段目标: ['肃清20、19、21层的敌对幸存者', '庇护至少3个核心女性角色或家庭', '完成一个公寓内部的情报碎片任务'],
    目标完成状态: {
      '0': false,
      '1': false,
      '2': false,
    },
    情报碎片: {},
  });

export const Schema = z.object({
  世界: WorldSchema,
  庇护所: ShelterSchema,
  房间: RoomSchema,
  主线任务: MissionSchema,

  // 主要角色
  浅见亚美: CharacterSchema,
  相田哲也: CharacterSchema,
  星野琉璃: CharacterSchema,
  早川遥: CharacterSchema,
  早川舞: CharacterSchema,
  藤井雪乃: CharacterSchema,
  中村惠子: CharacterSchema,
  爱宫心爱: CharacterSchema,
  爱宫铃: CharacterSchema,
  '桃乐丝・泽巴哈': CharacterSchema,
  何铃: CharacterSchema,
  王静: CharacterSchema,
  康绮月: CharacterSchema,
  薛萍: CharacterSchema,
  小泽花: CharacterSchema,

  // 动态 NPC (Optional)
  临时NPC: CharacterSchema.optional().describe('当有临时NPC登场时使用，离场时设为undefined或重置'),

  楼层其他住户: NeighborsSchema,
});

export type Schema = z.output<typeof Schema>;
