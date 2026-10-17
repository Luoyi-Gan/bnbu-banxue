import { Navigate, useLocation } from 'react-router-dom'
import { V2App } from '../v2/V2App'
import { ConnectedApp } from '../live/ConnectedApp'
import { LocalPreviewNotice } from '../v2/preview/LocalPreviewNotice'

export function App() {
  const { pathname } = useLocation()
  if (pathname === '/') return <Navigate to="/v2/welcome" replace />
  if (pathname === '/workspace' || pathname.startsWith('/workspace/')) return <ConnectedApp />
  if (pathname !== '/v2' && !pathname.startsWith('/v2/')) return <Navigate to="/workspace" replace />
  return <>{Boolean(import.meta.hot) && <LocalPreviewNotice/>}<V2App /></>
}
