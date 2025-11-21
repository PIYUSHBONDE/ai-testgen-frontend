import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // <--- IMPORT THIS
import './index.css'
import App from './App.jsx'
import AuthProvider from './context/AuthContext'
import { ToastProvider } from './components/ToastProvider'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* <--- WRAP APP IN THIS */}
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)