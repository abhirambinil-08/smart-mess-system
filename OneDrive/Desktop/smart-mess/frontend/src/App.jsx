// ============================================================
//  App.jsx  — Router setup
//  Public route: /  (feedback form)
//  Admin routes: /admin/login, /admin/dashboard, /admin/mess,
//                /admin/insights
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import FeedbackPage  from './pages/FeedbackPage'
import LoginPage     from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import MessPage      from './pages/MessPage'
import InsightsPage  from './pages/InsightsPage'
import AdminLayout   from './components/AdminLayout'

// Protect admin routes — redirect to login if not logged in
function PrivateRoute({ children }) {
  const { admin, loading } = useAuth()
  if (loading) return <div className="page-loader"><div className="spinner spinner-dark" /></div>
  return admin ? children : <Navigate to="/admin/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"             element={<FeedbackPage />} />
          <Route path="/admin/login"  element={<LoginPage />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
            <Route index                element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"    element={<DashboardPage />} />
            <Route path="mess"         element={<MessPage />} />
            <Route path="insights"     element={<InsightsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
