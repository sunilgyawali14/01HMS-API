import express from 'express';
import { authenticate, restrictTo } from '../middleware/auth.middleware.js';
import createDoctorDepartment from './doctorDepartment.controller.js';

const doctorDepartmentRouter = express.Router();

doctorDepartmentRouter.post('/', authenticate, restrictTo('admin'), createDoctorDepartment);

export default doctorDepartmentRouter;