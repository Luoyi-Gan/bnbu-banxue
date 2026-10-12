import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import brandIcon from "../assets/brand/brand-app-icon-a.svg";
import { authApi, AuthServiceError } from "./authApi";
import "./auth.css";

type AuthMode = "login" | "register";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function V2Auth({ mode }: { mode: AuthMode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [adminLogin, setAdminLogin] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [codeBusy, setCodeBusy] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);
  useEffect(() => {
    setError("");
    setMessage("");
    setStep(1);
    setPassword("");
    setConfirmPassword("");
    setCode("");
  }, [mode]);

  const normalizedEmail = email.trim().toLowerCase();
  const emailValid = emailPattern.test(normalizedEmail);
  const onSendCode = async () => {
    setMessage("");
    setError("");
    if (!emailValid) {
      setError("请先填写有效的邮箱地址。");
      return;
    }
    setCodeBusy(true);
    try {
      const deliveryMessage = await authApi.sendCode(normalizedEmail);
      setCountdown(60);
      setMessage(deliveryMessage ?? "验证码已发送，请查看邮箱。");
    } catch (cause) {
      setError(
        cause instanceof AuthServiceError
          ? cause.message
          : "发送失败，请稍后重试。",
      );
    } finally {
      setCodeBusy(false);
    }
  };
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (mode === "login" && adminLogin ? !normalizedEmail : !emailValid) {
      setError(adminLogin ? "请填写管理登录账号。" : "请填写有效的邮箱地址。");
      return;
    }
    if (mode === "register" && step === 1) {
      if (!code.trim()) {
        setError("请输入邮件中的验证码。");
        return;
      }
      setStep(2);
      return;
    }
    if (mode === "register") {
      if (password.length < 8) {
        setError("密码至少需要 8 位。");
        return;
      }
      if (password !== confirmPassword) {
        setError("两次输入的密码不一致。");
        return;
      }
    } else if (!password) {
      setError("请输入密码。");
      return;
    }
    setBusy(true);
    try {
      if (mode === "login") {
        if (adminLogin) await authApi.adminLogin(normalizedEmail, password);
        else await authApi.login(normalizedEmail, password);
        navigate(location.state?.returnTo === "/v2/community" ? "/v2/community" : "/workspace", { replace: true });
      } else {
        await authApi.register(normalizedEmail, code.trim(), password);
        navigate("/v2/login", { replace: true, state: { registered: true } });
      }
    } catch (cause) {
      setError(
        cause instanceof AuthServiceError
          ? cause.message
          : "操作失败，请稍后重试。",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="v2-auth-page">
      <header className="v2-auth-header">
        <Link className="v2-auth-brand" to="/v2">
          <img src={brandIcon} alt="" />
          <span>
            伴学 <small>BNBU CAMPUS</small>
          </span>
        </Link>
        <Link className="v2-auth-back" to="/v2">
          <ArrowLeft size={16} />
          返回校园
        </Link>
      </header>
      <main className="v2-auth-layout">
        <section className="v2-auth-intro" aria-label="伴学校园生活">
          <span className="v2-auth-eyebrow">BNBU / CAMPUS</span>
          <div>
            <span className="v2-auth-index">01 — 03</span>
            <h1>
              让校园生活
              <br />
              从这里开始。
            </h1>
            <p>活动、搭子、社区与个人安排，放在清晰的一处。</p>
          </div>
          <div className="v2-auth-intro-footer">
            <span>为每一次参与，留好位置。</span>
            <span>伴学 · 校园生活助手</span>
          </div>
        </section>
        <section className="v2-auth-card" aria-labelledby="auth-title">
          <div className="v2-auth-card-head">
            <span className="v2-auth-eyebrow">
              {mode === "login" ? "WELCOME BACK" : "CREATE ACCOUNT"}
            </span>
            <h2 id="auth-title">
              {mode === "login" ? "登录伴学" : "注册伴学"}
            </h2>
            <p>
              {mode === "login"
                ? "使用邮箱和密码，继续你的校园生活。"
                : step === 1
                  ? "填写邮箱与验证码，再设置登录密码。"
                  : "提交后由账号服务核验验证码并建立账号。"}
            </p>
          </div>
          {mode === "register" && (
            <div className="v2-auth-steps" aria-label="注册进度">
              <span className="is-current">
                <span>{step > 1 ? <Check size={13} /> : "1"}</span>填写验证码
              </span>
              <i />
              <span className={step === 2 ? "is-current" : ""}>
                <span>2</span>设置密码
              </span>
            </div>
          )}
          <form className="v2-auth-form" onSubmit={onSubmit} noValidate>
            {mode === "login" && (
              <label>
                <span>登录身份</span>
                <select
                  disabled={busy}
                  value={adminLogin ? "admin" : "personal"}
                  onChange={(e) => {
                    setAdminLogin(e.target.value === "admin");
                    setEmail("");
                    setPassword("");
                    setError("");
                  }}
                >
                  <option value="personal">
                    邮箱登录（个人账号／总管理员）
                  </option>
                  <option value="admin">独立分管理员账号</option>
                </select>
              </label>
            )}
            {(mode === "login" || step === 1) && (
              <label>
                <span>
                  {mode === "login" && adminLogin ? "管理登录账号" : "邮箱地址"}
                </span>
                <div className="v2-auth-input">
                  <Mail size={18} aria-hidden="true" />
                  <input
                    type={mode === "login" && adminLogin ? "text" : "email"}
                    name="email"
                    autoComplete={
                      mode === "login" && adminLogin ? "username" : "email"
                    }
                    placeholder={
                      mode === "login" && adminLogin
                        ? "总管理员分配的登录账号"
                        : "name@example.com"
                    }
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
              </label>
            )}
            {mode === "register" && step === 1 && (
              <label>
                <span>邮箱验证码</span>
                <div className="v2-auth-code-row">
                  <div className="v2-auth-input">
                    <ShieldCheck size={18} aria-hidden="true" />
                    <input
                      type="text"
                      name="code"
                      autoComplete="one-time-code"
                      maxLength={12}
                      placeholder="输入邮件验证码"
                      value={code}
                      onChange={(event) =>
                        setCode(event.target.value.trim().slice(0, 12))
                      }
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={onSendCode}
                    disabled={codeBusy || countdown > 0}
                  >
                    {codeBusy
                      ? "发送中…"
                      : countdown > 0
                        ? `${countdown}s 后重发`
                        : "发送验证码"}
                  </button>
                </div>
              </label>
            )}
            {(mode === "login" || step === 2) && (
              <label>
                <span>{mode === "login" ? "密码" : "设置密码"}</span>
                <div className="v2-auth-input">
                  <LockKeyhole size={18} aria-hidden="true" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    placeholder={
                      mode === "login" ? "请输入密码" : "至少 8 位字符"
                    }
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="v2-auth-visibility"
                    aria-label={showPassword ? "隐藏密码" : "显示密码"}
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </label>
            )}
            {mode === "register" && step === 2 && (
              <label>
                <span>确认密码</span>
                <div className="v2-auth-input">
                  <LockKeyhole size={18} aria-hidden="true" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    autoComplete="new-password"
                    placeholder="再次输入密码"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                  />
                </div>
              </label>
            )}
            {mode === "register" && step === 2 && (
              <button
                type="button"
                className="v2-auth-text-action"
                onClick={() => {
                  setStep(1);
                  setError("");
                }}
              >
                <ArrowLeft size={15} />
                返回修改邮箱或验证码
              </button>
            )}
            {(message ||
              (mode === "login" && location.state?.registered === true)) && (
              <p className="v2-auth-message" role="status">
                {message || "注册已完成，请使用邮箱和密码登录。"}
              </p>
            )}
            {error && (
              <p className="v2-auth-error" role="alert">
                {error}
              </p>
            )}
            <button className="v2-auth-submit" type="submit" disabled={busy}>
              {busy
                ? "请稍候…"
                : mode === "login"
                  ? "登录"
                  : step === 1
                    ? "下一步"
                    : "完成注册"}
              {!busy && <ArrowRight size={18} />}
            </button>
          </form>
          <p className="v2-auth-switch">
            {mode === "login" ? "还没有账号？" : "已有账号？"}{" "}
            <Link to={mode === "login" ? "/v2/register" : "/v2/login"}>
              {mode === "login" ? "立即注册" : "去登录"}{" "}
              <ArrowRight size={14} />
            </Link>
          </p>
          <div className="v2-auth-demo">
            <span>
              本地账号与业务数据由后端保存。开发验证码使用本地收件箱，不代表真实邮箱或学校身份核验。
            </span>
            <Link to="/v2">
              浏览旧版演示 <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </main>
      <footer className="v2-auth-footer">
        <span>BNBU CAMPUS · 伴学</span>
        <span>清晰连接校园生活</span>
      </footer>
    </div>
  );
}
