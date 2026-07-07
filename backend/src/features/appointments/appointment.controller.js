import createAppointmentService from './appointment.service.js';

const createAppointment = async (req, res) => {
  try {
    const { doctorId, departmentId, appointmentDate, patientId, status } = req.body;
    const isPatientRole = req.user.roles === 'patient';

    const requiredFields = ['doctorId', 'departmentId', 'appointmentDate'];
    if (!isPatientRole) {
      requiredFields.push('patientId');
    }

    const missingFields = requiredFields.filter(
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

    if (!isPatientRole && (!Number.isInteger(Number(patientId)) || Number(patientId) <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'patientId must be a valid positive integer',
      });
    }

    const appointment = await createAppointmentService(
      {
        doctorId: Number(doctorId),
        departmentId: Number(departmentId),
        appointmentDate,
        patientId: patientId ? Number(patientId) : undefined,
        status,
      },
      req.user
    );

    return res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: { appointment },
    });
  } catch (error) {
    console.error('Error in createAppointment controller:', error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

export default createAppointment;