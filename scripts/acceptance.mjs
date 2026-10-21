import { build } from "vite";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
await build({
  configFile: false,
  publicDir: false,
  logLevel: "warn",
  build: {
    outDir: ".runtime/tooling",
    minify: false,
    lib: {
      entry: resolve("backend/src/tooling.ts"),
      formats: ["es"],
      fileName: () => "tooling.mjs",
    },
    rollupOptions: { external: [/^node:/, 'imapflow', 'mailparser', 'tencentcloud-sdk-nodejs-ocr'] },
  },
});
const tooling = await import(
  pathToFileURL(resolve(".runtime/tooling/tooling.mjs")).href
);
if (process.argv[2] === "outbox")
  console.log(
    tooling.readLocalOutbox(
      resolve(process.env.BNBU_DATABASE ?? "data/bnbu.sqlite"),
      process.argv[3] ?? "",
    ),
  );
else if (process.argv[2] === "prepare") tooling.prepareBrowserAcceptance();
else if (process.argv[2] === "sports") console.log('独立模拟学生体育验收身份已就绪。', tooling.prepareSportsAcceptance());
else
  throw new Error("用法：node scripts/acceptance.mjs prepare | sports | outbox <email>");
