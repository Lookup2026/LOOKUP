import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './stores/authStore'

// Pages
import Welcome from './pages/Welcome'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Onboarding from './pages/Onboarding'
import AddLook from './pages/AddLook'
import CrossingDetail from './pages/CrossingDetail'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Search from './pages/Search'
import LookDetail from './pages/LookDetail'
import Crossings from './pages/Crossings'
import Notifications from './pages/Notifications'
import CGU from './pages/CGU'
import Privacy from './pages/Privacy'

// Components
import Layout from './components/Layout'
import LoadingScreen from './components/LoadingScreen'

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace />
  }

  return children
}

function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}

// Composant pour gerer les liens de parrainage /join/:code
function JoinRedirect() {
  const { code } = useParams()

  useEffect(() => {
    if (code) {
      localStorage.setItem('referral_code', code.toUpperCase())
    }
  }, [code])

  return <Navigate to="/register" replace />
}

function App() {
  const { init, isLoading } = useAuthStore()

  useEffect(() => {
    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1A1A1A',
            color: '#fff',
            borderRadius: '100px',
            padding: '12px 24px',
          },
          success: {
            iconTheme: {
              primary: '#2D2D2D',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/welcome" element={
          <PublicRoute>
            <Welcome />
          </PublicRoute>
        } />
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        <Route path="/join/:code" element={<JoinRedirect />} />
        <Route path="/cgu" element={<CGU />} />
        <Route path="/privacy" element={<Privacy />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="onboarding" element={<Onboarding />} />
          <Route path="add-look" element={<AddLook />} />
          <Route path="edit-look/:id" element={<AddLook />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="crossings" element={<Crossings />} />
          <Route path="crossings/:id" element={<CrossingDetail />} />
          <Route path="look/:id" element={<LookDetail />} />
          <Route path="profile" element={<Profile />} />
          <Route path="search" element={<Search />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
