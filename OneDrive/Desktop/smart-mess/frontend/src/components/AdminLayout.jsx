// ============================================================
//  components/AdminLayout.jsx
//  Sidebar + top bar that wraps all admin pages
// ============================================================

import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/admin/mess',      icon: '🍽️',  label: 'Mess Config' },
  { to: '/admin/insights',  icon: '🤖', label: 'AI Insights' },
]

export default function AdminLayout() {
  const { admin, logoutAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logoutAdmin(); navigate('/admin/login') }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* ── Sidebar ─────────────────────────────────── */}
      <aside style={{
        width: 230, background: '#1C2B3A', color: '#fff',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>🍱 SmartMess</div>
          <div style={{ fontSize: 12, color: '#7F8C8D', marginTop: 4 }}>Admin Panel</div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {NAV.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8, marginBottom: 4,
              textDecoration: 'none', fontSize: 14, fontWeight: 500,
              color: isActive ? '#fff' : '#A0AEC0',
              background: isActive ? 'rgba(26,86,160,0.5)' : 'transparent',
              transition: 'all 0.15s',
            })}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Admin info + logout */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 12, color: '#7F8C8D', marginBottom: 4 }}>Logged in as</div>
          <div style={{ fontSize: 13, color: '#fff', marginBottom: 12,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {admin?.email}
          </div>
          <button className="btn btn-danger btn-sm btn-full" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* ── Main content area ────────────────────────── */}
      <main style={{ marginLeft: 230, flex: 1, padding: '28px 32px', minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  )
}
