import { afterEach, expect, it, vi } from "vitest";
import {
  apiSessionRole,
  apiSessionUserId,
  clearApiSession,
  hasApiSession,
  logoutApi,
  request,
  restoreCookieSession,
  setApiRequestMode,
} from "../integrations/sports-teacher/app/api-client";

afterEach(() => {
  clearApiSession();
  setApiRequestMode("real");
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

it("原页面恢复服务端 cookie 会话，不伪造或存储 Bearer 凭据", async () => {
  vi.stubEnv("NEXT_PUBLIC_BNBU_COOKIE_SESSION", "true");
  const fetcher = vi
    .fn()
    .mockResolvedValue(
      Response.json({
        data: {
          userId: "admin-1",
          adminKind: "SUB",
          version: 1,
          permissions: [],
          mustChangePassword: false,
        },
      }),
    );
  vi.stubGlobal("fetch", fetcher);
  expect(await restoreCookieSession()).toBe(true);
  expect(apiSessionRole()).toBe("ADMIN");
  expect(apiSessionUserId()).toBe("admin-1");
  expect(fetcher.mock.calls[0][1]).toMatchObject({
    credentials: "same-origin",
  });
  expect(fetcher.mock.calls[0][1].headers.Authorization).toBeUndefined();
  await logoutApi();
  expect(hasApiSession()).toBe(false);
  expect(fetcher.mock.calls[1][0]).toBe("/api/v1/auth/logout");
});

it("退出后的迟到恢复不能重新建立前端会话；失效会话不尝试 JWT 刷新", async () => {
  vi.stubEnv("NEXT_PUBLIC_BNBU_COOKIE_SESSION", "true");
  let complete!: (response: Response) => void;
  const fetcher = vi.fn().mockImplementationOnce(
    () =>
      new Promise<Response>((resolve) => {
        complete = resolve;
      }),
  );
  vi.stubGlobal("fetch", fetcher);
  const restoring = restoreCookieSession();
  clearApiSession();
  complete(Response.json({ data: { userId: "old", adminKind: null } }));
  expect(await restoring).toBe(false);
  expect(hasApiSession()).toBe(false);
  fetcher.mockResolvedValue(
    Response.json(
      { code: "UNAUTHORIZED", message: "expired" },
      { status: 401 },
    ),
  );
  await expect(request("/me")).rejects.toThrow();
  expect(fetcher).toHaveBeenCalledTimes(2);
  expect(await restoreCookieSession()).toBe(false);
});
