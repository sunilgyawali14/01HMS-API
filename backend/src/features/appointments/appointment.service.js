import Appointment from './appointment.model.js';
import Patient from '../patient/patient.model.js';
import Doctor from '../doctor/doctor.models.js';
import Department from '../departments/department.model.js';

const createAppointmentService = async (data, currentUser) => {
  const { doctorId, departmentId, appointmentDate, status } = data;
  let { patientId } = data;

  if (currentUser.roles === 'patient') {
    const patient = await Patient.findOne({ where: { userId: currentUser.id } });
    if (!patient) {
      throw { status: 404, message: 'Patient profile not found. Create your profile first' };
    }
    patientId = patient.id;
  } else {
    if (!patientId) {
      throw { status: 400, message: 'patientId is required' };
    }
  }

  const patient = await Patient.findByPk(patientId);
  if (!patient) {
    throw { status: 404, message: `Patient with id ${patientId} does not exist` };
  }

  const doctor = await Doctor.findByPk(doctorId);
  if (!doctor) {
    throw { status: 404, message: `Doctor with id ${doctorId} does not exist` };
  }

  const department = await Department.findByPk(departmentId);
  if (!department) {
    throw { status: 404, message: `Department with id ${departmentId} does not exist` };
  }

  if (!department.isActive) {
    throw { status: 400, message: 'Department is not active' };
  }

  const date = new Date(appointmentDate);
  if (isNaN(date.getTime())) {
    throw { status: 400, message: 'Invalid appointmentDate format. Use ISO 8601 format' };
  }

  if (date <= new Date()) {
    throw { status: 400, message: 'appointmentDate must be in the future' };
  }

  const allowedStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
  const appointmentStatus = status || 'pending';
  if (!allowedStatuses.includes(appointmentStatus)) {
    throw { status: 400, message: `status must be one of: ${allowedStatuses.join(', ')}` };
  }

  const duplicate = await Appointment.findOne({ where: { doctorId, appointmentDate: date } });
  if (duplicate) {
    throw { status: 400, message: 'Doctor already has an appointment at this time' };
  }

  const appointment = await Appointment.create({
    patientId,
    doctorId,
    departmentId,
    appointmentDate: date,
    status: appointmentStatus,
  });

  return appointment.toJSON();
};

export default createAppointmentService;