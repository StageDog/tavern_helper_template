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

function getThemeRoots(part: ThemePart, themeId: string): { rootByAttr: string; rootByClass: string } {
  const skin = PART_TO_SKIN[part];
  return {
    rootByAttr: `.sl-unified-card[data-sl-skin="${skin}"][data-theme-id="${themeId}"]`,
    rootByClass: `.sl-unified-card.sl-theme-${skin}-${themeId}`,
  };
}

function scopeExtraCss(rawCss: string, rootSelector: string): string {
  const css = rawCss.trim();
  if (!css) return '';
  if (css.includes('&')) {
    return css.replace(/&/g, rootSelector);
  }
  return `${rootSelector} {\n${css}\n}`;
}

function blockForPart(part: ThemePart, themeId: string): { varsBlock: string; extraBlock: string } {
  const theme = getThemeMeta(part, themeId);
  const roots = getThemeRoots(part, theme.id);

  const varsBlock = [
    `${roots.rootByAttr} { ${varsToCss(theme.tokens)} }`,
    `${roots.rootByClass} { ${varsToCss(theme.tokens)} }`,
  ].join('\n');

  const extraCss = theme.extraCss?.trim() ?? '';
  const extraBlock = extraCss
    ? [scopeExtraCss(extraCss, roots.rootByAttr), scopeExtraCss(extraCss, roots.rootByClass)]
        .filter(Boolean)
        .join('\n')
    : '';

  return { varsBlock, extraBlock };
}

function buildThemeCss(selection: ThemeSelection): string {
  const top = blockForPart('top', selection.top);
  const bottom = blockForPart('bottom', selection.bottom);
  const branch = blockForPart('branch', selection.branch);

  return [top.varsBlock, bottom.varsBlock, branch.varsBlock, top.extraBlock, bottom.extraBlock, branch.extraBlock]
    .filter(Boolean)
    .join('\n');
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
