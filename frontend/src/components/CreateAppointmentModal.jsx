import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { X, Loader2, AlertCircle, Calendar } from 'lucide-react'

const API = 'http://localhost:9090/api'

const CreateAppointmentModal = ({ onClose, onCreated }) => {
  const [doctors, setDoctors] = useState([])
  const [departments, setDepartments] = useState([])
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [selectedDeptId, setSelectedDeptId] = useState('')
  const [appointmentDate, setAppointmentDate] = useState('')
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const token = sessionStorage.getItem('accessToken')

  // Fetch doctors and departments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsRes, deptsRes] = await Promise.all([
          axios.get(`${API}/doctors`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API}/departments`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ])

        const activeDocs = (Array.isArray(docsRes.data) ? docsRes.data : [])
          .filter(doc => doc.status === 'active')
        const activeDepts = (deptsRes.data?.success ? deptsRes.data.data : [])
          .filter(dept => dept.isActive)

        setDoctors(activeDocs)
        setDepartments(activeDepts)

        if (activeDocs.length > 0) {
          setSelectedDoctorId(activeDocs[0].id)
          const docDepts = activeDocs[0].Departments || []
          if (docDepts.length > 0) {
            setSelectedDeptId(docDepts[0].id)
          } else if (activeDepts.length > 0) {
            setSelectedDeptId(activeDepts[0].id)
          }
        }
      } catch (err) {
        console.error(err)
        setError(err.response?.data?.message || err.message || 'Failed to fetch available doctors and departments')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [token])

  // Update selected department when doctor changes
  const handleDoctorChange = (e) => {
    const docId = Number(e.target.value)
    setSelectedDoctorId(docId)
    const doc = doctors.find(d => d.id === docId)
    if (doc && doc.Departments?.length > 0) {
      setSelectedDeptId(doc.Departments[0].id)
    } else if (departments.length > 0) {
      setSelectedDeptId(departments[0].id)
    } else {
      setSelectedDeptId('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedDoctorId || !selectedDeptId || !appointmentDate) {
      setError('Please fill in all fields.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await axios.post(
        `${API}/appointments`,
        {
          doctorId: Number(selectedDoctorId),
          departmentId: Number(selectedDeptId),
          appointmentDate: new Date(appointmentDate).toISOString(),
          status: 'pending',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      onCreated()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create appointment. Make sure your profile is created first.')
    } finally {
      setSubmitting(false)
    }
  }

  // Get current selected doctor's departments
  const currentDoc = doctors.find(d => d.id === Number(selectedDoctorId))
  const doctorDepartments = currentDoc?.Departments && currentDoc.Departments.length > 0
    ? currentDoc.Departments
    : departments

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-card" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="profile-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="profile-modal-icon">
              <Calendar size={18} />
            </div>
            <h2 className="profile-modal-title">Book New Appointment</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <div className="profile-modal-loading">
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <span>Loading active doctors list...</span>
          </div>
        ) : (
          <form className="profile-form" onSubmit={handleSubmit}>
            {error && (
              <div className="profile-modal-error" style={{ marginBottom: '0.5rem' }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {doctors.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8' }}>
                No active doctors are available at the moment.
              </div>
            ) : (
              <>
                <div className="modal-field">
                  <label className="modal-label">Select Doctor</label>
                  <select
                    className="modal-input"
                    value={selectedDoctorId}
                    onChange={handleDoctorChange}
                    required
                  >
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        Dr. {d.firstName} {d.lastName} ({d.specialization})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-field">
                  <label className="modal-label">Select Department</label>
                  <select
                    className="modal-input"
                    value={selectedDeptId}
                    onChange={(e) => setSelectedDeptId(e.target.value)}
                    required
                  >
                    {doctorDepartments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-field">
                  <label className="modal-label">Appointment Date & Time</label>
                  <input
                    type="datetime-local"
                    className="modal-input"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    required
                    style={{ colorScheme: 'dark' }}
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="modal-btn-cancel" onClick={onClose}>
                    Cancel
                  </button>
                  <button type="submit" className="dash-btn" disabled={submitting}>
                    {submitting ? 'Booking...' : 'Book Appointment'}
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  )
}

export default CreateAppointmentModal
