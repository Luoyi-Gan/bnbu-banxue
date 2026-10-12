import { Navigate, useLocation } from 'react-router-dom'
import { V2App } from '../v2/V2App'
import { WorkspaceSportsPage } from '../live/WorkspaceSportsPage'

export function App() {
  const { pathname } = useLocation()
  if (pathname === '/workspace/sports') return <WorkspaceSportsPage/>
  if (pathname !== '/v2' && !pathname.startsWith('/v2/')) return <Navigate to="/v2" replace />
  return <V2App />
}
