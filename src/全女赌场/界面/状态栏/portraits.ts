/**
 * 群友立绘映射表。
 *
 * ── 添加立绘模板 ──────────────────────────────────────────
 * 每个群友两组立绘，各 1~2 张（竖版约2:3最佳），点击立绘可循环切换：
 *   normal — 正常状态（身份不含「兔女郎」时使用）
 *   bunny  — 下海状态（身份含「兔女郎」时使用）
 * 某组缺失时回退到另一组；两组都缺则显示渐变占位剪影。
 *
 * 示例（图包到手后照抄这个格式填）：
 *   小满: {
 *     normal: [
 *       'https://testingcf.jsdelivr.net/gh/{user}/{repo}/portraits/小满-1.png',
 *       'https://testingcf.jsdelivr.net/gh/{user}/{repo}/portraits/小满-2.png',
 *     ],
 *     bunny: ['https://testingcf.jsdelivr.net/gh/{user}/{repo}/portraits/小满-兔女郎.png'],
 *   },
 * ─────────────────────────────────────────────────────────
 */
export interface PortraitSet {
  normal?: string[];
  bunny?: string[];
}

export const portraits: Record<string, PortraitSet> = {};

/** 按身份取该群友当前应显示的立绘组（含回退），可能为空数组 */
export function portraitList(name: string, identity: string): string[] {
  const set = portraits[name];
  if (!set) return [];
  const isBunny = identity.includes('兔女郎');
  const primary = isBunny ? set.bunny : set.normal;
  const fallback = isBunny ? set.normal : set.bunny;
  return primary?.length ? primary : (fallback ?? []);
}

/** 占位渐变色池：按名字哈希稳定取色，同名总是同色 */
const PLACEHOLDER_GRADIENTS = [
  ['#4a3660', '#e0a94e'],
  ['#3d2b52', '#e0526e'],
  ['#2b3f52', '#5ec98f'],
  ['#52302b', '#e08a4e'],
  ['#2e2b52', '#8a6ee0'],
];

export function placeholderGradient(name: string): string {
  const hash = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const [from, to] = PLACEHOLDER_GRADIENTS[hash % PLACEHOLDER_GRADIENTS.length];
  return `linear-gradient(160deg, ${from}, ${to})`;
}
