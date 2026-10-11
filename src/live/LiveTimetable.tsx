import { useEffect, useRef, useState } from "react";
import type { LiveEntity } from "./api";
import type { OpenForm } from "./ConnectedApp";
import {
  campusWeekday,
  lessonsForDay,
  weekDays,
  type TimetableLesson,
} from "../v2/timetableModel";
import {
  recognizeTimetable,
  validateTimetablePhoto,
} from "../v2/timetableAdapter";

export function LiveTimetable({
  table,
  configured,
  open,
  run,
}: {
  table?: LiveEntity;
  configured: boolean;
  open: OpenForm;
  run: (action: string, input: Record<string, unknown>) => Promise<void>;
}) {
  const lessons = (table?.data.lessons as TimetableLesson[] | undefined) ?? [];
  const [day, setDay] = useState(campusWeekday()),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(
    () => () => {
      controller.current?.abort();
    },
    [],
  );
  const recognize = async (file: File | undefined) => {
    if (!file || !configured) return;
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    setBusy(true);
    setError("");
    const timeout = setTimeout(() => request.abort(), 60000);
    try {
      validateTimetablePhoto(file);
      const result = await recognizeTimetable(
        file,
        request.signal,
        () => {},
        "/api/timetable/recognize",
      );
      if (!request.signal.aborted && controller.current === request)
        await run("timetable.save", { lessons: result, fileName: file.name });
    } catch (failure) {
      if (controller.current === request)
        setError(
          request.signal.aborted
            ? "识别已取消或超时，原课表保留。"
            : failure instanceof Error
              ? failure.message
              : "识别失败，原课表保留。",
        );
    } finally {
      clearTimeout(timeout);
      if (controller.current === request) {
        controller.current = null;
        setBusy(false);
      }
    }
  };
  return (
    <section className="v2-panel live-card">
      <h2>我的课表</h2>
      <p>个人安排独立保存，不建立正式选课或体育课程关系。</p>
      <div className="live-actions">
        <label className="v2-button v2-button-secondary">
          {configured ? "上传照片识别" : "识别服务未配置"}
          <input
            aria-label="上传课表照片"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={!configured || busy}
            onChange={(event) => void recognize(event.target.files?.[0])}
            hidden
          />
        </label>
        {busy && (
          <button
            className="v2-button v2-button-secondary"
            onClick={() => controller.current?.abort()}
          >
            取消识别
          </button>
        )}
      </div>
      {!configured && <p>尚未配置真实识别服务，照片不会上传。</p>}
      {error && (
        <p className="live-error" role="alert">
          {error}
        </p>
      )}
      <div className="live-actions">
        {weekDays.map((text, index) => (
          <button
            className={`v2-button ${day === index + 1 ? "v2-button-primary" : "v2-button-secondary"}`}
            key={text}
            onClick={() => setDay(index + 1)}
          >
            {text}
          </button>
        ))}
      </div>
      {lessonsForDay(lessons, day).map((lesson) => (
        <article className="live-row" key={lesson.id}>
          <div>
            <h3>{lesson.name}</h3>
            <p>
              {lesson.startTime || lesson.period || "时间待核对"} —{" "}
              {lesson.endTime} · {lesson.location} · {lesson.weeks}
            </p>
          </div>
          <button
            className="v2-button v2-button-secondary"
            onClick={() =>
              open(
                "修正课程",
                "timetable.correct",
                [
                  { key: "name", label: "课程名", value: lesson.name },
                  {
                    key: "weekday",
                    label: "星期（1–7）",
                    type: "number",
                    value: lesson.weekday,
                  },
                  ...Object.entries({
                    startTime: "开始时间（HH:MM）",
                    endTime: "结束时间（HH:MM）",
                    period: "节次",
                    location: "地点",
                    teacher: "教师",
                    weeks: "周次",
                    note: "备注",
                  }).map(([key, text]) => ({
                    key,
                    label: text,
                    value: String(lesson[key as keyof TimetableLesson] ?? ""),
                    optional: true,
                  })),
                ],
                { lessonId: lesson.id },
              )
            }
          >
            修正
          </button>
        </article>
      ))}
      {!lessonsForDay(lessons, day).length && <p>当天暂无已保存课程。</p>}
    </section>
  );
}
