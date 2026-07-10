import React, { useState } from 'react'
import Sidebar from '../../components/Sidebar'

const initialPatients = [
  { name: 'Alice Johnson', age: 34, issue: 'Chest pain', doctor: 'Dr. Sarah Lee', status: 'Waiting' },
  { name: 'Bob Martin', age: 52, issue: 'Shortness of breath', doctor: 'Unassigned', status: 'Waiting' },
  { name: 'Carol White', age: 28, issue: 'ECG review', doctor: 'Dr. Emily Chen', status: 'In Progress' },
  { name: 'David Brown', age: 61, issue: 'Post-surgery consult', doctor: 'Dr. James Patel', status: 'In Progress' },
  { name: 'Eva Green', age: 45, issue: 'Hypertension', doctor: 'Unassigned', status: 'Waiting' },
  { name: 'Frank Lee', age: 38, issue: 'Back pain', doctor: 'Dr. Alan Wang', status: 'Done' },
]

const IncomingPatients = () => {
  const [patients] = useState(initialPatients)
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All' ? patients : patients.filter((p) => p.status === filter)

  return (
    <div className="dash-layout">
      <Sidebar role="receptionist" />
      <main className="dash-main">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Incoming Patients</h1>
            <p className="dash-subtitle">Monitor and manage today's patient flow</p>
          </div>
          <div className="dash-avatar" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>R</div>
        </div>

        {/* Filter tabs */}
        <div className="filter-tabs">
          {['All', 'Waiting', 'In Progress', 'Done'].map((tab) => (
            <button
              key={tab}
              className={`filter-tab ${filter === tab ? 'filter-tab--active' : ''}`}
              onClick={() => setFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Patient table */}
        <div className="dash-section">
          <div className="table-wrapper">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Age</th>
                  <th>Issue</th>
                  <th>Assigned Doctor</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={i}>
                    <td>{row.name}</td>
                    <td className="td-muted">{row.age}</td>
                    <td className="td-muted">{row.issue}</td>
                    <td className={row.doctor === 'Unassigned' ? 'td-unassigned' : ''}>{row.doctor}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          row.status === 'Done'
                            ? 'status-green'
                            : row.status === 'In Progress'
                            ? 'status-purple'
                            : 'status-yellow'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td>
                      {row.doctor === 'Unassigned' && (
                        <button className="dash-btn dash-btn--sm">Assign</button>
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

export default IncomingPatients