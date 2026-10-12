import { startBackend } from './src/main';

const server = await startBackend();
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => server.close());
}
