import { registerMvuSchema } from 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/util/mvu_zod.js';

export const Schema = z.object({
  // 世界状态：记录时间与地点
  world: z.object({
    date: z.string().prefault("第一天"),
    time: z.string().prefault("上午"),
    location: z.string().prefault("随机播放录像店")
  }).prefault({}),

  // 玩家状态
  player: z.object({
    name: z.string().prefault("未设定"),
    role: z.string().prefault("绳匠"), // 初始身份
    status: z.string().prefault("正常"),
    is_original: z.boolean().prefault(false).describe("是否为原创主角")
  }).prefault({}),

  // 代理人列表
  agents: z.object({
    list: z.array(z.string()).prefault([]), // 存放代理人姓名的数组
    present: z.array(z.string()).prefault([]).describe("当前在场角色")
  }).prefault({}),

  // 叙事进程
  narrative: z.object({
    active_event: z.string().prefault("无"), // 当前正在经历的事件或剧情
    current_task: z.string().prefault("自由探索") // 当前的具体目标
  }).prefault({}),

  // 物品栏：货币与道具
  inventory: z.record(
    z.string().describe("物品名称"),
    z.coerce.number().describe("数量")
  ).prefault({})

});

$(() => {
  registerMvuSchema(Schema);
})
