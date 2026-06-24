import createDepartmentService from './department.service.js';

const createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name',
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'name must be at least 2 characters',
      });
    }

    const department = await createDepartmentService({ name: name.trim(), description });

    return res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: { department },
    });
  } catch (error) {
    console.error('Error in createDepartment controller:', error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

export default createDepartment;