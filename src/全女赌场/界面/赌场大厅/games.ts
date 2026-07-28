import type { Component } from 'vue';
import Blackjack from './components/Blackjack.vue';
import Crash from './components/Crash.vue';
import Loan from './components/Loan.vue';
import Shop from './components/Shop.vue';
import SlotMachine from './components/SlotMachine.vue';
import WorkScore from './components/WorkScore.vue';

/**
 * 大厅入口注册表。
 * 新增小游戏：
 *   1. 在 components/ 下新建组件（用 useWallet 读写筹码，用 pushEvent 记录事件）
 *   2. 在此处 push 一条注册项即可，无需改动 App.vue
 */
export interface LobbyEntry {
  id: string;
  label: string;
  /** FontAwesome 类名 */
  icon: string;
  component: Component;
  /** 仅兔女郎身份时显示此入口 */
  bunnyOnly?: boolean;
}

export const lobby_entries: LobbyEntry[] = [
  { id: 'blackjack', label: '21点', icon: 'fa-solid fa-diamond', component: Blackjack },
  { id: 'slot', label: '老虎机', icon: 'fa-solid fa-7', component: SlotMachine },
  { id: 'crash', label: 'Crash', icon: 'fa-solid fa-rocket', component: Crash },
  { id: 'shop', label: '商店', icon: 'fa-solid fa-flask', component: Shop },
  { id: 'loan', label: '前台借贷', icon: 'fa-solid fa-hand-holding-dollar', component: Loan },
  { id: 'workscore', label: '服务规则', icon: 'fa-solid fa-bell-concierge', component: WorkScore, bunnyOnly: true },
];
