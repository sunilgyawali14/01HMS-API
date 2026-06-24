import Department from './department.model.js';

const createDepartmentService = async ({ name, description }) => {
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

export default createDepartmentService;