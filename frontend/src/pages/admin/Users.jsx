import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { Users, UserCheck, UserX, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import Sidebar from '../../components/Sidebar'

const API = 'http://localhost:9090/api'

const roleConfig = {
  doctor: { title: 'Manage Doctors', label: 'doctors' },
  patient: { title: 'Manage Patients', label: 'patients' },
  receptionist: { title: 'Manage Receptionists', label: 'receptionists' },
}

const LIMIT = 10

export default function AdminUsers({ role }) {
  const [users, setUsers] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [togglingId, setTogglingId] = useState(null)

  const config = roleConfig[role] || roleConfig.doctor

  const fetchUsers = useCallback(async (currentPage) => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`${API}/admin/users/${role}`, {
        params: { page: currentPage, limit: LIMIT },
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      })
      const { users: list, total: t, pages, currentPage: cp } = res.data.data
      setUsers(list)
      setTotal(t)
      setTotalPages(pages)
      setPage(cp)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }, [role])

  useEffect(() => {
    setPage(1)
    fetchUsers(1)
  }, [role, fetchUsers])

  const handleToggle = async (userId) => {
    setTogglingId(userId)
    try {
      await axios.patch(
        `${API}/admin/users/${userId}/toggle-status`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
      )
      await fetchUsers(page)
    } catch (err) {
      console.error('Toggle failed:', err)
    } finally {
      setTogglingId(null)
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="dash-layout">
      <Sidebar role="admin" />
      <main className="dash-main">
        {/* Header */}
        <div className="dash-header">
          <div>
            <h1 className="dash-title">{config.title}</h1>
            <p className="dash-subtitle">
              {loading ? 'Loading...' : `${total} ${config.label} registered`}
            </p>
          </div>
          <div className="dash-avatar">
            <Users size={20} />
          </div>
        </div>

        {/* Content */}
        <div className="dash-section">
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', color: '#64748b', gap: '0.75rem' }}>
              <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '0.9rem' }}>Loading {config.label}...</span>
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#f87171' }}>
              <UserX size={36} style={{ marginBottom: '0.75rem', opacity: 0.6 }} />
              <p style={{ margin: 0, fontSize: '0.9rem' }}>{error}</p>
              <button
                className="dash-btn dash-btn--sm"
                style={{ marginTop: '1rem' }}
                onClick={() => fetchUsers(page)}
              >
                Retry
              </button>
            </div>
          ) : users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>
              <Users size={36} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
              <p style={{ margin: 0, fontSize: '0.9rem' }}>No {config.label} found</p>
            </div>
          ) : (
            <>
              <div className="table-wrapper">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Created Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td style={{ fontWeight: 600, color: '#f1f5f9' }}>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`status-badge ${user.isActive ? 'status-green' : 'status-red'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="td-muted">{formatDate(user.createdAt)}</td>
                        <td>
                          <div className="action-btns">
                            <button
                              className={`dash-btn dash-btn--sm ${user.isActive ? 'dash-btn--danger' : 'dash-btn--accept'}`}
                              onClick={() => handleToggle(user.id)}
                              disabled={togglingId === user.id}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                opacity: togglingId === user.id ? 0.6 : 1,
                              }}
                            >
                              {togglingId === user.id ? (
                                <>
                                  <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                                  <span>Wait...</span>
                                </>
                              ) : user.isActive ? (
                                <>
                                  <UserX size={14} />
                                  <span>Deactivate</span>
                                </>
                              ) : (
                                <>
                                  <UserCheck size={14} />
                                  <span>Activate</span>
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '1rem',
                  marginTop: '1.5rem',
                }}>
                  <button
                    className="dash-btn dash-btn--sm"
                    onClick={() => fetchUsers(page - 1)}
                    disabled={page <= 1}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      opacity: page <= 1 ? 0.4 : 1,
                      cursor: page <= 1 ? 'not-allowed' : 'pointer',
                      background: 'rgba(255,255,255,0.06)',
                      boxShadow: 'none',
                      color: '#cbd5e1',
                    }}
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>

                  <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>
                    Page {page} of {totalPages}
                  </span>

                  <button
                    className="dash-btn dash-btn--sm"
                    onClick={() => fetchUsers(page + 1)}
                    disabled={page >= totalPages}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      opacity: page >= totalPages ? 0.4 : 1,
                      cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                      background: 'rgba(255,255,255,0.06)',
                      boxShadow: 'none',
                      color: '#cbd5e1',
                    }}
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
