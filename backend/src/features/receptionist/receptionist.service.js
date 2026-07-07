import Receptionist from './receptionist.model.js';
import User from '../user/user.model.js';
import sequelize from '../../config/connection.js';
import bcrypt from 'bcrypt';

const createReceptionistService = async (data, currentUser) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    gender,
    address,
    password,
  } = data;

  const isReceptionistRole = currentUser.roles === 'receptionist';

  const allowedGenders = ['male', 'female', 'other'];
  if (!allowedGenders.includes(gender.toLowerCase())) {
    throw { status: 400, message: `Gender must be one of: ${allowedGenders.join(', ')}` };
  }

  if (isReceptionistRole) {
    const existingProfile = await Receptionist.findOne({ where: { userId: currentUser.id } });
    if (existingProfile) {
      throw { status: 400, message: 'Receptionist profile already exists for this user' };
    }

    const existingPhone = await Receptionist.findOne({ where: { phone } });
    if (existingPhone) {
      throw { status: 400, message: 'Phone number is already in use' };
    }

    const receptionist = await Receptionist.create({
      userId: currentUser.id,
      firstName,
      lastName,
      email: currentUser.email,
      phone,
      gender,
      address: address || null,
      isActive: true,
    });

    return receptionist.toJSON();
  }

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw { status: 400, message: 'Email is already registered' };
  }

  const existingReceptionist = await Receptionist.findOne({ where: { email } });
  if (existingReceptionist) {
    throw { status: 400, message: 'A receptionist with this email already exists' };
  }

  const existingPhone = await Receptionist.findOne({ where: { phone } });
  if (existingPhone) {
    throw { status: 400, message: 'Phone number is already in use' };
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const transaction = await sequelize.transaction();
  try {
    const user = await User.create({
      name: `${firstName} ${lastName}`,
      email,
      password: hashPassword,
      roles: 'receptionist',
    }, { transaction });

    const receptionist = await Receptionist.create({
      userId: user.id,
      firstName,
      lastName,
      email,
      phone,
      gender,
      address: address || null,
      isActive: true,
    }, { transaction });

    await transaction.commit();
    return receptionist.toJSON();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export default createReceptionistService;