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

// @desc    Generate PDF report
// @route   GET /api/v1/maintenance/:id/report
// @access  Protected
export const generateMaintenanceReport = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const log = await MaintenanceLog.findById(req.params.id)
    .populate('equipmentId')
    .populate('hospitalId')
    .populate('engineerId', 'name email');

  if (!log) {
    return next(new AppError('Maintenance log not found', 404));
  }

  // Authorize
  if (req.user?.role !== 'super_admin' && log.hospitalId.toString() !== req.user?.hospitalId?.toString()) {
    return next(new AppError('Not authorized', 403));
  }

  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  const hospital = log.hospitalId as any;
  const equipment = log.equipmentId as any;
  const engineer = log.engineerId as any;

  const html = `
    <html>
      <head>
        <style>
          body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #0A1628; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #0A1628; }
          .hospital-info { margin-top: 10px; font-size: 14px; color: #666; }
          .title { font-size: 20px; font-weight: bold; margin-top: 20px; text-transform: uppercase; }
          .section { margin-top: 30px; }
          .section-title { font-size: 16px; font-weight: bold; background: #f4f4f4; padding: 8px; border-left: 4px solid #0EA5E9; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px; }
          .item { margin-bottom: 10px; }
          .label { font-weight: bold; font-size: 12px; color: #777; display: block; }
          .value { font-size: 14px; }
          .footer { margin-top: 50px; border-top: 1px solid #eee; padding-top: 20px; font-size: 10px; color: #999; text-align: center; }
          .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
          .status-completed { background: #dcfce7; color: #166534; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">⚕ CENTRALIZED MEDICAL SOLUTIONS</div>
          <div class="hospital-info">
            ${hospital.name} | ${hospital.code}<br>
            ${hospital.address.city || ''}, ${hospital.address.state || ''}
          </div>
          <div class="title">Maintenance Service Report</div>
        </div>

        <div class="section">
          <div class="section-title">Equipment Information</div>
          <div class="grid">
            <div class="item">
              <span class="label">Name</span>
              <span class="value">${equipment.name}</span>
            </div>
            <div class="item">
              <span class="label">Model / Code</span>
              <span class="value">${equipment.model || 'N/A'} / ${equipment.equipmentCode}</span>
            </div>
            <div class="item">
              <span class="label">Serial Number</span>
              <span class="value">${equipment.serialNumber || 'N/A'}</span>
            </div>
            <div class="item">
              <span class="label">Location</span>
              <span class="value">${equipment.location || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Service Details</div>
          <div class="grid">
            <div class="item">
              <span class="label">Log ID</span>
              <span class="value">${log._id}</span>
            </div>
            <div class="item">
              <span class="label">Service Type</span>
              <span class="value">${log.type.toUpperCase()}</span>
            </div>
            <div class="item">
              <span class="label">Completion Date</span>
              <span class="value">${log.completedAt ? new Date(log.completedAt).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div class="item">
              <span class="label">Status</span>
              <span class="status-badge status-completed">COMPLETED</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Findings & Actions</div>
          <div style="margin-top: 15px;">
            <span class="label">Maintenance Summary</span>
            <div class="value" style="margin-top: 5px; line-height: 1.6;">${log.workDone || 'No summary provided.'}</div>
          </div>
          <div style="margin-top: 20px;">
            <span class="label">Parts Used / Costing</span>
            <div class="value">Cost: INR ${log.totalCost || 0}</div>
          </div>
        </div>

        <div class="section" style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
          <div class="grid">
            <div class="item">
              <span class="label">Service Engineer</span>
              <span class="value">${engineer.name}</span>
            </div>
            <div class="item" style="text-align: right;">
              <span class="label">Digitally Verified By</span>
              <span class="value">CMS System Integration</span>
            </div>
          </div>
        </div>

        <div class="footer">
          This is a system-generated document. Generated on ${new Date().toLocaleString()}<br>
          © 2025 Centralized Medical Solutions. All rights reserved.
        </div>
      </body>
    </html>
  `;

  await page.setContent(html);
  const pdf = await page.pdf({ format: 'A4', printBackground: true });

  await browser.close();

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Length': pdf.length,
    'Content-Disposition': `attachment; filename="report-${log._id}.pdf"`,
  });

  res.send(pdf);
});
