import React from 'react'
import { deleteUser, listUsers, upsertUser, getSessionUser } from '@/lib/storage'
import { useNavigate } from 'react-router-dom'

export default function AdminGuards() {
  const nav = useNavigate()
  const me = getSessionUser()
  React.useEffect(() => {
    if (!me || me.role !== 'admin') nav('/login', { replace: true })
  }, [])
  const [username, setUsername] = React.useState('')
  const [fullName, setFullName] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [active, setActive] = React.useState(true)
  const [guards, setGuards] = React.useState(listUsers('guard'))

  function refresh() {
    setGuards(listUsers('guard'))
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col">
          <div className="card">
            <h2>Manage Guards</h2>
            <div className="grid two">
              <div>
                <label>Username</label>
                <input value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. guard3" />
              </div>
              <div>
                <label>Full name</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Alex Strom" />
              </div>
              <div>
                <label>Password</label>
                <input value={password} onChange={e => setPassword(e.target.value)} placeholder="set or leave blank to keep" />
              </div>
              <div>
                <label>Status</label>
                <select value={active ? 'active' : 'inactive'} onChange={e => setActive(e.target.value === 'active')}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="spacer" />
            <div className="actions">
              <button onClick={() => {
                if (!username || !fullName) return
                upsertUser({ username: username.trim(), fullName: fullName.trim(), role: 'guard', password: password || undefined, active })
                setUsername(''); setFullName(''); setPassword(''); setActive(true); refresh()
              }}>Save Guard</button>
              <button className="secondary" onClick={() => { setUsername(''); setFullName(''); setPassword(''); setActive(true) }}>Reset</button>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <div className="card">
            <h3>All Guards</h3>
            <table className="table">
              <thead>
                <tr><th>Username</th><th>Name</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {guards.map(g => (
                  <tr key={g.id}>
                    <td>{g.username}</td>
                    <td>{g.fullName}</td>
                    <td>{g.active ? <span className="pill success">Active</span> : <span className="pill warn">Inactive</span>}</td>
                    <td className="actions">
                      <button className="secondary" onClick={() => {
                        setUsername(g.username)
                        setFullName(g.fullName)
                        setPassword('')
                        setActive(g.active)
                      }}>Edit</button>
                      <button className="danger" onClick={() => { if (confirm('Delete guard?')) { deleteUser(g.username); refresh() } }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

