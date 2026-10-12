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
    lib: { entry: fileURLToPath(new URL('./main.ts', import.meta.url)), formats: ['es'], fileName: () => 'main.mjs' },
    rollupOptions: { external: [/^node:/, 'sharp', 'ffprobe-static'] },
  },
});
