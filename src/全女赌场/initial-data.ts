import type { Schema as SchemaData } from './schema';

export const INITIAL_STAT_DATA = {
  主角: {
    筹码: 50000,
    欠债: 0,
    $经济版本: 2,
    身份状态: '赌客',
    扶她化状态: '无',
    兔女郎工作进度: 0,
    物品栏: {
      扶她化药剂: 1,
    },
    惩罚记录: [],
  },
  赌场: {
    当前位置: '赌桌区',
    今日事件: [],
  },
  群友: {},
} satisfies SchemaData;
