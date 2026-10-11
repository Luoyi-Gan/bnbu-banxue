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
      entry: resolve("server/main.ts"),
      formats: ["es"],
      fileName: () => "backend.mjs",
    },
    rollupOptions: { external: [/^node:/, "sharp", "ffprobe-static"] },
  },
});
const { startBackend } = await import(
  pathToFileURL(resolve(".runtime/backend.mjs")).href
);
const backend = await startBackend();
const frontend = await createServer();
await frontend.listen();
frontend.printUrls();
async function shutdown() {
  await frontend.close();
  backend.close();
}
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
