import { reactive } from 'vue';
import { useDataStore } from './store';

/**
 * 兔女郎点单价目表
 * key = 群友名（和 MVU 变量中 群友.xxx 的 key 完全一致）
 * value = 包一夜的价格（筹码）
 *
 * 未登记的兔女郎会显示"价目待定"，按钮禁用。
 * 由卡主自行填入具体价格。
 */
export const servicePrices: Record<string, number> = {
  // ─── 在这里填入群友名和对应价格 ───
  '阿汐': 10000,
};

/** 本 session 已点单的群友名（响应式，页面刷新前不会重置） */
const orderedSet = reactive(new Set<string>());

/** 查询某兔女郎的点单价格，未登记返回 null */
export function servicePrice(name: string): number | null {
  return servicePrices[name] ?? null;
}

/** 查询某群友本 session 是否已点过单 */
export function hasOrdered(name: string): boolean {
  return orderedSet.has(name);
}

/** 点单结果 */
export type OrderResult =
  | { ok: true; cost: number }
  | { ok: false; reason: 'not_bunny' | 'no_price' | 'insufficient' | 'already_ordered' };

/**
 * 执行点单：扣除筹码，推送事件
 * - 仅对身份含"兔女郎"的群友生效
 * - 未登记价格 → 不可点单
 * - 余额不足 → 不可点单
 * - 本 session 已点过 → 不可点单
 */
export function placeOrder(name: string): OrderResult {
  const store = useDataStore();
  const girl = store.data.群友[name];

  if (!girl || !girl.身份.includes('兔女郎')) {
    return { ok: false, reason: 'not_bunny' };
  }

  if (orderedSet.has(name)) {
    return { ok: false, reason: 'already_ordered' };
  }

  const price = servicePrice(name);
  if (price === null) {
    return { ok: false, reason: 'no_price' };
  }

  if (store.data.主角.筹码 < price) {
    return { ok: false, reason: 'insufficient' };
  }

  // 扣筹码，锁定本 session
  store.data.主角.筹码 -= price;
  orderedSet.add(name);
  // 推送事件给 AI 演出
  store.data.赌场.今日事件.push(`点单：花费${price}筹码包下兔女郎「${name}」一夜`);

  return { ok: true, cost: price };
}
