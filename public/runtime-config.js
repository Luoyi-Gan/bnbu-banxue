// Companion integration only. The imported Sports student files stay unchanged.
(() => {
  const local = ['localhost', '127.0.0.1', '::1', '[::1]'].includes(location.hostname);
  globalThis.__BNBU_PUBLIC_CONFIG__ = { appEnv: local ? 'local' : 'production' };
})();
