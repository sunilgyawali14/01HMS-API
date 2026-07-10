import React from 'react'
import Sidebar from '../../components/Sidebar'


const statCards = [
  { label: 'Appointments', value: '3', sub: 'upcoming', color: '#6358fc' },
  { label: 'Doctors Visited', value: '12', sub: 'total', color: '#10b981' },
  { label: 'Prescriptions', value: '8', sub: 'active', color: '#f59e0b' },
  { label: 'Reports', value: '5', sub: 'available', color: '#ec4899' },
]

const recentAppointments = [
  { doctor: 'Dr. Sarah Lee', specialty: 'Cardiologist', date: 'Jul 10, 2026', time: '10:00 AM', status: 'Confirmed' },
  { doctor: 'Dr. Mark Smith', specialty: 'Dermatologist', date: 'Jul 14, 2026', time: '2:30 PM', status: 'Pending' },
  { doctor: 'Dr. Emily Chen', specialty: 'Neurologist', date: 'Jul 20, 2026', time: '11:00 AM', status: 'Confirmed' },
]

const PatientOverview = () => {
  return (
    <div className="dash-layout">
      <Sidebar role="patient" />
      <main className="dash-main">
        {/* Header */}
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Good morning, John 👋</h1>
            <p className="dash-subtitle">Here's your health summary for today</p>
          </div>
          <div className="dash-avatar">J</div>
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

        {/* Recent Appointments */}
        <div className="dash-section">
          <h2 className="dash-section-title">Upcoming Appointments</h2>
          <div className="table-wrapper">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Specialty</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.map((row, i) => (
                  <tr key={i}>
                    <td>{row.doctor}</td>
                    <td className="td-muted">{row.specialty}</td>
                    <td>{row.date}</td>
                    <td className="td-muted">{row.time}</td>
                    <td>
                      <span className={`status-badge ${row.status === 'Confirmed' ? 'status-green' : 'status-yellow'}`}>
                        {row.status}
                      </span>
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

export default PatientOverview