"use client";
import { useEffect, useRef, useState } from "react";
import {
  apiSessionUserId,
  currentApiSessionEpoch,
  clearApiSession,
  getAccountSecurity,
  request,
  toUserFacingError,
  type UserFacingError,
} from "./api-client";
import { ErrorPanel } from "./error-panel";

type OwnAccount = {
  id: string;
  version: number;
  loginName: string;
  name: string;
  email: string;
};
export function OwnAdministratorClosure({
  locale,
  onClosed,
}: {
  locale: "zh" | "en";
  onClosed: () => void;
}) {
  const [allowed, setAllowed] = useState(false),
    [own, setOwn] = useState<OwnAccount | null>(null);
  const [handover, setHandover] = useState(false),
    [busy, setBusy] = useState(false);
  const [error, setError] = useState<UserFacingError | null>(null);
  const key = useRef<string | null>(null);
  const text = (zh: string, en: string) => (locale === "en" ? en : zh);
  useEffect(() => {
    let live = true;
    void getAccountSecurity()
      .then((value) => {
        if (live) setAllowed(value.canDeleteOwnAccount === true);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);
  if (!allowed) return null;
  async function prepare() {
    setBusy(true);
    setError(null);
    try {
      setOwn(await request<OwnAccount>("/me/administrator"));
      setHandover(false);
      key.current = crypto.randomUUID();
    } catch (failure) {
      setError(toUserFacingError(failure, locale));
    } finally {
      setBusy(false);
    }
  }
  async function closeAccount() {
    if (!own || !handover || busy) return;
    setBusy(true);
    setError(null);
    const epoch = currentApiSessionEpoch(),
      userId = apiSessionUserId();
    try {
      const result = await request<{ deleted: boolean; userId: string }>(
        "/me/account-deletion",
        {
          method: "POST",
          body: {
            expectedVersion: own.version,
            account: own.loginName,
            name: own.name,
            email: own.email,
            confirmed: true,
            handoverCompleted: true,
          },
          headers: { "Idempotency-Key": key.current! },
        },
      );
      if (!result.deleted || result.userId !== userId)
        throw new Error("账号注销结果未确认，请重新核对。");
      if (currentApiSessionEpoch() !== epoch) return;
      clearApiSession();
      onClosed();
    } catch (failure) {
      setError(toUserFacingError(failure, locale));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="account-security-card" aria-busy={busy}>
      <div>
        <h3>{text("注销独立管理账号", "Close administrator account")}</h3>
        <p>
          {text(
            "仅注销当前分管理员登录，保留原个人账号与已完成的业务历史。",
            "Close this administrator login. Your personal account and completed business history remain.",
          )}
        </p>
        {own && (
          <div className="admin-subadmin-delete-confirmation">
            <div className="admin-confirm-object">
              <b>{own.name}</b>
              <code>{own.loginName}</code>
              <span>{own.email}</span>
            </div>
            <label>
              <input
                type="checkbox"
                checked={handover}
                disabled={busy}
                onChange={(event) => setHandover(event.target.checked)}
              />
              {text(
                "我已核对账号，并完成全部职责移交。",
                "I have checked this account and handed over all responsibilities.",
              )}
            </label>
            <p>
              {text(
                "注销将清除当前登录凭据并退出。",
                "Closing removes current credentials and signs you out.",
              )}
            </p>
            <button
              type="button"
              className="secondary-button"
              disabled={busy}
              onClick={() => setOwn(null)}
            >
              {text("取消", "Cancel")}
            </button>
            <button
              type="button"
              className="danger-button"
              disabled={busy || !handover}
              onClick={() => void closeAccount()}
            >
              {text("确认注销", "Confirm account closure")}
            </button>
          </div>
        )}
        {error && <ErrorPanel error={error} locale={locale} />}
      </div>
      {!own && (
        <button
          type="button"
          className="secondary-button account-security-action"
          disabled={busy}
          onClick={() => void prepare()}
        >
          {text("核对注销", "Review closure")}
        </button>
      )}
    </section>
  );
}
