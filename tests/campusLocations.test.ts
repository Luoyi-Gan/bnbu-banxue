import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolveCampusLocation } from '../src/v2/campusLocations'

describe('activity building locations', () => {
  it('maps classroom, auditorium and sports labels to the imported model IDs', () => {
    expect(resolveCampusLocation('T4-105')).toBe('way/664093256')
    expect(resolveCampusLocation('T2 Auditorium')).toBe('way/664082908')
    expect(resolveCampusLocation('t3-301')).toBe('way/664082909')
    expect(resolveCampusLocation('Sports Center Court 3')).toBe('way/664082915')
    expect(resolveCampusLocation('Library Steps')).toBe('way/1215983507')
  })
  it('does not guess generic locations or confuse building codes', () => {
    for (const name of ['Innovation Hub', 'Lake Lawn', 'Campus North Gate', 'T299', 'T20-105', 'Fitness Studio', '']) expect(resolveCampusLocation(name)).toBeNull()
    expect(resolveCampusLocation('T29 教学楼')).toBe('way/664093294')
  })
  it('all mapped buildings exist in the actual bundled GLB', () => {
    const binary = readFileSync(new URL('../public/models/bnbu-campus.glb', import.meta.url))
    expect(binary.toString('ascii', 0, 4)).toBe('glTF')
    const gltf = JSON.parse(binary.toString('utf8', 20, 20 + binary.readUInt32LE(12)))
    const ids = new Set(gltf.nodes.map((node: { extras?: { id?: string } }) => node.extras?.id))
    for (const location of ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T29', '体育馆', 'Library', '大学会堂', '演艺厅', '东大门']) expect(ids.has(resolveCampusLocation(location))).toBe(true)
  })
})
