<script setup lang="ts">
import { useMapStore } from '../store';

const store = useMapStore();

const importMode = ref<'none' | 'url' | 'file'>('none');
const urlInput = ref('');
const isLoading = ref(false);
const errorMsg = ref('');
const showGuide = ref(false);

/** 从 URL 导入
 * 支持：
 *   1) 完整 URL —— 直接 fetch
 *   2) 仓库文件路径 user/repo/.../name.json —— 走 jsDelivr
 *   3) 仓库文件夹路径 user/repo/... —— 调 GitHub API 找到目录下唯一的 .json
 */
async function importFromUrl() {
  if (!urlInput.value.trim()) return;
  isLoading.value = true;
  errorMsg.value = '';

  try {
    const raw = urlInput.value.trim();
    let jsonUrl = '';

    if (/^https?:\/\//i.test(raw)) {
      // 完整 URL —— 直接使用（图床、第三方 CDN、自建等）
      jsonUrl = raw;
    } else if (raw.includes('/')) {
      if (/\.json(\?|$)/i.test(raw)) {
        // 用户明确写了 .json 文件名 —— 直接套 jsDelivr
        jsonUrl = `https://testingcf.jsdelivr.net/gh/${raw}`;
      } else {
        // 把 user/repo/path 当成文件夹 —— 用 GitHub API 找唯一的 JSON
        jsonUrl = await discoverJsonInRepoFolder(raw);
      }
    } else {
      throw new Error('请输入完整 URL 或 GitHub 仓库路径（用户/仓库/路径）');
    }

    const resp = await fetch(jsonUrl);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
    const data = await resp.json();
    store.installPack(data, jsonUrl);
    importMode.value = 'none';
    urlInput.value = '';
  } catch (e: any) {
    errorMsg.value = e.message || '导入失败';
  } finally {
    isLoading.value = false;
  }
}

/** 调用 GitHub API 列目录，找到其中唯一的 .json 文件 */
async function discoverJsonInRepoFolder(repoPath: string): Promise<string> {
  const parts = repoPath.split('/').filter(Boolean);
  if (parts.length < 2) {
    throw new Error('GitHub 路径至少需要 用户/仓库');
  }
  const [owner, repo, ...pathParts] = parts;
  const subPath = pathParts.join('/');
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${subPath}`;

  const resp = await fetch(apiUrl);
  if (!resp.ok) {
    if (resp.status === 403) {
      throw new Error('GitHub API 频率限制（每小时 60 次），请稍后重试，或直接填写完整 .json URL');
    }
    if (resp.status === 404) {
      throw new Error('路径不存在，请检查 用户/仓库/路径 是否正确');
    }
    throw new Error(`无法列出目录 (HTTP ${resp.status})`);
  }

  const items = await resp.json();
  if (!Array.isArray(items)) {
    throw new Error('该路径指向的是文件而不是文件夹，请直接在末尾加上 .json 文件名');
  }
  const jsonFiles = items.filter((f: any) => f.type === 'file' && /\.json$/i.test(f.name));
  if (jsonFiles.length === 0) {
    throw new Error('文件夹里没有找到 .json 文件');
  }
  if (jsonFiles.length > 1) {
    const names = jsonFiles.map((f: any) => f.name).join('、');
    throw new Error(`文件夹里有多个 .json 文件（${names}），请把完整路径写到具体文件名`);
  }
  return `https://testingcf.jsdelivr.net/gh/${repoPath}/${jsonFiles[0].name}`;
}

/** 从文件导入 */
function onFileUpload(e: Event) {
  const input = e.target as HTMLInputElement;
  if (!input.files?.[0]) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result as string);
      store.installPack(data, `(file: ${input.files![0].name})`);
      importMode.value = 'none';
      errorMsg.value = '';
    } catch (err: any) {
      errorMsg.value = err.message || '文件解析失败';
    }
    input.value = '';
  };
  reader.readAsText(input.files[0]);
}
</script>

