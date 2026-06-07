<template>
  <div class="rc-status">
    <header class="status-header paper-layer">
      <div class="title-block">
        <p class="eyebrow">Reverse Conquest · {{ displayUserName }}</p>
        <h1>逆攻略状态栏</h1>
      </div>
      <div class="header-side">
        <div class="point-stamp" :title="`${displayUserName}的利益点数`">
          <span>{{ displayUserName }}的利益点数</span>
          <strong>{{ benefitPoints }}</strong>
        </div>
        <div class="collapse-actions" aria-label="折叠控制">
          <button
            class="small-button ghost"
            type="button"
            :disabled="!activeTabHasSections"
            @click="setActiveTabCollapsed(true)"
          >
            全部折叠
          </button>
          <button
            class="small-button ghost"
            type="button"
            :disabled="!activeTabHasSections"
            @click="setActiveTabCollapsed(false)"
          >
            全部展开
          </button>
        </div>
      </div>
    </header>

    <nav class="tab-bar" aria-label="状态栏标签">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-button"
        :class="{ active: activeTab === tab.id }"
        type="button"
        @click="activeTab = tab.id"
      >
        <span>{{ tab.label }}</span>
        <small v-if="tab.badge() !== ''">{{ tab.badge() }}</small>
      </button>
    </nav>

    <main class="content-shell">
      <section v-if="activeTab === 'overview'" class="tab-panel overview-panel">
        <div class="metric-grid">
          <article class="metric-card paper-card accent-gold">
            <span>利益点数</span>
            <strong>{{ benefitPoints }}</strong>
          </article>
          <article class="metric-card paper-card accent-coral">
            <span>角色数量</span>
            <strong>{{ characterEntries.length }}</strong>
          </article>
          <article class="metric-card paper-card accent-blue">
            <span>进行中任务</span>
            <strong>{{ runningTaskCount }}</strong>
          </article>
          <article class="metric-card paper-card accent-sage">
            <span>商城商品</span>
            <strong>{{ shopEntries.length }}</strong>
          </article>
        </div>

        <div class="paper-card list-card">
          <div class="section-heading collapse-heading">
            <h2>好感度总览</h2>
            <div class="heading-actions">
              <span>{{ averageFavorLabel }}</span>
              <button
                class="collapse-toggle"
                type="button"
                :aria-expanded="!isCollapsed(sectionKey('overview', 'affection'))"
                @click="toggleSection(sectionKey('overview', 'affection'))"
              >
                {{ collapseLabel(sectionKey('overview', 'affection')) }}
              </button>
            </div>
          </div>
          <div
            v-if="!isCollapsed(sectionKey('overview', 'affection')) && characterEntries.length === 0"
            class="empty-state"
          >
            尚无角色数据。
          </div>
          <div v-else-if="!isCollapsed(sectionKey('overview', 'affection'))" class="affection-list">
            <article
              v-for="[name, char] in characterEntries"
              :key="name"
              class="affection-row"
              :data-polarity="favorPolarity(char._user好感度)"
            >
              <div class="row-title">
                <strong>{{ name }}</strong>
                <span>{{ char._攻略阶段 }}</span>
                <em>{{ signedNumber(char._user好感度) }}</em>
              </div>
              <div class="affection-track" aria-hidden="true">
                <div class="affection-fill" :style="{ width: `${Math.abs(char._user好感度)}%` }"></div>
              </div>
              <p>{{ formatUserText(char.当前攻略行为, '尚未行动') }}</p>
            </article>
          </div>
        </div>
      </section>

      <section v-else-if="activeTab === 'characters'" class="tab-panel stack-panel">
        <div v-if="characterEntries.length === 0" class="empty-state paper-card">尚无角色数据。</div>
        <article v-for="[name, char] in characterEntries" :key="name" class="paper-card character-card">
          <header class="card-header collapse-heading">
            <div>
              <h2>{{ name }}</h2>
              <p>
                {{ char._性别 }} · {{ char._攻略动机 }} · 与{{ displayUserName }}：{{
                  formatUserText(char._与user的初始关系, '陌生人')
                }}
              </p>
            </div>
            <div class="heading-actions">
              <span class="stage-pill" :data-polarity="favorPolarity(char._user好感度)">
                {{ char._攻略阶段 }} {{ signedNumber(char._user好感度) }}
              </span>
              <button
                class="collapse-toggle"
                type="button"
                :aria-expanded="!isCollapsed(sectionKey('character', name))"
                @click="toggleSection(sectionKey('character', name))"
              >
                {{ collapseLabel(sectionKey('character', name)) }}
              </button>
            </div>
          </header>

          <div v-show="!isCollapsed(sectionKey('character', name))" class="collapsible-content">
            <div class="detail-grid">
              <div>
                <span>心情</span>
                <strong>{{ char.心情 || '平静' }}</strong>
              </div>
              <div>
                <span>绑定系统</span>
                <strong>{{ char.绑定系统 || '无' }}</strong>
              </div>
              <div>
                <span>系统积分</span>
                <strong>{{ char.系统积分 }}</strong>
              </div>
              <div>
                <span>利益贡献</span>
                <strong>{{ char.$利益贡献 }}</strong>
              </div>
            </div>

            <div class="current-task">
              <span>当前任务</span>
              <p>{{ formatUserText(char.系统任务, '暂无系统任务') }}</p>
            </div>

            <div class="control-board">
              <label class="control-label" :for="`favor-${name}`">好感度</label>
              <div class="range-line">
                <input :id="`favor-${name}`" v-model.number="favorDrafts[name]" type="range" min="-100" max="100" />
                <input v-model.number="favorDrafts[name]" class="number-input" type="number" min="-100" max="100" />
              </div>
              <div class="inline-fields">
                <input v-model.trim="reasonDrafts[name]" type="text" placeholder="原因（可选）" />
                <button class="small-button ghost" type="button" @click="applyFavorDelta(name, -5)">-5</button>
                <button class="small-button ghost" type="button" @click="applyFavorDelta(name, 5)">+5</button>
                <button class="small-button primary" type="button" @click="applyFavor(name)">应用</button>
              </div>
            </div>

            <div class="control-board compact-board">
              <label class="control-label" :for="`points-${name}`">系统积分干预</label>
              <div class="inline-fields">
                <input
                  :id="`points-${name}`"
                  v-model.number="pointDrafts[name]"
                  class="number-input"
                  type="number"
                  min="1"
                />
                <button
                  class="small-button ghost"
                  type="button"
                  :disabled="!canSpendPointDraft(name)"
                  @click="applySystemPointDelta(name, pointDrafts[name])"
                >
                  增加
                </button>
                <button
                  class="small-button ghost"
                  type="button"
                  :disabled="!canSpendPointDraft(name)"
                  @click="applySystemPointDelta(name, -pointDrafts[name])"
                >
                  扣除
                </button>
              </div>
            </div>

            <div class="item-board">
              <div class="section-heading tight">
                <h3>持有物品</h3>
                <span>{{ Object.keys(char.持有物品).length }}</span>
              </div>
              <div v-if="Object.keys(char.持有物品).length === 0" class="mini-empty">暂无物品。</div>
              <div v-else class="item-list">
                <div v-for="(desc, itemName) in char.持有物品" :key="itemName" class="item-row">
                  <strong>{{ itemName }}</strong>
                  <input :value="desc" type="text" @change="updateItemDescription(name, String(itemName), $event)" />
                  <button
                    class="icon-button"
                    type="button"
                    title="移除物品"
                    @click="removeItem(name, String(itemName))"
                  >
                    x
                  </button>
                </div>
              </div>
              <div class="add-row">
                <input v-model.trim="itemDrafts[name].name" type="text" placeholder="物品名" />
                <input v-model.trim="itemDrafts[name].desc" type="text" placeholder="描述" />
                <button class="small-button primary" type="button" @click="addItem(name)">添加</button>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section v-else-if="activeTab === 'tasks'" class="tab-panel stack-panel">
        <article class="paper-card form-card">
          <div class="section-heading collapse-heading">
            <h2>发布任务</h2>
            <div class="heading-actions">
              <span>消耗 {{ selectedTaskCost }} 点</span>
              <button
                class="collapse-toggle"
                type="button"
                :aria-expanded="!isCollapsed(sectionKey('tasks', 'form'))"
                @click="toggleSection(sectionKey('tasks', 'form'))"
              >
                {{ collapseLabel(sectionKey('tasks', 'form')) }}
              </button>
            </div>
          </div>
          <form v-show="!isCollapsed(sectionKey('tasks', 'form'))" class="form-grid" @submit.prevent="publishTask">
            <input v-model.trim="taskForm.name" type="text" placeholder="任务名" />
            <select v-model="taskForm.difficulty">
              <option v-for="difficulty in difficultyOptions" :key="difficulty" :value="difficulty">
                {{ difficulty }} · {{ TASK_COST[difficulty] }}
              </option>
            </select>
            <textarea v-model.trim="taskForm.description" placeholder="任务描述"></textarea>
            <input v-model.trim="taskForm.reward" type="text" placeholder="奖励" />
            <button class="wide-button primary" type="submit" :disabled="!canPublishTask">发布任务</button>
          </form>
        </article>

        <div v-if="taskEntries.length > 0" class="list-toolbar">
          <span class="list-toolbar-title">任务列表 · {{ taskEntries.length }}</span>
          <button class="small-button ghost" type="button" @click="toggleSection(taskListKey)">
            {{ isCollapsed(taskListKey) ? '展开列表' : '折叠列表' }}
          </button>
        </div>
        <div v-if="taskEntries.length === 0" class="empty-state paper-card">当前没有任务。</div>
        <div v-else v-show="!isCollapsed(taskListKey)" class="card-grid">
          <article v-for="[name, task] in taskEntries" :key="name" class="paper-card task-card">
          <header class="item-header collapse-heading">
            <div>
              <h2>{{ name }}</h2>
              <p>{{ formatUserText(task.描述, '暂无描述') }}</p>
            </div>
            <div class="heading-actions">
              <span class="status-tag" :data-status="task.状态">{{ task.状态 }}</span>
              <button
                class="collapse-toggle"
                type="button"
                :aria-expanded="!isCollapsed(sectionKey('task', name))"
                @click="toggleSection(sectionKey('task', name))"
              >
                {{ collapseLabel(sectionKey('task', name)) }}
              </button>
            </div>
          </header>
          <div v-show="!isCollapsed(sectionKey('task', name))" class="collapsible-content">
            <div class="meta-line">
              <span>{{ task.难度 }} · 发布消耗 {{ TASK_COST[task.难度] }}</span>
              <span>{{ formatUserText(task.奖励, '无奖励') }}</span>
            </div>
            <div class="action-row">
              <select :value="task.状态" @change="setTaskStatus(name, $event)">
                <option v-for="status in taskStatusOptions" :key="status" :value="status">{{ status }}</option>
              </select>
              <button
                class="small-button ghost"
                type="button"
                :disabled="!canWithdrawTask(name)"
                @click="withdrawTask(name)"
              >
                撤回
              </button>
              <button class="small-button danger" type="button" @click="removeTask(name)">删除</button>
            </div>
          </div>
        </article>
        </div>
      </section>

      <section v-else-if="activeTab === 'shop'" class="tab-panel stack-panel">
        <article class="paper-card quota-card">
          <div class="section-heading collapse-heading">
            <h2>商城额度</h2>
            <div class="heading-actions">
              <span>{{ quotaCards.length }} 类</span>
              <button
                class="collapse-toggle"
                type="button"
                :aria-expanded="!isCollapsed(sectionKey('shop', 'quota'))"
                @click="toggleSection(sectionKey('shop', 'quota'))"
              >
                {{ collapseLabel(sectionKey('shop', 'quota')) }}
              </button>
            </div>
          </div>
          <div v-show="!isCollapsed(sectionKey('shop', 'quota'))" class="quota-grid">
            <div
              v-for="quota in quotaCards"
              :key="quota.label"
              class="quota-chip"
              :data-over="quota.used > quota.limit"
            >
              <span>{{ quota.label }}</span>
              <strong>{{ quota.used }}/{{ quota.limit }}</strong>
            </div>
          </div>
        </article>

        <article class="paper-card form-card">
          <div class="section-heading collapse-heading">
            <h2>上架商品</h2>
            <div class="heading-actions">
              <span>消耗 {{ normalizedProductPrice }} 点</span>
              <button
                class="collapse-toggle"
                type="button"
                :aria-expanded="!isCollapsed(sectionKey('shop', 'form'))"
                @click="toggleSection(sectionKey('shop', 'form'))"
              >
                {{ collapseLabel(sectionKey('shop', 'form')) }}
              </button>
            </div>
          </div>
          <form v-show="!isCollapsed(sectionKey('shop', 'form'))" class="form-grid" @submit.prevent="listProduct">
            <input v-model.trim="productForm.name" type="text" placeholder="商品名" />
            <input v-model.number="productForm.price" type="number" min="0" placeholder="价格" />
            <textarea v-model.trim="productForm.description" placeholder="商品描述"></textarea>
            <select v-model="productForm.category">
              <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <select v-model="productForm.stockMode">
              <option value="无限">无限库存</option>
              <option value="有限">有限库存</option>
            </select>
            <input
              v-if="productForm.stockMode === '有限'"
              v-model.number="productForm.stockValue"
              type="number"
              min="0"
              placeholder="库存"
            />
            <button class="wide-button primary" type="submit" :disabled="!canListProduct">上架商品</button>
          </form>
        </article>

        <div v-if="shopEntries.length > 0" class="list-toolbar">
          <span class="list-toolbar-title">商城商品 · {{ shopEntries.length }}</span>
          <button class="small-button ghost" type="button" @click="toggleSection(productListKey)">
            {{ isCollapsed(productListKey) ? '展开列表' : '折叠列表' }}
          </button>
        </div>
        <div v-if="shopEntries.length === 0" class="empty-state paper-card">商城暂无商品。</div>
        <div v-else v-show="!isCollapsed(productListKey)" class="card-grid">
          <article v-for="[name, product] in shopEntries" :key="name" class="paper-card product-card">
          <header class="item-header collapse-heading">
            <div>
              <h2>{{ name }}</h2>
              <p>{{ formatUserText(product.描述, '暂无描述') }}</p>
            </div>
            <div class="heading-actions">
              <span class="price-tag">{{ product.价格 }}</span>
              <button
                class="collapse-toggle"
                type="button"
                :aria-expanded="!isCollapsed(sectionKey('product', name))"
                @click="toggleSection(sectionKey('product', name))"
              >
                {{ collapseLabel(sectionKey('product', name)) }}
              </button>
            </div>
          </header>
          <div v-show="!isCollapsed(sectionKey('product', name))" class="collapsible-content">
            <div class="meta-line">
              <span>{{ product.系统类别 || '玩家上架' }}</span>
              <span>库存 {{ productStockLabel(product.库存) }}</span>
            </div>
            <div class="action-row">
              <button
                class="small-button primary"
                type="button"
                :disabled="!canBuyProduct(product)"
                @click="buyProduct(name)"
              >
                购买
              </button>
              <button
                class="small-button ghost"
                type="button"
                :disabled="!canWithdrawProduct(name)"
                @click="withdrawProduct(name)"
              >
                撤回
              </button>
              <button class="small-button danger" type="button" @click="removeProduct(name)">下架</button>
            </div>
          </div>
        </article>
        </div>
      </section>

      <section v-else class="tab-panel stack-panel">
        <div v-if="reversedLogs.length === 0" class="empty-state paper-card">当前楼层暂无系统日志。</div>
        <article v-for="log in reversedLogs" :key="`${log.index}-${log.时间戳}`" class="paper-card log-card">
          <header class="log-header collapse-heading">
            <div class="log-title-line">
              <span>{{ log.类型 || '记录' }}</span>
              <time>{{ formatTime(log.时间戳) }}</time>
            </div>
            <button
              class="collapse-toggle"
              type="button"
              :aria-expanded="!isCollapsed(sectionKey('log', `${log.index}-${log.时间戳}`))"
              @click="toggleSection(sectionKey('log', `${log.index}-${log.时间戳}`))"
            >
              {{ collapseLabel(sectionKey('log', `${log.index}-${log.时间戳}`)) }}
            </button>
          </header>
          <div v-show="!isCollapsed(sectionKey('log', `${log.index}-${log.时间戳}`))" class="collapsible-content">
            <p>{{ formatUserText(log.内容) }}</p>
            <div class="action-row">
              <button
                class="small-button ghost"
                type="button"
                :disabled="!canUndoLog(log.index)"
                @click="undoLog(log.index)"
              >
                撤回
              </button>
              <button class="small-button danger" type="button" @click="removeLogAt(log.index)">移除记录</button>
            </div>
          </div>
        </article>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useDataStore } from './store';

