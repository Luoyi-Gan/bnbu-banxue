// Browser coordinates stay inside the map frame. Only status and accuracy reach the host.
export function bindCampusLocation({ button, geolocation, secure, lifecycle, onPosition, onClear, onState }) {
  let active = false, pending = false, generation = 0, disposed = false
  const emit = (state, accuracy) => {
    button.disabled = state === 'locating'
    button.setAttribute('aria-pressed', String(state === 'located'))
    button.title = state === 'located' ? '清除位置' : '定位我的位置'
    button.classList.toggle('active', state === 'located')
    onState({ state, ...(accuracy === undefined ? {} : { accuracy }) })
  }
  const clear = () => {
    generation++; pending = false; active = false
    onClear()
    if (!disposed) emit('idle')
  }
  const request = () => {
    if (disposed || pending) return
    if (active) { clear(); return }
    if (!secure) { emit('insecure'); return }
    if (!geolocation) { emit('unsupported'); return }
    const token = ++generation
    pending = true; emit('locating')
    const fail = error => {
      if (disposed || token !== generation) return
      pending = false
      onClear()
      emit(({ 1: 'denied', 2: 'unavailable', 3: 'timeout' })[error.code] || 'unavailable')
    }
    try {
      geolocation.getCurrentPosition(position => {
        if (disposed || token !== generation) return
        pending = false
        const { latitude, longitude, accuracy } = position.coords
        if (![latitude, longitude, accuracy].every(Number.isFinite) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180 || accuracy < 0) { fail({ code: 2 }); return }
        if (accuracy > 300) { onClear(); emit('imprecise'); return }
        if (!onPosition(position)) { onClear(); emit('outside'); return }
        active = true; emit('located', Math.round(accuracy))
      }, fail, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 })
    } catch { fail({ code: 2 }) }
  }
  button.onclick = request
  lifecycle.addEventListener('pagehide', clear)
  return { clear, dispose: () => { disposed = true; clear(); button.onclick = null; lifecycle.removeEventListener('pagehide', clear) } }
}

export function adaptCampusLocation(contents, modulePath) {
  const start = contents.indexOf('  gps.onclick=async()=>{')
  const endMarker = "  window.addEventListener('pagehide',stopLocation);"
  const end = contents.indexOf(endMarker, start)
  const callbackStart = contents.indexOf('      const xy=localCoordinates', start)
  const callbackEnd = contents.indexOf('    },error=>', callbackStart)
  if ([start, end, callbackStart, callbackEnd].some(index => index < 0)) throw Error('Campus location adapter source no longer matches')
  let callback = contents.slice(callbackStart, callbackEnd)
  callback = callback.replace(/if\(Math\.hypot\(\.\.\.xy\)>5000\)\{.*?return;\}/, 'if(Math.hypot(...xy)>5000)return false;')
  callback = callback.replace(/if\(first\)\{first=false;.*?\}refresh\(\);/, "focusPoint({centroid:xy,phase:'all',labelHeight:0},500);refresh();return true;")
  const replacement = `
  let locationView=null,locationUsed=false;
  bindCampusLocation({button:gps,geolocation:navigator.geolocation,secure:window.isSecureContext,lifecycle:window,
    onClear:()=>{stopLocation();if(locationView){restoreView(locationView);locationView=null;}},
    onState:value=>parent.postMessage({type:'huitongli-map-location',...value},window.location.origin),
    onPosition:position=>{locationUsed=true;locationView=getView();${callback}}
  });
`
  contents = contents.slice(0, start) + replacement + contents.slice(end + endMarker.length)
  contents = contents.replace('function saveView(){if(restoring)return;', 'function saveView(){if(restoring||locationUsed)return;')
  return `import {bindCampusLocation} from ${JSON.stringify(modulePath)};\n` + contents
}
