import type { ThemeMeta } from './top-themes';

export const BRANCH_THEMES: ThemeMeta[] = [
  {
    id: 'gjsz',
    name: '古卷书斋',
    hint: '复古怀旧 · 浅色',
    tokens: {
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
];
