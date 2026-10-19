// The standalone viewer is an imported island. Localize only its known interface
// labels; building names, map annotations, search input and source records stay intact.
const en={
  'BNBU 校园地图':'BNBU campus map','地图视角工具':'Map view controls','常用视角与渲染':'Views and rendering','地图操作':'Map controls','放大':'Zoom in','缩小':'Zoom out','地图朝北':'Face north','我的位置':'My location','俯视':'Top view','恢复当前校区视角':'Reset the current campus view','光影':'Lighting','拖动平移、滚轮缩放、点击建筑；可切换旋转模式':'Drag to pan, scroll to zoom, and select buildings. Switch to Rotate mode to orbit.',
  '校园地图':'Campus map','校园三维视图':'3D campus view','三维地图建筑与地点标注':'Campus building and place labels','校园探索':'Explore campus','探索校园':'Explore campus','展开筛选':'Show filters','收起筛选':'Hide filters','校园工具':'Campus tools','图层、收藏与地图资料':'Layers, saved places and map information','搜索地点、楼号或拼音':'Search places, buildings or pinyin','搜索建筑或地点':'Search buildings or places','清空搜索':'Clear search','选择校区':'Choose campus area','全校':'All campus','一期':'Phase 1','二期':'Phase 2','搜索范围':'Search scope','全部':'All','建筑':'Buildings','地点':'Places','分类':'Category','全部类别':'All categories','常用地点':'Common places','教学':'Teaching','生活':'Life','运动':'Sports','服务':'Services','收藏':'Saved','清空':'Clear','显示地点名称':'Show place labels','显示周边地图':'Show surrounding map','校园天气':'Campus weather','晴天':'Clear','多云':'Cloudy','雨天':'Rain','薄雾':'Mist','动态雨丝':'Animated rain','晴天 · 模拟效果':'Clear · Simulated weather','多云 · 模拟效果':'Cloudy · Simulated weather','雨天 · 模拟效果':'Rain · Simulated weather','薄雾 · 模拟效果':'Mist · Simulated weather','拖动方式':'Drag mode','平移':'Pan','旋转':'Rotate','左键 / 单指拖动平移 · 右键旋转':'Left mouse / one finger to pan · Right mouse to rotate','滚轮缩放 ·':'Scroll to zoom ·','双指缩放与旋转':'Pinch to zoom and rotate','可查看校园及周边，重置返回当前校区。':'Explore campus and surroundings. Reset returns to the current campus area.','模型资料与高级设置':'Model information & advanced settings','模型版本':'Model version','加载中':'Loading','画面质量':'Graphics quality','流畅 · 轻量光照':'Smooth · Simple lighting','精细 · 反射与接触阴影':'Detailed · Reflections and contact shadows','极致 · 4K 像素预算':'Ultra · 4K pixel budget','日光时段':'Daylight','晴朗日光':'Clear daylight','午后暖光':'Warm afternoon','保存 4K 画面':'Save 4K image','全部建筑':'All buildings','定位建筑':'Locate building','选择建筑…':'Choose a building…','显示精度':'Level of detail','自动选择':'Automatic','LOD 0 · 近景':'LOD 0 · Close-up','LOD 1 · 标准':'LOD 1 · Standard','LOD 2 · 轻量':'LOD 2 · Lightweight','显示施工状态待核实建筑':'Show buildings with unverified construction status','按高度依据着色':'Color by height evidence','地图记录':'Map record','楼层估算':'Estimated floors','分体混合':'Mixed building sections','高度未知':'Height unknown','地面为统一平面基准。两期部分立面与屋顶参考公开实景；细节尺寸为估算，完整立面与高程待核实。':'Ground uses a uniform plane. Some facades and roofs follow public photos. Dimensions are estimated; complete facades and elevations remain unverified.','正在载入模型…':'Loading model…','重置视角':'Reset view','查看源地图':'View source map','正在加载校园地图':'Loading campus map','即将进入三维地图':'Opening 3D view','关闭':'Close','返回':'Back','图层':'Layers','地图资料':'Map information','收藏地点':'Saved places','地图设置':'Map settings','搜索结果':'Search results','暂无搜索结果':'No matching places','没有匹配地点':'No matching places','地图来源':'Map sources','重新加载':'Reload','平面地图':'Reference map','视角':'View','模型':'Model','清除收藏':'Clear saved places','暂无收藏':'No saved places','查看详情':'View details'
}
let language='zh',scheduled=false
const originalText=new WeakMap(),originalAttributes=new WeakMap()
function translated(value){const trimmed=value.trim();return language==='en'&&en[trimmed]?value.replace(trimmed,en[trimmed]):value}
function apply(){
  scheduled=false
  // Never rewrite geospatial annotations or the dynamically generated building list.
  for(const root of document.querySelectorAll('.explore,dialog,.panel,#loading,#map-toast,.map-tools,.view-dock,#stage,#map-labels,#locate-user')){
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT)
    while(walker.nextNode()){
      const node=walker.currentNode
      if(node.parentElement?.closest('#map-labels,#search-results,#building option:not([value=""]),script,style'))continue
      const cached=originalText.get(node),value=node.nodeValue||''
      const source=cached&&value===cached.rendered?cached.source:value
      const rendered=translated(source)
      if(value!==rendered)node.nodeValue=rendered
      originalText.set(node,{source,rendered})
    }
    for(const element of [root,...root.querySelectorAll('[aria-label],[title],[placeholder]')]){
      const cached=originalAttributes.get(element)||{}
      for(const attribute of ['aria-label','title','placeholder']){
        const value=element.getAttribute(attribute);if(value===null)continue
        const previous=cached[attribute],source=previous&&value===previous.rendered?previous.source:value,rendered=translated(source)
        if(value!==rendered)element.setAttribute(attribute,rendered)
        cached[attribute]={source,rendered}
      }
      originalAttributes.set(element,cached)
    }
  }
}
function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(apply)}}
window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==parent||event.data?.type!=='huitongli-map-appearance')return
  language=event.data.language==='en'?'en':'zh'
  document.documentElement.lang=language==='en'?'en':'zh-CN'
  document.documentElement.dataset.companionTheme=event.data.theme==='dark'?'dark':'light'
  document.documentElement.dataset.companionText=event.data.textSize==='large'?'large':'standard'
  document.documentElement.dataset.companionMotion=event.data.reducedMotion?'reduce':'normal'
  apply()
})
new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true,characterData:true})
