import { NEWS_TOP_EXTRA_CSS } from './news-extra-css';
import { BAUHAUS_TOP_EXTRA_CSS } from './bauhaus-extra-css';
import { GRAFFITI_TOP_EXTRA_CSS } from './graffiti-extra-css';

export interface ThemeTokens {
  [cssVarName: string]: string;
}

export interface ThemeMeta {
  id: string;
  name: string;
  hint: string;
  tokens: ThemeTokens;
  extraCss?: string;
}

export const GJSZ_FONT_TOKENS: ThemeTokens = {
  '--sl-font-serif':
    '"KingHwaOldSong", "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "WenQuanYi Micro Hei", sans-serif',
  '--sl-font-label':
    '"KingHwaOldSong", "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "WenQuanYi Micro Hei", sans-serif',
  '--sl-font-display':
    '"KingHwaOldSong", "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "WenQuanYi Micro Hei", sans-serif',
};

// 报纸排版（Newspaper Typography）字体堆叠
// 中文优先用系统自带宋体（SimSun / Songti SC / STSong），英文用 Georgia / Times New Roman
// 联网时使用 Noto Serif SC 与 Merriweather 增强观感
export const NEWS_FONT_TOKENS: ThemeTokens = {
  '--sl-font-serif':
    '"Merriweather", "Noto Serif SC", "Source Han Serif SC", "Songti SC", "STSong", "SimSun", "宋体", "Georgia", "Times New Roman", serif',
  '--sl-font-label':
    '"Merriweather", "Noto Serif SC", "Source Han Serif SC", "Songti SC", "STSong", "SimSun", "宋体", "Georgia", "Times New Roman", serif',
  '--sl-font-display':
    '"Merriweather", "Noto Serif SC", "Source Han Serif SC", "Songti SC", "STSong", "SimSun", "宋体", "Georgia", "Times New Roman", serif',
};

// 包豪斯字体堆叠：几何无衬线，标题用 Archivo Black，正文用 Inter
// 中文走系统无衬线（PingFang / 微软雅黑 / 思源黑体）
export const BAUHAUS_FONT_TOKENS: ThemeTokens = {
  '--sl-font-serif':
    '"Inter", "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", "Source Han Sans SC", "Noto Sans CJK SC", "Helvetica Neue", Helvetica, Arial, sans-serif',
  '--sl-font-label':
    '"Archivo Black", "Inter", "PingFang SC", "Microsoft YaHei", "Source Han Sans SC", "Helvetica Neue", Helvetica, Arial, sans-serif',
  '--sl-font-display':
    '"Archivo Black", "Inter", "PingFang SC", "Microsoft YaHei", "Source Han Sans SC", "Helvetica Neue", Helvetica, Arial, sans-serif',
};

// 涂鸦字体堆叠：标题用 Bungee（粗体几何，街头招牌感），强调 Permanent Marker（手喷漆体）
// 中文回退到系统粗体黑体
export const GRAFFITI_FONT_TOKENS: ThemeTokens = {
  '--sl-font-serif':
    '"Inter", "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", "Source Han Sans SC", "Noto Sans CJK SC", "Helvetica Neue", sans-serif',
  '--sl-font-label':
    '"Bungee", "Permanent Marker", "Archivo Black", "PingFang SC", "Microsoft YaHei", "Source Han Sans SC", "Helvetica Neue", sans-serif',
  '--sl-font-display':
    '"Bungee", "Permanent Marker", "Archivo Black", "PingFang SC", "Microsoft YaHei", "Source Han Sans SC", "Helvetica Neue", sans-serif',
};

