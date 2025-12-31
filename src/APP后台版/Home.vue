<template>
  <div class="app-view active">
    <!-- 首页内容 -->
    <div class="app-header">
      <div class="title">
        <i class="fas fa-home"></i>
        <span>首页</span>
      </div>
    </div>

    <div class="app-content">
      <!-- Slogan区域 - 移至顶部 -->
      <div class="slogan-section">
        <div class="slogan-card">
          <div class="slogan-bg-decoration">
            <div class="decoration-circle circle-1"></div>
            <div class="decoration-circle circle-2"></div>
            <div class="decoration-circle circle-3"></div>
          </div>
          <div class="slogan-content-wrapper">
            <div class="slogan-content">
              <h2 class="slogan-title">
                <span class="title-line">
                  <span class="text-gradient">随心所欲</span>
                </span>
                <span class="title-line">
                  <span class="text-gradient">跨越时空</span>
                </span>
              </h2>
              <p class="slogan-subtitle">
                <span class="subtitle-text">为您送上一切心动的美人</span>
              </p>

              <div class="slogan-footer">
                <div class="slogan-signature">
                  <div class="signature-text">
                    <i class="fas fa-heart"></i>
                    <span>美人团外卖</span>
                    <i class="fas fa-heart"></i>
                  </div>
                </div>
                <div class="version-info">v3.0.0后台版</div>
              </div>
            </div>

            <!-- 新增公告栏和玩法说明 -->
            <div class="announcement-panel">
              <div class="panel-header">
                <i class="fas fa-bullhorn"></i>
                <span>最新公告</span>
              </div>
              <div class="panel-content">
                <div class="notice-item">
                  <span class="notice-tag">活动</span>
                  <span class="notice-text">新增“国企往事”DLC，挂载世界书后点击即可</span>
                </div>
                <div class="notice-item">
                  <span class="notice-tag">更新</span>
                  <span class="notice-text">现在店铺脚本有快捷按钮导出JSON，欢迎分享到发布贴中供大家品尝 </span>
                </div>
                <div class="notice-item">
                  <span class="notice-tag">更新</span>
                  <span class="notice-text">当前推荐非json格式的APP生成方式，深度为0，顺序-1，根据预设情况调整</span>
                </div>
                <div class="notice-item">
                  <span class="notice-tag">更新</span>
                  <span class="notice-text">截断问题多出自预设和正则，我也没有更好的办法，不行你就还我的预设</span>
                </div>
                <div class="notice-item">
                  <span class="notice-tag">更新</span>
                  <span class="notice-text"
                    >经常被截断推荐默认的非js生成模式，破限不完全的预设搜不出明星，只能搜出高仿货🤣</span
                  >
                </div>
              </div>
              <div class="panel-header mt-3">
                <i class="fas fa-gamepad"></i>
                <span>玩法说明</span>
              </div>
              <div class="panel-content">
                <p class="instruction-text">
                  1. 女孩你不想玩了最好向AI下指令‘结束服务’<br />
                  2. 搜某种类别时最好加上“X店铺每个x套餐”<br />
                  3. 正确更新APP的方式是关掉酒馆清空浏览器缓存<br />
                  4. 世界书有二选一模式，如果常截断可以试试不同框架
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分类网格 -->
      <div class="category-grid">
        <div class="category-item" @click="search('各类路人商品-2个店铺每个含3个套餐')">
          <div class="icon-wrapper"><i class="fas fa-street-view"></i></div>
          <span>路人</span>
        </div>
        <div class="category-item" @click="search('路人商品-各类场景偶遇的心动女孩主题-2个店铺每个含3个套餐')">
          <div class="icon-wrapper"><i class="fas fa-mask"></i></div>
          <span>偶遇</span>
        </div>
        <div class="category-item" @click="search('路人商品-色情片中的AV女优主题-2个店铺每个含3个套餐')">
          <div class="icon-wrapper"><i class="fas fa-video"></i></div>
          <span>AV</span>
        </div>
        <div class="category-item" @click="search('路人商品-街上遇到的心动美女主题-2个店铺每个含3个套餐')">
          <div class="icon-wrapper"><i class="fas fa-camera-retro"></i></div>
          <span>街拍</span>
        </div>
        <div class="category-item" @click="search('各类熟人商品-2个店铺每个含3个套餐')">
          <div class="icon-wrapper"><i class="fas fa-user-friends"></i></div>
          <span>熟人</span>
        </div>
        <div class="category-item" @click="search('熟人商品-乱伦主题（不得含母子）-2个店铺每个含3个套餐')">
          <div class="icon-wrapper"><i class="fas fa-heart-broken"></i></div>
          <span>乱伦</span>
        </div>
        <div class="category-item" @click="search('熟人商品-各类职场主题-2个店铺每个含3个套餐')">
          <div class="icon-wrapper"><i class="fas fa-briefcase"></i></div>
          <span>职场</span>
        </div>
        <div class="category-item" @click="search('熟人商品-各类朋友妻主题-2个店铺每个含3个套餐')">
          <div class="icon-wrapper"><i class="fas fa-users"></i></div>
          <span>友妻</span>
        </div>
      </div>

      <!-- 搜索栏 -->
      <div class="search-bar-container">
        <i class="fas fa-search"></i>
        <input v-model="searchKeyword" placeholder="要养成告诉AI“结束XX订单”的好习惯" @keyup.enter="doSearch" />
        <button class="search-btn" :disabled="loading" @click="doSearch">
          {{ loading ? '生成中...' : '搜索' }}
        </button>
      </div>

      <!-- 特色玩法 -->
      <div class="list-section">
        <div class="section-header">
          <h3>特色玩法</h3>
        </div>
        <div class="feature-button-grid">
          <!-- DLC按钮 -->
          <div class="feature-button-item">
            <button class="dlc-button" title="DLC需先挂载世界书" @click="generateDLCContent">
              <div class="dlc-icon">
                <i class="fas fa-history"></i>
              </div>
              <span class="dlc-text">DLC:1995国企往事</span>
              <div class="dlc-badge">NEW</div>
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ShopGenerationAdapter } from '../店铺生成Demo/utils/adapters/shop-generation';
import { InlineInteractionService } from '../店铺生成Demo/utils/core';

