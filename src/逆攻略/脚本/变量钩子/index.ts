type RoleState = {
  _user好感度?: number;
  _攻略阶段?: string;
  $利益贡献?: number;
};

type ReverseConquestStatData = {
  user?: {
    $利益点数?: number;
  };
  角色?: Record<string, RoleState>;
  系统日志?: unknown[];
};

const STAGE_RANGES = [
  { min: -100, max: -70, stage: '厌恶' },
  { min: -69, max: -40, stage: '排斥' },
  { min: -39, max: -15, stage: '冷淡' },
  { min: -14, max: 14, stage: '无感' },
  { min: 15, max: 39, stage: '留意' },
  { min: 40, max: 59, stage: '接纳' },
  { min: 60, max: 74, stage: '喜爱' },
  { min: 75, max: 89, stage: '心动' },
  { min: 90, max: 100, stage: '倾心' },
] as const;

function toNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function getStage(favorability: unknown) {
  const value = _.clamp(Math.trunc(toNumber(favorability)), -100, 100);
  return STAGE_RANGES.find(range => value >= range.min && value <= range.max)?.stage ?? '无感';
}

function getStatData(variables: Mvu.MvuData): ReverseConquestStatData {
  if (!variables.stat_data || typeof variables.stat_data !== 'object') {
    variables.stat_data = {};
  }
  return variables.stat_data as ReverseConquestStatData;
}

function syncBenefitPoints(current: ReverseConquestStatData, previous: ReverseConquestStatData) {
  const roles = current.角色 ?? {};
  const previousRoles = previous.角色 ?? {};
  const totalDelta = Object.entries(roles).reduce((sum, [name, role]) => {
    const oldValue = toNumber(previousRoles[name]?.$利益贡献);
    const newValue = toNumber(role?.$利益贡献);
    return sum + Math.max(0, newValue - oldValue);
  }, 0);

  if (totalDelta <= 0) {
    return;
  }

  if (!current.user) {
    current.user = {};
  }
  current.user.$利益点数 = Math.max(0, toNumber(current.user.$利益点数) + totalDelta);
}

function syncConquestStages(current: ReverseConquestStatData) {
  for (const role of Object.values(current.角色 ?? {})) {
    if (!role || typeof role !== 'object') {
      continue;
    }
    role._user好感度 = _.clamp(Math.trunc(toNumber(role._user好感度)), -100, 100);
    role._攻略阶段 = getStage(role._user好感度);
  }
}

function clearSystemLogs(current: ReverseConquestStatData) {
  if (Array.isArray(current.系统日志) && current.系统日志.length > 0) {
    current.系统日志 = [];
  }
}

function applyVariableHooks(variables: Mvu.MvuData, variablesBeforeUpdate: Mvu.MvuData) {
  const current = getStatData(variables);
  const previous = getStatData(variablesBeforeUpdate);

  syncBenefitPoints(current, previous);
  syncConquestStages(current);
  clearSystemLogs(current);
}

$(() => {
  waitGlobalInitialized('Mvu').then(() => {
    eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, applyVariableHooks);
    console.info('[逆攻略] 变量钩子已加载');
  });
});
