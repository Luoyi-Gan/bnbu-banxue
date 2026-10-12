import { afterEach, expect, it, vi } from "vitest";
import { checkSchoolIdentity } from "../backend/src/identity";
import type { Account } from "../backend/src/auth";

const actor: Account = {
  id: "account-1",
  name: "测试",
  email: "student@example.test",
  organization: "",
  status: "active",
  roles: [],
};
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
it("未配置的真实核验接口明确失败，不把测试身份视为已核验", async () => {
  vi.stubEnv("BNBU_IDENTITY_VERIFICATION_URL", "");
  await expect(checkSchoolIdentity(actor)).rejects.toMatchObject({
    status: 503,
  });
});
it("只转发当前账号，核验成功不采用服务返回的管理员角色", async () => {
  vi.stubEnv(
    "BNBU_IDENTITY_VERIFICATION_URL",
    "https://identity.example.test/check",
  );
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url, options) => {
      const request = JSON.parse(options.body);
      expect(request).toMatchObject({
        accountId: actor.id,
        email: actor.email,
      });
      return Response.json({
        ...request,
        verified: true,
        subject: "school-subject",
        roles: ["superadmin"],
      });
    }),
  );
  expect(await checkSchoolIdentity(actor)).toMatchObject({
    verified: true,
    subject: "school-subject",
    authorizationChanged: false,
  });
  expect(actor.roles).toEqual([]);
});
it.each(["other-account", "old-request", "missing-assertion"])(
  "拒绝无效服务结果 %s",
  async (kind) => {
    vi.stubEnv(
      "BNBU_IDENTITY_VERIFICATION_URL",
      "https://identity.example.test/check",
    );
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url, options) => {
        const request = JSON.parse(options.body);
        return Response.json({
          ...request,
          verified: true,
          subject: "school-subject",
          ...(kind === "other-account"
            ? { email: "other@example.test" }
            : kind === "old-request"
              ? { requestId: "old" }
              : { verified: undefined }),
        });
      }),
    );
    await expect(checkSchoolIdentity(actor)).rejects.toMatchObject({
      status: 502,
    });
  },
);
it("未核验结果与服务故障区分，封禁账号不请求外部服务", async () => {
  vi.stubEnv(
    "BNBU_IDENTITY_VERIFICATION_URL",
    "https://identity.example.test/check",
  );
  const fetcher = vi.fn(async (_url, options) =>
    Response.json({ ...JSON.parse(options.body), verified: false }),
  );
  vi.stubGlobal("fetch", fetcher);
  expect(await checkSchoolIdentity(actor)).toMatchObject({
    verified: false,
    subject: null,
  });
  await expect(
    checkSchoolIdentity({ ...actor, status: "banned" }),
  ).rejects.toMatchObject({ status: 403 });
  expect(fetcher).toHaveBeenCalledTimes(1);
});
