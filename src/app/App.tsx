import { Navigate, useLocation } from 'react-router-dom'
import { V2App } from '../v2/V2App'
import { ConnectedApp } from '../live/ConnectedApp'
import { LocalPreviewNotice } from '../v2/preview/LocalPreviewNotice'
import { ProductPage } from '../marketing/ProductPage'

export function App() {
  const { pathname } = useLocation()
  if (pathname === '/' || pathname === '/intro') return <ProductPage />
  if (pathname === '/workspace' || pathname.startsWith('/workspace/')) return <ConnectedApp />
  if (pathname !== '/v2' && !pathname.startsWith('/v2/')) return <Navigate to="/workspace" replace />
  return <>{Boolean(import.meta.hot) && <LocalPreviewNotice/>}<V2App /></>
}
