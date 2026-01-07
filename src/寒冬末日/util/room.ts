export type RoomLocation =
  | { kind: 'entrance'; room: '临时客房A' | '临时客房B' | '玄关' }
  | { kind: 'core'; room: '主卧室' | '主浴室' }
  | { kind: 'floor'; floor: '20' | '19'; roomNumber: string }
  | { kind: 'none' };

type RoomsStatData = any;

export function findRoleLocation(rooms: RoomsStatData, roleName: string): RoomLocation {
  const name = roleName ?? '';
  if (!name) return { kind: 'none' };

  const entranceA: string[] = _.get(rooms, '玄关.临时客房A入住者', []);
  if (Array.isArray(entranceA) && entranceA.includes(name)) return { kind: 'entrance', room: '临时客房A' };

  const entranceB: string[] = _.get(rooms, '玄关.临时客房B入住者', []);
  if (Array.isArray(entranceB) && entranceB.includes(name)) return { kind: 'entrance', room: '临时客房B' };

  const bedroom: string[] = _.get(rooms, '核心区.主卧室使用者', []);
  if (Array.isArray(bedroom) && bedroom.includes(name)) return { kind: 'core', room: '主卧室' };

  const bathroom: string[] = _.get(rooms, '核心区.主浴室使用者', []);
  if (Array.isArray(bathroom) && bathroom.includes(name)) return { kind: 'core', room: '主浴室' };

  const floor20: Record<string, any> = _.get(rooms, '楼层房间.楼层20房间', {});
  if (floor20 && typeof floor20 === 'object') {
    for (const [roomNumber, data] of Object.entries(floor20)) {
      const residents: string[] = (data as any)?.入住者 ?? [];
      if (Array.isArray(residents) && residents.includes(name)) return { kind: 'floor', floor: '20', roomNumber };
    }
  }

  const floor19: Record<string, any> = _.get(rooms, '楼层房间.楼层19房间', {});
  if (floor19 && typeof floor19 === 'object') {
    for (const [roomNumber, data] of Object.entries(floor19)) {
      const residents: string[] = (data as any)?.入住者 ?? [];
      if (Array.isArray(residents) && residents.includes(name)) return { kind: 'floor', floor: '19', roomNumber };
    }
  }

  return { kind: 'none' };
}
