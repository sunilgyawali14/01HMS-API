import express from 'express';
import { authenticate, restrictTo } from '../middleware/auth.middleware.js';
import createDepartment from './department.controller.js';

const departmentRouter = express.Router();

departmentRouter.post('/', authenticate, restrictTo('admin'), createDepartment);

export default departmentRouter;