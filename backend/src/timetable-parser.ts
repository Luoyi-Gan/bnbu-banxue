import { ServiceError } from './auth';
import { parseTimetableResponse, type TimetableLesson } from '../../shared/v2/timetableModel';

// Tencent table V3 uses half-open row/column intervals, including merged cells.
export type TimetableCell = { RowTl: number; RowBr: number; ColTl: number; ColBr: number; Text: string };
export type TimetableTable = { Cells?: TimetableCell[]; Type?: number };
const fail = () => new ServiceError(422, 'TIMETABLE_UNCLEAR', '未能完整确定课程与星期，请上传清晰、完整的周课表或课程列表，原课表已保留。');
const clean = (s: string) => s.normalize('NFKC').replace(/\r/g, '').trim();
const blank = (s: string) => !s || /^(?:[-—–/\s]+|无|休息|午休|午餐|晚餐|空课|break|lunch)$/i.test(s);
const overlap = (a: number, b: number, c: number, d: number) => a < d && c < b;
export function timetableWeekday(text: string): number | undefined {
  const value = clean(text).replace(/\s+/g, '').toLowerCase();
  const chinese = /^(?:星期|周|礼拜)([一二三四五六日天1-7])(?:\(?\d{1,2}[/.月-]\d{1,2}日?\)?)?$/.exec(value);
  if (chinese) return /^[1-7]$/.test(chinese[1]) ? Number(chinese[1]) : Math.min(7, '一二三四五六日天'.indexOf(chinese[1]) + 1);
  const english = ['mon(?:day)?', 'tue(?:sday)?', 'wed(?:nesday)?', 'thu(?:rsday)?', 'fri(?:day)?', 'sat(?:urday)?', 'sun(?:day)?'];
  const day = english.findIndex(name => new RegExp(`^${name}\\.?(?:\\(?\\d{1,2}[/.-]\\d{1,2}\\)?)?$`, 'i').test(value));
  return day < 0 ? undefined : day + 1;
}
function hasMeridiem(raw: string) {
  return /(?:(?<![a-z])[ap]\.?m\.?(?![a-z])|凌晨|早上|早晨|上午|中午|下午|傍晚|晚上|夜间)/i.test(clean(raw));
}
function timeRange(raw: string): [string, string] | undefined {
  // Only unqualified 24-hour clocks are supported. Do not drop AM/PM or a
  // Chinese daypart and turn an afternoon class into a morning reminder.
  const value = clean(raw), matches = [...value.matchAll(/(?<!\d)(\d{1,2}):([0-5]\d)\s*(?:-|–|—|~|至|到)\s*(\d{1,2}):([0-5]\d)(?!\d)/g)];
  if (matches.length > 1) throw fail();
  if (hasMeridiem(raw)) return;
  if (matches.length !== 1) return;
  const m = matches[0], start = `${m[1].padStart(2, '0')}:${m[2]}`, end = `${m[3].padStart(2, '0')}:${m[4]}`;
  if (+m[1] > 23 || +m[3] > 23 || end <= start) throw fail();
  return [start, end];
}
function period(raw: string) { return clean(raw).match(/第?\s*\d{1,2}(?:\s*[-–—~、,]\s*\d{1,2})*\s*节/)?.[0] || ''; }
function details(raw: string) {
  timeRange(raw); // Reject multiple time ranges even when OCR put them on separate lines.
  const fieldsSeen = new Set<string>();
  const result = { name: '', startTime: '', endTime: '', period: '', location: '', teacher: '', weeks: '', note: '', needsReview: true };
  const rest: string[] = [];
  for (const line of clean(raw).split('\n').map(clean).filter(Boolean)) {
    const field = /^(课程名称|课程名|课程|course(?:\s*name)?|subject|地点|教室|上课地点|location|room|教师|老师|任课老师|teacher|instructor|周次|上课周次|weeks?|节次|period|时间|上课时间|time|备注|note)\s*[:：]\s*(.*)$/i.exec(line);
    if (field) {
      const key = field[1].toLowerCase(), value = field[2];
      const canonical = /课程|course|subject/.test(key) ? 'name' : /地点|教室|location|room/.test(key) ? 'location' : /教师|老师|teacher|instructor/.test(key) ? 'teacher' : /周次|week/.test(key) ? 'weeks' : /节次|period/.test(key) ? 'period' : /时间|time/.test(key) ? 'time' : 'note';
      if (fieldsSeen.has(canonical)) throw fail();
      fieldsSeen.add(canonical);
      if (/课程|course|subject/.test(key)) result.name = value;
      else if (/地点|教室|location|room/.test(key)) result.location = value;
      else if (/教师|老师|teacher|instructor/.test(key)) result.teacher = value;
      else if (/周次|week/.test(key)) result.weeks = value;
      else if (/节次|period/.test(key)) result.period = value;
      else if (/时间|time/.test(key)) { const time = timeRange(value); if (time) [result.startTime, result.endTime] = time; else result.note = [result.note, line].filter(Boolean).join('\n'); }
      else result.note = value;
    } else if (hasMeridiem(line) && /\d{1,2}:\d{2}/.test(line)) result.note = [result.note, line].filter(Boolean).join('\n');
    else if (timeRange(line) && /^\d/.test(line)) [result.startTime, result.endTime] = timeRange(line)!;
    else if (/^(?:第?\s*\d+(?:\s*[-–—~,、]\s*\d+)*\s*周(?:\s*[（(]?[单双]周?[）)]?)?|[单双]周|weeks?\s+\d.*)$/i.test(line)) result.weeks = line;
    else if (period(line) === line) result.period = line;
    else if (/^[A-Za-z]{1,5}\d?[-－]\d{2,4}[A-Za-z]?$/.test(line)) result.location = line;
    else if (/^[\p{Script=Han}·]{2,8}(?:老师|教师)$/u.test(line)) result.teacher = line;
    else rest.push(line);
  }
  if (!result.name) result.name = rest.shift() || '';
  result.note = [result.note, ...rest].filter(Boolean).join('\n');
  return result;
}
const fieldNames: Record<string, string> = {
  '课程名称': 'name', '课程名': 'name', '课程': 'name', 'course': 'name', 'coursename': 'name', 'subject': 'name',
  '星期': 'weekday', '周几': 'weekday', 'weekday': 'weekday', 'day': 'weekday',
  '时间': 'time', '上课时间': 'time', 'time': 'time', '开始时间': 'startTime', 'start': 'startTime', 'starttime': 'startTime',
  '结束时间': 'endTime', 'end': 'endTime', 'endtime': 'endTime', '节次': 'period', 'period': 'period',
  '地点': 'location', '教室': 'location', '上课地点': 'location', 'room': 'location', 'location': 'location',
  '教师': 'teacher', '任课教师': 'teacher', '老师': 'teacher', 'teacher': 'teacher', 'instructor': 'teacher',
  '周次': 'weeks', '上课周次': 'weeks', 'weeks': 'weeks', '备注': 'note', 'note': 'note',
};
function listLessons(cells: TimetableCell[]): Record<string, unknown>[] | undefined {
  for (const row of [...new Set(cells.map(c => c.RowTl))].sort((a, b) => a - b)) {
    const headers = cells.filter(c => c.RowTl === row).map(c => ({ cell: c, key: fieldNames[clean(c.Text).replace(/\s/g, '').toLowerCase()] })).filter(h => h.key);
    if (!headers.some(h => h.key === 'name') || !headers.some(h => h.key === 'weekday')) continue;
    if (new Set(headers.map(h => h.key)).size !== headers.length) throw fail();
    const end = Math.max(...headers.map(h => h.cell.RowBr)), nameHeader = headers.find(h => h.key === 'name')!.cell;
    const lessons: Record<string, unknown>[] = [];
    for (const name of cells.filter(c => c.RowTl >= end && c.ColTl === nameHeader.ColTl && !blank(clean(c.Text)))) {
      const lesson: Record<string, unknown> = { name: clean(name.Text), needsReview: true };
      for (const { cell: h, key } of headers) {
        const values = cells.filter(c => c.RowTl <= name.RowTl && c.RowBr >= name.RowBr && c.ColTl === h.ColTl && c.ColBr === h.ColBr);
        if (values.length > 1) throw fail();
        if (values[0]) lesson[key] = clean(values[0].Text);
      }
      lesson.weekday = timetableWeekday(String(lesson.weekday || '')) ?? (/^[1-7]$/.test(String(lesson.weekday)) ? Number(lesson.weekday) : undefined);
      if (!lesson.weekday) throw fail();
      if (lesson.time) { const time = timeRange(String(lesson.time)); if (time) [lesson.startTime, lesson.endTime] = time; else lesson.note = [lesson.note, lesson.time].filter(Boolean).join('\n'); }
      for (const key of ['startTime', 'endTime']) if (typeof lesson[key] === 'string') lesson[key] = (lesson[key] as string).replace(/^(\d):/, '0$1:');
      lessons.push(lesson);
    }
    return lessons;
  }
}
function gridLessons(cells: TimetableCell[]): Record<string, unknown>[] {
  const dayCells = cells.filter(c => timetableWeekday(c.Text));
  const rows = [...new Set(dayCells.map(c => c.RowTl))];
  const header = rows.map(row => dayCells.filter(c => c.RowTl === row)).sort((a, b) => b.length - a.length)[0];
  if (!header || header.length < 2 || new Set(header.map(c => timetableWeekday(c.Text))).size !== header.length) throw fail();
  const firstCol = Math.min(...header.map(c => c.ColTl)), headerEnd = Math.max(...header.map(c => c.RowBr));
  const lessons: Record<string, unknown>[] = [];
  for (const cell of cells.filter(c => c.RowTl >= headerEnd && c.ColBr > firstCol && !blank(clean(c.Text)))) {
    const columns = header.filter(h => overlap(h.ColTl, h.ColBr, cell.ColTl, cell.ColBr));
    if (!columns.length) continue;
    // A merged course across multiple days is ambiguous; never silently duplicate it.
    if (columns.length !== 1 || cell.ColTl < columns[0].ColTl || cell.ColBr > columns[0].ColBr) throw fail();
    const value = details(cell.Text);
    if (!value.name) throw fail();
    const labels = cells.filter(c => c.ColBr <= firstCol && overlap(c.RowTl, c.RowBr, cell.RowTl, cell.RowBr)).sort((a, b) => a.RowTl - b.RowTl);
    if (!value.startTime && !value.endTime) {
      const first = labels.filter(c => c.RowTl === cell.RowTl).map(c => timeRange(c.Text)).filter(Boolean);
      const last = labels.filter(c => c.RowBr === cell.RowBr).map(c => timeRange(c.Text)).filter(Boolean);
      if (first.length === 1 && last.length === 1) [value.startTime, value.endTime] = [first[0]![0], last[0]![1]];
    }
    if (!value.startTime && !value.endTime) {
      const unresolved = labels.filter(c => hasMeridiem(c.Text) && /\d{1,2}:\d{2}/.test(c.Text)).map(c => clean(c.Text));
      value.note = [value.note, ...new Set(unresolved)].filter(Boolean).join('\n');
    }
    if (!value.period) value.period = labels.map(c => period(c.Text)).filter(Boolean).join('、');
    lessons.push({ ...value, weekday: timetableWeekday(columns[0].Text) });
  }
  return lessons;
}
export function parseTimetableTables(tables: TimetableTable[]): TimetableLesson[] {
  if (!Array.isArray(tables) || !tables.length || tables.length > 20) throw fail();
  const lessons: Record<string, unknown>[] = [];
  for (const table of tables) {
    if (!table || (table.Cells !== undefined && !Array.isArray(table.Cells))) throw fail();
    if (table.Type === 0 || !table.Cells?.length) continue;
    const cells = table.Cells;
    if (cells.length > 2500 || cells.some(c => !c || typeof c.Text !== 'string' || c.Text.length > 2000 ||
      [c.RowTl, c.RowBr, c.ColTl, c.ColBr].some(n => !Number.isInteger(n) || n < 0 || n > 512) || c.RowBr <= c.RowTl || c.ColBr <= c.ColTl)) throw fail();
    const list = listLessons(cells);
    if (list) { lessons.push(...list); continue; }
    const days = cells.filter(c => timetableWeekday(c.Text));
    if (days.length < 2) continue; // Ignore unrelated title/legend tables.
    const horizontal = Math.max(...days.map(d => days.filter(c => c.RowTl === d.RowTl).length));
    const vertical = Math.max(...days.map(d => days.filter(c => c.ColTl === d.ColTl).length));
    const oriented = vertical > horizontal ? cells.map(c => ({ ...c, RowTl: c.ColTl, RowBr: c.ColBr, ColTl: c.RowTl, ColBr: c.RowBr })) : cells;
    lessons.push(...gridLessons(oriented));
  }
  try { return parseTimetableResponse({ lessons }); } catch { throw fail(); }
}
