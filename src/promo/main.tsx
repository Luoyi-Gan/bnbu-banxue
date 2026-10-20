import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Promo } from './Promo'
import './promo.css'

createRoot(document.getElementById('root')!).render(<StrictMode><Promo /></StrictMode>)
