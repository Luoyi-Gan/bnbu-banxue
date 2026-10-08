import { createContext, type Dispatch, type SetStateAction } from 'react'
import type { V2State } from './model'

export interface V2ContextValue { state: V2State; setState: Dispatch<SetStateAction<V2State>>; reset: () => void }
export const V2Context = createContext<V2ContextValue | null>(null)
