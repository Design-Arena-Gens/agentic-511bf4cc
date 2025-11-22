import React from 'react'
import { exportCsvForDate, getSessionUser, listLocations, listPatrolsByDate, listUsers, todayIso } from '@/lib/storage'
import { useNavigate } from 'react-router-dom'

export default function AdminReports() {
  const nav = useNavigate()
  const me = getSessionUser()
  React.useEffect(() => {
    if (!me || me.role !== 'admin') nav('/login', { replace: true })
  }, [])
  const [date, setDate] = React.useState(todayIso())
  const patrols = listPatrolsByDate(date)
  const users = listUsers()
  const locations = listLocations()

  function downloadCsv() {
    const csv = exportCsvForDate(date)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `patrols_${date}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col">
          <div className="card">
            <h2>Reports</h2>
            <label>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            <div className="spacer" />
            <button onClick={downloadCsv}>Download CSV</button>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <div className="card">
            <h3>Daily Patrols</h3>
            <table className="table">
              <thead>
                <tr><th>Time</th><th>Guard</th><th>Location</th><th>Status</th></tr>
              </thead>
              <tbody>
                {patrols.map(p => {
                  const g = users.find(u => u.id === p.guardId)?.fullName ?? 'Unknown'
                  const l = locations.find(x => x.id === p.locationId)?.name ?? 'Unknown'
                  return (
                    <tr key={p.id}>
                      <td>{new Date(p.startedAt).toLocaleTimeString()}</td>
                      <td>{g}</td>
                      <td>{l}</td>
                      <td>{p.status}</td>
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

