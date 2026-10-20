import { describe, expect, it, vi } from 'vitest'
import { bindCampusLocation, adaptCampusLocation } from '../scripts/campus-map-location.mjs'

function setup({ secure = true, supported = true } = {}) {
  const button = { disabled: false, title: '', onclick: null as null | (() => void), setAttribute: vi.fn(), classList: { toggle: vi.fn() } }
  const geo = { getCurrentPosition: vi.fn() }
  const lifecycle = new EventTarget()
  const onPosition = vi.fn(() => true), onClear = vi.fn(), onState = vi.fn()
  const controller = bindCampusLocation({ button, geolocation: supported ? geo : null, secure, lifecycle, onPosition, onClear, onState })
  const request = () => button.onclick?.()
  const succeed = (accuracy = 15) => geo.getCurrentPosition.mock.calls[0][0]({ coords: { longitude: 113.513, latitude: 22.358, accuracy } })
  return { button, geo, lifecycle, onPosition, onClear, onState, controller, request, succeed }
}

describe('campus map location', () => {
  it('only requests on click, uses a single fresh fix, and publishes status without coordinates', () => {
    const s = setup()
    expect(s.geo.getCurrentPosition).not.toHaveBeenCalled()
    s.request(); s.request()
    expect(s.geo.getCurrentPosition).toHaveBeenCalledOnce()
    expect(s.geo.getCurrentPosition.mock.calls[0][2]).toEqual({ enableHighAccuracy: true, timeout: 15000, maximumAge: 0 })
    s.succeed()
    expect(s.onPosition).toHaveBeenCalledOnce()
    expect(s.onState).toHaveBeenLastCalledWith({ state: 'located', accuracy: 15 })
    expect(s.button.disabled).toBe(false)
    s.request()
    expect(s.onClear).toHaveBeenCalledOnce()
    expect(s.onState).toHaveBeenLastCalledWith({ state: 'idle' })
    expect(s.geo.getCurrentPosition).toHaveBeenCalledOnce()
  })
  it.each([[1, 'denied'], [2, 'unavailable'], [3, 'timeout']])('handles error %s with retry', (code, state) => {
    const s = setup(); s.request()
    s.geo.getCurrentPosition.mock.calls[0][1]({ code })
    expect(s.onState).toHaveBeenLastCalledWith({ state })
    expect(s.onPosition).not.toHaveBeenCalled()
    expect(s.button.disabled).toBe(false)
    s.request(); expect(s.geo.getCurrentPosition).toHaveBeenCalledTimes(2)
  })
  it('clears and ignores delayed results after leaving, clearing, or disposing', () => {
    for (const action of ['pagehide', 'clear', 'dispose']) {
      const s = setup(); s.request()
      if (action === 'pagehide') s.lifecycle.dispatchEvent(new Event('pagehide'))
      else s.controller[action]()
      s.succeed()
      expect(s.onPosition).not.toHaveBeenCalled()
      expect(s.onClear).toHaveBeenCalledOnce()
    }
  })
  it('keeps unsupported, insecure, inaccurate and off-map fixes from creating a marker', () => {
    const unsupported = setup({ supported: false }); unsupported.request()
    expect(unsupported.onState).toHaveBeenLastCalledWith({ state: 'unsupported' })
    const insecure = setup({ secure: false }); insecure.request()
    expect(insecure.onState).toHaveBeenLastCalledWith({ state: 'insecure' })
    expect(insecure.geo.getCurrentPosition).not.toHaveBeenCalled()
    const imprecise = setup(); imprecise.request(); imprecise.succeed(500)
    expect(imprecise.onPosition).not.toHaveBeenCalled()
    expect(imprecise.onState).toHaveBeenLastCalledWith({ state: 'imprecise' })
    const outside = setup(); outside.onPosition.mockReturnValue(false); outside.request(); outside.succeed()
    expect(outside.onState).toHaveBeenLastCalledWith({ state: 'outside' })
  })
  it('rejects malformed fixes and handles a throwing location API', () => {
    const invalid = setup(); invalid.request(); invalid.succeed(NaN)
    expect(invalid.onPosition).not.toHaveBeenCalled()
    expect(invalid.onState).toHaveBeenLastCalledWith({ state: 'unavailable' })
    const throwing = setup(); throwing.geo.getCurrentPosition.mockImplementation(() => { throw Error('blocked') }); throwing.request()
    expect(throwing.onState).toHaveBeenLastCalledWith({ state: 'unavailable' })
  })
  it('fails the importer explicitly if the source adapter boundary changes', () => {
    expect(() => adaptCampusLocation('different source', '/controller.mjs')).toThrow('source no longer matches')
  })
})
