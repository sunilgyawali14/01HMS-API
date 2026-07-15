import Appointment from './appointment.model.js';
import Patient from '../patient/patient.model.js';
import Doctor from '../doctor/doctor.models.js';
import Department from '../departments/department.model.js';

import { Op } from 'sequelize';

export const createAppointmentService = async (data, currentUser) => {
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

export const getAppointmentsService = async ({ status, startDate, endDate, page, limit }, currentUser) => {
  const offset = (page - 1) * limit;
  const where = {};

  // --- ADDED: Enforce role-based scoping so users only see their own records ---
  if (currentUser) {
    if (currentUser.roles === 'patient') {
      const patient = await Patient.findOne({ where: { userId: currentUser.id } });
      if (!patient) {
        return {
          total: 0,
          pages: 1,
          currentPage: page,
          appointments: [],
        };
      }
      where.patientId = patient.id;
    } else if (currentUser.roles === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: currentUser.id } });
      if (!doctor) {
        return {
          total: 0,
          pages: 1,
          currentPage: page,
          appointments: [],
        };
      }
      where.doctorId = doctor.id;
    }
  }

  if (status) {
    where.status = status;
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    where.appointmentDate = {
      [Op.between]: [start, end],
    };
  } else if (startDate) {
    where.appointmentDate = {
      [Op.gte]: new Date(startDate),
    };
  } else if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    where.appointmentDate = {
      [Op.lte]: end,
    };
  }

  const { count, rows } = await Appointment.findAndCountAll({
    where,
    limit,
    offset,
    order: [['appointmentDate', 'DESC']],
    include: [
      { model: Doctor, attributes: ['firstName', 'lastName'] },
      { model: Patient, attributes: ['firstName', 'lastName'] },
      { model: Department, attributes: ['name'] }
    ]
  });

  return {
    total: count,
    pages: Math.ceil(count / limit),
    currentPage: page,
    appointments: rows,
  };
};

// --- ADDED: Handle role-based status updates for appointments ---
export const updateAppointmentStatusService = async (id, status, currentUser) => {
  const allowedStatuses = ['pending', 'assigned', 'confirmed', 'rejected', 'completed', 'cancelled'];
  if (!allowedStatuses.includes(status)) {
    throw { status: 400, message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` };
  }

  const appointment = await Appointment.findByPk(id);
  if (!appointment) {
    throw { status: 404, message: 'Appointment not found' };
  }

  // Admin cannot change appointment status directly
  if (currentUser.roles === 'admin') {
    throw { status: 403, message: 'Admin users are not allowed to update appointment status' };
  }

  // Patients can only cancel their own appointments
  if (currentUser.roles === 'patient') {
    const patient = await Patient.findOne({ where: { userId: currentUser.id } });
    if (!patient || appointment.patientId !== patient.id) {
      throw { status: 403, message: 'You can only cancel your own appointments' };
    }
    if (status !== 'cancelled') {
      throw { status: 400, message: 'Patients can only cancel their appointments' };
    }
  }

  // Doctors can only confirm, reject, or complete their own appointments
  if (currentUser.roles === 'doctor') {
    const doctor = await Doctor.findOne({ where: { userId: currentUser.id } });
    if (!doctor || appointment.doctorId !== doctor.id) {
      throw { status: 403, message: 'You can only modify status for your own appointments' };
    }
    if (!['confirmed', 'rejected', 'completed'].includes(status)) {
      throw { status: 400, message: 'Doctors can only confirm, reject, or complete appointments' };
    }
  }

  // Receptionists are allowed to update any appointment (e.g. to 'assigned' or 'cancelled')
  if (currentUser.roles === 'receptionist') {
    if (!['assigned', 'cancelled'].includes(status)) {
       throw { status: 400, message: 'Receptionists can only assign or cancel appointments' };
    }
  }

  appointment.status = status;
  await appointment.save();

  // Load associations before returning
  const updated = await Appointment.findByPk(id, {
    include: [
      { model: Doctor, attributes: ['firstName', 'lastName'] },
      { model: Patient, attributes: ['firstName', 'lastName'] },
      { model: Department, attributes: ['name'] }
    ]
  });

  return updated.toJSON();
};

// --- ADDED: Assign a doctor to an appointment (Receptionist only) ---
export const assignAppointmentService = async (id, doctorId, currentUser) => {
  if (currentUser.roles !== 'receptionist') {
    throw { status: 403, message: 'Only receptionists can assign appointments' };
  }

  const appointment = await Appointment.findByPk(id);
  if (!appointment) {
    throw { status: 404, message: 'Appointment not found' };
  }

  const doctor = await Doctor.findByPk(doctorId);
  if (!doctor) {
    throw { status: 404, message: `Doctor with id ${doctorId} does not exist` };
  }

  appointment.doctorId = doctorId;
  appointment.status = 'assigned';
  await appointment.save();

  const updated = await Appointment.findByPk(id, {
    include: [
      { model: Doctor, attributes: ['firstName', 'lastName'] },
      { model: Patient, attributes: ['firstName', 'lastName'] },
      { model: Department, attributes: ['name'] }
    ]
  });

  return updated.toJSON();
};

// --- ADDED: Save clinical notes and prescription (Doctor only) ---
export const updateAppointmentNotesService = async (id, { clinicalNotes, prescription, report }, currentUser) => {
  if (currentUser.roles !== 'doctor') {
    throw { status: 403, message: 'Only doctors can add medical records to an appointment' };
  }

  const appointment = await Appointment.findByPk(id);
  if (!appointment) {
    throw { status: 404, message: 'Appointment not found' };
  }

  const doctor = await Doctor.findOne({ where: { userId: currentUser.id } });
  if (!doctor || appointment.doctorId !== doctor.id) {
    throw { status: 403, message: 'You can only add notes to your own appointments' };
  }

  if (clinicalNotes !== undefined) appointment.clinicalNotes = clinicalNotes;
  if (prescription !== undefined) appointment.prescription = prescription;
  if (report !== undefined) appointment.report = report;

  await appointment.save();

  return appointment.toJSON();
};