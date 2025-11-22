import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getSessionUser, logout } from '@/lib/storage'
import React from 'react'

export default function NavBar() {
  const nav = useNavigate()
  const loc = useLocation()
  const [user, setUser] = React.useState(getSessionUser())
  React.useEffect(() => {
    setUser(getSessionUser())
  }, [loc.pathname])
  return (
    <div className="nav">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link to="/" style={{ fontWeight: 800 }}>Security Patrol</Link>
        <span className="muted" style={{ fontSize: '0.9rem' }}>
          {user ? (user.role === 'admin' ? 'Admin' : 'Guard') : 'Guest'}
        </span>
      </div>
      <div>
        {!user && <Link to="/login">Login</Link>}
        {user?.role === 'admin' && (
          <>
            <Link to="/admin">Dashboard</Link>
            <Link to="/admin/guards">Guards</Link>
            <Link to="/admin/locations">Locations</Link>
            <Link to="/admin/reports">Reports</Link>
          </>
        )}
        {user?.role === 'guard' && (
          <Link to="/guard">Guard</Link>
        )}
        {user && (
          <button className="secondary" onClick={() => { logout(); setUser(null); nav('/login') }}>
            Logout
          </button>
        )}
      </div>
    </div>
  )
}

