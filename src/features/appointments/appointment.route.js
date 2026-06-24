import express from 'express';
import { authenticate, restrictTo } from '../middleware/auth.middleware.js';
import createAppointment from './appointment.controller.js';

const appointmentRouter = express.Router();

appointmentRouter.post('/', authenticate, restrictTo('patient', 'receptionist', 'admin'), createAppointment);

export default appointmentRouter;