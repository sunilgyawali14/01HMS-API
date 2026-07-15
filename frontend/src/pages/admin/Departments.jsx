import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { Plus, Pencil, Trash2, Building2, X } from 'lucide-react'
import Sidebar from '../../components/Sidebar'

const API = 'http://localhost:9090/api'

const headers = () => ({
  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
})

/* ── inline styles for the modal (glassmorphism, dark theme) ── */
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
    maxWidth: 480,
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    backdropFilter: 'blur(20px)',
    padding: '2rem',
    boxShadow:
      '0 0 0 1px rgba(99, 88, 252, 0.08), 0 25px 50px rgba(0, 0, 0, 0.5), 0 8px 24px rgba(99, 88, 252, 0.1)',
    animation: 'auth-card-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) both',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#f1f5f9',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: 4,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.2s',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.45rem',
    marginBottom: '1.1rem',
  },
  label: {
    fontSize: '0.82rem',
    fontWeight: 500,
    color: '#94a3b8',
    letterSpacing: '0.01em',
  },
  input: {
    width: '100%',
    padding: '0.7rem 1rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.09)',
    borderRadius: 10,
    color: '#f1f5f9',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
  },
  textarea: {
    width: '100%',
    padding: '0.7rem 1rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.09)',
    borderRadius: 10,
    color: '#f1f5f9',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
    resize: 'vertical',
    minHeight: 90,
    transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
  cancelBtn: {
    padding: '0.5rem 1.1rem',
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    color: '#94a3b8',
    fontSize: '0.82rem',
    fontWeight: 600,
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'border-color 0.2s, color 0.2s',
  },
  errorText: {
    fontSize: '0.8rem',
    color: '#f87171',
    margin: '0 0 0.75rem',
  },
}

/* focus style helper — mimics .auth-input:focus */
const focusStyle = {
  borderColor: 'rgba(99, 88, 252, 0.6)',
  background: 'rgba(99, 88, 252, 0.06)',
  boxShadow: '0 0 0 3px rgba(99, 88, 252, 0.12)',
}

