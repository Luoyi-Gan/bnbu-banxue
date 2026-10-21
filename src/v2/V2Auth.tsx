import { uiText, uiTemplate, useUiLanguage } from './uiLanguage'
import {api,type LiveAccount} from '../live/api';
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
const brandIcon = "/huitongli-app-icon.png";
import { authApi, AuthServiceError } from "./authApi";
import { roleLoginPath } from "./authReturnPath";
import "./auth.css";
import "./editorialAuth.css";

type AuthMode = "login" | "register";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function V2Auth({ mode }: { mode: AuthMode }) { useUiLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");

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
    if (mode === "login" ? !normalizedEmail : !emailValid) {
      setError(mode === "login" ? "请填写邮箱或管理账号。" : "请填写有效的邮箱地址。");
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
        await authApi.signIn(normalizedEmail, password);
        const {account} = await api<{account:LiveAccount}>("/api/auth/me");
        window.location.replace(roleLoginPath(location.state?.returnTo, account.roles));
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
            {uiText("会同里")}<small>BNBU CAMPUS</small>
          </span>
        </Link>
        <Link className="v2-auth-back" to="/v2">
          <ArrowLeft size={16} />
          {uiText("返回校园")}</Link>
      </header>
      <main className="v2-auth-layout">
        <section className="v2-auth-intro" aria-label={uiText("会同里校园生活")}>
          <span className="v2-auth-eyebrow">BNBU / CAMPUS</span>
          <div>
            <span className="v2-auth-index">01 — 03</span>
            <h1>
              {uiText("让校园生活")}<br />
              {uiText("从这里开始。")}</h1>
            <p>{uiText("活动、搭子、社区与个人安排，放在清晰的一处。")}</p>
          </div>
          <div className="v2-auth-intro-footer">
            <span>{uiText("为每一次参与，留好位置。")}</span>
            <span>{uiText("会同里 · 校园生活助手")}</span>
          </div>
        </section>
        <section className="v2-auth-card" aria-labelledby="auth-title">
          <div className="v2-auth-card-head">
            <span className="v2-auth-eyebrow">
              {mode === "login"?"WELCOME BACK":"CREATE ACCOUNT"}
            </span>
            <h2 id="auth-title">
              {mode === "login"?uiText("登录会同里"):uiText("注册会同里")}
            </h2>
            <p>
              {mode === "login"?uiText("输入账号和密码，继续你的校园生活。"):step === 1?uiText("填写邮箱与验证码，再设置登录密码。"):uiText("提交后由账号服务核验验证码并建立账号。")}
            </p>
          </div>
          {mode === "register" && (
            <div className="v2-auth-steps" aria-label={uiText("注册进度")}>
              <span className="is-current">
                <span>{step > 1?<Check size={13} />:"1"}</span>{uiText("填写验证码")}</span>
              <i />
              <span className={step === 2?"is-current":""}>
                <span>2</span>{uiText("设置密码")}</span>
            </div>
          )}
          {location.state?.roleMismatch && <p role="status">{uiText("当前账号没有此页面的身份权限，请切换到对应的学生、教师或管理员账号。")}</p>}
          <form className="v2-auth-form" onSubmit={onSubmit} noValidate>

            {(mode === "login" || step === 1) && (
              <label>
                <span>
                  {mode === "login"?uiText("邮箱或管理账号"):uiText("邮箱地址")}
                </span>
                <div className="v2-auth-input">
                  <Mail size={18} aria-hidden="true" />
                  <input
                    type={mode === "login"?"text":"email"}
                    name="email"
                    autoComplete={
                      mode === "login"?"username":"email"
                    }
                    placeholder={
                      mode === "login"?uiText("请输入邮箱或管理账号"):"name@example.com"
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
                <span>{uiText("邮箱验证码")}</span>
                <div className="v2-auth-code-row">
                  <div className="v2-auth-input">
                    <ShieldCheck size={18} aria-hidden="true" />
                    <input
                      type="text"
                      name="code"
                      autoComplete="one-time-code"
                      maxLength={12}
                      placeholder={uiText("输入邮件验证码")}
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
                    {codeBusy?uiText("发送中…"):countdown > 0?uiTemplate(["","s 后重发"],countdown):uiText("发送验证码")}
                  </button>
                </div>
              </label>
            )}
            {(mode === "login" || step === 2) && (
              <label>
                <span>{mode === "login"?uiText("密码"):uiText("设置密码")}</span>
                <div className="v2-auth-input">
                  <LockKeyhole size={18} aria-hidden="true" />
                  <input
                    type={showPassword?"text":"password"}
                    name="password"
                    autoComplete={
                      mode === "login"?"current-password":"new-password"
                    }
                    placeholder={
                      mode === "login"?uiText("请输入密码"):uiText("至少 8 位字符")
                    }
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="v2-auth-visibility"
                    aria-label={showPassword?uiText("隐藏密码"):uiText("显示密码")}
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword?<EyeOff size={17} />:<Eye size={17} />}
                  </button>
                </div>
              </label>
            )}
            {mode === "register" && step === 2 && (
              <label>
                <span>{uiText("确认密码")}</span>
                <div className="v2-auth-input">
                  <LockKeyhole size={18} aria-hidden="true" />
                  <input
                    type={showPassword?"text":"password"}
                    name="confirmPassword"
                    autoComplete="new-password"
                    placeholder={uiText("再次输入密码")}
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
                {uiText("返回修改邮箱或验证码")}</button>
            )}
            {(message ||
              (mode === "login" && (location.state?.registered === true || location.state?.passwordReset === true))) && (
              <p className="v2-auth-message" role="status">
                {message || (location.state?.passwordReset ? '密码已重置，请重新登录。' : "注册已完成，请使用邮箱和密码登录。")}
              </p>
            )}
            {error && (
              <p className="v2-auth-error" role="alert">
                {uiText(error)}
              </p>
            )}
            <button className="v2-auth-submit" type="submit" disabled={busy}>
              {busy?uiText("请稍候…"):mode === "login"?uiText("登录"):step === 1?uiText("下一步"):uiText("完成注册")}
              {!busy && <ArrowRight size={18} />}
            </button>
          </form>
          {mode === 'login' && <p className="v2-auth-switch"><Link to="/v2/forgot-password">{uiText("忘记密码？")}</Link></p>}
          <p className="v2-auth-switch">
            {mode === "login"?uiText("还没有账号？"):uiText("已有账号？")}{" "}
            <Link to={mode === "login"?"/v2/register":"/v2/login"}>
              {mode === "login"?uiText("立即注册"):uiText("去登录")}{" "}
              <ArrowRight size={14} />
            </Link>
          </p>
          <div className="v2-auth-demo">
            <span>
              {uiText("请使用本人邮箱注册或找回密码。校园身份需完成相应认证。")}</span>
          </div>
        </section>
      </main>
      <footer className="v2-auth-footer"><Link to="/v2/privacy">{uiText("隐私政策")}</Link>
        <span>{uiText("BNBU CAMPUS · 会同里")}</span>
        <span>{uiText("清晰连接校园生活")}</span>
      </footer>
    </div>
  );
}
