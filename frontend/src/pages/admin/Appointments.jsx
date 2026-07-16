import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { Calendar, Filter, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import useAutoRefresh from '../../hooks/useAutoRefresh'
import LiveBadge from '../../components/LiveBadge'

const API = 'http://localhost:9090/api'

const STATUS_TABS = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled']

const STATUS_BADGE_MAP = {
  pending: 'status-yellow',
  confirmed: 'status-purple',
  completed: 'status-green',
  cancelled: 'status-red',
}

const formatDate = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
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

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState('All')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, limit }
      if (statusFilter !== 'All') params.status = statusFilter.toLowerCase()
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const { data: res } = await axios.get(`${API}/appointments`, {
        params,
        headers: { Authorization: `Bearer ${sessionStorage.getItem('accessToken')}` },
      })

      if (res.success) {
        setAppointments(res.data.appointments)
        setTotalPages(res.data.pages)
        setTotal(res.data.total)
      } else {
        setAppointments([])
        setTotalPages(1)
        setTotal(0)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch appointments')
      setAppointments([])
      setTotalPages(1)
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, startDate, endDate, page])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  const { lastUpdated } = useAutoRefresh(fetchAppointments, 30000)

  // When any filter changes, reset to page 1
  const handleStatusChange = (tab) => {
    setStatusFilter(tab)
    setPage(1)
  }

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value)
    setPage(1)
  }

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value)
    setPage(1)
  }

  const handleClearFilters = () => {
    setStatusFilter('All')
    setStartDate('')
    setEndDate('')
    setPage(1)
  }

  const dateInputStyle = {
    padding: '0.5rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.09)',
    borderRadius: '10px',
    color: '#f1f5f9',
    fontSize: '0.82rem',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    colorScheme: 'dark',
  }

  return (
    <div className="dash-layout">
      <Sidebar role="admin" />
      <main className="dash-main">
        {/* Header */}
        <div className="dash-header">
          <div>
            <h1 className="dash-title">All Appointments</h1>
            <p className="dash-subtitle">Read-only system-wide appointment view</p>
            <LiveBadge lastUpdated={lastUpdated} />
          </div>
          <div className="dash-avatar" style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}>A</div>
        </div>

        {/* Filter controls */}
        <div className="filter-tabs">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              className={`filter-tab ${statusFilter === tab ? 'filter-tab--active' : ''}`}
              onClick={() => handleStatusChange(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <Calendar size={16} style={{ color: '#475569', flexShrink: 0 }} />
          <input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            placeholder="Start Date"
            style={dateInputStyle}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(99, 88, 252, 0.6)'
              e.target.style.boxShadow = '0 0 0 3px rgba(99, 88, 252, 0.12)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.09)'
              e.target.style.boxShadow = 'none'
            }}
          />
          <span style={{ color: '#475569', fontSize: '0.82rem' }}>to</span>
          <input
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            placeholder="End Date"
            style={dateInputStyle}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(99, 88, 252, 0.6)'
              e.target.style.boxShadow = '0 0 0 3px rgba(99, 88, 252, 0.12)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.09)'
              e.target.style.boxShadow = 'none'
            }}
          />
          {(statusFilter !== 'All' || startDate || endDate) && (
            <button
              className="dash-btn dash-btn--sm"
              onClick={handleClearFilters}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Filter size={13} />
              Clear Filters
            </button>
          )}
        </div>

        {/* Content */}
        <div className="dash-section">
          <div className="dash-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={16} />
            Appointments {!loading && <span style={{ color: '#475569', fontWeight: 400 }}>({total} total)</span>}
          </div>

          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 0' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  border: '3px solid rgba(255,255,255,0.07)',
                  borderTopColor: '#6358fc',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          ) : error ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                background: 'rgba(239, 68, 68, 0.06)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                borderRadius: '14px',
              }}
            >
              <p style={{ color: '#f87171', margin: '0 0 0.75rem', fontSize: '0.9rem', fontWeight: 600 }}>
                {error}
              </p>
              <button className="dash-btn dash-btn--sm" onClick={fetchAppointments}>
                Retry
              </button>
            </div>
          ) : appointments.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '4rem 1rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '14px',
              }}
            >
              <Calendar size={40} style={{ color: '#334155', marginBottom: '1rem' }} />
              <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>
                No appointments found matching your filters.
              </p>
            </div>
          ) : (
            <>
              <div className="table-wrapper">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Patient Name</th>
                      <th>Doctor Name</th>
                      <th>Department</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appt) => (
                      <tr key={appt.id}>
                        <td>{appt.Patient?.firstName} {appt.Patient?.lastName}</td>
                        <td>{appt.Doctor?.firstName} {appt.Doctor?.lastName}</td>
                        <td className="td-muted">{appt.Department?.name || '—'}</td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Calendar size={13} style={{ color: '#475569' }} />
                            {formatDate(appt.appointmentDate)}
                          </span>
                        </td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Clock size={13} style={{ color: '#475569' }} />
                            {formatTime(appt.appointmentDate)}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${STATUS_BADGE_MAP[appt.status] || 'status-grey'}`}>
                            {appt.status?.charAt(0).toUpperCase() + appt.status?.slice(1)}
                          </span>
                        </td>
                        <td className="td-muted">{formatDate(appt.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '1.25rem',
                  padding: '0.75rem 1rem',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '12px',
                }}
              >
                <button
                  className="dash-btn dash-btn--sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    opacity: page <= 1 ? 0.4 : 1,
                    cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <ChevronLeft size={15} />
                  Previous
                </button>

                <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 500 }}>
                  Page {page} of {totalPages}
                </span>

                <button
                  className="dash-btn dash-btn--sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    opacity: page >= totalPages ? 0.4 : 1,
                    cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                  }}
                >
                  Next
                  <ChevronRight size={15} />
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default AdminAppointments