// 响应式数据
const searchKeyword = ref('');
const loading = ref(false);

const service = new InlineInteractionService();
const adapter = new ShopGenerationAdapter();

// 通用触发（静默楼层，MVU 自动应用 json_patch）
async function triggerGenerate(keyword: string) {
  if (!keyword.trim()) return;
  if (loading.value) return;
  loading.value = true;
  try {
    await service.execute(adapter, { keyword });
  } catch (e) {
    console.error('[Home] 执行生成失败', e);
  } finally {
    loading.value = false;
  }
}

// 搜索功能
function search(keyword: string) {
  triggerGenerate(`搜索：${keyword}`);
}

function doSearch() {
  if (searchKeyword.value.trim()) {
    search(searchKeyword.value.trim());
  }
}

// DLC内容生成功能
function generateDLCContent() {
  const dlcMessage =
    '生成-首页-店铺列表：1个名为"组织部派来一个年轻人"。其中包含7个套餐，女孩名字分别是：1苏晴；2白慧；3丁小芹；4王春燕；5林婉仪；6秦舒澜；7藤原千惠。套餐内容严格按照设定。';
  triggerGenerate(dlcMessage);
}
</script>

<style lang="scss" scoped>
.app-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  /* position: absolute; */
  /* top: 0; */
  /* left: 0; */
  transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.app-header {
  background: linear-gradient(135deg, var(--bg-header) 0, var(--bg-header-light) 100%);
  padding: 35px 16px 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--border-color), transparent);
  }

  .title {
    font-size: 1.3rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-primary);
    transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);

    i {
      color: var(--accent-primary);
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      padding: 4px;
      border-radius: 6px;

      &:hover {
        background-color: rgba(255, 195, 0, 0.2);
        transform: scale(1.1) rotate(-5deg);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      }
    }
  }
}

