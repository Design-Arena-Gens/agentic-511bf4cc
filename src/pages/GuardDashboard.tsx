import React from 'react'
import { completePatrol, countCompletedForGuardOnDate, getLocation, getSessionUser, listLocations, startPatrol, todayIso } from '@/lib/storage'
import { haversineMeters, getCurrentPosition } from '@/lib/geo'
import { useNavigate } from 'react-router-dom'

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function GuardDashboard() {
  const nav = useNavigate()
  const me = getSessionUser()
  React.useEffect(() => {
    if (!me || me.role !== 'guard') nav('/login', { replace: true })
  }, [])

  const [selectedLocId, setSelectedLocId] = React.useState<string>('')
  const [gps, setGps] = React.useState<{ lat: number; lng: number } | null>(null)
  const [status, setStatus] = React.useState<string>('')
  const [patrolId, setPatrolId] = React.useState<string | null>(null)
  const [checklist, setChecklist] = React.useState<{ item: string; value: boolean }[]>([])
  const [photo, setPhoto] = React.useState<string | undefined>(undefined)
  const [today] = React.useState(todayIso())

  const locations = listLocations().filter(l => l.active)
  const completed = me ? countCompletedForGuardOnDate(me.id, today) : 0
  const remaining = Math.max(0, 5 - completed)

  async function handleStartPatrol() {
    if (!me) return
    if (!selectedLocId) { setStatus('Select a location'); return }
    setStatus('Obtaining GPS...')
    try {
      const position = await getCurrentPosition({ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 })
      const { latitude, longitude } = position.coords
      setGps({ lat: latitude, lng: longitude })
      const loc = getLocation(selectedLocId)!
      const dist = haversineMeters(latitude, longitude, loc.latitude, loc.longitude)
      if (dist > 50) {
        setStatus(`Too far from checkpoint (${dist.toFixed(0)} m). Must be within 50 m.`)
        return
      }
      const p = startPatrol(me.id, selectedLocId, { latitude, longitude })
      setPatrolId(p.id)
      setChecklist(loc.checklistItems.map(item => ({ item, value: false })))
      setStatus('Checklist unlocked')
    } catch (e: any) {
      setStatus(e?.message || 'Failed to get location')
    }
  }

  async function handleSubmit() {
    if (!patrolId) return
    const updated = completePatrol(patrolId, checklist, photo)
    if (updated) {
      setStatus('Patrol completed')
      setPatrolId(null)
      setChecklist([])
      setPhoto(undefined)
    }
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col">
          <div className="card">
            <h2>Guard Interface</h2>
            <div className="muted">Hello, {me?.fullName}. Completed today: <span className="pill success">{completed}</span> Remaining: <span className="pill warn">{remaining}</span></div>
            <div className="spacer" />
            <label>Patrol location</label>
            <select value={selectedLocId} onChange={e => setSelectedLocId(e.target.value)}>
              <option value="">Select location...</option>
              {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            <div className="spacer" />
            <div className="actions">
              <button onClick={handleStartPatrol}>Start patrol</button>
              {status && <span className="pill">{status}</span>}
            </div>
          </div>
        </div>
      </div>

      {patrolId && (
        <div className="row">
          <div className="col">
            <div className="card">
              <h3>Checklist</h3>
              <div className="list">
                {checklist.map((c, idx) => (
                  <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" checked={c.value} onChange={e => {
                      const v = e.target.checked
                      setChecklist(prev => prev.map((x, i) => i === idx ? ({ ...x, value: v }) : x))
                    }} />
                    {c.item}
                  </label>
                ))}
              </div>
              <div className="spacer" />
              <label>Optional photo</label>
              <input type="file" accept="image/*" capture="environment" onChange={async e => {
                const f = e.target.files?.[0]
                if (!f) return
                const b64 = await toBase64(f)
                setPhoto(b64)
              }} />
              {photo && <img src={photo} alt="uploaded" style={{ marginTop: '0.5rem', maxWidth: '100%', borderRadius: '0.5rem' }} />}
              <div className="spacer" />
              <button onClick={handleSubmit}>Submit checklist</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

