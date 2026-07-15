import express from 'express';
import { authenticate, restrictTo } from '../middleware/auth.middleware.js';
import * as adminController from './admin.controller.js';

const adminRouter = express.Router();

adminRouter.use(authenticate, restrictTo('admin'));

adminRouter.get('/overview', adminController.getOverview);
adminRouter.get('/users/:role', adminController.getUsersByRole);
adminRouter.patch('/users/:id/toggle-status', adminController.toggleUserStatus);

export default adminRouter;
