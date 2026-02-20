import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import PrivateRoute from './components/PrivateRoute'
import AnimatedPage from './components/AnimatedPage'
import { ToastContainer } from './components/Toast'
import { useToast } from './hooks/useToast'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import VerifyEmail from './pages/VerifyEmail'
import Dashboard from './pages/Dashboard'
import './App.css'

function AppContent() {
  const { toasts, removeToast } = useToast()

  return (
    <>
      <Router>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/login" element={<AnimatedPage><Login /></AnimatedPage>} />
            <Route path="/register" element={<AnimatedPage><Register /></AnimatedPage>} />
            <Route path="/verify-email" element={<AnimatedPage><VerifyEmail /></AnimatedPage>} />
            <Route path="/forgot-password" element={<AnimatedPage><ForgotPassword /></AnimatedPage>} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <AnimatedPage><Dashboard /></AnimatedPage>
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AnimatePresence>
      </Router>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
