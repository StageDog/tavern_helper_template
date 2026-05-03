import type { RenderContext, ReplaceTarget } from '../types';
import { escapeHtml, nl2br } from '../utils/escape';
import { getThemeMeta } from '../themes';

const BOTTOM_BLOCK_RE = /<SLstatusblock>[\s\S]*?<\/SLstatusblock>[\s\S]*?<memory>[\s\S]*?<\/memory>/i;
const CHARACTER_BLOCK_RE = /\[([^\]]+)\]([\s\S]*?)\[\/\1\]/g;
const MEMORY_FIELD_RE = /<([a-zA-Z]+)>([\s\S]*?)<\/\1>/g;

function parseStatusBlock(raw: string): Array<{ name: string; fields: Record<string, string> }> {
  const blocks: Array<{ name: string; fields: Record<string, string> }> = [];
  for (const match of raw.matchAll(CHARACTER_BLOCK_RE)) {
    const name = match[1].trim();
    const body = match[2].trim();
    const fields: Record<string, string> = {};
    body.split(/\r?\n/).forEach(line => {
      const idx = line.indexOf(':');
      if (idx <= 0) return;
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      if (!key || !value) return;
      fields[key] = value;
    });
    blocks.push({ name, fields });
  }
  return blocks;
}

function parseMemory(raw: string): Record<string, string> {
  const data: Record<string, string> = {};
  for (const match of raw.matchAll(MEMORY_FIELD_RE)) {
    const key = match[1].trim();
    const value = match[2].trim();
    data[key] = value;
  }
  return data;
}

function extractSection(raw: string, tag: string): string {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i');
  return raw.match(re)?.[1]?.trim() ?? '';
}

function parseBottomSource(raw: string): {
  people: Array<{ name: string; fields: Record<string, string> }>;
  memory: Record<string, string>;
} | null {
  const statusRaw = extractSection(raw, 'SLstatusblock');
  const memoryRaw = extractSection(raw, 'memory');
  if (!statusRaw && !memoryRaw) return null;
  return {
    people: parseStatusBlock(statusRaw),
    memory: parseMemory(memoryRaw),
  };
}

function pickField(fields: Record<string, string>, keys: string[]): string {
  for (const key of keys) {
    if (fields[key]) return fields[key];
  }
  return '';
}

export function findBottomTarget(raw: string, messageId: number): ReplaceTarget | null {
  const match = raw.match(BOTTOM_BLOCK_RE);
  if (!match) return null;
  return {
    messageId,
    tag: 'bottom',
    source: match[0],
  };
}

export function renderBottomBar(rawSource: string, ctx: RenderContext): string {
  const parsed = parseBottomSource(rawSource);
  if (!parsed) return rawSource;

  const theme = getThemeMeta('bottom', ctx.selection.bottom);

  const peopleHtml = parsed.people.length
    ? parsed.people
        .map(person => {
          const relation = pickField(person.fields, ['Relation', 'relation', '关系']);
          const outfit = pickField(person.fields, ['outfit', 'Outfit', '衣着']);
          const posture = pickField(person.fields, ['posture', 'Posture', '姿态']);
          const thought = pickField(person.fields, ['inner_thought', 'InnerThought', '心声']);

          return `
          <details class="sl-acc">
            <summary class="sl-acc-head">
              <span class="sl-acc-mark">§</span>
              <span class="sl-acc-name">${escapeHtml(person.name)}</span>
              <span class="sl-acc-action">展卷</span>
            </summary>
            <div class="sl-acc-body">
              ${
                relation
                  ? `<div class="sl-detail"><span class="sl-key">Relation</span><span class="sl-val">${nl2br(relation)}</span></div>`
                  : ''
              }
              ${
                outfit
                  ? `<div class="sl-detail"><span class="sl-key">Outfit</span><span class="sl-val">${nl2br(outfit)}</span></div>`
                  : ''
              }
              ${
                posture
                  ? `<div class="sl-detail"><span class="sl-key">Posture</span><span class="sl-val">${nl2br(posture)}</span></div>`
                  : ''
              }
              ${thought ? `<div class="sl-thought">${nl2br(thought)}</div>` : ''}
            </div>
          </details>`;
        })
        .join('')
    : `<div class="sl-empty">尚无角色数据</div>`;

  const number = parsed.memory.number ?? '';
  const worldstate = parsed.memory.worldstate ?? '';
  const currentTask = parsed.memory.currentTask ?? '';
  const plot = parsed.memory.plot ?? '';
  const psychology = parsed.memory.psychology ?? '';
  const list = parsed.memory.list ?? '';
  const database = parsed.memory.database ?? '';

  return `
<div class="sl-unified-card sl-bottom-card" data-sl-skin="bottom" data-theme-id="${theme.id}">
  <div class="sl-card-inner">
    <div class="sl-card-head">
      <span class="sl-card-title">Personae & Liber</span>
      <span class="sl-card-sub">尾部状态栏（角色状态栏 + 小总结）</span>
    </div>

    <section class="sl-section">
      <div class="sl-section-title">在场角色</div>
      <div class="sl-acc-list">${peopleHtml}</div>
    </section>

    <section class="sl-section">
      <details class="sl-memory-details">
        <summary class="sl-memory-summary">
          <span class="sl-section-title">第 ${escapeHtml(number || '?')} 卷 · 小总结</span>
          <span class="sl-acc-action">展卷</span>
        </summary>
        <div class="sl-memory-body">
          ${worldstate ? `<div class="sl-block"><div class="sl-block-title">Worldstate</div><div>${nl2br(worldstate)}</div></div>` : ''}
          ${currentTask ? `<div class="sl-block"><div class="sl-block-title">CurrentTask</div><div>${nl2br(currentTask)}</div></div>` : ''}
          ${plot ? `<div class="sl-block"><div class="sl-block-title">Plot</div><div>${nl2br(plot)}</div></div>` : ''}
          ${psychology ? `<div class="sl-block"><div class="sl-block-title">Psychology</div><div>${nl2br(psychology)}</div></div>` : ''}
          ${list ? `<div class="sl-block"><div class="sl-block-title">List</div><div>${nl2br(list)}</div></div>` : ''}
          ${database ? `<div class="sl-block"><div class="sl-block-title">Database</div><div>${nl2br(database)}</div></div>` : ''}
        </div>
      </details>
    </section>
  </div>
</div>`.trim();
}
