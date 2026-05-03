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
  return [
    `.sl-unified-card[data-sl-skin="${skin}"][data-theme-id="${theme.id}"] { ${varsToCss(theme.tokens)} }`,
    `.sl-unified-card.sl-theme-${skin}-${theme.id} { ${varsToCss(theme.tokens)} }`,
  ].join('\n');
}

function buildThemeCss(selection: ThemeSelection): string {
  return [blockForPart('top', selection.top), blockForPart('bottom', selection.bottom), blockForPart('branch', selection.branch)].join(
    '\n',
  );
}

export function applyThemeVars(selection: ThemeSelection): void {
  const w = window.parent || window;
  const doc = w.document;
  console.info('[蜃灵统一渲染][theme-style] applyThemeVars start', selection);

  let styleEl = doc.getElementById(STYLE_ID) as HTMLStyleElement | null;
  const created = !styleEl;
  if (!styleEl) {
    styleEl = doc.createElement('style');
    styleEl.id = STYLE_ID;
    doc.head.appendChild(styleEl);
  }

  const cssText = buildThemeCss(selection);
  styleEl.textContent = cssText;

  console.info('[蜃灵统一渲染][theme-style] applyThemeVars done', {
    created,
    styleId: STYLE_ID,
    headExists: Boolean(doc.head),
    cssLength: cssText.length,
    styleFoundAfterSet: Boolean(doc.getElementById(STYLE_ID)),
  });
}

export function removeThemeVars(): void {
  const w = window.parent || window;
  const el = w.document.getElementById(STYLE_ID);
  if (el) {
    el.remove();
    console.info('[蜃灵统一渲染][theme-style] removeThemeVars removed');
  } else {
    console.info('[蜃灵统一渲染][theme-style] removeThemeVars skipped (not found)');
  }
}
