import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import Sidebar from '../../components/Sidebar'
import { Loader2, Calendar, Clock, CheckCircle } from 'lucide-react'
import useAutoRefresh from '../../hooks/useAutoRefresh'
import LiveBadge from '../../components/LiveBadge'

const STATUS_BADGE_MAP = {
  pending: 'status-yellow',
  assigned: 'status-blue',
  confirmed: 'status-purple',
  rejected: 'status-red',
  completed: 'status-green',
  cancelled: 'status-red',
}

const IncomingPatients = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  const [filter, setFilter] = useState('All')

  const fetchTodayAppointments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get('http://localhost:9090/api/appointments', {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('accessToken')}` },
      })
      if (res.data.success) {
        // Show appointments scheduled for today OR any appointments that are pending/rejected (so receptionist can assign/confirm them)
        const todayStr = new Date().toDateString()
        const relevantList = (res.data.data.appointments || []).filter((a) => {
          const isToday = new Date(a.appointmentDate).toDateString() === todayStr
          const isPendingOrRejected = a.status === 'pending' || a.status === 'rejected'
          return isToday || isPendingOrRejected
        })
        setAppointments(relevantList)
      }
    } catch (err) {
      console.error(err)
      setError("Failed to fetch patient appointments queue.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTodayAppointments()
  }, [fetchTodayAppointments])

  const { lastUpdated } = useAutoRefresh(fetchTodayAppointments, 30000)

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id)
    try {
      await axios.patch(
        `http://localhost:9090/api/appointments/${id}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('accessToken')}` },
        }
      )
      await fetchTodayAppointments()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update patient status.')
    } finally {
      setUpdatingId(null)
    }
  }

  const formatTime = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatDate = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // Filter local lists
  const filtered = appointments.filter((p) => {
    if (filter === 'All') return true
    if (filter === 'Waiting') return p.status === 'pending'
    if (filter === 'In Progress') return p.status === 'confirmed'
    if (filter === 'Done') return p.status === 'completed'
    return true
  })

  return (
    <div className="dash-layout">
      <Sidebar role="receptionist" />
      <main className="dash-main">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Incoming Patients</h1>
            <p className="dash-subtitle">Monitor and manage today's patient check-in flow</p>
            <LiveBadge lastUpdated={lastUpdated} />
          </div>
          <div className="dash-avatar" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>R</div>
        </div>

        {/* Filter tabs */}
        <div className="filter-tabs">
          {['All', 'Waiting', 'In Progress', 'Done'].map((tab) => (
            <button
              key={tab}
              className={`filter-tab ${filter === tab ? 'filter-tab--active' : ''}`}
              onClick={() => setFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', color: '#64748b', gap: '0.5rem' }}>
            <Loader2 style={{ animation: 'spin 1s linear infinite' }} />
            <span>Loading patient queue...</span>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#f87171' }}>
            <p>{error}</p>
            <button className="dash-btn dash-btn--sm" onClick={fetchTodayAppointments}>Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '14px' }}>
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>
              No incoming patients in this status category today.
            </p>
          </div>
        ) : (
          /* Patient table */
          <div className="dash-section">
            <div className="table-wrapper">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Age</th>
                    <th>Date & Time</th>
                    <th>Assigned Doctor</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => {
                    const dob = row.Patient?.dateOfBirth
                    const age = dob ? new Date().getFullYear() - new Date(dob).getFullYear() : '—'
                    const showAssign = row.status === 'pending' || row.status === 'rejected'
                    return (
                      <tr key={row.id}>
                        <td style={{ fontWeight: 600, color: '#f1f5f9' }}>
                          {row.Patient ? `${row.Patient.firstName} ${row.Patient.lastName}` : 'Guest Patient'}
                        </td>
                        <td className="td-muted">{age}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: '#f1f5f9' }}>
                              <Calendar size={12} style={{ color: '#6358fc' }} />
                              {formatDate(row.appointmentDate)}
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#94a3b8' }}>
                              <Clock size={12} style={{ color: '#94a3b8' }} />
                              {formatTime(row.appointmentDate)}
                            </span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 500, color: '#e2e8f0' }}>
                          {row.Doctor ? `Dr. ${row.Doctor.firstName} ${row.Doctor.lastName}` : 'Unassigned'}
                        </td>
                        <td>
                          <span className={`status-badge ${STATUS_BADGE_MAP[row.status] || 'status-grey'}`}>
                            {row.status}
                          </span>
                        </td>
                        <td>
                          {updatingId === row.id ? (
                            <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                          ) : showAssign ? (
                            <div className="action-btns">
                              <button
                                className="dash-btn dash-btn--sm dash-btn--accept"
                                onClick={async () => {
                                  setUpdatingId(row.id)
                                  try {
                                    await axios.patch(
                                      `http://localhost:9090/api/appointments/${row.id}/assign`,
                                      { doctorId: row.doctorId },
                                      { headers: { Authorization: `Bearer ${sessionStorage.getItem('accessToken')}` } }
                                    )
                                    await fetchTodayAppointments()
                                  } catch (err) {
                                    alert(err.response?.data?.message || 'Failed to assign')
                                  } finally {
                                    setUpdatingId(null)
                                  }
                                }}
                              >
                                Assign
                              </button>
                              <button
                                className="dash-btn dash-btn--sm dash-btn--danger"
                                onClick={() => handleStatusChange(row.id, 'cancelled')}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <span className="td-muted">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export default IncomingPatients