.app-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 16px;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    display: none;
  }
}

.category-grid {
  display: grid;
  gap: 16px;
  margin-bottom: 16px;
  grid-template-columns: repeat(4, 1fr); /* 默认值 */

  /* 手机端：3列 (Pad模式下手机也显示宽一点) */
  @media (max-width: 480px) {
    grid-template-columns: repeat(3, 1fr);
  }

  /* 平板端：4列 */
  @media (min-width: 481px) and (max-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }

  /* 大屏端：6列 */
  @media (min-width: 1024px) {
    grid-template-columns: repeat(6, 1fr);
  }
}

.category-item {
  text-align: center;
  cursor: pointer;
  color: var(--text-primary);
  font-size: 0.85rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    background: radial-gradient(circle, rgba(255, 195, 0, 0.3), transparent);
    border-radius: 50%;
    transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    z-index: -1;
  }

  &:active::before {
    width: 80px;
    height: 80px;
    animation: ripple 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .icon-wrapper {
    width: 55px;
    height: 55px;
    background: var(--bg-badge);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 12px;
    font-size: 1.5rem;
    color: var(--accent-primary);
    box-shadow: var(--shadow-sm);
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
    overflow: hidden;
    border: 2px solid transparent;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
      transition: left 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    &:hover::before {
      left: 100%;
    }
  }

  &:hover .icon-wrapper {
    transform: scale(1.1) rotate(8deg);
    box-shadow: var(--shadow-md);
    background: linear-gradient(135deg, var(--accent-primary) 0, var(--accent-dark) 100%);
    color: #ffffff;
    border-color: var(--border-accent);
  }

  &:active .icon-wrapper {
    transform: scale(0.95) rotate(3deg);
  }
}

