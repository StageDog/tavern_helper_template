/**
 * 商品总表：商店售卖与物品栏展示共用。
 * 新道具流程：这里加一条 + 变量更新规则.yaml 的 <物品效果表> 加一行。
 *
 * 注：本卡为手枪卡，秘药效果按「完全放开」尺度设计。
 */
export interface Goods {
  name: string;
  description: string;
  price: number;
  /** FontAwesome 图标类 */
  icon: string;
}

export const GOODS: Goods[] = [
  {
    name: '敏感化药剂',
    description: '全身敏感度大幅提升，轻触即有强烈反应。',
    price: 1500,
    icon: 'fa-solid fa-bolt',
  },
  {
    name: '强制潮吹剂',
    description: '降低潮吹阈值，轻微刺激即引发喷射式高潮。',
    price: 2000,
    icon: 'fa-solid fa-droplet',
  },
  {
    name: '真言诱导剂',
    description: '无法说谎，被询问时不自觉吐露真实欲望。',
    price: 2500,
    icon: 'fa-solid fa-comment-dots',
  },
  {
    name: '持久强化剂',
    description: '大幅延长持久时间，体力增强。',
    price: 3000,
    icon: 'fa-solid fa-hourglass-half',
  },
  {
    name: '强制排卵诱导剂',
    description: '强制触发排卵，受孕欲望与生理渴求暴涨，理性下降。',
    price: 5000,
    icon: 'fa-solid fa-heart-pulse',
  },
  {
    name: '扶她化药剂',
    description: '临时长出扶她肉棒，可用来草输掉的群友。一晚药效。',
    price: 50000,
    icon: 'fa-solid fa-venus-mars',
  },
];

export function findGoods(name: string): Goods | undefined {
  return GOODS.find(g => g.name === name);
}
