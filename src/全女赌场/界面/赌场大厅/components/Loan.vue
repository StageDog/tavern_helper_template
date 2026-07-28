<template>
  <div class="loan">
    <!-- 欠债总览 -->
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

    <!-- 兔女郎抵债模式 -->
    <div v-if="wallet.isBunny.value" class="bunny-panel">
      <div class="bunny-head">🐰 抵债工作中…</div>
      <div class="bunny-progress">
        <span class="bunny-label">本档进度</span>
        <div class="debt-bar">
          <div class="bunny-fill" :style="{ width: `${wallet.store.data.主角.兔女郎工作进度}%` }"></div>
        </div>
        <span class="bunny-num">{{ wallet.store.data.主角.兔女郎工作进度 }}/100</span>
      </div>
      <p class="bunny-info">
        每攒满 100 进度可以抵掉 {{ wallet.REDEMPTION_UNIT.toLocaleString() }} 欠债，
        离赎身还要打满 <b>{{ unitsLeft }}</b> 档工作…加油哦
      </p>
      <!-- 兔女郎也可直接用筹码还款 -->
      <div class="bunny-repay">
        <span class="bunny-repay-label">💰 手头有筹码也可以直接还款加速赎身</span>
        <div class="op-row">
          <span class="op-label">金额</span>
          <div class="amount-wrap">
            <button v-for="q in QUICK" :key="q" :class="{ sel: amount === q }" @click="amount = q">
              {{ q.toLocaleString() }}
            </button>
          </div>
        </div>
        <button class="main-btn repay bunny-repay-btn" :disabled="!canRepay" @click="doRepay">
          <i class="fa-solid fa-circle-check"></i> 还款 {{ amount.toLocaleString() }}
        </button>
      </div>
    </div>

    <!-- 赌客借还操作 -->
    <template v-else>
      <div class="op-row">
        <span class="op-label">金额</span>
        <div class="amount-wrap">
          <button v-for="q in QUICK" :key="q" :class="{ sel: amount === q }" @click="amount = q">
            {{ q.toLocaleString() }}
          </button>
        </div>
      </div>

      <p class="fee-preview">
        到手 <b>{{ amount.toLocaleString() }}</b> ｜ 记账
        <b class="fee">{{ booked.toLocaleString() }}</b>（含 {{ wallet.LOAN_FEE_RATE * 100 }}% 手续费）
      </p>

      <div class="actions">
        <button class="main-btn borrow" :disabled="!canBorrow" @click="doBorrow">
          <i class="fa-solid fa-hand-holding-dollar"></i> 借款
        </button>
        <button class="main-btn repay" :disabled="!canRepay" @click="doRepay">
          <i class="fa-solid fa-circle-check"></i> 还款
        </button>
      </div>
    </template>

    <!-- 借还流水 -->
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
      💡 找前台小姐借 token 只收一点点手续费，但欠着不还的话……会被请去后台「谈心」的哦。
      额度用完、token 又输光的话，就只能穿上兔女郎制服下海打工抵债啦～
    </p>
  </div>
</template>

<script setup lang="ts">
import { useWallet } from '../wallet';

// 4500×1.1=4950，正好贴着 5000 额度上限
const QUICK = [500, 1000, 2000, 4500];

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
const amount = ref(1000);
const toast = ref('');
const toastClass = ref('');
let toastTimer = 0;

const records = useLocalStorage<LoanRecord[]>('casino_loan:records', []);

const debtRatio = computed(() => Math.min(1, wallet.debt.value / wallet.DEBT_LIMIT));
const level = computed(() => LEVELS.find(l => debtRatio.value < l.max) ?? LEVELS[LEVELS.length - 1]);

const booked = computed(() => Math.round(amount.value * (1 + wallet.LOAN_FEE_RATE)));
const canBorrow = computed(() => wallet.debt.value + booked.value <= wallet.DEBT_LIMIT);
const canRepay = computed(() => wallet.debt.value > 0 && wallet.chips.value > 0);

const unitsLeft = computed(() => Math.ceil(wallet.debt.value / wallet.REDEMPTION_UNIT));

