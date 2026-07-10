import React, { useState } from 'react'
import Sidebar from '../../components/Sidebar'

const allDoctors = [
  { name: 'Dr. Sarah Lee', specialty: 'Cardiologist', patients: 4, status: 'Available' },
  { name: 'Dr. Mark Smith', specialty: 'Dermatologist', patients: 2, status: 'Unavailable' },
  { name: 'Dr. Emily Chen', specialty: 'Neurologist', patients: 3, status: 'Available' },
  { name: 'Dr. James Patel', specialty: 'Orthopedic', patients: 5, status: 'Available' },
  { name: 'Dr. Lisa Roy', specialty: 'Dentist', patients: 1, status: 'Unavailable' },
  { name: 'Dr. Alan Wang', specialty: 'Pediatrician', patients: 3, status: 'Available' },
]

const AvailableDoctors = () => {
  const [filter, setFilter] = useState('All')

  const filtered =
    filter === 'All' ? allDoctors : allDoctors.filter((d) => d.status === filter)

  return (
    <div className="dash-layout">
      <Sidebar role="receptionist" />
      <main className="dash-main">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Available Doctors</h1>
            <p className="dash-subtitle">Manage doctor availability and assignments</p>
          </div>
          <div className="dash-avatar" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>R</div>
        </div>

        {/* Filter tabs */}
        <div className="filter-tabs">
          {['All', 'Available', 'Unavailable'].map((tab) => (
            <button
              key={tab}
              className={`filter-tab ${filter === tab ? 'filter-tab--active' : ''}`}
              onClick={() => setFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Doctor list table */}
        <div className="dash-section">
          <div className="table-wrapper">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Specialty</th>
                  <th>Current Patients</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc, i) => (
                  <tr key={i}>
                    <td>{doc.name}</td>
                    <td className="td-muted">{doc.specialty}</td>
                    <td className="td-muted">{doc.patients}</td>
                    <td>
                      <span className={`status-badge ${doc.status === 'Available' ? 'status-green' : 'status-red'}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="dash-btn dash-btn--sm"
                        disabled={doc.status !== 'Available'}
                        style={doc.status !== 'Available' ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                      >
                        Assign Patient
                      </button>
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

export default AvailableDoctors