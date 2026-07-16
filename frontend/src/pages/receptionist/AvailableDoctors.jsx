import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Sidebar from '../../components/Sidebar'
import { Loader2, X, AlertCircle } from 'lucide-react'
import useAutoRefresh from '../../hooks/useAutoRefresh'
import LiveBadge from '../../components/LiveBadge'

const modalStyles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
  },
  card: {
    width: '100%',
    maxWidth: 440,
    background: 'rgba(30, 41, 59, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: '2rem',
    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.25rem',
  },
  title: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#f1f5f9',
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: 4,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    marginBottom: '1rem',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: 500,
    color: '#94a3b8',
  },
  input: {
    width: '100%',
    padding: '0.65rem 0.85rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.09)',
    borderRadius: 10,
    color: '#f1f5f9',
    fontSize: '0.85rem',
    outline: 'none',
    boxSizing: 'border-box',
    colorScheme: 'dark',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
    marginTop: '1.25rem',
  },
  cancelBtn: {
    padding: '0.45rem 1rem',
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    color: '#94a3b8',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
}

/* ── Assign Patient Popup Modal ── */
const AssignPatientModal = ({ doctor, onClose, onAssigned }) => {
  const departments = doctor.Departments || []
  const [patientId, setPatientId] = useState('')
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || '')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!patientId.trim()) {
      setError('Patient ID is required.')
      return
    }
    if (!appointmentDate) {
      setError('Please select appointment date and time.')
      return
    }
    if (!departmentId) {
      setError('Please select a department.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await axios.post(
        'http://localhost:9090/api/appointments',
        {
          patientId: Number(patientId),
          doctorId: doctor.id,
          departmentId: Number(departmentId),
          appointmentDate: new Date(appointmentDate).toISOString(),
          status: 'confirmed', // Receptionists assign with pre-confirmed status
        },
        {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('accessToken')}` },
        }
      )
      onAssigned()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign patient.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.card} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <h2 style={modalStyles.title}>Assign Patient</h2>
          <button style={modalStyles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ display: 'flex', gap: '0.4rem', color: '#f87171', fontSize: '0.8rem', marginBottom: '0.8rem' }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <p style={{ color: '#cbd5e1', fontSize: '0.82rem', margin: '0 0 1rem' }}>
            Assigning patient to <strong>Dr. {doctor.firstName} {doctor.lastName}</strong>
          </p>

          <div style={modalStyles.fieldGroup}>
            <label style={modalStyles.label}>Patient Profile ID</label>
            <input
              type="number"
              placeholder="e.g. 1"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              style={modalStyles.input}
            />
          </div>

          <div style={modalStyles.fieldGroup}>
            <label style={modalStyles.label}>Select Department</label>
            {departments.length === 0 ? (
              <p style={{ color: '#ef4444', fontSize: '0.78rem', margin: 0 }}>
                Error: This doctor has no department assigned.
              </p>
            ) : (
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                style={modalStyles.input}
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={modalStyles.fieldGroup}>
            <label style={modalStyles.label}>Appointment Date & Time</label>
            <input
              type="datetime-local"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              style={modalStyles.input}
            />
          </div>

          <div style={modalStyles.actions}>
            <button type="button" style={modalStyles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="dash-btn dash-btn--sm"
              disabled={submitting || departments.length === 0}
            >
              {submitting ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const AvailableDoctors = () => {
  const [doctors, setDoctors] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [assigningDoctor, setAssigningDoctor] = useState(null)
  const [successMsg, setSuccessMsg] = useState('')

  const [filter, setFilter] = useState('All')

  const fetchAvailableData = async () => {
    setLoading(true)
    setError(null)
    try {
      const headers = { Authorization: `Bearer ${sessionStorage.getItem('accessToken')}` }
      const [docsRes, apptsRes] = await Promise.all([
        axios.get('http://localhost:9090/api/doctors', { headers }),
        axios.get('http://localhost:9090/api/appointments', { headers }),
      ])
      setDoctors(Array.isArray(docsRes.data) ? docsRes.data : [])
      setAppointments(apptsRes.data.data.appointments || [])
    } catch (err) {
      console.error(err)
      setError('Failed to fetch doctor availability status.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAvailableData()
  }, [])

  const { lastUpdated } = useAutoRefresh(fetchAvailableData, 30000)

  // Calculate load per doctor today
  const todayStr = new Date().toDateString()
  const todayActiveAppts = appointments.filter((a) => {
    return new Date(a.appointmentDate).toDateString() === todayStr && (a.status === 'pending' || a.status === 'confirmed')
  })

  const getDoctorLoad = (docId) => {
    return todayActiveAppts.filter((a) => a.doctorId === docId).length
  }

  const filtered = doctors.filter((doc) => {
    const isAvailable = doc.status === 'active'
    if (filter === 'Available') return isAvailable
    if (filter === 'Unavailable') return !isAvailable
    return true
  })

  return (
    <div className="dash-layout">
      <Sidebar role="receptionist" />
      <main className="dash-main">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Available Doctors</h1>
            <p className="dash-subtitle">Manage doctor availability and assign patient visits</p>
            <LiveBadge lastUpdated={lastUpdated} />
          </div>
          <div className="dash-avatar" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>R</div>
        </div>

        {successMsg && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: 12,
              padding: '1rem',
              color: '#34d399',
              marginBottom: '1rem',
              fontSize: '0.85rem',
            }}
          >
            {successMsg}
          </div>
        )}

        {/* Filter tabs */}
        <div className="filter-tabs">
          {['All', 'Available', 'Unavailable'].map((tab) => (
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
            <span>Loading doctors list...</span>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#f87171' }}>
            <p>{error}</p>
            <button className="dash-btn dash-btn--sm" onClick={fetchAvailableData}>Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>No doctors found.</p>
        ) : (
          /* Doctor list table */
          <div className="dash-section">
            <div className="table-wrapper">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Specialty</th>
                    <th>Current Today's Patients</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((doc) => {
                    const isAvailable = doc.status === 'active'
                    const load = getDoctorLoad(doc.id)
                    return (
                      <tr key={doc.id}>
                        <td style={{ fontWeight: 600, color: '#f1f5f9' }}>Dr. {doc.firstName} {doc.lastName}</td>
                        <td className="td-muted">{doc.specialization}</td>
                        <td className="td-muted" style={{ fontWeight: 600, color: load > 0 ? '#818cf8' : '' }}>
                          {load}
                        </td>
                        <td>
                          <span className={`status-badge ${isAvailable ? 'status-green' : 'status-red'}`}>
                            {isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="dash-btn dash-btn--sm"
                            disabled={!isAvailable}
                            onClick={() => setAssigningDoctor(doc)}
                            style={!isAvailable ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                          >
                            Assign Patient
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Assign Patient Popup Form Modal */}
        {assigningDoctor && (
          <AssignPatientModal
            doctor={assigningDoctor}
            onClose={() => setAssigningDoctor(null)}
            onAssigned={() => {
              setAssigningDoctor(null)
              setSuccessMsg('Patient assigned and appointment created successfully!')
              fetchAvailableData()
              setTimeout(() => setSuccessMsg(''), 4000)
            }}
          />
        )}
      </main>
    </div>
  )
}

export default AvailableDoctors