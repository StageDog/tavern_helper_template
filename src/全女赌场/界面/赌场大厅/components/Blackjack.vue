<template>
  <div class="blackjack">
    <div class="session-stats">
      <span
        ><small>总盈亏</small>
        <b :class="stats.profit >= 0 ? 'pos' : 'neg'"
          >{{ stats.profit >= 0 ? '+' : '' }}{{ stats.profit.toLocaleString() }}</b
        >
      </span>
      <span
        ><small>胜率</small><b>{{ winRate }}%</b></span
      >
      <span
        ><small>总场次</small><b>{{ stats.games }}</b></span
      >
    </div>

    <template v-if="phase === 'bet'">
      <BetControl v-model="bet" />
      <button class="game-primary" :disabled="bet <= 0 || bet > wallet.chips.value" @click="deal">
        <i class="fa-solid fa-diamond"></i> 发牌
      </button>
      <div class="table-rules">
        <span><b>Blackjack</b><small>盈利 1.5 倍</small></span>
        <span><b>过五关</b><small>五张不爆直接获胜</small></span>
      </div>
    </template>

    <template v-else>
      <div class="table-stage">
        <div class="hand dealer-hand">
          <div class="hand-heading">
            <span class="hand-label"><i class="fa-solid fa-user-tie"></i> 荷官手牌</span>
          </div>
          <div class="hand-row">
            <span class="hand-total">
              <span>{{ phase === 'player' ? '?' : handValue(dealer) }}</span>
              <span v-if="phase === 'done' && handValue(dealer) > 21" class="hand-state" aria-label="爆牌">💥</span>
            </span>
            <div class="cards">
              <span
                v-for="(card, i) in dealer"
                :key="i"
                class="card"
                :class="{ red: isRed(card), back: phase === 'player' && i === 1 }"
              >
                <template v-if="phase === 'player' && i === 1"><span class="back-mark">♠</span></template>
                <template v-else>
                  <span class="card-rank">{{ rankText(card) }}</span>
                  <span class="card-suit">{{ suitText(card) }}</span>
                </template>
              </span>
            </div>
          </div>
        </div>

        <div class="table-divider"><span>兔窟牌桌</span></div>

        <div class="hand player-hand">
          <div class="hand-heading">
            <span class="hand-label"><i class="fa-solid fa-carrot"></i> 你的手牌</span>
          </div>
          <div class="hand-row">
            <span class="hand-total">
              <span>{{ handValue(player) }}</span>
              <span v-if="playerBusted" class="hand-state" aria-label="爆牌">💥</span>
              <span v-else-if="isNatural" class="hand-state" aria-label="Blackjack">😼</span>
            </span>
            <div class="cards">
              <span v-for="(card, i) in player" :key="i" class="card" :class="{ red: isRed(card) }">
                <span class="card-rank">{{ rankText(card) }}</span>
                <span class="card-suit">{{ suitText(card) }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="phase === 'player'" class="actions">
        <button class="game-primary" @click="hit"><i class="fa-solid fa-plus"></i> 要牌</button>
        <button class="game-secondary" @click="stand"><i class="fa-solid fa-hand"></i> 停牌</button>
      </div>

      <div v-if="phase === 'done'" class="settlement">
        <div class="game-result-ticket" :class="resultClass">{{ resultText }}</div>
        <button class="game-primary" @click="reset"><i class="fa-solid fa-rotate-right"></i> 再来一局</button>
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
const bet = ref(1000);
const phase = ref<'bet' | 'player' | 'done'>('bet');
const player = ref<Card[]>([]);
const dealer = ref<Card[]>([]);
const resultText = ref('');
const resultClass = ref('');
let deck: Card[] = [];

// 本地会话战绩（仅前端展示，不进 MVU）
const stats = useLocalStorage('casino_blackjack:stats', { games: 0, wins: 0, profit: 0 });
const winRate = computed(() =>
  stats.value.games === 0 ? 0 : Math.round((stats.value.wins / stats.value.games) * 1000) / 10,
);

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function rankText(card: Card) {
  return RANKS[card.rank - 1];
}

function suitText(card: Card) {
  return SUITS[card.suit];
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
  gap: 12px;
}

.session-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 7px;

  > span {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 8px 5px;
    background: rgba(242, 229, 210, 0.04);
    border-top: 1px solid rgba(214, 166, 74, 0.24);
  }

  small {
    color: var(--c-text-muted);
    font-size: 13px;
  }

  b {
    color: var(--game-ivory);
    font-size: 15px;
  }

  .pos {
    color: var(--game-mint);
  }

  .neg {
    color: var(--c-danger);
  }
}

