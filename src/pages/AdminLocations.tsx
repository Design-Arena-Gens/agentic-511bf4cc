import React from 'react'
import { deleteLocation, listLocations, upsertLocation, getSessionUser } from '@/lib/storage'
import { useNavigate } from 'react-router-dom'

export default function AdminLocations() {
  const nav = useNavigate()
  const me = getSessionUser()
  React.useEffect(() => {
    if (!me || me.role !== 'admin') nav('/login', { replace: true })
  }, [])
  const [id, setId] = React.useState<string | undefined>(undefined)
  const [name, setName] = React.useState('')
  const [latitude, setLatitude] = React.useState<string>('')
  const [longitude, setLongitude] = React.useState<string>('')
  const [checklistItems, setChecklistItems] = React.useState<string>('')
  const [active, setActive] = React.useState(true)
  const [locations, setLocations] = React.useState(listLocations())

  function refresh() {
    setLocations(listLocations())
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col">
          <div className="card">
            <h2>Manage Locations</h2>
            <div className="grid two">
              <div>
                <label>Name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. West Entrance" />
              </div>
              <div>
                <label>Latitude</label>
                <input value={latitude} onChange={e => setLatitude(e.target.value)} placeholder="e.g. 37.4219" />
              </div>
              <div>
                <label>Longitude</label>
                <input value={longitude} onChange={e => setLongitude(e.target.value)} placeholder="-122.0840" />
              </div>
              <div>
                <label>Checklist items (comma separated)</label>
                <input value={checklistItems} onChange={e => setChecklistItems(e.target.value)} placeholder="Door locked, Lights off, ..." />
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
                if (!name || !latitude || !longitude) return
                const lat = Number(latitude), lng = Number(longitude)
                if (Number.isNaN(lat) || Number.isNaN(lng)) return
                const loc = upsertLocation({
                  id,
                  name: name.trim(),
                  latitude: lat,
                  longitude: lng,
                  checklistItems: checklistItems.split(',').map(s => s.trim()).filter(Boolean),
                  active
                })
                setId(undefined); setName(''); setLatitude(''); setLongitude(''); setChecklistItems(''); setActive(true); refresh()
              }}>Save Location</button>
              <button className="secondary" onClick={() => {
                setId(undefined); setName(''); setLatitude(''); setLongitude(''); setChecklistItems(''); setActive(true)
              }}>Reset</button>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <div className="card">
            <h3>All Locations</h3>
            <table className="table">
              <thead>
                <tr><th>Name</th><th>Lat</th><th>Lng</th><th>Checklist</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {locations.map(l => (
                  <tr key={l.id}>
                    <td>{l.name}</td>
                    <td>{l.latitude.toFixed(6)}</td>
                    <td>{l.longitude.toFixed(6)}</td>
                    <td className="muted">{l.checklistItems.join(', ')}</td>
                    <td>{l.active ? <span className="pill success">Active</span> : <span className="pill warn">Inactive</span>}</td>
                    <td className="actions">
                      <button className="secondary" onClick={() => {
                        setId(l.id)
                        setName(l.name)
                        setLatitude(String(l.latitude))
                        setLongitude(String(l.longitude))
                        setChecklistItems(l.checklistItems.join(', '))
                        setActive(l.active)
                      }}>Edit</button>
                      <button className="danger" onClick={() => { if (confirm('Delete location?')) { deleteLocation(l.id); refresh() } }}>Delete</button>
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

