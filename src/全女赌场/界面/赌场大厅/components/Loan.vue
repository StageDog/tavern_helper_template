<template>
  <div class="loan">
    <div class="debt-panel" :class="level.cls">
      <div class="debt-main">
        <span class="debt-label">当前欠债</span>
        <span class="debt-value">{{ wallet.debt.value.toLocaleString() }}</span>
        <span class="level-badge" :class="level.cls">{{ level.badge }}</span>
      </div>
      <div class="debt-bar">
        <div class="debt-fill" :style="{ width: `${debtRatio * 100}%` }"></div>
      </div>
      <div class="debt-meta">
        <span>额度上限 {{ wallet.DEBT_LIMIT.toLocaleString() }}</span>
        <span class="level-desc">{{ level.desc }}</span>
      </div>
    </div>

    <div v-if="toast" class="toast" :class="toastClass">{{ toast }}</div>

    <div v-if="wallet.isBunny.value" class="bunny-panel">
      <div class="bunny-head">🐰 工作赚钱中…</div>
      <div class="bunny-progress">
        <span class="bunny-label">本档进度</span>
        <div class="debt-bar">
          <div class="bunny-fill" :style="{ width: `${wallet.store.data.主角.兔女郎工作进度}%` }"></div>
        </div>
        <span class="bunny-num">{{ wallet.store.data.主角.兔女郎工作进度 }}/100</span>
      </div>
      <p class="bunny-info">
        每攒满 100 进度发放 {{ wallet.WORK_PAYOUT_UNIT.toLocaleString() }} 筹码工资，到账后可在下方直接还款；
        按当前缺口约需 <b>{{ unitsLeft }}</b> 档工资。
      </p>
    </div>

    <div class="amount-panel">
      <div class="amount-heading">
        <span class="amount-title">{{ wallet.isBunny.value ? '还款金额' : '借还金额' }}</span>
        <span class="amount-rule">100 起 · 仅限 100 的倍数</span>
      </div>
      <div class="amount-row">
        <div class="amount-input-wrap">
          <button aria-label="减少金额" @click="adjustAmount(-AMOUNT_STEP)">−</button>
          <label>
            <span class="sr-only">借还金额</span>
            <input
              v-model.number="amount"
              type="number"
              inputmode="numeric"
              :min="MIN_AMOUNT"
              :max="wallet.DEBT_LIMIT"
              :step="AMOUNT_STEP"
              @blur="normalizeAmount"
              @change="normalizeAmount"
            />
          </label>
          <button aria-label="增加金额" @click="adjustAmount(AMOUNT_STEP)">＋</button>
        </div>
        <div class="quick-amounts" aria-label="快捷金额">
          <button v-for="q in QUICK" :key="q" :class="{ sel: amount === q }" @click="setAmount(q)">
            {{ q.toLocaleString() }}
          </button>
          <button class="fill-limit" :disabled="fillAmount <= 0" @click="setAmount(fillAmount)">
            {{ wallet.isBunny.value ? '尽量还清' : '补满额度' }}
          </button>
        </div>
      </div>
      <span v-if="!validAmount" class="amount-error">
        请输入 {{ MIN_AMOUNT.toLocaleString() }}～{{ wallet.DEBT_LIMIT.toLocaleString() }} 之间、且为
        {{ AMOUNT_STEP.toLocaleString() }} 倍数的整数。
      </span>
    </div>

    <div v-if="!wallet.isBunny.value" class="fee-preview">
      <span>
        <small>实际到手</small>
        <b>{{ safeAmount.toLocaleString() }}</b>
      </span>
      <span>
        <small>{{ willCapDebt ? '额度封顶' : `含 ${wallet.LOAN_FEE_RATE * 100}% 手续费` }}</small>
        <b class="fee">
          <template v-if="willCapDebt"
            >{{ booked.toLocaleString() }} → {{ wallet.DEBT_LIMIT.toLocaleString() }}</template
          >
          <template v-else>记账 {{ booked.toLocaleString() }}</template>
        </b>
      </span>
    </div>

    <template v-if="!wallet.isBunny.value">
      <div class="actions">
        <button class="main-btn borrow" :disabled="!canBorrow" @click="doBorrow">
          <i class="fa-solid fa-hand-holding-dollar"></i> 借款
        </button>
        <button class="main-btn repay" :disabled="!canRepay" @click="doRepay">
          <i class="fa-solid fa-circle-check"></i> 还款
        </button>
      </div>
    </template>
    <button v-else class="main-btn repay bunny-repay-btn" :disabled="!canRepay" @click="doRepay">
      <i class="fa-solid fa-circle-check"></i> 还款 {{ repayAmount.toLocaleString() }}
    </button>

    <details v-if="records.length" class="records">
      <summary>借还流水（最近 {{ records.length }} 笔）</summary>
      <div class="record-list">
        <div v-for="(r, i) in records" :key="i" class="record-row">
          <span class="record-type" :class="r.type === '借' ? 'r-borrow' : 'r-repay'">{{ r.type }}</span>
          <span class="record-amount">{{ r.amount.toLocaleString() }}</span>
          <span class="record-after">欠债 {{ r.after.toLocaleString() }}</span>
        </div>
      </div>
    </details>

    <p class="hint">
      💡 最后一笔借款会把欠债封顶到 {{ wallet.DEBT_LIMIT.toLocaleString() }}。额度用完、token
      又归零时，就会被请去后台换上兔女郎制服抵债啦～
    </p>
  </div>
