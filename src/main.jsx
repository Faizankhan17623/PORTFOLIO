import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './portfolio.css'
import './lib/theme'
import App from './App.jsx'
import AdminPage from './components/AdminPage.jsx'

// Hidden admin page lives at /#/admin; the password check happens on the server.
const isAdminRoute = () => window.location.hash.startsWith('#/admin')

const startedOnAdmin = isAdminRoute()
window.addEventListener('hashchange', () => {
  if (isAdminRoute() !== startedOnAdmin) window.location.reload()
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdminRoute() ? <AdminPage /> : <App />}
  </StrictMode>,
)