.table-stage {
  padding: 12px;
  background: radial-gradient(ellipse at center, rgba(114, 41, 74, 0.22), transparent 68%), var(--game-felt);
  border: 1px solid rgba(214, 166, 74, 0.36);
  border-radius: 12px;
  box-shadow:
    inset 0 0 28px rgba(5, 2, 9, 0.35),
    0 3px 10px rgba(5, 2, 9, 0.2);
}

.hand {
  min-height: 88px;
}

.hand-heading {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.hand-label {
  color: var(--game-ivory);
  font-family: var(--game-display-font);
  font-size: 14px;
  letter-spacing: 0.06em;

  i {
    width: 18px;
    color: var(--game-gold);
    text-align: center;
  }
}

.hand-total {
  display: inline-flex;
  align-items: center;
  flex: 0 0 58px;
  gap: 3px;
  min-width: 0;
  color: var(--game-ivory);
  font-size: 30px;
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.hand-state {
  font-size: 18px;
  line-height: 1;
}

.hand-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.cards {
  display: flex;
  min-width: 0;
  flex: 1;
  gap: 7px;
  flex-wrap: wrap;
}

.card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  box-sizing: border-box;
  width: 48px;
  height: 64px;
  padding: 5px 6px;
  color: #211729;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.5), transparent 38%), var(--game-ivory);
  border: 1px solid #fff8ec;
  border-radius: 6px;
  font-family: Georgia, 'Times New Roman', serif;
  font-weight: 700;
  line-height: 1;
  box-shadow:
    0 3px 7px rgba(5, 2, 9, 0.38),
    inset 0 0 0 1px rgba(85, 54, 39, 0.12);

  &.red {
    color: #b42e43;
  }

  &.back {
    align-items: center;
    justify-content: center;
    color: var(--game-gold);
    background: repeating-linear-gradient(45deg, transparent 0 5px, rgba(214, 166, 74, 0.14) 5px 7px), var(--game-wine);
    border: 3px double rgba(242, 229, 210, 0.6);
  }
}

.card-rank {
  font-size: 17px;
}

.card-suit {
  align-self: flex-end;
  font-size: 23px;
}

.back-mark {
  font-size: 24px;
}

.table-divider {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 9px 0;
  color: rgba(214, 166, 74, 0.62);
  font-family: var(--game-display-font);
  font-size: 13px;
  letter-spacing: 0.16em;

  &::before,
  &::after {
    height: 1px;
    flex: 1;
    content: '';
    background: linear-gradient(90deg, transparent, rgba(214, 166, 74, 0.38));
  }

  &::after {
    background: linear-gradient(90deg, rgba(214, 166, 74, 0.38), transparent);
  }
}

.actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.settlement {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.table-rules {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px;

  span {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 9px 10px;
    background: rgba(242, 229, 210, 0.035);
    border-left: 2px solid rgba(214, 166, 74, 0.54);
  }

  b {
    color: var(--game-gold);
    font-family: var(--game-display-font);
    font-size: 14px;
  }

  small {
    color: var(--c-text-muted);
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .actions {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 350px) {
  .hand-total {
    flex-basis: 50px;
    font-size: 27px;
  }

  .hand-state {
    font-size: 16px;
  }

  .card {
    width: 44px;
    height: 60px;
  }
}
</style>
