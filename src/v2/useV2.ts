import { useContext } from 'react'
import { V2Context } from './context'

export function useV2() {
  const context = useContext(V2Context)
  if (!context) throw new Error('V2Provider missing')
  return context
}
