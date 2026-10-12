import { useEffect, useState } from "react";
import { api, type LiveEntity } from "./api";

interface SportsSummary {
  identity: LiveEntity;
  courses: LiveEntity[];
  semesters: LiveEntity[];
  enrollments: LiveEntity[];
  progress: LiveEntity[];
}

export function SportsPortalClassic() {
  const [data, setData] = useState<SportsSummary | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    let generation = 0;
    const refresh = async () => {
      const current = ++generation;
      try {
        const result = await api<SportsSummary>("/api/sports/workspace");
        if (active && current === generation) { setData(result); setError(""); }
      } catch (failure) {
        if (active && current === generation) {
          setData(null);
          setError(failure instanceof Error ? failure.message : "运动数据暂不可用。");
        }
      }
    };
    void refresh();
    window.addEventListener("focus", refresh);
    return () => { active = false; window.removeEventListener("focus", refresh); };
  }, []);
  const url = import.meta.env.VITE_SPORTS_TEACHER_URL ||
    "https://www.teacher.bnbusports.cn/#admin/accounts";
  const semester = data?.semesters?.find(item => item.data.status === "CURRENT");
  const courses = data?.courses?.filter(course => course.data.semesterId === semester?.id &&
    data.enrollments.some(item => item.ownerId === data.identity.ownerId && item.data.courseId === course.id && item.data.status === "ACTIVE")) ?? [];

  return (
    <section className="v2-panel live-card" aria-label="体育课程">
      <h2>BNBU Sports</h2>
      <p>前往体育平台进行课程和运动操作。</p>
      {url ? <a className="v2-button v2-button-primary" href={url}>进入体育平台</a> : <p role="status">体育平台地址尚未配置。</p>}
      {error ? <p role="status">运动数据暂不可用：{error}</p> : !data ? <p role="status">正在读取运动数据…</p> : data.identity?.data.role === "student" ? <>
        <h3>伴学本地已接入的运动数据</h3>
        <p>此处数据尚未与线上体育平台同步。</p>
        {!courses.length && <p>暂无本学期有效课程。</p>}
        {courses.map(course => {
          const progress = data.progress?.find(item => item.ownerId === data.identity.ownerId && item.data.courseId === course.id);
          const minutes = progress?.data.total;
          return <p key={course.id}>{String(course.data.name)} · {typeof minutes === "number" && Number.isFinite(minutes) ? `已计入 ${minutes} 分钟` : "暂无已确认的运动进度"}</p>;
        })}
      </> : <p>请进入体育平台查看所属课程数据。</p>}
    </section>
  );
}
