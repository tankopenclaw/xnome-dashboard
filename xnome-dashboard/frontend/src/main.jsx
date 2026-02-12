import React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { I18NProvider } from './lib/i18n.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <I18NProvider>
      <App />
    </I18NProvider>
  </React.StrictMode>
)
