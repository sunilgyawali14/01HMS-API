import { useState, useEffect } from 'react'
import axios from 'axios'
import Sidebar from '../../components/Sidebar'
import useAutoRefresh from '../../hooks/useAutoRefresh'
import LiveBadge from '../../components/LiveBadge'
import {
  Activity,
  Users,
  UserCheck,
  Building2,
  CalendarDays,
  CalendarRange,
  Loader2,
  AlertCircle,
} from 'lucide-react'

const API = 'http://localhost:9090/api'

/* ── tiny reusable spinner ── */
const Spinner = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
    }}
  >
    <Loader2
      size={36}
      style={{
        color: '#6358fc',
        animation: 'spin 1s linear infinite',
      }}
    />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
)

/* ── error banner ── */
const ErrorBanner = ({ message, onRetry }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      minHeight: '60vh',
      color: '#f87171',
    }}
  >
    <AlertCircle size={40} />
    <p style={{ fontSize: '0.95rem', margin: 0 }}>{message}</p>
    <button className="dash-btn" onClick={onRetry}>
      Retry
    </button>
  </div>
)

/* ── status config for monthly breakdown ── */
const STATUS_CONFIG = [
  { key: 'completed', label: 'Completed', color: '#10b981' },
  { key: 'confirmed', label: 'Confirmed', color: '#3b82f6' },
  { key: 'pending', label: 'Pending', color: '#f59e0b' },
  { key: 'cancelled', label: 'Cancelled', color: '#ef4444' },
]

/* ================================================================
   AdminOverview
   ================================================================ */
