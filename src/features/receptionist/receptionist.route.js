import express from 'express';
import { authenticate, restrictTo } from '../middleware/auth.middleware.js';
import createReceptionist from './receptionist.controller.js';

const receptionistRouter = express.Router();

receptionistRouter.post('/', authenticate, restrictTo('receptionist', 'admin'), createReceptionist);

export default receptionistRouter;