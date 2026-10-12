import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { SportsProgressCard } from "../../src/v2/SportsProgressCard";
import { mapSportsProgress } from "../../src/v2/sportsProgress";
import "../../src/styles/base.css";
import "../../src/v2/v2.css";
import "../../src/v2/aRedesign.css";
import "../../src/v2/studentTheme.css";

// Visual fixture only. This entry never writes a business record or accesses an account.
const progress = mapSportsProgress({
  courses: [{ isCurrent: true, enrollmentStatus: "enrolled", name: "大学体育（羽毛球）", semester: "2026–2027 第一学期" }],
  progress: { totalValidHours: 10.5 }, hourRule: { total: 20 },
}, "local");
createRoot(document.getElementById("root")!).render(<MemoryRouter><main className="v2-app v2-app-student" style={{ display: "block", padding: 24, minHeight: "100vh" }}><p style={{ margin: "0 0 18px", color: "#795826", fontSize: 12 }}>布局验收样例 · 使用截图数值检验排版，未写入业务数据库</p><SportsProgressCard sports={{ source: "local", role: "student", progress }}/></main></MemoryRouter>);