function addRecord(type: '借' | '还', recordAmount: number) {
  records.value = [{ type, amount: recordAmount, after: wallet.debt.value }, ...records.value].slice(0, 8);
}

function doBorrow() {
  if (wallet.borrow(amount.value)) {
    addRecord('借', amount.value);
    showToast(`借到 ${amount.value.toLocaleString()} token！账上记了 ${booked.value.toLocaleString()} 哦～`, 'ok');
    wallet.pushEvent(`借贷：借款${amount.value}（含手续费记账${booked.value}），当前欠债${wallet.debt.value}`);
  } else {
    showToast('超出额度上限，前台小姐摇了摇头…', 'fail');
  }
}

function doRepay() {
  const actual = wallet.repay(amount.value);
  if (actual > 0) {
    addRecord('还', actual);
    showToast(
      wallet.debt.value === 0 ? '还清了！全部债务一笔勾销🎉' : `还了 ${actual.toLocaleString()}，还欠 ${wallet.debt.value.toLocaleString()}`,
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
  gap: 10px;
}

.debt-panel {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 8px;
  padding: 10px 12px;

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
  align-items: baseline;
  gap: 10px;
}

.debt-label {
  font-size: 11px;
  color: var(--c-text-muted);
}

.debt-value {
  font-size: 26px;
  font-weight: bold;
  color: var(--c-text);
}

.level-badge {
  font-size: 11px;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid var(--c-border);
  color: var(--c-text-muted);

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
  height: 8px;
  background: var(--c-surface-alt);
  border-radius: 4px;
  overflow: hidden;
  flex: 1;
}

.debt-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--c-primary), var(--c-danger));
  box-shadow: var(--glow-pink);
  transition: width 0.4s;
}

.debt-meta {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--c-text-muted);
}

.level-desc {
  font-style: italic;
}

.toast {
  text-align: center;
  font-weight: bold;

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
  gap: 8px;
  background: var(--c-surface);
  border: 1px solid var(--c-danger);
  border-radius: 8px;
  padding: 10px 12px;
}

.bunny-head {
  font-weight: bold;
  color: var(--c-danger);
}

.bunny-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bunny-label,
.bunny-num {
  font-size: 11px;
  color: var(--c-text-muted);
  white-space: nowrap;
}

.bunny-fill {
  height: 100%;
  background: var(--c-danger);
  transition: width 0.4s;
}

.bunny-info {
  margin: 0;
  font-size: 12px;
  color: var(--c-text);

  b {
    color: var(--c-danger);
  }
}

.bunny-repay {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 8px;
  margin-top: 2px;
}

.bunny-repay-label {
  font-size: 11px;
  color: var(--c-text-muted);
}

.bunny-repay-btn {
  width: 100%;
}

.op-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.op-label {
  font-size: 12px;
  color: var(--c-text-muted);
}

.amount-wrap {
  display: flex;
  gap: 6px;

  button {
    background: var(--c-surface);
    border: 1px solid var(--c-border);
    border-radius: 6px;
    color: var(--c-text-muted);
    padding: 5px 12px;
    font-size: 12px;
    cursor: pointer;
    font-family: inherit;

    &.sel {
      color: var(--c-primary);
      border-color: var(--c-primary);
    }
  }
}

.fee-preview {
  margin: 0;
  font-size: 12px;
  color: var(--c-text-muted);

  b {
    color: var(--c-text);
  }

  .fee {
    color: var(--c-primary);
  }
}

.actions {
  display: flex;
  gap: 8px;
}

.main-btn {
  flex: 1;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  padding: 8px 16px;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  color: #1a1224;

  &.borrow {
    background: var(--btn-gold);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 2px 4px rgba(0, 0, 0, 0.35);
  }

  &.repay {
    background: var(--btn-green);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.records {
  font-size: 12px;
  color: var(--c-text-muted);

  summary {
    cursor: pointer;
  }
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 6px;
}

.record-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.record-type {
  font-weight: bold;
  width: 18px;

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
  font-size: 11px;
  color: var(--c-text-muted);
}
</style>
