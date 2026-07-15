import { Op } from 'sequelize';
import User from '../user/user.model.js';
import Appointment from '../appointments/appointment.model.js';
import Doctor from '../doctor/doctor.models.js';
import Patient from '../patient/patient.model.js';
import Receptionist from '../receptionist/receptionist.model.js';
import Department from '../departments/department.model.js';

export const getOverviewStats = async () => {
  const [totalDoctors, totalPatients, totalReceptionists, totalDepartments] = await Promise.all([
    User.count({ where: { roles: 'doctor' } }),
    User.count({ where: { roles: 'patient' } }),
    User.count({ where: { roles: 'receptionist' } }),
    Department.count(),
  ]);

  // Appointments today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfToday = new Date(today);
  endOfToday.setHours(23, 59, 59, 999);

  const appointmentsToday = await Appointment.count({
    where: {
      appointmentDate: {
        [Op.between]: [today, endOfToday],
      },
    },
  });

  // Appointments this month
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

  const appointmentsThisMonth = await Appointment.findAll({
    attributes: ['status', [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']],
    where: {
      appointmentDate: {
        [Op.between]: [startOfMonth, endOfMonth],
      },
    },
    group: ['status'],
  });

  const monthBreakdown = {
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  };

  appointmentsThisMonth.forEach(app => {
    const status = app.getDataValue('status');
    const count = parseInt(app.getDataValue('count'), 10);
    if (monthBreakdown[status] !== undefined) {
      monthBreakdown[status] = count;
    }
  });

  return {
    totalDoctors,
    totalPatients,
    totalReceptionists,
    totalDepartments,
    appointmentsToday,
    appointmentsThisMonth: monthBreakdown,
  };
};

export const getUsersByRole = async (role, page, limit) => {
  const offset = (page - 1) * limit;

  let includeModel = null;
  if (role === 'doctor') includeModel = Doctor;
  if (role === 'patient') includeModel = Patient;
  if (role === 'receptionist') includeModel = Receptionist;

  const queryOptions = {
    where: { roles: role },
    attributes: ['id', 'name', 'email', 'roles', 'isActive', 'createdAt'],
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  };

  if (includeModel) {
    queryOptions.include = [{ model: includeModel, required: false }];
  }

  const { count, rows } = await User.findAndCountAll(queryOptions);

  return {
    total: count,
    pages: Math.ceil(count / limit),
    currentPage: page,
    users: rows,
  };
};

export const toggleUserStatus = async (id) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error('User not found');

  user.isActive = !user.isActive;
  await user.save();
  return user;
};