</template>

<script setup lang="ts">
import { useWallet } from '../wallet';

const MIN_AMOUNT = 100;
const AMOUNT_STEP = 100;
const QUICK = [1000, 5000, 10000];

// 惩罚等级（按欠债/上限比例）
const LEVELS = [
  { max: 0.25, cls: 'safe', badge: '安全', desc: '前台小姐笑眯眯的，还是好客人～' },
  { max: 0.5, cls: 'warn', badge: '警告', desc: '荷官们看你的眼神开始变得意味深长…' },
  { max: 0.8, cls: 'danger', badge: '危险', desc: '老板娘已经让人量好你的三围了。' },
  { max: Infinity, cls: 'critical', badge: '下海边缘', desc: '兔女郎制服就挂在后台，写着你的名字。' },
];

interface LoanRecord {
  type: '借' | '还';
  amount: number;
  after: number;
}

const wallet = useWallet();
const amount = ref<number>(5000);
const toast = ref('');
const toastClass = ref('');
let toastTimer = 0;

const records = useLocalStorage<LoanRecord[]>('casino_loan:records', []);

const debtRatio = computed(() => Math.min(1, wallet.debt.value / wallet.DEBT_LIMIT));
const level = computed(() => LEVELS.find(l => debtRatio.value < l.max) ?? LEVELS[LEVELS.length - 1]);

const safeAmount = computed(() => (Number.isFinite(amount.value) ? Math.round(amount.value) : 0));
const validAmount = computed(
  () =>
    safeAmount.value === amount.value &&
    safeAmount.value >= MIN_AMOUNT &&
    safeAmount.value <= wallet.DEBT_LIMIT &&
    safeAmount.value % AMOUNT_STEP === 0,
);
const remainingDebt = computed(() => Math.max(0, wallet.DEBT_LIMIT - wallet.debt.value));
const maxBorrowAmount = computed(() =>
  remainingDebt.value <= 0
    ? 0
    : Math.ceil(remainingDebt.value / (1 + wallet.LOAN_FEE_RATE) / AMOUNT_STEP) * AMOUNT_STEP,
);
const booked = computed(() => Math.round(safeAmount.value * (1 + wallet.LOAN_FEE_RATE)));
const willCapDebt = computed(() => validAmount.value && remainingDebt.value > 0 && booked.value > remainingDebt.value);
const canBorrow = computed(
  () => validAmount.value && remainingDebt.value > 0 && safeAmount.value <= maxBorrowAmount.value,
);
const canRepay = computed(() => validAmount.value && wallet.debt.value > 0 && wallet.chips.value > 0);
const repayAmount = computed(() => Math.min(safeAmount.value, wallet.debt.value, wallet.chips.value));
const fillAmount = computed(() => {
  if (wallet.isBunny.value) {
    if (wallet.debt.value <= 0 || wallet.chips.value <= 0) return 0;
    return Math.max(MIN_AMOUNT, Math.ceil(Math.min(wallet.debt.value, wallet.chips.value) / AMOUNT_STEP) * AMOUNT_STEP);
  }
  return maxBorrowAmount.value;
});

const unitsLeft = computed(() =>
  Math.ceil(Math.max(0, wallet.debt.value - wallet.chips.value) / wallet.WORK_PAYOUT_UNIT),
);

function addRecord(type: '借' | '还', recordAmount: number) {
  records.value = [{ type, amount: recordAmount, after: wallet.debt.value }, ...records.value].slice(0, 8);
}

function normalizeAmount() {
  const normalized = Number.isFinite(amount.value) ? Math.round(amount.value / AMOUNT_STEP) * AMOUNT_STEP : MIN_AMOUNT;
  amount.value = _.clamp(normalized, MIN_AMOUNT, wallet.DEBT_LIMIT);
}

function adjustAmount(delta: number) {
  normalizeAmount();
  amount.value = _.clamp(amount.value + delta, MIN_AMOUNT, wallet.DEBT_LIMIT);
}

function setAmount(value: number) {
  amount.value = _.clamp(value, MIN_AMOUNT, wallet.DEBT_LIMIT);
}

