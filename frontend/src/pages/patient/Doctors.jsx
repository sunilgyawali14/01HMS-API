import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Sidebar from '../../components/Sidebar'
import { Loader2, X, AlertCircle } from 'lucide-react'

/* Modal Styles */
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
    animation: 'modal-in 0.3s ease-out both',
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

/* ── Booking Modal ── */
const BookingModal = ({ doctor, onClose, onBooked }) => {
  const departments = doctor.Departments || []
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || '')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!appointmentDate) {
      setError('Please select an appointment date and time.')
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
          doctorId: doctor.id,
          departmentId: Number(departmentId),
          appointmentDate: new Date(appointmentDate).toISOString(),
          status: 'pending',
        },
        {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('accessToken')}` },
        }
      )
      onBooked()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.card} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <h2 style={modalStyles.title}>Book Appointment</h2>
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

          <p style={{ color: '#e2e8f0', fontSize: '0.85rem', margin: '0 0 1rem' }}>
            Requesting appointment with <strong>Dr. {doctor.firstName} {doctor.lastName}</strong>
          </p>

          <div style={modalStyles.fieldGroup}>
            <label style={modalStyles.label}>Select Department</label>
            {departments.length === 0 ? (
              <p style={{ color: '#ef4444', fontSize: '0.78rem', margin: 0 }}>
                Error: This doctor has no department assigned. Please contact support.
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
              {submitting ? 'Booking...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const PatientDoctors = () => {
  const [doctors, setDoctors] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Booking Modal State
  const [bookingDoctor, setBookingDoctor] = useState(null)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  const fetchDoctors = async () => {
    setLoading(true)
    setError(null)
    try {
      // --- ADDED: Fetch live doctor entries from DB ---
      const res = await axios.get('http://localhost:9090/api/doctors', {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('accessToken')}` },
      })
      // The API returns directly an array
      setDoctors(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error(err)
      setError('Failed to fetch doctor records.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDoctors()
  }, [])

  const filtered = doctors.filter((d) => {
    const fullName = `Dr. ${d.firstName} ${d.lastName}`.toLowerCase()
    const spec = (d.specialization || '').toLowerCase()
    const q = search.toLowerCase()
    return fullName.includes(q) || spec.includes(q)
  })

  return (
    <div className="dash-layout">
      <Sidebar role="patient" />
      <main className="dash-main">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Find a Doctor</h1>
            <p className="dash-subtitle">Browse and book available specialists</p>
          </div>
          <div className="dash-avatar">P</div>
        </div>

        {bookingSuccess && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: 12,
              padding: '1rem',
              color: '#34d399',
              marginBottom: '1rem',
              fontSize: '0.85rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>Appointment request submitted successfully!</span>
            <button
              onClick={() => setBookingSuccess(false)}
              style={{ background: 'none', border: 'none', color: '#34d399', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Search */}
        <div className="search-bar-wrapper">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="search-bar"
            type="text"
            placeholder="Search by name or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', color: '#64748b', gap: '0.5rem' }}>
            <Loader2 style={{ animation: 'spin 1s linear infinite' }} />
            <span>Loading doctors list...</span>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#f87171' }}>
            <p>{error}</p>
            <button className="dash-btn dash-btn--sm" onClick={fetchDoctors}>Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>No specialists found.</p>
        ) : (
          <div className="doctor-grid">
            {filtered.map((doc) => {
              const NMC = doc.licenseNumber
              const available = doc.status === 'active'
              return (
                <div className="doctor-card" key={doc.id}>
                  <div className="doctor-card-avatar">
                    {doc.firstName[0]}
                    {doc.lastName[0]}
                  </div>
                  <div className="doctor-card-info">
                    <h3 className="doctor-card-name">Dr. {doc.firstName} {doc.lastName}</h3>
                    <p className="doctor-card-spec">{doc.specialization} ({doc.qualification})</p>
                    <div className="doctor-card-meta">
                      <span className="doctor-card-exp">⏱ {doc.experienceYears || 0} yrs exp</span>
                      <span className="doctor-card-rating">⭐ NMC: {NMC}</span>
                    </div>
                  </div>
                  <span className={`status-badge ${available ? 'status-green' : 'status-red'}`}>
                    {available ? 'Available' : 'On Leave'}
                  </span>
                  <button
                    className="dash-btn"
                    disabled={!available}
                    onClick={() => setBookingDoctor(doc)}
                    style={!available ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                  >
                    Book
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Popup form modal to book */}
        {bookingDoctor && (
          <BookingModal
            doctor={bookingDoctor}
            onClose={() => setBookingDoctor(null)}
            onBooked={() => {
              setBookingDoctor(null)
              setBookingSuccess(true)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        )}
      </main>
      <style>{`
        @keyframes modal-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default PatientDoctors