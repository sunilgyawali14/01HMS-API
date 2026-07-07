import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { connectionDB } from "./config/index.js";
import authRouter from "./features/auth/auth.routes.js";
import doctorRouter from "./features/doctor/doctor.routes.js";
import patientRouter from './features/patient/patient.routes.js';
import departmentRouter from './features/departments/department.route.js';
// import doctorDepartmentRouter from './features/doctorDepartment/doctorDepartment.route.js';
import appointmentRouter from "./features/appointments/appointment.route.js";
import receptionistRouter from './features/receptionist/receptionist.route.js';

const app = express();

app.use(express.json()); // this convert the json in to the object
await connectionDB();

app.use("/api/auth", authRouter);
app.use("/api/doctors", doctorRouter);
app.use("/api/patient", patientRouter);
app.use('/api/departments', departmentRouter);
// app.use('/api/doctor-departments', doctorDepartmentRouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api/receptionists', receptionistRouter);

const PORT = process.env.PORT || 9090;

app.listen(PORT, () => {
  // now server is created from this line
  console.log(`The server is Running in the PORT :${PORT}`);
});
