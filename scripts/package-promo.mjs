import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

// Build first. Package only the promotional entry and its dependency graph.
const dist = path.resolve('dist')
const output = path.resolve(process.argv[2] || 'artifacts/promo-release')
const prefix = '/huitongli-promo/'
await fs.mkdir(output, { recursive: true })
const files = new Map()
async function collect(relative) {
  if (files.has(relative)) return
  if (relative.includes('..') || path.isAbsolute(relative)) throw new Error('Invalid asset path')
  const content = await fs.readFile(path.join(dist, relative))
  files.set(relative, content)
  if (!/\.(html|js|css)$/.test(relative)) return
  const text = content.toString()
  const refs = relative.endsWith('.html')
    ? [...text.matchAll(/(?:src|href)="\/(assets\/[^"]+)"/g)].map(m => m[1])
    : [...text.matchAll(/["']\.\/([^"']+\.(?:js|css))["']/g)].map(m => 'assets/' + m[1])
  for (const ref of refs) await collect(ref)
}
await collect('promo.html')
for (const name of await fs.readdir(path.join(dist, 'promo'))) await collect('promo/' + name)
for (const relative of [
  'huitongli-app-icon.png',
  'fonts/misans/MiSans-Regular.woff2',
  'fonts/misans/MiSans-Semibold.woff2',
  'fonts/lxgw-wenkai/BNBUWenKai-Medium.woff2',
]) await collect(relative)
const manifest = []
for (const [relative, raw] of files) {
  let data = raw
  if (/\.(html|js|css)$/.test(relative)) {
    data = Buffer.from(raw.toString()
      .replaceAll('/assets/', prefix + 'assets/')
      .replaceAll('/promo/', prefix + 'promo/')
      .replaceAll('/fonts/', prefix + 'fonts/')
      .replaceAll('/huitongli-app-icon.png', prefix + 'huitongli-app-icon.png'))
  }
  const target = path.join(output, relative)
  await fs.mkdir(path.dirname(target), { recursive: true })
  await fs.writeFile(target, data)
  manifest.push({ path: relative, bytes: data.length, sha256: crypto.createHash('sha256').update(data).digest('hex') })
}
await fs.writeFile(path.join(output, 'SHA256SUMS'), manifest.map(f => `${f.sha256}  ${f.path}`).join('\n') + '\n')
await fs.writeFile(path.join(output, 'manifest.json'), JSON.stringify({ prefix, files: manifest }, null, 2))
console.log(JSON.stringify({ output, files: manifest.length, bytes: manifest.reduce((n, f) => n + f.bytes, 0) }))
