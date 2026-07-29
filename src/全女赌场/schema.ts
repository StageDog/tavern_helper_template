export const Schema = z.object({
  主角: z.object({
    筹码: z.coerce.number().transform(value => _.clamp(Math.round(value), 0, 999999999)).prefault(0),
    欠债: z.coerce.number().transform(value => _.clamp(Math.round(value), 0, 999999)).prefault(0),
    $经济版本: z.coerce.number().transform(value => Math.max(1, Math.round(value))).prefault(1),
    身份状态: z.enum(['赌客', '兔女郎']).prefault('赌客'),
    扶她化状态: z.enum(['无', '生效中']).prefault('无'),
    兔女郎工作进度: z.coerce.number().transform(value => _.clamp(value, 0, 100)).prefault(0),
    物品栏: z.record(z.string().describe('物品名'), z.coerce.number().describe('数量')).prefault({}),
    惩罚记录: z.array(z.string()).transform(value => _.takeRight(value, 20)).prefault([]),
  }),
  赌场: z.object({
    当前位置: z.string().prefault('赌桌区'),
    今日事件: z.array(z.string()).transform(value => _.takeRight(value, 10)).prefault([]),
  }),
  群友: z.record(
    z.string().describe('群友名'),
    z.object({
      身份: z.string().prefault('赌客'),
      着装: z.string().prefault('待初始化'),
      身体状态: z.object({
        胸部: z.string().prefault('待初始化'),
        小穴: z.string().prefault('待初始化'),
        臀部: z.string().prefault('待初始化'),
        嘴部: z.string().prefault('待初始化'),
      }).prefault({}),
      所在位置: z.string().prefault('赌桌区'),
      当前动作: z.string().prefault('待初始化'),
      内心: z.string().prefault('待初始化'),
      /** 经济状态：总营收归零即破产下海（简化版，无欠债机制） */
      经济状态: z.object({
        总营收: z.coerce.number().transform(v => _.clamp(Math.round(v), 0, 999999)).prefault(1000),
        本轮盈亏: z.coerce.number().transform(v => Math.round(v)).prefault(0),
      }).prefault({}),
      /** 兔女郎赎身进度：每轮 +1~2，满 10 自动赎身 */
      赎身进度: z.coerce.number().transform(v => _.clamp(Math.round(v), 0, 10)).prefault(0),
    }),
  ).prefault({}),
});
export type Schema = z.output<typeof Schema>;
