import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Sidebar from '../../components/Sidebar'
import PatientProfileModal from '../../components/PatientProfileModal'
import { Loader2 } from 'lucide-react'
import useAutoRefresh from '../../hooks/useAutoRefresh'
import LiveBadge from '../../components/LiveBadge'

const PatientOverview = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showProfile, setShowProfile] = useState(false)

  // Retrieve user details from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const firstName = user.name ? user.name.split(' ')[0] : 'Guest'

  const fetchAppointments = async () => {
    setLoading(true)
    setError(null)
    try {
      // --- ADDED: Fetch real patient-specific appointments from API ---
      const res = await axios.get('http://localhost:9090/api/appointments', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      })
      if (res.data.success) {
        setAppointments(res.data.data.appointments || [])
      }
    } catch (err) {
      console.error(err)
      setError('Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const { lastUpdated } = useAutoRefresh(fetchAppointments, 30000)

  // --- ADDED: Calculate stats dynamically based on DB entries ---
  const upcomingCount = appointments.filter((a) => a.status === 'confirmed' || a.status === 'pending').length
  const uniqueDoctors = new Set(appointments.map((a) => a.doctorId)).size

  const statCards = [
    { label: 'Appointments', value: upcomingCount, sub: 'upcoming', color: '#6358fc' },
    { label: 'Doctors Visited', value: uniqueDoctors, sub: 'total', color: '#10b981' },
    { label: 'Prescriptions', value: '0', sub: 'active (mocked)', color: '#f59e0b' },
    { label: 'Reports', value: '0', sub: 'available (mocked)', color: '#ec4899' },
  ]

  const formatDate = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  return (
    <div className="dash-layout">
      <Sidebar role="patient" />
      <main className="dash-main">
        {/* Header */}
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Good morning, {firstName} 👋</h1>
            <p className="dash-subtitle">Here's your health summary for today</p>
            <LiveBadge lastUpdated={lastUpdated} />
          </div>
          <button
            className="dash-avatar"
            onClick={() => setShowProfile(true)}
            title="View Profile"
            style={{ cursor: 'pointer', border: 'none', outline: 'none' }}
          >
            {firstName[0]}
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '30vh', gap: '0.5rem', color: '#64748b' }}>
            <Loader2 style={{ animation: 'spin 1s linear infinite' }} />
            <span>Loading summary...</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', color: '#f87171', textAlign: 'center' }}>
            <p>{error}</p>
            <button className="dash-btn dash-btn--sm" onClick={fetchAppointments}>Retry</button>
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="stat-grid">
              {statCards.map((card) => (
                <div className="stat-card" key={card.label} style={{ '--card-color': card.color }}>
                  <div className="stat-card-dot" style={{ background: card.color }} />
                  <p className="stat-card-value" style={{ color: card.color }}>{card.value}</p>
                  <p className="stat-card-label">{card.label}</p>
                  <p className="stat-card-sub">{card.sub}</p>
                </div>
              ))}
            </div>

            {/* Upcoming Appointments */}
            <div className="dash-section">
              <h2 className="dash-section-title">Upcoming Appointments</h2>
              {appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No upcoming appointments scheduled.</p>
              ) : (
                <div className="table-wrapper">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Doctor</th>
                        <th>Department</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments
                        .filter((a) => a.status === 'confirmed' || a.status === 'pending')
                        .map((row) => (
                          <tr key={row.id}>
                            <td>{row.Doctor ? `Dr. ${row.Doctor.firstName} ${row.Doctor.lastName}` : 'Unassigned'}</td>
                            <td className="td-muted">{row.Department?.name || '—'}</td>
                            <td>{formatDate(row.appointmentDate)}</td>
                            <td className="td-muted">{formatTime(row.appointmentDate)}</td>
                            <td>
                              <span className={`status-badge ${row.status === 'confirmed' ? 'status-green' : 'status-yellow'}`}>
                                {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Profile Modal */}
      {showProfile && (
        <PatientProfileModal onClose={() => setShowProfile(false)} />
      )}
    </div>
  )
}

export default PatientOverview