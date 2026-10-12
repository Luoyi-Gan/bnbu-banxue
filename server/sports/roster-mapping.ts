import { demand } from "../auth";
import { parseCsv } from "./csv";

export function mappedRosterCsv(csv: string, value: unknown) {
  demand(
    value && typeof value === "object" && !Array.isArray(value),
    "请选择名单列。",
  );
  const mapping = value as Record<string, unknown>;
  const fields = [
    "studentNumber",
    "fullName",
    "gender",
    "gradeYear",
    "collegeName",
    "majorName",
    "administrativeClassName",
  ];
  demand(
    Object.keys(mapping).every((key) => fields.includes(key)),
    "名单列选择含未知字段。",
  );
  const cells = parseCsv(csv.replace(/^\uFEFF/, "")),
    header = cells[0];
  demand(header?.length, "名单缺少表头。");
  const selected = fields.map((field) => {
    const column = mapping[field];
    demand(
      column === undefined || column === null || typeof column === "string",
      "名单列名无效。",
    );
    const name = typeof column === "string" ? column.trim() : null;
    demand(
      !["studentNumber", "fullName"].includes(field) || !!name,
      "必须选择学号列和姓名列。",
    );
    if (name)
      demand(
        header.filter((cell) => cell.trim() === name).length === 1,
        "选中的名单列不存在或表头重复。",
      );
    return name || null;
  });
  const chosen = selected.filter(Boolean);
  demand(
    new Set(chosen).size === chosen.length,
    "同一名单列不能用于多个字段。",
  );
  const indexes = selected
    .slice(0, 2)
    .map((name) => header.findIndex((cell) => cell.trim() === name));
  // Keep every source column and row shape, including malformed rows, for review.
  const renamed = header.map((_, index) =>
    index === indexes[0]
      ? "student_number"
      : index === indexes[1]
        ? "name"
        : `source_column_${index}`,
  );
  const output = [renamed, ...cells.slice(1)]
    .map((row) =>
      row.map((cell) => '"' + cell.replaceAll('"', '""') + '"').join(","),
    )
    .join("\n");
  return {
    csv: output,
    mapping: Object.fromEntries(
      fields.map((field, index) => [field, selected[index]]),
    ),
  };
}
