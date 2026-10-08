import { Navigate, useLocation } from 'react-router-dom'
import { V2App } from '../v2/V2App'

export function App() {
  const { pathname } = useLocation()
  if (pathname !== '/v2' && !pathname.startsWith('/v2/')) return <Navigate to="/v2" replace />
  return <V2App />
}