function doBorrow() {
  if (!validAmount.value) {
    showToast(`借款金额必须是 ${AMOUNT_STEP.toLocaleString()} 的倍数。`, 'fail');
    return;
  }

  const principal = safeAmount.value;
  const nominalBooked = booked.value;
  const capped = willCapDebt.value;
  if (wallet.borrow(principal)) {
    addRecord('借', principal);
    showToast(
      capped
        ? `借到 ${principal.toLocaleString()} token，欠债封顶 ${wallet.DEBT_LIMIT.toLocaleString()}。`
        : `借到 ${principal.toLocaleString()} token，记账 ${nominalBooked.toLocaleString()}。`,
      'ok',
    );
    wallet.pushEvent(
      `借贷：借款${principal}（含手续费原记账${nominalBooked}${capped ? `，封顶${wallet.DEBT_LIMIT}` : ''}），当前欠债${wallet.debt.value}`,
    );
  } else {
    showToast('这笔会超过可借额度，试试“补满额度”。', 'fail');
  }
}

function doRepay() {
  if (!validAmount.value) {
    showToast(`还款金额必须是 ${AMOUNT_STEP.toLocaleString()} 的倍数。`, 'fail');
    return;
  }

  const actual = wallet.repay(safeAmount.value);
  if (actual > 0) {
    addRecord('还', actual);
    showToast(
      wallet.debt.value === 0
        ? '还清了！全部债务一笔勾销🎉'
        : `还了 ${actual.toLocaleString()}，还欠 ${wallet.debt.value.toLocaleString()}`,
      'ok',
    );
    wallet.pushEvent(`借贷：还款${actual}，当前欠债${wallet.debt.value}`);
  } else {
    showToast('token 不够还啦…', 'fail');
  }
}

function showToast(text: string, cls: string) {
  toast.value = text;
  toastClass.value = cls;
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => (toast.value = ''), 2200);
}
</script>

<style lang="scss" scoped>
.loan {
  display: flex;
  flex-direction: column;
  gap: 14px;
  font-family: var(--font-main);
}

.debt-panel {
  display: flex;
  flex-direction: column;
  gap: 11px;
  padding: 14px;
  background: linear-gradient(145deg, rgba(114, 41, 74, 0.13), transparent 52%), var(--game-felt);
  border: 1px solid rgba(242, 229, 210, 0.14);
  border-radius: 11px;
  box-shadow: inset 0 1px 0 rgba(242, 229, 210, 0.04);

  &.warn {
    border-color: var(--c-primary);
  }

  &.danger,
  &.critical {
    border-color: var(--c-danger);

    .debt-value {
      color: var(--c-danger);
    }
  }
}

.debt-main {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.debt-label {
  font-size: 14px;
  color: var(--c-text-muted);
}

.debt-value {
  color: var(--game-ivory);
  font-size: 30px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.level-badge {
  min-height: 28px;
  box-sizing: border-box;
  padding: 4px 10px;
  color: var(--c-text);
  border: 1px solid var(--c-border);
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;

  &.safe {
    color: var(--c-success);
    border-color: var(--c-success);
  }

  &.warn {
    color: var(--c-primary);
    border-color: var(--c-primary);
  }

  &.danger,
  &.critical {
    color: var(--c-danger);
    border-color: var(--c-danger);
  }

  &.critical {
    background: var(--c-danger);
    color: #fff;
  }
}

.debt-bar {
  height: 9px;
  flex: 1;
  overflow: hidden;
  background: var(--c-surface-alt);
  border-radius: 999px;
}

.debt-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--c-primary), var(--c-danger));
  box-shadow: var(--glow-pink);
  transition: width 0.3s;
}

.debt-meta {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 12px;
  color: var(--c-text-muted);
  font-size: 13px;
  line-height: 1.5;
}

.level-desc {
  font-style: italic;
  text-align: right;
}

.toast {
  min-height: 22px;
  color: var(--game-ivory);
  font-size: 14px;
  text-align: center;
  font-weight: 700;

  &.ok {
    color: var(--c-success);
  }

  &.fail {
    color: var(--c-danger);
  }
}

.bunny-panel {
  display: flex;
  flex-direction: column;
  gap: 11px;
  padding: 13px;
  background: rgba(255, 92, 138, 0.055);
  border: 1px solid rgba(255, 92, 138, 0.54);
  border-radius: 10px;
}

.bunny-head {
  color: var(--c-danger);
  font-size: 15px;
  font-weight: 700;
}

.bunny-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bunny-label,
.bunny-num {
  color: var(--c-text-muted);
  font-size: 13px;
  white-space: nowrap;
}

.bunny-fill {
  height: 100%;
  background: var(--c-danger);
  transition: width 0.4s;
}

.bunny-info {
  margin: 0;
  color: var(--c-text);
  font-size: 14px;
  line-height: 1.6;

  b {
    color: var(--c-danger);
  }
}