const AdminOverview = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchOverview = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`${API}/admin/overview`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('accessToken')}` },
      })
      setData(res.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOverview()
  }, [])

  const { lastUpdated } = useAutoRefresh(fetchOverview, 30000)

  /* helper: total monthly appointments */
  const monthlyTotal = data
    ? Object.values(data.appointmentsThisMonth).reduce((s, v) => s + v, 0)
    : 0

  /* ── stat‑card definitions (row 1) ── */
  const primaryCards = data
    ? [
        {
          icon: <UserCheck size={18} />,
          label: 'Total Doctors',
          value: data.totalDoctors,
          sub: 'Registered physicians',
          color: '#10b981',
        },
        {
          icon: <Users size={18} />,
          label: 'Total Patients',
          value: data.totalPatients,
          sub: 'Active patient records',
          color: '#6358fc',
        },
        {
          icon: <UserCheck size={18} />,
          label: 'Total Receptionists',
          value: data.totalReceptionists,
          sub: 'Front‑desk staff',
          color: '#f59e0b',
        },
        {
          icon: <Building2 size={18} />,
          label: 'Total Departments',
          value: data.totalDepartments,
          sub: 'Hospital departments',
          color: '#ec4899',
        },
      ]
    : []

  return (
    <div className="dash-layout">
      <Sidebar role="admin" />

      <main className="dash-main">
        {/* ── Header ── */}
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Admin Dashboard</h1>
            <p className="dash-subtitle">System overview and statistics</p>
            <LiveBadge lastUpdated={lastUpdated} />
          </div>
          <div className="dash-avatar">A</div>
        </div>

        {loading && <Spinner />}
        {error && <ErrorBanner message={error} onRetry={fetchOverview} />}

        {!loading && !error && data && (
          <>
            {/* ── Row 1 — primary stat cards ── */}
            <div className="stat-grid">
              {primaryCards.map((card, i) => (
                <div
                  className="stat-card"
                  key={card.label}
                  style={{
                    animation: `fadeSlideUp 0.45s ${i * 0.08}s both`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.85rem',
                    }}
                  >
                    <div
                      className="stat-card-dot"
                      style={{ background: card.color, margin: 0 }}
                    />
                    <span style={{ color: card.color, opacity: 0.7 }}>
                      {card.icon}
                    </span>
                  </div>
                  <p
                    className="stat-card-value"
                    style={{ color: card.color }}
                  >
                    {card.value}
                  </p>
                  <p className="stat-card-label">{card.label}</p>
                  <p className="stat-card-sub">{card.sub}</p>
                </div>
              ))}
            </div>

            {/* ── Row 2 — Appointments Today + This Month ── */}
            <div
              className="stat-grid"
              style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}
            >
              {/* Today */}
              <div
                className="stat-card"
                style={{ animation: 'fadeSlideUp 0.45s 0.35s both' }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.85rem',
                  }}
                >
                  <div
                    className="stat-card-dot"
                    style={{ background: '#3b82f6', margin: 0 }}
                  />
                  <CalendarDays size={18} style={{ color: '#3b82f6', opacity: 0.7 }} />
                </div>
                <p className="stat-card-value" style={{ color: '#3b82f6' }}>
                  {data.appointmentsToday}
                </p>
                <p className="stat-card-label">Appointments Today</p>
                <p className="stat-card-sub">Scheduled for today</p>
              </div>

              {/* This Month summary */}
              <div
                className="stat-card"
                style={{ animation: 'fadeSlideUp 0.45s 0.42s both' }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.85rem',
                  }}
                >
                  <div
                    className="stat-card-dot"
                    style={{ background: '#8b5cf6', margin: 0 }}
                  />
                  <CalendarRange
                    size={18}
                    style={{ color: '#8b5cf6', opacity: 0.7 }}
                  />
                </div>
                <p className="stat-card-value" style={{ color: '#8b5cf6' }}>
                  {monthlyTotal}
                </p>
                <p className="stat-card-label">Appointments This Month</p>
                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                    marginTop: '0.55rem',
                  }}
                >
                  {STATUS_CONFIG.map((s) => (
                    <span
                      key={s.key}
                      className="status-badge"
                      style={{
                        background: `${s.color}22`,
                        color: s.color,
                      }}
                    >
                      {s.label}: {data.appointmentsThisMonth[s.key]}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Section: Monthly Appointments Breakdown ── */}
            <div className="dash-section">
              <h2 className="dash-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={18} style={{ color: '#6358fc' }} />
                Monthly Appointments Breakdown
              </h2>

              <div
                className="stat-card"
                style={{
                  padding: '1.5rem',
                  animation: 'fadeSlideUp 0.45s 0.5s both',
                }}
              >
                {/* stacked bar preview */}
                <div
                  style={{
                    display: 'flex',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    height: '10px',
                    marginBottom: '1.5rem',
                    background: 'rgba(255,255,255,0.05)',
                  }}
                >
                  {STATUS_CONFIG.map((s) => {
                    const pct =
                      monthlyTotal > 0
                        ? (data.appointmentsThisMonth[s.key] / monthlyTotal) * 100
                        : 0
                    return (
                      <div
                        key={s.key}
                        style={{
                          width: `${pct}%`,
                          background: s.color,
                          transition: 'width 0.8s ease',
                        }}
                      />
                    )
                  })}
                </div>

                {/* individual bars */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.1rem',
                  }}
                >
                  {STATUS_CONFIG.map((s, i) => {
                    const count = data.appointmentsThisMonth[s.key]
                    const pct =
                      monthlyTotal > 0
                        ? ((count / monthlyTotal) * 100).toFixed(1)
                        : '0.0'
                    return (
                      <div key={s.key}>
                        {/* label row */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '0.4rem',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                            }}
                          >
                            <span
                              style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                background: s.color,
                                display: 'inline-block',
                              }}
                            />
                            <span
                              style={{
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: '#cbd5e1',
                              }}
                            >
                              {s.label}
                            </span>
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '0.95rem',
                                fontWeight: 700,
                                color: s.color,
                              }}
                            >
                              {count}
                            </span>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                color: '#475569',
                                minWidth: '42px',
                                textAlign: 'right',
                              }}
                            >
                              {pct}%
                            </span>
                          </div>
                        </div>

                        {/* progress bar */}
                        <div
                          style={{
                            height: '6px',
                            borderRadius: '3px',
                            background: 'rgba(255,255,255,0.05)',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              borderRadius: '3px',
                              background: `linear-gradient(90deg, ${s.color}, ${s.color}cc)`,
                              width: `${pct}%`,
                              transition: 'width 0.8s ease',
                              animation: `barGrow 0.8s ${0.55 + i * 0.1}s both`,
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── keyframe animations ── */}
        <style>{`
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes barGrow {
            from { width: 0%; }
          }
        `}</style>
      </main>
    </div>
  )
}

export default AdminOverview