.search-bar-container {
  display: flex;
  align-items: center;
  background: var(--bg-card);
  border-radius: 50px;
  padding: 4px 8px 4px 16px;
  margin-bottom: 16px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-accent);
  transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 195, 0, 0.1), transparent);
    transition: left 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  &:focus-within {
    box-shadow:
      0 10px 15px rgba(0, 0, 0, 0.1),
      0 0 0 3px var(--border-accent);
    border-color: var(--accent-primary);
    transform: translateY(-1px);

    &::before {
      left: 100%;
    }

    i {
      color: var(--accent-primary);
    }
  }

  i {
    color: var(--text-secondary);
    transition: color 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  input {
    flex-grow: 1;
    border: none;
    outline: 0;
    background: transparent;
    padding: 8px 12px;
    font-size: 0.9rem;
    color: var(--text-primary);
    transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);

    &::placeholder {
      color: var(--text-secondary);
      transition: color 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    &:focus::placeholder {
      color: var(--text-placeholder);
    }
  }

  .search-btn {
    background: linear-gradient(135deg, var(--accent-primary) 0, var(--accent-dark) 100%);
    color: #ffffff;
    border: none;
    border-radius: 50px;
    padding: 8px 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    position: relative;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    &:hover {
      background: linear-gradient(135deg, var(--accent-dark) 0, #cc9900 100%);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }

    &:active::before {
      width: 100px;
      height: 100px;
      animation: ripple 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
  }
}

// Slogan区域样式
.slogan-section {
  margin-bottom: 16px;
  animation: fadeInUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slogan-card {
  position: relative;
  background: linear-gradient(
    135deg,
    rgba(255, 195, 0, 0.15) 0%,
    rgba(255, 215, 64, 0.1) 50%,
    rgba(255, 195, 0, 0.05) 100%
  );
  border-radius: 24px;
  padding: 24px;
  box-shadow:
    0 8px 32px rgba(255, 195, 0, 0.2),
    0 4px 16px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 195, 0, 0.3);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  &:hover {
    transform: translateY(-4px);
    box-shadow:
      0 16px 48px rgba(255, 195, 0, 0.25),
      0 8px 24px rgba(0, 0, 0, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }

  .slogan-bg-decoration {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;

    .decoration-circle {
      position: absolute;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255, 195, 0, 0.1) 0%, transparent 70%);
      animation: float 6s ease-in-out infinite;

      &.circle-1 {
        width: 120px;
        height: 120px;
        top: -30px;
        right: -30px;
        animation-delay: 0s;
      }

      &.circle-2 {
        width: 80px;
        height: 80px;
        bottom: -20px;
        left: -20px;
        animation-delay: 2s;
      }

      &.circle-3 {
        width: 60px;
        height: 60px;
        top: 50%;
        right: 20%;
        animation-delay: 4s;
      }
    }
  }

  .slogan-content-wrapper {
    display: flex;
    flex-direction: column;
    gap: 20px;
    position: relative;
    z-index: 1;

    /* 平板端：左右布局 */
    @media (min-width: 600px) {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      text-align: left;
    }
  }

  .slogan-content {
    flex: 1;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center; /* 默认居中 */
    justify-content: center;

    /* 平板端：左侧居中 */
    @media (min-width: 600px) {
      text-align: center; /* 文本居中 */
      align-items: center; /* 元素居中 */
      padding-right: 20px;
      border-right: 1px solid rgba(255, 195, 0, 0.2);
    }

    .slogan-title {
      margin: 0 0 16px 0;
      line-height: 1.2;

      .title-line {
        display: block;
        font-size: 1.8rem;
        font-weight: 900;
        letter-spacing: 1px;
        margin-bottom: 8px;
        position: relative;
        animation: slideInLeft 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);

        &:last-child {
          margin-bottom: 0;
        }

        .text-gradient {
          background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-dark) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 2px 8px rgba(255, 195, 0, 0.3);
          position: relative;

          &::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, transparent, var(--accent-primary), transparent);
            animation: shimmer 2s ease-in-out infinite;
          }
        }
      }
    }

    .slogan-subtitle {
      margin: 0 0 20px 0;
      font-size: 1.05rem;
      font-weight: 500;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      animation: fadeIn 1s ease-out 0.5s both;
      letter-spacing: 0.3px;
      font-style: italic;
      text-shadow: 0 1px 2px rgba(255, 195, 0, 0.1);

      /* 平板端：左对齐 */
      @media (min-width: 600px) {
        justify-content: flex-start;
      }

      .subtitle-text {
        opacity: 0.95;
        background: linear-gradient(135deg, var(--text-primary) 0%, var(--accent-dark) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }

    .slogan-signature {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      animation: fadeInUp 1s ease-out 0.8s both;

      /* 平板端：左对齐 */
      @media (min-width: 600px) {
        justify-content: flex-start;
      }

      .signature-line {
        width: 40px;
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--accent-primary), transparent);
      }

      .signature-text {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--accent-dark);
        background: rgba(255, 195, 0, 0.1);
        padding: 8px 16px;
        border-radius: 20px;
        border: 1px solid rgba(255, 195, 0, 0.2);

        i {
          color: var(--accent-primary);
          animation: heartbeat 2s ease-in-out infinite;

          &:last-child {
            animation-delay: 1s;
          }
        }
      }
    }
  }

  .announcement-panel {
    flex: 1;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 16px;
    padding: 16px;
    border: 1px solid var(--border-accent);
    animation: fadeIn 1s ease-out 0.3s both;

    .panel-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--accent-dark);
      margin-bottom: 10px;

      &.mt-3 {
        margin-top: 12px;
      }

      i {
        color: var(--accent-primary);
      }
    }

    .panel-content {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .notice-item {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        font-size: 0.85rem;

        .notice-tag {
          background: var(--accent-primary);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 600;
          flex-shrink: 0;
          margin-top: 2px; /* 微调对齐 */
        }

        .notice-text {
          color: var(--text-primary);
          line-height: 1.4;
        }
      }

      .instruction-text {
        font-size: 0.85rem;
        color: var(--text-secondary);
        line-height: 1.5;
        margin: 0;
      }
    }
  }
}

