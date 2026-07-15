import express from 'express';
import { authenticate, restrictTo } from '../middleware/auth.middleware.js';
import * as departmentController from './department.controller.js';

const departmentRouter = express.Router();

departmentRouter.post('/', authenticate, restrictTo('admin'), departmentController.createDepartment);
departmentRouter.get('/', authenticate, restrictTo('admin', 'patient', 'receptionist'), departmentController.getDepartments);
departmentRouter.put('/:id', authenticate, restrictTo('admin'), departmentController.updateDepartment);
departmentRouter.delete('/:id', authenticate, restrictTo('admin'), departmentController.deleteDepartment);

export default departmentRouter;