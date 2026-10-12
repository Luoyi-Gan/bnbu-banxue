import { startBackend } from '../server/main';

const server = await startBackend();
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => server.close());
}
