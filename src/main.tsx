import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './app/App'
import './styles/base.css'
import './styles/redesign.css'
import './v2/referenceStudent.css'
import './v2/campusReference.css'
import './v2/reference/reference.css'
import './v2/reference/campusWindowPages.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
