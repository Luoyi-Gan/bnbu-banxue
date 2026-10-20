import { ScreenPreview } from './ProductScreen'
import { ArrowUpRight, Smartphone, Globe, ArrowDown } from 'lucide-react'

export function DownloadBoard() {
  return <section className="promo-download" aria-labelledby="download-title">
    <div className="promo-download-board">
      <div className="promo-download-copy">
        <div className="promo-download-brand"><img src="/huitongli-app-icon.png" alt=""/><span>会同里 <small>为 BNBU 校园生活而来</small></span></div>
        <p className="promo-download-kicker">YOUR CAMPUS, WITH YOU.</p>
        <h2 id="download-title">把校园生活，<br/><em>带在身边。</em></h2>
        <p className="promo-download-description">发现校园里的新鲜事，约一次交流，找到同行的人。打开会同里，让今天的安排和下一次相遇，自然相连。</p>
        <div className="promo-download-actions"><a href="/v2" className="promo-download-primary"><Globe size={18}/>打开网页版<ArrowUpRight size={17}/></a><a href="#product-story" className="promo-download-secondary">先看看会同里<ArrowDown size={16}/></a></div>
        <details className="promo-install-help"><summary><Smartphone size={17}/>添加到主屏幕<span>＋</span></summary><p>先打开会同里网页版，再在浏览器菜单中查找“添加到主屏幕”或“安装应用”。可用选项因设备与浏览器而异。</p><a href="/v2">打开会同里，查看浏览器选项 ↗</a></details>
        <p className="promo-download-note">Web 版现已可用 · 手机与电脑均可访问</p>
      </div>
      <div className="promo-download-preview" aria-label="会同里首页和活动界面预览">
        <div className="promo-download-windowbar"><span className="promo-window-dots" aria-hidden="true">● ● ●</span><span>会同里 · 校园日常</span><span>功能演示</span></div>
        <div className="promo-download-screens"><figure><figcaption>从今天的安排开始</figcaption><div className="promo-board-screen"><ScreenPreview name="home"/></div></figure><figure><figcaption>发现下一件想做的事</figcaption><div className="promo-board-screen"><ScreenPreview name="discover"/></div></figure></div>
        <div className="promo-download-preview-foot"><span>日常 · 交流 · 同行</span><span>HUITONGLI</span></div>
      </div>
    </div>
  </section>
}