<template>
  <div class="imap-manager">
    <div class="imap-manager-head">
      <h3 class="imap-manager-title">📦 地图包管理</h3>
      <button class="imap-btn imap-btn-sm imap-btn-ghost" @click="showGuide = !showGuide">
        {{ showGuide ? '收起说明' : '❓ 导入说明' }}
      </button>
    </div>

    <!-- 使用说明 -->
    <div v-if="showGuide" class="imap-guide">
      <h4>📘 两种导入方式怎么选？</h4>
      <ul class="imap-guide-list">
        <li>
          <strong>🔗 URL 导入</strong>：从远程链接拉取地图包 JSON。
          <br />
          <span class="imap-guide-note">适合跟作者更新同步 —— 作者改了，你这边刷新就能用最新版本。</span>
          <br />
          支持三种输入：
          <ul>
            <li><strong>GitHub 仓库文件夹</strong>：<code>用户/仓库/路径</code>
              <br /><span class="imap-guide-note">脚本会自动查找文件夹里的 .json 文件（仅当文件夹内有且只有一个 JSON 时生效）</span>
            </li>
            <li><strong>GitHub 仓库文件</strong>：<code>用户/仓库/路径/文件名.json</code>
              <br /><span class="imap-guide-note">精确指定某个 JSON，文件夹里可以有多个 JSON</span>
            </li>
            <li><strong>完整 URL</strong>：<code>https://.../任意名.json</code>
              <br /><span class="imap-guide-note">图床、CDN、自建服务器等都行</span>
            </li>
          </ul>
        </li>
        <li>
          <strong>📁 文件上传</strong>：本地选择 <code>.json</code> 文件。
          <br />
          <span class="imap-guide-note">适合自己做的私人地图、离线使用，或者想改了就自己存的场景。</span>
        </li>
      </ul>

      <h4>📂 仓库文件夹结构建议</h4>
      <p class="imap-guide-para">
        打算让别人用"文件夹路径"自动发现的话，<strong>文件夹里只放地图背景图片 + 一个 .json 地图包文件</strong>，
        不要放其它 .json（README、配置等），否则自动发现无法确定用哪一个。
      </p>
      <p class="imap-guide-para">
        图片引用方式二选一：JSON 里给 <code>image</code> 填完整外链（图床 URL），或者填裸文件名并让脚本用 JSON 所在文件夹作为 <code>baseUrl</code>。
      </p>

      <h4>🧩 地图包 JSON 结构</h4>
      <p class="imap-guide-para">
        必需字段：<code>name</code>、<code>defaultMapId</code>（默认地图 ID）、<code>maps</code>（地图层级字典）。
        可选：<code>baseUrl</code>（留空则自动用 JSON 所在文件夹）、<code>version</code>、<code>author</code>。
      </p>

      <p class="imap-guide-tip">
        💡 提示：如果 URL 导入报错但链接看起来没问题，可能是 jsDelivr 缓存了旧版本，
        在链接后面加个 <code>?v=时间戳</code>（任意值）强制刷新即可。
      </p>
    </div>

    <!-- 已安装列表 -->
    <div class="imap-pack-list">
      <div
v-for="(pack, i) in store.installedPacks" :key="i" class="imap-pack-item"
        :class="{ active: i === store.activePackIndex }">
        <div class="imap-pack-info">
          <span class="imap-pack-name">{{ pack.name }}</span>
          <span class="imap-pack-meta">v{{ pack.version }} · {{ pack.sourceUrl || '内置' }}</span>
        </div>
        <div class="imap-pack-actions">
          <button v-if="i !== store.activePackIndex" class="imap-btn imap-btn-sm" @click="store.switchPack(i)">
            使用
          </button>
          <span v-else class="imap-pack-badge">当前</span>
          <button
v-if="store.installedPacks.length > 1" class="imap-btn imap-btn-sm imap-btn-danger"
            @click="store.removePack(i)">
            删除
          </button>
        </div>
      </div>
    </div>

    <!-- 导入区域 -->
    <div class="imap-import-section">
      <div v-if="importMode === 'none'" class="imap-import-buttons">
        <button class="imap-btn" @click="importMode = 'url'">🔗 从 URL 导入</button>
        <button class="imap-btn" @click="importMode = 'file'">📁 上传 JSON 文件</button>
      </div>

      <!-- URL 导入 -->
      <div v-if="importMode === 'url'" class="imap-import-form">
        <p class="imap-import-hint">
          支持：完整 URL、仓库文件夹 <code>用户/仓库/路径</code>（自动找唯一 JSON）、仓库文件 <code>用户/仓库/路径/name.json</code>
        </p>
        <div class="imap-import-row">
          <input
