import React from 'react'
import Sidebar from '../../components/Sidebar'

const statCards = [
  { label: 'Total Patients', value: '24', sub: 'this week', color: '#10b981' },
  { label: 'Pending Requests', value: '5', sub: 'awaiting', color: '#f59e0b' },
  { label: 'Completed', value: '19', sub: 'this week', color: '#6358fc' },
  { label: 'Avg. Rating', value: '4.8', sub: 'out of 5', color: '#ec4899' },
]

const todaySchedule = [
  { time: '9:00 AM', patient: 'Alice Johnson', reason: 'Chest pain follow-up' },
  { time: '10:30 AM', patient: 'Bob Martin', reason: 'Routine checkup' },
  { time: '12:00 PM', patient: 'Carol White', reason: 'ECG review' },
  { time: '3:00 PM', patient: 'David Brown', reason: 'Post-surgery consult' },
]

const DoctorOverview = () => {
  return (
    <div className="dash-layout">
      <Sidebar role="doctor" />
      <main className="dash-main">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Welcome, Dr. Sarah 👨‍⚕️</h1>
            <p className="dash-subtitle">You have 5 pending patient requests today</p>
          </div>
          <div className="dash-avatar" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>S</div>
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

        {/* Today's Schedule */}
        <div className="dash-section">
          <h2 className="dash-section-title">Today's Schedule</h2>
          <div className="table-wrapper">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Patient</th>
                  <th>Reason</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {todaySchedule.map((row, i) => (
                  <tr key={i}>
                    <td><span className="time-badge">{row.time}</span></td>
                    <td>{row.patient}</td>
                    <td className="td-muted">{row.reason}</td>
                    <td>
                      <button className="dash-btn dash-btn--sm">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DoctorOverview