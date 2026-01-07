import { diffWorldHours } from '../../util/time';
import { findRoleLocation } from '../../util/room';
import { normalizeScope, ShelterScopeByFloor, isRoomSheltered } from '../../util/shelter_scope';
import { clampHealth, computeOffstageHealthDelta, healthCondition, HealthRules } from '../../util/health';

type RoleLike = {
  姓名?: string;
  健康?: number;
  健康更新原因?: string;
  健康状况?: string;
  登场状态?: string;
  关系?: string;
  关系倾向?: string;
  秩序刻印?: number;
  秩序刻印更新原因?: string;
};

type RoleTouched = {
  health: boolean;
  healthReason: boolean;
  relation: boolean;
  relationTendency: boolean;
  imprint: boolean;
  imprintReason: boolean;
};

function relationStageFromImprint(mark: number): '拒绝' | '交易' | '顺从' | '忠诚' | '性奴' {
  const v = _.clamp(Number(mark) || 0, 0, 100);
  if (v < 20) return '拒绝';
  if (v < 40) return '交易';
  if (v < 60) return '顺从';
  if (v < 90) return '忠诚';
  return '性奴';
}

function readShelterScopeFromChat(): ShelterScopeByFloor {
  const vars = getVariables({ type: 'chat' }) ?? {};
  const raw = _.get(vars, 'eden.shelter_scope', {});
  if (!raw || typeof raw !== 'object') return {};
  return normalizeScope(raw as any);
}

function readHealthRulesFromChat(): HealthRules {
  const vars = getVariables({ type: 'chat' }) ?? {};
  const raw = _.get(vars, 'eden.rules.health', {}) ?? {};
  const r = raw as Partial<HealthRules>;
  return {
    decayPer6h: _.clamp(Number(r.decayPer6h) || 5, 0, 10),
    recoverPer12h: _.clamp(Number(r.recoverPer12h) || 1, 0, 10),
    decayMultiplier: _.clamp(Number(r.decayMultiplier) || 1, 0, 10),
    recoverMultiplier: _.clamp(Number(r.recoverMultiplier) || 1, 0, 10),
  };
}

function isShelteredForRole(stat_data: any, roleName: string, scope: ShelterScopeByFloor): boolean {
  const rooms = _.get(stat_data, '房间', {});
  const loc = findRoleLocation(rooms, roleName);
  if (loc.kind === 'core' || loc.kind === 'entrance') return true;
  if (loc.kind === 'floor') {
    if (loc.floor === '20' && loc.roomNumber === '2001') return true;
    return isRoomSheltered(scope, loc.floor, loc.roomNumber);
  }
  return false;
}

function isRoleLike(val: any): val is RoleLike {
  return val && typeof val === 'object' && '健康' in val && '登场状态' in val;
}

function diffRoleTouched(oldRole: RoleLike | null, newRole: RoleLike): RoleTouched {
  if (!oldRole) {
    return { health: false, healthReason: false, relation: false, relationTendency: false, imprint: false, imprintReason: false };
  }
  return {
    health: !_.isEqual(oldRole.健康, newRole.健康),
    healthReason: !_.isEqual(oldRole.健康更新原因, newRole.健康更新原因),
    relation: !_.isEqual(oldRole.关系, newRole.关系),
    relationTendency: !_.isEqual(oldRole.关系倾向, newRole.关系倾向),
    imprint: !_.isEqual(oldRole.秩序刻印, newRole.秩序刻印),
    imprintReason: !_.isEqual(oldRole.秩序刻印更新原因, newRole.秩序刻印更新原因),
  };
}

