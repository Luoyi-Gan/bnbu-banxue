// Browser coordinates stay inside the map frame. Only status and accuracy reach the host.
export function bindCampusLocation({ button, geolocation, secure, lifecycle, onPosition, onClear, onState }) {
  let active = false, pending = false, generation = 0, disposed = false
  const emit = (state, accuracy) => {
    button.disabled = false
    button.setAttribute('aria-pressed', String(state === 'located'))
    button.title = state === 'located' ? '清除位置' : ['locating','refining'].includes(state) ? '取消定位' : '定位我的位置'
    button.classList.toggle('active', state === 'located')
    onState({ state, ...(accuracy === undefined ? {} : { accuracy }) })
  }
  const clear = () => {
    generation++; pending = false; active = false
    onClear()
    if (!disposed) emit('idle')
  }
  const request = () => {
    if (disposed) return
    if (active || pending) { clear(); return }
    if (!secure) { emit('insecure'); return }
    if (!geolocation) { emit('unsupported'); return }
    const token = ++generation
    pending = true; emit('locating')
    let candidate = null
    const current = () => !disposed && token === generation
    const accept = position => {
      if (!current()) return
      pending = false
      const accuracy = position.coords.accuracy
      if (accuracy > 1000) { onClear(); emit('imprecise'); return }
      if (!onPosition(position)) { onClear(); emit('outside'); return }
      active = true; emit('located', Math.round(accuracy))
    }
    const attempt = highAccuracy => {
      if (!current()) return
      const fail = error => {
        if (!current()) return
        if (error.code !== 1 && !highAccuracy) { emit('refining'); attempt(true); return }
        if (candidate && error.code !== 1) { accept(candidate); return }
        pending = false; onClear()
        emit(({ 1: 'denied', 2: 'unavailable', 3: 'timeout' })[error.code] || 'unavailable')
      }
      try {
        geolocation.getCurrentPosition(position => {
          if (!current()) return
          const { latitude, longitude, accuracy } = position.coords
          if (![latitude, longitude, accuracy].every(Number.isFinite) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180 || accuracy < 0) { fail({ code: 2 }); return }
          if (!highAccuracy && accuracy > 300) { candidate = position; emit('refining'); attempt(true); return }
          accept(candidate && candidate.coords.accuracy < accuracy ? candidate : position)
        }, fail, { enableHighAccuracy: highAccuracy, timeout: highAccuracy ? 25000 : 10000, maximumAge: highAccuracy ? 0 : 30000 })
      } catch { fail({ code: 2 }) }
    }
    attempt(false)
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
  callback = callback.replace('Math.min(300,Math.max(3,position.coords.accuracy))', 'Math.max(3,position.coords.accuracy)')
  callback = callback.replace(/if\(first\)\{first=false;.*?\}refresh\(\);/, "focusPoint({centroid:xy,phase:'all',labelHeight:0},500);refresh();return true;")
  const replacement = `
  let locationView=null,locationUsed=false;
  bindCampusLocation({button:gps,geolocation:(window.parent.navigator.geolocation),secure:window.isSecureContext,lifecycle:window,
    onClear:()=>{stopLocation();if(locationView){restoreView(locationView);locationView=null;}},
    onState:value=>parent.postMessage({type:'huitongli-map-location',...value},window.location.origin),
    onPosition:position=>{locationUsed=true;locationView=getView();${callback}}
  });
`
  contents = contents.slice(0, start) + replacement + contents.slice(end + endMarker.length)
  contents = contents.replace('function saveView(){if(restoring)return;', 'function saveView(){if(restoring||locationUsed)return;')
  return `import {bindCampusLocation} from ${JSON.stringify(modulePath)};\n` + contents
}
