import React from 'react'
import { login, getSessionUser } from '@/lib/storage'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const nav = useNavigate()
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  React.useEffect(() => {
    const u = getSessionUser()
    if (u) {
      nav(u.role === 'admin' ? '/admin' : '/guard', { replace: true })
    }
  }, [])
  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 420, margin: '2rem auto' }}>
        <h2>Login</h2>
        <p className="muted">Default admin: admin/admin123 ? guard: guard1/guard123</p>
        <div className="spacer" />
        <label>Username</label>
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="username" />
        <div className="spacer" />
        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password" />
        <div className="spacer" />
        {error && <div className="pill warn">{error}</div>}
        <div className="spacer" />
        <button onClick={() => {
          const res = login(username.trim(), password)
          if (!res.ok) {
            setError(res.message || 'Login failed')
          } else {
            nav(res.user!.role === 'admin' ? '/admin' : '/guard', { replace: true })
          }
        }}>Sign in</button>
      </div>
    </div>
  )
}