export const TOP_BAR_THEMES: ThemeMeta[] = [
  {
    id: 'gjsz',
    name: '古卷书斋',
    hint: '复古怀旧 · 浅色',
    tokens: {
      ...GJSZ_FONT_TOKENS,
      '--sl-card-bg': '#ede0c4',
      '--sl-card-bg-image':
        'repeating-linear-gradient(0deg, rgba(120,90,50,0.04) 0px, rgba(120,90,50,0.04) 1px, transparent 1px, transparent 3px), repeating-linear-gradient(90deg, rgba(120,90,50,0.03) 0px, rgba(120,90,50,0.03) 1px, transparent 1px, transparent 4px), radial-gradient(ellipse at top left, rgba(140,90,40,0.10), transparent 55%), radial-gradient(ellipse at bottom right, rgba(140,90,40,0.12), transparent 55%)',
      '--sl-panel-bg': '#f4ead4',
      '--sl-text': '#3d2817',
      '--sl-muted': '#6b4f33',
      '--sl-border': '#6b4f33',
      '--sl-border-thin': '#b89977',
      '--sl-accent': '#7a3b2e',
      '--sl-accent-soft': '#a08344',
      '--sl-chip-bg': 'rgba(248,238,215,0.72)',
      '--sl-key-bg': 'rgba(255,250,235,0.55)',
      '--sl-thought-bg': 'rgba(248,238,215,0.85)',
      '--sl-thought-border': '#b89977',
      '--sl-hover': 'rgba(120,90,50,0.08)',
      '--sl-shadow': '4px 4px 0 0 rgba(80,50,20,0.45), 0 0 0 1px rgba(80,50,20,0.4)',
    },
  },
  {
    id: 'gjsz-deep',
    name: '古卷书斋·深',
    hint: 'Dark Academia · 深色',
    tokens: {
      ...GJSZ_FONT_TOKENS,
      '--sl-card-bg': '#1c130a',
      '--sl-card-bg-image':
        'repeating-linear-gradient(90deg, rgba(60,40,20,0.45) 0px, rgba(60,40,20,0.45) 2px, transparent 2px, transparent 7px), repeating-linear-gradient(0deg, rgba(40,25,10,0.32) 0px, rgba(40,25,10,0.32) 1px, transparent 1px, transparent 9px), radial-gradient(ellipse at top, rgba(120,80,40,0.30), transparent 70%)',
      '--sl-panel-bg': '#e8dcc0',
      '--sl-text': '#2c1d0f',
      '--sl-muted': '#5a4127',
      '--sl-border': '#4a3018',
      '--sl-border-thin': '#8b6f47',
      '--sl-accent': '#7a3b2e',
      '--sl-accent-soft': '#c9a961',
      '--sl-chip-bg': 'rgba(232,220,192,0.92)',
      '--sl-key-bg': 'rgba(232,220,192,0.6)',
      '--sl-thought-bg': 'rgba(220,206,176,0.55)',
      '--sl-thought-border': '#8b6f47',
      '--sl-hover': 'rgba(120,90,50,0.13)',
      '--sl-shadow': '0 8px 24px rgba(0,0,0,0.7), inset 0 0 32px rgba(60,40,20,0.35)',
    },
  },
  {
    id: 'news',
    name: '晨报印刷',
    hint: '报纸排版 · 浅色',
    tokens: {
      ...NEWS_FONT_TOKENS,
      '--sl-card-bg': '#FAF8F5',
      '--sl-card-bg-image':
        'repeating-linear-gradient(0deg, rgba(17,24,39,0.028) 0px, rgba(17,24,39,0.028) 1px, transparent 1px, transparent 5px), repeating-linear-gradient(90deg, rgba(17,24,39,0.018) 0px, rgba(17,24,39,0.018) 1px, transparent 1px, transparent 6px), radial-gradient(ellipse at top, rgba(30,58,138,0.04), transparent 70%)',
      '--sl-panel-bg': '#FFFFFF',
      '--sl-text': '#1F2937',
      '--sl-muted': '#6B7280',
      '--sl-border': '#111827',
      '--sl-border-thin': '#9CA3AF',
      '--sl-accent': '#1E3A8A',
      '--sl-accent-soft': '#3B5BA9',
      '--sl-chip-bg': 'rgba(243,244,246,0.85)',
      '--sl-key-bg': 'rgba(255,255,255,0.95)',
      '--sl-thought-bg': 'rgba(249,250,251,0.92)',
      '--sl-thought-border': '#9CA3AF',
      '--sl-hover': 'rgba(30,58,138,0.08)',
      '--sl-shadow': '3px 3px 0 0 #111827, 0 0 0 1px rgba(17,24,39,0.55)',
    },
    extraCss: NEWS_TOP_EXTRA_CSS,
  },
  {
    id: 'news-deep',
    name: '晚报夜版',
    hint: '报纸排版 · 深色',
    tokens: {
      ...NEWS_FONT_TOKENS,
      '--sl-card-bg': '#0F172A',
      '--sl-card-bg-image':
        'repeating-linear-gradient(0deg, rgba(248,250,252,0.025) 0px, rgba(248,250,252,0.025) 1px, transparent 1px, transparent 5px), repeating-linear-gradient(90deg, rgba(248,250,252,0.018) 0px, rgba(248,250,252,0.018) 1px, transparent 1px, transparent 6px), radial-gradient(ellipse at top, rgba(96,165,250,0.10), transparent 70%)',
      '--sl-panel-bg': '#1F2937',
      '--sl-text': '#F9FAFB',
      '--sl-muted': '#9CA3AF',
      '--sl-border': '#F9FAFB',
      '--sl-border-thin': '#4B5563',
      '--sl-accent': '#93C5FD',
      '--sl-accent-soft': '#60A5FA',
      '--sl-chip-bg': 'rgba(55,65,81,0.75)',
      '--sl-key-bg': 'rgba(31,41,55,0.7)',
      '--sl-thought-bg': 'rgba(31,41,55,0.85)',
      '--sl-thought-border': '#4B5563',
      '--sl-hover': 'rgba(147,197,253,0.10)',
      '--sl-shadow': '0 8px 24px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(248,250,252,0.06)',
    },
    extraCss: NEWS_TOP_EXTRA_CSS,
  },
  {
    id: 'bauhaus',
    name: '包豪斯',
    hint: '原色几何 · 功能主义',
    tokens: {
      ...BAUHAUS_FONT_TOKENS,
      '--sl-card-bg': '#F4F1EA',
      '--sl-card-bg-image':
        'repeating-linear-gradient(0deg, rgba(17,17,17,0.03) 0px, rgba(17,17,17,0.03) 1px, transparent 1px, transparent 28px), repeating-linear-gradient(90deg, rgba(17,17,17,0.03) 0px, rgba(17,17,17,0.03) 1px, transparent 1px, transparent 28px)',
      '--sl-panel-bg': '#FFFFFF',
      '--sl-text': '#111111',
      '--sl-muted': '#555555',
      '--sl-border': '#111111',
      '--sl-border-thin': '#111111',
      '--sl-accent': '#E2231A',
      '--sl-accent-soft': '#0057B7',
      '--sl-chip-bg': '#FFFFFF',
      '--sl-key-bg': '#F5C400',
      '--sl-thought-bg': '#FFFFFF',
      '--sl-thought-border': '#111111',
      '--sl-hover': 'rgba(0,87,183,0.08)',
      '--sl-shadow': '6px 6px 0 0 #111111',
    },
    extraCss: BAUHAUS_TOP_EXTRA_CSS,
  },
  {
    id: 'graffiti',
    name: '涂鸦街头',
    hint: '撞色喷漆 · 反叛街头',
    tokens: {
      ...GRAFFITI_FONT_TOKENS,
      '--sl-card-bg': '#1c1c1e',
      '--sl-card-bg-image':
        'radial-gradient(circle at 12% 18%, rgba(255,45,85,0.10), transparent 38%), radial-gradient(circle at 82% 76%, rgba(0,229,255,0.10), transparent 42%), radial-gradient(circle at 46% 92%, rgba(255,234,0,0.06), transparent 40%), repeating-linear-gradient(45deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 2px, transparent 2px, transparent 6px)',
      '--sl-panel-bg': '#232326',
      '--sl-text': '#f5f5f7',
      '--sl-muted': '#bdbdc4',
      '--sl-border': '#f5f5f7',
      '--sl-border-thin': '#5a5a60',
      '--sl-accent': '#ff2d55',
      '--sl-accent-soft': '#00e5ff',
      '--sl-chip-bg': '#232326',
      '--sl-key-bg': '#ffea00',
      '--sl-thought-bg': 'rgba(255,45,85,0.08)',
      '--sl-thought-border': '#ff2d55',
      '--sl-hover': 'rgba(0,229,255,0.12)',
      '--sl-shadow': '6px 6px 0 0 #ff2d55, 12px 12px 0 0 #00e5ff',
    },
    extraCss: GRAFFITI_TOP_EXTRA_CSS,
  },
];
