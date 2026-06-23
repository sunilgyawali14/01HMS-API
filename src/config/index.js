import sequelize from "../config/connection.js";
import User from "../features/user/user.model.js";
import Appointment from "../features/appointments/appointment.model.js";
import Patient from "../features/patient/patient.model.js";
import DoctorDepartment from "../features/doctorDepartment/doctorDepartment.model.js";
import Department from "../features/departments/department.model.js";
import Doctor from "../features/doctor/doctor.models.js";
import Receptionists from "../features/receptionist/receptionist.model.js";

//=========User's Association================
User.hasOne(Doctor, { foreignKey: "userId", onDelete: "CASCADE" });
Doctor.belongsTo(User, { foreignKey: "userId" });

User.hasOne(Patient, { foreignKey: "userId", onDelete: "CASCADE" });
Patient.belongsTo(User, { foreignKey: "userId" });

User.hasOne(Receptionists, { foreignKey: "userId", onDelete: "CASCADE" });
Receptionists.belongsTo(User, { foreignKey: "userId" });

Doctor.belongsToMany(Department, {
  through: DoctorDepartment,
  foreignKey: "doctorId",
  otherKey: "departmentId",
});
Department.belongsToMany(Doctor, {
  through: DoctorDepartment,
  foreignKey: "departmentId",
  otherKey: "doctorId",
});

// DoctorDepartment direct associations (for querying junction table directly)
DoctorDepartment.belongsTo(Doctor, { foreignKey: "doctorId" });
DoctorDepartment.belongsTo(Department, { foreignKey: "departmentId" });
Doctor.hasMany(DoctorDepartment, { foreignKey: "doctorId" });
Department.hasMany(DoctorDepartment, { foreignKey: "departmentId" });

// ========== APPOINTMENT associations ==========
// Patient -> Appointments
Patient.hasMany(Appointment, { foreignKey: "patientId", onDelete: "CASCADE" });
Appointment.belongsTo(Patient, { foreignKey: "patientId" });

// Doctor -> Appointments
Doctor.hasMany(Appointment, { foreignKey: "doctorId", onDelete: "CASCADE" });
Appointment.belongsTo(Doctor, { foreignKey: "doctorId" });

// Department -> Appointments
Department.hasMany(Appointment, {
  foreignKey: "departmentId",
  onDelete: "SET NULL",
});
Appointment.belongsTo(Department, { foreignKey: "departmentId" });
const connectionDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");

    await sequelize.sync({
      force: false,
    });

    console.log("Database synchronized successfully");
  } catch (error) {
    console.log("Database connection failed", error);
  }
};

export { connectionDB, sequelize };
