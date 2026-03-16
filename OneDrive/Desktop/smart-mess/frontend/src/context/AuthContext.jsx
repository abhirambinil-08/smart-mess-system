// ============================================================
//  context/AuthContext.jsx  — Global login state
//  Wrap <App> with this so every page knows if admin is logged in
// ============================================================

import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)       // null = not logged in
  const [loading, setLoading] = useState(true)   // checking localStorage on startup

  useEffect(() => {
    // On page refresh, restore login from localStorage
    const token = localStorage.getItem('mess_token')
    const email = localStorage.getItem('mess_email')
    const role  = localStorage.getItem('mess_role')
    if (token && email) setAdmin({ token, email, role })
    setLoading(false)
  }, [])

  const loginAdmin = (tokenData) => {
    localStorage.setItem('mess_token', tokenData.access_token)
    localStorage.setItem('mess_email', tokenData.admin_email)
    localStorage.setItem('mess_role',  tokenData.role)
    setAdmin({ token: tokenData.access_token, email: tokenData.admin_email, role: tokenData.role })
  }

  const logoutAdmin = () => {
    localStorage.removeItem('mess_token')
    localStorage.removeItem('mess_email')
    localStorage.removeItem('mess_role')
    setAdmin(null)
  }

  return (
    <AuthContext.Provider value={{ admin, loading, loginAdmin, logoutAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook — use this in any component: const { admin, logoutAdmin } = useAuth()
export const useAuth = () => useContext(AuthContext)
