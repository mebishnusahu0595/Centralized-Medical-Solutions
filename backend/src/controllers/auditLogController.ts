import { Request, Response, NextFunction } from 'express';
import AuditLog from '../models/AuditLog';
import { asyncHandler } from '../utils/asyncWrapper';

// @desc    Get paginated audit logs
// @route   GET /api/v1/audit-logs
// @access  Protected (Super Admin or Hospital Admin)
export const getAuditLogs = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 20;
  const skip = (page - 1) * limit;

  let query: any = {};

  if (req.user?.role !== 'super_admin') {
    query.hospitalId = req.user?.hospitalId;
  } else if (req.query.hospitalId) {
    query.hospitalId = req.query.hospitalId;
  }

  const logs = await AuditLog.find(query)
    .populate('userId', 'name email role')
    .sort('-timestamp')
    .skip(skip)
    .limit(limit);

  const total = await AuditLog.countDocuments(query);

  res.status(200).json({
    success: true,
    count: logs.length,
    total,
    page,
    data: logs,
  });
});
