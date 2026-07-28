<template>
  <div class="blackjack">
    <div class="session-stats">
      <span>总盈亏
        <b :class="stats.profit >= 0 ? 'pos' : 'neg'">{{ stats.profit >= 0 ? '+' : '' }}{{ stats.profit.toLocaleString() }}</b>
      </span>
      <span>胜率 <b>{{ winRate }}%</b></span>
      <span>总场次 <b>{{ stats.games }}</b></span>
    </div>

    <template v-if="phase === 'bet'">
      <BetControl v-model="bet" />
      <button class="main-btn" :disabled="bet <= 0 || bet > wallet.chips.value" @click="deal">发牌！</button>
      <p class="hint">要牌到 5 张不爆算「过五关」直接获胜～ Blackjack 赔 1.5 倍哦</p>
    </template>

    <template v-else>
      <div class="hand">
        <span class="hand-label">🎰 荷官手牌</span>
        <div class="hand-row">
          <span class="hand-total">{{ phase === 'player' ? '?' : handValue(dealer) }}<template v-if="phase === 'done' && handValue(dealer) > 21">💥</template></span>
          <div class="cards">
            <span v-for="(card, i) in dealer" :key="i" class="card" :class="{ red: isRed(card), back: phase === 'player' && i === 1 }">
              {{ phase === 'player' && i === 1 ? '🂠' : cardText(card) }}
            </span>
          </div>
        </div>
      </div>
      <div class="hand">
        <span class="hand-label">🐰 你的手牌</span>
        <div class="hand-row">
          <span class="hand-total">{{ handValue(player) }}<template v-if="playerBusted">💥</template><template v-else-if="isNatural">😼</template></span>
          <div class="cards">
            <span v-for="(card, i) in player" :key="i" class="card" :class="{ red: isRed(card) }">{{ cardText(card) }}</span>
          </div>
        </div>
      </div>

      <div v-if="phase === 'player'" class="actions">
        <button class="main-btn" @click="hit">要牌！</button>
        <button class="main-btn" @click="stand">停牌～</button>
      </div>

      <div v-if="phase === 'done'" class="result" :class="resultClass">
        {{ resultText }}
        <button class="main-btn" @click="reset">再来一局！</button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useWallet } from '../wallet';
import BetControl from './BetControl.vue';

// 牌值：1~13（A~K），花色 0~3（黑桃/红心/方块/梅花）
interface Card {
  rank: number;
  suit: number;
}

const wallet = useWallet();
const bet = ref(100);
const phase = ref<'bet' | 'player' | 'done'>('bet');
const player = ref<Card[]>([]);
const dealer = ref<Card[]>([]);
const resultText = ref('');
const resultClass = ref('');
let deck: Card[] = [];

// 本地会话战绩（仅前端展示，不进 MVU）
const stats = useLocalStorage('casino_blackjack:stats', { games: 0, wins: 0, profit: 0 });
const winRate = computed(() => (stats.value.games === 0 ? 0 : Math.round((stats.value.wins / stats.value.games) * 1000) / 10));

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function cardText(card: Card) {
  return `${SUITS[card.suit]}${RANKS[card.rank - 1]}`;
}

function isRed(card: Card) {
  return card.suit === 1 || card.suit === 2;
}

function newDeck(): Card[] {
  const cards: Card[] = [];
  for (let suit = 0; suit < 4; suit++) {
    for (let rank = 1; rank <= 13; rank++) {
      cards.push({ rank, suit });
    }
  }
  return _.shuffle(cards);
}

