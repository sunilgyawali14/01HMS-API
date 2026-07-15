import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Sidebar from '../../components/Sidebar'
import { Loader2, Calendar, Clock } from 'lucide-react'

const DoctorOverview = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const doctorName = user.name || 'Doctor'

  const fetchAppointments = async () => {
    setLoading(true)
    setError(null)
    try {
      // --- ADDED: Fetch doctor-specific appointments (scoped automatically in backend) ---
      const res = await axios.get('http://localhost:9090/api/appointments', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      })
      if (res.data.success) {
        setAppointments(res.data.data.appointments || [])
      }
    } catch (err) {
      console.error(err)
      setError('Failed to fetch doctor dashboard statistics.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  // --- ADDED: Dynamically group and count appointments ---
  const totalPatients = new Set(appointments.map((a) => a.patientId)).size
  const pendingRequests = appointments.filter((a) => a.status === 'pending').length
  const completedCount = appointments.filter((a) => a.status === 'completed').length

  const statCards = [
    { label: 'Total Patients', value: totalPatients, sub: 'unique patients', color: '#10b981' },
    { label: 'Pending Requests', value: pendingRequests, sub: 'awaiting action', color: '#f59e0b' },
    { label: 'Completed Visits', value: completedCount, sub: 'total completed', color: '#6358fc' },
    { label: 'Avg. Rating', value: '4.9', sub: 'out of 5 (mocked)', color: '#ec4899' },
  ]

  // Filter schedule for today
  const todayStr = new Date().toDateString()
  const todaySchedule = appointments.filter((a) => {
    return new Date(a.appointmentDate).toDateString() === todayStr && a.status !== 'cancelled'
  })

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
      <Sidebar role="doctor" />
      <main className="dash-main">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Welcome, Dr. {doctorName.split(' ').slice(1).join(' ') || doctorName} 👨‍⚕️</h1>
            <p className="dash-subtitle">You have {pendingRequests} pending patient requests today</p>
          </div>
          <div className="dash-avatar" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
            {doctorName[0]}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '30vh', gap: '0.5rem', color: '#64748b' }}>
            <Loader2 style={{ animation: 'spin 1s linear infinite' }} />
            <span>Loading dashboard statistics...</span>
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

            {/* Today's Schedule */}
            <div className="dash-section">
              <h2 className="dash-section-title">Today's Schedule</h2>
              {todaySchedule.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No appointments scheduled for today.</p>
              ) : (
                <div className="table-wrapper">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Patient</th>
                        <th>Status</th>
                        <th>Reason / Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todaySchedule.map((row) => (
                        <tr key={row.id}>
                          <td>
                            <span className="time-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Clock size={12} />
                              {formatTime(row.appointmentDate)}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600, color: '#f1f5f9' }}>
                            {row.Patient ? `${row.Patient.firstName} ${row.Patient.lastName}` : 'Guest Patient'}
                          </td>
                          <td>
                            <span className={`status-badge ${row.status === 'confirmed' ? 'status-purple' : row.status === 'completed' ? 'status-green' : 'status-yellow'}`}>
                              {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                            </span>
                          </td>
                          <td className="td-muted">Routine consult</td>
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
    </div>
  )
}

export default DoctorOverview