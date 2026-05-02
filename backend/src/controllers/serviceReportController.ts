import { Request, Response, NextFunction } from 'express';
import ServiceReport from '../models/ServiceReport';
import Equipment from '../models/Equipment';
import { asyncHandler } from '../utils/asyncWrapper';
import { AppError } from '../utils/AppError';

const getSLAHours = (priority: string): number => {
  switch (priority) {
    case 'critical': return 4;
    case 'high': return 24;
    case 'medium': return 72;
    case 'low': return 168; // 7 days
    default: return 72;
  }
};

// @desc    Get all service reports
// @route   GET /api/v1/service-reports
// @access  Protected
export const getServiceReports = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let query: any = {};

  if (req.user?.role !== 'super_admin') {
    query.hospitalId = req.user?.hospitalId;
  }

  if (req.query.status) query.status = req.query.status;
  if (req.query.priority) query.priority = req.query.priority;
  if (req.query.equipmentId) query.equipmentId = req.query.equipmentId;
  if (req.query.assignedTo) query.assignedTo = req.query.assignedTo;

  const reports = await ServiceReport.find(query)
    .populate('equipmentId', 'name equipmentCode')
    .populate('reportedBy', 'name')
    .populate('assignedTo', 'name')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: reports.length,
    data: reports,
  });
});

// @desc    Raise new issue/complaint
// @route   POST /api/v1/service-reports
// @access  Protected
export const createServiceReport = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { equipmentId, priority } = req.body;
  const hospitalId = req.user?.hospitalId;

  if (!hospitalId && req.user?.role !== 'super_admin') {
     return next(new AppError('Hospital ID required', 400));
  }

  const equipment = await Equipment.findById(equipmentId);
  if (!equipment) {
    return next(new AppError('Equipment not found', 404));
  }

  const targetHours = getSLAHours(priority);

  const report = await ServiceReport.create({
    ...req.body,
    hospitalId: hospitalId || equipment.hospitalId,
    reportedBy: req.user?._id,
    sla: {
      targetHours,
      breached: false
    }
  });

  // If priority is critical, update equipment status
  if (priority === 'critical') {
    equipment.status = 'out_of_service';
    await equipment.save();
  }

  res.status(201).json({
    success: true,
    data: report,
  });
});

// @desc    Get single report
// @route   GET /api/v1/service-reports/:id
// @access  Protected
export const getServiceReport = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const report = await ServiceReport.findById(req.params.id)
    .populate('equipmentId')
    .populate('reportedBy', 'name email')
    .populate('assignedTo', 'name email');

  if (!report) {
    return next(new AppError('Service report not found', 404));
  }

  if (req.user?.role !== 'super_admin' && report.hospitalId.toString() !== req.user?.hospitalId?.toString()) {
    return next(new AppError('Not authorized', 403));
  }

  res.status(200).json({
    success: true,
    data: report,
  });
});

// @desc    Assign to engineer
// @route   PATCH /api/v1/service-reports/:id/assign
// @access  Super Admin / Hospital Admin
export const assignServiceReport = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { engineerId } = req.body;
  const report = await ServiceReport.findById(req.params.id);

  if (!report) {
    return next(new AppError('Service report not found', 404));
  }

  report.assignedTo = engineerId;
  report.status = 'assigned';
  await report.save();

  res.status(200).json({
    success: true,
    data: report,
  });
});

// @desc    Resolve report
// @route   PATCH /api/v1/service-reports/:id/resolve
// @access  Super Admin / Hospital Admin / Engineer
export const resolveServiceReport = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { resolution } = req.body;
  const report = await ServiceReport.findById(req.params.id);

  if (!report) {
    return next(new AppError('Service report not found', 404));
  }

  report.resolution = resolution;
  report.status = 'resolved';
  report.resolvedAt = new Date();
  await report.save();

  // Optionally check if equipment should go back to active
  const equipment = await Equipment.findById(report.equipmentId);
  if (equipment && equipment.status === 'out_of_service') {
    equipment.status = 'active';
    await equipment.save();
  }

  res.status(200).json({
    success: true,
    data: report,
  });
});

// @desc    Update report
// @route   PATCH /api/v1/service-reports/:id
// @access  Protected
export const updateServiceReport = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const report = await ServiceReport.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!report) {
    return next(new AppError('Service report not found', 404));
  }

  res.status(200).json({
    success: true,
    data: report,
  });
});
