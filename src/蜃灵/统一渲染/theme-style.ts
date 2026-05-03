import { getThemeMeta, type ThemePart, type ThemeSelection } from './themes';

const STYLE_ID = 'sl-unified-theme-vars';
const PART_TO_SKIN: Record<ThemePart, string> = {
  top: 'top',
  bottom: 'bottom',
  branch: 'branch',
};

function varsToCss(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([key, value]) => `${key}: ${value};`)
    .join(' ');
}

function blockForPart(part: ThemePart, themeId: string): string {
  const theme = getThemeMeta(part, themeId);
  const skin = PART_TO_SKIN[part];
  return `.sl-unified-card[data-sl-skin="${skin}"][data-theme-id="${theme.id}"] { ${varsToCss(theme.tokens)} }`;
}

function buildThemeCss(selection: ThemeSelection): string {
  return [blockForPart('top', selection.top), blockForPart('bottom', selection.bottom), blockForPart('branch', selection.branch)].join(
    '\n',
  );
}

export function applyThemeVars(selection: ThemeSelection): void {
  const w = window.parent || window;
  const doc = w.document;
  let styleEl = doc.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = doc.createElement('style');
    styleEl.id = STYLE_ID;
    doc.head.appendChild(styleEl);
  }
  styleEl.textContent = buildThemeCss(selection);
}

export function removeThemeVars(): void {
  const w = window.parent || window;
  w.document.getElementById(STYLE_ID)?.remove();
}
