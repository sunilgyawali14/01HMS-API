import express from 'express';
import { authenticate, restrictTo } from '../middleware/auth.middleware.js';
import * as appointmentController from './appointment.controller.js';

const appointmentRouter = express.Router();

appointmentRouter.post('/', authenticate, restrictTo('patient', 'receptionist', 'admin'), appointmentController.createAppointment);
// --- MODIFIED: Allow all roles to fetch appointments (internally scoped) ---
appointmentRouter.get('/', authenticate, appointmentController.getAppointments);
// --- ADDED: Allow patient, doctor, and receptionist to update appointment status ---
appointmentRouter.patch('/:id/status', authenticate, restrictTo('patient', 'doctor', 'receptionist'), appointmentController.updateAppointmentStatus);
// --- ADDED: Allow receptionist to assign an appointment to a doctor ---
appointmentRouter.patch('/:id/assign', authenticate, restrictTo('receptionist'), appointmentController.assignAppointment);
// --- ADDED: Allow doctor to add clinical notes and prescription ---
appointmentRouter.patch('/:id/notes', authenticate, restrictTo('doctor'), appointmentController.updateAppointmentNotes);

export default appointmentRouter;