import { DEFAULT_THEME_SELECTION, normalizeThemeSelection, type ThemeSelection } from './themes';

const KEY_THEME = 'theme_selection';

interface ScriptState {
  [KEY_THEME]?: ThemeSelection;
}

let cachedThemeSelection: ThemeSelection | null = null;

function getState(): ScriptState {
  return getVariables({ type: 'script', script_id: getScriptId() }) as ScriptState;
}

export function getThemeSelection(): ThemeSelection {
  if (cachedThemeSelection !== null) {
    return cachedThemeSelection;
  }
  const state = getState();
  const selection = normalizeThemeSelection(state[KEY_THEME] ?? DEFAULT_THEME_SELECTION);
  cachedThemeSelection = selection;
  return selection;
}

export function setThemeSelection(next: ThemeSelection): ThemeSelection {
  const selection = normalizeThemeSelection(next);
  const state = getState();
  state[KEY_THEME] = selection;
  replaceVariables(state, { type: 'script', script_id: getScriptId() });
  cachedThemeSelection = selection;
  return selection;
}
