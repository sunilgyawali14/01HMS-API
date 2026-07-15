import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Sidebar from '../../components/Sidebar'
import { Loader2, Calendar, Clock, CheckCircle } from 'lucide-react'
import useAutoRefresh from '../../hooks/useAutoRefresh'
import LiveBadge from '../../components/LiveBadge'

const ReceptionistOverview = () => {
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchOverviewData = async () => {
    setLoading(true)
    setError(null)
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      const [apptsRes, docsRes] = await Promise.all([
        axios.get('http://localhost:9090/api/appointments', { headers }),
        axios.get('http://localhost:9090/api/doctors', { headers }),
      ])
      
      setAppointments(apptsRes.data.data.appointments || [])
      setDoctors(Array.isArray(docsRes.data) ? docsRes.data : [])
    } catch (err) {
      console.error(err)
      setError('Failed to load receptionist desk overview.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOverviewData()
  }, [])

  const { lastUpdated } = useAutoRefresh(fetchOverviewData, 30000)

  // --- ADDED: Calculate live counts ---
  const totalDoctors = doctors.length
  const availableDoctors = doctors.filter((d) => d.status === 'active').length
  
  const todayStr = new Date().toDateString()
  const incomingPatientsToday = appointments.filter((a) => {
    return new Date(a.appointmentDate).toDateString() === todayStr
  }).length

  const totalPendingRequests = appointments.filter((a) => a.status === 'pending').length
  const appointmentsThisWeek = appointments.length

  const statCards = [
    { label: 'Total Doctors', value: totalDoctors, sub: 'registered staff', color: '#6358fc' },
    { label: 'Available Now', value: availableDoctors, sub: 'active status', color: '#10b981' },
    { label: 'Pending Requests', value: totalPendingRequests, sub: 'awaiting confirmation', color: '#f59e0b' },
    { label: 'Appointments Scheduled', value: appointmentsThisWeek, sub: 'total registered', color: '#ec4899' },
  ]

  // Recent activity logs from real data
  const recentActivity = appointments.slice(0, 5).map((a) => {
    const pName = a.Patient ? `${a.Patient.firstName} ${a.Patient.lastName}` : 'Guest'
    const dName = a.Doctor ? `Dr. ${a.Doctor.firstName} ${a.Doctor.lastName}` : 'Unassigned'
    return {
      action: `Appointment created for ${pName} with ${dName} (${a.status})`,
      time: new Date(a.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    }
  })

  return (
    <div className="dash-layout">
      <Sidebar role="receptionist" />
      <main className="dash-main">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Reception Desk 🏥</h1>
            <p className="dash-subtitle">
              {totalPendingRequests} pending requests awaiting confirmation — {availableDoctors} doctors available
            </p>
            <LiveBadge lastUpdated={lastUpdated} />
          </div>
          <div className="dash-avatar" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>R</div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '30vh', gap: '0.5rem', color: '#64748b' }}>
            <Loader2 style={{ animation: 'spin 1s linear infinite' }} />
            <span>Loading receptionist dashboard...</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', color: '#f87171', textAlign: 'center' }}>
            <p>{error}</p>
            <button className="dash-btn dash-btn--sm" onClick={fetchOverviewData}>Retry</button>
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

            {/* Recent Activity */}
            <div className="dash-section">
              <h2 className="dash-section-title">Recent Activity</h2>
              {recentActivity.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No recent activity to show.</p>
              ) : (
                <div className="activity-list">
                  {recentActivity.map((item, i) => (
                    <div className="activity-item" key={i}>
                      <div className="activity-dot" />
                      <div className="activity-content">
                        <p className="activity-action">{item.action}</p>
                        <p className="activity-time">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default ReceptionistOverview