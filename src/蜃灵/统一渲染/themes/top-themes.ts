import { BAUHAUS_TOP_EXTRA_CSS } from './bauhaus-extra-css';
import { GRAFFITI_TOP_EXTRA_CSS } from './graffiti-extra-css';
import { NEWS_TOP_EXTRA_CSS } from './news-extra-css';

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

// 涂鸦字体堆叠：标题用 Nerko One（街头招牌感），强调 Sedgwick Ave
// 中文回退到系统粗体黑体
export const GRAFFITI_FONT_TOKENS: ThemeTokens = {
  '--sl-font-serif':
    '"Inter", "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", "Source Han Sans SC", "Noto Sans CJK SC", "Helvetica Neue", sans-serif',
  '--sl-font-label':
    '"Nerko One", "Sedgwick Ave", "Archivo Black", "PingFang SC", "Microsoft YaHei", "Source Han Sans SC", "Helvetica Neue", sans-serif',
  '--sl-font-display':
    '"Sedgwick Ave", "Nerko One","Archivo Black", "PingFang SC", "Microsoft YaHei", "Source Han Sans SC", "Helvetica Neue", sans-serif',
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
      '--sl-card-bg': '#ECE7D6',
      '--sl-card-bg-image':
        'repeating-linear-gradient(0deg, rgba(44,44,46,0.03) 0px, rgba(44,44,46,0.03) 1px, transparent 1px, transparent 28px), repeating-linear-gradient(90deg, rgba(44,44,46,0.03) 0px, rgba(44,44,46,0.03) 1px, transparent 1px, transparent 28px)',
      '--sl-panel-bg': '#FAF6E8',
      '--sl-text': '#2C2C2E',
      '--sl-muted': '#5C5C5E',
      '--sl-border': '#2C2C2E',
      '--sl-border-thin': '#2C2C2E',
      '--sl-accent': '#B23A2E',
      '--sl-accent-soft': '#2F5891',
      '--sl-chip-bg': '#FAF6E8',
      '--sl-key-bg': '#e3b939',
      '--sl-thought-bg': '#FAF6E8',
      '--sl-thought-border': '#2C2C2E',
      '--sl-hover': 'rgba(47,88,145,0.08)',
      '--sl-shadow': '6px 6px 0 0 #2C2C2E',
    },
    extraCss: BAUHAUS_TOP_EXTRA_CSS,
  },
  {
    id: 'graffiti',
    name: '涂鸦街头',
    hint: '撞色喷漆 · 反叛街头',
    tokens: {
      ...GRAFFITI_FONT_TOKENS,
      '--sl-card-bg': '#232327',
      '--sl-card-bg-image':
        'radial-gradient(circle at 12% 18%, rgba(200,71,101,0.08), transparent 38%), radial-gradient(circle at 82% 76%, rgba(79,168,184,0.08), transparent 42%), radial-gradient(circle at 46% 92%, rgba(201,177,55,0.05), transparent 40%), repeating-linear-gradient(45deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 2px, transparent 2px, transparent 6px)',
      '--sl-panel-bg': '#2C2C30',
      '--sl-text': '#E8E8EA',
      '--sl-muted': '#A8A8B0',
      '--sl-border': '#E8E8EA',
      '--sl-border-thin': '#5a5a60',
      '--sl-accent': '#C84765',
      '--sl-accent-soft': '#4FA8B8',
      '--sl-chip-bg': '#2C2C30',
      '--sl-key-bg': '#e6cb43',
      '--sl-thought-bg': 'rgba(200,71,101,0.08)',
      '--sl-thought-border': '#C84765',
      '--sl-hover': 'rgba(79,168,184,0.12)',
      '--sl-shadow': '6px 6px 0 0 #C84765, 12px 12px 0 0 #4FA8B8',
    },
    extraCss: GRAFFITI_TOP_EXTRA_CSS,
  },
];
