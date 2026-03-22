// ============================================================
//  context/AuthContext.jsx  — Global auth state
// ============================================================

import { createContext, useContext, useState, useEffect } from 'react'
import { getMe } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)   // { user_id, email, role, username, ... }
  const [loading, setLoading] = useState(true)

  // On mount: try to restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem('mess_token')
    if (!token) { setLoading(false); return }

    getMe()
      .then(setUser)
      .catch(() => { localStorage.removeItem('mess_token') })
      .finally(() => setLoading(false))
  }, [])

  // Called after successful login
  function saveLogin(token, userData) {
    localStorage.setItem('mess_token', token)
    setUser(userData)
  }

  // Called on logout
  function clearLogin() {
    localStorage.removeItem('mess_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, saveLogin, clearLogin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
