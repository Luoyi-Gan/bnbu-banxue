import { describe, expect, it } from 'vitest';
import { parseTimetableTables, timetableWeekday, type TimetableCell } from '../backend/src/timetable-parser';

const cell = (row: number, col: number, text: string, rows = 1, cols = 1): TimetableCell => ({ RowTl: row, RowBr: row + rows, ColTl: col, ColBr: col + cols, Text: text });
const grid = () => [cell(0, 0, '时间'), cell(0, 1, '星期一'), cell(0, 2, 'Tue'), cell(0, 3, '周日'),
  cell(1, 0, '08:00-08:50\n第1节'), cell(2, 0, '09:00-09:50\n第2节'),
  cell(1, 1, '数据结构\n教师：陈老师\n地点：T2-202\n1-16周', 2), cell(1, 2, 'Academic Writing\nRoom: T4-105\nWeeks: 1-8'),
  cell(2, 3, '艺术史\n周次：单周')];
const parse = (cells: TimetableCell[]) => parseTimetableTables([{ Type: 1, Cells: cells }]);

describe('OCR table geometry to timetable', () => {
  it('maps Chinese/English headers and merged course rows to explicit time boundaries', () => {
    const lessons = parse(grid());
    expect(lessons).toHaveLength(3);
    expect(lessons[0]).toMatchObject({ name: '数据结构', weekday: 1, startTime: '08:00', endTime: '09:50', teacher: '陈老师', location: 'T2-202', weeks: '1-16周', needsReview: true });
    expect(lessons[1]).toMatchObject({ name: 'Academic Writing', weekday: 2, startTime: '08:00', endTime: '08:50', location: 'T4-105' });
    expect(lessons[2]).toMatchObject({ weekday: 7, weeks: '单周' });
  });
  it('supports weekdays down the first column without inventing timetable times', () => {
    const cells = grid().map(c => ({ ...c, RowTl: c.ColTl, RowBr: c.ColBr, ColTl: c.RowTl, ColBr: c.RowBr }));
    expect(parse(cells)).toEqual(parse(grid()));
  });
  it('keeps period-only schedules unknown instead of applying a school bell schedule', () => {
    const rows = grid().map(c => c.ColTl === 0 && c.RowTl ? { ...c, Text: `第${c.RowTl}节` } : c);
    expect(parse(rows)[0]).toMatchObject({ startTime: '', endTime: '', period: '第1节、第2节', needsReview: true });
  });
  it('reads structured course-list tables including missing optional fields', () => {
    const headers = ['课程名称', '星期', '时间', '教室', '任课教师', '周次'];
    const cells = headers.map((h, c) => cell(0, c, h));
    cells.push(...['微积分', '周三', '8:30–10:00', 'T3-301', '李老师', '2-12周'].map((t, c) => cell(1, c, t)));
    cells.push(cell(2, 0, '项目讨论'), cell(2, 1, '7'));
    expect(parse(cells)).toMatchObject([{ name: '微积分', weekday: 3, startTime: '08:30', endTime: '10:00', location: 'T3-301', teacher: '李老师', weeks: '2-12周' }, { name: '项目讨论', weekday: 7, startTime: '', needsReview: true }]);
  });
  it('deduplicates exact arrangements while preserving a different weekday or week range', () => {
    const first = { Cells: grid(), Type: 1 }, second = { Cells: grid().map(c => ({ ...c, Text: c.Text.replace('1-16周', '2-10周') })), Type: 1 };
    expect(parseTimetableTables([first, first])).toHaveLength(3);
    expect(parseTimetableTables([first, second])).toHaveLength(4);
  });
  it.each(['周日', '星期天', 'Sun', 'Sunday', '周7'])('recognizes Sunday header %s', text => expect(timetableWeekday(text)).toBe(7));
  it.each(['星期一(10/24)', 'Monday 10/24', '星期１'])('recognizes dated or full-width Monday %s', text => expect(timetableWeekday(text)).toBe(1));
  it('rejects merged cells across weekdays rather than silently assigning or duplicating', () => {
    const cells = grid(); cells[6] = { ...cells[6], ColBr: 3 };
    expect(() => parse(cells)).toThrow();
  });
  it('rejects ambiguous multiple time ranges inside a course cell', () => {
    const cells = grid(); cells[6].Text = '数据结构 08:00-09:00 / 10:00-11:00';
    expect(() => parse(cells)).toThrow();
  });
  it('rejects multiple course/time blocks instead of keeping only the last OCR line', () => {
    for (const Text of ['Algorithms\n08:00-09:00\n10:00-11:00', 'Course: Algorithms\nCourse: Writing']) {
      const cells = grid(); cells[6].Text = Text; expect(() => parse(cells)).toThrow();
    }
  });
  it('rejects duplicate field columns rather than silently overwriting recognized data', () => {
    expect(() => parse([cell(0,0,'Course'),cell(0,1,'Day'),cell(0,2,'Day'),cell(1,0,'Math'),cell(1,1,'Monday'),cell(1,2,'Tuesday')])).toThrow();
  });
  it('rejects invalid/cross-midnight times rather than inventing a second day', () => {
    const cells = grid(); cells[4].Text = '23:00-01:00';
    expect(() => parse(cells)).toThrow();
  });
  it('rejects a list row without a weekday instead of silently dropping it', () => {
    expect(() => parse([cell(0, 0, 'Course'), cell(0, 1, 'Day'), cell(1, 0, 'Math')])).toThrow();
  });
  it('rejects malformed geometry and oversized responses', () => {
    expect(() => parse([{ ...grid()[0], RowBr: 0 }])).toThrow();
    expect(() => parse(Array.from({ length: 2501 }, () => grid()[0]))).toThrow();
  });
  it('rejects an unrelated or empty document', () => {
    expect(() => parse([cell(0, 0, 'Invoice'), cell(1, 0, '100.00')])).toThrow();
    expect(() => parseTimetableTables([])).toThrow();
  });
});
