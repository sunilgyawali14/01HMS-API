import * as adminService from './admin.service.js';

export const getOverview = async (req, res) => {
  try {
    const stats = await adminService.getOverviewStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error("Admin Overview Error:", error);
    res.status(500).json({ success: false, message: 'Failed to fetch admin overview' });
  }
};

export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const validRoles = ['doctor', 'patient', 'receptionist'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role parameter' });
    }

    const data = await adminService.getUsersByRole(role, page, limit);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Admin Get Users Error:", error);
    res.status(500).json({ success: false, message: `Failed to fetch ${req.params.role}s` });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await adminService.toggleUserStatus(id);
    res.status(200).json({ 
      success: true, 
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { id: user.id, isActive: user.isActive }
    });
  } catch (error) {
    console.error("Admin Toggle Status Error:", error);
    res.status(500).json({ success: false, message: error.message || 'Failed to toggle user status' });
  }
};
