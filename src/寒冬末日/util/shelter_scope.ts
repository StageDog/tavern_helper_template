export type ShelterScopeByFloor = Record<string, string[]>;

export function floorRoomCapacity(level: number, floor: '20' | '19'): number {
  const lv = Number(level);
  if (!Number.isFinite(lv)) return 0;

  if (floor === '20') {
    // 设定：Lv3=3 间，Lv4=6 间，Lv5=12 间（封顶）
    if (lv < 3) return 0;
    if (lv === 3) return 3;
    if (lv === 4) return 6;
    return 12;
  }

  // 19 层从等级 6 开始
  if (lv < 6) return 0;
  return _.clamp((lv - 5) * 3, 0, 12);
}

export function isRoomSheltered(scope: ShelterScopeByFloor, floor: '20' | '19', roomNumber: string): boolean {
  const list = scope?.[floor] ?? [];
  if (!Array.isArray(list)) return false;
  return list.includes(roomNumber);
}

export function normalizeScope(scope: ShelterScopeByFloor): ShelterScopeByFloor {
  const out: ShelterScopeByFloor = {};
  for (const [floor, rooms] of Object.entries(scope ?? {})) {
    if (!Array.isArray(rooms)) continue;
    out[floor] = _(rooms)
      .filter((x: any) => typeof x === 'string' && x.trim())
      .filter((room: string) => !(floor === '20' && room === '2001'))
      .uniq()
      .sortBy()
      .value();
  }
  return out;
}