function handValue(hand: Card[]): number {
  let total = 0;
  let aces = 0;
  for (const card of hand) {
    if (card.rank === 1) {
      aces++;
      total += 11;
    } else {
      total += Math.min(card.rank, 10);
    }
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

const playerBusted = computed(() => handValue(player.value) > 21);
const isNatural = computed(() => player.value.length === 2 && handValue(player.value) === 21);

function deal() {
  if (!wallet.placeBet(bet.value)) return;
  deck = newDeck();
  player.value = [deck.pop()!, deck.pop()!];
  dealer.value = [deck.pop()!, deck.pop()!];
  phase.value = 'player';

  // 天生21点直接结算
  if (isNatural.value) {
    settle();
  }
}

function hit() {
  player.value.push(deck.pop()!);
  const value = handValue(player.value);
  // 爆牌、凑满21、或攒满5张（过五关判定）都自动结算
  if (value >= 21 || player.value.length >= 5) {
    settle();
  }
}

function stand() {
  settle();
}

function settle() {
  const stake = bet.value;
  const playerValue = handValue(player.value);
  const fiveCharlie = player.value.length >= 5 && playerValue <= 21;

  if (playerValue <= 21 && !isNatural.value && !fiveCharlie) {
    // 荷官按规则补到17
    while (handValue(dealer.value) < 17) {
      dealer.value.push(deck.pop()!);
    }
  }
  const dealerValue = handValue(dealer.value);

  let delta: number;
  if (playerValue > 21) {
    delta = -stake;
    setResult(`呜哇爆牌了！💥 ${stake} token 飞走啦…`, 'lose');
  } else if (isNatural.value) {
    delta = Math.floor(stake * 1.5);
    wallet.payout(stake + delta);
    setResult(`Blackjack！😼 天选之人！赢得 ${delta}～`, 'win');
  } else if (fiveCharlie) {
    delta = stake;
    wallet.payout(stake * 2);
    setResult(`过五关！🎉 五张牌都稳稳的，赢得 ${stake}！`, 'win');
  } else if (dealerValue > 21) {
    delta = stake;
    wallet.payout(stake * 2);
    setResult(`荷官姐姐爆牌啦！💥 你赢得 ${stake}～`, 'win');
  } else if (playerValue > dealerValue) {
    delta = stake;
    wallet.payout(stake * 2);
    setResult(`点数压过荷官！🎉 赢得 ${stake}～`, 'win');
  } else if (playerValue === dealerValue) {
    delta = 0;
    wallet.payout(stake);
    setResult('平局～ token 还你啦', 'push');
  } else {
    delta = -stake;
    setResult(`荷官姐姐赢了呜… ${stake} token 被收走了`, 'lose');
  }

  stats.value.games++;
  if (delta > 0) stats.value.wins++;
  stats.value.profit += delta;

  wallet.pushEvent(
    `21点：下注${stake}，玩家${playerValue}点(${player.value.length}张) vs 荷官${dealerValue}点，${delta > 0 ? `赢${delta}` : delta < 0 ? `输${-delta}` : '平局'}`,
  );
  phase.value = 'done';
}

function setResult(text: string, cls: string) {
  resultText.value = text;
  resultClass.value = cls;
}

function reset() {
  phase.value = 'bet';
  player.value = [];
  dealer.value = [];
}
</script>

<style lang="scss" scoped>
.blackjack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.session-stats {
  display: flex;
  gap: 14px;
  font-size: 11px;
  color: var(--c-text-muted);

  b {
    color: var(--c-text);
  }

  .pos {
    color: var(--c-success);
  }

  .neg {
    color: var(--c-danger);
  }
}

.hand-label {
  font-size: 12px;
  color: var(--c-text-muted);
}

.hand-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}

.hand-total {
  font-size: 30px;
  font-weight: bold;
  min-width: 52px;
  color: var(--c-text);
}

.cards {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.card {
  background: #f5f0e8;
  color: #222;
  border-radius: 5px;
  padding: 6px 8px;
  font-size: 15px;
  font-weight: bold;
  min-width: 32px;
  text-align: center;

  &.red {
    color: #c0392b;
  }

  &.back {
    background: var(--c-border);
    color: var(--c-text-muted);
  }
}

.actions {
  display: flex;
  gap: 8px;
}

.main-btn {
  background: var(--btn-gold);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 2px 4px rgba(0, 0, 0, 0.35);
  border: none;
  border-radius: 6px;
  color: #1a1224;
  font-weight: bold;
  padding: 7px 16px;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.result {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
  flex-wrap: wrap;

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

.hint {
  margin: 0;
  font-size: 11px;
  color: var(--c-text-muted);
}
</style>
