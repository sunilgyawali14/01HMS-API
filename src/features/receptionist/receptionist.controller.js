import createReceptionistService from './receptionist.service.js';

const createReceptionist = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      gender,
    } = req.body;

    const isReceptionistRole = req.user.roles === 'receptionist';

    const requiredFields = ['firstName', 'lastName', 'phone', 'gender'];
    if (!isReceptionistRole) {
      requiredFields.push('email', 'password');
    }

    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    const emailToCheck = isReceptionistRole ? req.user.email : email;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToCheck)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    if (isReceptionistRole && email && email !== req.user.email) {
      return res.status(400).json({
        success: false,
        message: 'Email in request body must match your registered email',
      });
    }

    const phoneRegex = /^\+?[0-9]{7,15}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number. Must be 7-15 digits (optionally starting with +)',
      });
    }

    const allowedGenders = ['male', 'female', 'other'];
    if (!allowedGenders.includes(gender.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Gender must be one of: 'male', 'female', 'other'",
      });
    }

    if (!isReceptionistRole && req.body.password && req.body.password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    if (firstName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'firstName must be at least 2 characters',
      });
    }

    if (lastName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'lastName must be at least 2 characters',
      });
    }

    const receptionist = await createReceptionistService(req.body, req.user);

    return res.status(201).json({
      success: true,
      message: 'Receptionist profile created successfully',
      data: { receptionist },
    });
  } catch (error) {
    console.error('Error in createReceptionist controller:', error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

export default createReceptionist;