.amount-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: rgba(242, 229, 210, 0.035);
  border: 1px solid rgba(214, 166, 74, 0.25);
  border-radius: 10px;
}

.amount-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}

.amount-title {
  color: var(--game-ivory);
  font-size: 15px;
  font-weight: 700;
}

.amount-rule {
  color: var(--c-text-muted);
  font-size: 13px;
  text-align: right;
}

.amount-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.amount-input-wrap {
  display: flex;
  height: 44px;
  overflow: hidden;
  border: 1px solid rgba(214, 166, 74, 0.55);
  border-radius: 8px;
  box-shadow: 0 3px 9px rgba(5, 2, 9, 0.24);

  button {
    width: 42px;
    padding: 0;
    color: var(--game-ivory);
    background: #2c1a34;
    border: 0;
    cursor: pointer;
    font-family: inherit;
    font-size: 20px;

    &:hover {
      color: var(--game-gold);
      background: #3a2343;
    }
  }

  label {
    display: block;
  }

  input {
    box-sizing: border-box;
    width: 104px;
    height: 44px;
    padding: 0 8px;
    color: #2b1931;
    background: repeating-linear-gradient(0deg, transparent 0 4px, rgba(41, 24, 49, 0.025) 4px 5px), var(--game-ivory);
    border: 0;
    border-right: 1px solid rgba(214, 166, 74, 0.46);
    border-left: 1px solid rgba(214, 166, 74, 0.46);
    font-family: var(--font-led);
    font-size: 17px;
    font-weight: 700;
    text-align: center;
    appearance: textfield;

    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      appearance: none;
    }
  }
}

.quick-amounts {
  display: flex;
  min-width: 0;
  flex: 1;
  gap: 7px;
  flex-wrap: wrap;

  button {
    min-height: 44px;
    padding: 0 12px;
    color: var(--c-text-muted);
    background: rgba(242, 229, 210, 0.035);
    border: 1px solid var(--c-border);
    border-radius: 8px;
    cursor: pointer;
    font-family: inherit;
    font-size: 13px;
    font-weight: 700;

    &.sel,
    &:hover:not(:disabled) {
      color: var(--c-primary);
      border-color: var(--c-primary);
    }

    &.fill-limit {
      color: var(--game-ivory);
      border-color: rgba(185, 167, 220, 0.6);
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }
}

.amount-error {
  color: var(--c-danger);
  font-size: 13px;
  line-height: 1.45;
}

.fee-preview {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  > span {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 10px 12px;
    background: rgba(242, 229, 210, 0.035);
    border-left: 2px solid rgba(214, 166, 74, 0.5);
  }

  small {
    color: var(--c-text-muted);
    font-size: 13px;
  }

  b {
    color: var(--game-ivory);
    font-size: 16px;
    line-height: 1.4;
  }

  b.fee {
    color: var(--c-primary);
  }
}

.actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.main-btn {
  min-height: 46px;
  padding: 9px 16px;
  color: #1a1224;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;

  &.borrow {
    background: var(--btn-gold);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.4),
      0 2px 4px rgba(0, 0, 0, 0.35);
  }

  &.repay {
    background: var(--btn-green);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.bunny-repay-btn {
  width: 100%;
}

.records {
  color: var(--c-text-muted);
  font-size: 13px;

  summary {
    min-height: 30px;
    color: var(--game-ivory);
    cursor: pointer;
    line-height: 30px;
  }
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
}

.record-row {
  display: grid;
  grid-template-columns: 24px minmax(60px, auto) 1fr;
  gap: 10px;
  align-items: center;
  padding: 6px 8px;
  background: rgba(242, 229, 210, 0.025);
}

.record-type {
  font-weight: 700;

  &.r-borrow {
    color: var(--c-primary);
  }

  &.r-repay {
    color: var(--c-success);
  }
}

.record-amount {
  color: var(--c-text);
  min-width: 60px;
}

.hint {
  margin: 0;
  padding-top: 10px;
  color: var(--c-text-muted);
  border-top: 1px solid rgba(242, 229, 210, 0.08);
  font-size: 13px;
  line-height: 1.65;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 480px) {
  .amount-input-wrap {
    width: 100%;

    label {
      flex: 1;
    }

    input {
      width: 100%;
    }
  }

  .quick-amounts {
    width: 100%;

    button {
      flex: 1;
      padding: 0 8px;
    }
  }
}

@media (max-width: 380px) {
  .debt-meta {
    grid-template-columns: 1fr;
    gap: 4px;
  }

  .level-desc {
    text-align: left;
  }

  .amount-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 3px;
  }

  .amount-rule {
    text-align: left;
  }

  .quick-amounts {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    button {
      width: 100%;
      white-space: nowrap;
    }
  }

  .fee-preview {
    grid-template-columns: 1fr;
  }
}
</style>
