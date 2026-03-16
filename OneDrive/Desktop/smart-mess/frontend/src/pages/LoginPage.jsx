// ============================================================
//  pages/LoginPage.jsx  — Admin login form
// ============================================================

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../utils/api'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { loginAdmin } = useAuth()
  const navigate       = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const handleLogin = async () => {
    if (!email || !password) { setError('Please enter email and password.'); return }
    setLoading(true); setError('')
    try {
      const data = await login(email, password)
      loginAdmin(data)
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1C2B3A 0%, #1A56A0 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>

      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', color: '#fff', marginBottom: 28 }}>
          <div style={{ fontSize: 52 }}>🍱</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '8px 0 4px' }}>Admin Login</h1>
          <p style={{ opacity: 0.7, fontSize: 14 }}>Smart Mess Feedback System</p>
        </div>

        <div className="card">
          {error && <div className="alert alert-error" style={{ marginBottom: 18 }}>{error}</div>}

          <div className="form-group">
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="admin@example.com"
              value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>

          <div className="form-group">
            <label className="label">Password</label>
            <input className="input" type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>

          <button className="btn btn-primary btn-full" onClick={handleLogin} disabled={loading}
            style={{ padding: '13px', fontSize: 15, marginTop: 4 }}>
            {loading ? <><span className="spinner" /> Logging in...</> : '🔐 Login'}
          </button>

          <p style={{ fontSize: 12, color: 'var(--grey)', textAlign: 'center', marginTop: 16 }}>
            First time? Call <code>POST /api/auth/setup</code> to create admin account.
          </p>
        </div>
      </div>
    </div>
  )
}
