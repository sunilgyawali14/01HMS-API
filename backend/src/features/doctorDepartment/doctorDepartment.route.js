import express from 'express';
import { authenticate, restrictTo } from '../middleware/auth.middleware.js';
import * as doctorDepartmentController from './doctorDepartment.controller.js';

const doctorDepartmentRouter = express.Router();

// Admin only — assign a doctor to a department
doctorDepartmentRouter.post('/', authenticate, restrictTo('admin'), doctorDepartmentController.createDoctorDepartment);

// Admin — get all doctor-department assignments
doctorDepartmentRouter.get('/', authenticate, restrictTo('admin'), doctorDepartmentController.getAllDoctorDepartments);

// Any authenticated user — get doctors in a specific department (for appointment booking)
doctorDepartmentRouter.get('/department/:departmentId', authenticate, doctorDepartmentController.getDoctorsByDepartment);

// Any authenticated user — get departments for a specific doctor
doctorDepartmentRouter.get('/doctor/:doctorId', authenticate, doctorDepartmentController.getDepartmentsByDoctor);

// Admin only — update a doctor's role in a department
doctorDepartmentRouter.put('/:id', authenticate, restrictTo('admin'), doctorDepartmentController.updateDoctorDepartment);

// Admin only — remove a doctor from a department
doctorDepartmentRouter.delete('/:id', authenticate, restrictTo('admin'), doctorDepartmentController.deleteDoctorDepartment);

export default doctorDepartmentRouter;