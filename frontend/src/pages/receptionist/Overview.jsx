import React from 'react'
import Sidebar from '../../components/Sidebar'

const statCards = [
  { label: 'Total Doctors', value: '18', sub: 'on staff', color: '#6358fc' },
  { label: 'Available Now', value: '11', sub: 'ready', color: '#10b981' },
  { label: 'Incoming Patients', value: '7', sub: 'today', color: '#f59e0b' },
  { label: 'Appointments Set', value: '42', sub: 'this week', color: '#ec4899' },
]

const recentActivity = [
  { action: 'Assigned Alice Johnson to Dr. Sarah Lee', time: '10 mins ago' },
  { action: 'Bob Martin checked in at reception', time: '25 mins ago' },
  { action: 'Dr. Mark Smith marked as unavailable', time: '1 hr ago' },
  { action: 'New appointment booked for Carol White', time: '2 hrs ago' },
]

const ReceptionistOverview = () => {
  return (
    <div className="dash-layout">
      <Sidebar role="receptionist" />
      <main className="dash-main">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Reception Desk 🏥</h1>
            <p className="dash-subtitle">7 patients waiting — 11 doctors available</p>
          </div>
          <div className="dash-avatar" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>R</div>
        </div>

        {/* Stat Cards */}
        <div className="stat-grid">
          {statCards.map((card) => (
            <div className="stat-card" key={card.label} style={{ '--card-color': card.color }}>
              <div className="stat-card-dot" style={{ background: card.color }} />
              <p className="stat-card-value" style={{ color: card.color }}>{card.value}</p>
              <p className="stat-card-label">{card.label}</p>
              <p className="stat-card-sub">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="dash-section">
          <h2 className="dash-section-title">Recent Activity</h2>
          <div className="activity-list">
            {recentActivity.map((item, i) => (
              <div className="activity-item" key={i}>
                <div className="activity-dot" />
                <div className="activity-content">
                  <p className="activity-action">{item.action}</p>
                  <p className="activity-time">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default ReceptionistOverview