type TabId = 'overview' | 'characters' | 'tasks' | 'shop' | 'logs';
type TaskDifficulty = '简单' | '普通' | '困难' | '史诗';
type TaskStatus = '可接取' | '进行中' | '已完成' | '已失败';
type CharacterData = {
  _性别: string;
  _与user的初始关系: string;
  _攻略动机: string;
  _user好感度: number;
  _攻略阶段: string;
  当前攻略行为: string;
  绑定系统: string | null;
  系统任务: string | null;
  系统积分: number;
  $利益贡献: number;
  持有物品: Record<string, string>;
  心情: string;
};
type TaskData = {
  描述: string;
  奖励: string;
  难度: TaskDifficulty;
  状态: TaskStatus;
};
type ProductData = {
  描述: string;
  价格: number;
  库存: number | '无限';
  系统类别: string | null;
};
type LogWithIndex = {
  类型: string;
  内容: string;
  时间戳: number;
  index: number;
};

const TASK_COST: Record<TaskDifficulty, number> = {
  简单: 5,
  普通: 15,
  困难: 30,
  史诗: 60,
};
const OPENING_USER_ENTRY_NAME = '[mvu_update][mvu_plot]user设定';
const difficultyOptions: TaskDifficulty[] = ['简单', '普通', '困难', '史诗'];
const taskStatusOptions: TaskStatus[] = ['可接取', '进行中', '已完成', '已失败'];
const SYSTEM_CATEGORY_OPTIONS = [
  '共通',
  '面板/加点',
  '签到/打卡',
  '神豪/败家',
  '情绪/声望',
  '神级选择',
  '反派/夺运',
  '人生模拟器',
];
const BLANK_TASK_CATEGORY_NAMES = new Set([
  '共通',
  '通用',
  '面板',
  '加点',
  '面板/加点',
  '签到',
  '打卡',
  '签到/打卡',
  '神豪',
  '败家',
  '神豪/败家',
  '情绪',
  '声望',
  '情绪/声望',
  '神级选择',
  '选择',
  '反派',
  '夺运',
  '反派/夺运',
  '人生模拟器',
  '模拟器',
]);

