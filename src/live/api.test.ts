import { afterEach, expect, it, vi } from "vitest";
import { api, command } from "./api";
afterEach(() => vi.unstubAllGlobals());
it("读取请求保留取消信号，写入请求保留 POST 请求体", async () => {
  const fetcher = vi.fn().mockResolvedValue(new Response('{"data":{"id":"saved"}}'));
  vi.stubGlobal("fetch", fetcher);
  const controller = new AbortController();
  await api("/api/example", undefined, controller.signal);
  expect(fetcher).toHaveBeenLastCalledWith("/api/example", expect.objectContaining({method: "GET", signal: controller.signal}));
  expect(fetcher.mock.calls[0][1]).not.toHaveProperty("body");
  fetcher.mockResolvedValue(new Response('{"data":{"id":"saved"}}'));
  await api("/api/commands", {action: "notification.read"});
  expect(fetcher).toHaveBeenLastCalledWith("/api/commands", expect.objectContaining({method: "POST", body: '{"action":"notification.read"}'}));
});
it("拒绝无身份工作台和非对象响应，同时保留后端错误状态", async () => {
  vi.stubGlobal("fetch", vi.fn()
    .mockResolvedValueOnce(new Response('{}'))
    .mockResolvedValueOnce(new Response('[]'))
    .mockResolvedValueOnce(new Response('{"message":"会话已过期"}', {status: 401})));
  await expect(api("/api/workspace")).rejects.toThrow("有效身份");
  await expect(api("/api/example")).rejects.toThrow("数据接口尚未连接");
  await expect(api("/api/workspace")).rejects.toMatchObject({status: 401, message: "会话已过期"});
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
