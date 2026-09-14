import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx'
import './index.css'

// Clear stale PWA caches that may still hold the old custom favicon
if ('serviceWorker' in navigator) {
  void caches.keys().then((keys) =>
    Promise.all(
      keys
        .filter((k) => /workbox|pwa|favicon|icon/i.test(k) || k.includes('precache'))
        .map((k) => caches.delete(k)),
    ),
  )
}

registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
