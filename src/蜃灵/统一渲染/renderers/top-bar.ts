import { getThemeMeta } from '../themes';
import type { RenderContext, ReplaceTarget } from '../types';
import { escapeHtml, nl2br } from '../utils/escape';

const TOP_BLOCK_RE =
  /<time>([\s\S]*?)<\/time>[\s\S]*?<location>([\s\S]*?)<\/location>[\s\S]*?<weather>([\s\S]*?)<\/weather>[\s\S]*?<spatial>([\s\S]*?)<\/spatial>/i;

// 带歌词的完整格式：`歌词文本 —— 《歌名》歌手`（破折号支持 —/-/–，单次或多次）
const MUSIC_LYRIC_RE = /^([\s\S]*?)\s*[—\-–]{1,}\s*[《<]([^》>]+)[》>]\s*(.+)$/;
// 兼容旧格式：`《歌名》歌手`
const MUSIC_RE = /[《<]([^》>]+)[》>]\s*(.+)/;

function clean(value: string): string {
  return value.trim();
}

function parseMusic(spatial: string): { lyric: string; name: string; artist: string; keyword: string } | null {
  const lyricMatch = spatial.match(MUSIC_LYRIC_RE);
  if (lyricMatch) {
    const lyric = lyricMatch[1].trim();
    const name = lyricMatch[2].trim();
    const artist = lyricMatch[3].trim();
    if (name && artist) {
      return { lyric, name, artist, keyword: `${name} ${artist}` };
    }
  }
  const m = spatial.match(MUSIC_RE);
  if (!m) return null;
  const name = m[1].trim();
  const artist = m[2].trim();
  if (!name || !artist) return null;
  return { lyric: '', name, artist, keyword: `${name} ${artist}` };
}

function renderMusicChip(spatial: string): string {
  const music = parseMusic(spatial);
  if (music) {
    const keyword = escapeHtml(music.keyword);
    const meta = `《${escapeHtml(music.name)}》— ${escapeHtml(music.artist)}`;
    const lyricLine = music.lyric ? `<div class="sl-music-lyric">${escapeHtml(music.lyric)}</div>` : '';
    return `<div class="sl-chip sl-chip-CANTUS sl-music-chip">
        <span class="sl-key">CANTUS</span>
        <div class="sl-val sl-music-text">
          ${lyricLine}
          <div class="sl-music-meta">${meta}</div>
        </div>
        <button type="button" class="sl-music-btn" data-sl-music-keyword="${keyword}" title="播放">▶</button>
      </div>`;
  }
  return `<div class="sl-chip sl-chip-CANTUS sl-music-chip">
        <span class="sl-key">CANTUS</span>
        <div class="sl-val sl-music-text">
          <div class="sl-music-meta">${nl2br(spatial)}</div>
        </div>
        <button type="button" class="sl-music-btn" style="display:none" aria-hidden="true" tabindex="-1">▶</button>
      </div>`;
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
    <div class="sl-news-masthead" aria-hidden="true">
      <span class="sl-news-issue">VOL · I · MUNDUS</span>
      <span class="sl-news-edition">Liber Primus · 世界之卷</span>
    </div>
    <div class="sl-card-head">
      <div class="sl-card-titleblock">
        <span class="sl-card-title">Mundus</span>
        <span class="sl-card-sub">世 界 之 卷</span>
      </div>
      <span class="sl-card-mark">— 蜃灵 §I —</span>
    </div>
    <div class="sl-rows">
      <div class="sl-row sl-row-meta">
        <div class="sl-chip sl-chip-tempus"><span class="sl-key">Tempus</span><span class="sl-val">${nl2br(time)}</span></div>
        <span class="sl-divider">❦</span>
        <div class="sl-chip sl-chip-locus"><span class="sl-key">Locus</span><span class="sl-val">${nl2br(location)}</span></div>
      </div>
      <div class="sl-row sl-row-news">
        <div class="sl-chip sl-chip-caelum"><span class="sl-key">Caelum</span><span class="sl-val">${nl2br(weather)}</span></div>
        <span class="sl-divider">❦</span>
        ${renderMusicChip(spatial)}
      </div>
    </div>
    <div class="sl-news-colophon" aria-hidden="true">— 蜃灵 §I — Liber Mundi · All Realms Reserved</div>
  </div>
</div>`.trim();
}
