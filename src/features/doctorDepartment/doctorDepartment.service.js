import Doctor from "../doctor/doctor.models.js";
import Department from "../departments/department.model.js";
import DoctorDepartment from "./doctorDepartment.model.js";

const createDoctorDepartmentService = async ({
  doctorId,
  departmentId,
  role,
  joinedAt,
}) => {
  const doctor = await Doctor.findByPk(doctorId);
  if (!doctor) {
    throw { status: 404, message: `Doctor with id ${doctorId} does not exist` };
  }

  const department = await Department.findByPk(departmentId);
  if (!department) {
    throw {
      status: 404,
      message: `Department with id ${departmentId} does not exist`,
    };
  }

  const existing = await DoctorDepartment.findOne({
    where: { doctorId, departmentId },
  });
  if (existing) {
    throw {
      status: 400,
      message: "Doctor is already assigned to this department",
    };
  }

  const doctorDepartment = await DoctorDepartment.create({
    doctorId,
    departmentId,
    role: role || "junior",
    joinedAt: joinedAt || null,
  });

  return doctorDepartment.toJSON();
};

export default createDoctorDepartmentService;
