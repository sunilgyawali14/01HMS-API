import Doctor from "./doctor.models.js";
import User from "../user/user.model.js";
import sequelize from "../../config/connection.js";
import bcrypt from "bcrypt";

// Create doctor
const createDoctor = async (data, currentUser) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    specialization,
    qualification,
    experienceYears,
    licenseNumber,
    gender,
    dateOfBirth,
    address,
    profileImage,
    availableDays,
    consultationFee,
    status
  } = data;

  const isDoctorRole = currentUser.roles === 'doctor';

  if (isDoctorRole) {
    // 1. Doctor role is creating their own profile
    const existingProfile = await Doctor.findOne({ where: { userId: currentUser.id } });
    if (existingProfile) {
      throw { status: 400, message: "Doctor profile already exists for this user" };
    }

    const existingPhone = await Doctor.findOne({ where: { phone } });
    if (existingPhone) {
      throw { status: 400, message: "Phone number is already in use" };
    }

    const existingLicense = await Doctor.findOne({ where: { licenseNumber } });
    if (existingLicense) {
      throw { status: 400, message: "License number is already in use" };
    }

    const doctor = await Doctor.create({
      firstName,
      lastName,
      email: currentUser.email,
      phone,
      password: currentUser.password, // use already hashed user password
      specialization,
      qualification,
      experienceYears: experienceYears || 0,
      licenseNumber,
      gender,
      dateOfBirth: dateOfBirth || null,
      address: address || null,
      profileImage: profileImage || null,
      availableDays: availableDays || [],
      consultationFee: consultationFee || 0.00,
      status: status || 'active',
      userId: currentUser.id
    });

    const doctorJson = doctor.toJSON();
    delete doctorJson.password;
    return doctorJson;
  }

  // 2. Admin role is creating a new doctor from scratch
  // Check if email already exists in User or Doctor
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw { status: 400, message: "Email is already registered" };
  }

  const existingDoctor = await Doctor.findOne({ where: { email } });
  if (existingDoctor) {
    throw { status: 400, message: "Email is already registered for a doctor" };
  }

  // Check if phone already exists
  const existingPhone = await Doctor.findOne({ where: { phone } });
  if (existingPhone) {
    throw { status: 400, message: "Phone number is already in use" };
  }

  // Check if licenseNumber already exists
  const existingLicense = await Doctor.findOne({ where: { licenseNumber } });
  if (existingLicense) {
    throw { status: 400, message: "License number is already in use" };
  }

  // Hash the password
  const genSalt = 10;
  const hashPassword = await bcrypt.hash(password, genSalt);

  // Create both User and Doctor in a transaction
  const transaction = await sequelize.transaction();
  try {
    const user = await User.create({
      name: `${firstName} ${lastName}`,
      email,
      password: hashPassword,
      roles: 'doctor'
    }, { transaction });

    const doctor = await Doctor.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashPassword,
      specialization,
      qualification,
      experienceYears: experienceYears || 0,
      licenseNumber,
      gender,
      dateOfBirth: dateOfBirth || null,
      address: address || null,
      profileImage: profileImage || null,
      availableDays: availableDays || [],
      consultationFee: consultationFee || 0.00,
      status: status || 'active',
      userId: user.id
    }, { transaction });

    await transaction.commit();

    const doctorJson = doctor.toJSON();
    delete doctorJson.password;
    return doctorJson;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// Get all doctors
const getAllDoctors = async () => {
  const doctors = await Doctor.findAll();
  return doctors;
};

// Get single doctor by id
const getDoctorById = async (id) => {
  const doctor = await Doctor.findByPk(id);
  return doctor;
};

// Update doctor
const updateDoctor = async (id, data) => {
  const doctor = await Doctor.findByPk(id);
  if (!doctor) return null;

  await doctor.update(data);
  return doctor;
};

// Delete doctor
const deleteDoctor = async (id) => {
  const doctor = await Doctor.findByPk(id);
  if (!doctor) return null;

  await doctor.destroy();
  return doctor;
};

export {
    createDoctor,
    updateDoctor,
    getDoctorById,
    getAllDoctors,
    deleteDoctor
}