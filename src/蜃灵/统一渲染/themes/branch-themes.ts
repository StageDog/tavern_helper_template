import type { ThemeMeta } from './top-themes';

export const BRANCH_THEMES: ThemeMeta[] = [
  {
    id: 'quill',
    name: '羽笔分歧',
    hint: '古典按钮 · 轻微浮雕',
    tokens: {
      '--sl-card-bg': '#efe3cb',
      '--sl-card-bg-image':
        'repeating-linear-gradient(0deg, rgba(126,90,52,0.05) 0px, rgba(126,90,52,0.05) 1px, transparent 1px, transparent 4px)',
      '--sl-panel-bg': '#f8efde',
      '--sl-text': '#362314',
      '--sl-muted': '#775a3e',
      '--sl-border': '#735233',
      '--sl-accent': '#8b4332',
      '--sl-accent-soft': '#af875d',
      '--sl-chip-bg': 'rgba(255,250,240,0.82)',
      '--sl-thought-bg': 'rgba(246,236,216,0.85)',
      '--sl-thought-border': '#b89974',
      '--sl-hover': 'rgba(127,91,52,0.12)',
      '--sl-shadow': '4px 4px 0 rgba(85,54,23,0.35)',
    },
  },
  {
    id: 'signal',
    name: '战术抉择',
    hint: '深色卡片 · 线框高亮',
    tokens: {
      '--sl-card-bg': '#171d28',
      '--sl-card-bg-image':
        'linear-gradient(180deg, rgba(23,29,40,0.98), rgba(13,17,24,0.98)), repeating-linear-gradient(90deg, rgba(118,145,173,0.12) 0px, rgba(118,145,173,0.12) 1px, transparent 1px, transparent 7px)',
      '--sl-panel-bg': '#222c3b',
      '--sl-text': '#dce7f5',
      '--sl-muted': '#a8bad2',
      '--sl-border': '#7791ad',
      '--sl-accent': '#dca66e',
      '--sl-accent-soft': '#84a2c3',
      '--sl-chip-bg': 'rgba(34,44,59,0.84)',
      '--sl-thought-bg': 'rgba(39,50,66,0.84)',
      '--sl-thought-border': '#7e99b8',
      '--sl-hover': 'rgba(125,152,182,0.2)',
      '--sl-shadow': '0 8px 18px rgba(0,0,0,0.45)',
    },
  },
];
