import { build } from 'vite';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
await build({
  root,
  configFile: false,
  publicDir: false,
  build: {
    target: 'node24',
    outDir: 'backend/dist',
    emptyOutDir: true,
    minify: false,
    lib: { entry: { main: fileURLToPath(new URL('./main.ts', import.meta.url)), postgres: fileURLToPath(new URL('./postgres-main.ts', import.meta.url)), 'import-sqlite': fileURLToPath(new URL('./import-sqlite.ts', import.meta.url)) }, formats: ['es'], fileName: (_format, name) => `${name}.mjs` },
    rollupOptions: { external: [/^node:/, 'pg', 'cos-nodejs-sdk-v5', 'imapflow', 'mailparser', 'tencentcloud-sdk-nodejs-ocr'] },
  },
});
