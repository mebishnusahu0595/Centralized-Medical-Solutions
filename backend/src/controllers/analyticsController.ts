import { Request, Response, NextFunction } from 'express';
import Hospital from '../models/Hospital';
import Equipment from '../models/Equipment';
import MaintenanceLog from '../models/MaintenanceLog';
import ServiceReport from '../models/ServiceReport';
import { asyncHandler } from '../utils/asyncWrapper';

// @desc    Dashboard KPIs
// @route   GET /api/v1/analytics/dashboard
// @access  Protected
export const getDashboardStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const hospitalId = req.user?.hospitalId;
  const role = req.user?.role;

  if (role === 'super_admin') {
    const totalHospitals = await Hospital.countDocuments();
    const activeHospitals = await Hospital.countDocuments({ isActive: true });
    const totalEquipment = await Equipment.countDocuments();
    
    return res.status(200).json({
      success: true,
      data: {
        totalHospitals,
        activeHospitals,
        totalEquipment,
        // More super admin specific stats
      }
    });
  }

  // Hospital Admin / Engineer / Staff stats
  const totalEquipment = await Equipment.countDocuments({ hospitalId });
  const activeEquipment = await Equipment.countDocuments({ hospitalId, status: 'active' });
  const underMaintenance = await Equipment.countDocuments({ hospitalId, status: 'under_maintenance' });
  const outOfService = await Equipment.countDocuments({ hospitalId, status: 'out_of_service' });

  const openReports = await ServiceReport.countDocuments({ hospitalId, status: 'open' });
  const maintenanceDue = await MaintenanceLog.countDocuments({ 
    hospitalId, 
    status: 'scheduled',
    scheduledDate: { $lte: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000) }
  });

  res.status(200).json({
    success: true,
    data: {
      equipment: {
        total: totalEquipment,
        active: activeEquipment,
        underMaintenance,
        outOfService
      },
      openReports,
      maintenanceDue
    }
  });
});

// @desc    Equipment stats (by category, status)
// @route   GET /api/v1/analytics/equipment
// @access  Protected
export const getEquipmentStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const hospitalId = req.user?.hospitalId;
  const query: any = hospitalId ? { hospitalId } : {};

  const statsByCategory = await Equipment.aggregate([
    { $match: query },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);

  const statsByStatus = await Equipment.aggregate([
    { $match: query },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      byCategory: statsByCategory,
      byStatus: statsByStatus
    }
  });
});

// @desc    Maintenance stats
// @route   GET /api/v1/analytics/maintenance
// @access  Protected
export const getMaintenanceStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const hospitalId = req.user?.hospitalId;
  const query: any = hospitalId ? { hospitalId } : {};

  const totalLogs = await MaintenanceLog.countDocuments(query);
  const completedLogs = await MaintenanceLog.countDocuments({ ...query, status: 'completed' });

  res.status(200).json({
    success: true,
    data: {
      total: totalLogs,
      completed: completedLogs,
      completionRate: totalLogs > 0 ? (completedLogs / totalLogs) * 100 : 0
    }
  });
});

// @desc    (super_admin) All hospital stats
// @route   GET /api/v1/analytics/hospitals
// @access  Super Admin
export const getAllHospitalStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const hospitals = await Hospital.find().select('name code subscriptionPlan subscriptionStatus');
  
  const stats = await Promise.all(hospitals.map(async (h) => {
    const equipmentCount = await Equipment.countDocuments({ hospitalId: h._id });
    return {
      _id: h._id,
      name: h.name,
      code: h.code,
      subscriptionPlan: h.subscriptionPlan,
      subscriptionStatus: h.subscriptionStatus,
      equipmentCount
    };
  }));

  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Compliance status across hospital
// @route   GET /api/v1/analytics/compliance
// @access  Protected
export const getComplianceStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const hospitalId = req.user?.hospitalId;
    const query: any = hospitalId ? { hospitalId } : {};
    
    const overdueCompliance = await Equipment.countDocuments({
        ...query,
        complianceDueDate: { $lt: new Date() }
    });

    res.status(200).json({
        success: true,
        data: {
            overdueCompliance
        }
    });
});
