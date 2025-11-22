import React from 'react'
import { getSessionUser, listLocations, listPatrolsByDate, listUsers, patrolRequirement, todayIso } from '@/lib/storage'
import MapView from '@/components/MapView'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const nav = useNavigate()
  const user = getSessionUser()
  const [date, setDate] = React.useState(todayIso())
  React.useEffect(() => {
    if (!user || user.role !== 'admin') nav('/login', { replace: true })
  }, [])
  const guards = listUsers('guard')
  const locations = listLocations()
  const patrols = listPatrolsByDate(date)
  const doneByGuard = new Map<string, number>()
  for (const g of guards) doneByGuard.set(g.id, 0)
  for (const p of patrols) if (p.status === 'completed') doneByGuard.set(p.guardId, (doneByGuard.get(p.guardId) || 0) + 1)
  const required = patrolRequirement()
  const center = locations[0] ? { lat: locations[0].latitude, lng: locations[0].longitude } : { lat: 37.422, lng: -122.084 }
  const points = patrols.map(p => ({ lat: p.gps.latitude, lng: p.gps.longitude, label: `${p.id} (${p.status})` }))

  return (
    <div className="container">
      <div className="row">
        <div className="col">
          <div className="card">
            <h2>Admin Dashboard</h2>
            <div className="spacer" />
            <label>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            <div className="grid three" style={{ marginTop: '1rem' }}>
              <div className="card">
                <div className="section-title">Guards</div>
                <div style={{ fontSize: '2rem', fontWeight: 800 }}>{guards.length}</div>
              </div>
              <div className="card">
                <div className="section-title">Completed Patrols</div>
                <div style={{ fontSize: '2rem', fontWeight: 800 }}>{patrols.filter(p => p.status === 'completed').length}</div>
              </div>
              <div className="card">
                <div className="section-title">Missed Patrols</div>
                <div style={{ fontSize: '2rem', fontWeight: 800 }}>
                  {guards.reduce((acc, g) => acc + Math.max(0, required - (doneByGuard.get(g.id) || 0)), 0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <div className="card">
            <h3>Patrol Map</h3>
            <MapView center={center} points={points} />
          </div>
        </div>
        <div className="col">
          <div className="card">
            <h3>Today by Guard</h3>
            <table className="table">
              <thead>
                <tr><th>Guard</th><th>Completed</th><th>Missed</th></tr>
              </thead>
              <tbody>
                {guards.map(g => {
                  const done = doneByGuard.get(g.id) || 0
                  const missed = Math.max(0, required - done)
                  return (
                    <tr key={g.id}>
                      <td>{g.fullName}</td>
                      <td><span className="pill success">{done}</span></td>
                      <td><span className="pill warn">{missed}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <div className="card">
            <h3>Recent Patrols</h3>
            <table className="table">
              <thead>
                <tr><th>Time</th><th>Guard</th><th>Location</th><th>Status</th></tr>
              </thead>
              <tbody>
                {patrols.map(p => {
                  const g = guards.find(x => x.id === p.guardId)?.fullName ?? 'Unknown'
                  const l = locations.find(x => x.id === p.locationId)?.name ?? 'Unknown'
                  return (
                    <tr key={p.id}>
                      <td>{new Date(p.startedAt).toLocaleTimeString()}</td>
                      <td>{g}</td>
                      <td>{l}</td>
                      <td>{p.status === 'completed' ? <span className="pill success">Completed</span> : <span className="pill warn">Incomplete</span>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

