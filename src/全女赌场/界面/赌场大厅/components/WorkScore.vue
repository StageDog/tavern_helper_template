<template>
  <div class="workscore">
    <header class="service-cover">
      <div class="cover-meta">
        <span>RABBIT SERVICE · HOUSE RULES</span>
        <span class="member-mark"><i class="fa-solid fa-heart"></i> 女郎专属</span>
      </div>
      <div class="cover-title">
        <span class="cover-emblem" aria-hidden="true"><i class="fa-solid fa-bell-concierge"></i></span>
        <div>
          <h2>服务守则</h2>
          <p>兔女郎工作计分契约</p>
        </div>
      </div>
      <p class="cover-copy">每一次服务都记入当班账目，完成演出即可累积工作进度。</p>
    </header>

    <section class="score-book" aria-labelledby="score-book-title">
      <header class="section-title">
        <div>
          <span>当班价目</span>
          <h3 id="score-book-title">服务进度表</h3>
        </div>
        <span class="section-unit">单位 / 进度</span>
      </header>

      <div class="ticket-stack">
        <article v-for="(row, index) in SCORE_ROWS" :key="row.level" class="rule-ticket">
          <span class="ticket-no">{{ String(index + 1).padStart(2, '0') }}</span>
          <div class="ticket-copy">
            <strong>{{ row.level }}</strong>
            <span>{{ row.desc }}</span>
          </div>
          <span class="ticket-score">
            <b>
              <span class="score-value">+{{ row.score }}</span>
              <template v-if="row.scoreMax">
                <span class="score-range-mark">～</span>
                <span class="score-value">{{ row.scoreMax }}</span>
              </template>
            </b>
            <small>进度</small>
          </span>
        </article>
      </div>
    </section>

    <section class="settlement" aria-labelledby="settlement-title">
      <header class="section-title compact">
        <div>
          <span>结算须知</span>
          <h3 id="settlement-title">账房如何记账</h3>
        </div>
      </header>

      <div class="settlement-grid">
        <div class="settle-note">
          <span class="note-icon"><i class="fa-solid fa-users"></i></span>
          <div>
            <strong>同事服务同样计分</strong>
            <p>为兔女郎同事提供服务，适用相同加分规则。</p>
          </div>
        </div>
        <div class="settle-note payoff">
          <span class="note-icon"><i class="fa-solid fa-stamp"></i></span>
          <div>
            <strong>每满 100 自动发薪</strong>
            <p>
              发放 <b>{{ WORK_PAYOUT_UNIT.toLocaleString() }}</b> 筹码工资，进度归零并开始下一档；到账后可去前台还债。
            </p>
          </div>
        </div>
        <div class="settle-note penalty">
          <span class="note-icon"><i class="fa-solid fa-triangle-exclamation"></i></span>
          <div>
            <strong>自购道具会被扣分</strong>
            <p>对客人使用自购道具，老板娘将扣除 <b>10</b> 进度。</p>
          </div>
        </div>
      </div>
    </section>

    <footer class="service-footer">
      <i class="fa-solid fa-wand-magic-sparkles" aria-hidden="true"></i>
      <span>浮动档由 AI 按公开程度、参与人数、持续时间与整体强度判定，账房实时同步。</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { WORK_PAYOUT_UNIT } from '../wallet';

interface ScoreRow {
  level: string;
  desc: string;
  score: number;
  scoreMax?: number;
}

const SCORE_ROWS: ScoreRow[] = [
  { level: '前戏', desc: '被客人舔弄、玩弄乳房等', score: 10 },
  { level: '单人插入', desc: '被一位扶她客人插入式行为', score: 20 },
  { level: '多人插入', desc: '被多位扶她客人同时插入', score: 40 },
  { level: '激烈行为', desc: '公开调教等高强度玩法，由 AI 按程度判定', score: 60, scoreMax: 80 },
];
</script>

