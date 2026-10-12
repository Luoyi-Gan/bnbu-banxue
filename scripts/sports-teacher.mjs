import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Run the repository's original portal with the same Node runtime as the caller.
// Do not require a second npm executable on PATH (not present in some Windows setups).
const portal = new URL("../integrations/sports-teacher/", import.meta.url);
const cli = new URL("node_modules/vinext/dist/cli.js", portal);
if (!existsSync(cli)) {
  console.error(
    "请先在 integrations/sports-teacher 中执行 npm ci 安装原版前端依赖。",
  );
  process.exit(1);
}
process.chdir(fileURLToPath(portal));
process.env.BNBU_LOCAL_BACKEND_ORIGIN ??= "http://127.0.0.1:4175";
process.env.NEXT_PUBLIC_BNBU_COOKIE_SESSION = "true";
process.argv = [
  process.execPath,
  fileURLToPath(cli),
  "dev",
  "--hostname",
  "127.0.0.1",
  "--port",
  "4186",
];
await import(cli.href);
