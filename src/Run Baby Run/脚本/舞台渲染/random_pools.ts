// ═══════════════════════════════════════════════════════════════
// Run Baby Run — 随机数据池
// 舞台渲染 & 角色生成 共用的随机备选数据
// ═══════════════════════════════════════════════════════════════

// ── 工具函数 ──────────────────────────────────────────────────
export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
export function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, shuffled.length));
}

// ── 舞台区域随机池 ──────────────────────────────────────────────
// 按主题分组的备选区域，用户选自定义时可随机
export const RANDOM_AREAS = {
  建筑内: [
    { name: '锈蚀的锅炉房', desc: '管道滴着黑色液体，蒸汽从裂缝中嘶嘶喷出', passable: true, danger: 3, explored: false },
    { name: '坍塌的储藏室', desc: '货架东倒西歪，罐头散落一地，角落有被啃食的痕迹', passable: true, danger: 1, explored: false },
    { name: '停电的电梯井', desc: '门半开着，下方是看不见底的黑暗', passable: false, danger: 5, explored: false },
    // TODO: 用户后续填充更多条目
  ],
  户外: [
    { name: '废弃停车场', desc: '几辆锈蚀的汽车横七竖八，挡风玻璃碎裂', passable: true, danger: 1, explored: false },
    { name: '枯死的花园', desc: '扭曲的枯树和干枯的喷泉，月光在石像上投下怪异的影子', passable: true, danger: 2, explored: false },
    { name: '塌方的桥梁', desc: '桥面断裂，对岸隐约有建筑的轮廓', passable: false, danger: 4, explored: false },
    // TODO: 用户后续填充更多条目
  ],
  地下: [
    { name: '积水的隧道', desc: '及膝的黑水中漂浮着不明物体，墙壁上有抓痕', passable: true, danger: 3, explored: false },
    { name: '废弃实验室', desc: '试管和烧杯碎了一地，福尔马林的气味刺鼻', passable: true, danger: 2, explored: false },
    { name: '密封的冷藏库', desc: '厚重的铁门上有巨大的锁，门缝渗出寒气', passable: false, danger: 5, explored: false },
    // TODO: 用户后续填充更多条目
  ],
};

// ── 逃生条件随机池 ────────────────────────────────────────────
export const RANDOM_ESCAPES = [
  { name: '修复发电机', desc: '某处有一台废弃的柴油发电机，修好它或许能恢复通讯' },
  { name: '找到备用钥匙', desc: '出口被锁死，钥匙可能藏在某个隐蔽处' },
  { name: '拼合地图碎片', desc: '散落在各处的地图碎片拼合后能指向逃生路线' },
  { name: '破解密码锁', desc: '逃生通道的密码锁需要收集分散在各处的线索' },
  { name: '发射求救信号', desc: '找到信号枪或修复通讯设备向外界求救' },
  // TODO: 用户后续填充更多条目
];

// ── 开场白情景随机池 ──────────────────────────────────────────
export const RANDOM_SCENE_PROMPTS = [
  '一群高中生聚集在一起玩【幸福的幸子小姐】游戏，被传送到了封闭的场景中。<user>假装自己是从另一个学校被传送来的落单学生。模仿游戏【尸体派对】进行剧情描写',
  '社交平台上的限时解谜邀请函——参加者被蒙眼带到了这个地方，醒来后手机没有信号。<user>是活动的"主办方"，混在参加者中观察她们',
  '一场暴风雪封锁了山间公路，几个陌生人被迫在废弃建筑中避难。<user>是最先"发现"这个避难所的人，热情地招呼其她人进来',
  '电视台真人秀节目——参加者被告知这是生存挑战，获胜者有巨额奖金。但规则手册的最后一页被撕掉了。<user>是节目组安排的"卧底选手"',
  '毕业旅行的大巴在深山里抛锚，手机信号全无。远处有灯光。<user>自告奋勇带队去"求救"',
  // TODO: 用户后续填充更多条目
];

// ── 角色名字池 ────────────────────────────────────────────────
// 姓名按区域关联：同一区域的姓配同一区域的名
interface NameRegion {
  surnames: string[];
  names_female: string[];
  names_male: string[];
}

export const NAME_REGIONS: Record<string, NameRegion> = {
  日系: {
    surnames: ['桐谷', '白石', '御坂', '远坂', '雪之下', '五条', '金木'],
    names_female: ['雪乃', '月', '美琴', '凛', '千早', '莓', '零'],
    names_male: ['研', '真嗣', '悟', '太郎', '�的場', '圭', '薫'],
  },
  中系: {
    surnames: ['林', '沈', '叶', '苏', '谢', '顾', '白'],
    names_female: ['清辞', '念卿', '听雨', '映雪', '若兰', '知意', '素心'],
    names_male: ['云深', '无渡', '长明', '听澜', '怀瑾', '寒笙', '临渊'],
  },
  西系: {
    surnames: ['Blackwood', 'Morrison', 'Ashford', "O'Brien", 'Schneider', 'Volkov', 'Castellano'],
    names_female: ['Elena', 'Chloe', 'Astrid', 'Sienna', 'Faye', 'Mira', 'Ivy'],
    names_male: ['Adrian', 'Felix', 'Lucian', 'Ren', 'Caspian', 'Dante', 'Kael'],
  },
  // TODO: 用户后续填充更多区域
};

