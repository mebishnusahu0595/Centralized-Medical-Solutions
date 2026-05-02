import { Request, Response, NextFunction } from 'express';
import MaintenanceLog from '../models/MaintenanceLog';
import Equipment from '../models/Equipment';
import { asyncHandler } from '../utils/asyncWrapper';
import { AppError } from '../utils/AppError';
import { calculateNextMaintenanceDate } from '../utils/dateUtils';
// puppeteer import for pdf generation will be needed later

// @desc    Get all maintenance logs
// @route   GET /api/v1/maintenance
// @access  Protected
export const getMaintenanceLogs = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let query: any = {};

  if (req.user?.role !== 'super_admin') {
    query.hospitalId = req.user?.hospitalId;
  } else if (req.query.hospitalId) {
    query.hospitalId = req.query.hospitalId;
  }

  if (req.query.status) query.status = req.query.status;
  if (req.query.type) query.type = req.query.type;
  if (req.query.engineerId) query.engineerId = req.query.engineerId;
  if (req.query.equipmentId) query.equipmentId = req.query.equipmentId;

  const logs = await MaintenanceLog.find(query)
    .populate('equipmentId', 'name equipmentCode category status')
    .populate('engineerId', 'name email')
    .sort('-scheduledDate');

  res.status(200).json({
    success: true,
    count: logs.length,
    data: logs,
  });
});

// @desc    Create maintenance log
// @route   POST /api/v1/maintenance
// @access  Super Admin / Hospital Admin
export const createMaintenanceLog = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let hospitalId = req.body.hospitalId;
  if (req.user?.role !== 'super_admin') {
    hospitalId = req.user?.hospitalId;
  }

  if (!hospitalId) {
    return next(new AppError('Hospital ID is required', 400));
  }

  const equipment = await Equipment.findById(req.body.equipmentId);
  if (!equipment) {
    return next(new AppError('Equipment not found', 404));
  }

  if (equipment.hospitalId.toString() !== hospitalId.toString()) {
     return next(new AppError('Equipment does not belong to this hospital', 400));
  }

  const log = await MaintenanceLog.create({
    ...req.body,
    hospitalId,
  });

  // Change equipment status
  equipment.status = 'under_maintenance';
  await equipment.save();

  res.status(201).json({
    success: true,
    data: log,
  });
});

// @desc    Get single log
// @route   GET /api/v1/maintenance/:id
// @access  Protected
export const getMaintenanceLog = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const log = await MaintenanceLog.findById(req.params.id)
    .populate('equipmentId')
    .populate('engineerId', 'name email phone');

  if (!log) {
    return next(new AppError('Maintenance log not found', 404));
  }

  if (req.user?.role !== 'super_admin' && log.hospitalId.toString() !== req.user?.hospitalId?.toString()) {
    return next(new AppError('Not authorized', 403));
  }

  res.status(200).json({
    success: true,
    data: log,
  });
});

// @desc    Update log
// @route   PATCH /api/v1/maintenance/:id
// @access  Protected
export const updateMaintenanceLog = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const log = await MaintenanceLog.findById(req.params.id);

  if (!log) {
    return next(new AppError('Maintenance log not found', 404));
  }

  if (req.user?.role !== 'super_admin' && log.hospitalId.toString() !== req.user?.hospitalId?.toString()) {
    return next(new AppError('Not authorized', 403));
  }

  if (req.user?.role === 'engineer' && log.engineerId.toString() !== req.user?._id?.toString()) {
    return next(new AppError('Not authorized. You are not assigned to this maintenance task', 403));
  }

  const updatedLog = await MaintenanceLog.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: updatedLog,
  });
});

// @desc    Mark complete
// @route   PATCH /api/v1/maintenance/:id/complete
// @access  Protected
export const completeMaintenanceLog = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const log = await MaintenanceLog.findById(req.params.id);

  if (!log) {
    return next(new AppError('Maintenance log not found', 404));
  }

  if (req.user?.role !== 'super_admin' && log.hospitalId.toString() !== req.user?.hospitalId?.toString()) {
    return next(new AppError('Not authorized', 403));
  }

  if (req.user?.role === 'engineer' && log.engineerId.toString() !== req.user?._id?.toString()) {
    return next(new AppError('Not authorized', 403));
  }

  // Update log
  log.status = 'completed';
  log.completedAt = new Date();
  Object.assign(log, req.body);
  
  // Calculate next due date
  const equipment = await Equipment.findById(log.equipmentId);
  if (equipment) {
    const nextDate = calculateNextMaintenanceDate(new Date(), equipment.maintenanceFrequency);
    log.nextDueDate = nextDate;
    
    // Update equipment
    equipment.lastMaintenanceDate = new Date();
    equipment.nextMaintenanceDate = nextDate;
    equipment.status = 'active'; // Reset back to active
    await equipment.save();
  }

  await log.save();

  res.status(200).json({
    success: true,
    data: log,
  });
});

// @desc    Get upcoming maintenance
// @route   GET /api/v1/maintenance/upcoming
// @access  Protected
export const getUpcomingMaintenance = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let query: any = {
    status: 'scheduled',
    scheduledDate: {
      $gte: new Date(),
      $lte: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
    }
  };

  if (req.user?.role !== 'super_admin') {
    query.hospitalId = req.user?.hospitalId;
  }
  
  if (req.user?.role === 'engineer') {
      query.engineerId = req.user?._id;
  }

  const upcomingLogs = await MaintenanceLog.find(query)
    .populate('equipmentId', 'name equipmentCode category location')
    .sort('scheduledDate');

  res.status(200).json({
    success: true,
    count: upcomingLogs.length,
    data: upcomingLogs,
  });
});

// @desc    Get calendar view
// @route   GET /api/v1/maintenance/calendar
// @access  Protected
export const getMaintenanceCalendar = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // This typically just returns logs with dates to be parsed by frontend calendar components
    let query: any = {};
  
    if (req.user?.role !== 'super_admin') {
      query.hospitalId = req.user?.hospitalId;
    }
    
    const logs = await MaintenanceLog.find(query)
      .select('scheduledDate status type')
      .populate('equipmentId', 'name');
  
    res.status(200).json({
      success: true,
      data: logs,
    });
});

// TODO: PDF generation for report 
