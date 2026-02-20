import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './pwa.css'
import { initAutofillFix } from './utils/autofillFix.js'

// Initialize autofill fix
initAutofillFix()

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

