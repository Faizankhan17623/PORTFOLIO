import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './portfolio.css'
import './lib/theme'
import App from './App.jsx'

const root = createRoot(document.getElementById('root'))
const isPrivateRoute = window.location.pathname.replace(/\/+$/, '') === '/admin'

// The private page is its own chunk, so it is never downloaded by regular visitors.
if (isPrivateRoute) {
  import('./components/AdminPage.jsx').then((mod) => {
    const AdminPage = mod.default
    root.render(<StrictMode><AdminPage /></StrictMode>)
  })
} else {
  root.render(<StrictMode><App /></StrictMode>)
}
