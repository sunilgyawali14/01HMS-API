import React, { useState } from 'react'
import Sidebar from '../../components/Sidebar'


const initialRequests = [
  { patient: 'Alice Johnson', age: 34, reason: 'Chest pain follow-up', date: 'Jul 8, 2026', status: 'Pending' },
  { patient: 'Bob Martin', age: 52, reason: 'Shortness of breath', date: 'Jul 8, 2026', status: 'Pending' },
  { patient: 'Carol White', age: 28, reason: 'ECG review', date: 'Jul 9, 2026', status: 'Pending' },
  { patient: 'David Brown', age: 61, reason: 'Post-surgery consult', date: 'Jul 9, 2026', status: 'Pending' },
  { patient: 'Eva Green', age: 45, reason: 'Hypertension follow-up', date: 'Jul 10, 2026', status: 'Pending' },
]

const PatientRequests = () => {
  const [requests, setRequests] = useState(initialRequests)

  const handleAction = (index, action) => {
    setRequests((prev) =>
      prev.map((r, i) => (i === index ? { ...r, status: action } : r))
    )
  }

  return (
    <div className="dash-layout">
      <Sidebar role="doctor" />
      <main className="dash-main">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Patient Requests</h1>
            <p className="dash-subtitle">Review and respond to incoming requests</p>
          </div>
          <div className="dash-avatar" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>S</div>
        </div>

        <div className="dash-section">
          <div className="table-wrapper">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Age</th>
                  <th>Reason</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((row, i) => (
                  <tr key={i}>
                    <td>{row.patient}</td>
                    <td className="td-muted">{row.age}</td>
                    <td className="td-muted">{row.reason}</td>
                    <td>{row.date}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          row.status === 'Accepted'
                            ? 'status-green'
                            : row.status === 'Rejected'
                            ? 'status-red'
                            : 'status-yellow'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td>
                      {row.status === 'Pending' ? (
                        <div className="action-btns">
                          <button
                            className="dash-btn dash-btn--sm dash-btn--accept"
                            onClick={() => handleAction(i, 'Accepted')}
                          >
                            Accept
                          </button>
                          <button
                            className="dash-btn dash-btn--sm dash-btn--danger"
                            onClick={() => handleAction(i, 'Rejected')}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="td-muted">—</span>
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

export default PatientRequests