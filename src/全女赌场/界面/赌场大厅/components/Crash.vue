<template>
  <div class="crash">
    <div class="crash-stage" :class="{ flying, crashed, cashed }">
      <div class="stage-heading">
        <span>赔率轨道</span>
        <span class="flight-state">{{ crashed ? '已崩盘' : cashed ? '已落袋' : flying ? '飞行中' : '等待起飞' }}</span>
      </div>

      <div class="display">
        <span class="multiplier">
          <span class="multiplier-symbol">×</span>
          <span class="multiplier-number">
            <span>{{ formattedCurrent[0] }}</span>
            <span class="multiplier-decimal">.{{ formattedCurrent[1] }}</span>
          </span>
        </span>
        <span class="rocket" aria-hidden="true">{{ crashed ? '💥' : cashed ? '🪙' : '🚀' }}</span>
        <span v-if="crashed" class="crash-tag">火箭炸掉了</span>
        <span v-else-if="cashed" class="cash-tag">筹码安全落袋</span>
      </div>

      <div class="progress-wrap">
        <div class="progress-bar">
          <div class="progress-fill" :class="{ crashed }" :style="{ width: `${progressPercent}%` }"></div>
          <span class="progress-mark" :style="{ left: `${(MIN_CASHOUT / MAX_DISPLAY) * 100}%` }"></span>
        </div>
        <div class="progress-labels">
          <span>×1.00</span>
          <span class="cashout-mark">最低提现 ×{{ MIN_CASHOUT.toFixed(2) }}</span>
          <span>×{{ MAX_DISPLAY }}</span>
        </div>
      </div>
    </div>

    <div v-if="flying || cashed" class="info-row">
      <span
        ><small>本局下注</small><b>{{ bet.toLocaleString() }}</b></span
      >
      <span
        ><small>{{ cashed ? '已获利' : '潜在获利' }}</small
        ><b class="pos">+{{ potentialProfit.toLocaleString() }}</b></span
      >
    </div>

    <div v-if="resultText" class="game-result-ticket" :class="resultClass">{{ resultText }}</div>

    <template v-if="!flying">
      <BetControl v-model="bet" />
      <button class="game-primary" :disabled="bet <= 0 || bet > wallet.chips.value" @click="start">
        <i class="fa-solid fa-rocket"></i> 起飞
      </button>
    </template>
    <button v-else class="game-primary cashout" :disabled="current < MIN_CASHOUT" @click="cashOut">
      <i class="fa-solid fa-sack-dollar"></i>
      {{ current < MIN_CASHOUT ? `到 ×${MIN_CASHOUT.toFixed(2)} 才能提现` : `提现 ×${current.toFixed(2)}` }}
    </button>

    <div class="rule-strip">
      <span><b>×1.15</b><small>最低提现</small></span>
      <span><b>3%</b><small>起飞即爆</small></span>
      <span><b>97%</b><small>任意倍率期望</small></span>
    </div>
    <p class="hint">提现时机不改变期望，飞多高只看你的胆量。</p>
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
const bet = ref(1000);
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
const formattedCurrent = computed(() => current.value.toFixed(2).split('.'));

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
  gap: 12px;
  font-family: var(--font-main);
}

.crash-stage {
  position: relative;
  overflow: hidden;
  padding: 12px 14px 14px;
  background: linear-gradient(180deg, rgba(242, 229, 210, 0.035), transparent 42%), var(--game-felt);
  border: 1px solid rgba(214, 166, 74, 0.36);
  border-radius: 10px;
  box-shadow: inset 0 0 24px rgba(5, 2, 9, 0.35);

  &::after {
    position: absolute;
    right: -35px;
    bottom: 20px;
    width: 150px;
    height: 1px;
    content: '';
    background: linear-gradient(90deg, transparent, rgba(214, 166, 74, 0.34));
    transform: rotate(-25deg);
    transform-origin: right;
  }

  &.flying .multiplier {
    color: var(--game-mint);
    text-shadow: 0 0 16px rgba(111, 211, 165, 0.3);
  }

  &.crashed .multiplier {
    color: var(--c-danger);
  }

  &.cashed {
    border-color: rgba(111, 211, 165, 0.5);
  }
}

.stage-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--c-text-muted);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.05em;
}

.flight-state {
  padding: 3px 8px;
  color: var(--game-ivory);
  background: rgba(242, 229, 210, 0.05);
  border: 1px solid rgba(242, 229, 210, 0.12);
  border-radius: 999px;
  font-family: var(--font-main);
  font-size: 13px;
  letter-spacing: 0;
}

.display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  min-height: 122px;
  padding: 10px;

  .multiplier {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.12em;
    color: var(--game-ivory);
    font-size: clamp(44px, 10vw, 58px);
    line-height: 1;
  }

  .multiplier-symbol {
    display: inline-flex;
    align-items: center;
    align-self: center;
    font-family: var(--font-main);
    font-size: 0.78em;
    font-weight: 400;
    line-height: 1;
  }

  .multiplier-number {
    display: inline-flex;
    align-items: baseline;
    font-family: var(--font-led);
    font-weight: 700;
    line-height: 1;
  }

  .multiplier-decimal {
    margin-left: 0.08em;
  }

  .rocket {
    font-size: 25px;
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
  gap: 5px;
}

.progress-bar {
  position: relative;
  height: 17px;
  background: repeating-linear-gradient(90deg, transparent 0 9%, rgba(242, 229, 210, 0.1) 9% 9.4%), #0f0915;
  border: 1px solid rgba(214, 166, 74, 0.34);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4a9e79, var(--game-mint), var(--game-gold));
  box-shadow: 0 0 10px rgba(111, 211, 165, 0.3);
  transition: width 0.1s linear;

  &.crashed {
    background: var(--c-danger);
  }
}

.progress-mark {
  position: absolute;
  top: -2px;
  bottom: -2px;
  width: 3px;
  background: var(--game-ivory);
  box-shadow: 0 0 5px rgba(242, 229, 210, 0.5);
  opacity: 0.85;
}

.progress-labels {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  font-size: 13px;
  color: var(--c-text-muted);

  span:last-child {
    text-align: right;
  }

  .cashout-mark {
    color: var(--game-ivory);
  }
}

.info-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  > span {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    padding: 8px 10px;
    background: rgba(242, 229, 210, 0.04);
    border: 1px solid rgba(242, 229, 210, 0.1);
    border-radius: 7px;
  }

  small {
    color: var(--c-text-muted);
    font-size: 13px;
  }

  b {
    color: var(--game-ivory);
    font-size: 16px;
  }

  .pos {
    color: var(--game-mint);
  }
}

.rule-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 7px;

  span {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 8px 4px;
    background: rgba(242, 229, 210, 0.035);
    border-top: 1px solid rgba(214, 166, 74, 0.24);
  }

  b {
    color: var(--game-gold);
    font-family: var(--font-led);
    font-size: 14px;
  }

  small {
    color: var(--c-text-muted);
    font-size: 13px;
  }
}

.hint {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  text-align: center;
  color: var(--c-text-muted);
}

@media (max-width: 380px) {
  .display {
    min-height: 110px;
  }

  .progress-labels .cashout-mark {
    font-size: 13px;
  }
}
</style>
