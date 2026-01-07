import { z } from 'zod';
import { HealthRules } from '../util/health';
import { floorRoomCapacity, normalizeScope, ShelterScopeByFloor } from '../util/shelter_scope';
import { buildShelterScopeInstructionText, CHAT_VAR_KEYS } from './outbound';

const ScopeSchema = z.record(z.string(), z.array(z.string())).prefault({});

const HealthRulesSchema = z
  .object({
    decayPer6h: z.coerce.number().prefault(5),
    recoverPer12h: z.coerce.number().prefault(1),
    decayMultiplier: z.coerce.number().prefault(1),
    recoverMultiplier: z.coerce.number().prefault(1),
  })
  .prefault({
    decayPer6h: 5,
    recoverPer12h: 1,
    decayMultiplier: 1,
    recoverMultiplier: 1,
  });

function readScopeFromChat(): ShelterScopeByFloor {
  const vars = getVariables({ type: 'chat' }) ?? {};
  const parsed = ScopeSchema.safeParse(_.get(vars, CHAT_VAR_KEYS.EDEN_SHELTER_SCOPE, {}));
  if (!parsed.success) return {};
  return normalizeScope(parsed.data);
}

function readHealthRulesFromChat(): HealthRules {
  const vars = getVariables({ type: 'chat' }) ?? {};
  const parsed = HealthRulesSchema.safeParse(_.get(vars, CHAT_VAR_KEYS.EDEN_RULES_HEALTH, {}));
  if (!parsed.success) return HealthRulesSchema.parse({});

  return sanitizeHealthRules(parsed.data);
}

function sanitizeHealthRules(rules: HealthRules): HealthRules {
  return {
    decayPer6h: _.clamp(Number(rules.decayPer6h) || 0, 0, 10),
    recoverPer12h: _.clamp(Number(rules.recoverPer12h) || 0, 0, 10),
    decayMultiplier: _.clamp(Number(rules.decayMultiplier) || 0, 0, 10),
    recoverMultiplier: _.clamp(Number(rules.recoverMultiplier) || 0, 0, 10),
  };
}

export const useShelterScopeStore = defineStore(
  CHAT_VAR_KEYS.EDEN_SHELTER_SCOPE,
  errorCatched(() => {
    const scope = ref<ShelterScopeByFloor>(readScopeFromChat());
    const healthRules = ref<HealthRules>(readHealthRulesFromChat());

    const { ignoreUpdates } = watchIgnorable(
      [scope, healthRules],
      () => {
        updateVariablesWith(
          vars => {
            _.set(vars, CHAT_VAR_KEYS.EDEN_SHELTER_SCOPE, normalizeScope(scope.value));
            _.set(vars, CHAT_VAR_KEYS.EDEN_RULES_HEALTH, sanitizeHealthRules(healthRules.value));
            return vars;
          },
          { type: 'chat' },
        );
      },
      { deep: true },
    );

    watch(
      healthRules,
      next => {
        const sanitized = sanitizeHealthRules(next);
        if (!_.isEqual(next, sanitized)) {
          ignoreUpdates(() => {
            healthRules.value = sanitized;
          });
        }
      },
      { deep: true },
    );

    useIntervalFn(() => {
      const nextScope = readScopeFromChat();
      const nextRules = readHealthRulesFromChat();

      if (!_.isEqual(nextScope, scope.value) || !_.isEqual(nextRules, healthRules.value)) {
        ignoreUpdates(() => {
          scope.value = nextScope;
          healthRules.value = nextRules;
        });
      }
    }, 2000);

    function canEditFloor(floor: '20' | '19', level: number): boolean {
      return floorRoomCapacity(level, floor) > 0;
    }

    function toggleRoom(floor: '20' | '19', roomNumber: string, level: number): { ok: boolean; reason?: string } {
      if (!canEditFloor(floor, level)) return { ok: false, reason: '当前等级未解锁该楼层庇护范围' };
      if (floor === '20' && roomNumber === '2001') return { ok: false, reason: '2001 为庇护所本体，无需设置庇护' };

      const max = floorRoomCapacity(level, floor);
      const current = scope.value[floor] ?? [];
      const next = current.slice();

      const idx = next.indexOf(roomNumber);
      if (idx >= 0) {
        next.splice(idx, 1);
        scope.value = normalizeScope({ ...scope.value, [floor]: next });
        return { ok: true };
      }

      if (next.length >= max) return { ok: false, reason: `该楼层庇护范围已达上限（${max} 间）` };
      next.push(roomNumber);
      scope.value = normalizeScope({ ...scope.value, [floor]: next });
      return { ok: true };
    }

    function clearAll() {
      scope.value = {};
    }

    function buildInstructionText(): string {
      return buildShelterScopeInstructionText(scope.value);
    }

    return { scope, healthRules, toggleRoom, clearAll, buildInstructionText, canEditFloor };
  }),
);
