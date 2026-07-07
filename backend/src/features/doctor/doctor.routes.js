import express from 'express';
import { createDoctor } from './doctor.controller.js';
import { authenticate, restrictTo } from "../middleware/auth.middleware.js";

const doctorRouter = express.Router();

// Only admin and doctor should be allowed to create a doctor
doctorRouter.post("/", authenticate, restrictTo('admin', 'doctor'), createDoctor);

export default doctorRouter;    