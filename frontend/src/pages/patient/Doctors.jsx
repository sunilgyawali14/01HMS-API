import React, { useState } from 'react'
import Sidebar from '../../components/Sidebar'


const allDoctors = [
  { name: 'Dr. Sarah Lee', specialty: 'Cardiologist', experience: '12 yrs', rating: 4.9, available: true },
  { name: 'Dr. Mark Smith', specialty: 'Dermatologist', experience: '8 yrs', rating: 4.7, available: true },
  { name: 'Dr. Emily Chen', specialty: 'Neurologist', experience: '15 yrs', rating: 4.8, available: false },
  { name: 'Dr. James Patel', specialty: 'Orthopedic', experience: '10 yrs', rating: 4.6, available: true },
  { name: 'Dr. Lisa Roy', specialty: 'Dentist', experience: '6 yrs', rating: 4.5, available: false },
  { name: 'Dr. Alan Wang', specialty: 'Pediatrician', experience: '9 yrs', rating: 4.8, available: true },
]

const PatientDoctors = () => {
  const [search, setSearch] = useState('')

  const filtered = allDoctors.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="dash-layout">
      <Sidebar role="patient" />
      <main className="dash-main">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Find a Doctor</h1>
            <p className="dash-subtitle">Browse and book available specialists</p>
          </div>
          <div className="dash-avatar">J</div>
        </div>

        {/* Search */}
        <div className="search-bar-wrapper">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="search-bar"
            type="text"
            placeholder="Search by name or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Doctor Cards */}
        <div className="doctor-grid">
          {filtered.map((doc, i) => (
            <div className="doctor-card" key={i}>
              <div className="doctor-card-avatar">
                {doc.name.split(' ')[1][0]}{doc.name.split(' ')[2]?.[0] || ''}
              </div>
              <div className="doctor-card-info">
                <h3 className="doctor-card-name">{doc.name}</h3>
                <p className="doctor-card-spec">{doc.specialty}</p>
                <div className="doctor-card-meta">
                  <span className="doctor-card-exp">⏱ {doc.experience}</span>
                  <span className="doctor-card-rating">⭐ {doc.rating}</span>
                </div>
              </div>
              <span className={`status-badge ${doc.available ? 'status-green' : 'status-red'}`}>
                {doc.available ? 'Available' : 'Unavailable'}
              </span>
              <button
                className="dash-btn"
                disabled={!doc.available}
                style={!doc.available ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
              >
                Book
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default PatientDoctors