import dotenv from "dotenv";
dotenv.config();
import sequelize from "../config/connection.js";
import User from "../features/user/user.model.js";
import Doctor from "../features/doctor/doctor.models.js";
import Department from "../features/departments/department.model.js";
import DoctorDepartment from "../features/doctorDepartment/doctorDepartment.model.js";
import bcrypt from "bcrypt";

const DOCTORS = [
  {
    firstName: "Sarah",
    lastName: "Jenkins",
    email: "sarah.jenkins@hospital.com",
    phone: "+9779800000001",
    password: "password123",
    specialization: "Cardiologist",
    qualification: "MD, DM Cardiology",
    experienceYears: 12,
    licenseNumber: "NMC-1001",
    gender: "female",
    status: "active",
    departmentName: "Cardiology",
    role: "head"
  },
  {
    firstName: "David",
    lastName: "Chen",
    email: "david.chen@hospital.com",
    phone: "+9779800000002",
    password: "password123",
    specialization: "Neurologist",
    qualification: "MD, Neurology",
    experienceYears: 8,
    licenseNumber: "NMC-1002",
    gender: "male",
    status: "active",
    departmentName: "Neurology",
    role: "senior"
  },
  {
    firstName: "Emily",
    lastName: "Carter",
    email: "emily.carter@hospital.com",
    phone: "+9779800000003",
    password: "password123",
    specialization: "Pediatrician",
    qualification: "MD, Pediatrics",
    experienceYears: 5,
    licenseNumber: "NMC-1003",
    gender: "female",
    status: "active",
    departmentName: "Pediatrics",
    role: "junior"
  },
  {
    firstName: "Michael",
    lastName: "Rodriguez",
    email: "michael.rodriguez@hospital.com",
    phone: "+9779800000004",
    password: "password123",
    specialization: "General Surgeon",
    qualification: "MS, General Surgery",
    experienceYears: 15,
    licenseNumber: "NMC-1004",
    gender: "male",
    status: "active",
    departmentName: "General Surgery",
    role: "head"
  }
];

const seedDoctors = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    let createdCount = 0;

    for (const docData of DOCTORS) {
      // Check if user already exists
      const existingUser = await User.findOne({ where: { email: docData.email } });
      if (existingUser) {
        console.log(`  ⏭  Skipped (user already exists): Dr. ${docData.firstName} ${docData.lastName}`);
        continue;
      }

      const department = await Department.findOne({ where: { name: docData.departmentName } });
      if (!department) {
        console.log(`  ❌ Failed (department not found): ${docData.departmentName} for Dr. ${docData.firstName}`);
        continue;
      }

      const transaction = await sequelize.transaction();
      try {
        const hashPassword = await bcrypt.hash(docData.password, 10);
        
        const user = await User.create({
          name: `${docData.firstName} ${docData.lastName}`,
          email: docData.email,
          password: hashPassword,
          roles: "doctor"
        }, { transaction });

        const doctor = await Doctor.create({
          firstName: docData.firstName,
          lastName: docData.lastName,
          email: docData.email,
          phone: docData.phone,
          password: hashPassword,
          specialization: docData.specialization,
          qualification: docData.qualification,
          experienceYears: docData.experienceYears,
          licenseNumber: docData.licenseNumber,
          gender: docData.gender,
          status: docData.status,
          userId: user.id
        }, { transaction });

        await DoctorDepartment.create({
          doctorId: doctor.id,
          departmentId: department.id,
          role: docData.role
        }, { transaction });

        await transaction.commit();
        console.log(`  ✅ Created: Dr. ${docData.firstName} ${docData.lastName} (${docData.departmentName})`);
        createdCount++;
      } catch (err) {
        await transaction.rollback();
        console.error(`  ❌ Failed to create Dr. ${docData.firstName}:`, err.message);
      }
    }

    console.log(`\n👨‍⚕️ Doctor Seeding complete: ${createdCount} created.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedDoctors();
