import * as doctorService from "./doctor.service.js";

// POST /api/doctors
const createDoctor = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      specialization,
      qualification,
      licenseNumber,
      gender
    } = req.body;

    const isDoctorRole = req.user.roles === 'doctor';
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'specialization', 'qualification', 'licenseNumber', 'gender'];
    if (!isDoctorRole) {
      requiredFields.push('password');
    }

    // Bareminimum validations
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields. Required fields: ${requiredFields.join(', ')}`
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    // Email matching check for doctor role
    if (isDoctorRole && email !== req.user.email) {
      return res.status(400).json({
        success: false,
        message: "Email in request body must match your registered email"
      });
    }

    // Password length validation (only for admin creating a new user)
    if (!isDoctorRole && password && password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    // Gender validation
    const allowedGenders = ['male', 'female', 'other'];
    if (!allowedGenders.includes(gender.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Gender must be either 'male', 'female', or 'other'"
      });
    }

    const doctor = await doctorService.createDoctor(req.body, req.user);
    res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      data: { doctor }
    });
  } catch (error) {
    console.error("Error in createDoctor controller:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};




// GET /api/doctors
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await doctorService.getAllDoctors();
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/doctors/:id
const getDoctorById = async (req, res) => {
  try {
    const doctor = await doctorService.getDoctorById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/doctors/:id
const updateDoctor = async (req, res) => {
  try {
    const doctor = await doctorService.updateDoctor(req.params.id, req.body);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/doctors/:id
const deleteDoctor = async (req, res) => {
  try {
    const doctor = await doctorService.deleteDoctor(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
    createDoctor,
    getAllDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor
}