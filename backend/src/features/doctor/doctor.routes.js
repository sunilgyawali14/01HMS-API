import express from 'express';
import { createDoctor, getAllDoctors, getDoctorById, updateDoctor, deleteDoctor } from './doctor.controller.js';
import { authenticate, restrictTo } from "../middleware/auth.middleware.js";

const doctorRouter = express.Router();

// Only admin and doctor should be allowed to create a doctor
doctorRouter.post("/", authenticate, restrictTo('admin', 'doctor'), createDoctor);

// --- ADDED: Expose doctor listing and retrieval of doctors ---
doctorRouter.get("/", authenticate, getAllDoctors);
doctorRouter.get("/:id", authenticate, getDoctorById);
doctorRouter.put("/:id", authenticate, restrictTo('admin', 'doctor'), updateDoctor);
doctorRouter.delete("/:id", authenticate, restrictTo('admin'), deleteDoctor);

export default doctorRouter;    