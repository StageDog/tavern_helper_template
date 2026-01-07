type ParsedWorldTime = {
  epochMinutes: number;
  hour: number;
  minute: number;
};

function parseDateToEpochDay(dateStr: string): number | null {
  // 格式：末日纪元，XXXX年XX月XX日
  const m = (dateStr ?? '').match(/(\d{1,4})年(\d{1,2})月(\d{1,2})日/);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
  const d = new Date(year, month - 1, day);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor(d.getTime() / 86400000);
}

function parseTimeToMinutes(timeStr: string): { hour: number; minute: number } | null {
  // 格式：时间段 - HH:MM
  const m = (timeStr ?? '').match(/(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

export function parseWorldTime(dateStr: string, timeStr: string): ParsedWorldTime | null {
  const day = parseDateToEpochDay(dateStr);
  const hm = parseTimeToMinutes(timeStr);
  if (day === null || hm === null) return null;
  const epochMinutes = day * 1440 + hm.hour * 60 + hm.minute;
  return { epochMinutes, hour: hm.hour, minute: hm.minute };
}

export function diffWorldHours(
  oldWorld: { 日期?: string; 时间?: string },
  newWorld: { 日期?: string; 时间?: string },
): number | null {
  const oldParsed = parseWorldTime(oldWorld.日期 ?? '', oldWorld.时间 ?? '');
  const newParsed = parseWorldTime(newWorld.日期 ?? '', newWorld.时间 ?? '');
  if (!oldParsed || !newParsed) return null;
  const diffMinutes = newParsed.epochMinutes - oldParsed.epochMinutes;
  if (!Number.isFinite(diffMinutes)) return null;
  if (diffMinutes <= 0) return null;
  return diffMinutes / 60;
}