// 动画定义
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(5deg);
  }
}

@keyframes shimmer {
  0%,
  100% {
    opacity: 0;
    transform: translateX(-100%);
  }
  50% {
    opacity: 1;
    transform: translateX(100%);
  }
}

@keyframes heartbeat {
  0%,
  100% {
    transform: scale(1);
  }
  14% {
    transform: scale(1.2);
  }
  28% {
    transform: scale(1);
  }
  42% {
    transform: scale(1.2);
  }
  70% {
    transform: scale(1);
  }
}

@keyframes ripple {
  to {
    width: 300px;
    height: 300px;
    opacity: 0;
  }
}

.list-section {
  background: var(--bg-card);
  padding: 16px;
  border-radius: 16px;
  margin-bottom: 16px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-accent);
  position: relative;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 195, 0, 0.03), transparent);
    transition: left 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  &:hover::before {
    left: 100%;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h3 {
      margin: 0;
      font-size: 1.15rem;
      color: var(--text-primary);
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);

      &::before {
        content: '';
        display: block;
        width: 4px;
        height: 18px;
        background: linear-gradient(135deg, var(--accent-primary) 0, #ff6b35 100%);
        border-radius: 6px;
        transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }
    }
  }

  &:hover .section-header h3::before {
    width: 6px;
    height: 20px;
    box-shadow: 0 0 8px rgba(255, 195, 0, 0.4);
  }
}

.feature-button-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 0;
}

.feature-button-item {
  display: flex;
  justify-content: center;
  padding: 8px 0;
}

.dlc-button {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 16px 20px;
  width: 100%; /* 宽度撑满 */
  text-align: left;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 4px 12px rgba(30, 60, 114, 0.3);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  &:hover {
    background: linear-gradient(135deg, #2a5298 0%, #1e3c72 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(30, 60, 114, 0.4);
    border-color: rgba(255, 255, 255, 0.2);

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(30, 60, 114, 0.3);
  }

  .dlc-icon {
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    flex-shrink: 0;

    i {
      color: #ffd700;
      font-size: 1.1rem;
    }

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.05);
    }
  }

  .dlc-text {
    flex-grow: 1;
    color: #ffffff;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .dlc-badge {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
    color: #ffffff;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 4px 8px;
    border-radius: 20px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 2px 4px rgba(238, 90, 36, 0.3);
    animation: pulse 2s ease-in-out infinite;
    flex-shrink: 0;
  }
}

.nav-bar {
  display: flex;
  border-top: 1px solid var(--border-color);
  background: linear-gradient(135deg, var(--bg-header) 0, var(--bg-header-light) 100%);
  padding: 8px 0;
  flex-shrink: 0;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--border-color), transparent);
  }

  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--text-secondary);
    font-size: 0.8rem;
    padding: 4px 0;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    position: relative;
    border-radius: 8px;
    margin: 0 4px;

    &.active {
      color: var(--text-primary);

      i {
        color: var(--accent-primary);
        transform: scale(1.15) translateY(-2px);
      }
    }

    &:hover:not(.active) {
      color: var(--text-primary);
      transform: translateY(-1px);
    }

    i {
      font-size: 1.25rem;
      margin-bottom: 4px;
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
  }
}

.empty-state {
  text-align: center;
  color: var(--text-secondary);
  padding: 40px 20px;
  line-height: 1.6;
}

// 动画
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes bounce {
  0%,
  100%,
  20%,
  53%,
  80% {
    transform: translate3d(0, 0, 0);
  }
  40%,
  43% {
    transform: translate3d(0, -8px, 0);
  }
  70% {
    transform: translate3d(0, -4px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}

@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
}
</style>
