import { INITIAL_STAT_DATA } from '../initial-data';
import { Schema } from '../schema';

const MVU_READY_TIMEOUT_MS = 10_000;

function getHost(): HTMLElement {
  const host = document.querySelector<HTMLElement>('#app');
  if (!host) {
    throw new Error('找不到前端挂载节点 #app');
  }
  return host;
}

function renderMessage(title: string, detail: string, isError = false): void {
  const host = getHost();
  host.replaceChildren();

  const panel = document.createElement('section');
  panel.style.cssText = [
    'box-sizing:border-box',
    'max-width:640px',
    'margin:0 auto',
    'padding:16px',
    'color:#f3eadf',
    'font:14px/1.6 "Microsoft YaHei",sans-serif',
    'background:#160f1b',
    `border:1px solid ${isError ? '#d65772' : '#58405c'}`,
    'border-radius:12px',
  ].join(';');

  const heading = document.createElement('strong');
  heading.textContent = title;
  heading.style.color = isError ? '#ff8da5' : '#d5a449';

  const description = document.createElement('div');
  description.textContent = detail;
  description.style.cssText = 'margin-top:6px;color:#b7a5b7;white-space:pre-wrap';

  panel.append(heading, description);
  host.append(panel);
}

function waitForMvu(): Promise<void> {
  return Promise.race([
    waitGlobalInitialized('Mvu'),
    new Promise<never>((_, reject) => {
      window.setTimeout(
        () => reject(new Error('等待 MVU 初始化超时，请确认已启用 MVU 变量框架脚本')),
        MVU_READY_TIMEOUT_MS,
      );
    }),
  ]);
}

export async function prepareMvuInterface(): Promise<void> {
  renderMessage('兔窟赌场前端启动中', '正在连接 MVU 变量框架…');
  await waitForMvu();

  renderMessage('兔窟赌场前端启动中', '正在读取本楼层变量…');
  const option: VariableOption = { type: 'message', message_id: getCurrentMessageId() };
  const mvuData = Mvu.getMvuData(option);
  const currentStatData = _.get(mvuData, 'stat_data', {});
  const currentResult = Schema.safeParse(currentStatData);

  if (!currentResult.success) {
    renderMessage('兔窟赌场前端启动中', '检测到变量缺失，正在按角色卡初始值安全补齐…');
    const repairedStatData = Schema.parse(_.merge({}, INITIAL_STAT_DATA, currentStatData), { reportInput: true });
    await Mvu.replaceMvuData({ ...mvuData, stat_data: repairedStatData }, option);
  }
}

export function renderInterfaceError(error: unknown): void {
  const detail = error instanceof Error ? error.message : String(error);
  renderMessage('兔窟赌场前端启动失败', detail, true);
}
