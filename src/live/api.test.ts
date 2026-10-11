import { afterEach, expect, it, vi } from "vitest";
import { command } from "./api";
afterEach(() => vi.unstubAllGlobals());
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
