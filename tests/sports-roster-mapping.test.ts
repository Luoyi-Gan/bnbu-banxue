import { expect, it } from "vitest";
import { mappedRosterCsv } from "../server/sports/roster-mapping";
import { parseCsv } from "../server/sports/csv";

it("按教师列选择读取学号姓名，保留原件列和错误行形状", () => {
  const result = mappedRosterCsv(
    '姓名,注册号,备注\n"王,明",001,原样\n张三,002',
    { studentNumber: "注册号", fullName: "姓名" },
  );
  expect(parseCsv(result.csv)).toEqual([
    ["name", "student_number", "source_column_2"],
    ["王,明", "001", "原样"],
    ["张三", "002"],
  ]);
  expect(result.mapping).toMatchObject({
    studentNumber: "注册号",
    fullName: "姓名",
    gender: null,
  });
});
it("拒绝缺失、重复或多重使用的列，不猜测所选身份", () => {
  for (const mapping of [
    { studentNumber: "学号" },
    { studentNumber: "姓名", fullName: "姓名" },
    { studentNumber: "不存在", fullName: "姓名" },
    { studentNumber: 123, fullName: "姓名" },
  ])
    expect(() => mappedRosterCsv("学号,姓名\n001,王明", mapping)).toThrow();
  expect(() =>
    mappedRosterCsv("学号,学号,姓名\n001,002,王明", {
      studentNumber: "学号",
      fullName: "姓名",
    }),
  ).toThrow("重复");
});
