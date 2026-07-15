import express from 'express';
import { authenticate, restrictTo } from '../middleware/auth.middleware.js';
import createPatient, { getMyProfile, updateMyProfile } from './patient.controller.js';

const patientRouter = express.Router();

// patient role: get / update their own profile
patientRouter.get("/me", authenticate, restrictTo('patient'), getMyProfile);
patientRouter.put("/me", authenticate, restrictTo('patient'), updateMyProfile);

// patient role: fills their own profile
// admin role: creates patient + user account from scratch
patientRouter.post("/", authenticate, restrictTo('patient', 'admin'), createPatient);

export default patientRouter;