const store = useDataStore();
const { data } = storeToRefs(store);

const activeTab = useLocalStorage<TabId>('reverse_conquest_status:active_tab', 'overview');
const collapsedSections = useLocalStorage<Record<string, boolean>>('reverse_conquest_status:collapsed_sections', {});
const openingUserName = ref('');
const favorDrafts = reactive<Record<string, number>>({});
const reasonDrafts = reactive<Record<string, string>>({});
const pointDrafts = reactive<Record<string, number>>({});
const itemDrafts = reactive<Record<string, { name: string; desc: string }>>({});

const taskForm = reactive({
  name: '',
  description: '',
  reward: '',
  difficulty: '普通' as TaskDifficulty,
});

const productForm = reactive({
  name: '',
  description: '',
  price: 20,
  category: '',
  stockMode: '无限' as '无限' | '有限',
  stockValue: 1,
});

const tabs = [
  { id: 'overview' as const, label: '总览', badge: () => String(characterEntries.value.length) },
  { id: 'characters' as const, label: '角色', badge: () => String(characterEntries.value.length) },
  { id: 'tasks' as const, label: '任务系统', badge: () => String(taskEntries.value.length) },
  { id: 'shop' as const, label: '商城', badge: () => String(shopEntries.value.length) },
  {
    id: 'logs' as const,
    label: '系统日志',
    badge: () => (reversedLogs.value.length > 0 ? String(reversedLogs.value.length) : ''),
  },
];

const benefitPoints = computed(() => Math.max(0, Math.floor(Number(data.value.user['$利益点数'] ?? 0))));
const displayUserName = computed(() => openingUserName.value || getTavernUserName() || '你');
const characterEntries = computed<[string, CharacterData][]>(() =>
  Object.entries(data.value.角色 as Record<string, CharacterData>).sort(([a], [b]) => a.localeCompare(b, 'zh-Hans-CN')),
);
const taskEntries = computed<[string, TaskData][]>(() =>
  Object.entries(data.value.任务列表 as Record<string, TaskData>)
    .filter(([name, task]) => !isBlankCategoryTask(name, task))
    .sort(([a], [b]) => a.localeCompare(b, 'zh-Hans-CN')),
);
const shopEntries = computed<[string, ProductData][]>(() =>
  Object.entries(data.value.商城 as Record<string, ProductData>).sort(([a], [b]) => a.localeCompare(b, 'zh-Hans-CN')),
);
const runningTaskCount = computed(() => taskEntries.value.filter(([, task]) => task.状态 === '进行中').length);
const selectedTaskCost = computed(() => TASK_COST[taskForm.difficulty]);
const normalizedProductPrice = computed(() => Math.max(0, Math.floor(Number(productForm.price) || 0)));
const averageFavorLabel = computed(() => {
  if (characterEntries.value.length === 0) {
    return '无数据';
  }
  const sum = characterEntries.value.reduce((total, [, char]) => total + char._user好感度, 0);
  return `平均 ${signedNumber(Math.round(sum / characterEntries.value.length))}`;
});
const canPublishTask = computed(() => {
  const name = taskForm.name.trim();
  return name !== '' && !(name in data.value.任务列表) && benefitPoints.value >= selectedTaskCost.value;
});
const canListProduct = computed(() => {
  const name = productForm.name.trim();
  const category = normalizeCategory(productForm.category);
  return (
    name !== '' &&
    !(name in data.value.商城) &&
    benefitPoints.value >= normalizedProductPrice.value &&
    quotaAllows(category)
  );
});
const categoryOptions = computed(() => {
  const options = new Set(SYSTEM_CATEGORY_OPTIONS);
  for (const [, char] of characterEntries.value) {
    if (char.绑定系统) {
      options.add(char.绑定系统);
    }
  }
  for (const [, product] of shopEntries.value) {
    if (product.系统类别) {
      options.add(product.系统类别);
    }
  }
  return [{ value: '', label: '玩家上架' }, ...Array.from(options).map(option => ({ value: option, label: option }))];
});
const quotaCards = computed(() => {
  const categories = new Set<string>(['共通']);
  for (const [, char] of characterEntries.value) {
    if (char.绑定系统) {
      categories.add(char.绑定系统);
    }
  }
  for (const [, product] of shopEntries.value) {
    if (product.系统类别) {
      categories.add(product.系统类别);
    }
  }
  return Array.from(categories).map(label => ({
    label,
    used: quotaUsed(label),
    limit: quotaLimit(label),
  }));
});
const reversedLogs = computed<LogWithIndex[]>(() =>
  data.value.系统日志.map((log, index) => ({ ...log, index })).reverse(),
);
const activeSectionKeys = computed(() => {
  if (activeTab.value === 'overview') {
    return [sectionKey('overview', 'affection')];
  }
  if (activeTab.value === 'characters') {
    return characterEntries.value.map(([name]) => sectionKey('character', name));
  }
  if (activeTab.value === 'tasks') {
    return [sectionKey('tasks', 'form'), ...taskEntries.value.map(([name]) => sectionKey('task', name))];
  }
  if (activeTab.value === 'shop') {
    return [
      sectionKey('shop', 'quota'),
      sectionKey('shop', 'form'),
      ...shopEntries.value.map(([name]) => sectionKey('product', name)),
    ];
  }
  return reversedLogs.value.map(log => sectionKey('log', `${log.index}-${log.时间戳}`));
});
const activeTabHasSections = computed(() => activeSectionKeys.value.length > 0);
const taskListKey = 'list:tasks';
const productListKey = 'list:shop';