function applyOffstageRoleHealthIfNeeded(
  rolePath: string,
  roleName: string,
  oldRole: RoleLike | null,
  newRole: RoleLike,
  stat_data: any,
  deltaHours: number | null,
  scope: ShelterScopeByFloor,
  rules: HealthRules,
) {
  if (newRole.登场状态 !== '离场') return;
  if (!oldRole) return;
  if (deltaHours === null) return;

  // 规则：只要 AI 本轮对“健康/健康更新原因”有指令，就认为是剧情介入，脚本不做基础结算
  const touched = diffRoleTouched(oldRole, newRole);
  if (touched.health || touched.healthReason) return;

  const currentHealth = clampHealth(Number(newRole.健康) || 0);
  const sheltered = isShelteredForRole(stat_data, roleName, scope);
  const computed = computeOffstageHealthDelta(deltaHours, sheltered, rules);
  if (!computed.delta) return;

  const nextHealth = clampHealth(currentHealth + computed.delta);
  const actualDelta = nextHealth - currentHealth;

  const label = computed.reason.split(',').slice(1).join(',').trim() || (sheltered ? '离场受庇护休整' : '离场未受庇护自然衰减');
  const reasonText = actualDelta
    ? `${actualDelta > 0 ? `+${actualDelta}` : `${actualDelta}`}, ${label}`
    : '0, 无变化';

  _.set(stat_data, `${rolePath}.健康`, nextHealth);
  _.set(stat_data, `${rolePath}.健康更新原因`, reasonText);
  console.log(`[离场健康结算] ${roleName}: ${currentHealth} → ${nextHealth} (${reasonText})`);
}

function applyDerivedHealthStatus(rolePath: string, role: RoleLike, stat_data: any) {
  const health = clampHealth(Number(role.健康) || 0);
  const expected = healthCondition(health);
  if (role.健康状况 !== expected) {
    _.set(stat_data, `${rolePath}.健康状况`, expected);
  }
}

function applyDerivedRelationStage(rolePath: string, oldRole: RoleLike | null, newRole: RoleLike, stat_data: any) {
  const markRaw = newRole.秩序刻印;
  if (typeof markRaw !== 'number' && typeof markRaw !== 'string') return;
  const stage = relationStageFromImprint(Number(markRaw));

  // 规则：脚本只在阈值导致阶段变化时写回关系；若 AI 本轮明确更新了关系，则不覆盖
  const touched = diffRoleTouched(oldRole, newRole);
  if (touched.relation) return;

  if (newRole.关系 !== stage) {
    _.set(stat_data, `${rolePath}.关系`, stage);
  }
}

$(async () => {
  await waitGlobalInitialized('Mvu');

  eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, (new_variables, old_variables) => {
    const oldWorld = _.get(old_variables, 'stat_data.世界', {});
    const newWorld = _.get(new_variables, 'stat_data.世界', {});
    const deltaHours = diffWorldHours(oldWorld, newWorld);

    const stat_data = _.get(new_variables, 'stat_data', {});
    const old_stat_data = _.get(old_variables, 'stat_data', {});

    const scope = readShelterScopeFromChat();
    const rules = readHealthRulesFromChat();

    const reserved = new Set(['世界', '庇护所', '房间', '主线任务', '楼层其他住户', '临时NPC']);
    for (const [key, val] of Object.entries(stat_data ?? {})) {
      if (reserved.has(key)) continue;
      if (typeof key !== 'string' || key.startsWith('_')) continue;
      if (!isRoleLike(val)) continue;

      const oldRole = (_.get(old_stat_data, key, null) as any) as RoleLike | null;
      applyOffstageRoleHealthIfNeeded(key, key, oldRole, val as any, stat_data, deltaHours, scope, rules);
      applyDerivedHealthStatus(key, val as any, stat_data);
      applyDerivedRelationStage(key, oldRole, val as any, stat_data);
    }

    const tempNpc = _.get(stat_data, '临时NPC', {});
    if (tempNpc && typeof tempNpc === 'object') {
      for (const [name, val] of Object.entries(tempNpc)) {
        if (typeof name !== 'string' || !name) continue;
        if (!isRoleLike(val)) continue;

        const oldRole = (_.get(old_stat_data, `临时NPC.${name}`, null) as any) as RoleLike | null;
        applyOffstageRoleHealthIfNeeded(`临时NPC.${name}`, name, oldRole, val as any, stat_data, deltaHours, scope, rules);
        applyDerivedHealthStatus(`临时NPC.${name}`, val as any, stat_data);
        applyDerivedRelationStage(`临时NPC.${name}`, oldRole, val as any, stat_data);
      }
    }
  });
});
