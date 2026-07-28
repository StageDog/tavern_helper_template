<template>
  <div class="workscore">
    <div class="ws-header">
      <span class="ws-title">🐰 打工服务计分规则</span>
      <span class="ws-sub">（兔女郎工作守则 · AI 结算参考）</span>
    </div>

    <div class="score-table">
      <div class="table-head">
        <span>服务级别</span>
        <span>说明</span>
        <span class="col-score">进度加分</span>
      </div>
      <div v-for="row in SCORE_ROWS" :key="row.level" class="table-row">
        <span class="col-level">{{ row.level }}</span>
        <span class="col-desc">{{ row.desc }}</span>
        <span class="col-score score-val">+{{ row.score }}</span>
      </div>
    </div>

    <div class="ws-notes">
      <div class="note-item">
        <i class="fa-solid fa-users"></i>
        <span>为兔女郎同事提供服务，适用相同加分规则</span>
      </div>
      <div class="note-item">
        <i class="fa-solid fa-rotate"></i>
        <span>进度满 <b>100</b> 自动清偿 <b>{{ REDEMPTION_UNIT.toLocaleString() }}</b> 欠债，进度归零继续下一档</span>
      </div>
      <div class="note-item warn">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <span>对客人使用自购道具 → 被老板娘扣除 <b>10</b> 进度</span>
      </div>
    </div>

    <p class="ws-hint">进度由 AI 根据剧情演出自动结算，前端实时同步。</p>
  </div>
</template>

<script setup lang="ts">
import { REDEMPTION_UNIT } from '../wallet';

const SCORE_ROWS = [
  { level: '前戏', desc: '被客人舔弄、玩弄乳房等', score: 10 },
  { level: '单人插入', desc: '被一位扶她客人插入式行为', score: 20 },
  { level: '多人插入', desc: '被多位扶她客人同时插入', score: 50 },
];
</script>

<style lang="scss" scoped>
.workscore {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ws-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ws-title {
  font-size: 14px;
  font-weight: bold;
  color: var(--c-text);
}

.ws-sub {
  font-size: 11px;
  color: var(--c-text-muted);
  font-style: italic;
}

/* 表格 */
.score-table {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--c-border);
  border-radius: 8px;
  overflow: hidden;
}

.table-head {
  display: grid;
  grid-template-columns: 5em 1fr 5em;
  gap: 8px;
  background: var(--c-surface-alt);
  padding: 7px 12px;
  font-size: 11px;
  color: var(--c-text-muted);
  font-weight: bold;
  letter-spacing: 0.04em;
  border-bottom: 1px solid var(--c-border);
}

.table-row {
  display: grid;
  grid-template-columns: 5em 1fr 5em;
  gap: 8px;
  align-items: center;
  padding: 9px 12px;
  font-size: 12px;
  border-bottom: 1px solid var(--c-border);
  transition: background 0.15s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--c-surface-alt);
  }
}

.col-level {
  font-weight: bold;
  color: var(--c-text);
}

.col-desc {
  color: var(--c-text-muted);
  line-height: 1.4;
}

.col-score {
  text-align: right;
}

.score-val {
  font-family: var(--font-led);
  font-size: 15px;
  font-weight: bold;
  color: var(--c-danger);
  text-shadow: var(--glow-pink);
}

/* 备注 */
.ws-notes {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.note-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12px;
  color: var(--c-text-muted);
  padding: 7px 10px;
  background: var(--c-surface-alt);
  border: 1px solid var(--c-border);
  border-radius: 7px;

  i {
    flex-shrink: 0;
    margin-top: 1px;
    color: var(--c-primary);
    font-size: 12px;
  }

  b {
    color: var(--c-text);
  }

  &.warn {
    border-color: rgba(220, 53, 69, 0.3);

    i {
      color: var(--c-danger);
    }

    b {
      color: var(--c-danger);
    }
  }
}

.ws-hint {
  margin: 0;
  font-size: 11px;
  color: var(--c-text-muted);
  text-align: center;
}
</style>
