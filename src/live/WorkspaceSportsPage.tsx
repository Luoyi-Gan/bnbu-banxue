import { Link } from "react-router-dom";
import { Bell, CalendarDays, Coffee, LayoutDashboard, RefreshCw, UserRound } from "lucide-react";
import { PageHeading } from "../v2/ui";
import { SportsPortal } from "./SportsPortal";
import { useSportsAccount } from "./useSportsAccount";
import brandIcon from "../assets/brand/brand-app-icon-a.svg";
import "../v2/v2.css";
import "./workspaceSports.css";

/** Standalone sports route: other workspace modules stay outside this frontend PR. */
export function WorkspaceSportsPage() {
  const live = useSportsAccount();
  const teacher = live.data?.account.roles.includes("teacher");
  const home = teacher ? "/v2/teacher/coffee" : "/v2";
  const navigation = [
    { to: home, label: "概览", icon: LayoutDashboard },
    ...(live.data?.sports ? [{ to: "/workspace/sports", label: "体育课程", icon: CalendarDays }] : []),
    { to: teacher ? "/v2/teacher/coffee" : "/v2/coffee", label: "Coffee Chat", icon: Coffee },
    { to: teacher ? "/v2/teacher/messages" : "/v2/messages", label: "消息通知", icon: Bell },
    { to: teacher ? "/v2/teacher/profile" : "/v2/me", label: "个人资料", icon: UserRound },
  ];
  return <div className="v2-app sports-workspace">
    <aside className="v2-sidebar"><Link to={home} className="v2-brand"><img src={brandIcon} alt=""/><span><strong>伴学</strong><small>BNBU CAMPUS</small></span></Link><div className="v2-nav-label">校园与我</div><nav className="v2-side-nav" aria-label="校园导航">{navigation.map(({to, label, icon: Icon}) => <Link key={label} to={to} className={`v2-side-link${to === '/workspace/sports' ? ' is-active' : ''}`}><Icon size={19}/><span>{label}</span></Link>)}</nav><div className="v2-sidebar-bottom"><small>{live.data ? "本地服务已连接" : "等待连接数据服务"}</small></div></aside>
    <div className="v2-workspace"><header className="v2-topbar"><div><span className="v2-breadcrumb">BNBU / 体育课程</span><strong className="sports-account-name">{live.data?.account.name ?? "体育课程"}</strong></div><button className="v2-icon-button" aria-label="刷新数据" onClick={() => void live.refresh()}><RefreshCw size={18}/></button></header><main className="v2-main sports-workspace-main"><PageHeading eyebrow="BNBU CAMPUS" title="体育课程" description={teacher ? '教师' : live.data?.account.roles.includes('student') ? '学生' : '本人获授权的体育数据'}/>{live.error ? <div role="alert" className="sports-error"><span>{live.error}</span><Link to="/v2/login">前往登录</Link></div> : live.data ? <SportsPortal workspace={live.data}/> : <p role="status">正在读取本人体育账号…</p>}</main></div>
  </div>;
}
