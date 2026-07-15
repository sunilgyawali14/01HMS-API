import Department from './department.model.js';

import Doctor from '../doctor/doctor.models.js';

export const createDepartmentService = async ({ name, description }) => {
  const existing = await Department.findOne({ where: { name } });
  if (existing) {
    throw { status: 400, message: 'Department with this name already exists' };
  }

  const department = await Department.create({
    name,
    description: description || null,
    isActive: true,
  });

  return department.toJSON();
};

export const getDepartmentsService = async () => {
  // To get doctor count per department, we can count the doctors associated with it.
  const departments = await Department.findAll({
    include: [{
      model: Doctor,
      attributes: ['id']
    }]
  });

  return departments.map(d => {
    const data = d.toJSON();
    data.doctorCount = data.Doctors ? data.Doctors.length : 0;
    delete data.Doctors;
    return data;
  });
};

export const updateDepartmentService = async (id, { name, description }) => {
  const department = await Department.findByPk(id);
  if (!department) throw { status: 404, message: 'Department not found' };

  if (name && name !== department.name) {
    const existing = await Department.findOne({ where: { name } });
    if (existing) throw { status: 400, message: 'Department with this name already exists' };
    department.name = name;
  }

  if (description !== undefined) {
    department.description = description;
  }

  await department.save();
  return department.toJSON();
};

export const deleteDepartmentService = async (id) => {
  const department = await Department.findByPk(id);
  if (!department) throw { status: 404, message: 'Department not found' };

  department.isActive = !department.isActive; // Soft delete toggle
  await department.save();
  return department.toJSON();
};