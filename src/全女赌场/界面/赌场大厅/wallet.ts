import { useDataStore } from './store';

/** 债务上限：欠到这个数赌场就不再借了（数值草案，随时可调） */
export const DEBT_LIMIT = 5000;
/** 借款手续费率：借 1000 到手 1000，记账 1100 */
export const LOAN_FEE_RATE = 0.1;
/** 兔女郎抵债：工作进度满 100 清偿一档的额度 */
export const REDEMPTION_UNIT = 2500;

/**
 * 钱包：所有小游戏/商店统一通过这里读写 MVU 变量。
 * 结算原则：前端本地裁决输赢并直接写筹码，AI 只根据事件记录演出反应。
 */
export function useWallet() {
  const store = useDataStore();

  const chips = computed(() => store.data.主角.筹码);
  const debt = computed(() => store.data.主角.欠债);
  const isBunny = computed(() => store.data.主角.身份状态 === '兔女郎');

  /** 下海硬触发：欠满额度且 token 归零（借无可借、输无可输）→ 直接切身份，AI 只演出 */
  function checkBankruptcy() {
    if (
      store.data.主角.身份状态 === '赌客' &&
      store.data.主角.欠债 >= DEBT_LIMIT &&
      store.data.主角.筹码 <= 0
    ) {
      store.data.主角.身份状态 = '兔女郎';
      store.data.主角.兔女郎工作进度 = 0;
      pushEvent(`破产：欠债${store.data.主角.欠债}且 token 归零，被赌场收编为兔女郎，开始下海抵债`);
    }
  }

  /** 校验并扣除赌注，余额不足返回 false */
  function placeBet(amount: number): boolean {
    if (!Number.isFinite(amount) || amount <= 0 || amount > store.data.主角.筹码) {
      return false;
    }
    store.data.主角.筹码 -= Math.round(amount);
    checkBankruptcy();
    return true;
  }

  /** 发放赢得的筹码 */
  function payout(amount: number) {
    store.data.主角.筹码 += Math.max(0, Math.round(amount));
  }

  /** 购买商品：扣筹码并写入物品栏 */
  function purchase(name: string, price: number): boolean {
    if (price > store.data.主角.筹码) {
      return false;
    }
    store.data.主角.筹码 -= Math.round(price);
    store.data.主角.物品栏[name] = (store.data.主角.物品栏[name] ?? 0) + 1;
    checkBankruptcy();
    return true;
  }

  /** 向赌场借款：到手 N 筹码，记账 N×(1+手续费)。超出额度返回 false */
  function borrow(amount: number): boolean {
    const booked = Math.round(amount * (1 + LOAN_FEE_RATE));
    if (!Number.isFinite(amount) || amount <= 0 || store.data.主角.欠债 + booked > DEBT_LIMIT) {
      return false;
    }
    store.data.主角.欠债 += booked;
    store.data.主角.筹码 += Math.round(amount);
    return true;
  }

  /** 用筹码还债，返回实际还款额 */
  function repay(amount: number): number {
    const actual = Math.min(Math.round(amount), store.data.主角.筹码, store.data.主角.欠债);
    if (actual <= 0) return 0;
    store.data.主角.筹码 -= actual;
    store.data.主角.欠债 -= actual;
    return actual;
  }

  /** 记录事件摘要，供 AI 演出参考（schema 自动裁剪只留最近10条） */
  function pushEvent(summary: string) {
    store.data.赌场.今日事件.push(summary);
  }

  return {
    store,
    chips,
    debt,
    isBunny,
    DEBT_LIMIT,
    LOAN_FEE_RATE,
    REDEMPTION_UNIT,
    placeBet,
    payout,
    purchase,
    borrow,
    repay,
    checkBankruptcy,
    pushEvent,
  };
}
