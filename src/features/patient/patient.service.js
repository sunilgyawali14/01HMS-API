import Patient from './patient.model.js';
import User from '../user/user.model.js';
import sequelize from '../../config/connection.js';
import bcrypt from 'bcrypt';

// Create patient
const createPatientService = async (data, currentUser) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    dateOfBirth,
    gender,
    // doctorId = null,   // optional – assigned later via appointment
    bloodGroup,
    address,
    emergencyContactName,
    emergencyContactPhone,
    medicalHistory,
    password
  } = data;

  const isPatientRole = currentUser.roles === 'patient';

  // Validate doctorId only if provided
//   if (doctorId) {
//     const doctor = await Doctor.findByPk(doctorId);
//     if (!doctor) {
//       throw { status: 404, message: `Doctor with id ${doctorId} does not exist` };
//     }
//   }

  // Validate bloodGroup if provided
  const allowedBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  if (bloodGroup && !allowedBloodGroups.includes(bloodGroup)) {
    throw { status: 400, message: `Invalid blood group. Allowed values: ${allowedBloodGroups.join(', ')}` };
  }

  // Validate dateOfBirth - should be in the past
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) {
    throw { status: 400, message: "Invalid dateOfBirth format. Use YYYY-MM-DD" };
  }
  if (dob >= new Date()) {
    throw { status: 400, message: "Date of birth must be in the past" };
  }

  if (isPatientRole) {
    // Patient is creating their own profile
    const existingProfile = await Patient.findOne({ where: { userId: currentUser.id } });
    if (existingProfile) {
      throw { status: 400, message: "Patient profile already exists for this user" };
    }

    const existingPhone = await Patient.findOne({ where: { phone } });
    if (existingPhone) {
      throw { status: 400, message: "Phone number is already in use" };
    }

    const patient = await Patient.create({
      userId: currentUser.id,
      firstName,
      lastName,
      email: currentUser.email,
      phone,
      dateOfBirth,
      gender: gender.toLowerCase(),
      bloodGroup: bloodGroup || null,
      address: address || null,
      emergencyContactName: emergencyContactName || null,
      emergencyContactPhone: emergencyContactPhone || null,
      medicalHistory: medicalHistory || null,
      isActive: true
    });

    const patientJson = patient.toJSON();
    return patientJson;
  }

  // Admin is creating a patient from scratch - also creates User account
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw { status: 400, message: "Email is already registered" };
  }

  const existingPatient = await Patient.findOne({ where: { email } });
  if (existingPatient) {
    throw { status: 400, message: "A patient with this email already exists" };
  }

  const existingPhone = await Patient.findOne({ where: { phone } });
  if (existingPhone) {
    throw { status: 400, message: "Phone number is already in use" };
  }

  const genSalt = 10;
  const hashPassword = await bcrypt.hash(password, genSalt);

  const transaction = await sequelize.transaction();
  try {
    const user = await User.create({
      name: `${firstName} ${lastName}`,
      email,
      password: hashPassword,
      roles: 'patient'
    }, { transaction });

    const patient = await Patient.create({
      userId: user.id,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender: gender.toLowerCase(),
      bloodGroup: bloodGroup || null,
      address: address || null,
      emergencyContactName: emergencyContactName || null,
      emergencyContactPhone: emergencyContactPhone || null,
      medicalHistory: medicalHistory || null,
      isActive: true
    }, { transaction });

    await transaction.commit();
    return patient.toJSON();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export default createPatientService;