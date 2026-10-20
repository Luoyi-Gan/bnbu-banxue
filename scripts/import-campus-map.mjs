import fs from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { adaptCampusLocation } from './campus-map-location.mjs'

const source = path.resolve(process.argv[2] || '../BNBU 3D Model')
const destination = path.resolve('public/campus-map')
const { build } = createRequire(path.join(source, 'package.json'))('esbuild')
const prefix = '/campus-map'
const rebase = text => text.replace(/\r\n/g, '\n').replace(/[ \t]+$/gm, '').replace(/\n+$/, '\n').replace(/(?<![\w/.\-])\/(viewer|exports|data|materials)\//g, `${prefix}/$1/`)
await fs.access(path.join(source, 'viewer/app.js'))
await fs.mkdir(destination, { recursive: true })
const copied = new Set()
async function copy(relative) {
  const input = path.join(source, relative), output = path.join(destination, relative)
  const stat = await fs.lstat(input)
  if (stat.isSymbolicLink()) throw Error('Unexpected symlink: ' + relative)
  if (stat.isDirectory()) { for (const name of await fs.readdir(input)) await copy(relative + '/' + name); return }
  await fs.mkdir(path.dirname(output), { recursive: true })
  if (/\.(html|css|json|js|mjs|txt)$/.test(relative)) await fs.writeFile(output, rebase(await fs.readFile(input, 'utf8')))
  else await fs.copyFile(input, output)
  copied.add(relative)
}
const versions = JSON.parse(await fs.readFile(path.join(source, 'viewer/asset-versions.json'), 'utf8'))
const campus = JSON.parse(await fs.readFile(path.join(source, 'data/processed/viewer-campus.json'), 'utf8'))
const catalog = campus.buildings.map(b => {
  const name = b.display_name || b.name
  const duplicate = campus.buildings.filter(other => (other.display_name || other.name) === name).length > 1
  return { id:b.id, name:duplicate ? `${name}（${b.phase === '1' ? '一期' : '二期'}）` : name }
})
await fs.writeFile('src/v2/campusBuildings.json', JSON.stringify(catalog, null, 2)+'\n')
for (const file of new Set(Object.values(versions))) await copy(file.slice(1))
for (const file of ['data/materials/library.json','data/materials/sources.json','data/materials/environment-source.json']) await copy(file)
for (const file of ['viewer/index.html', 'viewer/campus-icon.svg', 'viewer/reference-map.html', 'viewer/reference-map.css', 'viewer/vendor/maplibre-gl.css', 'viewer/vendor/maplibre-gl-worker.mjs', 'viewer/vendor/THREE-LICENSE.txt', 'viewer/vendor/PINYIN-PRO-LICENSE.txt', 'viewer/vendor/MAPLIBRE-LICENSE.txt', 'data/processed/reference-map', ...['viewer-campus', 'campus-places', 'reference-places', 'surroundings'].map(name => `data/processed/${name}.json`)]) await copy(file)

const bridge = `
const notifyHost = value => parent.postMessage(value, location.origin);
const originalChoose = choose;
choose = function(building, move=true) { originalChoose(building,move); if(building) { if(new URLSearchParams(location.search).get('surface')==='explore')document.getElementById('search-results').hidden=true; notifyHost({type:'huitongli-map-selected',id:building.id}); } };
window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==parent||event.data?.type!=='huitongli-map-command'||!startupReady)return;
  if(event.data.action==='focus')choose(data.buildings.find(b=>b.id===event.data.id));
  if(event.data.action==='overview'){selected=null;clearSelection();showOverview();focus('all',false);}
});
`
const plugin = { name: 'huitongli-map', setup(builder) {
  builder.onResolve({ filter: /[\\/]search-spelling\.js$/ }, () => ({ path: path.join(source, 'viewer/search-spelling-browser.js') }))
  builder.onLoad({ filter: /\.(js|json)$/ }, async args => {
    if (args.path.includes('node_modules')) return
    let contents = await fs.readFile(args.path, 'utf8')
    if (args.path === path.join(source, 'viewer/app.js')) {
      if(!contents.includes('renderer.toneMappingExposure=.85;'))throw Error('Map exposure adapter source no longer matches')
      contents = contents.replace('function fail(e){', "function fail(e){parent.postMessage({type:'huitongli-map-error'},location.origin);")
      contents = contents.replace('renderer.toneMappingExposure=.85;', "renderer.toneMappingExposure=new URLSearchParams(location.search).get('surface')==='explore'?.94:.85;")
      contents = contents.replace('init();', `${bridge}\ninit().then(()=>{if(startupReady)notifyHost({type:'huitongli-map-ready',buildings:${JSON.stringify(catalog)}});});`)
    }
    if (args.path.endsWith('map-explorer.js')) {
      if(!contents.includes('const budget=labelBudget(zoomLevel,width,height);'))throw Error('Map label budget adapter source no longer matches')
      contents=contents.replace('const budget=labelBudget(zoomLevel,width,height);', "const budget=new URLSearchParams(location.search).get('surface')==='explore'?Math.min(labelBudget(zoomLevel,width,height),(width<760?[5,8,12,16]:[8,12,18,24])[zoomLevel]):labelBudget(zoomLevel,width,height);")
    }
    if (args.path.endsWith('campus-tools.js')) {
      contents = adaptCampusLocation(contents, path.resolve('scripts/campus-map-location.mjs').replaceAll('\\', '/'))
      contents = contents.replace("if('serviceWorker' in navigator)", 'if(false)')
      contents = contents.replace('actions.append(favorite,shareButton,comment)', 'actions.append(favorite,shareButton)')
      contents = contents.replace("directoryLink.href='/places/'", "directoryLink.hidden=true;directoryLink.href='/campus-map/data/processed/campus-places.json'")
      contents = contents.replaceAll("'/privacy.html'", "'/campus-map/viewer/privacy.html'")
      contents = contents.replace('留言支持基础格式，昵称、文字与所选图片发布后可供其他访客查看；可以编辑或隐藏本机发布的留言。离线地图不缓存留言。', '校园交流请使用会同里的校园社区。')
    }
    return { contents: rebase(contents), loader: args.path.endsWith('.json') ? 'json' : 'js' }
  })
} }
for (const [entry, name] of [['app.js','campus'], ['reference-map.js','reference-map']]) {
  const result = await build({ entryPoints: { [name]: path.join(source,'viewer',entry) }, outdir: path.join(destination,'viewer'), chunkNames:'chunks/[name]-[hash]', bundle:true, format:'esm', splitting:true, minify:true, target:'es2020', legalComments:'eof', plugins:[plugin], metafile:true })
  for (const file of Object.keys(result.metafile.outputs)) {
    const output = path.resolve(file)
    const contents = (await fs.readFile(output, 'utf8')).replace(/[ \t]+$/gm, '').replace(/^[ \t]+/gm, indent => indent.replaceAll('\t', '  '))
    await fs.writeFile(output, contents)
    copied.add(path.relative(destination, output).replaceAll('\\','/'))
  }
}
let html = await fs.readFile(path.join(destination,'viewer/index.html'),'utf8')
html = html.replace(/<!-- startup-preloads:start -->[\s\S]*?<!-- startup-preloads:end -->/, `<link rel="modulepreload" href="${prefix}/viewer/campus.js"><link rel="preload" as="fetch" crossorigin href="${prefix}${versions['/exports/campus-lod2.glb']}">`)
html = html.replace(/<!-- startup-entry:start -->[\s\S]*?<!-- startup-entry:end -->/, `<script type="module" src="${prefix}/viewer/campus.js"></script>`)
html = html.replace(/<link rel="manifest"[^>]*>/, '').replace('href="/"', 'href="/v2/campus" target="_parent"').replace('收藏、留言与离线', '图层、收藏与地图资料')
html = html.replace('href="/privacy.html"', 'href="/campus-map/viewer/privacy.html"')
// Viewer-only services must never reach Companion's business backend.
const bootstrap = `<script>const originalFetch=window.fetch.bind(window);window.fetch=(input,options)=>{const url=new URL(typeof input==='string'?input:input.url,location.href);if(url.origin===location.origin&&url.pathname.startsWith('/api/'))return Promise.resolve(new Response('{}',{status:503,headers:{'Content-Type':'application/json'}}));return originalFetch(input,options)};</script>`
const css = `<style>[data-tools-tab="comments"],[data-tools-panel="comments"],#refresh-places,#download-offline,#install-campus,#auto-refresh-places,#maintenance-state,#qa-tools,section:has(>label>#auto-refresh-places){display:none!important}</style>`
html = html.replace('</head>', bootstrap + css + '<script>if(new URLSearchParams(location.search).get("surface")==="explore")document.documentElement.classList.add("companion-explore")</script><link rel="stylesheet" href="/campus-map/viewer/explore-presentation.css"></head>')
html = html.replace('</head>', '<link rel="stylesheet" href="/campus-map/viewer/campus-window.css"></head>')
html = html.replace('</body>', '<script type="module" src="/campus-map/viewer/companion-preferences.js"></script></body>')
html=html.replace('<footer>', '<footer id="map-startup-credit">').replace('</body>', '<script src="/campus-map/viewer/startup-credit.js"></script></body>')
await fs.writeFile(path.join(destination,'viewer/index.html'), html)
const reference = path.join(destination,'viewer/reference-map.html')
await fs.writeFile(reference, (await fs.readFile(reference,'utf8')).replace(`${prefix}/viewer/vendor/reference-map.bundle.js`,`${prefix}/viewer/reference-map.js`))
await fs.writeFile(path.join(destination,'viewer/privacy.html'), '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>地图与本机数据</title><h1>地图与本机数据</h1><p>地图收藏、图层和视角保存在当前浏览器。只有主动点击定位才申请位置权限，并单次获取当前位置。位置仅保存在当前地图内存，清除或离开后移除，不上传至伴学后端；定位后的相机视角不写入本机视角存档。建筑尺寸含估算，地点现状以现场为准。</p><p>会同里的账号、活动与社区遵循 App 的现有权限与数据规则。</p><a href="/v2/campus/explore">返回校园探索</a></html>')
copied.add('viewer/privacy.html')
const entries = []
for (const file of [...copied].sort()) {
  const bytes = await fs.readFile(path.join(destination,file))
  entries.push({file,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')})
}
const manifest = { source:'BNBU 3D Model', sourceHead:execFileSync('git',['-C',source,'rev-parse','HEAD'],{encoding:'utf8'}).trim(), importedAt:new Date().toISOString(), files:entries }
await fs.writeFile(path.join(destination,'manifest.json'),JSON.stringify(manifest,null,2)+'\n')
console.log(JSON.stringify({files:entries.length,bytes:entries.reduce((sum,item)=>sum+item.bytes,0),sourceHead:manifest.sourceHead}))
