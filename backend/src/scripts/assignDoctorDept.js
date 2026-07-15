import dotenv from "dotenv";
dotenv.config();
import sequelize from "../config/connection.js";
import Doctor from "../features/doctor/doctor.models.js";
import Department from "../features/departments/department.model.js";
import DoctorDepartment from "../features/doctorDepartment/doctorDepartment.model.js";
import { Op } from "sequelize";

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");

    // Find Doctor Apekshya Gyawali
    const doctor = await Doctor.findOne({
      where: {
        [Op.or]: [
          { firstName: { [Op.iLike]: "%Apekshya%" } },
          { lastName: { [Op.iLike]: "%Gyawali%" } }
        ]
      }
    });

    if (!doctor) {
      console.error("Doctor 'Apekshya Gyawali' not found in database.");
      process.exit(1);
    }
    console.log(`Found doctor: Dr. ${doctor.firstName} ${doctor.lastName} (ID: ${doctor.id}), Specialization: ${doctor.specialization}`);

    // Let's find departments
    const departments = await Department.findAll();
    console.log("Available departments in database:");
    departments.forEach(d => console.log(`- ID: ${d.id}, Name: ${d.name}`));

    // Let's find "General Surgery" and "Cardiology"
    const surgeryDept = departments.find(d => d.name.toLowerCase().includes("surgery") || d.name.toLowerCase().includes("surgain"));
    const cardiologyDept = departments.find(d => d.name.toLowerCase().includes("cardiology"));

    const deptsToAssign = [surgeryDept, cardiologyDept].filter(Boolean);

    for (const dept of deptsToAssign) {
      const existing = await DoctorDepartment.findOne({
        where: { doctorId: doctor.id, departmentId: dept.id }
      });

      if (existing) {
        console.log(`Already assigned to Department: ${dept.name}`);
      } else {
        await DoctorDepartment.create({
          doctorId: doctor.id,
          departmentId: dept.id,
          role: "senior"
        });
        console.log(`Successfully assigned Dr. ${doctor.firstName} to Department: ${dept.name}`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("Error running script:", error);
    process.exit(1);
  }
};

run();
