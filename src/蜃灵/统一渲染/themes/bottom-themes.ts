import type { ThemeMeta } from './top-themes';

export const BOTTOM_BAR_THEMES: ThemeMeta[] = [
  {
    id: 'folio',
    name: '折页人物簿',
    hint: '暖纸色 · 红棕压印',
    tokens: {
      '--sl-card-bg': '#f0e3ca',
      '--sl-card-bg-image':
        'repeating-linear-gradient(90deg, rgba(131,95,56,0.05) 0px, rgba(131,95,56,0.05) 1px, transparent 1px, transparent 5px)',
      '--sl-panel-bg': '#f8efde',
      '--sl-text': '#332113',
      '--sl-muted': '#72563b',
      '--sl-border': '#6d4f2f',
      '--sl-accent': '#874032',
      '--sl-accent-soft': '#b28b62',
      '--sl-chip-bg': 'rgba(255,250,239,0.8)',
      '--sl-thought-bg': 'rgba(246,235,214,0.85)',
      '--sl-thought-border': '#b99b78',
      '--sl-hover': 'rgba(126,90,52,0.12)',
      '--sl-shadow': '4px 4px 0 rgba(84,54,24,0.35)',
    },
  },
  {
    id: 'ink',
    name: '夜墨档案',
    hint: '木炭底 · 金色点缀',
    tokens: {
      '--sl-card-bg': '#1f1710',
      '--sl-card-bg-image':
        'linear-gradient(180deg, rgba(32,24,17,0.98), rgba(17,12,8,0.98)), repeating-linear-gradient(0deg, rgba(113,88,58,0.15) 0px, rgba(113,88,58,0.15) 1px, transparent 1px, transparent 8px)',
      '--sl-panel-bg': '#2c2118',
      '--sl-text': '#e8dbc1',
      '--sl-muted': '#b9a583',
      '--sl-border': '#8f6d43',
      '--sl-accent': '#d1a15f',
      '--sl-accent-soft': '#8f7a5f',
      '--sl-chip-bg': 'rgba(50,39,30,0.82)',
      '--sl-thought-bg': 'rgba(58,45,33,0.85)',
      '--sl-thought-border': '#a7865f',
      '--sl-hover': 'rgba(190,157,107,0.14)',
      '--sl-shadow': '0 10px 22px rgba(0,0,0,0.55)',
    },
  },
];