<style lang="scss" scoped>
.workscore {
  --pink-hot: #f45f98;
  --pink-bright: #f683ad;
  --pink-soft: #ffb5cf;
  --berry-deep: #5a1737;
  --cream-pink: #fff2f7;
  --ink-plum: #170c19;

  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  overflow: hidden;
  color: var(--cream-pink);
  background:
    radial-gradient(circle at 95% 4%, rgba(246, 131, 173, 0.2), transparent 27%),
    radial-gradient(circle at 8% 84%, rgba(90, 23, 55, 0.5), transparent 35%),
    linear-gradient(155deg, #2b1122 0%, var(--ink-plum) 72%);

  &::before {
    position: absolute;
    z-index: -1;
    inset: 0;
    background-image: repeating-linear-gradient(
      115deg,
      transparent 0 17px,
      rgba(255, 181, 207, 0.022) 17px 18px
    );
    content: '';
    pointer-events: none;
  }
}

.workscore,
.workscore * {
  box-sizing: border-box;
}

.service-cover {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 15px 16px 16px;
  overflow: hidden;
  background:
    linear-gradient(105deg, rgba(244, 95, 152, 0.26), rgba(90, 23, 55, 0.72)),
    #351326;
  border: 1px solid rgba(255, 181, 207, 0.58);
  border-radius: 14px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 12px 28px rgba(27, 4, 17, 0.32);

  &::after {
    position: absolute;
    right: -17px;
    bottom: -28px;
    width: 116px;
    height: 116px;
    border: 16px double rgba(255, 181, 207, 0.1);
    border-radius: 50%;
    content: '';
  }
}

.cover-meta {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: rgba(255, 242, 247, 0.66);
  font-family: 'Arial Narrow', 'Roboto Condensed', var(--font-main);
  font-size: 9px;
  letter-spacing: 0.16em;
}

.member-mark {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  color: var(--cream-pink);
  font-family: inherit;
  letter-spacing: 0.05em;
  white-space: nowrap;
  background: rgba(23, 12, 25, 0.36);
  border: 1px solid rgba(255, 181, 207, 0.38);
  border-radius: 999px;

  i {
    color: var(--pink-soft);
  }
}

.cover-title {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 13px;

  h2,
  p {
    margin: 0;
  }

  h2 {
    color: #fff;
    font-family: 'Noto Serif SC', 'Songti SC', 'STSong', serif;
    font-size: 29px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: 0.08em;
    text-shadow: 0 2px 18px rgba(244, 95, 152, 0.32);
  }

  p {
    margin-top: 6px;
    color: var(--pink-soft);
    font-size: 11px;
    letter-spacing: 0.13em;
  }
}

.cover-emblem {
  display: grid;
  width: 54px;
  aspect-ratio: 1;
  place-items: center;
  color: var(--ink-plum);
  font-size: 21px;
  background: linear-gradient(145deg, #ffd2e2, #f45f98);
  border: 1px solid #ffe4ed;
  border-radius: 50%;
  box-shadow:
    inset 0 0 0 5px rgba(90, 23, 55, 0.24),
    0 0 0 3px rgba(255, 181, 207, 0.12),
    0 8px 22px rgba(23, 4, 14, 0.35);
}

.cover-copy {
  position: relative;
  z-index: 1;
  max-width: 390px;
  margin: 0;
  color: rgba(255, 242, 247, 0.74);
  font-size: 11px;
  line-height: 1.6;
}

.score-book,
.settlement {
  padding: 13px;
  background: rgba(255, 242, 247, 0.035);
  border: 1px solid rgba(255, 181, 207, 0.2);
  border-radius: 12px;
}

.section-title {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;

  span {
    display: block;
    margin-bottom: 3px;
    color: var(--pink-bright);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.16em;
  }

  h3 {
    margin: 0;
    color: var(--cream-pink);
    font-family: 'Noto Serif SC', 'Songti SC', 'STSong', serif;
    font-size: 17px;
    letter-spacing: 0.05em;
  }

  .section-unit {
    color: rgba(255, 242, 247, 0.42);
    font-family: 'Arial Narrow', 'Roboto Condensed', var(--font-main);
    font-weight: 400;
    letter-spacing: 0.08em;
  }

  &.compact {
    margin-bottom: 9px;
  }
}

.ticket-stack {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.rule-ticket {
  position: relative;
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  min-height: 51px;
  padding: 8px 12px;
  background:
    linear-gradient(90deg, rgba(244, 95, 152, 0.17), rgba(255, 181, 207, 0.055)),
    #28101f;
  border: 1px solid rgba(255, 181, 207, 0.28);
  border-radius: 9px;
  transition:
    border-color 160ms ease,
    transform 160ms ease;

  &::before,
  &::after {
    position: absolute;
    top: 50%;
    width: 10px;
    height: 10px;
    background: #28101f;
    border: 1px solid rgba(255, 181, 207, 0.28);
    border-radius: 50%;
    content: '';
    transform: translateY(-50%);
  }

  &::before {
    left: -6px;
  }

  &::after {
    right: -6px;
  }

  &:hover {
    border-color: rgba(255, 181, 207, 0.56);
    transform: translateX(2px);
  }
}

.ticket-no {
  color: rgba(255, 181, 207, 0.55);
  font-family: var(--font-led);
  font-size: 14px;
  letter-spacing: 0.04em;
}

.ticket-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;

  strong {
    color: var(--cream-pink);
    font-size: 13px;
  }

  span {
    overflow: hidden;
    color: rgba(255, 242, 247, 0.58);
    font-size: 10px;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.ticket-score {
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  min-width: 92px;

  b {
    display: inline-flex;
    align-items: center;
    color: var(--pink-soft);
    font-size: 21px;
    line-height: 1;
    text-shadow: 0 0 14px rgba(244, 95, 152, 0.35);
  }

  .score-value {
    font-family: var(--font-led);
  }

  .score-range-mark {
    margin-inline: 2px;
    color: var(--pink-soft);
    font-family: var(--font-main);
    font-size: 14px;
    font-weight: 700;
    line-height: 1;
    transform: translateY(-1px);
  }

  small {
    margin-top: 3px;
    color: rgba(255, 242, 247, 0.43);
    font-size: 8px;
    letter-spacing: 0.08em;
  }
}

.settlement-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.settle-note {
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr);
  gap: 9px;
  align-items: start;
  padding: 10px;
  background: rgba(255, 181, 207, 0.045);
  border: 1px solid rgba(255, 181, 207, 0.16);
  border-radius: 9px;

  strong {
    color: var(--cream-pink);
    font-size: 11px;
  }

  p {
    margin: 4px 0 0;
    color: rgba(255, 242, 247, 0.57);
    font-size: 9px;
    line-height: 1.5;
  }

  b {
    color: var(--pink-soft);
  }

  &.payoff {
    background: linear-gradient(135deg, rgba(244, 95, 152, 0.13), rgba(90, 23, 55, 0.18));
    border-color: rgba(255, 181, 207, 0.32);
  }

  &.penalty {
    grid-column: 1 / -1;
    background: rgba(80, 14, 37, 0.5);
    border-color: rgba(244, 95, 152, 0.4);

    .note-icon {
      color: #ffd4e3;
      background: rgba(244, 95, 152, 0.2);
    }
  }
}

.note-icon {
  display: grid;
  width: 30px;
  aspect-ratio: 1;
  place-items: center;
  color: var(--pink-bright);
  background: rgba(244, 95, 152, 0.1);
  border: 1px solid rgba(255, 181, 207, 0.18);
  border-radius: 8px;
}

.service-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 2px 8px 0;
  color: rgba(255, 242, 247, 0.48);
  font-size: 9px;
  letter-spacing: 0.04em;

  i {
    color: var(--pink-bright);
  }
}

@media (max-width: 520px) {
  .workscore {
    padding: 12px;
  }

  .service-cover {
    padding: 13px;
  }

  .cover-meta > span:first-child {
    display: none;
  }

  .cover-meta {
    justify-content: flex-end;
  }

  .cover-title h2 {
    font-size: 25px;
  }

  .cover-emblem {
    width: 48px;
  }

  .rule-ticket {
    grid-template-columns: 27px minmax(0, 1fr) auto;
    gap: 8px;
    padding-inline: 10px;
  }

  .ticket-copy span {
    white-space: normal;
  }

  .settlement-grid {
    grid-template-columns: 1fr;
  }

  .settle-note.penalty {
    grid-column: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .rule-ticket {
    transition: none;
  }
}
</style>
