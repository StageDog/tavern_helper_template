<template>
  <div class="slot">
    <div class="grid">
      <!-- 按 3 列组织：每列一条纵向滚动带，依次停轮 -->
      <div v-for="col in 3" :key="col" class="reel-col" :class="{ rolling: rollingCols[col - 1] }">
        <div class="reel-strip" :style="rollingCols[col - 1] ? {} : { transform: 'translateY(0)' }">
          <span
            v-for="row in 3"
            :key="row"
            class="cell"
            :class="{ hit: hitCells.has((row - 1) * 3 + (col - 1)) }"
          >{{ display[(row - 1) * 3 + (col - 1)] }}</span>
        </div>
      </div>
    </div>

    <div v-if="resultText" class="result" :class="resultClass">{{ resultText }}</div>

    <BetControl v-model="bet" :disabled="spinning" />
    <button class="main-btn" :disabled="spinning || bet <= 0 || bet > wallet.chips.value" @click="spin">
      <i class="fa-solid fa-play"></i> 拉杆！
    </button>

    <details class="paytable">
      <summary>赔率表（点开看看～）</summary>
      <div class="pay-section">
        <b>符号倍数</b>
        <table>
          <tbody>
            <tr v-for="s in SYMBOLS" :key="s.icon">
              <td>{{ s.icon }} {{ s.name }}</td>
              <td>×{{ s.multiplier }}</td>
            </tr>
          </tbody>
        </table>
        <b>获胜线（连 3 个相同符号）</b>
        <table>
          <tbody>
            <tr><td>横线 / 竖线（共6条）</td><td>符号倍数 ×7.0</td></tr>
            <tr><td>对角线（共2条）</td><td>符号倍数 ×3.8</td></tr>
            <tr><td>🌟 全屏 9 个相同</td><td>符号倍数 ×250！</td></tr>
          </tbody>
        </table>
        <span class="pay-note">最终奖励 = 下注 × 线倍数 × 符号倍数，多线中奖可以叠加哦</span>
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import { useWallet } from '../wallet';
import BetControl from './BetControl.vue';

// 符号、倍数与权重（权重越高越常见）
const SYMBOLS = [
  { icon: '7️⃣', name: '幸运7', multiplier: 100, weight: 2 },
  { icon: '🍀', name: '四叶草', multiplier: 30, weight: 4 },
  { icon: '💎', name: '钻石', multiplier: 15, weight: 6 },
  { icon: '🔔', name: '铃铛', multiplier: 8, weight: 9 },
  { icon: '🍒', name: '樱桃', multiplier: 0.5, weight: 18 },
  { icon: '🍇', name: '葡萄', multiplier: 0.4, weight: 20 },
  { icon: '🍉', name: '西瓜', multiplier: 0.3, weight: 21 },
  { icon: '🍋', name: '柠檬', multiplier: 0.2, weight: 22 },
] as const;

// 8 条获胜线：3横 + 3竖 + 2对角
const LINES: { cells: [number, number, number]; multiplier: number }[] = [
  { cells: [0, 1, 2], multiplier: 7.0 },
  { cells: [3, 4, 5], multiplier: 7.0 },
  { cells: [6, 7, 8], multiplier: 7.0 },
  { cells: [0, 3, 6], multiplier: 7.0 },
  { cells: [1, 4, 7], multiplier: 7.0 },
  { cells: [2, 5, 8], multiplier: 7.0 },
  { cells: [0, 4, 8], multiplier: 3.8 },
  { cells: [2, 4, 6], multiplier: 3.8 },
];

const FULLSCREEN_MULTIPLIER = 250;

const wallet = useWallet();
const bet = ref(100);
const display = ref<string[]>(['7️⃣', '🍀', '💎', '🔔', '🍒', '🍇', '🍉', '🍋', '7️⃣']);
const spinning = ref(false);
const resultText = ref('');
const resultClass = ref('');
const hitCells = ref<Set<number>>(new Set());
// 每列滚动状态：依次停轮
const rollingCols = ref<boolean[]>([false, false, false]);

function rollSymbol(): (typeof SYMBOLS)[number] {
  const total = _.sumBy(SYMBOLS, 'weight');
  let roll = Math.random() * total;
  for (const symbol of SYMBOLS) {
    roll -= symbol.weight;
    if (roll < 0) return symbol;
  }
  return SYMBOLS[SYMBOLS.length - 1];
}

function rollGrid(): string[] {
  return Array.from({ length: 9 }, () => rollSymbol().icon);
}

