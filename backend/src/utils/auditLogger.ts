import AuditLog from '../models/AuditLog';
import { Request } from 'express';

export const logAction = async (req: Request, action: string, resource: string, resourceId: string, details?: any) => {
  try {
    await AuditLog.create({
      hospitalId: (req as any).user?.hospitalId,
      userId: (req as any).user?._id,
      action,
      resource,
      resourceId,
      newData: details || {},
      ipAddress: req.ip || (req as any).connection?.remoteAddress,
      userAgent: req.headers['user-agent']
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};
