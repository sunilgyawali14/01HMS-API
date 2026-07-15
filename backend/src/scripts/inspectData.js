import dotenv from "dotenv";
dotenv.config();
import sequelize from "../config/connection.js";
import User from "../features/user/user.model.js";
import Doctor from "../features/doctor/doctor.models.js";
import Department from "../features/departments/department.model.js";
import Appointment from "../features/appointments/appointment.model.js";

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected.");

    const users = await User.findAll();
    console.log("\n--- USERS ---");
    users.forEach(u => console.log(`ID: ${u.id}, Name: ${u.name}, Email: ${u.email}, Roles: ${u.roles}`));

    const doctors = await Doctor.findAll();
    console.log("\n--- DOCTORS ---");
    doctors.forEach(d => console.log(`ID: ${d.id}, Name: Dr. ${d.firstName} ${d.lastName}, Email: ${d.email}, UserId: ${d.userId}, Specialization: ${d.specialization}`));

    const appointments = await Appointment.findAll();
    console.log("\n--- APPOINTMENTS ---");
    appointments.forEach(a => console.log(`ID: ${a.id}, PatientId: ${a.patientId}, DoctorId: ${a.doctorId}, DeptId: ${a.departmentId}, Date: ${a.appointmentDate}, Status: ${a.status}`));

    process.exit(0);
  } catch (error) {
    console.error("Error inspecting data:", error);
    process.exit(1);
  }
};

run();
