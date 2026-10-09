// Companion integration only. The imported Sports student files stay unchanged.
(() => {
  const local = ['localhost', '127.0.0.1', '::1', '[::1]'].includes(location.hostname);
  globalThis.__BNBU_PUBLIC_CONFIG__ = { appEnv: local ? 'local' : 'production' };
  if (location.pathname.startsWith('/student/') && new URLSearchParams(location.search).get('entry') === 'checkin') {
    addEventListener('load', async () => {
      const { app } = await import('/student/js/app.js');
      app.selectTab('checkin');
    }, { once: true });
  }
})();