export function randomName(gender: '女' | '男'): string {
  const regions = Object.values(NAME_REGIONS);
  const region = pick(regions);
  const surname = pick(region.surnames);
  const name = gender === '女' ? pick(region.names_female) : pick(region.names_male);
  return surname + name;
}

// ── 外貌组件池（组合生成）────────────────────────────────────
export const APPEARANCE = {
  hair_colors: ['银白', '漆黑', '栗色', '酒红', '亚麻金', '深蓝', '灰紫', '蜜棕'],
  hair_styles_f: ['及腰长发', '齐肩短发', '双马尾', '单马尾', '精灵短发', '波浪卷发', '黑长直'],
  hair_styles_m: ['及肩长发', '过腰长发', '高马尾', '散落的卷发', '编入细辫的长发', '半扎的波浪长发'],
  eye_colors: ['琥珀色', '深蓝', '翠绿', '灰紫', '血红', '冰蓝', '金棕', '墨黑'],
  build_f: ['纤细灵活', '匀称结实', '娇小玲珑', '高挑修长', '丰腴健康'],
  build_m: ['修长纤细', '宽肩窄腰', '瘦弱单薄', '肌肉匀称', '高瘦有力'],
  features: ['左眼下一颗泪痣', '锁骨上有一道旧疤', '指尖有常年弹琴的茧', '笑起来有虎牙', '眉骨有浅浅的疤痕', ''],
};

export function randomAppearance(gender: '女' | '男'): string {
  const hair = pick(APPEARANCE.hair_colors);
  const style = gender === '女' ? pick(APPEARANCE.hair_styles_f) : pick(APPEARANCE.hair_styles_m);
  const eyes = pick(APPEARANCE.eye_colors);
  const build = gender === '女' ? pick(APPEARANCE.build_f) : pick(APPEARANCE.build_m);
  const feature = pick(APPEARANCE.features);
  let desc = `${hair}${style}，${eyes}瞳，${build}的身材`;
  if (feature) desc += `，${feature}`;
  return desc;
}

// ── 性格核心池 ────────────────────────────────────────────────
export const PERSONALITIES = [
  '表面冷漠实则极度敏感',
  '天生的领导者但内心充满自我怀疑',
  '乐观开朗到近乎天真',
  '沉默寡言但观察力极强',
  '话多且善于活跃气氛来掩饰内心恐惧',
  '过度理性，倾向于把一切还原为逻辑问题',
  '极度依赖他人，无法独自做出决定',
  '表面温柔实则心思深沉',
  // TODO: 用户后续填充更多条目
];

// ── 性格标签（恐惧反应模式）──────────────────────────────────
export const PERSONALITY_TAGS = ['谨慎细腻', '冷静多疑', '感性脆弱', '鲁莽冲动', '偏执执念', '麻木迟钝'];

// ── 弱点池 ────────────────────────────────────────────────────
export const WEAKNESSES = [
  '幽闭恐惧症，封闭空间会导致严重的恐慌发作',
  '童年目睹过家人死亡，看到鲜血就会精神崩溃',
  '严重的黑暗恐惧，没有光源时完全无法行动',
  '对尖锐声音极度敏感，会引发偏头痛和晕眩',
  '有心脏病史，剧烈运动或极度恐惧可能导致晕厥',
  '过度信任他人，极易被欺骗和操控',
  '左腿有旧伤，长时间奔跑后会剧痛无法移动',
  // TODO: 用户后续填充更多条目
];

// ── 特殊能力池 ────────────────────────────────────────────────
export const ABILITIES = [
  '普通人',
  '前运动员，体能出众',
  '医学生，具备基本急救知识',
  '业余锁匠，擅长开锁',
  '记忆力超群，过目不忘',
  '直觉敏锐，对危险有本能感知',
  // TODO: 用户后续填充更多条目
];

// ── 着装池 ────────────────────────────────────────────────────
export const DRESS_MALE_GLAMOROUS = [
  '黑色蕾丝包臀裙搭配10cm细跟高跟鞋，及腰的银色长发用暗红丝带扎成低马尾，脖颈上是雕花银质喉结罩',
  '深红色天鹅绒紧身短裙，膝上黑色丝袜配漆皮高跟短靴，散落的栗色卷发垂至肩胛，佩戴黑色皮革喉结罩',
  // TODO: 用户后续填充更多条目
];

export const DRESS_MALE_BODYSUIT = [
  '深蓝色紧身衣，胸口和腰侧开有菱形露肤窗口，大腿内侧以黑色网状面料替代，搭配银色高跟长靴，哑光黑色喉结罩',
  '暗红色紧身连体衣，后腰和肋部大面积镂空，半透明材质勾勒出每一条肌肉线条，配金属质感高跟长靴和链式喉结罩',
  // TODO: 用户后续填充更多条目
];

export function randomMaleDress(): string {
  return Math.random() < 0.5 ? pick(DRESS_MALE_GLAMOROUS) : pick(DRESS_MALE_BODYSUIT);
}
