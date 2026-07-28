<template>
  <div class="crash">
    <div class="display" :class="{ flying, crashed }">
      <span class="multiplier">×{{ current.toFixed(2) }} <span class="rocket">{{ crashed ? '💥' : '🚀' }}</span></span>
      <span v-if="crashed" class="crash-tag">砰！火箭炸掉了…</span>
      <span v-else-if="cashed" class="cash-tag">安全落袋！🎉</span>
    </div>

    <div class="progress-wrap">
      <div class="progress-bar">
        <div class="progress-fill" :class="{ crashed }" :style="{ width: `${progressPercent}%` }"></div>
        <span class="progress-mark" :style="{ left: `${(MIN_CASHOUT / MAX_DISPLAY) * 100}%` }"></span>
      </div>
      <div class="progress-labels">
        <span>1x</span>
        <span>{{ MAX_DISPLAY }}x</span>
      </div>
    </div>

    <div v-if="flying || cashed" class="info-row">
      <span>下注 <b>{{ bet.toLocaleString() }}</b></span>
      <span>{{ cashed ? '获利' : '潜在获利' }} <b class="pos">+{{ potentialProfit.toLocaleString() }}</b></span>
    </div>

    <div v-if="resultText" class="result" :class="resultClass">{{ resultText }}</div>

    <template v-if="!flying">
      <BetControl v-model="bet" />
      <button class="main-btn" :disabled="bet <= 0 || bet > wallet.chips.value" @click="start">
        <i class="fa-solid fa-rocket"></i> 起飞！
      </button>
    </template>
    <button v-else class="main-btn cashout" :disabled="current < MIN_CASHOUT" @click="cashOut">
      <i class="fa-solid fa-sack-dollar"></i>
      {{ current < MIN_CASHOUT ? `到 ×${MIN_CASHOUT.toFixed(2)} 才能提现哦` : `提现 ×${current.toFixed(2)}` }}
    </button>

    <p class="hint">
      ⚠️ 最低提现倍率 ×1.15 ｜ 3% 概率起飞就炸，任何时候提现期望都是 97%——飞多高全看你的胆量！
    </p>
  </div>
</template>

<script setup lang="ts">
import { useWallet } from '../wallet';
import BetControl from './BetControl.vue';

const RTP = 0.97;
const GROWTH_RATE = 0.09; // 每秒指数增长率
const MIN_CASHOUT = 1.15; // 最低提现倍率
const MAX_DISPLAY = 20; // 进度条上限

const wallet = useWallet();
const bet = ref(100);
const current = ref(1);
const flying = ref(false);
const crashed = ref(false);
const cashed = ref(false);
const resultText = ref('');
const resultClass = ref('');

let crashPoint = 1;
let startTime = 0;
let rafId = 0;

const progressPercent = computed(() => Math.min(100, (current.value / MAX_DISPLAY) * 100));
const potentialProfit = computed(() => Math.max(0, Math.floor(bet.value * current.value) - bet.value));

/**
 * 早爆几率 + 恒定 RTP 分布：
 *   P(crash >= m) = RTP / m （m >= 1），即 3% 概率 m=1.00 起飞即爆；
 *   任意倍率 m 落袋的期望 = m * P(crash >= m) = RTP，恒定 97%。
 */
function rollCrashPoint(): number {
  const raw = RTP / Math.random();
  return raw < 1 ? 1 : Math.floor(raw * 100) / 100;
}

function start() {
  if (!wallet.placeBet(bet.value)) return;
  crashPoint = rollCrashPoint();
  flying.value = true;
  crashed.value = false;
  cashed.value = false;
  resultText.value = '';
  current.value = 1;
  startTime = performance.now();

  if (crashPoint <= 1) {
    // 早爆：起飞瞬间崩盘
    bust();
    return;
  }
  rafId = requestAnimationFrame(tick);
}

function tick(now: number) {
  const elapsed = (now - startTime) / 1000;
  const value = Math.exp(GROWTH_RATE * elapsed * Math.max(1, elapsed * 0.6));
  if (value >= crashPoint) {
    current.value = crashPoint;
    bust();
    return;
  }
  current.value = Math.floor(value * 100) / 100;
  rafId = requestAnimationFrame(tick);
}

function bust() {
  crashed.value = true;
  flying.value = false;
  if (!cashed.value) {
    resultText.value = `火箭在 ×${crashPoint.toFixed(2)} 炸掉啦！💥 ${bet.value} token 化成了烟花…`;
    resultClass.value = 'lose';
    wallet.pushEvent(`Crash：下注${bet.value}，崩盘于×${crashPoint.toFixed(2)}，输${bet.value}`);
  }
}

function cashOut() {
  if (!flying.value || cashed.value || current.value < MIN_CASHOUT) return;
  cashed.value = true;
  cancelAnimationFrame(rafId);
  flying.value = false;
  const win = Math.floor(bet.value * current.value);
  wallet.payout(win);
  resultText.value = `×${current.value.toFixed(2)} 稳稳落袋！🎉 赚到 ${win - bet.value}～`;
  resultClass.value = 'win';
  wallet.pushEvent(`Crash：下注${bet.value}，×${current.value.toFixed(2)}落袋，赢${win - bet.value}`);
}

onUnmounted(() => cancelAnimationFrame(rafId));
</script>

<style lang="scss" scoped>
.crash {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 16px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 8px;

  .multiplier {
    font-size: 32px;
    font-weight: bold;
    color: var(--c-text);
  }

  .rocket {
    font-size: 24px;
  }

  &.flying .multiplier {
    color: var(--c-success);
  }

  &.crashed .multiplier {
    color: var(--c-danger);
  }
}

.crash-tag {
  color: var(--c-danger);
  font-weight: bold;
}

.cash-tag {
  color: var(--c-success);
  font-weight: bold;
}

.progress-wrap {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.progress-bar {
  position: relative;
  height: 14px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 7px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--c-success), var(--c-primary));
  box-shadow: var(--glow-green);
  transition: width 0.1s linear;

  &.crashed {
    background: var(--c-danger);
  }
}

.progress-mark {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--c-text-muted);
  opacity: 0.7;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--c-text-muted);
}

.info-row {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--c-text-muted);

  b {
    color: var(--c-text);
  }

  .pos {
    color: var(--c-success);
  }
}

.main-btn {
  background: var(--btn-gold);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 2px 4px rgba(0, 0, 0, 0.35);
  border: none;
  border-radius: 6px;
  color: #1a1224;
  font-weight: bold;
  padding: 8px 16px;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;

  &.cashout {
    background: var(--btn-green);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.result {
  text-align: center;
  font-weight: bold;

  &.win {
    color: var(--c-success);
  }

  &.lose {
    color: var(--c-danger);
  }
}

.hint {
  margin: 0;
  font-size: 11px;
  color: var(--c-text-muted);
}
</style>
