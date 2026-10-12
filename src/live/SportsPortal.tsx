export function SportsPortal() {
  const url = import.meta.env.VITE_SPORTS_TEACHER_URL ||
    (import.meta.env.DEV ? "http://127.0.0.1:4186/" : "");

  if (!url) return <p role="status">体育课程页面尚未配置。</p>;

  return (
    <section className="live-sports-portal" aria-label="体育课程">
      <iframe title="体育课程平台" src={url} allow="fullscreen" />
      <a href={url} target="_blank" rel="noreferrer">在新窗口打开体育课程</a>
    </section>
  );
}
