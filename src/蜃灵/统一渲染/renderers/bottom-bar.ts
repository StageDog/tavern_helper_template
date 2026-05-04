import type { RenderContext, ReplaceTarget } from '../types';
import { escapeHtml, nl2br } from '../utils/escape';
import { getThemeMeta } from '../themes';

const STATUS_BLOCK_RE = /<SLstatusblock>[\s\S]*?<\/SLstatusblock>/i;
const MEMORY_BLOCK_RE = /<memory>[\s\S]*?<\/memory>/i;
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
  const statusMatch = raw.match(STATUS_BLOCK_RE);
  const memoryMatch = raw.match(MEMORY_BLOCK_RE);
  if (!statusMatch && !memoryMatch) return null;

  const firstIndexCandidates = [statusMatch?.index, memoryMatch?.index].filter(
    (idx): idx is number => typeof idx === 'number' && idx >= 0,
  );
  const firstIndex = Math.min(...firstIndexCandidates);
  if (!Number.isFinite(firstIndex)) return null;

  const blocks = [
    statusMatch
      ? {
          start: statusMatch.index ?? -1,
          end: (statusMatch.index ?? 0) + statusMatch[0].length,
          source: statusMatch[0],
        }
      : null,
    memoryMatch
      ? {
          start: memoryMatch.index ?? -1,
          end: (memoryMatch.index ?? 0) + memoryMatch[0].length,
          source: memoryMatch[0],
        }
      : null,
  ]
    .filter((item): item is { start: number; end: number; source: string } => Boolean(item))
    .sort((a, b) => a.start - b.start);

  const includeBoth =
    blocks.length === 2 && blocks[0].end <= blocks[1].start && raw.slice(blocks[0].end, blocks[1].start).trim() === '';

  const source = includeBoth ? raw.slice(blocks[0].start, blocks[1].end) : raw.slice(firstIndex, firstIndex + blocks[0].source.length);

  return {
    messageId,
    tag: 'bottom',
    source,
  };
}

export function renderBottomBar(rawSource: string, ctx: RenderContext): string {
  const parsed = parseBottomSource(rawSource);
  if (!parsed) return rawSource;

  const theme = getThemeMeta('bottom', ctx.selection.bottom);
  const hasPeople = parsed.people.length > 0;
  const hasMemory =
    Boolean(parsed.memory.number?.trim()) ||
    Boolean(parsed.memory.worldstate?.trim()) ||
    Boolean(parsed.memory.currentTask?.trim()) ||
    Boolean(parsed.memory.plot?.trim()) ||
    Boolean(parsed.memory.psychology?.trim()) ||
    Boolean(parsed.memory.list?.trim()) ||
    Boolean(parsed.memory.database?.trim());
  const showPeopleSection = hasPeople;
  const showMemorySection = hasMemory;

  const peopleHtml = hasPeople
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
    : '';

  const number = parsed.memory.number ?? '';
  const worldstate = parsed.memory.worldstate ?? '';
  const currentTask = parsed.memory.currentTask ?? '';
  const plot = parsed.memory.plot ?? '';
  const psychology = parsed.memory.psychology ?? '';
  const list = parsed.memory.list ?? '';
  const database = parsed.memory.database ?? '';

  if (!showPeopleSection && !showMemorySection) {
    return rawSource;
  }

  const subTitle =
    showPeopleSection && showMemorySection
      ? '尾部状态栏'
      : showPeopleSection
        ? '角色状态栏'
        : '小总结';

  const sectionMix = showPeopleSection && showMemorySection ? 'sl-section-mix' : '';

  return `
<div class="sl-unified-card sl-bottom-card sl-theme-bottom-${theme.id} ${sectionMix}" data-sl-skin="bottom" data-theme-id="${theme.id}">
  <div class="sl-card-inner">
    <div class="sl-news-masthead" aria-hidden="true">
      <span class="sl-news-issue">VOL · II · PERSONAE & LIBER</span>
      <span class="sl-news-edition">${showPeopleSection && showMemorySection ? 'Dramatis Personae · Memoria' : showPeopleSection ? 'Dramatis Personae' : 'Memoria'}</span>
    </div>
    <div class="sl-card-head">
      <div class="sl-card-titleblock">
        <span class="sl-card-title">Personae &amp; Liber</span>
        <span class="sl-card-sub">${subTitle}</span>
      </div>
      <span class="sl-card-mark">— 蜃灵 §II —</span>
    </div>

    ${
      showPeopleSection
        ? `
    <section class="sl-section sl-section-people">
      <div class="sl-section-title">在场角色</div>
      <div class="sl-acc-list">${peopleHtml}</div>
    </section>`
        : ''
    }

    ${showPeopleSection && showMemorySection ? '<div class="sl-news-rule" aria-hidden="true"><span class="sl-news-rule-mark">❦</span></div>' : ''}

    ${
      showMemorySection
        ? `
    <section class="sl-section sl-section-memory">
      <details class="sl-memory-details">
        <summary class="sl-memory-summary">
          <span class="sl-section-title">第<span class="sl-vol-num">${escapeHtml(number || '?')}</span>卷 · 小总结</span>
          <span class="sl-acc-action">展卷</span>
        </summary>
        <div class="sl-memory-body">
          ${worldstate ? `<div class="sl-block sl-block-worldstate"><div class="sl-block-title">Worldstate</div><div class="sl-block-body">${nl2br(worldstate)}</div></div>` : ''}
          ${currentTask ? `<div class="sl-block sl-block-currentTask"><div class="sl-block-title">CurrentTask</div><div class="sl-block-body">${nl2br(currentTask)}</div></div>` : ''}
          ${plot ? `<div class="sl-block sl-block-plot"><div class="sl-block-title">Plot</div><div class="sl-block-body">${nl2br(plot)}</div></div>` : ''}
          ${psychology ? `<div class="sl-block sl-block-psychology"><div class="sl-block-title">Psychology</div><div class="sl-block-body">${nl2br(psychology)}</div></div>` : ''}
          ${list ? `<div class="sl-block sl-block-list"><div class="sl-block-title">List</div><div class="sl-block-body">${nl2br(list)}</div></div>` : ''}
          ${database ? `<div class="sl-block sl-block-database"><div class="sl-block-title">Database</div><div class="sl-block-body">${nl2br(database)}</div></div>` : ''}
        </div>
      </details>
    </section>`
        : ''
    }

    <div class="sl-news-colophon" aria-hidden="true">— 蜃灵 §II — Liber Personarum · Volume II</div>
  </div>
</div>`.trim();
}
