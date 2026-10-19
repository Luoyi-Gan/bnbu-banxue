import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { createCampusScene } from '../src/v2/campusScene'
import { fallbackCampusBuildings, resolveCampusLocation } from '../src/v2/campusLocations'

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers() })

describe('migrated campus viewer', () => {
  it('ships every imported runtime asset with a matching checksum', () => {
    const root = new URL('../public/campus-map/', import.meta.url)
    const manifest = JSON.parse(readFileSync(new URL('manifest.json', root), 'utf8'))
    expect(manifest.files.length).toBeGreaterThan(100)
    for (const file of manifest.files) {
      const bytes = readFileSync(new URL(file.file, root))
      expect(bytes.length, file.file).toBe(file.bytes)
      expect(createHash('sha256').update(bytes).digest('hex'), file.file).toBe(file.sha256)
    }
    const campus = JSON.parse(readFileSync(new URL('data/processed/viewer-campus.json', root), 'utf8'))
    expect(fallbackCampusBuildings.map(b => b.id)).toEqual(campus.buildings.map((b: { id: string }) => b.id))
  })

  it('restores unique selected building names and keeps ambiguous names unknown', () => {
    for (const building of fallbackCampusBuildings) {
      if (building.name.startsWith('未命名')) continue
      const count = fallbackCampusBuildings.filter(b => b.name === building.name).length
      expect(resolveCampusLocation(building.name + ' · 大门口'), building.name).toBe(count === 1 ? building.id : null)
    }
    expect(resolveCampusLocation('学习资源中心（一期）')).toBe('way/1215983507')
    expect(resolveCampusLocation('学习资源中心（二期）')).toBe('way/1459105119')
    expect(resolveCampusLocation('学习资源中心')).toBeNull()
  })

  it('accepts only messages from its own frame and releases listeners on close', () => {
    vi.useFakeTimers()
    const target = new EventTarget()
    const postMessage = vi.fn(), remove = vi.fn(), ready = vi.fn(), select = vi.fn(), error = vi.fn()
    const frame = { style: {}, setAttribute: vi.fn(), contentWindow: { postMessage }, remove }
    vi.stubGlobal('document', { createElement: () => frame })
    vi.stubGlobal('window', { location: { origin: 'http://localhost' }, setTimeout, addEventListener: target.addEventListener.bind(target), removeEventListener: target.removeEventListener.bind(target) })
    const scene = createCampusScene({ appendChild: vi.fn() } as unknown as HTMLDivElement, 'way/1', ready, select, error)
    const send = (data: object, origin = 'http://localhost', source: object = frame.contentWindow) => {
      const event = new Event('message')
      Object.assign(event, { data, origin, source })
      target.dispatchEvent(event)
    }
    const payload = { type: 'huitongli-map-ready', buildings: [{id:'way/1',name:'体育馆'}] }
    send(payload, 'https://other.example'); send(payload, 'http://localhost', {})
    expect(ready).not.toHaveBeenCalled()
    send(payload)
    expect(ready).toHaveBeenCalledWith(payload.buildings)
    expect(postMessage).toHaveBeenCalledWith({type:'huitongli-map-command',action:'focus',id:'way/1'}, 'http://localhost')
    send({type:'huitongli-map-selected',id:'unknown'})
    expect(select).not.toHaveBeenCalled()
    send({type:'huitongli-map-selected',id:'way/1'})
    expect(select).toHaveBeenCalledWith(payload.buildings[0])
    scene.dispose(); send(payload); vi.runAllTimers()
    expect(remove).toHaveBeenCalledOnce()
    expect(ready).toHaveBeenCalledOnce()
    expect(error).not.toHaveBeenCalled()
  })
})