/* ── Confirm Modal ── */
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div style={modalStyles.overlay} onClick={onCancel}>
    <div style={{ ...modalStyles.card, maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
      <p style={{ color: '#cbd5e1', fontSize: '0.92rem', margin: '0 0 1.5rem', lineHeight: 1.6 }}>
        {message}
      </p>
      <div style={modalStyles.actions}>
        <button style={modalStyles.cancelBtn} onClick={onCancel}>
          Cancel
        </button>
        <button className="dash-btn dash-btn--danger dash-btn--sm" onClick={onConfirm}>
          Confirm
        </button>
      </div>
    </div>
  </div>
)

/* ── Department Form Modal ── */
const DepartmentFormModal = ({ department, onClose, onSaved }) => {
  const isEdit = Boolean(department)
  const [name, setName] = useState(department?.name || '')
  const [description, setDescription] = useState(department?.description || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [focusedField, setFocusedField] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Department name is required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      if (isEdit) {
        await axios.put(
          `${API}/departments/${department.id}`,
          { name: name.trim(), description: description.trim() },
          { headers: headers() }
        )
      } else {
        await axios.post(
          `${API}/departments`,
          { name: name.trim(), description: description.trim() },
          { headers: headers() }
        )
      }
      onSaved()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.card} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={modalStyles.header}>
          <h2 style={modalStyles.title}>
            {isEdit ? 'Edit Department' : 'Add New Department'}
          </h2>
          <button style={modalStyles.closeBtn} onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {error && <p style={modalStyles.errorText}>{error}</p>}

          <div style={modalStyles.fieldGroup}>
            <label style={modalStyles.label}>Department Name</label>
            <input
              type="text"
              placeholder="e.g. Cardiology"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              style={{
                ...modalStyles.input,
                ...(focusedField === 'name' ? focusStyle : {}),
              }}
            />
          </div>

          <div style={modalStyles.fieldGroup}>
            <label style={modalStyles.label}>Description</label>
            <textarea
              placeholder="Brief description of the department…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onFocus={() => setFocusedField('desc')}
              onBlur={() => setFocusedField(null)}
              style={{
                ...modalStyles.textarea,
                ...(focusedField === 'desc' ? focusStyle : {}),
              }}
            />
          </div>

          <div style={modalStyles.actions}>
            <button type="button" style={modalStyles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="dash-btn dash-btn--sm" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Main Page ── */
const AdminDepartments = () => {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // modal state
  const [showForm, setShowForm] = useState(false)
  const [editingDept, setEditingDept] = useState(null)

  // confirm toggle state
  const [confirmTarget, setConfirmTarget] = useState(null)

  /* Fetch departments */
  const fetchDepartments = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axios.get(`${API}/departments`, { headers: headers() })
      setDepartments(res.data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load departments.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDepartments()
  }, [fetchDepartments])

  /* Open create modal */
  const handleAdd = () => {
    setEditingDept(null)
    setShowForm(true)
  }

  /* Open edit modal */
  const handleEdit = (dept) => {
    setEditingDept(dept)
    setShowForm(true)
  }

  /* After successful save */
  const handleSaved = () => {
    setShowForm(false)
    setEditingDept(null)
    fetchDepartments()
  }

  /* Toggle active status */
  const handleToggleStatus = async () => {
    if (!confirmTarget) return
    try {
      await axios.delete(`${API}/departments/${confirmTarget.id}`, { headers: headers() })
      setConfirmTarget(null)
      fetchDepartments()
    } catch (err) {
      setConfirmTarget(null)
      setError(err.response?.data?.message || 'Failed to update status.')
    }
  }

  return (
    <div className="dash-layout">
      <Sidebar role="admin" />

      <main className="dash-main">
        {/* Header */}
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Department Management</h1>
            <p className="dash-subtitle">
              {departments.length} department{departments.length !== 1 ? 's' : ''} registered
            </p>
          </div>
          <button className="dash-btn" onClick={handleAdd} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Plus size={16} />
            Add Department
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div
              style={{
                width: 36,
                height: 36,
                border: '3px solid rgba(99,88,252,0.15)',
                borderTopColor: '#6358fc',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 1rem',
              }}
            />
            <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>Loading departments…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 12,
              padding: '1.25rem 1.5rem',
              marginBottom: '1.5rem',
            }}
          >
            <p style={{ color: '#f87171', margin: 0, fontSize: '0.875rem' }}>{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && departments.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <Building2 size={48} style={{ color: '#1e293b', marginBottom: '1rem' }} />
            <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0 0 0.5rem' }}>
              No departments found
            </p>
            <p style={{ color: '#475569', fontSize: '0.82rem', margin: 0 }}>
              Click "Add Department" to create the first one.
            </p>
          </div>
        )}

        {/* Department Table */}
        {!loading && departments.length > 0 && (
          <div className="dash-section">
            <div className="table-wrapper">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Description</th>
                    <th>Doctors</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept) => (
                    <tr key={dept.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 10,
                              background: dept.isActive
                                ? 'rgba(99, 88, 252, 0.12)'
                                : 'rgba(100, 116, 139, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Building2
                              size={16}
                              style={{ color: dept.isActive ? '#818cf8' : '#64748b' }}
                            />
                          </div>
                          <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{dept.name}</span>
                        </div>
                      </td>
                      <td className="td-muted">
                        {dept.description
                          ? dept.description.length > 60
                            ? dept.description.slice(0, 60) + '…'
                            : dept.description
                          : '—'}
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: 600,
                            color: dept.doctorCount > 0 ? '#818cf8' : '#475569',
                          }}
                        >
                          {dept.doctorCount ?? 0}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            dept.isActive ? 'status-green' : 'status-red'
                          }`}
                        >
                          {dept.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button
                            className="dash-btn dash-btn--sm"
                            onClick={() => handleEdit(dept)}
                            title="Edit department"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <Pencil size={13} />
                            Edit
                          </button>
                          <button
                            className={`dash-btn dash-btn--sm ${
                              dept.isActive ? 'dash-btn--danger' : 'dash-btn--accept'
                            }`}
                            onClick={() => setConfirmTarget(dept)}
                            title={dept.isActive ? 'Deactivate department' : 'Activate department'}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <Trash2 size={13} />
                            {dept.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create / Edit Modal */}
        {showForm && (
          <DepartmentFormModal
            department={editingDept}
            onClose={() => {
              setShowForm(false)
              setEditingDept(null)
            }}
            onSaved={handleSaved}
          />
        )}

        {/* Confirm Toggle Modal */}
        {confirmTarget && (
          <ConfirmModal
            message={
              confirmTarget.isActive
                ? `Are you sure you want to deactivate "${confirmTarget.name}"? It will no longer be visible to users.`
                : `Are you sure you want to reactivate "${confirmTarget.name}"?`
            }
            onConfirm={handleToggleStatus}
            onCancel={() => setConfirmTarget(null)}
          />
        )}
      </main>
    </div>
  )
}

export default AdminDepartments
