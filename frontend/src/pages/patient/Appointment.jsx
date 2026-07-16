import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import Sidebar from '../../components/Sidebar'
import CreateAppointmentModal from '../../components/CreateAppointmentModal'
import { Calendar, Clock, Loader2, AlertCircle, Plus } from 'lucide-react'
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

const PatientAppointment = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [viewingNotes, setViewingNotes] = useState(null)

  const [filter, setFilter] = useState('All')
  const tabs = ['All', 'Confirmed', 'Pending', 'Assigned', 'Completed', 'Cancelled', 'Rejected']

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get('http://localhost:9090/api/appointments', {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('accessToken')}` },
      })
      if (res.data.success) {
        setAppointments(res.data.data.appointments || [])
      }
    } catch (err) {
      console.error(err)
      setError('Failed to fetch appointment history.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  const { lastUpdated } = useAutoRefresh(fetchAppointments, 30000)

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return
    setCancellingId(id)
    try {
      await axios.patch(
        `http://localhost:9090/api/appointments/${id}/status`,
        { status: 'cancelled' },
        {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('accessToken')}` },
        }
      )
      await fetchAppointments()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel appointment.')
    } finally {
      setCancellingId(null)
    }
  }

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

  const filtered = filter === 'All'
    ? appointments
    : appointments.filter((a) => a.status.toLowerCase() === filter.toLowerCase())

  return (
    <div className="dash-layout">
      <Sidebar role="patient" />
      <main className="dash-main">
        <div className="dash-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="dash-title">My Appointments</h1>
            <p className="dash-subtitle">Track all your scheduled and past visits</p>
            <LiveBadge lastUpdated={lastUpdated} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              className="dash-btn"
              onClick={() => setShowBookingModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Plus size={16} /> Book Appointment
            </button>
            <div className="dash-avatar">P</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="filter-tabs">
          {tabs.map((tab) => (
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
            <span>Loading appointments...</span>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#f87171' }}>
            <p>{error}</p>
            <button className="dash-btn dash-btn--sm" onClick={fetchAppointments}>Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '14px' }}>
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>
              No appointments found.
            </p>
          </div>
        ) : (
          /* Table */
          <div className="dash-section">
            <div className="table-wrapper">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Department</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => {
                    const isPendingOrConfirmed = row.status === 'pending' || row.status === 'confirmed' || row.status === 'assigned'
                    return (
                      <tr key={row.id}>
                        <td style={{ fontWeight: 600, color: '#f1f5f9' }}>
                          {row.Doctor ? `Dr. ${row.Doctor.firstName} ${row.Doctor.lastName}` : 'Unassigned'}
                        </td>
                        <td className="td-muted">{row.Department?.name || '—'}</td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Calendar size={13} style={{ color: '#475569' }} />
                            {formatDate(row.appointmentDate)}
                          </span>
                        </td>
                        <td className="td-muted">
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Clock size={13} style={{ color: '#475569' }} />
                            {formatTime(row.appointmentDate)}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${STATUS_BADGE_MAP[row.status] || 'status-grey'}`}>
                            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          <div className="action-btns">
                            {row.status === 'completed' && (
                              <button
                                className="dash-btn dash-btn--sm dash-btn--accept"
                                onClick={() => setViewingNotes(row)}
                              >
                                View Notes
                              </button>
                            )}
                            {isPendingOrConfirmed && (
                              <button
                                className="dash-btn dash-btn--sm dash-btn--danger"
                                onClick={() => handleCancel(row.id)}
                                disabled={cancellingId === row.id}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                              >
                                {cancellingId === row.id ? (
                                  <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                                ) : (
                                  'Cancel'
                                )}
                              </button>
                            )}
                          </div>
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

      {/* Viewing Notes Modal */}
      {viewingNotes && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h2 className="modal-title">Consultation Notes</h2>
            <div style={{ color: '#e2e8f0', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '1rem', margin: '1.5rem 0' }}>
              <div>
                <strong style={{ color: '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>Clinical Notes:</strong>
                <p style={{ margin: 0 }}>{viewingNotes.clinicalNotes || '—'}</p>
              </div>
              <div>
                <strong style={{ color: '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>Prescription:</strong>
                <p style={{ margin: 0 }}>{viewingNotes.prescription || '—'}</p>
              </div>
              <div>
                <strong style={{ color: '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>Report:</strong>
                <p style={{ margin: 0 }}>{viewingNotes.report || '—'}</p>
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="modal-btn-cancel" onClick={() => setViewingNotes(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Booking Modal Popup */}
      {showBookingModal && (
        <CreateAppointmentModal
          onClose={() => setShowBookingModal(false)}
          onCreated={() => {
            setShowBookingModal(false)
            fetchAppointments()
          }}
        />
      )}
      
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export default PatientAppointment