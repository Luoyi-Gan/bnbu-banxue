import { demand } from "../auth";
import { textField, type Fields } from "../repository";
import { businessWeek } from "./credit";

export function courseWindow(input: Fields, semester: Fields) {
  const startDate = textField(input, "startDate", 10);
  const deadlineDate = textField(input, "deadlineDate", 10);
  businessWeek(startDate);
  businessWeek(deadlineDate);
  demand(
    startDate >= String(semester.startDate) &&
      deadlineDate >= startDate &&
      deadlineDate <= String(semester.endDate),
    "运动日期须位于当前学期内。",
  );
  const startTime = textField(input, "startTime", 5);
  const endTime = textField(input, "endTime", 5);
  demand(
    [startTime, endTime].every((time) =>
      /^([01]\d|2[0-3]):[0-5]\d$/.test(time),
    ) && startTime < endTime,
    "请填写有效的当日运动时间窗。",
  );
  const excludedDates = input.excludedDates ?? [];
  demand(
    Array.isArray(excludedDates) && excludedDates.length <= 3660,
    "排除日期列表无效。",
  );
  for (const date of excludedDates) {
    demand(typeof date === "string", "排除日期无效。");
    businessWeek(date);
    demand(
      date >= startDate && date <= deadlineDate,
      "排除日期须位于运动日期内。",
    );
  }
  demand(
    new Set(excludedDates).size === excludedDates.length,
    "排除日期不能重复。",
  );
  const checkInAvailable = input.checkInAvailable ?? true;
  demand(typeof checkInAvailable === "boolean", "打卡状态无效。");
  return {
    startDate,
    deadlineDate,
    startTime,
    endTime,
    excludedDates: [...excludedDates].sort() as string[],
    checkInAvailable,
  };
}