v-model="urlInput" class="imap-input" placeholder="粘贴 URL 或仓库路径"
            @keyup.enter="importFromUrl" />
          <button class="imap-btn imap-btn-primary" :disabled="isLoading || !urlInput.trim()" @click="importFromUrl">
            {{ isLoading ? '加载中...' : '导入' }}
          </button>
        </div>
        <button class="imap-btn imap-btn-ghost" @click="importMode = 'none'">取消</button>
      </div>

      <!-- 文件导入 -->
      <div v-if="importMode === 'file'" class="imap-import-form">
        <input type="file" accept=".json" @change="onFileUpload" />
        <button class="imap-btn imap-btn-ghost" @click="importMode = 'none'">取消</button>
      </div>

      <!-- 错误提示 -->
      <div v-if="errorMsg" class="imap-import-error">⚠️ {{ errorMsg }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.imap-manager {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.imap-manager-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.imap-manager-title {
  margin: 0;
  font-size: 16px;
  color: #fff;
  font-weight: 600;
}

.imap-guide {
  background: rgba(179, 139, 89, 0.05);
  border: 1px solid rgba(179, 139, 89, 0.2);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.55;

  h4 {
    margin: 4px 0 6px;
    font-size: 13px;
    color: #c9a96a;
    font-weight: 600;
  }

  code {
    background: rgba(255, 255, 255, 0.08);
    padding: 1px 5px;
    border-radius: 3px;
    font-size: 11px;
    font-family: 'Consolas', monospace;
    color: #e0c69a;
  }
}

.imap-guide-list {
  margin: 0 0 6px;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  ul {
    margin: 4px 0;
    padding-left: 18px;

    li {
      margin: 2px 0;
    }
  }
}

.imap-guide-note {
  color: rgba(255, 255, 255, 0.45);
  font-size: 11px;
}

.imap-guide-para {
  margin: 0 0 6px;
}

.imap-guide-tip {
  margin: 6px 0 0;
  padding: 6px 8px;
  background: rgba(243, 156, 18, 0.08);
  border-left: 2px solid rgba(243, 156, 18, 0.4);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.65);
  font-size: 11px;
}

.imap-pack-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.imap-pack-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  transition: all 0.15s;

  &.active {
    border-color: rgba(179, 139, 89, 0.3);
    background: rgba(179, 139, 89, 0.06);
  }
}

.imap-pack-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.imap-pack-name {
  font-size: 14px;
  color: #fff;
  font-weight: 500;
}

.imap-pack-meta {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.imap-pack-actions {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-shrink: 0;
}

.imap-pack-badge {
  font-size: 11px;
  color: #b38b59;
  padding: 2px 8px;
  background: rgba(179, 139, 89, 0.12);
  border-radius: 10px;
}

.imap-import-section {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 12px;
}

.imap-import-buttons {
  display: flex;
  gap: 8px;
}

.imap-import-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.imap-import-hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
  margin: 0;

  code {
    background: rgba(255, 255, 255, 0.08);
    padding: 1px 4px;
    border-radius: 3px;
  }
}

.imap-import-row {
  display: flex;
  gap: 6px;
}

.imap-import-error {
  font-size: 13px;
  color: #e57373;
  margin-top: 4px;
}

.imap-input {
  flex: 1;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #fff;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: rgba(179, 139, 89, 0.5);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.25);
  }
}

.imap-btn {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.imap-btn-sm {
  padding: 4px 10px;
  font-size: 12px;
}

.imap-btn-primary {
  background: linear-gradient(135deg, #b38b59, #9a7548);
  color: #fff;
  border: none;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #c99e68, #b38b59);
  }
}

.imap-btn-danger {
  color: #e57373;
  border-color: rgba(229, 115, 115, 0.2);

  &:hover {
    background: rgba(229, 115, 115, 0.1) !important;
  }
}

.imap-btn-ghost {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);

  &:hover:not(:disabled) {
    color: rgba(255, 255, 255, 0.7);
    background: rgba(255, 255, 255, 0.06);
  }
}
</style>
