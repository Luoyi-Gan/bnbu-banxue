import { build, createServer } from "vite";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

await build({
  configFile: false,
  publicDir: false,
  logLevel: "warn",
  build: {
    outDir: ".runtime",
    emptyOutDir: true,
    minify: false,
    lib: {
      entry: resolve("backend/src/main.ts"),
      formats: ["es"],
      fileName: () => "backend.mjs",
    },
    rollupOptions: { external: [/^node:/] },
  },
});
const { startBackend } = await import(
  pathToFileURL(resolve(".runtime/backend.mjs")).href
);
const backend = await startBackend();
const frontend = await createServer({
  server: { host: process.env.BNBU_WEB_HOST ?? "127.0.0.1" },
});
await frontend.listen();
frontend.printUrls();
async function shutdown() {
  await frontend.close();
  backend.close();
}
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
