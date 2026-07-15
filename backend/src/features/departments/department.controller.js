import * as departmentService from './department.service.js';

export const createDepartment = async (req, res) => {
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

    const department = await departmentService.createDepartmentService({ name: name.trim(), description });

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

export const getDepartments = async (req, res) => {
  try {
    const departments = await departmentService.getDepartmentsService();
    return res.status(200).json({ success: true, data: departments });
  } catch (error) {
    console.error('Error in getDepartments controller:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const department = await departmentService.updateDepartmentService(id, { name: name?.trim(), description });
    return res.status(200).json({ success: true, message: 'Department updated successfully', data: department });
  } catch (error) {
    console.error('Error in updateDepartment controller:', error);
    return res.status(error.status || 500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await departmentService.deleteDepartmentService(id);
    return res.status(200).json({ 
      success: true, 
      message: `Department ${department.isActive ? 'activated' : 'deactivated'} successfully`, 
      data: department 
    });
  } catch (error) {
    console.error('Error in deleteDepartment controller:', error);
    return res.status(error.status || 500).json({ success: false, message: error.message || 'Internal server error' });
  }
};