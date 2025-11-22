import React from 'react'
import { Routes, Route, Navigate, Link } from 'react-router-dom'
import NavBar from '@/components/NavBar'
import LoginPage from '@/pages/LoginPage'
import AdminDashboard from '@/pages/AdminDashboard'
import AdminGuards from '@/pages/AdminGuards'
import AdminLocations from '@/pages/AdminLocations'
import AdminReports from '@/pages/AdminReports'
import GuardDashboard from '@/pages/GuardDashboard'
import { getSessionUser } from '@/lib/storage'
import '@/styles.css'

function Home() {
  const u = getSessionUser()
  if (!u) return <Navigate to="/login" replace />
  return <Navigate to={u.role === 'admin' ? '/admin' : '/guard'} replace />
}

export default function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/guards" element={<AdminGuards />} />
        <Route path="/admin/locations" element={<AdminLocations />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/guard" element={<GuardDashboard />} />
        <Route path="*" element={
          <div className="container">
            <div className="card">
              <h2>Not found</h2>
              <Link to="/">Go home</Link>
            </div>
          </div>
        } />
      </Routes>
    </>
  )
}

