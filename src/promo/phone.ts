import { createRoot } from 'react-dom/client'
import { createElement } from 'react'
import { CSS3DObject, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import { ProductScreen, type ScreenName } from './ProductScreen'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

export interface PhonePose { x: number; y: number; rx: number; ry: number; rz: number; scale: number }

function outline(w: number, h: number, r: number) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r)
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r)
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y)
  return s
}

function face(w: number, h: number, radius: number) {
  const g = new THREE.ShapeGeometry(outline(w, h, radius), 32)
  const pos = g.getAttribute('position'), uv = g.getAttribute('uv')
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / w + .5, pos.getY(i) / h + .5)
  return g
}

/** Original procedural device; no third-party model or brand asset. */
export function createPhone(host: HTMLElement, onFailure: () => void) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.15
  host.appendChild(renderer.domElement)
  renderer.domElement.setAttribute('aria-hidden', 'true')
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(32, 1, .1, 100)
  camera.position.z = 15
  const pmrem = new THREE.PMREMGenerator(renderer)
  const room = new RoomEnvironment()
  const env = pmrem.fromScene(room, .04)
  scene.environment = env.texture
  room.dispose(); pmrem.dispose()
  const phone = new THREE.Group()
  scene.add(phone)
  const geometries: THREE.BufferGeometry[] = [], materials: THREE.Material[] = []
  const mesh = (g: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0) => {
    geometries.push(g); materials.push(m)
    const obj = new THREE.Mesh(g, m); obj.position.set(x, y, z); phone.add(obj); return obj
  }
  const titanium = new THREE.MeshStandardMaterial({ color: '#9c9d98', metalness: 1, roughness: .25 })
  const polished = new THREE.MeshStandardMaterial({ color: '#c6c9c7', metalness: 1, roughness: .13 })
  const black = new THREE.MeshStandardMaterial({ color: '#08090b', metalness: .2, roughness: .3 })
  const body = new THREE.ExtrudeGeometry(outline(2.88, 6.04, .45), { depth: .22, bevelEnabled: true, bevelThickness: .065, bevelSize: .045, bevelSegments: 5, steps: 1, curveSegments: 28 })
  body.translate(0, 0, -.11)
  mesh(body, titanium)
  mesh(face(2.91, 6.07, .47), polished, 0, 0, .177)
  mesh(face(2.85, 6.01, .44), black, 0, 0, .184)
  mesh(face(2.7, 5.86, .36), new THREE.MeshBasicMaterial({ color: '#faf9f6', toneMapped: false }), 0, 0, .19)
  const htmlRenderer = new CSS3DRenderer()
  Object.assign(htmlRenderer.domElement.style, { position: 'absolute', inset: '0', pointerEvents: 'none' })
  host.appendChild(htmlRenderer.domElement)
  const htmlScene = new THREE.Scene(), htmlPhone = new THREE.Group()
  htmlScene.add(htmlPhone)
  const display = document.createElement('div')
  Object.assign(display.style, { width: '390px', height: '790px', overflow: 'hidden', borderRadius: '35px', background: '#faf9f6' })
  const names: ScreenName[] = ['home', 'discover', 'forum', 'coffee', 'partners', 'sports', 'map']
  const layers = names.map(name => { const el = document.createElement('div'); el.className = 'html-screen-layer'; Object.assign(el.style, { position: 'absolute', inset: '0', opacity: '0' }); display.appendChild(el); const root = createRoot(el); root.render(createElement(ProductScreen, { name })); return { el, root } })
  const htmlScreen = new CSS3DObject(display)
  htmlScreen.scale.set(2.7 / 390, 5.48 / 790, 1)
  htmlScreen.position.set(0, -.19, .198)
  htmlPhone.add(htmlScreen)
  const statusCanvas = document.createElement('canvas'); statusCanvas.width = 520; statusCanvas.height = 60
  const status = statusCanvas.getContext('2d')!
  status.fillStyle = '#20302d'; status.font = '600 25px Arial'; status.fillText('9:41', 23, 40)
  for (let i = 0; i < 4; i++) status.fillRect(407 + i * 9, 38 - i * 5, 6, 9 + i * 5)
  status.lineWidth = 3; status.strokeStyle = '#20302d'; status.strokeRect(458, 22, 34, 20); status.fillRect(462, 26, 25, 12); status.fillRect(495, 28, 3, 8)
  const statusTexture = new THREE.CanvasTexture(statusCanvas); statusTexture.colorSpace = THREE.SRGBColorSpace
  mesh(new THREE.PlaneGeometry(2.5, .29), new THREE.MeshBasicMaterial({ map: statusTexture, transparent: true, toneMapped: false }), 0, 2.73, .202)
  // Dynamic Island and optical glass, kept above the screenshot's safe area.
  mesh(face(.78, .21, .105), new THREE.MeshBasicMaterial({ color: '#050609' }), 0, 2.73, .201)
  mesh(new THREE.CircleGeometry(.043, 24), new THREE.MeshPhysicalMaterial({ color: '#142439', metalness: .65, roughness: .08, clearcoat: 1 }), .25, 2.73, .205)
  // Machined side controls and antenna breaks.
  for (const [x, y, h] of [[-1.48, 1.65, .25], [-1.48, .99, .49], [-1.48, .3, .49], [1.48, .85, .72]]) {
    mesh(new THREE.BoxGeometry(.045, h, .105), polished, x, y, 0)
  }
  for (const x of [-1.47, 1.47]) for (const y of [-2.25, 2.25]) {
    mesh(new THREE.BoxGeometry(.012, .045, .19), new THREE.MeshStandardMaterial({ color: '#575b59', roughness: .8 }), x, y)
  }
  // Satin rear glass and three separate lens housings.
  const back = mesh(face(2.82, 5.99, .43), new THREE.MeshPhysicalMaterial({ color: '#b6b9b4', metalness: .35, roughness: .38, clearcoat: .45 }), 0, 0, -.18)
  back.rotation.y = Math.PI
  for (const [x, y] of [[-.8, 2.2], [-.8, 1.46], [-.12, 1.83]]) {
    const lens = mesh(new THREE.CylinderGeometry(.3, .3, .13, 36), titanium, x, y, -.25); lens.rotation.x = Math.PI / 2
    const glass = mesh(new THREE.CircleGeometry(.24, 36), black, x, y, -.32); glass.rotation.y = Math.PI
  }
  const key = new THREE.DirectionalLight('#ffffff', 3); key.position.set(-4, 6, 7); scene.add(key)
  const rim = new THREE.DirectionalLight('#d7e4ea', 2); rim.position.set(5, 2, -2); scene.add(rim)
  const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = 256; shadowCanvas.height = 64
  const shadowContext = shadowCanvas.getContext('2d')!
  shadowContext.scale(4, 1)
  const gradient = shadowContext.createRadialGradient(32, 32, 0, 32, 32, 32)
  gradient.addColorStop(0, '#182b293d'); gradient.addColorStop(1, '#182b2900')
  shadowContext.fillStyle = gradient; shadowContext.fillRect(0, 0, 64, 64)
  const shadowTexture = new THREE.CanvasTexture(shadowCanvas)
  const shadowMaterial = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false })
  const shadowGeometry = new THREE.PlaneGeometry(4.3, .64)
  const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial); scene.add(shadow)
  let disposed = false, visible = true, reduce = false
  const render = () => { if (!disposed && visible && !document.hidden) { renderer.render(scene, camera); htmlRenderer.render(htmlScene, camera) } }
  const resize = () => {
    const { width, height } = host.getBoundingClientRect()
    renderer.setSize(width, height); htmlRenderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix(); render()
  }
  const observer = new ResizeObserver(resize); observer.observe(host); resize()
  const visibility = () => { display.style.visibility = document.hidden ? 'hidden' : 'visible'; render() }
  document.addEventListener('visibilitychange', visibility)
  const lost = (e: Event) => { e.preventDefault(); onFailure() }
  renderer.domElement.addEventListener('webglcontextlost', lost)
  return {
    update(p: PhonePose, fromScreen: number, toScreen: number, mix: number, float = 0) {
      phone.position.set(p.x, p.y + float, 0)
      phone.rotation.set(p.rx, p.ry, p.rz)
      phone.scale.setScalar(p.scale)
      shadow.position.set(p.x, p.y - 3.3 * p.scale, -.5)
      shadow.scale.setScalar(p.scale)
      htmlPhone.position.copy(phone.position); htmlPhone.rotation.copy(phone.rotation); htmlPhone.scale.copy(phone.scale)
      layers.forEach(({ el }, i) => { const opacity = i === fromScreen ? 1 - mix : i === toScreen ? mix : 0; el.style.opacity = '1'; el.style.visibility = opacity > .001 ? 'visible' : 'hidden'; el.style.transform = 'translateY(' + (i === fromScreen ? -mix * 790 : (1 - mix) * 790) + 'px)'; el.classList.toggle('screen-running', opacity > .5 && !reduce && visible) })
      render()
    },
    setVisible(value: boolean) { visible = value; display.style.visibility = value ? 'visible' : 'hidden' },
    setReduced(value: boolean) { reduce = value },
    dispose() {
      disposed = true; observer.disconnect(); document.removeEventListener('visibilitychange', visibility)
      queueMicrotask(() => layers.forEach(({ root }) => root.unmount())); htmlRenderer.domElement.remove()
      geometries.forEach(g => g.dispose()); new Set(materials).forEach(m => m.dispose())
      statusTexture.dispose(); shadowTexture.dispose(); shadowMaterial.dispose(); shadowGeometry.dispose()
      env.dispose(); renderer.dispose(); renderer.domElement.remove()
    },
  }
}
