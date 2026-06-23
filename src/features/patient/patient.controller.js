import createPatientService from './patient.service.js';

// POST /api/patient
const createPatient = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
    //   doctorId,
    } = req.body;

    const isPatientRole = req.user.roles === 'patient';

    // ── Required fields ────────────────────────────────────────────────
    const requiredFields = ['firstName', 'lastName', 'phone', 'dateOfBirth', 'gender'];
    // Admin must also supply email + password (patient uses their own)
    if (!isPatientRole) {
      requiredFields.push('email', 'password');
    }

    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // ── Email validation ───────────────────────────────────────────────
    const emailToCheck = isPatientRole ? req.user.email : email;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToCheck)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    // Email in body must match logged-in patient's email
    if (isPatientRole && email && email !== req.user.email) {
      return res.status(400).json({
        success: false,
        message: "Email in request body must match your registered email"
      });
    }

    // ── Phone validation ───────────────────────────────────────────────
    const phoneRegex = /^\+?[0-9]{7,15}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number. Must be 7-15 digits (optionally starting with +)"
      });
    }

    // ── Gender validation ──────────────────────────────────────────────
    const allowedGenders = ['male', 'female', 'other'];
    if (!allowedGenders.includes(gender.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Gender must be one of: 'male', 'female', 'other'"
      });
    }

    // ── Password validation (admin path only) ──────────────────────────
    if (!isPatientRole && req.body.password && req.body.password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    // ── doctorId must be a valid positive integer if provided ─────────
    // if (doctorId !== undefined && doctorId !== null && doctorId !== '') {
    //   if (!Number.isInteger(Number(doctorId)) || Number(doctorId) <= 0) {
    //     return res.status(400).json({
    //       success: false,
    //       message: "doctorId must be a valid positive integer"
    //     });
    //   }
    // }

    // ── Name length validation ─────────────────────────────────────────
    if (firstName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "firstName must be at least 2 characters"
      });
    }
    if (lastName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "lastName must be at least 2 characters"
      });
    }

    const patient = await createPatientService(req.body, req.user);

    return res.status(201).json({
      success: true,
      message: "Patient profile created successfully",
      data: { patient }
    });
  } catch (error) {
    console.error("Error in createPatient controller:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

export default createPatient;