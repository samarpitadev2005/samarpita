import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/instrument-serif/400.css'
import '@fontsource/instrument-serif/400-italic.css'
import '@fontsource-variable/manrope'
import '../index.css'
import AdminApp from './AdminApp.jsx'
import { markReady } from '../lib/ready'

markReady()

// The admin panel is its own page (admin.html), separate from the public website bundle
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AdminApp />
  </React.StrictMode>,
)
