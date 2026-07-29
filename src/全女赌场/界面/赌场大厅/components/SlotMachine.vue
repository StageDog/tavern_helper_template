<template>
  <div class="slot">
    <div class="machine">
      <div class="machine-marquee">
        <span><i class="fa-solid fa-star"></i> 兔窟幸运机</span>
        <small>三列 · 八线</small>
      </div>
      <div class="reel-window">
        <div class="grid">
          <!-- 按 3 列组织：每列一条纵向滚动带，依次停轮 -->
          <div v-for="col in 3" :key="col" class="reel-col" :class="{ rolling: rollingCols[col - 1] }">
            <div class="reel-strip" :style="rollingCols[col - 1] ? {} : { transform: 'translateY(0)' }">
              <span
                v-for="row in 3"
                :key="row"
                class="cell"
                :class="{ hit: hitCells.has((row - 1) * 3 + (col - 1)) }"
                >{{ display[(row - 1) * 3 + (col - 1)] }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="resultText" class="game-result-ticket" :class="resultClass">{{ resultText }}</div>

    <BetControl v-model="bet" :disabled="spinning" />
    <button class="game-primary spin-button" :disabled="spinning || bet <= 0 || bet > wallet.chips.value" @click="spin">
      <i class="fa-solid" :class="spinning ? 'fa-spinner fa-spin' : 'fa-play'"></i>
      {{ spinning ? '转轮滚动中' : '拉下摇杆' }}
    </button>

    <details class="paytable">
      <summary><i class="fa-solid fa-receipt"></i> 查看赔率表</summary>
      <div class="pay-section">
        <div class="pay-column">
          <b>符号倍数</b>
          <table>
            <tbody>
              <tr v-for="s in SYMBOLS" :key="s.icon">
                <td>{{ s.icon }} {{ s.name }}</td>
                <td>×{{ s.multiplier }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pay-column">
          <b>获胜线</b>
          <table>
            <tbody>
              <tr>
                <td>横线 / 竖线</td>
                <td>符号 ×7.0</td>
              </tr>
              <tr>
                <td>两条对角线</td>
                <td>符号 ×3.8</td>
              </tr>
              <tr>
                <td>🌟 全屏相同</td>
                <td>符号 ×250</td>
              </tr>
            </tbody>
          </table>
        </div>
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
const bet = ref(1000);
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
  gap: 12px;
}

.machine {
  max-width: 360px;
  margin: 0 auto;
  padding: 10px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.24), transparent 22%),
    linear-gradient(
      180deg,
      var(--game-machine-edge) 0%,
      var(--game-machine-surface) 48%,
      var(--game-machine-shadow) 100%
    );
  border: 2px solid var(--game-machine-edge);
  border-radius: 14px;
  box-shadow:
    inset 0 0 0 2px rgba(54, 39, 63, 0.42),
    0 7px 18px rgba(5, 2, 9, 0.42);
}

.machine-marquee {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 5px 6px 10px;
  color: #2b1931;
  font-family: var(--game-display-font);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.08em;

  i {
    color: var(--game-wine);
    margin-right: 3px;
  }

  small {
    font-family: var(--font-main);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.04em;
  }
}

.reel-window {
  position: relative;
  padding: 10px 17px;
  background:
    linear-gradient(180deg, rgba(5, 2, 9, 0.28), transparent 12%, transparent 88%, rgba(5, 2, 9, 0.3)), #211329;
  border: 3px double rgba(242, 229, 210, 0.68);
  border-radius: 9px;
  box-shadow: inset 0 0 18px rgba(5, 2, 9, 0.72);
}

.slot > .spin-button {
  margin-top: 6px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 7px;
  width: min(300px, 74vw);
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
  gap: 7px;
}

@keyframes reel-roll {
  from {
    transform: translateY(-4px);
  }
  50% {
    transform: translateY(3px);
  }
  to {
    transform: translateY(-4px);
  }
}

.cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  font-size: clamp(28px, 8vw, 38px);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.7), transparent 28%, transparent 72%, rgba(81, 52, 36, 0.12)),
    var(--game-ivory);
  border: 1px solid #fff8ed;
  border-radius: 7px;
  box-shadow: inset 0 0 0 1px rgba(70, 39, 25, 0.16);

  &.hit {
    border: 2px solid var(--game-mint);
    background:
      linear-gradient(rgba(111, 211, 165, 0.12), rgba(111, 211, 165, 0.12)),
      linear-gradient(180deg, rgba(255, 255, 255, 0.7), transparent 28%, transparent 72%, rgba(81, 52, 36, 0.12)),
      var(--game-ivory);
    box-shadow:
      inset 0 0 0 2px rgba(244, 255, 250, 0.88),
      0 0 0 2px rgba(111, 211, 165, 0.34),
      0 0 14px rgba(111, 211, 165, 0.58);
    animation: win-flash 0.7s ease-out;
  }
}

.paytable {
  font-size: 13px;
  color: var(--c-text-muted);
  border-top: 1px solid rgba(242, 229, 210, 0.1);

  summary {
    padding: 9px 2px 2px;
    color: var(--game-ivory);
    cursor: pointer;
    font-size: 14px;

    i {
      color: var(--game-gold);
      margin-right: 4px;
    }
  }

  .pay-section {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-top: 10px;
    padding: 11px;
    background: rgba(242, 229, 210, 0.035);
    border: 1px solid rgba(214, 166, 74, 0.2);
    border-radius: 8px;

    b {
      color: var(--game-gold);
      font-family: var(--game-display-font);
      font-size: 14px;
    }
  }

  .pay-column {
    min-width: 0;
  }

  table {
    width: 100%;
    margin-top: 5px;
    border-collapse: collapse;
  }

  table td {
    padding: 3px 8px 3px 0;
    border-bottom: 1px solid rgba(242, 229, 210, 0.06);

    &:last-child {
      color: var(--game-ivory);
      text-align: right;
      white-space: nowrap;
    }
  }

  .pay-note {
    grid-column: 1 / -1;
    font-size: 13px;
    line-height: 1.5;
  }
}

@media (max-width: 480px) {
  .machine {
    padding: 8px;
  }

  .reel-window {
    padding: 8px 14px;
  }

  .grid {
    width: min(280px, 75vw);
    gap: 5px;
  }

  .reel-strip {
    gap: 5px;
  }

  .paytable .pay-section {
    grid-template-columns: 1fr;
  }

  .paytable .pay-note {
    grid-column: 1;
  }
}
</style>
