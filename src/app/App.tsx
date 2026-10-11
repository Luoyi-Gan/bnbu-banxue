import { Navigate, useLocation } from 'react-router-dom'
import { V2App } from '../v2/V2App'
import { ConnectedApp } from '../live/ConnectedApp'

export function App() {
  const { pathname } = useLocation()
  if (pathname === '/workspace' || pathname.startsWith('/workspace/')) return <ConnectedApp />
  if (pathname !== '/v2' && !pathname.startsWith('/v2/')) return <Navigate to="/workspace" replace />
  return <V2App />
}
