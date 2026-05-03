import type { RenderContext, ReplaceTarget } from '../types';
import { nl2br } from '../utils/escape';
import { getThemeMeta } from '../themes';

const TOP_BLOCK_RE =
  /<time>([\s\S]*?)<\/time>[\s\S]*?<location>([\s\S]*?)<\/location>[\s\S]*?<weather>([\s\S]*?)<\/weather>[\s\S]*?<spatial>([\s\S]*?)<\/spatial>/i;

function clean(value: string): string {
  return value.trim();
}

export function findTopTarget(raw: string, messageId: number): ReplaceTarget | null {
  const match = raw.match(TOP_BLOCK_RE);
  if (!match) return null;
  return {
    messageId,
    tag: 'top',
    source: match[0],
  };
}

export function renderTopBar(rawSource: string, ctx: RenderContext): string {
  const match = rawSource.match(TOP_BLOCK_RE);
  if (!match) return rawSource;

  const time = clean(match[1]);
  const location = clean(match[2]);
  const weather = clean(match[3]);
  const spatial = clean(match[4]);

  const theme = getThemeMeta('top', ctx.selection.top);

  return `
<div class="sl-unified-card sl-top-card sl-theme-top-${theme.id}" data-sl-skin="top" data-theme-id="${theme.id}">
  <span class="sl-corner tl"></span>
  <span class="sl-corner tr"></span>
  <span class="sl-corner bl"></span>
  <span class="sl-corner br"></span>
  <div class="sl-card-inner">
    <div class="sl-card-head">
      <div>
        <span class="sl-card-title">Mundus</span>
        <span class="sl-card-sub">世 界 之 卷</span>
      </div>
      <span class="sl-card-mark">— 蜃灵 §I —</span>
    </div>
    <div class="sl-rows">
      <div class="sl-row">
        <div class="sl-chip"><span class="sl-key">Tempus</span><span class="sl-val">${nl2br(time)}</span></div>
        <span class="sl-divider">❦</span>
        <div class="sl-chip"><span class="sl-key">Locus</span><span class="sl-val">${nl2br(location)}</span></div>
      </div>
      <div class="sl-row">
        <div class="sl-chip"><span class="sl-key">Caelum</span><span class="sl-val">${nl2br(weather)}</span></div>
        <span class="sl-divider">❦</span>
        <div class="sl-chip"><span class="sl-key">Praesentia</span><span class="sl-val">${nl2br(spatial)}</span></div>
      </div>
    </div>
  </div>
</div>`.trim();
}
