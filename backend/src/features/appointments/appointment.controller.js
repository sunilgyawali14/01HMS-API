import * as appointmentService from './appointment.service.js';

export const createAppointment = async (req, res) => {
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

    const appointment = await appointmentService.createAppointmentService(
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

export const getAppointments = async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;
    // --- MODIFIED: Pass req.user to enforce role-based scoping ---
    const data = await appointmentService.getAppointmentsService({ 
      status, 
      startDate, 
      endDate, 
      page: parseInt(page), 
      limit: parseInt(limit) 
    }, req.user);
    
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error in getAppointments controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

// --- ADDED: Controller to handle appointment status transitions ---
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'status is required',
      });
    }

    const appointment = await appointmentService.updateAppointmentStatusService(
      Number(id),
      status,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: 'Appointment status updated successfully',
      data: { appointment },
    });
  } catch (error) {
    console.error('Error in updateAppointmentStatus controller:', error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

// --- ADDED: Controller to handle receptionist assigning an appointment ---
export const assignAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctorId } = req.body;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: 'doctorId is required',
      });
    }

    const appointment = await appointmentService.assignAppointmentService(
      Number(id),
      Number(doctorId),
      req.user
    );

    return res.status(200).json({
      success: true,
      message: 'Appointment assigned successfully',
      data: { appointment },
    });
  } catch (error) {
    console.error('Error in assignAppointment controller:', error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

// --- ADDED: Controller to handle doctor adding clinical notes ---
export const updateAppointmentNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { clinicalNotes, prescription, report } = req.body;

    const appointment = await appointmentService.updateAppointmentNotesService(
      Number(id),
      { clinicalNotes, prescription, report },
      req.user
    );

    return res.status(200).json({
      success: true,
      message: 'Medical records updated successfully',
      data: { appointment },
    });
  } catch (error) {
    console.error('Error in updateAppointmentNotes controller:', error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};