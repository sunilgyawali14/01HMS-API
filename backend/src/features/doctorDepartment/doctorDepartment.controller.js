import createDoctorDepartmentService from './doctorDepartment.service.js';

const createDoctorDepartment = async (req, res) => {
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

    const doctorDepartment = await createDoctorDepartmentService({
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

export default createDoctorDepartment;