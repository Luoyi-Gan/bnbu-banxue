import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { CampusBuilding } from './campusLocations'

export function createCampusScene(host: HTMLDivElement, activityId: string | null, onReady: (buildings: CampusBuilding[]) => void, onSelect: (building: CampusBuilding) => void, onError: () => void) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6))
  renderer.setClearColor('#edf2f5')
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.domElement.setAttribute('aria-label', 'BNBU 三维校园，拖动旋转，滚轮缩放，点击楼栋查看名称')
  renderer.domElement.setAttribute('role', 'img')
  host.appendChild(renderer.domElement)
  const scene = new THREE.Scene()
  scene.add(new THREE.HemisphereLight(0xffffff, 0x75889a, 2.5))
  const sun = new THREE.DirectionalLight(0xfff5e5, 3)
  sun.position.set(400, 900, 300)
  scene.add(sun)
  const camera = new THREE.PerspectiveCamera(40, 1, 1, 12000)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.09
  controls.maxPolarAngle = Math.PI * 0.47
  controls.minDistance = 55
  controls.maxDistance = 3200
  const buildings = new Map<string, { info: CampusBuilding; meshes: THREE.Mesh[]; box: THREE.Box3 }>()
  const original = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>()
  const orange = new THREE.MeshStandardMaterial({ color: '#ff8735', roughness: 0.65, emissive: '#b84b08', emissiveIntensity: 0.16 })
  const blue = new THREE.MeshStandardMaterial({ color: '#3179ed', roughness: 0.65, emissive: '#1649ad', emissiveIntensity: 0.12 })
  let model: THREE.Group | undefined
  let disposed = false
  let frame = 0
  let selected: string | null = null
  let moving: { start: number; from: THREE.Vector3; to: THREE.Vector3; fromTarget: THREE.Vector3; toTarget: THREE.Vector3 } | null = null
  const overviewTarget = new THREE.Vector3()
  const overviewPosition = new THREE.Vector3()
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const render = () => {
    frame = 0
    if (disposed) return
    if (moving) {
      const t = Math.min((performance.now() - moving.start) / 700, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      camera.position.lerpVectors(moving.from, moving.to, eased)
      controls.target.lerpVectors(moving.fromTarget, moving.toTarget, eased)
      if (t === 1) moving = null
    }
    const changed = controls.update()
    renderer.render(scene, camera)
    if (changed || moving) invalidate()
  }
  function invalidate() { if (!frame && !disposed) frame = requestAnimationFrame(render) }
  controls.addEventListener('change', invalidate)
  const stopMotion = () => { moving = null }
  controls.addEventListener('start', stopMotion)
  const resize = () => {
    const { width, height } = host.getBoundingClientRect()
    if (!width || !height) return
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    invalidate()
  }
  const observer = new ResizeObserver(resize)
  observer.observe(host)
  const fly = (position: THREE.Vector3, target: THREE.Vector3) => {
    if (reducedMotion) { camera.position.copy(position); controls.target.copy(target) }
    else moving = { start: performance.now(), from: camera.position.clone(), to: position, fromTarget: controls.target.clone(), toTarget: target }
    invalidate()
  }
  const paint = () => {
    for (const [id, entry] of buildings) for (const mesh of entry.meshes) {
      mesh.material = id === activityId ? orange : id === selected ? blue : original.get(mesh)!
    }
    invalidate()
  }
  const focus = (id: string) => {
    const entry = buildings.get(id)
    if (!entry) return
    selected = id
    paint()
    onSelect(entry.info)
    const center = entry.box.getCenter(new THREE.Vector3())
    const distance = Math.max(entry.box.getSize(new THREE.Vector3()).length() * 2, 230)
    fly(center.clone().add(new THREE.Vector3(distance * 0.55, distance * 0.85, distance * 0.7)), center)
  }
  const disposeModel = (group: THREE.Group) => {
    const materials = new Set<THREE.Material>()
    const textures = new Set<THREE.Texture>()
    group.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return
      object.geometry.dispose()
      const material = original.get(object) ?? object.material
      for (const value of Array.isArray(material) ? material : [material]) materials.add(value)
    })
    for (const material of materials) {
      for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value)
      material.dispose()
    }
    for (const texture of textures) texture.dispose()
  }
  new GLTFLoader().load('/models/bnbu-campus.glb', (gltf) => {
    if (disposed) { disposeModel(gltf.scene); return }
    model = gltf.scene
    scene.add(model)
    model.updateMatrixWorld(true)
    model.traverse((object) => {
      if (object.userData.kind === 'building' && object.userData.id) {
        buildings.set(object.userData.id, { info: { id: object.userData.id, name: object.userData.name }, meshes: [], box: new THREE.Box3().setFromObject(object) })
      }
    })
    model.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return
      let parent: THREE.Object3D | null = object
      while (parent && !parent.userData.id && !parent.userData.building_id) parent = parent.parent
      const id = parent?.userData.building_id ?? parent?.userData.id
      const entry = buildings.get(id)
      if (!entry) return
      object.userData.campusBuildingId = id
      original.set(object, object.material)
      entry.meshes.push(object)
    })
    const box = new THREE.Box3().setFromObject(model)
    box.getCenter(overviewTarget)
    const size = box.getSize(new THREE.Vector3()).length()
    overviewPosition.copy(overviewTarget).add(new THREE.Vector3(size * 0.75, size * 1.5, size * 1.3))
    camera.position.copy(overviewPosition)
    controls.target.copy(overviewTarget)
    paint()
    resize()
    onReady([...buildings.values()].map((entry) => entry.info).sort((a, b) => a.name.localeCompare(b.name, 'zh-CN')))
    if (activityId) focus(activityId)
  }, undefined, () => { if (!disposed) onError() })
  const pointer = new THREE.Vector2()
  const raycaster = new THREE.Raycaster()
  let down = { x: 0, y: 0 }
  const pointerDown = (event: PointerEvent) => { down = { x: event.clientX, y: event.clientY } }
  const pointerUp = (event: PointerEvent) => {
    if (event.button !== 0 || Math.hypot(event.clientX - down.x, event.clientY - down.y) > 5 || !model) return
    const rect = renderer.domElement.getBoundingClientRect()
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1)
    raycaster.setFromCamera(pointer, camera)
    const hit = raycaster.intersectObject(model, true).find((item) => item.object.userData.campusBuildingId)
    if (hit) focus(hit.object.userData.campusBuildingId)
  }
  const contextLost = (event: Event) => { event.preventDefault(); onError() }
  renderer.domElement.addEventListener('pointerdown', pointerDown)
  renderer.domElement.addEventListener('pointerup', pointerUp)
  renderer.domElement.addEventListener('webglcontextlost', contextLost)
  resize()
  return {
    focus,
    overview: () => fly(overviewPosition.clone(), overviewTarget.clone()),
    dispose: () => {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      controls.dispose()
      renderer.domElement.removeEventListener('pointerdown', pointerDown)
      renderer.domElement.removeEventListener('pointerup', pointerUp)
      renderer.domElement.removeEventListener('webglcontextlost', contextLost)
      if (model) disposeModel(model)
      orange.dispose(); blue.dispose(); renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
