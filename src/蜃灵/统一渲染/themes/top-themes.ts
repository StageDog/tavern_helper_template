export interface ThemeTokens {
  [cssVarName: string]: string;
}

export interface ThemeMeta {
  id: string;
  name: string;
  hint: string;
  tokens: ThemeTokens;
}

export const TOP_BAR_THEMES: ThemeMeta[] = [
  {
    id: 'archive',
    name: '古卷总览',
    hint: '羊皮纸 · 棕金边框',
    tokens: {
      '--sl-card-bg': '#efe2c7',
      '--sl-card-bg-image':
        'repeating-linear-gradient(0deg, rgba(130,94,56,0.06) 0px, rgba(130,94,56,0.06) 1px, transparent 1px, transparent 4px)',
      '--sl-panel-bg': '#f8eedb',
      '--sl-text': '#2f1f12',
      '--sl-muted': '#6f5437',
      '--sl-border': '#6d4f2f',
      '--sl-accent': '#7f3c2e',
      '--sl-accent-soft': '#b28658',
      '--sl-chip-bg': 'rgba(255,249,237,0.75)',
      '--sl-thought-bg': 'rgba(247,238,218,0.8)',
      '--sl-thought-border': '#b89974',
      '--sl-hover': 'rgba(118,84,50,0.12)',
      '--sl-shadow': '4px 4px 0 rgba(80,50,20,0.35)',
    },
  },
  {
    id: 'terminal',
    name: '观测终端',
    hint: '深底 · 青铜光',
    tokens: {
      '--sl-card-bg': '#132224',
      '--sl-card-bg-image':
        'linear-gradient(180deg, rgba(17,37,39,0.98), rgba(10,19,20,0.98)), repeating-linear-gradient(90deg, rgba(95,120,116,0.13) 0px, rgba(95,120,116,0.13) 1px, transparent 1px, transparent 7px)',
      '--sl-panel-bg': '#1d3031',
      '--sl-text': '#d9e7df',
      '--sl-muted': '#9eb9ad',
      '--sl-border': '#6a8d84',
      '--sl-accent': '#d9b96d',
      '--sl-accent-soft': '#8fbca5',
      '--sl-chip-bg': 'rgba(37,57,58,0.78)',
      '--sl-thought-bg': 'rgba(40,63,64,0.72)',
      '--sl-thought-border': '#7aa596',
      '--sl-hover': 'rgba(143,188,165,0.2)',
      '--sl-shadow': '0 8px 18px rgba(0,0,0,0.45)',
    },
  },
];
