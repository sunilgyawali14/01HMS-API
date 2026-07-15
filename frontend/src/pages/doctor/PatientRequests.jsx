import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import Sidebar from '../../components/Sidebar'
import { Loader2, Calendar, Clock, AlertCircle } from 'lucide-react'

const STATUS_BADGE_MAP = {
  pending: 'status-yellow',
  assigned: 'status-blue',
  confirmed: 'status-purple',
  rejected: 'status-red',
  completed: 'status-green',
  cancelled: 'status-red',
}

const PatientRequests = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  // Modal state for completing consultation
  const [showModal, setShowModal] = useState(false)
  const [consultingAppt, setConsultingAppt] = useState(null)
  const [notes, setNotes] = useState({ clinicalNotes: '', prescription: '', report: '' })

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get('http://localhost:9090/api/appointments', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      })
      if (res.data.success) {
        setAppointments(res.data.data.appointments || [])
      }
    } catch (err) {
      console.error(err)
      setError('Failed to load patient requests.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  const handleAction = async (id, status) => {
    setUpdatingId(id)
    try {
      await axios.patch(
        `http://localhost:9090/api/appointments/${id}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        }
      )
      await fetchAppointments()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update request status.')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleCompleteConsultation = async (e) => {
    e.preventDefault()
    if (!consultingAppt) return

    setUpdatingId(consultingAppt.id)
    try {
      // Save notes
      await axios.patch(
        `http://localhost:9090/api/appointments/${consultingAppt.id}/notes`,
        notes,
        { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
      )
      // Change status to completed
      await axios.patch(
        `http://localhost:9090/api/appointments/${consultingAppt.id}/status`,
        { status: 'completed' },
        { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
      )
      setShowModal(false)
      setConsultingAppt(null)
      setNotes({ clinicalNotes: '', prescription: '', report: '' })
      await fetchAppointments()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete consultation.')
    } finally {
      setUpdatingId(null)
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

  return (
    <div className="dash-layout">
      <Sidebar role="doctor" />
      <main className="dash-main">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Patient Requests</h1>
            <p className="dash-subtitle">Review assigned patients and manage consultations</p>
          </div>
          <div className="dash-avatar" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>D</div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', color: '#64748b', gap: '0.5rem' }}>
            <Loader2 style={{ animation: 'spin 1s linear infinite' }} />
            <span>Loading requests...</span>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#f87171' }}>
            <p>{error}</p>
            <button className="dash-btn dash-btn--sm" onClick={fetchAppointments}>Retry</button>
          </div>
        ) : appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '14px' }}>
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>
              No appointments.
            </p>
          </div>
        ) : (
          <div className="dash-section">
            <div className="table-wrapper">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Age</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((row) => {
                    const dob = row.Patient?.dateOfBirth
                    const age = dob ? new Date().getFullYear() - new Date(dob).getFullYear() : '—'
                    const showAssignedActions = row.status === 'assigned'
                    const showConfirmActions = row.status === 'confirmed'
                    return (
                      <tr key={row.id}>
                        <td style={{ fontWeight: 600, color: '#f1f5f9' }}>
                          {row.Patient ? `${row.Patient.firstName} ${row.Patient.lastName}` : 'Guest Patient'}
                        </td>
                        <td className="td-muted">{age}</td>
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
                          {updatingId === row.id ? (
                            <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                          ) : showAssignedActions ? (
                            <div className="action-btns">
                              <button
                                className="dash-btn dash-btn--sm dash-btn--accept"
                                onClick={() => handleAction(row.id, 'confirmed')}
                              >
                                Accept
                              </button>
                              <button
                                className="dash-btn dash-btn--sm dash-btn--danger"
                                onClick={() => handleAction(row.id, 'rejected')}
                              >
                                Reject
                              </button>
                            </div>
                          ) : showConfirmActions ? (
                            <div className="action-btns">
                              <button
                                className="dash-btn dash-btn--sm dash-btn--accept"
                                onClick={() => {
                                  setConsultingAppt(row)
                                  setNotes({ clinicalNotes: '', prescription: '', report: '' })
                                  setShowModal(true)
                                }}
                              >
                                Start Consultation
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

      {/* Consultation Modal */}
      {showModal && consultingAppt && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h2 className="modal-title">Consultation Notes</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Patient: {consultingAppt.Patient?.firstName} {consultingAppt.Patient?.lastName}
            </p>
            <form onSubmit={handleCompleteConsultation} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="modal-label">Clinical Notes</label>
                <textarea
                  className="modal-input modal-textarea"
                  value={notes.clinicalNotes}
                  onChange={(e) => setNotes({ ...notes, clinicalNotes: e.target.value })}
                  placeholder="Observations, symptoms, diagnosis..."
                  required
                />
              </div>
              <div>
                <label className="modal-label">Prescription</label>
                <textarea
                  className="modal-input modal-textarea"
                  value={notes.prescription}
                  onChange={(e) => setNotes({ ...notes, prescription: e.target.value })}
                  placeholder="Medication, dosage, instructions..."
                />
              </div>
              <div>
                <label className="modal-label">Report / Follow-up</label>
                <textarea
                  className="modal-input modal-textarea"
                  value={notes.report}
                  onChange={(e) => setNotes({ ...notes, report: e.target.value })}
                  placeholder="Any additional reports or follow-up details..."
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="modal-btn-cancel" onClick={() => setShowModal(false)} disabled={updatingId !== null}>
                  Cancel
                </button>
                <button type="submit" className="modal-btn-submit" disabled={updatingId !== null}>
                  {updatingId ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Complete Consultation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export default PatientRequests