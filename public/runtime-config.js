// Companion runtime configuration. Integration changes are recorded in the source manifest.
(() => {
  const local = ['localhost', '127.0.0.1', '::1', '[::1]'].includes(location.hostname);
  // Local companion acceptance uses real accounts too; ignore old preview sessions.
  globalThis.__BNBU_PUBLIC_CONFIG__ = { appEnv: local ? 'qa' : 'production' };
})();
