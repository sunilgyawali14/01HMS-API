import * as doctorDepartmentService from './doctorDepartment.service.js';

// POST /api/doctor-departments — Assign doctor to department
export const createDoctorDepartment = async (req, res) => {
  try {
    const { doctorId, departmentId, role, joinedAt } = req.body;

    const missingFields = ['doctorId', 'departmentId'].filter(
      (field) => req.body[field] === undefined || req.body[field] === null || req.body[field] === ''
    );
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    if (!Number.isInteger(Number(doctorId)) || Number(doctorId) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'doctorId must be a valid positive integer',
      });
    }

    if (!Number.isInteger(Number(departmentId)) || Number(departmentId) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'departmentId must be a valid positive integer',
      });
    }

    const allowedRoles = ['head', 'senior', 'junior'];
    if (role && !allowedRoles.includes(role.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "role must be one of: 'head', 'senior', 'junior'",
      });
    }

    const doctorDepartment = await doctorDepartmentService.createDoctorDepartmentService({
      doctorId: Number(doctorId),
      departmentId: Number(departmentId),
      role: role ? role.toLowerCase() : undefined,
      joinedAt,
    });

    return res.status(201).json({
      success: true,
      message: 'Doctor assigned to department successfully',
      data: { doctorDepartment },
    });
  } catch (error) {
    console.error('Error in createDoctorDepartment controller:', error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

// GET /api/doctor-departments — Get all assignments
export const getAllDoctorDepartments = async (req, res) => {
  try {
    const assignments = await doctorDepartmentService.getAllDoctorDepartmentsService();
    return res.status(200).json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    console.error('Error in getAllDoctorDepartments controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// GET /api/doctor-departments/department/:departmentId — Get doctors by department
export const getDoctorsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const data = await doctorDepartmentService.getDoctorsByDepartmentService(Number(departmentId));
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error in getDoctorsByDepartment controller:', error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

// GET /api/doctor-departments/doctor/:doctorId — Get departments by doctor
export const getDepartmentsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const data = await doctorDepartmentService.getDepartmentsByDoctorService(Number(doctorId));
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error in getDepartmentsByDoctor controller:', error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

// PUT /api/doctor-departments/:id — Update assignment role
export const updateDoctorDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = ['head', 'senior', 'junior'];
    if (role && !allowedRoles.includes(role.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "role must be one of: 'head', 'senior', 'junior'",
      });
    }

    const updated = await doctorDepartmentService.updateDoctorDepartmentService(
      Number(id),
      { role: role ? role.toLowerCase() : undefined }
    );

    return res.status(200).json({
      success: true,
      message: 'Assignment updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Error in updateDoctorDepartment controller:', error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

// DELETE /api/doctor-departments/:id — Remove assignment
export const deleteDoctorDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await doctorDepartmentService.deleteDoctorDepartmentService(Number(id));
    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error in deleteDoctorDepartment controller:', error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};