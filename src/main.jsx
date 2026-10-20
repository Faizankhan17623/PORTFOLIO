import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './portfolio.css'
import './scenes.css'
import './effects.css'
import './lib/theme'
import App from './App.jsx'

const root = createRoot(document.getElementById('root'))
// The private page lives at /admin by default. Setting VITE_PRIVATE_PATH (for example in Vercel) moves it, so the
// real address never has to be written in the public repository.
const privatePath = `/${import.meta.env.VITE_PRIVATE_PATH || 'admin'}`.replace(/\/{2,}/g, '/').replace(/\/+$/, '')
const isPrivateRoute = window.location.pathname.replace(/\/+$/, '') === privatePath

// The private page is its own chunk, so it is never downloaded by regular visitors.
if (isPrivateRoute) {
  document.getElementById('boot')?.remove() // the boot screen in index.html is only for the public site
  import('./components/AdminPage.jsx').then((mod) => {
    const AdminPage = mod.default
    root.render(<StrictMode><AdminPage /></StrictMode>)
  })
} else {
  import('./components/three/HeroScene.jsx') // start downloading the 3D scene right away instead of after the page is up
  root.render(<StrictMode><App /></StrictMode>)
}
