import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

const el = document.getElementById('root')
const app = (
  <StrictMode>
    <BrowserRouter basename="/">
      <App />
    </BrowserRouter>
  </StrictMode>
)

// Prerendered deep-links ship real markup inside #root — hydrate it (don't re-mount).
// The plain dev/SPA entry ships an empty #root — mount fresh with createRoot.
if (el.hasChildNodes()) {
  hydrateRoot(el, app)
} else {
  createRoot(el).render(app)
}
