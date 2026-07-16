import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { X, Loader2, AlertCircle, User, Edit3, Check } from 'lucide-react'

const API = 'http://localhost:9090/api'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const GENDERS = ['male', 'female', 'other']

const emptyForm = {
  firstName: '',
  lastName: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  bloodGroup: '',
  address: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  medicalHistory: '',
}

/* ================================================================
   PatientProfileModal
   – Fetches profile via GET /api/patient/me
   – If no profile → shows creation form (POST /api/patient)
   – If profile exists → shows details card with Edit → PUT /api/patient/me
   ================================================================ */
const PatientProfileModal = ({ onClose }) => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false) // true = form mode
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const token = sessionStorage.getItem('accessToken')

  // ── Fetch profile on mount ──
  const fetchProfile = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axios.get(`${API}/patient/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const p = res.data.data?.profile
      if (p) {
        setProfile(p)
        setForm({
          firstName: p.firstName || '',
          lastName: p.lastName || '',
          phone: p.phone || '',
          dateOfBirth: p.dateOfBirth || '',
          gender: p.gender || '',
          bloodGroup: p.bloodGroup || '',
          address: p.address || '',
          emergencyContactName: p.emergencyContactName || '',
          emergencyContactPhone: p.emergencyContactPhone || '',
          medicalHistory: p.medicalHistory || '',
        })
        setEditing(false)
      } else {
        setProfile(null)
        setEditing(true) // No profile — show creation form
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  // ── Handle form change ──
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // ── Submit create or update ──
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')
    setSuccessMsg('')

    try {
      if (profile) {
        // Update existing
        const res = await axios.put(`${API}/patient/me`, form, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setProfile(res.data.data.profile)
        setEditing(false)
        setSuccessMsg('Profile updated successfully')
      } else {
        // Create new
        const res = await axios.post(`${API}/patient`, form, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setProfile(res.data.data.patient)
        setEditing(false)
        setSuccessMsg('Profile created successfully')
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Helpers ──
  const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const age = (dob) => {
    if (!dob) return '—'
    const diff = Date.now() - new Date(dob).getTime()
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))
  }

  // ── Render ──
  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="profile-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="profile-modal-icon">
              <User size={18} />
            </div>
            <h2 className="profile-modal-title">
              {loading ? 'Patient Profile' : profile && !editing ? 'My Profile' : profile ? 'Edit Profile' : 'Create Profile'}
            </h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="profile-modal-loading">
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <span>Loading profile...</span>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="profile-modal-error">
            <AlertCircle size={18} />
            <span>{error}</span>
            <button className="dash-btn dash-btn--sm" onClick={fetchProfile} style={{ marginLeft: 'auto' }}>
              Retry
            </button>
          </div>
        )}

        {/* Success toast */}
        {successMsg && (
          <div className="profile-modal-success">
            <Check size={15} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* View mode */}
        {!loading && !error && profile && !editing && (
          <>
            {/* Avatar + Name Banner */}
            <div className="profile-banner">
              <div className="profile-banner-avatar">
                {profile.firstName?.[0]}{profile.lastName?.[0]}
              </div>
              <div>
                <h3 className="profile-banner-name">{profile.firstName} {profile.lastName}</h3>
                <p className="profile-banner-email">{profile.email}</p>
              </div>
              <button
                className="dash-btn dash-btn--sm"
                onClick={() => { setEditing(true); setSuccessMsg('') }}
                style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Edit3 size={13} /> Edit
              </button>
            </div>

            {/* Info Grid */}
            <div className="profile-info-grid">
              <div className="profile-info-item">
                <span className="profile-info-label">Phone</span>
                <span className="profile-info-value">{profile.phone}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Date of Birth</span>
                <span className="profile-info-value">{formatDate(profile.dateOfBirth)}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Age</span>
                <span className="profile-info-value">{age(profile.dateOfBirth)} years</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Gender</span>
                <span className="profile-info-value" style={{ textTransform: 'capitalize' }}>{profile.gender}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Blood Group</span>
                <span className="profile-info-value">{profile.bloodGroup || '—'}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Address</span>
                <span className="profile-info-value">{profile.address || '—'}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Emergency Contact</span>
                <span className="profile-info-value">
                  {profile.emergencyContactName
                    ? `${profile.emergencyContactName} (${profile.emergencyContactPhone || '—'})`
                    : '—'}
                </span>
              </div>
              <div className="profile-info-item profile-info-item--full">
                <span className="profile-info-label">Medical History</span>
                <span className="profile-info-value">{profile.medicalHistory || 'None recorded'}</span>
              </div>
            </div>
          </>
        )}

        {/* Form mode (create or edit) */}
        {!loading && !error && editing && (
          <form className="profile-form" onSubmit={handleSubmit}>
            {submitError && (
              <div className="profile-modal-error" style={{ marginBottom: '0.75rem' }}>
                <AlertCircle size={15} />
                <span>{submitError}</span>
              </div>
            )}

            <div className="profile-form-row">
              <div className="modal-field">
                <label className="modal-label">First Name *</label>
                <input className="modal-input" name="firstName" value={form.firstName} onChange={handleChange} required placeholder="John" />
              </div>
              <div className="modal-field">
                <label className="modal-label">Last Name *</label>
                <input className="modal-input" name="lastName" value={form.lastName} onChange={handleChange} required placeholder="Doe" />
              </div>
            </div>

            <div className="profile-form-row">
              <div className="modal-field">
                <label className="modal-label">Phone *</label>
                <input className="modal-input" name="phone" value={form.phone} onChange={handleChange} required placeholder="+9771234567890" />
              </div>
              <div className="modal-field">
                <label className="modal-label">Date of Birth *</label>
                <input className="modal-input" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} required style={{ colorScheme: 'dark' }} />
              </div>
            </div>

            <div className="profile-form-row">
              <div className="modal-field">
                <label className="modal-label">Gender *</label>
                <select className="modal-input" name="gender" value={form.gender} onChange={handleChange} required>
                  <option value="">Select gender</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="modal-field">
                <label className="modal-label">Blood Group</label>
                <select className="modal-input" name="bloodGroup" value={form.bloodGroup} onChange={handleChange}>
                  <option value="">Select (optional)</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-field">
              <label className="modal-label">Address</label>
              <input className="modal-input" name="address" value={form.address} onChange={handleChange} placeholder="Street, City, Country" />
            </div>

            <div className="profile-form-row">
              <div className="modal-field">
                <label className="modal-label">Emergency Contact Name</label>
                <input className="modal-input" name="emergencyContactName" value={form.emergencyContactName} onChange={handleChange} placeholder="Jane Doe" />
              </div>
              <div className="modal-field">
                <label className="modal-label">Emergency Contact Phone</label>
                <input className="modal-input" name="emergencyContactPhone" value={form.emergencyContactPhone} onChange={handleChange} placeholder="+9771234567890" />
              </div>
            </div>

            <div className="modal-field">
              <label className="modal-label">Medical History</label>
              <textarea className="modal-input modal-textarea" name="medicalHistory" value={form.medicalHistory} onChange={handleChange} placeholder="Any known conditions, allergies, past surgeries..." />
            </div>

            <div className="modal-actions">
              {profile && (
                <button
                  type="button"
                  className="modal-btn-cancel"
                  onClick={() => { setEditing(false); setSubmitError('') }}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="dash-btn"
                disabled={submitting}
              >
                {submitting
                  ? (profile ? 'Updating...' : 'Creating...')
                  : (profile ? 'Save Changes' : 'Create Profile')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default PatientProfileModal