onMounted(() => {
  void loadOpeningUserName();
  pruneBlankCategoryTasks();
});

watch(
  () => data.value.任务列表,
  () => pruneBlankCategoryTasks(),
  { deep: true },
);

watch(
  characterEntries,
  entries => {
    const names = new Set(entries.map(([name]) => name));
    for (const [name, char] of entries) {
      if (!(name in favorDrafts)) {
        favorDrafts[name] = char._user好感度;
      }
      if (!(name in reasonDrafts)) {
        reasonDrafts[name] = '';
      }
      if (!(name in pointDrafts)) {
        pointDrafts[name] = 1;
      }
      if (!(name in itemDrafts)) {
        itemDrafts[name] = { name: '', desc: '' };
      }
    }
    for (const name of Object.keys(favorDrafts)) {
      if (!names.has(name)) {
        delete favorDrafts[name];
        delete reasonDrafts[name];
        delete pointDrafts[name];
        delete itemDrafts[name];
      }
    }
  },
  { immediate: true },
);

function signedNumber(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

function sectionKey(scope: string, id: string): string {
  return `${scope}:${id}`;
}

function isCollapsed(key: string): boolean {
  return collapsedSections.value[key] === true;
}

function setSectionCollapsed(key: string, collapsed: boolean) {
  collapsedSections.value = { ...collapsedSections.value, [key]: collapsed };
}

function toggleSection(key: string) {
  setSectionCollapsed(key, !isCollapsed(key));
}

function collapseLabel(key: string): string {
  return isCollapsed(key) ? '展开' : '收起';
}

function setSectionsCollapsed(keys: string[], collapsed: boolean) {
  collapsedSections.value = keys.reduce((state, key) => ({ ...state, [key]: collapsed }), {
    ...collapsedSections.value,
  });
}

function setActiveTabCollapsed(collapsed: boolean) {
  setSectionsCollapsed(activeSectionKeys.value, collapsed);
}

function cleanText(value: unknown): string {
  return String(value ?? '').trim();
}

function normalizeTaskCategoryName(name: string): string {
  return cleanText(name)
    .replace(/[【】\[\]\s]/g, '')
    .replace(/(?:系统|任务|类别)+$/g, '');
}

function isBlankCategoryTask(name: string, task: TaskData | undefined): boolean {
  return (
    BLANK_TASK_CATEGORY_NAMES.has(normalizeTaskCategoryName(name)) && !cleanText(task?.描述) && !cleanText(task?.奖励)
  );
}

function pruneBlankCategoryTasks() {
  const tasks = data.value.任务列表 as Record<string, TaskData>;
  for (const [name, task] of Object.entries(tasks)) {
    if (isBlankCategoryTask(name, task)) {
      delete tasks[name];
    }
  }
}

function parseBlockValue(content: string, label: string): string {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = content.match(new RegExp(`^\\s*${escapedLabel}:\\s*\\|-\\s*\\r?\\n((?:\\s{4}.*(?:\\r?\\n|$))*)`, 'm'));
  if (!match) {
    return '';
  }
  return cleanText(
    match[1]
      .split(/\r?\n/)
      .map(line => line.replace(/^\s{4}/, ''))
      .join('\n'),
  );
}

async function loadOpeningUserName() {
  try {
    if (typeof getChatWorldbookName !== 'function' || typeof getWorldbook !== 'function') {
      return;
    }
    const worldbookName = getChatWorldbookName('current');
    if (!worldbookName) {
      return;
    }
    const entries = await getWorldbook(worldbookName);
    const userEntry = entries.find(entry => entry.name === OPENING_USER_ENTRY_NAME);
    openingUserName.value = userEntry ? parseBlockValue(userEntry.content, '名字') : '';
  } catch (error) {
    console.warn('[逆攻略状态栏] 读取开场 user 名失败:', error);
  }
}

function getTavernUserName(): string {
  if (typeof substitudeMacros === 'function') {
    const macroName = cleanText(substitudeMacros('<user>'));
    if (macroName && macroName !== '<user>') {
      return macroName;
    }
    const legacyMacroName = cleanText(substitudeMacros('{{user}}'));
    if (legacyMacroName && legacyMacroName !== '{{user}}') {
      return legacyMacroName;
    }
  }
  const context = (globalThis as any).SillyTavern ?? (window.parent as any)?.SillyTavern;
  return cleanText(context?.name1);
}

function formatUserText(value: unknown, fallback = ''): string {
  const text = cleanText(value) || fallback;
  const userName = displayUserName.value || '你';
  return text
    .replace(/<user>/g, () => userName)
    .replace(/\{\{user\}\}/g, () => userName)
    .replace(/(^|[^A-Za-z0-9_])user(?![A-Za-z0-9_])/g, (_match, prefix: string) => `${prefix}${userName}`);
}

function favorPolarity(value: number): 'positive' | 'negative' | 'neutral' {
  if (value > 14) {
    return 'positive';
  }
  if (value < -14) {
    return 'negative';
  }
  return 'neutral';
}

function stageFromFavor(value: number): string {
  if (value <= -70) return '厌恶';
  if (value <= -40) return '排斥';
  if (value <= -15) return '冷淡';
  if (value <= 14) return '无感';
  if (value <= 39) return '留意';
  if (value <= 59) return '接纳';
  if (value <= 74) return '喜爱';
  if (value <= 89) return '心动';
  return '倾心';
}

function clampFavor(value: number): number {
  return Math.max(-100, Math.min(100, Math.round(Number(value) || 0)));
}

function normalizePositiveInt(value: number, fallback = 1): number {
  const normalized = Math.floor(Number(value));
  return Number.isFinite(normalized) && normalized > 0 ? normalized : fallback;
}

function normalizeCategory(value: string): string | null {
  return value.trim() === '' ? null : value.trim();
}

function notify(type: 'success' | 'warning' | 'error', message: string) {
  const api = globalThis.toastr;
  if (api?.[type]) {
    api[type](message);
  }
}

function appendLog(type: string, content: string) {
  data.value.系统日志.push({ 类型: type, 内容: content, 时间戳: Date.now() });
  if (data.value.系统日志.length > 30) {
    data.value.系统日志 = data.value.系统日志.slice(-30);
  }
}

function spendPoints(amount: number): boolean {
  const cost = Math.max(0, Math.floor(Number(amount) || 0));
  if (benefitPoints.value < cost) {
    notify('warning', '利益点数不足。');
    return false;
  }
  data.value.user['$利益点数'] = benefitPoints.value - cost;
  return true;
}

function refundPoints(amount: number) {
  const refund = Math.max(0, Math.floor(Number(amount) || 0));
  data.value.user['$利益点数'] = benefitPoints.value + refund;
}

function applyFavor(name: string) {
  const char = data.value.角色[name] as CharacterData | undefined;
  if (!char) {
    return;
  }
  const oldValue = char._user好感度;
  const nextValue = clampFavor(favorDrafts[name]);
  if (oldValue === nextValue) {
    notify('warning', '好感度没有变化。');
    return;
  }
  char._user好感度 = nextValue;
  char._攻略阶段 = stageFromFavor(nextValue);
  favorDrafts[name] = nextValue;
  const reason = reasonDrafts[name]?.trim();
  appendLog(
    '好感度',
    `将「${name}」好感度从 ${oldValue} 调整为 ${nextValue}，阶段变为「${char._攻略阶段}」${reason ? `。原因：${reason}` : '。'}`,
  );
  reasonDrafts[name] = '';
  notify('success', '好感度已更新。');
}

function applyFavorDelta(name: string, delta: number) {
  const char = data.value.角色[name] as CharacterData | undefined;
  if (!char) {
    return;
  }
  favorDrafts[name] = clampFavor(char._user好感度 + delta);
  applyFavor(name);
}

function canSpendPointDraft(name: string): boolean {
  const amount = normalizePositiveInt(pointDrafts[name]);
  return benefitPoints.value >= amount;
}

function applySystemPointDelta(name: string, delta: number) {
  const char = data.value.角色[name] as CharacterData | undefined;
  if (!char) {
    return;
  }
  const amount = normalizePositiveInt(Math.abs(delta));
  if (!spendPoints(amount)) {
    return;
  }
  const oldValue = Math.max(0, Math.floor(Number(char.系统积分) || 0));
  const nextValue = Math.max(0, oldValue + Math.trunc(delta));
  char.系统积分 = nextValue;
  appendLog('积分', `干预「${name}」系统积分：${oldValue} -> ${nextValue}，消耗${amount}点利益点数。`);
  notify('success', '系统积分已更新。');
}

function addItem(charName: string) {
  const char = data.value.角色[charName] as CharacterData | undefined;
  const draft = itemDrafts[charName];
  if (!char || !draft?.name.trim()) {
    notify('warning', '请填写物品名。');
    return;
  }
  const itemName = draft.name.trim();
  const desc = draft.desc.trim() || '未描述';
  const existed = itemName in char.持有物品;
  char.持有物品[itemName] = desc;
  appendLog('物品', `${existed ? '更新' : '添加'}「${charName}」的物品「${itemName}」：${desc}`);
  itemDrafts[charName] = { name: '', desc: '' };
  notify('success', existed ? '物品已更新。' : '物品已添加。');
}

function updateItemDescription(charName: string, itemName: string, event: Event) {
  const char = data.value.角色[charName] as CharacterData | undefined;
  const target = event.target as HTMLInputElement | null;
  const nextDesc = target?.value.trim() || '未描述';
  if (!char || char.持有物品[itemName] === nextDesc) {
    return;
  }
  char.持有物品[itemName] = nextDesc;
  appendLog('物品', `更新「${charName}」的物品「${itemName}」描述：${nextDesc}`);
  notify('success', '物品描述已更新。');
}

function removeItem(charName: string, itemName: string) {
  const char = data.value.角色[charName] as CharacterData | undefined;
  if (!char || !(itemName in char.持有物品)) {
    return;
  }
  delete char.持有物品[itemName];
  appendLog('物品', `移除了「${charName}」的物品「${itemName}」。`);
  notify('success', '物品已移除。');
}

function publishTask() {
  const name = taskForm.name.trim();
  if (!canPublishTask.value) {
    notify('warning', '任务无法发布。');
    return;
  }
  if (!spendPoints(selectedTaskCost.value)) {
    return;
  }
  data.value.任务列表[name] = {
    描述: taskForm.description.trim(),
    奖励: taskForm.reward.trim(),
    难度: taskForm.difficulty,
    状态: '可接取',
  };
  appendLog('任务', `发布任务「${name}」，难度${taskForm.difficulty}，消耗${selectedTaskCost.value}点利益点数。`);
  taskForm.name = '';
  taskForm.description = '';
  taskForm.reward = '';
  taskForm.difficulty = '普通';
  notify('success', '任务已发布。');
}

function setTaskStatus(name: string, event: Event) {
  const task = data.value.任务列表[name] as TaskData | undefined;
  const target = event.target as HTMLSelectElement | null;
  const nextStatus = target?.value as TaskStatus | undefined;
  if (!task || !nextStatus || task.状态 === nextStatus) {
    return;
  }
  const oldStatus = task.状态;
  task.状态 = nextStatus;
  appendLog('任务', `将任务「${name}」状态从「${oldStatus}」调整为「${nextStatus}」。`);
}

function findPublishTaskLogIndex(name: string): number {
  return data.value.系统日志.findLastIndex(log => log.类型 === '任务' && log.内容.includes(`发布任务「${name}」`));
}

function canWithdrawTask(name: string): boolean {
  return findPublishTaskLogIndex(name) >= 0;
}

function withdrawTask(name: string) {
  const task = data.value.任务列表[name] as TaskData | undefined;
  const logIndex = findPublishTaskLogIndex(name);
  if (!task || logIndex < 0) {
    return;
  }
  const refund = parseCost(data.value.系统日志[logIndex].内容) ?? TASK_COST[task.难度];
  delete data.value.任务列表[name];
  refundPoints(refund);
  removeLogAt(logIndex);
  notify('success', `任务已撤回，退还 ${refund} 点。`);
}

function removeTask(name: string) {
  if (!(name in data.value.任务列表)) {
    return;
  }
  delete data.value.任务列表[name];
  appendLog('任务', `删除任务「${name}」。`);
  notify('success', '任务已删除。');
}

function quotaLimit(category: string): number {
  return category === '共通' ? 10 : 5;
}

function quotaUsed(category: string): number {
  return shopEntries.value.filter(([, product]) => product.系统类别 === category).length;
}

function quotaAllows(category: string | null): boolean {
  if (!category) {
    return true;
  }
  return quotaUsed(category) < quotaLimit(category);
}

function listProduct() {
  const name = productForm.name.trim();
  if (!canListProduct.value) {
    notify('warning', '商品无法上架。');
    return;
  }
  if (!spendPoints(normalizedProductPrice.value)) {
    return;
  }
  const stock: ProductData['库存'] =
    productForm.stockMode === '无限' ? '无限' : Math.max(0, Math.floor(Number(productForm.stockValue) || 0));
  data.value.商城[name] = {
    描述: productForm.description.trim(),
    价格: normalizedProductPrice.value,
    库存: stock,
    系统类别: normalizeCategory(productForm.category),
  };
  appendLog(
    '商城',
    `上架商品「${name}」，价格${normalizedProductPrice.value}，消耗${normalizedProductPrice.value}点利益点数。`,
  );
  productForm.name = '';
  productForm.description = '';
  productForm.price = 20;
  productForm.category = '';
  productForm.stockMode = '无限';
  productForm.stockValue = 1;
  notify('success', '商品已上架。');
}

function productStockLabel(stock: ProductData['库存']): string {
  return stock === '无限' ? '无限' : String(stock);
}

function canBuyProduct(product: ProductData): boolean {
  const hasStock = product.库存 === '无限' || product.库存 > 0;
  return hasStock && benefitPoints.value >= Math.max(0, Math.floor(product.价格));
}

function buyProduct(name: string) {
  const product = data.value.商城[name] as ProductData | undefined;
  if (!product || !canBuyProduct(product)) {
    notify('warning', '商品无法购买。');
    return;
  }
  const cost = Math.max(0, Math.floor(product.价格));
  if (!spendPoints(cost)) {
    return;
  }
  if (product.库存 !== '无限') {
    product.库存 = Math.max(0, product.库存 - 1);
  }
  appendLog('商城', `购买商城商品「${name}」，消耗${cost}点利益点数。`);
  notify('success', '商品已购买。');
}

function findListedProductLogIndex(name: string): number {
  return data.value.系统日志.findLastIndex(log => log.类型 === '商城' && log.内容.includes(`上架商品「${name}」`));
}

function canWithdrawProduct(name: string): boolean {
  return findListedProductLogIndex(name) >= 0;
}

function withdrawProduct(name: string) {
  const product = data.value.商城[name] as ProductData | undefined;
  const logIndex = findListedProductLogIndex(name);
  if (!product || logIndex < 0) {
    return;
  }
  const refund = parseCost(data.value.系统日志[logIndex].内容) ?? product.价格;
  delete data.value.商城[name];
  refundPoints(refund);
  removeLogAt(logIndex);
  notify('success', `商品已撤回，退还 ${refund} 点。`);
}

function removeProduct(name: string) {
  if (!(name in data.value.商城)) {
    return;
  }
  delete data.value.商城[name];
  appendLog('商城', `下架商品「${name}」。`);
  notify('success', '商品已下架。');
}

function parseCost(content: string): number | null {
  const match = content.match(/消耗(\d+(?:\.\d+)?)点利益点数/);
  return match ? Math.floor(Number(match[1])) : null;
}

function removeLogAt(index: number) {
  if (index >= 0 && index < data.value.系统日志.length) {
    data.value.系统日志.splice(index, 1);
  }
}

function canUndoLog(index: number): boolean {
  const log = data.value.系统日志[index];
  if (!log) {
    return false;
  }
  return (
    parseFavorUndo(log.内容) !== null ||
    parsePointUndo(log.内容) !== null ||
    parsePurchaseUndo(log.内容) !== null ||
    parseTaskPublishUndo(log.内容) !== null ||
    parseProductListUndo(log.内容) !== null
  );
}

function undoLog(index: number) {
  const log = data.value.系统日志[index];
  if (!log) {
    return;
  }

  const favor = parseFavorUndo(log.内容);
  if (favor) {
    const char = data.value.角色[favor.name] as CharacterData | undefined;
    if (char) {
      char._user好感度 = favor.oldValue;
      char._攻略阶段 = stageFromFavor(favor.oldValue);
      favorDrafts[favor.name] = favor.oldValue;
      removeLogAt(index);
      notify('success', '好感度记录已撤回。');
      return;
    }
  }

  const points = parsePointUndo(log.内容);
  if (points) {
    const char = data.value.角色[points.name] as CharacterData | undefined;
    if (char) {
      char.系统积分 = points.oldValue;
      refundPoints(points.cost);
      removeLogAt(index);
      notify('success', '积分干预已撤回。');
      return;
    }
  }

  const purchase = parsePurchaseUndo(log.内容);
  if (purchase) {
    const product = data.value.商城[purchase.name] as ProductData | undefined;
    refundPoints(purchase.cost);
    if (product && product.库存 !== '无限') {
      product.库存 += 1;
    }
    removeLogAt(index);
    notify('success', '购买记录已撤回。');
    return;
  }

  const taskName = parseTaskPublishUndo(log.内容);
  if (taskName && taskName in data.value.任务列表) {
    const task = data.value.任务列表[taskName] as TaskData;
    refundPoints(parseCost(log.内容) ?? TASK_COST[task.难度]);
    delete data.value.任务列表[taskName];
    removeLogAt(index);
    notify('success', '任务发布已撤回。');
    return;
  }

  const productName = parseProductListUndo(log.内容);
  if (productName && productName in data.value.商城) {
    const product = data.value.商城[productName] as ProductData;
    refundPoints(parseCost(log.内容) ?? product.价格);
    delete data.value.商城[productName];
    removeLogAt(index);
    notify('success', '商品上架已撤回。');
  }
}

function parseFavorUndo(content: string): { name: string; oldValue: number } | null {
  const match = content.match(/^将「(.+?)」好感度从\s*(-?\d+)\s*调整为\s*(-?\d+)/);
  return match ? { name: match[1], oldValue: Number(match[2]) } : null;
}

function parsePointUndo(content: string): { name: string; oldValue: number; cost: number } | null {
  const match = content.match(/^干预「(.+?)」系统积分：(\d+)\s*->\s*(\d+)，消耗(\d+)点利益点数/);
  return match ? { name: match[1], oldValue: Number(match[2]), cost: Number(match[4]) } : null;
}

function parsePurchaseUndo(content: string): { name: string; cost: number } | null {
  const match = content.match(/^购买商城商品「(.+?)」，消耗(\d+)点利益点数/);
  return match ? { name: match[1], cost: Number(match[2]) } : null;
}

function parseTaskPublishUndo(content: string): string | null {
  return content.match(/^发布任务「(.+?)」/)?.[1] ?? null;
}

function parseProductListUndo(content: string): string | null {
  return content.match(/^上架商品「(.+?)」/)?.[1] ?? null;
}

function formatTime(timestamp: number): string {
  if (!Number.isFinite(timestamp)) {
    return '--:--';
  }
  return new Date(timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}
</script>

<style scoped>
.rc-status {
  position: relative;
  width: min(100%, 760px);
  margin: 0 auto;
  padding: 11px;
  border: 1px solid rgba(48, 45, 43, 0.5);
  border-radius: 12px;
  background:
    linear-gradient(135deg, #fffefc, #fcf5e2),
    var(--rcs-paper-deep);
  box-shadow:
    3px 4px 0 var(--rcs-shadow-soft),
    0 14px 26px rgba(77, 65, 52, 0.14);
  overflow: hidden;
}

.rc-status::before {
  content: '';
  position: absolute;
  inset: 6px;
  border: 1.5px dotted var(--rcs-line-strong);
  border-radius: 9px;
  pointer-events: none;
}

.paper-layer,
.paper-card {
  position: relative;
  border: 1.5px dotted var(--rcs-line-strong);
  border-radius: 8px;
  background-color: var(--rcs-paper);
  box-shadow:
    1.5px 2px 0 rgba(var(--rcs-shadow-rgb), 0.1),
    3px 4px 0 rgba(var(--rcs-shadow-rgb), 0.04);
}

.status-header {
  z-index: 1;
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 12px;
  padding: 14px;
  background-color: var(--rcs-paper-yellow);
}

.status-header::after {
  content: '';
  position: absolute;
  top: -7px;
  left: 30px;
  width: 76px;
  height: 16px;
  background: repeating-linear-gradient(45deg, #fef6cf, #fef6cf 6px, #fae29c 6px, #fae29c 12px);
  opacity: 0.85;
  clip-path: polygon(5% 0%, 95% 0%, 100% 44%, 97% 100%, 3% 96%, 0% 46%);
  transform: rotate(-3deg);
  box-shadow: 1px 1.5px 2px rgba(var(--rcs-shadow-rgb), 0.14);
  pointer-events: none;
}

.status-header::before {
  content: '';
  position: absolute;
  top: -9px;
  right: 26px;
  width: 11px;
  height: 30px;
  border-radius: 5px;
  background: linear-gradient(90deg, #9ca3af, #d1d5db, #6b7280);
  box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  transform: rotate(12deg);
  z-index: 3;
  pointer-events: none;
}

.title-block {
  min-width: 0;
}

.header-side {
  display: flex;
  align-items: stretch;
  gap: 8px;
}

.eyebrow {
  margin: 0 0 2px;
  color: var(--rcs-ink-soft);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

h1,
h2,
h3,
p {
  margin: 0;
}

h1,
h2,
h3 {
  font-family: var(--rcs-font-title);
  letter-spacing: 0;
}

h1 {
  font-size: 20px;
  line-height: 1.2;
}

.point-stamp {
  display: grid;
  min-width: 112px;
  max-width: 180px;
  place-items: center;
  padding: 8px 10px;
  border: 1.5px dotted var(--rcs-line-strong);
  border-radius: 8px;
  background: var(--rcs-paper-pink);
  box-shadow: 1.5px 2px 0 rgba(var(--rcs-shadow-rgb), 0.1);
  transform: rotate(1.5deg);
}

.point-stamp span,
.metric-card span,
.detail-grid span,
.current-task span {
  max-width: 100%;
  overflow: hidden;
  color: var(--rcs-ink-soft);
  font-size: 11px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.point-stamp strong {
  color: var(--rcs-coral);
  font-size: 26px;
  line-height: 1;
}

.tab-bar {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 6px;
  margin-top: 8px;
  overflow-x: auto;
  padding: 2px 0 8px;
  scrollbar-width: none;
}

.tab-bar::-webkit-scrollbar {
  display: none;
}

.tab-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 34px;
  padding: 0 13px;
  border: 1.5px dotted var(--rcs-line-strong);
  border-radius: 8px;
  background: var(--rcs-paper);
  color: var(--rcs-ink-soft);
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
  box-shadow: 1.5px 2px 0 rgba(var(--rcs-shadow-rgb), 0.08);
  transition:
    transform 0.16s ease,
    background 0.16s ease,
    color 0.16s ease,
    box-shadow 0.16s ease;
}

.tab-button small {
  min-width: 18px;
  padding: 1px 5px;
  border-radius: 999px;
  background: rgba(48, 45, 43, 0.1);
  font-size: 10px;
}

.tab-button:hover {
  background: var(--rcs-paper-yellow);
  color: var(--rcs-ink);
  transform: translateY(-1px);
}

.tab-button.active {
  background: var(--rcs-paper-pink);
  border-color: var(--rcs-coral);
  color: var(--rcs-coral-deep);
  box-shadow: 1.5px 2px 0 rgba(212, 108, 117, 0.18);
}

.content-shell {
  position: relative;
  z-index: 1;
}

.collapse-actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
  min-width: 88px;
}

.tab-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.metric-card {
  min-height: 78px;
  padding: 12px;
}

.metric-card:nth-child(odd) {
  transform: rotate(-0.5deg);
}

.metric-card:nth-child(even) {
  transform: rotate(0.5deg);
}

.metric-card strong {
  display: block;
  margin-top: 8px;
  font-size: 26px;
  line-height: 1;
}

.accent-gold {
  background-color: var(--rcs-paper-yellow);
}

.accent-gold strong {
  color: var(--rcs-gold);
}

.accent-coral {
  background-color: var(--rcs-paper-pink);
}

.accent-coral strong {
  color: var(--rcs-coral);
}

.accent-blue {
  background-color: var(--rcs-paper-blue);
}

.accent-blue strong {
  color: var(--rcs-blue);
}

.accent-sage {
  background-color: var(--rcs-paper-green);
}

.accent-sage strong {
  color: var(--rcs-sage);
}

.list-card,
.character-card,
.task-card,
.product-card,
.log-card,
.form-card,
.quota-card {
  padding: 12px;
}

.list-card::before,
.form-card::before,
.quota-card::before {
  content: '';
  position: absolute;
  top: -7px;
  left: 22px;
  width: 62px;
  height: 15px;
  background: repeating-linear-gradient(45deg, #e3f0db, #e3f0db 6px, #c0dbb1 6px, #c0dbb1 12px);
  opacity: 0.82;
  clip-path: polygon(5% 0%, 95% 0%, 100% 44%, 97% 100%, 3% 96%, 0% 46%);
  transform: rotate(-2.5deg);
  box-shadow: 1px 1.5px 2px rgba(var(--rcs-shadow-rgb), 0.12);
  pointer-events: none;
}

.section-heading,
.card-header,
.item-header,
.log-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.collapse-heading {
  align-items: flex-start;
}

.heading-actions {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 7px;
  flex: 0 0 auto;
}

.collapse-toggle {
  min-height: 28px;
  padding: 0 9px;
  border: 1.5px dotted var(--rcs-line-strong);
  border-radius: 8px;
  background: var(--rcs-paper-blue);
  color: var(--rcs-ink);
  font-size: 12px;
  font-weight: 900;
  white-space: nowrap;
}

.collapsible-content {
  margin-top: 8px;
}

.section-heading h2,
.card-header h2,
.item-header h2 {
  font-size: 17px;
}

.section-heading span,
.meta-line,
.card-header p,
.item-header p,
.log-header time {
  color: var(--rcs-ink-soft);
  font-size: 12px;
}

.section-heading.tight {
  align-items: center;
  margin-bottom: 8px;
}

.section-heading.tight h3 {
  font-size: 14px;
}

.affection-list,
.stack-panel,
.item-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: flex-start;
}

.card-grid > * {
  flex: 1 1 248px;
  min-width: 0;
}

.list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 12px;
  border: 1.5px dotted var(--rcs-line-strong);
  border-radius: 8px;
  background: var(--rcs-paper);
  box-shadow: 1.5px 2px 0 rgba(var(--rcs-shadow-rgb), 0.08);
}

.list-toolbar-title {
  color: var(--rcs-ink);
  font-size: 13px;
  font-weight: 900;
}

.affection-row {
  padding: 9px;
  border: 1.5px dotted var(--rcs-line);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.4);
}

.row-title {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 8px;
  align-items: center;
}

.row-title strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-title span,
.stage-pill,
.status-tag,
.price-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 24px;
  padding: 2px 8px;
  border: 1.5px dotted var(--rcs-line-strong);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  font-weight: 800;
}

.row-title em {
  font-style: normal;
  font-weight: 900;
}

.affection-track {
  position: relative;
  height: 10px;
  margin-top: 8px;
  overflow: hidden;
  border: 1.5px dotted rgba(48, 45, 43, 0.3);
  border-radius: 999px;
  background: rgba(48, 45, 43, 0.08);
}

.affection-fill {
  height: 100%;
  border-radius: inherit;
  background: repeating-linear-gradient(45deg, var(--rcs-sage) 0 4px, #8fbd7c 4px 8px);
  transition: width 0.3s ease;
}

.stage-pill[data-polarity='positive'] {
  background: var(--rcs-coral);
  color: #fffdf7;
}

.stage-pill[data-polarity='negative'] {
  background: var(--rcs-blue);
  color: #fffdf7;
}

.stage-pill[data-polarity='neutral'] {
  background: var(--rcs-sage);
  color: #fffdf7;
}

.affection-row[data-polarity='positive'] .affection-fill {
  background: repeating-linear-gradient(45deg, var(--rcs-coral) 0 4px, #e89aa3 4px 8px);
}

.affection-row[data-polarity='negative'] .affection-fill {
  background: repeating-linear-gradient(45deg, var(--rcs-blue) 0 4px, #8fb2cb 4px 8px);
}

.affection-row[data-polarity='neutral'] .affection-fill {
  background: repeating-linear-gradient(45deg, var(--rcs-sage) 0 4px, #9bb586 4px 8px);
}

.affection-row p {
  margin-top: 6px;
  color: var(--rcs-ink-soft);
  font-size: 12px;
  line-height: 1.45;
}

.empty-state,
.mini-empty {
  padding: 18px;
  color: var(--rcs-ink-soft);
  font-size: 13px;
  text-align: center;
}

.mini-empty {
  padding: 8px;
  border: 1.5px dotted var(--rcs-line);
  border-radius: 8px;
}

.card-header {
  margin-bottom: 10px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.detail-grid div,
.current-task,
.control-board,
.item-board {
  padding: 9px;
  border: 1.5px dotted var(--rcs-line);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.42);
}

.detail-grid strong {
  display: block;
  margin-top: 3px;
  overflow-wrap: anywhere;
  font-size: 14px;
}

.current-task,
.control-board,
.item-board {
  margin-top: 8px;
}

.current-task p {
  margin-top: 4px;
  color: var(--rcs-ink);
  font-size: 13px;
  line-height: 1.45;
}

.control-label {
  display: block;
  margin-bottom: 7px;
  color: var(--rcs-ink-soft);
  font-size: 12px;
  font-weight: 800;
}

.range-line,
.inline-fields,
.add-row,
.item-row,
.action-row,
.meta-line {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range-line input[type='range'] {
  flex: 1;
  min-width: 120px;
  accent-color: var(--rcs-coral);
}

input,
select,
textarea {
  width: 100%;
  min-height: 34px;
  border: 1.5px dotted rgba(48, 45, 43, 0.35);
  border-radius: 8px;
  background: var(--rcs-paper);
  color: var(--rcs-ink);
  padding: 7px 9px;
  outline: none;
}

select {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 28px;
  cursor: pointer;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23635b54' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' viewBox='0 0 16 16'%3E%3Cpath d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 9px center;
}

textarea {
  min-height: 76px;
  resize: vertical;
}

input:focus,
select:focus,
textarea:focus {
  border-color: var(--rcs-coral);
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(212, 108, 117, 0.14);
}

.number-input {
  width: 82px;
  flex: 0 0 82px;
}

.inline-fields input {
  min-width: 0;
}

.small-button,
.wide-button,
.icon-button {
  border: 1.5px dotted var(--rcs-line-strong);
  border-radius: 8px;
  color: var(--rcs-ink);
  font-weight: 800;
  box-shadow: 1.5px 2px 0 rgba(var(--rcs-shadow-rgb), 0.12);
  transition:
    transform 0.14s ease,
    filter 0.14s ease,
    box-shadow 0.14s ease,
    opacity 0.14s ease;
}

.small-button {
  min-height: 34px;
  flex: 0 0 auto;
  padding: 0 10px;
}

.wide-button {
  min-height: 38px;
  grid-column: 1 / -1;
}

.icon-button {
  width: 30px;
  height: 30px;
  flex: 0 0 30px;
  background: var(--rcs-paper-pink);
}

.primary {
  border-style: solid;
  border-color: var(--rcs-coral-deep);
  background: var(--rcs-coral);
  color: #fffdf7;
  box-shadow: 1.5px 2px 0 rgba(var(--rcs-shadow-rgb), 0.16);
}

.ghost {
  background: var(--rcs-paper-blue);
}

.danger {
  background: var(--rcs-paper-pink);
  color: var(--rcs-coral-deep);
}

button:hover:not(:disabled) {
  filter: brightness(1.02);
  transform: translateY(-1px);
  box-shadow: 2px 2.5px 0 rgba(var(--rcs-shadow-rgb), 0.16);
}

button:active:not(:disabled) {
  transform: translateY(1px);
  box-shadow: 1px 1px 0 rgba(var(--rcs-shadow-rgb), 0.12);
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.item-row {
  padding: 6px;
  border: 1.5px dotted var(--rcs-line);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.4);
}

.item-row strong {
  width: 112px;
  flex: 0 0 112px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.add-row {
  margin-top: 8px;
}

.form-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 150px;
  gap: 8px;
  margin-top: 10px;
}

.form-grid textarea {
  grid-column: 1 / -1;
}

.item-header {
  margin-bottom: 8px;
}

.item-header div {
  min-width: 0;
}

.item-header p {
  margin-top: 3px;
  line-height: 1.45;
}

.meta-line {
  justify-content: space-between;
  padding: 7px 0;
  border-top: 1.5px dotted var(--rcs-line);
  border-bottom: 1.5px dotted var(--rcs-line);
}

.action-row {
  justify-content: flex-end;
  margin-top: 8px;
  flex-wrap: wrap;
}

.action-row select {
  width: auto;
  min-width: 128px;
  margin-right: auto;
}

.status-tag[data-status='可接取'] {
  background: var(--rcs-paper-green);
}

.status-tag[data-status='进行中'] {
  background: var(--rcs-paper-blue);
}

.status-tag[data-status='已完成'] {
  background: var(--rcs-paper-lilac);
}

.status-tag[data-status='已失败'] {
  background: var(--rcs-paper-pink);
}

.price-tag {
  min-width: 48px;
  background: var(--rcs-paper-pink);
  color: var(--rcs-coral);
  font-size: 16px;
}

.quota-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(112px, 1fr));
  gap: 8px;
  margin-top: 10px;
}

.quota-chip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 36px;
  padding: 7px 9px;
  border: 1.5px dotted var(--rcs-line);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.42);
  gap: 8px;
}

.quota-chip[data-over='true'] {
  background: var(--rcs-paper-pink);
}

.quota-chip span {
  overflow: hidden;
  color: var(--rcs-ink-soft);
  font-size: 12px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.log-header {
  align-items: center;
  margin-bottom: 7px;
}

.log-title-line {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.log-header span {
  padding: 2px 8px;
  border: 1.5px dotted var(--rcs-line-strong);
  border-radius: 999px;
  background: var(--rcs-paper-blue);
  font-size: 12px;
  font-weight: 900;
}

.log-card p {
  color: var(--rcs-ink);
  font-size: 13px;
  line-height: 1.55;
}

@media (max-width: 640px) {
  .rc-status {
    padding: 8px;
  }

  .status-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .header-side {
    width: 100%;
    flex-direction: column;
  }

  .collapse-actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .point-stamp {
    width: 100%;
    max-width: none;
    grid-template-columns: 1fr auto;
    justify-items: start;
    transform: none;
  }

  .metric-grid,
  .detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .section-heading,
  .card-header,
  .item-header,
  .log-header {
    flex-wrap: wrap;
  }

  .heading-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .row-title {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .row-title em {
    grid-column: 2;
  }

  .range-line,
  .inline-fields,
  .add-row,
  .item-row,
  .meta-line {
    align-items: stretch;
    flex-direction: column;
  }

  .collapse-heading {
    gap: 8px;
  }

  .number-input,
  .item-row strong,
  .action-row select {
    width: 100%;
    flex-basis: auto;
  }

  .small-button,
  .wide-button {
    width: 100%;
  }

  .action-row {
    justify-content: stretch;
  }
}
</style>