async function spin() {
  if (!wallet.placeBet(bet.value)) return;
  spinning.value = true;
  resultText.value = '';
  hitCells.value = new Set();
  rollingCols.value = [true, true, true];

  const final = rollGrid();

  // 滚动期间随机刷新符号；三列依次停轮（500/800/1100ms）
  const timer = setInterval(() => {
    const next = [...display.value];
    for (let col = 0; col < 3; col++) {
      if (!rollingCols.value[col]) continue;
      for (let row = 0; row < 3; row++) {
        next[row * 3 + col] = rollSymbol().icon;
      }
    }
    display.value = next;
  }, 70);

  for (let col = 0; col < 3; col++) {
    await new Promise(resolve => setTimeout(resolve, col === 0 ? 500 : 300));
    rollingCols.value[col] = false;
    const settled = [...display.value];
    for (let row = 0; row < 3; row++) {
      settled[row * 3 + col] = final[row * 3 + col];
    }
    display.value = settled;
  }
  clearInterval(timer);
  display.value = final;
  spinning.value = false;

  // 结算
  const symbolOf = (icon: string) => SYMBOLS.find(s => s.icon === icon)!;
  let totalWin = 0;
  const hits = new Set<number>();
  const lineDescs: string[] = [];

  if (final.every(icon => icon === final[0])) {
    // 全屏大奖
    const symbol = symbolOf(final[0]);
    totalWin = Math.floor(bet.value * FULLSCREEN_MULTIPLIER * symbol.multiplier);
    final.forEach((__, i) => hits.add(i));
    lineDescs.push(`全屏${symbol.icon}`);
    setResult(`🌟🌟 全屏 ${symbol.icon}！超级大奖 ${totalWin.toLocaleString()}！！`, 'win');
  } else {
    for (const line of LINES) {
      const [a, b, c] = line.cells;
      if (final[a] === final[b] && final[b] === final[c]) {
        const symbol = symbolOf(final[a]);
        totalWin += Math.floor(bet.value * line.multiplier * symbol.multiplier);
        line.cells.forEach(i => hits.add(i));
        lineDescs.push(`${line.multiplier === 3.8 ? '对角' : '直线'}${symbol.icon}`);
      }
    }
    if (totalWin > 0) {
      const net = totalWin - bet.value;
      setResult(
        `中奖啦！🎉 ${lineDescs.join('、')}，拿到 ${totalWin.toLocaleString()}${net < 0 ? '（不过还是小亏一点点…）' : '～'}`,
        net >= 0 ? 'win' : 'push',
      );
    } else {
      setResult(`什么都没中呜… ${bet.value} token 溜走了`, 'lose');
    }
  }

  hitCells.value = hits;
  if (totalWin > 0) wallet.payout(totalWin);
  const net = totalWin - bet.value;
  wallet.pushEvent(
    `老虎机：下注${bet.value}，${lineDescs.length ? `中${lineDescs.join('、')}` : '未中奖'}，${net >= 0 ? `赢${net}` : `输${-net}`}`,
  );
}

function setResult(text: string, cls: string) {
  resultText.value = text;
  resultClass.value = cls;
}
</script>

<style lang="scss" scoped>
.slot {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  max-width: 250px;
  margin: 0 auto;
}

.reel-col {
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  /* 滚动带上下渐隐，营造机械滚轮观感 */
  &.rolling .reel-strip {
    animation: reel-roll 0.18s linear infinite;
    filter: blur(1px);
  }
}

.reel-strip {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@keyframes reel-roll {
  from { transform: translateY(-4px); }
  50% { transform: translateY(3px); }
  to { transform: translateY(-4px); }
}

.cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.05), transparent 30%, transparent 70%, rgba(0, 0, 0, 0.25)),
    var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 8px;

  &.hit {
    border-color: var(--c-primary);
    box-shadow: var(--glow-gold);
    animation: win-flash 0.7s ease-out;
  }
}

.main-btn {
  background: var(--btn-gold);
  border: none;
  border-radius: 6px;
  color: #1a1224;
  font-weight: bold;
  padding: 7px 16px;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.35);
  transition: filter 0.15s, transform 0.1s;

  &:hover:not(:disabled) {
    filter: brightness(1.12);
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
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

  &.push {
    color: var(--c-text-muted);
  }
}

.paytable {
  font-size: 12px;
  color: var(--c-text-muted);

  summary {
    cursor: pointer;
  }

  .pay-section {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 6px;

    b {
      color: var(--c-text);
    }
  }

  table td {
    padding: 1px 10px 1px 0;
  }

  .pay-note {
    font-size: 11px;
  }
}
</style>
