import { build, createServer } from "vite";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {startLocalSportsPreview} from './local-sports-preview.mjs';

const localSports = process.env.BNBU_LOCAL_SPORTS_ACCEPTANCE === '1' ? await startLocalSportsPreview() : null;
process.once('exit',()=>localSports?.kill());

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
    rollupOptions: { external: [/^node:/, 'imapflow', 'mailparser', 'tencentcloud-sdk-nodejs-ocr'] },
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
  localSports?.kill();
  await frontend.close();
  backend.close();
}
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
