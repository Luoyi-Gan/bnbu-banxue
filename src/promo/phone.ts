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
  const blank = new THREE.DataTexture(new Uint8Array([250, 249, 246, 255]), 1, 1); blank.needsUpdate = true
  const screenMaterial = new THREE.ShaderMaterial({
    uniforms: { uFrom: { value: blank }, uTo: { value: blank }, uMix: { value: 0 }, uFromVideo: { value: 0 }, uToVideo: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader: `
      uniform sampler2D uFrom; uniform sampler2D uTo; uniform float uMix; uniform float uFromVideo; uniform float uToVideo; varying vec2 vUv;
      void main(){
        vec2 fromUv=clamp(vUv+vec2(0.0,uMix*0.025),0.0,1.0);
        vec2 toUv=clamp(vUv-vec2(0.0,(1.0-uMix)*0.025),0.0,1.0);
        vec4 a=texture2D(uFrom,fromUv),b=texture2D(uTo,toUv);
        if(uFromVideo>0.5) a=sRGBTransferEOTF(a);
        if(uToVideo>0.5) b=sRGBTransferEOTF(b);
        gl_FragColor=mix(a,b,uMix);
        #include <colorspace_fragment>
      }`,
    toneMapped: false,
  })
  mesh(face(2.7, 5.86, .36), new THREE.MeshBasicMaterial({ color: '#faf9f6', toneMapped: false }), 0, 0, .19)
  mesh(face(2.7, 5.48, .28), screenMaterial, 0, -.19, .195)
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
  const textures: THREE.Texture[] = []
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
  let disposed = false, active = 0, from = 0, to = 0, visible = true, reduce = false, videoReady = false, videoFailed = false
  const video = document.createElement('video')
  video.src = '/promo/discover.webm'; video.muted = true; video.loop = true; video.playsInline = true; video.preload = 'none'
  const videoTexture = new THREE.VideoTexture(video); videoTexture.colorSpace = THREE.SRGBColorSpace
  const render = () => { if (!disposed && visible && !document.hidden) renderer.render(scene, camera) }
  const syncScreen = () => {
    const texture = (i: number) => i === 1 && active === 1 && videoReady && !videoFailed && !reduce ? videoTexture : textures[i] ?? blank
    screenMaterial.uniforms.uFrom.value = texture(from)
    screenMaterial.uniforms.uTo.value = texture(to)
    screenMaterial.uniforms.uFromVideo.value = texture(from) === videoTexture ? 1 : 0
    screenMaterial.uniforms.uToVideo.value = texture(to) === videoTexture ? 1 : 0
  }
  const syncVideo = () => {
    const play = active === 1 && visible && !reduce && !document.hidden
    if (play && !videoFailed) { void video.play().catch(() => { videoFailed = true; syncScreen(); render() }) }
    else video.pause()
    syncScreen()
  }
  video.addEventListener('loadeddata', () => { videoReady = true; syncVideo(); render() })
  video.addEventListener('error', () => { videoReady = false; videoFailed = true; syncScreen(); render() })
  const loader = new THREE.TextureLoader()
  for (const [i, name] of ['home', 'discover', 'partners', 'map'].entries()) {
    textures[i] = loader.load(`/promo/${name}.png`, texture => {
      if (disposed) { texture.dispose(); return }
      texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())
      syncScreen(); render()
    }, undefined, onFailure)
    textures[i].colorSpace = THREE.SRGBColorSpace
  }
  const resize = () => {
    const { width, height } = host.getBoundingClientRect()
    renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix(); render()
  }
  const observer = new ResizeObserver(resize); observer.observe(host); resize()
  const visibility = () => { syncVideo(); render() }
  document.addEventListener('visibilitychange', visibility)
  const lost = (e: Event) => { e.preventDefault(); onFailure() }
  renderer.domElement.addEventListener('webglcontextlost', lost)
  return {
    update(p: PhonePose, fromScreen: number, toScreen: number, mix: number, float = 0) {
      from = fromScreen; to = toScreen
      const screen = mix > .5 ? to : from
      phone.position.set(p.x, p.y + float, 0)
      phone.rotation.set(p.rx, p.ry, p.rz)
      phone.scale.setScalar(p.scale)
      shadow.position.set(p.x, p.y - 3.3 * p.scale, -.5)
      shadow.scale.setScalar(p.scale)
      if (screen !== active) { active = screen; syncVideo() }
      screenMaterial.uniforms.uMix.value = mix
      syncScreen()
      render()
    },
    setVisible(value: boolean) { visible = value; syncVideo() },
    setReduced(value: boolean) { if (reduce !== value) { reduce = value; syncVideo() } },
    dispose() {
      disposed = true; observer.disconnect(); document.removeEventListener('visibilitychange', visibility)
      video.pause(); video.removeAttribute('src'); video.load(); videoTexture.dispose()
      geometries.forEach(g => g.dispose()); new Set(materials).forEach(m => m.dispose())
      textures.forEach(t => t.dispose()); blank.dispose(); statusTexture.dispose(); shadowTexture.dispose(); shadowMaterial.dispose(); shadowGeometry.dispose()
      env.dispose(); renderer.dispose(); renderer.domElement.remove()
    },
  }
}
