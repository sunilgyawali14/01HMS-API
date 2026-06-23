import express from 'express';
import { authenticate, restrictTo } from '../middleware/auth.middleware.js';
import createPatient from './patient.controller.js';

const patientRouter = express.Router();

// patient role: fills their own profile
// admin role: creates patient + user account from scratch
patientRouter.post("/", authenticate, restrictTo('patient', 'admin'), createPatient);

export default patientRouter;