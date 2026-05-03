import { BRANCH_THEMES } from './branch-themes';
import { BOTTOM_BAR_THEMES } from './bottom-themes';
import { TOP_BAR_THEMES, type ThemeMeta } from './top-themes';

export type ThemePart = 'top' | 'bottom' | 'branch';

export type ThemeSelection = {
  top: string;
  bottom: string;
  branch: string;
};

export const DEFAULT_THEME_SELECTION: ThemeSelection = {
  top: TOP_BAR_THEMES[0]?.id ?? 'gjsz',
  bottom: BOTTOM_BAR_THEMES[0]?.id ?? 'gjsz',
  branch: BRANCH_THEMES[0]?.id ?? 'gjsz',
};

export const THEME_SETS: Record<ThemePart, ThemeMeta[]> = {
  top: TOP_BAR_THEMES,
  bottom: BOTTOM_BAR_THEMES,
  branch: BRANCH_THEMES,
};

export function getThemeMeta(part: ThemePart, id: string): ThemeMeta {
  return THEME_SETS[part].find(theme => theme.id === id) ?? THEME_SETS[part][0];
}

export function normalizeThemeSelection(raw: Partial<ThemeSelection> | null | undefined): ThemeSelection {
  const safe = raw ?? {};
  return {
    top: getThemeMeta('top', safe.top ?? '').id,
    bottom: getThemeMeta('bottom', safe.bottom ?? '').id,
    branch: getThemeMeta('branch', safe.branch ?? '').id,
  };
}
