import { Routes, Route } from 'react-router-dom'
import './App.css'
import LandingPage from './components/LandingPage'
import Register from './pages/auth/Register'
import Login from './Pages/auth/Login'

// Patient
import PatientOverview    from './pages/patient/Overview'
import PatientDoctors     from './pages/patient/Doctors'
import PatientAppointment from './pages/patient/Appointment'

// Doctor
import DoctorOverview   from './pages/doctor/Overview'
import PatientRequests  from './pages/doctor/PatientRequests'

// Receptionist
import ReceptionistOverview from './pages/receptionist/Overview'
import AvailableDoctors     from './pages/receptionist/AvailableDoctors'
import IncomingPatients     from './pages/receptionist/IncomingPatients'

function App() {
  return (
    <>
      <Routes>
        <Route path='/'        element={<LandingPage />} />
        <Route path='/register' element={<Register />} />
        <Route path='/login'   element={<Login />} />

        {/* Patient */}
        <Route path='/patient/overview'    element={<PatientOverview />} />
        <Route path='/patient/doctors'     element={<PatientDoctors />} />
        <Route path='/patient/appointment' element={<PatientAppointment />} />

        {/* Doctor */}
        <Route path='/doctor/overview' element={<DoctorOverview />} />
        <Route path='/doctor/requests' element={<PatientRequests />} />

        {/* Receptionist */}
        <Route path='/receptionist/overview' element={<ReceptionistOverview />} />
        <Route path='/receptionist/doctors'  element={<AvailableDoctors />} />
        <Route path='/receptionist/patients' element={<IncomingPatients />} />
      </Routes>
    </>
  )
}

export default App