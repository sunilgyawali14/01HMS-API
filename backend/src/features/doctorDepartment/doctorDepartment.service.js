import Doctor from "../doctor/doctor.models.js";
import Department from "../departments/department.model.js";
import DoctorDepartment from "./doctorDepartment.model.js";

// Assign a doctor to a department
export const createDoctorDepartmentService = async ({
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

// Get all doctor-department assignments
export const getAllDoctorDepartmentsService = async () => {
  const assignments = await DoctorDepartment.findAll({
    include: [
      { model: Doctor, attributes: ["id", "firstName", "lastName", "specialization", "status"] },
      { model: Department, attributes: ["id", "name", "isActive"] },
    ],
    order: [["createdAt", "DESC"]],
  });

  return assignments;
};

// Get all doctors in a specific department
export const getDoctorsByDepartmentService = async (departmentId) => {
  const department = await Department.findByPk(departmentId);
  if (!department) {
    throw { status: 404, message: "Department not found" };
  }

  const assignments = await DoctorDepartment.findAll({
    where: { departmentId },
    include: [
      {
        model: Doctor,
        attributes: [
          "id",
          "firstName",
          "lastName",
          "specialization",
          "qualification",
          "experienceYears",
          "consultationFee",
          "status",
          "profileImage",
          "availableDays",
        ],
      },
    ],
  });

  return {
    department: department.toJSON(),
    doctors: assignments.map((a) => ({
      ...a.Doctor.toJSON(),
      role: a.role,
      joinedAt: a.joinedAt,
    })),
  };
};

// Get all departments for a specific doctor
export const getDepartmentsByDoctorService = async (doctorId) => {
  const doctor = await Doctor.findByPk(doctorId);
  if (!doctor) {
    throw { status: 404, message: "Doctor not found" };
  }

  const assignments = await DoctorDepartment.findAll({
    where: { doctorId },
    include: [
      { model: Department, attributes: ["id", "name", "description", "isActive"] },
    ],
  });

  return {
    doctor: {
      id: doctor.id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
    },
    departments: assignments.map((a) => ({
      ...a.Department.toJSON(),
      role: a.role,
      joinedAt: a.joinedAt,
    })),
  };
};

// Update a doctor-department assignment (change role)
export const updateDoctorDepartmentService = async (id, { role }) => {
  const assignment = await DoctorDepartment.findByPk(id);
  if (!assignment) {
    throw { status: 404, message: "Doctor-department assignment not found" };
  }

  if (role) {
    assignment.role = role;
  }

  await assignment.save();
  return assignment.toJSON();
};

// Remove a doctor from a department
export const deleteDoctorDepartmentService = async (id) => {
  const assignment = await DoctorDepartment.findByPk(id);
  if (!assignment) {
    throw { status: 404, message: "Doctor-department assignment not found" };
  }

  await assignment.destroy();
  return { message: "Doctor removed from department successfully" };
};
