import type { ThemeSelection } from './themes';

export interface RenderContext {
  selection: ThemeSelection;
}

export interface ReplaceTarget {
  messageId: number;
  tag: string;
  source: string;
}
