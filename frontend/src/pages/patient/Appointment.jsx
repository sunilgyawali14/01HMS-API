import React, { useState } from 'react'
import Sidebar from '../../components/Sidebar'


const appointments = [
  { doctor: 'Dr. Sarah Lee', specialty: 'Cardiologist', date: 'Jul 10, 2026', time: '10:00 AM', status: 'Confirmed' },
  { doctor: 'Dr. Mark Smith', specialty: 'Dermatologist', date: 'Jul 14, 2026', time: '2:30 PM', status: 'Pending' },
  { doctor: 'Dr. Emily Chen', specialty: 'Neurologist', date: 'Jul 20, 2026', time: '11:00 AM', status: 'Confirmed' },
  { doctor: 'Dr. James Patel', specialty: 'Orthopedic', date: 'Jun 5, 2026', time: '9:00 AM', status: 'Completed' },
  { doctor: 'Dr. Lisa Roy', specialty: 'Dentist', date: 'May 22, 2026', time: '3:00 PM', status: 'Completed' },
]

const PatientAppointment = () => {
  const [filter, setFilter] = useState('All')
  const tabs = ['All', 'Confirmed', 'Pending', 'Completed']

  const filtered = filter === 'All' ? appointments : appointments.filter((a) => a.status === filter)

  return (
    <div className="dash-layout">
      <Sidebar role="patient" />
      <main className="dash-main">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">My Appointments</h1>
            <p className="dash-subtitle">Track all your scheduled and past visits</p>
          </div>
          <div className="dash-avatar">J</div>
        </div>

        {/* Tabs */}
        <div className="filter-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`filter-tab ${filter === tab ? 'filter-tab--active' : ''}`}
              onClick={() => setFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="dash-section">
          <div className="table-wrapper">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Specialty</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={i}>
                    <td>{row.doctor}</td>
                    <td className="td-muted">{row.specialty}</td>
                    <td>{row.date}</td>
                    <td className="td-muted">{row.time}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          row.status === 'Confirmed'
                            ? 'status-green'
                            : row.status === 'Pending'
                            ? 'status-yellow'
                            : 'status-grey'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td>
                      {row.status !== 'Completed' && (
                        <button className="dash-btn dash-btn--sm dash-btn--danger">Cancel</button>
                      )}
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

export default PatientAppointment