import { afterEach, expect, it, vi } from "vitest";
import { api, command } from "./api";
afterEach(() => vi.unstubAllGlobals());
it("体育账号读取传递取消信号且仍使用 GET，业务写入仍使用 POST", async () => {
  const fetcher = vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({ account: { id: "teacher", roles: ["teacher"] }, sports: null })))
    .mockResolvedValueOnce(new Response(JSON.stringify({ data: { id: "saved" } })));
  vi.stubGlobal("fetch", fetcher);
  const controller = new AbortController();
  await api("/api/workspace", undefined, controller.signal);
  expect(fetcher).toHaveBeenNthCalledWith(1, "/api/workspace", expect.objectContaining({ method: "GET", signal: controller.signal }));
  expect(fetcher.mock.calls[0][1]).not.toHaveProperty("body");
  await api("/api/commands", { action: "notification.read", input: { id: "notice" } });
  expect(fetcher).toHaveBeenNthCalledWith(2, "/api/commands", expect.objectContaining({ method: "POST", body: JSON.stringify({ action: "notification.read", input: { id: "notice" } }) }));
});
it("无有效账号响应拒绝显示，体育首次改密与维护响应保留门禁状态", async () => {
  vi.stubGlobal("fetch", vi.fn()
    .mockResolvedValueOnce(new Response("{}"))
    .mockResolvedValueOnce(new Response('{"firstLoginOnly":true}'))
    .mockResolvedValueOnce(new Response('{"system":{"mode":"MAINTENANCE"}}')));
  await expect(api("/api/workspace")).rejects.toThrow("有效身份");
  await expect(api("/api/sports/workspace")).resolves.toEqual({ firstLoginOnly: true });
  await expect(api("/api/sports/workspace")).resolves.toEqual({ system: { mode: "MAINTENANCE" } });
});
it("响应丢失后的重试复用幂等键，明确成功后新操作使用新键", async () => {
  const mock = vi
    .fn()
    .mockRejectedValueOnce(new TypeError("network failed"))
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ data: { id: "post" } }), { status: 200 }),
    )
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ data: { id: "post2" } }), { status: 200 }),
    );
  vi.stubGlobal("fetch", mock);
  const input = { title: "same" };
  await expect(command("post.create", input)).rejects.toThrow("network failed");
  await command("post.create", input);
  await command("post.create", input);
  const requests = mock.mock.calls.map((call) => JSON.parse(call[1].body));
  expect(requests[0].requestId).toBe(requests[1].requestId);
  expect(requests[1].requestId).not.toBe(requests[2].requestId);
});
