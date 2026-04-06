import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import ExpertModePage from './pages/ExpertModePage'
import StartupModePage from './pages/StartupModePage'
import DashboardPage from './pages/DashboardPage'
import InsightsPage from './pages/InsightsPage'
import ProfilePage from './pages/ProfilePage'
import AdminDashboard from './pages/AdminDashboard'
import StartupHistoryPage from './pages/StartupHistoryPage'
import NotificationHistoryPage from './pages/NotificationHistoryPage'
import { clearToken } from './api/client'

function PrivateRoute({ children }) {
  const token = sessionStorage.getItem('tf_access_token')
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  const [user, setUser] = useState(sessionStorage.getItem('tf_user') || null)

  const handleLogin = (username, token) => {
    sessionStorage.setItem('tf_user', username)
    setUser(username)
  }

  const handleLogout = () => {
    clearToken()
    sessionStorage.removeItem('tf_user')
    setUser(null)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={<RegisterPage onRegister={handleLogin} />} />
        <Route path="/app" element={
          <PrivateRoute>
            <HomePage user={user} onLogout={handleLogout} />
          </PrivateRoute>
        } />
        <Route path="/expert" element={
          <PrivateRoute>
            <ExpertModePage user={user} onLogout={handleLogout} />
          </PrivateRoute>
        } />
        <Route path="/startup" element={
          <PrivateRoute>
            <StartupModePage user={user} onLogout={handleLogout} />
          </PrivateRoute>
        } />
        <Route path="/startup-history" element={
          <PrivateRoute>
            <StartupHistoryPage user={user} onLogout={handleLogout} />
          </PrivateRoute>
        } />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <DashboardPage user={user} onLogout={handleLogout} />
          </PrivateRoute>
        } />
        <Route path="/insights" element={
          <PrivateRoute>
            <InsightsPage user={user} onLogout={handleLogout} />
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <ProfilePage user={user} onLogout={handleLogout} />
          </PrivateRoute>
        } />
        <Route path="/admin" element={
          <PrivateRoute>
            <AdminDashboard user={user} onLogout={handleLogout} />
          </PrivateRoute>
        } />
        <Route path="/notifications" element={
          <PrivateRoute>
            <NotificationHistoryPage user={user} onLogout={handleLogout} />
          </PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
